import type { ConceptDirectedTwinSession, VisualConceptVersion } from '../p0vrTwinV21/types.js';
import { P0_VR_TWIN_V22_BUILD } from './constants.js';
import type {
  ConceptCandidate,
  ConceptGalleryState,
  ConceptGenerationType,
} from './types.js';
import { generateConceptBlueprint } from './generateConceptBlueprint.js';
import { reconcileConceptBlueprint } from './reconcileConceptBlueprint.js';
import { generateConceptAssetManifest } from './generateConceptAssetManifest.js';
import { generateConceptFunctionBindingPlan } from './generateConceptFunctionBindingPlan.js';
import { computeConceptBuildReadiness } from './computeConceptBuildReadiness.js';
import { hydrateConceptGallerySession } from './hydrateConceptGallerySession.js';
import { applyBlueprintOwnershipTags } from '../p0vrTwinV22R2/applyBlueprintOwnershipTags.js';
import { sanitizeConceptForHostBoundary } from '../p0vrTwinV22R2/sanitizeConceptForHostBoundary.js';
import { buildHostBoundarySanitizationReceipt } from '../p0vrTwinV22R2/buildHostBoundarySanitizationReceipt.js';
import { repairConceptGalleryHostBoundary } from '../p0vrTwinV22R2/repairConceptGalleryHostBoundary.js';

export function emptyConceptGallery(): ConceptGalleryState {
  return {
    buildRef: P0_VR_TWIN_V22_BUILD,
    candidates: [],
    activeConceptId: null,
    blueprints: {},
    manifests: {},
    bindingPlans: {},
    reconciliations: {},
    packages: {},
    fidelityReceipts: {},
    sanitizedBlueprints: {},
    generatedHostArtifacts: {},
    ownershipReceipts: {},
    canvasBoundaries: {},
    hostShellContracts: {},
    compositePreviews: {},
    hostBoundarySanitizationReceipts: {},
  };
}

export function ensureConceptGallery(
  session: ConceptDirectedTwinSession,
  input?: Parameters<typeof hydrateConceptGallerySession>[1],
): ConceptDirectedTwinSession {
  return hydrateConceptGallerySession(session, input);
}

function lineageLabel(candidate: ConceptCandidate): string {
  if (candidate.generationType === 'REFINED') {
    return `REFINE ${candidate.versionNumber}`;
  }
  return `CONCEPT ${String(candidate.versionNumber).padStart(2, '0')}`;
}

export function backfillConceptGalleryFromHistory(session: ConceptDirectedTwinSession): ConceptGalleryState {
  const gallery = session.conceptGallery ?? emptyConceptGallery();
  if (gallery.candidates.length > 0) {
    return repairConceptGalleryHostBoundary(session, gallery);
  }

  let versionNumber = 0;
  const candidates: ConceptCandidate[] = [];
  const blueprints = { ...gallery.blueprints };
  const manifests = { ...gallery.manifests };
  const bindingPlans = { ...gallery.bindingPlans };
  const reconciliations = { ...gallery.reconciliations };
  const sanitizedBlueprints = { ...gallery.sanitizedBlueprints };
  const generatedHostArtifacts = { ...gallery.generatedHostArtifacts };
  const ownershipReceipts = { ...gallery.ownershipReceipts };
  const canvasBoundaries = { ...gallery.canvasBoundaries };
  const hostShellContracts = { ...gallery.hostShellContracts };
  const compositePreviews = { ...gallery.compositePreviews };
  const hostBoundarySanitizationReceipts = { ...(gallery.hostBoundarySanitizationReceipts ?? {}) };
  const hostBoundaryMaps = {
    sanitizedBlueprints,
    generatedHostArtifacts,
    ownershipReceipts,
    canvasBoundaries,
    hostShellContracts,
    compositePreviews,
    hostBoundarySanitizationReceipts,
  };

  for (const h of session.history) {
    if (!h.imageUrl && !h.imageStorageRef) continue;
    versionNumber += 1;
    let candidate = materializeCandidateFromVersion(session, h, {
      versionNumber,
      generationType: h.founderInstruction ? 'LEGACY_V2_CONCEPT' : 'LEGACY_V2_CONCEPT',
      parentConceptId: h.parentVersionId
        ? candidates.find((c) => c.legacyVersionId === h.parentVersionId)?.conceptId ?? null
        : null,
    });
    candidate = attachBlueprintLineage(
      session,
      candidate,
      blueprints,
      manifests,
      bindingPlans,
      reconciliations,
      hostBoundaryMaps,
    );
    candidates.push(candidate);
  }

  return {
    ...gallery,
    buildRef: P0_VR_TWIN_V22_BUILD,
    candidates,
    activeConceptId: gallery.lastActiveConceptId ?? candidates[0]?.conceptId ?? null,
    blueprints,
    manifests,
    bindingPlans,
    reconciliations,
    sanitizedBlueprints,
    generatedHostArtifacts,
    ownershipReceipts,
    canvasBoundaries,
    hostShellContracts,
    compositePreviews,
    hostBoundarySanitizationReceipts,
  };
}

function materializeCandidateFromVersion(
  session: ConceptDirectedTwinSession,
  version: VisualConceptVersion,
  opts: { versionNumber: number; generationType: ConceptGenerationType; parentConceptId: string | null },
): ConceptCandidate {
  const now = version.createdAt;
  const conceptId = `cc-${version.versionId}`;
  return {
    conceptId,
    sessionId: session.sessionId,
    projectId: session.projectId,
    pageId: session.pageId,
    viewport: 'mobile',
    versionNumber: opts.versionNumber,
    parentConceptId: opts.parentConceptId,
    generationType: opts.generationType,
    visualAsset: version.imageStorageRef,
    visualAssetUrl: version.imageUrl,
    creativeDirection: version.creativeDirection,
    founderInstruction: version.founderInstruction,
    pageIntentSnapshot: session.pageIntent,
    functionGraphSnapshot: session.functionGraph,
    brandContextSnapshot: session.brandContext,
    blueprintGrammarSnapshot: session.blueprintGrammar,
    conceptBlueprintId: `cbp-${conceptId}`,
    assetManifestId: `cam-${conceptId}`,
    functionBindingPlanId: `cfbp-${conceptId}`,
    buildReadiness: {
      visualReady: true,
      blueprintReady: false,
      assetsReady: false,
      functionsReady: false,
      shellReady: false,
      hostBoundaryReady: false,
      responsiveReady: false,
      unresolved: ['blueprint', 'assets', 'functions', 'hostBoundary'],
      status: 'VISUAL_ONLY',
    },
    founderJudgment: version.status === 'APPROVED' ? 'APPROVED' : 'NONE',
    visualAuthorityStatus: version.status === 'APPROVED' ? 'LOCKED_FOR_BUILD' : 'OPEN',
    status: version.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
    legacyVersionId: version.versionId,
    createdAt: now,
    updatedAt: now,
  };
}

function attachBlueprintLineage(
  session: ConceptDirectedTwinSession,
  candidate: ConceptCandidate,
  blueprints: ConceptGalleryState['blueprints'],
  manifests: ConceptGalleryState['manifests'],
  bindingPlans: ConceptGalleryState['bindingPlans'],
  reconciliations: ConceptGalleryState['reconciliations'],
  hostBoundaryMaps: Pick<
    ConceptGalleryState,
    | 'sanitizedBlueprints'
    | 'generatedHostArtifacts'
    | 'ownershipReceipts'
    | 'canvasBoundaries'
    | 'hostShellContracts'
    | 'compositePreviews'
    | 'hostBoundarySanitizationReceipts'
  >,
): ConceptCandidate {
  let blueprint = generateConceptBlueprint({
    conceptId: candidate.conceptId,
    creativeDirection: candidate.creativeDirection,
    blueprintGrammar: candidate.blueprintGrammarSnapshot,
    imageUrl: candidate.visualAssetUrl,
  });
  blueprint.blueprintId = candidate.conceptBlueprintId;
  blueprint.status = 'RECONCILED';
  blueprint = applyBlueprintOwnershipTags(blueprint, { fullPageConceptImage: Boolean(candidate.visualAssetUrl) });

  const boundary = sanitizeConceptForHostBoundary({
    conceptId: candidate.conceptId,
    pageId: candidate.pageId,
    blueprint,
    originalConceptImageUrl: candidate.visualAssetUrl,
  });

  const reconciliation = reconcileConceptBlueprint({
    conceptId: candidate.conceptId,
    plannedDirection: candidate.creativeDirection,
    blueprint,
  });

  const manifest = generateConceptAssetManifest({
    conceptId: candidate.conceptId,
    blueprint: boundary.sanitizedBlueprint,
    conceptImageUrl: candidate.visualAssetUrl,
    referenceAssets: session.referenceAssets,
  });
  manifest.manifestId = candidate.assetManifestId;

  const bindingPlan = generateConceptFunctionBindingPlan({
    conceptId: candidate.conceptId,
    blueprint: boundary.sanitizedBlueprint,
    functionGraph: candidate.functionGraphSnapshot,
  });
  bindingPlan.bindingPlanId = candidate.functionBindingPlanId;

  blueprints[blueprint.blueprintId] = blueprint;
  manifests[manifest.manifestId] = manifest;
  bindingPlans[bindingPlan.bindingPlanId] = bindingPlan;
  reconciliations[reconciliation.reconciliationId] = reconciliation;

  hostBoundaryMaps.sanitizedBlueprints[boundary.sanitizedBlueprintId] = boundary.sanitizedBlueprint;
  hostBoundaryMaps.generatedHostArtifacts[candidate.conceptId] = boundary.generatedHostArtifacts;
  hostBoundaryMaps.ownershipReceipts[candidate.conceptId] = boundary.ownershipReceipt;
  hostBoundaryMaps.canvasBoundaries[candidate.conceptId] = boundary.canvasBoundary;
  hostBoundaryMaps.hostShellContracts[candidate.conceptId] = boundary.hostShellContract;
  hostBoundaryMaps.compositePreviews[candidate.conceptId] = boundary.compositePreview;
  const receipt = buildHostBoundarySanitizationReceipt({
    conceptId: candidate.conceptId,
    originalBlueprint: blueprint,
    executionBlueprint: boundary.sanitizedBlueprint,
    generatedHostArtifacts: boundary.generatedHostArtifacts,
    hostShellContract: boundary.hostShellContract,
    hostBoundaryReady: false,
  });
  if (!hostBoundaryMaps.hostBoundarySanitizationReceipts) {
    hostBoundaryMaps.hostBoundarySanitizationReceipts = {};
  }
  hostBoundaryMaps.hostBoundarySanitizationReceipts[candidate.conceptId] = receipt;

  const buildReadiness = computeConceptBuildReadiness({
    candidate,
    blueprint: boundary.sanitizedBlueprint,
    manifest,
    bindingPlan,
    hostBoundary: boundary,
  });

  hostBoundaryMaps.hostBoundarySanitizationReceipts![candidate.conceptId] = {
    ...receipt,
    hostBoundaryReady: buildReadiness.hostBoundaryReady,
    status: buildReadiness.hostBoundaryReady ? 'SANITIZED' : 'INCOMPLETE',
  };

  return {
    ...candidate,
    originalBlueprintId: blueprint.blueprintId,
    executionBlueprintId: boundary.sanitizedBlueprintId,
    buildReadiness,
    updatedAt: new Date().toISOString(),
  };
}

export function addConceptCandidateFromGeneration(
  session: ConceptDirectedTwinSession,
  input: {
    generationType: ConceptGenerationType;
    imageUrl: string;
    imageStorageRef: string | null;
    founderInstruction?: string | null;
    parentConceptId?: string | null;
    creativeDirection: ConceptDirectedTwinSession['creativeDirection'];
  },
): ConceptDirectedTwinSession {
  // Do not backfill history here — mergeVisualConcept already appended the version; backfill only on gallery hydrate.
  const gallery =
    session.conceptGallery?.buildRef === P0_VR_TWIN_V22_BUILD
      ? session.conceptGallery
      : emptyConceptGallery();
  const base = session;
  const versionNumber = gallery.candidates.length + 1;
  const conceptId = `cc-${base.sessionId}-v${versionNumber}-${Date.now()}`;

  if (!input.creativeDirection) {
    throw new Error('TWIN_V22: creative direction required');
  }

  let candidate: ConceptCandidate = {
    conceptId,
    sessionId: base.sessionId,
    projectId: base.projectId,
    pageId: base.pageId,
    viewport: 'mobile',
    versionNumber,
    parentConceptId: input.parentConceptId ?? null,
    generationType: input.generationType,
    visualAsset: input.imageStorageRef,
    visualAssetUrl: input.imageUrl,
    creativeDirection: input.creativeDirection,
    founderInstruction: input.founderInstruction ?? null,
    pageIntentSnapshot: base.pageIntent,
    functionGraphSnapshot: base.functionGraph,
    brandContextSnapshot: base.brandContext,
    blueprintGrammarSnapshot: base.blueprintGrammar,
    conceptBlueprintId: `cbp-${conceptId}`,
    assetManifestId: `cam-${conceptId}`,
    functionBindingPlanId: `cfbp-${conceptId}`,
    buildReadiness: {
      visualReady: true,
      blueprintReady: false,
      assetsReady: false,
      functionsReady: false,
      shellReady: false,
      hostBoundaryReady: false,
      responsiveReady: false,
      unresolved: [],
      status: 'VISUAL_ONLY',
    },
    founderJudgment: 'NONE',
    visualAuthorityStatus: 'OPEN',
    status: 'DRAFT',
    legacyVersionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const blueprints = { ...gallery.blueprints };
  const manifests = { ...gallery.manifests };
  const bindingPlans = { ...gallery.bindingPlans };
  const reconciliations = { ...gallery.reconciliations };
  const sanitizedBlueprints = { ...gallery.sanitizedBlueprints };
  const generatedHostArtifacts = { ...gallery.generatedHostArtifacts };
  const ownershipReceipts = { ...gallery.ownershipReceipts };
  const canvasBoundaries = { ...gallery.canvasBoundaries };
  const hostShellContracts = { ...gallery.hostShellContracts };
  const compositePreviews = { ...gallery.compositePreviews };
  const hostBoundarySanitizationReceipts = { ...(gallery.hostBoundarySanitizationReceipts ?? {}) };
  candidate = attachBlueprintLineage(base, candidate, blueprints, manifests, bindingPlans, reconciliations, {
    sanitizedBlueprints,
    generatedHostArtifacts,
    ownershipReceipts,
    canvasBoundaries,
    hostShellContracts,
    compositePreviews,
    hostBoundarySanitizationReceipts,
  });

  return {
    ...base,
    conceptGallery: {
      ...gallery,
      candidates: [...gallery.candidates, candidate],
      activeConceptId: candidate.conceptId,
      lastActiveConceptId: candidate.conceptId,
      blueprints,
      manifests,
      bindingPlans,
      reconciliations,
      sanitizedBlueprints,
      generatedHostArtifacts,
      ownershipReceipts,
      canvasBoundaries,
      hostShellContracts,
      compositePreviews,
      hostBoundarySanitizationReceipts,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function setActiveConceptId(session: ConceptDirectedTwinSession, conceptId: string): ConceptDirectedTwinSession {
  const base = ensureConceptGallery(session);
  const gallery = base.conceptGallery!;
  if (!gallery.candidates.some((c) => c.conceptId === conceptId)) {
    throw new Error('TWIN_V22: unknown conceptId');
  }
  return {
    ...base,
    conceptGallery: { ...gallery, activeConceptId: conceptId, lastActiveConceptId: conceptId },
    updatedAt: new Date().toISOString(),
  };
}

export function getActiveConceptCandidate(session: ConceptDirectedTwinSession): ConceptCandidate | null {
  const gallery = session.conceptGallery;
  if (!gallery) return null;
  const id = gallery.activeConceptId ?? gallery.candidates.at(-1)?.conceptId;
  return gallery.candidates.find((c) => c.conceptId === id) ?? null;
}

export function getConceptDisplayLabel(candidate: ConceptCandidate): string {
  return lineageLabel(candidate);
}

export function sortCandidatesForGallery(candidates: ConceptCandidate[]): ConceptCandidate[] {
  return [...candidates].sort((a, b) => a.versionNumber - b.versionNumber);
}
