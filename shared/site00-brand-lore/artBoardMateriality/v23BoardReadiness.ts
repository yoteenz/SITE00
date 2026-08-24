/**
 * P0.5C.5A — V2.3 board readiness — evaluates CURRENT generation lineage, not substring-only.
 */

import type { Experiment01V23Artifact } from './types.js';
import {
  auditV23ArtifactLineage,
  getSelectedV23GenerationAsset,
  migrateV23ArtifactGenerationLineage,
  selectedAssetPassesCurrentLineage,
} from './v23GenerationAuthority.js';

export function v23ArtifactHasSignatureLimeInPrompt(artifact: Experiment01V23Artifact): boolean {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  const prompt = migrated.dispatchedPromptSnapshotId
    ? migrated.promptSnapshots?.find((s) => s.id === migrated.dispatchedPromptSnapshotId)?.prompt
    : migrated.generationContract?.prompt;
  return Boolean(prompt?.includes('SIGNATURE LIME REQUIREMENT'));
}

export function v23ArtifactHasSignatureLimeContract(artifact: Experiment01V23Artifact): boolean {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  const selected = getSelectedV23GenerationAsset(migrated);
  if (selected) {
    return selected.assetIncludesC4B && Boolean(migrated.signatureLimeEvaluation?.passesSignatureLimeGate);
  }
  return Boolean(
    migrated.signatureLimeEvaluation?.accentSelection &&
      (v23ArtifactHasSignatureLimeInPrompt(migrated) ||
        migrated.signatureLimeEvaluation.passesSignatureLimeGate),
  );
}

export function v23ArtifactPromptFreshnessState(artifact: Experiment01V23Artifact): string {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  return migrated.promptFreshness?.state ?? 'LEGACY_UNKNOWN';
}

export function v23ArtifactGenerationReadiness(artifact: Experiment01V23Artifact): 'READY' | 'BLOCKED' | 'STALE' {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  if (migrated.promptFreshness?.promptRecompileRequired) return 'STALE';
  const selected = getSelectedV23GenerationAsset(migrated);
  if (selected && !selectedAssetPassesCurrentLineage(migrated)) return 'STALE';
  return 'READY';
}

export function v23ArtifactMethodologyStatus(artifact: Experiment01V23Artifact): {
  c4a: boolean;
  c4b: boolean;
  c5: boolean;
} {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  const selected = getSelectedV23GenerationAsset(migrated);
  const prompt = migrated.generationContract?.prompt ?? '';
  return {
    c4a: selected?.assetIncludesC4A ?? prompt.includes('HUMAN-MADE MARKS'),
    c4b: selected?.assetIncludesC4B ?? prompt.includes('SIGNATURE LIME REQUIREMENT'),
    c5: selected?.assetIncludesC5 ?? prompt.includes('PUBLIC AUTHORSHIP MODE'),
  };
}

export function v23ArtifactIsLegacyGeneration(artifact: Experiment01V23Artifact): boolean {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  if (!migrated.generatedAssetUrl) return false;
  return !selectedAssetPassesCurrentLineage(migrated);
}

export function v23BoardNeedsReformulation(artifacts: Experiment01V23Artifact[]): boolean {
  if (!artifacts.length) return false;
  const migrated = artifacts.map(migrateV23ArtifactGenerationLineage);
  return migrated.some((a) => a.promptFreshness?.promptRecompileRequired && !a.generatedAssetUrl);
}

export function v23BoardSignatureLimeReadyCount(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter((a) => v23ArtifactHasSignatureLimeContract(a)).length;
}

export function v23BoardCurrentLineageReadyCount(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter((a) => selectedAssetPassesCurrentLineage(migrateV23ArtifactGenerationLineage(a))).length;
}

export function v23BoardReadinessSummary(artifacts: Experiment01V23Artifact[]) {
  const migrated = artifacts.map(migrateV23ArtifactGenerationLineage);
  return migrated.map((a) => ({
    artifactId: a.id,
    ...auditV23ArtifactLineage(a),
    readiness: v23ArtifactGenerationReadiness(a),
    methodology: v23ArtifactMethodologyStatus(a),
    legacyGeneration: v23ArtifactIsLegacyGeneration(a),
  }));
}
