/**
 * Client-safe V2.3 board readiness helpers (no node:crypto / generationAuthority imports).
 */

import type { Experiment01V23Artifact } from './types.js';
import type { GeneratedAssetLineage } from '../../site00-studio-world-production/generationAuthority/types.js';

function getSelectedAsset(artifact: Experiment01V23Artifact): GeneratedAssetLineage | null {
  const assets = artifact.generationAssets ?? [];
  if (artifact.selectedGenerationAssetId) {
    return assets.find((a) => a.assetId === artifact.selectedGenerationAssetId) ?? null;
  }
  if (assets.length) return assets[assets.length - 1]!;
  if (artifact.generatedAssetUrl && artifact.generatedAssetId) {
    const prompt = artifact.generationContract?.prompt ?? '';
    return {
      assetId: artifact.generatedAssetId,
      url: artifact.generatedAssetUrl,
      promptSnapshotId: artifact.dispatchedPromptSnapshotId ?? `legacy-${artifact.id}`,
      lineageClassification: 'LEGACY_UNKNOWN',
      assetGeneratedFromCurrentContract: !artifact.promptRecompileRequired,
      assetIncludesC4A: prompt.includes('HUMAN-MADE MARKS'),
      assetIncludesC4B: prompt.includes('SIGNATURE LIME REQUIREMENT'),
      assetIncludesC5: prompt.includes('PUBLIC AUTHORSHIP MODE'),
      assetUsesCurrentPublicCopy: prompt.includes('VISIBLE NDX HEADLINE'),
      assetUsesCurrentAuthorship: prompt.includes('FIRST-PERSON CHARACTER AUTHORSHIP'),
      assetUsesCurrentLabelQuarantine: prompt.includes('INTERNAL CONTRACT LABELS ARE NOT PUBLIC COPY'),
      createdAt: artifact.updatedAt,
    };
  }
  return null;
}

function selectedPassesCurrentLineage(artifact: Experiment01V23Artifact): boolean {
  const selected = getSelectedAsset(artifact);
  if (!selected) return false;
  return (
    selected.assetGeneratedFromCurrentContract &&
    selected.assetIncludesC4A &&
    selected.assetIncludesC4B &&
    selected.assetIncludesC5 &&
    selected.assetUsesCurrentPublicCopy &&
    selected.assetUsesCurrentAuthorship &&
    selected.assetUsesCurrentLabelQuarantine
  );
}

export function v23ArtifactHasSignatureLimeInPrompt(artifact: Experiment01V23Artifact): boolean {
  const prompt = artifact.dispatchedPromptSnapshotId
    ? artifact.promptSnapshots?.find((s) => s.id === artifact.dispatchedPromptSnapshotId)?.prompt
    : artifact.generationContract?.prompt;
  return Boolean(prompt?.includes('SIGNATURE LIME REQUIREMENT'));
}

export function v23ArtifactPromptFreshnessState(artifact: Experiment01V23Artifact): string {
  return artifact.promptFreshness?.state ?? 'LEGACY_UNKNOWN';
}

export function v23ArtifactGenerationReadiness(artifact: Experiment01V23Artifact): 'READY' | 'BLOCKED' | 'STALE' {
  if (artifact.promptFreshness?.promptRecompileRequired || artifact.promptRecompileRequired) return 'STALE';
  const selected = getSelectedAsset(artifact);
  if (selected && !selectedPassesCurrentLineage(artifact)) return 'STALE';
  return 'READY';
}

export function v23ArtifactMethodologyStatus(artifact: Experiment01V23Artifact): {
  c4a: boolean;
  c4b: boolean;
  c5: boolean;
} {
  const selected = getSelectedAsset(artifact);
  const prompt = artifact.generationContract?.prompt ?? '';
  return {
    c4a: selected?.assetIncludesC4A ?? prompt.includes('HUMAN-MADE MARKS'),
    c4b: selected?.assetIncludesC4B ?? prompt.includes('SIGNATURE LIME REQUIREMENT'),
    c5: selected?.assetIncludesC5 ?? prompt.includes('PUBLIC AUTHORSHIP MODE'),
  };
}

export function v23ArtifactIsLegacyGeneration(artifact: Experiment01V23Artifact): boolean {
  if (!artifact.generatedAssetUrl) return false;
  return !selectedPassesCurrentLineage(artifact);
}

export function v23BoardNeedsReformulation(artifacts: Experiment01V23Artifact[]): boolean {
  return artifacts.some((a) => a.promptRecompileRequired && !a.generatedAssetUrl);
}

export function v23BoardSignatureLimeReadyCount(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter(
    (a) =>
      getSelectedAsset(a)?.assetIncludesC4B &&
      Boolean(a.signatureLimeEvaluation?.passesSignatureLimeGate),
  ).length;
}

export function v23BoardCurrentLineageReadyCount(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter((a) => selectedPassesCurrentLineage(a)).length;
}
