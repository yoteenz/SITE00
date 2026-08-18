import { createContext, useContext, type ReactNode } from 'react';

const Site00DesktopArtboardContext = createContext(false);

export function Site00DesktopArtboardProvider({ children }: { children: ReactNode }) {
  return (
    <Site00DesktopArtboardContext.Provider value={true}>{children}</Site00DesktopArtboardContext.Provider>
  );
}

export function useSite00DesktopArtboardPreview(): boolean {
  return useContext(Site00DesktopArtboardContext);
}
