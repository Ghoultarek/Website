'use client';

export default function BaggingBoosting() {
  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Bagging vs Boosting</h2>
      
      <p className="text-gray-700 dark:text-white mb-6">
        Random Forest and XGBoost represent two fundamental approaches to combining multiple decision trees: 
        <strong> bagging</strong> and <strong>boosting</strong>. Understanding the difference helps you choose 
        the right algorithm for your problem.
      </p>

      {/* Bagging Visualization */}
      <div className="mb-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-4 text-lg">Bagging (Bootstrap Aggregating)</h3>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
          Bagging trains multiple models independently in parallel, each on a different bootstrap sample of the data. 
          Predictions are made by averaging (regression) or voting (classification).
        </p>
        
        <div className="flex justify-center mb-4">
          <svg width="700" height="350" className="w-full max-w-3xl">
            {/* Data */}
            <rect x="50" y="50" width="100" height="60" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" rx="4" />
            <text x="100" y="80" textAnchor="middle" className="text-xs font-semibold fill-white">Training Data</text>
            
            {/* Bootstrap samples */}
            <line x1="100" y1="110" x2="100" y2="140" stroke="#6b7280" strokeWidth="2" />
            <line x1="100" y1="110" x2="150" y2="140" stroke="#6b7280" strokeWidth="2" />
            <line x1="100" y1="110" x2="250" y2="140" stroke="#6b7280" strokeWidth="2" />
            <line x1="100" y1="110" x2="350" y2="140" stroke="#6b7280" strokeWidth="2" />
            <line x1="100" y1="110" x2="450" y2="140" stroke="#6b7280" strokeWidth="2" />
            
            {/* Bootstrap samples */}
            <rect x="50" y="140" width="100" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" rx="4" />
            <text x="100" y="162" textAnchor="middle" className="text-xs fill-white">Sample 1</text>
            <rect x="150" y="140" width="100" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" rx="4" />
            <text x="200" y="162" textAnchor="middle" className="text-xs fill-white">Sample 2</text>
            <rect x="250" y="140" width="100" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" rx="4" />
            <text x="300" y="162" textAnchor="middle" className="text-xs fill-white">Sample 3</text>
            <rect x="350" y="140" width="100" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" rx="4" />
            <text x="400" y="162" textAnchor="middle" className="text-xs fill-white">Sample 4</text>
            <rect x="450" y="140" width="100" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="2" rx="4" />
            <text x="500" y="162" textAnchor="middle" className="text-xs fill-white">Sample 5</text>
            
            {/* Trees */}
            <line x1="100" y1="180" x2="100" y2="210" stroke="#6b7280" strokeWidth="2" />
            <line x1="200" y1="180" x2="200" y2="210" stroke="#6b7280" strokeWidth="2" />
            <line x1="300" y1="180" x2="300" y2="210" stroke="#6b7280" strokeWidth="2" />
            <line x1="400" y1="180" x2="400" y2="210" stroke="#6b7280" strokeWidth="2" />
            <line x1="500" y1="180" x2="500" y2="210" stroke="#6b7280" strokeWidth="2" />
            
            <rect x="50" y="210" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="100" y="235" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 1</text>
            <rect x="150" y="210" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="200" y="235" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 2</text>
            <rect x="250" y="210" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="300" y="235" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 3</text>
            <rect x="350" y="210" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="400" y="235" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 4</text>
            <rect x="450" y="210" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="500" y="235" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 5</text>
            
            {/* Predictions */}
            <line x1="100" y1="260" x2="300" y2="290" stroke="#6b7280" strokeWidth="2" />
            <line x1="200" y1="260" x2="300" y2="290" stroke="#6b7280" strokeWidth="2" />
            <line x1="300" y1="260" x2="300" y2="290" stroke="#6b7280" strokeWidth="2" />
            <line x1="400" y1="260" x2="300" y2="290" stroke="#6b7280" strokeWidth="2" />
            <line x1="500" y1="260" x2="300" y2="290" stroke="#6b7280" strokeWidth="2" />
            
            <rect x="250" y="290" width="100" height="50" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="4" />
            <text x="300" y="315" textAnchor="middle" className="text-xs font-semibold fill-white">Average/Vote</text>
            <text x="300" y="330" textAnchor="middle" className="text-xs font-semibold fill-white">Final Prediction</text>
            
            <text x="100" y="45" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Step 1: Bootstrap Sampling</text>
            <text x="300" y="205" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Step 2: Train Trees in Parallel</text>
            <text x="300" y="348" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Step 3: Aggregate Predictions</text>
          </svg>
        </div>

        <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-4 border border-blue-300 dark:border-blue-800 mt-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Key Characteristics:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li><strong>Parallel:</strong> All trees train simultaneously on different data samples</li>
            <li><strong>Independent:</strong> Each tree doesn't know about others</li>
            <li><strong>Reduces Variance:</strong> Averaging reduces overfitting</li>
            <li><strong>Example:</strong> Random Forest</li>
          </ul>
        </div>
      </div>

      {/* Boosting Visualization */}
      <div className="mb-8 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 dark:text-green-200 mb-4 text-lg">Boosting</h3>
        <p className="text-sm text-green-800 dark:text-green-200 mb-4">
          Boosting trains models sequentially, where each new model focuses on correcting the mistakes of previous models. 
          Predictions are made by weighted combination of all models.
        </p>
        
        <div className="flex justify-center mb-4">
          <svg width="700" height="400" className="w-full max-w-3xl">
            {/* Training Data */}
            <rect x="50" y="50" width="100" height="60" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="100" y="80" textAnchor="middle" className="text-xs font-semibold fill-white">Training Data</text>
            
            {/* Sequential flow */}
            <line x1="100" y1="110" x2="100" y2="140" stroke="#6b7280" strokeWidth="2" />
            
            {/* Tree 1 */}
            <rect x="50" y="140" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="100" y="165" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 1</text>
            <text x="100" y="180" textAnchor="middle" className="text-xs fill-white">(Initial)</text>
            
            <line x1="100" y1="190" x2="100" y2="220" stroke="#6b7280" strokeWidth="2" />
            <rect x="50" y="220" width="100" height="40" fill="#fbbf24" stroke="#d97706" strokeWidth="2" rx="4" />
            <text x="100" y="242" textAnchor="middle" className="text-xs fill-white">Errors</text>
            
            <line x1="100" y1="260" x2="100" y2="290" stroke="#6b7280" strokeWidth="2" />
            
            {/* Tree 2 */}
            <rect x="50" y="290" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="100" y="315" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 2</text>
            <text x="100" y="330" textAnchor="middle" className="text-xs fill-white">(Fixes Tree 1)</text>
            
            {/* Arrow showing sequential */}
            <line x1="200" y1="315" x2="250" y2="315" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <text x="225" y="310" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Sequential</text>
            
            {/* Tree 3 */}
            <rect x="250" y="290" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="300" y="315" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 3</text>
            <text x="300" y="330" textAnchor="middle" className="text-xs fill-white">(Fixes Tree 2)</text>
            
            <line x1="350" y1="315" x2="400" y2="315" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            {/* Tree 4 */}
            <rect x="400" y="290" width="100" height="50" fill="#10b981" stroke="#059669" strokeWidth="2" rx="4" />
            <text x="450" y="315" textAnchor="middle" className="text-xs font-semibold fill-white">Tree 4</text>
            <text x="450" y="330" textAnchor="middle" className="text-xs fill-white">(Fixes Tree 3)</text>
            
            {/* Final prediction */}
            <line x1="100" y1="340" x2="300" y2="370" stroke="#6b7280" strokeWidth="2" />
            <line x1="300" y1="340" x2="300" y2="370" stroke="#6b7280" strokeWidth="2" />
            <line x1="450" y1="340" x2="300" y2="370" stroke="#6b7280" strokeWidth="2" />
            
            <rect x="250" y="370" width="100" height="50" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="4" />
            <text x="300" y="395" textAnchor="middle" className="text-xs font-semibold fill-white">Weighted</text>
            <text x="300" y="410" textAnchor="middle" className="text-xs font-semibold fill-white">Sum</text>
            
            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
              </marker>
            </defs>
            
            <text x="100" y="135" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Step 1: Train First Tree</text>
            <text x="100" y="215" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Step 2: Find Errors</text>
            <text x="300" y="285" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Step 3: Train Next Tree on Errors</text>
            <text x="300" y="365" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">Step 4: Combine All Trees</text>
          </svg>
        </div>

        <div className="bg-white dark:bg-[#0D0D0D] rounded-lg p-4 border border-green-300 dark:border-green-800 mt-6">
          <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Key Characteristics:</h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
            <li><strong>Sequential:</strong> Trees train one after another</li>
            <li><strong>Adaptive:</strong> Each tree learns from previous mistakes</li>
            <li><strong>Reduces Bias:</strong> Focuses on hard-to-predict cases</li>
            <li><strong>Example:</strong> XGBoost, AdaBoost, Gradient Boosting</li>
          </ul>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-6 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Side-by-Side Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#171717]">
                <th className="border border-gray-300 dark:border-gray-600 p-3 text-left dark:text-white">Aspect</th>
                <th className="border border-gray-300 dark:border-gray-600 p-3 text-left dark:text-white">Bagging</th>
                <th className="border border-gray-300 dark:border-gray-600 p-3 text-left dark:text-white">Boosting</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-[#0D0D0D]">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold dark:text-white">Training</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Parallel (all trees train simultaneously)</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Sequential (one tree at a time)</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-[#171717]">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold dark:text-white">Data Sampling</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Bootstrap sampling (random with replacement)</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Weighted sampling (focuses on misclassified points)</td>
              </tr>
              <tr className="bg-white dark:bg-[#0D0D0D]">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold dark:text-white">Tree Independence</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Trees are independent</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Trees depend on previous trees</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-[#171717]">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold dark:text-white">Prediction</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Average or majority vote</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Weighted sum (learning rate × tree output)</td>
              </tr>
              <tr className="bg-white dark:bg-[#0D0D0D]">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold dark:text-white">Main Benefit</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Reduces variance (overfitting)</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Reduces bias (underfitting)</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-[#171717]">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold dark:text-white">Speed</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Faster (parallelizable)</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Slower (must train sequentially)</td>
              </tr>
              <tr className="bg-white dark:bg-[#0D0D0D]">
                <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold dark:text-white">Examples</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">Random Forest</td>
                <td className="border border-gray-300 dark:border-gray-600 p-3 dark:text-white">XGBoost, AdaBoost, Gradient Boosting</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* When to Use */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">When to Use Each Approach</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p className="font-semibold mb-1">Use Bagging (Random Forest) when:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You need fast training and prediction</li>
              <li>You want to reduce overfitting</li>
              <li>You have noisy data</li>
              <li>You want feature importance scores</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">Use Boosting (XGBoost) when:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You want maximum accuracy</li>
              <li>You have clean, well-structured data</li>
              <li>You can afford longer training time</li>
              <li>You need to handle missing values well</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

