/**
 * B5.9R9 — Canonical account display identity for Projects page eyebrow.
 */

export type AccountViewMode = 'FOUNDER' | 'CLIENT';

export type AccountIdentitySource =
  | 'AUTHENTICATED_PROFILE'
  | 'SIMULATED_CLIENT_PROFILE'
  | 'CLIENT_PROJECT_OWNER'
  | 'DISPLAY_NAME'
  | 'FALLBACK';

export type AccountDisplayIdentity = {
  accountId: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  displayName: string | null;
  role: AccountViewMode;
  viewMode: AccountViewMode;
  source: AccountIdentitySource;
};

export type AccountProfileInput = {
  accountId?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
};

const FORBIDDEN_EYEBROW = 'PROJECTS';

function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') return null;
  return trimmed;
}

export function buildFullName(firstName: string | null, lastName: string | null): string | null {
  const parts = [firstName, lastName].filter(Boolean) as string[];
  return parts.length ? parts.join(' ') : null;
}

export function resolveAccountDisplayIdentity(input: {
  profile: AccountProfileInput;
  viewMode: AccountViewMode;
  source: AccountIdentitySource;
}): AccountDisplayIdentity {
  const firstName = clean(input.profile.firstName);
  const lastName = clean(input.profile.lastName);
  const displayName = clean(input.profile.displayName);
  const fullName = buildFullName(firstName, lastName) ?? displayName;

  return {
    accountId: clean(input.profile.accountId) ?? clean(input.profile.email),
    firstName,
    lastName,
    fullName,
    displayName,
    role: input.viewMode,
    viewMode: input.viewMode,
    source: input.source,
  };
}

export function resolveAuthenticatedAccountIdentity(
  profile: AccountProfileInput,
  viewMode: AccountViewMode = 'FOUNDER',
): AccountDisplayIdentity {
  return resolveAccountDisplayIdentity({
    profile,
    viewMode,
    source: 'AUTHENTICATED_PROFILE',
  });
}

export function resolveSimulatedClientAccountIdentity(profile: AccountProfileInput): AccountDisplayIdentity {
  return resolveAccountDisplayIdentity({
    profile,
    viewMode: 'CLIENT',
    source: profile.displayName ? 'DISPLAY_NAME' : 'SIMULATED_CLIENT_PROFILE',
  });
}

export function resolveClientProjectOwnerIdentity(input: {
  accountId?: string | null;
  email?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): AccountDisplayIdentity {
  return resolveAccountDisplayIdentity({
    profile: input,
    viewMode: 'CLIENT',
    source: 'CLIENT_PROJECT_OWNER',
  });
}

/** Preferred eyebrow label before the trailing slash — never PROJECTS. */
export function resolveAccountEyebrowLabel(identity: AccountDisplayIdentity): string {
  const fullName = clean(identity.fullName) ?? buildFullName(identity.firstName, identity.lastName);
  if (fullName && fullName.toUpperCase() !== FORBIDDEN_EYEBROW) return fullName;

  const displayName = clean(identity.displayName);
  if (displayName && displayName.toUpperCase() !== FORBIDDEN_EYEBROW) return displayName;

  if (identity.viewMode === 'CLIENT') return 'CLIENT';
  return 'ACCOUNT';
}

/** Presentation-only uppercase eyebrow: `NAME /` */
export function formatAccountIdentityEyebrow(identity: AccountDisplayIdentity): string {
  const label = resolveAccountEyebrowLabel(identity).toUpperCase();
  if (!label || label === FORBIDDEN_EYEBROW) {
    return identity.viewMode === 'CLIENT' ? 'CLIENT /' : 'ACCOUNT /';
  }
  return `${label} /`;
}

export function accountEyebrowIsSafe(value: string): boolean {
  const upper = value.toUpperCase();
  return (
    Boolean(value.trim()) &&
    !upper.includes('UNDEFINED') &&
    !upper.includes('NULL') &&
    !upper.startsWith(`${FORBIDDEN_EYEBROW} /`)
  );
}
