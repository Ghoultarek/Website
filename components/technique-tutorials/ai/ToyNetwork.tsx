'use client';

import { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NeuralNetwork, generateXORDataset, generateLinearDataset, generateCircleDataset } from './NeuralNetwork';
import { NetworkConfig, Dataset } from './types';
import CodeSnippets from './CodeSnippets';

const implementationCode = `// Neural Network Implementation from Scratch

class NeuralNetwork {
  constructor(config) {
    this.config = config;
    this.layers = this.initializeLayers();
  }

  forward(input) {
    let currentInput = input;
    for (let layer of this.layers) {
      const outputs = [];
      for (let j = 0; j < layer.weights.length; j++) {
        let sum = layer.biases[j];
        for (let k = 0; k < currentInput.length; k++) {
          sum += layer.weights[j][k] * currentInput[k];
        }
        outputs[j] = this.activate(sum);
      }
      layer.activations = outputs;
      currentInput = outputs;
    }
    return currentInput;
  }

  backward(input, target, output) {
    // Calculate output error
    let error = output.map((o, i) => o - target[i]);
    
    // Backpropagate through layers
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const prevActivations = i > 0 
        ? this.layers[i - 1].activations 
        : input;
      
      const deltas = [];
      for (let j = 0; j < layer.weights.length; j++) {
        const derivative = this.activateDerivative(layer.activations[j]);
        deltas[j] = error[j] * derivative;
        
        // Update gradients
        layer.gradients.biases[j] += deltas[j];
        for (let k = 0; k < layer.weights[j].length; k++) {
          layer.gradients.weights[j][k] += deltas[j] * prevActivations[k];
        }
      }
      
      // Calculate error for previous layer
      if (i > 0) {
        error = new Array(this.layers[i - 1].weights.length).fill(0);
        for (let j = 0; j < this.layers[i - 1].weights.length; j++) {
          for (let k = 0; k < layer.weights.length; k++) {
            error[j] += layer.weights[k][j] * deltas[k];
          }
        }
      }
    }
  }

  updateWeights(batchSize) {
    const lr = this.config.learningRate / batchSize;
    for (let layer of this.layers) {
      for (let i = 0; i < layer.weights.length; i++) {
        for (let j = 0; j < layer.weights[i].length; j++) {
          layer.weights[i][j] -= lr * layer.gradients.weights[i][j];
          layer.gradients.weights[i][j] = 0;
        }
      }
      for (let i = 0; i < layer.biases.length; i++) {
        layer.biases[i] -= lr * layer.gradients.biases[i];
        layer.gradients.biases[i] = 0;
      }
    }
  }

  train(dataset, epochs, onEpochComplete) {
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      for (let i = 0; i < dataset.inputs.length; i++) {
        const output = this.forward(dataset.inputs[i]);
        const loss = this.calculateLoss(output, dataset.targets[i]);
        totalLoss += loss;
        this.backward(dataset.inputs[i], dataset.targets[i], output);
        this.updateWeights(1);
      }
      const avgLoss = totalLoss / dataset.inputs.length;
      if (onEpochComplete) onEpochComplete(epoch, avgLoss);
    }
  }
}`;

export interface WeightSnapshot {
  epoch: number;
  connections: Array<{
    from: string;
    to: string;
    weight: number;
  }>;
}

interface ToyNetworkProps {
  onWeightSnapshotsChange?: (snapshots: WeightSnapshot[]) => void;
}

export default function ToyNetwork({ onWeightSnapshotsChange }: ToyNetworkProps) {
  const [hiddenSize, setHiddenSize] = useState(4);
  const [learningRate, setLearningRate] = useState(0.1);
  const [epochs, setEpochs] = useState(1000);
  const [selectedDataset, setSelectedDataset] = useState<string>('xor');
  const [isTraining, setIsTraining] = useState(false);
  const [lossHistory, setLossHistory] = useState<Array<{ epoch: number; loss: number }>>([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [predictions, setPredictions] = useState<Array<{ input: number[]; target: number; prediction: number }>>([]);
  const [weightSnapshots, setWeightSnapshots] = useState<WeightSnapshot[]>([]);
  const networkRef = useRef<NeuralNetwork | null>(null);

  const datasets: Record<string, Dataset> = {
    xor: generateXORDataset(),
    linear: generateLinearDataset(),
    circle: generateCircleDataset(),
  };

  const currentDataset = datasets[selectedDataset];

  const initializeNetwork = () => {
    const config: NetworkConfig = {
      inputSize: currentDataset.inputs[0].length,
      hiddenSizes: [hiddenSize],
      outputSize: currentDataset.targets[0].length,
      learningRate,
      activation: 'relu',
      lossFunction: selectedDataset === 'xor' || selectedDataset === 'circle' ? 'crossentropy' : 'mse',
    };
    networkRef.current = new NeuralNetwork(config);
  };

  useEffect(() => {
    initializeNetwork();
  }, [hiddenSize, learningRate, selectedDataset]);

  const extractWeights = (network: NeuralNetwork): WeightSnapshot['connections'] => {
    const layers = network.getLayers();
    const connections: WeightSnapshot['connections'] = [];
    
    // Extract weights from first layer (input to hidden)
    if (layers.length > 0) {
      const firstLayer = layers[0];
      for (let i = 0; i < firstLayer.weights.length; i++) {
        for (let j = 0; j < firstLayer.weights[i].length; j++) {
          connections.push({
            from: `i${j}`,
            to: `h${i}`,
            weight: firstLayer.weights[i][j]
          });
        }
      }
    }
    
    // Extract weights from second layer (hidden to output)
    if (layers.length > 1) {
      const secondLayer = layers[1];
      for (let i = 0; i < secondLayer.weights.length; i++) {
        for (let j = 0; j < secondLayer.weights[i].length; j++) {
          connections.push({
            from: `h${j}`,
            to: `o${i}`,
            weight: secondLayer.weights[i][j]
          });
        }
      }
    }
    
    return connections;
  };

  const handleTrain = () => {
    if (!networkRef.current) initializeNetwork();
    
    setIsTraining(true);
    setLossHistory([]);
    setCurrentEpoch(0);
    setPredictions([]);
    setWeightSnapshots([]);

    const network = networkRef.current!;
    const dataset = currentDataset;

    // Save initial weights
    const initialSnapshot = [{ epoch: 0, connections: extractWeights(network) }];
    setWeightSnapshots(initialSnapshot);
    if (onWeightSnapshotsChange) {
      onWeightSnapshotsChange(initialSnapshot);
    }

    // Train in batches to allow UI updates
    let epoch = 0;
    const trainBatch = () => {
      if (epoch >= epochs) {
        setIsTraining(false);
        // Show final predictions
        const finalPredictions = dataset.inputs.map((input, idx) => ({
          input,
          target: dataset.targets[idx][0],
          prediction: network.predict(input)[0],
        }));
        setPredictions(finalPredictions);
        // Save final weights
        setWeightSnapshots(prev => {
          const updated = [...prev, { epoch, connections: extractWeights(network) }];
          if (onWeightSnapshotsChange) {
            onWeightSnapshotsChange(updated);
          }
          return updated;
        });
        return;
      }

      let totalLoss = 0;
      for (let i = 0; i < dataset.inputs.length; i++) {
        const input = dataset.inputs[i];
        const target = dataset.targets[i];
        const output = network.forward(input);
        const loss = network.calculateLoss(output, target);
        totalLoss += loss;
        network.backward(input, target, output);
        network.updateWeights(1);
      }

      const avgLoss = totalLoss / dataset.inputs.length;
      setLossHistory(prev => [...prev, { epoch, loss: avgLoss }]);
      setCurrentEpoch(epoch);
      
      // Save weight snapshot every 50 epochs (or at key milestones)
      if (epoch % 50 === 0 || epoch < 10 || epoch === Math.floor(epochs * 0.25) || 
          epoch === Math.floor(epochs * 0.5) || epoch === Math.floor(epochs * 0.75)) {
        setWeightSnapshots(prev => {
          const updated = [...prev, { epoch, connections: extractWeights(network) }];
          if (onWeightSnapshotsChange) {
            onWeightSnapshotsChange(updated);
          }
          return updated;
        });
      }
      
      epoch++;

      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        setTimeout(trainBatch, 10); // Small delay for UI responsiveness
      });
    };

    trainBatch();
  };

  const handleStop = () => {
    setIsTraining(false);
  };

  const handleReset = () => {
    setIsTraining(false);
    setLossHistory([]);
    setCurrentEpoch(0);
    setPredictions([]);
    setWeightSnapshots([]);
    initializeNetwork();
  };

  const handleTest = () => {
    if (!networkRef.current) return;
    const network = networkRef.current;
    const dataset = currentDataset;
    
    const testPredictions = dataset.inputs.map((input, idx) => ({
      input,
      target: dataset.targets[idx][0],
      prediction: network.predict(input)[0],
    }));
    setPredictions(testPredictions);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Try It Yourself: Neural Network from Scratch</h3>
      
      <div className="mb-6">
        <CodeSnippets
          code={implementationCode}
          language="javascript"
          title="Complete Implementation"
          explanation="This is the full neural network implementation in TypeScript/JavaScript. All computation happens in your browser - no server calls!"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Configuration Panel */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Network Configuration</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hidden Layer Size: {hiddenSize}
              </label>
              <input
                type="range"
                min="2"
                max="16"
                value={hiddenSize}
                onChange={(e) => {
                  setHiddenSize(Number(e.target.value));
                  handleReset();
                }}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Rate: {learningRate.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={learningRate}
                onChange={(e) => {
                  setLearningRate(Number(e.target.value));
                  handleReset();
                }}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Epochs: {epochs}
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset
              </label>
              <select
                value={selectedDataset}
                onChange={(e) => {
                  setSelectedDataset(e.target.value);
                  handleReset();
                }}
                disabled={isTraining}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="xor">XOR (2 inputs, 1 output)</option>
                <option value="linear">Linear Regression (1 input, 1 output)</option>
                <option value="circle">Circle Classification (2 inputs, 1 output)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {currentDataset.description}
              </p>
            </div>

            {/* XOR Explanation */}
            {selectedDataset === 'xor' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <h5 className="font-semibold text-purple-900 mb-2">What is XOR?</h5>
                <p className="text-sm text-purple-800 mb-3">
                  XOR (Exclusive OR) is a logical operation that returns <strong>1</strong> when the inputs are different, 
                  and <strong>0</strong> when they are the same.
                </p>
                <div className="bg-white rounded p-3 mb-3 border border-purple-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-purple-200">
                        <th className="text-left py-1 px-2">Input 1</th>
                        <th className="text-left py-1 px-2">Input 2</th>
                        <th className="text-left py-1 px-2">XOR Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1 px-2">0</td>
                        <td className="py-1 px-2">0</td>
                        <td className="py-1 px-2 font-semibold">0</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2">0</td>
                        <td className="py-1 px-2">1</td>
                        <td className="py-1 px-2 font-semibold">1</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2">1</td>
                        <td className="py-1 px-2">0</td>
                        <td className="py-1 px-2 font-semibold">1</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2">1</td>
                        <td className="py-1 px-2">1</td>
                        <td className="py-1 px-2 font-semibold">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-white rounded p-3 mb-3 border border-purple-200">
                  <h6 className="text-xs font-semibold text-purple-900 mb-3">Linear Separability</h6>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Linearly Separable Example (AND) */}
                    <div>
                      <p className="text-xs text-gray-700 mb-2 font-medium">Linearly Separable:</p>
                      <svg width="150" height="150" className="border border-gray-300 rounded bg-gray-50">
                        <line x1="15" y1="135" x2="135" y2="135" stroke="#666" strokeWidth="1" />
                        <line x1="15" y1="135" x2="15" y2="15" stroke="#666" strokeWidth="1" />
                        <circle cx="30" cy="120" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                        <circle cx="30" cy="30" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                        <circle cx="120" cy="120" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                        <circle cx="120" cy="30" r="6" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                        <line x1="20" y1="25" x2="130" y2="125" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
                      </svg>
                    </div>
                    
                    {/* Non-linearly Separable Example (XOR) */}
                    <div>
                      <p className="text-xs text-gray-700 mb-2 font-medium">XOR (Not Separable):</p>
                      <svg width="150" height="150" className="border border-gray-300 rounded bg-gray-50">
                        <line x1="15" y1="135" x2="135" y2="135" stroke="#666" strokeWidth="1" />
                        <line x1="15" y1="135" x2="15" y2="15" stroke="#666" strokeWidth="1" />
                        <circle cx="30" cy="120" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                        <circle cx="30" cy="30" r="6" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                        <circle cx="120" cy="120" r="6" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
                        <circle cx="120" cy="30" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                        <line x1="15" y1="75" x2="135" y2="75" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.4" />
                        <line x1="75" y1="15" x2="75" y2="135" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.4" />
                        <line x1="20" y1="25" x2="130" y2="125" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    Output = 0 &nbsp;&nbsp;
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 ml-2"></span>
                    Output = 1
                  </p>
                </div>
                
                <p className="text-sm text-purple-800">
                  <strong>Why is XOR important?</strong> XOR is a classic problem in machine learning because it's 
                  <strong> non-linearly separable</strong> - you cannot draw a single straight line to separate the classes. 
                  This makes it impossible for a single-layer perceptron to learn, but a neural network with at least one 
                  hidden layer can learn this pattern. This demonstrates the power of multi-layer networks!
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleTrain}
              disabled={isTraining}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTraining ? 'Training...' : 'Train Network'}
            </button>
            <button
              onClick={handleStop}
              disabled={!isTraining}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>

          {!isTraining && lossHistory.length > 0 && (
            <button
              onClick={handleTest}
              className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Predictions
            </button>
          )}
        </div>

        {/* Training Status */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Training Status</h4>
          
          {isTraining && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Epoch: {currentEpoch} / {epochs}</span>
                <span>
                  Progress: {((currentEpoch / epochs) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentEpoch / epochs) * 100}%` }}
                />
              </div>
            </div>
          )}

          {lossHistory.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Current Loss: </span>
                <span className="font-semibold text-primary-600">
                  {lossHistory[lossHistory.length - 1].loss.toFixed(6)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Initial Loss: </span>
                <span className="font-semibold">
                  {lossHistory[0].loss.toFixed(6)}
                </span>
              </div>
              {lossHistory.length > 1 && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Improvement: </span>
                  <span className="font-semibold text-green-600">
                    {((1 - lossHistory[lossHistory.length - 1].loss / lossHistory[0].loss) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Loss Chart */}
          {lossHistory.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">Loss Over Time</h5>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lossHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Predictions Table */}
      {predictions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Predictions</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Input
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prediction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictions.map((pred, idx) => {
                  const error = Math.abs(pred.prediction - pred.target);
                  const isCorrect = selectedDataset === 'xor' || selectedDataset === 'circle'
                    ? (pred.prediction > 0.5) === (pred.target > 0.5)
                    : error < 0.1;
                  
                  return (
                    <tr key={idx} className={isCorrect ? 'bg-green-50' : ''}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        [{pred.input.map(v => v.toFixed(2)).join(', ')}]
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {pred.target.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {pred.prediction.toFixed(4)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {error.toFixed(4)}
                        {isCorrect && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

