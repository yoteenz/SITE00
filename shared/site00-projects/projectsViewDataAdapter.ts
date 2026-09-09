/**
 * B5.9R9 — Projects view data adapter for account identity eyebrow.
 */

import type { AccountDisplayIdentity, AccountProfileInput, AccountViewMode } from './accountDisplayIdentity.js';
import {
  formatAccountIdentityEyebrow,
  resolveAuthenticatedAccountIdentity,
  resolveClientProjectOwnerIdentity,
  resolveSimulatedClientAccountIdentity,
} from './accountDisplayIdentity.js';

export type ProjectsViewIdentityInput = {
  viewMode: AccountViewMode;
  isSimulatingClient: boolean;
  authenticatedProfile: AccountProfileInput | null;
  simulatedClientProfile?: AccountProfileInput | null;
  activeClientProjectOwner?: AccountProfileInput | null;
  founderEmail?: string | null;
};

export type ProjectsViewIdentityResult = {
  identity: AccountDisplayIdentity;
  eyebrow: string;
};

export function resolveProjectsViewAccountIdentity(input: ProjectsViewIdentityInput): ProjectsViewIdentityResult {
  const founderEmail = (input.founderEmail ?? input.authenticatedProfile?.email ?? '').trim().toLowerCase();

  if (input.viewMode === 'CLIENT' && input.isSimulatingClient) {
    const simulated =
      input.simulatedClientProfile ??
      input.activeClientProjectOwner ??
      null;

    if (simulated) {
      const ownerEmail = (simulated.email ?? '').trim().toLowerCase();
      if (ownerEmail && founderEmail && ownerEmail === founderEmail) {
        const fallback = resolveSimulatedClientAccountIdentity({ displayName: 'CLIENT' });
        return { identity: fallback, eyebrow: formatAccountIdentityEyebrow(fallback) };
      }

      const identity = simulated.displayName || simulated.firstName || simulated.lastName
        ? resolveSimulatedClientAccountIdentity(simulated)
        : resolveClientProjectOwnerIdentity(simulated);
      return { identity, eyebrow: formatAccountIdentityEyebrow(identity) };
    }

    const fallback = resolveSimulatedClientAccountIdentity({ displayName: 'CLIENT' });
    return { identity: fallback, eyebrow: formatAccountIdentityEyebrow(fallback) };
  }

  const identity = resolveAuthenticatedAccountIdentity(
    input.authenticatedProfile ?? {},
    input.viewMode === 'CLIENT' ? 'CLIENT' : 'FOUNDER',
  );
  return { identity, eyebrow: formatAccountIdentityEyebrow(identity) };
}
