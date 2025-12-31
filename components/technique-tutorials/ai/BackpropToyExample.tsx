'use client';

import { useState } from 'react';
import { InlineMath } from 'react-katex';

export default function BackpropToyExample() {
  const [step, setStep] = useState(0);

  // Simple network: 1 input → 2 hidden → 1 output
  // Learning X² where X = 3, target = 9
  const X = 3;
  const target = 9;
  
  // Initial weights (small random values)
  const initialWeights = {
    w1: 0.5,  // Input → Hidden 1
    w2: 0.3,  // Input → Hidden 2
    w3: 0.7,  // Hidden 1 → Output
    w4: 0.4,  // Hidden 2 → Output
    b1: 0.1,  // Bias Hidden 1
    b2: 0.2,  // Bias Hidden 2
    b3: 0.05, // Bias Output
  };

  // Training function
  const trainNetwork = (weights: typeof initialWeights, epochs: number, learningRate: number) => {
    let currentWeights = { ...weights };
    const lossHistory: number[] = [];

    for (let epoch = 0; epoch < epochs; epoch++) {
      // Forward pass
      const h1_sum = X * currentWeights.w1 + currentWeights.b1;
      const h1_activation = Math.max(0, h1_sum);
      
      const h2_sum = X * currentWeights.w2 + currentWeights.b2;
      const h2_activation = Math.max(0, h2_sum);
      
      const output = h1_activation * currentWeights.w3 + h2_activation * currentWeights.w4 + currentWeights.b3;
      const loss = 0.5 * Math.pow(output - target, 2);
      lossHistory.push(loss);

      // Backward pass
      const dL_doutput = output - target;
      
      const dL_dw3 = dL_doutput * h1_activation;
      const dL_dw4 = dL_doutput * h2_activation;
      const dL_db3 = dL_doutput;
      
      const dL_dh1 = dL_doutput * currentWeights.w3;
      const dL_dh2 = dL_doutput * currentWeights.w4;
      
      const dL_dw1 = dL_dh1 * (h1_activation > 0 ? 1 : 0) * X;
      const dL_dw2 = dL_dh2 * (h2_activation > 0 ? 1 : 0) * X;
      const dL_db1 = dL_dh1 * (h1_activation > 0 ? 1 : 0);
      const dL_db2 = dL_dh2 * (h2_activation > 0 ? 1 : 0);

      // Weight update
      currentWeights = {
        w1: currentWeights.w1 - learningRate * dL_dw1,
        w2: currentWeights.w2 - learningRate * dL_dw2,
        w3: currentWeights.w3 - learningRate * dL_dw3,
        w4: currentWeights.w4 - learningRate * dL_dw4,
        b1: currentWeights.b1 - learningRate * dL_db1,
        b2: currentWeights.b2 - learningRate * dL_db2,
        b3: currentWeights.b3 - learningRate * dL_db3,
      };
    }

    // Final forward pass with trained weights
    const h1_sum_final = X * currentWeights.w1 + currentWeights.b1;
    const h1_activation_final = Math.max(0, h1_sum_final);
    const h2_sum_final = X * currentWeights.w2 + currentWeights.b2;
    const h2_activation_final = Math.max(0, h2_sum_final);
    const output_final = h1_activation_final * currentWeights.w3 + h2_activation_final * currentWeights.w4 + currentWeights.b3;
    const loss_final = 0.5 * Math.pow(output_final - target, 2);

    return {
      trainedWeights: currentWeights,
      finalOutput: output_final,
      finalLoss: loss_final,
      lossHistory,
    };
  };

  const trainingResult = trainNetwork(initialWeights, 100, 0.1);

  // Forward pass calculations
  const h1_sum = X * initialWeights.w1 + initialWeights.b1; // 3 * 0.5 + 0.1 = 1.6
  const h1_activation = Math.max(0, h1_sum); // ReLU: max(0, 1.6) = 1.6
  
  const h2_sum = X * initialWeights.w2 + initialWeights.b2; // 3 * 0.3 + 0.2 = 1.1
  const h2_activation = Math.max(0, h2_sum); // ReLU: max(0, 1.1) = 1.1
  
  const output_sum = h1_activation * initialWeights.w3 + h2_activation * initialWeights.w4 + initialWeights.b3;
  // 1.6 * 0.7 + 1.1 * 0.4 + 0.05 = 1.12 + 0.44 + 0.05 = 1.61
  const output = output_sum; // Linear activation for simplicity
  
  const loss = 0.5 * Math.pow(output - target, 2); // MSE: 0.5 * (1.61 - 9)² = 0.5 * 54.6 = 27.3

  // Backward pass calculations
  const dL_doutput = output - target; // 1.61 - 9 = -7.39
  
  // Output layer gradients
  const dL_dw3 = dL_doutput * h1_activation; // -7.39 * 1.6 = -11.824
  const dL_dw4 = dL_doutput * h2_activation; // -7.39 * 1.1 = -8.129
  const dL_db3 = dL_doutput; // -7.39
  
  // Hidden layer gradients (ReLU derivative: 1 if activation > 0, else 0)
  const dL_dh1 = dL_doutput * initialWeights.w3; // -7.39 * 0.7 = -5.173
  const dL_dh2 = dL_doutput * initialWeights.w4; // -7.39 * 0.4 = -2.956
  
  const dL_dw1 = dL_dh1 * (h1_activation > 0 ? 1 : 0) * X; // -5.173 * 1 * 3 = -15.519
  const dL_dw2 = dL_dh2 * (h2_activation > 0 ? 1 : 0) * X; // -2.956 * 1 * 3 = -8.868
  const dL_db1 = dL_dh1 * (h1_activation > 0 ? 1 : 0); // -5.173 * 1 = -5.173
  const dL_db2 = dL_dh2 * (h2_activation > 0 ? 1 : 0); // -2.956 * 1 = -2.956

  // Weight update (learning rate = 0.1)
  const lr = 0.1;
  const newWeights = {
    w1: initialWeights.w1 - lr * dL_dw1, // 0.5 - 0.1 * (-15.519) = 2.052
    w2: initialWeights.w2 - lr * dL_dw2, // 0.3 - 0.1 * (-8.868) = 1.187
    w3: initialWeights.w3 - lr * dL_dw3, // 0.7 - 0.1 * (-11.824) = 1.882
    w4: initialWeights.w4 - lr * dL_dw4, // 0.4 - 0.1 * (-8.129) = 1.213
    b1: initialWeights.b1 - lr * dL_db1, // 0.1 - 0.1 * (-5.173) = 0.617
    b2: initialWeights.b2 - lr * dL_db2, // 0.2 - 0.1 * (-2.956) = 0.496
    b3: initialWeights.b3 - lr * dL_db3, // 0.05 - 0.1 * (-7.39) = 0.789
  };

  const steps = [
    {
      title: 'Network Setup',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            We'll train a simple network to learn <InlineMath math="f(x) = x^2" />. 
            For this example, let's use <InlineMath math="x = 3" />, so the target output is <InlineMath math="9" />.
          </p>
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <p className="text-xs font-mono text-gray-700">
              Input: X = {X}<br />
              Target: {target}<br />
              Network: 1 input → 2 hidden (ReLU) → 1 output (linear)
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Forward Pass',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-medium">Step 1: Compute Hidden Layer</p>
          <div className="bg-blue-50 rounded p-3 border border-blue-200 text-xs font-mono">
            <p>Hidden 1: h₁ = ReLU(X × w₁ + b₁)</p>
            <p className="ml-4">h₁ = ReLU({X} × {initialWeights.w1} + {initialWeights.b1})</p>
            <p className="ml-4">h₁ = ReLU({h1_sum.toFixed(2)}) = <strong>{h1_activation.toFixed(2)}</strong></p>
            <p className="mt-2">Hidden 2: h₂ = ReLU(X × w₂ + b₂)</p>
            <p className="ml-4">h₂ = ReLU({X} × {initialWeights.w2} + {initialWeights.b2})</p>
            <p className="ml-4">h₂ = ReLU({h2_sum.toFixed(2)}) = <strong>{h2_activation.toFixed(2)}</strong></p>
          </div>
          
          <p className="text-sm text-gray-700 font-medium mt-4">Step 2: Compute Output</p>
          <div className="bg-green-50 rounded p-3 border border-green-200 text-xs font-mono">
            <p>Output: ŷ = h₁ × w₃ + h₂ × w₄ + b₃</p>
            <p className="ml-4">ŷ = {h1_activation.toFixed(2)} × {initialWeights.w3} + {h2_activation.toFixed(2)} × {initialWeights.w4} + {initialWeights.b3}</p>
            <p className="ml-4">ŷ = <strong>{output.toFixed(2)}</strong></p>
          </div>
          
          <p className="text-sm text-gray-700 font-medium mt-4">Step 3: Calculate Loss</p>
          <div className="bg-yellow-50 rounded p-3 border border-yellow-200 text-xs font-mono">
            <p>Loss: L = 0.5 × (ŷ - target)²</p>
            <p className="ml-4">L = 0.5 × ({output.toFixed(2)} - {target})²</p>
            <p className="ml-4">L = <strong>{loss.toFixed(2)}</strong></p>
          </div>
        </div>
      ),
    },
    {
      title: 'Backward Pass - Output Layer',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Now we compute gradients using the chain rule, starting from the output layer.
          </p>
          
          <div className="bg-red-50 rounded p-3 border border-red-200 text-xs font-mono">
            <p className="font-semibold mb-2">Output Layer Gradients:</p>
            <p>∂L/∂ŷ = ŷ - target</p>
            <p className="ml-4">∂L/∂ŷ = {output.toFixed(2)} - {target} = <strong>{dL_doutput.toFixed(2)}</strong></p>
            <p className="mt-2">∂L/∂w₃ = ∂L/∂ŷ × h₁</p>
            <p className="ml-4">∂L/∂w₃ = {dL_doutput.toFixed(2)} × {h1_activation.toFixed(2)} = <strong>{dL_dw3.toFixed(3)}</strong></p>
            <p className="mt-2">∂L/∂w₄ = ∂L/∂ŷ × h₂</p>
            <p className="ml-4">∂L/∂w₄ = {dL_doutput.toFixed(2)} × {h2_activation.toFixed(2)} = <strong>{dL_dw4.toFixed(3)}</strong></p>
            <p className="mt-2">∂L/∂b₃ = ∂L/∂ŷ</p>
            <p className="ml-4">∂L/∂b₃ = <strong>{dL_db3.toFixed(2)}</strong></p>
          </div>
        </div>
      ),
    },
    {
      title: 'Backward Pass - Hidden Layer',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Propagate gradients backward to the hidden layer using the chain rule.
          </p>
          
          <div className="bg-purple-50 rounded p-3 border border-purple-200 text-xs font-mono">
            <p className="font-semibold mb-2">Hidden Layer Gradients:</p>
            <p>∂L/∂h₁ = ∂L/∂ŷ × w₃</p>
            <p className="ml-4">∂L/∂h₁ = {dL_doutput.toFixed(2)} × {initialWeights.w3} = <strong>{dL_dh1.toFixed(3)}</strong></p>
            <p className="mt-2">∂L/∂h₂ = ∂L/∂ŷ × w₄</p>
            <p className="ml-4">∂L/∂h₂ = {dL_doutput.toFixed(2)} × {initialWeights.w4} = <strong>{dL_dh2.toFixed(3)}</strong></p>
            <p className="mt-2">∂L/∂w₁ = ∂L/∂h₁ × ReLU'(h₁) × X</p>
            <p className="ml-4">∂L/∂w₁ = {dL_dh1.toFixed(3)} × 1 × {X} = <strong>{dL_dw1.toFixed(3)}</strong></p>
            <p className="mt-2">∂L/∂w₂ = ∂L/∂h₂ × ReLU'(h₂) × X</p>
            <p className="ml-4">∂L/∂w₂ = {dL_dh2.toFixed(3)} × 1 × {X} = <strong>{dL_dw2.toFixed(3)}</strong></p>
            <p className="mt-2">∂L/∂b₁ = ∂L/∂h₁ × ReLU'(h₁)</p>
            <p className="ml-4">∂L/∂b₁ = {dL_dh1.toFixed(3)} × 1 = <strong>{dL_db1.toFixed(3)}</strong></p>
            <p className="mt-2">∂L/∂b₂ = ∂L/∂h₂ × ReLU'(h₂)</p>
            <p className="ml-4">∂L/∂b₂ = {dL_dh2.toFixed(3)} × 1 = <strong>{dL_db2.toFixed(3)}</strong></p>
          </div>
        </div>
      ),
    },
    {
      title: 'Weight Update & Training',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Update weights using gradient descent: <InlineMath math="w_{new} = w_{old} - \alpha \times \frac{\partial L}{\partial w}" /> 
            where <InlineMath math="\alpha = 0.1" /> is the learning rate.
          </p>
          
          <div className="bg-indigo-50 rounded p-3 border border-indigo-200 text-xs font-mono">
            <p className="font-semibold mb-2">After One Update:</p>
            <p>w₁: {initialWeights.w1} → {newWeights.w1.toFixed(3)}</p>
            <p>w₂: {initialWeights.w2} → {newWeights.w2.toFixed(3)}</p>
            <p>w₃: {initialWeights.w3} → {newWeights.w3.toFixed(3)}</p>
            <p>w₄: {initialWeights.w4} → {newWeights.w4.toFixed(3)}</p>
            <p className="mt-2">b₁: {initialWeights.b1} → {newWeights.b1.toFixed(3)}</p>
            <p>b₂: {initialWeights.b2} → {newWeights.b2.toFixed(3)}</p>
            <p>b₃: {initialWeights.b3} → {newWeights.b3.toFixed(3)}</p>
          </div>
          
          <div className="bg-green-50 rounded p-3 border border-green-200 mt-4">
            <p className="text-sm font-semibold text-green-900 mb-2">Training Results (100 epochs):</p>
            <div className="text-xs font-mono space-y-1">
              <p><strong>Initial Output:</strong> {output.toFixed(2)} (Loss: {loss.toFixed(2)})</p>
              <p><strong>Final Output:</strong> {trainingResult.finalOutput.toFixed(2)} (Loss: {trainingResult.finalLoss.toFixed(4)})</p>
              <p><strong>Target:</strong> {target}</p>
              <p className="mt-2 text-green-700">
                The network learned to approximate <InlineMath math="x^2" />! 
                After 100 training iterations, the output improved from {output.toFixed(2)} to {trainingResult.finalOutput.toFixed(2)}, 
                getting much closer to the target of {target}.
              </p>
            </div>
            <div className="mt-3 bg-white rounded p-2 border border-green-200">
              <p className="text-xs font-semibold mb-1">Final Trained Weights (shown on diagram above):</p>
              <p className="text-xs font-mono">
                w₁={trainingResult.trainedWeights.w1.toFixed(2)}, w₂={trainingResult.trainedWeights.w2.toFixed(2)}, 
                w₃={trainingResult.trainedWeights.w3.toFixed(2)}, w₄={trainingResult.trainedWeights.w4.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Get weights for current step - show progression
  const getCurrentWeights = () => {
    if (step === steps.length - 1) {
      // Last step: show fully trained weights
      return trainingResult.trainedWeights;
    } else if (step === steps.length - 2) {
      // Second to last step: show weights after one update
      return newWeights;
    }
    // For earlier steps, show initial weights
    return initialWeights;
  };
  
  const currentWeights = getCurrentWeights();
  
  // Compute current output with current weights
  const getCurrentOutput = () => {
    const weights = getCurrentWeights();
    const h1_sum = X * weights.w1 + weights.b1;
    const h1_act = Math.max(0, h1_sum);
    const h2_sum = X * weights.w2 + weights.b2;
    const h2_act = Math.max(0, h2_sum);
    const out = h1_act * weights.w3 + h2_act * weights.w4 + weights.b3;
    const currentLoss = 0.5 * Math.pow(out - target, 2);
    return { h1: h1_act, h2: h2_act, output: out, loss: currentLoss };
  };
  
  const currentOutput = getCurrentOutput();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Walkthrough Example: Learning X²</h3>
      
      <p className="text-gray-700 mb-4 text-sm">
        Let's trace through a complete forward and backward pass with a simple network. 
        We'll use a 1→2→1 network to learn <InlineMath math="f(x) = x^2" /> with <InlineMath math="x = 3" />.
      </p>

      {/* Network Diagram */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-600">
            {step === 0 && "Initial weights before training"}
            {step === steps.length - 2 && "Weights after one update"}
            {step === steps.length - 1 && "Final trained weights (100 epochs)"}
            {step > 0 && step < steps.length - 2 && "Using initial weights"}
          </p>
          {step >= 1 && (
            <span className={`text-xs font-semibold ${
              step === steps.length - 1 ? 'text-green-600' : 'text-purple-600'
            }`}>
              Output: {currentOutput.output.toFixed(2)} / Target: {target}
            </span>
          )}
        </div>
        <svg width="400" height={step >= 1 ? "250" : "200"} className="mx-auto">
          {/* Input */}
          <circle cx="50" cy="100" r="18" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
          <text x="50" y="105" textAnchor="middle" className="text-xs font-semibold fill-gray-900">X=3</text>
          
          {/* Connections to Hidden with weights */}
          <line x1="68" y1="100" x2="150" y2="70" stroke="#9ca3af" strokeWidth="1.5" opacity="0.4" />
          <g>
            <rect x="95" y="75" width="35" height="14" fill="white" stroke="#374151" strokeWidth="1" rx="2" opacity="0.9" />
            <text x="112.5" y="85" textAnchor="middle" className="text-xs font-mono fill-gray-900">
              {currentWeights.w1.toFixed(2)}
            </text>
          </g>
          
          <line x1="68" y1="100" x2="150" y2="130" stroke="#9ca3af" strokeWidth="1.5" opacity="0.4" />
          <g>
            <rect x="95" y="125" width="35" height="14" fill="white" stroke="#374151" strokeWidth="1" rx="2" opacity="0.9" />
            <text x="112.5" y="135" textAnchor="middle" className="text-xs font-mono fill-gray-900">
              {currentWeights.w2.toFixed(2)}
            </text>
          </g>
          
          {/* Hidden Layer */}
          <circle cx="180" cy="70" r="16" fill="#34d399" stroke="#059669" strokeWidth="2" />
          <text x="180" y="75" textAnchor="middle" className="text-xs font-semibold fill-gray-900">h₁</text>
          <text x="180" y="95" textAnchor="middle" className="text-xs font-mono fill-gray-600">
            b={currentWeights.b1.toFixed(2)}
          </text>
          {step >= 1 && (
            <text x="180" y="110" textAnchor="middle" className="text-xs font-semibold fill-blue-600">
              {currentOutput.h1.toFixed(2)}
            </text>
          )}
          
          <circle cx="180" cy="130" r="16" fill="#34d399" stroke="#059669" strokeWidth="2" />
          <text x="180" y="135" textAnchor="middle" className="text-xs font-semibold fill-gray-900">h₂</text>
          <text x="180" y="155" textAnchor="middle" className="text-xs font-mono fill-gray-600">
            b={currentWeights.b2.toFixed(2)}
          </text>
          {step >= 1 && (
            <text x="180" y="170" textAnchor="middle" className="text-xs font-semibold fill-blue-600">
              {currentOutput.h2.toFixed(2)}
            </text>
          )}
          
          {/* Connections to Output with weights */}
          <line x1="196" y1="70" x2="320" y2="100" stroke="#9ca3af" strokeWidth="1.5" opacity="0.4" />
          <g>
            <rect x="240" y="75" width="35" height="14" fill="white" stroke="#374151" strokeWidth="1" rx="2" opacity="0.9" />
            <text x="257.5" y="85" textAnchor="middle" className="text-xs font-mono fill-gray-900">
              {currentWeights.w3.toFixed(2)}
            </text>
          </g>
          
          <line x1="196" y1="130" x2="320" y2="100" stroke="#9ca3af" strokeWidth="1.5" opacity="0.4" />
          <g>
            <rect x="240" y="115" width="35" height="14" fill="white" stroke="#374151" strokeWidth="1" rx="2" opacity="0.9" />
            <text x="257.5" y="125" textAnchor="middle" className="text-xs font-mono fill-gray-900">
              {currentWeights.w4.toFixed(2)}
            </text>
          </g>
          
          {/* Output */}
          <circle cx="340" cy="100" r="20" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2" />
          <text x="340" y="106" textAnchor="middle" className="text-xs font-semibold fill-gray-900">ŷ</text>
          <text x="340" y="130" textAnchor="middle" className="text-xs font-mono fill-gray-600">
            b={currentWeights.b3.toFixed(2)}
          </text>
          {step >= 1 && (
            <>
              <text x="340" y="150" textAnchor="middle" className={`text-xs font-semibold ${
                step === steps.length - 1 ? 'fill-green-600' : 'fill-purple-600'
              }`}>
                Output: {currentOutput.output.toFixed(2)}
              </text>
              <text x="340" y="170" textAnchor="middle" className="text-xs fill-gray-600">
                Target: {target}
              </text>
              {step >= 2 && (
                <text x="340" y="190" textAnchor="middle" className={`text-xs font-semibold ${
                  step === steps.length - 1 ? 'fill-green-600' : 'fill-yellow-600'
                }`}>
                  Loss: {currentOutput.loss.toFixed(step === steps.length - 1 ? 4 : 2)}
                </text>
              )}
            </>
          )}
          
          {/* Labels */}
          <text x="50" y="50" textAnchor="middle" className="text-xs fill-gray-700 font-medium">Input</text>
          <text x="180" y="50" textAnchor="middle" className="text-xs fill-gray-700 font-medium">Hidden (ReLU)</text>
          <text x="340" y="50" textAnchor="middle" className="text-xs fill-gray-700 font-medium">Output</text>
        </svg>
      </div>

      {/* Step Navigation */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        {steps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setStep(idx)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              step === idx
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <span className="text-xs text-gray-600 ml-2">{steps[step].title}</span>
      </div>

      {/* Step Content */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[200px]">
        {steps[step].content}
      </div>

      {/* Weight Comparison Table - Show at step 3 and 4 */}
      {step >= 3 && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Weight Progression</h5>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2">Weight</th>
                  <th className="text-right py-2 px-2">Initial</th>
                  <th className="text-right py-2 px-2">After 1 Update</th>
                  <th className="text-right py-2 px-2">After 100 Updates</th>
                  <th className="text-right py-2 px-2">Change</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="py-1 px-2">w₁</td>
                  <td className="text-right py-1 px-2">{initialWeights.w1.toFixed(2)}</td>
                  <td className="text-right py-1 px-2">{newWeights.w1.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 font-semibold text-green-600">{trainingResult.trainedWeights.w1.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 text-green-600">+{(trainingResult.trainedWeights.w1 - initialWeights.w1).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2">w₂</td>
                  <td className="text-right py-1 px-2">{initialWeights.w2.toFixed(2)}</td>
                  <td className="text-right py-1 px-2">{newWeights.w2.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 font-semibold text-green-600">{trainingResult.trainedWeights.w2.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 text-green-600">+{(trainingResult.trainedWeights.w2 - initialWeights.w2).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2">w₃</td>
                  <td className="text-right py-1 px-2">{initialWeights.w3.toFixed(2)}</td>
                  <td className="text-right py-1 px-2">{newWeights.w3.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 font-semibold text-green-600">{trainingResult.trainedWeights.w3.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 text-green-600">+{(trainingResult.trainedWeights.w3 - initialWeights.w3).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2">w₄</td>
                  <td className="text-right py-1 px-2">{initialWeights.w4.toFixed(2)}</td>
                  <td className="text-right py-1 px-2">{newWeights.w4.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 font-semibold text-green-600">{trainingResult.trainedWeights.w4.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 text-green-600">+{(trainingResult.trainedWeights.w4 - initialWeights.w4).toFixed(2)}</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="py-1 px-2">b₁</td>
                  <td className="text-right py-1 px-2">{initialWeights.b1.toFixed(2)}</td>
                  <td className="text-right py-1 px-2">{newWeights.b1.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 font-semibold text-green-600">{trainingResult.trainedWeights.b1.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 text-green-600">+{(trainingResult.trainedWeights.b1 - initialWeights.b1).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2">b₂</td>
                  <td className="text-right py-1 px-2">{initialWeights.b2.toFixed(2)}</td>
                  <td className="text-right py-1 px-2">{newWeights.b2.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 font-semibold text-green-600">{trainingResult.trainedWeights.b2.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 text-green-600">+{(trainingResult.trainedWeights.b2 - initialWeights.b2).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 px-2">b₃</td>
                  <td className="text-right py-1 px-2">{initialWeights.b3.toFixed(2)}</td>
                  <td className="text-right py-1 px-2">{newWeights.b3.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 font-semibold text-green-600">{trainingResult.trainedWeights.b3.toFixed(2)}</td>
                  <td className="text-right py-1 px-2 text-green-600">+{(trainingResult.trainedWeights.b3 - initialWeights.b3).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

