'use client';

import { useState } from 'react';
import { InlineMath } from 'react-katex';

export default function EncoderDecoderExample() {
  const [step, setStep] = useState(0);
  
  const inputTokens = ['The', 'cat', 'sat'];
  const outputTokens = ['Le', 'chat', 's\'est', 'assis'];
  const maxSteps = outputTokens.length;

  const handleNext = () => {
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
  };

  const currentOutput = outputTokens.slice(0, step);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Encoder-Decoder Example: Sequence-to-Sequence</h3>
      
      <p className="text-gray-700 mb-4 text-sm">
        Encoder-decoder transformers use an encoder to process the input and a decoder to generate the output. 
        The decoder attends to both its own previous outputs and the encoder's representations.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Translation Process</h4>
        
        {/* Encoder side */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Encoder Input (English):</p>
          <div className="flex flex-wrap gap-2">
            {inputTokens.map((token, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded border-2 bg-blue-100 border-blue-400 text-blue-900"
              >
                <span className="font-mono text-sm">{token}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Encoder processes input with bidirectional attention
          </p>
        </div>

        {/* Decoder side */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Decoder Output (French):</p>
          <div className="flex flex-wrap gap-2">
            {currentOutput.map((token, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded border-2 bg-green-100 border-green-400 text-green-900"
              >
                <span className="font-mono text-sm">{token}</span>
              </div>
            ))}
            {step < maxSteps && (
              <div className="px-3 py-2 rounded border-2 border-dashed border-gray-400 bg-gray-50 text-gray-500">
                <span className="font-mono text-sm">...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Decoder generates output autoregressively, attending to encoder outputs
          </p>
        </div>

        {/* Cross-attention visualization */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Cross-Attention (Decoder → Encoder):</p>
          <div className="bg-white rounded p-2 border border-gray-300">
            <div className="flex flex-col gap-1">
              {currentOutput.map((_, i) => (
                <div key={i} className="flex gap-1">
                  {inputTokens.map((_, j) => (
                    <div
                      key={j}
                      className="w-6 h-6 rounded border bg-purple-200 border-purple-400"
                      title={`${currentOutput[i]} → ${inputTokens[j]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Each decoder position attends to all encoder positions
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleNext}
            disabled={step >= maxSteps}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Generate Next Token
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Key Characteristics:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li><strong>Encoder</strong> processes input with bidirectional attention</li>
          <li><strong>Decoder</strong> uses masked self-attention + cross-attention to encoder</li>
          <li>Decoder generates output <strong>autoregressively</strong></li>
          <li>Used in T5, BART for translation, summarization, and seq2seq tasks</li>
        </ul>
      </div>
    </div>
  );
}

