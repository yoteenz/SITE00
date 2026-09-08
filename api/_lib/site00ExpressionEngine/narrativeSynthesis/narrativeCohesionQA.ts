/**
 * C1.0 — Narrative cohesion QA (multi-domain diagnostics).
 */

import type {
  AudienceKnowledgeState,
  EmotionalArc,
  NarrativeBeat,
  NarrativeCausalityGraph,
  NarrativeCohesionQA,
  NarrativeFailureClassification,
  NarrativePayoff,
  NarrativeQuestion,
  RevealStrategy,
  RoleIntelligence,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import { detectRedundantBeats } from './audienceKnowledgeModel.js';
import { emotionalArcIsFlat } from './emotionalArcModel.js';
import { validatePayoffIntegrity } from './narrativePayoffLogic.js';
import { interjectionIsEarned } from './revealStrategy.js';
import { validateRoleNarrativeFunction } from './roleIntelligence.js';

type QAContext = {
  beats: NarrativeBeat[];
  graph: NarrativeCausalityGraph;
  audienceJourney: AudienceKnowledgeState[];
  emotionalArc: EmotionalArc;
  liveQuestions: NarrativeQuestion[];
  revealStrategy: RevealStrategy;
  roles: RoleIntelligence;
  payoff: NarrativePayoff;
  interjectionBeatId: string;
  aftershockPresent: boolean;
};

function domain(
  name: string,
  passed: boolean,
  diagnostics: string[],
  score = passed ? 1 : 0,
) {
  return { domain: name, passed, score, diagnostics };
}

export function runNarrativeCohesionQA(ctx: QAContext): NarrativeCohesionQA {
  const failures: NarrativeFailureClassification[] = [];
  const domains = [];

  const emptyWhy = ctx.beats.filter((b) => !b.whyItHappensNow.trim());
  const causalityPass = emptyWhy.length === 0 && ctx.graph.edges.length >= ctx.beats.length - 2;
  if (!causalityPass) failures.push('WEAK_CAUSALITY');
  domains.push(
    domain(
      'causality',
      causalityPass,
      emptyWhy.length ? emptyWhy.map((b) => `${b.beatId} missing whyItHappensNow`) : ['All beats causally motivated'],
    ),
  );

  const orderPass = ctx.graph.shuffleTestPassed && ctx.graph.orderDependency !== 'WEAK';
  if (!orderPass) failures.push('LOW_ORDER_DEPENDENCY', 'SCENE_COLLECTION_NOT_STORY');
  domains.push(
    domain(
      'orderDependency',
      orderPass,
      [ctx.graph.shuffleDamageSummary ?? `Order dependency: ${ctx.graph.orderDependency}`],
    ),
  );

  const knowledgeProgression = ctx.audienceJourney.some((j, i) =>
    i === 0 ? true : j.knownFacts.length > ctx.audienceJourney[i - 1].knownFacts.length,
  );
  domains.push(
    domain(
      'audienceKnowledgeProgression',
      knowledgeProgression,
      knowledgeProgression ? ['Audience knowledge advances'] : ['Knowledge state stagnant'],
    ),
  );

  const escalationPass = ctx.beats.some((b) => b.beatType === 'ESCALATION' || b.beatType === 'TURN');
  if (!escalationPass) failures.push('WEAK_ESCALATION');
  domains.push(
    domain(
      'emotionalEscalation',
      escalationPass && !emotionalArcIsFlat(ctx.emotionalArc.progression),
      emotionalArcIsFlat(ctx.emotionalArc.progression) ? ['Emotionally flat arc'] : ['Escalation present'],
    ),
  );

  const liveQuestionPass = ctx.liveQuestions.some((q) => q.question.length > 0);
  if (!liveQuestionPass) failures.push('NO_LIVE_QUESTION');
  domains.push(
    domain(
      'questionAnswerProgression',
      liveQuestionPass,
      ctx.liveQuestions.map((q) => q.question),
    ),
  );

  const turnBeat = ctx.beats.find((b) => b.beatType === 'TURN');
  const turnPass = Boolean(turnBeat?.whatHappens && turnBeat.whyItHappensNow);
  if (!turnPass) failures.push('UNEARNT_TURN');
  domains.push(
    domain(
      'turningPointStrength',
      turnPass,
      turnBeat ? [`Turn at ${turnBeat.beatId}`] : ['No turn identified'],
    ),
  );

  const contradictionBeat = ctx.beats.find((b) => b.beatType === 'CONTRADICTION');
  domains.push(
    domain(
      'contradictionClarity',
      Boolean(contradictionBeat),
      contradictionBeat ? [contradictionBeat.whatHappens] : ['Missing contradiction beat'],
    ),
  );

  const interjectionEarned = interjectionIsEarned(ctx.beats, ctx.interjectionBeatId);
  if (!interjectionEarned) failures.push('UNEARNT_INTERJECTION');
  domains.push(
    domain(
      'interjectionEarned',
      interjectionEarned,
      interjectionEarned ? ['Interjection after evidence'] : ['Interjection not earned'],
    ),
  );

  const payoffCheck = validatePayoffIntegrity(ctx.payoff, ctx.beats);
  if (payoffCheck.unsetupPayoff) failures.push('UNSETUP_PAYOFF');
  if (payoffCheck.unpaidSetup) failures.push('UNPAID_SETUP');
  domains.push(
    domain(
      'payoffIntegrity',
      !payoffCheck.unsetupPayoff && !payoffCheck.unpaidSetup,
      [
        payoffCheck.unsetupPayoff ? 'UNSETUP_PAYOFF' : 'Payoff linked to setup',
        payoffCheck.unpaidSetup ? 'UNPAID_SETUP' : 'Setups resolved',
      ],
    ),
  );

  const roleCheck = validateRoleNarrativeFunction(ctx.roles);
  if (!roleCheck.worldValid) failures.push('DECORATIVE_WORLD');
  if (!roleCheck.artifactValid) failures.push('DECORATIVE_ARTIFACT');
  if (roleCheck.roleConfusion) failures.push('ROLE_CONFUSION');
  domains.push(
    domain('worldNarrativeFunction', roleCheck.worldValid, [ctx.roles.worldRationale]),
    domain('artifactNarrativeFunction', roleCheck.artifactValid, [ctx.roles.artifactRationale]),
    domain('characterRoleClarity', !roleCheck.roleConfusion, [ctx.roles.ndxRationale, ctx.roles.subjectRationale]),
  );

  const redundant = detectRedundantBeats(ctx.beats, ctx.audienceJourney);
  if (redundant.length > 0) failures.push('REDUNDANT_BEATS');
  domains.push(
    domain(
      'redundancy',
      redundant.length === 0,
      redundant.length ? redundant.map((id) => `Redundant: ${id}`) : ['No redundant beats'],
    ),
  );

  domains.push(
    domain(
      'endingAftershock',
      ctx.aftershockPresent,
      ctx.aftershockPresent ? ['Aftershock present'] : ['Missing aftershock / continuation'],
    ),
  );

  const overallScore = domains.reduce((sum, d) => sum + d.score, 0) / domains.length;
  const passed = failures.length === 0 && overallScore >= 0.85;

  return {
    passed,
    overallScore,
    domains,
    failureClassifications: [...new Set(failures)],
  };
}
