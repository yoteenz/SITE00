/**
 * P0.DEPLOY.1 — Parse backend health into release receipt.
 */

import type { BackendHealthReceipt } from './types.js';
import { P0_DEPLOY_1_BUILD, CAPTURE_RUN_CONTRACT_VERSION } from './constants.js';

export function parseBackendHealthPayload(raw: unknown): BackendHealthReceipt {
  if (!raw || typeof raw !== 'object') {
    return {
      ok: false,
      releaseId: null,
      commitSha: null,
      apiBuild: null,
      workerBuild: null,
      contractVersion: null,
      serviceReady: false,
    };
  }
  const o = raw as Record<string, unknown>;
  const release = (o.release ?? o) as Record<string, unknown>;
  return {
    ok: Boolean(o.ok),
    releaseId: typeof release.releaseId === 'string' ? release.releaseId : null,
    commitSha: typeof release.commitSha === 'string' ? release.commitSha : typeof o.gitCommit === 'string' ? o.gitCommit : null,
    apiBuild: typeof release.apiBuild === 'string' ? release.apiBuild : typeof o.apiBuild === 'string' ? o.apiBuild : P0_DEPLOY_1_BUILD,
    workerBuild: typeof release.workerBuild === 'string' ? release.workerBuild : typeof o.workerBuild === 'string' ? o.workerBuild : P0_DEPLOY_1_BUILD,
    contractVersion: typeof release.contractVersion === 'string' ? release.contractVersion : CAPTURE_RUN_CONTRACT_VERSION,
    serviceReady: Boolean(release.serviceReady ?? o.ok),
    gitCommit: typeof o.gitCommit === 'string' ? o.gitCommit : null,
  };
}
