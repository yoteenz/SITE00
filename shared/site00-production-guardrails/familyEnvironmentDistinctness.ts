import type { BlockedReason, GenerationRequest } from './types.js';

/** F03 and F03_TODAY are the same family. */
export function familyKey(id: string): string {
  const match = id.toUpperCase().match(/F\d+/);
  return match ? match[0] : id.trim().toUpperCase();
}

export type PlateReuseCheck =
  | { status: 'PASS' }
  | { status: 'BLOCKED'; blockedReason: Extract<BlockedReason, 'CROSS_FAMILY_PLATE_REUSE_UNJUSTIFIED'> };

/**
 * Default is a new plate. A cross-family plate may ship only with a written reason.
 * World-reference image2image is not plate reuse and does not set sourcePlateFamilyId.
 */
export function validateCrossFamilyPlateReuse(request: GenerationRequest): PlateReuseCheck {
  if (request.generationClass !== 'ENVIRONMENT_PLATE') return { status: 'PASS' };
  const source = request.sourcePlateFamilyId?.trim();
  if (!source) return { status: 'PASS' };
  if (familyKey(source) === familyKey(request.familyId)) return { status: 'PASS' };
  const reason = request.crossFamilyReuseJustification?.trim() ?? '';
  if (reason.length < 12) return { status: 'BLOCKED', blockedReason: 'CROSS_FAMILY_PLATE_REUSE_UNJUSTIFIED' };
  return { status: 'PASS' };
}
