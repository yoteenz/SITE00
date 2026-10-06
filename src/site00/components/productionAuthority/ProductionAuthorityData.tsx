import { createContext, useContext, type ReactNode } from 'react';
import type { AssembledProjectGraph } from '../../../../shared/site00-production-graph/index.js';
import { useProductionHubData, type HubData } from '../productionHub/useProductionHubData';
import { useProjectGraph } from '../../production/useProjectGraph';

const Ctx = createContext<HubData | null>(null);
const GraphCtx = createContext<AssembledProjectGraph | null>(null);

/** The shared Production data context (exported for render tests and the HUB state QA harness). */
export const ProductionAuthorityDataContext = Ctx;
/** The active project's production graph (exported for render tests). */
export const ProjectGraphContext = GraphCtx;

/**
 * One read of ONE project's production truth, shared by the host chrome and every authority body:
 * the legacy Production Hub data (expression production facts) and the canonical project graph built from it.
 * The project is required — there is no default project (P0 project isolation).
 */
export function ProductionAuthorityDataProvider({ children, projectId }: { children: ReactNode; projectId: string }) {
  const data = useProductionHubData(projectId.toLowerCase());
  const graph = useProjectGraph(data);
  return (
    <Ctx.Provider value={data}>
      <GraphCtx.Provider value={graph}>{children}</GraphCtx.Provider>
    </Ctx.Provider>
  );
}

export function useProductionAuthorityData(): HubData | null {
  return useContext(Ctx);
}

/** The active project's graph (null outside a provider). */
export function useProjectGraphData(): AssembledProjectGraph | null {
  return useContext(GraphCtx);
}
