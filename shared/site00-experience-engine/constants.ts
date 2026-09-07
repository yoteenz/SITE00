/**
 * Experience Engine V0 constants.
 */

export const EXPERIENCE_ENGINE_PIXEL_PASS_THRESHOLD = 0.94;
export const EXPERIENCE_ENGINE_STRUCTURAL_PASS_THRESHOLD = 0.82;
export const EXPERIENCE_ENGINE_VISUAL_PASS_THRESHOLD = 0.9;
export const EXPERIENCE_ENGINE_MAX_ITERATIONS = 5;

export const SITE00_HOST_PROJECT_KEY = 'site00' as const;
export const ENTER_PROOF_ROUTE = '/enter' as const;

export const ENTER_DESKTOP_ENVIRONMENT_ASSET =
  '89319E70-D080-4798-9BCA-E53B137F2387.png' as const;

export const ENTER_DESKTOP_REFERENCE_STORAGE_PATH =
  `live-preview/site00/${ENTER_DESKTOP_ENVIRONMENT_ASSET}` as const;

export const ENTER_DESKTOP_VIEWPORT = { width: 1440, height: 900 } as const;

/** Crop regions for /enter desktop proof (1440×900). */
export const ENTER_DESKTOP_PROOF_REGIONS = [
  {
    regionId: 'environment',
    label: 'PRIMARY ENVIRONMENT / BACKGROUND',
    bounds: { x: 0, y: 0, width: 860, height: 900 },
    highAuthority: true,
  },
  {
    regionId: 'directory-panel',
    label: 'DIRECTORY PANEL',
    bounds: { x: 860, y: 96, width: 580, height: 768 },
    highAuthority: true,
  },
  {
    regionId: 'status-strip',
    label: 'STATUS STRIP',
    bounds: { x: 0, y: 864, width: 1440, height: 36 },
    highAuthority: true,
  },
] as const;
