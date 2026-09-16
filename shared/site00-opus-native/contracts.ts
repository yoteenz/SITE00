/**
 * P0.VR.OPUS-NATIVE1 — HTTP contract between the design agent panel and the
 * native Opus runtime. One endpoint, action-dispatched, matching the existing
 * SITE 00 API convention.
 */

import type { OpusModelEffort } from './modeContracts.js';
import type {
  DesignAgentContext,
  OpusNativeDiagnostics,
  OpusNativeMode,
  OpusNativeRun,
  OpusNativeViewport,
  NativeOpusVsCursorGapRow,
} from './types.js';

export const OPUS_NATIVE_API_PATH = '/api/site00/opus-native';

export type OpusNativeAction =
  | 'diagnostics'
  | 'estimate'
  | 'start'
  | 'status'
  | 'cancel'
  | 'approve'
  | 'request_changes'
  | 'revert'
  | 'ledger'
  | 'gap';

export interface OpusNativeEstimateRequest {
  action: 'estimate';
  mode: OpusNativeMode;
  task: string;
  target?: OpusNativeTargetRef;
}

/** What the run is pointed at. Everything else is compiled from this. */
export interface OpusNativeTargetRef {
  projectSlug?: string;
  route?: string;
  pageId?: string;
  viewport?: OpusNativeViewport;
  viewMode?: string;
  /** Optional explicit file focus; the compiler expands dependencies from here. */
  focusFiles?: string[];
}

export interface OpusNativeEstimateResponse {
  ok: true;
  mode: OpusNativeMode;
  context: DesignAgentContext;
  estimatedTokens: number;
  cacheableTokens: number;
  estimatedUsd: number;
  /** Estimate assuming the stable prefix is already cached. */
  estimatedUsdCached: number;
  fileAllowlist: string[];
  writeAllowlist: string[];
  blockSummary: Array<{ tier: string; label: string; estimatedTokens: number; cacheable: boolean }>;
  guardLimits: Record<string, number>;
}

export interface OpusNativeStartRequest {
  action: 'start';
  mode: OpusNativeMode;
  task: string;
  target?: OpusNativeTargetRef;
  effort?: OpusModelEffort;
  /** Phase 7 — the founder acknowledges the estimated spend before dispatch. */
  founderConfirmedSpend: boolean;
  /** Test-only deterministic provider. Rejected unless explicitly enabled server-side. */
  scriptedProviderId?: string;
}

export interface OpusNativeRunResponse {
  ok: true;
  run: OpusNativeRun;
}

export interface OpusNativeDiagnosticsResponse {
  ok: true;
  diagnostics: OpusNativeDiagnostics;
}

export interface OpusNativeLedgerResponse {
  ok: true;
  receipts: OpusNativeRun['receipt'][];
  totals: {
    runs: number;
    totalUsd: number;
    totalCacheSavingsUsd: number;
    costPerPage: Record<string, number>;
    costPerProject: Record<string, number>;
    costPerRefinementUsd: number;
  };
}

export interface OpusNativeGapResponse {
  ok: true;
  rows: NativeOpusVsCursorGapRow[];
  summary: {
    parity: number;
    betterNative: number;
    missingNative: number;
    cursorExitReady: 'YES' | 'NO' | 'PARTIAL';
    blockers: string[];
  };
}

export interface OpusNativeErrorResponse {
  ok: false;
  error: string;
  detail?: string;
}
