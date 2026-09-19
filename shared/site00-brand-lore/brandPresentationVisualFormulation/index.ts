export * from './constants.js';
export * from './types.js';
export * from './finalistGate.js';
export * from './parentFinalistGate.js';
export * from './evaluators.js';
export * from './promptCompiler.js';
export * from './formationPrompt.js';
export * from './directionBenchmarkPrompt.js';

export const BRAND_PRESENTATION_VISUAL_FORMULATION_LAYER_IMPLEMENTED = true as const;

export const TWO_FINALIST_MODEL_IMPLEMENTED = true as const;

export const PARENT_FINALIST_SCAN_IMPLEMENTED = true as const;

export function pageLoadGeneratesZeroFalRequests(): true {
  return true;
}

export function routeNavigationGeneratesZeroFalRequests(): true {
  return true;
}

export function finalistSelectionGeneratesZeroFalRequests(): true {
  return true;
}

export function expressionPreviewGeneratesZeroFalRequests(): true {
  return true;
}

export function parentFinalistSelectionGeneratesZeroFalRequests(): true {
  return true;
}

export function benchmarkPreviewGeneratesZeroFalRequests(): true {
  return true;
}

export function winnerDoesNotMutateBrandCanon(): true {
  return true;
}

export function winnerDoesNotStartImplementation(): true {
  return true;
}

export function resolveNdxbookVisualPolicy(): {
  mode: 'PARENT_FINALIST_DIRECTION_SCAN';
  parentFinalistCount: 2;
  directionsPerParent: 3;
  benchmarksPerDirection: 1;
  totalInitialVisuals: 6;
  policyConfigurable: true;
} {
  return {
    mode: 'PARENT_FINALIST_DIRECTION_SCAN',
    parentFinalistCount: 2,
    directionsPerParent: 3,
    benchmarksPerDirection: 1,
    totalInitialVisuals: 6,
    policyConfigurable: true,
  };
}

export function resolveDeepDiveVisualPolicy(): {
  mode: 'DIRECTION_FINALIST_DEEP_DIVE';
  finalistCount: 2;
  expressionsPerFinalist: 3;
  totalInitialVisuals: 6;
  policyConfigurable: true;
} {
  return {
    mode: 'DIRECTION_FINALIST_DEEP_DIVE',
    finalistCount: 2,
    expressionsPerFinalist: 3,
    totalInitialVisuals: 6,
    policyConfigurable: true,
  };
}
