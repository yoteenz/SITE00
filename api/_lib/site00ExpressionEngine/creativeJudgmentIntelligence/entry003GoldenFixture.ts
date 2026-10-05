/**
 * Entry 003 — EMPLOYEES ONLY golden evaluation fixture (P0.CJ.1).
 * Canon elements must not be modified in tests.
 */

import type { CreativeJudgmentInput, TerritoryCandidate } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

export const ENTRY_003_GOLDEN = {
  entryId: 'entry-003',
  title: 'EMPLOYEES ONLY',
  conceptName: 'THE EMPLOYEE-ONLY DOOR',
  responsibilityShift: 'THEY → CULTURE → YOU',
  handoff: 'SAME PHONE. NEW PERFORMANCE.',
  world: 'THE EMPLOYEE-ONLY DOOR',
  ndxRole: 'DOOR GUIDE / ARCHIVIST LOGIC',
  subjectRole: 'FRONT-STAGE PERFORMER / CURATOR',
  interjection: "YOU DIDN'T SKIP STEPS. YOU SKIPPED THE CAMERA.",
  artifact: 'STAFF SHIFT RECEIPT / SCHEDULE SLIP',
} as const;

export function buildEntry003Territory(): TerritoryCandidate {
  return {
    territoryId: 'territory-entry-003-door',
    conceptName: ENTRY_003_GOLDEN.conceptName,
    oneSentenceIdea:
      'Camera discovers classified labor behind a beauty ritual threshold — culture shifted responsibility onto you',
    mechanism: ENTRY_003_GOLDEN.responsibilityShift,
    emotionalArc: 'PERFORMANCE → REVELATION → ACCOUNTABILITY',
    visualWorld: ENTRY_003_GOLDEN.world,
    argument: 'Effortless beauty hides invisible labor; the door makes the handoff legible',
    channelTreatmentHash: 'reel-hook|carousel-evidence|story-intimacy|email-persuasion',
  };
}

export function buildEntry003JudgmentInput(
  overrides: Partial<CreativeJudgmentInput> = {},
): CreativeJudgmentInput {
  return {
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: ENTRY_003_GOLDEN.entryId,
    campaignId: 'ndxbook-chapter-01-entry-003',
    territory: buildEntry003Territory(),
    interjection: ENTRY_003_GOLDEN.interjection,
    ndxRole: ENTRY_003_GOLDEN.ndxRole,
    subjectRole: ENTRY_003_GOLDEN.subjectRole,
    worldRole: 'Separates front-stage vanity from classified labor infrastructure',
    artifactRole: 'Timestamp proof of shift overlap',
    reasoningMode: 'DETERMINISTIC',
    ...overrides,
  };
}
