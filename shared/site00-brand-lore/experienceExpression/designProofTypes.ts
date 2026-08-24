/**
 * Visual development design proof types.
 */

import type { DesignProofManifest } from './designProofManifest.js';
import type { SurfaceExperienceArtDirection } from './surfaceArtDirection.js';
import type {
  ExperienceSurfaceDesignLifecycleState,
  SurfaceDesignFounderJudgment,
} from './surfaceDesignLifecycle.js';
import type { DesignProofQAResult } from './designProofQA.js';
import type { ExperienceImplementationContract } from './types.js';
import type { ProjectWorkspaceCanon } from '../projectWorkspace/projectWorkspaceCanon.js';
import type { ClientProjectExpressionProfile } from '../projectWorkspace/clientProjectExpressionProfile.js';
import type { ExperienceFunctionalCanon } from './types.js';
import type {
  DesignProofLineageEntry,
  VisualReferencePackage,
} from '../../site00-visual-reference/types.js';
import type {
  InterfaceAssetManifest,
  InterfaceSlotResolutionResult,
  ReferencePipelineStatus,
  SurfaceGenerationMode,
  SurfaceVisualAuthorityPackage,
  VisualGenerationExecutionTrace,
} from '../../site00-studio-world-production/p1/generationBoundary/index.js';
import type { AuthenticatedReferenceStatus } from '../../site00-visual-reference/authenticatedReferencePrecondition.js';

export type DesignProofGenerationReceipt = {
  receiptId: string;
  requirementId: string;
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  provider: string;
  model: string;
  requestId: string | null;
  promptHash: string;
  storagePath: string;
  publicUrl: string | null;
  costUsd: number;
  lineageKey: string;
  parentLineageKey: string | null;
  status: 'GENERATED' | 'FAILED';
  generatedAt: string;
  error: string | null;
};

export type ComposedDesignProof = {
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  proofVersion: string;
  storagePath: string;
  publicUrl: string | null;
  fingerprint: string;
  componentAssetIds: string[];
  composedAt: string;
  receiptId: string | null;
};

export type SurfaceDesignProof = {
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  proofRecordId: string;
  parentProofRecordId: string | null;
  owner: 'SITE00' | 'SITE00_PLUS_NDXBOOK';
  concept: string;
  surface: string;
  device: 'DESKTOP';
  lifecycle: ExperienceSurfaceDesignLifecycleState;
  artDirection: SurfaceExperienceArtDirection & Record<string, unknown>;
  manifest: DesignProofManifest | null;
  functionalCanon: ExperienceFunctionalCanon;
  workspaceCanonFingerprint: string;
  clientExpressionFingerprint: string | null;
  clientExpression: ClientProjectExpressionProfile | null;
  generatedAssets: Array<{
    requirementId: string;
    storagePath: string;
    publicUrl: string | null;
    assetRole: string;
    category: string;
    productionState: 'VISUAL_DEVELOPMENT';
  }>;
  generationReceipts: DesignProofGenerationReceipt[];
  composedProof: ComposedDesignProof | null;
  qaResult: DesignProofQAResult | null;
  founderJudgment: SurfaceDesignFounderJudgment;
  revisionNote: string | null;
  implementationContract: ExperienceImplementationContract | null;
  orchestrationPrepared: boolean;
  orchestrationStatus?: import('../../site00-studio-world-execution/types.js').OrchestrationDispatchStatus;
  generationError: string | null;
  generationStarted: boolean;
  referencePackage: VisualReferencePackage | null;
  referenceConditioned: boolean;
  proofLabel: 'PROOF_A' | 'PROOF_B' | null;
  revisionReason: string | null;
  proofLineage: DesignProofLineageEntry[];
  excludedReferenceIds: string[];
  referenceAdherenceResult: 'NOT_EVALUATED' | 'PASS' | 'FAIL' | null;
  surfaceGenerationMode: SurfaceGenerationMode;
  referencePipelineStatus: ReferencePipelineStatus;
  surfaceVisualAuthorityPackage: SurfaceVisualAuthorityPackage | null;
  interfaceAssetManifest: InterfaceAssetManifest | null;
  interfaceSlotResolution: InterfaceSlotResolutionResult | null;
  authenticatedReferenceStatus: AuthenticatedReferenceStatus[];
  executionTraces: VisualGenerationExecutionTrace[];
};

export type ProjectWorkspaceVisualDevelopmentRun = {
  runId: string;
  projectId: string;
  workspaceCanon: ProjectWorkspaceCanon;
  proofs: {
    site00ProjectsIndex: SurfaceDesignProof;
    ndxbookProjectHome: SurfaceDesignProof;
  };
  accounting: {
    falRequests: number;
    estimatedCostUsd: number;
    anthropicRequests: number;
    anthropicTokens: number;
    anthropicCostUsd: number;
    gptImageRequests: number;
    worldGenerationRequests: number;
  };
  compiledAt: string;
};

export const VISUAL_DEVELOPMENT_ROUTE = '/projects/ndxbook/experience-expression/visual-development';
