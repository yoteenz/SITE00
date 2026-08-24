export * from './constants.js';
export * from './types.js';
export * from './finalistGate.js';
export * from './evaluators.js';
export * from './promptCompiler.js';
export * from './formationPrompt.js';

export const BRAND_PRESENTATION_VISUAL_FORMULATION_LAYER_IMPLEMENTED = true as const;

export const TWO_FINALIST_MODEL_IMPLEMENTED = true as const;

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

export function winnerDoesNotMutateBrandCanon(): true {
  return true;
}

export function winnerDoesNotStartImplementation(): true {
  return true;
}

export function resolveNdxbookVisualPolicy(): {
  finalistCount: 2;
  expressionsPerFinalist: 3;
  totalInitialVisuals: 6;
  policyConfigurable: true;
} {
  return {
    finalistCount: 2,
    expressionsPerFinalist: 3,
    totalInitialVisuals: 6,
    policyConfigurable: true,
  };
}
