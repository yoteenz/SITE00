/**
 * P0.VR.CAPTURE.1R3 — Asset delivery build + shared storage defaults.
 */

export const P0_VR_CAPTURE_1R3_BUILD = 'v279' as const;

export const SITE00_ASSETS_BUCKET_DEFAULT = 'live-preview' as const;
export const SITE00_PUBLIC_PROJECT_REF = 'hyycomvcaqxxvyrfupes' as const;
export const SITE00_STORAGE_PUBLIC_PREFIX = 'site00' as const;

export const VALID_IMAGE_MIME_PREFIXES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/avif'] as const;

export const IMAGE_DELIVERY_ERROR_CODES = [
  'ASSET_REF_MISSING',
  'ASSET_REF_MALFORMED',
  'STORAGE_OBJECT_MISSING',
  'ARTIFACT_EMPTY',
  'ARTIFACT_INVALID',
  'SIGNED_URL_EXPIRED',
  'SIGNED_URL_INVALID',
  'PUBLIC_URL_INVALID',
  'AUTH_REQUIRED',
  'HTTP_401',
  'HTTP_403',
  'HTTP_404',
  'HTTP_5XX',
  'CORS_BLOCKED',
  'MIME_INVALID',
  'IMAGE_DECODE_FAILED',
  'CLIENT_BINDING_FAILED',
  'UNKNOWN_IMAGE_DELIVERY_ERROR',
] as const;

export type ImageDeliveryErrorCode = (typeof IMAGE_DELIVERY_ERROR_CODES)[number];
