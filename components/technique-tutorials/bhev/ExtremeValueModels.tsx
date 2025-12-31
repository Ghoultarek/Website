'use client';

import { useState, useMemo, useRef, useEffect, ReactNode } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, ReferenceLine, ScatterChart, Scatter, Cell } from 'recharts';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { GEVParameters, Covariate, VaRLevel, BlockMaximaPoint, BlockMaximaData, GEVDataPoint, POTDataPoint } from './types';
import { calculateGEVParams, gevCDF, gevPDF, gevQuantile, gevRandom, calculateCrashRisk, calculateCVaR, calculateMeanExcess, calculateParameterStability, generateBacktestingData, calculateVaR, calculateKupiecTest, calculateChristoffersenTest, calculateDynamicQuantileTest } from './calculations';

export default function ExtremeValueModels() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [varLevel, setVarLevel] = useState<VaRLevel>(95);
  const [blockSize, setBlockSize] = useState(120); // seconds
  const [conflictDensity, setConflictDensity] = useState(5); // conflicts per minute
  const [potThreshold, setPotThreshold] = useState(-1.5); // Threshold for POT
  const [dataKey, setDataKey] = useState(0); // Key to force regeneration
  const [mounted, setMounted] = useState(false);
  
  // Backtesting state
  const [varLevelForBacktesting, setVarLevelForBacktesting] = useState<VaRLevel>(95);
  const [backtestingData, setBacktestingData] = useState<number[]>([]);
  const [backtestingDataKey, setBacktestingDataKey] = useState(0);
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

  // Ensure component is mounted before rendering random data to avoid hydration errors
  // Use a state that starts as false and only becomes true after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate backtesting data when parameters change or data key changes
  useEffect(() => {
    if (mounted) {
      const data = generateBacktestingData(mu, sigma, xi, 500);
      setBacktestingData(data);
    }
  }, [mu, sigma, xi, backtestingDataKey, mounted]);

  // Calculate backtesting test results
  const backtestingResults = useMemo(() => {
    if (backtestingData.length === 0) return null;
    
    const varThreshold = calculateVaR(varLevelForBacktesting, mu, sigma, xi);
    const violations = backtestingData.map(val => val >= varThreshold);
    const observedViolations = violations.filter(v => v).length;
    const expectedViolationRate = 1 - varLevelForBacktesting / 100;
    
    const kupiecResult = calculateKupiecTest(
      observedViolations,
      backtestingData.length,
      expectedViolationRate
    );
    
    const christoffersenResult = calculateChristoffersenTest(violations);
    
    // For dynamic quantile test, use lagged conflict values
    const laggedValues = backtestingData.slice(0, -1);
    const violationsForDQ = violations.slice(1);
    const dynamicQuantileResult = calculateDynamicQuantileTest(violationsForDQ, laggedValues);
    
    return {
      varThreshold,
      violations,
      kupiecResult,
      christoffersenResult,
      dynamicQuantileResult,
    };
  }, [backtestingData, varLevelForBacktesting, mu, sigma, xi]);

  useEffect(() => {
    if (previousCrashRiskRef.current !== null) {
      const delta = crashRisk - previousCrashRiskRef.current;
      setCrashRiskDelta(delta);
    }
    previousCrashRiskRef.current = crashRisk;
  }, [crashRisk]);

  // Calculate crash risk interpretation
  const crashRiskInterpretation = useMemo(() => {
    if (crashRisk <= 0) return null;
    const secondsPerHour = 60 * 60;
    const blocksPerHour = secondsPerHour / blockSize;
    const hoursPerYear = 8 * 365;
    const blocksPerYear = blocksPerHour * hoursPerYear;
    const crashesPerYear = crashRisk * blocksPerYear;
    return { blocksPerHour, blocksPerYear, crashesPerYear };
  }, [crashRisk, blockSize]);

  // Format crash risk with appropriate precision
  const formatCrashRisk = (risk: number): string => {
    if (risk <= 0) return '0.0000%';
    const percentRisk = risk * 100;
    if (percentRisk < 1e-4) {
      return percentRisk.toExponential(2) + '%';
    }
    if (percentRisk < 0.01) {
      return percentRisk.toFixed(6) + '%';
    }
    if (percentRisk < 0.1) {
      return percentRisk.toFixed(5) + '%';
    }
    return percentRisk.toFixed(4) + '%';
  };

  // Determine crash risk color/category
  const getCrashRiskColor = (risk: number) => {
    if (risk < 0.001) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' };
    if (risk < 0.01) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
  };

  const riskColors = getCrashRiskColor(crashRisk);

  // Calculate VaR (Value at Risk)
  const varValue = useMemo(() => {
    const p = varLevel / 100;
    return gevQuantile(p, mu, sigma, xi);
  }, [mu, sigma, xi, varLevel]);

  // Calculate CVaR (Conditional Value at Risk / Expected Shortfall)
  const cvarValue = useMemo(() => {
    return calculateCVaR(mu, sigma, xi, varLevel, varValue);
  }, [mu, sigma, xi, varLevel, varValue]);

  // Generate raw data for Block Maxima and POT
  // Only generate on client to avoid hydration errors
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rawProcessData = useMemo(() => {
    if (!mounted) return []; // Return empty array during SSR
    const genMu = -1.9;
    const genZeta = -0.3;
    const genSigma = Math.exp(genZeta);
    const genXi = -0.4;
    const totalDuration = 2400;
    const lambda = conflictDensity / 60;
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
  }, [conflictDensity, dataKey, mounted]);

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

  // Calculate MRL Data
  const mrlData = useMemo(() => {
    const values = rawProcessData.map(p => p.value);
    return calculateMeanExcess(values, -3, 0, 50);
  }, [rawProcessData]);

  // Calculate Stability Data
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

  // Prevent hydration errors by not rendering data-dependent content during SSR
  // Return the same static content during SSR and initial client render
  // Use suppressHydrationWarning on the root to prevent React from complaining about mismatches
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-[#171717] rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Extreme Value Models for Traffic Safety</h2>
          <p className="text-gray-700 dark:text-white mb-3">
            Traffic collisions are rare and random events. Traditional crash-based safety analysis is fundamentally reactive, we essentially 
            wait for crashes to occur, which means waiting for people to get hurt or die to collect meaningful data. This approach requires 
            years of crash history to identify problematic locations, and by the time patterns emerge, lives have already been lost.
          </p>
          <p className="text-gray-700 dark:text-white mb-3">
            Traffic conflicts, or near-miss events, offer a proactive alternative. These are situations where vehicles come dangerously 
            close to colliding but avoid impact, think of a vehicle that has to brake hard to avoid a collision, or two vehicles that 
            narrowly miss each other at an intersection. We can extract these events from traffic trajectory data collected from cameras, 
            connected vehicles, or other sensors, providing a rich dataset of safety-critical events without anyone getting hurt.
          </p>
          <p className="text-gray-700 dark:text-white mb-3">
            This tutorial introduces Extreme Value Theory (EVT), a statistical framework designed specifically for modeling rare, extreme 
            events. Since crashes represent the extreme tail of the conflict distribution, EVT provides the mathematical foundation to 
            extrapolate from frequent near-misses to rare crashes. We demonstrate how Generalized Extreme Value (GEV) and Generalized 
            Pareto (GPD) distributions can quantify crash risk from conflict data, enabling transportation agencies to identify high-risk 
            locations, evaluate safety countermeasures, and prioritize interventions before crashes occur.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-white">Loading interactive content...</p>
        </div>
      </div>
    );
  }

  // Main content - wrap in suppressHydrationWarning to prevent warnings from chart internals
  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Extreme Value Models for Traffic Safety</h2>
        <p className="text-gray-700 dark:text-white mb-3">
          Traffic collisions are rare and random events. Traditional crash-based safety analysis is fundamentally reactive, we essentially 
          wait for crashes to occur, which means waiting for people to get hurt or die to collect meaningful data. This approach requires 
          years of crash history to identify problematic locations, and by the time patterns emerge, lives have already been lost.
        </p>
        <p className="text-gray-700 dark:text-white mb-3">
          Traffic conflicts, or near-miss events, offer a proactive alternative. These are situations where vehicles come dangerously 
          close to colliding but avoid impact, think of a vehicle that has to brake hard to avoid a collision, or two vehicles that 
          narrowly miss each other at an intersection. We can extract these events from traffic trajectory data collected from cameras, 
          connected vehicles, or other sensors, providing a rich dataset of safety-critical events without anyone getting hurt.
        </p>
          <p className="text-gray-700 dark:text-white mb-3">
          This tutorial introduces Extreme Value Theory (EVT), a statistical framework designed specifically for modeling rare, extreme 
          events. Since crashes represent the extreme tail of the conflict distribution, EVT provides the mathematical foundation to 
          extrapolate from frequent near-misses to rare crashes. We demonstrate how Generalized Extreme Value (GEV) and Generalized 
          Pareto (GPD) distributions can quantify crash risk from conflict data, enabling transportation agencies to identify high-risk 
          locations, evaluate safety countermeasures, and prioritize interventions before crashes occur.
        </p>
      </div>

      {/* Tutorial Section */}
      {showTutorial && (
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-[#171717] rounded-lg border border-blue-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tutorial: Extreme Value Models</h3>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-white text-sm transition-colors"
            >
              Hide Tutorial
            </button>
          </div>

          {/* Tutorial Navigation Links */}
          <div className="mb-6 p-3 bg-white dark:bg-[#171717] rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-white mb-2">Quick Navigation:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <a href="#why-negated" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Why Negated Extremes</a>
              <a href="#data-generation" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Data Generation</a>
              <a href="#block-maxima" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Block Maxima</a>
              <a href="#pot" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Peak-Over-Threshold</a>
              <a href="#comparison" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Comparison</a>
              <a href="#interactive-model" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Interactive Model</a>
              <a href="#validating-evt" className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">Validating EVT</a>
            </div>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-white">
            
            {/* 1. Why Negated Extremes */}
            <div id="why-negated" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">1. Why Negated Extremes?</h4>
              <p>
                In traffic safety analysis, we often deal with conflict measures like Time-To-Collision (TTC). Small TTC values represent dangerous situations. 
                <strong> Importantly, a Time-To-Collision of 0 means a crash has occurred.</strong> Extreme Value Theory typically models maxima (largest values), not minima. To use standard GEV theory, we transform our data:
              </p>
              <p className="mt-2">
                We model <strong><InlineMath math="-\text{TTC}" /></strong> (negated Time-To-Collision) because:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>More negative values (large negative numbers) = more severe conflicts</li>
                <li>Crash occurs when <InlineMath math="-\text{TTC} \geq 0" /> (i.e., <InlineMath math="\text{TTC} \leq 0" />)</li>
                <li>This allows us to model the &quot;upper tail&quot; of extremes using standard GEV theory</li>
                <li>Crash risk = <InlineMath math="P(-\text{TTC} \geq 0) = P(\text{TTC} \leq 0)" /></li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-[#171717] rounded-lg border border-blue-200 dark:border-gray-700">
                <div className="text-sm text-blue-900 dark:text-white space-y-2">
                  <BlockMath math="\text{GEV}(\mu, \sigma, \xi) \text{ where:}" />
                  <BlockMath math="\mu = \mu_0 + \sum(\beta_\mu \times \text{covariate})" />
                  <BlockMath math="\sigma = \exp(\zeta_0 + \sum(\beta_\zeta \times \text{covariate}))" />
                  <BlockMath math="\xi = \text{fixed}" />
                </div>
              </div>
            </div>

            {/* 2. Data Generation */}
            <div id="data-generation" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">2. Data Generation</h4>
              <p className="mb-3">
                First, let&apos;s generate conflict data using a Poisson process with a specified conflict density. 
                This simulates realistic traffic conflict scenarios over time.
              </p>
              
              <div className="bg-white dark:bg-[#171717] rounded-lg p-4 mb-4">
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
                      className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Generate New Data
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-white mb-2">
                    <strong>Total conflicts generated: {mounted ? rawProcessData.length : '...'}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Block Maxima Approach */}
            <div id="block-maxima" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3. Block Maxima Approach</h4>
              <p className="mb-3">
                We divide our time series data into blocks (e.g., daily, weekly blocks) 
                and extract the maximum value from each block. These maxima follow a GEV distribution.
              </p>
              <p className="mb-3 text-sm text-gray-600">
                Note: These maxima are supposed to represent true extremes. At extremely low block sizes (e.g., 15 seconds), 
                these tend not to be extremes unless there is a massive amount of conflict data available.
              </p>
              
              <div className="bg-white dark:bg-[#171717] rounded-lg p-4 mb-4">
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
                {mounted ? (
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
                      {blockMaximaData.blockBoundaries.map((boundary, idx) => (
                        <ReferenceLine
                          key={idx}
                          x={boundary}
                          stroke="#94a3b8"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                        />
                      ))}
                      <Scatter
                        name="Conflict Data"
                        data={blockMaximaData.points.filter(p => !p.isMaxima)}
                        fill="#3b82f6"
                      >
                        {blockMaximaData.points.filter(p => !p.isMaxima).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" />
                        ))}
                      </Scatter>
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
                ) : (
                  <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                    <p className="text-gray-500">Loading chart data...</p>
                  </div>
                )}
                <p className="text-xs text-gray-600 dark:text-white mt-2">
                  Blue points show random conflict data. Red points show block maxima (most extreme values in each block). 
                  Vertical lines indicate block boundaries. <strong>Number of blocks: {mounted ? blockMaximaData.blockMaxima.length : '...'}</strong>
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                *Try reducing the block size to less than 60 seconds. Do you notice when &quot;Extremes&quot; stop being extreme?
              </p>
            </div>

            {/* 4. Peak-Over-Threshold (POT) Approach */}
            <div id="pot" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">4. Peak-Over-Threshold (POT) Approach</h4>
                <p className="mb-3">
                Instead of blocks, we can consider all events that exceed a certain high threshold <InlineMath math="u" />. These &quot;exceedances&quot; 
                are modeled using a Generalized Pareto Distribution (GPD). This often uses data more efficiently than Block Maxima.
              </p>
              <p className="mb-3 text-sm text-gray-600">
                Note: Threshold selection is somewhat arbitrary and requires careful consideration. The diagnostic plots below 
                help guide this selection.
              </p>

              <div className="bg-white dark:bg-[#171717] rounded-lg p-4 mb-4">
                <h5 className="font-semibold mb-3">Interactive Threshold Selection</h5>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">
                    Select Threshold (<InlineMath math="u" />): {potThreshold.toFixed(2)}
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

                {mounted ? (
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
                      <ReferenceLine y={potThreshold} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: `u = ${potThreshold.toFixed(2)}`, fill: '#ef4444' }} />
                      <Scatter name="Below Threshold" data={potData.filter(p => !p.isExceedance)} fill="#9ca3af" opacity={0.5} />
                      <Scatter name="Exceedances (Above u)" data={potData.filter(p => p.isExceedance)} fill="#ef4444" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                    <p className="text-gray-500">Loading chart data...</p>
                  </div>
                )}
                <p className="text-xs text-gray-600 dark:text-white mt-2">
                  Grey points are below the threshold. Red points are &quot;exceedances&quot; used to fit the GPD model. 
                  <strong> Number of exceedances: {mounted ? potData.filter(p => p.isExceedance).length : '...'}</strong>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Mean Residual Life Plot */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Mean Residual Life Plot</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Identify a valid threshold where the graph becomes linear (stable mean excess).
                  </p>
                  {mounted ? (
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
                        <Area type="monotone" dataKey="upperCI" stroke="none" fill="#bfdbfe" fillOpacity={0.5} />
                        <Area type="monotone" dataKey="lowerCI" stroke="none" fill="#fff" fillOpacity={1.0} />
                        <Line type="monotone" dataKey="meanExcess" stroke="#2563eb" dot={false} strokeWidth={2} />
                        <ReferenceLine 
                          x={potThreshold} 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-[250px] flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                      <p className="text-gray-500 text-sm">Loading chart data...</p>
                    </div>
                  )}
                </div>

                {/* Parameter Stability Plots */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-semibold mb-2 text-sm">Parameter Stability (Modified Scale)</h5>
                  <p className="text-xs text-gray-500 mb-3">
                    Check if parameters are constant above chosen threshold.
                  </p>
                  {mounted ? (
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
                        <ReferenceLine 
                          x={potThreshold} 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          strokeDasharray="5 5"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-[250px] flex items-center justify-center bg-gray-50 rounded border border-gray-200">
                      <p className="text-gray-500 text-sm">Loading chart data...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Block Maxima vs Peak-Over-Threshold */}
            <div id="comparison" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">5. Block Maxima vs Peak-Over-Threshold</h4>
              
              <div className="mb-4">
                <p className="mb-3">
                  Both Block Maxima and Peak-Over-Threshold are methods for modeling extreme events, but they approach the problem differently. 
                  Understanding their differences helps you choose the right method for your data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Block Maxima Column */}
                <div className="bg-blue-50 dark:bg-[#171717] rounded-lg p-4 border border-blue-200 dark:border-gray-700">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Block Maxima Approach</h5>
                  
                  <div className="space-y-3 text-sm text-gray-700 dark:text-white">
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">How it works:</p>
                      <p className="dark:text-white">Divide your continuous observation space (traffic conflict time series) into fixed time blocks (e.g., hourly, daily blocks) and take the maximum conflict value from each block.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">Distribution:</p>
                      <p className="dark:text-white">Block maxima follow a <strong>Generalized Extreme Value (GEV)</strong> distribution:</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-center mt-2">
                        <BlockMath math="F(x) = \exp\left\{-\left[1 + \xi\frac{x-\mu}{\sigma}\right]^{-1/\xi}\right\}" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-white mt-2">where <InlineMath math="\mu" /> is location, <InlineMath math="\sigma" /> is scale, <InlineMath math="\xi" /> is shape</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">Data usage:</p>
                      <p className="dark:text-white">Uses only one value per block (the maximum conflict), which can be inefficient if you have rich conflict data available.</p>
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
                <div className="bg-green-50 dark:bg-[#171717] rounded-lg p-4 border border-green-200 dark:border-gray-700">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Peak-Over-Threshold Approach</h5>
                  
                  <div className="space-y-3 text-sm text-gray-700 dark:text-white">
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">How it works:</p>
                      <p className="dark:text-white">Select all conflict values that exceed a high threshold u. Model both the occurrence rate of exceedances and their magnitudes.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">Distribution:</p>
                      <p className="dark:text-white">Exceedances follow a <strong>Generalized Pareto Distribution (GPD)</strong>:</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-center mt-2">
                        <BlockMath math="G(y) = 1 - \left[1 + \xi\frac{y}{\sigma}\right]^{-1/\xi}" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-white mt-2">where <InlineMath math="y = x - u" /> (excess over threshold), <InlineMath math="\sigma" /> is scale, <InlineMath math="\xi" /> is shape</p>
                      <p className="mt-2 text-xs dark:text-white">
                        <strong>Important:</strong> GPD requires modeling the occurrence process separately using a <strong>Poisson process</strong>, 
                        since POT only models the exceedances (how extreme the conflicts are), not when they occur.
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">Data usage:</p>
                      <p className="dark:text-white">Uses all conflict values above the threshold, making better use of available extreme conflict data.</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">Advantages:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 dark:text-white">
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
                    The shape parameter <InlineMath math="\xi" /> is the same in both distributions, which makes them particularly useful for comparative analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Interactive GEV Model Explorer */}
            <div id="interactive-model" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">6. Interactive GEV Model Explorer</h4>
              <p className="mb-3">
                Now that you understand how Block Maxima and POT work, explore how GEV parameters affect the distribution and crash risk. 
                Adjust the parameters below to see how they impact the shape of the distribution and the probability of crashes.
              </p>

              {/* Two column layout - Parameters on left, Visualizations on right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-4">
                {/* Parameter Controls - Left Column */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-4">Model Parameters</h5>
                    
                    <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <span><InlineMath math="\mu_0" /> (mu0): {parameters.mu0.toFixed(3)}</span>
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
                        <span><InlineMath math="\zeta_0" /> (zeta0): {parameters.zeta0.toFixed(3)}</span>
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
                        <span><InlineMath math="\xi" /> (xi, fixed): {parameters.xi.toFixed(3)}</span>
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

                    {/* Current Parameter Values */}
                    <div className="bg-blue-50 dark:bg-[#171717] rounded-lg p-4 border border-blue-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Current GEV Parameters</h4>
                      <div className="text-sm space-y-1">
                        <p><InlineMath math={`\mu = ${mu.toFixed(3)}`} /></p>
                        <p><InlineMath math={`\sigma = ${sigma.toFixed(3)}`} /></p>
                        <p><InlineMath math={`\\xi = ${xi.toFixed(3)}`} /></p>
                      </div>
                    </div>

                    </div>

                    {/* Hierarchical Model Explanation */}
                    <div className="pt-6 border-t border-gray-300 mt-6">
                      <div className="mb-4 p-4 bg-indigo-50 dark:bg-[#171717] rounded-lg border border-indigo-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 mb-3">Bayesian Hierarchical Model Structure</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p>
                          While the basic GEV distribution depends on three parameters (<InlineMath math="\mu" />, <InlineMath math="\sigma" />, <InlineMath math="\xi" />), these alone cannot capture 
                          the variability in traffic conditions or the relationships between explanatory variables. To address 
                          this, we use a <strong>Bayesian hierarchical model</strong> that incorporates covariates—factors that 
                          influence conflict severity—through linear relationships in the location and scale parameters.
                        </p>
                        <p>
                          The hierarchical structure allows the GEV parameters to vary based on traffic conditions:
                        </p>
                        <div className="bg-gray-50 border border-indigo-300 rounded-lg p-4 mt-3 space-y-3">
                          <div className="flex justify-center">
                            <BlockMath math="\mu = \mu_0 + \sum(\beta_\mu \times \text{covariate})" />
                          </div>
                          <div className="flex justify-center">
                            <BlockMath math="\zeta = \zeta_0 + \sum(\beta_\zeta \times \text{covariate})" />
                          </div>
                          <div className="flex justify-center">
                            <BlockMath math="\sigma = \exp(\zeta)" />
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          where <InlineMath math="\zeta" /> is the log-scale parameter (ensuring <InlineMath math="\sigma" /> remains positive), <InlineMath math="\mu_0" /> and 
                          <InlineMath math="\zeta_0" /> are baseline parameters, and <InlineMath math="\beta_\mu" /> and <InlineMath math="\beta_\zeta" /> are 
                          coefficients that quantify how each covariate affects location and scale, respectively. The shape parameter 
                          <InlineMath math="\xi" /> is typically held constant across scenarios.
                        </p>
                      </div>
                    </div>
                    </div>

                    {/* Covariates Section */}
                    <div className="pt-6 border-t border-gray-300 mt-6">
                      <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Covariates</h3>
                      <button
                        onClick={addCovariate}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
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
                                <span><InlineMath math="\beta_\mu" /> (betaMu): {cov.betaMu.toFixed(3)}</span>
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
                                <span><InlineMath math="\beta_\zeta" /> (betaZeta): {cov.betaZeta.toFixed(3)}</span>
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
                  </div>
                </div>

                {/* Visualizations - Right Column */}
                <div className="space-y-6">
                  {/* Prominent Crash Risk Display */}
                  <div className={`p-5 rounded-lg border-2 ${riskColors.bg} ${riskColors.border} transition-all duration-300`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Crash Risk Measurement</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          The probability that one block contains a crash: <InlineMath math="P(X \geq 0) = P(\text{TTC} \leq 0)" />. Using block size (from above), extrapolated to crashes per year assuming 8 hrs/day (peak conditions), 365 days/year.
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
                          <p className="text-xs text-gray-600 dark:text-white mt-2">
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
                      GEV PDF with Crash Risk (<InlineMath math="P(X > 0)" /> shaded)
                    </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={gevData}>
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
                      <Legend />
                      {crashRiskData.length > 0 && (
                        <Area 
                          type="monotone" 
                          dataKey="pdf" 
                          stroke="none"
                          fill="url(#crashRiskGradient)"
                          name="P(X > 0) - Crash Risk"
                          data={crashRiskData}
                          isAnimationActive={false}
                        />
                      )}
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
                        name="TTC=0 (Crash)"
                      />
                      <ReferenceLine 
                        x={0}
                        stroke="none"
                        label={{ value: 'x=0 (Crash)', position: 'top', fill: '#ef4444', fontSize: 12 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">
                      Red shaded area (<InlineMath math="x > 0" />) represents crash risk: <InlineMath math={`P(X > 0) = ${formatCrashRisk(crashRisk)}`} />
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">GEV PDF with VaR Levels</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={gevData}>
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
                      <Legend />
                      {crashRiskData.length > 0 && (
                        <Area 
                          type="monotone" 
                          dataKey="pdf" 
                          stroke="none"
                          fill="url(#crashRiskGradient2)"
                          name="P(X > 0) - Crash Risk"
                          data={crashRiskData}
                          isAnimationActive={false}
                        />
                      )}
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
              </div>
            </div>

            {/* 7. Validating EVT Models */}
            <div id="validating-evt" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">7. Validating EVT Models</h4>
              
              <p className="mb-4">
                After fitting an EVT model, it&apos;s crucial to validate its performance. Model validation involves two main aspects: 
                comparing different model specifications and backtesting the model&apos;s ability to accurately predict extreme events. 
                This section covers information criteria for model comparison and statistical tests for backtesting.
              </p>

              {/* Model Comparison Subsection */}
              <div className="mb-6">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Model Comparison: WAIC and DIC</h5>
                
                <p className="mb-3">
                  When comparing different EVT model specifications (e.g., models with different covariates, block sizes, or threshold 
                  values), information criteria provide a principled way to balance model fit and complexity. Two commonly used criteria 
                  in Bayesian EVT modeling are:
                </p>

                <div className="bg-gray-50 dark:bg-[#0D0D0D] rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Widely Applicable Information Criterion (WAIC)</h6>
                  <p className="text-sm mb-2">
                    WAIC is a fully Bayesian information criterion that estimates out-of-sample predictive accuracy. It is computed as:
                  </p>
                  <div className="mb-2">
                    <BlockMath math="\text{WAIC} = -2 \left( \sum_{i=1}^{n} \log \text{Pr}(y_i | \theta) - \sum_{i=1}^{n} \text{Var}_{\text{post}}(\log \text{Pr}(y_i | \theta)) \right)" />
                  </div>
                  <p className="text-sm mb-2">
                    where the first term is the log pointwise predictive density and the second term penalizes for model complexity 
                    (effective number of parameters). <strong>Lower WAIC values indicate better predictive performance.</strong>
                  </p>
                  <p className="text-sm">
                    WAIC is particularly useful for comparing models with different numbers of parameters or different structures, 
                    as it automatically accounts for parameter uncertainty through the posterior distribution.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#0D0D0D] rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Deviance Information Criterion (DIC)</h6>
                  <p className="text-sm mb-2">
                    DIC is a Bayesian generalization of AIC that uses the posterior mean deviance and an estimate of the effective 
                    number of parameters:
                  </p>
                  <div className="mb-2">
                    <BlockMath math="\text{DIC} = D(\bar{\theta}) + 2p_D" />
                  </div>
                  <p className="text-sm mb-2">
                    where <InlineMath math="D(\bar{\theta})" /> is the deviance evaluated at the posterior mean of parameters 
                    <InlineMath math="\bar{\theta}" />, and <InlineMath math="p_D" /> is the effective number of parameters, 
                    estimated as <InlineMath math="p_D = \bar{D} - D(\bar{\theta})" /> where <InlineMath math="\bar{D}" /> is 
                    the mean deviance over the posterior distribution.
                  </p>
                  <p className="text-sm">
                    <strong>Lower DIC values indicate better models.</strong> DIC is computationally simpler than WAIC but can be 
                    less reliable when the posterior distribution is non-normal or when comparing models with different likelihood 
                    structures. In practice, WAIC is generally preferred for model comparison in Bayesian EVT applications.
                  </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When comparing GEV models, these criteria help select between models with different covariate specifications, 
                  different block sizes (for Block Maxima), or different threshold values (for Peak-Over-Threshold). A model with 
                  significantly lower WAIC or DIC (typically a difference of 5-10 points) is considered substantially better.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backtesting EVT Models Block */}
      <div className="mt-8 bg-white dark:bg-[#171717] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Backtesting EVT Models</h4>
        
        <p className="mb-4 text-gray-700 dark:text-white">
          Backtesting evaluates whether a model&apos;s risk predictions (e.g., VaR estimates) are accurate in practice. 
          For EVT models, we test whether the observed violation rate matches the expected rate and whether violations occur 
          independently over time. Three key tests are commonly used:
        </p>

                {/* Kupiec Test */}
                <div className="bg-white dark:bg-[#171717] rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Kupiec Test (Unconditional Coverage)</h6>
                  <p className="text-sm mb-3">
                    The Kupiec test (also known as the proportion of failures test) checks whether the actual violation rate matches 
                    the expected rate. For a VaR model at confidence level <InlineMath math="\alpha" />, we expect violations 
                    (observations exceeding VaR) to occur with probability <InlineMath math="1-\alpha" />.
                  </p>
                  <p className="text-sm mb-3">
                    The test uses a likelihood ratio statistic that compares the null hypothesis (violation rate equals expected rate) 
                    against the alternative (violation rate differs from expected rate). Under the null, the test statistic follows a 
                    chi-square distribution with 1 degree of freedom.
                  </p>
                  
                  {backtestingResults && (
                    <div className="mt-4">
                      <div className="mb-3">
                        <label className="block text-sm text-gray-700 dark:text-white mb-1">VaR Confidence Level:</label>
                        <select
                          value={varLevelForBacktesting}
                          onChange={(e) => setVarLevelForBacktesting(parseInt(e.target.value) as VaRLevel)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-[#0D0D0D] text-gray-900 dark:text-white"
                        >
                          <option value={90}>90%</option>
                          <option value={95}>95%</option>
                          <option value={99}>99%</option>
                        </select>
                        <button
                          onClick={() => setBacktestingDataKey(prev => prev + 1)}
                          className="ml-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Regenerate Data
                        </button>
                      </div>

                      {/* Violation Timeline Chart */}
                      {mounted && (
                        <div className="mb-4">
                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={backtestingData.map((val, idx) => ({
                              time: idx,
                              value: val,
                              violationValue: val >= backtestingResults.varThreshold ? val : null,
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="time"
                                label={{ value: 'Observation', position: 'insideBottom', offset: -5 }}
                                stroke="#6b7280"
                              />
                              <YAxis 
                                label={{ value: 'Conflict Value (-TTC)', angle: -90, position: 'insideLeft' }}
                                stroke="#6b7280"
                              />
                              <Tooltip />
                              <Legend />
                              <ReferenceLine 
                                y={backtestingResults.varThreshold} 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{ value: `VaR ${varLevelForBacktesting}%`, position: 'right' }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#3b82f6" 
                                strokeWidth={1}
                                dot={false}
                                name="Conflict Values"
                              />
                              <Scatter
                                dataKey="violationValue"
                                fill="#ef4444"
                                name="Violations"
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                          <p className="text-xs text-gray-600 dark:text-white mt-2">
                            Blue line shows conflict values over time. Red dashed line is VaR threshold. Red dots indicate violations 
                            (observations exceeding VaR).
                          </p>
                        </div>
                      )}

                      {/* Test Results */}
                      <div className="bg-gray-50 dark:bg-[#0D0D0D] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Test Results</h6>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Expected Violation Rate:</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {(backtestingResults.kupiecResult.expectedRate * 100).toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Observed Violation Rate:</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {(backtestingResults.kupiecResult.observedRate * 100).toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Test Statistic:</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {backtestingResults.kupiecResult.testStatistic.toFixed(4)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">P-value:</p>
                            <p className={`font-semibold ${
                              backtestingResults.kupiecResult.pValue < 0.05 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {backtestingResults.kupiecResult.pValue.toFixed(4)}
                              {backtestingResults.kupiecResult.pValue < 0.05 ? ' (Reject)' : ' (Fail to Reject)'}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                          The test fails to reject the null hypothesis (model is adequate) if p-value &gt; 0.05. A low p-value 
                          indicates that the observed violation rate significantly differs from the expected rate.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Christoffersen Test */}
                <div className="bg-white dark:bg-[#171717] rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Christoffersen Test (Conditional Coverage)</h6>
                  <p className="text-sm mb-3">
                    The Christoffersen test extends the Kupiec test by also testing whether violations are independent over time. 
                    A good risk model should have violations that occur independently—clustering of violations suggests the model 
                    fails to capture temporal dependencies in risk.
                  </p>
                  <p className="text-sm mb-3">
                    The test consists of three components:
                  </p>
                  <ul className="list-disc list-inside ml-4 mb-3 text-sm space-y-1">
                    <li><strong>Unconditional Coverage:</strong> Tests whether violation rate matches expected rate (same as Kupiec test)</li>
                    <li><strong>Independence:</strong> Tests whether violations are independent (no clustering)</li>
                    <li><strong>Conditional Coverage:</strong> Joint test of both unconditional coverage and independence</li>
                  </ul>

                  {backtestingResults && (
                    <div className="mt-4">
                      {/* Violation Sequence Visualization */}
                      {mounted && (
                        <div className="mb-4">
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={backtestingResults.violations.map((v, idx) => ({
                              time: idx,
                              violation: v ? 1 : 0,
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="time"
                                label={{ value: 'Observation', position: 'insideBottom', offset: -5 }}
                                stroke="#6b7280"
                              />
                              <YAxis 
                                domain={[0, 1]}
                                tickFormatter={(val) => val === 1 ? 'Violation' : 'No Violation'}
                                stroke="#6b7280"
                              />
                              <Tooltip 
                                formatter={(value: number) => value === 1 ? 'Violation' : 'No Violation'}
                              />
                              <Line 
                                type="stepAfter" 
                                dataKey="violation" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                dot={false}
                                name="Violation Indicator"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          <p className="text-xs text-gray-600 dark:text-white mt-2">
                            Violation sequence over time. Clustered violations (multiple consecutive violations) indicate 
                            potential model inadequacy.
                          </p>
                        </div>
                      )}

                      {/* Test Results */}
                      <div className="bg-gray-50 dark:bg-[#0D0D0D] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-white mb-3">Test Results</h6>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Unconditional Coverage:</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Test Statistic:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {backtestingResults.christoffersenResult.unconditionalCoverage.testStatistic.toFixed(4)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">P-value:</p>
                                <p className={`font-semibold ${
                                  backtestingResults.christoffersenResult.unconditionalCoverage.pValue < 0.05 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {backtestingResults.christoffersenResult.unconditionalCoverage.pValue.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Independence:</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Test Statistic:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {backtestingResults.christoffersenResult.independence.testStatistic.toFixed(4)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">P-value:</p>
                                <p className={`font-semibold ${
                                  backtestingResults.christoffersenResult.independence.pValue < 0.05 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {backtestingResults.christoffersenResult.independence.pValue.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Conditional Coverage:</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Test Statistic:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {backtestingResults.christoffersenResult.conditionalCoverage.testStatistic.toFixed(4)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">P-value:</p>
                                <p className={`font-semibold ${
                                  backtestingResults.christoffersenResult.conditionalCoverage.pValue < 0.05 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {backtestingResults.christoffersenResult.conditionalCoverage.pValue.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                          The conditional coverage test is the most comprehensive—it tests both that violations occur at the 
                          correct rate and that they are independent. A model passes if all three tests have p-values &gt; 0.05.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Quantile Test */}
                <div className="bg-white dark:bg-[#171717] rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-2">Dynamic Quantile Test</h6>
                  <p className="text-sm mb-3">
                    The dynamic quantile test (also known as the Engle-Manganelli test) uses regression analysis to test whether 
                    violations are independent of past information. It regresses violation indicators on lagged values and tests 
                    whether the regression coefficients are significantly different from zero.
                  </p>
                  <p className="text-sm mb-3">
                    The test is based on the regression: <InlineMath math="I_t = \alpha + \beta X_{t-1} + \epsilon_t" /> where 
                    <InlineMath math="I_t" /> is the violation indicator at time <InlineMath math="t" /> and 
                    <InlineMath math="X_{t-1}" /> represents lagged information. Under the null hypothesis of correct model 
                    specification, both <InlineMath math="\alpha" /> and <InlineMath math="\beta" /> should be zero.
                  </p>

                  {backtestingResults && (
                    <div className="mt-4">
                      {/* Regression Visualization */}
                      {mounted && backtestingData.length > 1 && (() => {
                        const scatterData = backtestingData.slice(0, -1).map((lagVal, idx) => ({
                          laggedValue: lagVal,
                          violation: backtestingResults.violations[idx + 1] ? 1 : 0,
                          predicted: backtestingResults.dynamicQuantileResult.regressionCoefficients.intercept + 
                                    backtestingResults.dynamicQuantileResult.regressionCoefficients.slope * lagVal,
                        }));
                        const minLag = Math.min(...scatterData.map(d => d.laggedValue));
                        const maxLag = Math.max(...scatterData.map(d => d.laggedValue));
                        const regressionLineData = [
                          { laggedValue: minLag, predicted: backtestingResults.dynamicQuantileResult.regressionCoefficients.intercept + 
                            backtestingResults.dynamicQuantileResult.regressionCoefficients.slope * minLag },
                          { laggedValue: maxLag, predicted: backtestingResults.dynamicQuantileResult.regressionCoefficients.intercept + 
                            backtestingResults.dynamicQuantileResult.regressionCoefficients.slope * maxLag },
                        ];
                        
                        return (
                          <div className="mb-4">
                            <ResponsiveContainer width="100%" height={300}>
                              <ComposedChart data={scatterData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="laggedValue"
                                  label={{ value: 'Lagged Conflict Value', position: 'insideBottom', offset: -5 }}
                                  stroke="#6b7280"
                                />
                                <YAxis 
                                  domain={[0, 1]}
                                  tickFormatter={(val) => val === 1 ? 'Violation' : 'No Violation'}
                                  label={{ value: 'Violation Indicator', angle: -90, position: 'insideLeft' }}
                                  stroke="#6b7280"
                                />
                                <Tooltip />
                                <Legend />
                                <Scatter
                                  name="Violations"
                                  data={scatterData.filter(d => d.violation === 1)}
                                  fill="#ef4444"
                                />
                                <Scatter
                                  name="No Violations"
                                  data={scatterData.filter(d => d.violation === 0)}
                                  fill="#3b82f6"
                                />
                                <Line
                                  type="linear"
                                  data={regressionLineData}
                                  dataKey="predicted"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={false}
                                  name="Regression Line"
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-gray-600 dark:text-white mt-2">
                              Scatter plot showing relationship between lagged conflict values and violation indicators. 
                              Green dashed line shows the regression fit. If violations are independent, the regression line should be flat.
                            </p>
                          </div>
                        );
                      })()}

                      {/* Test Results */}
                      <div className="bg-gray-50 dark:bg-[#0D0D0D] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-white mb-3">Test Results</h6>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Regression Coefficients:</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Intercept (α):</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {backtestingResults.dynamicQuantileResult.regressionCoefficients.intercept.toFixed(4)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Slope (β):</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {backtestingResults.dynamicQuantileResult.regressionCoefficients.slope.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Test Statistics:</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">F-statistic:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {backtestingResults.dynamicQuantileResult.testStatistic.toFixed(4)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">P-value:</p>
                                <p className={`font-semibold ${
                                  backtestingResults.dynamicQuantileResult.pValue < 0.05 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {backtestingResults.dynamicQuantileResult.pValue.toFixed(4)}
                                  {backtestingResults.dynamicQuantileResult.pValue < 0.05 ? ' (Reject)' : ' (Fail to Reject)'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">R²:</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {backtestingResults.dynamicQuantileResult.rSquared.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                          A significant test (p-value &lt; 0.05) indicates that violations are not independent of past information, 
                          suggesting the model fails to capture temporal dependencies in risk. A good model should have coefficients 
                          close to zero and a non-significant test result.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
      </div>

      {/* Advanced Extensions Block */}
      <div className="mt-8 bg-white dark:bg-[#171717] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Advanced Extensions in Traffic Conflict Modeling</h4>
        <p className="text-gray-700 dark:text-white mb-4">
          This tutorial covered the fundamentals of using Generalized Extreme Value (GEV) and Generalized Pareto (GPD) distributions 
          for modeling traffic conflicts. In practice, transportation safety researchers have extended these basic models to capture 
          the complex, multi-dimensional nature of traffic safety. Several important modifications and extensions have been developed:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-white space-y-2 ml-4">
          <li><strong>Site-Specific Parameters:</strong> Hierarchical models that allow location-specific parameters (μ, σ, ξ) to vary across 
          different sites or intersections, accounting for unobserved heterogeneity between locations while sharing information across sites 
          through partial pooling.</li>
          <li><strong>Spatial Parameters:</strong> Models that incorporate spatial correlation between nearby locations, recognizing that crash 
          risk at one intersection may be related to risk at adjacent intersections due to shared traffic patterns, road geometry, or 
          environmental factors.</li>
          <li><strong>Temporal Parameters:</strong> Time-varying models that account for temporal trends, seasonality, and time-of-day effects, 
          allowing parameters to change over time to capture evolving traffic conditions, infrastructure changes, or policy interventions.</li>
          <li><strong>Bivariate Models:</strong> Extensions that simultaneously model multiple conflict indicators (e.g., Time-To-Collision 
          and Post-Encroachment Time) to provide a more comprehensive assessment of crash risk by capturing different aspects of conflict severity.</li>
          <li><strong>Gaussian Copulas:</strong> Flexible dependency structures that model the relationship between multiple conflict measures 
          or between conflicts at different locations, allowing for complex correlation patterns beyond simple linear relationships.</li>
        </ul>
        <p className="text-gray-700 dark:text-white mt-4">
          These advanced modeling approaches enable transportation agencies to conduct more sophisticated safety analyses, accounting for 
          spatial and temporal dependencies, site-specific characteristics, and multivariate relationships in conflict data. They form the 
          foundation for proactive safety management systems that can identify high-risk locations, evaluate countermeasures, and prioritize 
          interventions across entire transportation networks.
        </p>
      </div>

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

