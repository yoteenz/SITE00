import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { MINIMAL_TWIN_REQUIRED_OBJECT_IDS } from './constants.js';
import type { MinimalTwinGenerationState } from './types.js';

export function buildMinimalTwinGenerationState(input: {
  conceptId: string;
  conceptVersionId: string;
  session: ConceptDirectedTwinSession;
}): MinimalTwinGenerationState {
  const objectIds = [...MINIMAL_TWIN_REQUIRED_OBJECT_IDS];
  const assetIntents = [
    { objectId: 'hero.primaryAsset', assetSlotId: 'slot-hero.primaryAsset', intent: 'GENERATED_COMPLEX_MEDIA' },
    { objectId: 'hero.ndxOverlay', assetSlotId: 'slot-hero.ndxOverlay', intent: 'GENERATED_TRANSPARENT_ASSET' },
    { objectId: 'hero.decorativeGraphic', assetSlotId: 'slot-hero.decorativeGraphic', intent: 'GENERATED_TRANSPARENT_ASSET' },
    { objectId: 'masthead.projectMark', assetSlotId: 'slot-masthead.projectMark', intent: 'GENERATED_TRANSPARENT_ASSET' },
  ];

  return {
    compositionStateId: `mts-${input.conceptId}`,
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    viewport: 'mobile',
    brandContext: input.session.brandContext,
    requiredObjects: objectIds,
    creativeFreedom:
      'Exact band structure and object placement are locked by objectIds; visual styling may vary within NDXBOOK brand.',
    hostBoundary: input.session.brandContext.hostClientFirewall,
    objectIds,
    assetIntents,
    status: 'READY',
  };
}
