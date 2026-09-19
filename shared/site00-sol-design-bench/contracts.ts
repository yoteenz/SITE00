import type {
  SolBenchmarkInputReceipt,
  SolOutputCompletenessReceipt,
  SolBenchmarkProviderDispatchReceipt,
  SolDesignBenchProviderReadinessReceipt,
  SolStructuredOutputRuntimeReceipt,
  SolStructuredOutputValidationReceipt,
} from './modelContract.js';

export const SOL_DESIGN_BENCH_MODEL = 'GPT-5.6 SOL' as const;
export const SOL_DESIGN_BENCH_PROVIDER = 'OpenAI' as const;
export const COMPOSER_INVOKED_DURING_TEST = false as const;

export const SOL_DESIGN_BENCH_STAGES = [
  'IDLE',
  'UPLOADING',
  'QUEUED',
  'INGESTING_REFERENCE',
  'ANALYZING_VISUAL',
  'MEASURING_COMPOSITION',
  'DERIVING_DESIGN_SYSTEM',
  'DERIVING_COMPONENT_TREE',
  'RENDERING_INTERFACE_PREVIEW',
  'BUILDING_IMPLEMENTATION_HANDOFF',
  'FINALIZING',
  'COMPLETE',
  'FAILED',
  'SOL_OUTPUT_VALIDATION_FAILED',
  'SOL_OUTPUT_TRUNCATED',
] as const;

export type SolDesignBenchStage = (typeof SOL_DESIGN_BENCH_STAGES)[number];

export const SOL_DESIGN_BENCH_STAGE_WEIGHTS: Record<SolDesignBenchStage, number> = {
  IDLE: 0,
  UPLOADING: 2,
  QUEUED: 4,
  INGESTING_REFERENCE: 10,
  ANALYZING_VISUAL: 28,
  MEASURING_COMPOSITION: 44,
  DERIVING_DESIGN_SYSTEM: 58,
  DERIVING_COMPONENT_TREE: 70,
  RENDERING_INTERFACE_PREVIEW: 80,
  BUILDING_IMPLEMENTATION_HANDOFF: 90,
  FINALIZING: 97,
  COMPLETE: 100,
  FAILED: 100,
  SOL_OUTPUT_VALIDATION_FAILED: 100,
  SOL_OUTPUT_TRUNCATED: 100,
};

export interface SolDesignBenchReferenceAuthority {
  authorityType: 'SolDesignBenchReferenceAuthority';
  runId: string;
  storedFile: string;
  filename: string;
  sha256: string;
  width: number;
  height: number;
  bytes: number;
  mime: 'image/png' | 'image/jpeg' | 'image/webp';
  timestamp: string;
}

export interface NormalizedBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SolBenchComponentSpec {
  componentId: string;
  parentId: string | null;
  label: string;
  semanticRole: string;
  visualRole: string;
  siblingOrder: number;
  x: number;
  y: number;
  width: number;
  height: number;
  normalizedBounds: NormalizedBounds;
  layoutMode: string;
  alignment: string;
  padding: number | string;
  gap: number | string;
  visualPriority: 'DOMINANT' | 'SECONDARY' | 'TERTIARY';
  style?: {
    background?: string;
    color?: string;
    border?: string;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    textAlign?: string;
  };
  text?: string;
  assetId?: string;
  state?: string;
}

export interface FigmaStyleInterfaceTranslationPackage {
  packageType: 'FigmaStyleInterfaceTranslationPackage';
  VISUAL_INTERFACE_PREVIEW: {
    artboardWidth: number;
    artboardHeight: number;
    background: string;
    componentIds: string[];
    renderingNotes: string[];
    visualPreviewRef: string;
  };
  PAGE_FRAME_SPEC: Record<string, unknown>;
  SECTION_TREE: Array<Record<string, unknown>>;
  COMPONENT_TREE: SolBenchComponentSpec[];
  LAYOUT_GEOMETRY_SPEC: Record<string, unknown>;
  TYPOGRAPHY_SYSTEM: Array<Record<string, unknown>>;
  COLOR_SYSTEM: Array<Record<string, unknown>>;
  SPACING_SYSTEM: Record<string, unknown>;
  BORDER_RADIUS_SURFACE_SYSTEM: Record<string, unknown>;
  ASSET_PLACEMENT_MAP: Array<Record<string, unknown>>;
  CONTROL_STATE_SYSTEM: Array<Record<string, unknown>>;
  VISUAL_HIERARCHY_MAP: Array<Record<string, unknown>>;
  IMPLEMENTATION_HANDOFF: SolComposerImplementationHandoff;
  DO_NOT_CHANGE_RULES: string[];
}

export interface SolComposerImplementationHandoff {
  handoffType: 'SolComposerImplementationHandoff';
  executionIntent: 'REFERENCE_TRANSLATION';
  sourceAuthoritySha256: string;
  inventionBudget: 'NONE';
  targetFrame: Record<string, unknown>;
  orderedBuildInstructions: string[];
  componentContracts: Array<Record<string, unknown> | string>;
  tokenContracts: Record<string, unknown> | string[];
  assetBindings: Array<Record<string, unknown> | string>;
  acceptanceChecks: string[];
  composerInvoked: false;
}

export interface SolDesignBenchTiming {
  queuedAt: string;
  startedAt: string | null;
  providerStartedAt: string | null;
  providerCompletedAt: string | null;
  completedAt: string | null;
  queueDuration: number | null;
  modelDuration: number | null;
  postProcessingDuration: number | null;
  totalDuration: number | null;
}

export interface SolDesignBenchRun {
  runId: string;
  proofMode: 'TINY_LIVE_SCHEMA_SMOKE' | 'LARGE_OUTPUT_STRESS' | null;
  proofPassed: boolean | null;
  retryOfRunId: string | null;
  retryRunIds: string[];
  status: SolDesignBenchStage;
  stageLabel: string;
  progress: number;
  authority: SolDesignBenchReferenceAuthority;
  model: typeof SOL_DESIGN_BENCH_MODEL;
  provider: typeof SOL_DESIGN_BENCH_PROVIDER;
  providerModelId: 'gpt-5.6-sol';
  requestedReasoningEffort: 'high';
  providerReadinessReceipt: SolDesignBenchProviderReadinessReceipt;
  providerDispatchReceipt: SolBenchmarkProviderDispatchReceipt | null;
  inputReceipt: SolBenchmarkInputReceipt;
  structuredOutputValidationReceipt: SolStructuredOutputValidationReceipt | null;
  structuredOutputRuntimeReceipt: SolStructuredOutputRuntimeReceipt | null;
  outputCompletenessReceipt: SolOutputCompletenessReceipt | null;
  rawProviderResponseRef: string | null;
  recoveredSections: Partial<FigmaStyleInterfaceTranslationPackage> | null;
  solPromptVersion: string;
  solPromptHash: string;
  timing: SolDesignBenchTiming;
  etaSeconds: number | null;
  etaIsEstimate: true;
  result: FigmaStyleInterfaceTranslationPackage | null;
  error: {
    code:
      | 'SOL_RUN_FAILED'
      | 'GPT_5_6_SOL_PROVIDER_BINDING_FAILED'
      | 'SOL_STRUCTURED_OUTPUT_REQUEST_INVALID'
      | 'OPENAI_RESPONSES_REQUEST_INVALID'
      | 'SOL_STRUCTURED_OUTPUT_PARSE_FAILED'
      | 'SOL_OUTPUT_VALIDATION_FAILED'
      | 'SOL_OUTPUT_TRUNCATED';
    message: string;
  } | null;
  cost: { currency: string; amount: number } | null;
  composerInvokedDuringTest: false;
  grokOutputAccessed: false;
}

export interface StartSolDesignBenchRequest {
  action: 'START_SOL_TEST';
  reference: {
    filename: string;
    mime: SolDesignBenchReferenceAuthority['mime'];
    bytes: number;
    width: number;
    height: number;
    sha256: string;
    dataUrl: string;
  };
}

export interface SolDesignBenchHistoryEntry {
  model: typeof SOL_DESIGN_BENCH_MODEL;
  totalDuration: number;
  completedAt: string;
}

export function normalizedBounds(
  bounds: Pick<SolBenchComponentSpec, 'x' | 'y' | 'width' | 'height'>,
  frame: { width: number; height: number },
): NormalizedBounds {
  return {
    x: bounds.x / frame.width,
    y: bounds.y / frame.height,
    width: bounds.width / frame.width,
    height: bounds.height / frame.height,
  };
}

export function stageProgress(stage: SolDesignBenchStage): number {
  return SOL_DESIGN_BENCH_STAGE_WEIGHTS[stage];
}

export function estimateRemainingSeconds(
  stage: SolDesignBenchStage,
  elapsedSeconds: number,
  history: SolDesignBenchHistoryEntry[] = [],
): number | null {
  if (stage === 'COMPLETE' || stage === 'FAILED') return 0;
  const completed = Math.max(1, stageProgress(stage));
  const historic = history
    .filter((entry) => entry.model === SOL_DESIGN_BENCH_MODEL && entry.totalDuration > 0)
    .slice(-10);
  const expectedTotal = historic.length
    ? historic.reduce((sum, entry) => sum + entry.totalDuration, 0) / historic.length / 1000
    : Math.max(120, elapsedSeconds / (completed / 100));
  return Math.max(15, Math.round(expectedTotal - elapsedSeconds));
}

/** Stage-derived ETA with Sol-specific completed-run calibration; values are always approximate. */
export class SolDesignBenchEtaEstimator {
  constructor(private readonly history: SolDesignBenchHistoryEntry[] = []) {}

  estimate(stage: SolDesignBenchStage, elapsedSeconds: number): {
    remainingSeconds: number | null;
    approximate: true;
    basis: 'STAGE_WEIGHTS' | 'SOL_DURATION_HISTORY';
  } {
    const hasSolHistory = this.history.some(
      (entry) => entry.model === SOL_DESIGN_BENCH_MODEL && entry.totalDuration > 0,
    );
    return {
      remainingSeconds: estimateRemainingSeconds(stage, elapsedSeconds, this.history),
      approximate: true,
      basis: hasSolHistory ? 'SOL_DURATION_HISTORY' : 'STAGE_WEIGHTS',
    };
  }
}

export function validateReferenceInput(input: StartSolDesignBenchRequest['reference']): string[] {
  const errors: string[] = [];
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(input.mime)) errors.push('UNSUPPORTED_MIME');
  if (!input.filename.trim()) errors.push('FILENAME_REQUIRED');
  if (!Number.isInteger(input.bytes) || input.bytes <= 0) errors.push('INVALID_BYTES');
  if (!Number.isInteger(input.width) || input.width <= 0) errors.push('INVALID_WIDTH');
  if (!Number.isInteger(input.height) || input.height <= 0) errors.push('INVALID_HEIGHT');
  if (!/^[a-f0-9]{64}$/i.test(input.sha256)) errors.push('INVALID_SHA256');
  if (!input.dataUrl.startsWith(`data:${input.mime};base64,`)) errors.push('INVALID_DATA_URL');
  return errors;
}

export function assertTranslationPackage(
  value: unknown,
  authority: SolDesignBenchReferenceAuthority,
): FigmaStyleInterfaceTranslationPackage {
  if (!value || typeof value !== 'object') throw new Error('SOL_PACKAGE_NOT_OBJECT');
  const row = value as Record<string, unknown>;
  const required = [
    'VISUAL_INTERFACE_PREVIEW',
    'PAGE_FRAME_SPEC',
    'SECTION_TREE',
    'COMPONENT_TREE',
    'LAYOUT_GEOMETRY_SPEC',
    'TYPOGRAPHY_SYSTEM',
    'COLOR_SYSTEM',
    'SPACING_SYSTEM',
    'BORDER_RADIUS_SURFACE_SYSTEM',
    'ASSET_PLACEMENT_MAP',
    'CONTROL_STATE_SYSTEM',
    'VISUAL_HIERARCHY_MAP',
    'IMPLEMENTATION_HANDOFF',
    'DO_NOT_CHANGE_RULES',
  ];
  for (const key of required) {
    if (!(key in row)) throw new Error(`SOL_PACKAGE_MISSING_${key}`);
  }
  const result = { ...row, packageType: 'FigmaStyleInterfaceTranslationPackage' } as unknown as FigmaStyleInterfaceTranslationPackage;
  if (!Array.isArray(result.COMPONENT_TREE) || result.COMPONENT_TREE.length === 0) {
    throw new Error('SOL_PACKAGE_COMPONENT_TREE_EMPTY');
  }
  result.IMPLEMENTATION_HANDOFF = {
    ...result.IMPLEMENTATION_HANDOFF,
    handoffType: 'SolComposerImplementationHandoff',
    sourceAuthoritySha256: authority.sha256,
    executionIntent: 'REFERENCE_TRANSLATION',
    inventionBudget: 'NONE',
    composerInvoked: false,
  };
  return result;
}
