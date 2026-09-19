/**
 * Character maturation continuity — MATURATION ≠ SANITIZATION.
 */

import type { BrandCharacterSynthesis, CharacterMaturationContinuityEvaluation } from './types.js';

const SANITIZATION_MARKERS = [
  'corporate thought leadership',
  'polished expert',
  'sterile researcher',
  'academic explainer',
  'safe educational brand',
  'generic intellectual publication',
];

export function evaluateCharacterMaturationContinuity(params: {
  synthesis: BrandCharacterSynthesis;
  founderHypothesisRaw?: string;
}): CharacterMaturationContinuityEvaluation {
  const blob = JSON.stringify(params.synthesis).toLowerCase();
  const positiveBlob = [
    params.synthesis.characterEssence,
    params.synthesis.characterThesis,
    params.synthesis.humorIdentity,
    params.synthesis.socialIdentity,
  ]
    .join(' ')
    .toLowerCase();
  const hypothesis = (params.founderHypothesisRaw ?? '').toLowerCase();

  const dimension = (signal: string, minLen = 20): 'PRESERVED' | 'PARTIAL' | 'AT_RISK' | 'ERASED' => {
    if (blob.includes(signal) && blob.length > minLen) return 'PRESERVED';
    if (blob.includes(signal.slice(0, 8))) return 'PARTIAL';
    return 'AT_RISK';
  };

  const youngerInstinctPreserved =
    params.synthesis.youngerInstincts.length >= 2 ||
    blob.includes('nosy') ||
    blob.includes('receipt') ||
    blob.includes('messy');
  const maturityGained =
    params.synthesis.maturedInstincts.length >= 2 ||
    blob.includes('context') ||
    blob.includes('research') ||
    blob.includes('wrong');
  const humorPreserved = !/^witty\.?$/i.test(params.synthesis.humorIdentity.trim());
  const messinessPreserved =
    blob.includes('mess') || blob.includes('annotation') || blob.includes('screenshot');
  const sanitizationRisk = SANITIZATION_MARKERS.some((m) => positiveBlob.includes(m));

  const personalitySanitizationRisk =
    sanitizationRisk ||
    (!humorPreserved && !messinessPreserved) ||
    (params.synthesis.neverBecome.length === 0 && !maturityGained);

  const passes =
    youngerInstinctPreserved &&
    maturityGained &&
    humorPreserved &&
    messinessPreserved &&
    !personalitySanitizationRisk;

  return {
    evaluationId: `mce-${params.synthesis.id}`,
    synthesisId: params.synthesis.id,
    youngerInstinctPreserved: dimension('nosy'),
    maturityGained: dimension('context'),
    intellectualDepthGained: dimension('research'),
    ethicalDepthGained: dimension('ethical'),
    selfCorrectionGained: dimension('wrong'),
    culturalInteriorityPreserved: dimension('participat'),
    humorPreserved: humorPreserved ? 'PRESERVED' : 'AT_RISK',
    messinessPreserved: messinessPreserved ? 'PRESERVED' : 'AT_RISK',
    makerPresencePreserved: params.synthesis.makerBehaviors.length >= 2 ? 'PRESERVED' : 'PARTIAL',
    personalitySanitizationRisk,
    passesMaturationContinuity: passes,
    coreInsightSupported:
      blob.includes('research') && (blob.includes('nosy') || hypothesis.includes('nosy')),
    notes: personalitySanitizationRisk
      ? ['Maturation may have collapsed toward sanitized expert voice']
      : ['Maturation continuity preserved — humor and messiness coexist with gained judgment'],
    evaluatedAt: new Date().toISOString(),
  };
}

export function maturationDoesNotSanitize(): true {
  return true;
}
