'use client';

import { useState, useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function TrainingPathologies() {
  const [networkDepth, setNetworkDepth] = useState(5);
  const [learningRate, setLearningRate] = useState(0.01);
  const [initScale, setInitScale] = useState(1.0);

  // Vanishing Gradients: Generate gradient norms that decrease exponentially
  const vanishingGradientData = useMemo(() => {
    const data = [];
    for (let layer = 1; layer <= networkDepth; layer++) {
      // Exponential decay: each layer multiplies by ~0.1 (typical for sigmoid/tanh)
      const gradientNorm = Math.pow(0.1, layer - 1);
      data.push({
        layer: `L${layer}`,
        gradientNorm: gradientNorm,
      });
    }
    return data;
  }, [networkDepth]);

  // Vanishing gradients loss curve: stalls despite capacity
  const vanishingLossData = useMemo(() => {
    const data = [];
    for (let epoch = 0; epoch <= 50; epoch++) {
      // Loss decreases initially then plateaus (stalls)
      const loss = epoch < 10 ? 2.0 - epoch * 0.15 : 0.5 + Math.random() * 0.1;
      data.push({ epoch, loss });
    }
    return data;
  }, []);

  // Exploding Gradients: Generate gradient norms that increase exponentially
  const explodingGradientData = useMemo(() => {
    const data = [];
    for (let layer = 1; layer <= networkDepth; layer++) {
      // Exponential growth: each layer multiplies by ~10
      const gradientNorm = Math.pow(10, layer - 1) * initScale;
      // Weight update magnitude = learning rate * gradient norm
      const weightUpdate = learningRate * gradientNorm;
      data.push({
        layer: `L${layer}`,
        gradientNorm: gradientNorm,
        weightUpdate: weightUpdate,
      });
    }
    return data;
  }, [networkDepth, initScale, learningRate]);

  // Exploding gradients loss curve: oscillatory/unstable
  const explodingLossData = useMemo(() => {
    const data = [];
    for (let epoch = 0; epoch <= 50; epoch++) {
      // Oscillatory loss that grows unstable
      const baseLoss = 2.0;
      const oscillation = Math.sin(epoch * 0.5) * (epoch * 0.1);
      const noise = (Math.random() - 0.5) * 0.5;
      const loss = Math.max(0, baseLoss + oscillation + noise);
      data.push({ epoch, loss });
    }
    return data;
  }, []);

  // Weight values diverging over time
  const weightDivergenceData = useMemo(() => {
    const data = [];
    const layers = ['L1', 'L2', 'L3', 'L4', 'L5'];
    for (let epoch = 0; epoch <= 20; epoch++) {
      const point: { epoch: number; [key: string]: number | string } = { epoch };
      layers.forEach((layer, idx) => {
        // Weights diverge exponentially: w_t = w_0 * (1 + lr * grad_norm)^t
        const gradNorm = Math.pow(10, idx) * initScale;
        const weightValue = Math.pow(1 + learningRate * gradNorm, epoch);
        point[layer] = weightValue;
      });
      data.push(point);
    }
    return data;
  }, [learningRate, initScale]);

  // Dead ReLUs: Generate activation histogram data
  const deadReluData = useMemo(() => {
    const iterations = [0, 10, 20, 30, 40, 50];
    const data: Array<{ iteration: number; activationValue: number; count: number }> = [];
    
    iterations.forEach((iter, idx) => {
      // As iterations increase, more activations collapse to zero
      const zeroActivations = Math.min(100, iter * 2);
      const activeActivations = Math.max(0, 100 - zeroActivations);
      
      // Create histogram bins
      const bins = [];
      // Zero bin (dead ReLUs)
      bins.push({ value: 0, count: zeroActivations });
      // Small positive values (dying ReLUs)
      bins.push({ value: 0.1, count: activeActivations * 0.3 });
      // Medium values
      bins.push({ value: 0.5, count: activeActivations * 0.4 });
      // Large values
      bins.push({ value: 1.0, count: activeActivations * 0.3 });
      
      bins.forEach(bin => {
        data.push({
          iteration: iter,
          activationValue: bin.value,
          count: bin.count,
        });
      });
    });
    
    return data;
  }, []);

  // Dead ReLU loss curve: stalls after ReLUs die
  const deadReluLossData = useMemo(() => {
    const data = [];
    for (let epoch = 0; epoch <= 50; epoch++) {
      // Loss decreases initially, then stalls when ReLUs die (around epoch 20)
      let loss;
      if (epoch < 20) {
        loss = 2.0 - epoch * 0.08;
      } else {
        // Stalls after ReLUs die
        loss = 0.4 + Math.random() * 0.05;
      }
      data.push({ epoch, loss });
    }
    return data;
  }, []);

  // Generate activation histogram for current iteration
  const [selectedIteration, setSelectedIteration] = useState(0);
  const activationHistogram = useMemo(() => {
    const zeroActivations = Math.min(100, selectedIteration * 2);
    const activeActivations = Math.max(0, 100 - zeroActivations);
    
    return [
      { activation: '0.0', count: zeroActivations, label: 'Dead (0)' },
      { activation: '0.1', count: activeActivations * 0.3, label: 'Small' },
      { activation: '0.5', count: activeActivations * 0.4, label: 'Medium' },
      { activation: '1.0+', count: activeActivations * 0.3, label: 'Large' },
    ];
  }, [selectedIteration]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Observed Training Pathologies</h2>
      
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700 mb-4">
          Gradient-based learning implicitly assumes that gradients neither collapse nor blow up as they propagate 
          through the network. This section visualizes three common ways this assumption fails in practice, even in 
          small networks.
        </p>

        {/* Vanishing Gradients */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vanishing Gradients</h3>
          
          <p className="text-gray-700 mb-4 text-sm">
            In deep networks, especially with sigmoid or tanh activations, gradients can shrink exponentially as they 
            propagate backward. Early layers receive gradients so small that their weights barely update, causing training 
            to stall despite the network having sufficient expressive capacity.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Depth: {networkDepth} layers
            </label>
            <input
              type="range"
              min="3"
              max="8"
              value={networkDepth}
              onChange={(e) => setNetworkDepth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Gradient Norms by Layer</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={vanishingGradientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="layer" />
                  <YAxis scale="log" domain={[0.0001, 10]} />
                  <Tooltip 
                    formatter={(value: number) => value.toExponential(2)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="gradientNorm" fill="#ef4444">
                    {vanishingGradientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#ef4444" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Gradients decrease exponentially: <InlineMath math="\|\nabla_{L_i}\| \approx 0.1^i" />
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Loss Curve</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={vanishingLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis domain={[0, 2.5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Loss plateaus despite network capacity
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900">
              <strong>Problem:</strong> Early layers receive gradients near zero, so their weights don't update. 
              The network has capacity to learn, but training stalls because gradients vanish.
            </p>
          </div>
        </div>

        {/* Exploding Gradients */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Exploding Gradients</h3>
          
          <p className="text-gray-700 mb-4 text-sm">
            When gradients grow exponentially through the network, weight updates become too large. This causes 
            training to become unstable, with loss oscillating wildly or diverging completely. Common in deep 
            networks with poor initialization or high learning rates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Rate: {learningRate.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initialization Scale: {initScale.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={initScale}
                onChange={(e) => setInitScale(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Gradient Norms & Weight Updates</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={explodingGradientData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="layer" />
                  <YAxis scale="log" domain={[0.01, 1000]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'gradientNorm') {
                        return [`Gradient: ${value.toExponential(2)}`, 'Gradient Norm'];
                      }
                      return [`Update: ${value.toFixed(2)}`, 'Weight Update'];
                    }}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="gradientNorm" fill="#f59e0b" name="Gradient Norm" />
                  <Bar dataKey="weightUpdate" fill="#dc2626" name="Weight Update" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Weight updates = <InlineMath math="\eta \times \|\nabla\|" /> grow exponentially
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Loss Curve</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={explodingLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Loss oscillates and becomes unstable
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-center">Weight Values Diverging Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightDivergenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis scale="log" domain={[0.1, 10000]} />
                <Tooltip 
                  formatter={(value: number) => value.toFixed(2)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line type="monotone" dataKey="L1" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="L2" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="L3" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="L4" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="L5" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Weights in deeper layers diverge faster, causing instability
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900 mb-2">
              <strong>Problem:</strong> Weight updates are too large, causing the network to overshoot optimal 
              values. Training becomes unstable and may diverge completely.
            </p>
            <p className="text-sm text-yellow-900">
              <strong>Observe:</strong> As gradients explode, weight updates (red bars) become massive. Deeper layers 
              see weights diverge exponentially, making recovery impossible. The combination of high learning rate and 
              large gradients creates a feedback loop of instability.
            </p>
          </div>
        </div>

        {/* Dead ReLUs */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Dead ReLUs</h3>
          
          <p className="text-gray-700 mb-4 text-sm">
            ReLU neurons can "die" when their weights become negative enough that the input to the ReLU is always 
            negative. Once dead, a ReLU outputs zero for all inputs, gradients stop flowing through it, and it 
            cannot recover. This causes irreversible training failure.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Iteration: {selectedIteration}
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="10"
              value={selectedIteration}
              onChange={(e) => setSelectedIteration(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Activation Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activationHistogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6">
                    {activationHistogram.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.activation === '0.0' ? '#dc2626' : '#8b5cf6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Dead ReLUs (red) increase over time
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Loss Curve</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={deadReluLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis domain={[0, 2.5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Loss decreases initially, then stalls around epoch 20 when ReLUs die
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-900 mb-2">
              <strong>Problem:</strong> Once a ReLU dies, it outputs zero for all inputs. Since 
              <InlineMath math="\text{ReLU}'(x) = 0" /> for <InlineMath math="x < 0" />, no gradients flow 
              backward, and the neuron cannot recover.
            </p>
            <p className="text-sm text-purple-900">
              <strong>Common causes:</strong> High learning rates, poor initialization, or large negative biases 
              can push ReLU inputs into the negative region permanently.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Solutions:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Use Leaky ReLU or ELU activations that allow small negative outputs</li>
              <li>Careful weight initialization (e.g., He initialization)</li>
              <li>Lower learning rates or adaptive learning rate schedules</li>
              <li>Batch normalization to stabilize activations</li>
            </ul>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Key Takeaways</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Gradient flow is critical: gradients must neither vanish nor explode</li>
            <li>Activation functions matter: sigmoid/tanh can cause vanishing gradients, ReLU can die</li>
            <li>Initialization matters: poor initialization can cause immediate training failure</li>
            <li>These pathologies can occur even in small networks, not just deep ones</li>
            <li>Modern techniques (batch norm, residual connections, better activations) help mitigate these issues</li>
          </ul>
        </div>

        {/* Limitations Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 italic">
            These visualizations make gradient pathologies concrete, but they do not fully explain why some 
            initializations converge while others fail under identical settings, or why instability sometimes 
            appears suddenly after periods of stable training. Understanding those transitions remains an open problem.
          </p>
        </div>
      </div>
    </div>
  );
}

