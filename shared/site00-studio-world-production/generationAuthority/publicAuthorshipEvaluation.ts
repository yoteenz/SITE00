/**
 * P0.5C.5A — PublicAuthorshipEvaluation (generation QA).
 */

import { randomUUID } from 'node:crypto';
import { scanTextForQuarantinedLabels } from '../publicAuthorship/internalLabelQuarantine.js';
import { evaluatePersonalAuthorship, evaluateThirdPersonSelfReference } from '../publicAuthorship/evaluations.js';
import type { PublicAuthorshipEvaluation, PublicAuthorshipFailureState } from './types.js';

const ANALYTICAL_PATTERNS = [
  /\bCHARACTER FACULTY\b/i,
  /\bJUDGMENT TRACE\b/i,
  /\bCULTURAL EVIDENCE\b/i,
  /\bMAKER EVIDENCE\b/i,
  /\bSYNTHESIS EVIDENCE\b/i,
  /\bARTIFACT PROOF\b/i,
  /\bWHY NDX DID THIS\b/i,
  /\bBEHAVIOR MODE\b/i,
  /\bVISUAL SUBJECT MATTER DECISION\b/i,
  /\bCONTENT THESIS\b/i,
  /\bINTERNAL CLASSIFICATION\b/i,
];

export function evaluatePublicAuthorship(params: {
  artifactId: string;
  visibleTexts: string[];
}): PublicAuthorshipEvaluation {
  const joined = params.visibleTexts.join('\n');
  const failureStates: PublicAuthorshipFailureState[] = [];
  const quarantined = scanTextForQuarantinedLabels(joined);
  const thirdPerson = evaluateThirdPersonSelfReference(joined);
  const personal = evaluatePersonalAuthorship(joined);

  if (thirdPerson.state === 'FAIL_THIRD_PERSON_SELF_REFERENCE') failureStates.push('FAIL_THIRD_PERSON_NDX');
  if (personal.classification === 'TOO_ANALYTICAL') failureStates.push('FAIL_ANALYTICAL_DISTANCE');
  if (quarantined.length) failureStates.push('FAIL_INTERNAL_LABEL_LEAK');
  if (ANALYTICAL_PATTERNS.some((p) => p.test(joined))) failureStates.push('FAIL_PRODUCTION_METADATA_AS_COPY');
  if (/\bTHE CHARACTER\b/i.test(joined)) failureStates.push('FAIL_CHARACTER_DESCRIBED_FROM_OUTSIDE');
  if (personal.classification === 'TOO_BRAND_WRITTEN') failureStates.push('FAIL_CORPORATE_EDITORIAL_VOICE');
  if (personal.classification === 'AI_SUMMARY_LIKE') failureStates.push('FAIL_AI_ANALYST_VOICE');

  const analyticalDistance: PublicAuthorshipEvaluation['analyticalDistance'] =
    personal.classification === 'TOO_ANALYTICAL' ? 'HIGH' : personal.classification === 'NDX_ACCEPTABLE' ? 'LOW' : 'MEDIUM';

  return {
    evaluationId: randomUUID(),
    artifactId: params.artifactId,
    firstPersonPresence: /\b(I|WE|MY|OUR)\b/i.test(joined) || personal.classification === 'NDX_NATIVE',
    personalReactionPresence: /^(WAIT|BE SERIOUS|OKAY|ACTUALLY|REMEMBER)/im.test(joined.trim()),
    humanObservationPresence: joined.trim().length > 0 && !personal.soundsLikeSystem,
    analyticalDistance,
    thirdPersonBrandReference: /\bNDX (NOTICED|BELIEVES|THINKS)\b/i.test(joined),
    internalMetadataLeakage: quarantined.length > 0,
    naturalLanguage: personal.soundsLikePerson,
    ndxCharacterRecognition: personal.classification === 'NDX_NATIVE' || personal.classification === 'NDX_ACCEPTABLE',
    failureStates,
    passes: failureStates.length === 0,
    evaluatedAt: new Date().toISOString(),
  };
}

export function internalProductionLabelsFailPublicCopyQa(text: string): boolean {
  return scanTextForQuarantinedLabels(text).length > 0 || ANALYTICAL_PATTERNS.some((p) => p.test(text));
}

export function thirdPersonNdxNarrationFails(text: string): boolean {
  return !evaluateThirdPersonSelfReference(text).passed;
}
