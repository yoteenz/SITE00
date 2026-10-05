import type { ImplementationTranslationBrief } from './implementationTranslationBriefTypes.js';
import type { ImplementationTranslationReadinessReceipt } from './implementationTranslationBriefTypes.js';
import { CRITICAL_TRANSLATION_SECTIONS } from './constants.js';

export function evaluateImplementationTranslationReadiness(
  brief: ImplementationTranslationBrief,
): ImplementationTranslationReadinessReceipt {
  const blockers: string[] = [];
  const sectionIds = new Set(brief.sectionTranslations.map((s) => s.sectionId));

  for (const id of CRITICAL_TRANSLATION_SECTIONS) {
    if (id === 'TYPOGRAPHY' || id === 'COLOR_MATERIAL' || id === 'ASSET' || id === 'CONTROL_HIERARCHY' || id === 'INTERACTION' || id === 'RESPONSIVE' || id === 'DO_NOT_DO') {
      continue;
    }
    if (!sectionIds.has(id) && id !== 'GLOBAL_PAGE_CHARACTER') {
      blockers.push(`MISSING_SECTION:${id}`);
    }
  }

  if (!brief.globalTranslation?.trim()) blockers.push('MISSING_GLOBAL_TRANSLATION');
  if (!brief.typographyTranslation?.trim()) blockers.push('MISSING_TYPOGRAPHY_DIRECTIVE');
  if (!brief.colorMaterialTranslation?.trim()) blockers.push('MISSING_MATERIAL_DIRECTIVE');
  if (!brief.assetTranslation?.trim()) blockers.push('MISSING_ASSET_DIRECTIVE');
  if (!brief.controlTranslation?.trim()) blockers.push('MISSING_CONTROL_DIRECTIVE');
  if (!brief.responsiveTranslation?.trim()) blockers.push('MISSING_RESPONSIVE_DIRECTIVE');
  if (!brief.doNotDo?.trim()) blockers.push('MISSING_DO_NOT_DO');

  const criticalRegionsHaveEvidence = brief.sectionTranslations.every(
    (s) => s.evidence.structuredObjectIds.length > 0 || s.evidence.actualRegionIds.length > 0,
  );
  if (!criticalRegionsHaveEvidence) blockers.push('CRITICAL_REGION_EVIDENCE_GAP');

  const unresolvedCritical = brief.translationConflicts.filter((c) => c.resolution === 'UNRESOLVED').length;
  if (unresolvedCritical > 0) blockers.push(`UNRESOLVED_CONFLICTS:${unresolvedCritical}`);

  if (brief.status === 'BLOCKED') blockers.push('BRIEF_STATUS_BLOCKED');

  let status: ImplementationTranslationReadinessReceipt['status'] = 'READY';
  if (blockers.some((b) => b.startsWith('BRIEF_STATUS_BLOCKED') || b.startsWith('UNRESOLVED'))) {
    status = 'BLOCKED';
  } else if (blockers.length) {
    status = 'REVIEW_REQUIRED';
  }

  return {
    id: `itrr-${brief.id}`,
    translationBriefId: brief.id,
    criticalSectionsTranslated: sectionIds.size >= 10,
    criticalRegionsHaveEvidence,
    typographyDirectivePresent: Boolean(brief.typographyTranslation?.trim()),
    materialDirectivePresent: Boolean(brief.colorMaterialTranslation?.trim()),
    assetDirectivePresent: Boolean(brief.assetTranslation?.trim()),
    controlHierarchyPresent: Boolean(brief.controlTranslation?.trim()),
    responsiveDirectivePresent: Boolean(brief.responsiveTranslation?.trim()),
    doNotDoPresent: Boolean(brief.doNotDo?.trim()),
    unresolvedCriticalConflicts: unresolvedCritical,
    status,
    blockers,
  };
}

export function assertTranslationReadinessForCompile(receipt: ImplementationTranslationReadinessReceipt): void {
  if (receipt.status === 'BLOCKED') {
    throw new Error(`IMPLEMENTATION_TRANSLATION_READINESS_BLOCKED:${receipt.blockers.join(',')}`);
  }
}
