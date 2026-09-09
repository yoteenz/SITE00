/**
 * CropQualityPreflight — validate crop before approval.
 */

import type { NormalizedBbox } from '../types.js';
import type {
  AssetTargetSlotContract,
  CropQualityPreflightResult,
  CropPreflightIssue,
  ObjectCoverageState,
  EdgeContactState,
  UnwantedContextType,
} from './types.js';
import { normalizedToPixelBounds } from './cropGeometry.js';

/** Reject saliency-point crops; family thumb slots are ~0.5–0.6% of source area. */
const MIN_COVERAGE_RATIO = 0.004;

export function runCropQualityPreflight(input: {
  crop: NormalizedBbox;
  sourceWidth: number;
  sourceHeight: number;
  contract: AssetTargetSlotContract;
  uiContaminationSuspected?: boolean;
  hasDeviceFrame?: boolean;
  hasText?: boolean;
  hasAdjacentCard?: boolean;
  objectCoverageOverride?: ObjectCoverageState;
  founderOverridePartial?: boolean;
}): CropQualityPreflightResult {
  const pixel = normalizedToPixelBounds(input.crop, input.sourceWidth, input.sourceHeight);
  const issues: CropPreflightIssue[] = [];

  const areaRatio = (pixel.width * pixel.height) / (input.sourceWidth * input.sourceHeight);
  const minimumSizePass =
    pixel.width >= input.contract.minimumResolution.width &&
    pixel.height >= input.contract.minimumResolution.height &&
    areaRatio >= MIN_COVERAGE_RATIO;

  if (!minimumSizePass) {
    issues.push({ code: 'MIN_GEOMETRY', label: 'CROP TOO SMALL FOR TARGET SLOT', severity: 'BLOCK' });
  }

  let objectCoverage: ObjectCoverageState = input.objectCoverageOverride ?? 'UNKNOWN';
  if (input.uiContaminationSuspected || input.hasDeviceFrame) {
    objectCoverage = 'PARTIAL';
  } else if (minimumSizePass && !input.hasAdjacentCard) {
    objectCoverage = 'FULL';
  }

  if (objectCoverage === 'PARTIAL' && !input.founderOverridePartial) {
    issues.push({ code: 'PARTIAL_COVERAGE', label: 'OBJECT COVERAGE PARTIAL', severity: 'BLOCK' });
  }

  let edgeContact: EdgeContactState = 'CLEAR';
  const margin = 0.002;
  if (
    input.crop.x <= margin ||
    input.crop.y <= margin ||
    input.crop.x + input.crop.width >= 1 - margin ||
    input.crop.y + input.crop.height >= 1 - margin
  ) {
    edgeContact = input.hasDeviceFrame ? 'CLIPPED' : 'TOUCHING';
  }

  if (edgeContact === 'CLIPPED') {
    issues.push({ code: 'OBJECT_CLIPPED', label: 'DETECTED OBJECT CLIPPED BY CROP EDGE', severity: 'BLOCK' });
  } else if (edgeContact === 'TOUCHING') {
    issues.push({ code: 'EDGE_TOUCH', label: 'OBJECT TOUCHING CROP EDGE', severity: 'WARN' });
  }

  const unwantedContext: UnwantedContextType[] = [];
  if (input.hasDeviceFrame && !input.contract.allowDeviceChrome) {
    unwantedContext.push('DEVICE_CHROME');
    issues.push({ code: 'DEVICE_CHROME', label: 'DEVICE CHROME INCLUDED', severity: 'BLOCK' });
  }
  if (input.hasText && !input.contract.allowText) {
    unwantedContext.push('TEXT');
    issues.push({ code: 'TEXT', label: 'TEXT CONTAMINATION DETECTED', severity: 'WARN' });
  }
  if (input.hasAdjacentCard) {
    unwantedContext.push('ADJACENT_CARD');
    issues.push({ code: 'ADJACENT_CARD', label: 'ADJACENT CARD VISIBLE IN CROP', severity: 'WARN' });
  }
  if (input.uiContaminationSuspected && unwantedContext.length === 0) {
    unwantedContext.push('OTHER_UI');
    issues.push({ code: 'UI_CHROME', label: 'UI CHROME SUSPECTED', severity: 'WARN' });
  }
  if (unwantedContext.length === 0) unwantedContext.push('NONE');

  let targetAspectCompatibility: CropQualityPreflightResult['targetAspectCompatibility'] = 'COMPATIBLE';
  if (input.contract.expectedAspectRatio != null && pixel.height > 0) {
    const cropAspect = pixel.width / pixel.height;
    const delta = Math.abs(cropAspect - input.contract.expectedAspectRatio) / input.contract.expectedAspectRatio;
    if (delta > 0.35) targetAspectCompatibility = 'INCOMPATIBLE';
    else if (delta > 0.15) {
      targetAspectCompatibility = 'WARN';
      issues.push({ code: 'ASPECT', label: 'SLIGHT ASPECT DIFFERENCE FROM TARGET SLOT', severity: 'WARN' });
    }
  }

  const blankRegion = areaRatio < MIN_COVERAGE_RATIO;
  if (blankRegion) {
    issues.push({ code: 'BLANK', label: 'LOW-INFORMATION / BLANK REGION', severity: 'BLOCK' });
  }

  const blocksApproval = issues.some((i) => i.severity === 'BLOCK');
  const blocksBatchApproval = blocksApproval;

  let recommendedAction = 'READY FOR APPROVAL';
  if (blocksApproval) recommendedAction = 'EDIT BEFORE APPROVAL';
  else if (issues.some((i) => i.severity === 'WARN')) recommendedAction = 'REVIEW WARNINGS';

  return {
    objectCoverage,
    edgeContact,
    unwantedContext,
    sourceResolution: { width: input.sourceWidth, height: input.sourceHeight },
    minimumSizePass,
    targetAspectCompatibility,
    blankRegion,
    issues,
    blocksApproval,
    blocksBatchApproval,
    recommendedAction,
  };
}
