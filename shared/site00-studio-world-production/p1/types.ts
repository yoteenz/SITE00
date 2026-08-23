/**
 * P1 orchestration types — Composer package, fidelity, budget, revision.
 */

import type { ExperienceImplementationContract } from '../../site00-brand-lore/experienceExpression/types.js';
import type { SurfaceDesignProof } from '../../site00-brand-lore/experienceExpression/designProofTypes.js';
import type {
  PageFamilyImplementationContract,
  SiteMethodologyFingerprints,
  SiteSurfaceExperienceBrief,
  SiteSurfaceImplementationContract,
} from '../siteProductionTypes.js';
import type { P1CapabilityId } from './constants.js';

export const COMPOSER_DISPATCH_STATUSES = [
  'NOT_PREPARED',
  'PACKAGE_COMPILED',
  'DISPATCHED',
  'RUNNING',
  'WAITING',
  'SUCCEEDED',
  'FAILED',
  'BLOCKED',
  'DUPLICATE_PREVENTED',
] as const;

export type ComposerDispatchStatus = (typeof COMPOSER_DISPATCH_STATUSES)[number];

export type ComposerAssetBinding = {
  requirementId: string;
  assetId: string;
  storagePath: string;
  assetRole: string;
  approved: boolean;
};

export type ComposerImplementationPackage = {
  packageId: string;
  runId: string;
  projectId: string;
  surfaceId: string;
  targetRoute: string;
  repository: string;
  sourceCommit: string | null;
  targetBranch: string;
  implementationContractId: string;
  pageFamilyContractId: string;
  surfaceContractId: string;
  approvedProofId: string;
  approvedProofFingerprint: string;
  assetBindings: ComposerAssetBinding[];
  functionalCanonFingerprint: string;
  siteMethodologyFingerprints: SiteMethodologyFingerprints;
  acceptanceCriteria: string[];
  doNotConstraints: string[];
  responsiveRequirements: string[];
  accessibilityRequirements: string[];
  dispatchStatus: ComposerDispatchStatus;
  composerExecutionId: string | null;
  composerRole: 'PRODUCTION_ENGINEER';
  creativeReinterpretationProhibited: true;
  idempotencyKey: string;
  createdAt: string;
  dispatchedAt: string | null;
  completedAt: string | null;
  resultCommit: string | null;
  pullRequestUrl: string | null;
  designProofContract: ExperienceImplementationContract;
  pageFamilyContract: PageFamilyImplementationContract;
  surfaceContract: SiteSurfaceImplementationContract;
  surfaceExperienceBrief: SiteSurfaceExperienceBrief;
};

export type P1ControlledProofBudget = {
  maxVisualGenerationAttempts: number;
  maxReferenceConditionedProofAttempts: number;
  maxComposerDispatchAttempts: number;
  maxFidelityEvaluations: number;
  maxRevisionLoops: number;
  maxEstimatedCostUsd: number;
  founderOverride: boolean;
};

export type P1BudgetSpend = {
  visualGenerationAttempts: number;
  referenceConditionedProofAttempts: number;
  composerDispatchAttempts: number;
  fidelityEvaluations: number;
  revisionLoops: number;
  estimatedCostUsd: number;
};

export const FIDELITY_DIMENSIONS = [
  'CONCEPT_FIDELITY',
  'PAGE_FAMILY_FIDELITY',
  'HOST_FIDELITY',
  'FUNCTIONAL_FIDELITY',
  'INFORMATION_HIERARCHY',
  'LAYOUT_GRAMMAR',
  'ARTWORK_FIDELITY',
  'ASSET_BINDING_FIDELITY',
  'TYPOGRAPHY_BEHAVIOR',
  'COLOR_BEHAVIOR',
  'COMPOSITION_BEHAVIOR',
  'INTERACTION_GRAMMAR',
  'RESPONSIVE_TRANSLATION',
  'GENERIC_TEMPLATE_RESEMBLANCE',
  'ACCESSIBILITY_RISK',
] as const;

export type FidelityDimension = (typeof FIDELITY_DIMENSIONS)[number];

export type FidelityDimensionResult = 'PASS' | 'FAIL' | 'WARN' | 'NOT_EVALUATED';

export const FIDELITY_OVERALL_RESULTS = [
  'PASS',
  'PASS_WITH_WARNINGS',
  'REVISION_REQUIRED',
  'FUNCTIONAL_FAILURE',
  'VISUAL_FAILURE',
  'BLOCKED',
  'NOT_EVALUATED',
] as const;

export type FidelityOverallResult = (typeof FIDELITY_OVERALL_RESULTS)[number];

export type ExperienceImplementationEvaluationResult = {
  evaluationId: string;
  runId: string;
  packageId: string;
  approvedProofId: string;
  implementedCaptureIds: string[];
  evaluatedAt: string;
  overallResult: FidelityOverallResult;
  dimensions: Array<{
    dimension: FidelityDimension;
    result: FidelityDimensionResult;
    notes: string[];
  }>;
  deterministicFunctionalChecks: Array<{
    checkId: string;
    result: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    notes: string[];
  }>;
  visionEvaluationAvailable: boolean;
};

export type ImplementationRevisionDelta = {
  revisionId: string;
  parentPackageId: string;
  preserve: string[];
  change: string[];
  doNot: string[];
  functionalCorrections: string[];
  visualCorrections: string[];
  responsiveCorrections: string[];
  assetCorrections: string[];
  accessibilityCorrections: string[];
  compiledAt: string;
  automaticCodeMutation: false;
};

export type ImplementedSurfaceReference = {
  referenceId: string;
  runId: string;
  packageId: string;
  route: string;
  viewport: 'DESKTOP' | 'MOBILE' | 'TABLET';
  storagePath: string;
  publicUrl: string;
  fingerprint: string;
  sourceCommit: string | null;
  capturedAt: string;
  role: 'IMPLEMENTED_SURFACE_REFERENCE';
};

export type P1PreconditionAuditResult = {
  auditId: string;
  evaluatedAt: string;
  sourceCommit: string | null;
  environment: string;
  p0MigrationApplied: boolean;
  p0InvalidationMigrationApplied: boolean;
  railwayRedeployed: boolean | 'UNKNOWN';
  durablePersistenceReachable: boolean;
  falConfigured: boolean;
  playwrightAvailable: boolean;
  composerCapabilityAvailable: boolean;
  blockingPrerequisites: string[];
  allHardPrerequisitesMet: boolean;
};

export type P1ControlledProofRun = {
  runId: string;
  projectId: string;
  surfaceId: typeof import('./constants.js').P1_CONTROLLED_SURFACE;
  proof: SurfaceDesignProof | null;
  pageFamilyContract: PageFamilyImplementationContract | null;
  surfaceExperienceBrief: SiteSurfaceExperienceBrief | null;
  surfaceContract: SiteSurfaceImplementationContract | null;
  composerPackage: ComposerImplementationPackage | null;
  fidelityEvaluation: ExperienceImplementationEvaluationResult | null;
  revisionDelta: ImplementationRevisionDelta | null;
  implementedCaptures: ImplementedSurfaceReference[];
  budget: P1ControlledProofBudget;
  spend: P1BudgetSpend;
  preconditionAudit: P1PreconditionAuditResult | null;
  capabilitySnapshots: Array<{
    capabilityId: P1CapabilityId;
    verificationStatus: string;
    notes: string | null;
  }>;
  founderImplementationReview: 'APPROVE_IMPLEMENTATION' | 'REVISE_IMPLEMENTATION' | 'REJECT_IMPLEMENTATION' | null;
  childRunId: string | null;
  parentRunId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ComposerDispatchResult = {
  package: ComposerImplementationPackage;
  dispatched: boolean;
  duplicatePrevented: boolean;
  blockedReason: string | null;
  runId: string;
};

export type DispatchGateResult = { ok: true } | { ok: false; blocker: string };
