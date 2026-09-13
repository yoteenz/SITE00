import {
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  P0_VR_TWIN_V30R5F1_LINEAGE,
} from './constants.js';
import { assertFeatureCoverageForPromotion } from './designWorkspaceFeatureAuthority/featureCoverageGate.js';
import { buildPromotionFeatureBindings } from './designWorkspaceFeatureAuthority/masterFeatureBinding.js';
import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureAuthority/designWorkspaceFeatureManifestV1.js';
import { assertMasterNotFeatureStale } from './designWorkspaceFeatureAuthority/staleMasterDetection.js';
import { PROJECT_CREATIVE_CONTEXT_VERSION } from './projectCreativeGrounding/types.js';
import type { DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';
import {
  emptyTerritoryGallery,
  normalizeDesignPageAuthoritySession,
} from './designPageAuthorityTerritoryGallery.js';
import type {
  DesignPageAuthorityReviewSession,
  DesignPageAuthorityTerritoryCandidate,
  DesignPageAuthorityVisualArtifact,
  DesignPageV3ViewportAuthority,
} from './types.js';
import type {
  AuthorityPipelineEvent,
  ConceptCandidateAuthorityState,
  DesignWorkspaceAuthorityPair,
  DesignWorkspaceAuthorityPipelineState,
  DesignWorkspaceViewport,
  ViewportCandidateRef,
  ViewportMasterAuthority,
} from './designWorkspaceAuthorityTypes.js';

export function emptyAuthorityPipelineState(): DesignWorkspaceAuthorityPipelineState {
  return {
    workspaceType: 'DESIGN_PAGE_V3',
    viewportSelection: { mobile: null, desktop: null },
    mobileMaster: null,
    desktopMaster: null,
    authorityPair: null,
    supersededPairs: [],
    supersededMasters: [],
    candidateViewportStates: {},
    events: [],
    executionIntent: 'CREATIVE',
    inventionBudget: 'FULL',
  };
}

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computeAuthorityImageHash(artifact: DesignPageAuthorityVisualArtifact): string {
  return fnv1aHex(`${artifact.artifactId}|${artifact.storageUrl}`);
}

export function computePairChecksum(mobile: ViewportMasterAuthority, desktop: ViewportMasterAuthority): string {
  return fnv1aHex(`${mobile.authorityImageHash}|${desktop.authorityImageHash}|${mobile.id}|${desktop.id}`);
}

function viewportKey(viewport: DesignWorkspaceViewport): 'mobile' | 'desktop' {
  return viewport === 'MOBILE' ? 'mobile' : 'desktop';
}

function toPipelineViewport(viewport: DesignPageV3ViewportAuthority): DesignWorkspaceViewport {
  return viewport === 'mobile' ? 'MOBILE' : 'DESKTOP';
}

export function findCandidateInGallery(
  session: DesignPageAuthorityReviewSession,
  candidateId: string,
): { territoryId: DesignPageV3TerritoryId; candidate: DesignPageAuthorityTerritoryCandidate } | null {
  const gallery = session.territoryGallery ?? emptyTerritoryGallery();
  for (const territoryId of ['A', 'B', 'C'] as const) {
    const candidate = gallery[territoryId].find((c) => c.candidateId === candidateId);
    if (candidate) return { territoryId, candidate };
  }
  return null;
}

function artifactForViewport(
  candidate: DesignPageAuthorityTerritoryCandidate,
  viewport: DesignWorkspaceViewport,
): DesignPageAuthorityVisualArtifact {
  return viewport === 'MOBILE' ? candidate.mobile : candidate.desktop;
}

function ensureCandidateStates(
  states: DesignWorkspaceAuthorityPipelineState['candidateViewportStates'],
  candidateId: string,
): { mobile: ConceptCandidateAuthorityState; desktop: ConceptCandidateAuthorityState } {
  return (
    states[candidateId] ?? {
      mobile: 'GENERATED',
      desktop: 'GENERATED',
    }
  );
}

function pushEvent(
  pipeline: DesignWorkspaceAuthorityPipelineState,
  event: Omit<AuthorityPipelineEvent, 'id' | 'at'>,
): DesignWorkspaceAuthorityPipelineState {
  const row: AuthorityPipelineEvent = {
    ...event,
    id: `ape-${Date.now()}-${pipeline.events.length}`,
    at: new Date().toISOString(),
  };
  return { ...pipeline, events: [...pipeline.events, row] };
}

function syncPairStatus(pipeline: DesignWorkspaceAuthorityPipelineState): DesignWorkspaceAuthorityPipelineState {
  let authorityPair = pipeline.authorityPair;
  if (!authorityPair) {
    if (pipeline.mobileMaster && pipeline.desktopMaster) {
      authorityPair = buildDraftPair(pipeline);
    } else if (pipeline.mobileMaster) {
      authorityPair = buildDraftPair(pipeline, 'MOBILE_ONLY');
    } else if (pipeline.desktopMaster) {
      authorityPair = buildDraftPair(pipeline, 'DESKTOP_ONLY');
    }
    return { ...pipeline, authorityPair };
  }
  if (authorityPair.status === 'PAIR_LOCKED') return pipeline;
  let status = authorityPair.status;
  if (pipeline.mobileMaster && pipeline.desktopMaster) status = 'PAIR_READY';
  else if (pipeline.mobileMaster) status = 'MOBILE_ONLY';
  else if (pipeline.desktopMaster) status = 'DESKTOP_ONLY';
  else status = 'DRAFT';
  return {
    ...pipeline,
    authorityPair: { ...authorityPair, status },
  };
}

function buildDraftPair(
  pipeline: DesignWorkspaceAuthorityPipelineState,
  status: DesignWorkspaceAuthorityPair['status'] = 'PAIR_READY',
): DesignWorkspaceAuthorityPair {
  const mobile = pipeline.mobileMaster;
  const desktop = pipeline.desktopMaster;
  const anchor = mobile ?? desktop!;
  const pairVersion = (pipeline.supersededPairs.length ?? 0) + 1;
  const resolvedStatus =
    status === 'PAIR_READY' && (!mobile || !desktop) ?
      mobile ? 'MOBILE_ONLY'
      : desktop ? 'DESKTOP_ONLY'
      : 'DRAFT'
    : status;
  return {
    id: `dwap-${pairVersion}-${Date.now()}`,
    projectId: anchor.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    mobileAuthorityId: mobile?.id ?? '',
    desktopAuthorityId: desktop?.id ?? '',
    pairVersion,
    status: resolvedStatus,
    createdAt: new Date().toISOString(),
    lockedAt: null,
    lockedBy: null,
    projectCreativeContextVersion: anchor.projectCreativeContextVersion,
    pairChecksum:
      mobile && desktop ? computePairChecksum(mobile, desktop) : '',
    supersedesPairId: pipeline.supersededPairs.at(-1)?.id ?? null,
    derivationStatus: 'NOT_STARTED',
  };
}

function groundingManifestIdForCandidate(
  session: DesignPageAuthorityReviewSession,
  territoryId: DesignPageV3TerritoryId,
  viewport: DesignPageV3ViewportAuthority,
): string | null {
  const manifests = session.lastResult?.authorityGroundedAssetManifests ?? [];
  const hit = manifests.find((m) => m.territoryId === territoryId && m.viewport === viewport);
  return hit?.authorityId ?? null;
}

export function getProjectCreativeContextVersion(session: DesignPageAuthorityReviewSession): string {
  return session.lastResult?.projectCreativeContextVersion ?? PROJECT_CREATIVE_CONTEXT_VERSION;
}

export function selectViewportCandidate(
  session: DesignPageAuthorityReviewSession,
  viewport: DesignPageV3ViewportAuthority,
  ref: ViewportCandidateRef,
): DesignPageAuthorityReviewSession {
  const found = findCandidateInGallery(session, ref.candidateId);
  if (!found || found.territoryId !== ref.territoryId) {
    throw new Error('CANDIDATE_NOT_FOUND');
  }
  const pipelineViewport = toPipelineViewport(viewport);
  const vk = viewportKey(pipelineViewport);
  let pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  if (pipeline.authorityPair?.status === 'PAIR_LOCKED') {
    throw new Error('DESIGN_AUTHORITY_PAIR_LOCKED');
  }

  const states = { ...pipeline.candidateViewportStates };
  for (const id of Object.keys(states)) {
    const row = ensureCandidateStates(states, id);
    if (row[vk] === 'SELECTED') {
      states[id] = { ...row, [vk]: 'NOT_SELECTED' };
    }
  }
  const cur = ensureCandidateStates(states, ref.candidateId);
  states[ref.candidateId] = {
    ...cur,
    [vk]: cur[vk] === 'PROMOTED' ? 'PROMOTED' : 'SELECTED',
  };

  pipeline = {
    ...pipeline,
    viewportSelection: { ...pipeline.viewportSelection, [vk]: ref },
    candidateViewportStates: states,
  };
  pipeline = pushEvent(pipeline, {
    type: 'VIEWPORT_SELECTED',
    viewport: pipelineViewport,
    candidateId: ref.candidateId,
    territoryId: ref.territoryId,
  });

  return normalizeDesignPageAuthoritySession({
    ...session,
    authorityPipeline: syncPairStatus(pipeline),
    updatedAt: new Date().toISOString(),
  });
}

export function unselectViewportCandidate(
  session: DesignPageAuthorityReviewSession,
  viewport: DesignPageV3ViewportAuthority,
): DesignPageAuthorityReviewSession {
  const pipelineViewport = toPipelineViewport(viewport);
  const vk = viewportKey(pipelineViewport);
  let pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  if (pipeline.authorityPair?.status === 'PAIR_LOCKED') {
    throw new Error('DESIGN_AUTHORITY_PAIR_LOCKED');
  }
  const ref = pipeline.viewportSelection[vk];
  if (ref) {
    const states = { ...pipeline.candidateViewportStates };
    const cur = ensureCandidateStates(states, ref.candidateId);
    if (cur[vk] === 'SELECTED') {
      states[ref.candidateId] = { ...cur, [vk]: 'NOT_SELECTED' };
    }
    pipeline = {
      ...pipeline,
      viewportSelection: { ...pipeline.viewportSelection, [vk]: null },
      candidateViewportStates: states,
    };
    pipeline = pushEvent(pipeline, {
      type: 'VIEWPORT_UNSELECTED',
      viewport: pipelineViewport,
      candidateId: ref.candidateId,
      territoryId: ref.territoryId,
    });
  }
  return normalizeDesignPageAuthoritySession({
    ...session,
    authorityPipeline: syncPairStatus(pipeline),
    updatedAt: new Date().toISOString(),
  });
}

/** Founder confirmed replace of promoted master — clears slot; prior master kept in supersededMasters. */
export function beginViewportMasterReplacement(
  session: DesignPageAuthorityReviewSession,
  viewport: DesignPageV3ViewportAuthority,
): DesignPageAuthorityReviewSession {
  const pipelineViewport = toPipelineViewport(viewport);
  const vk = viewportKey(pipelineViewport);
  let pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  if (pipeline.authorityPair?.status === 'PAIR_LOCKED') {
    throw new Error('DESIGN_AUTHORITY_PAIR_LOCKED');
  }
  const current = pipelineViewport === 'MOBILE' ? pipeline.mobileMaster : pipeline.desktopMaster;
  if (!current) {
    return unselectViewportCandidate(session, viewport);
  }
  let supersededMasters = [...pipeline.supersededMasters, { ...current, status: 'SUPERSEDED' as const }];
  pipeline = pushEvent(pipeline, {
    type: 'VIEWPORT_MASTER_SUPERSEDED',
    viewport: pipelineViewport,
    authorityId: current.id,
    note: 'founder initiated replacement',
  });
  if (pipeline.authorityPair?.derivationStatus === 'IN_PROGRESS' || pipeline.authorityPair?.derivationStatus === 'COMPLETE') {
    pipeline = {
      ...pipeline,
      authorityPair: pipeline.authorityPair ? { ...pipeline.authorityPair, derivationStatus: 'STALE' } : null,
    };
    pipeline = pushEvent(pipeline, { type: 'DERIVATION_MARKED_STALE', pairId: pipeline.authorityPair?.id });
  }
  const states = { ...pipeline.candidateViewportStates };
  const cur = ensureCandidateStates(states, current.sourceConceptCandidateId);
  if (cur[vk] === 'PROMOTED') {
    states[current.sourceConceptCandidateId] = { ...cur, [vk]: 'SUPERSEDED' };
  }
  pipeline = {
    ...pipeline,
    supersededMasters,
    candidateViewportStates: states,
    viewportSelection: { ...pipeline.viewportSelection, [vk]: null },
    mobileMaster: pipelineViewport === 'MOBILE' ? null : pipeline.mobileMaster,
    desktopMaster: pipelineViewport === 'DESKTOP' ? null : pipeline.desktopMaster,
    authorityPair: null,
  };
  pipeline = syncPairStatus(pipeline);
  return normalizeDesignPageAuthoritySession({
    ...session,
    authorityPipeline: pipeline,
    updatedAt: new Date().toISOString(),
  });
}

export function promoteViewportMaster(
  session: DesignPageAuthorityReviewSession,
  viewport: DesignPageV3ViewportAuthority,
  promotedBy = 'founder',
): DesignPageAuthorityReviewSession {
  const pipelineViewport = toPipelineViewport(viewport);
  const vk = viewportKey(pipelineViewport);
  let pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  const ref = pipeline.viewportSelection[vk];
  if (!ref) throw new Error(`DESIGN_AUTHORITY_${pipelineViewport}_MISSING`);
  const found = findCandidateInGallery(session, ref.candidateId);
  if (!found) throw new Error('CANDIDATE_NOT_FOUND');

  const artifact = artifactForViewport(found.candidate, pipelineViewport);
  if (artifact.viewport !== viewport) {
    throw new Error('VIEWPORT_SLOT_MISMATCH');
  }

  const coverageKey = `${ref.candidateId}:${viewport}`;
  const receipt = session.featureAuthority?.candidateCoverageById[coverageKey] ?? null;
  assertFeatureCoverageForPromotion(receipt);

  const supersede = pipelineViewport === 'MOBILE' ? pipeline.mobileMaster : pipeline.desktopMaster;
  if (supersede) assertMasterNotFeatureStale(supersede);
  let supersededMasters = pipeline.supersededMasters;
  if (supersede) {
    supersededMasters = [...supersededMasters, { ...supersede, status: 'SUPERSEDED' }];
    pipeline = pushEvent(pipeline, {
      type: 'VIEWPORT_MASTER_SUPERSEDED',
      viewport: pipelineViewport,
      authorityId: supersede.id,
      note: 'replaced by founder promotion',
    });
    if (pipeline.authorityPair?.derivationStatus === 'IN_PROGRESS' || pipeline.authorityPair?.derivationStatus === 'COMPLETE') {
      pipeline = {
        ...pipeline,
        authorityPair: pipeline.authorityPair
          ? { ...pipeline.authorityPair, derivationStatus: 'STALE' }
          : null,
      };
      pipeline = pushEvent(pipeline, { type: 'DERIVATION_MARKED_STALE', pairId: pipeline.authorityPair?.id });
    }
  }

  const version = supersede ? supersede.version + 1 : 1;
  const master: ViewportMasterAuthority = {
    id: `vma-${pipelineViewport.toLowerCase()}-v${version}-${Date.now()}`,
    projectId: session.projectId,
    workspaceType: 'DESIGN_PAGE_V3',
    viewport: pipelineViewport,
    sourceConceptCandidateId: ref.candidateId,
    sourceGenerationId: found.candidate.batchGeneration,
    sourceTerritoryId: found.territoryId,
    authorityImageId: artifact.artifactId,
    authorityImageHash: computeAuthorityImageHash(artifact),
    authorityImageUri: artifact.storageUrl,
    projectCreativeContextVersion: getProjectCreativeContextVersion(session),
    designWorkspaceFeatureManifestVersion: loadActiveDesignWorkspaceFeatureManifest().version,
    groundingManifestId: groundingManifestIdForCandidate(session, found.territoryId, viewport),
    lineageId: P0_VR_TWIN_V30R5F1_LINEAGE,
    promotedBy,
    promotedAt: new Date().toISOString(),
    status: 'PROMOTED',
    version,
    supersedesAuthorityId: supersede?.id ?? null,
    immutableAfterPairLock: false,
  };

  const states = { ...pipeline.candidateViewportStates };
  const cur = ensureCandidateStates(states, ref.candidateId);
  states[ref.candidateId] = { ...cur, [vk]: 'PROMOTED' };

  pipeline = {
    ...pipeline,
    supersededMasters,
    candidateViewportStates: states,
    mobileMaster: pipelineViewport === 'MOBILE' ? master : pipeline.mobileMaster,
    desktopMaster: pipelineViewport === 'DESKTOP' ? master : pipeline.desktopMaster,
  };
  pipeline = pushEvent(pipeline, {
    type: 'VIEWPORT_MASTER_PROMOTED',
    viewport: pipelineViewport,
    candidateId: ref.candidateId,
    territoryId: ref.territoryId,
    authorityId: master.id,
  });

  if (pipeline.mobileMaster && pipeline.desktopMaster) {
    const pair = buildDraftPair(pipeline, 'PAIR_READY');
    pipeline = { ...pipeline, authorityPair: pair };
  } else {
    pipeline = syncPairStatus(pipeline);
  }

  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  const bindings = buildPromotionFeatureBindings(master, manifest.requiredFeatureIds);
  const featureAuthority = session.featureAuthority ?? {
    activeManifest: manifest,
    changeSets: [],
    amendments: [],
    candidateCoverageById: {},
    masterBindings: [],
  };

  return normalizeDesignPageAuthoritySession({
    ...session,
    authorityPipeline: pipeline,
    featureAuthority: {
      ...featureAuthority,
      masterBindings: [...featureAuthority.masterBindings, ...bindings],
    },
    updatedAt: new Date().toISOString(),
  });
}

export function lockDesignWorkspaceAuthorityPair(
  session: DesignPageAuthorityReviewSession,
  lockedBy = 'founder',
): DesignPageAuthorityReviewSession {
  const gate = runDesignAuthorityPairReadinessGate(session, { requireLocked: false });
  if (!gate.pass) {
    throw new Error(gate.errors[0] ?? 'DESIGN_AUTHORITY_PAIR_NOT_READY');
  }
  let pipeline = session.authorityPipeline!;
  const mobile = pipeline.mobileMaster!;
  const desktop = pipeline.desktopMaster!;
  const lockedAt = new Date().toISOString();
  const pair: DesignWorkspaceAuthorityPair = {
    ...(pipeline.authorityPair ?? buildDraftPair(pipeline, 'PAIR_READY')),
    status: 'PAIR_LOCKED',
    lockedAt,
    lockedBy,
    pairChecksum: computePairChecksum(mobile, desktop),
    derivationStatus: 'READY',
  };
  pipeline = {
    ...pipeline,
    executionIntent: 'TRANSLATION',
    inventionBudget: 'NONE',
    mobileMaster: { ...mobile, status: 'PAIR_LOCKED', immutableAfterPairLock: true },
    desktopMaster: { ...desktop, status: 'PAIR_LOCKED', immutableAfterPairLock: true },
    authorityPair: { ...pair, status: 'PAIR_LOCKED', derivationStatus: 'READY' },
  };
  pipeline = pushEvent(pipeline, { type: 'PAIR_LOCKED', pairId: pair.id });

  const founderReview = {
    ...session.founderReview,
    mobileApproved: true,
    desktopApproved: true,
    mobileLockId: DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
    desktopLockId: DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
    lastAction: 'APPROVE' as const,
    updatedAt: lockedAt,
  };

  return normalizeDesignPageAuthoritySession({
    ...session,
    authorityPipeline: pipeline,
    founderReview,
    updatedAt: lockedAt,
  });
}

export type DesignAuthorityPairReadinessGateResult = {
  pass: boolean;
  errors: string[];
  mobileAuthorityId: string | null;
  desktopAuthorityId: string | null;
  pairChecksum: string | null;
};

export function runDesignAuthorityPairReadinessGate(
  session: DesignPageAuthorityReviewSession,
  input?: { requireLocked?: boolean },
): DesignAuthorityPairReadinessGateResult {
  const errors: string[] = [];
  const pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  const requireLocked = input?.requireLocked ?? true;

  if (!pipeline.mobileMaster) errors.push('DESIGN_AUTHORITY_MOBILE_MISSING');
  if (!pipeline.desktopMaster) errors.push('DESIGN_AUTHORITY_DESKTOP_MISSING');

  if (pipeline.mobileMaster && !pipeline.mobileMaster.authorityImageHash) {
    errors.push('DESIGN_AUTHORITY_HASH_MISMATCH');
  }
  if (pipeline.desktopMaster && !pipeline.desktopMaster.authorityImageHash) {
    errors.push('DESIGN_AUTHORITY_HASH_MISMATCH');
  }

  if (!getProjectCreativeContextVersion(session)) {
    errors.push('DESIGN_AUTHORITY_CONTEXT_STALE');
  }

  if (pipeline.mobileMaster && !pipeline.mobileMaster.groundingManifestId && session.lastResult?.ungroundedAssetCount === 0) {
    /* grounding optional for prototype-only sessions */
  }

  const pair = pipeline.authorityPair;
  if (requireLocked) {
    if (!pair || pair.status !== 'PAIR_LOCKED') {
      errors.push('DESIGN_AUTHORITY_PAIR_NOT_LOCKED');
    }
  } else {
    if (!pipeline.mobileMaster || !pipeline.desktopMaster) {
      errors.push('DESIGN_AUTHORITY_PAIR_NOT_READY');
    }
  }

  if (pair && pipeline.mobileMaster && pipeline.desktopMaster) {
    const checksum = computePairChecksum(pipeline.mobileMaster, pipeline.desktopMaster);
    if (pair.pairChecksum && pair.pairChecksum !== checksum && pair.status === 'PAIR_LOCKED') {
      errors.push('DESIGN_AUTHORITY_HASH_MISMATCH');
    }
  }

  return {
    pass: errors.length === 0,
    errors,
    mobileAuthorityId: pipeline.mobileMaster?.id ?? null,
    desktopAuthorityId: pipeline.desktopMaster?.id ?? null,
    pairChecksum:
      pipeline.mobileMaster && pipeline.desktopMaster ?
        computePairChecksum(pipeline.mobileMaster, pipeline.desktopMaster)
      : null,
  };
}

export function assertDerivationAllowed(session: DesignPageAuthorityReviewSession): void {
  const gate = runDesignAuthorityPairReadinessGate(session, { requireLocked: true });
  if (!gate.pass) {
    throw new Error(gate.errors[0] ?? 'DESIGN_AUTHORITY_DERIVATION_BLOCKED');
  }
  const pair = session.authorityPipeline?.authorityPair;
  if (pair?.derivationStatus === 'STALE') {
    throw new Error('DESIGN_AUTHORITY_DERIVATION_STALE');
  }
  assertMasterNotFeatureStale(session.authorityPipeline?.mobileMaster);
  assertMasterNotFeatureStale(session.authorityPipeline?.desktopMaster);
}

export function getCandidateViewportState(
  session: DesignPageAuthorityReviewSession,
  candidateId: string,
  viewport: DesignPageV3ViewportAuthority,
): ConceptCandidateAuthorityState {
  const vk = viewportKey(toPipelineViewport(viewport));
  const pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  return ensureCandidateStates(pipeline.candidateViewportStates, candidateId)[vk];
}

export function isViewportCandidateSelected(
  session: DesignPageAuthorityReviewSession,
  viewport: DesignPageV3ViewportAuthority,
  ref: ViewportCandidateRef,
): boolean {
  const vk = viewportKey(toPipelineViewport(viewport));
  const sel = session.authorityPipeline?.viewportSelection[vk];
  return sel?.candidateId === ref.candidateId && sel.territoryId === ref.territoryId;
}

export function pairStatusLabel(session: DesignPageAuthorityReviewSession): string {
  const pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  const pair = pipeline.authorityPair;
  if (pair?.status === 'PAIR_LOCKED') return 'PAIR LOCKED — TRANSLATION MODE';
  if (pair?.status === 'PAIR_READY') return 'READY TO LOCK';
  if (pipeline.mobileMaster && !pipeline.desktopMaster) return 'MOBILE MASTER SET — DESKTOP REQUIRED';
  if (pipeline.desktopMaster && !pipeline.mobileMaster) return 'DESKTOP MASTER SET — MOBILE REQUIRED';
  if (pipeline.viewportSelection.mobile || pipeline.viewportSelection.desktop) return 'SELECTION IN PROGRESS';
  return 'SELECT MOBILE + DESKTOP MASTERS';
}

/** Register new gallery candidates as GENERATED without deleting siblings. */
export function registerGeneratedCandidates(session: DesignPageAuthorityReviewSession): DesignPageAuthorityReviewSession {
  const pipeline = session.authorityPipeline ?? emptyAuthorityPipelineState();
  const states = { ...pipeline.candidateViewportStates };
  for (const territoryId of ['A', 'B', 'C'] as const) {
    for (const c of session.territoryGallery[territoryId]) {
      if (!states[c.candidateId]) {
        states[c.candidateId] = { mobile: 'GENERATED', desktop: 'GENERATED' };
      }
    }
  }
  return {
    ...session,
    authorityPipeline: { ...pipeline, candidateViewportStates: states },
  };
}

export function resolveViewportMasterArtifact(
  session: DesignPageAuthorityReviewSession,
  viewport: DesignPageV3ViewportAuthority,
): DesignPageAuthorityVisualArtifact | null {
  const master =
    viewport === 'mobile' ?
      session.authorityPipeline?.mobileMaster
    : session.authorityPipeline?.desktopMaster;
  if (!master) return null;
  const found = findCandidateInGallery(session, master.sourceConceptCandidateId);
  if (!found) {
    return {
      artifactId: master.authorityImageId,
      viewport,
      storageUrl: master.authorityImageUri,
      widthHintPx: viewport === 'mobile' ? 430 : 1440,
      heightHintPx: viewport === 'mobile' ? 920 : 900,
      provider: 'viewport-master',
      model: 'immutable',
      providerJobRef: master.id,
      representativePrototype: master.authorityImageUri.includes('.svg'),
      createdAt: master.promotedAt,
    };
  }
  return viewport === 'mobile' ? found.candidate.mobile : found.candidate.desktop;
}
