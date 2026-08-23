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
  generationError: string | null;
  generationStarted: boolean;
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
