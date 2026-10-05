import { createContext, useContext, type ReactNode } from 'react';

const Site00MobileArtboardContext = createContext(false);

export function Site00MobileArtboardProvider({ children }: { children: ReactNode }) {
  return (
    <Site00MobileArtboardContext.Provider value={true}>{children}</Site00MobileArtboardContext.Provider>
  );
}

export function useSite00MobileArtboardPreview(): boolean {
  return useContext(Site00MobileArtboardContext);
}
