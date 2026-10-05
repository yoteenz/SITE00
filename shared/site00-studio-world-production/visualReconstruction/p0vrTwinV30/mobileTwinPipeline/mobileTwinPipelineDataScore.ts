import type { MobileTwinPipelineState } from './types.js';

/** Higher = more founder work preserved — used to block regressive LS writes. */
export function mobileTwinPipelineDataScore(pipeline: MobileTwinPipelineState): number {
  const approvedPackages = pipeline.packages.filter((p) => p.status === 'APPROVED').length;
  const falRenders = pipeline.renders.filter(
    (r) => r.renderImageUri && (r.provider === 'FAL' || /fal\.media|vitest-fal:/i.test(r.renderImageUri)),
  ).length;
  const blueprintReady = pipeline.blueprintTwins.filter((b) => b.twinImageUri).length;
  return (
    (pipeline.falJobsDispatched ?? 0) * 1000 +
    pipeline.packages.length * 500 +
    approvedPackages * 5000 +
    falRenders * 50 +
    blueprintReady * 40 +
    pipeline.renders.length * 10 +
    pipeline.compositionStates.length * 5
  );
}
