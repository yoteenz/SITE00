/**
 * Core Direction Formation orchestration — Brand Lore → 3 directions → critic → proof plans.
 */

import { randomUUID } from 'node:crypto';
import { canBeginCreativeDirection } from '../../../../../shared/site00-brand-lore/readiness.js';
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
import type {
  CoreDirectionFormationInput,
  CoreDirectionFormationRecord,
  CoreDirectionFormationStatus,
  CoreDirectionCritiqueResult,
  FormedCoreDirection,
  ProviderRequestAccounting,
} from './types.js';

const formationRecords = new Map<string, CoreDirectionFormationRecord>();

export function resetCoreDirectionFormationMemory(): void {
  formationRecords.clear();
}

export function getCoreDirectionFormationRecord(idempotencyKey: string): CoreDirectionFormationRecord | null {
  return formationRecords.get(idempotencyKey) ?? null;
}

export function listCoreDirectionFormationRecords(organizationId: string): CoreDirectionFormationRecord[] {
  return [...formationRecords.values()].filter((r) => r.organizationId === organizationId);
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
  usage?: { inputTokens?: number; outputTokens?: number },
): void {
  accounting.requestCount += 1;
  if (kind === 'formation') accounting.formationRequests += 1;
  if (kind === 'critique') accounting.critiqueRequests += 1;
  if (kind === 'revise') accounting.reviseRequests += 1;
  accounting.tokenUsage.inputTokens = (accounting.tokenUsage.inputTokens ?? 0) + (usage?.inputTokens ?? 0);
  accounting.tokenUsage.outputTokens = (accounting.tokenUsage.outputTokens ?? 0) + (usage?.outputTokens ?? 0);
}

function deriveInitialStatus(profile: BrandLoreProfile | null): CoreDirectionFormationStatus {
  if (!profile) return 'NOT_READY';
  return canBeginCreativeDirection(profile.readinessState) ? 'READY_TO_FORM' : 'NOT_READY';
}

async function buildInputForProfile(
  profile: BrandLoreProfile,
  orgSlug: string,
  formationVersion: number,
): Promise<CoreDirectionFormationInput> {
  const intel = await loadCanonicalIntelligence(orgSlug);
  return buildCoreDirectionFormationInput({
    profile,
    formationVersion,
    contentBrainSections: intel.sections,
    includeLegacyExplorations: true,
  });
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
};

export type RunCoreDirectionFormationResult = {
  record: CoreDirectionFormationRecord;
  reused: boolean;
};

export async function runCoreDirectionFormation(
  params: RunCoreDirectionFormationParams,
): Promise<RunCoreDirectionFormationResult> {
  const formationVersion = params.formationVersion ?? 1;
  const input = await buildInputForProfile(params.profile, params.orgSlug, formationVersion);
  const inputErrors = validateFormationInput(input);
  if (inputErrors.length) {
    throw new Error(`Invalid formation input: ${inputErrors.join(', ')}`);
  }

  const idempotencyKey = buildFormationIdempotencyKey(input, CREATIVE_INTELLIGENCE_PROMPT_VERSION);
  const existing = formationRecords.get(idempotencyKey);
  if (existing && !params.forceReform && existing.status !== 'FAILED') {
    return { record: existing, reused: true };
  }

  const provider = getCreativeIntelligenceProvider();
  const now = new Date().toISOString();
  const record: CoreDirectionFormationRecord = {
    formationId: existing?.formationId ?? randomUUID(),
    organizationId: input.organizationId,
    projectId: input.projectId,
    brandLoreProfileId: input.brandLoreProfileId,
    brandLoreProfileVersion: input.brandLoreProfileVersion,
    brandLoreFingerprint: input.brandLoreFingerprint,
    formationVersion: input.formationVersion,
    providerId: provider.providerId,
    modelId: provider.capability.modelId,
    promptVersion: CREATIVE_INTELLIGENCE_PROMPT_VERSION,
    status: deriveInitialStatus(params.profile),
    idempotencyKey,
    candidateDirections: [],
    criticResult: null,
    revisionRounds: 0,
    finalDirections: [],
    visualProofPlans: [],
    legacyStaticPreview: 'PRESERVED',
    proposedFormationLabel: 'PROPOSED_FORMATION',
    providerAccounting: emptyAccounting(provider.providerId, provider.capability.modelId),
    error: null,
    createdAt: existing?.createdAt ?? now,
    completedAt: null,
  };

  if (record.status === 'NOT_READY') {
    record.error = 'Brand Lore not ready for Core Direction formation';
    formationRecords.set(idempotencyKey, record);
    return { record, reused: false };
  }

  if (provider.providerId === 'unavailable') {
    record.status = 'FAILED';
    record.error = 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE';
    formationRecords.set(idempotencyKey, record);
    return { record, reused: false };
  }

  try {
    record.status = 'FORMING';
    formationRecords.set(idempotencyKey, { ...record });

    let candidates: FormedCoreDirection[];
    const formationResult = await provider.formCoreDirections(input);
    accumulateUsage(record.providerAccounting, 'formation', formationResult.requestUsage);
    candidates = formationResult.directions;

    let outputErrors = validateFormedDirections(candidates);
    if (outputErrors.length) {
      record.status = 'NEEDS_HUMAN_REVIEW';
      record.error = outputErrors.join('; ');
      record.candidateDirections = candidates;
      formationRecords.set(idempotencyKey, record);
      return { record, reused: false };
    }

    record.candidateDirections = candidates;
    record.status = 'CRITIQUING';
    let critique = await runCritiquePass(input, candidates, record.providerAccounting);
    record.criticResult = critique;

    while (critique.revisionRequired && record.revisionRounds < MAX_CREATIVE_REVISION_ROUNDS) {
      record.status = 'REVISING';
      record.revisionRounds += 1;
      record.providerAccounting.revisionCount += 1;
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
    }

    if (critique.revisionRequired) {
      record.status = 'NEEDS_HUMAN_REVIEW';
      record.finalDirections = candidates;
      formationRecords.set(idempotencyKey, record);
      return { record, reused: false };
    }

    record.finalDirections = candidates;
    record.visualProofPlans = buildVisualProofPlans(candidates, input);
    record.status = 'READY_FOR_VISUAL_PRODUCTION';
    record.completedAt = new Date().toISOString();
    formationRecords.set(idempotencyKey, record);
    return { record, reused: false };
  } catch (error) {
    if (isProviderUnavailableError(error)) {
      record.status = 'FAILED';
      record.error = 'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE';
    } else {
      record.status = 'FAILED';
      record.error = error instanceof Error ? error.message : 'Formation failed';
    }
    formationRecords.set(idempotencyKey, record);
    return { record, reused: false };
  }
}

export async function getOrRunCoreDirectionFormation(params: RunCoreDirectionFormationParams) {
  return runCoreDirectionFormation(params);
}

export function incrementFormationVersion(current: number): number {
  return current + 1;
}

export function getCreativeIntelligenceInspectorSummary(record: CoreDirectionFormationRecord | null) {
  if (!record) {
    return {
      status: 'NOT_READY' as CoreDirectionFormationStatus,
      providerConfigured: getCreativeIntelligenceProvider().providerId !== 'unavailable',
      candidateCount: 0,
      revisionRounds: 0,
      finalDirectionNames: [] as string[],
      visualProofPlanCount: 0,
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
    providerConfigured: record.providerId !== 'unavailable',
    candidateCount: record.candidateDirections.length,
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
    proposedFormationLabel: record.proposedFormationLabel,
    legacyStaticPreview: record.legacyStaticPreview,
  };
}
