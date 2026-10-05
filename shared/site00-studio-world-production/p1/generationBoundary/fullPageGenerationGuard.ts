/**
 * Blocks full-page image generation when Composer owns the interface.
 */

import type { SurfaceGenerationMode } from './surfaceGenerationMode.js';

export const FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE =
  'FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE';

export function fullPageGenerationAllowed(mode: SurfaceGenerationMode): boolean {
  return mode === 'VISUAL_PROOF';
}

export function assertFullPageGenerationAllowed(mode: SurfaceGenerationMode): void {
  if (mode === 'COMPOSED_INTERFACE') {
    throw new Error(FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE);
  }
  if (mode === 'WORLD') {
    throw new Error('WORLD_FORMATION_NOT_IMPLEMENTED');
  }
}
