/**
 * C1.0 — Entry 002 golden fixture expectations (validation only — not production hardcode).
 */

import type { NarrativeSynthesis } from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export type Entry002GoldenExpectations = {
  centralQuestionIncludes: string[];
  ndxRoles: string[];
  subjectRoles: string[];
  phoneRoles: string[];
  worldFunctions: string[];
  turnIncludes: string[];
  contradictionIncludes: string[];
  interjectionIncludes: string[];
  aftershockIncludes: string[];
};

export const ENTRY_002_GOLDEN_EXPECTATIONS: Entry002GoldenExpectations = {
  centralQuestionIncludes: ['SAME', 'CRINGE', 'ICONIC'],
  ndxRoles: ['INVESTIGATOR', 'OBSERVER'],
  subjectRoles: ['PROOF'],
  phoneRoles: ['PORTAL', 'EVIDENCE'],
  worldFunctions: ['EDIT'],
  turnIncludes: ['SAME', '2016', 'OPPOSITE'],
  contradictionIncludes: ['LABEL', 'CHANGE'],
  interjectionIncludes: ['APOLOGY', 'REBRAND'],
  aftershockIncludes: ['MEMORY', 'OBJECT', 'REVISED', 'CULTURE'],
};

export function evaluateEntry002GoldenFixture(synthesis: NarrativeSynthesis): {
  passed: boolean;
  diagnostics: string[];
} {
  const e = ENTRY_002_GOLDEN_EXPECTATIONS;
  const diagnostics: string[] = [];

  const cq = synthesis.centralQuestion.toUpperCase();
  if (!e.centralQuestionIncludes.every((f) => cq.includes(f))) {
    diagnostics.push('centralQuestion missing golden facets');
  }

  if (!e.ndxRoles.includes(synthesis.roleIntelligence.ndxRole)) {
    diagnostics.push(`NDX role ${synthesis.roleIntelligence.ndxRole} outside golden set`);
  }
  if (!e.subjectRoles.includes(synthesis.roleIntelligence.subjectRole)) {
    diagnostics.push(`Subject role ${synthesis.roleIntelligence.subjectRole} outside golden set`);
  }
  if (
    synthesis.roleIntelligence.deviceRole &&
    !e.phoneRoles.includes(synthesis.roleIntelligence.deviceRole)
  ) {
    diagnostics.push('Phone/device role mismatch');
  }
  if (!e.worldFunctions.includes(synthesis.roleIntelligence.worldFunction)) {
    diagnostics.push(`World function ${synthesis.roleIntelligence.worldFunction} mismatch`);
  }

  const turn = synthesis.turningPoint.afterMeaning.toUpperCase();
  const turnBeat = synthesis.narrativeSpine.beats.find((b) => b.beatType === 'TURN');
  const turnText = (turnBeat?.whatHappens ?? turn).toUpperCase();
  if (!e.turnIncludes.some((f) => turnText.includes(f))) {
    diagnostics.push('Turn missing same-woman/opposite-reaction proof');
  }

  const contradiction = synthesis.contradiction.statement.toUpperCase();
  if (!e.contradictionIncludes.some((f) => contradiction.includes(f))) {
    diagnostics.push('Contradiction missing label-change proof');
  }

  const interjection = synthesis.interjection.line.toUpperCase();
  if (!e.interjectionIncludes.every((f) => interjection.includes(f))) {
    diagnostics.push('Interjection missing golden line facets');
  }

  const aftershock = synthesis.aftershock.statement.toUpperCase();
  if (!e.aftershockIncludes.some((f) => aftershock.includes(f))) {
    diagnostics.push('Aftershock missing memory/object sharpen');
  }

  if (!synthesis.causalBeatGraph.shuffleTestPassed) {
    diagnostics.push('Shuffle test failed — not causally connected');
  }

  return { passed: diagnostics.length === 0, diagnostics };
}
