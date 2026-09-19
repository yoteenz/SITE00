import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { buildNdxOverviewVisualObjectCatalog } from '../p0vrTwinV25/ndxOverviewObjectCatalog.js';
import { buildAssetGenerationContractSet } from './buildAssetGenerationContractSet.js';
import { buildConceptCompositionState } from './buildConceptCompositionState.js';
import { buildSurgicalBlueprintTwin } from './buildSurgicalBlueprintTwin.js';
import type { AuthorityVisualRecord, ParallelTwinGenerationBundle } from './types.js';

export const PARALLEL_TWIN_PIPELINE_CALL_ORDER = [
  'PAGE_INTENT',
  'FUNCTION_REQUIREMENTS',
  'BRAND_WORLD_CONTEXT',
  'CREATIVE_DIRECTION',
  'ConceptCompositionState',
  'PARALLEL_AuthorityVisual',
  'PARALLEL_SurgicalBlueprintTwin',
  'PARALLEL_AssetGenerationContracts',
  'STANDALONE_ASSET_GENERATION',
  'THREE_WAY_RECONCILIATION',
  'FOUNDER_REVIEW',
  'APPROVED_TWIN_BUNDLE',
  'BlueprintToCodeCompiler',
  'CANONICAL_ASSET_INSERTION',
  'FUNCTION_BINDING',
  'RENDER',
  'FIDELITY_QA',
  'FOUNDER_APPROVAL',
] as const;

export function runParallelTwinGenerationFromCompositionState(input: {
  conceptId: string;
  conceptVersionId: string;
  session: ConceptDirectedTwinSession;
}): ParallelTwinGenerationBundle {
  const compositionState = buildConceptCompositionState(input);
  compositionState.status = 'PARALLEL_READY';

  const surgicalBlueprintTwin = buildSurgicalBlueprintTwin({ compositionState });
  if (surgicalBlueprintTwin.compositionStateId !== compositionState.compositionStateId) {
    throw new Error('TWIN_V27: blueprint twin compositionStateId mismatch');
  }

  const catalog = buildNdxOverviewVisualObjectCatalog();
  const assetGenerationContractSet = buildAssetGenerationContractSet({
    compositionState,
    assetObjects: catalog,
  });

  const now = new Date().toISOString();
  const authorityVisual: AuthorityVisualRecord = {
    authorityVisualId: `av-${input.conceptId}`,
    compositionStateId: compositionState.compositionStateId,
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    imageUrl: null,
    status: 'PLANNED',
    createdAt: now,
  };

  return {
    compositionState,
    authorityVisual,
    surgicalBlueprintTwin,
    assetGenerationContractSet,
  };
}

export function assertSharedCompositionLineage(bundle: ParallelTwinGenerationBundle): void {
  const id = bundle.compositionState.compositionStateId;
  if (bundle.surgicalBlueprintTwin.compositionStateId !== id) {
    throw new Error('TWIN_V27: surgical blueprint missing shared compositionStateId');
  }
  if (bundle.authorityVisual.compositionStateId !== id) {
    throw new Error('TWIN_V27: authority visual missing shared compositionStateId');
  }
  if (bundle.assetGenerationContractSet.compositionStateId !== id) {
    throw new Error('TWIN_V27: asset contracts missing shared compositionStateId');
  }
  const objectIds = new Set(bundle.compositionState.compositionObjects.map((o) => o.objectId));
  for (const o of bundle.surgicalBlueprintTwin.objects) {
    if (!objectIds.has(o.objectId)) {
      throw new Error(`TWIN_V27: surgical object ${o.objectId} not in composition state`);
    }
  }
}
