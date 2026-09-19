/**
 * B5.9R9 / B5.9R10 — Projects page account identity for hero eyebrow.
 */

import { useMemo } from 'react';
import { getClient } from '../../../shared/site00-projects/clientSimulation/clientDirectoryService.js';
import { resolveProjectsViewAccountIdentity } from '../../../shared/site00-projects/projectsAccountIdentityAdapter.js';
import type { AccountDisplayIdentity } from '../../../shared/site00-projects/accountDisplayIdentity.js';
import { useSite00AccountProfileIdentity } from './useSite00AccountProfileIdentity.js';
import { useSite00ProjectsIndex } from './useSite00Projects.js';
import { useProjectViewMode } from '../context/ProjectViewModeContext.js';

export function useProjectsAccountIdentity(): {
  identity: AccountDisplayIdentity;
  eyebrow: string | null;
  isHydrating: boolean;
} {
  const { profile, authMetadataProfile, isHydrating, user } = useSite00AccountProfileIdentity();
  const { viewMode, isSimulatingClient, activeSimulatedClientId } = useProjectViewMode();
  const { clientProjects } = useSite00ProjectsIndex();

  return useMemo(() => {
    const directoryClient = activeSimulatedClientId
      ? getClient(activeSimulatedClientId, clientProjects ?? [])
      : null;

    const simulatedClientDirectoryProfile = directoryClient
      ? {
          accountId: directoryClient.accountId ?? directoryClient.clientId,
          userId: directoryClient.userId ?? null,
          email: null,
          firstName: directoryClient.firstName,
          lastName: directoryClient.lastName,
          displayName: directoryClient.displayName,
        }
      : null;

    return {
      ...resolveProjectsViewAccountIdentity({
        viewMode: viewMode === 'CLIENT' ? 'CLIENT' : 'FOUNDER',
        isSimulatingClient,
        isHydrating,
        authenticatedProfile: profile,
        authMetadataProfile,
        activeSimulatedClientId,
        simulatedClientDirectoryProfile,
        founderEmail: user?.email ?? null,
      }),
      isHydrating,
    };
  }, [
    profile,
    authMetadataProfile,
    isHydrating,
    user?.email,
    viewMode,
    isSimulatingClient,
    activeSimulatedClientId,
    clientProjects,
  ]);
}
