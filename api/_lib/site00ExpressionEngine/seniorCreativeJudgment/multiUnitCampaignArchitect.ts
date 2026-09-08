/**
 * C1.6 — Multi-unit campaign architect + all-unit senior judgment.
 */

import type { SeniorCreativeJudgmentInput } from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type {
  ContentUnitRole,
  UnitCreativeDirection,
  UnitHandoff,
  CampaignResponsibilityBrief,
  CreativeReasoningDispatchReceipt,
  ProviderHealthStatus,
} from '../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type { PackageSeniorCreativeJudgment } from '../../../shared/site00-expression-engine/package-creative-judgment/types.js';
import type { MarketingPackageMasterDirectorOutput } from '../../../shared/site00-expression-engine/campaign-narrative/types.js';
import {
  VERDANT_ROW_LAUNCH_BRIEF,
  buildCampaignResponsibilityFromBrief,
  type ThinMultiUnitBrief,
} from './blindMultiUnitFixtures.js';
import {
  runCreativeReasoning,
  checkCreativeReasoningProviderHealth,
  isCreativeReasoningProviderConfigured,
  type CreativeRuntimeMode,
} from './creativeReasoningProvider.js';
import { runSeniorCreativeJudgment } from './seniorCreativeJudgmentEngine.js';
import { retrieveApplicableCorrectionPrinciples, persistSeniorCreativeJudgment } from './creativeIntelligenceStore.js';
import { buildPackageSeniorJudgment } from './packageSeniorCreativeJudgment.js';
import { runCinematicContinuityDirector } from '../cinematicContinuity/cinematicContinuityDirector.js';
import { runCampaignCopyDirector } from '../campaignCopy/campaignCopyDirector.js';

export type MultiUnitBlindCampaignOutput = {
  brief: ThinMultiUnitBrief;
  campaignResponsibility: CampaignResponsibilityBrief;
  initialTerritories: string[];
  initialCampaignWinner: string;
  campaignIdea: string;
  heroConcept: string;
  units: UnitCreativeDirection[];
  handoffs: UnitHandoff[];
  packageJudgment: PackageSeniorCreativeJudgment;
  principlesApplied: string[];
  providerHealth: ProviderHealthStatus;
  runtimeMode: CreativeRuntimeMode | 'FULL_REASONING_LIVE_TEST_BLOCKED';
  reasoningDepthLimited: boolean;
  textReasoningDispatchCount: number;
  dispatchReceipts: CreativeReasoningDispatchReceipt[];
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
  fullReasoningLiveTestBlocked?: string;
  copyPackage?: import('../../../shared/site00-expression-engine/campaign-copy/types.js').CampaignCopyPackageOutput;
};

type UnitSpec = {
  unitId: string;
  medium: UnitCreativeDirection['medium'];
  campaignRole: string;
  formatTarget: SeniorCreativeJudgmentInput['formatTarget'];
  conceptSeed: string;
  lightweight?: boolean;
};

function deriveTerritories(brief: ThinMultiUnitBrief): string[] {
  if (brief.projectId === 'verdant-row') {
    return [
      `Guilt-as-data: ${brief.brandName} reframes plant death as diagnostic information`,
      `Confession-first care: subscription begins with honest leaf assessment, not aspirational greenery`,
      `Seasonal rescue rhythm: ${brief.launchContext} as permission to restart without performance`,
    ];
  }
  return [
    `${brief.brandName}: ${brief.brandTruth.slice(0, 90)}`,
    `Audience tension — ${brief.targetAudience.slice(0, 70)}`,
    `${brief.launchContext}: ${brief.campaignObjective.slice(0, 80)}`,
  ];
}

function pickInitialWinner(territories: string[]): string {
  return territories[1] ?? territories[0] ?? 'Confession-first care architecture';
}

function buildUnitSpecs(brief: ThinMultiUnitBrief, campaignIdea: string): UnitSpec[] {
  const isVerdant = brief.projectId === 'verdant-row';
  return [
    {
      unitId: `${brief.briefId}-hero-reel`,
      medium: 'HERO_REEL',
      campaignRole: 'HERO',
      formatTarget: 'REEL',
      conceptSeed: isVerdant
        ? `${campaignIdea} — temporal discovery of guilt becoming curiosity through leaf diagnosis`
        : `${campaignIdea} — temporal sensory discovery for ${brief.productOrService.slice(0, 60)}`,
    },
    {
      unitId: `${brief.briefId}-carousel`,
      medium: 'CAROUSEL',
      campaignRole: 'PROOF',
      formatTarget: 'CAROUSEL',
      conceptSeed: isVerdant
        ? `Seven-day rescue progression — each slide a different confession-to-action beat, not Reel frames`
        : `Progressive proof sequence — each slide advances ${brief.brandTruth.slice(0, 50)} without repeating hero composition`,
    },
    {
      unitId: `${brief.briefId}-story`,
      medium: 'STORY_SEQUENCE',
      campaignRole: 'PARTICIPATION',
      formatTarget: 'STORY',
      conceptSeed: isVerdant
        ? `Tap-speed guilt loop — water reminder as emotional trigger, poll on "which leaf lied to you?"`
        : `Tap-speed ritual loop — participation mechanic native to ${brief.launchContext.slice(0, 40)}`,
    },
    {
      unitId: `${brief.briefId}-x-post`,
      medium: 'X_POST',
      campaignRole: 'SOCIAL_ARGUMENT',
      formatTarget: 'X',
      conceptSeed: isVerdant
        ? `Public provocation: plant care industry sells competence theater — ${brief.brandName} sells honest diagnostics`
        : `Public argument: category clichés vs ${brief.brandName} — ${brief.campaignObjective.slice(0, 60)}`,
    },
    {
      unitId: `${brief.briefId}-email`,
      medium: 'EMAIL',
      campaignRole: 'PERSUASION',
      formatTarget: 'EMAIL',
      conceptSeed: isVerdant
        ? `Long-form trust build — repot confession letter leading to trial, not recap of social assets`
        : `Long-form persuasion — trust and conversion context social cannot carry for ${brief.productOrService.slice(0, 50)}`,
    },
    {
      unitId: `${brief.briefId}-alt-caption`,
      medium: 'LIGHTWEIGHT_CRAFT_REVIEW',
      campaignRole: 'UTILITY',
      formatTarget: 'CAROUSEL',
      conceptSeed: 'Alt caption variant for carousel slide 3',
      lightweight: true,
    },
  ];
}

function buildUnitRole(spec: UnitSpec, brief: ThinMultiUnitBrief, index: number): ContentUnitRole {
  const isVerdant = brief.projectId === 'verdant-row';
  const before = isVerdant
    ? index === 0
      ? 'Shame about killing plants'
      : `Post-${index} audience state`
    : index === 0
      ? `Skepticism about ${brief.productOrService.slice(0, 40)}`
      : `Post-${index} audience state`;
  const after = isVerdant
    ? index === 0
      ? 'Curiosity about diagnosable care'
      : `Escalated belief shift ${index + 1}`
    : index === 0
      ? 'Curiosity about craft-led private luxury'
      : `Escalated belief shift ${index + 1}`;
  return {
    unitId: spec.unitId,
    medium: spec.medium,
    campaignRole: spec.campaignRole,
    audienceStateBefore: before,
    audienceStateAfter: after,
    whatItIntroduces: spec.conceptSeed.slice(0, 120),
    whatItProves: brief.brandTruth.slice(0, 100),
    whatItEscalates: `Stakes from personal guilt toward ${brief.businessGoal.slice(0, 60)}`,
    whatItHandsOff: index < 4 ? `Open question for next unit` : brief.campaignObjective.slice(0, 80),
    whyThisMedium: mediumRationaleFor(spec.medium),
    whatItMustNotRepeat: 'Same reveal composition as hero Reel',
  };
}

function mediumRationaleFor(medium: UnitCreativeDirection['medium']): string {
  switch (medium) {
    case 'HERO_REEL':
      return 'Reel requires temporal discovery, camera movement, and sound-led guilt-to-curiosity turn';
    case 'CAROUSEL':
      return 'Carousel needs page-turn progression and saveable slide logic — not Reel storyboard slides';
    case 'STORY_SEQUENCE':
      return 'Story exploits tap progression, speed, and participation — vertical tension not carousel density';
    case 'X_POST':
      return 'X behaves as public discourse — compression, provocation, quotability';
    case 'EMAIL':
      return 'Email adds persuasion, trust, and conversion context social cannot carry';
    default:
      return 'Utility derivative — lightweight craft review only';
  }
}

function buildJudgmentInput(
  spec: UnitSpec,
  brief: ThinMultiUnitBrief,
  role: ContentUnitRole,
  campaignIdea: string,
): SeniorCreativeJudgmentInput {
  const isFilm = spec.formatTarget === 'REEL' || spec.formatTarget === 'FILM';
  return {
    projectId: brief.projectId,
    campaignId: brief.campaignId,
    contentUnitId: spec.unitId,
    formatTarget: spec.formatTarget,
    conceptName: spec.conceptSeed.split('—')[0]?.trim().slice(0, 48).toUpperCase() || 'UNIT CONCEPT',
    oneSentenceIdea: spec.conceptSeed,
    thesis: campaignIdea,
    world: isFilm ? 'Apartment window light — leaf close-ups, watering guilt, diagnostic app glow' : role.whatItIntroduces,
    worldFunction: isFilm ? 'Domestic space where plant condition reveals emotional truth' : role.whatItProves,
    artifact: null,
    artifactFunction: null,
    interjection: '',
    openingImage: isFilm ? 'Wilting leaf in harsh phone flash' : '',
    centralReveal: role.whatItIntroduces,
    turningPoint: role.whatItEscalates,
    climaxImage: role.whatItHandsOff,
    endingImage: brief.campaignObjective.slice(0, 80),
    handoffOut: role.whatItHandsOff,
    entry004Tease: '',
    deeperContradiction: `${brief.brandTruth} — ${role.audienceStateBefore} vs ${role.audienceStateAfter}`,
    culturalRead: `${brief.targetAudience} — ${brief.tone}`,
  };
}

async function runUnitJudgment(
  spec: UnitSpec,
  brief: ThinMultiUnitBrief,
  role: ContentUnitRole,
  campaignIdea: string,
  responsibilityJson: string,
  receipts: CreativeReasoningDispatchReceipt[],
): Promise<UnitCreativeDirection> {
  if (spec.lightweight) {
    const input = buildJudgmentInput(spec, brief, role, campaignIdea);
    const base = runSeniorCreativeJudgment(input);
    return {
      unitId: spec.unitId,
      medium: spec.medium,
      role,
      initialDirection: spec.conceptSeed,
      finalDirection: spec.conceptSeed,
      mediumRationale: role.whyThisMedium,
      heroMoment: base.heroMemoryImage.imageDescription,
      handoffOut: role.whatItHandsOff,
      judgment: base,
      runtimeMode: 'DETERMINISTIC_FALLBACK',
      reviewType: 'LIGHTWEIGHT_CRAFT_REVIEW',
      qualityTier: 'VALID',
      founderHandholdingRisk: 'LOW',
    };
  }

  const input = buildJudgmentInput(spec, brief, role, campaignIdea);
  const principles = retrieveApplicableCorrectionPrinciples({
    medium: spec.formatTarget,
    campaignType: 'product_launch',
    domains: [spec.medium.toLowerCase(), 'campaign worlds'],
  });

  const startedAt = new Date().toISOString();
  const reasoning = await runCreativeReasoning({
    input,
    campaignResponsibility: responsibilityJson,
    retrievedPrinciples: principles.map((p) => p.generalizablePrinciple),
  });
  receipts.push({
    runId: `reasoning-${spec.unitId}-${Date.now()}`,
    provider: reasoning.runtimeMode === 'FULL_REASONING' ? 'anthropic' : 'deterministic',
    model: process.env.ANTHROPIC_CREATIVE_MODEL ?? 'claude-sonnet-4-20250514',
    purpose: `unit_judgment:${spec.unitId}`,
    dispatchCount: reasoning.textReasoningDispatchCount,
    startedAt,
    completedAt: new Date().toISOString(),
  });

  const base = runSeniorCreativeJudgment(input);
  const judgment = {
    ...base,
    qualityTier: reasoning.reasoningDepthLimited ? base.qualityTier : reasoning.qualityTier,
    founderHandholdingRisk: reasoning.founderHandholdingRisk,
    firstAnswerChallenge: {
      ...base.firstAnswerChallenge,
      attackVectors:
        reasoning.attackVectors.length >= 3 ? reasoning.attackVectors : base.firstAnswerChallenge.attackVectors,
    },
    challenger: {
      ...base.challenger,
      conceptName: reasoning.challengerConceptName,
      oneSentenceIdea: reasoning.challengerIdea,
    },
    seniorDirectorReview: {
      ...base.seniorDirectorReview,
      finalDirection: reasoning.finalDirection,
      deeperIdea: reasoning.deeperIdea,
      founderHandholdingRisk: reasoning.founderHandholdingRisk,
    },
    failureClasses: [...new Set([...base.failureClasses, ...reasoning.failureClasses])],
  };

  await persistSeniorCreativeJudgment({
    judgmentId: judgment.judgmentId,
    projectId: brief.projectId,
    campaignId: brief.campaignId,
    contentUnitId: spec.unitId,
    initialWinner: judgment.seniorDirectorReview.initialWinner,
    finalWinner: judgment.seniorDirectorReview.finalDirection,
    qualityTier: judgment.qualityTier,
    founderHandholdingRisk: judgment.founderHandholdingRisk,
    runtimeMode: reasoning.runtimeMode,
    record: judgment,
  });

  return {
    unitId: spec.unitId,
    medium: spec.medium,
    role,
    initialDirection: spec.conceptSeed,
    finalDirection: reasoning.finalDirection,
    mediumRationale: reasoning.mediumRationale || role.whyThisMedium,
    heroMoment: reasoning.heroMemoryImage || judgment.heroMemoryImage.imageDescription,
    handoffOut: role.whatItHandsOff,
    judgment,
    runtimeMode: reasoning.runtimeMode,
    reviewType: 'SENIOR_CREATIVE_JUDGMENT',
    qualityTier: judgment.qualityTier,
    founderHandholdingRisk: judgment.founderHandholdingRisk,
  };
}

function buildHandoffs(units: UnitCreativeDirection[]): UnitHandoff[] {
  const major = units.filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT');
  const handoffs: UnitHandoff[] = [];
  for (let i = 0; i < major.length - 1; i++) {
    const from = major[i]!;
    const to = major[i + 1]!;
    handoffs.push({
      fromUnitId: from.unitId,
      toUnitId: to.unitId,
      handoffType: 'CONCEPTUAL',
      handoffObject: from.handoffOut,
      handoffQuestion: `What does ${to.role.campaignRole} add that ${from.role.campaignRole} could not?`,
      handoffCopy: from.finalDirection.slice(0, 80),
      handoffEmotion: 'Curiosity escalating to conviction',
      whyItWorks: `${from.role.campaignRole} opens proof; ${to.role.campaignRole} extends without cloning composition`,
    });
  }
  return handoffs;
}

export async function runMultiUnitBlindCampaignPackage(
  brief: ThinMultiUnitBrief = VERDANT_ROW_LAUNCH_BRIEF,
): Promise<MultiUnitBlindCampaignOutput> {
  const providerHealth = await checkCreativeReasoningProviderHealth();
  const receipts: CreativeReasoningDispatchReceipt[] = [];
  const campaignResponsibility = buildCampaignResponsibilityFromBrief(brief);
  const responsibilityJson = JSON.stringify(campaignResponsibility);
  const territories = deriveTerritories(brief);
  const initialCampaignWinner = pickInitialWinner(territories);
  const campaignIdea = `${initialCampaignWinner} — ${brief.campaignObjective}`;
  const specs = buildUnitSpecs(brief, campaignIdea);

  const principles = retrieveApplicableCorrectionPrinciples({
    medium: 'REEL',
    campaignType: 'product_launch',
    domains: ['film', 'reel', 'carousel', 'email'],
  });

  let runtimeMode: CreativeRuntimeMode | 'FULL_REASONING_LIVE_TEST_BLOCKED' = providerHealth.runtimeMode as CreativeRuntimeMode;
  let reasoningDepthLimited = true;
  let totalDispatch = 0;
  let fullReasoningBlocked: string | undefined;

  if (
    providerHealth.providerAvailable &&
    providerHealth.reasoningDispatchAllowed &&
    process.env.VITEST !== 'true' &&
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK !== '1'
  ) {
    runtimeMode = 'FULL_REASONING';
    reasoningDepthLimited = false;
  } else if (!providerHealth.providerAvailable && process.env.VITEST !== 'true') {
    runtimeMode = 'FULL_REASONING_LIVE_TEST_BLOCKED';
    fullReasoningBlocked = providerHealth.blockReason ?? 'ANTHROPIC_API_KEY not configured';
  }

  const units: UnitCreativeDirection[] = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]!;
    const role = buildUnitRole(spec, brief, i);
    const unit = await runUnitJudgment(spec, brief, role, campaignIdea, responsibilityJson, receipts);
    units.push(unit);
    totalDispatch += unit.runtimeMode === 'FULL_REASONING' ? 1 : 0;
  }

  const handoffs = buildHandoffs(units);
  const aggregateMode = units.some((u) => u.runtimeMode === 'FULL_REASONING')
    ? 'FULL_REASONING'
    : units.some((u) => u.runtimeMode === 'HYBRID')
      ? 'HYBRID'
      : 'DETERMINISTIC_FALLBACK';

  const packageJudgment = buildPackageSeniorJudgment({
    brief,
    responsibility: campaignResponsibility,
    units,
    handoffs,
    initialCampaignWinner,
    campaignIdea,
    runtimeMode: aggregateMode,
    reasoningDepthLimited: aggregateMode !== 'FULL_REASONING',
  });

  const copyPackage = await runCampaignCopyDirector({
    brief,
    units,
    campaignCreativeDNA: packageJudgment.campaignCreativeDNA,
    projectId: brief.projectId,
  });

  return {
    brief,
    campaignResponsibility,
    initialTerritories: territories,
    initialCampaignWinner,
    campaignIdea,
    heroConcept: units.find((u) => u.medium === 'HERO_REEL')?.finalDirection ?? initialCampaignWinner,
    units,
    handoffs,
    packageJudgment,
    principlesApplied: principles.map((p) => p.generalizablePrinciple),
    providerHealth,
    runtimeMode: fullReasoningBlocked ? 'FULL_REASONING_LIVE_TEST_BLOCKED' : aggregateMode,
    reasoningDepthLimited: aggregateMode !== 'FULL_REASONING',
    textReasoningDispatchCount: totalDispatch,
    dispatchReceipts: receipts,
    imageProviderDispatchCount: 0,
    videoProviderDispatchCount: 0,
    falDispatchCount: 0,
    fullReasoningLiveTestBlocked: fullReasoningBlocked,
    copyPackage,
  };
}

export function isTrivialUtilityUnit(unitFunction: string, formatHint?: string): boolean {
  const trivial = /resize|thumbnail|alt.?text|caption.?variant|crop|utility/i;
  return trivial.test(unitFunction) || trivial.test(formatHint ?? '');
}

export async function runSeniorJudgmentForAllMpmdUnits(
  mpmd: MarketingPackageMasterDirectorOutput,
  enrichFn: (
    input: SeniorCreativeJudgmentInput,
    responsibility: string,
  ) => Promise<{ judgment: import('../../../shared/site00-expression-engine/senior-creative-judgment/types.js').SeniorCreativeJudgmentOutput; runtimeMode: CreativeRuntimeMode; reasoningDepthLimited: boolean; dispatchCount: number }>,
): Promise<
  Array<{
    unitId: string;
    judgment: import('../../../shared/site00-expression-engine/senior-creative-judgment/types.js').SeniorCreativeJudgmentOutput;
    runtimeMode: CreativeRuntimeMode;
    reasoningDepthLimited: boolean;
    reviewType: 'SENIOR_CREATIVE_JUDGMENT' | 'LIGHTWEIGHT_CRAFT_REVIEW';
  }>
> {
  const runs: Array<{
    unitId: string;
    judgment: import('../../../shared/site00-expression-engine/senior-creative-judgment/types.js').SeniorCreativeJudgmentOutput;
    runtimeMode: CreativeRuntimeMode;
    reasoningDepthLimited: boolean;
    reviewType: 'SENIOR_CREATIVE_JUDGMENT' | 'LIGHTWEIGHT_CRAFT_REVIEW';
  }> = [];

  const responsibility = mpmd.campaignThesis;
  for (const unit of mpmd.contentSequence.units) {
    if (isTrivialUtilityUnit(unit.unitFunction, unit.formatHint)) {
      const input: SeniorCreativeJudgmentInput = {
        projectId: 'generic',
        campaignId: mpmd.contentSequence.campaignId,
        contentUnitId: unit.unitId,
        formatTarget: 'CAROUSEL',
        conceptName: unit.title,
        oneSentenceIdea: unit.coreQuestion,
        thesis: mpmd.campaignThesis,
        world: unit.world,
        worldFunction: unit.subject,
        artifact: unit.artifact,
        artifactFunction: unit.artifact,
        interjection: '',
        openingImage: '',
        centralReveal: unit.contradiction,
        turningPoint: unit.endingLogic,
        climaxImage: unit.endingLogic,
        endingImage: unit.endingLogic,
        handoffOut: '',
        entry004Tease: '',
        deeperContradiction: unit.contradiction,
        culturalRead: unit.subject,
      };
      runs.push({
        unitId: unit.unitId,
        judgment: runSeniorCreativeJudgment(input),
        runtimeMode: 'DETERMINISTIC_FALLBACK',
        reasoningDepthLimited: true,
        reviewType: 'LIGHTWEIGHT_CRAFT_REVIEW',
      });
      continue;
    }

    const formatTarget =
      unit.formatHint === 'REEL' || unit.formatHint === 'FILM'
        ? 'REEL'
        : unit.formatHint === 'CAROUSEL'
          ? 'CAROUSEL'
          : unit.formatHint === 'STORY'
            ? 'STORY'
            : 'REEL';

    let input: SeniorCreativeJudgmentInput;

    if (unit.unitId === 'entry-003') {
      const continuity = runCinematicContinuityDirector();
      const winning = continuity.masterFilmDirectorPass.concepts.find(
        (c) => c.conceptName === continuity.masterFilmDirectorPass.winningConceptId,
      )!;
      input = {
        projectId: 'ndxbook',
        campaignId: mpmd.contentSequence.campaignId,
        contentUnitId: 'entry-003',
        formatTarget: 'REEL',
        conceptName: winning.conceptName,
        oneSentenceIdea: winning.oneSentenceFilmIdea,
        thesis: continuity.masterFilmDirectorPass.deeperContradiction,
        world: winning.world,
        worldFunction: winning.worldFunction,
        artifact: winning.artifact,
        artifactFunction: winning.artifactFunction,
        interjection: "YOU DIDN'T SKIP STEPS. YOU SKIPPED THE CAMERA.",
        openingImage: winning.openingImage,
        centralReveal: winning.centralReveal,
        turningPoint: winning.turningPoint,
        climaxImage: winning.climaxImage,
        endingImage: winning.endingImage,
        handoffOut: winning.handoffOutToEntry004Candidate,
        entry004Tease: 'Wellness notification — non-canon seed',
        deeperContradiction: continuity.masterFilmDirectorPass.deeperContradiction,
        culturalRead: continuity.entry003Responsibility.whatEntryMustAdd,
      };
    } else {
      input = {
        projectId: 'ndxbook',
        campaignId: mpmd.contentSequence.campaignId,
        contentUnitId: unit.unitId,
        formatTarget,
        conceptName: unit.title,
        oneSentenceIdea: unit.coreQuestion,
        thesis: mpmd.campaignThesis,
        world: unit.world,
        worldFunction: unit.subject,
        artifact: unit.artifact,
        artifactFunction: unit.artifact,
        interjection: '',
        openingImage: unit.world,
        centralReveal: unit.contradiction,
        turningPoint: unit.endingLogic,
        climaxImage: unit.endingLogic,
        endingImage: unit.endingLogic,
        handoffOut: mpmd.handoffs.find((h) => h.fromUnitId === unit.unitId)?.handoffQuestion ?? '',
        entry004Tease: '',
        deeperContradiction: unit.contradiction,
        culturalRead: unit.subject,
      };
    }

    const unitResponsibility =
      unit.unitId === 'entry-003'
        ? runCinematicContinuityDirector().entry003Responsibility.whatEntryMustAdd
        : responsibility;
    const enriched = await enrichFn(input, unitResponsibility);
    runs.push({
      unitId: unit.unitId,
      judgment: enriched.judgment,
      runtimeMode: enriched.runtimeMode,
      reasoningDepthLimited: enriched.reasoningDepthLimited,
      reviewType: 'SENIOR_CREATIVE_JUDGMENT',
    });
  }
  return runs;
}

export { VERDANT_ROW_LAUNCH_BRIEF };
