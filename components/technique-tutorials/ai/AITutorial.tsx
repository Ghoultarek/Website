'use client';

import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PyTorchExample from './PyTorchExample';
import BackpropVisualization from './BackpropVisualization';
import BackpropToyExample from './BackpropToyExample';
import ToyNetwork from './ToyNetwork';
import CodeSnippets from './CodeSnippets';

const forwardPassCode = `// Forward Pass: Computing activations layer by layer

function forward(input, layers) {
  let currentInput = input;
  
  for (let layer of layers) {
    const outputs = [];
    
    // For each neuron in this layer
    for (let neuronIdx = 0; neuronIdx < layer.weights.length; neuronIdx++) {
      let sum = layer.biases[neuronIdx];
      
      // Sum weighted inputs from previous layer
      for (let inputIdx = 0; inputIdx < currentInput.length; inputIdx++) {
        sum += layer.weights[neuronIdx][inputIdx] * currentInput[inputIdx];
      }
      
      // Apply activation function
      outputs[neuronIdx] = relu(sum); // or sigmoid, tanh, etc.
    }
    
    currentInput = outputs; // Output becomes input for next layer
  }
  
  return currentInput; // Final output
}`;

const backwardPassCode = `// Backward Pass: Computing gradients using chain rule

function backward(input, target, output, layers) {
  // Initialize gradients if not already initialized
  for (let layer of layers) {
    if (!layer.gradients) {
      layer.gradients = {
        weights: layer.weights.map(row => row.map(() => 0)),
        biases: layer.biases.map(() => 0),
        inputs: []
      };
    } else {
      // Reset gradients to zero
      for (let j = 0; j < layer.weights.length; j++) {
        for (let k = 0; k < layer.weights[j].length; k++) {
          layer.gradients.weights[j][k] = 0;
        }
        layer.gradients.biases[j] = 0;
      }
    }
  }
  
  // 1. Calculate output error
  let error = output.map((pred, i) => pred - target[i]);
  
  // 2. Backpropagate through each layer (reverse order)
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    const prevActivations = i > 0 ? layers[i-1].activations : input;
    
    const deltas = [];
    
    // 3. Calculate gradient for each neuron
    for (let j = 0; j < layer.weights.length; j++) {
      const activation = layer.activations[j];
      const derivative = reluDerivative(activation);
      deltas[j] = error[j] * derivative; // Chain rule!
      
      // 4. Update weight gradients (accumulate)
      for (let k = 0; k < layer.weights[j].length; k++) {
        layer.gradients.weights[j][k] += deltas[j] * prevActivations[k];
      }
      
      // 5. Update bias gradients (accumulate)
      layer.gradients.biases[j] += deltas[j];
    }
    
    // 6. Propagate error to previous layer
    if (i > 0) {
      error = new Array(layers[i-1].weights.length).fill(0);
      for (let j = 0; j < layers[i-1].weights.length; j++) {
        for (let k = 0; k < layer.weights.length; k++) {
          error[j] += layer.weights[k][j] * deltas[k];
        }
      }
    }
  }
}`;

const updateWeightsCode = `// Weight Update: Adjust weights using gradients

function updateWeights(layers, learningRate, batchSize) {
  const lr = learningRate / batchSize;
  
  for (let layer of layers) {
    // Update weights
    for (let i = 0; i < layer.weights.length; i++) {
      for (let j = 0; j < layer.weights[i].length; j++) {
        // Gradient descent: w = w - lr * gradient
        layer.weights[i][j] -= lr * layer.gradients.weights[i][j];
        layer.gradients.weights[i][j] = 0; // Reset gradient
      }
    }
    
    // Update biases
    for (let i = 0; i < layer.biases.length; i++) {
      layer.biases[i] -= lr * layer.gradients.biases[i];
      layer.gradients.biases[i] = 0; // Reset gradient
    }
  }
}`;

const trainingLoopCode = `// Complete Training Loop

function train(network, dataset, epochs, learningRate) {
  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;
    
    // Process each sample
    for (let sample of dataset) {
      // 1. Forward pass
      const output = network.forward(sample.input);
      
      // 2. Calculate loss
      const loss = calculateLoss(output, sample.target);
      totalLoss += loss;
      
      // 3. Backward pass (compute gradients)
      network.backward(sample.input, sample.target, output);
      
      // 4. Update weights
      network.updateWeights(1); // batch size = 1 (SGD)
    }
    
    const avgLoss = totalLoss / dataset.length;
    console.log(\`Epoch \${epoch}, Loss: \${avgLoss}\`);
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

export default function AITutorial() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [weightSnapshots, setWeightSnapshots] = useState<WeightSnapshot[]>([]);

  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'pytorch', title: 'PyTorch Training Example' },
    { id: 'backprop', title: 'Understanding Backpropagation' },
    { id: 'implementation', title: 'Implementation from Scratch' },
    { id: 'tryit', title: 'Try It Yourself' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Fundamentals: Neural Networks & Backpropagation</h1>
        <p className="text-lg text-gray-700">
          This is a testing ground for fundamentals of machine learning. Learn how neural networks work, 
          understand backpropagation, and implement everything from scratch.
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction to Neural Networks</h2>
          
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 mb-4">
              Neural networks are computational models inspired by biological neural networks. They consist of 
              interconnected nodes (neurons) organized in layers that process information through weighted connections.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Key Components:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li><strong>Input Layer:</strong> Receives the input data</li>
                <li><strong>Hidden Layers:</strong> Process information through weighted sums and activation functions</li>
                <li><strong>Output Layer:</strong> Produces the final prediction</li>
                <li><strong>Weights & Biases:</strong> Parameters learned during training</li>
                <li><strong>Activation Functions:</strong> Introduce non-linearity (ReLU, Sigmoid, Tanh)</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">How Neural Networks Learn:</h3>
              <ol className="list-decimal list-inside text-green-800 space-y-1">
                <li><strong>Forward Pass:</strong> Input flows through the network, producing a prediction</li>
                <li><strong>Loss Calculation:</strong> Compare prediction with target using a loss function</li>
                <li><strong>Backward Pass (Backpropagation):</strong> Compute gradients of loss w.r.t. all weights</li>
                <li><strong>Weight Update:</strong> Adjust weights using gradient descent to minimize loss</li>
                <li><strong>Repeat:</strong> Iterate until the network learns the desired mapping</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* PyTorch Example Section */}
      <section id="pytorch" className="mb-12 scroll-mt-8">
        <PyTorchExample />
      </section>

      {/* Backpropagation Explanation Section */}
      <section id="backprop" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Understanding Backpropagation</h2>
          
          <p className="text-gray-700 mb-6">
            Backpropagation is the algorithm used to train neural networks. It efficiently computes gradients 
            by applying the chain rule of calculus, propagating errors backward through the network.
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">The Chain Rule</h3>
            <p className="text-gray-700 mb-4">
              Backpropagation relies on the chain rule: if we have a composite function <InlineMath math="f(g(x))" />, the derivative 
              is <InlineMath math="f'(g(x)) \cdot g'(x)" />. In neural networks, we apply this repeatedly to compute gradients layer by layer.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
              <BlockMath math="\frac{\partial L}{\partial w} = \frac{\partial L}{\partial \text{output}} \times \frac{\partial \text{output}}{\partial \text{activation}} \times \frac{\partial \text{activation}}{\partial w}" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Where <InlineMath math="L" /> is the loss function, <InlineMath math="w" /> is a weight, and we apply the chain rule 
              to propagate gradients backward through the network.
            </p>
          </div>

          {/* Walkthrough Example */}
          <div className="mb-6">
            <BackpropToyExample />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Process</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li><strong>Forward Pass:</strong> Compute activations for all layers</li>
              <li><strong>Loss:</strong> Calculate error between prediction and target</li>
              <li><strong>Output Layer:</strong> Compute gradient of loss w.r.t. output</li>
              <li><strong>Backward Pass:</strong> Propagate gradients backward, applying chain rule at each layer</li>
              <li><strong>Weight Gradients:</strong> Compute gradients w.r.t. weights and biases</li>
              <li><strong>Update:</strong> Adjust weights using gradient descent</li>
            </ol>
          </div>
        </div>

        <BackpropVisualization weightSnapshots={weightSnapshots} />
      </section>

      {/* Implementation from Scratch Section */}
      <section id="implementation" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Implementation from Scratch</h2>
          
          <p className="text-gray-700 mb-6">
            Let's break down the implementation into key components. Each code snippet builds on the previous one 
            to create a complete neural network.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Forward Pass</h3>
              <p className="text-gray-600 text-sm mb-3">
                The forward pass computes activations layer by layer. Each neuron sums its weighted inputs, 
                adds a bias, and applies an activation function.
              </p>
              <CodeSnippets
                code={forwardPassCode}
                language="javascript"
                explanation="This function propagates input through all layers, computing activations at each step."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Backward Pass</h3>
              <p className="text-gray-600 text-sm mb-3">
                The backward pass computes gradients using the chain rule. We start from the output layer 
                and work backward, computing gradients for weights and biases.
              </p>
              <CodeSnippets
                code={backwardPassCode}
                language="javascript"
                explanation="This function computes gradients by propagating errors backward through the network."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Weight Update</h3>
              <p className="text-gray-600 text-sm mb-3">
                After computing gradients, we update weights using gradient descent. The learning rate 
                controls how large steps we take in the direction that reduces loss.
              </p>
              <CodeSnippets
                code={updateWeightsCode}
                language="javascript"
                explanation="This function updates weights and biases using the computed gradients and learning rate."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Complete Training Loop</h3>
              <p className="text-gray-600 text-sm mb-3">
                The training loop combines forward pass, loss calculation, backward pass, and weight updates. 
                We repeat this process for multiple epochs until the network converges.
              </p>
              <CodeSnippets
                code={trainingLoopCode}
                language="javascript"
                explanation="This is the complete training loop that orchestrates forward pass, backward pass, and weight updates."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Try It Yourself Section */}
      <section id="tryit" className="mb-12 scroll-mt-8">
        <ToyNetwork onWeightSnapshotsChange={setWeightSnapshots} />
      </section>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
        <p className="text-gray-700 text-sm mb-4">
          Now that you understand the fundamentals, you can experiment with:
        </p>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
          <li>Different activation functions (ReLU, Sigmoid, Tanh)</li>
          <li>Various loss functions (MSE, Cross-Entropy)</li>
          <li>Different optimizers (SGD, Adam, RMSprop)</li>
          <li>More complex architectures (deeper networks, convolutional layers)</li>
          <li>Regularization techniques (dropout, weight decay)</li>
        </ul>
      </div>
    </div>
  );
}

