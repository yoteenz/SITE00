import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { buildApprovedVisualToCodePlan } from '../p0vrTwinV21/buildApprovedVisualToCodePlan.js';
import { buildTwinV2VisualSpec } from '../p0vrTwinV21/buildTwinV2VisualSpec.js';
import { buildExecutableConceptPackage } from './buildExecutableConceptPackage.js';
import { computeConceptBuildReadiness, canBuildConcept } from './computeConceptBuildReadiness.js';
import { ensureConceptGallery, getActiveConceptCandidate } from './conceptGalleryState.js';

export function approveActiveConceptCandidate(session: ConceptDirectedTwinSession): ConceptDirectedTwinSession {
  const base = ensureConceptGallery(session);
  const gallery = base.conceptGallery!;
  const active = getActiveConceptCandidate(base);
  if (!active?.visualAssetUrl && !active?.visualAsset) {
    throw new Error('Cannot approve concept without persistent image');
  }

  const blueprint = gallery.blueprints[active.conceptBlueprintId];
  const manifest = gallery.manifests[active.assetManifestId];
  const bindingPlan = gallery.bindingPlans[active.functionBindingPlanId];
  if (!blueprint || !manifest || !bindingPlan) {
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
      blueprint,
      manifest,
      bindingPlan,
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
      blueprint,
      manifest,
      bindingPlan,
      shellContract: [base.brandContext.hostClientFirewall, 'SITE_00 bottom nav host strip'],
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
