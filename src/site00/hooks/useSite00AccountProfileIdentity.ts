/**
 * B5.9R9R1 — Hydrated account profile identity for Projects page eyebrow.
 */

import { useEffect, useMemo, useState } from 'react';
import { syncProfileFromApi } from '../../utils/syncFromApi';
import { getSupabase, isSupabaseConfigured } from '../../utils/supabase';
import { readCurrentUser, type Site00CurrentUser } from './useSite00CurrentUser';
import type { AccountProfileInput } from '../../../shared/site00-projects/accountDisplayIdentity.js';
import { normalizeAccountIdentityFields } from '../../../shared/site00-projects/accountIdentityNormalization.js';

export type Site00AccountProfileIdentityState = {
  profile: AccountProfileInput | null;
  authMetadataProfile: AccountProfileInput | null;
  isHydrating: boolean;
  user: Site00CurrentUser | null;
};

async function readAuthMetadataProfile(): Promise<AccountProfileInput | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    const authUser = data.user;
    if (!authUser) return null;
    const fields = normalizeAccountIdentityFields({
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata,
    });
    return {
      userId: authUser.id,
      accountId: authUser.id,
      email: fields.email,
      firstName: fields.firstName,
      lastName: fields.lastName,
      fullName: fields.fullName,
      displayName: fields.displayName,
    };
  } catch {
    return null;
  }
}

function profileFromStoredUser(user: Site00CurrentUser | null): AccountProfileInput | null {
  if (!user) return null;
  return {
    userId: user.id ?? null,
    accountId: user.id ?? user.email ?? null,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    displayName: user.displayName ?? null,
  };
}

export function useSite00AccountProfileIdentity(): Site00AccountProfileIdentityState {
  const [user, setUser] = useState<Site00CurrentUser | null>(() => readCurrentUser());
  const [authMetadataProfile, setAuthMetadataProfile] = useState<AccountProfileInput | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setIsHydrating(true);
      await syncProfileFromApi().catch(() => null);
      if (cancelled) return;

      const refreshed = readCurrentUser();
      setUser(refreshed);

      const metadata = await readAuthMetadataProfile();
      if (cancelled) return;
      setAuthMetadataProfile(metadata);
      setIsHydrating(false);
    }

    void hydrate();

    const refreshLocal = () => setUser(readCurrentUser());
    window.addEventListener('storage', refreshLocal);
    window.addEventListener('signInStateChanged', refreshLocal as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', refreshLocal);
      window.removeEventListener('signInStateChanged', refreshLocal as EventListener);
    };
  }, []);

  const profile = useMemo(() => profileFromStoredUser(user), [user]);

  return { profile, authMetadataProfile, isHydrating, user };
}
