import { shouldShowSite00ImmersiveLoader } from './site00LoaderSession';
import { isSite00ImmersivePath } from './site00LoaderPaths';
import {
  resolveSite00LoaderAnimationPreloadUrl,
  resolveSite00LoaderBackgroundFocal,
  resolveSite00LoaderBackgroundUrl,
  resolveSite00LoaderFooterMarkUrl,
  resolveSite00LoaderMediaPresentation,
} from './site00LoaderMedia';
import { preloadSite00LoaderAnimation, preloadSite00LoaderBackground } from './site00LoaderPreload';

const BOOT_CLASS = 'site00-assts-boot';
const SHELL_ID = 'site00-assts-boot-shell';

function injectPreload(href: string, as: 'image' | 'fetch' | 'video'): void {
  if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (as === 'image') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
}

function ensureBootShell(): void {
  const existing = document.getElementById(SHELL_ID);
  if (existing) {
    existing.hidden = false;
    return;
  }
  const shell = document.createElement('div');
  shell.id = SHELL_ID;
  shell.className = 'site00-assts-boot-shell';
  shell.setAttribute('aria-hidden', 'true');
  const bootPresentation = resolveSite00LoaderMediaPresentation();
  const bootBg = resolveSite00LoaderBackgroundUrl(bootPresentation);
  const bootFocal = resolveSite00LoaderBackgroundFocal(bootPresentation);
  shell.style.setProperty('--site00-loader-bg-focal', bootFocal);
  shell.innerHTML =
    `<div class="site00-assts-boot-shell__env">` +
    `<img class="site00-assts-boot-shell__img" src="${bootBg}" alt="" decoding="sync" fetchpriority="high" ` +
    `style="object-position:${bootFocal};object-fit:cover" draggable="false" />` +
    `</div>`;
  document.body.appendChild(shell);
}

/** Earliest possible SITE 00 immersive bootstrap — before React suspense. */
export function initSite00ImmersiveLoaderBoot(): void {
  if (typeof window === 'undefined') return;
  if (!isSite00ImmersivePath(window.location.pathname)) return;
  if (!shouldShowSite00ImmersiveLoader()) return;

  document.documentElement.classList.add(BOOT_CLASS);
  ensureBootShell();

  const presentation = resolveSite00LoaderMediaPresentation();
  const bg = resolveSite00LoaderBackgroundUrl(presentation);
  injectPreload(bg, 'image');
  void preloadSite00LoaderBackground(bg);

  const animationUrl = resolveSite00LoaderAnimationPreloadUrl(presentation);
  if (animationUrl) {
    injectPreload(animationUrl, 'fetch');
    void preloadSite00LoaderAnimation(animationUrl);
  }

  const footerMarkUrl = resolveSite00LoaderFooterMarkUrl();
  injectPreload(footerMarkUrl, 'image');
  void preloadSite00LoaderBackground(footerMarkUrl);
}

/** @deprecated Use initSite00ImmersiveLoaderBoot */
export const initSite00AsstsLoaderBoot = initSite00ImmersiveLoaderBoot;

/** Remove boot shell layer 1 — React static or MP4 owns the viewport after this. */
export function stripSite00BootShellBackground(): void {
  if (typeof document === 'undefined') return;
  const shell = document.getElementById(SHELL_ID);
  if (!shell) return;
  shell.querySelector('.site00-assts-boot-shell__env')?.remove();
}

/** Allow #root to paint destination under the loader — boot class only, shell stays until exit. */
export function releaseSite00ImmersiveBootRoot(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove(BOOT_CLASS);
}

/** Two frames so destination route can paint before loader portal is removed. */
export function waitForLoaderExitPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** Fade out boot shell and release #root — call once loader exit is complete. */
export function teardownSite00ImmersiveBootShell(): void {
  if (typeof document === 'undefined') return;

  const shell = document.getElementById(SHELL_ID);
  if (shell) {
    shell.classList.add('site00-assts-boot-shell--handoff');
    window.setTimeout(() => {
      shell.remove();
      document.documentElement.classList.remove(BOOT_CLASS);
    }, 220);
    return;
  }

  document.documentElement.classList.remove(BOOT_CLASS);
}

/** @deprecated Use teardownSite00ImmersiveBootShell */
export const teardownSite00AsstsBootShell = teardownSite00ImmersiveBootShell;
