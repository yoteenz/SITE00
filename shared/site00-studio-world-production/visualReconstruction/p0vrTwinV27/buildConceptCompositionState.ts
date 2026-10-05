import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { buildNdxOverviewVisualObjectCatalog } from '../p0vrTwinV25/ndxOverviewObjectCatalog.js';
import { buildNdxOverviewBlueprintRelationships } from './buildBlueprintRelationships.js';
import type { ConceptCompositionState } from './types.js';

export function buildConceptCompositionState(input: {
  conceptId: string;
  conceptVersionId: string;
  session: ConceptDirectedTwinSession;
}): ConceptCompositionState {
  const cd = input.session.creativeDirection!;
  const catalog = buildNdxOverviewVisualObjectCatalog();
  const relationships = buildNdxOverviewBlueprintRelationships(input.conceptId);
  const now = new Date().toISOString();

  return {
    compositionStateId: `ccs-${input.conceptId}`,
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    projectId: input.session.projectId,
    pageId: input.session.pageId,
    viewport: 'mobile',
    hostBoundary: input.session.brandContext.hostClientFirewall,
    creativeDirection: cd.creativePremise,
    requiredFunctionalRoles: [
      'section_nav',
      'project_progress',
      'key_metrics',
      'current_focus',
      'next_milestone',
      'recent_activity',
      'project_status',
    ],
    compositionObjects: catalog.map((o) => ({
      objectId: o.objectId,
      role: o.role,
      semanticRole: o.semanticRole,
      functionalRole: o.functionBindingTarget,
      assetSlotId: o.assetSlotId,
    })),
    compositionRelationships: relationships.map((r) => ({
      relationshipId: r.relationshipId,
      sourceObjectId: r.sourceObjectId,
      targetObjectId: r.targetObjectId,
      type: r.type,
    })),
    typographyIntent: input.session.brandContext.typographicGrammar.join('; '),
    colorIntent: input.session.brandContext.colorLanguage.join(', '),
    surfaceIntent: 'white client bands + black hero + lime accents',
    assetIntent: catalog.filter((o) => o.assetSlotId).map((o) => `${o.objectId}:${o.assetSlotId}`),
    interactionIntent: catalog
      .filter((o) => o.interactionRole || o.functionBindingTarget)
      .map((o) => `${o.objectId}→${o.functionBindingTarget ?? o.interactionRole}`),
    responsiveIntent: ['375px mobile artboard', 'host top inset 0.07'],
    createdAt: now,
    status: 'DRAFT',
  };
}
