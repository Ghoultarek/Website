'use client';

import { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InlineMath } from 'react-katex';

interface Point {
  x: number;
  y: number;
  type?: 'core' | 'border' | 'noise';
  cluster?: number;
}

interface DBSCANDemoProps {
  data?: Point[];
}

export default function DBSCANDemo({ data: propData }: DBSCANDemoProps = {} as DBSCANDemoProps) {
  const [epsilon, setEpsilon] = useState(1.5);
  const [minSamples, setMinSamples] = useState(4);
  const [showImplementation, setShowImplementation] = useState(false);

  // Generate data with clusters and noise (fallback if not provided)
  const generateData = (): Point[] => {
    const data: Point[] = [];
    
    // Cluster 1
    for (let i = 0; i < 20; i++) {
      data.push({
        x: 2 + (Math.random() - 0.5) * 2,
        y: 2 + (Math.random() - 0.5) * 2,
      });
    }
    
    // Cluster 2
    for (let i = 0; i < 20; i++) {
      data.push({
        x: 7 + (Math.random() - 0.5) * 2,
        y: 7 + (Math.random() - 0.5) * 2,
      });
    }
    
    // Noise points
    for (let i = 0; i < 10; i++) {
      data.push({
        x: Math.random() * 10,
        y: Math.random() * 10,
      });
    }
    
    return data;
  };

  const [data] = useState<Point[]>(propData || generateData());

  // DBSCAN implementation
  const result = useMemo(() => {
    const visited = new Set<number>();
    const clustered: Point[] = [];
    let clusterId = 0;

    const getNeighbors = (pointIdx: number): number[] => {
      const point = data[pointIdx];
      return data
        .map((p, idx) => ({
          idx,
          dist: Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)),
        }))
        .filter(({ dist }) => dist <= epsilon)
        .map(({ idx }) => idx);
    };

    const expandCluster = (pointIdx: number, neighbors: number[], clusterId: number) => {
      clustered[pointIdx] = { ...data[pointIdx], cluster: clusterId, type: 'core' };
      
      let i = 0;
      while (i < neighbors.length) {
        const neighborIdx = neighbors[i];
        
        if (!visited.has(neighborIdx)) {
          visited.add(neighborIdx);
          const neighborNeighbors = getNeighbors(neighborIdx);
          if (neighborNeighbors.length >= minSamples) {
            neighbors.push(...neighborNeighbors);
          }
        }
        
        if (!clustered[neighborIdx]) {
          clustered[neighborIdx] = { ...data[neighborIdx], cluster: clusterId, type: 'border' };
        }
        
        i++;
      }
    };

    data.forEach((point, idx) => {
      if (visited.has(idx)) return;
      
      visited.add(idx);
      const neighbors = getNeighbors(idx);
      
      if (neighbors.length < minSamples) {
        clustered[idx] = { ...point, type: 'noise', cluster: -1 };
      } else {
        expandCluster(idx, neighbors, clusterId++);
      }
    });

    // Fill in any missing points
    data.forEach((point, idx) => {
      if (!clustered[idx]) {
        clustered[idx] = { ...point, type: 'noise', cluster: -1 };
      }
    });

    return clustered;
  }, [data, epsilon, minSamples]);

  const clusters = Array.from(new Set(result.map(p => p.cluster).filter(c => c !== -1)));
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a78bfa', '#ec4899'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">DBSCAN (Density-Based Clustering)</h2>
      
      <p className="text-gray-700 mb-6">
        DBSCAN groups points that are closely packed together (dense regions) and marks outliers as noise. 
        It can find clusters of arbitrary shape and doesn't require specifying the number of clusters in advance.
      </p>

      {/* Library Usage */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">Using scikit-learn</h3>
        <div className="bg-white rounded p-3 font-mono text-sm mb-3">
          <pre className="text-xs">{`from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=${epsilon}, min_samples=${minSamples})
labels = dbscan.fit_predict(X)
# -1 indicates noise/outliers`}</pre>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Epsilon (eps): {epsilon.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Maximum distance between points in the same cluster
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Min Samples: {minSamples}
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={minSamples}
              onChange={(e) => setMinSamples(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Minimum points to form a dense region (core point)
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowImplementation(!showImplementation)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          {showImplementation ? 'Hide' : 'Show'} Implementation
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm font-semibold text-blue-900">Clusters Found</p>
          <p className="text-2xl font-bold text-blue-700">{clusters.length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm font-semibold text-yellow-900">Core Points</p>
          <p className="text-2xl font-bold text-yellow-700">
            {result.filter(p => p.type === 'core').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm font-semibold text-red-900">Noise Points</p>
          <p className="text-2xl font-bold text-red-700">
            {result.filter(p => p.type === 'noise').length}
          </p>
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Clustering Visualization</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="X" domain={[0, 10]} />
            <YAxis type="number" dataKey="y" name="Y" domain={[0, 10]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {clusters.map((clusterId, idx) => (
              <Scatter
                key={clusterId}
                name={`Cluster ${clusterId}`}
                data={result.filter(p => p.cluster === clusterId)}
                fill={colors[idx % colors.length]}
              >
                {result.filter(p => p.cluster === clusterId).map((entry, i) => (
                  <Cell
                    key={`cluster-${clusterId}-${i}`}
                    fill={colors[idx % colors.length]}
                    r={entry.type === 'core' ? 6 : 4}
                  />
                ))}
              </Scatter>
            ))}
            <Scatter name="Noise" data={result.filter(p => p.type === 'noise')} fill="#6b7280">
              {result.filter(p => p.type === 'noise').map((entry, i) => (
                <Cell key={`noise-${i}`} fill="#6b7280" r={4} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-2">
          Larger dots = core points, smaller dots = border points, gray = noise
        </p>
      </div>

      {/* Implementation */}
      {showImplementation && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">DBSCAN Algorithm</h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <div>
              <p className="font-semibold">1. Find neighbors:</p>
              <p className="text-xs ml-4">
                For each point, find all points within <InlineMath math="\epsilon" /> distance.
              </p>
            </div>
            <div>
              <p className="font-semibold">2. Identify core points:</p>
              <p className="text-xs ml-4">
                Points with at least <InlineMath math="\text{min\_samples}" /> neighbors are core points.
              </p>
            </div>
            <div>
              <p className="font-semibold">3. Expand clusters:</p>
              <p className="text-xs ml-4">
                Start from a core point, recursively add all density-reachable points to the same cluster.
              </p>
            </div>
            <div>
              <p className="font-semibold">4. Mark noise:</p>
              <p className="text-xs ml-4">
                Points that are not part of any cluster are marked as noise/outliers.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">Key Advantages:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Finds clusters of arbitrary shape (not just spherical)</li>
          <li>Automatically identifies outliers/noise</li>
          <li>Doesn't require specifying number of clusters</li>
          <li>Handles clusters of varying densities (with HDBSCAN extension)</li>
        </ul>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Common Pitfalls:</h4>
        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
          <li><strong>Parameter tuning:</strong> Choosing epsilon and min_samples is difficult and data-dependent. Too small epsilon = everything is noise. Too large = one big cluster.</li>
          <li><strong>Varying densities:</strong> Struggles when clusters have very different densities. Dense clusters may merge, sparse clusters may be labeled as noise.</li>
          <li><strong>High-dimensional data:</strong> Distance metrics become less meaningful in high dimensions, making density estimation unreliable.</li>
          <li><strong>Chaining effect:</strong> Can create long chains connecting clusters that should be separate if epsilon is too large.</li>
          <li><strong>Border points:</strong> Border points can belong to multiple clusters but are arbitrarily assigned to one, making results less stable.</li>
          <li><strong>Computational complexity:</strong> Can be slow for large datasets, especially with large epsilon values that create many neighbors.</li>
          <li><strong>Feature scaling:</strong> Like K-means, sensitive to feature scales. Normalize features before clustering.</li>
        </ul>
      </div>
    </div>
  );
}

