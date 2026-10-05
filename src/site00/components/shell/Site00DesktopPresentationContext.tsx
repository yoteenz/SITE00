import { createContext, useContext, type ReactNode } from 'react';

export type Site00DesktopPresentationKind = 'native' | 'scaled' | 'none';

const Site00DesktopPresentationContext = createContext<Site00DesktopPresentationKind>('none');

export function Site00DesktopPresentationProvider({
  kind,
  children,
}: {
  kind: Site00DesktopPresentationKind;
  children: ReactNode;
}) {
  return (
    <Site00DesktopPresentationContext.Provider value={kind}>{children}</Site00DesktopPresentationContext.Provider>
  );
}

export function useSite00DesktopPresentationKind(): Site00DesktopPresentationKind {
  return useContext(Site00DesktopPresentationContext);
}

/** True when env bg is rendered on the presentation shell (outside artboard transform). */
export function useSite00DesktopViewportBackgroundActive(): boolean {
  return useSite00DesktopPresentationKind() === 'scaled';
}
