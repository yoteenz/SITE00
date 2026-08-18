/**
 * Never persist account passwords in localStorage or auth backup cookies.
 * Supabase holds credentials; the app uses session tokens only.
 */

import { AUTH_BACKUP_KEY } from './adminAuth';

const AUTH_BACKUP_COOKIE = 'baw_auth_b';

export function stripPasswordFromUserRecord<T extends Record<string, unknown>>(user: T): T {
  if (!user || typeof user !== 'object') return user;
  if (!('password' in user)) return user;
  const { password: _removed, ...rest } = user;
  return rest as T;
}

function stripPasswordFromUserJson(json: string): string {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return JSON.stringify(stripPasswordFromUserRecord(parsed));
  } catch {
    return json;
  }
}

function stripPasswordFromRegisteredUsersJson(json: string): string {
  try {
    const list = JSON.parse(json) as unknown[];
    if (!Array.isArray(list)) return json;
    return JSON.stringify(list.map((u) => (u && typeof u === 'object' ? stripPasswordFromUserRecord(u as Record<string, unknown>) : u)));
  } catch {
    return json;
  }
}

function clearAuthBackupCookie(): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = `${AUTH_BACKUP_COOKIE}=; path=/; max-age=0`;
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch {
    // ignore
  }
}

/** One-time migration: remove legacy plaintext passwords from browser storage. */
export function sanitizeStoredAuthPasswords(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && currentUser.includes('"password"')) {
      localStorage.setItem('currentUser', stripPasswordFromUserJson(currentUser));
    }

    const registeredUsers = localStorage.getItem('registeredUsers');
    if (registeredUsers && registeredUsers.includes('"password"')) {
      localStorage.setItem('registeredUsers', stripPasswordFromRegisteredUsersJson(registeredUsers));
    }

    const backup = localStorage.getItem(AUTH_BACKUP_KEY);
    if (backup && backup.includes('"password"')) {
      let next = backup;
      try {
        const data = JSON.parse(backup) as { isSignedIn?: boolean; currentUser?: string };
        if (typeof data.currentUser === 'string' && data.currentUser.includes('"password"')) {
          data.currentUser = stripPasswordFromUserJson(data.currentUser);
          next = JSON.stringify(data);
        }
      } catch {
        // ignore parse errors
      }
      localStorage.setItem(AUTH_BACKUP_KEY, next);
      if (typeof document !== 'undefined' && document.cookie.includes(AUTH_BACKUP_COOKIE) && document.cookie.includes('password')) {
        clearAuthBackupCookie();
      }
    }
  } catch {
    // ignore
  }
}
