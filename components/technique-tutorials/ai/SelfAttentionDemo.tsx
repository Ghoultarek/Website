'use client';

import { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';

type Step = 'embeddings' | 'queries' | 'scores' | 'weights' | 'output';

export default function SelfAttentionDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('embeddings');
  const [selectedToken, setSelectedToken] = useState<number>(1); // Default to "cat"

  // Fixed sentence - users can click words but not change the sentence
  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

  // Generate simple embeddings (4D for clarity)
  const embeddings = useMemo(() => {
    const emb: number[][] = [];
    for (let i = 0; i < tokens.length; i++) {
      // Generate deterministic embeddings based on token index
      const embVec: number[] = [];
      for (let j = 0; j < 4; j++) {
        // Simple deterministic pattern
        const val = Math.sin((i + 1) * (j + 1) * 0.5) * 0.5 + 0.5;
        embVec.push(Math.round(val * 100) / 100);
      }
      emb.push(embVec);
    }
    return emb;
  }, [tokens]);

  // Compute attention for selected token
  const attentionData = useMemo(() => {
    if (tokens.length === 0 || selectedToken >= tokens.length) return null;

    const Q = embeddings[selectedToken];
    const Ks = embeddings;
    const Vs = embeddings;

    // Compute scores (dot product)
    const scores = Ks.map(k => {
      let sum = 0;
      for (let i = 0; i < Q.length; i++) {
        sum += Q[i] * k[i];
      }
      return sum;
    });

    // Scale by sqrt(d_k) where d_k = 4
    const sqrtDk = Math.sqrt(4);
    const scaledScores = scores.map(s => s / sqrtDk);

    // Apply softmax
    const maxScore = Math.max(...scaledScores);
    const expScores = scaledScores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const attentionWeights = expScores.map(e => e / sumExp);

    // Compute output
    const output = [0, 0, 0, 0];
    for (let i = 0; i < Vs.length; i++) {
      for (let j = 0; j < output.length; j++) {
        output[j] += attentionWeights[i] * Vs[i][j];
      }
    }

    return { scores, scaledScores, attentionWeights, output };
  }, [embeddings, selectedToken, tokens.length]);

  const steps: { id: Step; label: string }[] = [
    { id: 'embeddings', label: '1. Embeddings' },
    { id: 'queries', label: '2. Queries/Keys' },
    { id: 'scores', label: '3. Scores' },
    { id: 'weights', label: '4. Attention Weights' },
    { id: 'output', label: '5. Output' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Self-Attention Demo</h3>

        {/* Sentence Display with Clickable Words */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Click on a word to see how it uses self-attention:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {tokens.map((token, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedToken(idx);
                  setCurrentStep('embeddings');
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedToken === idx
                    ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        {tokens.length > 0 && attentionData && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStep === step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        {tokens.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Please enter a sentence to begin.</p>
          </div>
        )}

        {tokens.length > 0 && attentionData && (
          <>
            {/* Step 1: Embeddings */}
            {currentStep === 'embeddings' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Step 1: Word Embeddings</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Each word is converted to a 4-dimensional vector:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {tokens.map((token, idx) => (
                    <div
                      key={idx}
                      className={`bg-white rounded p-2 border ${
                        idx === selectedToken ? 'border-blue-400 border-2' : 'border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{token}:</div>
                      <div className="text-gray-600 font-mono">
                        [{embeddings[idx].map(v => v.toFixed(2)).join(', ')}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Queries/Keys */}
            {currentStep === 'queries' && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">Step 2: Queries and Keys</h4>
                <p className="text-sm text-green-800 mb-3">
                  For simplicity, we use the embeddings directly as queries and keys. 
                  In real transformers, these are learned linear transformations.
                </p>
                <div className="bg-white rounded p-3 border border-green-300">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    Query (Q) for "{tokens[selectedToken]}":
                  </div>
                  <div className="text-xs font-mono text-gray-700 mb-4">
                    [{embeddings[selectedToken].map(v => v.toFixed(2)).join(', ')}]
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Keys (K) for all tokens:</div>
                  <div className="space-y-1 text-xs">
                    {tokens.map((token, idx) => (
                      <div key={idx} className="font-mono text-gray-700">
                        {token}: [{embeddings[idx].map(v => v.toFixed(2)).join(', ')}]
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Scores */}
            {currentStep === 'scores' && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3">Step 3: Compute Attention Scores</h4>
                <p className="text-sm text-yellow-800 mb-3">
                  Compute similarity scores using dot product: <InlineMath math="Q \cdot K^T" />
                </p>
                <div className="bg-white rounded p-3 border border-yellow-300">
                  <div className="space-y-2 text-xs">
                    {tokens.map((token, idx) => {
                      const score = attentionData.scores[idx];
                      const scaledScore = attentionData.scaledScores[idx];
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-semibold">{token}:</span>
                          <div className="flex items-center gap-4">
                            <span className="font-mono">
                              score = {score.toFixed(3)}
                            </span>
                            <span className="text-gray-500">→</span>
                            <span className="font-mono">
                              scaled = {scaledScore.toFixed(3)} (÷√4)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Attention Weights */}
            {currentStep === 'weights' && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3">Step 4: Attention Weights (Softmax)</h4>
                <p className="text-sm text-purple-800 mb-3">
                  Apply softmax to convert scores into probabilities that sum to 1:
                </p>
                <div className="bg-white rounded p-3 border border-purple-300 mb-3">
                  <div className="space-y-2">
                    {tokens.map((token, idx) => {
                      const weight = attentionData.attentionWeights[idx];
                      const percentage = (weight * 100).toFixed(1);
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-20 font-semibold text-sm">{token}:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div
                              className={`h-6 rounded-full transition-all ${
                                idx === selectedToken ? 'bg-purple-600' : 'bg-purple-400'
                              }`}
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-900">
                              {percentage}%
                            </span>
                          </div>
                          <span className="w-16 text-right font-mono text-xs">{weight.toFixed(3)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-purple-100 rounded p-2 border border-purple-300">
                  <p className="text-xs text-purple-900">
                    Sum: {attentionData.attentionWeights.reduce((a, b) => a + b, 0).toFixed(3)} ✓
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Output */}
            {currentStep === 'output' && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-3">Step 5: Weighted Sum (Output)</h4>
                <p className="text-sm text-indigo-800 mb-3">
                  Compute the final output by taking a weighted sum of all value vectors:
                </p>
                <div className="bg-white rounded p-3 border border-indigo-300 mb-3">
                  <div className="text-xs font-mono text-gray-700 mb-2">
                    output = Σ(attention_weight[i] × value[i])
                  </div>
                  <div className="text-sm font-semibold text-indigo-900">
                    Output vector for "{tokens[selectedToken]}":
                  </div>
                  <div className="text-xs font-mono text-gray-700 mt-1">
                    [{attentionData.output.map(v => v.toFixed(3)).join(', ')}]
                  </div>
                </div>
                <p className="text-xs text-indigo-700 italic">
                  This output contains contextual information from all words, weighted by their relevance 
                  to "{tokens[selectedToken]}".
                </p>
              </div>
            )}

            {/* Attention Matrix Visualization */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Attention Matrix Visualization</h4>
              <p className="text-sm text-gray-700 mb-3">
                This shows how much attention "{tokens[selectedToken]}" pays to each word:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-100"></th>
                      {tokens.map((token, i) => (
                        <th
                          key={i}
                          className={`border border-gray-300 p-2 bg-gray-100 font-semibold ${
                            i === selectedToken ? 'bg-primary-200' : ''
                          }`}
                        >
                          {token}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        className={`border border-gray-300 p-2 bg-gray-100 font-semibold ${
                          selectedToken === selectedToken ? 'bg-primary-200' : ''
                        }`}
                      >
                        {tokens[selectedToken]}
                      </td>
                      {attentionData.attentionWeights.map((weight, j) => {
                        const intensity = Math.round(weight * 255);
                        const bgColor = `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
                        return (
                          <td
                            key={j}
                            className="border border-gray-300 p-2 text-center"
                            style={{ backgroundColor: bgColor }}
                          >
                            {weight.toFixed(3)}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Graph Visualization */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Attention Graph</h4>
              <p className="text-sm text-gray-700 mb-3">
                Visual representation of attention weights. The selected token (center) connects to all tokens. 
                Line thickness and opacity represent attention strength:
              </p>
              <div className="relative p-8 bg-gray-50 rounded-lg">
                <svg width="100%" height="300" className="absolute inset-0">
                  {tokens.map((token, idx) => {
                    if (idx === selectedToken) return null;
                    const weight = attentionData.attentionWeights[idx];
                    const selectedX = 50 + (selectedToken / (tokens.length - 1)) * 80;
                    const selectedY = 50;
                    const tokenX = 50 + (idx / (tokens.length - 1)) * 80;
                    const tokenY = 200;
                    const opacity = Math.max(weight, 0.1);
                    const strokeWidth = weight * 8 + 1;
                    return (
                      <line
                        key={idx}
                        x1={`${selectedX}%`}
                        y1={`${selectedY}%`}
                        x2={`${tokenX}%`}
                        y2={`${tokenY}%`}
                        stroke="#6366f1"
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        className="transition-all"
                      />
                    );
                  })}
                </svg>
                <div className="relative flex justify-around items-start">
                  {tokens.map((token, idx) => {
                    const weight = attentionData.attentionWeights[idx];
                    const isSelected = idx === selectedToken;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`px-3 py-2 rounded-lg font-semibold text-sm mb-2 ${
                            isSelected
                              ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {token}
                        </div>
                        <div className="text-xs text-gray-600 font-mono">
                          {(weight * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

