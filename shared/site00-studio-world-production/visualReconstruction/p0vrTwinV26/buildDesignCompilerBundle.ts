import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptCandidate, ConceptGalleryState } from '../p0vrTwinV22/types.js';
import type { ReconciledConceptVisualBlueprint } from '../p0vrTwinV25/types.js';
import {
  HOST_CONTRACT_VERSION,
  INVENTION_BUDGET_BY_STAGE,
  IR_SCHEMA_VERSION,
  P0_VR_TWIN_V26_BUILD,
  RESPONSIVE_CONTRACT_VERSION,
  STATE_CONTRACT_VERSION,
} from './constants.js';
import { computeStableChecksum } from './irChecksum.js';
import type {
  ConceptBundleChecksum,
  DesignCompilerBundle,
  IrEnvelope,
  IrKind,
  ObjectLineageEntry,
  VisualRelationship,
} from './types.js';
import { computeCompilerReadiness } from './computeCompilerReadiness.js';

function envelope<K extends IrKind>(
  kind: K,
  conceptId: string,
  conceptVersionId: string,
  producer: string,
  inputIrIds: string[],
  payload: Record<string, unknown>,
): IrEnvelope<K> {
  const checksum = computeStableChecksum({ kind, conceptId, conceptVersionId, payload });
  return {
    irId: `${kind.toLowerCase()}-${conceptId}-${checksum.slice(2, 10)}`,
    irKind: kind,
    conceptId,
    conceptVersionId,
    schemaVersion: IR_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    producer,
    inputIrIds,
    status: 'PASS',
    checksum,
    payload,
  };
}

export function computeConceptBundleChecksum(input: {
  conceptId: string;
  conceptVersionId: string;
  visualIrChecksum: string;
  assetIrChecksum: string;
  functionIrChecksum: string;
  designIrChecksum: string;
}): ConceptBundleChecksum {
  const checksum = computeStableChecksum({
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    visualIrChecksum: input.visualIrChecksum,
    assetIrChecksum: input.assetIrChecksum,
    functionIrChecksum: input.functionIrChecksum,
    designIrChecksum: input.designIrChecksum,
    host: HOST_CONTRACT_VERSION,
    responsive: RESPONSIVE_CONTRACT_VERSION,
    state: STATE_CONTRACT_VERSION,
  });
  return {
    conceptId: input.conceptId,
    conceptVersionId: input.conceptVersionId,
    checksum,
    visualIrChecksum: input.visualIrChecksum,
    assetIrChecksum: input.assetIrChecksum,
    functionIrChecksum: input.functionIrChecksum,
    designIrChecksum: input.designIrChecksum,
    hostContractVersion: HOST_CONTRACT_VERSION,
    responsiveContractVersion: RESPONSIVE_CONTRACT_VERSION,
    stateContractVersion: STATE_CONTRACT_VERSION,
    computedAt: new Date().toISOString(),
  };
}

function buildVisualRelationships(objects: { objectId: string }[]): VisualRelationship[] {
  const rels: VisualRelationship[] = [];
  if (objects.some((o) => o.objectId === 'metrics.cell02.value')) {
    rels.push({
      relationshipId: 'vr-metrics-baseline',
      sourceObjectId: 'metrics.cell02.value',
      targetObjectId: 'metrics.cell01.value',
      type: 'sharesBaselineWith',
      targetValue: 'baseline',
      tolerance: 0.01,
      priority: 2,
    });
  }
  if (objects.some((o) => o.objectId === 'hero.ndxOverlay')) {
    rels.push({
      relationshipId: 'vr-ndx-anchor',
      sourceObjectId: 'hero.ndxOverlay',
      targetObjectId: 'hero.imageMain',
      type: 'anchoredTo',
      targetValue: 'hero.media.bottom',
      tolerance: 0.015,
      priority: 3,
    });
  }
  if (objects.some((o) => o.objectId === 'progress.fill')) {
    rels.push({
      relationshipId: 'vr-progress-contain',
      sourceObjectId: 'progress.fill',
      targetObjectId: 'progress.track',
      type: 'containedBy',
      targetValue: 'track',
      tolerance: 0,
      priority: 3,
    });
  }
  return rels;
}

function buildObjectLineage(input: {
  conceptVersionId: string;
  designIrId: string;
  visualIrId: string;
  objects: { objectId: string; canonicalAssetId?: string | null; functionBindingTarget?: string | null }[];
}): ObjectLineageEntry[] {
  return input.objects.map((o) => ({
    objectId: o.objectId,
    conceptVersionId: input.conceptVersionId,
    designIrId: input.designIrId,
    visualIrId: input.visualIrId,
    assetId: o.canonicalAssetId ?? null,
    functionBindingId: o.functionBindingTarget ?? null,
    implementationComponent: 'ConceptVisualCompilerTwinV2',
    domSelector: `.site00-bp-obj--${o.objectId.replace(/\./g, '-')}`,
    renderObjectId: o.objectId,
    fidelityReceiptId: null,
    status: 'LINKED',
  }));
}

export function buildDesignCompilerBundle(input: {
  session: ConceptDirectedTwinSession;
  candidate: ConceptCandidate;
  gallery: ConceptGalleryState;
  reconciledBlueprint?: ReconciledConceptVisualBlueprint | null;
  preflightReceipt?: import('./types.js').ConceptGenerationPreflightReceipt | null;
  prior?: DesignCompilerBundle | null;
}): DesignCompilerBundle {
  const paired = input.gallery.pairedArtifacts?.[input.candidate.conceptId];
  const conceptVersionId = paired?.versionId ?? `cv-${input.candidate.conceptId}`;
  const vb =
    input.reconciledBlueprint ??
    (paired?.conceptVisualBlueprintId
      ? input.gallery.reconciledVisualBlueprints?.[paired.conceptVisualBlueprintId]
      : null);

  const intent = envelope('IntentIR', input.candidate.conceptId, conceptVersionId, 'p0vrTwinV26', [], {
    pageIntent: input.session.pageIntent.summary,
    primaryDecision: input.session.pageIntent.primaryDecision,
  });

  const design = envelope('DesignIR', input.candidate.conceptId, conceptVersionId, 'p0vrTwinV25', [intent.irId], {
    compositionPlanId: paired?.compositionPlanId,
    blueprintId: vb?.blueprintId ?? input.candidate.conceptBlueprintId,
    objectIds: vb?.objects.map((o) => o.objectId) ?? [],
  });

  const visual = envelope('VisualIR', input.candidate.conceptId, conceptVersionId, 'p0vrTwinV25', [design.irId], {
    visualAssetUrl: input.candidate.visualAssetUrl,
    reconciledBlueprintId: vb?.blueprintId,
    objectCount: vb?.objects.length ?? 0,
  });

  const assets = input.gallery.generatedConceptAssets?.[input.candidate.conceptId] ?? [];
  const asset = envelope('AssetIR', input.candidate.conceptId, conceptVersionId, 'p0vrTwinV25', [design.irId], {
    manifestId: input.candidate.assetManifestId,
    assetIds: assets.map((a) => a.assetId),
    slotCount: input.gallery.manifests[input.candidate.assetManifestId]?.slots.length ?? 0,
  });

  const fnPlan = input.gallery.bindingPlans[input.candidate.functionBindingPlanId];
  const func = envelope('FunctionIR', input.candidate.conceptId, conceptVersionId, 'p0vrTwinV25', [design.irId], {
    bindingPlanId: input.candidate.functionBindingPlanId,
    bindingCount: fnPlan?.bindings.length ?? 0,
  });

  const implementation = envelope(
    'ImplementationIR',
    input.candidate.conceptId,
    conceptVersionId,
    'p0vrTwinV24R1',
    [visual.irId, asset.irId, func.irId],
    {
      strategy: 'VISUAL_TO_CODE_COMPILER',
      componentRef: 'ConceptVisualCompilerTwinV2',
    },
  );

  const render = envelope('RenderIR', input.candidate.conceptId, conceptVersionId, 'p0vrTwinV24R1', [
    implementation.irId,
  ], {
    renderMode: 'TWIN_V2_VISUAL_COMPILER_NDX_OVERVIEW',
  });

  const fidelity = envelope('FidelityIR', input.candidate.conceptId, conceptVersionId, 'p0vrTwinV26', [render.irId], {
    acceptanceStatus: 'MACHINE_PENDING',
  });

  const bundleChecksum = computeConceptBundleChecksum({
    conceptId: input.candidate.conceptId,
    conceptVersionId,
    visualIrChecksum: visual.checksum,
    assetIrChecksum: asset.checksum,
    functionIrChecksum: func.checksum,
    designIrChecksum: design.checksum,
  });

  const objectLineage = vb
    ? buildObjectLineage({
        conceptVersionId,
        designIrId: design.irId,
        visualIrId: visual.irId,
        objects: vb.objects,
      })
    : [];

  const visualRelationships = vb ? buildVisualRelationships(vb.objects) : [];

  const executionIntent: DesignCompilerBundle['executionIntent'] =
    input.candidate.founderJudgment === 'APPROVED' ? 'TRANSLATION' : 'CREATIVE';

  const compilerReadiness = computeCompilerReadiness({
    session: input.session,
    candidate: input.candidate,
    gallery: input.gallery,
    bundleChecksum,
    reconciledBlueprint: vb,
  });

  const reviewVersionHeader = {
    conceptVersionId,
    blueprintVersionId: vb?.blueprintId ?? input.candidate.conceptBlueprintId,
    assetManifestVersionId: input.candidate.assetManifestId,
    functionPlanVersionId: input.candidate.functionBindingPlanId,
    buildVersionId: input.session.renderedTwin?.builtAt ?? null,
    bundleChecksum: bundleChecksum.checksum,
    stale: false,
  };

  let bundleSyncStatus: DesignCompilerBundle['bundleSyncStatus'] = 'SYNCED';
  if (input.prior && input.prior.approvedBundleChecksum && input.prior.approvedBundleChecksum !== bundleChecksum.checksum) {
    bundleSyncStatus = 'DIRTY_MULTIPLE';
  }

  return {
    buildRef: P0_VR_TWIN_V26_BUILD,
    conceptId: input.candidate.conceptId,
    conceptVersionId,
    irChain: {
      intent,
      design,
      visual,
      asset,
      function: func,
      implementation,
      render,
      fidelity,
    },
    bundleChecksum,
    bundleSyncStatus,
    executionIntent,
    inventionBudget: INVENTION_BUDGET_BY_STAGE,
    preflightReceipt: input.preflightReceipt ?? input.prior?.preflightReceipt ?? null,
    compilerReadiness,
    objectLineage,
    visualRelationships,
    reviewVersionHeader,
    acceptanceStatus: input.candidate.founderJudgment === 'APPROVED' ? 'FOUNDER_PENDING' : 'MACHINE_PENDING',
    approvedBundleChecksum: input.prior?.approvedBundleChecksum ?? null,
    approvedAt: input.prior?.approvedAt ?? null,
    failureClosed: true,
  };
}
