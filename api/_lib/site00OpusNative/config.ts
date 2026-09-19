/**
 * P0.VR.OPUS-NATIVE1 — runtime configuration and the credential boundary.
 *
 * SECURITY CONTRACT
 * The Anthropic key is read from process.env here and nowhere else in this
 * module tree. It is never returned, never logged, never serialised into a run
 * record, and never placed in a field the panel can read. The only thing that
 * crosses to the client is the boolean in `anthropicReadiness()`.
 *
 * Everything in this file runs server-side only. It must never be imported from
 * src/, and a guard test enforces that.
 */

import { OPUS_NATIVE_DEFAULT_RATES, type OpusTokenRates } from '../../../shared/site00-opus-native/pricing.js';

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_VERSION_HEADER = '2023-06-01';

/**
 * Phase: MODEL. Opus 5 is hard-bound. There is deliberately no environment
 * override for the model id — the sprint requires Opus 5 specifically, and an
 * override is how a cost-saving fallback silently becomes the thing that
 * produces the founder's design work.
 */
export const OPUS_NATIVE_MODEL = 'claude-opus-5' as const;
export const OPUS_NATIVE_MODEL_HARD_BOUND = true;

/** Never proxy through Cursor. Recorded so diagnostics can assert it. */
export const OPUS_NATIVE_USES_CURSOR_PROXY = false;

export function anthropicApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function isAnthropicConfigured(): boolean {
  return anthropicApiKey() !== null;
}

/** Safe for the wire: a boolean and a reason, never any part of the key. */
export function anthropicReadiness(): { ready: boolean; reason: string | null } {
  if (!isAnthropicConfigured()) {
    return {
      ready: false,
      reason: 'ANTHROPIC_API_KEY is not configured in the server environment',
    };
  }
  return { ready: true, reason: null };
}

/**
 * Test and proof escape hatch. The scripted provider replays a deterministic
 * tool-use transcript through the real runtime loop so the whole pipeline can
 * be exercised — and proven in CI — without a live credential or any spend.
 * It is opt-in per environment and can never be selected by a browser request
 * unless the server has enabled it.
 */
export function scriptedProviderEnabled(): boolean {
  return process.env.SITE00_OPUS_NATIVE_ALLOW_SCRIPTED === '1';
}

/** Where sandbox patches, screenshots and receipts are written. */
export function opusNativeWorkDir(): string {
  return process.env.SITE00_OPUS_NATIVE_WORKDIR?.trim() || '/tmp/site00-opus-native';
}

/**
 * P0.VR.OPUS-NATIVE2 — Phase 17. Where the runtime is executing, which decides
 * whether a visual loop is even possible.
 *
 * LOCAL means a workstation or cloud dev VM: repository on disk, a dev server
 * that can be started, a browser that can be installed. DEPLOYED means a
 * stateless API container with none of those. The distinction is inferred from
 * platform-provided variables rather than asked for, because the failure mode
 * being fixed here was precisely a default that assumed LOCAL everywhere.
 */
export type OpusNativeEnvironment = 'LOCAL' | 'DEPLOYED' | 'UNKNOWN';

export function runtimeEnvironment(): OpusNativeEnvironment {
  const declared = process.env.SITE00_OPUS_NATIVE_ENV?.trim().toUpperCase();
  if (declared === 'LOCAL' || declared === 'DEPLOYED') return declared;
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID || process.env.VERCEL) {
    return 'DEPLOYED';
  }
  if (process.env.NODE_ENV === 'production') return 'DEPLOYED';
  return 'LOCAL';
}

export function previewOriginConfigured(): boolean {
  return Boolean(process.env.SITE00_OPUS_NATIVE_PREVIEW_URL?.trim());
}

/**
 * Base URL the preview/screenshot tools drive.
 *
 * NATIVE1 hardcoded the Vite dev port as the default in every environment,
 * which is the whole of the PREVIEW FAILED defect: a deployed container dialled
 * its own loopback for a server that only exists on a developer's machine. The
 * dev-server default is now scoped to environments where a dev server can
 * plausibly exist, and DEPLOYED gets an empty origin so the readiness probe
 * reports PREVIEW_NOT_SUPPORTED_IN_THIS_ENVIRONMENT instead of a network error
 * that reads like an outage.
 */
export function previewBaseUrl(): string {
  const configured = process.env.SITE00_OPUS_NATIVE_PREVIEW_URL?.trim();
  if (configured) return configured;
  return runtimeEnvironment() === 'DEPLOYED' ? '' : 'http://127.0.0.1:5174';
}

export function tokenRates(): OpusTokenRates {
  const raw = process.env.SITE00_OPUS_NATIVE_RATES?.trim();
  if (!raw) return OPUS_NATIVE_DEFAULT_RATES;
  try {
    const parsed = JSON.parse(raw) as Partial<OpusTokenRates>;
    return {
      input: numberOr(parsed.input, OPUS_NATIVE_DEFAULT_RATES.input),
      output: numberOr(parsed.output, OPUS_NATIVE_DEFAULT_RATES.output),
      cacheWrite: numberOr(parsed.cacheWrite, OPUS_NATIVE_DEFAULT_RATES.cacheWrite),
      cacheRead: numberOr(parsed.cacheRead, OPUS_NATIVE_DEFAULT_RATES.cacheRead),
    };
  } catch {
    return OPUS_NATIVE_DEFAULT_RATES;
  }
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * Defence in depth for the security contract. Any string leaving the runtime
 * passes through this, so a key that reaches a transcript, a tool result or a
 * provider error message is redacted before it can be serialised to the panel.
 */
export function redactSecrets(text: string): string {
  if (!text) return text;
  let out = text;
  const key = anthropicApiKey();
  if (key) out = out.split(key).join('[REDACTED_ANTHROPIC_KEY]');
  // Catch a key that arrived from somewhere other than our own env read.
  out = out.replace(/sk-ant-[A-Za-z0-9_\-]{8,}/g, '[REDACTED_ANTHROPIC_KEY]');
  return out;
}

/** Repository root. The sandbox and tools resolve every path against this. */
export function repoRoot(): string {
  return process.env.SITE00_OPUS_NATIVE_REPO_ROOT?.trim() || process.cwd();
}
