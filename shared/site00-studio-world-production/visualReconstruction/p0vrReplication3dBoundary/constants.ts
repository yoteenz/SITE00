export const P0_VR_REPLICATION_3D_BOUNDARY_BUILD = 'v333' as const;

/** DOM contract selectors (must match twin React surfaces). */
export const TWIN_MOUNT_ROOT_SELECTOR = '[data-reconstruction-twin-root]';
export const TWIN_SURFACE_SELECTOR = '[data-reconstruction-twin-surface="overview"]';
export const TWIN_CONTENT_ROOT_SELECTOR = '[data-twin-content-root]';
export const SHELL_ROOT_SELECTOR = '[data-shell-first-twin]';
export const VISION_LITERAL_ROOT_SELECTOR = '[data-vision-literal-twin]';
export const SHELL_HOST_HEADER_SELECTOR = '[data-shell-band="host-header"]';
export const HERO_MEDIA_SLOT_SELECTOR = '[data-literal-subregion="center_image_region"], .site00-sft__hero-media';

export const HERO_ASSET_SLOT_IDS = new Set(['slice_a', 'slice_b', 'slice_c', 'right_graphic', 'lime_ndx']);
