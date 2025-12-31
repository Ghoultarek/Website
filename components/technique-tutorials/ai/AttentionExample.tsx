'use client';

import { InlineMath, BlockMath } from 'react-katex';

export default function AttentionExample() {
  // Simple 3D embeddings for "The cat sat on the mat"
  // These are simplified for demonstration
  const embeddings: { [key: string]: number[] } = {
    'The': [0.2, 0.1, 0.0],
    'cat': [0.8, 0.9, 0.7],
    'sat': [0.3, 0.4, 0.6],
    'on': [0.1, 0.2, 0.3],
    'the': [0.2, 0.1, 0.0],
    'mat': [0.5, 0.3, 0.4],
  };

  // Simple weight matrices (3x3 for 3D embeddings)
  // These would normally be learned, but we'll use simple ones for clarity
  const Wq = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // Identity for simplicity
  const Wk = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const Wv = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  const sentence = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  
  // Compute Q, K, V for "cat" (index 1) as an example
  const computeAttention = (queryIdx: number) => {
    const queryWord = sentence[queryIdx];
    const q = embeddings[queryWord];
    
    // Compute Q, K, V (simplified - just using embeddings directly)
    const Q = q;
    const Ks = sentence.map(word => embeddings[word]);
    const Vs = sentence.map(word => embeddings[word]);
    
    // Compute attention scores (dot product)
    const scores = Ks.map(k => {
      let sum = 0;
      for (let i = 0; i < Q.length; i++) {
        sum += Q[i] * k[i];
      }
      return sum;
    });
    
    // Scale by sqrt(d_k) where d_k = 3
    const sqrtDk = Math.sqrt(3);
    const scaledScores = scores.map(s => s / sqrtDk);
    
    // Apply softmax
    const maxScore = Math.max(...scaledScores);
    const expScores = scaledScores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const attentionWeights = expScores.map(e => e / sumExp);
    
    // Compute weighted sum of values
    const output = [0, 0, 0];
    for (let i = 0; i < Vs.length; i++) {
      for (let j = 0; j < output.length; j++) {
        output[j] += attentionWeights[i] * Vs[i][j];
      }
    }
    
    return { scores, scaledScores, attentionWeights, output };
  };

  const catAttention = computeAttention(1);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Worked Example: "The cat sat on the mat"
        </h3>
        
        <p className="text-gray-700 mb-6">
          Let's see how the word <strong>"cat"</strong> uses self-attention to gather information 
          from all other words in the sentence.
        </p>

        {/* Sentence Display */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex flex-wrap gap-2 justify-center">
            {sentence.map((word, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  idx === 1
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {word}
                {idx === 1 && <span className="ml-2 text-xs">(querying)</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Embeddings */}
        <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">Step 1: Word Embeddings</h4>
          <p className="text-sm text-blue-800 mb-3">
            Each word is represented as a vector. For simplicity, we use 3D embeddings:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {sentence.map((word, idx) => (
              <div key={idx} className="bg-white rounded p-2 border border-blue-300">
                <div className="font-semibold text-gray-900">{word}:</div>
                <div className="text-gray-600 font-mono">
                  [{embeddings[word].map(v => v.toFixed(1)).join(', ')}]
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Compute Attention Scores */}
        <div className="mb-6 bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Step 2: Compute Attention Scores</h4>
          <p className="text-sm text-green-800 mb-3">
            For the word "cat", we compute similarity scores with all words using dot product:
          </p>
          <div className="bg-white rounded p-3 border border-green-300 mb-3">
            <div className="text-xs space-y-1">
              {sentence.map((word, idx) => {
                const score = catAttention.scores[idx];
                return (
                  <div key={idx} className="flex justify-between">
                    <span className="font-mono">
                      score("cat", "{word}") = {score.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-green-700 italic">
            Higher scores mean "cat" is more similar/relevant to that word.
          </p>
        </div>

        {/* Step 3: Scale and Softmax */}
        <div className="mb-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-3">Step 3: Scale and Apply Softmax</h4>
          <p className="text-sm text-yellow-800 mb-3">
            We scale by <InlineMath math="\sqrt{d_k} = \sqrt{3} \approx 1.73" /> to prevent large values, 
            then apply softmax to get attention weights (probabilities):
          </p>
          <div className="bg-white rounded p-3 border border-yellow-300">
            <div className="text-xs space-y-1">
              {sentence.map((word, idx) => {
                const weight = catAttention.attentionWeights[idx];
                const percentage = (weight * 100).toFixed(1);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-20 font-semibold">{word}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-yellow-500 h-4 rounded-full"
                        style={{ width: `${percentage}%` }}
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
          <p className="text-xs text-yellow-700 mt-2 italic">
            Notice how "cat" pays most attention to itself and related words. The weights sum to 1.0.
          </p>
        </div>

        {/* Step 4: Weighted Sum */}
        <div className="mb-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3">Step 4: Weighted Sum of Values</h4>
          <p className="text-sm text-purple-800 mb-3">
            Finally, we compute a weighted sum of all word embeddings, where weights are the attention values:
          </p>
          <div className="bg-white rounded p-3 border border-purple-300">
            <div className="text-xs font-mono text-gray-700 mb-2">
              output["cat"] = Σ(attention_weight[i] × embedding[i])
            </div>
            <div className="text-sm font-semibold text-purple-900">
              Output vector: [{catAttention.output.map(v => v.toFixed(3)).join(', ')}]
            </div>
          </div>
          <p className="text-xs text-purple-700 mt-2 italic">
            This output vector contains information from all words, weighted by their relevance to "cat".
          </p>
        </div>

        {/* Attention Matrix Visualization */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Attention Matrix (for "cat")</h4>
          <p className="text-sm text-gray-700 mb-3">
            This shows how much attention "cat" pays to each word:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100"></th>
                  {sentence.map((word, i) => (
                    <th
                      key={i}
                      className={`border border-gray-300 p-2 bg-gray-100 font-semibold ${
                        i === 1 ? 'bg-blue-200' : ''
                      }`}
                    >
                      {word}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-semibold bg-blue-200">
                    cat
                  </td>
                  {catAttention.attentionWeights.map((weight, j) => {
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

        {/* Key Takeaway */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <p className="text-sm text-indigo-900">
            <strong>Key Takeaway:</strong> Self-attention allows "cat" to gather contextual information 
            from all words in the sentence. It learns which words are most relevant and combines their 
            information accordingly. This happens in parallel for every word in the sentence!
          </p>
        </div>
      </div>
    </div>
  );
}

