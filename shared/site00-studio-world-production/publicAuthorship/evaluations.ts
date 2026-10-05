/**
 * Public authorship evaluations — person reference, personal voice, export guards.
 */

import { randomUUID } from 'node:crypto';
import type {
  PersonalAuthorshipEvaluation,
  PersonReferenceState,
  ThirdPersonSelfReferenceEvaluation,
} from './types.js';
import { scanTextForQuarantinedLabels } from './internalLabelQuarantine.js';

const THIRD_PERSON_PATTERNS = [
  /\bNDX NOTICED\b/i,
  /\bNDX BELIEVES\b/i,
  /\bNDX THINKS\b/i,
  /\bTHE BRAND OBSERVED\b/i,
  /\bTHE BRAND DECIDED\b/i,
  /\bTHE CHARACTER BEAT IS\b/i,
  /\bTHE CHARACTER'S REACTION\b/i,
  /\bTHE PRIMARY EDITORIAL IDEA IS\b/i,
];

const IMPLIED_AUTHORSHIP_PATTERNS = [
  /^(BE SERIOUS|REMEMBER THIS|INTERESTING|ACTUALLY|WAIT|OKAY|WHY)/,
  /\?$/,
  /^I (WAS WRONG|HAVE A THEORY|THOUGHT|KEEP)/,
  /^WE (USED TO|DID|ARE)/,
];

const AI_SUMMARY_PATTERNS = [
  /\bIN THIS POST\b/i,
  /\bSWIPE TO LEARN\b/i,
  /\bHERE ARE \d+ THINGS\b/i,
  /\bTHIS POST DISCUSSES\b/i,
  /\bSLIDE 1 SAYS\b/i,
];

const REPORT_PATTERNS = [
  /\bEVIDENCE FOR\b/i,
  /\bPATTERN DETECTED\b/i,
  /\bRESEARCH STATUS\b/i,
  /\bCAUSAL CHAIN\b/i,
];

export function evaluateThirdPersonSelfReference(text: string): ThirdPersonSelfReferenceEvaluation {
  const violations: string[] = [];
  for (const pattern of THIRD_PERSON_PATTERNS) {
    if (pattern.test(text)) violations.push(pattern.source);
  }

  let state: PersonReferenceState = 'PASS_FIRST_PERSON';
  if (violations.length > 0) {
    state = /\bNDX\b/i.test(text) ? 'FAIL_THIRD_PERSON_SELF_REFERENCE' : 'FAIL_SYSTEM_NARATION' as PersonReferenceState;
    if (state === 'FAIL_SYSTEM_NARATION' as PersonReferenceState) state = 'FAIL_SYSTEM_NARRATION';
  } else if (IMPLIED_AUTHORSHIP_PATTERNS.some((p) => p.test(text.trim()))) {
    state = 'PASS_IMPLIED_AUTHORSHIP';
  } else if (/\b(I|WE|MY|OUR)\b/i.test(text)) {
    state = 'PASS_FIRST_PERSON';
  }

  return {
    evaluationId: randomUUID(),
    text,
    state,
    violations,
    passed: state === 'PASS_FIRST_PERSON' || state === 'PASS_IMPLIED_AUTHORSHIP',
  };
}

export function evaluatePersonalAuthorship(text: string): PersonalAuthorshipEvaluation {
  const failureStates: PersonalAuthorshipEvaluation['failureStates'] = [];
  const quarantined = scanTextForQuarantinedLabels(text);
  if (quarantined.length) failureStates.push('FAIL_INTERNAL_LABEL_ON_PUBLIC_ARTIFACT');
  if (THIRD_PERSON_PATTERNS.some((p) => p.test(text))) failureStates.push('FAIL_THIRD_PERSON_SELF_REFERENCE');
  if (AI_SUMMARY_PATTERNS.some((p) => p.test(text))) failureStates.push('FAIL_AI_SUMMARY_PUBLIC_COPY');
  if (REPORT_PATTERNS.some((p) => p.test(text))) failureStates.push('FAIL_PUBLIC_COPY_TOO_REPORT_LIKE');
  if (/\bCHARACTER BEAT\b/i.test(text)) failureStates.push('FAIL_CHARACTER_BEAT_LABEL_VISIBLE');

  let classification: PersonalAuthorshipEvaluation['classification'] = 'NDX_ACCEPTABLE';
  if (failureStates.length === 0 && IMPLIED_AUTHORSHIP_PATTERNS.some((p) => p.test(text.trim()))) {
    classification = 'NDX_NATIVE';
  } else if (failureStates.includes('FAIL_AI_SUMMARY_PUBLIC_COPY')) {
    classification = 'AI_SUMMARY_LIKE';
  } else if (failureStates.includes('FAIL_PUBLIC_COPY_TOO_REPORT_LIKE')) {
    classification = 'TOO_ANALYTICAL';
  } else if (failureStates.includes('FAIL_INTERNAL_LABEL_ON_PUBLIC_ARTIFACT')) {
    classification = 'SYSTEM_EXPOSED';
  } else if (/\bTHE BRAND\b/i.test(text)) {
    classification = 'TOO_BRAND_WRITTEN';
  }

  return {
    evaluationId: randomUUID(),
    text,
    classification,
    soundsLikePerson: classification === 'NDX_NATIVE' || classification === 'NDX_ACCEPTABLE',
    soundsLikeSystem: classification === 'SYSTEM_EXPOSED' || classification === 'TOO_ANALYTICAL',
    soundsLikeAiSummary: classification === 'AI_SUMMARY_LIKE',
    failureStates,
    passed: failureStates.length === 0,
  };
}

export function reportLikeCopyFails(text: string): boolean {
  return REPORT_PATTERNS.some((p) => p.test(text));
}

export function aiSummaryCopyFails(text: string): boolean {
  return AI_SUMMARY_PATTERNS.some((p) => p.test(text));
}

export function publicCopyQaBeforeLock(params: {
  visibleText: string[];
}): { passed: boolean; checks: Record<string, boolean> } {
  const joined = params.visibleText.join('\n');
  const checks = {
    NO_INTERNAL_LABELS: scanTextForQuarantinedLabels(joined).length === 0,
    NO_THIRD_PERSON_SELF_REFERENCE: evaluateThirdPersonSelfReference(joined).passed,
    NDX_AUTHORSHIP_PRESENT: evaluatePersonalAuthorship(joined).soundsLikePerson,
    PUBLIC_COPY_HUMANITY: !reportLikeCopyFails(joined),
    PUBLIC_COPY_CLARITY: joined.trim().length > 0,
  };
  return { passed: Object.values(checks).every(Boolean), checks };
}
