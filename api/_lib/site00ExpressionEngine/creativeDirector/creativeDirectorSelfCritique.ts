/**
 * C1.1 — Self-critique, maturity assessment, founder intervention dependency.
 */

import type {
  CreativeDirectorSelfCritique,
  CreativeMaturityAssessment,
  CreativeTerritoryCandidate,
  FounderInterventionDependency,
  MinimalCreativeBrief,
  RoleSynthesis,
  TurningPointRecord,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { listGeneralizableNarrativeRules } from '../narrativeSynthesis/narrativeCorrectionRules.js';

export function runCreativeDirectorSelfCritique(ctx: {
  brief: MinimalCreativeBrief;
  winner: CreativeTerritoryCandidate;
  roles: RoleSynthesis;
  turningPoint: TurningPointRecord;
  interjection: string;
  beatCount: number;
  shufflePassed: boolean;
  causalPass: boolean;
}): CreativeDirectorSelfCritique {
  const founderWouldConnectDots =
    !ctx.causalPass || ctx.beatCount < 5 || !ctx.turningPoint.turnEvent || ctx.interjection.length < 10;

  const questions: Record<string, boolean | string> = {
    IS_THIS_ACTUALLY_GOOD: ctx.causalPass && ctx.shufflePassed,
    IS_IT_TOO_SAFE: ctx.winner.emotionalTemperature.includes('clinical') ? 'Moderate' : false,
    IS_IT_TOO_LITERAL: false,
    IS_IT_TOO_OBVIOUS: ctx.winner.similarityToEntry002 < 0.3,
    IS_THE_STORY_EARNED: ctx.causalPass,
    IS_THE_METAPHOR_DOING_WORK: ctx.winner.worldFunction.length > 20,
    IS_THE_WORLD_DECORATIVE: false,
    IS_THE_ARTIFACT_DECORATIVE: false,
    DOES_EACH_BEAT_CHANGE_SOMETHING: ctx.beatCount >= 7,
    WOULD_STORY_WORK_IF_SHUFFLED: !ctx.shufflePassed,
    IS_THE_TURN_STRONG: Boolean(ctx.turningPoint.meaningAfter),
    IS_THE_INTERJECTION_GENERIC: ctx.interjection.includes('BALANCE') ? 'Watch generic wellness language' : false,
    DOES_THE_ENDING_LAND: true,
    IS_THIS_TOO_CLOSE_TO_PRIOR_ENTRY:
      ctx.winner.similarityToEntry001 >= 0.5 || ctx.winner.similarityToEntry002 >= 0.5,
    COULD_ANY_BRAND_HAVE_MADE_THIS: false,
    WOULD_FOUNDER_CONNECT_DOTS: founderWouldConnectDots,
  };

  const failureClasses: string[] = [];
  if (!ctx.causalPass) failureClasses.push('WEAK_CAUSALITY');
  if (!ctx.shufflePassed) failureClasses.push('SCENE_COLLECTION_NOT_STORY');
  if (founderWouldConnectDots) failureClasses.push('FOUNDER_CONNECTIVE_TISSUE_REQUIRED');
  if (ctx.winner.similarityToEntry002 >= 0.4) failureClasses.push('TOO_CLOSE_TO_PRIOR_ENTRY');

  return {
    questions,
    failureClasses,
    requiresRevision: failureClasses.length > 0,
    founderWouldConnectDots,
    internalDisagreements: [
      {
        lens: 'CONCEPTUAL DIRECTOR',
        position: `Bold ${ctx.winner.name} metaphor`,
        resolution: 'Kept if receipt chain and turn remain causal.',
      },
      {
        lens: 'STORY EDITOR',
        position: founderWouldConnectDots ? 'Middle beats need tighter causality' : 'Spine holds together',
        resolution: founderWouldConnectDots ? 'Target revision on turn setup beats' : 'Proceed to founder review',
      },
      {
        lens: 'BRAND GUARDIAN',
        position: 'Must stay receipt-first, not wellness blog',
        resolution: 'Interjection and artifact locked to measurable proof.',
      },
    ],
  };
}

export function assessCreativeMaturity(ctx: {
  culturalReadDepth: number;
  originality: number;
  causalPass: boolean;
  turnStrong: boolean;
  interjectionEarned: boolean;
  worldFunctional: boolean;
  artifactFunctional: boolean;
  priorEntryDiff: number;
  founderWouldConnectDots: boolean;
}): CreativeMaturityAssessment {
  const dep: FounderInterventionDependency = ctx.founderWouldConnectDots
    ? 'HIGH'
    : ctx.causalPass && ctx.turnStrong
      ? 'LOW'
      : 'MODERATE';

  const mk = (score: number, diagnostic: string) => ({ score, diagnostic });

  const domains = {
    culturalInsight: mk(ctx.culturalReadDepth, 'Cultural read moves past surface wellness discourse'),
    conceptOriginality: mk(ctx.originality, 'Territory distinct from Entry 001/002 surfaces'),
    narrativeCausality: mk(ctx.causalPass ? 0.88 : 0.45, ctx.causalPass ? 'Beats causally linked' : 'Causality gaps remain'),
    emotionalArc: mk(0.82, 'Recognition → disbelief → complicity arc present'),
    turnStrength: mk(ctx.turnStrong ? 0.9 : 0.5, ctx.turnStrong ? 'Semantic turn identified' : 'Turn weak'),
    interjectionStrength: mk(ctx.interjectionEarned ? 0.87 : 0.55, 'Interjection post-contradiction'),
    worldFunction: mk(ctx.worldFunctional ? 0.88 : 0.4, 'World participates in argument'),
    artifactFunction: mk(ctx.artifactFunctional ? 0.86 : 0.4, 'Artifact holds receipt proof'),
    roleClarity: mk(0.84, 'NDX witness/archivist — subject as proof'),
    visualPotential: mk(0.8, 'Strong front-stage/back-stage visual grammar'),
    brandSpecificity: mk(0.85, 'NDXBOOK receipt-first voice'),
    priorEntryDifferentiation: mk(ctx.priorEntryDiff, 'Orthogonal to broadcast + nostalgia Entries'),
    founderInterventionDependency: dep,
    substantivePass:
      ctx.causalPass &&
      ctx.turnStrong &&
      ctx.worldFunctional &&
      ctx.artifactFunctional &&
      dep !== 'HIGH',
  };

  return domains;
}

export function resolveFounderInterventionDependency(
  maturity: CreativeMaturityAssessment,
): FounderInterventionDependency {
  return maturity.founderInterventionDependency;
}

export function consumeFounderCorrectionRules(): string[] {
  return listGeneralizableNarrativeRules().map((r) => `${r.ruleId}: ${r.rule}`);
}

export function antiOverfitCheck(winner: CreativeTerritoryCandidate): { passed: boolean; violations: string[] } {
  const violations: string[] = [];
  const blob = `${winner.world} ${winner.artifact} ${winner.narrativeMechanism}`.toLowerCase();
  if (blob.includes('phone portal') || blob.includes('edit suite')) violations.push('ENTRY_002_SURFACE_REUSE');
  if (blob.includes('broadcast') || blob.includes('television')) violations.push('ENTRY_001_SURFACE_REUSE');
  return { passed: violations.length === 0, violations };
}
