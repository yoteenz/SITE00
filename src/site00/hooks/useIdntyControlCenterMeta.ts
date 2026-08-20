import { useMemo } from 'react';
import {
  site00UserDisplayName,
  site00UserInitials,
  useSite00CurrentUser,
  type Site00CurrentUser,
} from './useSite00CurrentUser';
import type { IdntyControlRowId } from '../config/idnty-control-center';

type StoredUserFields = Site00CurrentUser & {
  id?: string;
  createdAt?: string;
};

function readStoredUserFields(): StoredUserFields | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw) as StoredUserFields;
  } catch {
    return null;
  }
}

function formatMemberSince(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/** Public-safe masked account reference — never exposes full Supabase UUID. */
function formatAccountReference(id?: string): string | null {
  if (!id || typeof id !== 'string') return null;
  const compact = id.replace(/-/g, '').toUpperCase();
  if (compact.length < 8) return null;
  return `${compact.slice(0, 2)}-${compact.slice(2, 6)}-${compact.slice(6, 10)}`;
}

export type IdntyCredentialStatus = {
  label: string;
  value: string;
};

export type IdntySystemStatusItem = {
  label: string;
  state: 'active' | 'neutral';
};

export type IdntyControlRowStatus = {
  primary: string;
  secondary?: string;
};

export function useIdntyControlCenterMeta() {
  const user = useSite00CurrentUser();

  return useMemo(() => {
    const stored = readStoredUserFields();
    const displayName = site00UserDisplayName(user);
    const initials = site00UserInitials(user);
    const accountReference = formatAccountReference(stored?.id);
    const memberSince = formatMemberSince(stored?.createdAt);

    const credentialStatuses: IdntyCredentialStatus[] = [];
    if (displayName) {
      credentialStatuses.push({ label: 'ACCOUNT', value: 'ACTIVE' });
    }
    if (user?.email) {
      credentialStatuses.push({ label: 'ACCESS', value: 'SESSION' });
    }

    const systemStatus: IdntySystemStatusItem[] = [
      { label: 'IDENTITY', state: displayName ? 'active' : 'neutral' },
      { label: 'ACCESS', state: user?.email ? 'active' : 'neutral' },
      { label: 'SECURITY', state: 'neutral' },
      { label: 'PRIVACY', state: 'neutral' },
    ];

    const rowStatus: Partial<Record<IdntyControlRowId, IdntyControlRowStatus>> = {
      security: { primary: 'SESSION', secondary: 'ACTIVE' },
      sessions: { primary: '1 ACTIVE', secondary: 'SESSION' },
    };

    return {
      displayName,
      initials,
      email: user?.email ?? '',
      accountReference,
      memberSince,
      credentialStatuses,
      systemStatus,
      rowStatus,
    };
  }, [user]);
}
