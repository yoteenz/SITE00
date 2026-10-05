/**
 * C1.0 — Narrative creative correction store.
 */

import type { NarrativeCreativeCorrection } from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

const corrections: NarrativeCreativeCorrection[] = [];

export function resetNarrativeCreativeCorrectionStore(): void {
  corrections.length = 0;
}

export function recordNarrativeCreativeCorrection(
  correction: Omit<NarrativeCreativeCorrection, 'correctionId' | 'createdAt'>,
): NarrativeCreativeCorrection {
  const record: NarrativeCreativeCorrection = {
    ...correction,
    correctionId: `NS-CORR-${correction.entryId}-${corrections.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  corrections.push(record);
  return record;
}

export function listNarrativeCreativeCorrections(entryId?: string): NarrativeCreativeCorrection[] {
  return entryId ? corrections.filter((c) => c.entryId === entryId) : [...corrections];
}

/** Seed Entry 002 founder corrections as methodology training. */
export function seedEntry002NarrativeCorrections(): void {
  if (corrections.some((c) => c.entryId === 'entry-002')) return;
  recordNarrativeCreativeCorrection({
    entryId: 'entry-002',
    synthesisVersion: '001',
    originalDecision: 'Subject woman becomes protagonist',
    founderCorrection: 'NDX should investigate subject woman',
    failureClass: 'ROLE_CONFUSION',
    whyCorrectionImprovedStory: 'Investigator creates reveal logic; subject remains proof.',
    generalizableRule:
      'WHEN AN ENTRY\'S ARGUMENT DEPENDS ON DISCOVERING A CULTURAL CONTRADICTION, AN OBSERVER/INVESTIGATOR MAY CREATE STRONGER REVEAL LOGIC THAN MAKING THE EVIDENCE SUBJECT THE PROTAGONIST.',
    scope: 'NDXBOOK',
  });
  recordNarrativeCreativeCorrection({
    entryId: 'entry-002',
    synthesisVersion: '001',
    originalDecision: 'Phone becomes entire world',
    founderCorrection: 'Phone is evidence portal; Nostalgia Edit Suite is world',
    failureClass: 'DECORATIVE_WORLD',
    whyCorrectionImprovedStory: 'Separates device function from metaphor world function.',
    generalizableRule:
      'DISTINGUISH STORY DEVICE FROM WORLD. A DEVICE CAN TRIGGER ENTRY INTO A WORLD WITHOUT BECOMING THE WORLD ITSELF.',
    scope: 'NDXBOOK',
  });
  recordNarrativeCreativeCorrection({
    entryId: 'entry-002',
    synthesisVersion: '001',
    originalDecision: '2016 and 2026 shown as different fashion looks',
    founderCorrection: 'Same fashion language required across eras',
    failureClass: 'WEAK_CAUSALITY',
    whyCorrectionImprovedStory: 'Contradiction requires identical visual codes with opposite labels.',
    generalizableRule:
      'WHEN THE ARGUMENT IS ABOUT CULTURAL RELABELING, PRESERVE THE OBJECT AND CHANGE THE CONTEXT SO THE CONTRADICTION IS PROVABLE.',
    scope: 'CHAPTER',
  });
}
