import dynamic from 'next/dynamic';

// Disable SSR for this component to prevent hydration errors from random data generation
const ExtremeValueModels = dynamic(
  () => import('@/components/technique-tutorials/bhev/ExtremeValueModels'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-[#171717] rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Extreme Value Models for Traffic Safety</h2>
          <p className="text-gray-700 dark:text-white mb-3">
            Traffic conflicts are near-miss events that can predict crashes. This tutorial introduces Extreme Value Theory (EVT) 
            and demonstrates how Generalized Extreme Value (GEV) and Generalized Pareto (GPD) distributions can quantify crash risk 
            from conflict data.
          </p>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200 font-mono">
              GEV(μ, σ, ξ) where:<br />
              μ = μ₀ + Σ(β_μ × covariate)<br />
              σ = exp(ζ₀ + Σ(β_ζ × covariate))<br />
              ξ = fixed
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-white">Loading interactive content...</p>
        </div>
      </div>
    )
  }
);

export default function BHEVPage() {
  return (
    <div className="min-h-screen bg-beige-50 dark:bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExtremeValueModels />
      </div>
    </div>
  );
}


