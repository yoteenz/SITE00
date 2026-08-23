/**
 * Dimension-specific reference authority rules.
 */

import type { SurfaceVisualAuthorityEntry } from './surfaceVisualAuthority.js';

export function negativeReferenceHasZeroStyleAuthority(entry: SurfaceVisualAuthorityEntry): boolean {
  if (entry.role !== 'NEGATIVE_REFERENCE') return true;
  const styleDims = ['STYLE', 'COLOR', 'TYPOGRAPHY', 'MATERIAL', 'SPATIAL_ATMOSPHERE'] as const;
  for (const dim of styleDims) {
    const level = entry.dimensionAuthority[dim];
    if (level && level !== 'NEGATIVE_ONLY' && level !== 'NONE') {
      return false;
    }
  }
  return true;
}

export function structuralReferenceHasZeroStyleAuthority(entry: SurfaceVisualAuthorityEntry): boolean {
  if (entry.role !== 'STRUCTURAL_REFERENCE') return true;
  const styleDims = ['STYLE', 'COLOR', 'TYPOGRAPHY', 'MATERIAL'] as const;
  for (const dim of styleDims) {
    const level = entry.dimensionAuthority[dim];
    if (level === 'STRICT' || level === 'STRONG' || level === 'MODERATE') {
      return false;
    }
  }
  return true;
}

export function rejectedDarkProofCannotInfluencePalette(entry: SurfaceVisualAuthorityEntry): boolean {
  if (entry.role !== 'NEGATIVE_REFERENCE') return true;
  const blocked = ['dark background', 'black command center', 'cyberpunk', 'gaming hud'];
  return entry.doNotInherit.some((t) => blocked.some((b) => t.toLowerCase().includes(b.split(' ')[0]!)));
}

export function referenceSelectedByRole(
  entries: SurfaceVisualAuthorityEntry[],
  role: SurfaceVisualAuthorityEntry['role'],
): SurfaceVisualAuthorityEntry[] {
  return entries.filter((e) => e.role === role);
}
