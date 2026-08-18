/**
 * SITE 00 environment registry — separates ENVIRONMENT from INTERFACE.
 * Production assets referenced here; temporary CSS fallbacks when unavailable.
 */

/** Approved Origin desktop environment (Supabase live-preview/site00/). */
export const SITE00_ORIGIN_DESKTOP_BACKGROUND_PATH = '942898D3-6953-47CD-8987-0697EC1C9F11.png';

/** Approved Origin mobile homepage environment (Supabase live-preview/site00/). */
export const SITE00_ORIGIN_MOBILE_BACKGROUND_PATH = 'C63192EC-00BE-46DB-8D3A-952173F6F5D1.png';

/** Approved Enter 00 desktop menu environment (Supabase live-preview/site00/). */
export const SITE00_ENTER_DESKTOP_BACKGROUND_PATH = '89319E70-D080-4798-9BCA-E53B137F2387.png';

/** Approved IDNTY/BLDR workflow hall desktop environment — state routes only (Supabase live-preview/site00/). */
export const SITE00_WORKFLOW_DESKTOP_BACKGROUND_PATH = '3A2AC3AD-7192-45E8-B4B3-B811CB0DD792.png';

/** Approved IDNTY onboarding assessment — desktop (Supabase live-preview/site00/). */
export const SITE00_IDNTY_ASSESSMENT_DESKTOP_BACKGROUND_PATH = '3D3D5A0F-2F77-4F8A-AA51-81C87902905B.png';

/** Approved IDNTY onboarding assessment — mobile (Supabase live-preview/site00/). */
export const SITE00_IDNTY_ASSESSMENT_MOBILE_BACKGROUND_PATH = 'F17CDD7D-59F5-4072-9B1C-D6CC942485A7.png';

export type EnvironmentId =
  | 'ORIGIN_ENVIRONMENT'
  | 'WORKFLOW_ENVIRONMENT'
  | 'ENTER_00_WAITING_ROOM'
  | 'IDNTY_ASSESSMENT_ENVIRONMENT';

export type FocalPoint = {
  x: string;
  y: string;
};

export type EnvironmentConfig = {
  id: EnvironmentId;
  asset?: string;
  /** Supabase live-preview path — resolved at runtime; desktop viewport only. */
  desktopAssetPath?: string;
  /** Supabase live-preview path — resolved at runtime; mobile viewport only (<768px). */
  mobileAssetPath?: string;
  desktopPosition: string;
  mobilePosition: string;
  desktopScale: number;
  mobileScale: number;
  overlay?: string;
  lightingClass: string;
  /** CSS fallback when production asset unavailable */
  fallbackClass: string;
  routes: string[];
  notes?: string;
};

export const SITE00_ENVIRONMENTS: Record<EnvironmentId, EnvironmentConfig> = {
  ORIGIN_ENVIRONMENT: {
    id: 'ORIGIN_ENVIRONMENT',
    desktopAssetPath: SITE00_ORIGIN_DESKTOP_BACKGROUND_PATH,
    mobileAssetPath: SITE00_ORIGIN_MOBILE_BACKGROUND_PATH,
    desktopPosition: 'center center',
    mobilePosition: 'center center',
    desktopScale: 1,
    mobileScale: 1,
    lightingClass: 'site00-env--origin-lighting',
    fallbackClass: 'site00-env-fallback--origin',
    routes: ['/', '/origin'],
    notes: 'Approved Origin environment — desktop 942898D3 · mobile C63192EC @ live-preview/site00',
  },
  WORKFLOW_ENVIRONMENT: {
    id: 'WORKFLOW_ENVIRONMENT',
    desktopAssetPath: SITE00_WORKFLOW_DESKTOP_BACKGROUND_PATH,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
    desktopScale: 1,
    mobileScale: 1.2,
    lightingClass: 'site00-env--workflow-lighting',
    fallbackClass: 'site00-env-fallback--workflow',
    routes: ['/idnty/state', '/idnty/state/desktop', '/bldr/state', '/bldr/state/desktop', '/evolve/state', '/evolve/state/desktop'],
    notes: 'Approved workflow hall — IDNTY/BLDR/EVOLVE state routes (+ desktop artboard); 3A2AC3AD @ live-preview/site00',
  },
  ENTER_00_WAITING_ROOM: {
    id: 'ENTER_00_WAITING_ROOM',
    desktopAssetPath: SITE00_ENTER_DESKTOP_BACKGROUND_PATH,
    desktopPosition: 'center 34%',
    mobilePosition: '55% center',
    desktopScale: 1,
    mobileScale: 1.1,
    lightingClass: 'site00-env--enter-lighting',
    fallbackClass: 'site00-env-fallback--enter',
    routes: ['/enter'],
    notes: 'Approved Enter 00 desktop menu — 89319E70 @ live-preview/site00; desktop bg shifted up (see .site00-enter-page CSS)',
  },
  IDNTY_ASSESSMENT_ENVIRONMENT: {
    id: 'IDNTY_ASSESSMENT_ENVIRONMENT',
    desktopAssetPath: SITE00_IDNTY_ASSESSMENT_DESKTOP_BACKGROUND_PATH,
    mobileAssetPath: SITE00_IDNTY_ASSESSMENT_MOBILE_BACKGROUND_PATH,
    desktopPosition: 'center center',
    mobilePosition: '50% 30%',
    desktopScale: 1,
    mobileScale: 1,
    lightingClass: 'site00-env--idnty-assessment-lighting',
    fallbackClass: 'site00-env-fallback--idnty-assessment',
    routes: ['/idnty/starting-at-zero', '/idnty/some-pieces-exist', '/idnty/needs-cohesion', '/idnty/ready-for-evolution', '/idnty/build-ready'],
    notes: 'Approved IDNTY onboarding assessment — desktop 3D3D5A0F · mobile F17CDD7D @ live-preview/site00',
  },
};

export function getEnvironmentForPath(pathname: string): EnvironmentId | null {
  if (pathname === '/' || pathname === '/origin') return 'ORIGIN_ENVIRONMENT';
  if (pathname === '/enter') return 'ENTER_00_WAITING_ROOM';
  if (pathname.startsWith('/idnty/state') || pathname.startsWith('/bldr/state')) {
    return 'WORKFLOW_ENVIRONMENT';
  }
  if (
    pathname.startsWith('/idnty/starting-at-zero') ||
    pathname.startsWith('/idnty/some-pieces-exist') ||
    pathname.startsWith('/idnty/needs-cohesion') ||
    pathname.startsWith('/idnty/ready-for-evolution') ||
    pathname.startsWith('/idnty/build-ready') ||
    pathname.startsWith('/bldr/site') ||
    pathname.startsWith('/bldr/world') ||
    pathname.startsWith('/bldr/enterprise') ||
    pathname.startsWith('/bldr/not-sure')
  ) {
    return 'IDNTY_ASSESSMENT_ENVIRONMENT';
  }
  if (pathname.startsWith('/idnty') || pathname.startsWith('/bldr')) {
    return 'WORKFLOW_ENVIRONMENT';
  }
  return null;
}
