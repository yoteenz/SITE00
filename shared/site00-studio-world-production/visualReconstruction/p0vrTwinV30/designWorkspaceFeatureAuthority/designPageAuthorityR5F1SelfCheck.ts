import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureManifestV1.js';
import { buildFeatureCoverageReceipt } from './featureCoverageReceipt.js';

export type DesignPageAuthorityR5F1SelfCheck = {
  pass: boolean;
  failures: string[];
  manifestVersion: string;
  featureCoverageSample: ReturnType<typeof buildFeatureCoverageReceipt>;
};

export function runDesignPageAuthorityR5F1SelfCheck(input: {
  promptOrArtifactText: string;
  territoryPrompts?: Record<string, string>;
}): DesignPageAuthorityR5F1SelfCheck {
  const manifest = loadActiveDesignWorkspaceFeatureManifest();
  const combined =
    input.territoryPrompts ?
      Object.values(input.territoryPrompts).join('\n')
    : input.promptOrArtifactText;
  const receipt = buildFeatureCoverageReceipt({
    authorityCandidateId: 'self-check-combined',
    promptOrArtifactText: combined,
    manifestVersion: manifest.version,
  });
  const failures: string[] = [];
  if (receipt.missingFeatureIds.length) {
    failures.push(`missing:${receipt.missingFeatureIds.slice(0, 5).join(',')}`);
  }
  if (receipt.unapprovedFeatureIdsPresent.length) {
    failures.push('UNAPPROVED_FEATURE_INTRODUCED');
  }
  if (receipt.removedFeatureIdsPresent.length) {
    failures.push('REMOVED_FEATURE_STILL_PRESENT');
  }
  if (!combined.includes(manifest.version)) {
    failures.push('FEATURE_MANIFEST_VERSION_STALE');
  }
  return {
    pass: failures.length === 0 && receipt.result === 'PASS',
    failures,
    manifestVersion: manifest.version,
    featureCoverageSample: receipt,
  };
}
