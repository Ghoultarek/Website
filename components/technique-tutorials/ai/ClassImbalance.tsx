'use client';

import { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ClassImbalance() {
  const [imbalanceRatio, setImbalanceRatio] = useState(90); // Percentage of class 0
  const [useSMOTE, setUseSMOTE] = useState(false);

  // Generate imbalanced data
  const generateImbalancedData = (n: number, class0Ratio: number) => {
    const data = [];
    const n0 = Math.floor(n * class0Ratio / 100);
    const n1 = n - n0;
    
    // Class 0: outside circle (majority class)
    for (let i = 0; i < n0; i++) {
      let x, y, distFromCenter;
      // Keep generating until we get a point outside the circle
      do {
        x = Math.random() * 10;
        y = Math.random() * 10;
        distFromCenter = Math.sqrt((x - 5) ** 2 + (y - 5) ** 2);
      } while (distFromCenter < 3);
      data.push({ x, y, label: 0 });
    }
    
    // Class 1: inside circle (minority class)
    for (let i = 0; i < n1; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 2.5;
      const x = 5 + radius * Math.cos(angle);
      const y = 5 + radius * Math.sin(angle);
      data.push({ x, y, label: 1 });
    }
    
    return data;
  };

  const originalData = useMemo(() => generateImbalancedData(200, imbalanceRatio), [imbalanceRatio]);
  
  // Simple SMOTE: oversample minority class by interpolating between neighbors
  const smoteData = useMemo(() => {
    if (!useSMOTE) return originalData;
    
    const class0 = originalData.filter(d => d.label === 0);
    const class1 = originalData.filter(d => d.label === 1);
    
    // Find minority class
    const minority = class0.length < class1.length ? class0 : class1;
    const majority = class0.length < class1.length ? class1 : class0;
    const minorityLabel = class0.length < class1.length ? 0 : 1;
    
    // Need to generate enough samples to balance
    const needed = majority.length - minority.length;
    const synthetic = [];
    
    for (let i = 0; i < needed; i++) {
      // Pick random minority sample
      const base = minority[Math.floor(Math.random() * minority.length)];
      // Find nearest neighbor (simplified: just pick another random one)
      const neighbor = minority[Math.floor(Math.random() * minority.length)];
      // Interpolate
      const alpha = Math.random();
      const x = base.x + alpha * (neighbor.x - base.x);
      const y = base.y + alpha * (neighbor.y - base.y);
      synthetic.push({ x, y, label: minorityLabel });
    }
    
    return [...originalData, ...synthetic];
  }, [originalData, useSMOTE]);

  // Simple classifier: predict majority class
  const predictions = useMemo(() => {
    const class0Count = smoteData.filter(d => d.label === 0).length;
    const class1Count = smoteData.filter(d => d.label === 1).length;
    const majorityClass = class0Count > class1Count ? 0 : 1;
    
    return smoteData.map(d => ({
      ...d,
      predicted: majorityClass,
    }));
  }, [smoteData]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const tp = predictions.filter(p => p.label === 1 && p.predicted === 1).length;
    const tn = predictions.filter(p => p.label === 0 && p.predicted === 0).length;
    const fp = predictions.filter(p => p.label === 0 && p.predicted === 1).length;
    const fn = predictions.filter(p => p.label === 1 && p.predicted === 0).length;
    
    const total = tp + tn + fp + fn;
    const accuracy = total > 0 ? ((tp + tn) / total) * 100 : 0;
    const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
    
    return { tp, tn, fp, fn, accuracy, precision, recall };
  }, [predictions]);

  // Class distribution data
  const classDistribution = useMemo(() => {
    const class0 = smoteData.filter(d => d.label === 0).length;
    const class1 = smoteData.filter(d => d.label === 1).length;
    return [
      { name: 'Class 0', value: class0, color: '#3b82f6' },
      { name: 'Class 1', value: class1, color: '#ef4444' },
    ];
  }, [smoteData]);

  const barData = [
    { name: 'Class 0', count: classDistribution[0].value },
    { name: 'Class 1', count: classDistribution[1].value },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Class Imbalance</h2>
      
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700 mb-4">
          Class imbalance occurs when one class has significantly more samples than another. This is extremely common 
          in real-world problems (fraud detection, disease diagnosis, rare event prediction) and can lead to misleading 
          model performance.
        </p>

        {/* Common Pitfalls */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-3">Common Pitfalls with Imbalanced Data</h3>
          
          <div className="space-y-3 text-sm text-red-900">
            <div>
              <p className="font-semibold mb-1">1. Misleading Accuracy:</p>
              <p className="ml-4">
                A model that always predicts the majority class can achieve high accuracy. For example, if 95% of data 
                is class 0, predicting class 0 for everything gives 95% accuracy—but the model is useless!
              </p>
            </div>
            
            <div>
              <p className="font-semibold mb-1">2. Poor Minority Class Performance:</p>
              <p className="ml-4">
                The model may ignore the minority class entirely because it doesn't significantly impact overall accuracy. 
                This is catastrophic when the minority class is what we care about (e.g., fraud, disease).
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">3. Overfitting to Majority Class:</p>
              <p className="ml-4">
                With so many majority class examples, the model may memorize their patterns while failing to learn 
                meaningful patterns for the minority class.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Example */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Interactive Example: The Accuracy Trap</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class 0 Percentage: {imbalanceRatio}%
            </label>
            <input
              type="range"
              min="50"
              max="99"
              value={imbalanceRatio}
              onChange={(e) => setImbalanceRatio(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Balanced (50%)</span>
              <span>Highly Imbalanced (99%)</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useSMOTE}
                onChange={(e) => setUseSMOTE(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Apply SMOTE (Synthetic Minority Oversampling)</span>
            </label>
          </div>

          {/* Class Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Class Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Pie Chart</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={classDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {classDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Naive Classifier Results */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Naive Classifier (Always Predicts Majority Class)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-yellow-800">Accuracy:</span>
                <span className="font-semibold text-yellow-900 ml-2">{metrics.accuracy.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-yellow-800">Precision:</span>
                <span className="font-semibold text-yellow-900 ml-2">{metrics.precision.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-yellow-800">Recall:</span>
                <span className="font-semibold text-yellow-900 ml-2">{metrics.recall.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-yellow-800">TP/TN/FP/FN:</span>
                <span className="font-semibold text-yellow-900 ml-2">{metrics.tp}/{metrics.tn}/{metrics.fp}/{metrics.fn}</span>
              </div>
            </div>
            <p className="text-yellow-900 text-xs mt-2">
              <strong>Notice:</strong> High accuracy doesn't mean the model is good! Check precision and recall for the minority class.
            </p>
          </div>
        </div>

        {/* Solutions */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Solutions to Class Imbalance</h3>
          
          <div className="space-y-4">
            {/* SMOTE */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">1. SMOTE (Synthetic Minority Oversampling Technique)</h4>
              <p className="text-sm text-blue-900 mb-2">
                Creates synthetic samples for the minority class by interpolating between existing minority samples and their 
                nearest neighbors. This helps the model learn better decision boundaries.
              </p>
              <div className="bg-white border border-blue-300 rounded p-2 text-xs text-blue-800 mt-2">
                <p className="font-semibold mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Find k nearest neighbors for each minority sample</li>
                  <li>Randomly select a neighbor</li>
                  <li>Create a synthetic sample along the line between the sample and neighbor</li>
                  <li>Repeat until desired balance is achieved</li>
                </ol>
              </div>
              <p className="text-xs text-blue-800 mt-2">
                <strong>Pros:</strong> Creates realistic synthetic data, helps with decision boundaries<br />
                <strong>Cons:</strong> Can create noise if minority class has outliers, computationally expensive
              </p>
            </div>

            {/* Other Methods */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">2. Other Common Methods</h4>
              
              <div className="space-y-3 text-sm text-green-900">
                <div>
                  <p className="font-semibold mb-1">Undersampling:</p>
                  <p className="ml-4 text-xs">
                    Randomly remove samples from the majority class. Simple but loses information. Use when you have 
                    plenty of majority class data.
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1">Oversampling:</p>
                  <p className="ml-4 text-xs">
                    Duplicate minority class samples. Simple but can lead to overfitting. Less effective than SMOTE.
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1">Class Weights:</p>
                  <p className="ml-4 text-xs">
                    Assign higher weights to minority class samples during training. The model pays more attention to 
                    correctly classifying minority samples. No data modification needed.
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1">Cost-Sensitive Learning:</p>
                  <p className="ml-4 text-xs">
                    Assign different costs to different types of errors (e.g., false negatives cost more than false positives). 
                    The model optimizes for the cost function rather than accuracy.
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1">Ensemble Methods:</p>
                  <p className="ml-4 text-xs">
                    Use techniques like EasyEnsemble or BalanceCascade that combine multiple balanced subsets of data 
                    to train ensemble models.
                  </p>
                </div>
              </div>
            </div>

            {/* Evaluation Metrics */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">3. Better Evaluation Metrics</h4>
              <p className="text-sm text-purple-900 mb-2">
                Don't rely on accuracy alone! Use metrics that account for class imbalance:
              </p>
              <ul className="text-sm text-purple-900 space-y-1 list-disc list-inside ml-4">
                <li><strong>Precision:</strong> <InlineMath math="\frac{TP}{TP + FP}" /> - When we predict positive, how often are we right?</li>
                <li><strong>Recall:</strong> <InlineMath math="\frac{TP}{TP + FN}" /> - Of all positives, how many did we catch?</li>
                <li><strong>F1-Score:</strong> <InlineMath math="2 \times \frac{Precision \times Recall}{Precision + Recall}" /> - Harmonic mean of precision and recall</li>
                <li><strong>ROC-AUC:</strong> Area under the ROC curve - Measures ability to distinguish between classes</li>
                <li><strong>PR-AUC:</strong> Area under the Precision-Recall curve - Better for imbalanced data than ROC-AUC</li>
                <li><strong>Confusion Matrix:</strong> Visual representation of all prediction types</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside ml-4">
            <li>Always check class distribution before training</li>
            <li>Use appropriate metrics (F1, PR-AUC) instead of accuracy</li>
            <li>Consider the business cost of different error types</li>
            <li>Try multiple techniques and compare results</li>
            <li>Validate on realistic test sets that maintain the imbalance</li>
            <li>Consider collecting more minority class data if possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

