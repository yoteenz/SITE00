import type { PageViewportAuthorityFamily } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';

/** Clear downstream viewport-family approval when mobile authority is regenerated. */
export function invalidateApprovalIfNeeded(family: PageViewportAuthorityFamily): PageViewportAuthorityFamily {
  if (!family.viewportFamilyApprovalId && !family.familyLockId && !family.tabletArtifactId && !family.desktopArtifactId) {
    return {
      ...family,
      tabletInterpretationId: null,
      tabletArtifactId: null,
      tabletVersion: null,
      desktopInterpretationId: null,
      desktopArtifactId: null,
      desktopVersion: null,
      experienceExpressionContractId: null,
      experienceExpressionVersion: null,
      status: family.selectedMobileConceptId ? 'MOBILE_SELECTED' : family.status,
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    ...family,
    viewportFamilyApprovalId: null,
    familyLockId: null,
    tabletInterpretationId: null,
    tabletArtifactId: null,
    tabletVersion: null,
    desktopInterpretationId: null,
    desktopArtifactId: null,
    desktopVersion: null,
    experienceExpressionContractId: null,
    experienceExpressionVersion: null,
    status: family.selectedMobileConceptId ? 'MOBILE_SELECTED' : 'MOBILE_SELECTED',
    updatedAt: new Date().toISOString(),
  };
}
