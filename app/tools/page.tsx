'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Tools() {
  const [aiFundamentalsOpen, setAiFundamentalsOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Research Tools</h1>
          <p className="text-lg text-gray-700">
            Explore interactive demonstrations of my research methods and models
          </p>
        </div>

        <div className="mb-8">
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
            {/* AI Fundamentals Expandable Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => setAiFundamentalsOpen(!aiFundamentalsOpen)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Fundamentals</h3>
                  <p className="text-gray-600 text-sm">
                    A testing ground for fundamentals of machine learning. Explore neural networks, backpropagation, and more.
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${aiFundamentalsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {aiFundamentalsOpen && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-3">
                    <Link
                      href="/tools/technique-tutorials/ai/neural-nets-backprop"
                      className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-400 hover:shadow-md transition-all"
                      onClick={() => setAiFundamentalsOpen(false)}
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Neural Nets and Backpropagation</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Learn how to train neural networks in PyTorch, understand backpropagation, and implement neural networks from scratch.
                      </p>
                      <div className="flex items-center text-primary-600 font-medium text-sm">
                        Explore Tutorial
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                    
                    {/* Placeholder for future tutorials */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200 border-dashed opacity-50">
                      <p className="text-sm text-gray-500 italic">More AI tutorials coming soon...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

