import { readDesignPageAuthoritySession } from '../p0vrTwinV30/designPageAuthorityPersistence.js';
import { readMobileTwinPipelineFromBrowser } from '../p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import type { MobileTwinPipelineState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';

/** Richest pipeline on this device (design session LS + dedicated mobile-twin LS). */
export function readMobileTwinPipelineForLocalCompile(projectId: string): MobileTwinPipelineState | null {
  const key = projectId.toLowerCase();
  const session = readDesignPageAuthoritySession(key);
  const fromSession = session?.mobileTwinPipeline ?? null;
  const fromDedicated = readMobileTwinPipelineFromBrowser(key);
  if (!fromSession) return fromDedicated;
  if (!fromDedicated) return fromSession;
  const sessionPkgs = fromSession.packages.length;
  const dedicatedPkgs = fromDedicated.packages.length;
  if (dedicatedPkgs > sessionPkgs) return fromDedicated;
  if (sessionPkgs > dedicatedPkgs) return fromSession;
  const sessionArts = Object.keys(fromSession.artifactsById ?? {}).length;
  const dedicatedArts = Object.keys(fromDedicated.artifactsById ?? {}).length;
  return dedicatedArts >= sessionArts ? fromDedicated : fromSession;
}

/** Local compile only needs an APPROVED package + structured artifacts — not full founder confirmation slice. */
export function resolveApprovedPackageIdForLocalCompile(pipeline: MobileTwinPipelineState): string | null {
  if (pipeline.latestPackageId) {
    const latest = pipeline.packages.find((p) => p.id === pipeline.latestPackageId);
    if (latest?.status === 'APPROVED') return latest.id;
  }
  const any = pipeline.packages.find((p) => p.status === 'APPROVED');
  return any?.id ?? null;
}

export function resolveLocalMobileTwinCompileInput(projectId: string): {
  pipeline: MobileTwinPipelineState;
  packageId: string;
} | null {
  const pipeline = readMobileTwinPipelineForLocalCompile(projectId);
  if (!pipeline) return null;
  const packageId = resolveApprovedPackageIdForLocalCompile(pipeline);
  if (!packageId) return null;
  return { pipeline, packageId };
}
