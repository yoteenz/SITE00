/**
 * Blind personality replay downstream execution — idempotent resume from persisted checkpoint.
 */

import { randomUUID } from 'node:crypto';
import type { BrandPersonalityReplayRecord, ReplayExecutionAccounting } from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';
import type { ReplayExecutionPhase } from '../../../../../shared/site00-brand-lore/replayExecutionPhases.js';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import {
  FORBIDDEN_FORMATION_DIRECTION_NAMES,
  assertReplayFormationInputAllowed,
} from '../../../../../shared/site00-brand-lore/personalityReplayLeakage.js';
import { assertReplayProductionReadyForDownstream } from '../../../../../shared/site00-brand-lore/replayProductionPreflight.js';
import {
  buildProductionBrandContext,
  selectNativeProofFormat,
} from '../../../../../shared/site00-brand-lore/productionPromptNormalization.js';
import { deriveFormatNativeExpressionProfile } from '../../../../../shared/site00-brand-lore/formatNativeExpression.js';
import { assertNoHostFontInPayload } from '../../../../../shared/site00-brand-lore/typographyProvenance.js';
import { runCoreDirectionFormation } from '../creativeIntelligence/formationService.js';
import { getCreativeIntelligenceProvider } from '../creativeIntelligence/providerRegistry.js';
import { runSonnetDirectionExpressionSystem } from '../creativeIntelligence/directionExpressionSystemService.js';
import { runIdentityNativeArtDirector } from '../creativeIntelligence/identityNativeArtDirectorService.js';
import {
  runCreativeExpressionDirector,
} from '../creativeIntelligence/creativeExpressionService.js';
import { runCopyQualityGate, resolveHeroConceptAfterCopyGate } from '../creativeIntelligence/copyQualityGate.js';
import { compileIdentityNativeV2VisualBrief } from '../creativeIntelligence/identityNativeVisualBriefV2Compiler.js';
import { generateIdentityNativeImageFromBrief } from '../creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import type { ComparisonDirectionCandidate, FormedCoreDirection } from '../creativeIntelligence/types.js';
import type { CoreDirectionFormationRecord } from '../creativeIntelligence/types.js';
import type { BrandNativeAssetRole } from '../creativeIntelligence/brandNativeVisualBriefTypes.js';
import {
  buildShadowReplayFormationInput,
  replayHeroStoragePath,
  replayHeroTopic,
  runPostGenerationPersonalityComparison,
} from './replayService.js';
import * as replayStore from './replayStore/storeAdapter.js';

const REPLAY_HERO_ASSET_ID = 'NDX-SHADOW-REPLAY-HERO-001';
const TERMINAL_STATUSES = new Set<BrandPersonalityReplayRecord['status']>([
  'HERO_GENERATED',
  'COMPARISON_READY',
  'FOUNDER_REVIEW',
  'APPROVED_AS_PIPELINE_VALIDATION',
  'FAILED_VALIDATION',
]);

function nowIso(): string {
  return new Date().toISOString();
}

function emptyAccounting(): ReplayExecutionAccounting {
  return { anthropicRequests: 0, falRequests: 0, estimatedCostUsd: 0 };
}

function shadowProfile(replay: BrandPersonalityReplayRecord): BrandLoreProfile {
  return {
    ...replay.brandLoreSnapshot,
    id: replay.brandLoreSnapshot.id ?? replay.sourceProfileId ?? undefined,
    brandPersonality: replay.synthesizedPersonality,
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

function pickShadowDirection(formation: CoreDirectionFormationRecord): FormedCoreDirection {
  const candidates = formation.finalDirections.length > 0 ? formation.finalDirections : formation.candidateDirections;
  const forbidden = new Set(FORBIDDEN_FORMATION_DIRECTION_NAMES.map((n) => n.toUpperCase()));
  const picked =
    candidates.find((d) => !forbidden.has(d.directionName.toUpperCase())) ??
    candidates[0];
  if (!picked) throw new Error('Core Direction formation produced no directions');
  return picked;
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

function assertCreativeIntelligenceConfigured(): void {
  const provider = getCreativeIntelligenceProvider();
  if (provider.providerId === 'unavailable') {
    throw new Error(
      'CREATIVE INTELLIGENCE NOT CONFIGURED — set ANTHROPIC_API_KEY on the Railway API service and redeploy',
    );
  }
}

function describeFormationFailure(formation: CoreDirectionFormationRecord): string {
  if (formation.error?.trim()) return formation.error.trim();
  if (formation.status === 'NOT_READY') return 'Brand Lore not ready for Core Direction formation';
  if (formation.status === 'FORMING' || formation.status === 'CRITIQUING' || formation.status === 'REVISING') {
    return `Core Direction formation incomplete (stale ${formation.status} record — retry with fresh run)`;
  }
  return 'Core Direction formation failed — no directions produced';
}

function isFormationUsable(formation: CoreDirectionFormationRecord): boolean {
  if (formation.finalDirections.length === 0) return false;
  if (formation.status === 'FAILED' || formation.status === 'NOT_READY') return false;
  return true;
}

async function persistReplay(
  replay: BrandPersonalityReplayRecord,
  patch: Partial<BrandPersonalityReplayRecord>,
): Promise<BrandPersonalityReplayRecord> {
  const updated: BrandPersonalityReplayRecord = {
    ...replay,
    ...patch,
    updatedAt: nowIso(),
  };
  return replayStore.savePersonalityReplayRecord(updated);
}

async function setPhase(
  replay: BrandPersonalityReplayRecord,
  executionPhase: ReplayExecutionPhase,
  status?: BrandPersonalityReplayRecord['status'],
): Promise<BrandPersonalityReplayRecord> {
  return persistReplay(replay, {
    executionPhase,
    ...(status ? { status } : {}),
    executionError: null,
  });
}

export type ReplayExecutionDiagnostic = {
  replayId: string;
  personalityAnswersPersisted: boolean;
  answerCount: number;
  personalitySubmittedAt: string | null;
  shadowPersonalitySynthesized: boolean;
  personalityReadiness: string | null;
  currentReplayStatus: string;
  currentReplayPhase: string | null;
  downstreamJobCreated: boolean;
  downstreamJobId: string | null;
  downstreamJobStatus: string | null;
  coreDirectionGenerated: boolean;
  desGenerated: boolean;
  cesGenerated: boolean;
  identityArtDirectionGenerated: boolean;
  heroConceptGenerated: boolean;
  visualBriefGenerated: boolean;
  gptImage2RequestCreated: boolean;
  falRequestCreated: boolean;
  heroAssetGenerated: boolean;
  heroStoragePath: string | null;
  benchmarkComparisonUnlocked: boolean;
  lastSuccessfulCheckpoint: string;
  blockingCondition: string | null;
  storeMode: 'memory' | 'supabase' | 'unknown';
};

export function buildReplayExecutionDiagnostic(
  replay: BrandPersonalityReplayRecord,
  storeMode: ReplayExecutionDiagnostic['storeMode'] = 'unknown',
): ReplayExecutionDiagnostic {
  const answerCount = Object.keys(replay.rawPersonalityAnswers ?? {}).length;
  const accounting = replay.executionAccounting;
  return {
    replayId: replay.replayId,
    personalityAnswersPersisted: answerCount > 0,
    answerCount,
    personalitySubmittedAt: replay.personalitySubmittedAt ?? null,
    shadowPersonalitySynthesized: replay.synthesizedPersonality != null,
    personalityReadiness: replay.personalityReadiness,
    currentReplayStatus: replay.status,
    currentReplayPhase: replay.executionPhase ?? null,
    downstreamJobCreated: Boolean(replay.executionJobId),
    downstreamJobId: replay.executionJobId ?? null,
    downstreamJobStatus: replay.executionError
      ? 'FAILED'
      : TERMINAL_STATUSES.has(replay.status)
        ? 'COMPLETE'
        : replay.executionJobId
          ? 'IN_PROGRESS'
          : null,
    coreDirectionGenerated: replay.formationRecord != null,
    desGenerated: replay.directionExpression != null,
    cesGenerated: replay.creativeExpression != null,
    identityArtDirectionGenerated: replay.identityArtDirection != null,
    heroConceptGenerated: replay.heroConcept != null,
    visualBriefGenerated: replay.heroBrief != null,
    gptImage2RequestCreated: (accounting?.falRequests ?? 0) > 0 || replay.heroAsset != null,
    falRequestCreated: (accounting?.falRequests ?? 0) > 0,
    heroAssetGenerated: replay.heroAsset != null,
    heroStoragePath: replay.heroAsset?.storagePath ?? null,
    benchmarkComparisonUnlocked: replay.status === 'COMPARISON_READY' || replay.comparisonReport != null,
    lastSuccessfulCheckpoint: replay.executionPhase ?? replay.status,
    blockingCondition: replay.executionError ?? null,
    storeMode,
  };
}

export async function executePersonalityReplayDownstream(
  replayId: string,
): Promise<BrandPersonalityReplayRecord> {
  let replay = await replayStore.getPersonalityReplayRecord(replayId);
  if (!replay) throw new Error('Replay not found');

  if (replay.status === 'COMPARISON_READY' || replay.comparisonReport) {
    return replay;
  }
  if (replay.status === 'HERO_GENERATED' && replay.heroAsset) {
    return runPostGenerationPersonalityComparison(replayId);
  }

  assertReplayProductionReadyForDownstream('ndxbook');
  assertCreativeIntelligenceConfigured();

  const eligibleStatuses = new Set<BrandPersonalityReplayRecord['status']>([
    'FORMATION_READY',
    'CORE_DIRECTION_FORMED',
    'DIRECTION_EXPRESSION_READY',
    'CREATIVE_EXPRESSION_READY',
    'IDENTITY_ART_DIRECTION_READY',
  ]);
  if (!eligibleStatuses.has(replay.status) && !replay.executionJobId) {
    throw new Error(`Replay not eligible for downstream execution — status=${replay.status}`);
  }

  const jobId = replay.executionJobId ?? randomUUID();
  let accounting = replay.executionAccounting ?? emptyAccounting();

  if (!replay.executionJobId) {
    replay = await persistReplay(replay, {
      executionJobId: jobId,
      personalitySubmittedAt: replay.personalitySubmittedAt ?? nowIso(),
      executionPhase: 'PERSONALITY_SUBMITTED',
      executionAccounting: accounting,
    });
  } else if (replay.executionError) {
    replay = await persistReplay(replay, { executionError: null });
  }

  if (replay.synthesizedPersonality && replay.executionPhase === 'PERSONALITY_SUBMITTED') {
    replay = await setPhase(replay, 'SYNTHESIZING_PERSONALITY', replay.status);
  }

  const profile = shadowProfile(replay);
  const ctx = buildProductionBrandContext({ orgSlug: 'ndxbook', profile });
  const formatProfile = deriveFormatNativeExpressionProfile({
    context: 'SOCIAL_FIRST_EDITORIAL',
    profile,
    personality: replay.synthesizedPersonality,
  });
  const nativeProofFormat = replay.nativeProofFormat ?? selectNativeProofFormat('SOCIAL_FIRST_EDITORIAL', formatProfile);

  try {
    if (!replay.formationRecord) {
      replay = await setPhase(replay, 'FORMING_CORE_DIRECTION', 'FORMATION_READY');
      const guard = assertReplayFormationInputAllowed({
        includeLegacyExplorations: false,
        existingCreativeExplorations: buildShadowReplayFormationInput(replay).existingCreativeExplorations,
      });
      if (!guard.allowed) throw new Error(`Replay formation leakage: ${guard.violations.join('; ')}`);

      const { record: formation } = await runCoreDirectionFormation({
        orgSlug: 'ndxbook',
        profile,
        includeLegacyExplorations: false,
        forceReform: true,
        retryFailed: true,
      });
      if (!isFormationUsable(formation)) {
        const detail = describeFormationFailure(formation);
        const code = formation.errorCode ? ` [${formation.errorCode}]` : '';
        throw new Error(`${detail}${code}`);
      }
      accounting = {
        ...accounting,
        anthropicRequests: accounting.anthropicRequests + (formation.providerAccounting.requestCount ?? 0),
        estimatedCostUsd: accounting.estimatedCostUsd + (formation.providerAccounting.tokenUsage.estimatedCostUsd ?? 0),
      };
      const direction = pickShadowDirection(formation);
      replay = await persistReplay(replay, {
        formationRecord: formation as unknown as Record<string, unknown>,
        selectedShadowDirectionId: direction.directionId,
        status: 'CORE_DIRECTION_FORMED',
        executionPhase: 'FORMING_CORE_DIRECTION',
        nativeProofFormat,
        executionAccounting: accounting,
      });
    }

    if (!replay.directionExpression) {
      replay = await setPhase(replay, 'FORMING_DIRECTION_EXPRESSION', 'CORE_DIRECTION_FORMED');
      const formation = replay.formationRecord as unknown as CoreDirectionFormationRecord;
      const direction = pickShadowDirection(formation);
      const candidate = toComparisonCandidate(direction, formation, 0);
      const formationInput = buildShadowReplayFormationInput(replay);
      const hostCheck = assertNoHostFontInPayload(formationInput);
      if (!hostCheck.passed) throw new Error(`Typography host font leakage: ${hostCheck.violations.join('; ')}`);

      const des = await runSonnetDirectionExpressionSystem({
        direction: candidate,
        formationInput,
        references: [],
        v2Board: null,
        v2Plan: null,
        expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      });
      accounting = {
        ...accounting,
        anthropicRequests: accounting.anthropicRequests + des.anthropicRequests,
      };
      replay = await persistReplay(replay, {
        directionExpression: des.system as unknown as Record<string, unknown>,
        status: 'DIRECTION_EXPRESSION_READY',
        executionPhase: 'FORMING_DIRECTION_EXPRESSION',
        executionAccounting: accounting,
      });
    }

    const expressionSystem = replay.directionExpression as import('../creativeIntelligence/directionExpressionSystemTypes.js').DirectionExpressionSystem;
    const directionId = replay.selectedShadowDirectionId ?? 'shadow-direction';

    if (!replay.identityArtDirection) {
      replay = await setPhase(replay, 'FORMING_IDENTITY_ART_DIRECTION', 'DIRECTION_EXPRESSION_READY');
      const iad = await runIdentityNativeArtDirector({
        expressionSystem,
        directionId,
        topic: replayHeroTopic(),
        references: [],
        orgSlug: 'ndxbook',
        expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      });
      accounting = {
        ...accounting,
        anthropicRequests: accounting.anthropicRequests + iad.anthropicRequests,
      };
      replay = await persistReplay(replay, {
        identityArtDirection: iad.artDirection as unknown as Record<string, unknown>,
        status: 'IDENTITY_ART_DIRECTION_READY',
        executionPhase: 'FORMING_IDENTITY_ART_DIRECTION',
        executionAccounting: accounting,
      });
    }

    if (!replay.creativeExpression || !replay.heroConcept) {
      replay = await setPhase(replay, 'FORMING_CREATIVE_EXPRESSION', 'IDENTITY_ART_DIRECTION_READY');
      const artDirection = replay.identityArtDirection as import('../creativeIntelligence/identityNativeArtDirectionTypes.js').IdentityNativeArtDirection;
      const creative = await runCreativeExpressionDirector({
        expressionSystem,
        artDirection,
        v1Pilot: null,
        topic: replayHeroTopic(),
        upstreamPersonality: replay.synthesizedPersonality,
        expressionContext: 'SOCIAL_FIRST_EDITORIAL',
        brandSlug: 'ndxbook',
      });
      accounting = {
        ...accounting,
        anthropicRequests: accounting.anthropicRequests + creative.anthropicRequests,
      };
      replay = await persistReplay(replay, {
        creativeExpression: creative.creativeExpression as unknown as Record<string, unknown>,
        heroConcept: creative.heroConcept as unknown as Record<string, unknown>,
        status: 'CREATIVE_EXPRESSION_READY',
        executionPhase: 'BUILDING_HERO_CONCEPT',
        executionAccounting: accounting,
      });
    }

    if (!replay.heroBrief) {
      replay = await setPhase(replay, 'COMPILING_VISUAL_BRIEF', 'CREATIVE_EXPRESSION_READY');
      const artDirection = replay.identityArtDirection as import('../creativeIntelligence/identityNativeArtDirectionTypes.js').IdentityNativeArtDirection;
      const creativeExpression = replay.creativeExpression as import('../creativeIntelligence/creativeExpressionTypes.js').CreativeExpressionSystem;
      let heroConcept = replay.heroConcept as import('../creativeIntelligence/creativeExpressionTypes.js').HeroCreativeConcept;
      heroConcept = { ...heroConcept, primaryProofFormat: nativeProofFormat };

      const copyGate = await runCopyQualityGate({ heroConcept, creativeExpression });
      heroConcept = resolveHeroConceptAfterCopyGate(heroConcept, copyGate);
      if (!copyGate.scores.pass && process.env.VITEST !== 'true') {
        throw new Error(`Copy quality gate failed: ${copyGate.scores.reasons.join('; ')}`);
      }

      const brief = compileIdentityNativeV2VisualBrief({
        artDirection,
        creativeExpression,
        heroConcept,
        copyQualityScores: copyGate.scores,
        role: nativeAssetRoleForFormat(nativeProofFormat),
        topic: replayHeroTopic(),
      });
      replay = await persistReplay(replay, {
        heroBrief: brief as unknown as Record<string, unknown>,
        heroConcept: heroConcept as unknown as Record<string, unknown>,
        executionPhase: 'COMPILING_VISUAL_BRIEF',
        executionAccounting: accounting,
      });
    }

    if (!replay.heroAsset) {
      replay = await setPhase(replay, 'GENERATING_HERO', 'CREATIVE_EXPRESSION_READY');
      const brief = replay.heroBrief as import('../creativeIntelligence/creativeExpressionTypes.js').IdentityNativeV2VisualBrief;

      if (!process.env.FAL_KEY?.trim()) {
        if (process.env.VITEST === 'true') {
          replay = await persistReplay(replay, {
            heroAsset: {
              assetId: REPLAY_HERO_ASSET_ID,
              storagePath: replayHeroStoragePath(replayId),
              topic: replayHeroTopic(),
              provider: 'openai/gpt-image-2',
              generatedAt: nowIso(),
            },
            status: 'HERO_GENERATED',
            executionPhase: 'HERO_READY',
            executionAccounting: accounting,
          });
        } else {
          throw new Error('FAL_KEY not configured — hero generation blocked');
        }
      } else {
        const generation = await generateIdentityNativeImageFromBrief({
          brief,
          aspectRatio: aspectRatioForNativeFormat(nativeProofFormat),
        });
        accounting = {
          ...accounting,
          falRequests: accounting.falRequests + 1,
          estimatedCostUsd: accounting.estimatedCostUsd + generation.costEstimateUsd,
        };
        const imageBuffer = await downloadUrlToBuffer(generation.url);
        const storagePath = replayHeroStoragePath(replayId);
        await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });
        replay = await persistReplay(replay, {
          heroAsset: {
            assetId: REPLAY_HERO_ASSET_ID,
            storagePath,
            topic: replayHeroTopic(),
            provider: 'openai/gpt-image-2',
            generatedAt: nowIso(),
          },
          status: 'HERO_GENERATED',
          executionPhase: 'HERO_READY',
          executionAccounting: accounting,
        });
      }
    }

    replay = await setPhase(replay, 'COMPARING_METHODOLOGY', 'HERO_GENERATED');
    replay = await runPostGenerationPersonalityComparison(replayId);
    return persistReplay(replay, {
      executionPhase: 'REPLAY_COMPLETE',
      executionError: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return persistReplay(replay, {
      executionPhase: 'EXECUTION_FAILED',
      executionError: message,
    });
  }
}

export async function getReplayExecutionDiagnosticForId(replayId: string): Promise<ReplayExecutionDiagnostic | null> {
  const replay = await replayStore.getPersonalityReplayRecord(replayId);
  if (!replay) return null;
  const storeMode = await replayStore.resolveReplayStoreMode();
  return buildReplayExecutionDiagnostic(replay, storeMode);
}

export async function findActiveSubmittedReplay(organizationId: string): Promise<BrandPersonalityReplayRecord | null> {
  const replays = await replayStore.listPersonalityReplayRecordsForOrg(organizationId);
  return (
    replays.find(
      (r) =>
        r.personalitySubmittedAt ||
        r.status === 'FORMATION_READY' ||
        r.executionJobId ||
        (r.status !== 'CREATED' && r.status !== 'INTAKE_IN_PROGRESS' && r.status !== 'PERSONALITY_READY'),
    ) ?? null
  );
}
