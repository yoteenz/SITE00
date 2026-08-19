export type Site00MobilePresentationMode = 'none' | 'scaled';

/**
 * Resolve how mobile preview should render on Composer routes.
 *
 * - Phone + Mobile → native full-width mobile (actual device)
 * - Laptop + Mobile → centered phone device frame with 390×844 artboard (true phone preview)
 */
export function resolveSite00MobilePresentationMode(
  isPreviewDesktop: boolean,
  isWideViewport: boolean,
): Site00MobilePresentationMode {
  if (isPreviewDesktop) return 'none';
  if (isWideViewport) return 'scaled';
  return 'none';
}
