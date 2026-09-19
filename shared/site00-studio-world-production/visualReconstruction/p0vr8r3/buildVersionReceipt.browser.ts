/**
 * P0.VR.8R3R1 — Browser-safe build version helpers.
 */

import type { BuildVersionReceipt } from './buildVersionReceipt.js';

export { P0_VR_8R3R1_BUILD } from './constants.js';

export function detectBackendVersionMismatch(receipt: BuildVersionReceipt | undefined, frontendBuild: string): string | null {
  if (!receipt) return null;
  if (receipt.apiBuild !== frontendBuild || receipt.workerBuild !== frontendBuild) {
    return 'BACKEND_VERSION_MISMATCH';
  }
  return null;
}
