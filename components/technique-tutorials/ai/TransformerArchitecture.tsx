'use client';

interface TransformerArchitectureProps {
  architecture: 'decoder' | 'encoder' | 'encoder-decoder';
}

export default function TransformerArchitecture({ architecture }: TransformerArchitectureProps) {
  const getArchitectureSVG = () => {
    const width = 600;
    const height = architecture === 'encoder-decoder' ? 400 : 250;
    const encoderY = 50;
    const decoderY = architecture === 'encoder-decoder' ? 250 : encoderY;
    const blockHeight = 40;
    const blockWidth = 100;
    const spacing = 20;

    return (
      <svg width={width} height={height} className="w-full max-w-2xl mx-auto">
        {/* Encoder Stack */}
        {(architecture === 'encoder' || architecture === 'encoder-decoder') && (
          <g>
            <text x={width / 2} y={encoderY - 20} textAnchor="middle" className="text-sm font-semibold fill-gray-900">
              Encoder Stack
            </text>
            {[0, 1, 2].map((i) => (
              <g key={`encoder-${i}`}>
                <rect
                  x={width / 2 - blockWidth / 2}
                  y={encoderY + i * (blockHeight + spacing)}
                  width={blockWidth}
                  height={blockHeight}
                  fill="#60a5fa"
                  stroke="#2563eb"
                  strokeWidth="2"
                  rx="4"
                />
                <text
                  x={width / 2}
                  y={encoderY + i * (blockHeight + spacing) + blockHeight / 2 + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white"
                >
                  Encoder {i + 1}
                </text>
              </g>
            ))}
            {/* Input Embeddings */}
            <rect
              x={width / 2 - blockWidth / 2}
              y={encoderY - 60}
              width={blockWidth}
              height={blockHeight}
              fill="#34d399"
              stroke="#059669"
              strokeWidth="2"
              rx="4"
            />
            <text
              x={width / 2}
              y={encoderY - 60 + blockHeight / 2 + 4}
              textAnchor="middle"
              className="text-xs font-medium fill-white"
            >
              Input Embeddings
            </text>
            {/* Arrow */}
            <line
              x1={width / 2}
              y1={encoderY - 20}
              x2={width / 2}
              y2={encoderY}
              stroke="#6b7280"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          </g>
        )}

        {/* Decoder Stack */}
        {(architecture === 'decoder' || architecture === 'encoder-decoder') && (
          <g>
            <text x={width / 2} y={decoderY - 20} textAnchor="middle" className="text-sm font-semibold fill-gray-900">
              Decoder Stack
            </text>
            {[0, 1, 2].map((i) => (
              <g key={`decoder-${i}`}>
                <rect
                  x={width / 2 - blockWidth / 2}
                  y={decoderY + i * (blockHeight + spacing)}
                  width={blockWidth}
                  height={blockHeight}
                  fill="#a78bfa"
                  stroke="#7c3aed"
                  strokeWidth="2"
                  rx="4"
                />
                <text
                  x={width / 2}
                  y={decoderY + i * (blockHeight + spacing) + blockHeight / 2 + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white"
                >
                  Decoder {i + 1}
                </text>
              </g>
            ))}
            {/* Output Embeddings */}
            <rect
              x={width / 2 - blockWidth / 2}
              y={decoderY - 60}
              width={blockWidth}
              height={blockHeight}
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="2"
              rx="4"
            />
            <text
              x={width / 2}
              y={decoderY - 60 + blockHeight / 2 + 4}
              textAnchor="middle"
              className="text-xs font-medium fill-white"
            >
              {architecture === 'decoder' ? 'Input Embeddings' : 'Output Embeddings'}
            </text>
            {/* Arrow */}
            <line
              x1={width / 2}
              y1={decoderY - 20}
              x2={width / 2}
              y2={decoderY}
              stroke="#6b7280"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            {/* Connection from encoder to decoder (for encoder-decoder) */}
            {architecture === 'encoder-decoder' && (
              <line
                x1={width / 2 + blockWidth / 2}
                y1={encoderY + 60}
                x2={width / 2 + blockWidth / 2 + 40}
                y2={encoderY + 60}
                stroke="#6b7280"
                strokeWidth="2"
              />
            )}
          </g>
        )}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
          </marker>
        </defs>
      </svg>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Architecture Diagram</h3>
      {getArchitectureSVG()}
      <p className="text-xs text-gray-600 mt-4 text-center">
        {architecture === 'decoder' && 'Decoder-only architecture uses masked self-attention to generate tokens autoregressively.'}
        {architecture === 'encoder' && 'Encoder-only architecture uses bidirectional attention to process entire input sequences.'}
        {architecture === 'encoder-decoder' && 'Encoder-decoder architecture processes input with encoder and generates output with decoder.'}
      </p>
    </div>
  );
}

