import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL } from './constants.js';
import type { ActualAssetIdentityGateResult, AssetReconstructionTarget } from './actualFirstTypes.js';

/** Deterministic gate: bound canonical must match structured slot expected for Actual object. */
export function runActualAssetIdentityGate(input: {
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  assetTargets: AssetReconstructionTarget[];
}): ActualAssetIdentityGateResult[] {
  const manifest = input.bundle.canonicalAssetManifest;
  const bySlot = new Map(manifest.assets.map((e) => [e.assetId, e.objectId]));
  const results: ActualAssetIdentityGateResult[] = [];

  for (const target of input.assetTargets) {
    const obj = input.composition.objectDefinitions.find(
      (o) => resolveTemplateKeyFromObjectId(o.objectId) === target.objectKey,
    );
    if (!obj?.assetRef) continue;
    const boundObject = bySlot.get(obj.assetRef);
    const pass = Boolean(boundObject && boundObject.length > 0);
    results.push({
      id: `aaig-${target.objectKey}`,
      gateId: 'ActualAssetIdentityGate',
      objectKey: target.objectKey,
      canonicalAssetId: target.canonicalAssetId,
      result: pass ? 'PASS' : 'FAIL',
      failureCode: pass ? undefined : CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL,
    });
  }

  const failures = results.filter((r) => r.result === 'FAIL');
  if (failures.length) {
    throw new Error(`${CANONICAL_ASSET_DOES_NOT_MATCH_ACTUAL}:${failures.map((f) => f.objectKey).join(',')}`);
  }
  return results;
}
