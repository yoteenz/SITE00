/**
 * P0.VR.8R3R1 — Server-side build version receipt (API / worker).
 */

import { execSync } from 'node:child_process';
import { P0_VR_8R3R1_BUILD } from './constants.js';

export { P0_VR_8R3R1_BUILD } from './constants.js';

export type BuildVersionReceipt = {
  frontendBuild: string;
  apiBuild: string;
  workerBuild: string;
  gitSha: string | null;
  contractVersion: string;
  routeManifestVersion?: string | null;
  pageInventoryVersion?: string | null;
};

export function buildCaptureVersionReceipt(
  frontendBuild = P0_VR_8R3R1_BUILD,
  options?: { routeManifestVersion?: string | null; pageInventoryVersion?: string | null },
): BuildVersionReceipt {
  let gitSha: string | null = process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null;
  if (!gitSha) {
    try {
      gitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
      gitSha = null;
    }
  }

  return {
    frontendBuild,
    apiBuild: P0_VR_8R3R1_BUILD,
    workerBuild: P0_VR_8R3R1_BUILD,
    gitSha,
    contractVersion: 'capture-run-v1',
    routeManifestVersion: options?.routeManifestVersion ?? null,
    pageInventoryVersion: options?.pageInventoryVersion ?? null,
  };
}

export function detectBackendVersionMismatch(receipt: BuildVersionReceipt | undefined, frontendBuild: string): string | null {
  if (!receipt) return null;
  if (receipt.apiBuild !== frontendBuild || receipt.workerBuild !== frontendBuild) {
    return 'BACKEND_VERSION_MISMATCH';
  }
  return null;
}
