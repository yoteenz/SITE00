/**
 * Public artifact export evaluation — scan visible text before handoff.
 */

import { randomUUID } from 'node:crypto';
import type { PublicArtifactExportEvaluation } from './types.js';
import { scanTextForQuarantinedLabels } from './internalLabelQuarantine.js';
import { evaluateThirdPersonSelfReference } from './evaluations.js';

const DEBUG_PATTERNS = [
  /\bDEBUG\b/i,
  /\bTODO\b/i,
  /\bPLACEHOLDER\b/i,
  /\bLorem ipsum\b/i,
  /\b\[.*\]/,
  /\bMODEL COMMENT\b/i,
  /\bQA LANGUAGE\b/i,
];

const PLACEHOLDER_PATTERNS = [/\bPLACEHOLDER\b/i, /\bTBD\b/i, /\bXXX\b/i, /\.\.\./];

export function evaluatePublicArtifactExport(visibleText: string[]): PublicArtifactExportEvaluation {
  const joined = visibleText.join('\n');
  const internalLabelsFound = scanTextForQuarantinedLabels(joined);
  const debugStringsFound = DEBUG_PATTERNS.filter((p) => p.test(joined)).map((p) => p.source);
  const placeholderFound = PLACEHOLDER_PATTERNS.some((p) => p.test(joined));
  const thirdPerson = evaluateThirdPersonSelfReference(joined);

  let state: PublicArtifactExportEvaluation['state'] = 'PASS';
  if (internalLabelsFound.length) state = 'FAIL_INTERNAL_LANGUAGE';
  else if (debugStringsFound.length) state = 'FAIL_DEBUG_TEXT';
  else if (placeholderFound) state = 'FAIL_PLACEHOLDER';
  else if (!thirdPerson.passed) state = 'FAIL_THIRD_PERSON_BRAND';

  return {
    evaluationId: randomUUID(),
    visibleText,
    state,
    internalLabelsFound: [...internalLabelsFound],
    debugStringsFound,
    placeholderFound,
    passed: state === 'PASS',
  };
}

export function exportCannotContainDebugText(text: string): boolean {
  return DEBUG_PATTERNS.some((p) => p.test(text));
}

export function exportCannotContainPlaceholder(text: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => p.test(text));
}
