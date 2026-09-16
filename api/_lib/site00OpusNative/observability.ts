/**
 * P0.VR.OPUS-NATIVE1 — Phase 20: internal diagnostics.
 *
 * Everything here is safe to render in a browser. The key-exposure audit is
 * not decorative: it actively re-checks that no field on this payload contains
 * anything resembling a credential, so a future edit that starts leaking one
 * fails visibly in the panel and in the guard tests rather than silently.
 */

import {
  anthropicReadiness,
  OPUS_NATIVE_MODEL,
  OPUS_NATIVE_MODEL_HARD_BOUND,
} from './config.js';
import {
  OPUS_DESIGN_EXECUTION_PROTOCOL_HASH,
  OPUS_DESIGN_EXECUTION_PROTOCOL_VERSION,
} from '../../../shared/site00-opus-native/protocol.js';
import type { OpusNativeDiagnostics } from '../../../shared/site00-opus-native/types.js';
import { opusNativeWorkDir } from './config.js';
import { previewReadiness } from './preview.js';
import { latestRun } from './runContext.js';
import { OPUS_TOOL_DEFINITIONS } from './tools.js';

import { mkdir } from 'node:fs/promises';

export async function collectDiagnostics(): Promise<OpusNativeDiagnostics> {
  const anthropic = anthropicReadiness();
  const preview = await previewReadiness();
  const run = latestRun();

  let sandbox: 'READY' | 'FAILED' = 'READY';
  try {
    await mkdir(opusNativeWorkDir(), { recursive: true });
  } catch {
    sandbox = 'FAILED';
  }

  const diagnostics: OpusNativeDiagnostics = {
    anthropicApi: anthropic.ready ? 'READY' : 'BLOCKED',
    anthropicBlockedReason: anthropic.reason,
    model: OPUS_NATIVE_MODEL,
    modelHardBound: OPUS_NATIVE_MODEL_HARD_BOUND,
    promptCache: run?.cachePosture ?? 'UNKNOWN',
    tools: OPUS_TOOL_DEFINITIONS.length > 0 ? 'READY' : 'FAILED',
    toolsDetail: `${OPUS_TOOL_DEFINITIONS.length} tools registered; no arbitrary shell capability`,
    /**
     * P0.VR.OPUS-NATIVE2 — Phase 18. "FAILED" was the field that made the
     * original defect unactionable: it read as a fault when the common case
     * is a deployment that legitimately cannot host a browser. BLOCKED plus a
     * named reason and a remedy replaces it.
     */
    preview: preview.ready ? 'READY' : 'BLOCKED',
    previewReason: preview.reason,
    previewDetail: preview.detail,
    previewOrigin: preview.origin || '(none configured)',
    previewRemedy: preview.remedy,
    environment: preview.environment,
    costGuard: run ? run.meter.check().state : 'OK',
    protocolVersion: OPUS_DESIGN_EXECUTION_PROTOCOL_VERSION,
    protocolHash: OPUS_DESIGN_EXECUTION_PROTOCOL_HASH,
    sandbox,
    keyExposureAudit: 'SERVER_ONLY',
  };

  diagnostics.keyExposureAudit = auditForSecrets(diagnostics) ? 'LEAKED' : 'SERVER_ONLY';
  return diagnostics;
}

/** Returns true if anything in the payload looks like a credential. */
export function auditForSecrets(payload: unknown): boolean {
  const serialised = JSON.stringify(payload ?? {});
  if (/sk-ant-/.test(serialised)) return true;
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (key && key.length > 8 && serialised.includes(key)) return true;
  return false;
}
