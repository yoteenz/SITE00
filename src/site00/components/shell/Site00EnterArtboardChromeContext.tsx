import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Site00EnterArtboardChromeContextValue = {
  hostElement: HTMLDivElement | null;
  setHostElement: (element: HTMLDivElement | null) => void;
};

const Site00EnterArtboardChromeContext = createContext<Site00EnterArtboardChromeContextValue | null>(null);

export function Site00EnterArtboardChromeProvider({ children }: { children: ReactNode }) {
  const [hostElement, setHostElement] = useState<HTMLDivElement | null>(null);
  const value = useMemo(() => ({ hostElement, setHostElement }), [hostElement]);

  return (
    <Site00EnterArtboardChromeContext.Provider value={value}>{children}</Site00EnterArtboardChromeContext.Provider>
  );
}

export function useSite00EnterArtboardChromeHostElement(): HTMLDivElement | null {
  return useContext(Site00EnterArtboardChromeContext)?.hostElement ?? null;
}

export function useSite00EnterArtboardChromeHostActions() {
  const context = useContext(Site00EnterArtboardChromeContext);
  if (!context) {
    throw new Error('useSite00EnterArtboardChromeHostActions requires Site00EnterArtboardChromeProvider');
  }
  return context;
}
