/**
 * P0.VR.DIAG.1 — Forensic report + spec versioning.
 */

import type { ForensicsVersion, ForensicsVersionStatus, MeasuredReconstructionSpec } from './types.js';

const versions = new Map<string, ForensicsVersion>();

export function recordForensicsVersion(input: {
  authorityVersionId: string | null;
  captureId: string;
  reportId: string;
  specId: string;
}): ForensicsVersion {
  const version: ForensicsVersion = {
    versionId: `forensics_v_${Date.now()}`,
    authorityVersionId: input.authorityVersionId,
    captureId: input.captureId,
    reportId: input.reportId,
    specId: input.specId,
    createdAt: new Date().toISOString(),
    status: 'CURRENT',
  };
  for (const [id, existing] of versions) {
    if (existing.captureId === input.captureId && existing.status === 'CURRENT') {
      versions.set(id, { ...existing, status: 'SUPERSEDED' });
    }
  }
  versions.set(version.versionId, version);
  return version;
}

export function markForensicsStale(versionId: string, _reason: 'AUTHORITY_CHANGED' | 'CAPTURE_CHANGED'): ForensicsVersion | null {
  const existing = versions.get(versionId);
  if (!existing) return null;
  const updated = { ...existing, status: 'STALE' as ForensicsVersionStatus };
  versions.set(versionId, updated);
  return updated;
}

export function markMeasuredSpecStale(spec: MeasuredReconstructionSpec): MeasuredReconstructionSpec {
  return { ...spec, status: 'STALE' };
}

export function resetForensicsVersionsForTest(): void {
  versions.clear();
}
