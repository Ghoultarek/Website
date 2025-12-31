'use client';

import { useState, useMemo } from 'react';
import { InlineMath } from 'react-katex';

export default function AttentionVisualization() {
  const [sequenceLength] = useState(4);
  const [dModel] = useState(8); // Small dimension for demo
  
  // Generate random attention weights for demo
  const attentionWeights = useMemo(() => {
    const weights: number[][] = [];
    for (let i = 0; i < sequenceLength; i++) {
      const row: number[] = [];
      let sum = 0;
      for (let j = 0; j < sequenceLength; j++) {
        const val = Math.random();
        row.push(val);
        sum += val;
      }
      // Normalize to sum to 1 (softmax)
      weights.push(row.map(v => v / sum));
    }
    return weights;
  }, [sequenceLength]);

  const tokens = ['The', 'cat', 'sat', 'down'];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">Interactive Attention Matrix</h4>
        <p className="text-sm text-blue-800 mb-4">
          Each row shows how much attention a token pays to other tokens. Darker colors indicate higher attention weights.
        </p>
        
        {/* Attention Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-100"></th>
                {tokens.map((token, i) => (
                  <th key={i} className="border border-gray-300 p-2 bg-gray-100 font-semibold">
                    {token}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attentionWeights.map((row, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">
                    {tokens[i]}
                  </td>
                  {row.map((weight, j) => {
                    const intensity = Math.round(weight * 255);
                    const bgColor = `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
                    return (
                      <td
                        key={j}
                        className="border border-gray-300 p-2 text-center"
                        style={{ backgroundColor: bgColor }}
                      >
                        {weight.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3">Step-by-Step Computation</h4>
        <div className="space-y-3 text-sm text-green-800">
          <div>
            <p className="font-semibold mb-1">1. Create Q, K, V matrices:</p>
            <p className="text-xs ml-4">
              Each token is transformed into Query, Key, and Value vectors using learned weight matrices.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Compute attention scores:</p>
            <p className="text-xs ml-4">
              Score = <InlineMath math="Q \cdot K^T" /> for each token pair, then scale by <InlineMath math="\sqrt{d_k}" />.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Apply softmax:</p>
            <p className="text-xs ml-4">
              Normalize scores so they sum to 1, creating attention weights (shown in matrix above).
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">4. Weighted sum of values:</p>
            <p className="text-xs ml-4">
              Multiply attention weights by Value vectors and sum to get the output for each position.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

