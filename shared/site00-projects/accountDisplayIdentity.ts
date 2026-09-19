/**
 * B5.9R9 / B5.9R9R1 — Canonical account display identity for Projects page eyebrow.
 */

import {
  constructAccountFullName,
  normalizeAccountIdentityFields,
  type NormalizedAccountIdentityFields,
} from './accountIdentityNormalization.js';

export type AccountViewMode = 'FOUNDER' | 'CLIENT';

export type AccountIdentitySourceKind =
  | 'PROFILE'
  | 'AUTH_METADATA'
  | 'CLIENT_PROJECT_OWNER'
  | 'DISPLAY_NAME'
  | 'FALLBACK';

export type IdentityResolutionStatus = 'LOADING' | 'RESOLVED' | 'UNRESOLVED' | 'IDENTITY_PROFILE_INCOMPLETE';

export type AccountDisplayIdentity = {
  accountId: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  displayName: string | null;
  role: AccountViewMode;
  viewMode: AccountViewMode;
  source: AccountIdentitySourceKind;
  sourceRecordId: string | null;
  resolutionStatus: IdentityResolutionStatus;
  fallbackReason: string | null;
};

export type AccountProfileInput = {
  accountId?: string | null;
  userId?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  displayName?: string | null;
};

export type IdentitySourceCandidate = {
  kind: AccountIdentitySourceKind;
  record: Record<string, unknown>;
  recordId?: string | null;
  priority: number;
};

const FORBIDDEN_EYEBROW = 'PROJECTS';

function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') return null;
  return trimmed;
}

export function buildFullName(firstName: string | null, lastName: string | null): string | null {
  return constructAccountFullName({ firstName, lastName, fullName: null });
}

function identityFromFields(
  fields: NormalizedAccountIdentityFields,
  input: {
    viewMode: AccountViewMode;
    source: AccountIdentitySourceKind;
    sourceRecordId: string | null;
    resolutionStatus: IdentityResolutionStatus;
    fallbackReason: string | null;
  },
): AccountDisplayIdentity {
  const firstName = clean(fields.firstName);
  const lastName = clean(fields.lastName);
  const displayName = clean(fields.displayName);
  const fullName = constructAccountFullName({ firstName, lastName, fullName: clean(fields.fullName) }) ?? displayName;

  return {
    accountId: clean(fields.accountId) ?? clean(fields.email),
    userId: clean(fields.userId),
    firstName,
    lastName,
    fullName,
    displayName,
    role: input.viewMode,
    viewMode: input.viewMode,
    source: input.source,
    sourceRecordId: input.sourceRecordId,
    resolutionStatus: input.resolutionStatus,
    fallbackReason: input.fallbackReason,
  };
}

function loadingIdentity(viewMode: AccountViewMode): AccountDisplayIdentity {
  return {
    accountId: null,
    userId: null,
    firstName: null,
    lastName: null,
    fullName: null,
    displayName: null,
    role: viewMode,
    viewMode,
    source: 'PROFILE',
    sourceRecordId: null,
    resolutionStatus: 'LOADING',
    fallbackReason: null,
  };
}

function fallbackIdentity(viewMode: AccountViewMode, reason: string): AccountDisplayIdentity {
  return {
    accountId: null,
    userId: null,
    firstName: null,
    lastName: null,
    fullName: null,
    displayName: null,
    role: viewMode,
    viewMode,
    source: 'FALLBACK',
    sourceRecordId: null,
    resolutionStatus: 'UNRESOLVED',
    fallbackReason: reason,
  };
}

function incompleteIdentity(fields: NormalizedAccountIdentityFields, viewMode: AccountViewMode): AccountDisplayIdentity {
  return identityFromFields(fields, {
    viewMode,
    source: 'PROFILE',
    sourceRecordId: fields.userId ?? fields.accountId,
    resolutionStatus: 'IDENTITY_PROFILE_INCOMPLETE',
    fallbackReason: 'NO_PROFILE_NAME_FIELDS',
  });
}

function tryResolveCandidate(
  candidate: IdentitySourceCandidate,
  viewMode: AccountViewMode,
): AccountDisplayIdentity | null {
  const fields = normalizeAccountIdentityFields(candidate.record);
  const fullName = constructAccountFullName(fields);
  const displayName = clean(fields.displayName);

  if (fullName && fullName.toUpperCase() !== FORBIDDEN_EYEBROW) {
    return identityFromFields(fields, {
      viewMode,
      source: candidate.kind,
      sourceRecordId: candidate.recordId ?? fields.userId ?? fields.accountId,
      resolutionStatus: 'RESOLVED',
      fallbackReason: null,
    });
  }

  if (displayName && displayName.toUpperCase() !== FORBIDDEN_EYEBROW && candidate.kind === 'DISPLAY_NAME') {
    return identityFromFields({ ...fields, fullName: displayName }, {
      viewMode,
      source: 'DISPLAY_NAME',
      sourceRecordId: candidate.recordId ?? fields.accountId,
      resolutionStatus: 'RESOLVED',
      fallbackReason: null,
    });
  }

  if (displayName && displayName.toUpperCase() !== FORBIDDEN_EYEBROW && !fullName) {
    return identityFromFields({ ...fields, fullName: displayName }, {
      viewMode,
      source: candidate.kind === 'CLIENT_PROJECT_OWNER' ? 'CLIENT_PROJECT_OWNER' : 'DISPLAY_NAME',
      sourceRecordId: candidate.recordId ?? fields.accountId,
      resolutionStatus: 'RESOLVED',
      fallbackReason: null,
    });
  }

  return null;
}

/** Canonical multi-source resolver — one entry point for all SITE 00 account person identity. */
export function resolveAccountDisplayIdentityFromSources(input: {
  candidates: IdentitySourceCandidate[];
  viewMode: AccountViewMode;
  isHydrating?: boolean;
}): AccountDisplayIdentity {
  if (input.isHydrating) return loadingIdentity(input.viewMode);

  const ordered = [...input.candidates].sort((a, b) => a.priority - b.priority);
  for (const candidate of ordered) {
    const resolved = tryResolveCandidate(candidate, input.viewMode);
    if (resolved) return resolved;
  }

  const profileCandidate = ordered.find((c) => c.kind === 'PROFILE' || c.kind === 'AUTH_METADATA');
  if (profileCandidate) {
    const fields = normalizeAccountIdentityFields(profileCandidate.record);
    if (fields.email || fields.accountId || fields.userId) {
      return incompleteIdentity(fields, input.viewMode);
    }
  }

  return fallbackIdentity(input.viewMode, 'NO_CANONICAL_IDENTITY_SOURCES');
}

export function resolveAccountDisplayIdentity(input: {
  profile: AccountProfileInput;
  viewMode: AccountViewMode;
  source: AccountIdentitySourceKind;
  sourceRecordId?: string | null;
}): AccountDisplayIdentity {
  return resolveAccountDisplayIdentityFromSources({
    viewMode: input.viewMode,
    candidates: [
      {
        kind: input.source,
        record: input.profile as Record<string, unknown>,
        recordId: input.sourceRecordId ?? null,
        priority: 1,
      },
    ],
  });
}

export function resolveAuthenticatedAccountIdentity(
  profile: AccountProfileInput,
  viewMode: AccountViewMode = 'FOUNDER',
): AccountDisplayIdentity {
  return resolveAccountDisplayIdentityFromSources({
    viewMode,
    candidates: [
      {
        kind: 'PROFILE',
        record: profile as Record<string, unknown>,
        recordId: profile.userId ?? profile.accountId ?? profile.email ?? null,
        priority: 1,
      },
    ],
  });
}

export function resolveSimulatedClientAccountIdentity(profile: AccountProfileInput): AccountDisplayIdentity {
  return resolveAccountDisplayIdentityFromSources({
    viewMode: 'CLIENT',
    candidates: [
      {
        kind: profile.displayName ? 'DISPLAY_NAME' : 'CLIENT_PROJECT_OWNER',
        record: profile as Record<string, unknown>,
        recordId: profile.accountId ?? profile.email ?? null,
        priority: 1,
      },
    ],
  });
}

export function resolveClientProjectOwnerIdentity(input: AccountProfileInput): AccountDisplayIdentity {
  return resolveAccountDisplayIdentityFromSources({
    viewMode: 'CLIENT',
    candidates: [
      {
        kind: 'CLIENT_PROJECT_OWNER',
        record: input as Record<string, unknown>,
        recordId: input.accountId ?? input.email ?? null,
        priority: 1,
      },
    ],
  });
}

/** Preferred eyebrow label before the trailing slash — never PROJECTS. */
export function resolveAccountEyebrowLabel(identity: AccountDisplayIdentity): string | null {
  if (identity.resolutionStatus === 'LOADING') return null;

  const fullName = clean(identity.fullName) ?? buildFullName(identity.firstName, identity.lastName);
  if (fullName && fullName.toUpperCase() !== FORBIDDEN_EYEBROW) return fullName;

  const displayName = clean(identity.displayName);
  if (displayName && displayName.toUpperCase() !== FORBIDDEN_EYEBROW) return displayName;

  if (identity.resolutionStatus === 'IDENTITY_PROFILE_INCOMPLETE') return null;
  if (identity.viewMode === 'CLIENT') return 'CLIENT';
  return 'ACCOUNT';
}

/** Presentation-only uppercase eyebrow: `NAME /` */
export function formatAccountIdentityEyebrow(identity: AccountDisplayIdentity): string | null {
  if (identity.resolutionStatus === 'LOADING') return null;

  const label = resolveAccountEyebrowLabel(identity);
  if (!label) {
    if (identity.resolutionStatus === 'IDENTITY_PROFILE_INCOMPLETE') return 'ACCOUNT /';
    return identity.viewMode === 'CLIENT' ? 'CLIENT /' : 'ACCOUNT /';
  }

  const upper = label.toUpperCase();
  if (!upper || upper === FORBIDDEN_EYEBROW) {
    return identity.viewMode === 'CLIENT' ? 'CLIENT /' : 'ACCOUNT /';
  }
  return `${upper} /`;
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
