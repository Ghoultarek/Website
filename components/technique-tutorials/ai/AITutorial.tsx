'use client';

import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import PyTorchExample from './PyTorchExample';
import BackpropToyExample from './BackpropToyExample';
import ToyNetwork from './ToyNetwork';
import TrainingPathologies from './TrainingPathologies';

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

  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'backprop', title: 'Understanding Backpropagation' },
    { id: 'pathologies', title: 'Observed Training Pathologies' },
    { id: 'pytorch', title: 'PyTorch Training Example' },
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
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 mb-6">
              <p className="text-gray-800 mb-4 leading-relaxed">
                Neural networks are often treated as black boxes, abstracted away behind high-level frameworks. This tutorial takes the opposite approach.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed">
                The goal here is to work through neural networks from first principles: how information flows forward, how errors propagate backward, and how learning actually occurs through gradient-based optimization. Rather than focusing on performance or scale, the emphasis is on mechanics, stability, and interpretability of training dynamics.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed">
                The examples are intentionally small. XOR, simple regression, and shallow architectures are used not because they are practical end-targets, but because they expose the essential behavior of non-linear models: loss surfaces, gradient flow, sensitivity to initialization, and the role of activation functions.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed font-semibold">
                This tutorial serves two purposes:
              </p>
              
              <ul className="list-disc list-inside text-gray-800 space-y-2 mb-4 ml-4">
                <li>To provide an explicit, step-by-step view of backpropagation and learning dynamics that are often hidden in modern ML tooling.</li>
                <li>To demonstrate foundational understanding of neural networks relevant to reliability, failure modes, and safety-critical applications.</li>
              </ul>
              
              <p className="text-gray-800 mb-4 leading-relaxed">
                Interactive visualizations are used to make weight updates, activations, and gradients observable during training. The implementations include both a minimal PyTorch example and a from-scratch implementation to highlight what frameworks automate - and what they assume.
              </p>
              
              <p className="text-gray-800 leading-relaxed italic">
                This is not a course and not a framework comparison. It is a technical walkthrough intended for readers who want to understand why neural networks behave the way they do, not just how to use them.
              </p>
            </div>

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
      </section>

      {/* PyTorch Example Section */}
      <section id="pytorch" className="mb-12 scroll-mt-8">
        <PyTorchExample />
      </section>

      {/* Try It Yourself Section */}
      <section id="tryit" className="mb-12 scroll-mt-8">
        <ToyNetwork />
      </section>

      {/* Training Pathologies Section */}
      <section id="pathologies" className="mb-12 scroll-mt-8">
        <TrainingPathologies />
      </section>
    </div>
  );
}

