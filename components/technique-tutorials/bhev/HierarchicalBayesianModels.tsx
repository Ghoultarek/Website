'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine, ScatterChart, Scatter, BarChart, Bar, Cell } from 'recharts';
import { MultiSiteData, SiteEstimate, PoolingType, RandomInterceptModel, RandomSlopeModel } from './types';
import { calculateCrashRisk, generateMultiSiteData, calculateNoPooling, calculatePartialPooling, calculateRandomInterceptModel, calculateRandomSlopeModel, gevPDF } from './calculations';

export default function HierarchicalBayesianModels() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [numSites, setNumSites] = useState(6);
  const [conflictDensity, setConflictDensity] = useState(5);
  const [multiSiteDataKey, setMultiSiteDataKey] = useState(0);
  const [poolingType, setPoolingType] = useState<PoolingType>('partial');
  const [populationMu0, setPopulationMu0] = useState(-3.3);
  const [populationZeta0, setPopulationZeta0] = useState(0.2);
  const [tauMu0, setTauMu0] = useState(0.3);
  const [tauZeta0, setTauZeta0] = useState(0.15);
  const [populationBetaMu, setPopulationBetaMu] = useState(0.04);
  const [tauBetaMu, setTauBetaMu] = useState(0.05);

  // Format crash risk
  const formatCrashRisk = (risk: number): string => {
    if (risk <= 0) return '0.0000%';
    const percentRisk = risk * 100;
    if (percentRisk < 1e-4) return percentRisk.toExponential(2) + '%';
    if (percentRisk < 0.01) return percentRisk.toFixed(6) + '%';
    if (percentRisk < 0.1) return percentRisk.toFixed(5) + '%';
    return percentRisk.toFixed(4) + '%';
  };

  // Generate multi-site data
  const currentMultiSiteData = useMemo(() => {
    return generateMultiSiteData(numSites, conflictDensity, 2400);
  }, [numSites, conflictDensity, multiSiteDataKey]);

  // Calculate no pooling estimates
  const noPoolingEstimates = useMemo(() => {
    if (!currentMultiSiteData) return [];
    return calculateNoPooling(currentMultiSiteData, 120);
  }, [currentMultiSiteData]);

  // Calculate partial pooling estimates
  const partialPoolingResult = useMemo(() => {
    if (!currentMultiSiteData) return null;
    return calculatePartialPooling(currentMultiSiteData, 120);
  }, [currentMultiSiteData]);

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
      -0.02,
      tauBetaMu,
      0.03
    );
  }, [currentMultiSiteData, populationBetaMu, tauBetaMu]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 animate-fade-in">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hierarchical Bayesian Models for Multi-Site Analysis</h2>
        <p className="text-gray-700 mb-3">
          Real-world traffic safety analyses often involve multiple sites (intersections, road segments) with varying characteristics. 
          This tutorial introduces hierarchical Bayesian models that allow parameters to vary across sites while sharing information 
          through population-level structure.
        </p>
      </div>

      {/* Tutorial Section */}
      {showTutorial && (
        <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">Tutorial: Hierarchical Bayesian Models</h3>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Hide Tutorial
            </button>
          </div>

          {/* Tutorial Navigation */}
          <div className="mb-6 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Quick Navigation:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <a href="#multisite-data" className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">Multi-Site Data</a>
              <a href="#random-intercepts" className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">Random Intercepts</a>
              <a href="#partial-pooling" className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">Partial Pooling</a>
              <a href="#random-slopes" className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">Random Slopes</a>
            </div>
          </div>

          <div className="space-y-8 text-gray-700">
            
            {/* Multi-Site Data Generation */}
            <div id="multisite-data" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">1. Multi-Site Data Generation</h4>
              
              <p className="mb-3">
                In practice, traffic safety analyses involve multiple sites with different baseline risk levels. Each site may have 
                different characteristics (urban vs. rural, high vs. low traffic volumes) that affect conflict severity.
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
                      onClick={() => setMultiSiteDataKey(prev => prev + 1)}
                      className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
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
                      {currentMultiSiteData.sites.map((site) => {
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

            {/* Random Intercept Models */}
            <div id="random-intercepts" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">2. Random Intercept Models</h4>
              
              <p className="mb-3">
                A <strong>random intercept model</strong> allows baseline parameters (μ₀, ζ₀) to vary across sites. Each site has its 
                own intercept drawn from a population distribution, capturing inherent site-level differences in baseline risk.
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-sm mb-2">
                  <strong>Mathematical Structure:</strong>
                </p>
                <div className="bg-white rounded p-3 font-mono text-xs mt-2 space-y-1">
                  <p>μ₀ᵢ ~ N(μ₀_pop, τ²_μ₀)</p>
                  <p>ζ₀ᵢ ~ N(ζ₀_pop, τ²_ζ₀)</p>
                  <p>where i indexes sites, μ₀_pop and ζ₀_pop are population means, τ² quantifies between-site variation</p>
                </div>
                <p className="text-sm mt-2">
                  <strong>Interpretation:</strong> Some sites are inherently riskier than others (different baseline μ₀), and some sites 
                  have more variable conflict severity (different baseline ζ₀). The hierarchical structure assumes these differences come 
                  from a common population distribution.
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
                      <p className="text-xs text-gray-600 mt-1">Average baseline location parameter across all sites</p>
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
                      <p className="text-xs text-gray-600 mt-1">Higher = more variation between sites</p>
                    </div>
                  </div>

                  {/* Visualizing the Population Distribution */}
                  <div className="mb-6">
                    <h6 className="font-semibold mb-2">Understanding Random Intercepts: Population Distribution</h6>
                    <p className="text-sm text-gray-600 mb-3">
                      Site-specific intercepts are drawn from a population distribution. The plot below shows the theoretical population 
                      distribution of μ₀ values (normal distribution) and where each site&apos;s intercept falls.
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number"
                          domain={[populationMu0 - 3 * tauMu0, populationMu0 + 3 * tauMu0]}
                          label={{ value: 'Site-Specific μ₀ Values', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis label={{ value: 'Density', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        {/* Population distribution curve */}
                        {(() => {
                          const distData: Array<{ x: number; density: number }> = [];
                          const minX = populationMu0 - 3 * tauMu0;
                          const maxX = populationMu0 + 3 * tauMu0;
                          for (let x = minX; x <= maxX; x += 0.05) {
                            const z = (x - populationMu0) / tauMu0;
                            const density = Math.exp(-0.5 * z * z) / (tauMu0 * Math.sqrt(2 * Math.PI));
                            distData.push({ x, density });
                          }
                          return (
                            <Line
                              type="monotone"
                              dataKey="density"
                              data={distData}
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={false}
                              name="Population Distribution"
                            />
                          );
                        })()}
                        {/* Site-specific intercepts as vertical lines */}
                        {randomInterceptModel.siteEstimates.map((est) => {
                          const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                          if (!site) return null;
                          const color = site.type === 'urban' ? '#ef4444' : site.type === 'suburban' ? '#f59e0b' : '#10b981';
                          return (
                            <ReferenceLine
                              key={est.siteId}
                              x={est.mu0}
                              stroke={color}
                              strokeWidth={2}
                              strokeDasharray="2 2"
                              label={{ value: site.name.split(' ')[0], position: 'top', fontSize: 10, fill: color }}
                            />
                          );
                        })}
                        <ReferenceLine x={populationMu0} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" label={{ value: 'Population Mean', position: 'top' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">
                      The blue curve shows the theoretical population distribution N(μ₀_pop, τ²_μ₀). Vertical lines show each site&apos;s 
                      actual intercept. When τ_μ₀ is large, sites spread out more from the population mean.
                    </p>
                  </div>

                  {/* Site-specific distributions */}
                  <div className="mb-4">
                    <h6 className="font-semibold mb-2">Site-Specific GEV Distributions</h6>
                    <p className="text-sm text-gray-600 mb-3">
                      Each site&apos;s intercept determines its GEV distribution. Below, we see how the different μ₀ values translate 
                      into different risk profiles.
                    </p>
                    <ResponsiveContainer width="100%" height={400}>
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
                        {randomInterceptModel.siteEstimates.slice(0, 6).map((est) => {
                          const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                          if (!site) return null;
                          const color = site.type === 'urban' ? '#ef4444' : site.type === 'suburban' ? '#f59e0b' : '#10b981';
                          const pdfData: Array<{ x: number; pdf: number }> = [];
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
                              strokeWidth={2}
                              dot={false}
                              name={site.name}
                            />
                          );
                        })}
                        <ReferenceLine x={0} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Crash (x=0)', position: 'top' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">
                      Each line represents one site&apos;s GEV distribution. Distributions shift based on each site&apos;s μ₀ value. 
                      Sites with μ₀ closer to zero (shifted right) have higher crash risk because more probability mass lies above x=0.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h6 className="font-semibold mb-2">Site-Specific Estimates</h6>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Site</th>
                            <th className="text-right p-2">Type</th>
                            <th className="text-right p-2">Sample Size</th>
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
                                <td className="text-right p-2">{site?.type}</td>
                                <td className="text-right p-2">{site?.sampleSize}</td>
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

            {/* Partial Pooling */}
            <div id="partial-pooling" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">3. Partial Pooling vs No Pooling</h4>
              
              <p className="mb-3">
                When analyzing multi-site data, we can estimate each site independently (<strong>no pooling</strong>) or use 
                a hierarchical model that shares information across sites (<strong>partial pooling</strong>). Partial pooling 
                is particularly valuable when some sites have limited data.
              </p>

              <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                <h5 className="font-semibold text-gray-900 mb-2">Why Partial Pooling Matters</h5>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>No Pooling Problem:</strong> Sites with little data produce unreliable estimates. A site with 10 conflicts 
                    might get an extreme μ₀ estimate that&apos;s unrealistic.
                  </p>
                  <p>
                    <strong>Partial Pooling Solution:</strong> Site estimates &quot;shrink&quot; toward the population mean. The amount of 
                    shrinkage depends on sample size:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>High data sites → estimates close to their own data</li>
                    <li>Low data sites → estimates pulled toward population mean</li>
                    <li>Result: More realistic and stable estimates for all sites</li>
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
                      <h6 className="font-semibold mb-2">No Pooling: Site Estimates (Independent)</h6>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={noPoolingEstimates.map(e => {
                          const site = currentMultiSiteData.sites.find(s => s.id === e.siteId);
                          return {
                            site: site?.name || e.siteId,
                            mu0: e.mu0,
                            sampleSize: site?.sampleSize || 0,
                          };
                        })}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="site" angle={-45} textAnchor="end" height={80} />
                          <YAxis label={{ value: 'μ₀ Estimate', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Bar dataKey="mu0" fill="#ef4444">
                            {noPoolingEstimates.map((est, idx) => {
                              const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                              const isLowData = (site?.sampleSize || 0) < 100;
                              return <Cell key={idx} fill={isLowData ? '#dc2626' : '#ef4444'} />;
                            })}
                          </Bar>
                          <ReferenceLine y={populationMu0} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Population Mean', position: 'right' }} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Problem:</strong> Sites with low sample sizes (dark red) show extreme estimates. Without pooling, 
                        these estimates can be unrealistic and unstable.
                      </p>
                    </div>
                  )}

                  {poolingType === 'partial' && partialPoolingResult && noPoolingEstimates.length > 0 && (
                    <div>
                      <h6 className="font-semibold mb-2">Partial Pooling: Site Estimates with 95% Credible Intervals</h6>
                      <div className="mb-3 text-sm bg-blue-50 p-2 rounded">
                        <strong>Population parameters:</strong> μ₀_pop = {partialPoolingResult.model.populationMu0.toFixed(3)}, 
                        τ_μ₀ = {partialPoolingResult.model.tauMu0.toFixed(3)}
                      </div>
                      
                      {/* Comparison Scatter Plot: No Pooling vs Partial Pooling */}
                      <div className="mb-4">
                        <h6 className="font-semibold mb-2 text-sm">Visualizing Shrinkage: No Pooling vs Partial Pooling</h6>
                        <p className="text-sm text-gray-600 mb-2">
                          This scatter plot compares estimates from both approaches. Points on the diagonal would mean no difference. 
                          Notice how low-data sites (larger markers) move toward the population mean under partial pooling.
                        </p>
                        <ResponsiveContainer width="100%" height={350}>
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              type="number"
                              dataKey="noPool"
                              label={{ value: 'No Pooling Estimate', position: 'insideBottom', offset: -5 }}
                              domain={['auto', 'auto']}
                            />
                            <YAxis 
                              type="number"
                              dataKey="partialPool"
                              label={{ value: 'Partial Pooling Estimate', angle: -90, position: 'insideLeft' }}
                              domain={['auto', 'auto']}
                            />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine 
                              y={partialPoolingResult.model.populationMu0} 
                              stroke="#dc2626" 
                              strokeDasharray="3 3" 
                              label={{ value: 'Population Mean', position: 'right' }} 
                            />
                            <ReferenceLine 
                              x={partialPoolingResult.model.populationMu0} 
                              stroke="#dc2626" 
                              strokeDasharray="3 3" 
                            />
                            <Scatter
                              name="Site Estimates"
                              data={noPoolingEstimates.map(noPool => {
                                const partial = partialPoolingResult.estimates.find(p => p.siteId === noPool.siteId);
                                const site = currentMultiSiteData.sites.find(s => s.id === noPool.siteId);
                                return {
                                  noPool: noPool.mu0,
                                  partialPool: partial?.mu0 || noPool.mu0,
                                  site: site?.name || noPool.siteId,
                                  sampleSize: site?.sampleSize || 0,
                                };
                              })}
                              fill="#3b82f6"
                            >
                              {noPoolingEstimates.map((noPool, idx) => {
                                const site = currentMultiSiteData.sites.find(s => s.id === noPool.siteId);
                                const isLowData = (site?.sampleSize || 0) < 100;
                                return <Cell key={idx} r={isLowData ? 8 : 5} fill={isLowData ? '#dc2626' : '#3b82f6'} />;
                              })}
                            </Scatter>
                            {/* Diagonal line for reference */}
                            <Line
                              type="linear"
                              dataKey="value"
                              stroke="#94a3b8"
                              strokeDasharray="2 2"
                              dot={false}
                              data={[
                                { noPool: partialPoolingResult.model.populationMu0 - 1, value: partialPoolingResult.model.populationMu0 - 1 },
                                { noPool: partialPoolingResult.model.populationMu0 + 1, value: partialPoolingResult.model.populationMu0 + 1 },
                              ]}
                              name="y=x (no shrinkage)"
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>Interpretation:</strong> Points above the diagonal indicate shrinkage toward the population mean. 
                          Low-data sites (larger red circles) show more shrinkage (move further from diagonal). High-data sites (smaller blue circles) 
                          remain closer to their no-pooling estimates (stay near diagonal).
                        </p>
                      </div>

                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={partialPoolingResult.estimates.map(e => {
                          const site = currentMultiSiteData.sites.find(s => s.id === e.siteId);
                          return {
                            site: site?.name || e.siteId,
                            mu0: e.mu0,
                            mu0Lower: e.mu0Lower || e.mu0,
                            mu0Upper: e.mu0Upper || e.mu0,
                            sampleSize: site?.sampleSize || 0,
                          };
                        })}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="site" angle={-45} textAnchor="end" height={80} />
                          <YAxis label={{ value: 'μ₀ Estimate', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="mu0" fill="#3b82f6" name="μ₀ Estimate">
                            {partialPoolingResult.estimates.map((est, idx) => {
                              const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                              const isLowData = (site?.sampleSize || 0) < 100;
                              return <Cell key={idx} fill={isLowData ? '#2563eb' : '#3b82f6'} />;
                            })}
                          </Bar>
                          <ReferenceLine y={partialPoolingResult.model.populationMu0} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Population Mean', position: 'right' }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Benefits:</strong> Low-data sites (darker blue) have estimates closer to the population mean (red line). 
                        This shrinkage prevents unrealistic estimates while still allowing site-specific differences.
                      </p>
                      
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Site</th>
                              <th className="text-right p-2">Sample Size</th>
                              <th className="text-right p-2">No Pool μ₀</th>
                              <th className="text-right p-2">Partial Pool μ₀</th>
                              <th className="text-right p-2">Shrinkage</th>
                              <th className="text-right p-2">Crash Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            {partialPoolingResult.estimates.map((est) => {
                              const site = currentMultiSiteData.sites.find(s => s.id === est.siteId);
                              const noPoolEst = noPoolingEstimates.find(n => n.siteId === est.siteId);
                              const shrinkage = noPoolEst ? Math.abs(est.mu0 - noPoolEst.mu0) : 0;
                              const towardPop = noPoolEst && Math.abs(est.mu0 - partialPoolingResult.model.populationMu0) < Math.abs(noPoolEst.mu0 - partialPoolingResult.model.populationMu0);
                              return (
                                <tr key={est.siteId} className="border-b">
                                  <td className="p-2">{site?.name}</td>
                                  <td className="text-right p-2">{site?.sampleSize}</td>
                                  <td className="text-right p-2">{noPoolEst?.mu0.toFixed(3) || 'N/A'}</td>
                                  <td className="text-right p-2">{est.mu0.toFixed(3)}</td>
                                  <td className={`text-right p-2 ${towardPop ? 'text-green-600' : 'text-gray-600'}`}>
                                    {towardPop ? '✓' : '—'} {shrinkage.toFixed(3)}
                                  </td>
                                  <td className="text-right p-2">{formatCrashRisk(est.crashRisk)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        The &quot;Shrinkage&quot; column shows how much the estimate moved. ✓ indicates movement toward population mean 
                        (desirable for low-data sites). Notice low-data sites show more shrinkage.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Random Slope Models */}
            <div id="random-slopes" className="scroll-mt-20">
              <h4 className="font-semibold text-gray-900 mb-2">4. Random Slope Models</h4>
              
              <p className="mb-3">
                While random intercepts capture baseline differences, <strong>random slopes</strong> allow covariate effects to vary 
                across sites. This is important when the same factor (e.g., traffic volume) has different impacts at different locations.
              </p>

              <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                <p className="text-sm mb-2">
                  <strong>Mathematical Structure:</strong>
                </p>
                <div className="bg-white rounded p-3 font-mono text-xs mt-2 space-y-1">
                  <p>β_μᵢ ~ N(β_μ_pop, τ²_β_μ)</p>
                  <p>where β_μᵢ is site i&apos;s effect of a covariate on location parameter</p>
                </div>
                <p className="text-sm mt-2">
                  <strong>Example:</strong> A 10% increase in traffic volume might increase crash risk more at an urban intersection 
                  than at a rural one. Random slopes capture this site-specific variation in covariate effects.
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
                      <p className="text-xs text-gray-600 mt-1">Average covariate effect across all sites</p>
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
                      <p className="text-xs text-gray-600 mt-1">Higher = more variation in covariate effects across sites</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="font-semibold mb-2">Site-Specific Covariate Effects (β_μ)</h6>
                    <p className="text-sm text-gray-600 mb-3">
                      Each site responds differently to the same covariate. When τ_β_μ is large, sites vary substantially in how 
                      they respond to changes in the covariate.
                    </p>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={randomSlopeModel.siteSlopes.map(s => {
                        const site = currentMultiSiteData.sites.find(site => site.id === s.siteId);
                        return {
                          site: site?.name || s.siteId,
                          betaMu: s.betaMu,
                        };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="site" angle={-45} textAnchor="end" height={80} />
                        <YAxis label={{ value: 'β_μ Effect', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="betaMu" fill="#10b981" name="Site-specific β_μ" />
                        <ReferenceLine y={populationBetaMu} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Population Mean', position: 'right' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">
                      The red line shows the population mean effect. Each bar shows how much that site&apos;s effect deviates from the mean. 
                      When τ_β_μ is large (high variation), bars spread further from the red line, indicating that the same covariate has 
                      different impacts at different sites.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h6 className="font-semibold mb-2">Interpretation Example</h6>
                    <div className="text-sm space-y-2">
                      <p>
                        Suppose the covariate is &quot;traffic volume&quot; and β_μ_pop = 0.04 (population mean effect). 
                        This means, on average, a 1-unit increase in traffic volume shifts the location parameter by 0.04.
                      </p>
                      <p>
                        With random slopes:
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Urban Site 1: β_μ = 0.06 → traffic volume has a stronger effect (more dangerous per unit increase)</li>
                        <li>Rural Site 1: β_μ = 0.02 → traffic volume has a weaker effect (less dangerous per unit increase)</li>
                      </ul>
                      <p>
                        This captures the reality that the same factor can have different safety implications at different locations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!showTutorial && (
        <button
          onClick={() => setShowTutorial(true)}
          className="mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
        >
          Show Tutorial
        </button>
      )}
    </div>
  );
}

