/**
 * P0.VR.UPGRADE.2 — Twin reconstruction + promotion build marker.
 */

export const P0_VR_UPGRADE_2_BUILD = 'v300' as const;

export const TWIN_BUILD_STEPS = [
  'CLONING_FUNCTION_CONTRACT',
  'APPLYING_RECONSTRUCTION_PLAN',
  'BUILDING_ISOLATED_PAGE',
  'VERIFYING_ROUTE',
  'CAPTURING_TWIN',
] as const;

export const TWIN_ROUTE_PREFIX = '/projects';
