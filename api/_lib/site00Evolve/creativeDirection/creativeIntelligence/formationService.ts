/**
 * Core Direction Formation orchestration — Brand Lore → 3 directions → critic → proof plans.
 * Durable persistence via formationStore/storeAdapter.ts (Supabase in production).
 */

import { randomUUID } from 'node:crypto';
import { canBeginCoreDirectionFormation } from '../../../../../shared/site00-brand-lore/personalityReadiness.js';
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types.js';
import { loadCanonicalIntelligence } from '../intelligenceBrief.js';
import {
  buildCoreDirectionFormationInput,
  buildFormationIdempotencyKey,
} from './formationInputBuilder.js';
import {
  mergeCritiqueWithDeterministicChecks,
  validateFormedDirections,
  validateFormationInput,
} from './formationValidation.js';
import {
  buildDistinctivenessFromDirections,
  critiquesRequireRevision,
  failedDirectionIdsFromCritiques,
  runDeterministicCritic,
} from './creativeCritic.js';
import { buildVisualProofPlans } from './visualProofPlanBuilder.js';
import {
  CREATIVE_INTELLIGENCE_PROMPT_VERSION,
  MAX_CREATIVE_REVISION_ROUNDS,
} from './config.js';
import { getCreativeIntelligenceProvider } from './providerRegistry.js';
import { isProviderUnavailableError } from './unavailableProvider.js';
import {
  getFormationRecordByIdempotencyKey,
  listFormationRecordsByOrganizationId,
  resetFormationMemoryStore,
  saveFormationRecord,
} from './formationStore/storeAdapter.js';
import type {
  CoreDirectionFormationInput,
  CoreDirectionFormationRecord,
  CoreDirectionFormationStatus,
  CoreDirectionCritiqueResult,
  FormedCoreDirection,
  ProviderRequestAccounting,
} from './types.js';

const COMPLETED_STATUSES: CoreDirectionFormationStatus[] = [
  'READY_FOR_VISUAL_PRODUCTION',
  'NEEDS_HUMAN_REVIEW',
];

export function resetCoreDirectionFormationMemory(): void {
  resetFormationMemoryStore();
}

export async function getCoreDirectionFormationRecord(
  idempotencyKey: string,
): Promise<CoreDirectionFormationRecord | null> {
  return getFormationRecordByIdempotencyKey(idempotencyKey);
}

export async function listCoreDirectionFormationRecords(
  organizationId: string,
): Promise<CoreDirectionFormationRecord[]> {
  return listFormationRecordsByOrganizationId(organizationId);
}

function emptyAccounting(providerId: string, modelId: string): ProviderRequestAccounting {
  return {
    providerId,
    modelId,
    requestCount: 0,
    revisionCount: 0,
    formationRequests: 0,
    critiqueRequests: 0,
    reviseRequests: 0,
    tokenUsage: {},
  };
}

function accumulateUsage(
  accounting: ProviderRequestAccounting,
  kind: 'formation' | 'critique' | 'revise',
  usage?: { inputTokens?: number; outputTokens?: number; estimatedCostUsd?: number },
): void {
  accounting.requestCount += 1;
  if (kind === 'formation') accounting.formationRequests += 1;
  if (kind === 'critique') accounting.critiqueRequests += 1;
  if (kind === 'revise') accounting.reviseRequests += 1;
  accounting.tokenUsage.inputTokens = (accounting.tokenUsage.inputTokens ?? 0) + (usage?.inputTokens ?? 0);
  accounting.tokenUsage.outputTokens = (accounting.tokenUsage.outputTokens ?? 0) + (usage?.outputTokens ?? 0);
  if (usage?.estimatedCostUsd != null) {
    accounting.tokenUsage.estimatedCostUsd =
      (accounting.tokenUsage.estimatedCostUsd ?? 0) + usage.estimatedCostUsd;
  }
}

function deriveInitialStatus(profile: BrandLoreProfile | null): CoreDirectionFormationStatus {
  if (!profile) return 'NOT_READY';
  return canBeginCoreDirectionFormation({
    loreState: profile.readinessState,
    personalityState: profile.brandPersonality?.personalityReadinessState ?? null,
  })
    ? 'READY_TO_FORM'
    : 'NOT_READY';
}

async function buildInputForProfile(
  profile: BrandLoreProfile,
  orgSlug: string,
  formationVersion: number,
  includeLegacyExplorations = true,
): Promise<CoreDirectionFormationInput> {
  const intel = await loadCanonicalIntelligence(orgSlug);
  return buildCoreDirectionFormationInput({
    profile,
    formationVersion,
    contentBrainSections: intel.sections,
    includeLegacyExplorations,
    orgSlug,
  });
}

async function persistRecord(record: CoreDirectionFormationRecord): Promise<CoreDirectionFormationRecord> {
  record.updatedAt = new Date().toISOString();
  return saveFormationRecord(record);
}

async function runCritiquePass(
  input: CoreDirectionFormationInput,
  candidates: FormedCoreDirection[],
  accounting: ProviderRequestAccounting,
): Promise<CoreDirectionCritiqueResult> {
  const provider = getCreativeIntelligenceProvider();
  const deterministic = runDeterministicCritic(input, candidates);

  let providerCritique: CoreDirectionCritiqueResult | null = null;
  if (provider.providerId !== 'unavailable') {
    providerCritique = await provider.critiqueCoreDirections(input, candidates);
    accumulateUsage(accounting, 'critique', providerCritique.requestUsage);
  }

  const mergedCritiques = providerCritique?.critiques?.length
    ? providerCritique.critiques.map((pc) => {
        const det = deterministic.find((d) => d.directionId === pc.directionId);
        if (!det) return pc;
        return {
          ...pc,
          overall: det.overall === 'FAIL' || pc.overall === 'FAIL' ? 'FAIL' : pc.overall,
          failureReasons: [...new Set([...(det.failureReasons ?? []), ...(pc.failureReasons ?? [])])],
        };
      })
    : deterministic;

  const base: CoreDirectionCritiqueResult = {
    critiques: mergedCritiques,
    distinctiveness: buildDistinctivenessFromDirections(candidates),
    revisionRequired: critiquesRequireRevision(mergedCritiques),
    failedDirectionIds: failedDirectionIdsFromCritiques(mergedCritiques),
    requestUsage: providerCritique?.requestUsage,
  };

  return mergeCritiqueWithDeterministicChecks(base, candidates);
}

export type RunCoreDirectionFormationParams = {
  orgSlug: string;
  profile: BrandLoreProfile;
  formationVersion?: number;
  forceReform?: boolean;
  engagementId?: string | null;
  retryFailed?: boolean;
  /** Shadow replay must pass false to exclude legacy direction names. */
  includeLegacyExplorations?: boolean;
};

export type RunCoreDirectionFormationResult = {
  record: CoreDirectionFormationRecord;
  reused: boolean;
};

function shouldReuseRecord(
  record: CoreDirectionFormationRecord,
  forceReform: boolean,
  retryFailed: boolean,
): boolean {
  if (forceReform) return false;
  if (record.status === 'FAILED') return !retryFailed ? false : false;
  if (COMPLETED_STATUSES.includes(record.status)) return true;
  return record.status === 'FORMING' || record.status === 'CRITIQUING' || record.status === 'REVISING';
}

export async function runCoreDirectionFormation(
  params: RunCoreDirectionFormationParams,
): Promise<RunCoreDirectionFormationResult> {
  const formationVersion = params.formationVersion ?? 1;
  const input = await buildInputForProfile(
    params.profile,
    params.orgSlug,
    formationVersion,
    params.includeLegacyExplorations ?? true,
  );
  const inputErrors = validateFormationInput(input);
  if (inputErrors.length) {
    throw new Error(`Invalid formation input: ${inputErrors.join(', ')}`);
  }

  const idempotencyKey = buildFormationIdempotencyKey(input, CREATIVE_INTELLIGENCE_PROMPT_VERSION);
  const existing = await getFormationRecordByIdempotencyKey(idempotencyKey);
  if (existing && shouldReuseRecord(existing, Boolean(params.forceReform), Boolean(params.retryFailed))) {
    return { record: existing, reused: true };
  }
  if (existing?.status === 'FAILED' && !params.retryFailed && !params.forceReform) {
    return { record: existing, reused: true };
  }

  const provider = getCreativeIntelligenceProvider();
  const now = new Date().toISOString();
  const record: CoreDirectionFormationRecord = {
    formationId: existing?.formationId ?? randomUUID(),
    organizationId: input.organizationId,
    projectId: input.projectId,
    engagementId: params.engagementId ?? existing?.engagementId ?? null,
    brandLoreProfileId: input.brandLoreProfileId,
    brandLoreProfileVersion: input.brandLoreProfileVersion,
    brandLoreFingerprint: input.brandLoreFingerprint,
    formationVersion: input.formationVersion,
    providerId: provider.providerId,
    modelId: provider.capability.modelId,
    promptVersion: CREATIVE_INTELLIGENCE_PROMPT_VERSION,
    status: deriveInitialStatus(params.profile),
    idempotencyKey,
    formationInput: input,
    candidateDirections: [],
    criticResult: null,
    revisionRounds: params.retryFailed ? 0 : (existing?.revisionRounds ?? 0),
    finalDirections: [],
    visualProofPlans: [],
    legacyStaticPreview: 'PRESERVED',
    proposedFormationLabel: 'PROPOSED_FORMATION',
    providerAccounting:
      params.retryFailed || !existing
        ? emptyAccounting(provider.providerId, provider.capability.modelId)
        : existing.providerAccounting,
    error: null,
    errorCode: null,
    createdAt: existing?.createdAt ?? now,
    startedAt: null,
    completedAt: null,
    failedAt: null,
  };

  if (record.status === 'NOT_READY') {
    record.error = 'Brand Lore not ready for Core Direction formation';
    record.errorCode = 'BRAND_LORE_NOT_READY';
    return { record: await persistRecord(record), reused: false };
  }

  if (provider.providerId === 'unavailable') {
    record.status = 'FAILED';
    record.error = 'CREATIVE INTELLIGENCE NOT CONFIGURED';
    record.errorCode = 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE';
    record.failedAt = now;
    return { record: await persistRecord(record), reused: false };
  }

  try {
    record.status = 'FORMING';
    record.startedAt = record.startedAt ?? now;
    await persistRecord(record);

    let candidates: FormedCoreDirection[];
    const formationResult = await provider.formCoreDirections(input);
    accumulateUsage(record.providerAccounting, 'formation', formationResult.requestUsage);
    candidates = formationResult.directions;

    let outputErrors = validateFormedDirections(candidates);
    if (outputErrors.length) {
      record.status = 'NEEDS_HUMAN_REVIEW';
      record.error = outputErrors.join('; ');
      record.errorCode = 'VALIDATION_FAILED';
      record.candidateDirections = candidates;
      record.finalDirections = candidates;
      return { record: await persistRecord(record), reused: false };
    }

    record.candidateDirections = candidates;
    record.status = 'CRITIQUING';
    await persistRecord(record);
    let critique = await runCritiquePass(input, candidates, record.providerAccounting);
    record.criticResult = critique;

    while (critique.revisionRequired && record.revisionRounds < MAX_CREATIVE_REVISION_ROUNDS) {
      record.status = 'REVISING';
      record.revisionRounds += 1;
      record.providerAccounting.revisionCount += 1;
      await persistRecord(record);
      const revised = await provider.reviseCoreDirections({
        formationInput: input,
        candidates,
        critique,
      });
      accumulateUsage(record.providerAccounting, 'revise', revised.requestUsage);
      candidates = revised.directions;
      outputErrors = validateFormedDirections(candidates);
      if (outputErrors.length) break;
      record.candidateDirections = candidates;
      record.status = 'CRITIQUING';
      critique = await runCritiquePass(input, candidates, record.providerAccounting);
      record.criticResult = critique;
      await persistRecord(record);
    }

    if (critique.revisionRequired) {
      record.status = 'NEEDS_HUMAN_REVIEW';
      record.finalDirections = candidates;
      record.errorCode = 'CRITIC_REVISION_EXHAUSTED';
      record.error = 'Formation requires human review after revision rounds exhausted';
      return { record: await persistRecord(record), reused: false };
    }

    record.finalDirections = candidates;
    record.visualProofPlans = buildVisualProofPlans(candidates, input);
    record.status = 'READY_FOR_VISUAL_PRODUCTION';
    record.completedAt = new Date().toISOString();
    record.error = null;
    record.errorCode = null;
    return { record: await persistRecord(record), reused: false };
  } catch (error) {
    if (isProviderUnavailableError(error)) {
      record.status = 'FAILED';
      record.error = 'CREATIVE INTELLIGENCE NOT CONFIGURED';
      record.errorCode = 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE';
    } else {
      record.status = 'FAILED';
      record.error = error instanceof Error ? error.message.slice(0, 240) : 'Formation failed';
      record.errorCode = 'FORMATION_FAILED';
    }
    record.failedAt = new Date().toISOString();
    return { record: await persistRecord(record), reused: false };
  }
}

export async function getOrRunCoreDirectionFormation(params: RunCoreDirectionFormationParams) {
  return runCoreDirectionFormation(params);
}

export async function retryCoreDirectionFormation(params: RunCoreDirectionFormationParams) {
  return runCoreDirectionFormation({ ...params, retryFailed: true, forceReform: false });
}

export function incrementFormationVersion(current: number): number {
  return current + 1;
}

export function getCreativeIntelligenceInspectorSummary(record: CoreDirectionFormationRecord | null) {
  const providerConfigured = getCreativeIntelligenceProvider().providerId !== 'unavailable';
  if (!record) {
    return {
      status: 'NOT_READY' as CoreDirectionFormationStatus,
      providerConfigured,
      candidateCount: 0,
      revisionRounds: 0,
      finalDirectionNames: [] as string[],
      visualProofPlanCount: 0,
      createdAt: null,
      updatedAt: null,
      startedAt: null,
      completedAt: null,
      failedAt: null,
    };
  }
  return {
    formationId: record.formationId,
    brandLoreProfileVersion: record.brandLoreProfileVersion,
    brandLoreFingerprint: record.brandLoreFingerprint,
    formationVersion: record.formationVersion,
    providerId: record.providerId,
    modelId: record.modelId,
    promptVersion: record.promptVersion,
    status: record.status,
    providerConfigured,
    candidateCount: record.candidateDirections.length,
    candidateNames: record.candidateDirections.map((d) => d.directionName),
    criticResult: record.criticResult
      ? {
          revisionRequired: record.criticResult.revisionRequired,
          failedDirectionIds: record.criticResult.failedDirectionIds,
          distinctivenessPassed: record.criticResult.distinctiveness.passed,
        }
      : null,
    revisionRounds: record.revisionRounds,
    finalDirectionNames: record.finalDirections.map((d) => d.directionName),
    visualProofPlanCount: record.visualProofPlans.length,
    providerAccounting: record.providerAccounting,
    error: record.error,
    errorCode: record.errorCode,
    proposedFormationLabel: record.proposedFormationLabel,
    legacyStaticPreview: record.legacyStaticPreview,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt ?? null,
    startedAt: record.startedAt ?? null,
    completedAt: record.completedAt,
    failedAt: record.failedAt ?? null,
  };
}
