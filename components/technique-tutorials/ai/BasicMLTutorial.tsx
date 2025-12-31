'use client';

import { useState, useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import DecisionTrees from './DecisionTrees';
import TrainTestValSplit from './TrainTestValSplit';
import BiasVarianceTradeoff from './BiasVarianceTradeoff';
import RandomForestDemo from './RandomForestDemo';
import XGBoostDemo from './XGBoostDemo';
import BaggingBoosting from './BaggingBoosting';
import OtherModels from './OtherModels';
import ConfusionMatrix from './ConfusionMatrix';
import ClassImbalance from './ClassImbalance';

interface DataPoint {
  x: number;
  y: number;
  label: number;
  predicted?: number;
}

export default function BasicMLTutorial() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [rfPredictions, setRfPredictions] = useState<DataPoint[]>([]);
  const [xgbPredictions, setXgbPredictions] = useState<DataPoint[]>([]);

  // Generate shared data for both models - Circular boundary problem
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

  // Generate shared training and test data
  const sharedTrainingData = useMemo(() => generateData(150), []);
  const sharedTestData = useMemo(() => generateData(50), []);

  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'splits', title: 'Train/Test/Val Splits' },
    { id: 'bias-variance', title: 'Bias-Variance Tradeoff' },
    { id: 'trees', title: 'Decision Trees' },
    { id: 'random-forest', title: 'Random Forest' },
    { id: 'xgboost', title: 'XGBoost' },
    { id: 'confusion-matrix', title: 'Model Evaluation' },
    { id: 'class-imbalance', title: 'Class Imbalance' },
    { id: 'bagging-boosting', title: 'Bagging vs Boosting' },
    { id: 'other-models', title: 'Other Models' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Fundamentals: Basic Machine Learning</h1>
        <p className="text-lg text-gray-700">
          Learn fundamental ML concepts: decision trees, data splitting, Random Forest, XGBoost, and model evaluation. 
          Start with library usage, then see how they're implemented from scratch.
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                const element = document.getElementById(section.id);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveSection(section.id);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Introduction Section */}
      <section id="intro" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction to Basic ML</h2>
          
          <div className="prose max-w-none mb-6">
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 mb-6">
              <p className="text-gray-800 mb-4 leading-relaxed">
                This tutorial covers essential machine learning concepts that form the foundation of many modern ML systems. 
                We'll start with decision trees, then explore how to properly split data, and dive into two powerful 
                tree-based algorithms: Random Forest and XGBoost.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed">
                For each algorithm, we'll first see how to use it with libraries (scikit-learn, xgboost), then dive into 
                simplified implementations to understand what's happening under the hood. This approach removes the black box 
                and helps you understand both how to use these tools and why they work.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed font-semibold">
                What You'll Learn:
              </p>
              
              <ul className="list-disc list-inside text-gray-800 space-y-2 mb-4 ml-4">
                <li><strong>Decision Trees:</strong> The building blocks of tree-based models</li>
                <li><strong>Data Splitting:</strong> Why and how to split data into train/test/validation sets</li>
                <li><strong>Random Forest:</strong> Ensemble of decision trees and how they reduce overfitting</li>
                <li><strong>XGBoost:</strong> Gradient boosting with regularization and how it improves predictions</li>
                <li><strong>Model Evaluation:</strong> Using confusion matrices to compare model performance</li>
                <li><strong>Implementation:</strong> Simplified from-scratch versions to understand the mechanics</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why These Algorithms?</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Tree-based methods are interpretable and handle non-linear relationships well</li>
                <li>Random Forest reduces overfitting through ensemble averaging</li>
                <li>XGBoost is one of the most successful ML algorithms in practice</li>
                <li>Understanding these helps with feature engineering and model selection</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Train/Test/Val Split Section */}
      <section id="splits" className="mb-12 scroll-mt-8">
        <TrainTestValSplit />
      </section>

      {/* Bias-Variance Tradeoff Section */}
      <section id="bias-variance" className="mb-12 scroll-mt-8">
        <BiasVarianceTradeoff />
      </section>

      {/* Decision Trees Section */}
      <section id="trees" className="mb-12 scroll-mt-8">
        <DecisionTrees />
      </section>

      {/* Random Forest Section */}
      <section id="random-forest" className="mb-12 scroll-mt-8">
        <RandomForestDemo 
          trainingData={sharedTrainingData}
          testData={sharedTestData}
          onPredictionsChange={setRfPredictions} 
        />
      </section>

      {/* XGBoost Section */}
      <section id="xgboost" className="mb-12 scroll-mt-8">
        <XGBoostDemo 
          trainingData={sharedTrainingData}
          testData={sharedTestData}
          onPredictionsChange={setXgbPredictions} 
        />
      </section>

      {/* Confusion Matrix Section */}
      <section id="confusion-matrix" className="mb-12 scroll-mt-8">
        {rfPredictions.length > 0 && xgbPredictions.length > 0 ? (
          <ConfusionMatrix rfPredictions={rfPredictions} xgbPredictions={xgbPredictions} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-gray-600 text-center py-8">
              Loading predictions from Random Forest and XGBoost...
            </p>
          </div>
        )}
      </section>

      {/* Class Imbalance Section */}
      <section id="class-imbalance" className="mb-12 scroll-mt-8">
        <ClassImbalance />
      </section>

      {/* Bagging vs Boosting Section */}
      <section id="bagging-boosting" className="mb-12 scroll-mt-8">
        <BaggingBoosting />
      </section>

      {/* Other Models Section */}
      <section id="other-models" className="mb-12 scroll-mt-8">
        <OtherModels />
      </section>
    </div>
  );
}

