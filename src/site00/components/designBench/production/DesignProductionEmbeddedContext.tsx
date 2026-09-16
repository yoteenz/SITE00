import { createContext, useContext, type ReactNode } from 'react';

const DesignProductionEmbeddedContext = createContext(false);

export function DesignProductionEmbeddedProvider({
  embedded,
  children,
}: {
  embedded: boolean;
  children: ReactNode;
}) {
  return (
    <DesignProductionEmbeddedContext.Provider value={embedded}>
      {children}
    </DesignProductionEmbeddedContext.Provider>
  );
}

export function useDesignProductionEmbedded() {
  return useContext(DesignProductionEmbeddedContext);
}
