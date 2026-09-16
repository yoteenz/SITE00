/**
 * P0.VR.OPUS-NATIVE1 — shared contracts for the SITE 00 native Opus design
 * runtime. Imported by both the server runtime and the design agent panel, so
 * nothing here may reference node or browser globals.
 */

/** Phase 15 — execution policies. */
export const OPUS_NATIVE_MODES = ['QUICK', 'DESIGN', 'FORENSIC'] as const;
export type OpusNativeMode = (typeof OPUS_NATIVE_MODES)[number];

/** Phase 2 — the status the panel renders. */
export const OPUS_NATIVE_RUN_STATUSES = [
  'READY',
  'THINKING',
  'TOOL_USE',
  'RENDERING',
  'WAITING_FOR_FOUNDER_REVIEW',
  'APPROVED',
  'REVERTED',
  'CANCELLED',
  'ERROR',
] as const;
export type OpusNativeRunStatus = (typeof OPUS_NATIVE_RUN_STATUSES)[number];

/** Phase 21 — every failure the runtime is required to handle by name. */
export const OPUS_NATIVE_FAILURES = [
  'MISSING_API_KEY',
  'RATE_LIMIT',
  'INSUFFICIENT_CREDIT',
  'PROVIDER_TIMEOUT',
  'PROVIDER_5XX',
  'MALFORMED_TOOL_CALL',
  'PATCH_CONFLICT',
  'TEST_FAILURE',
  'PREVIEW_FAILURE',
  'SCREENSHOT_FAILURE',
  'COST_CEILING',
  'ITERATION_CEILING',
  'CANCELLED',
  'CONTEXT_TOO_LARGE',
  'SCOPE_VIOLATION',
  'UNKNOWN',
] as const;
export type OpusNativeFailure = (typeof OPUS_NATIVE_FAILURES)[number];

export type OpusNativeViewport = 'MOBILE' | 'TABLET' | 'DESKTOP';

/** Phase 14 — reference identity is explicit, never described in prose. */
export interface OpusNativeGoldenReference {
  assetId: string;
  path: string;
  version: string;
  hash: string;
  width: number;
  height: number;
  approvalState: 'APPROVED' | 'CANDIDATE' | 'SUPERSEDED' | 'UNKNOWN';
}

/** Phase 3 — DesignAgentContext. Fields are optional where the project cannot yet supply them. */
export interface DesignAgentContext {
  projectId: string;
  projectName: string;
  projectType: string;

  route: string;
  pageId: string;
  pageRole: string;

  viewMode: string;
  viewport: OpusNativeViewport;

  goldenReference: OpusNativeGoldenReference | null;
  approvedReferenceAssets: string[];

  brandWorldContext: string | null;
  projectDesignLanguage: string | null;
  creativeContext: string | null;

  currentDesignAuthority: string | null;
  parentDesignAuthority: string | null;

  currentScreenshot: string | null;

  relevantComponents: string[];
  relevantStyles: string[];
  relevantAssets: string[];

  interactionContract: string | null;
  stateContract: string | null;

  approvedLineage: string[];
}

/** Phase 4 — the four classes the context compiler emits. */
export const OPUS_CONTEXT_TIERS = [
  'STABLE_CACHEABLE_CONTEXT',
  'PROJECT_CONTEXT',
  'PAGE_CONTEXT',
  'TASK_CONTEXT',
] as const;
export type OpusContextTier = (typeof OPUS_CONTEXT_TIERS)[number];

export interface OpusContextBlock {
  tier: OpusContextTier;
  label: string;
  text: string;
  /** Estimated tokens, so the panel can show context size before dispatch. */
  estimatedTokens: number;
  /** Only stable tiers carry a cache breakpoint. */
  cacheable: boolean;
  sources: string[];
}

export interface CompiledAgentContext {
  blocks: OpusContextBlock[];
  totalEstimatedTokens: number;
  cacheableEstimatedTokens: number;
  /** Files the run is permitted to read, from the dependency-aware boundary. */
  fileAllowlist: string[];
  /** Files the run is permitted to patch. Resolved from the write capability. */
  writeAllowlist: string[];
  /** P0.VR.OPUS-NATIVE2 — directories new files may be created in. */
  createDirectories: string[];
  writeMode: string;
  intent: string;
  protocolVersion: string;
  protocolHash: string;
}

/** Phase 10 — every mutation produces one of these. */
export interface DesignAgentPatch {
  patchId: string;
  runId: string;
  filesChanged: string[];
  diff: string;
  reason: string;
  reversible: boolean;
  createdAt: string;
  /** Baseline content per file, which is what makes revert exact rather than approximate. */
  baseline: Record<string, string | null>;
  applied: boolean;
  /**
   * P0.VR.OPUS-NATIVE2 — Phase 10. Files this patch brought into existence.
   * Tracked separately because reverting them means deleting rather than
   * restoring, and because the founder should see creation distinctly from
   * modification in the review package.
   */
  createdFiles?: string[];
}

/** Phase 6 — cost receipt. */
export interface OpusNativeCostReceipt {
  runId: string;
  model: string;
  mode: OpusNativeMode;

  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;

  estimatedUsd: number;
  actualUsd: number | null;

  toolCalls: number;
  iterations: number;

  projectId: string;
  pageId: string;
  taskType: OpusNativeMode;

  /** Derived: what the same run would have cost with no cache reads. */
  cacheSavingsUsd: number;
  protocolHash: string;
  createdAt: string;
}

/** Phase 7 — cost guard. */
export interface OpusNativeCostGuardLimits {
  maxIterations: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  maxRunCostUsd: number;
  warnAtCostUsd: number;
  hardStopAtCostUsd: number;
}

export type OpusNativeCostGuardState = 'OK' | 'WARNING' | 'BLOCKED';

export interface OpusNativeCostGuardVerdict {
  state: OpusNativeCostGuardState;
  reason: string | null;
  limits: OpusNativeCostGuardLimits;
  spentUsd: number;
  iterations: number;
}

/** Phase 8 — tool surface. */
export const OPUS_NATIVE_TOOLS = [
  'read_project_context',
  'read_design_contract',
  'read_file',
  'search_code',
  'read_asset_manifest',
  'read_golden_reference',
  'capture_current_render',
  'inspect_dom',
  'write_patch',
  'run_typecheck',
  'run_targeted_tests',
  'launch_or_refresh_preview',
  'capture_screenshot',
  'compare_screenshot',
  'revert_patch',
  // P0.VR.OPUS-NATIVE2 — Phase 10, 12, 15.
  'create_file',
  'discover_components',
  'propose_page_plan',
] as const;
export type OpusNativeToolName = (typeof OPUS_NATIVE_TOOLS)[number];

export interface OpusNativeToolCallRecord {
  tool: OpusNativeToolName | string;
  input: Record<string, unknown>;
  ok: boolean;
  summary: string;
  durationMs: number;
  at: string;
}

/** Phase 13 — screenshot QA artifact. */
export interface OpusNativeScreenshot {
  screenshotId: string;
  viewport: OpusNativeViewport;
  width: number;
  height: number;
  path: string;
  at: string;
  /** Present only when the run captured a baseline to compare against. */
  comparedToId?: string;
  diffPercent?: number;
}

/** Phase 19 — auditable lineage record. */
export interface DesignAgentLineageRecord {
  lineageId: string;
  runId: string;
  sourceGolden: OpusNativeGoldenReference | null;
  parentDesignAuthority: string | null;
  patchId: string | null;
  screenshots: OpusNativeScreenshot[];
  founderDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVERTED' | 'PENDING';
  decidedAt: string | null;
  resultingDesignVersion: string | null;
  protocolVersion: string;
}

/** Phase 17 — what the founder is shown at the approval boundary. */
export interface OpusNativeReviewPackage {
  runId: string;
  summary: string;
  patch: DesignAgentPatch | null;
  before: OpusNativeScreenshot | null;
  after: OpusNativeScreenshot | null;
  /** P0.VR.OPUS-NATIVE2 — Phase 20/26. Shown alongside before/after. */
  golden: OpusNativeGoldenReference | null;
  createdFiles: string[];
  /** True when the run could not see its own render, so nothing is certified visually. */
  previewBlocked: boolean;
  typecheck: { ran: boolean; ok: boolean; output: string } | null;
  tests: { ran: boolean; ok: boolean; output: string } | null;
  receipt: OpusNativeCostReceipt;
  guard: OpusNativeCostGuardVerdict;
}

/** A complete run as the panel sees it. */
export interface OpusNativeRun {
  runId: string;
  mode: OpusNativeMode;
  task: string;
  status: OpusNativeRunStatus;
  failure: OpusNativeFailure | null;
  failureDetail: string | null;
  createdAt: string;
  updatedAt: string;
  context: DesignAgentContext;
  compiled: Omit<CompiledAgentContext, 'blocks'> & { blockSummary: Array<{ tier: OpusContextTier; label: string; estimatedTokens: number; cacheable: boolean }> };
  toolCalls: OpusNativeToolCallRecord[];
  screenshots: OpusNativeScreenshot[];
  patch: DesignAgentPatch | null;
  receipt: OpusNativeCostReceipt | null;
  guard: OpusNativeCostGuardVerdict;
  review: OpusNativeReviewPackage | null;
  lineage: DesignAgentLineageRecord | null;
  /** Human-readable trace of what the agent did. Never contains provider secrets. */
  transcript: Array<{ at: string; kind: 'assistant' | 'tool' | 'system'; text: string }>;
  providerId: 'anthropic' | 'scripted';
  // ---- P0.VR.OPUS-NATIVE2 --------------------------------------------------
  intent: string;
  writeMode: string;
  /** True when a founder grant, not the standing policy, opened this scope. */
  writeGrantApplied: boolean;
  sessionId: string | null;
  parentRunId: string | null;
  creationPlan: unknown | null;
}

/** Phase 20 — observability. Never contains a secret or any part of one. */
export interface OpusNativeDiagnostics {
  anthropicApi: 'READY' | 'BLOCKED';
  anthropicBlockedReason: string | null;
  model: string;
  modelHardBound: boolean;
  promptCache: 'HIT' | 'MISS' | 'PARTIAL' | 'UNKNOWN';
  tools: 'READY' | 'FAILED';
  toolsDetail: string;
  /**
   * P0.VR.OPUS-NATIVE2 — Phase 18. BLOCKED carries a named reason and a
   * remedy; FAILED carried neither and could not be acted on.
   */
  preview: 'READY' | 'BLOCKED';
  previewReason: string | null;
  previewDetail: string;
  previewOrigin: string;
  previewRemedy: string | null;
  environment: string;
  costGuard: OpusNativeCostGuardState;
  protocolVersion: string;
  protocolHash: string;
  sandbox: 'READY' | 'FAILED';
  keyExposureAudit: 'SERVER_ONLY' | 'LEAKED';
}

/** Phase 24 — Cursor parity. */
export type OpusNativeParityStatus = 'PARITY' | 'BETTER_NATIVE' | 'MISSING_NATIVE';

export interface NativeOpusVsCursorGapRow {
  capability: string;
  cursor: string;
  native: string;
  status: OpusNativeParityStatus;
  blocksCursorExit: boolean;
  note: string;
}
