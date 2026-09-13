/** Normalized padding between last client content and host bottom nav (not double safe-area). */
export const APPROVED_CLIENT_BOTTOM_PADDING_NORM = 0.02 as const;

/** Legacy fixed top inset (R2R2) — do not use for crop origin after R2R3. */
export const CLIENT_CANVAS_LEGACY_TOP_NORM = 0.07 as const;

/** Minimum top when blueprint has no client geometry (fallback only). */
export const CLIENT_CANVAS_TOP_FALLBACK_NORM = 0.04 as const;

export const CLIENT_CANVAS_HOST_ARTIFACT_HEIGHT_LEAK = 'CLIENT_CANVAS_HOST_ARTIFACT_HEIGHT_LEAK' as const;

export const CLIENT_CANVAS_TOP_CROP_LOSS = 'CLIENT_CANVAS_TOP_CROP_LOSS' as const;

/** Full concept artboard height/width for padding-bottom crop frames. */
export const CLIENT_CANVAS_ARTBOARD_HEIGHT_OVER_WIDTH = 812 / 375;

/** Painted SITE 00 host header band on full-page concept images (matches HostShellContract). */
export const SITE00_HOST_TOP_INSET_NORM = 0.07 as const;

/** Painted / reserved host bottom safe area on full-page concept images. */
export const SITE00_HOST_BOTTOM_INSET_NORM = 0.12 as const;

/** Full-page concept images often draw masthead slightly above blueprint y — recover without host chrome. */
export const MASTHEAD_VISUAL_BLEED_NORM = 0.012 as const;
