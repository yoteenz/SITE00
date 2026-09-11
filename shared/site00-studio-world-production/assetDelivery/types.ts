/**
 * P0.VR.CAPTURE.1R3 — Canonical asset delivery types.
 */

import type { ImageDeliveryErrorCode } from './constants.js';

export type AssetStorageProvider = 'SUPABASE' | 'PUBLIC_SITE' | 'ABSOLUTE_URL' | 'NONE';

export type AssetVisibility = 'PUBLIC' | 'SIGNED' | 'PRIVATE';

export type CanonicalAssetRef = {
  provider: AssetStorageProvider;
  bucket: string | null;
  objectPath: string | null;
  assetId: string | null;
  visibility: AssetVisibility;
  mimeType: string | null;
  version: string;
  checksum: string | null;
  /** Original persisted value before normalization. */
  legacyRef?: string | null;
  assetRefVersion: 'v1' | 'v2';
};

export type RenderableAssetUrl = {
  url: string | null;
  provider: AssetStorageProvider;
  expiresAt: string | null;
  authMode: 'NONE' | 'PUBLIC' | 'SIGNED';
  status: 'RESOLVED' | 'UNRESOLVABLE' | 'INVALID_REF';
  errorCode: ImageDeliveryErrorCode | null;
  canonicalRef: CanonicalAssetRef;
};

export type ImageArtifactReceipt = {
  artifactId: string;
  sourceType: string;
  sourceId: string;
  byteSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  checksum: string | null;
  createdAt: string;
  status: 'VALID' | 'ARTIFACT_EMPTY' | 'ARTIFACT_INVALID' | 'MISSING';
};

export type AssetStorageWriteReceipt = {
  sourceId: string;
  provider: AssetStorageProvider;
  bucket: string | null;
  objectPath: string | null;
  byteSize: number;
  mimeType: string;
  checksum: string | null;
  uploadedAt: string;
  status: 'SUCCESS' | 'FAILED';
  publicUrl: string | null;
};

export type ImageDeliveryTrace = {
  sourceType: string;
  sourceId: string;
  projectId?: string | null;
  pageId?: string | null;
  viewport?: string | null;
  canonicalRef: CanonicalAssetRef;
  storageProvider: AssetStorageProvider;
  storageObjectPath: string | null;
  resolvedUrl: string | null;
  httpStatus: number | null;
  contentType: string | null;
  contentLength: number | null;
  corsStatus: 'UNKNOWN' | 'OK' | 'BLOCKED';
  authMode: RenderableAssetUrl['authMode'];
  expiresAt: string | null;
  renderStatus: 'UNKNOWN' | 'RENDERABLE' | 'NOT_RENDERABLE';
  errorCode: ImageDeliveryErrorCode | null;
  errorMessage: string | null;
  resolvedBrowserImageUrl: string | null;
};

export type AssetDeliveryProbeResult = {
  exists: boolean;
  httpStatus: number | null;
  mime: string | null;
  size: number | null;
  renderable: boolean;
  error: ImageDeliveryErrorCode | null;
};

export type PreviewHealthStatus = 'UNKNOWN' | 'PASS' | 'FAIL';

export type PreviewHealth = {
  assetExists: boolean;
  urlResolved: boolean;
  requestSucceeded: boolean;
  mimeValid: boolean;
  browserLoaded: boolean;
  status: PreviewHealthStatus;
  errorCode: ImageDeliveryErrorCode | null;
  resolvedUrl: string | null;
};

export type RenderableAuthorityContract = {
  approvalStatus: string;
  captureStatus: string | null;
  previewHealth: PreviewHealth;
  upgradeAllowed: boolean;
  blockReason: string | null;
};
