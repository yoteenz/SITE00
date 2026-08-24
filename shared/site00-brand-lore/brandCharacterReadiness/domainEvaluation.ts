/**
 * Domain-level character readiness evaluation — deterministic.
 */

import type { CharacterEvidenceInventory } from './evidenceInventory.js';
import { classifyEvidenceConfidence, modelInferenceOnlyCannotSatisfyCritical } from './evidenceInventory.js';
import { CRITICAL_CHARACTER_DOMAINS } from './constants.js';
import type {
  CharacterEvidenceConfidence,
  CharacterEvidenceStrength,
  CharacterReadinessDomain,
  CharacterReadinessDomainEvaluation,
} from './types.js';

function strengthFromSignals(signals: string[], minStrong = 3, minSufficient = 1): CharacterEvidenceStrength {
  const count = signals.filter((s) => s.trim().length > 8).length;
  if (count >= minStrong) return 'STRONG_EVIDENCE';
  if (count >= minSufficient) return 'SUFFICIENT_EVIDENCE';
  if (count > 0) return 'THIN_EVIDENCE';
  return 'MISSING_EVIDENCE';
}

function evaluateDomain(
  domain: CharacterReadinessDomain,
  inventory: CharacterEvidenceInventory,
): CharacterReadinessDomainEvaluation {
  let signals: string[] = [];
  let whyItMatters = 'Supports honest character formation without model invention.';
  let questionRecommended = false;
  let blocking = CRITICAL_CHARACTER_DOMAINS.includes(domain as (typeof CRITICAL_CHARACTER_DOMAINS)[number]);

  switch (domain) {
    case 'WORLDVIEW_ORIENTATION':
      signals = [...inventory.brandLore, ...inventory.businessOffering];
      whyItMatters = 'Worldview anchors who the brand could be as a character.';
      break;
    case 'INTERNAL_TENSION':
      signals = inventory.personalityTension;
      whyItMatters = 'Productive contradiction produces behavioral range.';
      break;
    case 'INTELLECTUAL_BEHAVIOR':
      signals = [
        ...inventory.brandLore,
        ...inventory.brandPersonality.filter((s) => /observational|memorability|reasoning/i.test(s)),
      ];
      whyItMatters = 'Intellectual behavior distinguishes character from trait labels.';
      break;
    case 'SOCIAL_BEHAVIOR':
      signals = [...inventory.socialInstinct, ...inventory.confidenceBehavior];
      break;
    case 'AUDIENCE_RELATIONSHIP':
      signals = inventory.audienceTruth;
      whyItMatters = 'Audience relationship is critical for trustworthy character formation.';
      break;
    case 'HUMOR_WIT':
      signals = inventory.humorWit;
      whyItMatters = 'Humor mechanism must be specific — "witty" alone is insufficient.';
      questionRecommended = inventory.humorWit.length <= 1;
      blocking = false;
      break;
    case 'CULTURAL_INTELLIGENCE':
      signals = [...inventory.culturalReferences, ...inventory.culturalSpecificity];
      questionRecommended = signals.length <= 1;
      blocking = false;
      break;
    case 'EMOTIONAL_RANGE':
      signals = [...inventory.emotionalRange, ...inventory.humanity];
      blocking = false;
      break;
    case 'LANGUAGE_BEHAVIOR':
      signals = inventory.founderLanguage;
      blocking = false;
      break;
    case 'TASTE_JUDGMENT':
      signals = [
        ...inventory.visualReferences,
        ...inventory.culturalReferences.filter((s) => /taste|beautiful|aesthetic/i.test(s)),
      ];
      questionRecommended = signals.length === 0;
      blocking = false;
      break;
    case 'ARTIFACT_MAKER_BEHAVIOR':
      signals = inventory.visualReferences.filter((s) => /artifact|mark|hand|annotate/i.test(s));
      questionRecommended = signals.length === 0;
      blocking = false;
      break;
    case 'HARD_BOUNDARIES':
      signals = [...inventory.hardBoundaries, ...inventory.antiDirection];
      whyItMatters = 'Boundaries prevent generic or off-brand character collapse.';
      break;
    default:
      break;
  }

  const strength = strengthFromSignals(signals, domain === 'HUMOR_WIT' ? 2 : 3, 1);
  const directFounder =
    inventory.founderLanguage.length > 0 ||
    Object.keys(inventory.rawPersonalityAnswers).length > 0;
  const multipleSignals = signals.length >= 2;
  const confidence: CharacterEvidenceConfidence = classifyEvidenceConfidence({
    directFounder,
    carryForward: false,
    multipleSignals,
    synthesizedOnly: !directFounder && signals.length > 0,
  });

  if (
    blocking &&
    (strength === 'MISSING_EVIDENCE' || strength === 'THIN_EVIDENCE') &&
    modelInferenceOnlyCannotSatisfyCritical(confidence)
  ) {
    questionRecommended = true;
  }
  if (strength === 'MISSING_EVIDENCE' || strength === 'THIN_EVIDENCE') questionRecommended = true;

  return {
    domain,
    strength,
    confidence,
    whatWeKnow: signals.slice(0, 4),
    whatRemainsUnclear:
      strength === 'STRONG_EVIDENCE' || strength === 'SUFFICIENT_EVIDENCE'
        ? []
        : [`Need more founder-grounded evidence for ${domain.replace(/_/g, ' ').toLowerCase()}`],
    whyItMatters,
    questionRecommended,
    blocking: blocking && (strength === 'MISSING_EVIDENCE' || strength === 'THIN_EVIDENCE'),
  };
}

export function evaluateAllCharacterReadinessDomains(
  inventory: CharacterEvidenceInventory,
): CharacterReadinessDomainEvaluation[] {
  const domains: CharacterReadinessDomain[] = [
    'WORLDVIEW_ORIENTATION',
    'INTERNAL_TENSION',
    'INTELLECTUAL_BEHAVIOR',
    'SOCIAL_BEHAVIOR',
    'AUDIENCE_RELATIONSHIP',
    'HUMOR_WIT',
    'CULTURAL_INTELLIGENCE',
    'EMOTIONAL_RANGE',
    'LANGUAGE_BEHAVIOR',
    'TASTE_JUDGMENT',
    'ARTIFACT_MAKER_BEHAVIOR',
    'HARD_BOUNDARIES',
  ];
  return domains.map((d) => evaluateDomain(d, inventory));
}

export function notEvaluatedNeverBecomesReady(state: string): boolean {
  return state !== 'CHARACTER_NOT_EVALUATED';
}
