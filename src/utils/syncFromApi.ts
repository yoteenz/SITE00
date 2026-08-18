/**
 * SITE 00 profile sync — slim standalone (no Frontal Slayer commerce cart/wishlist).
 */
import { getProfile, getAccessToken } from './api';
import {
  isAdminEmail,
  isAyoteenzAdminAccount,
  persistAuthBackup,
  ADMIN_TIER_OVERRIDE_KEY,
  ADMIN_SUBSCRIPTION_OVERRIDE_KEY,
} from './adminAuth';
import { stripPasswordFromUserRecord } from './authPasswordSanitize';

let lastProfileSyncErrored = false;

export function didLastProfileSyncError(): boolean {
  return lastProfileSyncErrored;
}

export function getLocalUserSnapshotForEmail(email: string): Record<string, unknown> | null {
  const e = (email || '').trim().toLowerCase();
  if (!e) return null;
  try {
    const existingRaw = localStorage.getItem('currentUser');
    if (existingRaw) {
      const cur = JSON.parse(existingRaw) as Record<string, unknown>;
      if (((cur.email as string) || '').trim().toLowerCase() === e) return cur;
    }
  } catch {
    /* ignore */
  }
  try {
    const registeredUsers: unknown[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const reg = registeredUsers.find(
      (u: unknown) => (((u as { email?: string }).email || '').trim().toLowerCase() === e),
    ) as Record<string, unknown> | undefined;
    return reg && typeof reg === 'object' ? reg : null;
  } catch {
    return null;
  }
}

export async function syncProfileFromApi(): Promise<Record<string, unknown> | null> {
  try {
    const profile = await getProfile();
    if (!profile) {
      const token = await getAccessToken();
      lastProfileSyncErrored = !token;
      return null;
    }
    lastProfileSyncErrored = false;
    if (typeof profile !== 'object') return null;
    const email = (profile.email as string) || '';
    if (!email) return null;

    const normalized = {
      ...profile,
      firstName: profile.firstName ?? profile.first_name,
      lastName: profile.lastName ?? profile.last_name,
      phoneNumber: profile.phoneNumber ?? profile.phone_number,
      profileImage: profile.profileImage ?? profile.profile_image,
      membershipType: profile.membershipType ?? profile.membership_type,
      subscriptionTier: profile.subscriptionTier ?? profile.subscription_tier,
      currentTierName: profile.currentTierName ?? profile.current_tier_name ?? profile.tier,
    } as Record<string, unknown>;

    const emailNorm = email.trim().toLowerCase();
    const existingRaw = localStorage.getItem('currentUser');
    let existing = (existingRaw ? JSON.parse(existingRaw) : null) as Record<string, unknown> | null;
    const currentUserMatchesApi =
      existing && ((existing.email as string) || '').trim().toLowerCase() === emailNorm;
    if (!currentUserMatchesApi) existing = getLocalUserSnapshotForEmail(email);
    const sameEmail = Boolean(existing);

    const merged = {
      ...(sameEmail && existing ? existing : {}),
      ...normalized,
      email,
      role:
        isAdminEmail(email) || isAyoteenzAdminAccount({ email })
          ? 'admin'
          : (profile.role as string),
    } as Record<string, unknown>;

    if (isAdminEmail(email) || isAyoteenzAdminAccount({ email })) {
      const tierOverride = (localStorage.getItem(ADMIN_TIER_OVERRIDE_KEY) || '').trim().toUpperCase();
      if (tierOverride === 'SILVER' || tierOverride === 'RED' || tierOverride === 'BLACK') {
        merged.currentTierName = tierOverride;
        merged.tier = tierOverride;
      }
      const subOverride = (localStorage.getItem(ADMIN_SUBSCRIPTION_OVERRIDE_KEY) || '').trim().toLowerCase();
      if (subOverride === '3months' || subOverride === '6months' || subOverride === '12months') {
        merged.subscriptionTier = subOverride;
      }
    }

    stripPasswordFromUserRecord(merged);
    localStorage.setItem('currentUser', JSON.stringify(merged));
    localStorage.setItem('isSignedIn', 'true');
    persistAuthBackup();
    return merged;
  } catch {
    lastProfileSyncErrored = true;
    return null;
  }
}

export async function syncAllFromApi(): Promise<Record<string, unknown> | null> {
  return syncProfileFromApi();
}

function metaStr(meta: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = meta[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

export function buildMinimalUserFromSupabaseSession(sessionUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  raw_user_meta_data?: Record<string, unknown>;
  created_at?: string;
}): Record<string, unknown> {
  const email = (sessionUser.email || '').trim().toLowerCase();
  const meta = { ...(sessionUser.raw_user_meta_data || {}), ...(sessionUser.user_metadata || {}) };
  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    firstName: metaStr(meta, 'first_name', 'firstName') || '',
    lastName: metaStr(meta, 'last_name', 'lastName') || '',
    role: isAdminEmail(email) || isAyoteenzAdminAccount({ email }) ? 'admin' : undefined,
    createdAt: sessionUser.created_at || new Date().toISOString(),
  } as Record<string, unknown>;
}

export function applyMinimalUserToStorage(merged: Record<string, unknown>): void {
  const email = (merged.email as string) || '';
  if (!email) return;
  stripPasswordFromUserRecord(merged);
  localStorage.setItem('currentUser', JSON.stringify(merged));
  localStorage.setItem('isSignedIn', 'true');
  persistAuthBackup();
}

export function buildProfilePayloadForBackend(minimal: Record<string, unknown>): Record<string, unknown> {
  const email = (minimal.email as string) || '';
  const payload: Record<string, unknown> = {
    email,
    firstName: (minimal.firstName as string) || null,
    lastName: (minimal.lastName as string) || null,
  };
  if (email && (isAdminEmail(email) || isAyoteenzAdminAccount({ email }))) {
    payload.role = 'admin';
  }
  return payload;
}
