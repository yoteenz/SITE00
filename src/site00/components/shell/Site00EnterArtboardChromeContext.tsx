import { createContext, useContext, type RefObject, type ReactNode } from 'react';

const Site00EnterArtboardChromeContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function Site00EnterArtboardChromeProvider({
  hostRef,
  children,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <Site00EnterArtboardChromeContext.Provider value={hostRef}>{children}</Site00EnterArtboardChromeContext.Provider>
  );
}

export function useSite00EnterArtboardChromeHost(): RefObject<HTMLDivElement | null> | null {
  return useContext(Site00EnterArtboardChromeContext);
}
