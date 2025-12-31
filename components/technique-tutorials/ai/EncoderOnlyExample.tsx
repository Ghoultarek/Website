'use client';

import { useState } from 'react';
import { InlineMath } from 'react-katex';

export default function EncoderOnlyExample() {
  const [selectedTask, setSelectedTask] = useState<'classification' | 'ner' | 'qa'>('classification');
  
  const inputTokens = ['The', 'cat', 'sat', 'down'];
  
  const tasks = {
    classification: {
      name: 'Text Classification',
      description: 'Classify the entire sentence',
      output: 'Label: POSITIVE',
      explanation: 'The [CLS] token at the start aggregates information from all tokens for classification.'
    },
    ner: {
      name: 'Named Entity Recognition',
      description: 'Tag each token',
      output: 'The: O | cat: ANIMAL | sat: O | down: O',
      explanation: 'Each token position gets a label based on its bidirectional context.'
    },
    qa: {
      name: 'Question Answering',
      description: 'Find answer span in context',
      output: 'Answer: "cat"',
      explanation: 'Bidirectional attention helps find the answer span within the context.'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Encoder-Only Example: Bidirectional Understanding</h3>
      
      <p className="text-gray-700 mb-4 text-sm">
        Encoder-only transformers process entire input sequences with bidirectional attention, allowing each token 
        to see all other tokens. This makes them ideal for understanding tasks like classification and NER.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Task Selection</h4>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {(['classification', 'ner', 'qa'] as const).map((task) => (
            <button
              key={task}
              onClick={() => setSelectedTask(task)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTask === task
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {tasks[task].name}
            </button>
          ))}
        </div>

        {/* Input visualization */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Input Sequence:</p>
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
        </div>

        {/* Attention visualization - bidirectional */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Attention Pattern (Bidirectional):</p>
          <div className="bg-white rounded p-2 border border-gray-300">
            <div className="flex flex-col gap-1">
              {inputTokens.map((_, i) => (
                <div key={i} className="flex gap-1">
                  {inputTokens.map((_, j) => (
                    <div
                      key={j}
                      className="w-6 h-6 rounded border bg-blue-200 border-blue-400"
                      title={`${inputTokens[i]} → ${inputTokens[j]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              All tokens can attend to all other tokens (bidirectional)
            </p>
          </div>
        </div>

        {/* Task output */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-green-900 mb-1">Task: {tasks[selectedTask].name}</p>
          <p className="text-xs text-green-800 mb-2">{tasks[selectedTask].description}</p>
          <p className="text-sm font-mono text-green-900 mb-2">{tasks[selectedTask].output}</p>
          <p className="text-xs text-green-700 italic">{tasks[selectedTask].explanation}</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Key Characteristics:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Uses <strong>bidirectional attention</strong> - tokens can see all other tokens</li>
          <li>Processes entire sequence <strong>in parallel</strong></li>
          <li>Each position has full context from both directions</li>
          <li>Used in BERT for understanding tasks (classification, NER, QA)</li>
        </ul>
      </div>
    </div>
  );
}

