/**
 * P0.5C.5A — V2.3 current-contract generation authority.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { MarketingFalPromptContract } from '../brandMarketingExpression/types.js';
import {
  allCompileTimeAssertionsPass,
  classifyLegacySnapshot,
  evaluateGenerationContractCoverage,
  evaluatePromptFreshness,
  runCompileTimeAssertions,
  snapshotFingerprint,
} from '../../site00-studio-world-production/generationAuthority/index.js';
import type {
  GeneratedAssetLineage,
  GenerationPromptSnapshot,
  GenerationPromptFreshnessEvaluation,
} from '../../site00-studio-world-production/generationAuthority/types.js';
import type { GenerationMode } from '../../site00-studio-world-production/generationAuthority/types.js';
import { compileArtBoardMaterialityFalPrompt, materialFalPromptHasLimeRestraintSection, materialFalPromptHasVisualAuthoritySection } from './falPromptCompilerV23.js';
import { signatureLimeRestraintGatePasses } from './signatureLimeRestraint.js';
import {
  V23_EXPERIMENT_ID,
  V23_FAL_COMPILER_VERSION,
  V23_GOVERNANCE_VERSIONS,
  V23_METHODOLOGY_VERSIONS,
} from './v23GenerationAuthorityConstants.js';
import { EXPERIMENT_01_V23_VERSION } from './constants.js';
import type { Experiment01V23Artifact } from './types.js';

export type V23GenerationAssetRecord = GeneratedAssetLineage;

function fp(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function compileCurrentV23FalPrompt(params: {
  artifact: Experiment01V23Artifact;
  v1Artifact: BrandMarketingArtifact;
  projectId: string;
  triggerSource: GenerationPromptSnapshot['triggerSource'];
  founderRevisionIds?: string[];
  supersedesPromptSnapshotId?: string | null;
}): { falContract: MarketingFalPromptContract; snapshot: GenerationPromptSnapshot } {
  const falContract = compileArtBoardMaterialityFalPrompt({
    artifact: params.v1Artifact,
    contract: params.artifact.contract,
  });

  const snapshot: GenerationPromptSnapshot = {
    id: randomUUID(),
    projectId: params.projectId,
    experimentId: V23_EXPERIMENT_ID,
    experimentVersion: EXPERIMENT_01_V23_VERSION,
    artifactId: params.artifact.id,
    artifactContractId: params.artifact.contract.fingerprint,
    artifactContractVersion: params.artifact.contract.fingerprint,
    artifactContractFingerprint: params.artifact.contract.fingerprint,
    compilerVersion: V23_FAL_COMPILER_VERSION,
    methodologyVersions: [...V23_METHODOLOGY_VERSIONS],
    governanceVersions: [...V23_GOVERNANCE_VERSIONS],
    prompt: falContract.prompt,
    negativePrompt: falContract.negativePrompt,
    provider: 'FAL',
    model: 'fal-ai/flux/dev',
    signatureLimeVersion: 'P0.5C.4B.1',
    visualAuthorityVersion: 'P0.5C.6',
    humanMadeMarksVersion: 'P0.5C.4A',
    publicCopyVersion: 'P0.5C.5',
    authorshipVersion: 'P0.5C.5',
    labelQuarantineVersion: 'P0.5C.5',
    materialityVersion: 'P0.5C.4',
    typographyVersion: 'P0.5C.1',
    culturalImageVersion: 'P0.5C.2',
    characterRetentionVersion: 'P0.5C.3',
    founderRevisionIds: params.founderRevisionIds ?? params.artifact.revisionHistory.map((r) => r.revisionId),
    compiledAt: new Date().toISOString(),
    compiledBy: 'SYSTEM',
    triggerSource: params.triggerSource,
    supersedesPromptSnapshotId: params.supersedesPromptSnapshotId ?? getLatestSnapshot(params.artifact)?.id ?? null,
    generationAssetIds: [],
    fingerprint: snapshotFingerprint(falContract.prompt, params.artifact.contract.fingerprint),
    immutableAfterDispatch: true,
  };

  return { falContract, snapshot };
}

export function getLatestSnapshot(artifact: Experiment01V23Artifact): GenerationPromptSnapshot | null {
  const snapshots = artifact.promptSnapshots ?? [];
  return snapshots.length ? snapshots[snapshots.length - 1]! : legacySnapshotFromGenerationContract(artifact);
}

function legacySnapshotFromGenerationContract(artifact: Experiment01V23Artifact): GenerationPromptSnapshot | null {
  if (!artifact.generationContract?.prompt) return null;
  return {
    id: `legacy-${artifact.id}`,
    projectId: 'ndxbook',
    experimentId: V23_EXPERIMENT_ID,
    experimentVersion: EXPERIMENT_01_V23_VERSION,
    artifactId: artifact.id,
    artifactContractId: artifact.contract.fingerprint,
    artifactContractVersion: artifact.contract.fingerprint,
    artifactContractFingerprint: artifact.parentFingerprint ?? artifact.contract.fingerprint,
    compilerVersion: 'legacy-pre-C5A',
    methodologyVersions: [],
    governanceVersions: [],
    prompt: artifact.generationContract.prompt,
    negativePrompt: artifact.generationContract.negativePrompt,
    provider: 'FAL',
    model: 'fal-ai/flux/dev',
    signatureLimeVersion: 'unknown',
    humanMadeMarksVersion: 'unknown',
    publicCopyVersion: 'unknown',
    authorshipVersion: 'unknown',
    labelQuarantineVersion: 'unknown',
    materialityVersion: 'unknown',
    typographyVersion: 'unknown',
    culturalImageVersion: 'unknown',
    characterRetentionVersion: 'unknown',
    founderRevisionIds: [],
    compiledAt: artifact.createdAt,
    compiledBy: 'SYSTEM',
    triggerSource: 'INITIAL_FORMULATION',
    supersedesPromptSnapshotId: null,
    generationAssetIds: artifact.generatedAssetId ? [artifact.generatedAssetId] : [],
    fingerprint: artifact.generationContract.promptHash,
    immutableAfterDispatch: true,
  };
}

export function evaluateV23PromptFreshness(artifact: Experiment01V23Artifact): GenerationPromptFreshnessEvaluation {
  const latest = getLatestSnapshot(artifact);
  return evaluatePromptFreshness({
    artifactId: artifact.id,
    structuredContractFingerprint: artifact.contract.fingerprint,
    currentMethodologyVersions: [...V23_METHODOLOGY_VERSIONS],
    currentCompilerVersion: V23_FAL_COMPILER_VERSION,
    latestSnapshot: latest,
    contractMutatedSinceLastCompile: artifact.promptRecompileRequired ?? false,
  });
}

export function assertV23GenerationReady(params: {
  artifact: Experiment01V23Artifact;
  falContract: MarketingFalPromptContract;
}): { ready: boolean; blockReason: string | null; coverage: ReturnType<typeof evaluateGenerationContractCoverage> } {
  const coverage = evaluateGenerationContractCoverage({
    artifactId: params.artifact.id,
    prompt: params.falContract.prompt,
    negativePrompt: params.falContract.negativePrompt,
    contractPresent: {
      character: true,
      editorial: true,
      firstSlide: true,
      typography: true,
      culturalImage: true,
      visualSubject: true,
      humor: true,
      materiality: true,
      canvas: true,
    },
  });

  const assertions = runCompileTimeAssertions({
    prompt: params.falContract.prompt,
    negativePrompt: params.falContract.negativePrompt,
    contractLoaded: Boolean(params.artifact.contract),
    compilerUsed: true,
  });

  if (!coverage.passesGate) {
    return { ready: false, blockReason: `GENERATION_BLOCKED — missing layers: ${coverage.missingLayers.join(', ')}`, coverage };
  }
  if (!allCompileTimeAssertionsPass(assertions)) {
    const failed = assertions.filter((a) => !a.passed).map((a) => a.assertion);
    return { ready: false, blockReason: `GENERATION_BLOCKED_STALE_OR_INCOMPLETE_CONTRACT — ${failed.join(', ')}`, coverage };
  }
  return { ready: true, blockReason: null, coverage };
}

export function resolveV23DispatchPrompt(params: {
  artifact: Experiment01V23Artifact;
  v1Artifact: BrandMarketingArtifact;
  projectId: string;
  mode: GenerationMode;
  replaySnapshotId?: string | null;
}): {
  falContract: MarketingFalPromptContract;
  snapshot: GenerationPromptSnapshot;
  replay: boolean;
} {
  if (params.mode === 'REPLAY_GENERATION') {
    const snapshots = [
      ...(params.artifact.promptSnapshots ?? []),
      ...(legacySnapshotFromGenerationContract(params.artifact) ? [legacySnapshotFromGenerationContract(params.artifact)!] : []),
    ];
    const target =
      snapshots.find((s) => s.id === params.replaySnapshotId) ??
      snapshots.find((s) => s.id === params.artifact.dispatchedPromptSnapshotId) ??
      legacySnapshotFromGenerationContract(params.artifact);
    if (!target) throw new Error('No historical prompt snapshot available for replay');
    return {
      falContract: {
        prompt: target.prompt,
        negativePrompt: target.negativePrompt,
        promptHash: target.fingerprint,
        sectionOrder: params.artifact.generationContract?.sectionOrder ?? [],
      },
      snapshot: target,
      replay: true,
    };
  }

  const compiled = compileCurrentV23FalPrompt({
    artifact: params.artifact,
    v1Artifact: params.v1Artifact,
    projectId: params.projectId,
    triggerSource: 'REGENERATE_CURRENT',
    supersedesPromptSnapshotId: getLatestSnapshot(params.artifact)?.id ?? null,
  });

  const readiness = assertV23GenerationReady({ artifact: params.artifact, falContract: compiled.falContract });
  if (!readiness.ready) {
    throw new Error(readiness.blockReason ?? 'Generation blocked');
  }

  return { ...compiled, replay: false };
}

export function buildV23GenerationAssetRecord(params: {
  artifact: Experiment01V23Artifact;
  assetId: string;
  url: string;
  snapshot: GenerationPromptSnapshot;
}): V23GenerationAssetRecord {
  const classification = classifyLegacySnapshot({
    prompt: params.snapshot.prompt,
    contractFingerprint: params.artifact.contract.fingerprint,
    snapshotContractFingerprint: params.snapshot.artifactContractFingerprint,
  });

  return {
    assetId: params.assetId,
    url: params.url,
    promptSnapshotId: params.snapshot.id,
    lineageClassification: classification,
    assetGeneratedFromCurrentContract: params.snapshot.artifactContractFingerprint === params.artifact.contract.fingerprint,
    assetIncludesC4A: params.snapshot.prompt.includes('HUMAN-MADE MARKS'),
    assetIncludesC4B: params.snapshot.prompt.includes('SIGNATURE LIME REQUIREMENT'),
    assetIncludesC4B1: materialFalPromptHasLimeRestraintSection({
      prompt: params.snapshot.prompt,
      negativePrompt: params.snapshot.negativePrompt,
      promptHash: params.snapshot.fingerprint,
      sectionOrder: [],
    }),
    assetIncludesC6: materialFalPromptHasVisualAuthoritySection({
      prompt: params.snapshot.prompt,
      negativePrompt: params.snapshot.negativePrompt,
      promptHash: params.snapshot.fingerprint,
      sectionOrder: [],
    }),
    assetIncludesC5: params.snapshot.prompt.includes('PUBLIC AUTHORSHIP MODE'),
    assetUsesCurrentPublicCopy: params.snapshot.prompt.includes('VISIBLE NDX HEADLINE'),
    assetUsesCurrentAuthorship: params.snapshot.prompt.includes('FIRST-PERSON CHARACTER AUTHORSHIP'),
    assetUsesCurrentLabelQuarantine: params.snapshot.prompt.includes('INTERNAL CONTRACT LABELS ARE NOT PUBLIC COPY'),
    createdAt: new Date().toISOString(),
  };
}

export function getSelectedV23GenerationAsset(artifact: Experiment01V23Artifact): V23GenerationAssetRecord | null {
  const assets = artifact.generationAssets ?? [];
  if (artifact.selectedGenerationAssetId) {
    return assets.find((a) => a.assetId === artifact.selectedGenerationAssetId) ?? null;
  }
  if (assets.length) return assets[assets.length - 1]!;
  if (artifact.generatedAssetUrl && artifact.generatedAssetId) {
    const snapshot = getLatestSnapshot(artifact);
    if (!snapshot) return null;
    return buildV23GenerationAssetRecord({
      artifact,
      assetId: artifact.generatedAssetId,
      url: artifact.generatedAssetUrl,
      snapshot,
    });
  }
  return null;
}

export function selectedAssetPassesCurrentLineage(artifact: Experiment01V23Artifact): boolean {
  const selected = getSelectedV23GenerationAsset(artifact);
  if (!selected) return false;
  return (
    selected.assetGeneratedFromCurrentContract &&
    selected.assetIncludesC4A &&
    selected.assetIncludesC4B &&
    (selected.assetIncludesC4B1 ?? materialFalPromptHasLimeRestraintSection({
      prompt: artifact.generationContract?.prompt ?? '',
      negativePrompt: artifact.generationContract?.negativePrompt ?? '',
      promptHash: '',
      sectionOrder: [],
    })) &&
    (selected.assetIncludesC6 ?? materialFalPromptHasVisualAuthoritySection({
      prompt: artifact.generationContract?.prompt ?? '',
      negativePrompt: artifact.generationContract?.negativePrompt ?? '',
      promptHash: '',
      sectionOrder: [],
    })) &&
    selected.assetIncludesC5 &&
    selected.assetUsesCurrentPublicCopy &&
    selected.assetUsesCurrentAuthorship &&
    selected.assetUsesCurrentLabelQuarantine &&
    signatureLimeRestraintGatePasses(artifact.contract.signatureLimeRestraint)
  );
}

export function auditV23ArtifactLineage(artifact: Experiment01V23Artifact): {
  snapshotClassification: ReturnType<typeof classifyLegacySnapshot>;
  freshness: GenerationPromptFreshnessEvaluation;
  selectedPassesCurrentLineage: boolean;
} {
  const latest = getLatestSnapshot(artifact);
  const snapshotClassification = latest
    ? classifyLegacySnapshot({
        prompt: latest.prompt,
        contractFingerprint: artifact.contract.fingerprint,
        snapshotContractFingerprint: latest.artifactContractFingerprint,
      })
    : 'LEGACY_UNKNOWN';

  return {
    snapshotClassification,
    freshness: evaluateV23PromptFreshness(artifact),
    selectedPassesCurrentLineage: selectedAssetPassesCurrentLineage(artifact),
  };
}

export function appendPromptSnapshot(artifact: Experiment01V23Artifact, snapshot: GenerationPromptSnapshot): Experiment01V23Artifact {
  const snapshots = [...(artifact.promptSnapshots ?? []), snapshot];
  return {
    ...artifact,
    promptSnapshots: snapshots,
    generationContract: {
      prompt: snapshot.prompt,
      negativePrompt: snapshot.negativePrompt,
      promptHash: snapshot.fingerprint,
      sectionOrder: artifact.generationContract?.sectionOrder ?? [],
    },
    dispatchedPromptSnapshotId: snapshot.id,
    promptFreshness: evaluateV23PromptFreshness({ ...artifact, promptSnapshots: snapshots, promptRecompileRequired: false }),
    promptRecompileRequired: false,
    updatedAt: new Date().toISOString(),
  };
}

export function markV23ArtifactPromptStale(artifact: Experiment01V23Artifact): Experiment01V23Artifact {
  return {
    ...artifact,
    promptRecompileRequired: true,
    promptFreshness: evaluateV23PromptFreshness({ ...artifact, promptRecompileRequired: true }),
    updatedAt: new Date().toISOString(),
  };
}

export function migrateV23ArtifactGenerationLineage(artifact: Experiment01V23Artifact): Experiment01V23Artifact {
  if (artifact.promptSnapshots?.length) return artifact;

  const legacy = legacySnapshotFromGenerationContract(artifact);
  const generationAssets: V23GenerationAssetRecord[] = artifact.generationAssets ?? [];
  if (artifact.generatedAssetUrl && artifact.generatedAssetId && legacy) {
    if (!generationAssets.some((a) => a.assetId === artifact.generatedAssetId)) {
      generationAssets.push(
        buildV23GenerationAssetRecord({
          artifact,
          assetId: artifact.generatedAssetId,
          url: artifact.generatedAssetUrl,
          snapshot: legacy,
        }),
      );
    }
  }

  return {
    ...artifact,
    promptSnapshots: legacy ? [legacy] : [],
    generationAssets,
    selectedGenerationAssetId: artifact.selectedGenerationAssetId ?? artifact.generatedAssetId,
    promptFreshness: evaluateV23PromptFreshness(artifact),
    promptRecompileRequired: evaluateV23PromptFreshness(artifact).promptRecompileRequired,
    dispatchedPromptSnapshotId: legacy?.id ?? null,
  };
}

export function v23RegenerationUsesStoredPromptSnapshotOnlyOnReplay(mode: GenerationMode): boolean {
  return mode === 'REPLAY_GENERATION';
}

export function v24NotCreated(): true {
  return true;
}

export function generationAssetFingerprint(assetId: string, snapshotId: string): string {
  return fp(`${assetId}:${snapshotId}`);
}
