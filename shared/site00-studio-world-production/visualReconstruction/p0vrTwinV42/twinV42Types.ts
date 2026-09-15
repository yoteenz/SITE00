import type { TWIN_V42_CRITICAL_REGION_IDS } from './constants.js';

export type TwinV4GoldenAuthority = {
  artifactId: string;
  artifactUrl: string;
  sha256: string;
  width: number;
  height: number;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  approvedByFounder: true;
  approvedAt: string;
  immutable: true;
  authorityVersion: string;
  httpStatus?: number;
};

export type TwinV4AuthorityPurgeReceipt = {
  staleIdsRemoved: string[];
  staleHashesRemoved: string[];
  activeId: string;
  activeHash: string;
};

export type TwinV4CanonicalViewport = {
  width: number;
  height: number;
  deviceScaleFactor: number;
  source: 'GOLDEN_AUTHORITY';
};

export type TwinV4GoldenDiffReceipt = {
  goldenHash: string;
  liveScreenshotHash: string;
  viewport: TwinV4CanonicalViewport;
  differingPixels: number;
  totalPixels: number;
  diffPercent: number;
  threshold: number;
  pass: boolean;
  iteration: number;
};

export type TwinV4RegionDiffReceipt = {
  regionId: (typeof TWIN_V42_CRITICAL_REGION_IDS)[number];
  differingPixels: number;
  totalPixels: number;
  diffPercent: number;
  threshold: number;
  pass: boolean;
};

export type TwinV4FontStabilityReceipt = {
  documentFontsReady: boolean;
  fallbackFontsDetected: boolean;
};

export type TwinV4AssetStabilityReceipt = {
  imagesLoaded: number;
  imagesPending: number;
  placeholderImages: number;
};

export type TwinV4RasterCheatFirewall = {
  violations: string[];
  runtimeRasterUsage: number;
};

export type TwinV4GoldenDiffIteration = {
  iteration: number;
  liveScreenshotPath: string;
  diffHeatmapPath: string;
  diffReportPath: string;
  regionDiffPath: string;
  fullDiff: TwinV4GoldenDiffReceipt;
  regionDiffs: TwinV4RegionDiffReceipt[];
};

export type TwinV4GoldenDiffGateStatus =
  | 'BLOCKED'
  | 'IMPLEMENTING'
  | 'DIFF_FAILED'
  | 'REVIEW_READY'
  | 'FOUNDER_APPROVED'
  | 'FOUNDER_REJECTED';

export type TwinV4GoldenDiffGate = {
  status: TwinV4GoldenDiffGateStatus;
  fullPagePass: boolean;
  criticalRegionPass: boolean;
  rasterCheatViolations: number;
};

export type TwinV42GoldenDiffBundle = {
  lineage: string;
  goldenAuthority: TwinV4GoldenAuthority;
  canonicalViewport: TwinV4CanonicalViewport;
  purgeReceipt: TwinV4AuthorityPurgeReceipt;
  iterations: TwinV4GoldenDiffIteration[];
  fontStability: TwinV4FontStabilityReceipt;
  assetStability: TwinV4AssetStabilityReceipt;
  rasterFirewall: TwinV4RasterCheatFirewall;
  gate: TwinV4GoldenDiffGate;
  reconstructionEngineProof: 'YES' | 'NO' | 'INCONCLUSIVE';
  proofBlockedReason: string | null;
};
