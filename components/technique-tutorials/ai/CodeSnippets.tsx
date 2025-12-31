'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeSnippetsProps {
  code: string;
  language: 'python' | 'typescript' | 'javascript';
  title?: string;
  explanation?: string;
  showCopy?: boolean;
}

export default function CodeSnippets({ 
  code, 
  language, 
  title, 
  explanation,
  showCopy = true 
}: CodeSnippetsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to copy code:', err);
      }
    }
  };

  return (
    <div className="mb-6">
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      )}
      {explanation && (
        <p className="text-gray-700 mb-3 text-sm">{explanation}</p>
      )}
      <div className="relative">
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-xs text-gray-400 uppercase font-medium">{language}</span>
            {showCopy && (
              <button
                onClick={handleCopy}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              backgroundColor: '#1e1e1e',
              fontSize: '0.875rem',
            }}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

