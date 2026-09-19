/**
 * C1.0 — Generalizable narrative correction rules (Entry 002 training exemplars).
 */

import type { GeneralizableNarrativeRule } from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export const ENTRY_002_GENERALIZABLE_RULES: GeneralizableNarrativeRule[] = [
  {
    ruleId: 'NS-RULE-002-INVESTIGATOR-NOT-PROTAGONIST',
    rule:
      'WHEN AN ENTRY\'S ARGUMENT DEPENDS ON DISCOVERING A CULTURAL CONTRADICTION, AN OBSERVER/INVESTIGATOR MAY CREATE STRONGER REVEAL LOGIC THAN MAKING THE EVIDENCE SUBJECT THE PROTAGONIST.',
    sourceEntryId: 'entry-002',
    scope: 'NDXBOOK',
    surfaceDetailGuard: 'Do not encode "always use investigator" — apply when contradiction discovery is the argument engine.',
    createdAt: '2026-09-08T00:00:00.000Z',
  },
  {
    ruleId: 'NS-RULE-002-DEVICE-VS-WORLD',
    rule:
      'DISTINGUISH STORY DEVICE FROM WORLD. A DEVICE CAN TRIGGER ENTRY INTO A WORLD WITHOUT BECOMING THE WORLD ITSELF.',
    sourceEntryId: 'entry-002',
    scope: 'NDXBOOK',
    surfaceDetailGuard: 'Do not encode "always use a phone" — apply when a portal device and a metaphor world both appear.',
    createdAt: '2026-09-08T00:00:00.000Z',
  },
  {
    ruleId: 'NS-RULE-002-PRESERVE-OBJECT-CHANGE-CONTEXT',
    rule:
      'WHEN THE ARGUMENT IS ABOUT CULTURAL RELABELING, PRESERVE THE OBJECT AND CHANGE THE CONTEXT SO THE CONTRADICTION IS PROVABLE.',
    sourceEntryId: 'entry-002',
    scope: 'CHAPTER',
    surfaceDetailGuard: 'Do not encode "always use same woman" — apply when relabeling is the thesis mechanism.',
    createdAt: '2026-09-08T00:00:00.000Z',
  },
];

export function listGeneralizableNarrativeRules(): GeneralizableNarrativeRule[] {
  return [...ENTRY_002_GENERALIZABLE_RULES];
}
