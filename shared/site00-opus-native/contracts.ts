/**
 * P0.VR.OPUS-NATIVE1 — HTTP contract between the design agent panel and the
 * native Opus runtime. One endpoint, action-dispatched, matching the existing
 * SITE 00 API convention.
 */

import type { OpusModelEffort } from './modeContracts.js';
import type { PageCreationContract } from './pageCreation.js';
import type { DesignAgentSession } from './session.js';
import type {
  DesignAgentIntent,
  DesignSurfaceWritePolicy,
  DesignWriteMode,
  FounderWriteGrant,
  WriteAuthorizationRequest,
} from './writePolicy.js';
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
  | 'gap'
  // ---- P0.VR.OPUS-NATIVE2 --------------------------------------------------
  | 'surfaces'
  | 'agent_context'
  | 'sessions'
  | 'continue';

export interface OpusNativeEstimateRequest {
  action: 'estimate';
  mode: OpusNativeMode;
  task: string;
  target?: OpusNativeTargetRef;
  intent?: DesignAgentIntent;
  writeGrant?: FounderWriteGrant | null;
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
  // ---- P0.VR.OPUS-NATIVE2 — Phase 7/22 ------------------------------------
  intent: DesignAgentIntent;
  requestedMode: DesignWriteMode;
  permittedMode: DesignWriteMode;
  standingMode: DesignWriteMode;
  maxGrantableMode: DesignWriteMode;
  createDirectories: string[];
  assetMutation: 'BLOCKED' | 'GRANTED';
  /**
   * Phase 7. Non-null when the founder must authorise before dispatch. The
   * estimate deliberately still returns a cost, so the grant decision is made
   * with the price visible rather than after it.
   */
  writeAuthorization: WriteAuthorizationRequest | null;
  previewReady: boolean;
  previewReason: string | null;
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
  // ---- P0.VR.OPUS-NATIVE2 --------------------------------------------------
  /** Phase 5 — declared, never inferred from the task text. */
  intent?: DesignAgentIntent;
  /** Phase 7 — run-scoped only. Never persisted as surface policy. */
  writeGrant?: FounderWriteGrant | null;
  /** Phase 12 — required for creation intents. */
  creationContract?: PageCreationContract | null;
  /** Phase 23/24 — thread this run belongs to. */
  sessionId?: string | null;
  /** Phase 23 — set on a continuation so the parent's state is inherited. */
  parentRunId?: string | null;
}

/** Phase 23 — request changes and continue in the same thread, in one call. */
export interface OpusNativeContinueRequest {
  action: 'continue';
  runId: string;
  note: string;
  mode?: OpusNativeMode;
  founderConfirmedSpend: boolean;
  scriptedProviderId?: string;
}

/** Phase 31/32 — what the panel needs to render targeting and the brain view. */
export interface OpusNativeSurfaceSummary {
  pageId: string;
  route: string;
  pageRole: string;
  projectSlug: string;
  parentPageId: string | null;
  standingWriteMode: DesignWriteMode;
  maxGrantableWriteMode: DesignWriteMode;
  goldenReferenceVersion: string;
  writeFirewallReason: string | null;
  assetManifestPath: string | null;
  allowedCreateDirectories: string[];
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

/**
 * Phase 32 — "what does Opus know". Compiled operational context only: the
 * blocks that will be sent, their sizes and their sources. Explicitly not
 * chain-of-thought, which the founder should not be shown and the model
 * should not be asked to produce for display.
 */
export interface OpusNativeAgentContextResponse {
  ok: true;
  pageId: string;
  route: string;
  context: DesignAgentContext;
  policy: DesignSurfaceWritePolicy;
  intent: DesignAgentIntent;
  standingMode: DesignWriteMode;
  maxGrantableMode: DesignWriteMode;
  inheritance: {
    parentPageId: string | null;
    mustInherit: string[];
    mayOverride: string[];
    sharedModules: string[];
  } | null;
  assetAuthority: {
    manifestPath: string | null;
    protectedPaths: string[];
    mutation: 'BLOCKED' | 'GRANTED';
    owner: string;
  };
  blocks: Array<{
    tier: string;
    label: string;
    estimatedTokens: number;
    cacheable: boolean;
    sources: string[];
    /** First lines only. Enough to verify what it is, not a full dump. */
    preview: string;
  }>;
  totalEstimatedTokens: number;
  cacheableEstimatedTokens: number;
}

export interface OpusNativeSessionsResponse {
  ok: true;
  sessions: DesignAgentSession[];
}

export interface OpusNativeSurfacesResponse {
  ok: true;
  surfaces: OpusNativeSurfaceSummary[];
}

export interface OpusNativeErrorResponse {
  ok: false;
  error: string;
  detail?: string;
  /** Phase 7 — present when error is WRITE_ACCESS_REQUIRED. */
  writeAuthorization?: WriteAuthorizationRequest;
}
