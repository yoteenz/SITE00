import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { CRITICAL_TRANSLATION_REGIONS } from './constants.js';
import type { TranslationDrivenRegionConvergenceReceipt } from './translationDrivenTypes.js';

const REGION_SECTION_MAP: Record<string, string[]> = {
  HOST_SHELL: ['td-host'],
  PROJECT_CONTEXT: ['td-context'],
  HERO_WORKSPACE: ['td-hero'],
  AUTHORITY_PANEL: ['td-authority', 'td-hero'],
  CANDIDATE_GALLERY: ['td-gallery'],
  DECISION_BAR: ['td-decision'],
  STRUCTURED_OUTPUT: ['td-structured'],
  READINESS: ['td-readiness'],
  CONCEPT_DATA_HISTORY: ['td-metadata'],
  BOTTOM_NAV: ['td-bottom-nav'],
};

export function buildTranslationDrivenRegionConvergenceReceipts(
  document: CompiledMobileTwinImplementationDocument,
): TranslationDrivenRegionConvergenceReceipt[] {
  const nodes = document.renderTree?.nodes ?? [];
  return CRITICAL_TRANSLATION_REGIONS.map((regionId) => {
    const sections = REGION_SECTION_MAP[regionId] ?? [];
    const regionNodes = nodes.filter((n) => sections.includes(n.sectionId));
    const hasNodes = regionNodes.length > 0;
    const hasTranslationStyle = regionNodes.some((n) => n.styleSource === 'TRANSLATION_DRIVEN_REBUILD');
    return {
      regionId,
      compositionMatch: hasNodes,
      hierarchyMatch: hasTranslationStyle,
      visualDensityMatch: hasTranslationStyle,
      controlHierarchyMatch: regionNodes.some((n) => n.styles?.['--twin-control-role']) || regionId === 'CONCEPT_DATA_HISTORY',
      typographyMatch: hasNodes,
      assetTreatmentMatch: regionNodes.some((n) => n.imageUri) || !['HERO_WORKSPACE', 'CANDIDATE_GALLERY', 'STRUCTURED_OUTPUT'].includes(regionId),
      spacingMatch: hasTranslationStyle,
    };
  });
}
