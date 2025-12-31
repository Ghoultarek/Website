'use client';

import { useState, useMemo, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InlineMath } from 'react-katex';

interface Point {
  x: number;
  y: number;
  cluster?: number;
}

interface KMeansDemoProps {
  data?: Point[];
}

export default function KMeansDemo({ data: propData }: KMeansDemoProps = {} as KMeansDemoProps) {
  const [k, setK] = useState(3);
  const [iteration, setIteration] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showImplementation, setShowImplementation] = useState(false);

  // Generate synthetic data with clusters (fallback if not provided)
  const generateData = (): Point[] => {
    const data: Point[] = [];
    const centers = [
      { x: 2, y: 2 },
      { x: 8, y: 8 },
      { x: 2, y: 8 },
    ];
    
    centers.forEach((center, idx) => {
      for (let i = 0; i < 30; i++) {
        data.push({
          x: center.x + (Math.random() - 0.5) * 3,
          y: center.y + (Math.random() - 0.5) * 3,
        });
      }
    });
    return data;
  };

  const data = propData || generateData();
  const [centroids, setCentroids] = useState<Point[]>([]);
  const [history, setHistory] = useState<Array<{ centroids: Point[]; assignments: number[] }>>([]);

  // Initialize centroids randomly
  useEffect(() => {
    const newCentroids: Point[] = [];
    for (let i = 0; i < k; i++) {
      newCentroids.push({
        x: Math.random() * 10,
        y: Math.random() * 10,
      });
    }
    setCentroids(newCentroids);
    setIteration(0);
    setHistory([]);
  }, [k]);

  // K-means iteration
  const runIteration = () => {
    // Assign points to nearest centroid
    const assignments = data.map(point => {
      let minDist = Infinity;
      let nearestCluster = 0;
      centroids.forEach((centroid, idx) => {
        const dist = Math.sqrt(
          Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = idx;
        }
      });
      return nearestCluster;
    });

    // Update centroids (mean of assigned points)
    const newCentroids: Point[] = [];
    for (let i = 0; i < k; i++) {
      const clusterPoints = data.filter((_, idx) => assignments[idx] === i);
      if (clusterPoints.length > 0) {
        newCentroids.push({
          x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
          y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length,
        });
      } else {
        // Keep old centroid if no points assigned
        newCentroids.push(centroids[i] || { x: Math.random() * 10, y: Math.random() * 10 });
      }
    }

    setCentroids(newCentroids);
    setHistory([...history, { centroids: [...centroids], assignments: [...assignments] }]);
    setIteration(iteration + 1);
  };

  // Assign current clusters
  const currentAssignments = useMemo(() => {
    return data.map(point => {
      let minDist = Infinity;
      let nearestCluster = 0;
      centroids.forEach((centroid, idx) => {
        const dist = Math.sqrt(
          Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = idx;
        }
      });
      return nearestCluster;
    });
  }, [data, centroids]);

  const clusteredData = data.map((p, idx) => ({ ...p, cluster: currentAssignments[idx] }));

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a78bfa', '#ec4899'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">K-Means Clustering</h2>
      
      <p className="text-gray-700 mb-6">
        K-means partitions data into <InlineMath math="k" /> clusters by iteratively updating cluster centroids. 
        It minimizes within-cluster variance by assigning points to the nearest centroid and updating centroids 
        to the mean of their assigned points.
      </p>

      {/* Library Usage */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">Using scikit-learn</h3>
        <div className="bg-white rounded p-3 font-mono text-sm mb-3">
          <pre className="text-xs">{`from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=${k}, random_state=42)
kmeans.fit(X)
labels = kmeans.predict(X)
centroids = kmeans.cluster_centers_`}</pre>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              K (number of clusters): {k}
            </label>
            <input
              type="range"
              min="2"
              max="6"
              value={k}
              onChange={(e) => setK(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runIteration}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              Run One Iteration
            </button>
            <button
              onClick={() => {
                setIteration(0);
                setHistory([]);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-700">
          Iteration: <strong>{iteration}</strong>
        </div>
        <button
          onClick={() => setShowImplementation(!showImplementation)}
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
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
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {Array.from({ length: k }).map((_, clusterId) => (
              <Scatter
                key={clusterId}
                name={`Cluster ${clusterId}`}
                data={clusteredData.filter(p => p.cluster === clusterId)}
                fill={colors[clusterId]}
              >
                {clusteredData.filter(p => p.cluster === clusterId).map((entry, index) => (
                  <Cell key={`cluster-${clusterId}-${index}`} fill={colors[clusterId]} />
                ))}
              </Scatter>
            ))}
            <Scatter name="Centroids" data={centroids} fill="#000000">
              {centroids.map((entry, index) => (
                <Cell key={`centroid-${index}`} fill="#000000" r={8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Implementation */}
      {showImplementation && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">K-Means Algorithm</h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <div>
              <p className="font-semibold">1. Initialize:</p>
              <p className="text-xs ml-4">
                Randomly place <InlineMath math="k" /> centroids in the data space.
              </p>
            </div>
            <div>
              <p className="font-semibold">2. Assign:</p>
              <p className="text-xs ml-4">
                Assign each point to the nearest centroid: <InlineMath math="c_i = \arg\min_j ||x_i - \mu_j||^2" />
              </p>
            </div>
            <div>
              <p className="font-semibold">3. Update:</p>
              <p className="text-xs ml-4">
                Move each centroid to the mean of its assigned points: 
                <InlineMath math="\mu_j = \frac{1}{|C_j|} \sum_{x_i \in C_j} x_i" />
              </p>
            </div>
            <div>
              <p className="font-semibold">4. Repeat:</p>
              <p className="text-xs ml-4">
                Repeat steps 2-3 until centroids converge (or max iterations reached).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">Key Characteristics:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Requires specifying <InlineMath math="k" /> in advance</li>
          <li>Assumes clusters are spherical and similar in size</li>
          <li>Sensitive to initialization (can get stuck in local minima)</li>
          <li>Fast and scalable for large datasets</li>
          <li>Works well when clusters are well-separated</li>
        </ul>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Common Pitfalls:</h4>
        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
          <li><strong>Wrong k value:</strong> Choosing k incorrectly leads to over-clustering or under-clustering. Use elbow method, silhouette score, or domain knowledge.</li>
          <li><strong>Poor initialization:</strong> Random initialization can lead to poor local minima. Use k-means++ initialization for better results.</li>
          <li><strong>Non-spherical clusters:</strong> K-means assumes spherical clusters. Fails on elongated, irregular, or overlapping clusters.</li>
          <li><strong>Different cluster sizes:</strong> Tends to split large clusters and merge small ones when clusters have very different sizes.</li>
          <li><strong>Outliers:</strong> Sensitive to outliers which can pull centroids away from true cluster centers. Consider outlier removal or robust variants.</li>
          <li><strong>Feature scaling:</strong> Features with different scales bias the clustering toward features with larger ranges. Always normalize features.</li>
          <li><strong>Empty clusters:</strong> Can produce empty clusters if initialization is poor or k is too large. Need to handle this in implementation.</li>
        </ul>
      </div>
    </div>
  );
}

