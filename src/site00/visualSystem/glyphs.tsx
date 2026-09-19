import type { ReactNode } from 'react';
import { dvsFill, dvsStroke } from './geometry';

const S = dvsStroke;
const F = dvsFill;

/** Compact architectural marks. Drawn in the 4–20 optical box of a 24 viewBox. */
export const DVS_GLYPHS: Record<string, () => ReactNode> = {
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
  opus: () => (
    <>
      <path {...S} d="M12 4l8 4.5v7L12 20l-8-4.5v-7L12 4z" />
      <path {...S} d="M12 4v7.5M4 8.5l8 3 8-3M12 11.5V20" />
    </>
  ),
  grok: () => (
    <>
      <path {...S} d="M12 3.5v17M3.5 12h17" />
      <path {...S} d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8" />
      <rect {...F} x="11" y="11" width="2" height="2" />
    </>
  ),
  mobile: () => (
    <>
      <rect {...S} x="8" y="3" width="8" height="18" />
      <path {...S} d="M10 19h4" />
    </>
  ),
  tablet: () => (
    <>
      <rect {...S} x="5" y="3" width="14" height="18" />
      <path {...S} d="M11 19h2" />
    </>
  ),
  desktop: () => (
    <>
      <rect {...S} x="3" y="5" width="18" height="11" />
      <path {...S} d="M8 20h8M12 16v4" />
    </>
  ),
  'capture-screen': () => (
    <>
      <rect {...S} x="3" y="7" width="18" height="12" />
      <path {...S} d="M8 7V5h8v2" />
      <circle {...S} cx="12" cy="13" r="3" />
    </>
  ),
  'create-framework': () => (
    <>
      <rect {...S} x="4" y="4" width="16" height="16" />
      <path {...S} d="M4 10h16M10 4v16" />
    </>
  ),
  'generate-assets': () => (
    <>
      <rect {...S} x="4" y="6" width="10" height="12" />
      <path {...S} d="M14 10h6v10H8" />
      <path {...S} d="M7 10h4M7 13h4" />
    </>
  ),
  select: () => (
    <>
      <rect {...S} x="4" y="4" width="16" height="16" />
      <path {...S} d="M8 12l3 3 6-7" />
    </>
  ),
  promote: () => (
    <>
      <path {...S} d="M12 19V6" />
      <path {...S} d="M6 11l6-6 6 6" />
    </>
  ),
  approve: () => (
    <>
      <path {...S} d="M5 12l5 5 9-10" />
    </>
  ),
  lock: () => (
    <>
      <rect {...S} x="6" y="11" width="12" height="9" />
      <path {...S} d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  unlock: () => (
    <>
      <rect {...S} x="6" y="11" width="12" height="9" />
      <path {...S} d="M8 11V8a4 4 0 017.5-2" />
    </>
  ),
  'pair-review': () => (
    <>
      <rect {...S} x="3" y="6" width="8" height="12" />
      <rect {...S} x="13" y="6" width="8" height="12" />
      <path {...S} d="M11 12h2" />
    </>
  ),
  'review-authority': () => (
    <>
      <path {...S} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path {...S} d="M9 12h6" />
    </>
  ),
  fullscreen: () => (
    <>
      <path {...S} d="M4 10V4h6M20 10V4h-6M4 14v6h6M20 14v6h-6" />
    </>
  ),
  'exit-fullscreen': () => (
    <>
      <path {...S} d="M9 4v6H3M15 4v6h6M9 20v-6H3M15 20v-6h6" />
    </>
  ),
  'refine-concept': () => (
    <>
      <path {...S} d="M14 4l6 6-10 10H4v-6L14 4z" />
      <path {...S} d="M12 6l6 6" />
    </>
  ),
  regenerate: () => (
    <>
      <path {...S} d="M20 8a8 8 0 10.7 6" />
      <path {...S} d="M20 8V3M20 8h-5" />
    </>
  ),
  inspect: () => (
    <>
      <circle {...S} cx="11" cy="11" r="6" />
      <path {...S} d="M16 16l5 5" />
    </>
  ),
  replace: () => (
    <>
      <rect {...S} x="4" y="5" width="10" height="10" />
      <path {...S} d="M10 13h10v6H10z" />
      <path {...S} d="M16 9v4" />
    </>
  ),
  'regenerate-asset': () => (
    <>
      <rect {...S} x="4" y="6" width="11" height="12" />
      <path {...S} d="M20 8a5 5 0 10.4 4" />
      <path {...S} d="M20 8V5M20 8h-3" />
    </>
  ),
  'approve-asset': () => (
    <>
      <rect {...S} x="4" y="5" width="11" height="14" />
      <path {...S} d="M16 13l3 3 5-6" />
    </>
  ),
  reject: () => (
    <>
      <path {...S} d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  'child-page': () => (
    <>
      <rect {...S} x="4" y="4" width="8" height="10" />
      <rect {...S} x="12" y="10" width="8" height="10" />
    </>
  ),
  'grandchild-page': () => (
    <>
      <rect {...S} x="3" y="3" width="6" height="7" />
      <rect {...S} x="9" y="8" width="6" height="7" />
      <rect {...S} x="15" y="13" width="6" height="8" />
    </>
  ),
  inheritance: () => (
    <>
      <path {...S} d="M6 4h6v6H6z" />
      <path {...S} d="M9 10v4h5v6" />
      <rect {...S} x="14" y="14" width="6" height="6" />
    </>
  ),
  'batch-edit': () => (
    <>
      <rect {...S} x="4" y="5" width="7" height="7" />
      <rect {...S} x="13" y="5" width="7" height="7" />
      <rect {...S} x="4" y="14" width="7" height="6" />
      <path {...S} d="M14 15h6M17 12v6" />
    </>
  ),
  assets: () => (
    <>
      <rect {...S} x="4" y="7" width="7" height="10" />
      <rect {...S} x="13" y="4" width="7" height="10" />
    </>
  ),
  interactions: () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M8 12h3l2-3 2 6 2-3h3" />
    </>
  ),
  'view-pipeline': () => (
    <>
      <path {...S} d="M4 8h5v8H4zM10 6h5v12h-5zM16 10h4v6h-4z" />
    </>
  ),
  'view-readiness': () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <path {...S} d="M12 6v6l4 2" />
    </>
  ),
  'resolve-blocker': () => (
    <>
      <path {...S} d="M12 3l8 14H4L12 3z" />
      <path {...S} d="M12 10v4M12 17v.5" />
    </>
  ),
  history: () => (
    <>
      <circle {...S} cx="12" cy="13" r="7" />
      <path {...S} d="M12 10v4l3 2M9 4h6" />
    </>
  ),
  version: () => (
    <>
      <rect {...S} x="5" y="4" width="10" height="14" />
      <path {...S} d="M15 8h4v12H9" />
    </>
  ),
  change: () => (
    <>
      <path {...S} d="M5 8h9l-3-3M19 16H10l3 3" />
    </>
  ),
  amendment: () => (
    <>
      <path {...S} d="M6 4h8l4 4v12H6z" />
      <path {...S} d="M14 4v4h4M8 12h8M8 16h6" />
    </>
  ),
  upload: () => (
    <>
      <path {...S} d="M12 16V5" />
      <path {...S} d="M7 9l5-5 5 5" />
      <path {...S} d="M5 19h14" />
    </>
  ),
  attach: () => (
    <>
      <path {...S} d="M8 12l6-6a3 3 0 014 4l-8 8a2.5 2.5 0 01-3.5-3.5l7-7" />
    </>
  ),
  'drop-zone': () => (
    <>
      <rect {...S} x="4" y="4" width="16" height="16" />
      <path {...S} d="M12 8v6M9 12l3 3 3-3" />
    </>
  ),
  'file-ok': () => (
    <>
      <path {...S} d="M7 3h7l4 4v14H7z" />
      <path {...S} d="M14 3v4h4M9 14l2 2 4-4" />
    </>
  ),
  'file-invalid': () => (
    <>
      <path {...S} d="M7 3h7l4 4v14H7z" />
      <path {...S} d="M14 3v4h4M10 13l4 4M14 13l-4 4" />
    </>
  ),
  'zoom-in': () => (
    <>
      <circle {...S} cx="11" cy="11" r="6" />
      <path {...S} d="M16 16l5 5M11 8v6M8 11h6" />
    </>
  ),
  'zoom-out': () => (
    <>
      <circle {...S} cx="11" cy="11" r="6" />
      <path {...S} d="M16 16l5 5M8 11h6" />
    </>
  ),
  fit: () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <rect {...S} x="8" y="9" width="8" height="6" />
    </>
  ),
  'side-by-side': () => (
    <>
      <rect {...S} x="3" y="5" width="8" height="14" />
      <rect {...S} x="13" y="5" width="8" height="14" />
    </>
  ),
  overlay: () => (
    <>
      <rect {...S} x="4" y="4" width="12" height="12" />
      <rect {...S} x="8" y="8" width="12" height="12" />
    </>
  ),
  split: () => (
    <>
      <rect {...S} x="3" y="5" width="18" height="14" />
      <path {...S} d="M12 5v14" />
    </>
  ),
  comment: () => (
    <>
      <path {...S} d="M5 5h14v10H10l-5 4V5z" />
    </>
  ),
  annotate: () => (
    <>
      <path {...S} d="M4 18l3-10 11 4-3 10z" />
      <path {...S} d="M7 8l3 1" />
    </>
  ),
  pass: () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <path {...S} d="M8 12l3 3 5-6" />
    </>
  ),
  blocked: () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <path {...S} d="M8 8l8 8M16 8l-8 8" />
    </>
  ),
  pending: () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <path {...S} d="M12 8v4l3 2" />
    </>
  ),
  warning: () => (
    <>
      <path {...S} d="M12 4l8 16H4L12 4z" />
      <path {...S} d="M12 10v4M12 17h.01" />
    </>
  ),
  'not-applicable': () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <path {...S} d="M8 12h8" />
    </>
  ),
  'nav-route': () => (
    <>
      <circle {...S} cx="6" cy="18" r="2" />
      <circle {...S} cx="18" cy="6" r="2" />
      <path {...S} d="M8 16l10-10" />
    </>
  ),
  'state-interaction': () => (
    <>
      <rect {...S} x="4" y="8" width="16" height="8" />
      <path {...S} d="M8 12h2M14 12h2" />
    </>
  ),
  'modal-drawer': () => (
    <>
      <rect {...S} x="3" y="5" width="18" height="14" />
      <path {...S} d="M10 5v14" />
    </>
  ),
  'form-input': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="5" />
      <rect {...S} x="4" y="13" width="16" height="5" />
    </>
  ),
  media: () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M4 15l5-4 4 3 3-2 4 3" />
    </>
  ),
  agents: () => (
    <>
      <path {...S} d="M12 4l8 4.5v7L12 20l-8-4.5v-7L12 4z" />
    </>
  ),
  build: () => (
    <>
      <path {...S} d="M4 18V8l8-4 8 4v10" />
      <path {...S} d="M4 12h16" />
    </>
  ),
  'approval-cat': () => (
    <>
      <rect {...S} x="5" y="4" width="14" height="16" />
      <path {...S} d="M8 12l3 3 5-6" />
    </>
  ),
  'empty-capture': () => (
    <>
      <rect {...S} x="4" y="7" width="16" height="11" />
      <path {...S} d="M9 7V6h6v1M12 11v3M10.5 12.5h3" />
    </>
  ),
  'empty-concept': () => (
    <>
      <rect {...S} x="5" y="5" width="14" height="14" />
      <path {...S} d="M9 12h6" />
    </>
  ),
  'empty-pages': () => (
    <>
      <rect {...S} x="6" y="4" width="10" height="14" />
      <path {...S} d="M9 9h4M9 12h4" />
    </>
  ),
  'empty-assets': () => (
    <>
      <rect {...S} x="5" y="7" width="6" height="10" />
      <rect {...S} x="13" y="7" width="6" height="10" />
    </>
  ),
  'empty-children': () => (
    <>
      <rect {...S} x="4" y="5" width="7" height="8" />
      <path {...S} d="M14 12h6v7h-6z" />
    </>
  ),
  'empty-history': () => (
    <>
      <circle {...S} cx="12" cy="13" r="6" />
      <path {...S} d="M12 10v3" />
    </>
  ),
  'empty-authority': () => (
    <>
      <path {...S} d="M12 4l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V7l7-3z" />
      <path {...S} d="M9 12h6" />
    </>
  ),
  'empty-attachments': () => (
    <>
      <path {...S} d="M8 12l5-5a2.5 2.5 0 013.5 3.5l-7 7" />
    </>
  ),
  'empty-grandchildren': () => (
    <>
      <rect {...S} x="3" y="4" width="6" height="7" />
      <rect {...S} x="10" y="8" width="6" height="7" />
      <path {...S} d="M17 14h4v6h-4z" />
    </>
  ),
  'readiness-current': () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <rect {...F} x="11" y="11" width="2" height="2" />
    </>
  ),
  'readiness-completed': () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <path {...S} d="M8 12l3 3 5-6" />
    </>
  ),
  'readiness-optional': () => (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <path {...S} d="M9 12h6" />
    </>
  ),
  'zoom-100': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <rect {...S} x="8" y="9" width="8" height="6" />
      <path {...S} d="M8 12h8" />
    </>
  ),
  compare: () => (
    <>
      <rect {...S} x="3" y="5" width="8" height="14" />
      <rect {...S} x="13" y="5" width="8" height="14" />
      <path {...S} d="M9 12h6" />
    </>
  ),
  actions: () => (
    <>
      <rect {...S} x="4" y="4" width="7" height="7" />
      <path {...S} d="M14 6h6M14 12h6M14 18h6M7.5 14v6M5 17h5" />
    </>
  ),
  'opus-framework': () => (
    <>
      <path {...S} d="M12 4l8 4.5v7L12 20l-8-4.5v-7L12 4z" />
      <path {...S} d="M8 12h8M12 8.5v7" />
    </>
  ),
  'opus-analysis': () => (
    <>
      <rect {...S} x="4" y="4" width="16" height="16" />
      <path {...S} d="M4 10h16M9 4v16" />
    </>
  ),
  'opus-assembly': () => (
    <>
      <rect {...S} x="4" y="5" width="7" height="9" />
      <rect {...S} x="13" y="8" width="7" height="11" />
    </>
  ),
  'opus-proposal': () => (
    <>
      <rect {...S} x="4" y="5" width="16" height="14" />
      <path {...S} d="M8 10h8M8 14h5" />
    </>
  ),
  'opus-compare': () => (
    <>
      <path {...S} d="M12 4l8 4.5v7L12 20" />
      <path {...S} d="M12 4l-8 4.5v7L12 20" />
    </>
  ),
  'opus-revision': () => (
    <>
      <path {...S} d="M12 4l8 4.5v7L12 20l-8-4.5v-7L12 4z" />
      <path {...S} d="M10 12h4" />
    </>
  ),
  'opus-approval': () => (
    <>
      <path {...S} d="M12 4l8 4.5v7L12 20l-8-4.5v-7L12 4z" />
      <path {...S} d="M9 12l2.2 2.2 4-4" />
    </>
  ),
  'grok-plan': () => (
    <>
      <path {...S} d="M12 4v3M12 17v3M4 12h3M17 12h3" />
      <path {...S} d="M8 9h8M8 12h8M8 15h5" />
    </>
  ),
  'grok-generate': () => (
    <>
      <rect {...S} x="5" y="6" width="14" height="12" />
      <path {...S} d="M12 9v6M9 12h6" />
    </>
  ),
  'grok-icons': () => (
    <>
      <rect {...S} x="4" y="4" width="7" height="7" />
      <rect {...S} x="13" y="4" width="7" height="7" />
      <rect {...S} x="4" y="13" width="7" height="7" />
      <path {...S} d="M15 15h4M17 13v4" />
    </>
  ),
  'grok-variation': () => (
    <>
      <rect {...S} x="4" y="5" width="10" height="10" />
      <rect {...S} x="10" y="9" width="10" height="10" />
    </>
  ),
  'grok-replace': () => (
    <>
      <path {...S} d="M12 4v16M4 12h16" />
      <rect {...S} x="14" y="14" width="6" height="6" />
    </>
  ),
  'placeholder-page': () => (
    <>
      <rect {...S} x="6" y="3" width="12" height="18" />
      <path {...S} d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  'placeholder-asset': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M8 12h8" />
    </>
  ),
  'placeholder-capture': () => (
    <>
      <rect {...S} x="4" y="7" width="16" height="11" />
      <circle {...S} cx="12" cy="12.5" r="2.5" />
    </>
  ),
  'type-image': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <circle {...S} cx="9" cy="10" r="1.5" />
      <path {...S} d="M4 15l5-4 4 3 7-5" />
    </>
  ),
  'type-icon': () => (
    <>
      <rect {...S} x="6" y="6" width="12" height="12" />
      <path {...S} d="M9 12h6M12 9v6" />
    </>
  ),
  'type-texture': () => (
    <>
      <rect {...S} x="4" y="4" width="16" height="16" />
      <path {...S} d="M4 9h16M4 14h16M9 4v16M14 4v16" />
    </>
  ),
  'type-portrait': () => (
    <>
      <rect {...S} x="6" y="3" width="12" height="18" />
      <circle {...S} cx="12" cy="9" r="2.5" />
      <path {...S} d="M8 18c1-3 3-4 4-4s3 1 4 4" />
    </>
  ),
  'type-hero': () => (
    <>
      <rect {...S} x="3" y="6" width="18" height="12" />
      <path {...S} d="M6 14h5M6 11h8" />
    </>
  ),
  'type-background': () => (
    <>
      <rect {...S} x="3" y="5" width="18" height="14" />
      <path {...S} d="M3 16l6-5 4 3 8-6" />
    </>
  ),
  'type-illustration': () => (
    <>
      <path {...S} d="M5 18l5-12 4 7 2-4 3 9" />
      <path {...S} d="M4 18h16" />
    </>
  ),
  'type-uploaded': () => (
    <>
      <rect {...S} x="5" y="4" width="10" height="14" />
      <path {...S} d="M15 8h4v12H9" />
    </>
  ),
  'type-grok': () => (
    <>
      <path {...S} d="M12 5v14M5 12h14M7.5 7.5l9 9M16.5 7.5l-9 9" />
    </>
  ),
  'type-founder': () => (
    <>
      <circle {...S} cx="12" cy="8" r="3" />
      <path {...S} d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
    </>
  ),
  'type-project': () => (
    <>
      <path {...S} d="M4 8h16v12H4z" />
      <path {...S} d="M4 8l3-4h10l3 4" />
    </>
  ),
  staged: () => (
    <>
      <rect {...S} x="5" y="5" width="14" height="14" />
      <path {...S} d="M8 12h8" />
    </>
  ),
  approved: () => (
    <>
      <rect {...S} x="5" y="5" width="14" height="14" />
      <path {...S} d="M8 12l3 3 5-6" />
    </>
  ),
  implemented: () => (
    <>
      <rect {...S} x="5" y="5" width="14" height="14" />
      <path {...S} d="M8 12h8M12 8v8" />
    </>
  ),
  replaced: () => (
    <>
      <rect {...S} x="5" y="5" width="10" height="10" />
      <path {...S} d="M11 13h8v6h-8z" />
    </>
  ),
  archived: () => (
    <>
      <path {...S} d="M4 7h16v3H4z" />
      <path {...S} d="M6 10v9h12v-9" />
    </>
  ),
  'authority-none': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M8 12h8" />
    </>
  ),
  'authority-active': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M8 10h5M8 14h8" />
    </>
  ),
  'authority-approved': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M8 13l3 2 5-5" />
    </>
  ),
  'authority-new': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M12 9v6M9 12h6" />
    </>
  ),
  'authority-attached': () => (
    <>
      <rect {...S} x="4" y="6" width="16" height="12" />
      <path {...S} d="M8 12h3l1-2 2 4 2-2h2" />
    </>
  ),
  'stage-01': () => <Stage n="01" />,
  'stage-02': () => <Stage n="02" />,
  'stage-03': () => <Stage n="03" />,
  'stage-04': () => <Stage n="04" />,
  'stage-05': () => <Stage n="05" />,
  'stage-06': () => <Stage n="06" />,
  'stage-07': () => <Stage n="07" />,
  'stage-08': () => <Stage n="08" />,
  'stage-09': () => <Stage n="09" />,
  'stage-10': () => <Stage n="10" />,
  'stage-11': () => <Stage n="11" />,
  placeholder: () => (
    <>
      <rect {...S} x="4" y="4" width="16" height="16" />
      <path {...S} d="M8 12h8" />
    </>
  ),
};

function Stage({ n }: { n: string }) {
  return (
    <>
      <rect {...S} x="2.5" y="2.5" width="19" height="19" />
      <text
        x="12"
        y="16.4"
        textAnchor="middle"
        fill="currentColor"
        fontSize="9.2"
        fontFamily="Martian Mono, ui-monospace, monospace"
        fontWeight="800"
        letterSpacing="-0.08em"
      >
        {n}
      </text>
    </>
  );
}

export const DVS_GLYPH_NAMES = Object.keys(DVS_GLYPHS);
