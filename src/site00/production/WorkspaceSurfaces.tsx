/**
 * Root-tab surface selection for the ACTIVE project (P0 project isolation).
 *
 * NDXBOOK Entry 002 keeps its established authority bodies (HUB / INBOX / ACTIVITY), which read only NDXBOOK's
 * own production facts. Every other project renders the graph projection of its own production truth — never
 * NDXBOOK's bodies. LIBRARY is generated from the graph's artifact records for every project.
 */
import { ActivityBody } from '../components/productionAuthority/ActivityBody';
import { HubBody } from '../components/productionAuthority/HubBody';
import { InboxBody } from '../components/productionAuthority/InboxBody';
import { useProductionAuthorityData } from '../components/productionAuthority/ProductionAuthorityData';
import { ProjectActivityBody, ProjectHubBody, ProjectInboxBody, ProjectLibraryBody } from '../components/productionAuthority/projectGraph/ProjectProjections';

function useIsEntry002(): boolean {
  return !!useProductionAuthorityData()?.isEntry002;
}

export function HubSurface() {
  return useIsEntry002() ? <HubBody /> : <ProjectHubBody />;
}

export function InboxSurface() {
  return useIsEntry002() ? <InboxBody /> : <ProjectInboxBody />;
}

export function ActivitySurface() {
  return useIsEntry002() ? <ActivityBody /> : <ProjectActivityBody />;
}

export function LibrarySurface() {
  return <ProjectLibraryBody />;
}
