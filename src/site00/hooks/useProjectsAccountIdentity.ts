/**
 * B5.9R9 — Projects page account identity for hero eyebrow.
 */

import { useMemo } from 'react';
import { resolveProjectsViewAccountIdentity } from '../../../shared/site00-projects/projectsViewDataAdapter.js';
import type { AccountDisplayIdentity } from '../../../shared/site00-projects/accountDisplayIdentity.js';
import { useSite00CurrentUser } from './useSite00CurrentUser.js';
import { useSite00ProjectsIndex } from './useSite00Projects.js';
import { useProjectViewMode } from '../context/ProjectViewModeContext.js';

export function useProjectsAccountIdentity(): {
  identity: AccountDisplayIdentity;
  eyebrow: string;
} {
  const user = useSite00CurrentUser();
  const { viewMode, isSimulatingClient } = useProjectViewMode();
  const { clientProjects } = useSite00ProjectsIndex();

  return useMemo(() => {
    const activeOwner = clientProjects?.[0];
    return resolveProjectsViewAccountIdentity({
      viewMode: viewMode === 'CLIENT' ? 'CLIENT' : 'FOUNDER',
      isSimulatingClient,
      authenticatedProfile: {
        accountId: user?.email ?? null,
        email: user?.email ?? null,
        firstName: user?.firstName ?? null,
        lastName: user?.lastName ?? null,
        displayName: null,
      },
      activeClientProjectOwner: activeOwner
        ? {
            accountId: activeOwner.id,
            email: activeOwner.clientEmail ?? null,
            firstName: activeOwner.ownerFirstName ?? null,
            lastName: activeOwner.ownerLastName ?? null,
            displayName: activeOwner.ownerDisplayName ?? null,
          }
        : null,
      founderEmail: user?.email ?? null,
    });
  }, [user, viewMode, isSimulatingClient, clientProjects]);
}
