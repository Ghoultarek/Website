'use client';

import { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';

export default function QKVVisualization() {
  const [selectedToken, setSelectedToken] = useState(1); // Default to "cat"
  const [showStep, setShowStep] = useState<'qkv' | 'scores' | 'weights' | 'output'>('qkv');

  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  
  // Generate simple 3D embeddings for visualization
  const embeddings = useMemo(() => {
    return tokens.map((_, i) => {
      return [
        Math.sin((i + 1) * 0.5) * 0.5 + 0.5,
        Math.cos((i + 1) * 0.7) * 0.5 + 0.5,
        Math.sin((i + 1) * 0.9) * 0.5 + 0.5,
      ].map(v => Math.round(v * 100) / 100);
    });
  }, []);

  // Compute attention for selected token
  const attentionData = useMemo(() => {
    const Q = embeddings[selectedToken];
    const Ks = embeddings;
    const Vs = embeddings;

    // Compute scores
    const scores = Ks.map(k => {
      let sum = 0;
      for (let i = 0; i < Q.length; i++) {
        sum += Q[i] * k[i];
      }
      return sum;
    });

    // Scale
    const sqrtDk = Math.sqrt(3);
    const scaledScores = scores.map(s => s / sqrtDk);

    // Softmax
    const maxScore = Math.max(...scaledScores);
    const expScores = scaledScores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const attentionWeights = expScores.map(e => e / sumExp);

    // Output
    const output = [0, 0, 0];
    for (let i = 0; i < Vs.length; i++) {
      for (let j = 0; j < output.length; j++) {
        output[j] += attentionWeights[i] * Vs[i][j];
      }
    }

    return { scores, scaledScores, attentionWeights, output };
  }, [embeddings, selectedToken]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Q, K, V: How They Work Together</h3>
        
        {/* Token Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Select a word to see how its Query interacts with all Keys and Values:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {tokens.map((token, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedToken(idx);
                  setShowStep('qkv');
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedToken === idx
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        {/* Step Selector */}
        <div className="mb-6 bg-white rounded-lg p-3 border border-indigo-200">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'qkv', label: '1. Q, K, V' },
              { id: 'scores', label: '2. Q·K^T' },
              { id: 'weights', label: '3. Softmax' },
              { id: 'output', label: '4. Weighted V' },
            ].map((step) => (
              <button
                key={step.id}
                onClick={() => setShowStep(step.id as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showStep === step.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: Q, K, V Visualization */}
        {showStep === 'qkv' && (
          <div className="bg-white rounded-lg p-6 border border-indigo-300">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Step 1: Query, Keys, and Values</h4>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Query */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-400">
                <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  Query (Q)
                </h5>
                <p className="text-xs text-blue-800 mb-3">
                  What information <strong>"{tokens[selectedToken]}"</strong> is looking for
                </p>
                <div className="bg-white rounded p-3 border border-blue-300">
                  <div className="text-xs font-mono text-gray-700 space-y-1">
                    <div className="font-semibold text-blue-900 mb-2">Q = [{embeddings[selectedToken].map(v => v.toFixed(2)).join(', ')}]</div>
                    <div className="text-xs text-gray-600">Dimension: 3</div>
                  </div>
                </div>
              </div>

              {/* Keys */}
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-400">
                <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔑</span>
                  Keys (K)
                </h5>
                <p className="text-xs text-green-800 mb-3">
                  What information each word <strong>offers</strong>
                </p>
                <div className="bg-white rounded p-3 border border-green-300 max-h-48 overflow-y-auto">
                  <div className="text-xs font-mono text-gray-700 space-y-1">
                    {tokens.map((token, idx) => (
                      <div key={idx} className={idx === selectedToken ? 'bg-green-100 rounded px-1' : ''}>
                        <span className="font-semibold text-green-900">{token}:</span> [{embeddings[idx].map(v => v.toFixed(2)).join(', ')}]
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Values */}
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-400">
                <h5 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  Values (V)
                </h5>
                <p className="text-xs text-purple-800 mb-3">
                  The actual <strong>content</strong> of each word
                </p>
                <div className="bg-white rounded p-3 border border-purple-300 max-h-48 overflow-y-auto">
                  <div className="text-xs font-mono text-gray-700 space-y-1">
                    {tokens.map((token, idx) => (
                      <div key={idx} className={idx === selectedToken ? 'bg-purple-100 rounded px-1' : ''}>
                        <span className="font-semibold text-purple-900">{token}:</span> [{embeddings[idx].map(v => v.toFixed(2)).join(', ')}]
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Flow */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Visual Flow:</strong> The Query from "{tokens[selectedToken]}" will be compared to all Keys to find matches, 
                then the corresponding Values will be combined based on those matches.
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-400">
                  <div className="text-xs font-semibold text-blue-900">Q</div>
                </div>
                <div className="text-gray-500 text-xl">×</div>
                <div className="bg-green-100 rounded-lg p-3 border-2 border-green-400">
                  <div className="text-xs font-semibold text-green-900">K^T</div>
                </div>
                <div className="text-gray-500 text-xl">→</div>
                <div className="bg-yellow-100 rounded-lg p-3 border-2 border-yellow-400">
                  <div className="text-xs font-semibold text-yellow-900">Scores</div>
                </div>
                <div className="text-gray-500 text-xl">→</div>
                <div className="bg-purple-100 rounded-lg p-3 border-2 border-purple-400">
                  <div className="text-xs font-semibold text-purple-900">V</div>
                </div>
                <div className="text-gray-500 text-xl">=</div>
                <div className="bg-indigo-100 rounded-lg p-3 border-2 border-indigo-400">
                  <div className="text-xs font-semibold text-indigo-900">Output</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Q·K^T Scores */}
        {showStep === 'scores' && (
          <div className="bg-white rounded-lg p-6 border border-indigo-300">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Step 2: Compute Similarity Scores (Q·K^T)</h4>
            <p className="text-sm text-gray-700 mb-4">
              Multiply the Query vector with each Key vector to get similarity scores. Higher scores mean more relevance.
            </p>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300 mb-4">
              <div className="space-y-2">
                {tokens.map((token, idx) => {
                  const score = attentionData.scores[idx];
                  const scaledScore = attentionData.scaledScores[idx];
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white rounded p-2 border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm w-16">{token}:</span>
                        <span className="text-xs text-gray-600 font-mono">
                          Q·K<sub>{idx}</sub> = {score.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">→</span>
                        <span className="text-xs font-mono text-gray-700">
                          scaled = {scaledScore.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Matrix */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
              <p className="text-sm font-semibold text-gray-900 mb-3">Score Matrix Visualization</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {tokens.map((token, idx) => {
                  const score = attentionData.scaledScores[idx];
                  const normalized = (score - Math.min(...attentionData.scaledScores)) / 
                    (Math.max(...attentionData.scaledScores) - Math.min(...attentionData.scaledScores) || 1);
                  const intensity = Math.round(normalized * 255);
                  const bgColor = `rgb(255, ${255 - intensity}, ${255 - intensity})`;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-2 rounded border-2 border-gray-300"
                      style={{ backgroundColor: bgColor }}
                    >
                      <span className="text-xs font-semibold text-gray-700">{token}</span>
                      <span className="text-xs font-mono text-gray-900">{score.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Darker colors indicate higher similarity scores
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Attention Weights */}
        {showStep === 'weights' && (
          <div className="bg-white rounded-lg p-6 border border-indigo-300">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Step 3: Attention Weights (Softmax)</h4>
            <p className="text-sm text-gray-700 mb-4">
              Apply softmax to convert scores into probabilities. These weights determine how much each Value contributes.
            </p>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-300 mb-4">
              <div className="space-y-3">
                {tokens.map((token, idx) => {
                  const weight = attentionData.attentionWeights[idx];
                  const percentage = (weight * 100).toFixed(1);
                  return (
                    <div key={idx} className="bg-white rounded p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{token}:</span>
                        <span className="text-xs font-mono text-gray-700">{weight.toFixed(3)} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 relative">
                        <div
                          className={`h-4 rounded-full ${
                            idx === selectedToken ? 'bg-purple-600' : 'bg-purple-400'
                          }`}
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attention Matrix */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
              <p className="text-sm font-semibold text-gray-900 mb-3">Attention Weight Matrix</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-100"></th>
                      {tokens.map((token, i) => (
                        <th
                          key={i}
                          className={`border border-gray-300 p-2 bg-gray-100 font-semibold ${
                            i === selectedToken ? 'bg-indigo-200' : ''
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
                          selectedToken === selectedToken ? 'bg-indigo-200' : ''
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
          </div>
        )}

        {/* Step 4: Weighted Sum of Values */}
        {showStep === 'output' && (
          <div className="bg-white rounded-lg p-6 border border-indigo-300">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Step 4: Weighted Sum of Values</h4>
            <p className="text-sm text-gray-700 mb-4">
              Multiply each Value vector by its attention weight and sum them together to get the final output.
            </p>
            
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-300 mb-4">
              <div className="space-y-3">
                {tokens.map((token, idx) => {
                  const weight = attentionData.attentionWeights[idx];
                  const weightedV = embeddings[idx].map(v => v * weight);
                  return (
                    <div key={idx} className="bg-white rounded p-3 border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{token}:</span>
                        <span className="text-xs text-gray-600">weight = {weight.toFixed(3)}</span>
                      </div>
                      <div className="text-xs font-mono text-gray-700 mb-1">
                        V[{idx}] = [{embeddings[idx].map(v => v.toFixed(2)).join(', ')}]
                      </div>
                      <div className="text-xs font-mono text-indigo-700">
                        weighted = [{weightedV.map(v => v.toFixed(3)).join(', ')}]
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Output */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-6 border-2 border-indigo-400">
              <h5 className="font-semibold text-indigo-900 mb-3 text-lg">Final Output</h5>
              <div className="bg-white rounded p-4 border border-indigo-300">
                <div className="text-sm text-gray-700 mb-2">
                  Output for <strong>"{tokens[selectedToken]}"</strong>:
                </div>
                <div className="text-lg font-mono text-indigo-900 font-semibold">
                  [{attentionData.output.map(v => v.toFixed(3)).join(', ')}]
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  This is the weighted combination of all Value vectors, where weights come from the attention mechanism.
                </p>
              </div>
            </div>

            {/* Visual Summary */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-300">
              <p className="text-sm font-semibold text-gray-900 mb-3">Complete Flow Summary</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <div className="bg-blue-100 rounded px-3 py-2 border border-blue-300">
                  <strong>Q</strong> (Query)
                </div>
                <div className="text-gray-500">×</div>
                <div className="bg-green-100 rounded px-3 py-2 border border-green-300">
                  <strong>K^T</strong> (Keys)
                </div>
                <div className="text-gray-500">=</div>
                <div className="bg-yellow-100 rounded px-3 py-2 border border-yellow-300">
                  <strong>Scores</strong>
                </div>
                <div className="text-gray-500">→</div>
                <div className="bg-purple-100 rounded px-3 py-2 border border-purple-300">
                  <strong>Softmax</strong>
                </div>
                <div className="text-gray-500">=</div>
                <div className="bg-pink-100 rounded px-3 py-2 border border-pink-300">
                  <strong>Weights</strong>
                </div>
                <div className="text-gray-500">×</div>
                <div className="bg-purple-100 rounded px-3 py-2 border border-purple-300">
                  <strong>V</strong> (Values)
                </div>
                <div className="text-gray-500">=</div>
                <div className="bg-indigo-100 rounded px-3 py-2 border border-indigo-300 font-semibold">
                  <strong>Output</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

