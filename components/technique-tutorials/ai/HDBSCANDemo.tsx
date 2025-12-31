'use client';

import { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InlineMath } from 'react-katex';

interface Point {
  x: number;
  y: number;
  cluster?: number;
}

interface HDBSCANDemoProps {
  data?: Point[];
}

export default function HDBSCANDemo({ data: propData }: HDBSCANDemoProps = {} as HDBSCANDemoProps) {
  const [minClusterSize, setMinClusterSize] = useState(5);
  const [showImplementation, setShowImplementation] = useState(false);

  // Generate data with clusters of varying densities (fallback if not provided)
  const generateData = (): Point[] => {
    const data: Point[] = [];
    
    // Dense cluster
    for (let i = 0; i < 30; i++) {
      data.push({
        x: 2 + (Math.random() - 0.5) * 1.5,
        y: 2 + (Math.random() - 0.5) * 1.5,
      });
    }
    
    // Sparse cluster
    for (let i = 0; i < 20; i++) {
      data.push({
        x: 7 + (Math.random() - 0.5) * 3,
        y: 7 + (Math.random() - 0.5) * 3,
      });
    }
    
    // Noise
    for (let i = 0; i < 10; i++) {
      data.push({
        x: Math.random() * 10,
        y: Math.random() * 10,
      });
    }
    
    return data;
  };

  const [data] = useState<Point[]>(propData || generateData());

  // Simplified HDBSCAN (using hierarchical approach with min_cluster_size)
  const result = useMemo(() => {
    // Simplified: Use multiple epsilon values and select stable clusters
    const clusters: { [key: number]: Point[] } = {};
    let clusterId = 0;
    const processed = new Set<number>();

    // Try different epsilon values (hierarchical)
    const epsilons = [0.5, 1.0, 1.5, 2.0, 2.5];
    
    epsilons.forEach(epsilon => {
      const visited = new Set<number>();
      
      data.forEach((point, idx) => {
        if (processed.has(idx)) return;
        
        const neighbors = data
          .map((p, i) => ({
            idx: i,
            dist: Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)),
          }))
          .filter(({ dist }) => dist <= epsilon)
          .map(({ idx }) => idx);
        
        if (neighbors.length >= minClusterSize) {
          const clusterPoints = neighbors.map(i => data[i]).filter((_, i) => !processed.has(neighbors[i]));
          if (clusterPoints.length >= minClusterSize) {
            clusterPoints.forEach((p, i) => {
              const origIdx = neighbors[i];
              if (!processed.has(origIdx)) {
                clusters[clusterId] = clusters[clusterId] || [];
                clusters[clusterId].push({ ...p, cluster: clusterId });
                processed.add(origIdx);
              }
            });
            clusterId++;
          }
        }
      });
    });

    // Assign remaining points as noise
    const clustered: Point[] = data.map((p, idx) => {
      for (const [cid, points] of Object.entries(clusters)) {
        if (points.some(cp => cp.x === p.x && cp.y === p.y)) {
          return { ...p, cluster: parseInt(cid) };
        }
      }
      return { ...p, cluster: -1 };
    });

    return clustered;
  }, [data, minClusterSize]);

  const clusters = Array.from(new Set(result.map(p => p.cluster).filter(c => c !== -1)));
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a78bfa', '#ec4899'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">HDBSCAN (Hierarchical DBSCAN)</h2>
      
      <p className="text-gray-700 mb-6">
        HDBSCAN extends DBSCAN by building a hierarchy of clusters at different density levels. It automatically 
        extracts stable clusters from this hierarchy, making it better at handling clusters of varying densities 
        compared to DBSCAN.
      </p>

      {/* Library Usage */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">Using hdbscan library</h3>
        <div className="bg-white rounded p-3 font-mono text-sm mb-3">
          <pre className="text-xs">{`import hdbscan

clusterer = hdbscan.HDBSCAN(min_cluster_size=${minClusterSize})
cluster_labels = clusterer.fit_predict(X)
# -1 indicates noise/outliers`}</pre>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">
            Min Cluster Size: {minClusterSize}
          </label>
          <input
            type="range"
            min="3"
            max="15"
            value={minClusterSize}
            onChange={(e) => setMinClusterSize(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-600 mt-1">
            Minimum number of points required to form a cluster
          </p>
        </div>
        <button
          onClick={() => setShowImplementation(!showImplementation)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {showImplementation ? 'Hide' : 'Show'} Implementation
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm font-semibold text-blue-900">Clusters Found</p>
          <p className="text-2xl font-bold text-blue-700">{clusters.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm font-semibold text-red-900">Noise Points</p>
          <p className="text-2xl font-bold text-red-700">
            {result.filter(p => p.cluster === -1).length}
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
                  <Cell key={`cluster-${clusterId}-${i}`} fill={colors[idx % colors.length]} />
                ))}
              </Scatter>
            ))}
            <Scatter name="Noise" data={result.filter(p => p.cluster === -1)} fill="#6b7280">
              {result.filter(p => p.cluster === -1).map((entry, i) => (
                <Cell key={`noise-${i}`} fill="#6b7280" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Implementation */}
      {showImplementation && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">HDBSCAN Algorithm</h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <div>
              <p className="font-semibold">1. Build hierarchy:</p>
              <p className="text-xs ml-4">
                Create a hierarchy of clusters at different density levels (mutual reachability distance).
              </p>
            </div>
            <div>
              <p className="font-semibold">2. Extract clusters:</p>
              <p className="text-xs ml-4">
                Extract stable clusters from the hierarchy based on cluster persistence and minimum cluster size.
              </p>
            </div>
            <div>
              <p className="font-semibold">3. Assign points:</p>
              <p className="text-xs ml-4">
                Assign points to clusters, with points in unstable regions marked as noise.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">Advantages Over DBSCAN:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Handles clusters of varying densities better</li>
          <li>More robust to parameter selection</li>
          <li>Provides cluster stability scores</li>
          <li>Better at identifying noise/outliers</li>
        </ul>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Common Pitfalls:</h4>
        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
          <li><strong>Min cluster size:</strong> Choosing min_cluster_size incorrectly can merge small but meaningful clusters or split large clusters.</li>
          <li><strong>Computational cost:</strong> More expensive than DBSCAN due to hierarchical construction. Can be slow for very large datasets.</li>
          <li><strong>High-dimensional data:</strong> Still struggles with high-dimensional data where distance metrics become less meaningful.</li>
          <li><strong>Memory usage:</strong> Building the hierarchy requires storing more information than DBSCAN, increasing memory requirements.</li>
          <li><strong>Parameter selection:</strong> While more robust than DBSCAN, min_cluster_size still needs careful tuning based on data characteristics.</li>
          <li><strong>Feature scaling:</strong> Sensitive to feature scales. Always normalize features before clustering.</li>
          <li><strong>Interpretation:</strong> The hierarchical structure can be complex to interpret, especially with many clusters at different levels.</li>
        </ul>
      </div>
    </div>
  );
}

