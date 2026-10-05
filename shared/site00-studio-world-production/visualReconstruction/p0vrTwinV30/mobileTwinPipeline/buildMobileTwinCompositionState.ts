import { DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1 } from '../designWorkspaceFeatureAuthority/featureDefinitionsV1.js';
import { NDXBOOK_AUTHORITY_OBJECT_TEMPLATE } from '../designWorkspaceDerivation/pixelGroundedLayoutTemplates.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../constants.js';
import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function buildMobileTwinCompositionState(input: {
  runId: string;
  reference: MobileDesignReferenceAuthority;
  widthPx?: number;
  heightPx?: number;
}): MobileTwinCompositionState {
  const width = input.widthPx ?? FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx;
  const height = input.heightPx ?? FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx;
  const parentIdByKey = new Map<string, string>();
  const objectDefinitions: MobileTwinCompositionState['objectDefinitions'] = [];

  for (const t of NDXBOOK_AUTHORITY_OBJECT_TEMPLATE) {
    if (t.viewportMask && t.viewportMask !== 'MOBILE') continue;
    const objectId = `mobile-${t.key}`;
    const x = Math.round(t.nx * width);
    const y = Math.round(t.ny * height);
    const w = Math.max(2, Math.round(t.nw * width));
    const h = Math.max(2, Math.round(t.nh * height));
    const parentObjectId = t.parentKey ? parentIdByKey.get(`mobile-${t.parentKey}`) ?? null : null;
    parentIdByKey.set(objectId, objectId);
    objectDefinitions.push({
      objectId,
      parentObjectId,
      regionId: `mobile-reg-${t.parentKey ?? t.key}`,
      semanticRole: t.key.replace(/-/g, '_').toUpperCase(),
      visualRole: t.category,
      objectType: t.category,
      x,
      y,
      width: w,
      height: h,
      normalizedX: t.nx,
      normalizedY: t.ny,
      normalizedWidth: t.nw,
      normalizedHeight: t.nh,
      zIndex: 10 + Math.floor(t.ny * 100),
      typographyRef: t.category === 'TEXT' ? `typo-${t.key}` : null,
      assetRef: t.category === 'IMAGE' || t.category === 'ARTIFACT' ? `asset-${t.key}` : null,
      featureId: t.featureId ?? null,
      functionTarget: t.featureId ?? null,
      ownership: t.key.startsWith('host') ? 'SITE_00_HOST' : 'ACTIVE_PROJECT',
      state: 'DEFAULT',
      relationshipIds: parentObjectId ? [`rel-${parentObjectId}-${objectId}`] : [],
      implementationPrimitive:
        t.category === 'IMAGE' || t.category === 'ARTIFACT' ? 'CANONICAL_IMAGE_ASSET' : 'DOM/CSS_SURFACE',
      visualImportance: t.importance,
    });
  }

  const featureBindings = DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.map((featureId) => {
    const objectIds = objectDefinitions.filter((o) => o.featureId === featureId).map((o) => o.objectId);
    return {
      featureId,
      objectIds: objectIds.length ? objectIds : [`struct-${featureId}`],
      presentation: objectIds.length ? 'VISIBLE_OR_PROGRESSIVE' : 'PROGRESSIVE_DISCLOSURE',
    };
  });

  const regionDefinitions = objectDefinitions
    .filter((o) => o.objectType === 'PANEL' || o.objectType === 'SURFACE')
    .map((o) => ({
      regionId: o.regionId,
      semanticRole: o.semanticRole,
      parentRegionId: o.parentObjectId,
    }));

  const core = {
    referenceAuthorityId: input.reference.id,
    featureManifestVersion: input.reference.featureManifestVersion,
    projectCreativeContextVersion: input.reference.projectCreativeContextVersion,
    objectDefinitions,
    featureBindings,
  };
  const compositionHash = fnv1aHex(JSON.stringify(core));

  return {
    id: `mtcs-${input.runId}`,
    projectId: input.reference.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: 'MOBILE',
    referenceAuthorityId: input.reference.id,
    featureManifestVersion: input.reference.featureManifestVersion,
    projectCreativeContextVersion: input.reference.projectCreativeContextVersion,
    hostProjectContractVersion: 'site00-design-host-project-v1',
    compositionVersion: 1,
    objectDefinitions,
    regionDefinitions,
    typographyDefinitions: [{ role: 'HOST', fontFamily: 'Martian Mono', casing: 'UPPERCASE' }],
    assetSlots: objectDefinitions
      .filter((o) => o.assetRef)
      .map((o) => ({ slotId: o.assetRef!, objectId: o.objectId, resolution: 'CANONICAL_OR_GENERATED' })),
    functionTargets: objectDefinitions
      .filter((o) => o.functionTarget)
      .map((o) => ({
        objectId: o.objectId,
        functionTarget: o.functionTarget!,
        status: o.functionTarget === 'move_to_build' ? ('MISSING' as const) : ('BOUND' as const),
      })),
    featureBindings,
    ownershipBindings: objectDefinitions.map((o) => ({ objectId: o.objectId, ownership: o.ownership })),
    stateDefinitions: objectDefinitions.map((o) => ({ objectId: o.objectId, state: o.state })),
    interactionDefinitions: objectDefinitions
      .filter((o) => o.functionTarget)
      .map((o) => ({ objectId: o.objectId, intent: o.functionTarget! })),
    relationships: objectDefinitions
      .filter((o) => o.parentObjectId)
      .map((o) => ({
        id: `rel-${o.parentObjectId}-${o.objectId}`,
        fromObjectId: o.parentObjectId!,
        toObjectId: o.objectId,
        type: 'CONTAINS',
      })),
    zOrder: objectDefinitions.map((o) => o.objectId),
    responsiveIntent: 'MOBILE_ONLY',
    providerMetadata: { provider: 'LOCAL_COMPILER', model: 'P0.VR.TWINV3.0R7M', jobRef: null },
    compositionHash,
    status: 'GENERATED',
    createdAt: new Date().toISOString(),
  };
}
