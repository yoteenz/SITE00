import { createContext, useContext, type ReactNode } from 'react';

export type Site00MobilePresentationKind = 'native' | 'scaled' | 'none';

const Site00MobilePresentationContext = createContext<Site00MobilePresentationKind>('none');

export function Site00MobilePresentationProvider({
  kind,
  children,
}: {
  kind: Site00MobilePresentationKind;
  children: ReactNode;
}) {
  return (
    <Site00MobilePresentationContext.Provider value={kind}>{children}</Site00MobilePresentationContext.Provider>
  );
}

export function useSite00MobilePresentationKind(): Site00MobilePresentationKind {
  return useContext(Site00MobilePresentationContext);
}

/** True when env bg is rendered on the mobile presentation shell (outside artboard transform). */
export function useSite00MobileViewportBackgroundActive(): boolean {
  return useSite00MobilePresentationKind() === 'scaled';
}
