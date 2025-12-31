import { NetworkConfig, Layer, Dataset } from './types';

export class NeuralNetwork {
  private config: NetworkConfig;
  private layers: Layer[];

  constructor(config: NetworkConfig) {
    this.config = config;
    this.layers = this.initializeLayers();
  }

  private initializeLayers(): Layer[] {
    const layers: Layer[] = [];
    const sizes = [this.config.inputSize, ...this.config.hiddenSizes, this.config.outputSize];

    for (let i = 0; i < sizes.length - 1; i++) {
      const inputSize = sizes[i];
      const outputSize = sizes[i + 1];

      // Initialize weights with Xavier/Glorot initialization
      const weights: number[][] = [];
      const limit = Math.sqrt(6.0 / (inputSize + outputSize));
      
      for (let j = 0; j < outputSize; j++) {
        weights[j] = [];
        for (let k = 0; k < inputSize; k++) {
          weights[j][k] = (Math.random() * 2 - 1) * limit;
        }
      }

      // Initialize biases to zero
      const biases = new Array(outputSize).fill(0);

      layers.push({
        weights,
        biases,
        activations: new Array(outputSize).fill(0),
        gradients: {
          weights: weights.map(row => row.map(() => 0)),
          biases: new Array(outputSize).fill(0),
          inputs: new Array(inputSize).fill(0),
        },
      });
    }

    return layers;
  }

  private activate(x: number): number {
    switch (this.config.activation) {
      case 'relu':
        return Math.max(0, x);
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'tanh':
        return Math.tanh(x);
      default:
        return x;
    }
  }

  private activateDerivative(x: number): number {
    switch (this.config.activation) {
      case 'relu':
        return x > 0 ? 1 : 0;
      case 'sigmoid':
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      case 'tanh':
        const t = Math.tanh(x);
        return 1 - t * t;
      default:
        return 1;
    }
  }

  forward(input: number[]): number[] {
    let currentInput = input;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const outputs: number[] = [];

      for (let j = 0; j < layer.weights.length; j++) {
        let sum = layer.biases[j];
        for (let k = 0; k < currentInput.length; k++) {
          sum += layer.weights[j][k] * currentInput[k];
        }
        outputs[j] = this.activate(sum);
      }

      layer.activations = outputs;
      currentInput = outputs;
    }

    return currentInput;
  }

  backward(input: number[], target: number[], output: number[]): void {
    // Calculate output layer error
    let error: number[];
    
    if (this.config.lossFunction === 'crossentropy') {
      // For cross-entropy with softmax (simplified)
      error = output.map((o, i) => o - target[i]);
    } else {
      // MSE
      error = output.map((o, i) => o - target[i]);
    }

    // Backpropagate through layers
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const prevLayer = i > 0 ? this.layers[i - 1] : null;
      const prevActivations = i > 0 ? prevLayer!.activations : input;

      // Calculate gradients for this layer
      const deltas: number[] = [];
      
      for (let j = 0; j < layer.weights.length; j++) {
        const activation = layer.activations[j];
        const derivative = this.activateDerivative(activation);
        deltas[j] = error[j] * derivative;

        // Update bias gradient
        layer.gradients.biases[j] += deltas[j];

        // Update weight gradients
        for (let k = 0; k < layer.weights[j].length; k++) {
          layer.gradients.weights[j][k] += deltas[j] * prevActivations[k];
        }
      }

      // Calculate error for previous layer
      if (prevLayer) {
        error = new Array(prevLayer.weights.length).fill(0);
        for (let j = 0; j < prevLayer.weights.length; j++) {
          for (let k = 0; k < layer.weights.length; k++) {
            error[j] += layer.weights[k][j] * deltas[k];
          }
        }
      }
    }
  }

  updateWeights(batchSize: number): void {
    const lr = this.config.learningRate / batchSize;

    for (const layer of this.layers) {
      // Update weights
      for (let i = 0; i < layer.weights.length; i++) {
        for (let j = 0; j < layer.weights[i].length; j++) {
          layer.weights[i][j] -= lr * layer.gradients.weights[i][j];
          layer.gradients.weights[i][j] = 0; // Reset gradient
        }
      }

      // Update biases
      for (let i = 0; i < layer.biases.length; i++) {
        layer.biases[i] -= lr * layer.gradients.biases[i];
        layer.gradients.biases[i] = 0; // Reset gradient
      }
    }
  }

  calculateLoss(output: number[], target: number[]): number {
    if (this.config.lossFunction === 'crossentropy') {
      // Cross-entropy loss (simplified)
      let loss = 0;
      for (let i = 0; i < output.length; i++) {
        const o = Math.max(1e-15, Math.min(1 - 1e-15, output[i]));
        loss -= target[i] * Math.log(o) + (1 - target[i]) * Math.log(1 - o);
      }
      return loss / output.length;
    } else {
      // MSE
      let loss = 0;
      for (let i = 0; i < output.length; i++) {
        loss += Math.pow(output[i] - target[i], 2);
      }
      return loss / output.length;
    }
  }

  train(dataset: Dataset, epochs: number, onEpochComplete?: (epoch: number, loss: number) => void): void {
    const { inputs, targets } = dataset;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const target = targets[i];

        // Forward pass
        const output = this.forward(input);

        // Calculate loss
        const loss = this.calculateLoss(output, target);
        totalLoss += loss;

        // Backward pass
        this.backward(input, target, output);

        // Update weights (SGD - update after each sample)
        this.updateWeights(1);
      }

      const avgLoss = totalLoss / inputs.length;
      if (onEpochComplete) {
        onEpochComplete(epoch, avgLoss);
      }
    }
  }

  predict(input: number[]): number[] {
    return this.forward(input);
  }

  getLayers(): Layer[] {
    return this.layers.map(layer => ({
      ...layer,
      weights: layer.weights.map(row => [...row]),
      biases: [...layer.biases],
      activations: [...layer.activations],
      gradients: {
        weights: layer.gradients.weights.map(row => [...row]),
        biases: [...layer.gradients.biases],
        inputs: [...layer.gradients.inputs],
      },
    }));
  }

  getConfig(): NetworkConfig {
    return { ...this.config };
  }
}

// Dataset generators
export function generateXORDataset(): Dataset {
  return {
    name: 'XOR',
    inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
    targets: [[0], [1], [1], [0]],
    description: 'XOR problem - classic non-linearly separable dataset',
  };
}

export function generateLinearDataset(numSamples: number = 20): Dataset {
  const inputs: number[][] = [];
  const targets: number[][] = [];

  for (let i = 0; i < numSamples; i++) {
    const x = Math.random() * 2 - 1; // -1 to 1
    const y = x * 0.5 + 0.2 + (Math.random() - 0.5) * 0.1; // y = 0.5x + 0.2 + noise
    inputs.push([x]);
    targets.push([y]);
  }

  return {
    name: 'Linear Regression',
    inputs,
    targets,
    description: 'Simple linear regression with noise',
  };
}

export function generateCircleDataset(numSamples: number = 50): Dataset {
  const inputs: number[][] = [];
  const targets: number[][] = [];

  for (let i = 0; i < numSamples; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 0.5 + (Math.random() < 0.5 ? 0 : 0.6);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    inputs.push([x, y]);
    targets.push([radius > 0.5 ? 1 : 0]);
  }

  return {
    name: 'Circle Classification',
    inputs,
    targets,
    description: 'Classify points inside vs outside a circle',
  };
}

