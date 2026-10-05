/**
 * Reconstruction modes — REPRODUCE required; others architecture-only.
 */

import type { VisualReconstructionMode } from './types.js';

export const IMPLEMENTED_MODES: VisualReconstructionMode[] = ['REPRODUCE', 'CALIBRATE', 'WEBSITE_RECONSTRUCTION'];

export const PREPARED_MODES: VisualReconstructionMode[] = ['TRANSLATE', 'EXTRACT', 'MERGE', 'AUDIT'];

export type WebsiteVisualWorkflowMode = 'WEBSITE_RECONSTRUCTION' | 'WEBSITE_DESIGN_GENERATION';

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
    case 'CALIBRATE':
      return 'Compare founder-approved references against current implementation and tune evaluation.';
    case 'WEBSITE_RECONSTRUCTION':
      return 'Screenshot-first coded reconstruction — reference image is primary visual authority.';
    default:
      return mode;
  }
}
