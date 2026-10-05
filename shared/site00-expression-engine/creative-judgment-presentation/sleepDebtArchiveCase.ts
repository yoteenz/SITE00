/**
 * P0.CJ.2V — Sleep Debt Archive presentation fixture (maps to existing creative director territory).
 */

import type { CreativeJudgmentInput, TerritoryCandidate } from '../creative-judgment-intelligence/types.js';

export function buildSleepDebtTerritory(): TerritoryCandidate {
  return {
    territoryId: 'territory-sleep-debt-archive',
    conceptName: 'THE SLEEP DEBT ARCHIVE',
    oneSentenceIdea: 'Every self-care Sunday adds a ledger line to unpaid rest',
    mechanism: 'POSTED REST → ACCUMULATED DEBT → ARCHIVAL DREAD',
    emotionalArc: 'AESTHETIC PAUSE → LUCID ANGER → ACCOUNTABILITY',
    visualWorld: 'THE SLEEP DEBT ARCHIVE',
    argument: 'Culture aestheticizes rest while sleep debt keeps rolling forward',
    channelTreatmentHash: 'reel-proof|carousel-ledger|story-confession|email-trust',
  };
}

export function buildSleepDebtJudgmentInput(
  overrides: Partial<CreativeJudgmentInput> = {},
): CreativeJudgmentInput {
  return {
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    entryId: 'benchmark-sleep-debt',
    campaignId: 'ndxbook-sleep-debt-archive',
    territory: buildSleepDebtTerritory(),
    interjection: 'REST WAS INVOICED. IT WAS NEVER FORGIVEN.',
    worldRole: 'Materializes rest debt as tangible records',
    artifactRole: 'Rest receipt strip / time-clock roll',
    reasoningMode: 'DETERMINISTIC',
    ...overrides,
  };
}
