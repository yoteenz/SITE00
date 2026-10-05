/**
 * P0.VR.4 — Design reconstruction principles (seed + learned corrections).
 */

export const DESIGN_RECONSTRUCTION_PRINCIPLES = [
  'REFERENCE = DESIGN AUTHORITY',
  'ISOLATE OBJECT, DO NOT REDESIGN',
  'NO UNREQUESTED BACKGROUND',
  'NO UNREQUESTED TEXT',
  'PRESERVE MATERIAL',
  'PRESERVE ORIENTATION',
  'PRESERVE PROPORTIONS',
  'USE REAL ASSET FOR IMAGE-LIKE OBJECT',
  'VERIFY ON LIVE PAGE',
] as const;

export type DesignReconstructionPrinciple = (typeof DESIGN_RECONSTRUCTION_PRINCIPLES)[number];

const learnedCorrections: string[] = [];

export function recordFounderCorrection(correction: string): void {
  const normalized = correction.trim().toUpperCase();
  if (!normalized || learnedCorrections.includes(normalized)) return;
  learnedCorrections.push(normalized);
}

export function listLearnedCorrections(): readonly string[] {
  return learnedCorrections;
}

export function abstractCorrectionToPrinciple(correction: string): string | null {
  const c = correction.toUpperCase();
  if (c.includes('NO BACKGROUND') || c.includes('DO NOT ADD A BACKGROUND')) {
    return 'NO UNREQUESTED BACKGROUND';
  }
  if (c.includes('ORIENTATION')) return 'PRESERVE ORIENTATION';
  if (c.includes('CHROME') || c.includes('GLASS') || c.includes('GLOW')) return 'PRESERVE MATERIAL';
  if (c.includes('REDESIGN')) return 'ISOLATE OBJECT, DO NOT REDESIGN';
  return null;
}

/** Anti-overfit: do not generalize page-specific assets into global rules. */
export function isOverfitCorrection(correction: string): boolean {
  const c = correction.toUpperCase();
  return (
    c.includes('ALWAYS USE RED PLANET') ||
    c.includes('ALWAYS USE CHROME RING') ||
    c.includes('ALWAYS USE NDXBOOK')
  );
}

export function applyCorrectionLearning(correction: string): void {
  if (isOverfitCorrection(correction)) return;
  recordFounderCorrection(correction);
}
