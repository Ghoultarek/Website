'use client';

export default function OtherModels() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Other Important ML Models</h2>
      
      <p className="text-gray-700 mb-6">
        While Random Forest and XGBoost are powerful tree-based ensemble methods, there are many other 
        important machine learning algorithms worth knowing. Here's a brief overview of some key models.
      </p>

      {/* Ensemble Methods */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Other Ensemble Methods</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-semibold mb-1">AdaBoost (Adaptive Boosting):</p>
            <p className="ml-4">
              An early boosting algorithm that combines weak learners (often decision stumps - single-level trees). 
              It adaptively adjusts weights of misclassified instances, similar to XGBoost but simpler.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Gradient Boosting:</p>
            <p className="ml-4">
              The foundation of XGBoost. Builds trees sequentially to minimize a loss function using gradient descent. 
              XGBoost is an optimized, regularized version of gradient boosting.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">LightGBM:</p>
            <p className="ml-4">
              Another gradient boosting framework, faster than XGBoost for large datasets. Uses histogram-based 
              algorithms and leaf-wise tree growth.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">CatBoost:</p>
            <p className="ml-4">
              Gradient boosting designed to handle categorical features well without extensive preprocessing. 
              Good for datasets with many categorical variables.
            </p>
          </div>
        </div>
      </div>

      {/* Linear Models */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">Linear Models</h3>
        <div className="space-y-3 text-sm text-green-800">
          <div>
            <p className="font-semibold mb-1">Logistic Regression:</p>
            <p className="ml-4">
              A linear model for classification. Simple, interpretable, and works well as a baseline. 
              Assumes a linear relationship between features and log-odds of the target.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Linear Regression:</p>
            <p className="ml-4">
              The foundation of regression. Predicts continuous values using a linear combination of features. 
              Fast, interpretable, but limited to linear relationships.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Ridge/Lasso Regression:</p>
            <p className="ml-4">
              Regularized versions of linear regression that prevent overfitting. Ridge adds L2 penalty, 
              Lasso adds L1 penalty (can zero out features).
            </p>
          </div>
        </div>
      </div>

      {/* Support Vector Machines */}
      <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-3">Support Vector Machines (SVM)</h3>
        <p className="text-sm text-purple-800 mb-2">
          SVMs find the optimal hyperplane that separates classes with maximum margin. They can handle 
          non-linear relationships using kernel functions (RBF, polynomial).
        </p>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside ml-4">
          <li>Good for high-dimensional data</li>
          <li>Memory efficient (uses support vectors only)</li>
          <li>Can be slow for large datasets</li>
        </ul>
      </div>

      {/* Neural Networks */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-3">Neural Networks</h3>
        <p className="text-sm text-yellow-800 mb-2">
          Multi-layer networks that can learn complex non-linear patterns. While powerful, they require 
          large amounts of data and are less interpretable than tree-based methods.
        </p>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside ml-4">
          <li>Excellent for complex patterns and large datasets</li>
          <li>Requires careful tuning and preprocessing</li>
          <li>Less interpretable than tree-based methods</li>
          <li>See the Neural Nets tutorial for more details</li>
        </ul>
      </div>

      {/* When to Choose */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Choosing the Right Model</h3>
        <p className="text-sm text-gray-700 mb-3">
          Model selection depends on your data, problem type, and requirements:
        </p>
        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside ml-4">
          <li><strong>Small dataset:</strong> Logistic Regression, SVM, or simple trees</li>
          <li><strong>Medium dataset:</strong> Random Forest or XGBoost</li>
          <li><strong>Large dataset:</strong> XGBoost, LightGBM, or Neural Networks</li>
          <li><strong>Need interpretability:</strong> Decision Trees, Random Forest, Logistic Regression</li>
          <li><strong>Need speed:</strong> Linear models, Random Forest (parallelizable)</li>
          <li><strong>Need accuracy:</strong> XGBoost, Neural Networks, Ensemble methods</li>
          <li><strong>Categorical features:</strong> CatBoost, tree-based methods</li>
          <li><strong>Text/image data:</strong> Neural Networks, specialized architectures</li>
        </ul>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Further Learning</h3>
        <p className="text-sm text-blue-800">
          This tutorial focused on tree-based ensemble methods. Each model type has its strengths and 
          use cases. In practice, it's common to try multiple models and compare their performance using 
          techniques like cross-validation and the confusion matrix we covered earlier.
        </p>
      </div>
    </div>
  );
}

