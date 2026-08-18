import { shouldShowSite00ImmersiveLoader } from './site00LoaderSession';
import { isSite00ImmersivePath } from './site00LoaderPaths';
import { isSite00OriginWideViewport } from '../shell/site00OriginViewport';
import { resolveSite00LoaderBackgroundUrl, site00LoaderGeometryPreloadUrl } from './site00LoaderMedia';
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
  const bootBg = resolveSite00LoaderBackgroundUrl(isSite00OriginWideViewport() ? 'desktop' : 'mobile');
  shell.innerHTML = `<div class="site00-assts-boot-shell__env" style="background-image:url('${bootBg}')"></div>`;
  document.body.appendChild(shell);
}

/** Earliest possible SITE 00 immersive bootstrap — before React suspense. */
export function initSite00ImmersiveLoaderBoot(): void {
  if (typeof window === 'undefined') return;
  if (!isSite00ImmersivePath(window.location.pathname)) return;
  if (!shouldShowSite00ImmersiveLoader()) return;

  document.documentElement.classList.add(BOOT_CLASS);
  ensureBootShell();

  const bg = resolveSite00LoaderBackgroundUrl(isSite00OriginWideViewport() ? 'desktop' : 'mobile');
  injectPreload(bg, 'image');
  void preloadSite00LoaderBackground(bg);

  const geometryUrl = site00LoaderGeometryPreloadUrl('screen');
  injectPreload(geometryUrl, 'fetch');
  void preloadSite00LoaderAnimation(geometryUrl);
}

/** @deprecated Use initSite00ImmersiveLoaderBoot */
export const initSite00AsstsLoaderBoot = initSite00ImmersiveLoaderBoot;

/** Fade out boot shell, then release #root — only after React loader has painted. */
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
