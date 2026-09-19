import type { ApprovedVisualAuthority, ConceptDirectedTwinSession, TwinV2VisualSpec } from './types.js';

export function buildTwinV2VisualSpec(
  session: ConceptDirectedTwinSession,
  approved: ApprovedVisualAuthority,
): TwinV2VisualSpec {
  return {
    specId: `spec-${approved.versionId}`,
    bands: session.blueprintGrammar.informationBands.map((id) => ({
      id,
      role: session.creativeDirection?.sectionRoles[id] ?? id,
      notes: 'Extracted from approved visual authority — implement, do not redesign',
    })),
    textHierarchy: session.creativeDirection?.visualHierarchy ?? [],
    assetSlots: session.creativeDirection?.assetPlan ?? [],
    colors: session.brandContext.colorLanguage,
    shellRelationship: session.blueprintGrammar.shellRelationships,
    navPlacement: session.blueprintGrammar.navBehavior,
  };
}
