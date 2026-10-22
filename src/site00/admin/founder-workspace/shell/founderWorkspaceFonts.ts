/** Self-hosted FNDATN-01 faces used by the Opus founder workspace (see site00-correspondence-fonts.css). */

const FONT_BASE = '/site00-correspondence-studio/fndatn-01/fonts';

export const FOUNDER_WORKSPACE_FONT_PRELOADS = [
  `${FONT_BASE}/site00-correspondence-display.woff2?v=1.3`,
  `${FONT_BASE}/saira-semi-condensed-latin-400.woff2`,
  `${FONT_BASE}/saira-semi-condensed-latin-600.woff2`,
  `${FONT_BASE}/saira-semi-condensed-latin-700.woff2`,
] as const;

let preloadsInjected = false;

/** `<link rel="preload">` for workspace woff2 (once per document). */
export function injectFounderWorkspaceFontPreloads(): void {
  if (typeof document === 'undefined' || preloadsInjected) return;
  preloadsInjected = true;
  for (const href of FOUNDER_WORKSPACE_FONT_PRELOADS) {
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

/**
 * Wait until display + body weights used by ifw-authority are usable.
 * Returns false on timeout (caller should still reveal UI).
 */
export async function awaitFounderWorkspaceFonts(timeoutMs = 8000): Promise<boolean> {
  injectFounderWorkspaceFontPreloads();
  if (typeof document === 'undefined' || !document.fonts?.load) return true;

  const loads = [
    document.fonts.load('900 16px "SITE 00 Display"'),
    document.fonts.load('600 16px "SITE 00 Display"'),
    document.fonts.load('400 13px "Saira Semi Condensed"'),
    document.fonts.load('600 13px "Saira Semi Condensed"'),
    document.fonts.load('700 13px "Saira Semi Condensed"'),
  ];

  try {
    await Promise.race([
      Promise.all(loads),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('FOUNDER_WORKSPACE_FONT_TIMEOUT')), timeoutMs);
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}
