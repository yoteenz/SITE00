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
      <rect {...S} x="6" y="6" width="9" height="8" />
      <rect {...S} x="16" y="6" width="2" height="12" />
      <path {...S} d="M6 16.5h7" />
      <path {...S} d="M6 18.5h4" />
    </>
  );
}

export function ViewModeListGlyph() {
  return (
    <>
      <path {...S} d="M9.5 6h10.5" />
      <path {...S} d="M9.5 12h10.5" />
      <path {...S} d="M9.5 18h7" />
      <rect {...F} x="4" y="4.75" width="2.5" height="2.5" />
      <rect {...F} x="4" y="10.75" width="2.5" height="2.5" />
      <rect {...F} x="4" y="16.75" width="2.5" height="2.5" />
    </>
  );
}

export const VIEW_MODE_ICON_PUBLIC = {
  canonical: '/site00/design-visual-system/canonical-view.svg',
  list: '/site00/design-visual-system/list-view.svg',
} as const;
