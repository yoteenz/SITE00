/** Pick status strip layout from artboard shell (desktop composition) vs mobile origin layout. */
export function useOriginStatusStripLayout(isDesktopArtboardLayout: boolean): 'desktop' | 'mobile' {
  if (isDesktopArtboardLayout) return 'desktop';
  return 'mobile';
}
