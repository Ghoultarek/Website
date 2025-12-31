'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Neuron {
  id: string;
  x: number;
  y: number;
  activation: number;
  gradient?: number;
}

interface Connection {
  from: string;
  to: string;
  weight: number;
  gradient?: number;
}

interface WeightSnapshot {
  epoch: number;
  connections: Array<{
    from: string;
    to: string;
    weight: number;
  }>;
}

interface BackpropVisualizationProps {
  width?: number;
  height?: number;
  weightSnapshots?: WeightSnapshot[];
  disabled?: boolean;
}

// Default connections (used when no weight snapshots available)
const defaultConnections: Connection[] = [
  { from: 'i0', to: 'h0', weight: 0.5 },
  { from: 'i0', to: 'h1', weight: -0.3 },
  { from: 'i1', to: 'h0', weight: 0.4 },
  { from: 'i1', to: 'h1', weight: 0.6 },
  { from: 'h0', to: 'o0', weight: 0.7 },
  { from: 'h1', to: 'o0', weight: -0.5 },
];

export default function BackpropVisualization({ 
  width = 800, 
  height = 500,
  weightSnapshots = [],
  disabled = false
}: BackpropVisualizationProps) {
  const [phase, setPhase] = useState<'forward' | 'loss' | 'backward' | 'update'>('forward');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per step
  const [step, setStep] = useState(0);
  const [weightSnapshotIndex, setWeightSnapshotIndex] = useState(0);
  const animationRef = useRef<number>();

  // Simple 2-layer network: 2 inputs -> 2 hidden -> 1 output
  const layers = [
    [{ id: 'i0', x: 100, y: 150 }, { id: 'i1', x: 100, y: 250 }],
    [{ id: 'h0', x: 350, y: 150 }, { id: 'h1', x: 350, y: 250 }],
    [{ id: 'o0', x: 600, y: 200 }],
  ];

  // Get current connections from weight snapshots or use defaults
  const getCurrentConnections = useCallback((index?: number): Connection[] => {
    if (weightSnapshots.length === 0) {
      return defaultConnections;
    }
    
    const snapshotIndex = index !== undefined ? index : weightSnapshotIndex;
    const snapshot = weightSnapshots[Math.min(snapshotIndex, weightSnapshots.length - 1)];
    return snapshot.connections.map(conn => ({
      from: conn.from,
      to: conn.to,
      weight: conn.weight,
    }));
  }, [weightSnapshots, weightSnapshotIndex]);

  const [conns, setConns] = useState<Connection[]>(() => {
    if (weightSnapshots.length > 0) {
      return getCurrentConnections();
    }
    return defaultConnections;
  });

  const [neurons, setNeurons] = useState<Neuron[]>(() => {
    const all: Neuron[] = [];
    layers.forEach(layer => {
      layer.forEach(neuron => {
        all.push({
          ...neuron,
          activation: 0,
        });
      });
    });
    return all;
  });

  // Simulate forward pass using actual weights from current snapshot
  const simulateForward = useCallback(() => {
    setNeurons(prev => {
      const updated = [...prev];
      // Use XOR input: (1, 0) -> should output 1
      updated.find(n => n.id === 'i0')!.activation = 1.0;
      updated.find(n => n.id === 'i1')!.activation = 0.0;
      
      // Get current weights from connections
      const currentWeights = getCurrentConnections(weightSnapshotIndex);
      
      // Find weights for hidden layer
      const w_i0_h0 = currentWeights.find(c => c.from === 'i0' && c.to === 'h0')?.weight ?? 0.5;
      const w_i0_h1 = currentWeights.find(c => c.from === 'i0' && c.to === 'h1')?.weight ?? -0.3;
      const w_i1_h0 = currentWeights.find(c => c.from === 'i1' && c.to === 'h0')?.weight ?? 0.4;
      const w_i1_h1 = currentWeights.find(c => c.from === 'i1' && c.to === 'h1')?.weight ?? 0.6;
      
      // Calculate hidden layer
      const h0 = updated.find(n => n.id === 'h0')!;
      const h1 = updated.find(n => n.id === 'h1')!;
      const i0 = updated.find(n => n.id === 'i0')!;
      const i1 = updated.find(n => n.id === 'i1')!;
      
      const h0Sum = i0.activation * w_i0_h0 + i1.activation * w_i1_h0;
      const h1Sum = i0.activation * w_i0_h1 + i1.activation * w_i1_h1;
      h0.activation = Math.max(0, h0Sum); // ReLU
      h1.activation = Math.max(0, h1Sum);
      
      // Find weights for output layer
      const w_h0_o0 = currentWeights.find(c => c.from === 'h0' && c.to === 'o0')?.weight ?? 0.7;
      const w_h1_o0 = currentWeights.find(c => c.from === 'h1' && c.to === 'o0')?.weight ?? -0.5;
      
      // Calculate output
      const o0 = updated.find(n => n.id === 'o0')!;
      const o0Sum = h0.activation * w_h0_o0 + h1.activation * w_h1_o0;
      o0.activation = 1 / (1 + Math.exp(-o0Sum)); // Sigmoid
      
      return updated;
    });
  }, [getCurrentConnections, weightSnapshotIndex]);

  // Simulate backward pass using actual weights from current snapshot
  const simulateBackward = useCallback(() => {
    // Compute gradients first
    const currentNeurons = [...neurons];
    const o0 = currentNeurons.find(n => n.id === 'o0')!;
    const h0 = currentNeurons.find(n => n.id === 'h0')!;
    const h1 = currentNeurons.find(n => n.id === 'h1')!;
    
    // Get current weights from connections
    const currentWeights = getCurrentConnections(weightSnapshotIndex);
    const w_h0_o0 = currentWeights.find(c => c.from === 'h0' && c.to === 'o0')?.weight ?? 0.7;
    const w_h1_o0 = currentWeights.find(c => c.from === 'h1' && c.to === 'o0')?.weight ?? -0.5;
    
    // Output gradient (target = 1 for XOR(1,0), output = o0.activation)
    const target = 1.0;
    const outputGrad = o0.activation - target;
    o0.gradient = outputGrad;
    
    // Hidden layer gradients (using actual weights)
    h0.gradient = outputGrad * w_h0_o0 * (h0.activation > 0 ? 1 : 0); // ReLU derivative
    h1.gradient = outputGrad * w_h1_o0 * (h1.activation > 0 ? 1 : 0);
    
    // Update neurons
    setNeurons(currentNeurons);
    
    // Update connection gradients
    setConns(prev => {
      const updated = [...prev];
      updated.find(c => c.from === 'h0' && c.to === 'o0')!.gradient = o0.gradient! * h0.activation;
      updated.find(c => c.from === 'h1' && c.to === 'o0')!.gradient = o0.gradient! * h1.activation;
      // Also compute gradients for input->hidden connections
      const i0 = currentNeurons.find(n => n.id === 'i0')!;
      const i1 = currentNeurons.find(n => n.id === 'i1')!;
      updated.find(c => c.from === 'i0' && c.to === 'h0')!.gradient = h0.gradient! * i0.activation;
      updated.find(c => c.from === 'i0' && c.to === 'h1')!.gradient = h1.gradient! * i0.activation;
      updated.find(c => c.from === 'i1' && c.to === 'h0')!.gradient = h0.gradient! * i1.activation;
      updated.find(c => c.from === 'i1' && c.to === 'h1')!.gradient = h1.gradient! * i1.activation;
      return updated;
    });
  }, [neurons, getCurrentConnections, weightSnapshotIndex]);

  // Simulate weight update
  const simulateUpdate = () => {
    setConns(prev => {
      const updated = [...prev];
      const learningRate = 0.1;
      updated.forEach(conn => {
        if (conn.gradient !== undefined) {
          conn.weight -= learningRate * conn.gradient;
          conn.gradient = undefined;
        }
      });
      return updated;
    });
    
    setNeurons(prev => {
      const updated = [...prev];
      updated.forEach(neuron => {
        neuron.gradient = undefined;
      });
      return updated;
    });
  };

  // Update connections when weight snapshot index changes
  useEffect(() => {
    const current = getCurrentConnections(weightSnapshotIndex);
    setConns(current);
  }, [weightSnapshotIndex, weightSnapshots, getCurrentConnections]);

  useEffect(() => {
    if (!isPlaying) return;

    // If we have weight snapshots, show forward pass with current weights, then move to next snapshot
    if (weightSnapshots.length > 0) {
      const timer = setTimeout(() => {
        // Cycle through phases for each snapshot
        const phasesPerSnapshot = 4; // forward, loss, backward, update
        const currentPhase = step % phasesPerSnapshot;
        const currentSnapshotIdx = Math.floor(step / phasesPerSnapshot) % weightSnapshots.length;
        
        setWeightSnapshotIndex(currentSnapshotIdx);
        
        // Update connections to current snapshot
        const current = getCurrentConnections(currentSnapshotIdx);
        setConns(current);
        
        // Execute phase action
        if (currentPhase === 0) {
          setPhase('forward');
          simulateForward();
        } else if (currentPhase === 1) {
          setPhase('loss');
        } else if (currentPhase === 2) {
          setPhase('backward');
          simulateBackward();
        } else if (currentPhase === 3) {
          setPhase('update');
          // Don't actually update weights - they come from snapshots
          // Just clear gradients
          setConns(prev => prev.map(c => ({ ...c, gradient: undefined })));
          setNeurons(prev => prev.map(n => ({ ...n, gradient: undefined })));
        }
        
        setStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // Original behavior when no weight snapshots
      const steps = [
        { phase: 'forward' as const, action: simulateForward },
        { phase: 'loss' as const, action: () => {} },
        { phase: 'backward' as const, action: simulateBackward },
        { phase: 'update' as const, action: simulateUpdate },
      ];

      const currentStep = steps[step % steps.length];
      setPhase(currentStep.phase);
      currentStep.action();

      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, step, speed, weightSnapshots, weightSnapshotIndex, getCurrentConnections, simulateForward, simulateBackward]);

  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
    setWeightSnapshotIndex(0);
    setPhase('forward');
    setNeurons(prev => prev.map(n => ({ ...n, activation: 0, gradient: undefined })));
    const resetConns = weightSnapshots.length > 0 
      ? getCurrentConnections(0).map(c => ({ ...c, gradient: undefined }))
      : defaultConnections.map(c => ({ ...c, gradient: undefined }));
    setConns(resetConns);
  };

  const handleStep = () => {
    const steps = [
      { phase: 'forward' as const, action: simulateForward },
      { phase: 'loss' as const, action: () => {} },
      { phase: 'backward' as const, action: simulateBackward },
      { phase: 'update' as const, action: simulateUpdate },
    ];
    
    const currentStep = steps[step % steps.length];
    setPhase(currentStep.phase);
    currentStep.action();
    setStep(prev => prev + 1);
  };

  const getConnectionColor = (conn: Connection): string => {
    if (phase === 'backward' && conn.gradient !== undefined) {
      const intensity = Math.min(1, Math.abs(conn.gradient) * 2);
      return conn.gradient > 0 
        ? `rgba(239, 68, 68, ${intensity})` // red for positive
        : `rgba(59, 130, 246, ${intensity})`; // blue for negative
    }
    return conn.weight > 0 ? '#60a5fa' : '#f87171';
  };

  const getNeuronColor = (neuron: Neuron): string => {
    if (phase === 'forward' && neuron.activation > 0) {
      const intensity = Math.min(1, neuron.activation);
      return `rgba(34, 197, 94, ${intensity})`; // green
    }
    if (phase === 'backward' && neuron.gradient !== undefined) {
      const intensity = Math.min(1, Math.abs(neuron.gradient) * 2);
      return neuron.gradient > 0
        ? `rgba(239, 68, 68, ${intensity})`
        : `rgba(59, 130, 246, ${intensity})`;
    }
    return '#9ca3af';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Backpropagation Visualization</h3>
        <p className="text-gray-600 text-sm mb-4">
          Watch how information flows forward through the network, then gradients flow backward during training.
          {disabled ? (
            <span className="block mt-2 text-yellow-600 font-medium">
              Please wait for the model to finish training
            </span>
          ) : weightSnapshots.length > 0 && (
            <span className="block mt-2 text-primary-600 font-medium">
              Linked to training data: Showing weight updates from {weightSnapshots.length} snapshots
            </span>
          )}
        </p>
        
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={disabled || weightSnapshots.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleStep}
            disabled={disabled || isPlaying || weightSnapshots.length === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Step
          </button>
          <button
            onClick={handleReset}
            disabled={disabled || weightSnapshots.length === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          {disabled && (
            <span className="text-sm text-gray-500 italic">
              Wait for training to complete to interact with visualization
            </span>
          )}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Speed:</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={disabled}
              className="w-32 disabled:opacity-50"
            />
            <span className="text-sm text-gray-600">{speed}ms</span>
          </div>
        </div>
        
        <div className="mb-4 flex items-center gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Current Phase: </span>
            <span className={`text-sm font-semibold ${
              phase === 'forward' ? 'text-green-600' :
              phase === 'loss' ? 'text-yellow-600' :
              phase === 'backward' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {phase.charAt(0).toUpperCase() + phase.slice(1)} Pass
            </span>
          </div>
          {weightSnapshots.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">Epoch: </span>
              <span className="text-sm font-semibold text-primary-600">
                {weightSnapshots[Math.min(weightSnapshotIndex, weightSnapshots.length - 1)]?.epoch ?? 0}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg bg-gray-50 p-4 overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* Draw connections */}
          {conns.map((conn, idx) => {
            const fromNeuron = neurons.find(n => n.id === conn.from);
            const toNeuron = neurons.find(n => n.id === conn.to);
            if (!fromNeuron || !toNeuron) return null;

            const strokeWidth = Math.abs(conn.weight) * 3 + 1;
            const color = getConnectionColor(conn);
            const midX = (fromNeuron.x + toNeuron.x) / 2;
            const midY = (fromNeuron.y + toNeuron.y) / 2;

            return (
              <g key={idx}>
                <line
                  x1={fromNeuron.x}
                  y1={fromNeuron.y}
                  x2={toNeuron.x}
                  y2={toNeuron.y}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  opacity={phase === 'forward' || phase === 'backward' ? 0.8 : 0.3}
                  markerEnd="url(#arrowhead)"
                />
                {/* Weight label */}
                <rect
                  x={midX - 20}
                  y={midY - 8}
                  width="40"
                  height="16"
                  fill="white"
                  stroke="#374151"
                  strokeWidth="1"
                  rx="3"
                  opacity={0.9}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-mono fill-gray-900"
                >
                  {conn.weight.toFixed(2)}
                </text>
                {/* Gradient label during backward pass */}
                {phase === 'backward' && conn.gradient !== undefined && (
                  <text
                    x={midX}
                    y={midY - 12}
                    textAnchor="middle"
                    className="text-xs font-mono fill-red-600 font-semibold"
                  >
                    ∇: {conn.gradient.toFixed(3)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
            </marker>
          </defs>

          {/* Draw neurons */}
          {neurons.map((neuron) => {
            const color = getNeuronColor(neuron);
            const radius = 25;
            const isActive = phase === 'forward' && neuron.activation > 0;
            const hasGradient = phase === 'backward' && neuron.gradient !== undefined;

            return (
              <g key={neuron.id}>
                <circle
                  cx={neuron.x}
                  cy={neuron.y}
                  r={radius}
                  fill={color}
                  stroke="#374151"
                  strokeWidth={isActive || hasGradient ? 3 : 1}
                  className="transition-all duration-300"
                />
                <text
                  x={neuron.x}
                  y={neuron.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-gray-900"
                >
                  {neuron.id}
                </text>
                {(phase === 'forward' && neuron.activation > 0) && (
                  <text
                    x={neuron.x}
                    y={neuron.y + 40}
                    textAnchor="middle"
                    className="text-xs fill-gray-700"
                  >
                    {neuron.activation.toFixed(2)}
                  </text>
                )}
                {(phase === 'backward' && neuron.gradient !== undefined) && (
                  <text
                    x={neuron.x}
                    y={neuron.y + 40}
                    textAnchor="middle"
                    className="text-xs fill-gray-700 font-medium"
                  >
                    ∇: {neuron.gradient.toFixed(3)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Layer labels */}
          <text x={100} y={100} className="text-sm font-semibold fill-gray-700">Input</text>
          <text x={350} y={100} className="text-sm font-semibold fill-gray-700">Hidden</text>
          <text x={600} y={100} className="text-sm font-semibold fill-gray-700">Output</text>
        </svg>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Forward Pass:</strong> Activations flow from input to output (green). 
          <strong> Backward Pass:</strong> Gradients flow from output to input (red/blue). 
          <strong> Update:</strong> Weights are adjusted based on gradients.
        </p>
      </div>
    </div>
  );
}

