/**
 * Client-safe V2.3 board readiness checks (no node:crypto).
 */

import type { Experiment01V23Artifact } from './types.js';

export function v23ArtifactHasSignatureLimeInPrompt(artifact: Experiment01V23Artifact): boolean {
  return Boolean(artifact.generationContract?.prompt?.includes('SIGNATURE LIME REQUIREMENT'));
}

export function v23ArtifactHasSignatureLimeContract(artifact: Experiment01V23Artifact): boolean {
  return Boolean(
    artifact.signatureLimeEvaluation?.accentSelection &&
      (v23ArtifactHasSignatureLimeInPrompt(artifact) ||
        artifact.signatureLimeEvaluation.passesSignatureLimeGate),
  );
}

export function v23BoardNeedsReformulation(artifacts: Experiment01V23Artifact[]): boolean {
  if (!artifacts.length) return false;
  return artifacts.some((a) => !v23ArtifactHasSignatureLimeContract(a));
}

export function v23BoardSignatureLimeReadyCount(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter((a) => v23ArtifactHasSignatureLimeContract(a)).length;
}
