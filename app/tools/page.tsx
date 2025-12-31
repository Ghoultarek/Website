'use client';

import Link from 'next/link';

export default function Tools() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Research Tools</h1>
          <p className="text-lg text-gray-700">
            Explore interactive demonstrations of my research methods and models
          </p>
        </div>

        {/* Technique Tutorials Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technique Tutorials</h2>
          <p className="text-gray-600 mb-6">
            Interactive tutorials demonstrating statistical and machine learning techniques used in my research.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              href="/tools/technique-tutorials/bhev"
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow hover:border-primary-400"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Extreme Value Models</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn about Generalized Extreme Value (GEV) and Generalized Pareto (GPD) distributions for modeling negated conflict extremes. Covers Block Maxima and Peak-Over-Threshold approaches.
              </p>
              <div className="flex items-center text-primary-600 font-medium text-sm">
                Explore Tutorial
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            {/* Hidden for now - Hierarchical Bayesian Models */}
            {false && (
              <Link 
                href="/tools/technique-tutorials/hierarchical"
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow hover:border-primary-400"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hierarchical Bayesian Models</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Extend Extreme Value Theory to multi-site analysis. Learn about random intercepts, partial pooling, and random slopes for modeling site-level variation in traffic safety.
                </p>
                <div className="flex items-center text-primary-600 font-medium text-sm">
                  Explore Tutorial
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* AI Fundamentals Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Fundamentals</h2>
          <p className="text-gray-600 mb-6">
            A testing ground for fundamentals of machine learning. Explore neural networks, backpropagation, and more.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/tools/technique-tutorials/ai/neural-nets-backprop"
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow hover:border-primary-400"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Neural Nets and Backpropagation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn how to train neural networks in PyTorch, understand backpropagation, and implement neural networks from scratch.
              </p>
              <div className="flex items-center text-primary-600 font-medium text-sm">
                Explore Tutorial
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <Link
              href="/tools/technique-tutorials/ai/transformers"
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow hover:border-primary-400"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transformers</h3>
              <p className="text-gray-600 text-sm mb-4">
                Understand how transformers work through interactive demos. Explore decoder-only (GPT), encoder-only (BERT), and encoder-decoder (T5) architectures.
              </p>
              <div className="flex items-center text-primary-600 font-medium text-sm">
                Explore Tutorial
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <Link
              href="/tools/technique-tutorials/ai/basic-ml"
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow hover:border-primary-400"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Machine Learning</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn train/test/val splits, Random Forest, and XGBoost. Start with libraries, then see how they're implemented from scratch.
              </p>
              <div className="flex items-center text-primary-600 font-medium text-sm">
                Explore Tutorial
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <Link
              href="/tools/technique-tutorials/ai/clustering"
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow hover:border-primary-400"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Clustering</h3>
              <p className="text-gray-600 text-sm mb-4">
                Explore KNN, K-means, DBSCAN, HDBSCAN, and Fuzzy C-means. Visualize how clustering algorithms work and see their implementations.
              </p>
              <div className="flex items-center text-primary-600 font-medium text-sm">
                Explore Tutorial
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

