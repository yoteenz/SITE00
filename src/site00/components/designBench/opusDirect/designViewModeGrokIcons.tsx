/**
 * P0.VR.DESIGN-VIEWMODE-ICON-REAPPLY1 — staged Grok Canonical / List marks.
 *
 * Geometry copied from approved P0.VR.DESIGN.GROK-VISUAL-SYSTEM1 (commit f291ae0f).
 * Do not regenerate or substitute generic icons.
 */

import type { ReactNode } from 'react';

import type { TwinOpusDirectViewMode } from './twinOpusDirectWorkspace';

const DVS_VIEWBOX = 24;
const DVS_STROKE = 1.5;

const dvsStroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: DVS_STROKE,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  strokeMiterlimit: 2,
};

const dvsFill = {
  fill: 'currentColor',
  stroke: 'none' as const,
};

const S = dvsStroke;
const F = dvsFill;

const VIEW_MODE_GLYPHS: Record<TwinOpusDirectViewMode, () => ReactNode> = {
  canonical: () => (
    <>
      <rect {...S} x="4" y="4" width="8" height="10" />
      <rect {...S} x="14" y="4" width="6" height="6" />
      <rect {...S} x="14" y="12" width="6" height="8" />
      <path {...S} d="M4 9h8" />
    </>
  ),
  list: () => (
    <>
      <path {...S} d="M5 5v14" />
      <path {...S} d="M9 6h11" />
      <path {...S} d="M9 12h11" />
      <path {...S} d="M9 18h8" />
      <rect {...F} x="4" y="4.5" width="2" height="2" />
      <rect {...F} x="4" y="11" width="2" height="2" />
      <rect {...F} x="4" y="17" width="2" height="2" />
    </>
  ),
};

export const TWIN_OPUS_DIRECT_VIEW_MODE_A11Y_LABELS: Record<TwinOpusDirectViewMode, string> = {
  canonical: 'Canonical view',
  list: 'List view',
};

type Props = {
  mode: TwinOpusDirectViewMode;
};

export function DesignViewModeGrokIcon({ mode }: Props) {
  const glyph = VIEW_MODE_GLYPHS[mode];
  return (
    <svg
      className="tod-viewmode__glyph"
      viewBox={`0 0 ${DVS_VIEWBOX} ${DVS_VIEWBOX}`}
      focusable="false"
      aria-hidden="true"
      data-dvs-icon={mode}
      data-dvs-viewmode-grok="1"
    >
      {glyph()}
    </svg>
  );
}
