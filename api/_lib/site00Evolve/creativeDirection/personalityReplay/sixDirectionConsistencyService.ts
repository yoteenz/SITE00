/**
 * Six-direction blind creative consistency validation orchestrator.
 * Generates directions 2–6 sequentially; preserves direction 1 hero untouched.
 */

import { createHash } from 'node:crypto';
import type { BrandPersonalityReplayRecord } from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';
import type {
  SixDirectionConsistencyDirection,
  SixDirectionConsistencyRun,
  SixDirectionCrossDirectionTests,
  SixDirectionQaScores,
} from '../../../../../shared/site00-brand-lore/sixDirectionConsistencyTypes.js';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import { assertNoHostFontInPayload } from '../../../../../shared/site00-brand-lore/typographyProvenance.js';
import { buildPersonalityLineageFromProfile } from '../../../../../shared/site00-brand-lore/personalityLineage.js';
import { runCoreDirectionFormation } from '../creativeIntelligence/formationService.js';
import { getCreativeIntelligenceProvider } from '../creativeIntelligence/providerRegistry.js';
import { runSonnetDirectionExpressionSystem } from '../creativeIntelligence/directionExpressionSystemService.js';
import { runIdentityNativeArtDirector } from '../creativeIntelligence/identityNativeArtDirectorService.js';
import { runCreativeExpressionDirector } from '../creativeIntelligence/creativeExpressionService.js';
import { runCopyQualityGate, resolveHeroConceptAfterCopyGate } from '../creativeIntelligence/copyQualityGate.js';
import { compileIdentityNativeV2VisualBrief } from '../creativeIntelligence/identityNativeVisualBriefV2Compiler.js';
import { generateIdentityNativeImageFromBrief } from '../creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import type {
  ComparisonDirectionCandidate,
  CoreDirectionFormationRecord,
  FormedCoreDirection,
} from '../creativeIntelligence/types.js';
import type { BrandNativeAssetRole } from '../creativeIntelligence/brandNativeVisualBriefTypes.js';
import {
  buildShadowReplayFormationInput,
  loadReplayBenchmarkSnapshot,
  replayHeroTopic,
} from './replayService.js';
import { runDirectionDistinctivenessGate } from './directionDistinctivenessGate.js';
import { auditComparisonScorer } from './comparisonScorerAudit.js';
import * as replayStore from './replayStore/storeAdapter.js';

const FORMAT_ROTATION: string[] = [
  'CAROUSEL_COVER',
  'FEED_TILE',
  'STORY_FRAME',
  'SAVEABLE_REFERENCE_POST',
  'REEL_HOOK',
  'CAROUSEL_SEQUENCE',
];

const FORBIDDEN_CONTAMINATION_KEYS = [
  'benchmarkHeroImage',
  'benchmarkHeroPrompt',
  'priorDirectionHeroImage',
  'priorDirectionHeroPrompt',
  'otherDirectionHeroImages',
  'successfulBlindHeroReference',
  'historicalPilotImage',
  'historicalPilotPrompt',
  'downstreamRescueInstructions',
];

function nowIso(): string {
  return new Date().toISOString();
}

function emptyAccounting() {
  return { anthropicRequests: 0, falRequests: 0, estimatedCostUsd: 0 };
}

function shadowProfile(replay: BrandPersonalityReplayRecord): BrandLoreProfile {
  return {
    ...replay.brandLoreSnapshot,
    id: replay.brandLoreSnapshot.id ?? replay.sourceProfileId ?? undefined,
    brandPersonality: replay.synthesizedPersonality,
  };
}

function hashPrompt(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function buildDirectionSummary(direction: FormedCoreDirection): SixDirectionConsistencyDirection['summary'] {
  return {
    centralThesis: direction.oneLineThesis ?? direction.bigIdea ?? '',
    emotionalTerritory: direction.emotionalPromise ?? '',
    visualPremise: direction.visualMetaphor ?? direction.materialImageryLanguage ?? '',
    personalityInterpretation: direction.governingBehavior ?? direction.brandConnection ?? '',
    primarySocialBehavior: direction.socialExpressionHypothesis ?? direction.primaryBrandArtifact ?? '',
  };
}

function toComparisonCandidate(
  direction: FormedCoreDirection,
  formation: CoreDirectionFormationRecord,
  index: number,
): ComparisonDirectionCandidate {
  return {
    ...direction,
    comparisonIndex: index,
    sourceFormationId: formation.formationId,
    sourceFormationVersion: formation.formationVersion,
    sourceDirectionIndex: index,
    brandLoreProfileVersion: formation.brandLoreProfileVersion,
    brandLoreFingerprint: formation.brandLoreFingerprint,
    fieldCompleteness: { complete: true, missingFields: [] },
    completionLineage: null,
  };
}

function nativeAssetRoleForFormat(format: string): BrandNativeAssetRole {
  if (format === 'FEED_TILE' || format === 'CAROUSEL_COVER' || format === 'STORY_FRAME') {
    return 'SOCIAL_APPLICATION_SUBSTRATE';
  }
  return 'HERO_EDITORIAL_WORLD';
}

function aspectRatioForNativeFormat(format: string): string {
  if (format === 'FEED_TILE' || format === 'CAROUSEL_COVER') return '1:1';
  if (format === 'STORY_FRAME' || format === 'REEL_HOOK' || format === 'TIKTOK_VERTICAL') return '9:16';
  return '1:1';
}

function selectNativeFormatForIndex(
  comparisonIndex: number,
  usedFormats: Set<string>,
  direction: FormedCoreDirection,
): { format: string; rationale: string } {
  const preferred = FORMAT_ROTATION[(comparisonIndex - 1) % FORMAT_ROTATION.length];
  if (!usedFormats.has(preferred)) {
    return {
      format: preferred,
      rationale: `Format ${preferred} best proves "${direction.directionName}" social-first behavior without duplicating prior direction proofs.`,
    };
  }
  for (const fmt of FORMAT_ROTATION) {
    if (!usedFormats.has(fmt)) {
      return {
        format: fmt,
        rationale: `Fallback format ${fmt} — avoids resize-only alias of prior direction native proof.`,
      };
    }
  }
  return { format: preferred, rationale: `Default ${preferred} for direction ${comparisonIndex}.` };
}

function buildPersonalityTranslationReceipt(
  replay: BrandPersonalityReplayRecord,
  direction: FormedCoreDirection,
): SixDirectionConsistencyDirection['personalityTranslationReceipt'] {
  const lineage = buildPersonalityLineageFromProfile(replay.synthesizedPersonality);
  return lineage.slice(0, 10).map((entry) => ({
    domain: entry.upstreamField,
    upstreamEvidence: entry.upstreamValue,
    creativeTranslation: `${direction.directionName}: ${entry.derivedBehavior} → expressed via ${direction.governingBehavior ?? direction.primaryBrandArtifact ?? 'direction-native behavior'}.`,
  }));
}

function runContaminationAudit(payload: Record<string, unknown>): SixDirectionConsistencyDirection['contaminationAudit'] {
  const violations: string[] = [];
  for (const key of FORBIDDEN_CONTAMINATION_KEYS) {
    if (key in payload && payload[key] != null) violations.push(`forbidden key: ${key}`);
  }
  return {
    passed: violations.length === 0,
    benchmarkHeroExposed: 'benchmarkHeroImage' in payload || 'benchmarkHeroPrompt' in payload,
    priorHeroExposed: 'priorDirectionHeroImage' in payload || 'otherDirectionHeroImages' in payload,
    historicalPaletteExposed: 'historicalPilotImage' in payload,
    historicalTypographyExposed: 'historicalPilotTypography' in payload || 'martianMonoTypographyRoles' in payload,
    historicalPromptsExposed: 'historicalPilotPrompt' in payload,
    hardcodedRescueLogic: 'downstreamRescueInstructions' in payload,
    violations,
    auditedAt: nowIso(),
  };
}

function scoreFirstPassStructural(params: {
  direction: FormedCoreDirection;
  nativeFormat: string;
  hasHero: boolean;
  copyGatePass: boolean;
}): { status: SixDirectionConsistencyDirection['firstPassStatus']; scores: SixDirectionQaScores } {
  const base = 3;
  const scores: SixDirectionQaScores = {
    identityNative: params.hasHero ? 'NEEDS_HUMAN_REVIEW' : 0,
    personalityTranslation: params.direction.governingBehavior ? base + 1 : base,
    directionNative: params.direction.oneLineThesis ? base + 1 : base,
    formatNative: params.nativeFormat ? base + 1 : base,
    typographicAuthority: 'NEEDS_HUMAN_REVIEW',
    colorAuthority: 'NEEDS_HUMAN_REVIEW',
    compositionalArtistry: 'NEEDS_HUMAN_REVIEW',
    verbalPersonality: params.copyGatePass ? base + 1 : base,
    witIntelligence: 'NEEDS_HUMAN_REVIEW',
    secondReadDepth: 'NEEDS_HUMAN_REVIEW',
    visualSurprise: 'NEEDS_HUMAN_REVIEW',
    restraint: 'NEEDS_HUMAN_REVIEW',
    memorability: 'NEEDS_HUMAN_REVIEW',
    socialApplicability:
      params.nativeFormat.includes('STORY') || params.nativeFormat.includes('CAROUSEL') ? base + 1 : base,
    systemExtensibility: params.direction.signatureDevices?.length ? base + 1 : base,
    stockResemblance: 'NEEDS_HUMAN_REVIEW',
    genericAiResemblance: 'NEEDS_HUMAN_REVIEW',
  };

  let status: SixDirectionConsistencyDirection['firstPassStatus'] = 'NEEDS_HUMAN_REVIEW';
  if (!params.hasHero) status = 'FAILED';
  else if (params.copyGatePass && params.direction.oneLineThesis) status = 'STRONG';
  else status = 'WEAK';

  return { status, scores };
}

function buildDirectionRoster(params: {
  v1: CoreDirectionFormationRecord;
  v2: CoreDirectionFormationRecord;
  preservedDirectionId: string;
}): Array<{ direction: FormedCoreDirection; formation: CoreDirectionFormationRecord; comparisonIndex: number }> {
  const all: Array<{ direction: FormedCoreDirection; formation: CoreDirectionFormationRecord }> = [
    ...params.v1.finalDirections.map((d) => ({ direction: d, formation: params.v1 })),
    ...params.v2.finalDirections.map((d) => ({ direction: d, formation: params.v2 })),
  ];
  const preservedIdx = all.findIndex((x) => x.direction.directionId === params.preservedDirectionId);
  if (preservedIdx < 0) {
    throw new Error('Preserved direction #1 not found in six-direction roster');
  }
  const preserved = all[preservedIdx];
  const rest = all.filter((_, i) => i !== preservedIdx);
  return [preserved, ...rest].map((entry, idx) => ({
    ...entry,
    comparisonIndex: idx + 1,
  }));
}

function runCrossDirectionTests(directions: SixDirectionConsistencyDirection[]): SixDirectionCrossDirectionTests {
  const names = directions.map((d) => d.directionName.toLowerCase());
  const collapsePairs = names.filter((n, i) => names.some((m, j) => i !== j && n.slice(0, 12) === m.slice(0, 12)));
  return {
    sixStrangersTest: 'NEEDS_HUMAN_REVIEW',
    directionCollapseTest: collapsePairs.length > 0 ? 'FAIL' : 'NEEDS_HUMAN_REVIEW',
    styleCloningTest: 'NEEDS_HUMAN_REVIEW',
    personalityContinuityTest: directions.every((d) => d.personalityTranslationReceipt.length > 0)
      ? 'PASS'
      : 'NEEDS_HUMAN_REVIEW',
    formatRealityTest: directions.every((d) => d.nativeProofFormat && d.heroAsset) ? 'NEEDS_HUMAN_REVIEW' : 'FAIL',
    templateTest: 'NEEDS_HUMAN_REVIEW',
    stockTest: 'NEEDS_HUMAN_REVIEW',
    secondReadTest: 'NEEDS_HUMAN_REVIEW',
    fiftyPostTest: directions.every((d) => d.summary.centralThesis) ? 'NEEDS_HUMAN_REVIEW' : 'FAIL',
    notes: [
      'Automated cross-direction tests require founder visual review for cloning, stock, and second-read dimensions.',
      collapsePairs.length > 0 ? `Potential collapse names: ${collapsePairs.join(', ')}` : 'No obvious name-level collapse.',
    ],
  };
}

function computeConsistencyVerdict(
  directions: SixDirectionConsistencyDirection[],
): SixDirectionConsistencyRun['consistencyVerdict'] {
  const strong = directions.filter((d) => d.firstPassStatus === 'STRONG' || d.firstPassStatus === 'PRESERVED').length;
  const weak = directions.filter((d) => d.firstPassStatus === 'WEAK').length;
  const failed = directions.filter((d) => d.firstPassStatus === 'FAILED').length;
  const hitRate = `${strong} / 6`;
  let verdict: NonNullable<SixDirectionConsistencyRun['consistencyVerdict']>['verdict'] = 'INCOMPLETE';
  if (directions.length === 6) {
    if (strong >= 5) verdict = 'CONSISTENCY_VALIDATED';
    else if (strong === 4) verdict = 'PROMISING_TARGETED_REFINEMENT';
    else if (strong === 3) verdict = 'INCONSISTENT_METHODOLOGY_REFINEMENT';
    else verdict = 'FAILED_NOT_REPEATABLE';
  }
  return { strongFirstPassHeroes: strong, weakFirstPassHeroes: weak, failedFirstPassHeroes: failed, hitRate, verdict };
}

async function persistReplay(
  replay: BrandPersonalityReplayRecord,
  patch: Partial<BrandPersonalityReplayRecord>,
): Promise<BrandPersonalityReplayRecord> {
  return replayStore.savePersonalityReplayRecord({
    ...replay,
    ...patch,
    updatedAt: nowIso(),
  });
}

function consistencyHeroStoragePath(replayId: string, comparisonIndex: number): string {
  return `site00/validation/ndxbook/personality-replay/${replayId}/six-direction/${String(comparisonIndex).padStart(2, '0')}/hero.webp`;
}

function initRun(replay: BrandPersonalityReplayRecord): SixDirectionConsistencyRun {
  return (
    replay.sixDirectionConsistency ?? {
      status: 'NOT_STARTED',
      currentDirectionIndex: null,
      formationRecordV1: replay.formationRecord,
      formationRecordV2: null,
      directions: [],
      distinctivenessGatePassed: null,
      distinctivenessNotes: [],
      crossDirectionTests: null,
      consistencyVerdict: null,
      comparisonScorerAudit: null,
      accounting: replay.executionAccounting ?? emptyAccounting(),
      error: null,
      startedAt: nowIso(),
      completedAt: null,
    }
  );
}

async function generateDirectionHero(params: {
  replay: BrandPersonalityReplayRecord;
  rosterEntry: { direction: FormedCoreDirection; formation: CoreDirectionFormationRecord; comparisonIndex: number };
  nativeFormat: string;
  nativeFormatRationale: string;
  accounting: ReturnType<typeof emptyAccounting>;
}): Promise<{ slot: SixDirectionConsistencyDirection; accounting: ReturnType<typeof emptyAccounting> }> {
  const { replay, rosterEntry, nativeFormat, nativeFormatRationale } = params;
  let accounting = { ...params.accounting };
  const formationInput = buildShadowReplayFormationInput(replay);
  const hostCheck = assertNoHostFontInPayload(formationInput);
  if (!hostCheck.passed) throw new Error(`Typography leakage: ${hostCheck.violations.join('; ')}`);

  const contaminationAudit = runContaminationAudit({ ...formationInput });
  const candidate = toComparisonCandidate(rosterEntry.direction, rosterEntry.formation, rosterEntry.comparisonIndex - 1);

  const des = await runSonnetDirectionExpressionSystem({
    direction: candidate,
    formationInput,
    references: [],
    v2Board: null,
    v2Plan: null,
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
  });
  accounting.anthropicRequests += des.anthropicRequests;

  const expressionSystem = des.system;
  const iad = await runIdentityNativeArtDirector({
    expressionSystem,
    directionId: rosterEntry.direction.directionId,
    topic: replayHeroTopic(),
    references: [],
    orgSlug: 'ndxbook',
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
  });
  accounting.anthropicRequests += iad.anthropicRequests;

  const creative = await runCreativeExpressionDirector({
    expressionSystem,
    artDirection: iad.artDirection,
    v1Pilot: null,
    topic: replayHeroTopic(),
    upstreamPersonality: replay.synthesizedPersonality,
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
    brandSlug: 'ndxbook',
  });
  accounting.anthropicRequests += creative.anthropicRequests;

  let heroConcept = { ...creative.heroConcept, primaryProofFormat: nativeFormat };
  const copyGate = await runCopyQualityGate({
    heroConcept,
    creativeExpression: creative.creativeExpression,
  });
  heroConcept = resolveHeroConceptAfterCopyGate(heroConcept, copyGate);
  if (!copyGate.scores.pass && process.env.VITEST !== 'true') {
    throw new Error(`Copy gate failed for direction ${rosterEntry.comparisonIndex}: ${copyGate.scores.reasons.join('; ')}`);
  }

  const brief = compileIdentityNativeV2VisualBrief({
    artDirection: iad.artDirection,
    creativeExpression: creative.creativeExpression,
    heroConcept,
    copyQualityScores: copyGate.scores,
    role: nativeAssetRoleForFormat(nativeFormat),
    topic: replayHeroTopic(),
  });

  const promptHash = hashPrompt(JSON.stringify(brief));
  let heroAsset: SixDirectionConsistencyDirection['heroAsset'] = null;
  let generationReceipt: SixDirectionConsistencyDirection['generationReceipt'] = {
    firstGenerationResult: 'BLOCKED',
    firstGenerationPromptHash: promptHash,
    firstGenerationModel: 'openai/gpt-image-2',
    firstGenerationCostUsd: 0,
    qaResult: null,
    failureReason: null,
    generatedAt: null,
  };

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY?.trim()) {
    if (process.env.VITEST === 'true') {
      heroAsset = {
        assetId: `NDX-SIX-DIR-${String(rosterEntry.comparisonIndex).padStart(2, '0')}`,
        storagePath: consistencyHeroStoragePath(replay.replayId, rosterEntry.comparisonIndex),
        topic: replayHeroTopic(),
        provider: 'openai/gpt-image-2',
        generatedAt: nowIso(),
      };
      generationReceipt = {
        ...generationReceipt,
        firstGenerationResult: 'SUCCESS',
        generatedAt: heroAsset.generatedAt,
        qaResult: 'VITEST_STUB',
      };
    } else {
      throw new Error('FAL_KEY not configured — six-direction hero generation blocked');
    }
  } else {
    const generation = await generateIdentityNativeImageFromBrief({
      brief,
      aspectRatio: aspectRatioForNativeFormat(nativeFormat),
    });
    accounting.falRequests += 1;
    accounting.estimatedCostUsd += generation.costEstimateUsd;
    const imageBuffer = await downloadUrlToBuffer(generation.url);
    const storagePath = consistencyHeroStoragePath(replay.replayId, rosterEntry.comparisonIndex);
    await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });
    heroAsset = {
      assetId: `NDX-SIX-DIR-${String(rosterEntry.comparisonIndex).padStart(2, '0')}`,
      storagePath,
      topic: replayHeroTopic(),
      provider: 'openai/gpt-image-2',
      generatedAt: nowIso(),
    };
    generationReceipt = {
      firstGenerationResult: 'SUCCESS',
      firstGenerationPromptHash: promptHash,
      firstGenerationModel: 'openai/gpt-image-2',
      firstGenerationCostUsd: generation.costEstimateUsd,
      qaResult: 'FIRST_PASS',
      failureReason: null,
      generatedAt: heroAsset.generatedAt,
    };
  }

  const { status, scores } = scoreFirstPassStructural({
    direction: rosterEntry.direction,
    nativeFormat,
    hasHero: heroAsset != null,
    copyGatePass: copyGate.scores.pass,
  });

  return {
    slot: {
      comparisonIndex: rosterEntry.comparisonIndex,
      directionId: rosterEntry.direction.directionId,
      directionName: rosterEntry.direction.directionName,
      sourceFormationId: rosterEntry.formation.formationId,
      sourceFormationVersion: rosterEntry.formation.formationVersion,
      summary: buildDirectionSummary(rosterEntry.direction),
      nativeProofFormat: nativeFormat,
      nativeFormatRationale,
      scrollHookBehavior: rosterEntry.direction.socialExpressionHypothesis ?? null,
      repeatableContentSystem: rosterEntry.direction.primaryBrandArtifact ?? null,
      typographyRationale: rosterEntry.direction.typographicAttitude ?? null,
      colorRationale: rosterEntry.direction.coreColorLogic ?? null,
      directionExpression: des.system as unknown as Record<string, unknown>,
      identityArtDirection: iad.artDirection as unknown as Record<string, unknown>,
      creativeExpression: creative.creativeExpression as unknown as Record<string, unknown>,
      heroConcept: heroConcept as unknown as Record<string, unknown>,
      heroBrief: brief as unknown as Record<string, unknown>,
      heroAsset,
      personalityTranslationReceipt: buildPersonalityTranslationReceipt(replay, rosterEntry.direction),
      contaminationAudit,
      generationReceipt,
      firstPassStatus: status,
      qaScores: scores,
      founderJudgment: null,
    },
    accounting,
  };
}

function buildPreservedDirectionSlot(
  replay: BrandPersonalityReplayRecord,
  rosterEntry: { direction: FormedCoreDirection; formation: CoreDirectionFormationRecord; comparisonIndex: number },
): SixDirectionConsistencyDirection {
  return {
    comparisonIndex: 1,
    directionId: rosterEntry.direction.directionId,
    directionName: rosterEntry.direction.directionName,
    sourceFormationId: rosterEntry.formation.formationId,
    sourceFormationVersion: rosterEntry.formation.formationVersion,
    summary: buildDirectionSummary(rosterEntry.direction),
    nativeProofFormat: replay.nativeProofFormat ?? 'CAROUSEL_COVER',
    nativeFormatRationale: 'Validation output #1 — preserved blind replay first-pass hero.',
    scrollHookBehavior: rosterEntry.direction.socialExpressionHypothesis ?? null,
    repeatableContentSystem: rosterEntry.direction.primaryBrandArtifact ?? null,
    typographyRationale: rosterEntry.direction.typographicAttitude ?? null,
    colorRationale: rosterEntry.direction.coreColorLogic ?? null,
    directionExpression: replay.directionExpression,
    identityArtDirection: replay.identityArtDirection,
    creativeExpression: replay.creativeExpression,
    heroConcept: replay.heroConcept,
    heroBrief: replay.heroBrief,
    heroAsset: replay.heroAsset,
    personalityTranslationReceipt: buildPersonalityTranslationReceipt(replay, rosterEntry.direction),
    contaminationAudit: runContaminationAudit(buildShadowReplayFormationInput(replay)),
    generationReceipt: {
      firstGenerationResult: 'SUCCESS',
      firstGenerationPromptHash: replay.heroBrief ? hashPrompt(JSON.stringify(replay.heroBrief)) : null,
      firstGenerationModel: 'openai/gpt-image-2',
      firstGenerationCostUsd: 0,
      qaResult: 'PRESERVED_VALIDATION_OUTPUT_1',
      failureReason: null,
      generatedAt: replay.heroAsset?.generatedAt ?? null,
    },
    firstPassStatus: 'PRESERVED',
    qaScores: null,
    founderJudgment: null,
  };
}

export async function executeSixDirectionConsistencyValidation(
  replayId: string,
): Promise<BrandPersonalityReplayRecord> {
  let replay = await replayStore.getPersonalityReplayRecord(replayId);
  if (!replay) throw new Error('Replay not found');

  if (replay.sixDirectionConsistency?.status === 'COMPLETE') return replay;

  if (!replay.heroAsset || !replay.selectedShadowDirectionId || !replay.formationRecord) {
    throw new Error('Six-direction validation requires completed blind replay hero (direction #1 preserved)');
  }

  const provider = getCreativeIntelligenceProvider();
  if (provider.providerId === 'unavailable' && process.env.VITEST !== 'true') {
    throw new Error('ANTHROPIC_API_KEY required for six-direction consistency validation');
  }

  let run = initRun(replay);
  let accounting = { ...run.accounting };
  const profile = shadowProfile(replay);

  try {
    if (!run.formationRecordV2) {
      run = { ...run, status: 'FORMING_DIRECTIONS' };
      replay = await persistReplay(replay, { sixDirectionConsistency: run });

      const { record: v2 } = await runCoreDirectionFormation({
        orgSlug: 'ndxbook',
        profile,
        formationVersion: 2,
        includeLegacyExplorations: false,
        forceReform: true,
        retryFailed: true,
      });
      if (v2.finalDirections.length === 0) {
        throw new Error('Shadow formation v2 produced no directions');
      }
      accounting.anthropicRequests += v2.providerAccounting.requestCount ?? 0;
      accounting.estimatedCostUsd += v2.providerAccounting.tokenUsage.estimatedCostUsd ?? 0;
      run = {
        ...run,
        formationRecordV2: v2 as unknown as Record<string, unknown>,
        formationRecordV1: replay.formationRecord,
        accounting,
      };
      replay = await persistReplay(replay, { sixDirectionConsistency: run });
    }

    const v1 = run.formationRecordV1 as unknown as CoreDirectionFormationRecord;
    const v2 = run.formationRecordV2 as unknown as CoreDirectionFormationRecord;
    const roster = buildDirectionRoster({
      v1,
      v2,
      preservedDirectionId: replay.selectedShadowDirectionId,
    });

    if (run.distinctivenessGatePassed == null) {
      run = { ...run, status: 'DISTINCTIVENESS_GATE' };
      const gate = runDirectionDistinctivenessGate(roster.map((r) => r.direction));
      run = {
        ...run,
        distinctivenessGatePassed: gate.passed,
        distinctivenessNotes: gate.notes,
      };
      replay = await persistReplay(replay, { sixDirectionConsistency: run });
      if (!gate.passed && process.env.VITEST !== 'true') {
        throw new Error(`Distinctiveness gate failed: ${gate.notes.join('; ')}`);
      }
    }

    if (run.directions.length === 0) {
      run = {
        ...run,
        directions: [buildPreservedDirectionSlot(replay, roster[0])],
        currentDirectionIndex: 1,
      };
      replay = await persistReplay(replay, { sixDirectionConsistency: run });
    }

    const usedFormats = new Set(run.directions.map((d) => d.nativeProofFormat));

    for (const entry of roster.slice(1)) {
      if (run.directions.some((d) => d.comparisonIndex === entry.comparisonIndex)) continue;

      run = { ...run, status: 'GENERATING_DIRECTION', currentDirectionIndex: entry.comparisonIndex };
      replay = await persistReplay(replay, { sixDirectionConsistency: run });

      const { format, rationale } = selectNativeFormatForIndex(entry.comparisonIndex, usedFormats, entry.direction);
      usedFormats.add(format);

      const { slot, accounting: nextAccounting } = await generateDirectionHero({
        replay,
        rosterEntry: entry,
        nativeFormat: format,
        nativeFormatRationale: rationale,
        accounting,
      });
      accounting = nextAccounting;
      run = {
        ...run,
        directions: [...run.directions, slot].sort((a, b) => a.comparisonIndex - b.comparisonIndex),
        accounting,
      };
      replay = await persistReplay(replay, { sixDirectionConsistency: run });
    }

    run = { ...run, status: 'SCORING' };
    const benchmark = await loadReplayBenchmarkSnapshot({
      organizationId: replay.organizationId,
      orgSlug: 'ndxbook',
      allowLoad: true,
    });
    const comparisonScorerAudit = auditComparisonScorer({
      replay,
      canonicalPersonality: benchmark.brandPersonality,
    });
    const crossDirectionTests = runCrossDirectionTests(run.directions);
    const consistencyVerdict = computeConsistencyVerdict(run.directions);

    run = {
      ...run,
      status: 'COMPLETE',
      crossDirectionTests,
      consistencyVerdict,
      comparisonScorerAudit,
      completedAt: nowIso(),
      error: null,
      accounting,
    };

    return persistReplay(replay, { sixDirectionConsistency: run });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    run = { ...run, status: 'FAILED', error: message, accounting };
    return persistReplay(replay, { sixDirectionConsistency: run });
  }
}

export function buildSixDirectionDirectionReport(
  directions: SixDirectionConsistencyDirection[],
): string {
  return directions
    .map((d) =>
      [
        `DIRECTION ${String(d.comparisonIndex).padStart(2, '0')}`,
        `name: ${d.directionName}`,
        `central thesis: ${d.summary.centralThesis}`,
        `emotional territory: ${d.summary.emotionalTerritory}`,
        `visual premise: ${d.summary.visualPremise}`,
        `personality interpretation: ${d.summary.personalityInterpretation}`,
        `primary social behavior: ${d.summary.primarySocialBehavior}`,
      ].join('\n'),
    )
    .join('\n\n');
}

export async function setSixDirectionFounderJudgment(params: {
  replayId: string;
  comparisonIndex: number;
  judgment: SixDirectionConsistencyDirection['founderJudgment'];
}): Promise<BrandPersonalityReplayRecord> {
  const replay = await replayStore.getPersonalityReplayRecord(params.replayId);
  if (!replay?.sixDirectionConsistency) throw new Error('Six-direction consistency run not found');

  const directions = replay.sixDirectionConsistency.directions.map((d) =>
    d.comparisonIndex === params.comparisonIndex ? { ...d, founderJudgment: params.judgment } : d,
  );

  return persistReplay(replay, {
    sixDirectionConsistency: { ...replay.sixDirectionConsistency, directions },
  });
}
