/**
 * Copy quality gate — reject generic copy before GPT Image generation.
 */

import { parseStructuredJson } from './formationValidation.js';
import { callAnthropicForCompletion } from './anthropicCompletion.js';
import { ANTHROPIC_CREATIVE_MODEL } from './config.js';
import { isProductionSonnetConfigured } from './directionExpressionSystemService.js';
import type { CopyQualityGateResult, CopyQualityScores, HeroCreativeConcept } from './creativeExpressionTypes.js';
import type { CreativeExpressionSystem } from './creativeExpressionTypes.js';

const COPY_QA_PROMPT = `Score visible copy for NDX BOOK / THE MARKED-UP COPY hero artifact.

Reject: explanatory, generic, corporate, textbook, strategy-language, humorless, slang-forced wit.

Score 0-5:
- editorialVoice
- wit
- specificity
- memorability
- directionFit (must be 5 for direction-native fit)

Return JSON:
{
  "editorialVoice": 0-5,
  "wit": 0-5,
  "specificity": 0-5,
  "memorability": 0-5,
  "directionFit": 0-5,
  "reasons": ["string"],
  "revisedConcept": null OR full HeroCreativeConcept JSON if copy fails thresholds
}

Thresholds: editorialVoice>=4, wit>=4, specificity>=4, memorability>=4, directionFit>=5`;

export function evaluateCopyQualityFromScores(scores: Omit<CopyQualityScores, 'pass'>): CopyQualityScores {
  const pass =
    scores.editorialVoice >= 4 &&
    scores.wit >= 4 &&
    scores.specificity >= 4 &&
    scores.memorability >= 4 &&
    scores.directionFit >= 5;
  return { ...scores, pass };
}

function heuristicCopyQa(concept: HeroCreativeConcept): CopyQualityScores {
  const genericMarkers = ['credit utilization', 'financial wellness', 'optimize your', 'leverage'];
  const text = [
    concept.cleanClaim,
    concept.marginCounterpoint,
    concept.replacementMove,
    concept.microcopyDiscovery,
  ]
    .join(' ')
    .toLowerCase();
  const genericHit = genericMarkers.some((m) => text.includes(m));
  return evaluateCopyQualityFromScores({
    editorialVoice: genericHit ? 3 : 4,
    wit: concept.marginCounterpoint.length > 20 ? 4 : 3,
    specificity: concept.evidenceDevice.length > 10 ? 4 : 3,
    memorability: concept.visualPunchline.length > 10 ? 4 : 3,
    directionFit: 5,
    reasons: genericHit ? ['Generic finance phrasing detected'] : ['Heuristic pass — vision unavailable'],
  });
}

export async function runCopyQualityGate(params: {
  heroConcept: HeroCreativeConcept;
  creativeExpression: CreativeExpressionSystem;
}): Promise<CopyQualityGateResult> {
  if (!isProductionSonnetConfigured()) {
    const scores = heuristicCopyQa(params.heroConcept);
    return {
      scores,
      revisedCopy: scores.pass ? null : params.heroConcept,
      revisionRounds: 0,
      visionInspected: false,
    };
  }

  const payload = {
    heroConcept: params.heroConcept,
    creativeExpression: {
      verbalPersonality: params.creativeExpression.verbalPersonality,
      witMechanics: params.creativeExpression.witMechanics,
      antiGenericCreativeRules: params.creativeExpression.antiGenericCreativeRules,
    },
  };

  const { text } = await callAnthropicForCompletion(COPY_QA_PROMPT, payload, { maxTokens: 4096 });
  const parsed = parseStructuredJson(text) as Record<string, unknown>;

  const scores = evaluateCopyQualityFromScores({
    editorialVoice: Number(parsed.editorialVoice ?? 0),
    wit: Number(parsed.wit ?? 0),
    specificity: Number(parsed.specificity ?? 0),
    memorability: Number(parsed.memorability ?? 0),
    directionFit: Number(parsed.directionFit ?? 0),
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
  });

  let revisedCopy: HeroCreativeConcept | null = null;
  let revisionRounds = 0;

  if (!scores.pass && parsed.revisedConcept && typeof parsed.revisedConcept === 'object') {
    const rc = parsed.revisedConcept as Record<string, unknown>;
    revisedCopy = {
      ...params.heroConcept,
      cleanClaim: String(rc.cleanClaim ?? params.heroConcept.cleanClaim),
      revisionMove: String(rc.revisionMove ?? params.heroConcept.revisionMove),
      replacementMove: String(rc.replacementMove ?? params.heroConcept.replacementMove),
      marginCounterpoint: String(rc.marginCounterpoint ?? params.heroConcept.marginCounterpoint),
      microcopyDiscovery: String(rc.microcopyDiscovery ?? params.heroConcept.microcopyDiscovery),
      visualPunchline: String(rc.visualPunchline ?? params.heroConcept.visualPunchline),
    };
    revisionRounds = 1;
  }

  return {
    scores,
    revisedCopy,
    revisionRounds,
    visionInspected: true,
  };
}

export function resolveHeroConceptAfterCopyGate(
  original: HeroCreativeConcept,
  gate: CopyQualityGateResult,
): HeroCreativeConcept {
  if (gate.revisedCopy && !gate.scores.pass) return gate.revisedCopy;
  return original;
}
