import { appendVisualConceptVersion } from './applyFounderVisualJudgment.js';
import {
  addConceptCandidateFromGeneration,
  ensureConceptGallery,
  getActiveConceptCandidate,
} from '../p0vrTwinV22/conceptGalleryState.js';
import { finalizeDualOutputConceptGeneration } from '../p0vrTwinV25/finalizeDualOutputConceptGeneration.js';
import { reconcileTwinV2SessionState } from '../p0vrTwinV22/reconcileTwinV2SessionState.js';
import type { ConceptGenerationType } from '../p0vrTwinV22/types.js';
import type { ConceptDirectedTwinSession, PageCreativeDirection, VisualConceptVersion } from './types.js';

export function recordFounderVisualSpendIntent(
  session: ConceptDirectedTwinSession,
  action: 'generate' | 'regenerate' | 'refine',
): ConceptDirectedTwinSession {
  const now = new Date().toISOString();
  return {
    ...session,
    founderJudgment: {
      ...session.founderJudgment,
      lastAction: action === 'refine' ? 'REFINE' : action === 'regenerate' ? 'REGENERATE' : null,
      updatedAt: now,
    },
    status: action === 'refine' ? 'TWIN_V2_REFINING' : session.status,
    updatedAt: now,
  };
}

export function mergeVisualConceptApiResult(
  session: ConceptDirectedTwinSession,
  input: {
    action: 'generate' | 'regenerate' | 'refine';
    imageUrl: string;
    imageStorageRef: string | null;
    refineInstruction?: string | null;
    parentVersionId?: string | null;
  },
): ConceptDirectedTwinSession {
  if (!session.creativeDirection) {
    throw new Error('TWIN_V2_VISUAL: missing creative direction');
  }
  const versionId = `vc-${session.sessionId}-${Date.now()}-${session.history.length}`;
  const creativeDirection: PageCreativeDirection = session.creativeDirection;
  const version: VisualConceptVersion = {
    versionId,
    sessionId: session.sessionId,
    label: '',
    imageUrl: input.imageUrl,
    imageStorageRef: input.imageStorageRef,
    creativeDirection,
    founderInstruction: input.refineInstruction ?? null,
    parentVersionId: input.parentVersionId ?? session.history.at(-1)?.versionId ?? null,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  };
  const activeBefore = getActiveConceptCandidate(session);
  let next = appendVisualConceptVersion(session, version);
  const genType: ConceptGenerationType =
    input.action === 'refine' ? 'REFINED' : input.action === 'regenerate' ? 'REGENERATED' : 'INITIAL';
  const parentId =
    input.action === 'refine'
      ? (activeBefore?.conceptId ??
          (input.parentVersionId
            ? next.conceptGallery?.candidates.find((c) => c.legacyVersionId === input.parentVersionId)?.conceptId ??
              null
            : null))
      : null;

  const pendingDualOutput = next.conceptGallery?.pendingDualOutput ?? null;
  if (pendingDualOutput) {
    next = finalizeDualOutputConceptGeneration(
      { ...next, conceptGallery: { ...next.conceptGallery!, pendingDualOutput } },
      {
        imageUrl: input.imageUrl,
        imageStorageRef: input.imageStorageRef,
        legacyVersionId: version.versionId,
      },
    );
  } else {
    if (!next.conceptGallery?.candidates.length || !next.conceptGallery.buildRef) {
      next = ensureConceptGallery(next);
    }
    next = addConceptCandidateFromGeneration(next, {
      generationType: genType,
      imageUrl: input.imageUrl,
      imageStorageRef: input.imageStorageRef,
      founderInstruction: input.refineInstruction ?? null,
      parentConceptId: parentId,
      creativeDirection,
    });
  }

  const linkedLegacyId = version.versionId;
  next = {
    ...next,
    conceptGallery: next.conceptGallery
      ? {
          ...next.conceptGallery,
          candidates: next.conceptGallery.candidates.map((c) =>
            c.conceptId === next.conceptGallery!.activeConceptId ? { ...c, legacyVersionId: linkedLegacyId } : c,
          ),
        }
      : next.conceptGallery,
    status: 'TWIN_V2_CONCEPT_READY',
    founderJudgment: {
      ...next.founderJudgment,
      lastAction: input.action === 'refine' ? 'REFINE' : input.action === 'regenerate' ? 'REGENERATE' : null,
      refineInstruction: input.refineInstruction ?? null,
      updatedAt: new Date().toISOString(),
    },
  };
  return reconcileTwinV2SessionState(next);
}
