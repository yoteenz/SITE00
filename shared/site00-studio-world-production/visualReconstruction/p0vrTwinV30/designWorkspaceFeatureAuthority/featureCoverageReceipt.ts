import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureManifestV1.js';
import { FEATURE_PROMPT_MARKERS, REMOVED_FEATURE_FORBIDDEN_MARKERS, UNAPPROVED_FEATURE_MARKERS } from './featurePromptMarkers.js';
import type { FeatureCoverageReceipt } from './types.js';

export function buildFeatureCoverageReceipt(input: {
  authorityCandidateId: string;
  promptOrArtifactText: string;
  manifestVersion?: string;
  now?: string;
}): FeatureCoverageReceipt {
  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  const version = input.manifestVersion ?? manifest.version;
  const text = input.promptOrArtifactText.toUpperCase();
  const required = manifest.requiredFeatureIds;
  const missingFeatureIds: string[] = [];
  const deprecatedFeatureIdsPresent: string[] = [];
  const removedFeatureIdsPresent: string[] = [];
  const unapprovedFeatureIdsPresent: string[] = [];
  const ambiguousFeatureBindings: string[] = [];

  for (const featureId of required) {
    const markers = FEATURE_PROMPT_MARKERS[featureId] ?? [featureId.replace(/_/g, ' ').toUpperCase()];
    const hit = markers.some((m) => text.includes(m.toUpperCase()));
    if (!hit) missingFeatureIds.push(featureId);
  }

  for (const removedId of manifest.removedFeatureIds) {
    const forbidden = REMOVED_FEATURE_FORBIDDEN_MARKERS[removedId] ?? [removedId.replace(/_/g, ' ').toUpperCase()];
    if (forbidden.some((m) => text.includes(m.toUpperCase()))) {
      removedFeatureIdsPresent.push(removedId);
    }
  }

  for (const marker of UNAPPROVED_FEATURE_MARKERS) {
    if (text.includes(marker.toUpperCase())) {
      unapprovedFeatureIdsPresent.push(marker);
    }
  }

  const representedFeatureCount = required.length - missingFeatureIds.length;
  const requiredFeatureCount = required.length;
  const coveragePercent =
    requiredFeatureCount === 0 ? 100 : Math.round((representedFeatureCount / requiredFeatureCount) * 100);

  const result: FeatureCoverageReceipt['result'] =
    missingFeatureIds.length === 0 &&
    removedFeatureIdsPresent.length === 0 &&
    unapprovedFeatureIdsPresent.length === 0 ?
      'PASS'
    : 'FAIL';

  return {
    authorityCandidateId: input.authorityCandidateId,
    manifestVersion: version,
    requiredFeatureCount,
    representedFeatureCount,
    missingFeatureIds,
    deprecatedFeatureIdsPresent,
    removedFeatureIdsPresent,
    unapprovedFeatureIdsPresent,
    ambiguousFeatureBindings,
    coveragePercent,
    result,
    generatedAt: input.now ?? new Date().toISOString(),
  };
}
