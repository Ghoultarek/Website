'use client';

import { InlineMath, BlockMath } from 'react-katex';

export default function DecisionTrees() {
  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Decision Trees</h2>
      
      <p className="text-gray-700 dark:text-white mb-6">
        Before diving into ensemble methods like Random Forest, it's important to understand the building block: 
        decision trees. A decision tree is a simple, interpretable model that makes predictions by asking a series 
        of yes/no questions about the input features.
      </p>

      {/* Visual Tree Diagram */}
      <div className="mb-6 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Example Decision Tree</h3>
        <div className="flex justify-center">
          <svg width="600" height="420" className="w-full max-w-2xl">
            {/* Root Node */}
            <rect x="250" y="20" width="100" height="50" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" rx="4" />
            <text x="300" y="45" textAnchor="middle" className="text-sm font-semibold fill-white">
              X {'>'} 5?
            </text>
            
            {/* Left branch (No) */}
            <line x1="300" y1="70" x2="150" y2="120" stroke="#6b7280" strokeWidth="2" />
            <rect x="100" y="120" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="150" y="145" textAnchor="middle" className="text-sm font-semibold fill-white">
              Y {'>'} 3?
            </text>
            
            {/* Right branch (Yes) */}
            <line x1="300" y1="70" x2="450" y2="120" stroke="#6b7280" strokeWidth="2" />
            <rect x="400" y="120" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="450" y="145" textAnchor="middle" className="text-sm font-semibold fill-white">
              Y {'>'} 7?
            </text>
            
            {/* Leaf nodes - Left side */}
            <line x1="150" y1="170" x2="100" y2="220" stroke="#6b7280" strokeWidth="2" />
            <rect x="50" y="220" width="100" height="50" fill="#ef4444" stroke="#dc2626" strokeWidth="2" rx="4" />
            <text x="100" y="245" textAnchor="middle" className="text-sm font-semibold fill-white">
              Class 0
            </text>
            
            <line x1="150" y1="170" x2="200" y2="220" stroke="#6b7280" strokeWidth="2" />
            <rect x="150" y="220" width="100" height="50" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" rx="4" />
            <text x="200" y="245" textAnchor="middle" className="text-sm font-semibold fill-white">
              Class 1
            </text>
            
            {/* Leaf nodes - Right side */}
            <line x1="450" y1="170" x2="400" y2="220" stroke="#6b7280" strokeWidth="2" />
            <rect x="350" y="220" width="100" height="50" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" rx="4" />
            <text x="400" y="245" textAnchor="middle" className="text-sm font-semibold fill-white">
              Class 1
            </text>
            
            <line x1="450" y1="170" x2="500" y2="220" stroke="#6b7280" strokeWidth="2" />
            <rect x="450" y="220" width="100" height="50" fill="#ef4444" stroke="#dc2626" strokeWidth="2" rx="4" />
            <text x="500" y="245" textAnchor="middle" className="text-sm font-semibold fill-white">
              Class 0
            </text>
            
            {/* Labels */}
            <text x="300" y="15" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Root Node</text>
            <text x="150" y="115" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Internal Node</text>
            <text x="450" y="115" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Internal Node</text>
            <text x="100" y="295" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Leaf</text>
            <text x="200" y="295" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Leaf</text>
            <text x="400" y="295" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Leaf</text>
            <text x="500" y="295" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Leaf</text>
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
          Blue boxes = decision nodes (ask questions), Colored boxes = leaf nodes (make predictions)
        </p>
      </div>

      {/* Key Concepts */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Concepts</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Root Node</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              The topmost node that contains all the training data. It asks the first question that best 
              splits the data.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Internal Nodes</h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Nodes that ask questions and split the data further. Each internal node contains a subset 
              of the data and makes a decision based on a feature and threshold.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Leaf Nodes</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Terminal nodes that make the final prediction. They contain the majority class (for classification) 
              or average value (for regression) of the data points that reached that leaf.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Splitting Criteria</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
              Trees decide how to split data by finding the feature and threshold that best separate the classes. 
              Common criteria include:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
              <li><strong>Gini Impurity:</strong> Measures how often a randomly chosen element would be incorrectly labeled</li>
              <li><strong>Entropy/Information Gain:</strong> Measures the reduction in uncertainty after a split</li>
              <li><strong>Variance Reduction:</strong> Used for regression tasks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How Trees Make Predictions */}
      <div className="mb-6 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">How Trees Make Predictions</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-white">
          <div>
            <p className="font-semibold mb-1">1. Start at the root:</p>
            <p className="ml-4">Ask the question at the root node (e.g., "Is Feature X {'>'} 5?")</p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Follow branches:</p>
            <p className="ml-4">Based on the answer, move to the left (No) or right (Yes) child node</p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Repeat:</p>
            <p className="ml-4">Continue asking questions and following branches until you reach a leaf node</p>
          </div>
          <div>
            <p className="font-semibold mb-1">4. Predict:</p>
            <p className="ml-4">The leaf node contains the final prediction (e.g., "Class 1" or "Class 0")</p>
          </div>
        </div>
      </div>

      {/* Advantages and Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Advantages</h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
            <li>Easy to understand and interpret</li>
            <li>Requires little data preparation</li>
            <li>Handles both numerical and categorical data</li>
            <li>Can model non-linear relationships</li>
          </ul>
        </div>

        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Limitations</h4>
          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
            <li>Prone to overfitting (memorizes training data)</li>
            <li>Unstable (small data changes can create very different trees)</li>
            <li>Can create biased trees if some classes dominate</li>
            <li>Greedy approach may not find globally optimal tree</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Why Ensemble Methods?</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          The limitations of single decision trees (especially overfitting and instability) led to the development 
          of ensemble methods like Random Forest (bagging) and XGBoost (boosting). These methods combine multiple 
          trees to create more robust and accurate models.
        </p>
      </div>
    </div>
  );
}

