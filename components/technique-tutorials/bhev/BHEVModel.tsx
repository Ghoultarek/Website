'use client';

import { useState, useMemo, useRef, useEffect, ReactNode } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, ReferenceLine, ScatterChart, Scatter, Cell, ErrorBar } from 'recharts';
import { GEVParameters, Covariate, VaRLevel, BlockMaximaPoint, BlockMaximaData, GEVDataPoint, POTDataPoint, MultiSiteData, SiteEstimate, PoolingType, RandomInterceptModel, RandomSlopeModel } from './types';
import { calculateGEVParams, gevCDF, gevPDF, gevQuantile, gevRandom, calculateCrashRisk, calculateCVaR, calculateMeanExcess, calculateParameterStability, generateMultiSiteData, calculateNoPooling, calculatePartialPooling, calculateRandomInterceptModel, calculateRandomSlopeModel } from './calculations';

export default function BHEVModel() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [varLevel, setVarLevel] = useState<VaRLevel>(95);
  const [blockSize, setBlockSize] = useState(120); // seconds
  const [conflictDensity, setConflictDensity] = useState(5); // conflicts per minute
  const [potThreshold, setPotThreshold] = useState(-1.5); // Threshold for POT
  const [dataKey, setDataKey] = useState(0); // Key to force regeneration
  
  // Multi-site modeling state
  const [numSites, setNumSites] = useState(6);
  const [multiSiteDataKey, setMultiSiteDataKey] = useState(0);
  const [poolingType, setPoolingType] = useState<PoolingType>('partial');
  const [populationMu0, setPopulationMu0] = useState(-3.3);
  const [populationZeta0, setPopulationZeta0] = useState(0.2);
  const [tauMu0, setTauMu0] = useState(0.3);
  const [tauZeta0, setTauZeta0] = useState(0.15);
  const [populationBetaMu, setPopulationBetaMu] = useState(0.04);
  const [populationBetaZeta, setPopulationBetaZeta] = useState(-0.02);
  const [tauBetaMu, setTauBetaMu] = useState(0.05);
  const [tauBetaZeta, setTauBetaZeta] = useState(0.03);
  
  const [parameters, setParameters] = useState<GEVParameters>({
    mu0: -3.3,
    zeta0: 0.2,
    xi: -0.4,
    covariates: [
      { id: '1', name: 'Covariate 1', value: 0.0, betaMu: 0.04, betaZeta: -0.02 },
    ],
  });

  // Calculate current GEV parameters
  const currentParams = useMemo(() => 
    calculateGEVParams(parameters, parameters.covariates.map(c => c.value)),
    [parameters]
  );
  const { mu, sigma, xi } = currentParams;

  // Calculate crash risk: P(X >= 0) = 1 - P(X < 0) = 1 - CDF(0)
  const crashRisk = useMemo(() => {
    return calculateCrashRisk(mu, sigma, xi);
  }, [mu, sigma, xi]);

  // Track previous crash risk for delta indicator
  const previousCrashRiskRef = useRef<number | null>(null);
  const [crashRiskDelta, setCrashRiskDelta] = useState<number | null>(null);

  useEffect(() => {
    if (previousCrashRiskRef.current !== null) {
      const delta = crashRisk - previousCrashRiskRef.current;
      setCrashRiskDelta(delta);
    }
    previousCrashRiskRef.current = crashRisk;
  }, [crashRisk]);

  // Calculate crash risk interpretation
  // Crash risk is the probability that ONE BLOCK has a crash
  // Calculate blocks per hour, then extrapolate to crashes per year based on 8 hrs/day (peak conditions), 365 days/year
  const crashRiskInterpretation = useMemo(() => {
    if (crashRisk <= 0) return null;
    
    // Calculate blocks per hour
    const secondsPerHour = 60 * 60;
    const blocksPerHour = secondsPerHour / blockSize;
    
    // Extrapolate to blocks per year: 8 hrs/day (peak conditions) × 365 days/year
    const hoursPerYear = 8 * 365; // 8 hours per day, 365 days per year
    const blocksPerYear = blocksPerHour * hoursPerYear;
    
    // Crashes per year = crash risk (per block) * blocks per year
    const crashesPerYear = crashRisk * blocksPerYear;
    
    return { blocksPerHour, blocksPerYear, crashesPerYear };
  }, [crashRisk, blockSize]);

  // Format crash risk with appropriate precision (handle very small values like 1e-9)
  const formatCrashRisk = (risk: number): string => {
    if (risk <= 0) return '0.0000%';
    const percentRisk = risk * 100;
    if (percentRisk < 1e-4) {
      // Use scientific notation for very small values (multiply by 100 for percentage first)
      return percentRisk.toExponential(2) + '%';
    }
    if (percentRisk < 0.01) {
      // Show more decimal places for small values
      return percentRisk.toFixed(6) + '%';
    }
    if (percentRisk < 0.1) {
      return percentRisk.toFixed(5) + '%';
    }
    // Standard precision for larger values
    return percentRisk.toFixed(4) + '%';
  };

  // Determine crash risk color/category
  const getCrashRiskColor = (risk: number) => {
    if (risk < 0.001) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' };
    if (risk < 0.01) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
  };

  const riskColors = getCrashRiskColor(crashRisk);

  // Calculate VaR (Value at Risk) - the quantile at the specified level
  const varValue = useMemo(() => {
    const p = varLevel / 100;
    return gevQuantile(p, mu, sigma, xi);
  }, [mu, sigma, xi, varLevel]);

  // Calculate CVaR (Conditional Value at Risk / Expected Shortfall)
  const cvarValue = useMemo(() => {
    return calculateCVaR(mu, sigma, xi, varLevel, varValue);
  }, [mu, sigma, xi, varLevel, varValue]);

  // Generate raw data for Block Maxima and POT (using same underlying process)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rawProcessData = useMemo(() => {
    const genMu = -1.9;
    const genZeta = -0.3;
    const genSigma = Math.exp(genZeta);
    const genXi = -0.4;
    
    const totalDuration = 2400; // 40 minutes
    const lambda = conflictDensity / 60; // conflicts per second
    const allPoints: Array<{ time: number; value: number }> = [];
    
    let currentTime = 0;
    while (currentTime < totalDuration) {
      const interArrival = -Math.log(Math.random()) / lambda;
      currentTime += interArrival;
      
      if (currentTime < totalDuration) {
        const value = gevRandom(genMu, genSigma, genXi);
        allPoints.push({ time: currentTime, value });
      }
    }
    return allPoints;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conflictDensity, dataKey]);

  // Process data for Block Maxima
  const blockMaximaData = useMemo(() => {
    const nBlocks = Math.ceil(2400 / blockSize);
    const blockMaxima: BlockMaximaPoint[] = [];
    const points: BlockMaximaPoint[] = rawProcessData.map(p => ({
      ...p,
      block: Math.floor(p.time / blockSize),
      isMaxima: false
    }));

    for (let block = 0; block < nBlocks; block++) {
      const blockPoints = points.filter(p => p.block === block);
      if (blockPoints.length > 0) {
        const maxima = blockPoints.reduce((max, p) => p.value > max.value ? p : max);
        blockMaxima.push({ ...maxima, isMaxima: true });
      }
    }

    // Mark maxima in points
    points.forEach(point => {
      const maxima = blockMaxima.find(m => m.block === point.block && Math.abs(m.value - point.value) < 0.0001);
      if (maxima) point.isMaxima = true;
    });

    return {
      points,
      blockBoundaries: Array.from({ length: nBlocks + 1 }, (_, i) => i * blockSize),
      blockMaxima,
    } as BlockMaximaData;
  }, [rawProcessData, blockSize]);

  // Process data for POT
  const potData = useMemo(() => {
    const points: POTDataPoint[] = rawProcessData.map(p => ({
      ...p,
      isExceedance: p.value > potThreshold
    }));
    return points;
  }, [rawProcessData, potThreshold]);

  // Calculate MRL Data - use range from -3 to 0
  const mrlData = useMemo(() => {
    const values = rawProcessData.map(p => p.value);
    return calculateMeanExcess(values, -3, 0, 50);
  }, [rawProcessData]);

  // Calculate Stability Data - use range from -3 to 0
  const stabilityData = useMemo(() => {
    const values = rawProcessData.map(p => p.value);
    return calculateParameterStability(values, -3, 0, 50);
  }, [rawProcessData]);

  // Generate GEV distribution data for plotting
  const gevData = useMemo(() => {
    const data: GEVDataPoint[] = [];
    const lowerBound = mu - 5 * sigma;
    const upperBound = xi < 0 ? mu - sigma / xi : mu + 5 * sigma;
    const extendedUpper = Math.max(upperBound, 2);
    const extendedLower = Math.min(lowerBound, -2);
    const nPoints = 500;
    const step = (extendedUpper - extendedLower) / nPoints;
    
    for (let i = 0; i <= nPoints; i++) {
      const x = extendedLower + i * step;
      const pdf = gevPDF(x, mu, sigma, xi);
      data.push({ x, pdf });
    }
    return data;
  }, [mu, sigma, xi]);
  
  // Separate data for crash risk region (x >= 0)
  const crashRiskData = useMemo(() => {
    const positiveData = gevData.filter(d => d.x >= 0);
    if (positiveData.length === 0 || positiveData[0].x > 0.001) {
      return [{ x: 0, pdf: gevPDF(0, mu, sigma, xi) }, ...positiveData];
    }
    return positiveData;
  }, [gevData, mu, sigma, xi]);

  // Calculate x-axis domain from data
  const xAxisDomain = useMemo(() => {
    const xValues = gevData.map(d => d.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const padding = (maxX - minX) * 0.1;
    return [minX - padding, maxX + padding];
  }, [gevData]);

  // Calculate maximum PDF value for vertical line height
  const maxPDF = useMemo(() => Math.max(...gevData.map(d => d.pdf)), [gevData]);

  // Data for vertical line at x=0
  const verticalLineData = useMemo(() => [{ x: 0, pdf: 0 }, { x: 0, pdf: maxPDF }], [maxPDF]);

  // Generate multi-site data
  const currentMultiSiteData = useMemo(() => {
    return generateMultiSiteData(numSites, conflictDensity, 2400);
  }, [numSites, conflictDensity, multiSiteDataKey]);

  // Calculate no pooling estimates
  const noPoolingEstimates = useMemo(() => {
    if (!currentMultiSiteData) return [];
    return calculateNoPooling(currentMultiSiteData, blockSize);
  }, [currentMultiSiteData, blockSize]);

  // Calculate partial pooling estimates
  const partialPoolingResult = useMemo(() => {
    if (!currentMultiSiteData) return null;
    return calculatePartialPooling(currentMultiSiteData, blockSize);
  }, [currentMultiSiteData, blockSize]);

  // Calculate random intercept model
  const randomInterceptModel = useMemo(() => {
    if (!currentMultiSiteData) return null;
    return calculateRandomInterceptModel(
      currentMultiSiteData,
      populationMu0,
      populationZeta0,
      tauMu0,
      tauZeta0
    );
  }, [currentMultiSiteData, populationMu0, populationZeta0, tauMu0, tauZeta0]);

  // Calculate random slope model
  const randomSlopeModel = useMemo(() => {
    if (!currentMultiSiteData) return null;
    return calculateRandomSlopeModel(
      currentMultiSiteData,
      populationBetaMu,
      populationBetaZeta,
      tauBetaMu,
      tauBetaZeta
    );
  }, [currentMultiSiteData, populationBetaMu, populationBetaZeta, tauBetaMu, tauBetaZeta]);

  const updateParameter = (key: keyof GEVParameters, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const updateCovariate = (id: string, field: keyof Covariate, value: string | number) => {
    setParameters(prev => ({
      ...prev,
      covariates: prev.covariates.map(cov =>
        cov.id === id ? { ...cov, [field]: value } : cov
      ),
    }));
  };

  const addCovariate = () => {
    const newId = String(Date.now());
    setParameters(prev => ({
      ...prev,
      covariates: [
        ...prev.covariates,
        { id: newId, name: `Covariate ${prev.covariates.length + 1}`, value: 0.0, betaMu: 0.0, betaZeta: 0.0 },
      ],
    }));
  };

  const removeCovariate = (id: string) => {
    if (parameters.covariates.length <= 1) return;
    setParameters(prev => ({
      ...prev,
      covariates: prev.covariates.filter(cov => cov.id !== id),
    }));
  };

  // Custom Error Bar for MRL Plot
  const CustomizedErrorBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    // Scale factors need to be passed or calculated? Recharts doesn't make this easy.
    // Simplified approach: Use Area chart for confidence bounds or accept simple lines for now.
    return null;
  };

  // Tooltip component for parameter help
  const ParameterTooltip = ({ content, children }: { content: string; children: ReactNode }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
      <div className="relative inline-block">
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(e) => {
            e.preventDefault();
            setShowTooltip(!showTooltip);
          }}
          aria-label="Parameter explanation"
        >
          <span className="text-xs font-bold">?</span>
        </button>
        {showTooltip && (
          <div className="absolute z-50 left-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl animate-fade-in">
            {content}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 animate-fade-in">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generalized Extreme Value (GEV) Model Explorer</h2>
        <p className="text-gray-700 mb-3">
          Traffic conflicts are near-miss events that can predict crashes. This tool demonstrates how Bayesian Hierarchical Extreme Value (BHEV) models can quantify crash risk from conflict data, enabling proactive safety assessment.
        </p>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-mono">
            GEV(μ, σ, ξ) where:<br />
            μ = μ₀ + Σ(β_μ × covariate)<br />
            σ = exp(ζ₀ + Σ(β_ζ × covariate))<br />
            ξ = fixed
          </p>
        </div>
      </div>

      {/* Tutorial Section */}
      {showTutorial && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">Tutorial: Block Maxima and GEV Modeling</h3>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Hide Tutorial
            </button>
          </div>

          {/* Tutorial Navigation Links */}
          <div className="mb-6 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Quick Navigation:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <a href="#why-negated" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Why Negated Extremes</a>
              <a href="#data-generation" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Data Generation</a>
              <a href="#block-maxima" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Block Maxima</a>
              <a href="#pot" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Peak-Over-Threshold</a>
              <a href="#comparison" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Comparison</a>
              <a href="#interactive-model" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Interactive Model</a>
              <a href="#bayesian-foundations" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Bayesian Foundations</a>
              <a href="#multisite-data" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Multi-Site Data</a>
              <a href="#random-intercepts" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Random Intercepts</a>
              <a href="#partial-pooling" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Partial Pooling</a>
              <a href="#random-slopes" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Random Slopes</a>
              <a href="#full-model" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Full Model</a>
            </div>
          </div>

          <div className="space-y-8 text-gray-700">
            
            {/* 1. Why Negated Extremes - Moved to top */}
            <div id="why-negated" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">1. Why Negated Extremes?</h4>
              <p>
                In traffic safety analysis, we often deal with conflict measures like Time-To-Collision (TTC). Small TTC values represent dangerous situations. 
                <strong> Importantly, a Time-To-Collision of 0 means a crash has occurred.</strong> Extreme Value Theory typically models maxima (largest values), not minima. To use standard GEV theory, we transform our data:
              </p>
              <p className="mt-2">
                We model <strong>-TTC</strong> (negated Time-To-Collision) because:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>More negative values (large negative numbers) = more severe conflicts</li>
                <li>Crash occurs when -TTC ≥ 0 (i.e., TTC ≤ 0)</li>
                <li>This allows us to model the &quot;upper tail&quot; of extremes using standard GEV theory</li>
                <li>Crash risk = P(-TTC ≥ 0) = P(TTC ≤ 0)</li>
              </ul>
            </div>

            {/* 2. Data Generation */}
            <div id="data-generation" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">2. Data Generation</h4>
              <p className="mb-3">
                First, let&apos;s generate conflict data using a Poisson process with a specified conflict density. 
                This simulates realistic traffic conflict scenarios over time.
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold">Generate Conflict Data</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Conflict Density (per minute):</label>
                    <input
                      type="number"
                      value={conflictDensity}
                      onChange={(e) => setConflictDensity(Math.max(0.1, parseFloat(e.target.value) || 5))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0.1"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Generate Data:</label>
                    <button
                      onClick={() => setDataKey(prev => prev + 1)}
                      className="w-full px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                    >
                      Generate New Data
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Total conflicts generated: {rawProcessData.length}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Block Maxima Approach */}
            <div id="block-maxima" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">3. Block Maxima Approach</h4>
              <p className="mb-3">
                We divide our time series data into blocks (e.g., daily, weekly blocks) 
                and extract the maximum value from each block. These maxima follow a GEV distribution.
              </p>
              <p className="mb-3 text-sm text-gray-600">
                Note: These maxima are supposed to represent true extremes. At extremely low block sizes (e.g., 15 seconds), 
                these tend not to be extremes unless there is a massive amount of conflict data available.
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold">Interactive Block Maxima Visualization</h5>
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">Block Size (seconds):</label>
                  <input
                    type="number"
                    value={blockSize}
                    onChange={(e) => setBlockSize(Math.max(10, parseInt(e.target.value) || 120))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm max-w-xs"
                    min="10"
                    step="10"
                  />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number"
                      dataKey="time"
                      domain={[0, 2400]}
                      label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      type="number"
                      dataKey="value"
                      label={{ value: 'Negated Conflict Extreme (-TTC)', angle: -90, position: 'insideLeft' }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'value') return [value.toFixed(3), 'Value'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    {/* Block boundary lines */}
                    {blockMaximaData.blockBoundaries.map((boundary, idx) => (
                      <ReferenceLine
                        key={idx}
                        x={boundary}
                        stroke="#94a3b8"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    ))}
                    {/* Regular points */}
                    <Scatter
                      name="Conflict Data"
                      data={blockMaximaData.points.filter(p => !p.isMaxima)}
                      fill="#3b82f6"
                    >
                      {blockMaximaData.points.filter(p => !p.isMaxima).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                      ))}
                    </Scatter>
                    {/* Block maxima points */}
                    <Scatter
                      name="Block Maxima"
                      data={blockMaximaData.blockMaxima}
                      fill="#ef4444"
                    >
                      {blockMaximaData.blockMaxima.map((entry, index) => (
                        <Cell key={`maxima-${index}`} fill="#ef4444" />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-600 mt-2">
                  Blue points show random conflict data. Red points show block maxima (most extreme values in each block). 
                  Vertical lines indicate block boundaries. <strong>Number of blocks: {blockMaximaData.blockMaxima.length}</strong>
                </p>
              </div>
            </div>

            {/* 4. Peak-Over-Threshold (POT) Approach */}
            <div id="pot" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">4. Peak-Over-Threshold (POT) Approach</h4>
              <p className="mb-3">
                Instead of blocks, we can consider all events that exceed a certain high threshold $u$. These &quot;exceedances&quot; 
                are modeled using a Generalized Pareto Distribution (GPD). This often uses data more efficiently than Block Maxima.
              </p>
              <p className="mb-3 text-sm text-gray-600">
                Note: Threshold selection is somewhat arbitrary and requires careful consideration. The diagnostic plots below 
                help guide this selection.
              </p>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h5 className="font-semibold mb-3">Interactive Threshold Selection</h5>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">
                    Select Threshold ($u$): {potThreshold.toFixed(2)}
                  </label>
                  <input 
                    type="range"
                    min="-4"
                    max="0"
                    step="0.1"
                    value={potThreshold}
                    onChange={(e) => setPotThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer max-w-md transition-all duration-200"
                  />
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number"
                      dataKey="time"
                      domain={[0, 2400]}
                      label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      type="number"
                      dataKey="value"
                      label={{ value: 'Negated Conflict Extreme (-TTC)', angle: -90, position: 'insideLeft' }}
                      stroke="#6b7280"
                    />
                    <Tooltip formatter={(value: number) => value.toFixed(3)} />
                    <Legend />
                    <ReferenceLine y={potThreshold} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: `u = ${potThreshold}`, fill: '#ef4444' }} />
                    <Scatter name="Below Threshold" data={potData.filter(p => !p.isExceedance)} fill="#9ca3af" opacity={0.5} />
                    <Scatter name="Exceedances (Above u)" data={potData.filter(p => p.isExceedance)} fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-600 mt-2">
                  Grey points are below the threshold. Red points are &quot;exceedances&quot; used to fit the GPD model. 
                  <strong> Number of exceedances: {potData.filter(p => p.isExceedance).length}</strong>
                </p>
              </div>

              {/* Diagnostic Plots */}
              <div className="mt-4 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Threshold Selection:</strong> These diagnostic plots help select a valid threshold for the Peak-Over-Threshold approach.
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Typically, we start by selecting a threshold at approximately the <strong>85th percentile</strong> of the data. 
                  We then verify these plots (which require some subjective judgment) to ensure the threshold is appropriate, 
                  and only then use it for modeling.
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside ml-2 space-y-1">
                  <li><strong>Mean Residual Life Plot:</strong> We select where the graph is linear (stable mean excess).</li>
                  <li><strong>Parameter Stability Plot:</strong> We select where parameters are stable above a given threshold.</li>
                </ul>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Mean Residual Life Plot */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Mean Residual Life Plot</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Identify a valid threshold where the graph becomes linear (stable mean excess).
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={mrlData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        dataKey="threshold" 
                        domain={[-3, 0]}
                        allowDataOverflow={false}
                        label={{ value: 'Threshold (u)', position: 'insideBottom', offset: -5 }} 
                        height={30}
                      />
                      <YAxis label={{ value: 'Mean Excess', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(val: number) => val.toFixed(3)} />
                      {/* Confidence Interval Area */}
                      <Area type="monotone" dataKey="upperCI" stroke="none" fill="#bfdbfe" fillOpacity={0.5} />
                      <Area type="monotone" dataKey="lowerCI" stroke="none" fill="#fff" fillOpacity={1.0} />
                      {/* Main Line */}
                      <Line type="monotone" dataKey="meanExcess" stroke="#2563eb" dot={false} strokeWidth={2} />
                      {/* Vertical line at selected threshold */}
                      <ReferenceLine 
                        x={potThreshold} 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Parameter Stability Plots */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Parameter Stability (Modified Scale)</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Check if parameters are constant above chosen threshold.
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={stabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        dataKey="threshold" 
                        domain={[-3, 0]}
                        allowDataOverflow={false}
                        label={{ value: 'Threshold (u)', position: 'insideBottom', offset: -5 }} 
                        height={30}
                      />
                      <YAxis domain={['auto', 'auto']} label={{ value: 'Modified Scale', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(val: number) => val.toFixed(3)} />
                      <Line type="monotone" dataKey="modifiedScale" stroke="#059669" dot={false} strokeWidth={2} />
                      {/* Vertical line at selected threshold */}
                      <ReferenceLine 
                        x={potThreshold} 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 5. Block Maxima vs Peak-Over-Threshold */}
            <div id="comparison" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">5. Block Maxima vs Peak-Over-Threshold</h4>
              
              <div className="mb-4">
                <p className="mb-3">
                  Both Block Maxima and Peak-Over-Threshold are methods for modeling extreme events, but they approach the problem differently. 
                  Understanding their differences helps you choose the right method for your data.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                {/* Block Maxima Column */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Block Maxima Approach</h5>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold mb-1">How it works:</p>
                      <p>Divide your continuous observation space (traffic conflict time series) into fixed time blocks (e.g., hourly, daily blocks) and take the maximum conflict value from each block.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Distribution:</p>
                      <p>Block maxima follow a <strong>Generalized Extreme Value (GEV)</strong> distribution:</p>
                      <div className="bg-white p-3 rounded mt-2 font-mono text-xs">
                        <p>F(x) = exp{'{'}-[1 + ξ(x-μ)/σ]<sup>-1/ξ</sup>{'}'}</p>
                        <p className="text-xs text-gray-600 mt-1">where μ is location, σ is scale, ξ is shape</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Data usage:</p>
                      <p>Uses only one value per block (the maximum conflict), which can be inefficient if you have rich conflict data available.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Advantages:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Conceptually simple</li>
                        <li>Works well when conflict data naturally falls into meaningful time blocks</li>
                        <li>No threshold selection needed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* POT Column */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Peak-Over-Threshold Approach</h5>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold mb-1">How it works:</p>
                      <p>Select all conflict values that exceed a high threshold u. Model both the occurrence rate of exceedances and their magnitudes.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Distribution:</p>
                      <p>Exceedances follow a <strong>Generalized Pareto Distribution (GPD)</strong>:</p>
                      <div className="bg-white p-3 rounded mt-2 font-mono text-xs">
                        <p>G(y) = 1 - [1 + ξy/σ]<sup>-1/ξ</sup></p>
                        <p className="text-xs text-gray-600 mt-1">where y = x - u (excess over threshold), σ is scale, ξ is shape</p>
                      </div>
                      <p className="mt-2 text-xs">
                        <strong>Important:</strong> GPD requires modeling the occurrence process separately using a <strong>Poisson process</strong>, 
                        since POT only models the exceedances (how extreme the conflicts are), not when they occur.
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Data usage:</p>
                      <p>Uses all conflict values above the threshold, making better use of available extreme conflict data.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Advantages:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>More data-efficient for traffic conflicts</li>
                        <li>Flexible threshold selection</li>
                        <li>Can capture more extreme conflict events</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                <h5 className="font-semibold text-gray-900 mb-3">Key Differences</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold mb-2">When to use Block Maxima:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>You have a continuous observation space for traffic conflicts with natural time-based blocking (e.g., cycle level, hourly, daily patterns)</li>
                      <li>You want to avoid threshold selection decisions</li>
                      <li>The block structure aligns with your research questions about conflict extremes</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">When to use POT:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>You have continuous traffic conflict data with many extreme values</li>
                      <li>You want to capture all extreme events above a threshold rather than just one per time block</li>
                      <li>You have sufficient data to select and validate an appropriate threshold using diagnostic plots</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border border-gray-300">
                  <p className="text-sm text-gray-700">
                    <strong>Mathematical Relationship:</strong> The GPD and GEV distributions are closely related. In fact, if you 
                    have a high enough threshold in POT, the GPD parameters can be derived from the corresponding GEV parameters. 
                    The shape parameter ξ is the same in both distributions, which makes them particularly useful for comparative analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Interactive GEV Model Explorer */}
            <div id="interactive-model" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">6. Interactive GEV Model Explorer</h4>
              <p className="mb-3">
                Now that you understand how Block Maxima and POT work, explore how GEV parameters affect the distribution and crash risk. 
                Adjust the parameters below to see how they impact the shape of the distribution and the probability of crashes.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-4">
                {/* Parameter Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span>μ₀ (mu0): {parameters.mu0.toFixed(3)}</span>
                      <ParameterTooltip content="Location parameter - controls where most conflicts cluster. More negative values indicate less severe typical conflicts. Increasing mu0 shifts the distribution toward zero, increasing crash risk.">
                        <span></span>
                      </ParameterTooltip>
                    </label>
                    <input
                      type="range"
                      min="-5"
                      max="0"
                      step="0.1"
                      value={parameters.mu0}
                      onChange={(e) => updateParameter('mu0', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                    />
                    <input
                      type="number"
                      value={parameters.mu0.toFixed(3)}
                      onChange={(e) => updateParameter('mu0', parseFloat(e.target.value) || 0)}
                      className="mt-2 w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span>ζ₀ (zeta0): {parameters.zeta0.toFixed(3)}</span>
                      <ParameterTooltip content="Scale parameter (log scale) - controls variability in conflict severity. Higher values mean more unpredictable extremes. The actual scale σ = exp(zeta0). Increasing zeta0 increases the spread of extreme values.">
                        <span></span>
                      </ParameterTooltip>
                    </label>
                    <input
                      type="range"
                      min="-1"
                      max="2"
                      step="0.1"
                      value={parameters.zeta0}
                      onChange={(e) => updateParameter('zeta0', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                    />
                    <input
                      type="number"
                      value={parameters.zeta0.toFixed(3)}
                      onChange={(e) => updateParameter('zeta0', parseFloat(e.target.value) || 0)}
                      className="mt-2 w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span>ξ (xi, fixed): {parameters.xi.toFixed(3)}</span>
                      <ParameterTooltip content="Shape parameter - controls tail behavior. Negative values indicate a bounded upper tail (conflicts can't get infinitely severe). More negative values mean the tail decays faster. This parameter is typically fixed in BHEV models.">
                        <span></span>
                      </ParameterTooltip>
                    </label>
                    <input
                      type="range"
                      min="-0.5"
                      max="0"
                      step="0.01"
                      value={parameters.xi}
                      onChange={(e) => updateParameter('xi', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                    />
                    <input
                      type="number"
                      value={parameters.xi.toFixed(3)}
                      onChange={(e) => updateParameter('xi', parseFloat(e.target.value) || 0)}
                      className="mt-2 w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                      step="0.01"
                    />
                  </div>

                  {/* VaR Level Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Value at Risk (VaR) Level
                    </label>
                    <select
                      value={varLevel}
                      onChange={(e) => setVarLevel(parseInt(e.target.value) as VaRLevel)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={90}>90th Percentile (Highest 10%)</option>
                      <option value={95}>95th Percentile (Highest 5%)</option>
                      <option value={99}>99th Percentile (Highest 1%)</option>
                    </select>
                  </div>

                  {/* Risk Metrics Display */}
                  <div className={`rounded-lg p-4 border-2 transition-all duration-300 ${riskColors.bg} ${riskColors.border}`}>
                    <h4 className="font-semibold text-gray-900 mb-3">Risk Metrics</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-gray-700 font-medium">Crash Risk P(X≥0):</span>
                        <span className={`font-bold text-lg transition-colors duration-300 ${riskColors.text}`}>
                          {formatCrashRisk(crashRisk)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">VaR ({varLevel}th percentile):</span>
                        <span className="font-bold text-orange-600 transition-all duration-300">{varValue.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">CVaR (Expected Shortfall):</span>
                        <span className="font-bold text-purple-600 transition-all duration-300">{cvarValue.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hierarchical Model Explanation */}
                  <div className="pt-4 border-t border-gray-300">
                    <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Bayesian Hierarchical Model Structure</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p>
                          While the basic GEV distribution depends on three parameters (μ, σ, ξ), these alone cannot capture 
                          the variability in traffic conditions or the relationships between explanatory variables. To address 
                          this, we use a <strong>Bayesian hierarchical model</strong> that incorporates covariates—factors that 
                          influence conflict severity—through linear relationships in the location and scale parameters.
                        </p>
                        <p>
                          The hierarchical structure allows the GEV parameters to vary based on traffic conditions:
                        </p>
                        <div className="bg-white rounded-lg p-3 mt-3 font-mono text-xs space-y-1 border border-indigo-300">
                          <p>μ = μ₀ + Σ(β_μ × covariate)</p>
                          <p>ζ = ζ₀ + Σ(β_ζ × covariate)</p>
                          <p>σ = exp(ζ)</p>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          where <strong>ζ</strong> is the log-scale parameter (ensuring σ remains positive), <strong>μ₀</strong> and 
                          <strong> ζ₀</strong> are baseline parameters, and <strong>β_μ</strong> and <strong>β_ζ</strong> are 
                          coefficients that quantify how each covariate affects location and scale, respectively. The shape parameter 
                          ξ is typically held constant across scenarios.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Covariates Section */}
                  <div className="pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Covariates</h3>
                      <button
                        onClick={addCovariate}
                        className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors"
                      >
                        + Add Covariate
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {parameters.covariates.map((cov) => (
                        <div key={cov.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <input
                              type="text"
                              value={cov.name}
                              onChange={(e) => updateCovariate(cov.id, 'name', e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                              placeholder="Covariate name"
                            />
                            {parameters.covariates.length > 1 && (
                              <button
                                onClick={() => removeCovariate(cov.id)}
                                className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Covariate Value: {cov.value.toFixed(2)}
                              </label>
                              <input
                                type="range"
                                min="-3"
                                max="3"
                                step="0.1"
                                value={cov.value}
                                onChange={(e) => updateCovariate(cov.id, 'value', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1 flex items-center">
                                <span>β_μ (betaMu): {cov.betaMu.toFixed(3)}</span>
                                <ParameterTooltip content="Covariate effect on location parameter - how this factor shifts conflict severity. Positive values increase severity (shift distribution right), negative values decrease severity.">
                                  <span></span>
                                </ParameterTooltip>
                              </label>
                              <input
                                type="range"
                                min="-2"
                                max="2"
                                step="0.01"
                                value={cov.betaMu}
                                onChange={(e) => updateCovariate(cov.id, 'betaMu', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                              />
                              <input
                                type="number"
                                value={cov.betaMu.toFixed(3)}
                                onChange={(e) => updateCovariate(cov.id, 'betaMu', parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                step="0.01"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1 flex items-center">
                                <span>β_ζ (betaZeta): {cov.betaZeta.toFixed(3)}</span>
                                <ParameterTooltip content="Covariate effect on scale parameter - how this factor changes variability in conflicts. Positive values increase variability (more unpredictable extremes), negative values decrease variability.">
                                  <span></span>
                                </ParameterTooltip>
                              </label>
                              <input
                                type="range"
                                min="-2"
                                max="2"
                                step="0.01"
                                value={cov.betaZeta}
                                onChange={(e) => updateCovariate(cov.id, 'betaZeta', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                              />
                              <input
                                type="number"
                                value={cov.betaZeta.toFixed(3)}
                                onChange={(e) => updateCovariate(cov.id, 'betaZeta', parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Parameter Values */}
                  <div className="pt-4 border-t border-gray-300 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Current GEV Parameters</h4>
                    <div className="text-sm space-y-1 font-mono">
                      <p>μ = {mu.toFixed(3)}</p>
                      <p>σ = {sigma.toFixed(3)}</p>
                      <p>ξ = {xi.toFixed(3)}</p>
                    </div>
                  </div>
                </div>

                {/* Visualization */}
                <div className="space-y-6">
                  {/* Prominent Crash Risk Display */}
                  <div className={`p-5 rounded-lg border-2 ${riskColors.bg} ${riskColors.border} transition-all duration-300`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Crash Risk Measurement</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          The probability that one block contains a crash: P(X≥0) = P(TTC≤0). Using block size (from above), extrapolated to crashes per year assuming 8 hrs/day (peak conditions), 365 days/year.
                        </p>
                      </div>
                      
                      {/* Crash Risk Hero Metric */}
                      <div className={`px-6 py-4 rounded-lg border ${riskColors.border} bg-white shadow-md min-w-[200px]`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Crash Risk (per block)</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${riskColors.badge}`}>
                            {crashRisk < 0.001 ? 'Low' : crashRisk < 0.01 ? 'Moderate' : 'High'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-4xl font-bold ${riskColors.text} transition-all duration-300`}>
                            {formatCrashRisk(crashRisk)}
                          </span>
                          {crashRiskDelta !== null && crashRiskDelta !== 0 && (
                            <span className={`text-sm font-semibold ${crashRiskDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {crashRiskDelta > 0 ? '+' : ''}{formatCrashRisk(Math.abs(crashRiskDelta))}
                            </span>
                          )}
                        </div>
                        {crashRiskInterpretation && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-semibold">Crashes per year:</span> ~{crashRiskInterpretation.crashesPerYear.toFixed(2)}
                            <br />
                            <span className="text-xs text-gray-500 italic">
                              ({crashRiskInterpretation.blocksPerHour.toFixed(1)} blocks/hr × 8 hrs/day × 365 days = {crashRiskInterpretation.blocksPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })} blocks/year)
                            </span>
                            <br />
                            <span className="text-xs text-gray-500 italic">
                              {crashRiskInterpretation.blocksPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })} blocks/year × {formatCrashRisk(crashRisk)} per block
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              GEV PDF with Crash Risk (P(X{' >'}0) shaded)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={gevData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                <defs>
                  <linearGradient id="crashRiskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  dataKey="x"
                  domain={xAxisDomain}
                  label={{ value: 'Negated Conflict Extreme (x)', position: 'insideBottom', offset: -5 }}
                  stroke="#6b7280"
                  allowDataOverflow={false}
                />
                <YAxis 
                  label={{ value: 'PDF', angle: -90, position: 'insideLeft' }}
                  stroke="#6b7280"
                  domain={[0, (dataMax: number) => Math.max(dataMax, maxPDF) * 1.1]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => value.toFixed(4)}
                  labelFormatter={(label) => `x = ${parseFloat(label).toFixed(3)}`}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '40px' }} />
                {/* Crash risk area (x >= 0 only) - red shaded - plot first so line appears on top */}
                {crashRiskData.length > 0 && (
                  <Area 
                    type="monotone" 
                    dataKey="pdf" 
                    stroke="none"
                    fill="url(#crashRiskGradient)"
                    name="P(X{' >'}0) - Crash Risk"
                    data={crashRiskData}
                    isAnimationActive={false}
                  />
                )}
                {/* Full GEV PDF line (blue, not shaded) - shows entire distribution including negative values - plot on top */}
                <Line 
                  type="monotone" 
                  dataKey="pdf" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  name="GEV"
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
                {/* Vertical line at x=0, from (0,0) to (0, maxPDF) */}
                <Line
                  type="linear"
                  dataKey="pdf"
                  xAxisId={0}
                  yAxisId={0}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                  data={verticalLineData}
                  connectNulls={true}
                />
                <ReferenceLine 
                  x={0}
                  stroke="none"
                  label={{ value: 'x=0 (Crash)', position: 'top', fill: '#ef4444', fontSize: 12 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-2">
              Red shaded area (x{' >'}0) represents crash risk: P(X{' >'}0) = {formatCrashRisk(crashRisk)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GEV PDF with VaR Levels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={gevData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                <defs>
                  <linearGradient id="crashRiskGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  dataKey="x"
                  domain={xAxisDomain}
                  label={{ value: 'Negated Conflict Extreme (x)', position: 'insideBottom', offset: -5 }}
                  stroke="#6b7280"
                  allowDataOverflow={false}
                />
                <YAxis 
                  label={{ value: 'PDF', angle: -90, position: 'insideLeft' }}
                  stroke="#6b7280"
                  domain={[0, (dataMax: number) => Math.max(dataMax, maxPDF) * 1.1]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => value.toFixed(4)}
                  labelFormatter={(label) => `x = ${parseFloat(label).toFixed(3)}`}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '40px' }} />
                {/* Crash risk area (x >= 0 only) - red shaded - plot first so line appears on top */}
                {crashRiskData.length > 0 && (
                  <Area 
                    type="monotone" 
                    dataKey="pdf" 
                    stroke="none"
                    fill="url(#crashRiskGradient2)"
                    name="P(X{' >'}0) - Crash Risk"
                    data={crashRiskData}
                    isAnimationActive={false}
                  />
                )}
                {/* Full GEV PDF line (blue, not shaded) - shows entire distribution including negative values - plot on top */}
                <Line 
                  type="monotone" 
                  dataKey="pdf" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  name="GEV"
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
                {/* Vertical line at x=0, from (0,0) to (0, maxPDF) */}
                <Line
                  type="linear"
                  dataKey="pdf"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                  data={verticalLineData}
                  connectNulls={true}
                  name="TTC=0 (Crash)"
                />
                <ReferenceLine 
                  x={0}
                  stroke="none"
                  label={{ value: 'x=0 (Crash)', position: 'top', fill: '#ef4444', fontSize: 12 }}
                />
                {/* VaR vertical lines at 90th, 95th, and 99th percentiles */}
                {(() => {
                  const var90 = gevQuantile(0.90, mu, sigma, xi);
                  const var95 = gevQuantile(0.95, mu, sigma, xi);
                  const var99 = gevQuantile(0.99, mu, sigma, xi);
                  return (
                    <>
                      <Line
                        type="linear"
                        dataKey="pdf"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={false}
                        isAnimationActive={false}
                        data={[{ x: var90, pdf: 0 }, { x: var90, pdf: maxPDF }]}
                        connectNulls={true}
                        name="90th Percentile"
                      />
                      <ReferenceLine 
                        x={var90}
                        stroke="none"
                        label={{ value: `VaR 90th: ${var90.toFixed(3)}`, position: 'top', fill: '#f59e0b', fontSize: 11 }}
                      />
                      <Line
                        type="linear"
                        dataKey="pdf"
                        stroke="#dc2626"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={false}
                        isAnimationActive={false}
                        data={[{ x: var95, pdf: 0 }, { x: var95, pdf: maxPDF }]}
                        connectNulls={true}
                        name="95th Percentile"
                      />
                      <ReferenceLine 
                        x={var95}
                        stroke="none"
                        label={{ value: `VaR 95th: ${var95.toFixed(3)}`, position: 'top', fill: '#dc2626', fontSize: 11 }}
                      />
                      <Line
                        type="linear"
                        dataKey="pdf"
                        stroke="#991b1b"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={false}
                        isAnimationActive={false}
                        data={[{ x: var99, pdf: 0 }, { x: var99, pdf: maxPDF }]}
                        connectNulls={true}
                        name="99th Percentile"
                      />
                      <ReferenceLine 
                        x={var99}
                        stroke="none"
                        label={{ value: `VaR 99th: ${var99.toFixed(3)}`, position: 'top', fill: '#991b1b', fontSize: 11 }}
                      />
                    </>
                  );
                })()}
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-2">
              Same GEV PDF plot with VaR levels marked. Vertical lines show the 90th, 95th, and 99th percentile thresholds.
            </p>
          </div>
                </div>

            {/* 7. Bayesian Foundations for Hierarchical Models */}
            <div id="bayesian-foundations" className="scroll-mt-20 mt-12">
              <h4 className="font-semibold text-gray-900 mb-2">7. Bayesian Foundations for Hierarchical Models</h4>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  So far, we&apos;ve explored GEV and GPD distributions with fixed parameters. However, in real-world traffic safety analysis, 
                  we often have data from multiple sites (intersections, road segments, etc.) with varying characteristics. Bayesian hierarchical 
                  models provide a powerful framework for modeling this multi-site variability while sharing information across sites.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Why Bayesian for Hierarchical Models?</h5>
                  <ul className="list-disc list-inside ml-2 space-y-2 text-sm">
                    <li><strong>Natural uncertainty quantification:</strong> Bayesian inference provides probability distributions over parameters, not just point estimates</li>
                    <li><strong>Partial pooling:</strong> Allows sites to share information while still maintaining site-specific estimates</li>
                    <li><strong>Prior information:</strong> Can incorporate domain knowledge through prior distributions</li>
                    <li><strong>Handles sparse data:</strong> Sites with little data benefit from information borrowed from other sites</li>
                    <li><strong>Credible intervals:</strong> Provides interpretable uncertainty bounds on parameters and predictions</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Credible Intervals vs Confidence Intervals</h5>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Confidence Intervals (Frequentist):</strong> If we repeated the experiment many times, the true parameter 
                      would fall within the interval in X% of cases. It&apos;s about the procedure, not the specific interval.
                    </p>
                    <p>
                      <strong>Credible Intervals (Bayesian):</strong> Given the observed data, there is an X% probability that the true 
                      parameter lies within this interval. It&apos;s a direct probability statement about the parameter.
                    </p>
                    <p className="mt-2">
                      For hierarchical models, credible intervals naturally account for uncertainty at multiple levels (within-site and 
                      between-site variation), making them particularly useful for multi-site analysis.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h5 className="font-semibold text-gray-900 mb-3">MCMC/HMC: How We Estimate Bayesian Models</h5>
                  <div className="space-y-2 text-sm">
                    <p>
                      Bayesian inference requires computing posterior distributions, which typically involve high-dimensional integrals that 
                      can&apos;t be solved analytically. <strong>Markov Chain Monte Carlo (MCMC)</strong> methods solve this by:
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Generating samples from the posterior distribution</li>
                      <li>These samples represent our uncertainty about parameters</li>
                      <li>We can compute statistics (means, credible intervals) from these samples</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Hamiltonian Monte Carlo (HMC)</strong> is a modern MCMC algorithm (used by Stan) that uses gradients to 
                      efficiently explore high-dimensional parameter spaces. The key idea: instead of random walks, HMC uses information 
                      about the shape of the posterior to propose better moves.
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                      Note: In this tutorial, we simulate the results of MCMC rather than running actual MCMC, but the concepts and 
                      interpretations remain the same.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Prior Distributions</h5>
                  <div className="space-y-2 text-sm">
                    <p>
                      Priors encode our beliefs about parameters before seeing the data. In hierarchical models:
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li><strong>Population-level priors:</strong> Specify expected values and variability of population parameters (e.g., average μ₀ across all sites)</li>
                      <li><strong>Hyperpriors:</strong> Specify uncertainty about hyperparameters (e.g., between-site variance τ)</li>
                      <li><strong>Regularization:</strong> Priors help prevent overfitting, especially important when some sites have limited data</li>
                    </ul>
                    <p className="mt-2">
                      For traffic safety, we often use weakly informative priors that allow data to dominate while preventing unrealistic 
                      parameter values.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Multi-Site Data Generation */}
            <div id="multisite-data" className="scroll-mt-20 mt-12">
              <h4 className="font-semibold text-gray-900 mb-2">8. Multi-Site Data Generation</h4>
              
              <p className="mb-3">
                In practice, traffic safety analyses often involve multiple sites (intersections, road segments, etc.) with varying 
                characteristics. Each site may have different baseline risk levels due to geometry, traffic patterns, or environmental factors. 
                Let&apos;s generate synthetic multi-site conflict data to explore hierarchical modeling concepts.
              </p>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold">Generate Multi-Site Conflict Data</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Number of Sites:</label>
                    <input
                      type="number"
                      value={numSites}
                      onChange={(e) => {
                        const val = Math.max(3, Math.min(10, parseInt(e.target.value) || 6));
                        setNumSites(val);
                        setMultiSiteDataKey(prev => prev + 1);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="3"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Conflict Density (per minute):</label>
                    <input
                      type="number"
                      value={conflictDensity}
                      onChange={(e) => setConflictDensity(Math.max(0.1, parseFloat(e.target.value) || 5))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0.1"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Generate Data:</label>
                    <button
                      onClick={() => {
                        setMultiSiteDataKey(prev => prev + 1);
                      }}
                      className="w-full px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                    >
                      Generate New Multi-Site Data
                    </button>
                  </div>
                </div>

                {currentMultiSiteData && (
                  <div className="mt-4">
                    <h6 className="font-semibold mb-2">Generated Sites:</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {currentMultiSiteData.sites.map((site) => (
                        <div key={site.id} className={`p-2 rounded border ${
                          site.type === 'urban' ? 'bg-red-50 border-red-200' :
                          site.type === 'suburban' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-green-50 border-green-200'
                        }`}>
                          <div className="font-semibold">{site.name}</div>
                          <div className="text-xs text-gray-600">Type: {site.type}</div>
                          <div className="text-xs text-gray-600">Sample size: {site.sampleSize}</div>
                          <div className="text-xs text-gray-600">μ₀: {site.mu0.toFixed(3)}</div>
                          <div className="text-xs text-gray-600">ζ₀: {site.zeta0.toFixed(3)}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      <strong>Total conflicts:</strong> {currentMultiSiteData.conflictData.length} across {currentMultiSiteData.sites.length} sites
                    </p>
                  </div>
                )}
              </div>

              {currentMultiSiteData && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h5 className="font-semibold mb-3">Multi-Site Conflict Data Visualization</h5>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        type="number"
                        dataKey="time"
                        domain={[0, 2400]}
                        label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        type="number"
                        dataKey="value"
                        label={{ value: 'Negated Conflict Extreme (-TTC)', angle: -90, position: 'insideLeft' }}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value: number) => value.toFixed(3)}
                      />
                      <Legend />
                      {currentMultiSiteData.sites.map((site, idx) => {
                        const siteData = currentMultiSiteData.conflictData
                          .filter(d => d.siteId === site.id)
                          .map(d => ({ ...d, siteName: site.name }));
                        const color = site.type === 'urban' ? '#ef4444' : site.type === 'suburban' ? '#f59e0b' : '#10b981';
                        return (
                          <Scatter
                            key={site.id}
                            name={site.name}
                            data={siteData}
                            fill={color}
                            opacity={0.6}
                          />
                        );
                      })}
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-600 mt-2">
                    Conflict data from all sites, color-coded by site type. Notice the variation in conflict patterns across sites.
                  </p>
                </div>
              )}
            </div>

            {/* 9. Random Intercept Models */}
            <div id="random-intercepts" className="scroll-mt-20 mt-12">
              <h4 className="font-semibold text-gray-900 mb-2">9. Random Intercept Models</h4>
              
              <p className="mb-3">
                A <strong>random intercept model</strong> allows the baseline parameters (μ₀ and/or ζ₀) to vary across sites while 
                sharing a common population-level structure. This captures the idea that different sites have inherently different 
                baseline risk levels, but these differences come from a common population distribution.
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-sm mb-2">
                  <strong>Concept:</strong> Each site has its own intercept (μ₀ᵢ, ζ₀ᵢ), but these are drawn from a population distribution:
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs mt-2">
                  μ₀ᵢ ~ N(μ₀_pop, τ²_μ₀)<br />
                  ζ₀ᵢ ~ N(ζ₀_pop, τ²_ζ₀)
                </div>
                <p className="text-sm mt-2">
                  where μ₀_pop and ζ₀_pop are population means, and τ²_μ₀, τ²_ζ₀ quantify between-site variation.
                </p>
              </div>

              {currentMultiSiteData && randomInterceptModel && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h5 className="font-semibold mb-3">Interactive Random Intercept Model</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Population μ₀: {populationMu0.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="-4"
                        max="-2"
                        step="0.1"
                        value={populationMu0}
                        onChange={(e) => setPopulationMu0(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        value={populationMu0.toFixed(3)}
                        onChange={(e) => setPopulationMu0(parseFloat(e.target.value) || -3.3)}
                        className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Between-site SD τ_μ₀: {tauMu0.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={tauMu0}
                        onChange={(e) => setTauMu0(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        value={tauMu0.toFixed(3)}
                        onChange={(e) => setTauMu0(parseFloat(e.target.value) || 0.3)}
                        className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        step="0.05"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="font-semibold mb-2">Site-Specific GEV Distributions</h6>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number"
                          domain={[-5, 1]}
                          label={{ value: 'Negated Conflict Extreme (x)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis label={{ value: 'PDF', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        {randomInterceptModel.siteEstimates.map((est, idx) => {
                          const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                          if (!site) return null;
                          const color = site.type === 'urban' ? '#ef4444' : site.type === 'suburban' ? '#f59e0b' : '#10b981';
                          const pdfData: GEVDataPoint[] = [];
                          for (let x = -5; x <= 1; x += 0.05) {
                            pdfData.push({ x, pdf: gevPDF(x, est.mu0, est.sigma0, -0.4) });
                          }
                          return (
                            <Line
                              key={est.siteId}
                              type="monotone"
                              dataKey="pdf"
                              data={pdfData}
                              stroke={color}
                              strokeWidth={1.5}
                              dot={false}
                              name={site.name}
                            />
                          );
                        })}
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">
                      Each line represents the GEV distribution for one site. Notice how sites vary in their baseline risk (location of distribution).
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h6 className="font-semibold mb-2">Site-Specific Crash Risks</h6>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Site</th>
                            <th className="text-right p-2">μ₀</th>
                            <th className="text-right p-2">σ₀</th>
                            <th className="text-right p-2">Crash Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {randomInterceptModel.siteEstimates.map((est) => {
                            const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                            return (
                              <tr key={est.siteId} className="border-b">
                                <td className="p-2">{site?.name}</td>
                                <td className="text-right p-2">{est.mu0.toFixed(3)}</td>
                                <td className="text-right p-2">{est.sigma0.toFixed(3)}</td>
                                <td className="text-right p-2 font-semibold">{formatCrashRisk(est.crashRisk)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 10. Partial Pooling vs No Pooling */}
            <div id="partial-pooling" className="scroll-mt-20 mt-12">
              <h4 className="font-semibold text-gray-900 mb-2">10. Partial Pooling vs No Pooling</h4>
              
              <p className="mb-3">
                When analyzing multi-site data, we face a fundamental trade-off: estimate each site independently (no pooling) or 
                share information across sites (partial pooling). Hierarchical Bayesian models implement partial pooling, which is 
                particularly valuable when some sites have limited data.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h5 className="font-semibold text-gray-900 mb-2">No Pooling</h5>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                    <li>Each site estimated completely independently</li>
                    <li>No information shared between sites</li>
                    <li>Can overfit when sites have little data</li>
                    <li>Sites with few observations have high uncertainty</li>
                    <li>May produce unrealistic estimates for low-data sites</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h5 className="font-semibold text-gray-900 mb-2">Partial Pooling</h5>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                    <li>Sites share information through population-level parameters</li>
                    <li>Site estimates &quot;shrink&quot; toward population mean</li>
                    <li>Amount of shrinkage depends on sample size</li>
                    <li>Low-data sites benefit more from pooling</li>
                    <li>High-data sites remain close to their own data</li>
                    <li>More realistic uncertainty quantification</li>
                  </ul>
                </div>
              </div>

              {currentMultiSiteData && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h5 className="font-semibold mb-3">Compare Pooling Approaches</h5>
                  
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Select Approach:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="none"
                          checked={poolingType === 'none'}
                          onChange={(e) => setPoolingType(e.target.value as PoolingType)}
                          className="mr-2"
                        />
                        <span>No Pooling</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="partial"
                          checked={poolingType === 'partial'}
                          onChange={(e) => setPoolingType(e.target.value as PoolingType)}
                          className="mr-2"
                        />
                        <span>Partial Pooling</span>
                      </label>
                    </div>
                  </div>

                  {poolingType === 'none' && noPoolingEstimates.length > 0 && (
                    <div>
                      <h6 className="font-semibold mb-2">No Pooling Estimates</h6>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="siteId"
                            label={{ value: 'Site', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'μ₀ Estimate', angle: -90, position: 'insideLeft' }}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip />
                          <Scatter
                            name="μ₀ Estimates"
                            data={noPoolingEstimates.map(e => ({
                              siteId: currentMultiSiteData.sites.find(s => s.id === e.siteId)?.name || e.siteId,
                              value: e.mu0,
                            }))}
                            fill="#ef4444"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Site</th>
                              <th className="text-right p-2">Sample Size</th>
                              <th className="text-right p-2">μ₀</th>
                              <th className="text-right p-2">Crash Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            {noPoolingEstimates.map((est) => {
                              const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                              return (
                                <tr key={est.siteId} className="border-b">
                                  <td className="p-2">{site?.name}</td>
                                  <td className="text-right p-2">{site?.sampleSize}</td>
                                  <td className="text-right p-2">{est.mu0.toFixed(3)}</td>
                                  <td className="text-right p-2">{formatCrashRisk(est.crashRisk)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {poolingType === 'partial' && partialPoolingResult && (
                    <div>
                      <h6 className="font-semibold mb-2">Partial Pooling Estimates (with 95% Credible Intervals)</h6>
                      <div className="mb-3 text-sm bg-blue-50 p-2 rounded">
                        <strong>Population parameters:</strong> μ₀_pop = {partialPoolingResult.model.populationMu0.toFixed(3)}, 
                        ζ₀_pop = {partialPoolingResult.model.populationZeta0.toFixed(3)}, 
                        τ_μ₀ = {partialPoolingResult.model.tauMu0.toFixed(3)}, 
                        τ_ζ₀ = {partialPoolingResult.model.tauZeta0.toFixed(3)}
                      </div>
                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="siteId"
                            label={{ value: 'Site', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'μ₀ Estimate', angle: -90, position: 'insideLeft' }}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip />
                          <Legend />
                          <Scatter
                            name="μ₀ Estimates"
                            data={partialPoolingResult.estimates.map(e => ({
                              siteId: currentMultiSiteData.sites.find(s => s.id === e.siteId)?.name || e.siteId,
                              value: e.mu0,
                            }))}
                            fill="#3b82f6"
                          />
                          {partialPoolingResult.estimates.map((est, idx) => {
                            const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                            const siteName = site?.name || est.siteId;
                            return (
                              <ErrorBar
                                key={est.siteId}
                                dataKey="value"
                                data={[{
                                  siteId: siteName,
                                  value: est.mu0,
                                  lower: est.mu0Lower || est.mu0,
                                  upper: est.mu0Upper || est.mu0,
                                }]}
                                direction="y"
                                width={4}
                                stroke="#3b82f6"
                              />
                            );
                          })}
                        </ComposedChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-gray-600 mt-2">
                        Error bars show 95% credible intervals. Notice how sites with smaller sample sizes have wider intervals and 
                        estimates closer to the population mean (partial pooling effect).
                      </p>
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Site</th>
                              <th className="text-right p-2">Sample Size</th>
                              <th className="text-right p-2">μ₀ (95% CI)</th>
                              <th className="text-right p-2">Crash Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            {partialPoolingResult.estimates.map((est) => {
                              const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                              return (
                                <tr key={est.siteId} className="border-b">
                                  <td className="p-2">{site?.name}</td>
                                  <td className="text-right p-2">{site?.sampleSize}</td>
                                  <td className="text-right p-2">
                                    {est.mu0.toFixed(3)} ({est.mu0Lower?.toFixed(3)}, {est.mu0Upper?.toFixed(3)})
                                  </td>
                                  <td className="text-right p-2">{formatCrashRisk(est.crashRisk)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 11. Random Slope Models */}
            <div id="random-slopes" className="scroll-mt-20 mt-12">
              <h4 className="font-semibold text-gray-900 mb-2">11. Random Slope Models</h4>
              
              <p className="mb-3">
                While random intercepts capture baseline differences between sites, <strong>random slopes</strong> allow the effects 
                of covariates to vary across sites. This is important when the same factor (e.g., traffic volume, weather) has 
                different impacts at different locations.
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-sm mb-2">
                  <strong>Concept:</strong> Covariate effects (β_μ, β_ζ) vary by site:
                </p>
                <div className="bg-white rounded p-2 font-mono text-xs mt-2">
                  β_μᵢ ~ N(β_μ_pop, τ²_β_μ)<br />
                  β_ζᵢ ~ N(β_ζ_pop, τ²_β_ζ)
                </div>
                <p className="text-sm mt-2">
                  Example: A 10% increase in traffic volume might increase crash risk more at an urban intersection than at a 
                  rural one. Random slopes capture this site-specific effect variation.
                </p>
              </div>

              {currentMultiSiteData && randomSlopeModel && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h5 className="font-semibold mb-3">Interactive Random Slope Model</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Population β_μ: {populationBetaMu.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="-0.2"
                        max="0.2"
                        step="0.01"
                        value={populationBetaMu}
                        onChange={(e) => setPopulationBetaMu(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Between-site SD τ_β_μ: {tauBetaMu.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.15"
                        step="0.01"
                        value={tauBetaMu}
                        onChange={(e) => setTauBetaMu(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Higher τ_β_μ means more variation in covariate effects across sites
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="font-semibold mb-2">Site-Specific Covariate Effects (β_μ)</h6>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="siteId"
                          label={{ value: 'Site', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'β_μ Effect', angle: -90, position: 'insideLeft' }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine y={populationBetaMu} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Population Mean', position: 'right' }} />
                        <Scatter
                          name="Site-specific β_μ"
                          data={randomSlopeModel.siteSlopes.map(s => ({
                            siteId: currentMultiSiteData.sites.find(site => site.id === s.siteId)?.name || s.siteId,
                            value: s.betaMu,
                          }))}
                          fill="#3b82f6"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">
                      Each point shows the site-specific effect of a covariate. The red line shows the population mean. 
                      When τ_β_μ is large, sites vary more in how they respond to the covariate.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h6 className="font-semibold mb-2">Site-Specific Slope Estimates</h6>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Site</th>
                            <th className="text-right p-2">β_μ</th>
                            <th className="text-right p-2">β_ζ</th>
                            <th className="text-right p-2">Effect Relative to Pop. Mean</th>
                          </tr>
                        </thead>
                        <tbody>
                          {randomSlopeModel.siteSlopes.map((slope) => {
                            const site = currentMultiSiteData.sites.find(s => s.id === slope.siteId);
                            const deviation = slope.betaMu - populationBetaMu;
                            return (
                              <tr key={slope.siteId} className="border-b">
                                <td className="p-2">{site?.name}</td>
                                <td className="text-right p-2">{slope.betaMu.toFixed(4)}</td>
                                <td className="text-right p-2">{slope.betaZeta.toFixed(4)}</td>
                                <td className={`text-right p-2 ${deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {deviation > 0 ? '+' : ''}{deviation.toFixed(4)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 12. Full Hierarchical Model Explorer */}
            <div id="full-model" className="scroll-mt-20 mt-12">
              <h4 className="font-semibold text-gray-900 mb-2">12. Full Hierarchical Model Explorer</h4>
              
              <p className="mb-3">
                The complete hierarchical Bayesian model combines random intercepts and random slopes, allowing both baseline 
                parameters and covariate effects to vary across sites. This provides maximum flexibility while still sharing 
                information through population-level parameters.
              </p>

              {currentMultiSiteData && randomInterceptModel && randomSlopeModel && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h5 className="font-semibold mb-3">Complete Model Summary</h5>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h6 className="font-semibold mb-2">Population-Level Parameters</h6>
                      <div className="text-sm space-y-1">
                        <p>μ₀_pop = {randomInterceptModel.populationMu0.toFixed(3)}</p>
                        <p>ζ₀_pop = {randomInterceptModel.populationZeta0.toFixed(3)}</p>
                        <p>τ_μ₀ = {randomInterceptModel.tauMu0.toFixed(3)}</p>
                        <p>τ_ζ₀ = {randomInterceptModel.tauZeta0.toFixed(3)}</p>
                        <p className="mt-2 font-semibold">Random Slopes:</p>
                        <p>β_μ_pop = {randomSlopeModel.populationBetaMu.toFixed(4)}</p>
                        <p>β_ζ_pop = {randomSlopeModel.populationBetaZeta.toFixed(4)}</p>
                        <p>τ_β_μ = {randomSlopeModel.tauBetaMu.toFixed(4)}</p>
                        <p>τ_β_ζ = {randomSlopeModel.tauBetaZeta.toFixed(4)}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h6 className="font-semibold mb-2">Model Structure</h6>
                      <div className="text-xs font-mono space-y-1">
                        <p>μ₀ᵢ ~ N(μ₀_pop, τ²_μ₀)</p>
                        <p>ζ₀ᵢ ~ N(ζ₀_pop, τ²_ζ₀)</p>
                        <p>β_μᵢ ~ N(β_μ_pop, τ²_β_μ)</p>
                        <p>β_ζᵢ ~ N(β_ζ_pop, τ²_β_ζ)</p>
                        <p className="mt-2">μᵢ = μ₀ᵢ + β_μᵢ × covariate</p>
                        <p>σᵢ = exp(ζ₀ᵢ + β_ζᵢ × covariate)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="font-semibold mb-2">Site-Specific Crash Risk Comparison</h6>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="siteId"
                          label={{ value: 'Site', position: 'insideBottom', offset: -5 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          label={{ value: 'Crash Risk (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip formatter={(value: number) => formatCrashRisk(value)} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="crashRisk"
                          data={randomInterceptModel.siteEstimates.map(e => ({
                            siteId: currentMultiSiteData.sites.find(s => s.id === e.siteId)?.name || e.siteId,
                            crashRisk: e.crashRisk,
                          }))}
                          fill="#ef4444"
                          fillOpacity={0.6}
                          stroke="#dc2626"
                          name="Crash Risk"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">
                      Crash risks vary substantially across sites, reflecting both baseline differences (random intercepts) and 
                      varying responses to covariates (random slopes).
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h6 className="font-semibold mb-2">Complete Site-Specific Estimates</h6>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Site</th>
                            <th className="text-right p-2">μ₀</th>
                            <th className="text-right p-2">σ₀</th>
                            <th className="text-right p-2">β_μ</th>
                            <th className="text-right p-2">Crash Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {randomInterceptModel.siteEstimates.map((est) => {
                            const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                            const slope = randomSlopeModel.siteSlopes.find(s => s.siteId === est.siteId);
                            return (
                              <tr key={est.siteId} className="border-b">
                                <td className="p-2">{site?.name}</td>
                                <td className="text-right p-2">{est.mu0.toFixed(3)}</td>
                                <td className="text-right p-2">{est.sigma0.toFixed(3)}</td>
                                <td className="text-right p-2">{slope?.betaMu.toFixed(4) || 'N/A'}</td>
                                <td className="text-right p-2 font-semibold">{formatCrashRisk(est.crashRisk)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

                {/* Model Overview */}
                <div className="mt-6 pt-6 border-t border-gray-200 col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Model Overview</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      This tool models <strong>negated conflict extremes</strong> using a Generalized Extreme Value (GEV) distribution 
                      with covariates. The model allows you to:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Specify any number of covariates that affect the location (μ) and scale (σ) parameters</li>
                      <li>Each covariate has coefficients β_μ (affecting location) and β_ζ (affecting scale)</li>
                      <li>The shape parameter ξ is fixed across all scenarios</li>
                      <li>Visualize crash risk, VaR, and CVaR for different parameter combinations</li>
                    </ul>
                    <p className="mt-3">
                      <strong>Note:</strong> This models block maxima of negated conflict extremes, which is appropriate for 
                      extreme value analysis of traffic safety data. Crash risk is calculated as P(X≥0), where X represents 
                      the negated conflict extreme.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showTutorial && (
        <button
          onClick={() => setShowTutorial(true)}
          className="mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          Show Tutorial
        </button>
      )}
    </div>
  );
}
