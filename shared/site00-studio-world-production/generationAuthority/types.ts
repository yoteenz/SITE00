/**
 * P0.5C.5A — Generic Studio World Generation Authority types.
 */

import type {
  GENERATION_CONTRACT_COVERAGE_LAYERS,
  GENERATION_MODES,
  LEGACY_SNAPSHOT_CLASSIFICATIONS,
  PROMPT_FRESHNESS_STATES,
  PUBLIC_AUTHORSHIP_FAILURE_STATES,
} from './constants.js';

export type GenerationMode = (typeof GENERATION_MODES)[number];
export type PromptFreshnessState = (typeof PROMPT_FRESHNESS_STATES)[number];
export type LegacySnapshotClassification = (typeof LEGACY_SNAPSHOT_CLASSIFICATIONS)[number];
export type GenerationContractCoverageLayer = (typeof GENERATION_CONTRACT_COVERAGE_LAYERS)[number];
export type PublicAuthorshipFailureState = (typeof PUBLIC_AUTHORSHIP_FAILURE_STATES)[number];

export type GenerationPromptSnapshot = {
  id: string;
  projectId: string;
  experimentId: string;
  experimentVersion: string;
  artifactId: string;
  artifactContractId: string;
  artifactContractVersion: string;
  artifactContractFingerprint: string;
  compilerVersion: string;
  methodologyVersions: string[];
  governanceVersions: string[];
  prompt: string;
  negativePrompt: string;
  provider: string;
  model: string;
  signatureLimeVersion: string;
  humanMadeMarksVersion: string;
  publicCopyVersion: string;
  authorshipVersion: string;
  labelQuarantineVersion: string;
  materialityVersion: string;
  typographyVersion: string;
  culturalImageVersion: string;
  characterRetentionVersion: string;
  founderRevisionIds: string[];
  compiledAt: string;
  compiledBy: 'SYSTEM' | 'FOUNDER';
  triggerSource: GenerationMode | 'INITIAL_FORMULATION' | 'FOUNDER_REVISION';
  supersedesPromptSnapshotId: string | null;
  generationAssetIds: string[];
  fingerprint: string;
  immutableAfterDispatch: true;
};

export type GenerationPromptFreshnessEvaluation = {
  evaluationId: string;
  artifactId: string;
  state: PromptFreshnessState;
  structuredContractFingerprint: string;
  snapshotContractFingerprint: string | null;
  compilerVersion: string | null;
  methodologyVersions: string[];
  reasons: string[];
  promptRecompileRequired: boolean;
  evaluatedAt: string;
};

export type GenerationContractCoverageEvaluation = {
  evaluationId: string;
  artifactId: string;
  layers: Record<GenerationContractCoverageLayer, boolean>;
  missingLayers: GenerationContractCoverageLayer[];
  passesGate: boolean;
  evaluatedAt: string;
};

export type PublicAuthorshipEvaluation = {
  evaluationId: string;
  artifactId: string;
  firstPersonPresence: boolean;
  personalReactionPresence: boolean;
  humanObservationPresence: boolean;
  analyticalDistance: 'LOW' | 'MEDIUM' | 'HIGH';
  thirdPersonBrandReference: boolean;
  internalMetadataLeakage: boolean;
  naturalLanguage: boolean;
  ndxCharacterRecognition: boolean;
  failureStates: PublicAuthorshipFailureState[];
  passes: boolean;
  evaluatedAt: string;
};

export type GeneratedAssetLineage = {
  assetId: string;
  url: string;
  promptSnapshotId: string;
  lineageClassification: LegacySnapshotClassification | 'CURRENT';
  assetGeneratedFromCurrentContract: boolean;
  assetIncludesC4A: boolean;
  assetIncludesC4B: boolean;
  assetIncludesC4B1?: boolean;
  assetIncludesC5: boolean;
  assetUsesCurrentPublicCopy: boolean;
  assetUsesCurrentAuthorship: boolean;
  assetUsesCurrentLabelQuarantine: boolean;
  createdAt: string;
};

export type GenerationAuthorityModel = {
  modelId: string;
  hierarchy: [
    'CURRENT_STRUCTURED_ARTIFACT_CONTRACT',
    'CURRENT_APPLICABLE_METHODOLOGY',
    'CURRENT_FOUNDER_REVISIONS',
    'CURRENT_GOVERNANCE',
    'COMPILE_NEW_PROMPT_SNAPSHOT',
    'GENERATE',
    'PRESERVE_SNAPSHOT_AS_RECEIPT',
  ];
  structuredContractIsCurrentAuthority: true;
  compiledPromptSnapshotIsImmutableReceipt: true;
  oldSnapshotNotPermanentAuthority: true;
};

export type CompileTimeAssertionResult = {
  assertion: string;
  passed: boolean;
  reason: string | null;
};

export type StructuredCreativeContract = {
  contractId: string;
  fingerprint: string;
  version: string;
};

export type CompiledGenerationPrompt = {
  prompt: string;
  negativePrompt: string;
  promptHash: string;
  snapshot: GenerationPromptSnapshot;
};
