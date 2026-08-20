import { useMemo } from 'react';
import {
  site00UserDisplayName,
  site00UserInitials,
  useSite00CurrentUser,
} from './useSite00CurrentUser';
import type { IdntyControlRowId } from '../config/idnty-control-center';

import {
  formatAccountReference,
  formatMemberSince,
  readStoredUserFields,
} from '../utils/site00AccountMeta';

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
