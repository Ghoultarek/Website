'use client';

import { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NeuralNetwork, generateLinearDataset, generateCircleDataset } from './NeuralNetwork';
import { NetworkConfig, Dataset } from './types';
import CodeSnippets from './CodeSnippets';

const implementationCode = `# Neural Network Implementation from Scratch

import math
import random

class NeuralNetwork:
    def __init__(self, config):
        self.config = config
        self.layers = self.initialize_layers()
    
    def forward(self, input_data):
        """Forward propagation through the network."""
        current_input = input_data
        for i, layer in enumerate(self.layers):
            outputs = []
            is_output_layer = (i == len(self.layers) - 1)
            
            for j in range(len(layer['weights'])):
                # Compute weighted sum: sum(weights * inputs) + bias
                weighted_sum = layer['biases'][j]
                for k in range(len(current_input)):
                    weighted_sum += layer['weights'][j][k] * current_input[k]
                
                # Apply activation function
                # For regression (MSE), output layer uses linear activation
                # For classification (crossentropy), output layer uses sigmoid
                if is_output_layer and self.config['loss_function'] == 'mse':
                    outputs.append(weighted_sum)  # Linear activation
                elif is_output_layer and self.config['loss_function'] == 'crossentropy':
                    outputs.append(1.0 / (1.0 + math.exp(-weighted_sum)))  # Sigmoid
                else:
                    outputs.append(self.activate(weighted_sum))  # Hidden layers
            
            layer['activations'] = outputs
            current_input = outputs
        return current_input
    
    def backward(self, input_data, target, output):
        """Backward propagation (backpropagation) to compute gradients."""
        # Calculate output error (derivative of loss w.r.t. output)
        # For both MSE and cross-entropy, this is output - target
        error = [output[i] - target[i] for i in range(len(output))]
        
        # Backpropagate through layers (from output to input)
        for i in range(len(self.layers) - 1, -1, -1):
            layer = self.layers[i]
            prev_activations = (self.layers[i - 1]['activations'] 
                              if i > 0 else input_data)
            
            deltas = []
            is_output_layer = (i == len(self.layers) - 1)
            
            for j in range(len(layer['weights'])):
                # Compute derivative of activation function
                if is_output_layer and self.config['loss_function'] == 'mse':
                    # Linear activation derivative = 1
                    derivative = 1.0
                elif is_output_layer and self.config['loss_function'] == 'crossentropy':
                    # For cross-entropy with sigmoid, the gradient w.r.t. logit is already
                    # output - target. The sigmoid derivative is already incorporated.
                    derivative = 1.0
                else:
                    # Use configured activation derivative for hidden layers
                    activation = layer['activations'][j]
                    derivative = self.activate_derivative(activation)
                
                # Delta = error * derivative (chain rule)
                delta = error[j] * derivative
                deltas.append(delta)
                
                # Update gradients
                layer['gradients']['biases'][j] += delta
                for k in range(len(layer['weights'][j])):
                    layer['gradients']['weights'][j][k] += (
                        delta * prev_activations[k]
                    )
            
            # Calculate error for previous layer
            if i > 0:
                error = [0.0] * len(self.layers[i - 1]['weights'])
                for j in range(len(self.layers[i - 1]['weights'])):
                    for k in range(len(layer['weights'])):
                        error[j] += layer['weights'][k][j] * deltas[k]
    
    def update_weights(self, batch_size):
        """Update weights using gradient descent."""
        learning_rate = self.config['learning_rate'] / batch_size
        for layer in self.layers:
            # Update weights
            for i in range(len(layer['weights'])):
                for j in range(len(layer['weights'][i])):
                    layer['weights'][i][j] -= (
                        learning_rate * layer['gradients']['weights'][i][j]
                    )
                    layer['gradients']['weights'][i][j] = 0.0
            # Update biases
            for i in range(len(layer['biases'])):
                layer['biases'][i] -= (
                    learning_rate * layer['gradients']['biases'][i]
                )
                layer['gradients']['biases'][i] = 0.0
    
    def train(self, dataset, epochs, on_epoch_complete=None):
        """Train the network on a dataset."""
        for epoch in range(epochs):
            total_loss = 0.0
            for i in range(len(dataset['inputs'])):
                output = self.forward(dataset['inputs'][i])
                loss = self.calculate_loss(output, dataset['targets'][i])
                total_loss += loss
                self.backward(dataset['inputs'][i], 
                             dataset['targets'][i], output)
                self.update_weights(1)
            avg_loss = total_loss / len(dataset['inputs'])
            if on_epoch_complete:
                on_epoch_complete(epoch, avg_loss)
    
    def activate(self, x):
        """Apply activation function (ReLU, Sigmoid, or Tanh)."""
        activation = self.config['activation']
        if activation == 'relu':
            return max(0.0, x)
        elif activation == 'sigmoid':
            return 1.0 / (1.0 + math.exp(-x))
        elif activation == 'tanh':
            return math.tanh(x)
        return x
    
    def activate_derivative(self, x):
        """Compute derivative of activation function."""
        activation = self.config['activation']
        if activation == 'relu':
            return 1.0 if x > 0 else 0.0
        elif activation == 'sigmoid':
            return x * (1.0 - x)  # x is already sigmoid output
        elif activation == 'tanh':
            return 1.0 - x * x  # x is already tanh output
        return 1.0
    
    def calculate_loss(self, output, target):
        """Calculate loss (MSE or Cross-Entropy)."""
        if self.config['loss_function'] == 'crossentropy':
            loss = 0.0
            for i in range(len(output)):
                o = max(1e-15, min(1.0 - 1e-15, output[i]))
                loss -= (target[i] * math.log(o) + 
                        (1.0 - target[i]) * math.log(1.0 - o))
            return loss / len(output)
        else:  # MSE
            loss = sum((output[i] - target[i]) ** 2 
                      for i in range(len(output)))
            return loss / len(output)`;

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
  const [learningRate, setLearningRate] = useState(0.5);
  const [epochs, setEpochs] = useState(500);
  const [selectedDataset, setSelectedDataset] = useState<string>('linear');
  const [isTraining, setIsTraining] = useState(false);
  const [lossHistory, setLossHistory] = useState<Array<{ epoch: number; loss: number }>>([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [predictions, setPredictions] = useState<Array<{ input: number[]; target: number; prediction: number }>>([]);
  const [weightSnapshots, setWeightSnapshots] = useState<WeightSnapshot[]>([]);
  const networkRef = useRef<NeuralNetwork | null>(null);
  const shouldStopRef = useRef(false);
  
  // Memoize datasets, but regenerate linear regression on reset to get new random equation
  const [datasets, setDatasets] = useState<Record<string, Dataset>>(() => ({
    linear: generateLinearDataset(),
    circle: generateCircleDataset(),
  }));

  const currentDataset = datasets[selectedDataset];
  
  // Regenerate linear dataset when selected to get new random equation
  useEffect(() => {
    if (selectedDataset === 'linear') {
      setDatasets(prev => ({
        ...prev,
        linear: generateLinearDataset(),
      }));
    }
  }, [selectedDataset]);
  
  // Also regenerate when reset is clicked (handled in handleReset)

  const initializeNetwork = () => {
    // Use slightly worse initialization to show progress, but ensure convergence
    // Linear regression needs better initialization since output is linear
    const initializationScale = selectedDataset === 'linear' ? 1.2 : selectedDataset === 'circle' ? 1.5 : 1.0;
    
    // Use appropriate activation functions for each task
    // Linear regression: tanh in hidden layer, linear output (handled in forward pass)
    // Circle: ReLU is fine for classification
    const activation = selectedDataset === 'linear' ? 'tanh' : 'relu';
    
    const config: NetworkConfig = {
      inputSize: currentDataset.inputs[0].length,
      hiddenSizes: [hiddenSize],
      outputSize: currentDataset.targets[0].length,
      learningRate,
      activation,
      lossFunction: selectedDataset === 'circle' ? 'crossentropy' : 'mse',
      initializationScale,
    };
    networkRef.current = new NeuralNetwork(config);
  };

  // Set default hyperparameters when dataset changes
  useEffect(() => {
    if (selectedDataset === 'linear') {
      setLearningRate(0.1);
      setEpochs(300);
    } else if (selectedDataset === 'circle') {
      setLearningRate(0.15);
      setEpochs(150);
    }
  }, [selectedDataset]);

  useEffect(() => {
    initializeNetwork();
    // Show initial (bad) predictions for circle classification and linear regression
    if ((selectedDataset === 'circle' || selectedDataset === 'linear') && networkRef.current) {
      const dataset = datasets[selectedDataset];
      const initialPreds = dataset.inputs.map((input, idx) => ({
        input,
        target: dataset.targets[idx][0],
        prediction: networkRef.current!.predict(input)[0],
      }));
      setPredictions(initialPreds);
    } else {
      setPredictions([]);
    }
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
    shouldStopRef.current = false;
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
      // Check if training should stop
      if (shouldStopRef.current) {
        setIsTraining(false);
        // Show current predictions
        // For circle classification, show both train and test predictions
        if (selectedDataset === 'circle' && dataset.testInputs && dataset.testTargets) {
          const trainPredictions = dataset.inputs.map((input, idx) => ({
            input,
            target: dataset.targets[idx][0],
            prediction: network.predict(input)[0],
            isTest: false,
          }));
          const testPredictions = dataset.testInputs.map((input, idx) => ({
            input,
            target: dataset.testTargets![idx][0],
            prediction: network.predict(input)[0],
            isTest: true,
          }));
          setPredictions([...trainPredictions, ...testPredictions]);
        } else {
          const currentPredictions = dataset.inputs.map((input, idx) => ({
            input,
            target: dataset.targets[idx][0],
            prediction: network.predict(input)[0],
            isTest: false,
          }));
          setPredictions(currentPredictions);
        }
        return;
      }

      if (epoch >= epochs) {
        setIsTraining(false);
        // Show final predictions
        // For circle classification, show both train and test predictions
        if (selectedDataset === 'circle' && dataset.testInputs && dataset.testTargets) {
          const trainPredictions = dataset.inputs.map((input, idx) => ({
            input,
            target: dataset.targets[idx][0],
            prediction: network.predict(input)[0],
            isTest: false,
          }));
          const testPredictions = dataset.testInputs.map((input, idx) => ({
            input,
            target: dataset.testTargets![idx][0],
            prediction: network.predict(input)[0],
            isTest: true,
          }));
          setPredictions([...trainPredictions, ...testPredictions]);
        } else {
          const finalPredictions = dataset.inputs.map((input, idx) => ({
            input,
            target: dataset.targets[idx][0],
            prediction: network.predict(input)[0],
            isTest: false,
          }));
          setPredictions(finalPredictions);
        }
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
      
      // Update predictions periodically during training (for circle classification and linear regression)
      if ((selectedDataset === 'circle' || selectedDataset === 'linear') && (epoch % 50 === 0 || epoch < 10)) {
        // For circle classification, show both train and test predictions
        if (selectedDataset === 'circle' && dataset.testInputs && dataset.testTargets) {
          const trainPreds = dataset.inputs.map((input, idx) => ({
            input,
            target: dataset.targets[idx][0],
            prediction: network.predict(input)[0],
            isTest: false,
          }));
          const testPreds = dataset.testInputs.map((input, idx) => ({
            input,
            target: dataset.testTargets![idx][0],
            prediction: network.predict(input)[0],
            isTest: true,
          }));
          setPredictions([...trainPreds, ...testPreds]);
        } else {
          const currentPreds = dataset.inputs.map((input, idx) => ({
            input,
            target: dataset.targets[idx][0],
            prediction: network.predict(input)[0],
            isTest: false,
          }));
          setPredictions(currentPreds);
        }
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
    shouldStopRef.current = true;
    setIsTraining(false);
  };

  const handleReset = () => {
    shouldStopRef.current = true;
    setIsTraining(false);
    setLossHistory([]);
    setCurrentEpoch(0);
    setPredictions([]);
    setWeightSnapshots([]);
    // Regenerate linear dataset to get new random equation
    if (selectedDataset === 'linear') {
      setDatasets(prev => ({
        ...prev,
        linear: generateLinearDataset(),
      }));
    }
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
          language="python"
          title="Complete Implementation"
          explanation="This is the full neural network implementation in Python. The interactive demo below runs JavaScript in your browser, but this Python code shows the same algorithm that most ML practitioners use!"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Configuration Panel */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Network Configuration</h4>
            <button
              onClick={() => {
                // Suggested hyperparameters for each dataset - optimized for convergence
                if (selectedDataset === 'linear') {
                  setHiddenSize(8);
                  setLearningRate(0.1);
                  setEpochs(300);
                } else if (selectedDataset === 'circle') {
                  setHiddenSize(8);
                  setLearningRate(0.15);
                  setEpochs(150);
                }
                handleReset();
              }}
              disabled={isTraining}
              className="px-3 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suggested Hyperparameters
            </button>
          </div>
          
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
              <p className="text-xs text-gray-500 mt-1">
                Larger: More capacity, but slower & risk of overfitting. Smaller: Faster, but may underfit.
              </p>
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
              <p className="text-xs text-gray-500 mt-1">
                Larger: Faster convergence, but may overshoot. Smaller: More stable, but slower training.
              </p>
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
              <p className="text-xs text-gray-500 mt-1">
                Larger: Better learning, but slower & risk of overfitting. Smaller: Faster, but may underfit.
              </p>
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
                <option value="linear">Linear Regression (1 input, 1 output)</option>
                <option value="circle">Circle Classification (2 inputs, 1 output)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {currentDataset.description}
              </p>
            </div>

            {/* Linear Regression Explanation */}
            {selectedDataset === 'linear' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h5 className="font-semibold text-blue-900 mb-2">What is Linear Regression?</h5>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Demo Only</p>
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> For real linear regression problems, simple linear regression (y = mx + b) is faster and more appropriate. 
                    This neural network demo is for educational purposes to show how networks can learn linear patterns. 
                    In practice, use traditional linear regression for this type of problem.
                  </p>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  Here, we train on clean points along a random line <strong>y = {currentDataset.metadata?.slope?.toFixed(2) || 'mx'}x {currentDataset.metadata?.intercept && currentDataset.metadata.intercept >= 0 ? '+' : ''} {currentDataset.metadata?.intercept?.toFixed(2) || '+ b'}</strong> and test the model's ability to <strong>interpolate</strong> 
                  (predict values between training points). The network should learn the linear relationship and generalize 
                  to new x values it hasn't seen during training.
                </p>
                
                <div className="bg-white rounded p-3 mb-3 border border-blue-200">
                  <h6 className="text-xs font-semibold text-blue-900 mb-3">Training Data vs Model Predictions</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Training Data */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Training Data (Ground Truth)</p>
                      <svg width="200" height="200" className="border border-gray-300 rounded bg-gray-50 mx-auto">
                        {/* Axes */}
                        <line x1="20" y1="170" x2="180" y2="170" stroke="#666" strokeWidth="1" />
                        <line x1="20" y1="170" x2="20" y2="30" stroke="#666" strokeWidth="1" />
                        
                        {/* True line: y = mx + b */}
                        {(() => {
                          const slope = currentDataset.metadata?.slope || 0.5;
                          const intercept = currentDataset.metadata?.intercept || 0.2;
                          const x1 = -1;
                          const y1 = slope * x1 + intercept;
                          const px1 = 20 + ((x1 + 1) / 2) * 160;
                          // Map y to SVG coordinates: y ranges from slope*(-1)+intercept to slope*(1)+intercept
                          const yMin = slope * (-1) + intercept;
                          const yMax = slope * 1 + intercept;
                          const yRange = yMax - yMin || 1;
                          const py1 = 170 - ((y1 - yMin) / yRange) * 140;
                          
                          const x2 = 1;
                          const y2 = slope * x2 + intercept;
                          const px2 = 20 + ((x2 + 1) / 2) * 160;
                          const py2 = 170 - ((y2 - yMin) / yRange) * 140;
                          
                          return (
                            <line 
                              x1={px1} 
                              y1={py1} 
                              x2={px2} 
                              y2={py2}
                              stroke="#3b82f6" 
                              strokeWidth="2" 
                              strokeDasharray="3,3"
                            />
                          );
                        })()}
                        
                        {/* Actual data points */}
                        {currentDataset.inputs.map((input, idx) => {
                          const x = input[0];
                          const y = currentDataset.targets[idx][0];
                          const px = 20 + ((x + 1) / 2) * 160;
                          // Map y to SVG coordinates using actual y range
                          const slope = currentDataset.metadata?.slope || 0.5;
                          const intercept = currentDataset.metadata?.intercept || 0.2;
                          const yMin = slope * (-1) + intercept;
                          const yMax = slope * 1 + intercept;
                          const yRange = yMax - yMin || 1;
                          const py = 170 - ((y - yMin) / yRange) * 140;
                          
                          return (
                            <circle 
                              key={`data-${idx}`} 
                              cx={px} 
                              cy={py} 
                              r="3" 
                              fill="#60a5fa" 
                              stroke="#2563eb" 
                              strokeWidth="1" 
                            />
                          );
                        })}
                      </svg>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Training points on line: <strong>y = {currentDataset.metadata?.slope?.toFixed(2) || 'mx'}x {currentDataset.metadata?.intercept && currentDataset.metadata.intercept >= 0 ? '+' : ''} {currentDataset.metadata?.intercept?.toFixed(2) || '+ b'}</strong>
                      </p>
                    </div>
                    
                    {/* Model Predictions */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 text-center">
                        Model Predictions {predictions.length > 0 && isTraining && `(Epoch ${currentEpoch})`}
                      </p>
                      <svg width="200" height="200" className="border border-gray-300 rounded bg-gray-50 mx-auto">
                        {/* Axes */}
                        <line x1="20" y1="170" x2="180" y2="170" stroke="#666" strokeWidth="1" />
                        <line x1="20" y1="170" x2="20" y2="30" stroke="#666" strokeWidth="1" />
                        
                        {/* Predicted line - connect prediction points */}
                        {predictions.length > 0 && (() => {
                          const slope = currentDataset.metadata?.slope || 0.5;
                          const intercept = currentDataset.metadata?.intercept || 0.2;
                          const yMin = slope * (-1) + intercept;
                          const yMax = slope * 1 + intercept;
                          const yRange = yMax - yMin || 1;
                          
                          // Sort predictions by x value
                          const sorted = [...predictions].sort((a, b) => a.input[0] - b.input[0]);
                          
                          // Draw line segments between consecutive predictions
                          const path = sorted.map((pred, idx) => {
                            const x = pred.input[0];
                            const y = pred.prediction;
                            const px = 20 + ((x + 1) / 2) * 160;
                            const py = 170 - ((y - yMin) / yRange) * 140;
                            return `${idx === 0 ? 'M' : 'L'} ${px} ${py}`;
                          }).join(' ');
                          
                          return (
                            <path
                              d={path}
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="2"
                              strokeDasharray="2,2"
                            />
                          );
                        })()}
                        
                        {/* True line for reference */}
                        {(() => {
                          const slope = currentDataset.metadata?.slope || 0.5;
                          const intercept = currentDataset.metadata?.intercept || 0.2;
                          const x1 = -1;
                          const y1 = slope * x1 + intercept;
                          const px1 = 20 + ((x1 + 1) / 2) * 160;
                          const yMin = slope * (-1) + intercept;
                          const yMax = slope * 1 + intercept;
                          const yRange = yMax - yMin || 1;
                          const py1 = 170 - ((y1 - yMin) / yRange) * 140;
                          
                          const x2 = 1;
                          const y2 = slope * x2 + intercept;
                          const px2 = 20 + ((x2 + 1) / 2) * 160;
                          const py2 = 170 - ((y2 - yMin) / yRange) * 140;
                          
                          return (
                            <line 
                              x1={px1} 
                              y1={py1} 
                              x2={px2} 
                              y2={py2}
                              stroke="#3b82f6" 
                              strokeWidth="1.5" 
                              strokeDasharray="3,3"
                              opacity="0.6"
                            />
                          );
                        })()}
                        
                        {/* Predicted points */}
                        {predictions.length > 0 ? (() => {
                          const slope = currentDataset.metadata?.slope || 0.5;
                          const intercept = currentDataset.metadata?.intercept || 0.2;
                          const yMin = slope * (-1) + intercept;
                          const yMax = slope * 1 + intercept;
                          const yRange = yMax - yMin || 1;
                          
                          return predictions.map((pred, idx) => {
                            const x = pred.input[0];
                            const y = pred.prediction;
                            const px = 20 + ((x + 1) / 2) * 160;
                            const py = 170 - ((y - yMin) / yRange) * 140;
                            
                            const error = Math.abs(pred.prediction - pred.target);
                            const isGood = error < 0.05; // Tighter threshold for clean data
                            
                            return (
                              <circle 
                                key={`pred-${idx}`} 
                                cx={px} 
                                cy={py} 
                                r="3" 
                                fill="#22c55e" 
                                stroke={isGood ? "#15803d" : "#991b1b"} 
                                strokeWidth={isGood ? 1.5 : 2}
                                opacity={isGood ? 1 : 0.7}
                              />
                            );
                          });
                        })() : (
                          <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-400">
                            Train to see predictions
                          </text>
                        )}
                      </svg>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        {predictions.length > 0 ? (
                          <>
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Predicted points &nbsp;&nbsp;
                            <span className="inline-block w-2 h-2 border-2 border-blue-500 rounded-full bg-transparent mr-1 ml-2"></span>
                            True line (reference)
                            <br />
                            <span className="text-xs text-green-600">Green border = Good fit</span>
                            <br />
                            <span className="text-xs text-red-600">Red border = Poor fit</span>
                          </>
                        ) : (
                          <>
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Predicted line &nbsp;&nbsp;
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1 ml-2"></span>
                            True line
                          </>
                        )}
                      </p>
                      {predictions.length > 0 && !isTraining && (
                        <p className="text-xs text-center mt-1 font-semibold text-blue-700">
                          Mean Error: {(predictions.reduce((sum, p) => sum + Math.abs(p.prediction - p.target), 0) / predictions.length).toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-blue-800">
                  <strong>Why use neural networks for regression?</strong> While simple linear regression can solve this, 
                  neural networks can learn more complex, non-linear relationships. This example demonstrates how a network 
                  can learn even simple linear patterns, and the same architecture can be extended to learn non-linear functions!
                </p>
              </div>
            )}

            {/* Circle Classification Explanation */}
            {selectedDataset === 'circle' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h5 className="font-semibold text-green-900 mb-2">What is Circle Classification?</h5>
                <p className="text-sm text-green-800 mb-3">
                  Circle classification is a 2D binary classification problem where points are classified as being 
                  <strong> inside</strong> or <strong>outside</strong> a circle. This is a non-linearly separable problem 
                  that requires a neural network with hidden layers.
                </p>
                
                <div className="bg-white rounded p-3 mb-3 border border-green-200">
                  <h6 className="text-xs font-semibold text-green-900 mb-3">Training Data vs Model Predictions (Train & Test Sets)</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Training Data */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Training Data (Ground Truth)</p>
                      <svg width="200" height="200" className="border border-gray-300 rounded bg-gray-50 mx-auto">
                        {/* Axes */}
                        <line x1="20" y1="100" x2="180" y2="100" stroke="#666" strokeWidth="1" />
                        <line x1="100" y1="20" x2="100" y2="180" stroke="#666" strokeWidth="1" />
                        
                        {/* Circle boundary (radius ~0.5, centered at origin) */}
                        <circle cx="100" cy="100" r="40" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
                        
                        {/* Training points */}
                        {currentDataset.inputs.map((input, idx) => {
                          const [x, y] = input;
                          const target = currentDataset.targets[idx][0];
                          const px = 100 + x * 80;
                          const py = 100 - y * 80;
                          const fillColor = target === 0 ? '#ef4444' : '#22c55e';
                          const strokeColor = target === 0 ? '#991b1b' : '#15803d';
                          
                          return (
                            <circle 
                              key={`train-data-${idx}`} 
                              cx={px} 
                              cy={py} 
                              r="3" 
                              fill={fillColor} 
                              stroke={strokeColor} 
                              strokeWidth="1" 
                            />
                          );
                        })}
                        {/* Test points (if available) */}
                        {currentDataset.testInputs && currentDataset.testInputs.map((input, idx) => {
                          const [x, y] = input;
                          const target = currentDataset.testTargets![idx][0];
                          const px = 100 + x * 80;
                          const py = 100 - y * 80;
                          const fillColor = target === 0 ? '#ef4444' : '#22c55e';
                          const strokeColor = target === 0 ? '#991b1b' : '#15803d';
                          
                          return (
                            <circle 
                              key={`test-data-${idx}`} 
                              cx={px} 
                              cy={py} 
                              r="3" 
                              fill={fillColor} 
                              stroke={strokeColor} 
                              strokeWidth="1.5"
                              opacity="0.6"
                            />
                          );
                        })}
                      </svg>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                        Inside (Class 0) &nbsp;&nbsp;
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 ml-2"></span>
                        Outside (Class 1)
                        {currentDataset.testInputs && (
                          <>
                            <br />
                            <span className="text-xs text-gray-500">Solid = Train, Faded = Test</span>
                          </>
                        )}
                      </p>
                    </div>
                    
                    {/* Model Predictions */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 text-center">
                        Model Predictions {predictions.length > 0 && isTraining && `(Epoch ${currentEpoch})`}
                      </p>
                      <svg width="200" height="200" className="border border-gray-300 rounded bg-gray-50 mx-auto">
                        {/* Axes */}
                        <line x1="20" y1="100" x2="180" y2="100" stroke="#666" strokeWidth="1" />
                        <line x1="100" y1="20" x2="100" y2="180" stroke="#666" strokeWidth="1" />
                        
                        {/* Circle boundary (radius ~0.5, centered at origin) */}
                        <circle cx="100" cy="100" r="40" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
                        
                        {/* Show predictions if available */}
                        {predictions.length > 0 ? (
                          predictions.map((pred, idx) => {
                            const [x, y] = pred.input;
                            const px = 100 + x * 80;
                            const py = 100 - y * 80;
                            
                            const predictedClass = pred.prediction > 0.5 ? 1 : 0;
                            const isCorrect = (pred.prediction > 0.5) === (pred.target > 0.5);
                            const fillColor = predictedClass === 0 ? '#ef4444' : '#22c55e';
                            const strokeColor = isCorrect ? '#15803d' : '#991b1b';
                            const strokeWidth = isCorrect ? 1.5 : 2;
                            const isTest = pred.isTest || false;
                            
                            return (
                              <circle 
                                key={`pred-${idx}`} 
                                cx={px} 
                                cy={py} 
                                r={isTest ? "4" : "3"}
                                fill={fillColor} 
                                stroke={strokeColor} 
                                strokeWidth={strokeWidth}
                                opacity={isCorrect ? (isTest ? 0.8 : 1) : 0.7}
                              />
                            );
                          })
                        ) : (
                          <text x="100" y="100" textAnchor="middle" className="text-sm fill-gray-400">
                            Train to see predictions
                          </text>
                        )}
                      </svg>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                        Predicted Inside &nbsp;&nbsp;
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 ml-2"></span>
                        Predicted Outside
                        <br />
                        <span className="text-xs text-green-600">Green border = Correct</span>
                        <br />
                        <span className="text-xs text-red-600">Red border = Wrong</span>
                        {predictions.length > 0 && predictions.some(p => p.isTest) && (
                          <>
                            <br />
                            <span className="text-xs text-gray-500">Smaller = Train, Larger = Test</span>
                          </>
                        )}
                      </p>
                      {predictions.length > 0 && !isTraining && (
                        <div className="text-xs text-center mt-2 space-y-1">
                          {(() => {
                            const trainPreds = predictions.filter(p => !p.isTest);
                            const testPreds = predictions.filter(p => p.isTest);
                            const trainCorrect = trainPreds.filter(p => (p.prediction > 0.5) === (p.target > 0.5)).length;
                            const testCorrect = testPreds.filter(p => (p.prediction > 0.5) === (p.target > 0.5)).length;
                            return (
                              <>
                                <p className="font-semibold text-green-700">
                                  Train Accuracy: {trainPreds.length > 0 ? ((trainCorrect / trainPreds.length) * 100).toFixed(1) : '0'}%
                                </p>
                                {testPreds.length > 0 && (
                                  <p className="font-semibold text-blue-700">
                                    Test Accuracy: {((testCorrect / testPreds.length) * 100).toFixed(1)}%
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                      {predictions.length > 0 && !isTraining && (
                        <p className="text-xs text-center mt-1 font-semibold text-green-700">
                          Accuracy: {((predictions.filter(p => (p.prediction > 0.5) === (p.target > 0.5)).length / predictions.length) * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-green-800">
                  <strong>Why is this challenging?</strong> Circle classification has continuous 2D inputs. The decision boundary 
                  is a circle, which cannot be represented by a single linear separator. A neural network with hidden layers can 
                  learn this circular decision boundary, demonstrating its ability to learn complex, non-linear patterns in 
                  continuous data!
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
              title={selectedDataset === 'linear' ? 'Reset network and generate new random function' : 'Reset network'}
            >
              {selectedDataset === 'linear' ? 'Reset (New Function)' : 'Reset'}
            </button>
          </div>
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


    </div>
  );
}

