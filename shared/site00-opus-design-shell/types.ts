import type {
  OPUS_SHELL_ALLOWED_MUTATION_SCOPE,
  OPUS_SHELL_FORBIDDEN_MUTATION_SCOPE,
} from './constants.js';

export type OpusDesignShellTargetType = 'PAGE' | 'WORKSPACE_SELF';

export type OpusDesignShellErrorCode =
  | 'BLOCKED_NO_AUTHORITY'
  | 'BLOCKED_PAIR_NOT_LOCKED'
  | 'BLOCKED_NO_FUNCTION_CONTRACT'
  | 'BLOCKED_NO_SOURCE_CAPTURE'
  | 'BLOCKED_NO_ANTHROPIC_KEY'
  | 'BLOCKED_MODEL_UNAVAILABLE'
  | 'GENERATING'
  | 'API_FAILED'
  | 'INVALID_OUTPUT'
  | 'READY_FOR_REVIEW';

export type OpusDesignShellResultStatus =
  | 'GENERATING'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'REQUEST_CHANGES'
  | 'SUPERSEDED'
  | 'FAILED';

export type OpusShellUsageReceipt = {
  model: string;
  requestId: string | null;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  estimatedCostUsd: number | null;
  promptCacheEnabled: boolean;
};

export type OpusDesignShellPackage = {
  packageId: string;
  targetType: OpusDesignShellTargetType;
  projectId?: string;
  pageId?: string;
  workspaceTargetId?: string;

  authorityPairId: string;
  mobileAuthorityArtifactId: string;
  desktopAuthorityArtifactId: string;

  currentMobileCaptureId?: string | null;
  currentDesktopCaptureId?: string | null;

  functionContractId: string;
  site00HostContractVersion: string;
  projectDesignSystemVersion?: string | null;

  componentMap: readonly { id: string; label: string; role: string }[];
  relevantSourceFiles: readonly string[];
  currentVisualTokens: readonly string[];

  founderInstruction?: string | null;

  allowedMutationScope: readonly (typeof OPUS_SHELL_ALLOWED_MUTATION_SCOPE)[number][];
  forbiddenMutationScope: readonly (typeof OPUS_SHELL_FORBIDDEN_MUTATION_SCOPE)[number][];

  createdAt: string;
  createdBy: string;
};

export type OpusDesignShellProposedFile = {
  path: string;
  summary: string;
  stagedContent: string;
};

export type OpusDesignShellResult = {
  shellResultId: string;
  packageId: string;
  targetType: OpusDesignShellTargetType;

  summary: string;
  shellStrategy: string;

  proposedFiles: readonly OpusDesignShellProposedFile[];
  visualComponents: readonly string[];
  cssArtifacts: readonly string[];
  responsiveNotes: readonly string[];

  beforeAfterNotes: readonly string[];
  preservedFunctionConfirmation: string;
  forbiddenMutationConfirmation: string;

  usageReceipt: OpusShellUsageReceipt;

  status: OpusDesignShellResultStatus;
  createdAt: string;
};

export type OpusShellRevision = {
  revisionId: string;
  shellResultId: string;
  parentRevisionId: string | null;
  instruction: string | null;
  artifacts: readonly OpusDesignShellProposedFile[];
  usage: OpusShellUsageReceipt;
  status: OpusDesignShellResultStatus;
  createdAt: string;
};

export type ComposerShellImplementationPackage = {
  packageId: string;
  opusShellRevisionId: string;
  authorityPairId: string;
  functionContractId: string;

  approvedPresentationFiles: readonly OpusDesignShellProposedFile[];
  approvedCssArtifacts: readonly string[];
  currentProductionComponentMap: readonly { id: string; label: string; role: string }[];

  implementationRules: readonly string[];
  immutableBehaviorRules: readonly string[];

  createdAt: string;
};

/** Client → server eligibility snapshot (no secrets). */
export type OpusDesignShellEligibilityInput = {
  targetType: OpusDesignShellTargetType;
  projectId?: string;
  pageId?: string;
  workspaceTargetId?: string;
  mobilePromoted: boolean;
  desktopPromoted: boolean;
  pairReviewCompleted: boolean;
  pairLocked: boolean;
  hasFunctionContract: boolean;
  hasMobileCapture: boolean;
  hasDesktopCapture: boolean;
  anthropicConfigured: boolean;
  modelAvailable: boolean;
};

export type OpusDesignShellEligibility = {
  eligible: boolean;
  blockedCode: OpusDesignShellErrorCode | null;
  blockedReason: string | null;
  primaryAction: 'CREATE DESIGN SHELL' | 'REFINE DESIGN SHELL' | null;
  hasExistingShell: boolean;
};
