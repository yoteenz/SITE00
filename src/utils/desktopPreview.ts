/** Fixed desktop artboard for phone preview (`/desktop-preview`). */
export const DESKTOP_PREVIEW_VIEWPORT_WIDTH = 1920;
export const DESKTOP_PREVIEW_VIEWPORT_HEIGHT = 1080;

export const DESKTOP_EMBED_QUERY = 'desktopEmbed';
export const MOBILE_DESKTOP_QUERY = 'mobileDesktop';
const MOBILE_DESKTOP_SESSION_KEY = 'baw_mobile_desktop';

const PREVIEW_PREFIX = '/desktop-preview';
const DESKTOP_PREFIX = '/desktop';

const DEFAULT_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0';
const OUTER_PREVIEW_VIEWPORT_CONTENT =
  'width=device-width, initial-scale=1, viewport-fit=cover';

let outerViewportLockInstalled = false;
let mobileDesktopViewportInstalled = false;

/** Staging / dev only — not exposed on production custom domain (e.g. frontalslayer.com). */
export function isDesktopPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (host === 'fsbw.vercel.app' || host.endsWith('.vercel.app')) return true;
  const env =
    (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_VERCEL_ENV) ||
    undefined;
  return env === 'preview' || env === 'development';
}

/** Parent shell routes (`/desktop-preview`, `/desktop-preview/*`). */
export function isDesktopPreviewWrapperPath(pathname: string): boolean {
  return pathname === PREVIEW_PREFIX || pathname.startsWith(`${PREVIEW_PREFIX}/`);
}

/** True when preview shell is active (direct render or legacy embed query). */
export function isDesktopPreviewActive(): boolean {
  if (typeof window === 'undefined') return false;
  if (isDesktopPreviewWrapperPath(window.location.pathname)) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get(DESKTOP_EMBED_QUERY) === '1') return true;
  } catch {
    /* ignore */
  }
  return false;
}

const DESKTOP_LAYOUT_BREAKPOINT = 1024;
/** Scaled 1920×1080 artboard on `/desktop/*` — phones only; tablets use native layout like desktop. */
const DESKTOP_PHONE_ARTBOARD_MAX_WIDTH = 767;

function isDesktopRoutePath(pathname: string): boolean {
  return pathname === DESKTOP_PREFIX || pathname.startsWith(`${DESKTOP_PREFIX}/`);
}

function isPhoneDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= DESKTOP_PHONE_ARTBOARD_MAX_WIDTH;
}

/**
 * Phone-only `/desktop/*` artboard mode — width-fit scaled 1920×1080 shell.
 * Active when: staging `?mobileDesktop=1` (tab session), or viewport ≤767px (phones).
 * Tablets (768px+) and desktops use native full-bleed layout.
 */
export function isMobileDesktopBypassActive(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isDesktopRoutePath(window.location.pathname)) return false;

  if (isDesktopPreviewEnvironment()) {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get(MOBILE_DESKTOP_QUERY) === '1') {
        window.sessionStorage.setItem(MOBILE_DESKTOP_SESSION_KEY, '1');
        return true;
      }
      if (window.sessionStorage.getItem(MOBILE_DESKTOP_SESSION_KEY) === '1') return true;
    } catch {
      /* ignore */
    }
  }

  return isPhoneDesktopViewport();
}

/** Never block `/desktop/*` with the "designed for desktop" gate — mobile gets artboard layout. */
export function shouldShowDesktopViewportGate(): boolean {
  if (typeof window !== 'undefined' && isDesktopRoutePath(window.location.pathname)) return false;
  return getDesktopLayoutViewportWidth() < DESKTOP_LAYOUT_BREAKPOINT;
}

/** Desktop artboard layout (1920-wide) — preview shell or mobile desktop bypass. */
export function isDesktopArtboardLayoutActive(): boolean {
  return isDesktopPreviewActive() || isMobileDesktopBypassActive();
}

/** Layout width for desktop breakpoint checks — fixed 1920 inside preview shell. */
export function getDesktopLayoutViewportWidth(): number {
  if (isDesktopArtboardLayoutActive()) return DESKTOP_PREVIEW_VIEWPORT_WIDTH;
  return typeof window !== 'undefined' ? window.innerWidth : DESKTOP_PREVIEW_VIEWPORT_WIDTH;
}

/** Hero / full-screen desktop sections: 1080px artboard in preview, real vh on desktop. */
export function desktopArtboardHeightStyle(): string {
  return isDesktopArtboardLayoutActive() ? `${DESKTOP_PREVIEW_VIEWPORT_HEIGHT}px` : '100vh';
}

/** @deprecated Legacy iframe embed detection; preview no longer uses iframes. */
export function isDesktopEmbedFrame(): boolean {
  return isDesktopPreviewActive() && window.self !== window.top;
}

/** Map `/desktop-preview/...` → `/desktop/...` route key. */
export function resolveDesktopIframePath(previewPathname: string): string {
  if (previewPathname === PREVIEW_PREFIX || previewPathname === `${PREVIEW_PREFIX}/`) {
    return `${DESKTOP_PREFIX}/penthouse`;
  }
  if (previewPathname.startsWith(`${PREVIEW_PREFIX}/`)) {
    const suffix = previewPathname.slice(PREVIEW_PREFIX.length);
    return `${DESKTOP_PREFIX}${suffix}`;
  }
  return `${DESKTOP_PREFIX}/penthouse`;
}

function setViewportContent(content: string): string {
  const meta = document.querySelector('meta[name="viewport"]');
  const previous = meta?.getAttribute('content') ?? DEFAULT_VIEWPORT_CONTENT;
  meta?.setAttribute('content', content);
  return previous;
}

/** Outer `/desktop-preview` shell — lock viewport; scroll happens inside ScaledDesktopViewport. */
export function installDesktopPreviewShellViewportLock(
  options?: { background?: string },
): () => void {
  const background = options?.background ?? '#050505';
  if (typeof document === 'undefined' || outerViewportLockInstalled) {
    return () => undefined;
  }
  outerViewportLockInstalled = true;

  const previousViewport = setViewportContent(OUTER_PREVIEW_VIEWPORT_CONTENT);
  const previousHtmlOverflow = document.documentElement.style.overflow;
  const previousBodyOverflow = document.body.style.overflow;
  const previousHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;
  const previousBodyOverscroll = document.body.style.overscrollBehaviorY;
  const previousBodyMargin = document.body.style.margin;
  const previousBodyBackground = document.body.style.background;
  const previousBodyTouchAction = document.body.style.touchAction;
  const root = document.getElementById('root');
  const previousRootHeight = root?.style.height ?? '';
  const previousRootOverflow = root?.style.overflow ?? '';
  const previousRootPosition = root?.style.position ?? '';

  document.documentElement.style.height = '100%';
  document.body.style.height = '100%';
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overscrollBehaviorY = 'none';
  document.body.style.overscrollBehaviorY = 'none';
  document.body.style.margin = '0';
  document.body.style.background = background;
  document.body.style.touchAction = 'auto';
  if (root) {
    root.style.height = '100%';
    root.style.overflow = 'hidden';
    root.style.position = 'relative';
  }

  return () => {
    outerViewportLockInstalled = false;
    setViewportContent(previousViewport);
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overscrollBehaviorY = previousHtmlOverscroll;
    document.body.style.overscrollBehaviorY = previousBodyOverscroll;
    document.body.style.margin = previousBodyMargin;
    document.body.style.background = previousBodyBackground;
    document.body.style.touchAction = previousBodyTouchAction;
    if (root) {
      root.style.height = previousRootHeight;
      root.style.overflow = previousRootOverflow;
      root.style.position = previousRootPosition;
    }
  };
}

export type DesktopPreviewScaleBox = {
  scale: number;
  width: number;
  height: number;
};

export function bootstrapMobileDesktopViewport(): void {
  if (!isMobileDesktopBypassActive()) return;
  if (typeof document === 'undefined' || mobileDesktopViewportInstalled) return;
  mobileDesktopViewportInstalled = true;
  // Viewport + scale are owned by DesktopRouteShell → ScaledDesktopViewport on `/desktop/*`.
}

export function bootstrapDesktopPreviewModes(): void {
  bootstrapMobileDesktopViewport();
}

export function measureDesktopPreviewScaleBox(
  shellWidth: number,
  _shellHeight: number,
): DesktopPreviewScaleBox {
  const scale = shellWidth / DESKTOP_PREVIEW_VIEWPORT_WIDTH;
  return {
    scale,
    width: DESKTOP_PREVIEW_VIEWPORT_WIDTH * scale,
    height: DESKTOP_PREVIEW_VIEWPORT_HEIGHT * scale,
  };
}
