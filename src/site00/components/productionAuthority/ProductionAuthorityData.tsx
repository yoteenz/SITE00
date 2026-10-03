import { createContext, useContext, type ReactNode } from 'react';
import { useProductionHubData, type HubData } from '../productionHub/useProductionHubData';
import { PRODUCTION_PROJECT } from '../../config/production-authority-registry';

const Ctx = createContext<HubData | null>(null);

/**
 * One read of the existing Production Hub data (graph, attention, activity, cast, frames) shared by the
 * host chrome and the authority bodies. Nothing is authored here.
 */
export function ProductionAuthorityDataProvider({ children, projectId = PRODUCTION_PROJECT.slug }: { children: ReactNode; projectId?: string }) {
  const data = useProductionHubData(projectId);
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useProductionAuthorityData(): HubData | null {
  return useContext(Ctx);
}
