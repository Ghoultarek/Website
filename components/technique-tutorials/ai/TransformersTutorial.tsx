'use client';

import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import LibrarySearchAnalogy from './LibrarySearchAnalogy';
import AttentionExample from './AttentionExample';
import QKVVisualization from './QKVVisualization';

export default function TransformersTutorial() {
  const [activeSection, setActiveSection] = useState<string | null>('intro');

  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'analogy', title: 'The Intuition' },
    { id: 'example', title: 'Concrete Example' },
    { id: 'formula', title: 'The Formula' },
    { id: 'qkv-visualization', title: 'Interactive Demo' },
    { id: 'why', title: 'Why It Works' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Understanding Self-Attention</h1>
        <p className="text-lg text-gray-700">
          The core mechanism that powers transformers. Explained clearly, step by step.
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4 z-10">
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
          
          <div className="prose max-w-none mb-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 mb-6">
              <p className="text-gray-800 mb-4 leading-relaxed text-lg">
                <strong>"Self-attention"</strong> is mentioned everywhere in modern AI, in papers, tutorials, and 
                discussions about transformers. Yet, despite its ubiquity, it remains one of the most poorly 
                understood concepts.
              </p>
              <p className="text-gray-800 mb-4 leading-relaxed">
                You've probably seen the formula: <InlineMath math="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V" />. 
                But what does it actually <em>do</em>? Why does it work? And how can something so simple 
                be so powerful?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analogy Section */}
      <section id="analogy" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Core Intuition: Library Search</h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Before diving into mathematics, let's build intuition with a simple analogy. Self-attention works 
            like searching a library: you have a query, you compare it to index cards (keys), and you retrieve 
            the relevant books (values) based on how well they match.
          </p>

          <LibrarySearchAnalogy />

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-indigo-900">
              In self-attention, each word in a sentence acts like a library patron. 
              It searches through all other words (including itself) to find relevant information. The "relevance" 
              is learned during training, allowing the model to focus on what matters most for each word's context.
            </p>
          </div>
        </div>
      </section>

      {/* Concrete Example Section */}
      <section id="example" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Concrete Example: "The cat sat on the mat"</h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Now let's see self-attention in action with a real example. We'll use the sentence 
            <strong> "The cat sat on the mat"</strong> and trace through exactly how the word "cat" 
            uses self-attention to gather information from all other words.
          </p>

          <AttentionExample />
        </div>
      </section>

      {/* Formula Section */}
      <section id="formula" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Mathematical Formula</h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Now that you've seen it work with concrete numbers, let's understand the formula. 
            We'll build it up step by step, connecting each part to what we just saw in the example.
          </p>

          <div className="space-y-6">
            {/* Step 1: Similarity Scores */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Step 1: Compute Similarity Scores</h3>
              <p className="text-blue-800 mb-3">
                For each word, we compute how similar it is to every other word using the dot product:
              </p>
              <div className="bg-white rounded p-4 border border-blue-300 mb-3">
                <BlockMath math="\text{score}(q_i, k_j) = q_i \cdot k_j^T" />
              </div>
              <p className="text-sm text-blue-700">
                Where <InlineMath math="q_i" /> is the query vector for word <InlineMath math="i" />, 
                and <InlineMath math="k_j" /> is the key vector for word <InlineMath math="j" />. 
                Higher scores mean more similarity/relevance.
              </p>
            </div>

            {/* Step 2: Scaling */}
            <div className="bg-green-50 rounded-lg p-5 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Step 2: Scale by <InlineMath math="\sqrt{d_k}" /></h3>
              <p className="text-green-800 mb-3">
                We divide by <InlineMath math="\sqrt{d_k}" /> (where <InlineMath math="d_k" /> is the dimension of keys) 
                to prevent the dot products from becoming too large:
              </p>
              <div className="bg-white rounded p-4 border border-green-300 mb-3">
                <BlockMath math="\text{scaled\_score} = \frac{\text{score}}{\sqrt{d_k}}" />
              </div>
              <p className="text-sm text-green-700">
                Without scaling, large values would push softmax toward extreme probabilities, making gradients very small 
                and training difficult.
              </p>
            </div>

            {/* Step 3: Softmax */}
            <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">Step 3: Apply Softmax</h3>
              <p className="text-yellow-800 mb-3">
                We convert scores into probabilities (attention weights) that sum to 1:
              </p>
              <div className="bg-white rounded p-4 border border-yellow-300 mb-3">
                <BlockMath math="\alpha_{ij} = \frac{\exp(\text{scaled\_score}_{ij})}{\sum_{k=1}^{n} \exp(\text{scaled\_score}_{ik})}" />
              </div>
              <p className="text-sm text-yellow-700">
                These <InlineMath math="\alpha_{ij}" /> values are the attention weights: they tell us how much 
                word <InlineMath math="i" /> should pay attention to word <InlineMath math="j" />.
              </p>
            </div>

            {/* Step 4: Weighted Sum */}
            <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">Step 4: Weighted Sum of Values</h3>
              <p className="text-purple-800 mb-3">
                Finally, we compute a weighted sum of value vectors, where weights are the attention values:
              </p>
              <div className="bg-white rounded p-4 border border-purple-300 mb-3">
                <BlockMath math="\text{output}_i = \sum_{j=1}^{n} \alpha_{ij} \cdot v_j" />
              </div>
              <p className="text-sm text-purple-700">
                This gives us the final output for word <InlineMath math="i" />: a combination of all words' 
                information, weighted by their relevance.
              </p>
            </div>

            {/* Complete Formula */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">The Complete Formula</h3>
              <div className="bg-white rounded p-6 border border-gray-400 mb-4 flex justify-center">
                <BlockMath math="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V" />
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Q (Queries):</strong> What information each word is looking for</p>
                <p><strong>K (Keys):</strong> What information each word offers</p>
                <p><strong>V (Values):</strong> The actual content/meaning of each word</p>
                <p><strong>d_k:</strong> The dimension of the key vectors</p>
              </div>
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded p-3">
                <p className="text-sm text-indigo-900">
                  In self-attention, Q, K, and V all come from the same input 
                  sequence (hence "self"). Each word queries itself and all other words to determine how to 
                  combine their information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="qkv-visualization" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Self-Attention Demo</h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Experiment with the default sentence and see self-attention compute step by step. 
            Click on different words to see how Q, K, and V work together to compute attention weights.
          </p>

          <QKVVisualization />
        </div>
      </section>

      {/* Why It Works Section */}
      <section id="why" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Self-Attention Works</h2>
          
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-5 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Long-Range Dependencies</h3>
              <p className="text-green-800 mb-3">
                Unlike RNNs which process sequences step-by-step, self-attention can directly connect any two 
                positions in the sequence, regardless of distance.
              </p>
              <div className="bg-white rounded p-3 border border-green-300">
                <p className="text-sm text-green-700">
                  In "The cat that I saw yesterday sat on the mat", the word "sat" 
                  needs to connect to "cat" even though there are many words in between. Self-attention 
                  makes this connection directly.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Parallel Computation</h3>
              <p className="text-blue-800 mb-3">
                All attention computations happen in parallel, since each word's attention 
                doesn't depend on the previous word's output.
              </p>
              <div className="bg-white rounded p-3 border border-blue-300">
                <p className="text-sm text-blue-700">
                  An RNN must process tokens one at a time (sequential). 
                  Self-attention processes all tokens simultaneously (parallel).
                </p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">Interpretability</h3>
              <p className="text-purple-800 mb-3">
                Attention weights can be examined to see which words the model considers most relevant for each position.
              </p>
              <div className="bg-white rounded p-3 border border-purple-300">
                <p className="text-sm text-purple-700">
                  When translating "The cat sat" to French, we can see that 
                  "sat" pays high attention to "cat", confirming the model understands the subject-verb relationship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
