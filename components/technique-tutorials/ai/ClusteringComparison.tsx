'use client';

import { useState } from 'react';

export default function ClusteringComparison() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  const algorithms = [
    {
      name: 'K-Means',
      pros: [
        'Fast and scalable',
        'Simple to understand',
        'Works well with spherical clusters',
        'Good for large datasets',
      ],
      cons: [
        'Requires specifying k',
        'Assumes spherical clusters',
        'Sensitive to initialization',
        'Cannot handle noise',
      ],
      useCases: ['Customer segmentation', 'Image compression', 'Market research'],
    },
    {
      name: 'DBSCAN',
      pros: [
        'Finds clusters of arbitrary shape',
        'Automatically identifies noise',
        "Doesn't require k",
        'Handles outliers well',
      ],
      cons: [
        'Sensitive to parameters (eps, min_samples)',
        'Struggles with varying densities',
        'Can be slow for large datasets',
      ],
      useCases: ['Anomaly detection', 'Image segmentation', 'Geographic data'],
    },
    {
      name: 'HDBSCAN',
      pros: [
        'Handles varying densities',
        'More robust to parameters',
        'Provides cluster stability scores',
        'Better noise detection',
      ],
      cons: [
        'More complex than DBSCAN',
        'Can be slower',
        'Requires min_cluster_size parameter',
      ],
      useCases: ['Complex data exploration', 'Hierarchical clustering needs', 'Density-varying data'],
    },
    {
      name: 'Fuzzy C-Means',
      pros: [
        'Soft clustering (membership probabilities)',
        'Handles ambiguous boundaries',
        'Provides confidence scores',
        'More flexible than hard clustering',
      ],
      cons: [
        'Requires specifying c',
        'Can be slower than K-means',
        'Sensitive to initialization',
        'Assumes clusters are spherical',
      ],
      useCases: ['Medical diagnosis', 'Pattern recognition', 'Data with overlapping clusters'],
    },
    {
      name: 'KNN',
      pros: [
        'Simple and intuitive',
        'No training phase',
        'Non-parametric',
        'Works for classification and regression',
      ],
      cons: [
        'Slow for large datasets',
        'Sensitive to irrelevant features',
        'Requires choosing k',
        'Memory intensive (stores all data)',
      ],
      useCases: ['Recommendation systems', 'Pattern recognition', 'Missing value imputation'],
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Algorithm Comparison</h2>
      
      <p className="text-gray-700 mb-6">
        Each clustering algorithm has different strengths and weaknesses. Choose based on your data characteristics 
        and requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {algorithms.map((alg) => (
          <div
            key={alg.name}
            onClick={() => setSelectedAlgorithm(selectedAlgorithm === alg.name ? null : alg.name)}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedAlgorithm === alg.name
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-3">{alg.name}</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-green-700 mb-1">Pros:</p>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  {alg.pros.slice(0, 2).map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-700 mb-1">Cons:</p>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  {alg.cons.slice(0, 2).map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAlgorithm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Detailed Comparison: {selectedAlgorithm}
          </h3>
          {algorithms
            .filter((alg) => alg.name === selectedAlgorithm)
            .map((alg) => (
              <div key={alg.name} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Advantages</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    {alg.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">Limitations</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    {alg.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Use Cases</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    {alg.useCases.map((useCase, i) => (
                      <li key={i}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Quick Decision Guide</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Spherical clusters, known k:</strong> K-Means</li>
          <li><strong>Arbitrary shapes, unknown k:</strong> DBSCAN or HDBSCAN</li>
          <li><strong>Varying densities:</strong> HDBSCAN</li>
          <li><strong>Soft boundaries needed:</strong> Fuzzy C-Means</li>
          <li><strong>Classification with stored data:</strong> KNN</li>
        </ul>
      </div>
    </div>
  );
}

