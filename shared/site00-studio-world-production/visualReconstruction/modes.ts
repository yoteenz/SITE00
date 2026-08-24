/**
 * Reconstruction modes — REPRODUCE required; others architecture-only.
 */

import type { VisualReconstructionMode } from './types.js';

export const IMPLEMENTED_MODES: VisualReconstructionMode[] = ['REPRODUCE'];

export const PREPARED_MODES: VisualReconstructionMode[] = ['TRANSLATE', 'EXTRACT', 'MERGE', 'AUDIT'];

export function isModeImplemented(mode: VisualReconstructionMode): boolean {
  return IMPLEMENTED_MODES.includes(mode);
}

export function modeDescription(mode: VisualReconstructionMode): string {
  switch (mode) {
    case 'REPRODUCE':
      return 'Recreate reference faithfully using repository truth for content.';
    case 'TRANSLATE':
      return 'Preserve structural grammar while applying target brand (prepared).';
    case 'EXTRACT':
      return 'Reverse-engineer layout without copying brand identity (prepared).';
    case 'MERGE':
      return 'Combine structural elements from multiple references (prepared).';
    case 'AUDIT':
      return 'Compare implementation against locked baseline (prepared).';
    default:
      return mode;
  }
}
