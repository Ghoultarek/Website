export interface NetworkConfig {
  inputSize: number;
  hiddenSizes: number[];
  outputSize: number;
  learningRate: number;
  activation: 'relu' | 'sigmoid' | 'tanh';
  lossFunction: 'mse' | 'crossentropy';
  initializationScale?: number; // Optional: multiplier for weight initialization (larger = worse initial weights)
}

export interface Layer {
  weights: number[][];
  biases: number[];
  activations: number[];
  gradients: {
    weights: number[][];
    biases: number[];
    inputs: number[];
  };
}

export interface TrainingState {
  epoch: number;
  loss: number;
  accuracy?: number;
  layers: Layer[];
  gradients: {
    layerIndex: number;
    gradientMagnitude: number;
  }[];
}

export interface VisualizationData {
  lossHistory: Array<{ epoch: number; loss: number }>;
  accuracyHistory?: Array<{ epoch: number; accuracy: number }>;
  currentState: TrainingState | null;
}

export interface Dataset {
  name: string;
  inputs: number[][];
  targets: number[][];
  description: string;
  metadata?: {
    slope?: number;
    intercept?: number;
  };
  // Optional test set (for circle classification)
  testInputs?: number[][];
  testTargets?: number[][];
}

export interface BackpropStep {
  phase: 'forward' | 'loss' | 'backward' | 'update';
  layerIndex?: number;
  neuronIndex?: number;
  value?: number;
  gradient?: number;
}

export interface NetworkVisualization {
  layers: Array<{
    neurons: Array<{
      activation: number;
      bias: number;
      weights: number[];
    }>;
  }>;
  connections: Array<{
    fromLayer: number;
    fromNeuron: number;
    toLayer: number;
    toNeuron: number;
    weight: number;
    gradient?: number;
  }>;
}

