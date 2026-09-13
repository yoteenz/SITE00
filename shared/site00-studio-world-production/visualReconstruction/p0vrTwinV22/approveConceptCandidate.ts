import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { buildApprovedVisualToCodePlan } from '../p0vrTwinV21/buildApprovedVisualToCodePlan.js';
import { buildTwinV2VisualSpec } from '../p0vrTwinV21/buildTwinV2VisualSpec.js';
import { buildExecutableConceptPackage } from './buildExecutableConceptPackage.js';
import { computeConceptBuildReadiness, canBuildConcept } from './computeConceptBuildReadiness.js';
import { ensureConceptGallery, getActiveConceptCandidate } from './conceptGalleryState.js';
import { applyBlueprintOwnershipTags } from '../p0vrTwinV22R2/applyBlueprintOwnershipTags.js';
import { sanitizeConceptForHostBoundary } from '../p0vrTwinV22R2/sanitizeConceptForHostBoundary.js';

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

  const now = new Date().toISOString();
  const updatedCandidate = {
    ...active,
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
    conceptGallery: { ...gallery, candidates, activeConceptId: active.conceptId },
    updatedAt: now,
  };

  if (canBuildConcept(updatedCandidate.buildReadiness, true)) {
    const pkg = buildExecutableConceptPackage({
      candidate: updatedCandidate,
      blueprint: executableBlueprint,
      manifest,
      bindingPlan,
      shellContract: [
        base.brandContext.hostClientFirewall,
        'SITE_00 bottom nav — TwinSite00HostBottomNav (canonical, not generated)',
      ],
      hostShellContract: hostBoundary.hostShellContract,
      hostBoundary,
    });
    next = {
      ...next,
      conceptGallery: {
        ...next.conceptGallery!,
        packages: { ...gallery.packages, [pkg.packageId]: pkg },
      },
    };
  }

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
