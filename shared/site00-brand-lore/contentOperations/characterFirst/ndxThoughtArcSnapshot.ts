/**
 * P0.5E.7A — Thought arc snapshot persistence.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { NDXContentSeed, NDXThoughtArcSnapshot } from './types.js';
import { CHARACTER_FIRST_REGENERATION_VERSION, NDX_THOUGHT_ARC_BEATS } from './constants.js';
import type { NdxPageRoleMapRole } from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
}

const DEFAULT_KNOWLEDGE_PROGRESSION: Array<{ slideNumber: number; state: NDXThoughtArcSnapshot['knowledgeStateProgression'][0]['state'] }> = [
  { slideNumber: 1, state: 'THINKS' },
  { slideNumber: 2, state: 'THINKS' },
  { slideNumber: 3, state: 'LEARNS' },
  { slideNumber: 4, state: 'LEARNS' },
  { slideNumber: 5, state: 'LEARNS' },
  { slideNumber: 6, state: 'CHANGED_MIND' },
  { slideNumber: 7, state: 'KNOWS' },
  { slideNumber: 8, state: 'KNOWS' },
];

/** Map page roles to knowledge states for credit utilization golden pilot */
export function knowledgeStateForPageRole(
  role: NdxPageRoleMapRole,
  slideNumber: number,
): NDXThoughtArcSnapshot['knowledgeStateProgression'][0]['state'] {
  switch (role) {
    case 'PERSONAL_CONTRADICTION':
    case 'INCITING_INCIDENT':
      return 'THINKS';
    case 'INITIAL_ASSUMPTION':
      return 'THINKS';
    case 'WHAT_I_MISSED':
    case 'SYSTEM_LOGIC':
    case 'TIMING_COMPLICATION':
    case 'DISCOVERY':
    case 'EVIDENCE':
    case 'COMPLICATION':
      return 'LEARNS';
    case 'BELIEF_REVISION':
    case 'CORRECTION':
      return 'CHANGED_MIND';
    case 'BEHAVIOR_CHANGE':
      return 'KNOWS';
    case 'BOOKMARK':
      return 'KNOWS';
    default:
      return DEFAULT_KNOWLEDGE_PROGRESSION[slideNumber - 1]?.state ?? 'LEARNS';
  }
}

export function buildNDXThoughtArcSnapshot(
  seed: NDXContentSeed,
  pageRoles?: Array<{ slideNumber: number; role: NdxPageRoleMapRole }>,
): NDXThoughtArcSnapshot {
  const snapshotId = `tas-${fp({ seedId: seed.seedId, v: CHARACTER_FIRST_REGENERATION_VERSION })}`;
  const beats = [...NDX_THOUGHT_ARC_BEATS].filter((b) => seed.thoughtArc.beatsPresent.includes(b));

  const knowledgeStateProgression = pageRoles?.length
    ? pageRoles.map((p) => ({
        slideNumber: p.slideNumber,
        state: knowledgeStateForPageRole(p.role, p.slideNumber),
      }))
    : DEFAULT_KNOWLEDGE_PROGRESSION.map((p) => ({ slideNumber: p.slideNumber, state: p.state }));

  return {
    snapshotId,
    contentSeedId: seed.seedId,
    beats,
    notice: seed.notice.toUpperCase(),
    firstReaction: seed.firstReaction.toUpperCase(),
    initialBelief: seed.initialBelief.toUpperCase(),
    question: seed.question.toUpperCase(),
    investigationTrigger: seed.investigationTrigger.toUpperCase(),
    evidenceNeeded: seed.evidenceNeeded.map((e) => e.toUpperCase()),
    evidenceFound: seed.evidenceFound.map((e) => e.toUpperCase()),
    contradictions: seed.contradictions.map((e) => e.toUpperCase()),
    beliefRevision: seed.thoughtArc.beliefRevision,
    currentView: seed.currentView.toUpperCase(),
    knowledgeStateProgression,
    version: CHARACTER_FIRST_REGENERATION_VERSION,
  };
}

export function thoughtArcSurvivesVisualCompilation(snapshot: NDXThoughtArcSnapshot, prompt: string): boolean {
  const upper = prompt.toUpperCase();
  return (
    upper.includes('THOUGHT ARC') &&
    snapshot.beats.every((beat) => upper.includes(beat.replace(/_/g, ' ')) || upper.includes(beat))
  );
}

export function createThoughtArcSnapshotId(): string {
  return `tas-${randomUUID().slice(0, 8)}`;
}
