'use client';

import { useState } from 'react';

export default function DecoderOnlyExample() {
  const [step, setStep] = useState(0);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);
  
  const inputTokens = ['The', 'cat', 'sat'];
  const vocab = ['The', 'cat', 'sat', 'down', 'on', 'mat', 'the', 'floor'];
  const maxSteps = inputTokens.length + 3;

  // Simulate token generation
  const handleGenerate = () => {
    if (step < maxSteps) {
      const nextToken = vocab[Math.floor(Math.random() * vocab.length)];
      setGeneratedTokens([...generatedTokens, nextToken]);
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setGeneratedTokens([]);
  };

  const currentSequence = [...inputTokens, ...generatedTokens];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Decoder-Only Example: Autoregressive Generation</h3>
      
      <p className="text-gray-700 mb-4 text-sm">
        Decoder-only transformers generate text one token at a time. Each new token can only attend to previous tokens 
        (masked attention), making it suitable for language modeling and text generation.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Generation Process</h4>
        
        {/* Visual representation of sequence */}
        <div className="flex flex-wrap gap-2 mb-4">
          {currentSequence.map((token, idx) => {
            const isInput = idx < inputTokens.length;
            const isNew = idx >= inputTokens.length;
            return (
              <div
                key={idx}
                className={`px-3 py-2 rounded border-2 ${
                  isInput
                    ? 'bg-blue-100 border-blue-400 text-blue-900'
                    : isNew
                    ? 'bg-green-100 border-green-400 text-green-900'
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-mono text-sm">{token}</span>
                {isNew && <span className="ml-1 text-xs">✨</span>}
              </div>
            );
          })}
          {step < maxSteps && (
            <div className="px-3 py-2 rounded border-2 border-dashed border-gray-400 bg-gray-50 text-gray-500">
              <span className="font-mono text-sm">...</span>
            </div>
          )}
        </div>

        {/* Attention visualization */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Attention Pattern (Masked):</p>
          <div className="bg-white rounded p-2 border border-gray-300">
            <div className="flex flex-col gap-1">
              {currentSequence.map((_, i) => (
                <div key={i} className="flex gap-1">
                  {currentSequence.map((_, j) => {
                    const canAttend = j <= i; // Can only attend to previous or current token
                    return (
                      <div
                        key={j}
                        className={`w-6 h-6 rounded border ${
                          canAttend
                            ? 'bg-blue-200 border-blue-400'
                            : 'bg-gray-200 border-gray-300 opacity-30'
                        }`}
                        title={`${currentSequence[i]} → ${currentSequence[j]}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Blue = can attend, Gray = masked (cannot attend)
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={step >= maxSteps}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
          <li>Uses <strong>masked self-attention</strong> - tokens can only see previous tokens</li>
          <li>Generates text <strong>autoregressively</strong> - one token at a time</li>
          <li>Each position attends to all previous positions in the sequence</li>
          <li>Used in GPT models for language modeling and text generation</li>
        </ul>
      </div>
    </div>
  );
}
