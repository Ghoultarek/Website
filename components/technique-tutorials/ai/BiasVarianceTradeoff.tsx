'use client';

import { useState, useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BiasVarianceTradeoff() {
  const [modelComplexity, setModelComplexity] = useState(5);

  // Generate synthetic data with noise - using a fixed seed for reproducibility
  const generateData = (n: number, seed: number = 0) => {
    // Simple seeded random for consistency
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    const data = [];
    for (let i = 0; i < n; i++) {
      // X values from 0 to 10, evenly spaced
      const x = (i / (n - 1)) * 10;
      // True function: quadratic with some curvature: -0.05*x^2 + 0.5*x - 0.5
      // This gives a nice curve that goes up then down
      const trueY = -0.05 * x * x + 0.5 * x - 0.5;
      // Add noise
      const noise = (seededRandom() - 0.5) * 0.3;
      const y = trueY + noise;
      data.push({ x, y });
    }
    return data;
  };

  // Generate training and test data with different seeds but same underlying function
  // Use the same x values for both to ensure they're on the same scale
  const xValues = useMemo(() => {
    const values = [];
    for (let i = 0; i < 20; i++) {
      values.push((i / 19) * 10);
    }
    return values;
  }, []);

  const generateDataAtX = (xVals: number[], seed: number) => {
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    return xVals.map(x => {
      // Highly complex function: multiple frequencies, polynomial terms, and non-linear components
      // This creates a very intricate pattern with many local extrema
      const trueY = 
        2.5 * Math.sin(x * 0.7) +                    // Primary oscillation
        1.2 * Math.cos(x * 1.8) +                     // Secondary oscillation
        0.8 * Math.sin(x * 3.2) +                     // High frequency component
        0.4 * Math.cos(x * 4.5) +                     // Very high frequency
        -0.15 * x * x +                              // Quadratic trend
        0.25 * x * x * x / 10 -                       // Cubic component
        0.3 * x +                                    // Linear trend
        -1.2 * Math.exp(-x / 2.5) +                  // Exponential decay
        0.6 * Math.sin(x * 0.5) * Math.cos(x * 1.3) + // Product of oscillations
        0.3 * Math.sin(x * x / 8);                    // Non-linear frequency modulation
      const noise = (seededRandom() - 0.5) * 0.5;
      return { x, y: trueY + noise };
    });
  };

  const trainingData = useMemo(() => generateDataAtX(xValues, 12345), [xValues]);
  const testData = useMemo(() => {
    // Use every other x value for test data to ensure same scale
    const testXVals = xValues.filter((_, i) => i % 2 === 0).slice(0, 15);
    return generateDataAtX(testXVals, 67890);
  }, [xValues]);

  // Polynomial regression using least squares - fit to trainingData
  const modelFit = useMemo(() => {
    const data = trainingData; // Explicitly use trainingData
    const degree = Math.min(modelComplexity, data.length - 1); // Can't fit degree >= n points
    const n = data.length;
    const m = degree + 1;
    
    // Normalize x values to [0, 1] for numerical stability
    const xMin = Math.min(...data.map(d => d.x));
    const xMax = Math.max(...data.map(d => d.x));
    const xRange = xMax - xMin || 1;
    const normalizedData = data.map(d => ({
      x: (d.x - xMin) / xRange,
      y: d.y
    }));
    
    // Build Vandermonde matrix with normalized x
    const X: number[][] = [];
    const y: number[] = [];
    
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < m; j++) {
        row.push(Math.pow(normalizedData[i].x, j));
      }
      X.push(row);
      y.push(normalizedData[i].y);
    }
    
    // Solve normal equations: (X^T * X) * coeffs = X^T * y
    const XTX: number[][] = [];
    const XTy: number[] = [];
    
    for (let i = 0; i < m; i++) {
      XTX.push(new Array(m).fill(0));
      XTy.push(0);
    }
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        for (let k = 0; k < m; k++) {
          XTX[j][k] += X[i][j] * X[i][k];
        }
        XTy[j] += X[i][j] * y[i];
      }
    }
    
    // Add L2 regularization (Ridge regression) for numerical stability
    const lambda = 1e-6;
    for (let i = 0; i < m; i++) {
      XTX[i][i] += lambda;
    }
    
    // Simple Gaussian elimination to solve
    const coeffs = new Array(m).fill(0);
    const A = XTX.map(row => [...row]);
    const b = [...XTy];
    
    // Forward elimination with partial pivoting
    for (let i = 0; i < m; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < m; k++) {
        if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      [b[i], b[maxRow]] = [b[maxRow], b[i]];
      
      // Skip if pivot is too small
      if (Math.abs(A[i][i]) < 1e-12) {
        continue;
      }
      
      // Eliminate
      for (let k = i + 1; k < m; k++) {
        const factor = A[k][i] / A[i][i];
        for (let j = i; j < m; j++) {
          A[k][j] -= factor * A[i][j];
        }
        b[k] -= factor * b[i];
      }
    }
    
    // Back substitution
    for (let i = m - 1; i >= 0; i--) {
      coeffs[i] = b[i];
      for (let j = i + 1; j < m; j++) {
        coeffs[i] -= A[i][j] * coeffs[j];
      }
      if (Math.abs(A[i][i]) > 1e-12) {
        coeffs[i] /= A[i][i];
      }
    }
    
    // Generate predictions for visualization (using normalized x, then denormalize)
    const predictions = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 10;
      const xNorm = (x - xMin) / xRange;
      let predY = 0;
      for (let d = 0; d < m; d++) {
        predY += coeffs[d] * Math.pow(xNorm, d);
      }
      predictions.push({ x, y: predY });
    }
    
    return predictions;
  }, [trainingData, modelComplexity]);


  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bias-Variance Tradeoff</h2>
      
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700 mb-4">
          The bias-variance tradeoff is one of the most fundamental concepts in machine learning. It helps us understand 
          why models make mistakes and how to improve them.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Understanding Bias and Variance</h3>
          
          <div className="space-y-3 text-sm text-blue-900">
            <div>
              <p className="font-semibold mb-1">Bias:</p>
              <p className="ml-4">
                The error from <strong>oversimplifying</strong> the problem. High bias means the model is too simple 
                and misses important patterns (underfitting). Think of it as consistently missing the target.
              </p>
            </div>
            
            <div>
              <p className="font-semibold mb-1">Variance:</p>
              <p className="ml-4">
                The error from being <strong>too sensitive</strong> to small fluctuations in training data. High variance 
                means the model memorizes noise instead of learning the underlying pattern (overfitting). Think of it as 
                being inconsistent—hitting different spots each time.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">The Tradeoff:</p>
              <p className="ml-4">
                As model complexity increases, bias decreases but variance increases. The goal is to find the sweet spot 
                where total error (bias + variance) is minimized.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Example */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Visual Example: Model Complexity</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Complexity (Polynomial Degree): {modelComplexity}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={modelComplexity}
              onChange={(e) => setModelComplexity(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Simple (High Bias)</span>
              <span>Complex (High Variance)</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="x" 
                  domain={[0, 10]}
                  type="number"
                />
                <YAxis 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  type="number"
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  data={trainingData} 
                  dataKey="y" 
                  name="Observed Data" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  data={modelFit} 
                  dataKey="y" 
                  name="Model Fit" 
                  stroke="#10b981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="text-yellow-900">
              <strong>Observe:</strong> As complexity increases, the model fits training data better but may perform worse 
              on test data. This is the overfitting problem—high variance.
            </p>
          </div>
        </div>

        {/* Bias-Variance Decomposition */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Bias-Variance Decomposition</h3>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <BlockMath math="\text{Total Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}" />
          </div>

          <p className="text-gray-700 mb-4 text-sm">
            The total error of a model can be decomposed into three components:
          </p>

          <ul className="list-disc list-inside text-gray-700 text-sm space-y-2 mb-4 ml-4">
            <li><strong>Bias²:</strong> How far off the model's average prediction is from the true value</li>
            <li><strong>Variance:</strong> How much the model's predictions vary across different training sets</li>
            <li><strong>Irreducible Error:</strong> Noise inherent in the data that cannot be reduced</li>
          </ul>
        </div>

        {/* Practical Implications */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Practical Implications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">High Bias (Underfitting)</h4>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                <li>Model is too simple</li>
                <li>Misses important patterns</li>
                <li>Poor performance on both training and test data</li>
                <li><strong>Solution:</strong> Increase model complexity, add features</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">High Variance (Overfitting)</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Model is too complex</li>
                <li>Memorizes training data</li>
                <li>Good on training, poor on test</li>
                <li><strong>Solution:</strong> Reduce complexity, add regularization, get more data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Connection to Algorithms */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Connection to Our Algorithms</h3>
          <div className="text-sm text-green-900 space-y-2">
            <p>
              <strong>Decision Trees:</strong> Can easily overfit (high variance) if grown too deep. 
              We limit depth to control variance.
            </p>
            <p>
              <strong>Random Forest:</strong> Reduces variance by averaging many trees (bagging). 
              Each tree has high variance, but averaging reduces it.
            </p>
            <p>
              <strong>XGBoost:</strong> Controls both bias and variance through:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Sequential learning (reduces bias)</li>
              <li>Regularization terms (reduces variance)</li>
              <li>Tree depth limits (reduces variance)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

