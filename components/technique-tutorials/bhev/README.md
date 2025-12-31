# BHEV Model Component

## Overview

This directory contains the Bayesian Hierarchical Extreme Value (BHEV) model implementation for interactive exploration of Generalized Extreme Value (GEV) distributions in traffic safety analysis.

## What is BHEV?

BHEV (Bayesian Hierarchical Extreme Value) modeling is a statistical approach for analyzing extreme events in traffic safety data. It uses the Generalized Extreme Value (GEV) distribution to model block maxima of negated conflict extremes (e.g., -TTC, -PET) where more negative values indicate more severe conflicts.

## Key Concepts

### Block Maxima Approach
- Time series data is divided into blocks (e.g., daily, weekly)
- Maximum value from each block is extracted
- These maxima are modeled using the GEV distribution

### Negated Extremes
- We model **-TTC** (negative Time-To-Collision) 
- More negative values = more severe conflicts (closer to collision)
- Crash occurs when -TTC ≥ 0 (i.e., TTC ≤ 0)
- Allows modeling the "upper tail" of extremes using standard GEV theory

### GEV Parameters
The GEV distribution has three parameters:
- **μ (mu)**: Location parameter = μ₀ + Σ(β_μ × covariate)
- **σ (sigma)**: Scale parameter = exp(ζ₀ + Σ(β_ζ × covariate))
- **ξ (xi)**: Shape parameter (fixed)

### Risk Metrics
- **Crash Risk**: P(X ≥ 0) = 1 - P(X < 0) = 1 - CDF(0)
- **VaR (Value at Risk)**: The quantile at a specified percentile (90th, 95th, 99th)
- **CVaR (Conditional Value at Risk)**: Expected value of extremes exceeding the VaR threshold

## Component Structure

```
bhev/
├── BHEVModel.tsx      # Main React component with UI and state management
├── types.ts           # TypeScript interfaces and types
├── calculations.ts    # GEV calculation functions (CDF, PDF, quantile, etc.)
└── README.md          # This file
```

### File Responsibilities

- **BHEVModel.tsx**: 
  - Manages component state (parameters, tutorial visibility, etc.)
  - Renders the interactive UI with controls and visualizations
  - Orchestrates data generation and chart rendering

- **types.ts**:
  - Defines all TypeScript interfaces and types used across the component
  - Includes: `Covariate`, `GEVParameters`, `VaRLevel`, `GEVParams`, etc.

- **calculations.ts**:
  - Pure mathematical functions for GEV calculations
  - Functions: `gevCDF`, `gevPDF`, `gevQuantile`, `gevRandom`, `calculateGEVParams`, etc.
  - No React dependencies, can be tested independently

## Key Parameters

### Base Parameters
- **μ₀ (mu0)**: Base location parameter (typically negative, e.g., -3.3)
- **ζ₀ (zeta0)**: Base scale parameter on log scale (e.g., 0.2)
- **ξ (xi)**: Shape parameter (typically negative for bounded distributions, e.g., -0.4)

### Covariates
Each covariate has:
- **value**: Current covariate value
- **β_μ (betaMu)**: Coefficient affecting location parameter μ
- **β_ζ (betaZeta)**: Coefficient affecting scale parameter σ

### Visualization Controls
- **Block Size**: Size of blocks for maxima extraction (seconds)
- **Conflict Density**: Conflicts per minute for simulation
- **VaR Level**: Percentile for Value at Risk (90, 95, or 99)

## How to Modify/Extend

### Adding New Visualizations
1. Create new chart component or add to existing `BHEVModel.tsx`
2. Use `gevData`, `currentParams`, or other computed values
3. Import chart components from `recharts`

### Modifying Calculations
1. Edit functions in `calculations.ts`
2. Functions are pure and well-documented
3. Consider edge cases (e.g., xi ≈ 0 for Gumbel distribution)

### Adding New Parameters
1. Update `GEVParameters` interface in `types.ts`
2. Add state and controls in `BHEVModel.tsx`
3. Update `calculateGEVParams` if needed

### Changing Default Values
- Default parameters are set in `BHEVModel.tsx` initial state
- Modify the `useState<GEVParameters>` initialization

## Mathematical Details

### GEV Distribution

The GEV CDF is:
```
F(x) = exp(-[1 + ξ((x - μ)/σ)]^(-1/ξ))
```

Special case when ξ = 0 (Gumbel):
```
F(x) = exp(-exp(-(x - μ)/σ))
```

### Parameter Calculation
- **μ** = μ₀ + Σ(β_μ × covariate_value)
- **σ** = exp(ζ₀ + Σ(β_ζ × covariate_value))
- **ξ** = fixed value

## Future Enhancements

Potential improvements:
- Export/save parameter configurations
- Compare multiple parameter sets side-by-side
- Add more visualization options (CDF plots, quantile plots)
- Integrate with actual data import functionality
- Add uncertainty quantification (confidence intervals)

## References

- Coles, S. (2001). *An Introduction to Statistical Modeling of Extreme Values*
- Davison, A. C., & Huser, R. (2015). *Statistics of Extremes*
- Bayesian implementation examples using WinBUGS/Stan (see tutorial in component)




