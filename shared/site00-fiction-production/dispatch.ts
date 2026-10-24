import { createHash } from 'node:crypto';
import type { BlockedReason } from '../site00-production-guardrails/types.js';
import type { StageId } from './pipeline.js';

export type SpendAuthorization = {
  authorizationId: string;
  releaseId: string;
  stage: StageId;
  maxCredits: number | null;
  maxUsd: number | null;
  authorizedBy: string;
  authorizedAt: string;
};

export type GenerationJob = {
  releaseId: string;
  stage: StageId;
  shotId: string | null;
  lineId: string | null;
  provider: string;
  model: string;
  inputs: Record<string, string>;
  estimatedCredits: number | null;
  estimatedUsd: number | null;
};

export type JobStatus = 'READY_TO_DISPATCH' | 'IN_FLIGHT' | 'SUCCEEDED' | 'FAILED_RETRYABLE' | 'FAILED_TERMINAL';

export type JobRecord = GenerationJob & {
  idempotencyKey: string;
  status: JobStatus;
  attempts: number;
  errors: string[];
  providerReceipt: { creationId: string; credits: number | null; usd: number | null } | null;
};

export type DispatchDecision =
  | { status: 'READY_TO_DISPATCH'; idempotencyKey: string; creditsSpent: 0 }
  | { status: 'BLOCKED'; blockedReason: BlockedReason | 'DUPLICATE_GENERATION' | 'PROVIDER_NOT_VERIFIED' | 'UPSTREAM_NOT_APPROVED'; detail: string; creditsSpent: 0 };

export const MAX_ATTEMPTS = 3;

const stable = (v: unknown): string =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(',')}}`
    : JSON.stringify(v);

/** Same release, stage, shot, line, provider, model and input hashes → same key. */
export function idempotencyKey(job: GenerationJob): string {
  const { releaseId, stage, shotId, lineId, provider, model, inputs } = job;
  return createHash('sha256').update(stable({ releaseId, stage, shotId, lineId, provider, model, inputs })).digest('hex');
}

export type DispatchContext = {
  ledger: JobRecord[];
  authorizations: SpendAuthorization[];
  verifiedProviders: string[];
  plannedProvider: string | null;
  upstreamApproved: boolean;
};

/**
 * Decides whether a paid job may be handed to a provider adapter. This function never calls a provider.
 * Every blocked outcome spends 0 credits.
 */
export function precheckProductionDispatch(job: GenerationJob, ctx: DispatchContext): DispatchDecision {
  const key = idempotencyKey(job);
  const block = (blockedReason: Extract<DispatchDecision, { status: 'BLOCKED' }>['blockedReason'], detail: string): DispatchDecision => ({ status: 'BLOCKED', blockedReason, detail, creditsSpent: 0 });
  if (!ctx.upstreamApproved) return block('UPSTREAM_NOT_APPROVED', `${job.stage} needs every upstream approval first`);
  if (ctx.plannedProvider && ctx.plannedProvider !== job.provider) return block('SILENT_FALLBACK_ATTEMPT', `planned ${ctx.plannedProvider}, requested ${job.provider}`);
  if (!ctx.verifiedProviders.includes(job.provider)) return block('PROVIDER_NOT_VERIFIED', `${job.provider} has no verified generation capability`);
  const prior = ctx.ledger.find((j) => j.idempotencyKey === key);
  if (prior && (prior.status === 'SUCCEEDED' || prior.status === 'IN_FLIGHT' || prior.status === 'READY_TO_DISPATCH')) {
    return block('DUPLICATE_GENERATION', `identical job already ${prior.status}`);
  }
  if (prior?.status === 'FAILED_TERMINAL') return block('DUPLICATE_GENERATION', 'identical job failed terminally; change inputs or record a new decision');
  const auth = ctx.authorizations.find((a) => a.releaseId === job.releaseId && a.stage === job.stage && a.authorizedBy === 'founder');
  if (!auth) return block('UNAUTHORIZED_SPEND', `no founder spend authorization for ${job.releaseId} ${job.stage}`);
  const spent = ctx.ledger.filter((j) => j.releaseId === job.releaseId && j.stage === job.stage);
  const credits = spent.reduce((a, j) => a + (j.providerReceipt?.credits ?? j.estimatedCredits ?? 0), 0) + (job.estimatedCredits ?? 0);
  const usd = spent.reduce((a, j) => a + (j.providerReceipt?.usd ?? j.estimatedUsd ?? 0), 0) + (job.estimatedUsd ?? 0);
  if (auth.maxCredits !== null && credits > auth.maxCredits) return block('UNAUTHORIZED_SPEND', `would reach ${credits} credits; authorized ${auth.maxCredits}`);
  if (auth.maxUsd !== null && usd > auth.maxUsd) return block('UNAUTHORIZED_SPEND', `would reach $${usd.toFixed(2)}; authorized $${auth.maxUsd}`);
  return { status: 'READY_TO_DISPATCH', idempotencyKey: key, creditsSpent: 0 };
}

export function openJob(job: GenerationJob, ledger: JobRecord[]): JobRecord[] {
  const key = idempotencyKey(job);
  const prior = ledger.find((j) => j.idempotencyKey === key);
  if (prior && prior.status === 'FAILED_RETRYABLE') return ledger.map((j) => (j === prior ? { ...j, status: 'IN_FLIGHT', attempts: j.attempts + 1 } : j));
  if (prior) throw new Error(`job ${key.slice(0, 12)} already ${prior.status}`);
  return [...ledger, { ...job, idempotencyKey: key, status: 'IN_FLIGHT', attempts: 1, errors: [], providerReceipt: null }];
}

/** Retryable until MAX_ATTEMPTS; the stage does not advance and no other provider is substituted. */
export function recordFailure(ledger: JobRecord[], key: string, error: string, retryable: boolean): JobRecord[] {
  return ledger.map((j) => {
    if (j.idempotencyKey !== key) return j;
    const terminal = !retryable || j.attempts >= MAX_ATTEMPTS;
    return { ...j, status: terminal ? 'FAILED_TERMINAL' : 'FAILED_RETRYABLE', errors: [...j.errors, error] };
  });
}

export function recordSuccess(ledger: JobRecord[], key: string, receipt: NonNullable<JobRecord['providerReceipt']>): JobRecord[] {
  return ledger.map((j) => (j.idempotencyKey === key ? { ...j, status: 'SUCCEEDED', providerReceipt: receipt } : j));
}

export function actualCost(ledger: JobRecord[], releaseId: string) {
  const done = ledger.filter((j) => j.releaseId === releaseId && j.providerReceipt);
  if (!done.length) return null;
  return {
    credits: done.reduce((a, j) => a + (j.providerReceipt?.credits ?? 0), 0),
    usd: Math.round(done.reduce((a, j) => a + (j.providerReceipt?.usd ?? 0), 0) * 100) / 100,
  };
}
