import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { ProductionWorkspaceContextState, ProductionWorkspaceType } from '../../../shared/site00-production-workspace/types.js';
import {
  mergeProductionContextOnWorkspaceSwitch,
  readProductionWorkspaceContext,
  writeProductionWorkspaceContext,
} from '../../../shared/site00-production-workspace/productionContextStorage.js';

type ProductionWorkspaceContextValue = {
  context: ProductionWorkspaceContextState;
  setProjectSlug: (slug: string) => void;
  setActiveWorkspace: (workspace: ProductionWorkspaceType) => void;
  setCampaignEntry: (campaignId: string | null, entryId: string | null, entryLabel?: string | null) => void;
};

const ProductionWorkspaceContext = createContext<ProductionWorkspaceContextValue | null>(null);

export function ProductionWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { projectSlug: routeSlug } = useParams<{ projectSlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [context, setContext] = useState<ProductionWorkspaceContextState>(() => {
    const stored = readProductionWorkspaceContext();
    const campaign = searchParams.get('campaign');
    const entry = searchParams.get('entry');
    return writeProductionWorkspaceContext({
      projectSlug: routeSlug?.toLowerCase() ?? stored?.projectSlug ?? '',
      activeWorkspace: stored?.activeWorkspace ?? 'DESIGN',
      campaignId: campaign ?? stored?.campaignId ?? null,
      entryId: entry ?? stored?.entryId ?? null,
      entryLabel: stored?.entryLabel ?? null,
    });
  });

  const setProjectSlug = useCallback((slug: string) => {
    setContext(writeProductionWorkspaceContext({ projectSlug: slug.toLowerCase() }));
  }, []);

  const setActiveWorkspace = useCallback(
    (workspace: ProductionWorkspaceType) => {
      setContext(mergeProductionContextOnWorkspaceSwitch(context.projectSlug, workspace));
    },
    [context.projectSlug],
  );

  const setCampaignEntry = useCallback(
    (campaignId: string | null, entryId: string | null, entryLabel?: string | null) => {
      // The entry is recorded under the route's project (campaign / entry never belong to another project).
      const next = writeProductionWorkspaceContext({
        ...(routeSlug ? { projectSlug: routeSlug.toLowerCase() } : {}),
        campaignId,
        entryId,
        entryLabel: entryLabel ?? null,
      });
      setContext(next);
      const params = new URLSearchParams(searchParams);
      if (campaignId) params.set('campaign', campaignId);
      else params.delete('campaign');
      if (entryId) params.set('entry', entryId);
      else params.delete('entry');
      setSearchParams(params, { replace: true });
    },
    [routeSlug, searchParams, setSearchParams],
  );

  const value = useMemo(
    () => ({ context, setProjectSlug, setActiveWorkspace, setCampaignEntry }),
    [context, setProjectSlug, setActiveWorkspace, setCampaignEntry],
  );

  return <ProductionWorkspaceContext.Provider value={value}>{children}</ProductionWorkspaceContext.Provider>;
}

export function useProductionWorkspaceContext(): ProductionWorkspaceContextValue {
  const ctx = useContext(ProductionWorkspaceContext);
  if (!ctx) throw new Error('ProductionWorkspaceProvider required');
  return ctx;
}
