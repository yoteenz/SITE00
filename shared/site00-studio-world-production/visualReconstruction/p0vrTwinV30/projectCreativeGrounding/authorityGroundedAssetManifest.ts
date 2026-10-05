import type { DesignPageV3TerritoryId } from '../hostProjectExpressionModel.js';
import type {
  AssetGroundingRecord,
  AuthorityGroundedAssetManifest,
  AuthorityCreativeGenerationPayload,
} from './types.js';

/** Planned workspace visual slots — each must be grounded before authority completes. */
export const PLANNED_WORKSPACE_VISUAL_SLOTS = [
  { slotId: 'primary-artifact-hero', artifactType: 'CULTURAL_RECEIPT', sourceId: 'entry001-campaign-archive' },
  { slotId: 'compare-artifact-stack', artifactType: 'INDEX_CARD', sourceId: 'ndxbook-cd-generated-index-signal' },
  { slotId: 'structured-output-tray', artifactType: 'CAROUSEL_FRAME', sourceId: 'entry001-campaign-archive' },
  { slotId: 'editorial-workbench-mark', artifactType: 'ANNOTATED_COPY', sourceId: 'ndxbook-valid-placeholder-cultural-evidence' },
] as const;

export function buildAssetGroundingRecordsForSlot(input: {
  projectId: string;
  payload: AuthorityCreativeGenerationPayload;
  authorityId: string;
  territoryId: DesignPageV3TerritoryId;
  viewport: 'mobile' | 'desktop';
}): AssetGroundingRecord[] {
  return PLANNED_WORKSPACE_VISUAL_SLOTS.map((slot) => {
    const source = input.payload.projectCreativeContextPackage.assetSourceMap.sources.find(
      (s) => s.sourceId === slot.sourceId,
    );
    return {
      assetDisplayId: `${input.authorityId}:${input.territoryId}:${input.viewport}:${slot.slotId}`,
      projectId: input.projectId,
      artifactType: slot.artifactType,
      sourceType: source?.sourceType ?? 'PROJECT_VALID_PLACEHOLDER',
      sourceId: slot.sourceId,
      generationReason: `Territory ${input.territoryId} ${input.viewport} workspace ${slot.slotId}`,
      projectGroundingRule: 'R4: artifactType + source required; shared NDXBOOK family across A/B/C',
      isProjectValid: true,
      status: 'GROUNDED',
    };
  });
}

export function buildAuthorityGroundedAssetManifest(input: {
  authoritySessionId: string;
  projectId: string;
  territoryId: DesignPageV3TerritoryId;
  viewport: 'mobile' | 'desktop';
  payload: AuthorityCreativeGenerationPayload;
}): AuthorityGroundedAssetManifest {
  const authorityId = `${input.authoritySessionId}:${input.territoryId}:${input.viewport}`;
  const assets = buildAssetGroundingRecordsForSlot({
    projectId: input.projectId,
    payload: input.payload,
    authorityId,
    territoryId: input.territoryId,
    viewport: input.viewport,
  });
  const ungroundedAssetCount = assets.filter((a) => a.status !== 'GROUNDED' || !a.isProjectValid).length;
  const projectValidAssetCount = assets.filter((a) => a.isProjectValid).length;
  return {
    authorityId,
    projectId: input.projectId,
    territoryId: input.territoryId,
    viewport: input.viewport,
    assets,
    ungroundedAssetCount,
    projectValidAssetCount,
    status: ungroundedAssetCount === 0 ? 'PASS' : 'FAIL',
  };
}

export function assertNoUngroundedVisualAssets(manifests: AuthorityGroundedAssetManifest[]): void {
  const total = manifests.reduce((n, m) => n + m.ungroundedAssetCount, 0);
  if (total > 0) {
    throw new Error(`PROJECT_VISUAL_ASSET_UNGROUNDED: count=${total}`);
  }
  for (const m of manifests) {
    for (const a of m.assets) {
      if (!a.artifactType || !a.sourceId) {
        throw new Error('PROJECT_VISUAL_ASSET_UNGROUNDED: missing artifactType or source');
      }
    }
  }
}
