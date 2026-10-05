/**
 * P0.DEPLOY.1 — Release manifest builder.
 */

import type { ReleaseManifest } from './types.js';
import { buildReleaseId, defaultReleaseVersion } from './releaseId.js';

export function buildReleaseManifest(options: {
  commitSha: string;
  version?: string;
  bundleEntry?: string | null;
  builtAt?: string;
}): ReleaseManifest {
  const version = options.version ?? defaultReleaseVersion();
  const commitSha = options.commitSha;
  return {
    releaseId: buildReleaseId(version, commitSha),
    version,
    commitSha,
    frontendBuild: version,
    apiBuild: version,
    workerBuild: version,
    builtAt: options.builtAt ?? new Date().toISOString(),
    bundleEntry: options.bundleEntry ?? null,
  };
}

export function parseReleaseManifest(raw: unknown): ReleaseManifest | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.releaseId !== 'string' || typeof o.version !== 'string') return null;
  return {
    releaseId: o.releaseId,
    version: o.version,
    commitSha: String(o.commitSha ?? ''),
    frontendBuild: String(o.frontendBuild ?? o.version),
    apiBuild: String(o.apiBuild ?? o.version),
    workerBuild: String(o.workerBuild ?? o.version),
    builtAt: String(o.builtAt ?? ''),
    bundleEntry: typeof o.bundleEntry === 'string' ? o.bundleEntry : null,
  };
}
