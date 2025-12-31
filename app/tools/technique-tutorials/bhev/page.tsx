import dynamic from 'next/dynamic';

// Disable SSR for this component to prevent hydration errors from random data generation
const ExtremeValueModels = dynamic(
  () => import('@/components/technique-tutorials/bhev/ExtremeValueModels'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Extreme Value Models for Traffic Safety</h2>
          <p className="text-gray-700 mb-3">
            Traffic conflicts are near-miss events that can predict crashes. This tutorial introduces Extreme Value Theory (EVT) 
            and demonstrates how Generalized Extreme Value (GEV) and Generalized Pareto (GPD) distributions can quantify crash risk 
            from conflict data.
          </p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 font-mono">
              GEV(μ, σ, ξ) where:<br />
              μ = μ₀ + Σ(β_μ × covariate)<br />
              σ = exp(ζ₀ + Σ(β_ζ × covariate))<br />
              ξ = fixed
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading interactive content...</p>
        </div>
      </div>
    )
  }
);

export default function BHEVPage() {
  return (
    <div className="min-h-screen bg-beige-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExtremeValueModels />
      </div>
    </div>
  );
}


