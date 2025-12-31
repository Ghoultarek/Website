'use client';

import { useMemo } from 'react';
import { InlineMath } from 'react-katex';

interface DataPoint {
  x: number;
  y: number;
  label: number;
  predicted?: number;
}

interface ConfusionMatrixProps {
  rfPredictions: DataPoint[];
  xgbPredictions: DataPoint[];
}

export default function ConfusionMatrix({ rfPredictions, xgbPredictions }: ConfusionMatrixProps) {
  // Ensure both arrays have the same length
  const isValid = useMemo(() => {
    return rfPredictions.length > 0 && 
           xgbPredictions.length > 0 && 
           rfPredictions.length === xgbPredictions.length;
  }, [rfPredictions, xgbPredictions]);

  // Calculate confusion matrix for Random Forest
  const rfCM = useMemo(() => {
    let tp = 0, tn = 0, fp = 0, fn = 0;
    rfPredictions.forEach(point => {
      if (point.label === 1 && point.predicted === 1) tp++;
      else if (point.label === 0 && point.predicted === 0) tn++;
      else if (point.label === 0 && point.predicted === 1) fp++;
      else if (point.label === 1 && point.predicted === 0) fn++;
    });
    return { tp, tn, fp, fn };
  }, [rfPredictions]);

  // Calculate confusion matrix for XGBoost
  const xgbCM = useMemo(() => {
    let tp = 0, tn = 0, fp = 0, fn = 0;
    xgbPredictions.forEach(point => {
      if (point.label === 1 && point.predicted === 1) tp++;
      else if (point.label === 0 && point.predicted === 0) tn++;
      else if (point.label === 0 && point.predicted === 1) fp++;
      else if (point.label === 1 && point.predicted === 0) fn++;
    });
    return { tp, tn, fp, fn };
  }, [xgbPredictions]);

  // Calculate metrics
  const calculateMetrics = (cm: { tp: number; tn: number; fp: number; fn: number }) => {
    const total = cm.tp + cm.tn + cm.fp + cm.fn;
    const accuracy = total > 0 ? ((cm.tp + cm.tn) / total) * 100 : 0;
    const precision = (cm.tp + cm.fp) > 0 ? (cm.tp / (cm.tp + cm.fp)) * 100 : 0;
    const recall = (cm.tp + cm.fn) > 0 ? (cm.tp / (cm.tp + cm.fn)) * 100 : 0;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    return { accuracy, precision, recall, f1 };
  };

  const rfMetrics = calculateMetrics(rfCM);
  const xgbMetrics = calculateMetrics(xgbCM);

  const ConfusionMatrixTable = ({ cm, modelName }: { cm: { tp: number; tn: number; fp: number; fn: number }; modelName: string }) => (
    <div className="flex flex-col items-center">
      <h4 className="font-semibold text-gray-900 mb-3">{modelName}</h4>
      <table className="border-collapse border-2 border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-400 p-2 bg-gray-100"></th>
            <th className="border border-gray-400 p-2 bg-gray-100">Predicted: 0</th>
            <th className="border border-gray-400 p-2 bg-gray-100">Predicted: 1</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 p-2 bg-gray-100 font-semibold">Actual: 0</td>
            <td className={`border border-gray-400 p-4 text-center font-bold text-lg ${
              modelName === 'Random Forest' ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'
            }`}>
              {cm.tn}
              <div className="text-xs font-normal mt-1">TN</div>
            </td>
            <td className={`border border-gray-400 p-4 text-center font-bold text-lg ${
              modelName === 'Random Forest' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {cm.fp}
              <div className="text-xs font-normal mt-1">FP</div>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 bg-gray-100 font-semibold">Actual: 1</td>
            <td className={`border border-gray-400 p-4 text-center font-bold text-lg ${
              modelName === 'Random Forest' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {cm.fn}
              <div className="text-xs font-normal mt-1">FN</div>
            </td>
            <td className={`border border-gray-400 p-4 text-center font-bold text-lg ${
              modelName === 'Random Forest' ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'
            }`}>
              {cm.tp}
              <div className="text-xs font-normal mt-1">TP</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Model Evaluation: Confusion Matrix</h2>
      
      <p className="text-gray-700 mb-6">
        A confusion matrix is a powerful tool for evaluating classification models. It shows how many predictions 
        were correct and how many were incorrect, broken down by class. This helps us understand not just overall 
        accuracy, but where the model makes mistakes.
      </p>

      {!isValid && (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Warning:</strong> The prediction arrays have different lengths. 
            Random Forest: {rfPredictions.length} predictions, XGBoost: {xgbPredictions.length} predictions.
            Please ensure both models are using the same test dataset.
          </p>
        </div>
      )}

      {/* Side-by-side confusion matrices */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">Confusion Matrices Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ConfusionMatrixTable cm={rfCM} modelName="Random Forest" />
          <ConfusionMatrixTable cm={xgbCM} modelName="XGBoost" />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-green-100 border border-green-300 rounded p-2 text-center">
            <span className="font-semibold text-green-900">Green (TN, TP):</span> Correct predictions
          </div>
          <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-center">
            <span className="font-semibold text-yellow-900">Yellow (FP, FN):</span> Incorrect predictions
          </div>
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Random Forest Metrics */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Random Forest</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Accuracy:</span>
                <span className="font-semibold text-blue-900">{rfMetrics.accuracy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Precision:</span>
                <span className="font-semibold text-blue-900">{rfMetrics.precision.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Recall:</span>
                <span className="font-semibold text-blue-900">{rfMetrics.recall.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">F1-Score:</span>
                <span className="font-semibold text-blue-900">{rfMetrics.f1.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* XGBoost Metrics */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">XGBoost</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-800">Accuracy:</span>
                <span className="font-semibold text-green-900">{xgbMetrics.accuracy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Precision:</span>
                <span className="font-semibold text-green-900">{xgbMetrics.precision.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Recall:</span>
                <span className="font-semibold text-green-900">{xgbMetrics.recall.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">F1-Score:</span>
                <span className="font-semibold text-green-900">{xgbMetrics.f1.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Explanations */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-3">Understanding the Metrics</h3>
        <div className="space-y-3 text-sm text-yellow-900">
          <div>
            <p className="font-semibold mb-1">Accuracy:</p>
            <p className="text-xs ml-4">
              Overall correctness: <InlineMath math="\frac{TP + TN}{TP + TN + FP + FN}" />. 
              How many predictions were correct overall.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Precision:</p>
            <p className="text-xs ml-4">
              When the model predicts Class 1, how often is it correct: <InlineMath math="\frac{TP}{TP + FP}" />. 
              High precision means fewer false positives.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Recall:</p>
            <p className="text-xs ml-4">
              Of all actual Class 1 cases, how many did we catch: <InlineMath math="\frac{TP}{TP + FN}" />. 
              High recall means fewer false negatives.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">F1-Score:</p>
            <p className="text-xs ml-4">
              Harmonic mean of precision and recall: <InlineMath math="2 \times \frac{Precision \times Recall}{Precision + Recall}" />. 
              Balances precision and recall into a single metric.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Comparing Models</h3>
        <p className="text-sm text-blue-800 mb-2">
          By comparing confusion matrices side-by-side, we can see which model performs better. Look for:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Higher numbers in green cells (TP, TN) = better performance</li>
          <li>Lower numbers in yellow cells (FP, FN) = fewer mistakes</li>
          <li>Which model has better balance between precision and recall?</li>
          <li>Consider the context: is precision or recall more important for your use case?</li>
        </ul>
      </div>
    </div>
  );
}

