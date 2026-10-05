import type { P0_VR_REPLICATION_4R3R1_BUILD } from './constants.js';
import type { HeroCropPurityResult, SourceRegionClassification } from './heroCropPurityGuard.js';
import type { HeroGeometryDeltaFull, HeroRenderedGeometryFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';

export type HeroMeasurementSource =
  | 'PLAYWRIGHT_DOM'
  | 'LIVE_BROWSER_DOM'
  | 'LAYOUT_SPEC'
  | 'SYNTHETIC'
  | 'PENDING_LIVE_BROWSER';

export type HeroRenderedCaptureReceipt = {
  expectedCount: number;
  foundCount: number;
  missingIds: HeroObjectId[];
  measurementSource: HeroMeasurementSource;
  captureTimestamp: string | null;
  heroRootFound: boolean;
  fontsReady: boolean;
  imagesSettled: boolean;
  status: 'PASS' | 'FAIL';
  failureCode: 'HERO_RENDERED_OBJECTS_INCOMPLETE' | null;
};

export type HeroGeometryReceiptV2 = {
  authorityCount: number;
  renderedCount: number;
  measuredCount: number;
  withinToleranceCount: number;
  outlierCount: number;
  maxPositionError: number;
  maxSizeError: number;
  measurementSource: HeroMeasurementSource;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
};

export type HeroSafeRegionCropReceipt = {
  objectId: 'H06' | 'H12';
  slotId: string;
  classification: SourceRegionClassification;
  normCrop: { left: number; top: number; width: number; height: number } | null;
  purity: HeroCropPurityResult;
  materializedUrl: string | null;
  decoded: boolean;
  naturalWidth: number;
  naturalHeight: number;
  status: 'PASS' | 'FAIL';
};

export type HeroDomRecoveryReport = {
  buildRef: typeof P0_VR_REPLICATION_4R3R1_BUILD;
  sessionId: string;
  captureReceipt: HeroRenderedCaptureReceipt;
  geometryReceiptV2: HeroGeometryReceiptV2;
  liveRenderedGeometry: HeroRenderedGeometryFull[];
  liveGeometryDeltas: HeroGeometryDeltaFull[];
  safeRegionCrops: HeroSafeRegionCropReceipt[];
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  notes: string;
};
