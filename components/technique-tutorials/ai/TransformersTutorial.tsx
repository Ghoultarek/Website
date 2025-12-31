'use client';

import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TransformerArchitecture from './TransformerArchitecture';
import DecoderOnlyExample from './DecoderOnlyExample';
import EncoderOnlyExample from './EncoderOnlyExample';
import EncoderDecoderExample from './EncoderDecoderExample';
import AttentionVisualization from './AttentionVisualization';

export default function TransformersTutorial() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeArchitecture, setActiveArchitecture] = useState<'decoder' | 'encoder' | 'encoder-decoder'>('decoder');

  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'attention', title: 'Self-Attention Mechanism' },
    { id: 'architectures', title: 'Transformer Architectures' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Fundamentals: Transformers</h1>
        <p className="text-lg text-gray-700">
          Understand how transformers work through interactive demos. Explore decoder-only (GPT), encoder-only (BERT), 
          and encoder-decoder (T5) architectures with toy examples.
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction to Transformers</h2>
          
          <div className="prose max-w-none mb-6">
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 mb-6">
              <p className="text-gray-800 mb-4 leading-relaxed">
                Transformers revolutionized natural language processing by introducing the self-attention mechanism, 
                which allows models to weigh the importance of different parts of the input sequence. Unlike RNNs 
                and LSTMs, transformers process sequences in parallel, making them much faster to train.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed">
                This tutorial breaks down transformers into their core components: attention mechanisms, positional encodings, 
                and the three main architectures (decoder-only, encoder-only, and encoder-decoder). We use small toy examples 
                to make the computations transparent and understandable.
              </p>
              
              <p className="text-gray-800 mb-4 leading-relaxed font-semibold">
                Key Concepts:
              </p>
              
              <ul className="list-disc list-inside text-gray-800 space-y-2 mb-4 ml-4">
                <li><strong>Self-Attention:</strong> How tokens attend to each other in the sequence</li>
                <li><strong>Multi-Head Attention:</strong> Multiple attention mechanisms running in parallel</li>
                <li><strong>Positional Encoding:</strong> Injecting sequence order information</li>
                <li><strong>Architecture Variants:</strong> Different ways to combine encoder and decoder stacks</li>
              </ul>
              
              <p className="text-gray-800 leading-relaxed italic">
                All examples use small sequences (4-8 tokens) and minimal dimensions to keep computations manageable 
                while still demonstrating the core mechanisms.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why Transformers?</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Parallel processing enables faster training than RNNs</li>
                <li>Self-attention captures long-range dependencies effectively</li>
                <li>Flexible architecture adapts to many NLP tasks</li>
                <li>Foundation for modern LLMs (GPT, BERT, T5, etc.)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Attention Section */}
      <section id="attention" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Self-Attention Mechanism</h2>
          
          <p className="text-gray-700 mb-6">
            Self-attention is the core innovation of transformers. It allows each position in a sequence to attend to 
            all positions in the same sequence, computing a weighted sum of values based on query-key similarity.
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">The Attention Formula</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
              <BlockMath math="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Where <InlineMath math="Q" /> (queries), <InlineMath math="K" /> (keys), and <InlineMath math="V" /> (values) 
              are learned linear transformations of the input, and <InlineMath math="d_k" /> is the dimension of the keys.
            </p>
          </div>

          <AttentionVisualization />
        </div>
      </section>

      {/* Architectures Section */}
      <section id="architectures" className="mb-12 scroll-mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Transformer Architectures</h2>
          
          <p className="text-gray-700 mb-6">
            Transformers come in three main variants, each optimized for different tasks. Select an architecture below 
            to see an interactive toy example.
          </p>

          {/* Architecture Selector */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveArchitecture('decoder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeArchitecture === 'decoder'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Decoder-Only (GPT)
              </button>
              <button
                onClick={() => setActiveArchitecture('encoder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeArchitecture === 'encoder'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Encoder-Only (BERT)
              </button>
              <button
                onClick={() => setActiveArchitecture('encoder-decoder')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeArchitecture === 'encoder-decoder'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Encoder-Decoder (T5)
              </button>
            </div>

            {/* Architecture Description */}
            <div className="text-sm text-gray-700">
              {activeArchitecture === 'decoder' && (
                <div>
                  <p className="font-semibold mb-2">Decoder-Only (GPT-style):</p>
                  <p>Uses only decoder stacks with masked self-attention. Generates text autoregressively, one token at a time. 
                  Best for language modeling and text generation tasks.</p>
                </div>
              )}
              {activeArchitecture === 'encoder' && (
                <div>
                  <p className="font-semibold mb-2">Encoder-Only (BERT-style):</p>
                  <p>Uses only encoder stacks with bidirectional attention. Processes entire input sequence at once. 
                  Best for classification, named entity recognition, and understanding tasks.</p>
                </div>
              )}
              {activeArchitecture === 'encoder-decoder' && (
                <div>
                  <p className="font-semibold mb-2">Encoder-Decoder (T5-style):</p>
                  <p>Uses both encoder and decoder stacks. Encoder processes input, decoder generates output. 
                  Best for translation, summarization, and sequence-to-sequence tasks.</p>
                </div>
              )}
            </div>
          </div>

          {/* Architecture Visual */}
          <TransformerArchitecture architecture={activeArchitecture} />

          {/* Architecture Examples */}
          <div className="mt-6">
            {activeArchitecture === 'decoder' && <DecoderOnlyExample />}
            {activeArchitecture === 'encoder' && <EncoderOnlyExample />}
            {activeArchitecture === 'encoder-decoder' && <EncoderDecoderExample />}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
        <p className="text-gray-700 text-sm mb-4">
          Now that you understand transformers, you can explore:
        </p>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
          <li>Multi-head attention and its benefits</li>
          <li>Positional encoding strategies (learned vs. sinusoidal)</li>
          <li>Layer normalization and residual connections</li>
          <li>Fine-tuning pre-trained transformer models</li>
          <li>Advanced architectures (GPT-4, BERT variants, T5)</li>
        </ul>
      </div>
    </div>
  );
}

