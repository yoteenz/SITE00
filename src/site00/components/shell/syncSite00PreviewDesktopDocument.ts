/** Keep `<html data-site00-preview-desktop>` in sync with composer Desktop toggle (sync, no effect flash). */
export function syncSite00PreviewDesktopDocument(isPreviewDesktop: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isPreviewDesktop) {
    root.setAttribute('data-site00-preview-desktop', '1');
  } else {
    root.removeAttribute('data-site00-preview-desktop');
  }
}
