'use client';

export default function LibrarySearchAnalogy() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">The Library Search Analogy</h3>
      
      <p className="text-gray-700 mb-6 leading-relaxed">
        Think of self-attention like searching a library. When you want to find information, you:
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Library Search Side */}
        <div className="bg-white rounded-lg p-5 border border-blue-200 shadow-sm">
          <h4 className="font-semibold text-blue-900 mb-3 text-lg">📚 Library Search</h4>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">Query:</span>
              <span>"I need books about cats"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">Keys:</span>
              <span>Index cards describing each book</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">Values:</span>
              <span>The actual book content</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-700">Attention:</span>
              <span>How relevant each book is to your query</span>
            </div>
          </div>
        </div>

        {/* Self-Attention Side */}
        <div className="bg-white rounded-lg p-5 border border-indigo-200 shadow-sm">
          <h4 className="font-semibold text-indigo-900 mb-3 text-lg">🧠 Self-Attention</h4>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-indigo-700">Query (Q):</span>
              <span>What information this word needs</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-indigo-700">Keys (K):</span>
              <span>What information each word offers</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-indigo-700">Values (V):</span>
              <span>The actual content/meaning of each word</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-indigo-700">Attention:</span>
              <span>How much each word contributes to the output</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Diagram */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Visual Flow</h4>
        <div className="flex flex-col items-center space-y-4">
          {/* Query */}
          <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-400">
            <div className="text-sm font-semibold text-blue-900">Word: "cat"</div>
            <div className="text-xs text-blue-700 mt-1">Query: "What words relate to me?"</div>
          </div>
          
          <svg width="40" height="40" className="text-blue-500">
            <path d="M20 0 L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M15 30 L20 40 L25 30" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>

          {/* Keys and Values */}
          <div className="grid grid-cols-4 gap-2 w-full">
            {['The', 'cat', 'sat', 'mat'].map((word, idx) => (
              <div key={idx} className="bg-gray-50 rounded p-2 border border-gray-300 text-center">
                <div className="text-xs font-semibold text-gray-700">{word}</div>
                <div className="text-xs text-gray-500 mt-1">Key + Value</div>
              </div>
            ))}
          </div>

          <svg width="40" height="40" className="text-indigo-500">
            <path d="M20 0 L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M15 30 L20 40 L25 30" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>

          {/* Output */}
          <div className="bg-indigo-100 rounded-lg p-3 border-2 border-indigo-400">
            <div className="text-sm font-semibold text-indigo-900">Output for "cat"</div>
            <div className="text-xs text-indigo-700 mt-1">Weighted combination of all words</div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          Just like you compare your query to index cards to find relevant books, 
          each word in a sentence compares itself (query) to all other words (keys) to determine how much 
          information it should gather from each word (values). This is self-attention.
        </p>
      </div>
    </div>
  );
}

