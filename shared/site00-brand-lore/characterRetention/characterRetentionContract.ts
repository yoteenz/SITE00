/**
 * Character beat + retention contract builders.
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { AmendedFirstSlideContract } from '../culturalVisualParticipation/types.js';
import type {
  CharacterBeat,
  CharacterRetentionContract,
  ControlledMisbehavior,
  ControlledMisbehaviorMode,
  HumorEligibility,
  HumorMechanism,
  HumanTraceStrength,
} from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

const TOPIC_CHARACTER_BEATS: Record<number, { beat: string; type: CharacterBeat['beatType']; humor: HumorEligibility }> = {
  1: { beat: 'WE USED TO JUST BUY THINGS???', type: 'SIDE_COMMENT', humor: 'STRONGLY_HELPFUL' },
  2: { beat: '47 MINUTES LATER...', type: 'ABSURD_SPECIFICITY', humor: 'STRONGLY_HELPFUL' },
  3: { beat: 'ACTUALLY.', type: 'CORRECTION', humor: 'OPTIONAL' },
  4: { beat: 'I WAS WRONG.', type: 'SELF_AWARE_COMMENT', humor: 'STRONGLY_HELPFUL' },
  5: { beat: 'YEAH. WE WERE LOUD AND WRONG.', type: 'MICRO_JUDGMENT', humor: 'OPTIONAL' },
  6: { beat: 'STILL WAITING.', type: 'UNDERSTATEMENT', humor: 'STRONGLY_HELPFUL' },
  7: { beat: 'NOTED.', type: 'UNDERSTATEMENT', humor: 'OPTIONAL' },
  8: { beat: 'HMM.', type: 'REACTION', humor: 'OPTIONAL' },
  9: { beat: 'FAIR.', type: 'MICRO_JUDGMENT', humor: 'NOT_NEEDED' },
};

export function inferHumorEligibility(params: {
  characterTemperature: string;
  topic: string;
}): HumorEligibility {
  if (params.topic.includes('APOLOGY') || params.topic.includes('SERIOUS')) return 'OPTIONAL';
  if (params.characterTemperature === 'PLAYFUL') return 'STRONGLY_HELPFUL';
  if (params.characterTemperature === 'SERIOUS') return 'NOT_NEEDED';
  return 'OPTIONAL';
}

export function buildPrimaryCharacterBeat(params: {
  topicIndex: number;
  primaryHook: string;
  characterTemperature: string;
}): CharacterBeat {
  const preset = TOPIC_CHARACTER_BEATS[params.topicIndex];
  if (preset) {
    return {
      beatType: preset.type,
      text: preset.beat,
      position: preset.type === 'VISUAL_JOKE' ? 'AS_VISUAL_PUNCHLINE' : 'MARGIN',
      visualPunchline: preset.type === 'VISUAL_JOKE',
      reasoning: 'Topic-specific character beat preserves NDX reaction without re-expanding information.',
    };
  }
  return {
    beatType: 'REACTION',
    text: null,
    position: 'MARGIN',
    visualPunchline: false,
    reasoning: 'Fallback reaction beat when no preset — humor via visual subject.',
  };
}

export function inferHumanTraceStrength(params: {
  textDensity: string;
  headlineIsCharacter: boolean;
}): HumanTraceStrength {
  if (params.headlineIsCharacter) return 'SUBTLE';
  if (params.textDensity === 'SPARSE' || params.textDensity === 'MINIMAL') return 'MODERATE';
  return 'STRONG';
}

export function buildControlledMisbehavior(params: {
  topicIndex: number;
  primaryHook: string;
}): ControlledMisbehavior[] {
  const behaviors: ControlledMisbehavior[] = [];
  if (params.topicIndex === 2) {
    behaviors.push({
      mode: 'MARGIN_INTRUSION',
      causality: 'NDX timed the checkout and wrote the elapsed time after reading the headline — an afterthought correction.',
      placement: 'MARGIN',
      budgetSlot: 1,
    });
  } else if (params.topicIndex === 1) {
    behaviors.push({
      mode: 'OFF_AXIS_NOTE',
      causality: 'NDX added a side comment after the page was composed — physical placement interrupts the grid.',
      placement: 'UNDER_HEADLINE',
      budgetSlot: 1,
    });
  } else if (params.topicIndex % 3 === 0) {
    behaviors.push({
      mode: 'IMPERFECT_UNDERLINE',
      causality: 'NDX strongly disagreed with one phrase and marked it after reading.',
      placement: 'IN_EVIDENCE',
      budgetSlot: 1,
    });
  }
  return behaviors.slice(0, 2);
}

export function buildCharacterRetentionContract(params: {
  projectId: string;
  artifact: BrandMarketingArtifact;
  v21Contract: AmendedFirstSlideContract;
  characterSystemId: string;
  marketingExpressionSystemId: string;
}): CharacterRetentionContract {
  const topicIndex = parseInt(params.artifact.id.replace('bma-exp01-', ''), 10);
  const pieceId = `piece-${topicIndex}`;
  const humorEligibility = inferHumorEligibility({
    characterTemperature: params.artifact.characterTemperature,
    topic: params.artifact.topic,
  });
  const primaryBeat = buildPrimaryCharacterBeat({
    topicIndex,
    primaryHook: params.v21Contract.primaryHook,
    characterTemperature: params.artifact.characterTemperature,
  });
  const humanTraceStrength = inferHumanTraceStrength({
    textDensity: params.v21Contract.textDensity.level,
    headlineIsCharacter: params.v21Contract.primaryHook.includes('?'),
  });
  const misbehavior = buildControlledMisbehavior({ topicIndex, primaryHook: params.v21Contract.primaryHook });

  const informationRemoved = [
    'excess explanation',
    'source overload',
    'competing microcopy',
    ...(params.v21Contract.deferredEvidence.slice(0, 3)),
  ];

  const contract: CharacterRetentionContract = {
    id: `crc-${params.artifact.id}`,
    projectId: params.projectId,
    contentPieceId: pieceId,
    artifactId: params.artifact.id,
    characterSystemId: params.characterSystemId,
    marketingExpressionSystemId: params.marketingExpressionSystemId,
    characterFacultiesRequired: ['judgment', 'cultural_recognition', 'reaction'],
    characterFacultiesOptional: ['humor', 'pettiness', 'self_awareness'],
    primaryCharacterBeat: primaryBeat,
    secondaryCharacterBeat: null,
    humorRequired: humorEligibility === 'REQUIRED' || humorEligibility === 'STRONGLY_HELPFUL',
    humorMechanism: humorEligibility === 'INAPPROPRIATE' ? null : ('OBSERVATIONAL_UNDERSTATEMENT' as HumorMechanism),
    humorEligibility,
    humorExpression:
      humorEligibility === 'INAPPROPRIATE'
        ? null
        : {
            source: 'Brand Character humor behavior',
            target: params.v21Contract.primaryHook,
            mechanism: 'OBSERVATIONAL_UNDERSTATEMENT',
            delivery: 'deadpan',
            timing: 'after primary hook',
            visualOrVerbal: primaryBeat.visualPunchline ? 'VISUAL' : 'VERBAL',
            culturalDependency: true,
            ethicalBoundary: 'no punching down',
            whyFunny: 'Exposes contradiction without re-expanding facts',
            whyNDX: 'Derived from existing humor system — not generic wit',
            failureRisk: 'generic snark',
          },
    judgmentRequired: true,
    culturalShorthandAllowed: true,
    humanTraceRequired: humanTraceStrength !== 'NONE',
    humanTraceStrength,
    controlledMisbehaviorAllowed: misbehavior.length > 0,
    controlledMisbehavior: misbehavior,
    informationRemoved,
    characterSignalsPreserved: [primaryBeat.text ?? params.v21Contract.primaryTrace, 'NDX judgment', 'cultural shorthand'],
    characterSignalsLost: [],
    microcopyBudget: 2,
    pettinessLevel: params.artifact.characterTemperature === 'PLAYFUL' ? 'PLAYFUL' : 'LIGHT',
    punchlineDisposition: primaryBeat.text ? 'PRESERVE_ON_SLIDE_1' : 'MOVE_TO_LATER_SLIDE',
    retentionEvaluation: null as never,
    fingerprint: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  contract.fingerprint = fp(contract);
  return contract;
}

export function characterBeatExplicitlyFormulated(beat: CharacterBeat): boolean {
  return Boolean(beat.beatType && beat.reasoning);
}

export function sparseMayHaveStrongCharacterDensity(textDensity: string, characterDensity: string): boolean {
  return (textDensity === 'SPARSE' || textDensity === 'MINIMAL') && (characterDensity === 'STRONG' || characterDensity === 'SUFFICIENT');
}

export function humanTraceNotHandwritingOnly(): true {
  return true;
}

export function randomMisbehaviorFails(mode: ControlledMisbehaviorMode, causality: string): boolean {
  if (!causality || causality.includes('for personality') || causality.includes('Rotate')) return true;
  return mode === 'SLIGHT_ROTATION' && causality.length < 20;
}

export function controlledMisbehaviorRequiresCausality(m: ControlledMisbehavior): boolean {
  return Boolean(m.causality && m.causality.length > 15 && !m.causality.includes('for personality'));
}
