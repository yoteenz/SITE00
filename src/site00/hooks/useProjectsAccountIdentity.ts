/**
 * B5.9R9 / B5.9R9R1 — Projects page account identity for hero eyebrow.
 */

import { useMemo } from 'react';
import { resolveProjectsViewAccountIdentity } from '../../../shared/site00-projects/projectsViewDataAdapter.js';
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
  const { viewMode, isSimulatingClient, session } = useProjectViewMode();
  const { clientProjects } = useSite00ProjectsIndex();

  return useMemo(() => {
    const clientOwnerCandidates = (clientProjects ?? []).map((project) => ({
      slug: project.slug,
      accountId: project.id,
      email: project.clientEmail ?? null,
      firstName: project.ownerFirstName ?? null,
      lastName: project.ownerLastName ?? null,
      displayName: project.ownerDisplayName ?? null,
    }));

    const activeOwner = clientOwnerCandidates.find((p) => p.slug === session.simulatedClientProjectSlug) ??
      clientOwnerCandidates[0] ??
      null;

    return {
      ...resolveProjectsViewAccountIdentity({
        viewMode: viewMode === 'CLIENT' ? 'CLIENT' : 'FOUNDER',
        isSimulatingClient,
        isHydrating,
        authenticatedProfile: profile,
        authMetadataProfile,
        activeClientProjectOwner: activeOwner,
        clientProjectOwners: clientOwnerCandidates,
        simulatedClientProjectSlug: session.simulatedClientProjectSlug,
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
    session.simulatedClientProjectSlug,
    clientProjects,
  ]);
}
