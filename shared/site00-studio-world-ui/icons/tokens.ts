/** P0.UI.3 — NDX canonical icon tokens */

export const NDX_ICON_VIEWBOX = 24;

export const NDX_ICON_STROKE_DEFAULT = 1.5;

export const NDX_ICON_SIZE_TOKENS = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

export type NdxIconSizeToken = keyof typeof NDX_ICON_SIZE_TOKENS;

export const NDX_ICON_CONTEXT_SIZE = {
  bottomNav: NDX_ICON_SIZE_TOKENS.md,
  header: NDX_ICON_SIZE_TOKENS.md,
  menuRow: NDX_ICON_SIZE_TOKENS.sm,
  desktopRail: NDX_ICON_SIZE_TOKENS.sm,
} as const;
