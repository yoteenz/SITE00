/**
 * P0.DEPLOY.1 — Frontend / backend release compatibility gate.
 */

import type { BackendHealthReceipt, FrontendHealthReceipt, ReleaseManifest } from './types.js';

export type ReleaseCompatibilityResult = {
  compatible: boolean;
  status: 'COMPATIBLE' | 'VERSION_MISMATCH' | 'UNKNOWN';
  frontendVersion: string | null;
  apiVersion: string | null;
  workerVersion: string | null;
  releaseIdMatch: boolean;
  messages: string[];
};

/** Backend-only gate when frontend has not been promoted yet (verify_backend job). */
export function checkBackendOnlyCompatibility(
  backend: BackendHealthReceipt | null,
  expectedVersion: string | null,
): ReleaseCompatibilityResult {
  const apiVersion = backend?.apiBuild ?? null;
  const workerVersion = backend?.workerBuild ?? null;

  if (!apiVersion || !workerVersion) {
    return {
      compatible: false,
      status: 'UNKNOWN',
      frontendVersion: null,
      apiVersion,
      workerVersion,
      releaseIdMatch: false,
      messages: ['Missing backend version receipt (apiBuild/workerBuild)'],
    };
  }

  if (expectedVersion && (apiVersion !== expectedVersion || workerVersion !== expectedVersion)) {
    return {
      compatible: false,
      status: 'VERSION_MISMATCH',
      frontendVersion: null,
      apiVersion,
      workerVersion,
      releaseIdMatch: false,
      messages: [`Backend version mismatch: api=${apiVersion} worker=${workerVersion} expected ${expectedVersion}`],
    };
  }

  return {
    compatible: true,
    status: 'COMPATIBLE',
    frontendVersion: null,
    apiVersion,
    workerVersion,
    releaseIdMatch: true,
    messages: [],
  };
}

export function checkReleaseCompatibility(
  manifest: ReleaseManifest | null,
  backend: BackendHealthReceipt | null,
  frontend: FrontendHealthReceipt | null,
): ReleaseCompatibilityResult {
  const messages: string[] = [];
  const frontendVersion = frontend?.version ?? manifest?.frontendBuild ?? null;
  const apiVersion = backend?.apiBuild ?? manifest?.apiBuild ?? null;
  const workerVersion = backend?.workerBuild ?? manifest?.workerBuild ?? null;

  if (!frontendVersion || !apiVersion || !workerVersion) {
    return {
      compatible: false,
      status: 'UNKNOWN',
      frontendVersion,
      apiVersion,
      workerVersion,
      releaseIdMatch: false,
      messages: ['Missing version receipt from frontend or backend'],
    };
  }

  const versionsMatch = frontendVersion === apiVersion && apiVersion === workerVersion;
  const releaseIdMatch =
    Boolean(manifest?.releaseId) &&
    (backend?.releaseId === manifest?.releaseId || frontend?.releaseId === manifest?.releaseId);

  if (!versionsMatch) {
    messages.push(`Version mismatch: frontend=${frontendVersion} api=${apiVersion} worker=${workerVersion}`);
  }
  if (manifest?.releaseId && backend?.releaseId && backend.releaseId !== manifest.releaseId) {
    messages.push(`ReleaseId mismatch: expected ${manifest.releaseId}, backend ${backend.releaseId}`);
  }

  const compatible = versionsMatch && (releaseIdMatch || !manifest?.releaseId);

  return {
    compatible,
    status: compatible ? 'COMPATIBLE' : versionsMatch ? 'UNKNOWN' : 'VERSION_MISMATCH',
    frontendVersion,
    apiVersion,
    workerVersion,
    releaseIdMatch,
    messages,
  };
}
