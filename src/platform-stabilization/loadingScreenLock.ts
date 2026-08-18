import { isSite00ImmersivePath } from '../site00/components/loader/site00LoaderPaths';

let loadingScreenLockCount = 0;

type SavedStyles = {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyTouchAction: string;
  bodyBg: string;
  rootOverflow: string;
};

let saved: SavedStyles | null = null;

export function acquireLoadingScreenDocumentLock(): () => void {
  if (typeof document === 'undefined') return () => undefined;

  if (loadingScreenLockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    saved = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
      bodyBg: body.style.backgroundColor,
      rootOverflow: root?.style.overflow ?? '',
    };
    html.setAttribute('data-loading-screen', 'true');
    html.style.overflow = 'hidden';
    const asstsBoot =
      typeof window !== 'undefined' &&
      isSite00ImmersivePath(window.location.pathname) &&
      document.documentElement.classList.contains('site00-assts-boot');
    const bootBg = asstsBoot ? '#f5f5f3' : '#ffffff';
    html.style.backgroundColor = bootBg;
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    body.style.backgroundColor = bootBg;
    if (root) root.style.overflow = 'hidden';
  }

  loadingScreenLockCount += 1;
  return () => releaseLoadingScreenDocumentLock();
}

export function releaseLoadingScreenDocumentLock(): void {
  if (typeof document === 'undefined') return;
  loadingScreenLockCount = Math.max(0, loadingScreenLockCount - 1);
  if (loadingScreenLockCount > 0) return;
  clearLoadingScreenDocumentLock();
}

export function clearLoadingScreenDocumentLock(): void {
  if (typeof document === 'undefined') return;
  loadingScreenLockCount = 0;
  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  html.removeAttribute('data-loading-screen');
  if (saved) {
    html.style.overflow = saved.htmlOverflow;
    html.style.backgroundColor = '';
    body.style.overflow = saved.bodyOverflow;
    body.style.touchAction = saved.bodyTouchAction;
    body.style.backgroundColor = saved.bodyBg;
    if (root) root.style.overflow = saved.rootOverflow;
    saved = null;
  }
}
