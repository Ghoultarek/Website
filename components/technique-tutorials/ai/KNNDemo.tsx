'use client';

import { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InlineMath } from 'react-katex';

interface Point {
  x: number;
  y: number;
  label: number;
  isNew?: boolean;
}

interface KNNDemoProps {
  data?: Point[];
}

export default function KNNDemo({ data: propData }: KNNDemoProps = {} as KNNDemoProps) {
  const [k, setK] = useState(3);
  const [showImplementation, setShowImplementation] = useState(false);

  // Generate training data with overlapping classes (fallback if not provided)
  const generateData = (): Point[] => {
    const data: Point[] = [];
    // Class 0: more spread out, centered around (3, 4)
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 3.5;
      data.push({
        x: 3 + radius * Math.cos(angle) + (Math.random() - 0.5) * 1.5,
        y: 4 + radius * Math.sin(angle) + (Math.random() - 0.5) * 1.5,
        label: 0,
      });
    }
    // Class 1: more spread out, centered around (7, 6)
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 3.5;
      data.push({
        x: 7 + radius * Math.cos(angle) + (Math.random() - 0.5) * 1.5,
        y: 6 + radius * Math.sin(angle) + (Math.random() - 0.5) * 1.5,
        label: 1,
      });
    }
    // Add some overlapping points in the middle
    for (let i = 0; i < 10; i++) {
      data.push({
        x: Math.random() * 3 + 4,
        y: Math.random() * 3 + 4,
        label: Math.random() > 0.5 ? 1 : 0,
      });
    }
    return data;
  };

  // Use prop data if provided, otherwise generate (but add labels for KNN)
  const trainingData = useMemo<Point[]>(() => {
    if (propData && propData.length > 0) {
      // Assign labels based on position (matching the generation logic)
      return propData.map(point => {
        const distToCenter0 = Math.sqrt(Math.pow(point.x - 3, 2) + Math.pow(point.y - 4, 2));
        const distToCenter1 = Math.sqrt(Math.pow(point.x - 7, 2) + Math.pow(point.y - 6, 2));
        return {
          ...point,
          label: distToCenter0 < distToCenter1 ? 0 : 1,
        };
      });
    }
    return generateData();
  }, [propData]);

  // Generate decision boundary grid
  const decisionBoundary = useMemo(() => {
    const grid: { x: number; y: number; label: number }[] = [];
    const step = 0.2;
    for (let x = 0; x <= 10; x += step) {
      for (let y = 0; y <= 10; y += step) {
        // Calculate distances to all training points
        const distances = trainingData.map(point => ({
          point,
          distance: Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)),
        }));

        // Sort by distance and get k nearest
        distances.sort((a, b) => a.distance - b.distance);
        const kNearest = distances.slice(0, k);

        // Majority vote
        const votes: { [key: number]: number } = {};
        kNearest.forEach(({ point }) => {
          votes[point.label] = (votes[point.label] || 0) + 1;
        });

        const predictedLabel = parseInt(
          Object.keys(votes).reduce((a, b) => (votes[parseInt(a)] > votes[parseInt(b)] ? a : b))
        );

        grid.push({ x, y, label: predictedLabel });
      }
    }
    return grid;
  }, [trainingData, k]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">K-Nearest Neighbors (KNN)</h2>
      
      <p className="text-gray-700 mb-6">
        KNN is a simple instance-based learning algorithm. To classify a new point, it finds the <InlineMath math="k" /> 
        nearest training examples and assigns the majority class. It's a lazy learner - it doesn't build a model, 
        just stores the training data.
      </p>

      {/* Library Usage */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">Using scikit-learn</h3>
        <div className="bg-white rounded p-3 font-mono text-sm mb-3">
          <pre className="text-xs">{`from sklearn.neighbors import KNeighborsClassifier

knn = KNeighborsClassifier(n_neighbors=${k})
knn.fit(X_train, y_train)
# Predict for a new point
prediction = knn.predict([[x_new, y_new]])
# Or get probabilities
probabilities = knn.predict_proba([[x_new, y_new]])`}</pre>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">
            K (number of neighbors): {k}
          </label>
          <input
            type="range"
            min="1"
            max="15"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Small k (sharp boundaries)</span>
            <span>Large k (smooth boundaries)</span>
          </div>
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
        <h3 className="font-semibold text-gray-900 mb-3">Decision Boundary Visualization</h3>
        <p className="text-sm text-gray-600 mb-3">
          The colored background shows the decision boundary - regions where KNN would predict Class 0 (blue) or Class 1 (red).
          Adjust k to see how it affects the smoothness of the boundary.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="X" domain={[0, 10]} />
            <YAxis type="number" dataKey="y" name="Y" domain={[0, 10]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {/* Decision boundary background */}
            <Scatter 
              name="Class 0 Region" 
              data={decisionBoundary.filter(p => p.label === 0)} 
              fill="#3b82f6"
              opacity={0.2}
            >
              {decisionBoundary.filter(p => p.label === 0).map((entry, index) => (
                <Cell key={`boundary0-${index}`} fill="#3b82f6" opacity={0.15} />
              ))}
            </Scatter>
            <Scatter 
              name="Class 1 Region" 
              data={decisionBoundary.filter(p => p.label === 1)} 
              fill="#ef4444"
              opacity={0.2}
            >
              {decisionBoundary.filter(p => p.label === 1).map((entry, index) => (
                <Cell key={`boundary1-${index}`} fill="#ef4444" opacity={0.15} />
              ))}
            </Scatter>
            {/* Training data points */}
            <Scatter name="Class 0" data={trainingData.filter(p => p.label === 0)} fill="#3b82f6">
              {trainingData.filter(p => p.label === 0).map((entry, index) => (
                <Cell key={`class0-${index}`} fill="#1e40af" r={5} />
              ))}
            </Scatter>
            <Scatter name="Class 1" data={trainingData.filter(p => p.label === 1)} fill="#ef4444">
              {trainingData.filter(p => p.label === 1).map((entry, index) => (
                <Cell key={`class1-${index}`} fill="#dc2626" r={5} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Observation:</strong> Smaller k values create sharper, more complex boundaries that can overfit (higher variance). 
          Larger k values create smoother boundaries that generalize better (lower variance, but potentially higher bias).
        </p>
      </div>

      {/* Implementation */}
      {showImplementation && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">Implementation Steps</h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <div>
              <p className="font-semibold">1. Calculate distances:</p>
              <p className="text-xs ml-4">
                For each training point, compute Euclidean distance: <InlineMath math="d = \sqrt{(x_1-x_2)^2 + (y_1-y_2)^2}" />
              </p>
            </div>
            <div>
              <p className="font-semibold">2. Find k nearest:</p>
              <p className="text-xs ml-4">
                Sort distances and select the <InlineMath math="k" /> smallest distances.
              </p>
            </div>
            <div>
              <p className="font-semibold">3. Majority vote:</p>
              <p className="text-xs ml-4">
                Count class labels of k nearest neighbors and assign the most common class.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Key Characteristics:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Non-parametric: makes no assumptions about data distribution</li>
          <li>Lazy learning: no training phase, just stores data</li>
          <li>Sensitive to k: small k = high variance, large k = high bias</li>
          <li>Can be slow for large datasets (must compute distances to all points)</li>
        </ul>
      </div>
    </div>
  );
}

