'use client';

import { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { InlineMath } from 'react-katex';

export default function TrainTestValSplit() {
  const [trainRatio, setTrainRatio] = useState(70);
  const [testRatio, setTestRatio] = useState(15);
  const valRatio = 100 - trainRatio - testRatio;

  // Generate sample data points
  const allData = useMemo(() => {
    const points: Array<{ x: number; y: number; id: number }> = [];
    for (let i = 0; i < 200; i++) {
      points.push({
        x: Math.random() * 10,
        y: Math.random() * 10,
        id: i,
      });
    }
    return points;
  }, []);

  // Split data
  const splits = useMemo(() => {
    const shuffled = [...allData].sort(() => Math.random() - 0.5);
    const trainEnd = Math.floor((trainRatio / 100) * shuffled.length);
    const testEnd = trainEnd + Math.floor((testRatio / 100) * shuffled.length);
    
    return {
      train: shuffled.slice(0, trainEnd).map(p => ({ ...p, split: 'train' })),
      test: shuffled.slice(trainEnd, testEnd).map(p => ({ ...p, split: 'test' })),
      val: shuffled.slice(testEnd).map(p => ({ ...p, split: 'val' })),
    };
  }, [allData, trainRatio, testRatio]);

  const combinedData = [...splits.train, ...splits.test, ...splits.val];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Train/Test/Validation Splits</h2>
      
      <p className="text-gray-700 mb-6">
        Properly splitting your data is crucial for building reliable ML models. The training set is used to learn 
        parameters, the validation set is used to tune hyperparameters, and the test set is used for final evaluation.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Split Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Training: {trainRatio}%
            </label>
            <input
              type="range"
              min="50"
              max="90"
              value={trainRatio}
              onChange={(e) => {
                const newTrain = parseInt(e.target.value);
                const maxTest = 100 - newTrain - 10; // Keep at least 10% for val
                setTrainRatio(newTrain);
                if (testRatio > maxTest) {
                  setTestRatio(maxTest);
                }
              }}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Test: {testRatio}%
            </label>
            <input
              type="range"
              min="5"
              max={100 - trainRatio - 10}
              value={testRatio}
              onChange={(e) => {
                const newTest = parseInt(e.target.value);
                const maxTest = 100 - trainRatio - 10;
                setTestRatio(Math.min(newTest, maxTest));
              }}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Validation: {valRatio}%
            </label>
            <div className="text-sm text-gray-600">
              (Automatically calculated)
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="font-semibold text-blue-900">Training</p>
            <p className="text-blue-700">{splits.train.length} samples</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="font-semibold text-green-900">Test</p>
            <p className="text-green-700">{splits.test.length} samples</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="font-semibold text-yellow-900">Validation</p>
            <p className="text-yellow-700">{splits.val.length} samples</p>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Data Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="Feature 1" />
            <YAxis type="number" dataKey="y" name="Feature 2" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Training" data={splits.train} fill="#3b82f6">
              {splits.train.map((entry, index) => (
                <Cell key={`train-${index}`} fill="#3b82f6" />
              ))}
            </Scatter>
            <Scatter name="Test" data={splits.test} fill="#10b981">
              {splits.test.map((entry, index) => (
                <Cell key={`test-${index}`} fill="#10b981" />
              ))}
            </Scatter>
            <Scatter name="Validation" data={splits.val} fill="#f59e0b">
              {splits.val.map((entry, index) => (
                <Cell key={`val-${index}`} fill="#f59e0b" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Why Three Splits?</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Training:</strong> Learn model parameters (weights, splits, etc.)</li>
          <li><strong>Validation:</strong> Tune hyperparameters (learning rate, tree depth, regularization) without touching test set</li>
          <li><strong>Test:</strong> Final unbiased evaluation after all tuning is complete</li>
        </ul>
        <p className="text-sm text-blue-800 mt-2">
          Common split ratios: 70/15/15 or 80/10/10. The test set should only be used once at the very end!
        </p>
      </div>
    </div>
  );
}

