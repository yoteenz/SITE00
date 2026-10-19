import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type RegistrySortKey = 'name' | 'activity' | 'lifecycle';

export type RegistryFilterState = {
  query: string;
  stateFilter: string;
  sortKey: RegistrySortKey;
};

type RegistryFilterContextValue = RegistryFilterState & {
  setQuery: (q: string) => void;
  setStateFilter: (s: string) => void;
  setSortKey: (k: RegistrySortKey) => void;
  resetFilters: () => void;
  applyDraft: (draft: Partial<RegistryFilterState>) => void;
};

const defaultState: RegistryFilterState = {
  query: '',
  stateFilter: 'ALL',
  sortKey: 'activity',
};

const RegistryFilterContext = createContext<RegistryFilterContextValue | null>(null);

export function RegistryFilterProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState(defaultState.query);
  const [stateFilter, setStateFilter] = useState(defaultState.stateFilter);
  const [sortKey, setSortKey] = useState<RegistrySortKey>(defaultState.sortKey);

  const resetFilters = useCallback(() => {
    setQuery(defaultState.query);
    setStateFilter(defaultState.stateFilter);
    setSortKey(defaultState.sortKey);
  }, []);

  const applyDraft = useCallback((draft: Partial<RegistryFilterState>) => {
    if (draft.query !== undefined) setQuery(draft.query);
    if (draft.stateFilter !== undefined) setStateFilter(draft.stateFilter);
    if (draft.sortKey !== undefined) setSortKey(draft.sortKey);
  }, []);

  const value = useMemo(
    (): RegistryFilterContextValue => ({
      query,
      stateFilter,
      sortKey,
      setQuery,
      setStateFilter,
      setSortKey,
      resetFilters,
      applyDraft,
    }),
    [query, stateFilter, sortKey, resetFilters, applyDraft],
  );

  return <RegistryFilterContext.Provider value={value}>{children}</RegistryFilterContext.Provider>;
}

export function useRegistryFilters(): RegistryFilterContextValue {
  const ctx = useContext(RegistryFilterContext);
  if (!ctx) throw new Error('useRegistryFilters requires RegistryFilterProvider');
  return ctx;
}
