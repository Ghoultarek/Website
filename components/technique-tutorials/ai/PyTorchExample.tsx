'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CodeSnippets from './CodeSnippets';

const pytorchCode = `import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

# Define a simple neural network
class SimpleNet(nn.Module):
    def __init__(self):
        super(SimpleNet, self).__init__()
        self.fc1 = nn.Linear(2, 4)  # Input to hidden
        self.fc2 = nn.Linear(4, 1)  # Hidden to output
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.sigmoid(self.fc2(x))
        return x

# Create model, loss function, and optimizer
model = SimpleNet()
criterion = nn.BCELoss()  # Binary cross-entropy
optimizer = optim.SGD(model.parameters(), lr=0.1)

# Generate XOR dataset
X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]], dtype=torch.float32)
y = torch.tensor([[0.], [1.], [1.], [0.]], dtype=torch.float32)

# Training loop
losses = []
for epoch in range(1000):
    # Forward pass
    outputs = model(X)
    loss = criterion(outputs, y)
    
    # Backward pass and optimization
    optimizer.zero_grad()  # Clear gradients
    loss.backward()        # Compute gradients
    optimizer.step()       # Update weights
    
    losses.append(loss.item())
    
    if (epoch + 1) % 100 == 0:
        print(f'Epoch [{epoch+1}/1000], Loss: {loss.item():.4f}')

# Test the model
with torch.no_grad():
    predictions = model(X)
    print("Predictions:", predictions.numpy())`;

interface WeightSnapshot {
  epoch: number;
  weights: {
    inputToHidden: number[][]; // 2x4 matrix
    hiddenToOutput: number[][]; // 4x1 matrix
  };
}

export default function PyTorchExample() {
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<Array<{ epoch: number; loss: number }>>([]);
  const [currentLoss, setCurrentLoss] = useState<number | null>(null);
  const [weights, setWeights] = useState<WeightSnapshot['weights']>({
    inputToHidden: [
      [0.5, 0.4],
      [-0.3, 0.6],
      [0.2, -0.1],
      [0.1, 0.3]
    ],
    hiddenToOutput: [[0.7], [-0.5], [0.3], [-0.2]]
  });
  const animationRef = useRef<number>();

  // Simulate training
  useEffect(() => {
    if (!isTraining) return;

    const simulateEpoch = () => {
      setEpoch(prev => {
        const newEpoch = prev + 1;
        
        // Simulate loss decreasing over time (exponential decay with noise)
        const baseLoss = 0.7 * Math.exp(-newEpoch / 200) + 0.01;
        const noise = (Math.random() - 0.5) * 0.05;
        const loss = Math.max(0.01, baseLoss + noise);
        
        setCurrentLoss(loss);
        setLossHistory(prev => [...prev, { epoch: newEpoch, loss }]);
        
        // Update weights every 10 epochs (lagged updates for performance)
        if (newEpoch % 10 === 0) {
          setWeights(prevWeights => {
            // Simulate gradient descent: weights move towards optimal values
            const progress = Math.min(1, newEpoch / 1000);
            const learningRate = 0.1 * (1 - progress * 0.8); // Decay learning rate
            
            const newInputToHidden = prevWeights.inputToHidden.map((row, i) =>
              row.map((w, j) => {
                // Target weights (simulated optimal)
                const target = [
                  [0.8, 0.6],
                  [-0.5, 0.7],
                  [0.4, -0.3],
                  [0.2, 0.5]
                ][i][j];
                // Move towards target with noise
                const gradient = (target - w) * 0.1 + (Math.random() - 0.5) * 0.02;
                return w + learningRate * gradient;
              })
            );
            
            const newHiddenToOutput = prevWeights.hiddenToOutput.map((row, i) =>
              row.map((w, j) => {
                const target = [[0.9], [-0.7], [0.5], [-0.4]][i][j];
                const gradient = (target - w) * 0.1 + (Math.random() - 0.5) * 0.02;
                return w + learningRate * gradient;
              })
            );
            
            return {
              inputToHidden: newInputToHidden,
              hiddenToOutput: newHiddenToOutput
            };
          });
        }
        
        if (newEpoch >= 1000) {
          setIsTraining(false);
          return prev;
        }
        
        return newEpoch;
      });
    };

    const interval = setInterval(simulateEpoch, 50); // Fast animation
    return () => clearInterval(interval);
  }, [isTraining]);

  const handleStartTraining = () => {
    setIsTraining(true);
    setEpoch(0);
    setLossHistory([]);
    setCurrentLoss(null);
  };

  const handleStopTraining = () => {
    setIsTraining(false);
  };

  const handleReset = () => {
    setIsTraining(false);
    setEpoch(0);
    setLossHistory([]);
    setCurrentLoss(null);
    setWeights({
      inputToHidden: [
        [0.5, 0.4],
        [-0.3, 0.6],
        [0.2, -0.1],
        [0.1, 0.3]
      ],
      hiddenToOutput: [[0.7], [-0.5], [0.3], [-0.2]]
    });
  };

  // Calculate gradient magnitudes for visualization (simulated)
  const getGradientMagnitudes = () => {
    if (lossHistory.length === 0) return [];
    const recent = lossHistory.slice(-10);
    return recent.map((point, idx) => {
      if (idx === 0) return 1.0;
      const prevLoss = recent[idx - 1].loss;
      const gradient = Math.abs(point.loss - prevLoss) * 10;
      return Math.min(1, gradient);
    });
  };

  const gradientMagnitudes = getGradientMagnitudes();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Training a Neural Network in PyTorch</h3>
      
      {/* Network Architecture Diagram */}
      <div className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Network Architecture</h4>
        <p className="text-sm text-gray-600 mb-4">
          The network we'll build has 2 inputs, 4 hidden neurons, and 1 output. Here's the structure:
        </p>
        <div className="flex items-center justify-center gap-6 overflow-x-auto pb-4">
          <svg width="600" height="300" className="mx-auto">
            {/* Input Layer */}
            <g>
              <text x="50" y="30" textAnchor="middle" className="text-sm font-semibold fill-gray-700">Input Layer</text>
              <circle cx="50" cy="100" r="20" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
              <text x="50" y="105" textAnchor="middle" className="text-xs font-semibold fill-gray-900">x₁</text>
              <circle cx="50" cy="200" r="20" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
              <text x="50" y="205" textAnchor="middle" className="text-xs font-semibold fill-gray-900">x₂</text>
            </g>

            {/* Connections from Input to Hidden */}
            {[100, 140, 180, 220].map((y, idx) => (
              <g key={`input-hidden-${idx}`}>
                {[0, 1].map((inputIdx) => (
                  <line
                    key={`conn-${inputIdx}-${idx}`}
                    x1="70"
                    y1={inputIdx === 0 ? 100 : 200}
                    x2="180"
                    y2={y}
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                ))}
              </g>
            ))}

            {/* Hidden Layer */}
            <g>
              <text x="200" y="30" textAnchor="middle" className="text-sm font-semibold fill-gray-700">Hidden Layer (ReLU)</text>
              {[100, 140, 180, 220].map((y, idx) => (
                <g key={`hidden-${idx}`}>
                  <circle cx="200" cy={y} r="18" fill="#34d399" stroke="#059669" strokeWidth="2" />
                  <text x="200" y={y + 5} textAnchor="middle" className="text-xs font-semibold fill-gray-900">
                    h{idx + 1}
                  </text>
                </g>
              ))}
            </g>

            {/* Connections from Hidden to Output */}
            {[100, 140, 180, 220].map((y) => (
              <line
                key={`hidden-output-${y}`}
                x1="218"
                y1={y}
                x2="380"
                y2="150"
                stroke="#9ca3af"
                strokeWidth="1.5"
                opacity="0.4"
              />
            ))}

            {/* Output Layer */}
            <g>
              <text x="400" y="30" textAnchor="middle" className="text-sm font-semibold fill-gray-700">Output Layer (Sigmoid)</text>
              <circle cx="400" cy="150" r="22" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2" />
              <text x="400" y="156" textAnchor="middle" className="text-xs font-semibold fill-gray-900">ŷ</text>
            </g>

            {/* Layer labels with dimensions */}
            <g>
              <text x="50" y="250" textAnchor="middle" className="text-xs fill-gray-600">2 neurons</text>
              <text x="200" y="250" textAnchor="middle" className="text-xs fill-gray-600">4 neurons</text>
              <text x="400" y="250" textAnchor="middle" className="text-xs fill-gray-600">1 neuron</text>
            </g>
          </svg>
        </div>
        <div className="mt-4 text-xs text-gray-600 text-center space-y-1">
          <p><strong>Architecture:</strong> 2 → 4 → 1 (fully connected)</p>
          <p><strong>Activations:</strong> ReLU in hidden layer, Sigmoid in output layer</p>
          <p><strong>Total parameters:</strong> (2×4 + 4) + (4×1 + 1) = 13 weights + biases</p>
        </div>
      </div>
      
      <div className="mb-6">
        <CodeSnippets
          code={pytorchCode}
          language="python"
          title="PyTorch Training Example"
          explanation="This code demonstrates how to define and train the neural network shown above. The network learns the XOR function."
        />
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
          <h5 className="font-semibold text-purple-900 mb-2">About the XOR Function</h5>
          <p className="text-sm text-purple-800 mb-2">
            XOR (Exclusive OR) returns <strong>1</strong> when inputs differ, and <strong>0</strong> when they match. 
            The dataset has 4 samples: (0,0)→0, (0,1)→1, (1,0)→1, (1,1)→0.
          </p>
          
          <div className="my-4 bg-white rounded p-4 border border-purple-200">
            <h6 className="text-xs font-semibold text-purple-900 mb-3">Linear Separability Explained</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linearly Separable Example (AND) */}
              <div>
                <p className="text-xs text-gray-700 mb-2 font-medium">Linearly Separable (AND):</p>
                <svg width="200" height="200" className="border border-gray-300 rounded bg-gray-50">
                  {/* Axes */}
                  <line x1="20" y1="180" x2="180" y2="180" stroke="#666" strokeWidth="1" />
                  <line x1="20" y1="180" x2="20" y2="20" stroke="#666" strokeWidth="1" />
                  {/* Labels */}
                  <text x="190" y="185" className="text-xs fill-gray-700">Input 1</text>
                  <text x="5" y="15" className="text-xs fill-gray-700">Input 2</text>
                  {/* Data points: (0,0)→0, (0,1)→0, (1,0)→0, (1,1)→1 */}
                  <circle cx="40" cy="160" r="8" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                  <circle cx="40" cy="40" r="8" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                  <circle cx="160" cy="160" r="8" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                  <circle cx="160" cy="40" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
                  {/* Separating line */}
                  <line x1="30" y1="30" x2="170" y2="170" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
                <p className="text-xs text-blue-600 font-medium mt-2 text-center">Can separate with one line!</p>
              </div>
              
              {/* Non-linearly Separable Example (XOR) */}
              <div>
                <p className="text-xs text-gray-700 mb-2 font-medium">Non-linearly Separable (XOR):</p>
                <svg width="200" height="200" className="border border-gray-300 rounded bg-gray-50">
                  {/* Axes */}
                  <line x1="20" y1="180" x2="180" y2="180" stroke="#666" strokeWidth="1" />
                  <line x1="20" y1="180" x2="20" y2="20" stroke="#666" strokeWidth="1" />
                  {/* Labels */}
                  <text x="190" y="185" className="text-xs fill-gray-700">Input 1</text>
                  <text x="5" y="15" className="text-xs fill-gray-700">Input 2</text>
                  {/* Data points: (0,0)→0, (0,1)→1, (1,0)→1, (1,1)→0 */}
                  <circle cx="40" cy="160" r="8" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                  <circle cx="40" cy="40" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
                  <circle cx="160" cy="160" r="8" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
                  <circle cx="160" cy="40" r="8" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                  {/* Failed separating lines */}
                  <line x1="20" y1="100" x2="180" y2="100" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
                  <line x1="100" y1="20" x2="100" y2="180" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
                  <line x1="30" y1="30" x2="170" y2="170" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
                </svg>
                <p className="text-xs text-red-600 font-medium mt-2 text-center">No single line works!</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
              Output = 0 &nbsp;&nbsp;
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1 ml-3"></span>
              Output = 1
            </p>
          </div>
          
          <p className="text-sm text-purple-800">
            XOR is historically significant because it's <strong>non-linearly separable</strong> - a single-layer network 
            cannot learn it, but a network with hidden layers can. This demonstrates why multi-layer networks are powerful!
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Interactive Training Visualization</h4>
        
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleStartTraining}
            disabled={isTraining}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Training
          </button>
          <button
            onClick={handleStopTraining}
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
          <div className="ml-auto text-sm text-gray-600">
            <span className="font-medium">Epoch: </span>
            <span className="font-semibold">{epoch}</span>
            {currentLoss !== null && (
              <>
                <span className="ml-4 font-medium">Loss: </span>
                <span className="font-semibold">{currentLoss.toFixed(4)}</span>
              </>
            )}
          </div>
        </div>

        {/* Loss Chart */}
        <div className="mb-6">
          <h5 className="text-md font-semibold text-gray-800 mb-2">Loss Over Time</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lossHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="epoch" 
                label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="loss" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
                name="Loss"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Network Architecture Diagram */}
        <div className="mb-6">
          <h5 className="text-md font-semibold text-gray-800 mb-2">Network Architecture</h5>
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-6">
            <div className="flex items-center justify-center gap-4">
              {/* Input Layer */}
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Input</div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center border-2 border-blue-400">x₁</div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center border-2 border-blue-400">x₂</div>
              </div>

              {/* Connections to Hidden Layer with Weights */}
              <div className="flex flex-col gap-8 relative">
                {[0, 1, 2, 3].map((hiddenIdx) => (
                  <div key={hiddenIdx} className="flex items-center gap-2">
                    {/* Weight labels */}
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-gray-600 font-mono bg-white px-1 rounded border border-gray-300">
                        {weights.inputToHidden[hiddenIdx][0].toFixed(2)}
                      </span>
                      <span className="text-gray-600 font-mono bg-white px-1 rounded border border-gray-300">
                        {weights.inputToHidden[hiddenIdx][1].toFixed(2)}
                      </span>
                    </div>
                    {/* Arrow */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Hidden Layer */}
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Hidden (ReLU)</div>
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isTraining && gradientMagnitudes.length > idx && gradientMagnitudes[idx] > 0.5
                      ? 'bg-green-200 border-green-400 animate-pulse'
                      : 'bg-gray-200 border-gray-400'
                  }`}>
                    h{idx + 1}
                  </div>
                ))}
              </div>

              {/* Connections to Output Layer with Weights */}
              <div className="flex flex-col gap-8 relative">
                {[0, 1, 2, 3].map((hiddenIdx) => (
                  <div key={hiddenIdx} className="flex items-center gap-2">
                    {/* Weight label */}
                    <span className="text-xs text-gray-600 font-mono bg-white px-1 rounded border border-gray-300">
                      {weights.hiddenToOutput[hiddenIdx][0].toFixed(2)}
                    </span>
                    {/* Arrow */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Output Layer */}
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Output (Sigmoid)</div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  isTraining && currentLoss !== null && currentLoss < 0.1
                    ? 'bg-green-200 border-green-400'
                    : 'bg-purple-200 border-purple-400'
                }`}>
                  ŷ
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600 text-center">
              <p>Weights update every 10 epochs during training (shown with 2 decimal precision)</p>
            </div>
          </div>
        </div>

        {/* Gradient Flow Indicator */}
        {isTraining && (
          <div className="mb-4">
            <h5 className="text-md font-semibold text-gray-800 mb-2">Gradient Flow (Backpropagation)</h5>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (1000 - epoch) / 10)}%`,
                    opacity: gradientMagnitudes.length > 0 ? gradientMagnitudes[gradientMagnitudes.length - 1] : 0.5
                  }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {gradientMagnitudes.length > 0 
                  ? `Magnitude: ${(gradientMagnitudes[gradientMagnitudes.length - 1] * 100).toFixed(0)}%`
                  : 'Initializing...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gradients flow backward through the network, updating weights to minimize loss.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2">Key Concepts:</h5>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Forward Pass:</strong> Input flows through layers, applying weights and activations</li>
          <li><strong>Loss Calculation:</strong> Compare prediction with target using a loss function</li>
          <li><strong>Backward Pass:</strong> Compute gradients using backpropagation</li>
          <li><strong>Weight Update:</strong> Adjust weights using optimizer (SGD) to minimize loss</li>
        </ul>
      </div>
    </div>
  );
}

