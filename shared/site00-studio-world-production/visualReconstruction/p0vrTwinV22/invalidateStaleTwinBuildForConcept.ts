import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import { getActiveConceptCandidate } from './conceptGalleryState.js';

/**
 * After GENERATE / REGENERATE / REFINE, a new gallery candidate becomes active.
 * Drop compiled-twin artifacts that belong to a different concept so the UI shows
 * the new concept visual instead of the previous build render.
 */
export function invalidateStaleTwinBuildForActiveConcept(
  session: ConceptDirectedTwinSession,
): ConceptDirectedTwinSession {
  const active = getActiveConceptCandidate(session);
  if (!active?.conceptId) return session;

  const compiler = session.twinV2VisualCompiler;
  const compilerConceptId =
    compiler?.compilerInvocationReceipt?.conceptId ??
    compiler?.visualImplementationPlan?.conceptId ??
    compiler?.compilerInputReceipt?.conceptId ??
    null;
  const builtFor = session.renderedTwin?.sourceConceptId ?? compilerConceptId ?? null;
  const hasBuiltTwin = Boolean(session.renderedTwin?.builtAt);
  const conceptChanged = builtFor != null && builtFor !== active.conceptId;
  const visualMismatch =
    Boolean(active.visualAssetUrl && compiler?.visualAuthority?.assetUrl) &&
    compiler!.visualAuthority.assetUrl !== active.visualAssetUrl;
  const stale =
    (hasBuiltTwin || compiler) && (conceptChanged || visualMismatch);

  if (!stale) {
    return session;
  }

  return {
    ...session,
    renderedTwin: null,
    twinV2VisualCompiler: null,
    twinV2Execution: null,
    twinV2DomTranslation: null,
    packageDrivenBuild: null,
    fidelityReceipt: null,
    status: 'TWIN_V2_CONCEPT_READY',
    sourceGeneration: {
      ...session.sourceGeneration,
      codeAllowed: active.founderJudgment === 'APPROVED' && active.buildReadiness.status !== 'VISUAL_ONLY',
    },
    updatedAt: new Date().toISOString(),
  };
}
