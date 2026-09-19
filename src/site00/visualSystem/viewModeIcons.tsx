import { dvsFill, dvsStroke } from './geometry';

const S = dvsStroke;
const F = dvsFill;

/** P0.VR.DESIGN.GROK-VIEWMODE-ICONS1 — staged Canonical / List pair. */
export const VIEW_MODE_CANONICAL_NAME = 'canonical-view';
export const VIEW_MODE_LIST_NAME = 'list-view';

export function ViewModeCanonicalGlyph() {
  return (
    <>
      <rect {...S} x="4" y="4" width="16" height="16" />
      <rect {...S} x="6" y="6" width="8" height="12" />
      <rect {...S} x="15.5" y="6" width="2.5" height="5" />
      <path {...S} d="M15.5 14h2.5" />
      <path {...S} d="M15.5 16.5h2" />
    </>
  );
}

export function ViewModeListGlyph() {
  return (
    <>
      <path {...S} d="M8 6h12" />
      <path {...S} d="M8 12h12" />
      <path {...S} d="M8 18h8" />
      <rect {...F} x="4" y="5" width="2" height="2" />
      <rect {...F} x="4" y="11" width="2" height="2" />
      <rect {...F} x="4" y="17" width="2" height="2" />
    </>
  );
}

export const VIEW_MODE_ICON_PUBLIC = {
  canonical: '/site00/design-visual-system/canonical-view.svg',
  list: '/site00/design-visual-system/list-view.svg',
} as const;
