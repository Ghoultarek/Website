# BHEV Model Tutorial Page

## Overview

This page provides an interactive tutorial for the Bayesian Hierarchical Extreme Value (BHEV) model, demonstrating how Generalized Extreme Value (GEV) distributions are used in traffic safety analysis.

## Page Structure

This is a Next.js page component that wraps the BHEV model component with appropriate layout and styling.

## Route

The page is accessible at: `/tools/technique-tutorials/bhev`

## User-Facing Content

### What Users Will Learn

1. **Block Maxima Approach**: How extreme value analysis works by extracting maxima from time blocks
2. **Negated Extremes**: Why we use -TTC (negative Time-To-Collision) for modeling traffic conflicts
3. **GEV Distribution**: Understanding the three parameters (location μ, scale σ, shape ξ) and how covariates affect them
4. **Risk Metrics**: 
   - Crash Risk: Probability of crash occurrence
   - VaR: Value at Risk at different percentiles
   - CVaR: Conditional Value at Risk (Expected Shortfall)

### Interactive Features

- **Parameter Controls**: Sliders and inputs to adjust GEV parameters in real-time
- **Covariate Management**: Add/remove covariates and adjust their effects
- **Block Maxima Visualization**: Interactive chart showing how block size affects maxima selection
- **PDF Plots**: Multiple visualizations showing:
  - Crash risk region (shaded area)
  - VaR levels at different percentiles
  - Risk comparison across metrics
- **Tutorial Section**: Expandable/collapsible educational content with code examples

### Educational Value

The tutorial includes:
- Theoretical background on extreme value analysis
- Visual demonstrations of block maxima extraction
- Bayesian implementation examples (Stan code)
- Real-time feedback as parameters change

## Technical Details

### Component Location

The actual BHEV model component is located at:
```
components/technique-tutorials/bhev/BHEVModel.tsx
```

### Page Component

This page (`page.tsx`) is a thin wrapper that:
- Provides page layout and container
- Imports and renders the BHEVModel component
- Handles Next.js routing

### Integration with Tools Page

This page is linked from the main Tools page (`/tools`) which shows:
- Overview of technique tutorials
- Card-based navigation to individual tutorials
- Room for future tutorial additions

## Context for Future Changes

### Adding More Tutorials

When adding new technique tutorials:
1. Create a new folder under `app/tools/technique-tutorials/` (e.g., `yolo/`)
2. Follow the same pattern: create `page.tsx` and `README.md`
3. Create corresponding component in `components/technique-tutorials/`
4. Add a card to the main Tools page

### Modifying This Tutorial

- **Content Changes**: Edit the tutorial text directly in `BHEVModel.tsx`
- **Layout Changes**: Modify this `page.tsx` file
- **Functionality Changes**: See `components/technique-tutorials/bhev/README.md` for component details

### Maintaining Context

This README and the component-level README work together to:
- Document the purpose and structure
- Explain key concepts for future developers
- Provide guidance for modifications
- Preserve domain knowledge about BHEV modeling

## Related Files

- Component: `components/technique-tutorials/bhev/BHEVModel.tsx`
- Component Types: `components/technique-tutorials/bhev/types.ts`
- Calculations: `components/technique-tutorials/bhev/calculations.ts`
- Parent Page: `app/tools/page.tsx`
- Component README: `components/technique-tutorials/bhev/README.md`




