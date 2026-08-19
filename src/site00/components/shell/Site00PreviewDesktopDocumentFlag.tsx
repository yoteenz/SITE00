import { useEffect } from 'react';
import { useSite00 } from '../../state/Site00Context';

/** Sync preview-desktop mode to `<html>` for CSS that must apply below 768px. */
export function Site00PreviewDesktopDocumentFlag() {
  const { isPreviewDesktop } = useSite00();

  useEffect(() => {
    const root = document.documentElement;
    if (isPreviewDesktop) {
      root.setAttribute('data-site00-preview-desktop', '1');
    } else {
      root.removeAttribute('data-site00-preview-desktop');
    }
    return () => root.removeAttribute('data-site00-preview-desktop');
  }, [isPreviewDesktop]);

  return null;
}
