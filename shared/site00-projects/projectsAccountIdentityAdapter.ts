/**
 * B5.9R9 / B5.9R9R1 — Projects account identity adapter for hero eyebrow.
 */

import type { AccountDisplayIdentity, AccountProfileInput, AccountViewMode, IdentitySourceCandidate } from './accountDisplayIdentity.js';
import {
  formatAccountIdentityEyebrow,
  resolveAccountDisplayIdentityFromSources,
} from './accountDisplayIdentity.js';
import { normalizeAccountIdentityFields } from './accountIdentityNormalization.js';

export type ProjectsViewIdentityInput = {
  viewMode: AccountViewMode;
  isSimulatingClient: boolean;
  isHydrating?: boolean;
  authenticatedProfile: AccountProfileInput | null;
  authMetadataProfile?: AccountProfileInput | null;
  activeSimulatedClientId?: string | null;
  simulatedClientDirectoryProfile?: AccountProfileInput | null;
  simulatedClientProjectSlug?: string | null;
  founderEmail?: string | null;
};

export type ProjectsViewIdentityResult = {
  identity: AccountDisplayIdentity;
  eyebrow: string | null;
};

function emailsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = (a ?? '').trim().toLowerCase();
  const right = (b ?? '').trim().toLowerCase();
  return Boolean(left && right && left === right);
}

function buildFounderCandidates(profile: AccountProfileInput | null, authMetadata: AccountProfileInput | null): IdentitySourceCandidate[] {
  const candidates: IdentitySourceCandidate[] = [];
  if (profile) {
    candidates.push({
      kind: 'PROFILE',
      record: profile as Record<string, unknown>,
      recordId: profile.userId ?? profile.accountId ?? profile.email ?? null,
      priority: 1,
    });
  }
  if (authMetadata) {
    candidates.push({
      kind: 'AUTH_METADATA',
      record: authMetadata as Record<string, unknown>,
      recordId: authMetadata.userId ?? authMetadata.accountId ?? null,
      priority: 2,
    });
  }
  if (profile?.displayName) {
    candidates.push({
      kind: 'DISPLAY_NAME',
      record: profile as Record<string, unknown>,
      recordId: profile.accountId ?? profile.email ?? null,
      priority: 3,
    });
  }
  return candidates;
}

function buildClientCandidates(owner: AccountProfileInput): IdentitySourceCandidate[] {
  return [
    {
      kind: 'CLIENT_PROJECT_OWNER',
      record: owner as Record<string, unknown>,
      recordId: owner.accountId ?? owner.email ?? null,
      priority: 1,
    },
    {
      kind: 'DISPLAY_NAME',
      record: owner as Record<string, unknown>,
      recordId: owner.accountId ?? owner.email ?? null,
      priority: 2,
    },
  ];
}

export function resolveActiveSimulatedClientOwner(input: {
  clientProjects: AccountProfileInput[];
  simulatedClientProjectSlug: string | null;
  founderEmail?: string | null;
}): AccountProfileInput | null {
  const founderEmail = (input.founderEmail ?? '').trim().toLowerCase();
  const projects = input.clientProjects.filter(Boolean);
  if (!projects.length) return null;

  const bySlug = input.simulatedClientProjectSlug
    ? projects.find((p) => (p as { slug?: string }).slug === input.simulatedClientProjectSlug)
    : null;

  const ordered = bySlug ? [bySlug, ...projects.filter((p) => p !== bySlug)] : projects;

  for (const project of ordered) {
    const fields = normalizeAccountIdentityFields(project as Record<string, unknown>);
    const ownerEmail = (fields.email ?? '').trim().toLowerCase();
    if (ownerEmail && founderEmail && ownerEmail === founderEmail) continue;
    return project;
  }

  return null;
}

export function resolveProjectsViewAccountIdentity(input: ProjectsViewIdentityInput): ProjectsViewIdentityResult {
  const founderEmail = (input.founderEmail ?? input.authenticatedProfile?.email ?? '').trim().toLowerCase();

  if (input.viewMode === 'CLIENT' && input.isSimulatingClient) {
    if (!input.activeSimulatedClientId) {
      const identity = resolveAccountDisplayIdentityFromSources({
        viewMode: 'CLIENT',
        isHydrating: input.isHydrating,
        candidates: [{ kind: 'FALLBACK', record: { displayName: 'CLIENT' }, priority: 99 }],
      });
      return { identity, eyebrow: formatAccountIdentityEyebrow(identity) };
    }

    const directoryProfile = input.simulatedClientDirectoryProfile;
    const simulated: AccountProfileInput | null = directoryProfile
      ? {
          accountId: directoryProfile.accountId ?? input.activeSimulatedClientId,
          userId: directoryProfile.userId ?? null,
          email: directoryProfile.email ?? null,
          firstName: directoryProfile.firstName ?? null,
          lastName: directoryProfile.lastName ?? null,
          displayName: directoryProfile.displayName ?? null,
        }
      : null;

    if (simulated) {
      const ownerEmail = (simulated.email ?? '').trim().toLowerCase();
      if (emailsMatch(ownerEmail, founderEmail)) {
        const identity = resolveAccountDisplayIdentityFromSources({
          viewMode: 'CLIENT',
          isHydrating: input.isHydrating,
          candidates: [{ kind: 'FALLBACK', record: { displayName: 'CLIENT' }, priority: 99 }],
        });
        return { identity, eyebrow: formatAccountIdentityEyebrow(identity) };
      }

      const identity = resolveAccountDisplayIdentityFromSources({
        viewMode: 'CLIENT',
        isHydrating: input.isHydrating,
        candidates: buildClientCandidates(simulated),
      });
      return { identity, eyebrow: formatAccountIdentityEyebrow(identity) };
    }

    const identity = resolveAccountDisplayIdentityFromSources({
      viewMode: 'CLIENT',
      isHydrating: input.isHydrating,
      candidates: [{ kind: 'FALLBACK', record: { displayName: 'CLIENT' }, priority: 99 }],
    });
    return { identity, eyebrow: formatAccountIdentityEyebrow(identity) };
  }

  const identity = resolveAccountDisplayIdentityFromSources({
    viewMode: input.viewMode === 'CLIENT' ? 'CLIENT' : 'FOUNDER',
    isHydrating: input.isHydrating,
    candidates: buildFounderCandidates(input.authenticatedProfile, input.authMetadataProfile ?? null),
  });
  return { identity, eyebrow: formatAccountIdentityEyebrow(identity) };
}
