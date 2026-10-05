import { useEffect, useState } from 'react';
import { normalizeAccountIdentityFields } from '../../../shared/site00-projects/accountIdentityNormalization.js';

export type Site00CurrentUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  membershipType?: string;
  profileImage?: string;
  displayName?: string;
};

function normalizeStoredUser(raw: Record<string, unknown>): Site00CurrentUser {
  const fields = normalizeAccountIdentityFields(raw);
  return {
    id: fields.userId ?? undefined,
    firstName: fields.firstName ?? undefined,
    lastName: fields.lastName ?? undefined,
    email: fields.email ?? undefined,
    displayName: fields.displayName ?? undefined,
    membershipType:
      typeof raw.membershipType === 'string'
        ? raw.membershipType
        : typeof raw.membership_type === 'string'
          ? raw.membership_type
          : undefined,
    profileImage:
      typeof raw.profileImage === 'string'
        ? raw.profileImage
        : typeof raw.profile_image === 'string'
          ? raw.profile_image
          : undefined,
  };
}

function readCurrentUser(): Site00CurrentUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return normalizeStoredUser(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function site00UserDisplayName(user: Site00CurrentUser | null): string {
  if (!user) return '';
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  if (user.displayName?.trim()) return user.displayName.trim();
  return (user.email || '').split('@')[0] || '';
}

export function site00UserInitials(user: Site00CurrentUser | null): string {
  if (!user) return '';
  const first = (user.firstName || '').trim();
  const last = (user.lastName || '').trim();
  if (first || last) {
    return `${first.charAt(0) || ''}${last.charAt(0) || ''}`.toUpperCase();
  }
  const email = (user.email || '').trim();
  return email.slice(0, 2).toUpperCase();
}

/** Reactive profile snapshot from localStorage (same source as commerce account). */
export function useSite00CurrentUser(): Site00CurrentUser | null {
  const [user, setUser] = useState<Site00CurrentUser | null>(() => readCurrentUser());

  useEffect(() => {
    const refresh = () => setUser(readCurrentUser());
    window.addEventListener('storage', refresh);
    window.addEventListener('signInStateChanged', refresh as EventListener);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('signInStateChanged', refresh as EventListener);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return user;
}

export { readCurrentUser, normalizeStoredUser };
