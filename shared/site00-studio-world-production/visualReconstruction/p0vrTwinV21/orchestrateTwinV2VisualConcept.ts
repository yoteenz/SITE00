import { appendVisualConceptVersion } from './applyFounderVisualJudgment.js';
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
  const versionId = `vc-${session.sessionId}-${Date.now()}`;
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
  let next = appendVisualConceptVersion(session, version);
  next = {
    ...next,
    status: 'TWIN_V2_CONCEPT_READY',
    founderJudgment: {
      ...next.founderJudgment,
      lastAction: input.action === 'refine' ? 'REFINE' : input.action === 'regenerate' ? 'REGENERATE' : null,
      refineInstruction: input.refineInstruction ?? null,
      updatedAt: new Date().toISOString(),
    },
  };
  return next;
}
