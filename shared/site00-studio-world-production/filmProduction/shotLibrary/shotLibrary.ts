/**
 * P0.FILM.1 — Brand shot library (generic).
 */

import type { BrandShotLibrary, ShotLibraryEntry, ShotRiskLevel } from '../types.js';

export function buildShotLibraryEntry(params: Partial<ShotLibraryEntry> & { shotId: string; shotClass: string; name: string; purpose: string }): ShotLibraryEntry {
  return {
    shotId: params.shotId,
    shotClass: params.shotClass,
    name: params.name,
    purpose: params.purpose,
    recommendedDuration: params.recommendedDuration ?? { min: 2, max: 6 },
    cameraPosition: params.cameraPosition ?? 'observational medium',
    cameraMovement: params.cameraMovement ?? 'static or subtle handheld',
    lensCharacter: params.lensCharacter ?? 'naturalistic 35mm',
    subjectProminence: params.subjectProminence ?? 'medium',
    environmentProminence: params.environmentProminence ?? 'high',
    performanceBehavior: params.performanceBehavior ?? 'react before explain',
    propCompatibility: params.propCompatibility ?? [],
    modelRiskProfile: params.modelRiskProfile ?? 'MEDIUM',
    preferredProviderEvidence: params.preferredProviderEvidence ?? [],
    continuityRequirements: params.continuityRequirements ?? [],
    negativeConstraints: params.negativeConstraints ?? [],
    referenceExamples: params.referenceExamples ?? [],
    founderApprovalState: params.founderApprovalState ?? 'APPROVED',
    approvalFrequency: params.approvalFrequency ?? 0,
    rejectionFrequency: params.rejectionFrequency ?? 0,
  };
}

export function buildBrandShotLibrary(brandId: string, shots: ShotLibraryEntry[]): BrandShotLibrary {
  return { brandId, shots };
}

export function resolveShotClass(library: BrandShotLibrary, shotClass: string): ShotLibraryEntry | null {
  return library.shots.find((s) => s.shotClass === shotClass || s.shotId === shotClass) ?? null;
}

export function recordShotApproval(library: BrandShotLibrary, shotId: string): BrandShotLibrary {
  return {
    ...library,
    shots: library.shots.map((s) =>
      s.shotId === shotId ? { ...s, approvalFrequency: s.approvalFrequency + 1 } : s,
    ),
  };
}

export function recordShotRejection(library: BrandShotLibrary, shotId: string): BrandShotLibrary {
  return {
    ...library,
    shots: library.shots.map((s) =>
      s.shotId === shotId ? { ...s, rejectionFrequency: s.rejectionFrequency + 1 } : s,
    ),
  };
}

/** Do not mutate canon from single approval */
export function shotLibraryRequiresEvidenceForPromotion(approvalCount: number): boolean {
  return approvalCount >= 3;
}

export function shotRiskFromClass(shotClass: string): ShotRiskLevel {
  const highRisk = ['MIRROR_CAUGHT', 'PHONE_TO_LAPTOP_ESCALATION', 'WALK_AND_TALK', 'LUXURY_CAR_MIRROR'];
  const stress = ['MIRROR_CAUGHT', 'RABBIT_HOLE_MONTAGE'];
  if (stress.includes(shotClass)) return 'STRESS_TEST';
  if (highRisk.includes(shotClass)) return 'HIGH';
  const medium = ['TABLE_LEVEL_LIVED_IN', 'LIME_ARTIFACT_INSERT', 'MICRO_REACTION', 'DOUBLE_TAKE'];
  if (medium.includes(shotClass)) return 'MEDIUM';
  return 'LOW';
}
