export interface Covariate {
  id: string;
  name: string;
  value: number;
  betaMu: number;
  betaZeta: number;
}

export interface GEVParameters {
  mu0: number;
  zeta0: number;
  xi: number;
  covariates: Covariate[];
}

export type VaRLevel = 90 | 95 | 99;

export interface GEVParams {
  mu: number;
  sigma: number;
  xi: number;
}

export interface BlockMaximaPoint {
  time: number;
  value: number;
  block: number;
  isMaxima: boolean;
}

export interface BlockMaximaData {
  points: BlockMaximaPoint[];
  blockBoundaries: number[];
  blockMaxima: BlockMaximaPoint[];
}

export interface GEVDataPoint {
  x: number;
  pdf: number;
}

export interface RiskComparisonDataPoint {
  x: string;
  xNum: number;
  pdf: number;
  isCrashRisk: boolean;
  isCVaR: boolean;
  varLine: number | null;
}

export interface MRLDataPoint {
  threshold: number;
  meanExcess: number;
  lowerCI: number;
  upperCI: number;
}

export interface StabilityDataPoint {
  threshold: number;
  shape: number;
  scale: number;
  modifiedScale: number; // sigma* = sigma_u - xi * u
}

export interface POTDataPoint {
  time: number;
  value: number;
  isExceedance: boolean;
}

export type SiteType = 'urban' | 'suburban' | 'rural';

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  mu0: number; // Site-specific baseline location parameter
  zeta0: number; // Site-specific baseline log-scale parameter
  sampleSize: number; // Number of conflicts observed at this site
  // For random slopes:
  betaMuVariation?: number; // How much this site's betaMu differs from population mean
  betaZetaVariation?: number; // How much this site's betaZeta differs from population mean
}

export interface MultiSiteData {
  sites: Site[];
  conflictData: Array<{
    siteId: string;
    time: number;
    value: number;
  }>;
}

export type PoolingType = 'none' | 'partial';

export interface SiteEstimate {
  siteId: string;
  mu0: number;
  zeta0: number;
  sigma0: number; // exp(zeta0)
  mu0Lower?: number; // Credible interval bounds
  mu0Upper?: number;
  zeta0Lower?: number;
  zeta0Upper?: number;
  crashRisk: number;
}

export interface RandomInterceptModel {
  populationMu0: number; // Population mean of mu0
  populationZeta0: number; // Population mean of zeta0
  tauMu0: number; // SD of random intercepts for mu0
  tauZeta0: number; // SD of random intercepts for zeta0
  siteEstimates: SiteEstimate[];
}

export interface RandomSlopeModel {
  populationBetaMu: number; // Population mean of betaMu
  populationBetaZeta: number; // Population mean of betaZeta
  tauBetaMu: number; // SD of random slopes for betaMu
  tauBetaZeta: number; // SD of random slopes for betaZeta
  siteSlopes: Array<{
    siteId: string;
    betaMu: number;
    betaZeta: number;
  }>;
}
