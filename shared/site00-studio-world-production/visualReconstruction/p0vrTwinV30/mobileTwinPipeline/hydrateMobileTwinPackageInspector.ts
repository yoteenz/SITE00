import type { BlueprintVisualStyleReceipt } from './blueprintVisualStyleContract.js';
import type { MobileStructuredArtifactBundle } from './buildMobileTwinStructuredArtifacts.js';
import {
  buildMobileTwinPackageIntegrityReceipt,
  PACKAGE_ARTIFACT_MISSING,
  type MobileTwinPackageIntegrityReceipt,
} from './mobileTwinPackageIntegrityReceipt.js';
import { resolveMobileTwinReviewSlots } from './hydrateMobileTwinReviewState.js';
import { getMobileTwinVisualProviderStrategy } from './getMobileTwinVisualProviderStrategy.js';
import type {
  MobileBlueprintTwinVisual,
  MobileDesignReferenceAuthority,
  MobileImplementationRender,
  MobileTwinCompositionState,
  MobileTwinPackage,
  MobileTwinPipelineState,
  ReferenceTranslationFidelityReceipt,
  TwinFidelityReceipt,
} from './types.js';
import type { TwinVisualCompositionReceipt } from './twinVisualCompositionReceipt.js';
import { P0_VR_TWIN_V30R7MF3P7_LINEAGE } from '../constants.js';

export type PackageArtifactMissing = {
  code: typeof PACKAGE_ARTIFACT_MISSING;
  artifactId: string;
  label: string;
};

export type PackageInspectorGap = {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
};

export type PackageApprovalReadinessRow = {
  label: string;
  status: 'PASS' | 'REVIEW';
};

export type MobileTwinPackageInspectorView = {
  lineage: string;
  package: MobileTwinPackage | null;
  missingArtifacts: PackageArtifactMissing[];
  integrity: MobileTwinPackageIntegrityReceipt | null;
  summary: {
    status: string;
    projectId: string;
    viewport: 'MOBILE';
    method: string;
    actualProvider: string;
    blueprintProvider: string;
    blueprintStyle: string;
    compositionStatus: string;
    packageId: string;
    packageChecksum: string;
  };
  visualTwin: {
    reference: MobileDesignReferenceAuthority | null;
    actual: MobileImplementationRender | null;
    blueprint: MobileBlueprintTwinVisual | null;
  };
  composition: MobileTwinCompositionState | null;
  compositionStats: {
    regionCount: number;
    objectCount: number;
    featureBindingCount: number;
    relationshipCount: number;
    assetSlotCount: number;
    interactionCount: number;
  } | null;
  surgicalBlueprint: MobileStructuredArtifactBundle['surgicalBlueprint'] | null;
  objectMap: MobileStructuredArtifactBundle['objectMap'] | null;
  objectMapGrouped: Record<string, MobileTwinCompositionState['objectDefinitions']>;
  assetManifest: MobileStructuredArtifactBundle['canonicalAssetManifest'] | null;
  assetManifestGrouped: Record<string, { assetId: string; objectId: string; resolution: string }[]>;
  functionMap: MobileStructuredArtifactBundle['functionBindingMap'] | null;
  ownershipMap: MobileStructuredArtifactBundle['hostProjectOwnershipMap'] | null;
  ownershipGrouped: Record<string, { objectId: string; ownership: string }[]>;
  primitiveContract: MobileStructuredArtifactBundle['implementationPrimitiveContract'] | null;
  primitiveCounts: Record<string, number>;
  forbiddenPrimitiveViolations: string[];
  traceability: MobileStructuredArtifactBundle['reverseTraceabilityMap'] | null;
  validation: {
    referenceFidelity: ReferenceTranslationFidelityReceipt | null;
    twinVisual: TwinVisualCompositionReceipt | null;
    reconciliation: { id: string; result?: string; reason?: string } | null;
    blueprintStyle: BlueprintVisualStyleReceipt | null;
    providerLock: boolean;
  };
  providerLineage: {
    actual: { provider: string; model: string; jobId: string; artifactId: string; hash: string; costUsd: number; status: string };
    blueprint: {
      provider: string;
      model: string;
      jobId: string;
      artifactId: string;
      hash: string;
      styleContract: string;
      costUsd: number;
      status: string;
    };
  } | null;
  gaps: PackageInspectorGap[];
  approvalReadiness: PackageApprovalReadinessRow[];
  readyToApprove: boolean;
  showRawJsonDefault: false;
};

function loadArtifact<T>(
  artifactsById: Record<string, unknown>,
  id: string,
  label: string,
): { value: T | null; missing: PackageArtifactMissing | null } {
  const row = artifactsById[id];
  if (!row) {
    return {
      value: null,
      missing: { code: PACKAGE_ARTIFACT_MISSING, artifactId: id, label },
    };
  }
  return { value: row as T, missing: null };
}

const OBJECT_CATEGORY_ORDER = [
  'Regions',
  'Text',
  'Controls',
  'Navigation',
  'Panels',
  'Cards',
  'Images / Artifacts',
  'Lines / Dividers',
  'Status indicators',
  'Bottom navigation',
  'Other',
] as const;

function categorizeObject(visualRole: string, objectType: string): string {
  const role = `${visualRole}/${objectType}`.toUpperCase();
  if (role.includes('NAV')) return 'Navigation';
  if (role.includes('PANEL') || role.includes('SURFACE')) return 'Panels';
  if (role.includes('CARD')) return 'Cards';
  if (role.includes('TEXT')) return 'Text';
  if (role.includes('CONTROL') || role.includes('BUTTON')) return 'Controls';
  if (role.includes('IMAGE') || role.includes('ARTIFACT')) return 'Images / Artifacts';
  if (role.includes('DIVIDER') || role.includes('LINE')) return 'Lines / Dividers';
  if (role.includes('STATUS')) return 'Status indicators';
  if (role.includes('REGION')) return 'Regions';
  return 'Other';
}

function groupObjects(objects: MobileTwinCompositionState['objectDefinitions']): Record<string, typeof objects> {
  const grouped: Record<string, typeof objects> = {};
  for (const obj of objects) {
    const cat = categorizeObject(obj.visualRole, obj.objectType);
    grouped[cat] ??= [];
    grouped[cat].push(obj);
  }
  return grouped;
}

function assetStatusForObject(obj: MobileTwinCompositionState['objectDefinitions'][0]): string {
  if (obj.assetRef) return 'RESOLVED_EXISTING_ASSET';
  if (obj.objectType === 'IMAGE' || obj.visualRole === 'ARTIFACT') return 'GENERATION_REQUIRED';
  if (obj.featureId) return 'FOUNDER_MAPPING_REQUIRED';
  return 'PLACEHOLDER_ALLOWED';
}

export function hydrateMobileTwinPackageInspector(
  pipeline: MobileTwinPipelineState,
  projectId: string,
): MobileTwinPackageInspectorView {
  const slots = resolveMobileTwinReviewSlots(pipeline);
  const pkg =
    (pipeline.latestPackageId ? pipeline.packages.find((p) => p.id === pipeline.latestPackageId) : null) ??
    (slots.packageId ? pipeline.packages.find((p) => p.id === slots.packageId) : null) ??
    pipeline.packages.at(-1) ??
    null;

  const missingArtifacts: PackageArtifactMissing[] = [];
  const pushMissing = (m: PackageArtifactMissing | null) => {
    if (m) missingArtifacts.push(m);
  };

  if (!pkg) {
    return {
      lineage: P0_VR_TWIN_V30R7MF3P7_LINEAGE,
      package: null,
      missingArtifacts: [{ code: PACKAGE_ARTIFACT_MISSING, artifactId: '—', label: 'MobileTwinPackage' }],
      integrity: null,
      summary: {
        status: 'NOT_STARTED',
        projectId,
        viewport: 'MOBILE',
        method: 'ATOMIC_SIBLING_FROM_COMPOSITION',
        actualProvider: '—',
        blueprintProvider: '—',
        blueprintStyle: 'LIGHT TECHNICAL',
        compositionStatus: '—',
        packageId: '—',
        packageChecksum: '—',
      },
      visualTwin: { reference: pipeline.designReference ?? null, actual: slots.actualRender, blueprint: slots.blueprintTwin },
      composition: null,
      compositionStats: null,
      surgicalBlueprint: null,
      objectMap: null,
      objectMapGrouped: {},
      assetManifest: null,
      assetManifestGrouped: {},
      functionMap: null,
      ownershipMap: null,
      ownershipGrouped: {},
      primitiveContract: null,
      primitiveCounts: {},
      forbiddenPrimitiveViolations: [],
      traceability: null,
      validation: { referenceFidelity: null, twinVisual: null, reconciliation: null, blueprintStyle: null, providerLock: false },
      providerLineage: null,
      gaps: [{ severity: 'CRITICAL', message: 'Mobile twin package not generated yet' }],
      approvalReadiness: [],
      readyToApprove: false,
      showRawJsonDefault: false,
    };
  }

  const compLoad = loadArtifact<MobileTwinCompositionState>(pipeline.artifactsById, pkg.compositionStateId, 'CompositionState');
  pushMissing(compLoad.missing);
  const composition = compLoad.value ?? pipeline.compositionStates.find((c) => c.id === pkg.compositionStateId) ?? null;

  const sb = loadArtifact<MobileStructuredArtifactBundle['surgicalBlueprint']>(
    pipeline.artifactsById,
    pkg.surgicalBlueprintId,
    'SurgicalBlueprint',
  );
  pushMissing(sb.missing);
  const om = loadArtifact<MobileStructuredArtifactBundle['objectMap']>(pipeline.artifactsById, pkg.objectMapId, 'ObjectMap');
  pushMissing(om.missing);
  const am = loadArtifact<MobileStructuredArtifactBundle['canonicalAssetManifest']>(
    pipeline.artifactsById,
    pkg.canonicalAssetManifestId,
    'AssetManifest',
  );
  pushMissing(am.missing);
  const fm = loadArtifact<MobileStructuredArtifactBundle['functionBindingMap']>(
    pipeline.artifactsById,
    pkg.functionBindingMapId,
    'FunctionMap',
  );
  pushMissing(fm.missing);
  const own = loadArtifact<MobileStructuredArtifactBundle['hostProjectOwnershipMap']>(
    pipeline.artifactsById,
    pkg.hostProjectOwnershipMapId,
    'OwnershipMap',
  );
  pushMissing(own.missing);
  const prim = loadArtifact<MobileStructuredArtifactBundle['implementationPrimitiveContract']>(
    pipeline.artifactsById,
    pkg.implementationPrimitiveContractId,
    'ImplementationPrimitiveContract',
  );
  pushMissing(prim.missing);
  const trace = loadArtifact<MobileStructuredArtifactBundle['reverseTraceabilityMap']>(
    pipeline.artifactsById,
    pkg.reverseTraceabilityMapId,
    'TraceabilityMap',
  );
  pushMissing(trace.missing);

  const refFid = loadArtifact<ReferenceTranslationFidelityReceipt>(
    pipeline.artifactsById,
    pkg.referenceTranslationFidelityReceiptId,
    'ReferenceTranslationFidelityReceipt',
  );
  pushMissing(refFid.missing);
  const twinFid = loadArtifact<TwinFidelityReceipt>(pipeline.artifactsById, pkg.twinFidelityReceiptId, 'TwinFidelityReceipt');
  pushMissing(twinFid.missing);
  const recon = loadArtifact<{ id: string; result?: string; reason?: string }>(
    pipeline.artifactsById,
    pkg.reconciliationReceiptId,
    'MobileTwinReconciliationReceipt',
  );
  pushMissing(recon.missing);

  const actual = slots.actualRender ?? pipeline.renders.find((r) => r.id === pkg.implementationRenderId) ?? null;
  const blueprint =
    slots.blueprintTwin ?? pipeline.blueprintTwins.find((b) => b.id === pkg.blueprintTwinVisualId) ?? null;
  const styleReceipt =
    blueprint?.styleReceiptId ?
      (pipeline.artifactsById[blueprint.styleReceiptId] as BlueprintVisualStyleReceipt | undefined) ?? null
    : null;

  const tvcrId = Object.keys(pipeline.artifactsById).find((k) => k.startsWith('tvcr-'));
  const twinVisual =
    tvcrId ? (pipeline.artifactsById[tvcrId] as TwinVisualCompositionReceipt | undefined) ?? null : null;

  const route = getMobileTwinVisualProviderStrategy(pipeline);
  const objectDefs = om.value?.objects ?? composition?.objectDefinitions ?? [];
  const objectMapGrouped = groupObjects(objectDefs);

  const assetManifestGrouped: Record<string, { assetId: string; objectId: string; resolution: string }[]> = {
    RESOLVED_EXISTING_ASSET: [],
    GENERATION_REQUIRED: [],
    FOUNDER_MAPPING_REQUIRED: [],
    PLACEHOLDER_ALLOWED: [],
  };
  if (composition) {
    for (const slot of composition.assetSlots) {
      const obj = composition.objectDefinitions.find((o) => o.objectId === slot.objectId);
      const status = obj ? assetStatusForObject(obj) : 'PLACEHOLDER_ALLOWED';
      assetManifestGrouped[status].push({ assetId: slot.slotId, objectId: slot.objectId, resolution: slot.resolution });
    }
  }

  const ownershipGrouped: Record<string, { objectId: string; ownership: string }[]> = {};
  for (const entry of own.value?.entries ?? composition?.ownershipBindings ?? []) {
    ownershipGrouped[entry.ownership] ??= [];
    ownershipGrouped[entry.ownership].push(entry);
  }

  const primitiveCounts: Record<string, number> = {};
  for (const entry of prim.value?.entries ?? []) {
    primitiveCounts[entry.primitive] = (primitiveCounts[entry.primitive] ?? 0) + 1;
  }
  const forbidden = prim.value?.forbidden ?? [];
  const forbiddenPrimitiveViolations = forbidden.filter((f) =>
    (prim.value?.entries ?? []).some((e) => e.primitive === f),
  );

  const visualPairPresent = Boolean(actual?.renderImageUri && blueprint?.twinImageUri);
  const integrity = buildMobileTwinPackageIntegrityReceipt({
    pkg,
    artifactsById: pipeline.artifactsById,
    visualPairPresent,
  });

  const gaps: PackageInspectorGap[] = [];
  for (const m of missingArtifacts) {
    gaps.push({ severity: 'CRITICAL', message: `${m.label} missing (${m.artifactId})` });
  }
  for (const binding of fm.value?.bindings ?? []) {
    if (binding.status === 'MISSING') gaps.push({ severity: 'HIGH', message: `Missing function binding · ${binding.objectId}` });
    if (binding.status === 'PARTIAL') gaps.push({ severity: 'MEDIUM', message: `Partial function binding · ${binding.objectId}` });
  }
  if (blueprint?.blueprintStyleStatus === 'REVIEW_REQUIRED') {
    gaps.push({ severity: 'HIGH', message: 'Blueprint style review required (light technical contract)' });
  }
  if (integrity.result === 'FAIL' && !missingArtifacts.length) {
    gaps.push({ severity: 'MEDIUM', message: 'Package integrity check failed' });
  }

  const visualPass =
    visualPairPresent &&
    blueprint?.blueprintStyleStatus !== 'BLOCKED' &&
    blueprint?.blueprintStyleStatus !== 'REVIEW_REQUIRED';
  const structuredPass = missingArtifacts.length === 0 && Boolean(sb.value && om.value);
  const validationPass =
    refFid.value?.result === 'PASS' &&
    twinFid.value?.result === 'PASS' &&
    (recon.value?.result === 'PASS' || recon.value?.result === undefined);

  const approvalReadiness: PackageApprovalReadinessRow[] = [
    { label: 'VISUAL TWIN', status: visualPass ? 'PASS' : 'REVIEW' },
    { label: 'STRUCTURED BLUEPRINT', status: structuredPass ? 'PASS' : 'REVIEW' },
    { label: 'OBJECT MAP', status: om.value ? 'PASS' : 'REVIEW' },
    { label: 'ASSET MANIFEST', status: am.value ? 'PASS' : 'REVIEW' },
    { label: 'FUNCTION MAP', status: fm.value ? 'PASS' : 'REVIEW' },
    { label: 'OWNERSHIP', status: own.value ? 'PASS' : 'REVIEW' },
    { label: 'TRACEABILITY', status: trace.value ? 'PASS' : 'REVIEW' },
    { label: 'VALIDATION', status: validationPass ? 'PASS' : 'REVIEW' },
  ];

  const readyToApprove =
    pkg.status === 'FOUNDER_REVIEW_READY' &&
    approvalReadiness.every((r) => r.status === 'PASS') &&
    gaps.filter((g) => g.severity === 'CRITICAL' || g.severity === 'HIGH').length === 0;

  const actualCost =
    pipeline.providerCostRecords
      .filter((c) => c.kind === 'MOBILE_RENDER' || c.id.includes('actual'))
      .reduce((s, c) => s + c.estimatedCostUsd, 0) || actual?.providerCostUsd || 0;
  const blueprintCost =
    pipeline.providerCostRecords
      .filter((c) => c.kind === 'BLUEPRINT_TWIN')
      .reduce((s, c) => s + c.estimatedCostUsd, 0) || 0;

  return {
    lineage: P0_VR_TWIN_V30R7MF3P7_LINEAGE,
    package: pkg,
    missingArtifacts,
    integrity,
    summary: {
      status: pkg.status,
      projectId: pkg.projectId,
      viewport: 'MOBILE',
      method: 'ATOMIC_SIBLING_FROM_COMPOSITION',
      actualProvider: route?.actual.model.includes('nano-banana') ? 'NANO BANANA PRO' : (route?.actual.model ?? 'FAL'),
      blueprintProvider: route?.blueprint.model.includes('nano-banana') ? 'NANO BANANA PRO' : (route?.blueprint.model ?? 'FAL'),
      blueprintStyle: 'LIGHT TECHNICAL',
      compositionStatus: composition?.status ?? '—',
      packageId: pkg.id,
      packageChecksum: pkg.packageChecksum,
    },
    visualTwin: {
      reference: pipeline.designReference ?? null,
      actual,
      blueprint,
    },
    composition,
    compositionStats:
      composition ?
        {
          regionCount: composition.regionDefinitions.length,
          objectCount: composition.objectDefinitions.length,
          featureBindingCount: composition.featureBindings.length,
          relationshipCount: composition.relationships.length,
          assetSlotCount: composition.assetSlots.length,
          interactionCount: composition.interactionDefinitions.length,
        }
      : null,
    surgicalBlueprint: sb.value,
    objectMap: om.value,
    objectMapGrouped,
    assetManifest: am.value,
    assetManifestGrouped,
    functionMap: fm.value,
    ownershipMap: own.value,
    ownershipGrouped,
    primitiveContract: prim.value,
    primitiveCounts,
    forbiddenPrimitiveViolations,
    traceability: trace.value,
    validation: {
      referenceFidelity: refFid.value,
      twinVisual,
      reconciliation: recon.value,
      blueprintStyle: styleReceipt,
      providerLock: Boolean(route?.locked),
    },
    providerLineage:
      actual && blueprint ?
        {
          actual: {
            provider: actual.provider,
            model: actual.providerModel ?? route?.actual.model ?? '—',
            jobId: actual.providerJobRef,
            artifactId: actual.id,
            hash: actual.renderImageHash.slice(0, 12),
            costUsd: actualCost,
            status: actual.providerStatus ?? actual.status,
          },
          blueprint: {
            provider: blueprint.provider,
            model: route?.blueprint.model ?? '—',
            jobId: blueprint.providerJobRef,
            artifactId: blueprint.id,
            hash: blueprint.twinImageHash.slice(0, 12),
            styleContract: blueprint.styleContractId ?? '—',
            costUsd: blueprintCost,
            status: blueprint.blueprintStyleStatus ?? '—',
          },
        }
      : null,
    gaps,
    approvalReadiness,
    readyToApprove,
    showRawJsonDefault: false,
  };
}

export { OBJECT_CATEGORY_ORDER };
