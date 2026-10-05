import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { REBUILD_CHANGED_BUT_DID_NOT_CONVERGE } from './constants.js';
import type { ActualFirstMaterialChangeReceipt } from './actualFirstTypes.js';

export function buildActualFirstMaterialChangeReceipt(input: {
  priorLiveScreenshotHash: string;
  newLiveScreenshotHash: string;
  distanceToActualBefore: number;
  distanceToActualAfter: number;
}): ActualFirstMaterialChangeReceipt {
  const improved = input.distanceToActualAfter < input.distanceToActualBefore;
  const changed = input.priorLiveScreenshotHash !== input.newLiveScreenshotHash;
  let result: ActualFirstMaterialChangeReceipt['result'] = 'PASS';
  if (changed && !improved) {
    result = REBUILD_CHANGED_BUT_DID_NOT_CONVERGE;
  }
  return {
    id: `afmcr-${fnv1aHex(JSON.stringify(input)).slice(0, 10)}`,
    priorLiveScreenshotHash: input.priorLiveScreenshotHash,
    newLiveScreenshotHash: input.newLiveScreenshotHash,
    distanceToActualBefore: input.distanceToActualBefore,
    distanceToActualAfter: input.distanceToActualAfter,
    distanceToActualImproved: improved,
    result,
  };
}

export function assertActualFirstMaterialChangeForCompile(receipt: ActualFirstMaterialChangeReceipt): void {
  if (receipt.result === REBUILD_CHANGED_BUT_DID_NOT_CONVERGE) {
    throw new Error(REBUILD_CHANGED_BUT_DID_NOT_CONVERGE);
  }
  if (receipt.priorLiveScreenshotHash === receipt.newLiveScreenshotHash) {
    throw new Error('ACTUAL_FIRST_REBUILD_NOT_MATERIAL');
  }
  if (!receipt.distanceToActualImproved) {
    throw new Error(REBUILD_CHANGED_BUT_DID_NOT_CONVERGE);
  }
}
