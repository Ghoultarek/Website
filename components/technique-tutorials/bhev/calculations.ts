import { GEVParameters, GEVParams, MRLDataPoint, StabilityDataPoint, Site, MultiSiteData, SiteEstimate, RandomInterceptModel, RandomSlopeModel, PoolingType } from './types';

/**
 * GEV CDF: P(X <= x) for negated extremes (block maxima)
 */
export function gevCDF(x: number, mu: number, sigma: number, xi: number): number {
  const z = (x - mu) / sigma;
  
  if (Math.abs(xi) < 1e-10) {
    // Gumbel case (xi = 0)
    return Math.exp(-Math.exp(-z));
  } else {
    // General case (xi != 0)
    const arg = 1 + xi * z;
    if (arg <= 0) return 0; // Outside support
    return Math.exp(-Math.pow(arg, -1 / xi));
  }
}

/**
 * GEV Quantile (inverse CDF) for VaR calculation
 */
export function gevQuantile(p: number, mu: number, sigma: number, xi: number): number {
  if (Math.abs(xi) < 1e-10) {
    // Gumbel case (xi = 0)
    return mu - sigma * Math.log(-Math.log(p));
  } else {
    // General case (xi != 0)
    return mu + (sigma / xi) * (Math.pow(-Math.log(p), -xi) - 1);
  }
}

/**
 * GEV PDF (Probability Density Function)
 */
export function gevPDF(x: number, mu: number, sigma: number, xi: number): number {
  const z = (x - mu) / sigma;
  
  if (Math.abs(xi) < 1e-10) {
    // Gumbel case (xi = 0)
    return (1 / sigma) * Math.exp(-z - Math.exp(-z));
  } else {
    // General case (xi != 0)
    const arg = 1 + xi * z;
    if (arg <= 0) return 0; // Outside support
    return (1 / sigma) * Math.pow(arg, -1 / xi - 1) * Math.exp(-Math.pow(arg, -1 / xi));
  }
}

/**
 * Generate random GEV sample
 */
export function gevRandom(mu: number, sigma: number, xi: number): number {
  const u = Math.random();
  if (Math.abs(xi) < 1e-10) {
    // Gumbel case
    return mu - sigma * Math.log(-Math.log(u));
  } else {
    // General GEV
    return mu + (sigma / xi) * (Math.pow(-Math.log(u), -xi) - 1);
  }
}

/**
 * Generate conflict value (negated TTC) with distribution favoring values around -5
 * TTC ranges from 0 to 10 seconds, truncated at 5 seconds
 * Values around 5 seconds (negated = -5) are far more common than extreme values near 0
 */
export function generateConflictValue(): number {
  // Generate TTC from 0 to 10 seconds, but heavily favor values around 5 seconds
  // Then truncate at 5 seconds maximum
  
  let ttc: number;
  const r = Math.random();
  
  // 80% of conflicts are around 5 seconds (TTC = 4-5 seconds)
  // 20% are spread across 0-4 seconds, with less weight on extremes near 0
  if (r < 0.8) {
    // Cluster around 5 seconds with some variation
    // Use a triangular-like distribution peaking at 5
    const u = Math.random();
    ttc = 5 - 1.5 * Math.abs(2 * u - 1); // Peak at 5, spread to ~3.5-5
    ttc = Math.max(3.5, Math.min(5, ttc)); // Clamp to [3.5, 5]
  } else {
    // Remaining 20%: spread across 0-5 seconds, favoring values away from 0
    // Use power transformation to reduce frequency of extreme values (TTC near 0)
    const u = Math.random();
    // Power > 1 makes values closer to 5 more common than values near 0
    ttc = 5 * Math.pow(u, 0.3); // Strong bias away from 0
  }
  
  // Truncate at 5 seconds (no conflicts with TTC > 5 seconds)
  ttc = Math.min(ttc, 5);
  
  // Return negated value (-TTC): more negative = more severe
  // TTC = 5 → -5 (moderate, most common)
  // TTC = 0 → 0 (crash, very rare)
  return -ttc;
}

/**
 * Calculate GEV parameters from covariates
 * mu = mu0 + sum(betaMu * covariate)
 * sigma = exp(zeta0 + sum(betaZeta * covariate))
 * xi = fixed
 */
export function calculateGEVParams(
  parameters: GEVParameters,
  covariateValues: number[]
): GEVParams {
  // mu = mu0 + sum(betaMu * covar)
  let mu = parameters.mu0;
  parameters.covariates.forEach((cov, idx) => {
    mu += cov.betaMu * covariateValues[idx];
  });

  // sigma = exp(zeta0 + sum(betaZeta * covar))
  let zeta = parameters.zeta0;
  parameters.covariates.forEach((cov, idx) => {
    zeta += cov.betaZeta * covariateValues[idx];
  });
  const sigma = Math.exp(zeta);

  // xi is fixed
  const xi = parameters.xi;

  return { mu, sigma, xi };
}

/**
 * Calculate crash risk: P(X >= 0) = 1 - P(X < 0) = 1 - CDF(0)
 * If the distribution doesn't cross 0 (all values below 0), crash risk is 0
 */
export function calculateCrashRisk(mu: number, sigma: number, xi: number): number {
  // Check if distribution has an upper bound that's below 0
  // For xi < 0, the upper bound is mu - sigma/xi
  if (xi < 0) {
    const upperBound = mu - sigma / xi;
    if (upperBound < 0) {
      // Distribution is entirely below 0, no crash risk
      return 0;
    }
  }
  
  const cdfAtZero = gevCDF(0, mu, sigma, xi);
  // If CDF returns 0 (outside support), it means all values are below 0
  // In that case, crash risk should be 0, not 1
  if (cdfAtZero === 0 && xi < 0) {
    // Check if 0 is actually above the upper bound
    const upperBound = mu - sigma / xi;
    if (0 > upperBound) {
      return 0;
    }
  }
  
  return 1 - cdfAtZero;
}

/**
 * Calculate CVaR (Conditional Value at Risk / Expected Shortfall)
 * CVaR = E[X | X >= VaR] = (1 / (1 - p)) * integral from VaR to infinity of x * f(x) dx
 */
export function calculateCVaR(
  mu: number,
  sigma: number,
  xi: number,
  varLevel: number,
  varValue: number
): number {
  const p = varLevel / 100;
  
  // Numerical integration: integrate x * pdf(x) from VaR to a large value
  let integral = 0;
  const upperBound = xi < 0 ? mu - sigma / xi : varValue + 10 * sigma;
  const step = (upperBound - varValue) / 1000;
  
  for (let x = varValue; x < upperBound; x += step) {
    const pdf = gevPDF(x, mu, sigma, xi);
    integral += x * pdf * step;
  }
  
  return integral / (1 - p);
}

/**
 * Calculate Mean Excess (Mean Residual Life) for a range of thresholds
 */
export function calculateMeanExcess(
  data: number[],
  minThreshold: number,
  maxThreshold: number,
  numSteps: number = 50
): MRLDataPoint[] {
  const step = (maxThreshold - minThreshold) / numSteps;
  const results: MRLDataPoint[] = [];
  
  for (let i = 0; i <= numSteps; i++) {
    const u = minThreshold + i * step;
    const excesses = data.filter(x => x > u).map(x => x - u);
    
    if (excesses.length < 5) continue; // Need enough points for reliable mean
    
    const meanExcess = excesses.reduce((sum, val) => sum + val, 0) / excesses.length;
    const variance = excesses.reduce((sum, val) => sum + Math.pow(val - meanExcess, 2), 0) / (excesses.length - 1);
    const stdErr = Math.sqrt(variance / excesses.length);
    
    // 95% Confidence Interval (approx 1.96 * stdErr)
    results.push({
      threshold: u,
      meanExcess: meanExcess,
      lowerCI: meanExcess - 1.96 * stdErr,
      upperCI: meanExcess + 1.96 * stdErr
    });
  }
  
  return results;
}

/**
 * Estimate GPD parameters using Method of Moments
 * Mean = sigma / (1 - xi)
 * Variance = sigma^2 / ((1 - xi)^2 * (1 - 2*xi))
 * Only valid for xi < 0.5
 */
function estimateGPDParameters(excesses: number[]): { sigma: number, xi: number } {
  const n = excesses.length;
  if (n < 10) return { sigma: 0, xi: 0 };
  
  const mean = excesses.reduce((sum, x) => sum + x, 0) / n;
  const variance = excesses.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
  
  // From variance/mean^2 = 1 / (1 - 2*xi) - 1 ?? No
  // Let's use PWM (Probability Weighted Moments) for better stability
  // But simpler moments for demo:
  // sample mean x_bar = sigma / (1-xi)
  // sample var s2 = sigma^2 / ((1-xi)^2 * (1-2xi))
  // s2 / x_bar^2 = (1-xi) / (1-2xi)
  // Let R = s2 / x_bar^2
  // R(1-2xi) = 1-xi => R - 2Rxi = 1 - xi => R - 1 = 2Rxi - xi = xi(2R - 1)
  // xi = (R - 1) / (2R - 1)
  // Then sigma = x_bar * (1 - xi)
  
  const R = variance / (mean * mean);
  // If 2R - 1 is close to 0, fallback
  if (Math.abs(2 * R - 1) < 1e-6) return { sigma: mean, xi: 0 }; // Exponential case
  
  let xi = 0.5 * (R - 1) / (R - 0.5);
  // Constrain xi to reasonable bounds for traffic safety (-1 to 0.5)
  xi = Math.max(-1, Math.min(0.5, xi));
  
  const sigma = mean * (1 - xi);
  
  return { sigma, xi };
}

/**
 * Calculate Parameter Stability across thresholds
 * Plots sigma* = sigma_u - xi * u against u
 * If GPD is valid, sigma* and xi should be constant
 */
export function calculateParameterStability(
  data: number[],
  minThreshold: number,
  maxThreshold: number,
  numSteps: number = 30
): StabilityDataPoint[] {
  const step = (maxThreshold - minThreshold) / numSteps;
  const results: StabilityDataPoint[] = [];
  
  for (let i = 0; i <= numSteps; i++) {
    const u = minThreshold + i * step;
    const excesses = data.filter(x => x > u).map(x => x - u);
    
    if (excesses.length < 20) continue; // Need reliable estimation
    
    const params = estimateGPDParameters(excesses);
    
    results.push({
      threshold: u,
      shape: params.xi,
      scale: params.sigma,
      modifiedScale: params.sigma - params.xi * u // Should be constant
    });
  }
  
  return results;
}

/**
 * Generate synthetic multi-site conflict data
 * Creates sites with varying characteristics and generates conflict data for each
 */
export function generateMultiSiteData(
  numSites: number = 6,
  conflictDensity: number = 5,
  totalDuration: number = 2400,
  seed?: number
): MultiSiteData {
  const sites: Site[] = [];
  const conflictData: Array<{ siteId: string; time: number; value: number }> = [];
  
  // Define site characteristics
  const siteTypes: Array<'urban' | 'suburban' | 'rural'> = [];
  // Distribute site types: 2-3 urban, 2-3 suburban, 1-2 rural
  const urbanCount = Math.min(3, Math.max(2, Math.floor(numSites * 0.4)));
  const suburbanCount = Math.min(3, Math.max(2, Math.floor(numSites * 0.4)));
  const ruralCount = numSites - urbanCount - suburbanCount;
  
  for (let i = 0; i < urbanCount; i++) siteTypes.push('urban');
  for (let i = 0; i < suburbanCount; i++) siteTypes.push('suburban');
  for (let i = 0; i < ruralCount; i++) siteTypes.push('rural');
  
  // Shuffle site types
  for (let i = siteTypes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [siteTypes[i], siteTypes[j]] = [siteTypes[j], siteTypes[i]];
  }

  // Generate sites with hierarchical structure
  // Population-level parameters
  const populationMu0 = -3.3;
  const populationZeta0 = 0.2;
  const tauMu0 = 0.3; // Between-site SD for mu0
  const tauZeta0 = 0.15; // Between-site SD for zeta0
  
  for (let i = 0; i < numSites; i++) {
    const siteType = siteTypes[i];
    
    // Site-specific parameters drawn from hierarchical distribution
    const mu0 = populationMu0 + tauMu0 * (2 * Math.random() - 1) * 1.5;
    
    // Adjust based on site type
    let mu0Adjustment = 0;
    let sampleSizeMultiplier = 1;
    if (siteType === 'urban') {
      mu0Adjustment = 0.2; // Urban sites have higher baseline risk
      sampleSizeMultiplier = 1.5; // More data at urban sites
    } else if (siteType === 'suburban') {
      mu0Adjustment = 0;
      sampleSizeMultiplier = 1.0;
    } else {
      mu0Adjustment = -0.2; // Rural sites have lower baseline risk
      sampleSizeMultiplier = 0.7; // Less data at rural sites
    }
    
    const zeta0 = populationZeta0 + tauZeta0 * (2 * Math.random() - 1) * 1.5;
    
    // Sample size varies by site (important for showing pooling benefits)
    const baseSampleSize = Math.floor(totalDuration * conflictDensity / 60 * sampleSizeMultiplier);
    const sampleSize = baseSampleSize + Math.floor((Math.random() - 0.5) * baseSampleSize * 0.3);
    
    const site: Site = {
      id: `site-${i + 1}`,
      name: `${siteType.charAt(0).toUpperCase() + siteType.slice(1)} Site ${i + 1}`,
      type: siteType,
      mu0: mu0 + mu0Adjustment,
      zeta0,
      sampleSize,
      betaMuVariation: (Math.random() - 0.5) * 0.1,
      betaZetaVariation: (Math.random() - 0.5) * 0.05,
    };
    
    sites.push(site);
    
    // Generate conflict data for this site
    const sigma0 = Math.exp(zeta0);
    const xi = -0.4; // Fixed shape parameter
    const lambda = conflictDensity / 60 * sampleSizeMultiplier;
    
    let currentTime = 0;
    let conflictCount = 0;
    while (currentTime < totalDuration && conflictCount < site.sampleSize) {
      const interArrival = -Math.log(Math.random()) / lambda;
      currentTime += interArrival;
      
      if (currentTime < totalDuration) {
        const value = gevRandom(site.mu0, sigma0, xi);
        conflictData.push({
          siteId: site.id,
          time: currentTime,
          value,
        });
        conflictCount++;
      }
    }
  }
  
  return { sites, conflictData };
}

/**
 * Calculate site-specific GEV parameters from observed data (no pooling)
 */
export function calculateSiteGEV(
  siteId: string,
  data: Array<{ siteId: string; value: number }>,
  blockSize: number = 120
): GEVParams | null {
  const siteData = data.filter(d => d.siteId === siteId).map(d => d.value);
  if (siteData.length < 10) return null;
  
  // Extract block maxima
  const nBlocks = Math.ceil(2400 / blockSize);
  const blockMaxima: number[] = [];
  
  for (let block = 0; block < nBlocks; block++) {
    const blockStart = block * blockSize;
    const blockEnd = (block + 1) * blockSize;
    const blockPoints = siteData.filter((_, idx) => {
      const time = (idx / siteData.length) * 2400;
      return time >= blockStart && time < blockEnd;
    });
    
    if (blockPoints.length > 0) {
      blockMaxima.push(Math.max(...blockPoints));
    }
  }
  
  if (blockMaxima.length < 5) return null;
  
  // Simple method of moments estimation
  const mean = blockMaxima.reduce((sum, x) => sum + x, 0) / blockMaxima.length;
  const variance = blockMaxima.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (blockMaxima.length - 1);
  
  // Rough estimates (simplified for tutorial)
  const xi = -0.4;
  const sigma = Math.sqrt(variance * 0.8);
  const mu = mean - sigma * 0.5;
  
  return { mu, sigma, xi };
}

/**
 * Calculate no pooling estimates (each site estimated independently)
 */
export function calculateNoPooling(
  multiSiteData: MultiSiteData,
  blockSize: number = 120
): SiteEstimate[] {
  const estimates: SiteEstimate[] = [];
  
  for (const site of multiSiteData.sites) {
    const params = calculateSiteGEV(site.id, multiSiteData.conflictData, blockSize);
    if (params) {
      const crashRisk = calculateCrashRisk(params.mu, params.sigma, params.xi);
      estimates.push({
        siteId: site.id,
        mu0: params.mu,
        zeta0: Math.log(params.sigma),
        sigma0: params.sigma,
        crashRisk,
      });
    } else {
      estimates.push({
        siteId: site.id,
        mu0: site.mu0,
        zeta0: site.zeta0,
        sigma0: Math.exp(site.zeta0),
        crashRisk: calculateCrashRisk(site.mu0, Math.exp(site.zeta0), -0.4),
      });
    }
  }
  
  return estimates;
}

/**
 * Simulate partial pooling estimates (hierarchical model)
 */
export function calculatePartialPooling(
  multiSiteData: MultiSiteData,
  blockSize: number = 120
): { model: RandomInterceptModel; estimates: SiteEstimate[] } {
  const allSites = multiSiteData.sites;
  const populationMu0 = allSites.reduce((sum, s) => sum + s.mu0, 0) / allSites.length;
  const populationZeta0 = allSites.reduce((sum, s) => sum + s.zeta0, 0) / allSites.length;
  
  const tauMu0 = Math.sqrt(
    allSites.reduce((sum, s) => sum + Math.pow(s.mu0 - populationMu0, 2), 0) / allSites.length
  );
  const tauZeta0 = Math.sqrt(
    allSites.reduce((sum, s) => sum + Math.pow(s.zeta0 - populationZeta0, 2), 0) / allSites.length
  );
  
  const estimates: SiteEstimate[] = [];
  
  for (const site of multiSiteData.sites) {
    const noPoolParams = calculateSiteGEV(site.id, multiSiteData.conflictData, blockSize);
    const n = site.sampleSize;
    const weight = Math.min(0.95, n / (n + 50));
    
    let mu0, zeta0;
    if (noPoolParams) {
      mu0 = weight * noPoolParams.mu + (1 - weight) * populationMu0;
      zeta0 = weight * Math.log(noPoolParams.sigma) + (1 - weight) * populationZeta0;
    } else {
      mu0 = 0.3 * site.mu0 + 0.7 * populationMu0;
      zeta0 = 0.3 * site.zeta0 + 0.7 * populationZeta0;
    }
    
    const sigma0 = Math.exp(zeta0);
    const crashRisk = calculateCrashRisk(mu0, sigma0, -0.4);
    const seMu0 = tauMu0 / Math.sqrt(n / 50);
    const seZeta0 = tauZeta0 / Math.sqrt(n / 50);
    
    estimates.push({
      siteId: site.id,
      mu0,
      zeta0,
      sigma0,
      mu0Lower: mu0 - 1.96 * seMu0,
      mu0Upper: mu0 + 1.96 * seMu0,
      zeta0Lower: zeta0 - 1.96 * seZeta0,
      zeta0Upper: zeta0 + 1.96 * seZeta0,
      crashRisk,
    });
  }
  
  const model: RandomInterceptModel = {
    populationMu0,
    populationZeta0,
    tauMu0,
    tauZeta0,
    siteEstimates: estimates,
  };
  
  return { model, estimates };
}

/**
 * Calculate random intercept model
 */
export function calculateRandomInterceptModel(
  multiSiteData: MultiSiteData,
  populationMu0: number,
  populationZeta0: number,
  tauMu0: number,
  tauZeta0: number
): RandomInterceptModel {
  const estimates: SiteEstimate[] = [];
  
  // Calculate site-specific intercepts based on actual site data and population parameters
  for (const site of multiSiteData.sites) {
    // In a real Bayesian model, these would be posterior draws
    // Here we simulate by mixing site data with population mean based on sample size
    const n = site.sampleSize;
    const weight = Math.min(0.95, n / (n + 50)); // More weight to site data if more observations
    
    // Blend site-specific baseline with population mean
    const mu0 = weight * site.mu0 + (1 - weight) * populationMu0;
    const zeta0 = weight * site.zeta0 + (1 - weight) * populationZeta0;
    const sigma0 = Math.exp(zeta0);
    const crashRisk = calculateCrashRisk(mu0, sigma0, -0.4);
    
    // Approximate standard errors for credible intervals
    const seMu0 = tauMu0 / Math.sqrt(Math.max(n / 50, 1));
    const seZeta0 = tauZeta0 / Math.sqrt(Math.max(n / 50, 1));
    
    estimates.push({
      siteId: site.id,
      mu0,
      zeta0,
      sigma0,
      mu0Lower: mu0 - 1.96 * seMu0,
      mu0Upper: mu0 + 1.96 * seMu0,
      zeta0Lower: zeta0 - 1.96 * seZeta0,
      zeta0Upper: zeta0 + 1.96 * seZeta0,
      crashRisk,
    });
  }

  return {
    populationMu0,
    populationZeta0,
    tauMu0,
    tauZeta0,
    siteEstimates: estimates,
  };
}

/**
 * Calculate random slope model
 */
export function calculateRandomSlopeModel(
  multiSiteData: MultiSiteData,
  populationBetaMu: number,
  populationBetaZeta: number,
  tauBetaMu: number,
  tauBetaZeta: number
): RandomSlopeModel {
  const siteSlopes = multiSiteData.sites.map(site => ({
    siteId: site.id,
    betaMu: populationBetaMu + (site.betaMuVariation || 0) * tauBetaMu,
    betaZeta: populationBetaZeta + (site.betaZetaVariation || 0) * tauBetaZeta,
  }));
  
  return {
    populationBetaMu,
    populationBetaZeta,
    tauBetaMu,
    tauBetaZeta,
    siteSlopes,
  };
}
