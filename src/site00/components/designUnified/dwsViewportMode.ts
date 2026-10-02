/**
 * DESIGN UNIFIED WORKSPACE — VIEWPORT mode (final internal DESIGN mode, after ASSETS).
 *
 * One source of truth for the viewport chamber: device preset, custom size, orientation, zoom, route, overlays,
 * interaction inspection, compare pair and validation marks. Every expression (preview / presets / custom /
 * interaction / overlays / compare / validation) is a STATE of this one object — never a page. The outer DESIGN
 * workspace never recomposes when it changes.
 *
 * HOST / CLIENT FIREWALL: the host owns the controls + guides below; the client app owns everything inside the iframe.
 * Host QA guides (safe area / grid / bounds) are drawn by the host ABOVE the frame and never touch client CSS.
 *
 * All user-visible strings are UPPERCASE.
 */
import type { DwsFamily, DwsPCard, DwsPStage } from './dwsProfiles';

export type VpDevice = 'desktop' | 'tablet' | 'mobile' | 'custom';
export type VpOrientation = 'portrait' | 'landscape';
export type VpZoom = 'FIT' | '50' | '75' | '100';
export type VpExpression = 'preview' | 'presets' | 'custom' | 'interaction' | 'overlays' | 'compare' | 'validation';
export type VpMark = 'PASS' | 'FAIL';

export type VpState = {
  device: VpDevice;
  /** Orientation of the preset frame (custom derives it from width/height). */
  orientation: VpOrientation;
  custom: { width: number; height: number };
  zoom: VpZoom;
  route: string;
  expression: VpExpression;
  /** Interaction category under inspection. */
  interaction: string | null;
  overlays: { safe: boolean; grid: boolean; bounds: boolean };
  /** Two-up compare pair (presets only). */
  pair: [Exclude<VpDevice, 'custom'>, Exclude<VpDevice, 'custom'>];
  /** Bumped by REFRESH — remounts the client frame. */
  reloadKey: number;
  /** Reviewer marks per validation check. Absent = NOT RUN. */
  checks: Record<string, VpMark>;
  /** Reviewer marks per interaction inspection item (`category.index`). */
  inspect: Record<string, VpMark>;
};

export const VP_INITIAL: VpState = {
  device: 'desktop',
  orientation: 'landscape',
  custom: { width: 1024, height: 768 },
  zoom: 'FIT',
  route: 'home',
  expression: 'preview',
  interaction: null,
  overlays: { safe: false, grid: false, bounds: false },
  pair: ['desktop', 'mobile'],
  reloadKey: 0,
  checks: {},
  inspect: {},
};

/* ------------------------------------------------------------------ presets */

export type VpPreset = { id: Exclude<VpDevice, 'custom'>; label: string; device: string; icon: string; width: number; height: number; natural: VpOrientation };

/** `width`/`height` are the natural-orientation logical pixels handed to the client frame. */
export const VP_PRESETS: readonly VpPreset[] = [
  { id: 'desktop', label: 'DESKTOP', device: 'DESKTOP 1440', icon: 'monitor', width: 1440, height: 900, natural: 'landscape' },
  { id: 'tablet', label: 'TABLET', device: 'IPAD 11', icon: 'tablet', width: 834, height: 1194, natural: 'portrait' },
  { id: 'mobile', label: 'MOBILE', device: 'IPHONE 15', icon: 'phone', width: 393, height: 852, natural: 'portrait' },
];

export const VP_DEVICE_LABEL: Record<VpDevice, string> = { desktop: 'DESKTOP', tablet: 'TABLET', mobile: 'MOBILE', custom: 'CUSTOM' };
export const VP_ZOOMS: readonly VpZoom[] = ['FIT', '50', '75', '100'];
export const VP_ZOOM_LABEL: Record<VpZoom, string> = { FIT: 'FIT', '50': '50%', '75': '75%', '100': '100%' };
export const VP_MIN_DIM = 240;
export const VP_MAX_DIM = 3840;

export const clampDim = (n: number): number => (Number.isFinite(n) ? Math.min(VP_MAX_DIM, Math.max(VP_MIN_DIM, Math.round(n))) : VP_MIN_DIM);

/** Logical frame size for a device in the state's orientation. */
export function vpSize(vp: Pick<VpState, 'device' | 'orientation' | 'custom'>, device: VpDevice = vp.device): { width: number; height: number } {
  if (device === 'custom') return { width: clampDim(vp.custom.width), height: clampDim(vp.custom.height) };
  const p = VP_PRESETS.find((x) => x.id === device)!;
  if (device === vp.device && vp.orientation !== p.natural) return { width: p.height, height: p.width };
  return { width: p.width, height: p.height };
}

export function vpOrientation(vp: Pick<VpState, 'device' | 'orientation' | 'custom'>): VpOrientation {
  if (vp.device === 'custom') return vp.custom.width >= vp.custom.height ? 'landscape' : 'portrait';
  return vp.orientation;
}

/** Preset device a custom size most resembles — picks the host safe-area insets. */
export function vpClass(width: number): Exclude<VpDevice, 'custom'> {
  return width < 600 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop';
}

/** Host-drawn safe-area insets in logical px. (Guides only — the client frame is untouched.) */
export function vpSafeInsets(width: number, height: number): { top: number; right: number; bottom: number; left: number } {
  const short = Math.min(width, height);
  const landscape = width > height;
  if (short < 600) return landscape ? { top: 0, right: 47, bottom: 21, left: 47 } : { top: 47, right: 0, bottom: 34, left: 0 };
  if (width < 1280) return { top: 24, right: 0, bottom: 20, left: 0 };
  return { top: 16, right: 16, bottom: 16, left: 16 };
}

/** Scale applied to the client frame inside a chamber of `box` px. */
export function vpScale(zoom: VpZoom, size: { width: number; height: number }, box: { width: number; height: number }): number {
  if (zoom !== 'FIT') return Number(zoom) / 100;
  if (!box.width || !box.height) return 1;
  return Math.min(1, box.width / size.width, box.height / size.height);
}

/* ------------------------------------------------------------------ routes (the CLIENT APP's real routes) */

export type VpRoute = { id: string; label: string; section: string };

/** Sections of the dedicated client app (`/app/projects/:slug/*`). */
export const VP_ROUTES: readonly VpRoute[] = [
  { id: 'home', label: 'HOME', section: '' },
  { id: 'reviews', label: 'REVIEWS', section: 'reviews' },
  { id: 'inbox', label: 'INBOX', section: 'inbox' },
  { id: 'library', label: 'LIBRARY', section: 'library' },
  { id: 'profile', label: 'PROFILE', section: 'profile' },
];

/** Fixture project the client app renders in development builds (the preview route is DEV-only). */
export const VP_DEV_FIXTURE_SLUG = 'fixture-app-ndxbook';

/**
 * Client-preview URL. Production builds load the real client app project route; development builds load the
 * client app's own DEV preview route, which renders the NDXBOOK-like fixture manifest.
 */
export function vpPreviewUrl(projectSlug: string, routeId: string, dev: boolean): string {
  const r = VP_ROUTES.find((x) => x.id === routeId) ?? VP_ROUTES[0]!;
  const base = dev ? `/app/preview/${VP_DEV_FIXTURE_SLUG}` : `/app/projects/${projectSlug}`;
  return r.section ? `${base}/${r.section}` : base;
}

export const vpRoutePath = (routeId: string): string => `/${(VP_ROUTES.find((x) => x.id === routeId) ?? VP_ROUTES[0]!).label}`;

/* ------------------------------------------------------------------ interactions (inspection checklists) */

export type VpInteraction = { id: string; label: string; icon: string; items: string[] };

export const VP_INTERACTIONS: readonly VpInteraction[] = [
  { id: 'navigation', label: 'NAVIGATION FLOW', icon: 'route', items: ['BOTTOM NAV REACHABLE', 'ACTIVE STATE MATCHES ROUTE', 'BACK BEHAVIOUR'] },
  { id: 'drawers', label: 'DRAWERS', icon: 'layout', items: ['OPENS FROM ITS TRIGGER', 'CLOSES ON SCRIM AND CLOSE', 'FOCUS RETURNS TO TRIGGER'] },
  { id: 'modals', label: 'MODALS', icon: 'frame', items: ['SITS INSIDE THE SAFE AREA', 'SCROLLS WHEN TALL', 'DISMISS PATH IS CLEAR'] },
  { id: 'forms', label: 'FORMS', icon: 'doc', items: ['FIELDS REACHABLE', 'KEYBOARD DOES NOT COVER ACTIONS', 'ERROR STATES READABLE'] },
  { id: 'states', label: 'STATES', icon: 'layers', items: ['LOADING', 'EMPTY', 'ERROR'] },
];

/* ------------------------------------------------------------------ validation (honest: NOT RUN until a reviewer marks it) */

export const VP_CHECKS: readonly { id: string; label: string }[] = [
  { id: 'layouts', label: 'LAYOUTS' },
  { id: 'interactions', label: 'INTERACTIONS' },
  { id: 'responsive', label: 'RESPONSIVE' },
  { id: 'performance', label: 'PERFORMANCE' },
  { id: 'accessibility', label: 'ACCESSIBILITY' },
];

export type VpValidation = { passed: number; failed: number; total: number; status: 'NOT RUN' | 'IN PROGRESS' | 'REVIEW REQUIRED' | 'READY FOR PRODUCTION'; issues: number };

export function vpValidation(checks: Record<string, VpMark>): VpValidation {
  const total = VP_CHECKS.length;
  const passed = VP_CHECKS.filter((c) => checks[c.id] === 'PASS').length;
  const failed = VP_CHECKS.filter((c) => checks[c.id] === 'FAIL').length;
  const status = failed > 0 ? 'REVIEW REQUIRED' : passed === total ? 'READY FOR PRODUCTION' : passed > 0 ? 'IN PROGRESS' : 'NOT RUN';
  return { passed, failed, total, status, issues: failed };
}

/* ------------------------------------------------------------------ design pipeline + on your table (extends the existing data model) */

/** VIEWPORT is the last DESIGN validation step, immediately before PRODUCTION. */
export const VP_PIPELINE: DwsPStage[] = [
  { code: '01', label: 'RESEARCH' },
  { code: '02', label: 'CONCEPT' },
  { code: '03', label: 'AUTHORITY' },
  { code: '04', label: 'PAGE FAMILY' },
  { code: '05', label: 'COMPONENTS' },
  { code: '06', label: 'REFINE' },
  { code: '07', label: 'VIEWPORT' },
  { code: '08', label: 'PRODUCTION' },
];
export const VP_PIPELINE_ACTIVE = 6;

const card = (title: string, sub: string, action: DwsPCard['action'], badge?: string): DwsPCard => ({ title, sub, action, badge });

const VP_TABLE: DwsPCard[] = [
  card('RESPONSIVE REVIEW', 'DESKTOP + TABLET + MOBILE', 'REVIEW', 'PAGE 014'),
  card('VIEWPORT REVIEW', 'CLIENT PREVIEW / HOME', 'APPROVE'),
  card('INTERACTION REVIEW', 'NAVIGATION FLOW', 'REVIEW'),
  card('SAFE-AREA CHECK', 'OVERLAYS / DRAWERS & MODALS', 'CHOOSE'),
];

export const VP_DECK: Record<DwsFamily, { pipeline: DwsPStage[]; table: DwsPCard[] }> = {
  desktop: { pipeline: VP_PIPELINE, table: VP_TABLE.slice(0, 3) },
  tabletL: { pipeline: VP_PIPELINE, table: VP_TABLE },
  tabletP: { pipeline: VP_PIPELINE, table: VP_TABLE },
  mobile: { pipeline: VP_PIPELINE, table: VP_TABLE.slice(0, 3) },
};

/** Authority images for the VIEWPORT tab (pack SITE00_VIEWPORT_TAB_SONNET_LITE). */
export const VP_AUTHORITY = [
  { path: '01_AUTHORITIES/01_DESKTOP_VIEWPORT_AUTHORITY.jpeg', family: 'desktop', appliedTo: 'DwsViewportStage (3-zone chamber)' },
  { path: '01_AUTHORITIES/02_TABLET_VIEWPORT_AUTHORITY.jpeg', family: 'tabletL / tabletP', appliedTo: 'DwsViewportStage (tablet derivation)' },
  { path: '01_AUTHORITIES/03_MOBILE_VIEWPORT_AUTHORITY.jpeg', family: 'mobile', appliedTo: 'DwsViewportStage (rails + control strip + validation card)' },
] as const;
