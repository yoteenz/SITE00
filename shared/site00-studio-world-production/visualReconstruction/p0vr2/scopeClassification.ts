import type { VisualReferenceScope } from '../p0vr1d7/types.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from './constants.js';
import type { DesignViewportClass } from './types.js';

export type ProposedReferenceScopeInput = {
  screenId: string;
  projectId: string;
  route: string;
  viewportClass: DesignViewportClass;
  cropWidth: number;
  cropHeight: number;
  boardWidth?: number;
  boardHeight?: number;
  hasDeviceFrame?: boolean;
  hasGlobalNavigation?: boolean;
  iconSheet?: boolean;
};

export type ProposedReferenceScope = {
  scope: VisualReferenceScope | 'ICON';
  scopeTargetId: string;
  confidence: number;
  rationale: string;
};

function cropCoverage(input: ProposedReferenceScopeInput): number {
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[input.viewportClass];
  const boardW = input.boardWidth ?? viewport.width;
  const boardH = input.boardHeight ?? viewport.height;
  return (input.cropWidth * input.cropHeight) / Math.max(boardW * boardH, 1);
}

/** Browser-safe scope proposal — avoids pulling server-side P0.VR.1D.7 decomposition chain. */
export function proposeReferenceScope(input: ProposedReferenceScopeInput): ProposedReferenceScope {
  if (input.iconSheet) {
    return {
      scope: 'ICON',
      scopeTargetId: `${input.screenId}:icon-set`,
      confidence: 0.95,
      rationale: 'Icon sheet upload detected — icon scope mode.',
    };
  }

  if (input.viewportClass === 'mobile' || input.hasDeviceFrame) {
    return {
      scope: 'FULL_SCREEN_REFERENCE',
      scopeTargetId: input.screenId,
      confidence: 0.9,
      rationale: 'Mobile viewport — independent full-screen authority.',
    };
  }

  const coverage = cropCoverage(input);
  if (coverage >= 0.85 && input.hasGlobalNavigation !== false) {
    return {
      scope: 'FULL_SCREEN_REFERENCE',
      scopeTargetId: input.screenId,
      confidence: 0.88,
      rationale: 'Desktop crop covers viewport with global navigation.',
    };
  }
  if (coverage >= 0.35) {
    return {
      scope: 'WORKSPACE_PANEL_REFERENCE',
      scopeTargetId: `${input.screenId}:panel`,
      confidence: 0.75,
      rationale: 'Partial board crop — workspace panel scope.',
    };
  }
  if (coverage >= 0.12) {
    return {
      scope: 'MODULE_REFERENCE',
      scopeTargetId: `${input.screenId}:module`,
      confidence: 0.7,
      rationale: 'Module-sized crop.',
    };
  }
  return {
    scope: 'ARTWORK_REFERENCE',
    scopeTargetId: `${input.screenId}:artwork`,
    confidence: 0.65,
    rationale: 'Artwork/asset crop.',
  };
}

export function founderScopeOverrideAllowed(): boolean {
  return true;
}
