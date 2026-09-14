import type { MobileTwinCompositionState, MobileTwinPackage } from './types.js';

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export type MobileStructuredArtifactBundle = {
  surgicalBlueprint: {
    id: string;
    compositionStateId: string;
    compositionHash: string;
    objects: MobileTwinCompositionState['objectDefinitions'];
    version: number;
  };
  objectMap: {
    id: string;
    compositionStateId: string;
    compositionHash: string;
    objects: MobileTwinCompositionState['objectDefinitions'];
    version: number;
  };
  canonicalAssetManifest: {
    id: string;
    compositionStateId: string;
    compositionHash: string;
    assets: { assetId: string; objectId: string; authorityCropForbidden: true; resolution: string }[];
    version: number;
  };
  functionBindingMap: {
    id: string;
    compositionStateId: string;
    compositionHash: string;
    bindings: MobileTwinCompositionState['functionTargets'];
    version: number;
  };
  hostProjectOwnershipMap: {
    id: string;
    compositionStateId: string;
    compositionHash: string;
    entries: MobileTwinCompositionState['ownershipBindings'];
    version: number;
  };
  implementationPrimitiveContract: {
    id: string;
    compositionStateId: string;
    compositionHash: string;
    authorityRasterFirewall: true;
    forbidden: string[];
    entries: { objectId: string; primitive: string; forbidden: string[] }[];
    version: number;
  };
  reverseTraceabilityMap: {
    id: string;
    compositionStateId: string;
    compositionHash: string;
    traces: { featureId: string; objectId: string; primitive: string; functionTarget: string | null }[];
    version: number;
  };
};

const FORBIDDEN_PRIMITIVES = [
  'REFERENCE_AUTHORITY_SCREENSHOT',
  'IMPLEMENTATION_RENDER_SCREENSHOT',
  'SCREENSHOT_CROP',
  'FULL_PAGE_RASTER',
  'GHOST_LAYER',
  'BACKGROUND_SCREENSHOT',
];

export function buildMobileStructuredArtifacts(input: {
  runId: string;
  composition: MobileTwinCompositionState;
}): MobileStructuredArtifactBundle {
  const { composition } = input;
  const base = { compositionStateId: composition.id, compositionHash: composition.compositionHash };
  return {
    surgicalBlueprint: {
      id: `msb-${input.runId}`,
      ...base,
      objects: composition.objectDefinitions,
      version: 1,
    },
    objectMap: {
      id: `mom-${input.runId}`,
      ...base,
      objects: composition.objectDefinitions,
      version: 1,
    },
    canonicalAssetManifest: {
      id: `mcam-${input.runId}`,
      ...base,
      assets: composition.assetSlots.map((s) => ({
        assetId: s.slotId,
        objectId: s.objectId,
        authorityCropForbidden: true as const,
        resolution: s.resolution,
      })),
      version: 1,
    },
    functionBindingMap: {
      id: `mfbm-${input.runId}`,
      ...base,
      bindings: composition.functionTargets,
      version: 1,
    },
    hostProjectOwnershipMap: {
      id: `mhpom-${input.runId}`,
      ...base,
      entries: composition.ownershipBindings,
      version: 1,
    },
    implementationPrimitiveContract: {
      id: `mipc-${input.runId}`,
      ...base,
      authorityRasterFirewall: true,
      forbidden: FORBIDDEN_PRIMITIVES,
      entries: composition.objectDefinitions.map((o) => ({
        objectId: o.objectId,
        primitive: o.implementationPrimitive,
        forbidden: FORBIDDEN_PRIMITIVES,
      })),
      version: 1,
    },
    reverseTraceabilityMap: {
      id: `mrtm-${input.runId}`,
      ...base,
      traces: composition.featureBindings.flatMap((fb) =>
        fb.objectIds.map((objectId) => {
          const obj = composition.objectDefinitions.find((o) => o.objectId === objectId);
          return {
            featureId: fb.featureId,
            objectId,
            primitive: obj?.implementationPrimitive ?? 'UNKNOWN',
            functionTarget: obj?.functionTarget ?? null,
          };
        }),
      ),
      version: 1,
    },
  };
}

export function buildMobileTwinPackageRecord(input: {
  runId: string;
  projectId: string;
  referenceId: string;
  composition: MobileTwinCompositionState;
  renderId: string;
  visualAuthorityId: string | null;
  blueprintTwinId: string;
  bundle: MobileStructuredArtifactBundle;
  reconciliationReceiptId: string;
  referenceFidelityId: string;
  twinFidelityId: string;
}): MobileTwinPackage {
  const checksum = fnv1aHex(
    `${input.composition.compositionHash}|${input.renderId}|${input.blueprintTwinId}|${input.bundle.surgicalBlueprint.id}`,
  );
  return {
    id: `mtp-${input.runId}`,
    projectId: input.projectId,
    designReferenceAuthorityId: input.referenceId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    implementationRenderId: input.renderId,
    implementationVisualAuthorityId: input.visualAuthorityId,
    blueprintTwinVisualId: input.blueprintTwinId,
    surgicalBlueprintId: input.bundle.surgicalBlueprint.id,
    objectMapId: input.bundle.objectMap.id,
    canonicalAssetManifestId: input.bundle.canonicalAssetManifest.id,
    functionBindingMapId: input.bundle.functionBindingMap.id,
    hostProjectOwnershipMapId: input.bundle.hostProjectOwnershipMap.id,
    implementationPrimitiveContractId: input.bundle.implementationPrimitiveContract.id,
    reverseTraceabilityMapId: input.bundle.reverseTraceabilityMap.id,
    reconciliationReceiptId: input.reconciliationReceiptId,
    referenceTranslationFidelityReceiptId: input.referenceFidelityId,
    twinFidelityReceiptId: input.twinFidelityId,
    featureManifestVersion: input.composition.featureManifestVersion,
    projectCreativeContextVersion: input.composition.projectCreativeContextVersion,
    packageChecksum: checksum,
    providerLineage: 'P0.VR.TWINV3.0R7M',
    status: 'FOUNDER_REVIEW_READY',
    createdAt: new Date().toISOString(),
  };
}
