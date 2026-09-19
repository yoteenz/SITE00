/**
 * P0.DEPLOY.1 — Parse frontend release manifest / smoke checks.
 */

import type { FrontendHealthReceipt } from './types.js';
import { parseReleaseManifest } from './releaseManifest.js';

export function parseFrontendHealthFromManifest(raw: unknown): FrontendHealthReceipt {
  const manifest = parseReleaseManifest(raw);
  if (!manifest) {
    return { ok: false, releaseId: null, version: null, commitSha: null, bundleEntry: null };
  }
  return {
    ok: true,
    releaseId: manifest.releaseId,
    version: manifest.version,
    commitSha: manifest.commitSha,
    bundleEntry: manifest.bundleEntry ?? null,
  };
}

export function runProductionSmokeChecks(html: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!html.includes('id="root"') && !html.includes('id=\'root\'')) {
    errors.push('App root mount not found in index.html');
  }
  if (!html.includes('/assets/') && !html.includes('.js')) {
    errors.push('No JS bundle reference in index.html');
  }
  return { ok: errors.length === 0, errors };
}
