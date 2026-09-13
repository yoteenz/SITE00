import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type {
  ConceptAssetManifest,
  ConceptBlueprint,
  ConceptCandidate,
  ConceptFunctionBindingPlan,
} from './types.js';
import { buildApprovedVisualToCodePlan } from '../p0vrTwinV21/buildApprovedVisualToCodePlan.js';
import { buildTwinV2VisualSpec } from '../p0vrTwinV21/buildTwinV2VisualSpec.js';
import { buildExecutableConceptPackage } from './buildExecutableConceptPackage.js';
import {
  computeConceptBuildReadiness,
  canBuildConcept,
  isConceptTechnicallyReadyForBuild,
} from './computeConceptBuildReadiness.js';
import { ensureConceptGallery, getActiveConceptCandidate } from './conceptGalleryState.js';
import { applyBlueprintOwnershipTags } from '../p0vrTwinV22R2/applyBlueprintOwnershipTags.js';
import { sanitizeConceptForHostBoundary } from '../p0vrTwinV22R2/sanitizeConceptForHostBoundary.js';
import { assertActiveConceptUsesExecutionBlueprint } from '../p0vrTwinV22R2/assertActiveConceptUsesExecutionBlueprint.js';
function activeConceptHasExecutablePackage(session: ConceptDirectedTwinSession): boolean {
  const gallery = session.conceptGallery;
  const active = gallery ? getActiveConceptCandidate(session) : null;
  if (!gallery || !active) return false;
  return Object.values(gallery.packages).some((p) => p.conceptId === active.conceptId);
}

function upsertExecutablePackageForActiveConcept(
  session: ConceptDirectedTwinSession,
  input: {
    candidate: ConceptCandidate;
    executableBlueprint: ConceptBlueprint;
    manifest: ConceptAssetManifest;
    bindingPlan: ConceptFunctionBindingPlan;
    hostBoundary: import('../p0vrTwinV22R2/types.js').SanitizedConceptBoundaryResult;
  },
): ConceptDirectedTwinSession {
  const gallery = session.conceptGallery!;
  const existing = Object.values(gallery.packages).find((p) => p.conceptId === input.candidate.conceptId);
  if (existing) return session;

  if (!canBuildConcept(input.candidate.buildReadiness, input.candidate.founderJudgment === 'APPROVED')) {
    return session;
  }

  const pkg = buildExecutableConceptPackage({
    candidate: input.candidate,
    blueprint: input.executableBlueprint,
    manifest: input.manifest,
    bindingPlan: input.bindingPlan,
    shellContract: [
      session.brandContext.hostClientFirewall,
      'SITE 00 bottom nav — TwinSite00HostBottomNav (canonical, not generated)',
    ],
    hostShellContract: input.hostBoundary.hostShellContract,
    hostBoundary: input.hostBoundary,
  });

  return {
    ...session,
    conceptGallery: {
      ...gallery,
      packages: { ...gallery.packages, [pkg.packageId]: pkg },
    },
  };
}

/** Approve (if needed), ensure executable package, then return session ready for compose. */
export function prepareConceptDirectedTwinV2Build(
  session: ConceptDirectedTwinSession,
): ConceptDirectedTwinSession {
  let working = ensureConceptGallery(session);
  const active = getActiveConceptCandidate(working);
  if (!active) {
    throw new Error('TWIN_V2_BUILD_BLOCKED: no active concept');
  }
  if (!isConceptTechnicallyReadyForBuild(active.buildReadiness)) {
    throw new Error(
      'TWIN_V2_BUILD_BLOCKED: complete VISUAL, BLUEPRINT, ASSETS, FUNCTIONS, and HOST BOUNDARY before build',
    );
  }

  if (active.founderJudgment !== 'APPROVED') {
    working = approveActiveConceptCandidate(working);
  } else if (!activeConceptHasExecutablePackage(working)) {
    working = approveActiveConceptCandidate(working);
  }

  if (!activeConceptHasExecutablePackage(working)) {
    throw new Error('TWIN_V2_CODE_BLOCKED: ExecutableConceptPackage required — approve failed or concept not build-ready');
  }

  return working;
}

export function approveActiveConceptCandidate(session: ConceptDirectedTwinSession): ConceptDirectedTwinSession {
  const base = ensureConceptGallery(session);
  const gallery = base.conceptGallery!;
  const active = getActiveConceptCandidate(base);
  if (!active?.visualAssetUrl && !active?.visualAsset) {
    throw new Error('Cannot approve concept without persistent image');
  }

  const blueprintRaw = gallery.blueprints[active.conceptBlueprintId];
  const manifest = gallery.manifests[active.assetManifestId];
  const bindingPlan = gallery.bindingPlans[active.functionBindingPlanId];
  const blueprint = applyBlueprintOwnershipTags(blueprintRaw, {
    fullPageConceptImage: Boolean(active.visualAssetUrl),
  });
  const hostBoundary = sanitizeConceptForHostBoundary({
    conceptId: active.conceptId,
    pageId: active.pageId,
    blueprint,
    originalConceptImageUrl: active.visualAssetUrl,
  });
  const executableBlueprint = hostBoundary.sanitizedBlueprint;
  if (!blueprint || !executableBlueprint || !manifest || !bindingPlan) {
    throw new Error('TWIN_V22: missing blueprint lineage for approve');
  }

  assertActiveConceptUsesExecutionBlueprint({
    candidate: { ...active, executionBlueprintId: executableBlueprint.blueprintId, originalBlueprintId: blueprint.blueprintId },
    gallery: {
      ...gallery,
      sanitizedBlueprints: {
        ...gallery.sanitizedBlueprints,
        [executableBlueprint.blueprintId]: executableBlueprint,
      },
    },
  });

  const now = new Date().toISOString();
  const updatedCandidate = {
    ...active,
    originalBlueprintId: blueprint.blueprintId,
    executionBlueprintId: executableBlueprint.blueprintId,
    founderJudgment: 'APPROVED' as const,
    visualAuthorityStatus: 'LOCKED_FOR_BUILD' as const,
    status: 'APPROVED' as const,
    buildReadiness: computeConceptBuildReadiness({
      candidate: { ...active, founderJudgment: 'APPROVED', visualAuthorityStatus: 'LOCKED_FOR_BUILD' },
      blueprint: executableBlueprint,
      manifest,
      bindingPlan,
      hostBoundary,
    }),
    updatedAt: now,
  };

  const candidates = gallery.candidates.map((c) => (c.conceptId === active.conceptId ? updatedCandidate : c));

  const legacyVersionId = active.legacyVersionId ?? active.conceptId;
  const approvedVisualAuthority = {
    versionId: legacyVersionId,
    imageUrl: active.visualAssetUrl,
    imageStorageRef: active.visualAsset,
    lockedAt: now,
  };

  let next: ConceptDirectedTwinSession = {
    ...base,
    status: 'TWIN_V2_APPROVED',
    founderJudgment: {
      ...base.founderJudgment,
      lastAction: 'APPROVE',
      approvedVersionId: legacyVersionId,
      updatedAt: now,
    },
    approvedVisualAuthority,
    approvedVisualToCodePlan: buildApprovedVisualToCodePlan(base, legacyVersionId),
    twinV2VisualSpec: buildTwinV2VisualSpec(base, approvedVisualAuthority),
    sourceGeneration: {
      codeAllowed: canBuildConcept(updatedCandidate.buildReadiness, true),
      lastBuildAt: base.sourceGeneration.lastBuildAt,
    },
    conceptGallery: {
      ...gallery,
      candidates,
      activeConceptId: active.conceptId,
      sanitizedBlueprints: {
        ...gallery.sanitizedBlueprints,
        [executableBlueprint.blueprintId]: executableBlueprint,
      },
      generatedHostArtifacts: {
        ...gallery.generatedHostArtifacts,
        [active.conceptId]: hostBoundary.generatedHostArtifacts,
      },
      clientCanvasBoundaries: {
        ...gallery.clientCanvasBoundaries,
        [active.conceptId]: hostBoundary.clientCanvasBoundary,
      },
    },
    updatedAt: now,
  };

  next = upsertExecutablePackageForActiveConcept(next, {
    candidate: updatedCandidate,
    executableBlueprint,
    manifest,
    bindingPlan,
    hostBoundary,
  });

  if (active.legacyVersionId) {
    next = {
      ...next,
      history: next.history.map((h) =>
        h.versionId === active.legacyVersionId
          ? { ...h, status: 'APPROVED' as const }
          : { ...h, status: 'SUPERSEDED' as const },
      ),
    };
  }

  return next;
}
