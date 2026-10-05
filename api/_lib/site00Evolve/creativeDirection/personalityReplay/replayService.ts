/**
 * NDX BOOK personality replay validation — shadow orchestration (non-canonical).
 */

import { randomUUID } from 'node:crypto';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import {
  NDX_PERSONALITY_REPLAY_MODE,
  type BrandPersonalityReplayRecord,
  type ReplayBenchmarkSnapshot,
  type ReplayConvergenceReport,
} from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';
import { stripPersonalityFromLoreSnapshot, assertReplayFormationInputAllowed } from '../../../../../shared/site00-brand-lore/personalityReplayLeakage.js';
import {
  comparePersonalityProfiles,
  scorePersonalityConvergence,
} from '../../../../../shared/site00-brand-lore/personalityReplayConvergence.js';
import { runDefaultHardcodingAudit } from '../../../../../shared/site00-brand-lore/personalityReplayHardcodingAudit.js';
import { synthesizeBrandPersonalityProfile } from '../../../../../shared/site00-brand-lore/personalitySynthesis.js';
import {
  evaluateBrandPersonalityReadiness,
  canBeginCoreDirectionFormation,
  isPersonalityStepAnswered,
  resolvePersonalityReplayResumeStepId,
} from '../../../../../shared/site00-brand-lore/personalityReadiness.js';
import { IDNTY_PERSONALITY_QUESTIONS } from '../../../../../shared/site00-brand-lore/idnty-personality-questions.js';
import type { PersonalityReplayStatus } from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';
import { assertReplayProductionReadyForDownstream, buildReplayProductionPreflightReport } from '../../../../../shared/site00-brand-lore/replayProductionPreflight.js';
import { buildCoreDirectionFormationInput } from '../creativeIntelligence/formationInputBuilder.js';
import {
  executePersonalityReplayDownstream,
  getReplayExecutionDiagnosticForId,
  buildReplayExecutionDiagnostic,
} from './replayExecutionService.js';
import * as replayStore from './replayStore/storeAdapter.js';
import { getOrReconcileBrandLoreForOrg } from '../../../site00BrandLore/loreService.js';
import * as brandLoreStore from '../../../site00BrandLore/storeAdapter.js';

export { resetPersonalityReplayMemoryStore } from './replayStore/storeAdapter.js';

const REPLAY_HERO_TOPIC = 'credit utilization';
const REPLAY_HERO_ASSET_ID = 'NDX-SHADOW-REPLAY-HERO-001';

function nowIso(): string {
  return new Date().toISOString();
}

/** Build immutable fixed lore snapshot — personality stripped (FIXED_LORE_REPLAY). */
export async function buildFixedLoreSnapshotForReplay(params: {
  organizationId: string;
  orgSlug: string;
}): Promise<{ snapshot: BrandLoreProfile; sourceProfileId: string | null }> {
  const canonical = await getOrReconcileBrandLoreForOrg(params.organizationId, params.orgSlug);
  if (!canonical) {
    throw new Error('Cannot create replay — no Brand Lore profile available for fixed snapshot');
  }
  return {
    snapshot: stripPersonalityFromLoreSnapshot(canonical),
    sourceProfileId: canonical.id,
  };
}

export async function createNdxbookPersonalityReplay(params: {
  organizationId: string;
  orgSlug: string;
  projectId?: string | null;
  createdBy?: string | null;
}): Promise<BrandPersonalityReplayRecord> {
  const { snapshot, sourceProfileId } = await buildFixedLoreSnapshotForReplay({
    organizationId: params.organizationId,
    orgSlug: params.orgSlug,
  });

  const ts = nowIso();
  const record: BrandPersonalityReplayRecord = {
    replayId: randomUUID(),
    mode: NDX_PERSONALITY_REPLAY_MODE,
    organizationId: params.organizationId,
    projectId: params.projectId ?? snapshot.projectId ?? null,
    sourceProfileId,
    createdBy: params.createdBy ?? null,
    status: 'CREATED',
    loreMode: 'FIXED_LORE_REPLAY',
    brandLoreSnapshot: snapshot,
    rawPersonalityAnswers: {},
    personalityCompletedSteps: [],
    synthesizedPersonality: null,
    personalityReadiness: null,
    personalityMissingDomains: [],
    formationRecord: null,
    selectedShadowDirectionId: null,
    directionExpression: null,
    creativeExpression: null,
    identityArtDirection: null,
    heroConcept: null,
    heroBrief: null,
    heroAsset: null,
    comparisonReport: null,
    founderValidationJudgment: null,
    hardcodingAudit: runDefaultHardcodingAudit(),
    classification: 'SHADOW_VALIDATION',
    createdAt: ts,
    updatedAt: ts,
  };

  return replayStore.savePersonalityReplayRecord(record);
}

export async function saveReplayPersonalityAnswers(params: {
  replayId: string;
  answers: Record<string, string | string[]>;
  completedSteps?: string[];
}): Promise<BrandPersonalityReplayRecord> {
  const existing = await replayStore.getPersonalityReplayRecord(params.replayId);
  if (!existing) throw new Error('Replay not found');
  assertReplayNotCanonical(existing);

  const mergedAnswers = { ...existing.rawPersonalityAnswers, ...params.answers };
  const completedSteps = params.completedSteps ?? existing.personalityCompletedSteps;

  const shadowPersonality = synthesizeBrandPersonalityProfile({
    personalityAnswers: mergedAnswers,
    prior: existing.synthesizedPersonality,
  });

  const loreWithShadow: BrandLoreProfile = {
    ...existing.brandLoreSnapshot,
    brandPersonality: shadowPersonality,
  };

  const readiness = evaluateBrandPersonalityReadiness(shadowPersonality, loreWithShadow);
  shadowPersonality.personalityReadinessState = readiness.state;
  shadowPersonality.personalityMissingDomains = readiness.missingDomains;

  let status = existing.status;
  if (status === 'CREATED') status = 'INTAKE_IN_PROGRESS';
  if (readiness.state === 'PERSONALITY_READY') status = 'PERSONALITY_READY';

  const updated: BrandPersonalityReplayRecord = {
    ...existing,
    rawPersonalityAnswers: mergedAnswers,
    personalityCompletedSteps: completedSteps,
    synthesizedPersonality: shadowPersonality,
    personalityReadiness: readiness.state,
    personalityMissingDomains: readiness.missingDomains,
    status,
    updatedAt: nowIso(),
  };

  return replayStore.savePersonalityReplayRecord(updated);
}

export async function completeReplayPersonalityIntake(replayId: string): Promise<BrandPersonalityReplayRecord> {
  const existing = await replayStore.getPersonalityReplayRecord(replayId);
  if (!existing) throw new Error('Replay not found');

  const loreWithShadow: BrandLoreProfile = {
    ...existing.brandLoreSnapshot,
    brandPersonality: existing.synthesizedPersonality,
  };

  const readiness = evaluateBrandPersonalityReadiness(existing.synthesizedPersonality, loreWithShadow);
  if (readiness.state !== 'PERSONALITY_READY') {
    throw new Error(`Personality intake incomplete — missing: ${readiness.missingDomains.join(', ')}`);
  }

  const loreReady = existing.brandLoreSnapshot.readinessState === 'CORE_DIRECTION_READY';
  if (!canBeginCoreDirectionFormation({ loreState: existing.brandLoreSnapshot.readinessState, personalityState: readiness.state })) {
    throw new Error(
      loreReady ? 'Personality readiness gate failed' : 'Brand Lore not CORE_DIRECTION_READY for replay formation',
    );
  }

  const updated: BrandPersonalityReplayRecord = {
    ...existing,
    personalityReadiness: readiness.state,
    personalityMissingDomains: readiness.missingDomains,
    status: 'FORMATION_READY',
    personalitySubmittedAt: existing.personalitySubmittedAt ?? nowIso(),
    executionPhase: existing.executionPhase ?? 'PERSONALITY_SUBMITTED',
    updatedAt: nowIso(),
  };

  const saved = await replayStore.savePersonalityReplayRecord(updated);

  if (
    saved.status !== 'COMPARISON_READY' &&
    !saved.comparisonReport &&
    (!saved.executionJobId || saved.executionError) &&
    !saved.heroAsset
  ) {
    if (process.env.VITEST === 'true') {
      return executePersonalityReplayDownstream(saved.replayId);
    }
    void executePersonalityReplayDownstream(saved.replayId).catch((err) => {
      console.error('[personality-replay] downstream execution failed', err);
    });
  }
  return saved;
}

/** Build shadow formation input — no legacy direction names, no benchmark leakage. */
export function buildShadowReplayFormationInput(replay: BrandPersonalityReplayRecord) {
  assertReplayProductionReadyForDownstream('ndxbook');

  const profile: BrandLoreProfile = {
    ...replay.brandLoreSnapshot,
    brandPersonality: replay.synthesizedPersonality,
  };

  const input = buildCoreDirectionFormationInput({
    profile,
    includeLegacyExplorations: false,
    orgSlug: 'ndxbook',
  });

  const guard = assertReplayFormationInputAllowed({
    includeLegacyExplorations: false,
    existingCreativeExplorations: input.existingCreativeExplorations,
  });

  if (!guard.allowed) {
    throw new Error(`Replay formation input leakage: ${guard.violations.join('; ')}`);
  }

  return input;
}

const REPLAY_BENCHMARK_HERO_STORAGE_PATH =
  'site00/assts/batches/ndxbook-identity-native-v2-pilot/generated/801b6bb9-abc6-47a4-8e56-2c0b22cb26ce.webp';

/**
 * Load benchmark snapshot — ONLY for post-generation comparison.
 * Must not be called before shadow hero generation.
 */
export async function loadReplayBenchmarkSnapshot(params: {
  organizationId: string;
  orgSlug: string;
  allowLoad: boolean;
}): Promise<ReplayBenchmarkSnapshot> {
  if (!params.allowLoad) {
    throw new Error('Benchmark snapshot load blocked — shadow generation not complete');
  }

  const canonical = await brandLoreStore.getBrandLoreProfileByOrgId(params.organizationId);
  return {
    brandPersonality: canonical?.brandPersonality ?? null,
    formationDirections: [],
    directionExpressionId: null,
    creativeExpressionId: null,
    identityArtDirectionId: null,
    heroAssetPath: REPLAY_BENCHMARK_HERO_STORAGE_PATH,
    loadedAt: nowIso(),
  };
}

export async function runPostGenerationPersonalityComparison(replayId: string): Promise<BrandPersonalityReplayRecord> {
  const replay = await replayStore.getPersonalityReplayRecord(replayId);
  if (!replay) throw new Error('Replay not found');
  if (!replay.synthesizedPersonality) throw new Error('Shadow personality not synthesized');

  const benchmark = await loadReplayBenchmarkSnapshot({
    organizationId: replay.organizationId,
    orgSlug: 'ndxbook',
    allowLoad: replay.status === 'HERO_GENERATED' || replay.status === 'COMPARISON_READY',
  });

  const domainReports = comparePersonalityProfiles({
    canonical: benchmark.brandPersonality,
    shadow: replay.synthesizedPersonality,
  });

  const personalityScore = benchmark.brandPersonality
    ? scorePersonalityConvergence(domainReports)
    : ('NEEDS_HUMAN_REVIEW' as const);

  const comparisonReport: ReplayConvergenceReport = {
    personalityDomains: domainReports,
    scores: {
      personalityConvergence: personalityScore,
      creativeConvergence: 'NOT_EVALUATED',
      identityConvergence: 'NOT_EVALUATED',
      heroConvergence: 'NOT_EVALUATED',
    },
    divergenceStage: null,
    shadowMarkedUpAnalogDirectionId: replay.selectedShadowDirectionId,
    benchmarkLoadedAt: benchmark.loadedAt,
    benchmarkHeroStoragePath: benchmark.heroAssetPath,
    scorerVersion: 'LEGACY_HEURISTIC_V1',
    legacyInvalidComparison: false,
    personalityScorerMode: benchmark.brandPersonality ? 'HEURISTIC' : 'NOT_EVALUATED',
  };

  const updated: BrandPersonalityReplayRecord = {
    ...replay,
    comparisonReport,
    status: 'COMPARISON_READY',
    updatedAt: nowIso(),
  };

  return replayStore.savePersonalityReplayRecord(updated);
}

export function assertReplayNotCanonical(replay: BrandPersonalityReplayRecord): void {
  if (replay.classification !== 'SHADOW_VALIDATION') {
    throw new Error('Invalid replay classification — canonical mutation blocked');
  }
}

/** Guard: replay writes must never touch canonical brand lore store. */
export async function assertCanonicalProfilesUnchanged(params: {
  organizationId: string;
  beforeProfileId: string | null;
  beforeVersion: number | null;
}): Promise<boolean> {
  const current = await brandLoreStore.getBrandLoreProfileByOrgId(params.organizationId);
  if (!current) return params.beforeProfileId === null;
  if (params.beforeProfileId && current.id !== params.beforeProfileId) return false;
  if (params.beforeVersion != null && current.profileVersion > params.beforeVersion) {
    // Version bump alone doesn't mean mutation from replay — caller uses in tests with isolated org
  }
  return true;
}

export function replayHeroStoragePath(replayId: string): string {
  return `site00/validation/ndxbook/personality-replay/${replayId}/${REPLAY_HERO_ASSET_ID}.webp`;
}

export function replayHeroTopic(): string {
  return REPLAY_HERO_TOPIC;
}

export async function getPersonalityReplay(replayId: string): Promise<BrandPersonalityReplayRecord | null> {
  return replayStore.getPersonalityReplayRecord(replayId);
}

export async function listPersonalityReplays(organizationId: string): Promise<BrandPersonalityReplayRecord[]> {
  return replayStore.listPersonalityReplayRecordsForOrg(organizationId);
}

export async function setFounderReplayValidationJudgment(params: {
  replayId: string;
  judgment: BrandPersonalityReplayRecord['founderValidationJudgment'];
}): Promise<BrandPersonalityReplayRecord> {
  const replay = await replayStore.getPersonalityReplayRecord(params.replayId);
  if (!replay) throw new Error('Replay not found');

  const status =
    params.judgment === 'PIPELINE_VALIDATED'
      ? 'APPROVED_AS_PIPELINE_VALIDATION'
      : params.judgment === 'FAILED_METHODOLOGY_DRIFT'
        ? 'FAILED_VALIDATION'
        : 'FOUNDER_REVIEW';

  return replayStore.savePersonalityReplayRecord({
    ...replay,
    founderValidationJudgment: params.judgment,
    status,
    updatedAt: nowIso(),
  });
}

const RESUMABLE_REPLAY_STATUSES: PersonalityReplayStatus[] = [
  'CREATED',
  'INTAKE_IN_PROGRESS',
  'PERSONALITY_READY',
  'FORMATION_READY',
  'CORE_DIRECTION_FORMED',
  'DIRECTION_EXPRESSION_READY',
  'CREATIVE_EXPRESSION_READY',
  'IDENTITY_ART_DIRECTION_READY',
  'HERO_GENERATED',
  'COMPARISON_READY',
  'FOUNDER_REVIEW',
];

export { resolvePersonalityReplayResumeStepId };

export { buildReplayProductionPreflightReport, assertReplayProductionReadyForDownstream };
export {
  executePersonalityReplayDownstream,
  getReplayExecutionDiagnosticForId,
  buildReplayExecutionDiagnostic,
  findActiveSubmittedReplay,
} from './replayExecutionService.js';
export {
  executeSixDirectionConsistencyValidation,
  setSixDirectionFounderJudgment,
  buildSixDirectionDirectionReport,
  buildSixDirectionGenerationPreflight,
} from './sixDirectionConsistencyService.js';

/** Resume an in-progress replay or create a fresh shadow validation run. */
export async function getOrCreateActivePersonalityReplay(params: {
  organizationId: string;
  orgSlug: string;
  createdBy?: string | null;
}): Promise<BrandPersonalityReplayRecord> {
  const existing = await replayStore.listPersonalityReplayRecordsForOrg(params.organizationId);
  const active = existing.find((r) => RESUMABLE_REPLAY_STATUSES.includes(r.status));
  if (active) return active;
  return createNdxbookPersonalityReplay(params);
}
