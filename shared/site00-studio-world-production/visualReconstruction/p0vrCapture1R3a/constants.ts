/**
 * P0.VR.CAPTURE.1R3A — Authority replacement + capture artifact proof build.
 */

export const P0_VR_CAPTURE_1R3A_BUILD = 'v291' as const;

export const FOUNDER_AUTHORITY_UPLOAD_LS_PREFIX = 'site00:authority-upload:' as const;
export const DESIGN_AUTHORITY_VERSION_LS_PREFIX = 'site00:design-authority-version:' as const;
export const DESIGN_AUTHORITY_CURRENT_POINTER_LS_PREFIX = 'site00:current-authority-pointer' as const;

export const SUPPORTED_AUTHORITY_UPLOAD_MIMES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;
