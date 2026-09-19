import type { ConceptDirectedTwinSession, VisualConceptVersion } from './types.js';
import { buildApprovedVisualToCodePlan } from './buildApprovedVisualToCodePlan.js';
import { buildTwinV2VisualSpec } from './buildTwinV2VisualSpec.js';

export function applyApproveVisualConcept(session: ConceptDirectedTwinSession, versionId: string): ConceptDirectedTwinSession {
  const version = session.history.find((v) => v.versionId === versionId);
  if (!version?.imageUrl && !version?.imageStorageRef) {
    throw new Error('Cannot approve concept without image');
  }
  const now = new Date().toISOString();
  const approvedVisualAuthority = {
    versionId,
    imageUrl: version.imageUrl,
    imageStorageRef: version.imageStorageRef,
    lockedAt: now,
  };
  const approvedVisualToCodePlan = buildApprovedVisualToCodePlan(session, versionId);
  const twinV2VisualSpec = buildTwinV2VisualSpec(session, approvedVisualAuthority);
  return {
    ...session,
    status: 'TWIN_V2_APPROVED',
    founderJudgment: {
      ...session.founderJudgment,
      lastAction: 'APPROVE',
      approvedVersionId: versionId,
      updatedAt: now,
    },
    approvedVisualAuthority,
    approvedVisualToCodePlan,
    twinV2VisualSpec,
    sourceGeneration: { ...session.sourceGeneration, codeAllowed: true },
    history: session.history.map((h) =>
      h.versionId === versionId ? { ...h, status: 'APPROVED' as const } : { ...h, status: 'SUPERSEDED' as const },
    ),
    updatedAt: now,
  };
}

export function appendVisualConceptVersion(
  session: ConceptDirectedTwinSession,
  version: VisualConceptVersion,
): ConceptDirectedTwinSession {
  const label =
    version.founderInstruction != null
      ? `REFINE ${session.history.filter((h) => h.founderInstruction).length + 1}`
      : `CONCEPT ${session.history.filter((h) => !h.founderInstruction).length + 1}`;
  return {
    ...session,
    visualConcept: {
      conceptId: version.versionId,
      imageUrl: version.imageUrl,
      imageStorageRef: version.imageStorageRef,
      provider: 'fal-gpt-image-2',
      model: 'openai/gpt-image-2',
      promptDigest: version.creativeDirection.creativePremise.slice(0, 120),
      status: version.imageUrl || version.imageStorageRef ? 'READY' : 'FAILED',
    },
    status: version.founderInstruction ? 'TWIN_V2_REFINING' : 'TWIN_V2_CONCEPT_READY',
    history: [...session.history, { ...version, label }],
    updatedAt: new Date().toISOString(),
  };
}
