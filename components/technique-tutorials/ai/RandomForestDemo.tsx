'use client';

import { useState, useMemo, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

interface TreeNode {
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number;
}

interface DataPoint {
  x: number;
  y: number;
  label: number;
  predicted?: number;
}

interface RandomForestDemoProps {
  trainingData?: DataPoint[];
  testData?: DataPoint[];
  onPredictionsChange?: (predictions: DataPoint[]) => void;
}

export default function RandomForestDemo({ 
  trainingData: propTrainingData, 
  testData: propTestData,
  onPredictionsChange 
}: RandomForestDemoProps = {} as RandomForestDemoProps) {
  const [nEstimators, setNEstimators] = useState(5);
  const [maxDepth, setMaxDepth] = useState(3);
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);

  // Generate classification problem: circular boundary (fallback if not provided)
  const generateData = (n: number): DataPoint[] => {
    const data: DataPoint[] = [];
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 10;
      const y = Math.random() * 10;
      // Circular decision boundary: inside circle = class 1, outside = class 0
      const distFromCenter = Math.sqrt((x - 5) ** 2 + (y - 5) ** 2);
      const label = distFromCenter < 3 ? 1 : 0;
      data.push({ x, y, label });
    }
    return data;
  };

  const trainingData = useMemo(() => propTrainingData || generateData(150), [propTrainingData]);
  const testData = useMemo(() => {
    if (propTestData && propTestData.length > 0) {
      return propTestData;
    }
    return generateData(50);
  }, [propTestData]);

  // Simplified decision tree implementation
  const buildTree = (data: DataPoint[], depth: number): TreeNode => {
    if (depth >= maxDepth || data.length < 5) {
      const ones = data.filter(d => d.label === 1).length;
      return { prediction: ones > data.length / 2 ? 1 : 0 };
    }

    // Find best split (simplified: try mean threshold)
    const feature = Math.random() > 0.5 ? 0 : 1;
    const threshold = feature === 0 
      ? data.reduce((sum, d) => sum + d.x, 0) / data.length
      : data.reduce((sum, d) => sum + d.y, 0) / data.length;

    const left = data.filter(d => (feature === 0 ? d.x : d.y) <= threshold);
    const right = data.filter(d => (feature === 0 ? d.x : d.y) > threshold);

    if (left.length === 0 || right.length === 0) {
      const ones = data.filter(d => d.label === 1).length;
      return { prediction: ones > data.length / 2 ? 1 : 0 };
    }

    return {
      feature,
      threshold,
      left: buildTree(left, depth + 1),
      right: buildTree(right, depth + 1),
    };
  };

  // Build forest
  const forest = useMemo(() => {
    const trees: TreeNode[] = [];
    for (let i = 0; i < nEstimators; i++) {
      const bootstrap = Array.from({ length: trainingData.length }, () => 
        trainingData[Math.floor(Math.random() * trainingData.length)]
      );
      trees.push(buildTree(bootstrap, 0));
    }
    return trees;
  }, [nEstimators, maxDepth, trainingData]);

  // Predict with forest
  const predict = (x: number, y: number, tree: TreeNode): number => {
    if (tree.prediction !== undefined) return tree.prediction;
    if (tree.feature === undefined || tree.threshold === undefined) return 0;
    
    const value = tree.feature === 0 ? x : y;
    return value <= tree.threshold 
      ? predict(x, y, tree.left!)
      : predict(x, y, tree.right!);
  };

  const predictForest = (x: number, y: number): number[] => {
    return forest.map(tree => predict(x, y, tree));
  };

  // Get individual tree predictions for a sample point
  const samplePoint = useMemo(() => {
    const idx = Math.min(selectedPointIndex, testData.length - 1);
    return testData[idx] || testData[0];
  }, [testData, selectedPointIndex]);
  const treePredictions = useMemo(() => {
    return predictForest(samplePoint.x, samplePoint.y);
  }, [samplePoint, forest]);

  // Add predictions to test data
  const testDataWithPredictions = useMemo(() => {
    return testData.map(point => {
      const votes = predictForest(point.x, point.y);
      const ones = votes.filter(p => p === 1).length;
      return {
        ...point,
        predicted: ones > votes.length / 2 ? 1 : 0,
        votes: votes,
        voteCount: { class0: votes.length - ones, class1: ones },
      };
    });
  }, [testData, forest]);

  // Notify parent of predictions change (only if using prop data)
  useEffect(() => {
    if (onPredictionsChange && propTestData && propTestData.length > 0 && testDataWithPredictions.length === propTestData.length) {
      onPredictionsChange(testDataWithPredictions);
    }
  }, [testDataWithPredictions, onPredictionsChange, propTestData]);

  // Sample predictions table
  const samplePredictions = useMemo(() => {
    return testDataWithPredictions.slice(0, 10).map((point, idx) => ({
      id: idx + 1,
      x: point.x.toFixed(2),
      y: point.y.toFixed(2),
      trueLabel: point.label,
      predicted: point.predicted,
      votes: `${point.voteCount.class0} vs ${point.voteCount.class1}`,
      correct: point.label === point.predicted ? '✓' : '✗',
    }));
  }, [testDataWithPredictions]);

  // Calculate accuracy
  const accuracy = useMemo(() => {
    let correct = 0;
    testDataWithPredictions.forEach(point => {
      if (point.predicted === point.label) correct++;
    });
    return (correct / testDataWithPredictions.length) * 100;
  }, [testDataWithPredictions]);

  // Training curve
  const trainingCurve = useMemo(() => {
    const curve: Array<{ trees: number; accuracy: number }> = [];
    for (let n = 1; n <= nEstimators; n++) {
      const tempForest = forest.slice(0, n);
      let correct = 0;
      testData.forEach(point => {
        const predictions = tempForest.map(tree => predict(point.x, point.y, tree));
        const ones = predictions.filter(p => p === 1).length;
        const pred = ones > predictions.length / 2 ? 1 : 0;
        if (pred === point.label) correct++;
      });
      curve.push({ trees: n, accuracy: (correct / testData.length) * 100 });
    }
    return curve;
  }, [forest, testData, nEstimators]);

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Random Forest</h2>
      
      <p className="text-gray-700 dark:text-white mb-6">
        Random Forest is an ensemble method that combines multiple decision trees. Each tree is trained on a bootstrap 
        sample of the data, and predictions are made by majority voting. This reduces overfitting compared to a single tree.
      </p>

      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-900 dark:text-yellow-200">
          <strong>Note:</strong> This demo uses synthetic, well-separated data for educational purposes. In real-world applications, 
          data is often noisy, imbalanced, and contains outliers, so achieving 100% accuracy is extremely rare. 
          Typical accuracies range from 70-95% depending on the problem complexity and data quality.
        </p>
      </div>

      {/* Library Usage Section */}
      <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">1. Using scikit-learn</h3>
        <div className="bg-white dark:bg-[#0D0D0D] rounded p-3 font-mono text-sm mb-3">
          <pre className="text-xs text-gray-900 dark:text-white">{`from sklearn.ensemble import RandomForestClassifier

# Create and train
rf = RandomForestClassifier(
    n_estimators=${nEstimators},
    max_depth=${maxDepth},
    random_state=42
)
rf.fit(X_train, y_train)

# Predict
predictions = rf.predict(X_test)
accuracy = rf.score(X_test, y_test)`}</pre>
        </div>
        <p className="text-sm text-green-800 dark:text-green-200">
          This is how you'd use Random Forest in practice. Now let's see how it works internally.
        </p>
      </div>

      {/* Explanation - Always Visible */}
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-4 text-lg">How Random Forest Works</h4>
        
        <div className="space-y-4 text-sm text-yellow-900 dark:text-yellow-200">
          <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Step 1: Create Many Different Trees</h5>
            <p className="mb-2">
              Imagine you're trying to predict whether someone will like a movie. Instead of asking one person, 
              you ask many people and take a vote. Random Forest does the same thing, but with decision trees.
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 italic">
              Each tree is trained on a random sample of the data (bootstrap sampling). This is like each person 
              seeing a different subset of movies before making their decision.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Step 2: How Each Tree Makes Decisions</h5>
            <p className="mb-2">
              Each tree asks a series of yes/no questions to classify a point. For example:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
              <li>"Is Feature 1 greater than 5?" → If yes, go left; if no, go right</li>
              <li>"Is Feature 2 less than 3?" → Continue splitting</li>
              <li>Eventually reach a leaf node that says "This is Class 0" or "This is Class 1"</li>
            </ul>
            <p className="text-xs text-gray-700 dark:text-gray-300 italic mt-2">
              The tree keeps splitting until it reaches a certain depth or has too few points to split further.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Step 3: Voting</h5>
            <p className="mb-2">
              When we need to classify a new point, each tree makes its prediction. Then we count the votes:
            </p>
            <div className="bg-gray-50 dark:bg-[#171717] rounded p-3 my-2 font-mono text-xs text-gray-900 dark:text-white">
              Tree 1 says: Class 0<br />
              Tree 2 says: Class 1<br />
              Tree 3 says: Class 0<br />
              Tree 4 says: Class 0<br />
              Tree 5 says: Class 1<br />
              <br />
              Result: Class 0 wins (3 votes vs 2 votes)
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 italic">
              This is called <strong>majority voting</strong> or <strong>ensemble prediction</strong>.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Why This Works Better Than One Tree</h5>
            <p className="mb-2">
              Think of it like this: One person might have strong opinions based on limited experience. 
              But if you ask 100 people, their average opinion is usually more reliable.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
              <li><strong>Reduces Overfitting:</strong> One tree might memorize the training data. Many trees average out these mistakes.</li>
              <li><strong>More Robust:</strong> If one tree makes a bad decision, others compensate.</li>
              <li><strong>Handles Complexity:</strong> Different trees might focus on different patterns in the data.</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-semibold text-blue-900 mb-1">Real-World Analogy</h5>
            <p className="text-xs text-blue-800">
              Random Forest is like a committee of experts. Each expert (tree) has their own perspective, 
              but together they make better decisions than any single expert alone. The more experts you have 
              (more trees), the better the final decision—up to a point.
            </p>
          </div>
        </div>
      </div>

      {/* Tabular Data Section */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Classification Problem: Sample Data</h3>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Training Data Sample (First 10 points)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">ID</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 1 (X)</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 2 (Y)</th>
                  <th className="border border-gray-300 p-2 text-left">True Label</th>
                </tr>
              </thead>
              <tbody>
                {trainingData.slice(0, 10).map((point, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2">{idx + 1}</td>
                    <td className="border border-gray-300 p-2">{point.x.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2">{point.y.toFixed(2)}</td>
                    <td className={`border border-gray-300 p-2 font-semibold ${
                      point.label === 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      Class {point.label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Test Data Predictions</h4>
          <p className="text-xs text-gray-600 mb-2">
            Each tree votes, and we take the majority. Here's how {nEstimators} trees voted on sample test points:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">ID</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 1</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 2</th>
                  <th className="border border-gray-300 p-2 text-left">True Label</th>
                  <th className="border border-gray-300 p-2 text-left">Votes (Class 0 vs Class 1)</th>
                  <th className="border border-gray-300 p-2 text-left">Predicted</th>
                  <th className="border border-gray-300 p-2 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {samplePredictions.map((row) => (
                  <tr key={row.id} className={row.id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2">{row.id}</td>
                    <td className="border border-gray-300 p-2">{row.x}</td>
                    <td className="border border-gray-300 p-2">{row.y}</td>
                    <td className={`border border-gray-300 p-2 font-semibold ${
                      row.trueLabel === 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      Class {row.trueLabel}
                    </td>
                    <td className="border border-gray-300 p-2 font-mono">{row.votes}</td>
                    <td className={`border border-gray-300 p-2 font-semibold ${
                      row.predicted === 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      Class {row.predicted}
                    </td>
                    <td className={`border border-gray-300 p-2 font-bold ${
                      row.correct === '✓' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {row.correct}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Example: How Voting Works</h4>
          <p className="text-xs text-blue-800 mb-2">
            For point #{samplePredictions[0]?.id || 1} (X={samplePoint.x.toFixed(2)}, Y={samplePoint.y.toFixed(2)}), 
            here's how each tree voted:
          </p>
          <div className="bg-white rounded p-2 font-mono text-xs">
            {treePredictions.map((pred, idx) => (
              <div key={idx} className="mb-1">
                Tree {idx + 1}: Class {pred}
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-300 font-semibold">
              Majority Vote: Class {samplePoint.label === 0 ? 
                (treePredictions.filter(p => p === 0).length > treePredictions.length / 2 ? 0 : 1) :
                (treePredictions.filter(p => p === 1).length > treePredictions.length / 2 ? 1 : 0)
              } 
              ({treePredictions.filter(p => p === (treePredictions.filter(p => p === 1).length > treePredictions.length / 2 ? 1 : 0)).length} out of {nEstimators} trees)
            </div>
            <div className={`mt-1 text-xs ${
              (treePredictions.filter(p => p === 1).length > treePredictions.length / 2 ? 1 : 0) === samplePoint.label 
                ? 'text-green-600' : 'text-red-600'
            }`}>
              True Label: Class {samplePoint.label} - {
                (treePredictions.filter(p => p === 1).length > treePredictions.length / 2 ? 1 : 0) === samplePoint.label 
                  ? 'Correct!' : 'Wrong'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Number of Trees (n_estimators): {nEstimators}
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={nEstimators}
              onChange={(e) => setNEstimators(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">More trees = better accuracy, but slower</p>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Max Depth: {maxDepth}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">Deeper trees = more complex, risk of overfitting</p>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Example Point: #{selectedPointIndex + 1} of {testData.length}
            </label>
            <input
              type="range"
              min="0"
              max={Math.min(testData.length - 1, 9)}
              value={selectedPointIndex}
              onChange={(e) => setSelectedPointIndex(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Point: ({samplePoint.x.toFixed(2)}, {samplePoint.y.toFixed(2)}), True Label: Class {samplePoint.label}
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm font-semibold text-blue-900">Number of Trees</p>
            <p className="text-2xl font-bold text-blue-700">{nEstimators}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-sm font-semibold text-green-900">Test Accuracy</p>
            <p className="text-2xl font-bold text-green-700">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded p-4">
            <p className="text-sm font-semibold text-purple-900">Max Depth</p>
            <p className="text-2xl font-bold text-purple-700">{maxDepth}</p>
          </div>
        </div>

        {/* Training Curve */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Accuracy vs Number of Trees</h4>
          <p className="text-sm text-gray-600 mb-2">
            As we add more trees, the accuracy generally improves. Each tree votes, and we take the majority.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trainingCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="trees" label={{ value: 'Number of Trees', position: 'insideBottom', offset: -5 }} stroke="#6b7280" />
              <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} name="Test Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visualization (Secondary) */}
      <div className="mb-6 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Visual Representation</h3>
        <p className="text-sm text-gray-700 dark:text-white mb-4">
          Here's a visual view of the classification problem. Blue points are Class 0, red points are Class 1.
        </p>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Test Data Predictions</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name="Feature 1" domain={[0, 10]} stroke="#6b7280" />
              <YAxis type="number" dataKey="y" name="Feature 2" domain={[0, 10]} stroke="#6b7280" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Class 0 (Correct)" data={testDataWithPredictions.filter(p => p.label === 0 && p.predicted === 0)} fill="#3b82f6">
                {testDataWithPredictions.filter(p => p.label === 0 && p.predicted === 0).map((entry, index) => (
                  <Cell key={`test-0-${index}`} fill="#3b82f6" />
                ))}
              </Scatter>
              <Scatter name="Class 1 (Correct)" data={testDataWithPredictions.filter(p => p.label === 1 && p.predicted === 1)} fill="#ef4444">
                {testDataWithPredictions.filter(p => p.label === 1 && p.predicted === 1).map((entry, index) => (
                  <Cell key={`test-1-${index}`} fill="#ef4444" />
                ))}
              </Scatter>
              <Scatter name="Misclassified" data={testDataWithPredictions.filter(p => p.label !== p.predicted)} fill="#6b7280">
                {testDataWithPredictions.filter(p => p.label !== p.predicted).map((entry, index) => (
                  <Cell key={`wrong-${index}`} fill="#6b7280" r={6} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Gray points are misclassified. Hover over points to see predictions.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Key Advantages:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Reduces overfitting compared to single decision trees</li>
          <li>Handles non-linear relationships and feature interactions</li>
          <li>Provides feature importance scores</li>
          <li>Works well with default hyperparameters</li>
        </ul>
      </div>
    </div>
  );
}
