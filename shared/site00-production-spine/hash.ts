import { createHash } from 'node:crypto';
import type { GenerationJobRecord } from './types.js';

/** JSON with object keys sorted at every depth, so equal values always serialize to equal bytes. */
export function stableStringify(value: unknown, indent = 0): string {
  return JSON.stringify(sortKeys(value), null, indent || undefined);
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]));
  return v;
}

export const sha256Hex = (data: string | Uint8Array): string => createHash('sha256').update(data).digest('hex');

/** Everything that changes what a provider would make. Status, timestamps and approvals are not inputs. */
export function jobInputHash(j: Pick<GenerationJobRecord, 'projectId' | 'shotId' | 'jobKind' | 'routeId' | 'provider' | 'model' | 'mode' | 'settings' | 'requestedOutputs' | 'inputs' | 'prompt'>): string {
  return sha256Hex(
    stableStringify({
      projectId: j.projectId,
      shotId: j.shotId,
      jobKind: j.jobKind,
      routeId: j.routeId,
      provider: j.provider,
      model: j.model,
      mode: j.mode,
      settings: j.settings,
      requestedOutputs: j.requestedOutputs,
      inputs: j.inputs.map((i) => ({ role: i.role, referenceId: i.referenceId, contentSha256: i.contentSha256 })),
      prompt: j.prompt.text,
    }),
  );
}

/** One key per job slot and input set: the same request made twice is the same job. */
export const jobIdempotencyKey = (jobId: string, inputHash: string) => sha256Hex(`${jobId}|${inputHash}`);
