/** SITE 00 Martian Mono — load verification (dev, one-time log). */

export const SITE00_TYPEFACE_NAME = 'Martian Mono';

const LOG_PREFIX = 'SITE 00 TYPEFACE:';

let verifyPromise: Promise<boolean> | null = null;
let logged = false;

/** Load Martian Mono via Font Loading API, then verify with document.fonts.check. */
export async function verifySite00MartianMonoLoaded(): Promise<boolean> {
  if (verifyPromise) return verifyPromise;

  verifyPromise = (async () => {
    if (typeof document === 'undefined' || !document.fonts) return false;

    const probe = `700 16px "${SITE00_TYPEFACE_NAME}"`;
    try {
      await document.fonts.load(probe);
      await document.fonts.ready;
    } catch {
      /* proceed to check */
    }

    return document.fonts.check(probe);
  })();

  return verifyPromise;
}

/** Log once per session in development builds. */
export async function logSite00TypefaceStatusOnce(): Promise<boolean> {
  const loaded = await verifySite00MartianMonoLoaded();
  if (logged || !import.meta.env.DEV) return loaded;

  logged = true;
  const status = loaded ? 'LOADED' : 'FAILED';
  // eslint-disable-next-line no-console
  console.info(`${LOG_PREFIX}\n${SITE00_TYPEFACE_NAME} — ${status}`);
  return loaded;
}

/** Resolve computed font family for an element (first family in stack). */
export function resolveRenderedFontFamily(el: Element): string {
  const family = getComputedStyle(el).fontFamily;
  const first = family.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
  return first ?? family;
}

export function isMartianMonoRendered(el: Element): boolean {
  return resolveRenderedFontFamily(el).toLowerCase().includes('martian mono');
}

export type Site00TypeMetrics = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontStretch: string;
  renderedWidth: number;
  renderedHeight: number;
  isMartianMono: boolean;
};

export function readSite00TypeMetrics(el: Element): Site00TypeMetrics {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    fontStretch: style.fontStretch,
    renderedWidth: Math.round(rect.width * 100) / 100,
    renderedHeight: Math.round(rect.height * 100) / 100,
    isMartianMono: isMartianMonoRendered(el),
  };
}

export function isSite00TypeTestEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('site00TypeTest') === '1';
}
