/**
 * P0.VR.CONVERGE.1 — Founder visual review after twin exists.
 */

import type { FounderVisualCorrection, VisualRefinementSession } from './types.js';

export function createVisualRefinementSession(input: {
  sessionId: string;
  authorityVersionId: string;
  twinVersionId?: string | null;
}): VisualRefinementSession {
  return {
    sessionId: input.sessionId,
    twinVersionId: input.twinVersionId ?? null,
    authorityVersionId: input.authorityVersionId,
    reviewItems: [],
    founderNotes: [],
    status: 'OPEN',
  };
}

export function addFounderVisualCorrection(
  session: VisualRefinementSession,
  instruction: string,
  regionId: string | null = null,
): { session: VisualRefinementSession; correction: FounderVisualCorrection } {
  const correction: FounderVisualCorrection = {
    correctionId: `fvc_${session.sessionId}_${session.founderNotes.length + 1}`,
    sessionId: session.sessionId,
    regionId,
    instruction: instruction.trim(),
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };
  return {
    session: {
      ...session,
      status: 'REFINING',
      founderNotes: [...session.founderNotes, correction],
      reviewItems: [...session.reviewItems, instruction.trim()],
    },
    correction,
  };
}
