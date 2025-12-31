'use client';

import { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InlineMath, BlockMath } from 'react-katex';

interface Point {
  x: number;
  y: number;
  memberships?: number[];
}

interface FuzzyCMeansDemoProps {
  data?: Point[];
}

export default function FuzzyCMeansDemo({ data: propData }: FuzzyCMeansDemoProps = {} as FuzzyCMeansDemoProps) {
  const [c, setC] = useState(3); // number of clusters
  const [m, setM] = useState(2); // fuzziness parameter
  const [iteration, setIteration] = useState(0);
  const [showImplementation, setShowImplementation] = useState(false);

  // Generate synthetic data (fallback if not provided)
  const generateData = (): Point[] => {
    const data: Point[] = [];
    const centers = [
      { x: 2, y: 2 },
      { x: 8, y: 8 },
      { x: 2, y: 8 },
    ];
    
    centers.forEach((center) => {
      for (let i = 0; i < 25; i++) {
        data.push({
          x: center.x + (Math.random() - 0.5) * 3,
          y: center.y + (Math.random() - 0.5) * 3,
        });
      }
    });
    return data;
  };

  const data = propData || generateData();
  const [centroids, setCentroids] = useState<Array<{ x: number; y: number }>>([]);
  const [memberships, setMemberships] = useState<number[][]>([]);

  // Initialize centroids and memberships
  useMemo(() => {
    const newCentroids: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < c; i++) {
      newCentroids.push({
        x: Math.random() * 10,
        y: Math.random() * 10,
      });
    }
    setCentroids(newCentroids);
    
    // Initialize memberships randomly (must sum to 1 for each point)
    const newMemberships: number[][] = data.map(() => {
      const mems: number[] = [];
      let sum = 0;
      for (let i = 0; i < c; i++) {
        const val = Math.random();
        mems.push(val);
        sum += val;
      }
      return mems.map(v => v / sum); // Normalize
    });
    setMemberships(newMemberships);
    setIteration(0);
  }, [c, data.length]);

  // Fuzzy C-means iteration
  const runIteration = () => {
    // Update centroids
    const newCentroids = centroids.map((_, j) => {
      let sumX = 0, sumY = 0, sumWeight = 0;
      data.forEach((point, i) => {
        const weight = Math.pow(memberships[i][j], m);
        sumX += weight * point.x;
        sumY += weight * point.y;
        sumWeight += weight;
      });
      return {
        x: sumWeight > 0 ? sumX / sumWeight : centroids[j].x,
        y: sumWeight > 0 ? sumY / sumWeight : centroids[j].y,
      };
    });

    // Update memberships
    const newMemberships = data.map((point, i) => {
      const mems: number[] = [];
      for (let j = 0; j < c; j++) {
        const dist = Math.sqrt(
          Math.pow(point.x - newCentroids[j].x, 2) + Math.pow(point.y - newCentroids[j].y, 2)
        );
        let sum = 0;
        for (let k = 0; k < c; k++) {
          const distK = Math.sqrt(
            Math.pow(point.x - newCentroids[k].x, 2) + Math.pow(point.y - newCentroids[k].y, 2)
          );
          if (distK > 0) {
            sum += Math.pow(dist / distK, 2 / (m - 1));
          } else {
            sum = Infinity;
            break;
          }
        }
        mems.push(sum > 0 && sum !== Infinity ? 1 / sum : (j === 0 ? 1 : 0));
      }
      // Normalize
      const total = mems.reduce((a, b) => a + b, 0);
      return mems.map(v => total > 0 ? v / total : 1 / c);
    });

    setCentroids(newCentroids);
    setMemberships(newMemberships);
    setIteration(iteration + 1);
  };

  // Assign points to clusters based on highest membership
  const clusteredData = useMemo(() => {
    return data.map((point, i) => {
      const maxMembership = Math.max(...memberships[i] || []);
      const cluster = memberships[i]?.indexOf(maxMembership) || 0;
      return { ...point, cluster, memberships: memberships[i] || [] };
    });
  }, [data, memberships]);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a78bfa', '#ec4899'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Fuzzy C-Means</h2>
      
      <p className="text-gray-700 mb-6">
        Fuzzy C-Means is a soft clustering algorithm where each point belongs to all clusters with different 
        membership degrees (probabilities). Unlike hard clustering (K-means), points can belong to multiple 
        clusters simultaneously.
      </p>

      {/* Key Formula */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Objective Function</h3>
        <div className="bg-white rounded p-4 flex justify-center">
          <BlockMath math="J = \sum_{i=1}^{n} \sum_{j=1}^{c} u_{ij}^m ||x_i - c_j||^2" />
        </div>
        <p className="text-sm text-gray-700 mt-2">
          Where <InlineMath math="u_{ij}" /> is the membership of point <InlineMath math="i" /> to cluster 
          <InlineMath math="j" />, <InlineMath math="m" /> is the fuzziness parameter, and <InlineMath math="c_j" /> 
          is the centroid of cluster <InlineMath math="j" />.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              C (clusters): {c}
            </label>
            <input
              type="range"
              min="2"
              max="5"
              value={c}
              onChange={(e) => setC(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              M (fuzziness): {m.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.1"
              max="3"
              step="0.1"
              value={m}
              onChange={(e) => setM(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Higher = fuzzier (more overlap)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runIteration}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              Run Iteration
            </button>
            <button
              onClick={() => {
                setIteration(0);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-700 mb-2">
          Iteration: <strong>{iteration}</strong>
        </div>
        <button
          onClick={() => setShowImplementation(!showImplementation)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          {showImplementation ? 'Hide' : 'Show'} Implementation
        </button>
      </div>

      {/* Visualization */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Clustering Visualization</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="X" domain={[0, 10]} />
            <YAxis type="number" dataKey="y" name="Y" domain={[0, 10]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const point = payload[0].payload as typeof clusteredData[0];
                  return (
                    <div className="bg-white border border-gray-300 rounded p-2">
                      <p className="font-semibold">Point: ({point.x.toFixed(2)}, {point.y.toFixed(2)})</p>
                      <p className="text-xs">Memberships:</p>
                      {point.memberships?.map((mem, idx) => (
                        <p key={idx} className="text-xs">
                          Cluster {idx}: {(mem * 100).toFixed(1)}%
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {Array.from({ length: c }).map((_, clusterId) => (
              <Scatter
                key={clusterId}
                name={`Cluster ${clusterId}`}
                data={clusteredData.filter(p => p.cluster === clusterId)}
                fill={colors[clusterId]}
              >
                {clusteredData.filter(p => p.cluster === clusterId).map((entry, i) => {
                  const opacity = entry.memberships?.[clusterId] || 0.5;
                  return (
                    <Cell
                      key={`cluster-${clusterId}-${i}`}
                      fill={colors[clusterId]}
                      fillOpacity={opacity}
                    />
                  );
                })}
              </Scatter>
            ))}
            <Scatter name="Centroids" data={centroids} fill="#000000">
              {centroids.map((entry, index) => (
                <Cell key={`centroid-${index}`} fill="#000000" r={8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-2">
          Opacity indicates membership strength. Hover over points to see exact membership values.
        </p>
      </div>

      {/* Implementation */}
      {showImplementation && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">Fuzzy C-Means Algorithm</h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <div>
              <p className="font-semibold">1. Initialize:</p>
              <p className="text-xs ml-4">
                Randomly initialize centroids and membership matrix (memberships must sum to 1 for each point).
              </p>
            </div>
            <div>
              <p className="font-semibold">2. Update centroids:</p>
              <p className="text-xs ml-4">
                <InlineMath math="c_j = \frac{\sum_{i} u_{ij}^m x_i}{\sum_{i} u_{ij}^m}" />
              </p>
            </div>
            <div>
              <p className="font-semibold">3. Update memberships:</p>
              <p className="text-xs ml-4">
                <InlineMath math="u_{ij} = \frac{1}{\sum_{k=1}^{c} \left(\frac{||x_i - c_j||}{||x_i - c_k||}\right)^{2/(m-1)}}" />
              </p>
            </div>
            <div>
              <p className="font-semibold">4. Repeat:</p>
              <p className="text-xs ml-4">
                Repeat steps 2-3 until convergence (memberships change less than threshold).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">Key Characteristics:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Soft clustering: points belong to multiple clusters with probabilities</li>
          <li>Useful when cluster boundaries are ambiguous</li>
          <li>Membership values provide confidence scores</li>
          <li>More flexible than hard clustering methods</li>
          <li><strong>*</strong> Used in cyclist safety assessment research to identify different traffic regimes based on volume patterns</li>
        </ul>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Common Pitfalls:</h4>
        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
          <li><strong>Fuzziness parameter m:</strong> Choosing m poorly affects cluster shapes. Too small (close to 1) = hard clustering. Too large = all memberships become equal.</li>
          <li><strong>Number of clusters c:</strong> Still need to specify c in advance. Wrong choice leads to poor clustering quality.</li>
          <li><strong>Initialization:</strong> Sensitive to initial membership matrix. Poor initialization can lead to local minima.</li>
          <li><strong>Computational cost:</strong> More expensive than K-means due to membership calculations. Slower convergence.</li>
          <li><strong>Interpretation:</strong> Membership degrees can be hard to interpret, especially when many points have similar memberships across clusters.</li>
          <li><strong>Feature scaling:</strong> Like other distance-based methods, sensitive to feature scales. Normalize features before clustering.</li>
          <li><strong>Convergence:</strong> May converge slowly or not at all if parameters are poorly chosen or data is ill-suited for fuzzy clustering.</li>
        </ul>
      </div>
    </div>
  );
}

