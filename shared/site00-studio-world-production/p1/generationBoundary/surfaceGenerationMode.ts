/**
 * SurfaceGenerationMode — who owns interface design vs asset generation.
 */

import type { SurfaceDesignProof } from '../../../site00-brand-lore/experienceExpression/designProofTypes.js';

export const SURFACE_GENERATION_MODES = [
  'COMPOSED_INTERFACE',
  'VISUAL_PROOF',
  'ENVIRONMENT',
  'ASSET',
  'WORLD',
] as const;

export type SurfaceGenerationMode = (typeof SURFACE_GENERATION_MODES)[number];

export type ControlledSurfaceId = SurfaceDesignProof['proofId'];

export type SurfaceClassificationInput = {
  proofId: ControlledSurfaceId;
  hasHostVisualAuthority: boolean;
  visualDirectionUnresolved: boolean;
  explicitEnvironmentPlate?: boolean;
  assetOnlyGeneration?: boolean;
};

/** Deterministic classification — not route-name heuristics alone. */
export function classifySurfaceGenerationMode(input: SurfaceClassificationInput): SurfaceGenerationMode {
  if (input.assetOnlyGeneration) return 'ASSET';
  if (input.explicitEnvironmentPlate) return 'ENVIRONMENT';

  if (input.proofId === 'SITE00_PROJECTS_INDEX') {
    return 'COMPOSED_INTERFACE';
  }

  if (input.proofId === 'NDXBOOK_PROJECT_HOME') {
    return input.visualDirectionUnresolved ? 'VISUAL_PROOF' : 'COMPOSED_INTERFACE';
  }

  return 'VISUAL_PROOF';
}

export function assertWorldFormationBlocked(mode: SurfaceGenerationMode): void {
  if (mode === 'WORLD') {
    throw new Error('WORLD_FORMATION_NOT_IMPLEMENTED');
  }
}

export function generationModeOwner(mode: SurfaceGenerationMode): string {
  switch (mode) {
    case 'COMPOSED_INTERFACE':
      return 'COMPOSER';
    case 'VISUAL_PROOF':
      return 'VISUAL_DEVELOPMENT';
    case 'ENVIRONMENT':
    case 'ASSET':
      return 'IMAGE_PROVIDER';
    case 'WORLD':
      return 'WORLD_FORMATION_BLOCKED';
    default:
      return 'UNKNOWN';
  }
}

export function imageModelResponsibility(mode: SurfaceGenerationMode): 'ASSET_ONLY' | 'FULL_FRAME' | 'ENVIRONMENT' | 'BLOCKED' {
  switch (mode) {
    case 'COMPOSED_INTERFACE':
      return 'ASSET_ONLY';
    case 'VISUAL_PROOF':
      return 'FULL_FRAME';
    case 'ENVIRONMENT':
      return 'ENVIRONMENT';
    case 'ASSET':
      return 'ASSET_ONLY';
    case 'WORLD':
      return 'BLOCKED';
    default:
      return 'BLOCKED';
  }
}
