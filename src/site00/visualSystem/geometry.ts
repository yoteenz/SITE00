/** P0.VR.DESIGN.GROK-VISUAL-SYSTEM1 — staged DESIGN workspace icon geometry. */

export const DVS_VIEWBOX = 24;
export const DVS_STROKE = 1.5;
export const DVS_INSET = 4;
export const DVS_OPTICAL = 16;
export const DVS_LIME = '#cdee30';
export const DVS_INK = '#111111';
export const DVS_PAPER = '#f7f7f5';

export const DVS_SIZES = [16, 20, 24, 32] as const;
export type DvsSize = (typeof DVS_SIZES)[number];

export type DvsIconState = 'default' | 'active' | 'disabled';

export const dvsStroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: DVS_STROKE,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  strokeMiterlimit: 2,
};

export const dvsFill = {
  fill: 'currentColor',
  stroke: 'none' as const,
};
