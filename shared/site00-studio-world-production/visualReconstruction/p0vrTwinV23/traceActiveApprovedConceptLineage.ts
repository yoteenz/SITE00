import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ExecutableConceptPackage } from '../p0vrTwinV22/types.js';
import { ensureConceptGallery, getActiveConceptCandidate } from '../p0vrTwinV22/conceptGalleryState.js';
import type { ActiveApprovedConceptTrace } from './types.js';

export function resolveExecutablePackageForConcept(
  session: ConceptDirectedTwinSession,
  conceptId: string,
): ExecutableConceptPackage | null {
  const gallery = session.conceptGallery;
  if (!gallery) return null;
  return Object.values(gallery.packages).find((p) => p.conceptId === conceptId) ?? null;
}

export function traceActiveApprovedConceptLineage(session: ConceptDirectedTwinSession): ActiveApprovedConceptTrace {
  const base = ensureConceptGallery(session);
  const active = getActiveConceptCandidate(base);
  const conceptId = active?.conceptId ?? null;
  const pkg = conceptId ? resolveExecutablePackageForConcept(base, conceptId) : null;

  const executionBlueprintId =
    active?.executionBlueprintId ??
    (pkg ? pkg.blueprint.blueprintId : null) ??
    active?.conceptBlueprintId ??
    null;

  const hostShellContractId = pkg?.hostShellContract ? `hsc-${pkg.conceptId}` : null;

  const ids = [
    conceptId,
    active?.founderJudgment === 'APPROVED' ? conceptId : null,
    conceptId,
    pkg?.blueprint.conceptId ?? null,
    pkg?.assetManifest.conceptId ?? null,
    pkg?.functionBindingPlan.conceptId ?? null,
  ].filter(Boolean);

  const lineageConsistent =
    ids.length > 0 && new Set(ids).size === 1 && (!pkg || pkg.conceptId === conceptId);

  return {
    activeConceptId: conceptId,
    approvedConceptId: active?.founderJudgment === 'APPROVED' ? conceptId : null,
    approvedVisualAuthorityId: conceptId,
    executionBlueprintId,
    assetManifestId: active?.assetManifestId ?? pkg?.assetManifest.manifestId ?? null,
    functionBindingPlanId: active?.functionBindingPlanId ?? pkg?.functionBindingPlan.bindingPlanId ?? null,
    hostShellContractId,
    executablePackageId: pkg?.packageId ?? null,
    currentTwinV2Id: session.sessionId,
    lineageConsistent,
  };
}
