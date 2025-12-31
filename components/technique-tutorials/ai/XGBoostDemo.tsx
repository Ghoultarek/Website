'use client';

import { useState, useMemo, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

interface DataPoint {
  x: number;
  y: number;
  label: number;
  predicted?: number;
  probability?: number;
}

interface TreeNode {
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number; // Prediction value for this node
}

interface XGBoostDemoProps {
  trainingData?: DataPoint[];
  testData?: DataPoint[];
  onPredictionsChange?: (predictions: DataPoint[]) => void;
}

export default function XGBoostDemo({ 
  trainingData: propTrainingData, 
  testData: propTestData,
  onPredictionsChange 
}: XGBoostDemoProps = {} as XGBoostDemoProps) {
  const [nEstimators, setNEstimators] = useState(10);
  const [learningRate, setLearningRate] = useState(0.1);
  const [maxDepth, setMaxDepth] = useState(3);
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [selectedIteration, setSelectedIteration] = useState(10);

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

  // Calculate gradient for binary classification (logistic loss)
  const calculateGradient = (pred: number, actual: number): number => {
    // For logistic loss: gradient = sigmoid(pred) - actual
    // But we're working with probabilities directly, so: gradient = pred - actual
    return pred - actual;
  };

  // Calculate hessian (second derivative) for regularization
  const calculateHessian = (pred: number): number => {
    // For logistic loss: hessian = pred * (1 - pred)
    return Math.max(0.01, pred * (1 - pred)); // Clamp to avoid division by zero
  };

  // Build a regression tree to predict gradients
  const buildTree = (
    data: DataPoint[],
    gradients: number[],
    hessians: number[],
    depth: number
  ): TreeNode => {
    // Leaf node: return optimal value
    if (depth >= maxDepth || data.length < 5) {
      const sumGrad = gradients.reduce((s, g) => s + g, 0);
      const sumHess = hessians.reduce((s, h) => s + h, 0);
      const value = sumHess > 0 ? sumGrad / sumHess : 0;
      return { value };
    }

    // Find best split
    let bestFeature = 0;
    let bestThreshold = 0;
    let bestGain = -Infinity;

    // Try both features
    for (let feat = 0; feat < 2; feat++) {
      // Get sorted values
      const values = data.map((d, i) => ({
        val: feat === 0 ? d.x : d.y,
        grad: gradients[i],
        hess: hessians[i],
        idx: i,
      })).sort((a, b) => a.val - b.val);

      // Try splits between consecutive values
      for (let i = 1; i < values.length; i++) {
        const threshold = (values[i - 1].val + values[i].val) / 2;

        // Calculate gain for this split
        let leftGrad = 0, leftHess = 0;
        let rightGrad = 0, rightHess = 0;

        for (let j = 0; j < values.length; j++) {
          if (values[j].val <= threshold) {
            leftGrad += values[j].grad;
            leftHess += values[j].hess;
          } else {
            rightGrad += values[j].grad;
            rightHess += values[j].hess;
          }
        }

        if (leftHess === 0 || rightHess === 0) continue;

        // Calculate gain (simplified XGBoost gain formula)
        const parentGrad = gradients.reduce((s, g) => s + g, 0);
        const parentHess = hessians.reduce((s, h) => s + h, 0);
        const parentScore = parentHess > 0 ? (parentGrad ** 2) / parentHess : 0;
        const leftScore = (leftGrad ** 2) / leftHess;
        const rightScore = (rightGrad ** 2) / rightHess;
        const gain = leftScore + rightScore - parentScore;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feat;
          bestThreshold = threshold;
        }
      }
    }

    // If no good split found, return leaf
    if (bestGain <= 0) {
      const sumGrad = gradients.reduce((s, g) => s + g, 0);
      const sumHess = hessians.reduce((s, h) => s + h, 0);
      const value = sumHess > 0 ? sumGrad / sumHess : 0;
      return { value };
    }

    // Split data
    const leftData: DataPoint[] = [];
    const leftGrads: number[] = [];
    const leftHessians: number[] = [];
    const rightData: DataPoint[] = [];
    const rightGrads: number[] = [];
    const rightHessians: number[] = [];

    data.forEach((point, idx) => {
      const val = bestFeature === 0 ? point.x : point.y;
      if (val <= bestThreshold) {
        leftData.push(point);
        leftGrads.push(gradients[idx]);
        leftHessians.push(hessians[idx]);
      } else {
        rightData.push(point);
        rightGrads.push(gradients[idx]);
        rightHessians.push(hessians[idx]);
      }
    });

    if (leftData.length === 0 || rightData.length === 0) {
      const sumGrad = gradients.reduce((s, g) => s + g, 0);
      const sumHess = hessians.reduce((s, h) => s + h, 0);
      const value = sumHess > 0 ? sumGrad / sumHess : 0;
      return { value };
    }

    return {
      feature: bestFeature,
      threshold: bestThreshold,
      left: buildTree(leftData, leftGrads, leftHessians, depth + 1),
      right: buildTree(rightData, rightGrads, rightHessians, depth + 1),
    };
  };

  // Predict using tree
  const predictTree = (x: number, y: number, tree: TreeNode): number => {
    if (tree.value !== undefined) return tree.value;
    if (tree.feature === undefined || tree.threshold === undefined) return 0;

    const val = tree.feature === 0 ? x : y;
    return val <= tree.threshold
      ? predictTree(x, y, tree.left!)
      : predictTree(x, y, tree.right!);
  };

  // Build full XGBoost model
  const { trees, allTrainPreds, allTestPreds } = useMemo(() => {
    // Initialize predictions (log-odds, converted to probability)
    let trainPreds = trainingData.map(() => 0); // Start with log-odds = 0 (prob = 0.5)
    let testPreds = testData.map(() => 0);
    const trees: TreeNode[] = [];
    const allTrainPreds: number[][] = [trainPreds.map(p => 1 / (1 + Math.exp(-p)))]; // Convert to probability
    const allTestPreds: number[][] = [testPreds.map(p => 1 / (1 + Math.exp(-p)))];

    for (let iter = 0; iter < nEstimators; iter++) {
      // Calculate gradients and hessians
      const gradients = trainingData.map((point, idx) => {
        const prob = 1 / (1 + Math.exp(-trainPreds[idx])); // Convert log-odds to probability
        return calculateGradient(prob, point.label);
      });

      const hessians = trainingData.map((_, idx) => {
        const prob = 1 / (1 + Math.exp(-trainPreds[idx]));
        return calculateHessian(prob);
      });

      // Build tree to predict gradients
      const tree = buildTree(trainingData, gradients, hessians, 0);
      trees.push(tree);

      // Update training predictions (in log-odds space)
      trainPreds = trainPreds.map((pred, idx) => {
        const treeOutput = predictTree(trainingData[idx].x, trainingData[idx].y, tree);
        return pred - learningRate * treeOutput; // Negative because we're minimizing
      });

      // Update test predictions
      testPreds = testPreds.map((pred, idx) => {
        const treeOutput = predictTree(testData[idx].x, testData[idx].y, tree);
        return pred - learningRate * treeOutput;
      });

      // Store probabilities (for display)
      allTrainPreds.push(trainPreds.map(p => 1 / (1 + Math.exp(-p))));
      allTestPreds.push(testPreds.map(p => 1 / (1 + Math.exp(-p))));
    }

    return { trees, allTrainPreds, allTestPreds };
  }, [trainingData, testData, nEstimators, learningRate, maxDepth]);

  // Get predictions for test data at selected iteration
  const testDataWithPredictions = useMemo(() => {
    const iter = Math.min(selectedIteration, allTestPreds.length - 1);
    const probs = allTestPreds[iter] || allTestPreds[0];
    return testData.map((point, idx) => {
      const prob = probs[idx] || 0.5;
      return {
        ...point,
        predicted: prob > 0.5 ? 1 : 0,
        probability: prob,
      };
    });
  }, [testData, allTestPreds, selectedIteration]);

  // Notify parent of predictions change (use final iteration, only if using prop data)
  useEffect(() => {
    if (onPredictionsChange && propTestData && propTestData.length > 0 && allTestPreds.length > 0 && testData.length === propTestData.length) {
      const finalProbs = allTestPreds[allTestPreds.length - 1];
      if (finalProbs && finalProbs.length === testData.length) {
        const finalPredictions = testData.map((point, idx) => {
          const prob = finalProbs[idx] || 0.5;
          return {
            ...point,
            predicted: prob > 0.5 ? 1 : 0,
            probability: prob,
          };
        });
        onPredictionsChange(finalPredictions);
      }
    }
  }, [testData, allTestPreds, onPredictionsChange, propTestData]);

  // Get selected point
  const selectedPoint = useMemo(() => {
    const idx = Math.min(selectedPointIndex, testData.length - 1);
    return testData[idx] || testData[0];
  }, [testData, selectedPointIndex]);

  // Get history for selected point
  const selectedPointHistory = useMemo(() => {
    return allTestPreds.map((probs, iter) => {
      const prob = probs[selectedPointIndex] || 0.5;
      return {
        iteration: iter,
        probability: prob,
        predicted: prob > 0.5 ? 1 : 0,
        error: prob - selectedPoint.label,
      };
    });
  }, [allTestPreds, selectedPointIndex, selectedPoint]);

  // Calculate accuracy
  const accuracy = useMemo(() => {
    let correct = 0;
    testDataWithPredictions.forEach(point => {
      if (point.predicted === point.label) correct++;
    });
    return (correct / testDataWithPredictions.length) * 100;
  }, [testDataWithPredictions]);

  // Accuracy curve
  const accuracyCurve = useMemo(() => {
    return allTestPreds.map((probs, iter) => {
      let correct = 0;
      testData.forEach((point, idx) => {
        const prob = probs[idx] || 0.5;
        const pred = prob > 0.5 ? 1 : 0;
        if (pred === point.label) correct++;
      });
      return { iteration: iter, accuracy: (correct / testData.length) * 100 };
    });
  }, [allTestPreds, testData]);

  const finalAccuracy = accuracyCurve[accuracyCurve.length - 1]?.accuracy || 0;

  // Sample predictions table
  const samplePredictions = useMemo(() => {
    return testDataWithPredictions.slice(0, 10).map((point, idx) => ({
      id: idx + 1,
      x: point.x.toFixed(2),
      y: point.y.toFixed(2),
      trueLabel: point.label,
      probability: (point.probability || 0) * 100,
      predicted: point.predicted,
      correct: point.label === point.predicted ? '✓' : '✗',
    }));
  }, [testDataWithPredictions]);

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">XGBoost (Extreme Gradient Boosting)</h2>
      
      <p className="text-gray-700 dark:text-white mb-6">
        XGBoost is an advanced gradient boosting algorithm that builds trees sequentially, where each new tree 
        corrects the errors of the previous ones. It includes regularization to prevent overfitting and is one of 
        the most successful ML algorithms in practice.
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
        <h3 className="font-semibold text-green-900 dark:text-green-200 mb-3">1. Using XGBoost Library</h3>
        <div className="bg-white dark:bg-[#0D0D0D] rounded p-3 font-mono text-sm mb-3">
          <pre className="text-xs">{`import xgboost as xgb

# Create and train
model = xgb.XGBClassifier(
    n_estimators=${nEstimators},
    learning_rate=${learningRate},
    max_depth=${maxDepth},
    random_state=42
)
model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)
accuracy = model.score(X_test, y_test)`}</pre>
        </div>
        <p className="text-sm text-green-800">
          XGBoost is easy to use, but understanding how it works helps with tuning and debugging.
        </p>
      </div>

      {/* Explanation - Always Visible */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-900 mb-4 text-lg">How XGBoost Works</h4>
        
        <div className="space-y-4 text-sm text-yellow-900">
          <div className="bg-white dark:bg-[#171717] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Step 1: Start with a Simple Guess</h5>
            <p className="mb-2">
              XGBoost starts by making a simple initial prediction for every point. For classification, 
              it might start by saying "every point has a 50% chance of being class 1."
            </p>
            <p className="text-xs text-gray-700 dark:text-white italic">
              This is like making an educated guess before you have any information.
            </p>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Step 2: Build a Tree to Fix Mistakes</h5>
            <p className="mb-2">
              After the initial guess, XGBoost looks at how wrong it was for each training point. 
              It then builds a decision tree that tries to predict these errors.
            </p>
            <div className="bg-gray-50 dark:bg-[#0D0D0D] rounded p-3 my-2 text-xs">
              <p className="font-semibold mb-1">Example:</p>
              <p>Point A: Predicted 0.3 (30% chance of class 1), Actual = 1 → Error = -0.7</p>
              <p>Point B: Predicted 0.8 (80% chance of class 1), Actual = 0 → Error = +0.8</p>
              <p className="mt-1">The tree learns: "Points like A need their prediction increased, points like B need it decreased"</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Step 3: Update Predictions Gradually</h5>
            <p className="mb-2">
              Instead of completely replacing the old prediction, XGBoost makes a small correction:
            </p>
            <div className="bg-gray-50 rounded p-3 my-2 font-mono text-xs">
              New Prediction = Old Prediction - Learning Rate × Tree Output
            </div>
            <p className="text-xs text-gray-700 italic mt-2">
              The learning rate controls how big each correction is. Small learning rate = careful, 
              gradual improvements. Large learning rate = bigger jumps, but risk of overshooting.
            </p>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Step 4: Repeat Many Times</h5>
            <p className="mb-2">
              This process repeats: build a tree to predict errors, update predictions, build another tree 
              to predict the new errors, and so on. Each tree focuses on fixing what the previous trees got wrong.
            </p>
            <div className="bg-gray-50 dark:bg-[#0D0D0D] rounded p-3 my-2 text-xs">
              <p className="font-semibold mb-1">After 1 tree:</p>
              <p>Accuracy: 60% - Still learning the basic pattern</p>
              <p className="font-semibold mb-1 mt-2">After 5 trees:</p>
              <p>Accuracy: 75% - Getting better at the main pattern</p>
              <p className="font-semibold mb-1 mt-2">After 10 trees:</p>
              <p>Accuracy: 85% - Fine-tuning details and edge cases</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-semibold mb-2">Why This Works Better Than Random Forest</h5>
            <p className="mb-2">
              Random Forest builds all trees independently and averages them. XGBoost builds trees sequentially, 
              where each tree learns from the mistakes of previous trees.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
              <li><strong>Sequential Learning:</strong> Like a student who learns from their mistakes on each test, 
              getting better each time.</li>
              <li><strong>Focuses on Hard Cases:</strong> Later trees pay more attention to points that are still 
              being misclassified.</li>
              <li><strong>Regularization:</strong> XGBoost includes penalties to prevent overfitting, making it more 
              robust than simple gradient boosting.</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-semibold text-blue-900 mb-1">Real-World Analogy</h5>
            <p className="text-xs text-blue-800">
              XGBoost is like a student learning to solve math problems. They start with basic guesses, 
              then after each problem, they learn what they got wrong and adjust their approach. 
              Each practice problem (tree) makes them slightly better. After many problems, they become 
              very good at solving similar problems. The learning rate is like how much they adjust 
              their approach after each mistake—too much and they might overcorrect, too little and 
              they learn slowly.
            </p>
          </div>
        </div>
      </div>

      {/* Key Formula */}
      <div className="mb-6 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">The Core Idea</h3>
        <div className="bg-white dark:bg-[#171717] rounded p-4 flex justify-center">
          <BlockMath math="F_m(x) = F_{m-1}(x) + \eta \cdot h_m(x)" />
        </div>
        <p className="text-sm text-gray-700 dark:text-white mt-2">
          Where <InlineMath math="F_m" /> is the model after <InlineMath math="m" /> trees, 
          <InlineMath math="\eta" /> is the learning rate, and <InlineMath math="h_m" /> is the <InlineMath math="m" />-th tree 
          that predicts the gradient/residual.
        </p>
      </div>

      {/* Tabular Data Section */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Classification Problem: Sample Data</h3>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">Training Data Sample (First 10 points)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#0D0D0D]">
                  <th className="border border-gray-300 p-2 text-left">ID</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 1 (X)</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 2 (Y)</th>
                  <th className="border border-gray-300 p-2 text-left">True Label</th>
                </tr>
              </thead>
              <tbody>
                {trainingData.slice(0, 10).map((point, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-[#171717]' : 'bg-gray-50 dark:bg-[#0D0D0D]'}>
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
          <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
            Test Data Predictions (After {selectedIteration} trees)
          </h4>
          <p className="text-xs text-gray-600 dark:text-white mb-2">
            Each point gets a probability score. If probability {'>'} 50%, we predict Class 1, otherwise Class 0.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#0D0D0D]">
                  <th className="border border-gray-300 p-2 text-left">ID</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 1</th>
                  <th className="border border-gray-300 p-2 text-left">Feature 2</th>
                  <th className="border border-gray-300 p-2 text-left">True Label</th>
                  <th className="border border-gray-300 p-2 text-left">Probability</th>
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
                    <td className="border border-gray-300 p-2 font-mono">
                      {(row.probability).toFixed(1)}%
                    </td>
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
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Example: How Predictions Improve Over Iterations</h4>
          <p className="text-xs text-blue-800 mb-2">
            For point #{selectedPointIndex + 1} (X={selectedPoint.x.toFixed(2)}, Y={selectedPoint.y.toFixed(2)}), 
            True Label: Class {selectedPoint.label}. Watch how the probability changes as we add more trees:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#0D0D0D]">
                  <th className="border border-gray-300 p-2 text-left">Iteration</th>
                  <th className="border border-gray-300 p-2 text-left">Probability</th>
                  <th className="border border-gray-300 p-2 text-left">Predicted</th>
                  <th className="border border-gray-300 p-2 text-left">Error</th>
                  <th className="border border-gray-300 p-2 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {selectedPointHistory.filter((_, idx) => 
                  idx === 0 || idx % Math.max(1, Math.floor(nEstimators / 10)) === 0 || idx === selectedPointHistory.length - 1
                ).map((hist, idx) => (
                  <tr key={hist.iteration} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2">{hist.iteration}</td>
                    <td className="border border-gray-300 p-2 font-mono">
                      {(hist.probability * 100).toFixed(1)}%
                    </td>
                    <td className={`border border-gray-300 p-2 font-semibold ${
                      hist.predicted === 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      Class {hist.predicted}
                    </td>
                    <td className={`border border-gray-300 p-2 font-mono ${
                      Math.abs(hist.error) < 0.1 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {hist.error > 0 ? '+' : ''}{hist.error.toFixed(3)}
                    </td>
                    <td className={`border border-gray-300 p-2 font-bold ${
                      hist.predicted === selectedPoint.label ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {hist.predicted === selectedPoint.label ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-blue-700 mt-2 italic">
            Notice how the error (difference between prediction and true label) gets smaller as we add more trees. 
            The probability moves closer to 100% for Class 1 or 0% for Class 0.
          </p>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-white mb-2">
              Number of Trees: {nEstimators}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={nEstimators}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setNEstimators(val);
                setSelectedIteration(Math.min(selectedIteration, val));
              }}
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-white mt-1">More trees = better accuracy (up to a point)</p>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-white mb-2">
              Learning Rate: {learningRate.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.01"
              max="0.3"
              step="0.01"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-white mt-1">Lower = slower learning, more stable</p>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-white mb-2">
              Iteration to View: {selectedIteration} of {nEstimators}
            </label>
            <input
              type="range"
              min="0"
              max={nEstimators}
              step={1}
              value={selectedIteration}
              onChange={(e) => setSelectedIteration(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-white mt-1">See predictions at this iteration</p>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-white mb-2">
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
            <p className="text-xs text-gray-600 dark:text-white mt-1">
              Point: ({selectedPoint.x.toFixed(2)}, {selectedPoint.y.toFixed(2)}), True: Class {selectedPoint.label}
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm font-semibold text-blue-900">Final Accuracy</p>
            <p className="text-2xl font-bold text-blue-700">{finalAccuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-sm font-semibold text-green-900">Learning Rate</p>
            <p className="text-2xl font-bold text-green-700">{learningRate.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded p-4">
            <p className="text-sm font-semibold text-purple-900">Trees Built</p>
            <p className="text-2xl font-bold text-purple-700">{nEstimators}</p>
          </div>
        </div>

        {/* Training Curve */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accuracy Improvement Over Iterations</h4>
          <p className="text-sm text-gray-600 dark:text-white mb-2">
            Each tree learns from the mistakes of previous trees, gradually improving accuracy.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={accuracyCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="iteration" label={{ value: 'Iteration (Tree Number)', position: 'insideBottom', offset: -5 }} stroke="#6b7280" />
              <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Test Accuracy" />
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
        
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Test Data Predictions (Iteration {selectedIteration})
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name="Feature 1" domain={[0, 10]} stroke="#6b7280" />
              <YAxis type="number" dataKey="y" name="Feature 2" domain={[0, 10]} stroke="#6b7280" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const point = payload[0].payload as DataPoint;
                    return (
                      <div className="bg-white dark:bg-[#171717] border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white">
                        <p>True: Class {point.label}</p>
                        <p>Predicted: Class {point.predicted}</p>
                        <p>Confidence: {((point.probability || 0) * 100).toFixed(1)}%</p>
                        <p className={point.label === point.predicted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {point.label === point.predicted ? '✓ Correct' : '✗ Wrong'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
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
            Gray points are misclassified. Watch how accuracy improves as you increase the iteration slider.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Key Advantages Over Random Forest:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Sequential learning: each tree improves on previous mistakes</li>
          <li>Regularization prevents overfitting</li>
          <li>Handles missing values and sparse data well</li>
          <li>Often achieves better accuracy with fewer trees</li>
          <li>Built-in cross-validation and early stopping</li>
        </ul>
      </div>
    </div>
  );
}
