/**
 * Admin authentication helpers.
 * Admin access is restricted to users whose email is in the allowed list.
 * Preview-only admins (e.g. Kristin Watson) get access only on preview/local, not on Vercel production.
 */

import { stripPasswordFromUserRecord } from './authPasswordSanitize';

const STORAGE_IS_SIGNED_IN = 'isSignedIn';
const STORAGE_CURRENT_USER = 'currentUser';

/** Backup key for auth so we can restore if something else clears isSignedIn/currentUser. Only cleared on explicit Sign Out. */
export const AUTH_BACKUP_KEY = 'baw_auth_backup';

const AUTH_BACKUP_COOKIE = 'baw_auth_b';
const AUTH_PROFILE_COOKIE = 'baw_auth_p';

/** Track how user signed in (session_restore = Face ID / Supabase cookie auto-login; password = tapped Sign in). Used so we persist backup reliably on Safari. */
export const LAST_SIGN_IN_METHOD_KEY = 'baw_last_sign_in_method';
export const LAST_SIGN_IN_AT_KEY = 'baw_last_sign_in_at';
const MANUAL_SIGN_OUT_KEY = 'baw_manual_signout_in_progress';

/** Mark that the user explicitly clicked Sign Out so auth clear is allowed. */
export function markManualSignOutInProgress(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(MANUAL_SIGN_OUT_KEY, '1');
  } catch {
    // ignore
  }
}

/** True only during explicit sign-out flow; cleared after read. */
export function consumeManualSignOutFlag(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  try {
    const isManual = window.sessionStorage.getItem(MANUAL_SIGN_OUT_KEY) === '1';
    if (isManual) window.sessionStorage.removeItem(MANUAL_SIGN_OUT_KEY);
    return isManual;
  } catch {
    return false;
  }
}

function isSafariIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iP(?:hone|ad|od)/.test(ua) && /Safari|AppleWebKit/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
}

/** Call once after every successful sign-in (session restore, password submit or passkey). Records method, persists backup and on Safari iOS schedules extra persist retries so backup sticks before app is closed. */
export function onSignInSuccess(method: 'session_restore' | 'password' | 'passkey'): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(LAST_SIGN_IN_METHOD_KEY, method);
    window.localStorage.setItem(LAST_SIGN_IN_AT_KEY, String(Date.now()));
    persistAuthBackup();
    if (isSafariIos()) {
      const delays = [150, 400, 800];
      delays.forEach((ms) => {
        setTimeout(() => persistAuthBackup(), ms);
      });
    }
  } catch (_) {}
}

function readBackupFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const parts = document.cookie ? document.cookie.split(';') : [];
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (key !== AUTH_BACKUP_COOKIE) continue;
      const raw = trimmed.slice(eq + 1);
      return decodeURIComponent(raw);
    }
    return null;
  } catch {
    return null;
  }
}

function writeBackupToCookie(json: string): void {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = 365 * 24 * 60 * 60;
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_BACKUP_COOKIE + '=' + encodeURIComponent(json) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

function clearBackupCookie(): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_BACKUP_COOKIE + '=; path=/; max-age=0';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

function writeProfileCookie(value: string): void {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = 365 * 24 * 60 * 60;
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_PROFILE_COOKIE + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

function readProfileCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + AUTH_PROFILE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function clearProfileCookie(): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_PROFILE_COOKIE + '=; path=/; max-age=0';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

const COOKIE_BACKUP_MAX = 3800;

/** Build a slim currentUser (no large base64 image) so cookie backup fits and Safari can restore sign-in after close. */
function slimCurrentUserForCookie(currentUserJson: string, maxBytes: number): string {
  try {
    const u = JSON.parse(currentUserJson) as Record<string, unknown>;
    const slim = { ...u };
    if (slim.profileImage && typeof slim.profileImage === 'string' && slim.profileImage.length > 200) slim.profileImage = '';
    if (slim.profile_image && typeof slim.profile_image === 'string' && (slim.profile_image as string).length > 200) slim.profile_image = '';
    let out = JSON.stringify(slim);
    if (out.length <= maxBytes) return out;
    const minimal: Record<string, unknown> = { id: u.id, email: u.email, role: u.role };
    return JSON.stringify(minimal);
  } catch {
    return currentUserJson;
  }
}

/** Call after setting isSignedIn and currentUser (sign-in). Persists a backup so we can restore if they get cleared. Only writes when signed in so we never overwrite a good backup with signed-out state (e.g. if something clears auth right before unload). Writes to both localStorage and a cookie so we survive localStorage clears on browser close. Cookie uses a slim user (no large profile image) so it always fits and Safari restore works. */
export function persistAuthBackup(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const signedIn = localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true';
    const currentUserRaw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (signedIn && currentUserRaw) {
      const currentUser = JSON.stringify(stripPasswordFromUserRecord(JSON.parse(currentUserRaw) as Record<string, unknown>));
      const payload = JSON.stringify({ isSignedIn: true, currentUser });
      localStorage.setItem(AUTH_BACKUP_KEY, payload);
      let cookiePayload = payload;
      if (payload.length > COOKIE_BACKUP_MAX) {
        const wrapperOverhead = 35;
        const slimUser = slimCurrentUserForCookie(currentUser, COOKIE_BACKUP_MAX - wrapperOverhead);
        cookiePayload = JSON.stringify({ isSignedIn: true, currentUser: slimUser });
      }
      if (cookiePayload.length <= COOKIE_BACKUP_MAX) writeBackupToCookie(cookiePayload);
      // Persist a tiny profile cookie so Safari restore keeps key account fields even
      // when backup must be minimized.
      try {
        const u = JSON.parse(currentUser) as Record<string, unknown>;
        const small = {
          email: (u.email || '').toString().trim().toLowerCase(),
          firstName: (u.firstName || u.first_name || '').toString(),
          lastName: (u.lastName || u.last_name || '').toString(),
          birthday: (u.birthday || '').toString(),
          profileImage: (() => {
            const v = (u.profileImage || u.profile_image || '').toString();
            if (!v) return '';
            if (v.toLowerCase().startsWith('data:image/')) return '';
            return v;
          })(),
        };
        const json = JSON.stringify(small);
        if (json.length <= 1200) writeProfileCookie(json);
      } catch {
        // ignore profile-cookie write errors
      }
    }
  } catch {
    // ignore
  }
}

/** Call only on explicit Sign Out (and delete account). Removes the auth backup from localStorage and cookie. */
export function clearAuthBackup(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(AUTH_BACKUP_KEY);
    clearBackupCookie();
    clearProfileCookie();
  } catch (_) {}
}

/**
 * Full sign-out: Supabase session (cookies + localStorage) + app backup keys.
 * Use from mobile menu — paths that only called `clearAppAuth()` left Supabase alive, so `main.tsx`
 * bootstrap re-signed the user in on the next navigation.
 */
export async function signOutAppAndSupabaseSession(): Promise<void> {
  markManualSignOutInProgress();
  try {
    const { getSupabase, isSupabaseConfigured } = await import('./supabase');
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) await supabase.auth.signOut().catch(() => {});
    }
  } catch {
    // ignore
  }
  clearAppAuth();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
  }
}

/** Clear app auth state (isSignedIn, currentUser, backup). Call only on explicit Sign Out or delete account. */
export function clearAppAuth(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_IS_SIGNED_IN, 'false');
    localStorage.removeItem(STORAGE_CURRENT_USER);
    localStorage.removeItem(AUTH_BACKUP_KEY);
    clearBackupCookie();
    clearProfileCookie();
    // Fire-and-forget: clear server HttpOnly session cookie (Safari restore) so next load is signed out
    import('./sessionRestore').then((m) => m.clearServerSessionCookie()).catch(() => {});
  } catch (_) {}
}

function restoreAuthFromBackupIfNeeded(): void {
  try {
    let raw = localStorage.getItem(AUTH_BACKUP_KEY);
    if (!raw && typeof document !== 'undefined') {
      const cookieVal = readBackupFromCookie();
      if (cookieVal) raw = cookieVal;
    }
    if (!raw) return;
    const data = JSON.parse(raw) as { isSignedIn?: boolean; currentUser?: string | null };
    if (data.isSignedIn === true && data.currentUser) {
      localStorage.setItem(STORAGE_IS_SIGNED_IN, 'true');
      localStorage.setItem(STORAGE_CURRENT_USER, data.currentUser);
      // Merge tiny profile cookie fields back in when backup payload had to be minimized.
      try {
        const profileRaw = readProfileCookie();
        if (profileRaw) {
          const p = JSON.parse(profileRaw) as Record<string, unknown>;
          const curRaw = localStorage.getItem(STORAGE_CURRENT_USER);
          const cur = curRaw ? JSON.parse(curRaw) as Record<string, unknown> : null;
          const pEmail = (p.email || '').toString().trim().toLowerCase();
          const cEmail = (cur?.email || '').toString().trim().toLowerCase();
          if (cur && pEmail && cEmail && pEmail === cEmail) {
            const merged = { ...cur } as Record<string, unknown>;
            const first = (merged.firstName || merged.first_name || '').toString().trim();
            const last = (merged.lastName || merged.last_name || '').toString().trim();
            const img = (merged.profileImage || merged.profile_image || '').toString().trim();
            const bday = (merged.birthday || '').toString().trim();
            if (!first && p.firstName) {
              merged.firstName = p.firstName;
              merged.first_name = p.firstName;
            }
            if (!last && p.lastName) {
              merged.lastName = p.lastName;
              merged.last_name = p.lastName;
            }
            if (!bday && p.birthday) merged.birthday = p.birthday;
            if ((!img || img === '/assets/profile-thumb.png') && p.profileImage) {
              merged.profileImage = p.profileImage;
              merged.profile_image = p.profileImage;
              localStorage.setItem('profileImage', String(p.profileImage));
            }
            localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(merged));
          }
        }
      } catch {
        // ignore merge errors
      }
    }
  } catch {
    // ignore
  }
}

/** Call when Supabase or anything else may have cleared auth (e.g. SIGNED_OUT). Restores from backup so user stays signed in unless they explicitly signed out. */
export function ensureAuthRestoredFromBackup(): void {
  if (typeof window === 'undefined') return;
  try {
    // Self-heal: if currentUser exists but isSignedIn flag was dropped, keep user signed in.
    const cur = localStorage.getItem(STORAGE_CURRENT_USER);
    const signed = localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true';
    if (cur && !signed) {
      localStorage.setItem(STORAGE_IS_SIGNED_IN, 'true');
    }
    // Self-heal: if signed/current exists but backup is missing, re-seed backup immediately.
    const hasBackupLs = !!localStorage.getItem(AUTH_BACKUP_KEY);
    const hasBackupCookie = !!readBackupFromCookie();
    if (cur && (localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true') && !hasBackupLs && !hasBackupCookie) {
      persistAuthBackup();
    }
  } catch {
    // ignore
  }
  restoreAuthFromBackupIfNeeded();
}

/** Allowed admin emails (case-insensitive). From env REACT_APP_ADMIN_EMAILS or VITE_ADMIN_EMAILS (Vite). */
function getAdminEmailsRaw(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_EMAILS) {
    return String((import.meta as any).env.VITE_ADMIN_EMAILS).trim();
  }
  if (typeof process !== 'undefined' && process.env?.REACT_APP_ADMIN_EMAILS) {
    return String(process.env.REACT_APP_ADMIN_EMAILS).trim();
  }
  return '';
}
const ADMIN_EMAILS_RAW = getAdminEmailsRaw();
export const ADMIN_EMAILS: string[] = ADMIN_EMAILS_RAW
  ? ADMIN_EMAILS_RAW.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
  : [];

/** Default admin emails when no env is set. */
const DEFAULT_ADMIN_EMAILS = [
  'admin@frontalslayer.com',
  'kateena.armstrong@frontalslayer.com',
  'kateenaarmstrong@gmail.com',
];

/** Single admin Kateena account (mock data, premium, test orders). Only this email gets the exception; same-name OAuth accounts do not. */
export const ADMIN_KATEENA_EMAIL = 'kateena.armstrong@frontalslayer.com';

/**
 * Founder-privileged admin: tier/subscription localStorage overrides, mock loyalty/vouchers when also admin,
 * ADMIN: FOUNDER row, concierge test access, merged mock clients in admin UI.
 */
export const FOUNDER_PRIVILEGED_ADMIN_EMAIL = 'kateenaarmstrong@gmail.com';

/** @deprecated Use FOUNDER_PRIVILEGED_ADMIN_EMAIL — kept for existing imports. */
export const AYOTEENZ_ADMIN_EMAIL = FOUNDER_PRIVILEGED_ADMIN_EMAIL;

/** Effective list of admin emails (env list or defaults). Used for isAdminEmail and for who can access /admin/*. */
const allowedEmails = ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : DEFAULT_ADMIN_EMAILS;

/**
 * Emails that are allowed to access admin/sensitive pages (dashboard, clients, etc.).
 * When env sets admin emails, that list is used; otherwise defaults above apply.
 */
export const ALLOWED_ADMIN_PAGE_EMAILS: string[] = allowedEmails;

/** True if user is the one admin Kateena account (by email only). Use for mock/premium exception only; other "Kateena Armstrong" accounts (e.g. OAuth with different email) are not included. */
export function isAdminKateenaAccount(user: { email?: string } | null): boolean {
  if (!user?.email) return false;
  return (user.email || '').trim().toLowerCase() === ADMIN_KATEENA_EMAIL;
}

/** True if user is the founder-privileged admin account (by email only). */
export function isAyoteenzAdminAccount(user: { email?: string } | null): boolean {
  if (!user?.email) return false;
  return (user.email || '').trim().toLowerCase() === FOUNDER_PRIVILEGED_ADMIN_EMAIL;
}

/** Alias for `isAyoteenzAdminAccount`. In copy and agent context, **admin founder** = `kateenaarmstrong@gmail.com`. */
export const isAdminFounderAccount = isAyoteenzAdminAccount;

/** Visual page editor (`/…/debug-mode`) — founder Gmail only. */
export function canAccessPageDebugMode(): boolean {
  if (!isSignedIn()) return false;
  return isAdminFounderAccount(getCurrentUser());
}

/**
 * Only this email is blocked from self-service account deletion (Settings + DELETE /api/delete-account).
 * Same value as founder Gmail by default; kept explicit so delete protection is not tied to other founder UI flags.
 */
export const PROTECTED_FROM_ACCOUNT_DELETION_EMAIL = FOUNDER_PRIVILEGED_ADMIN_EMAIL;

export function isProtectedFromAccountDeletion(user: { email?: string } | null): boolean {
  if (!user?.email) return false;
  return (user.email || '').trim().toLowerCase() === PROTECTED_FROM_ACCOUNT_DELETION_EMAIL;
}

/**
 * When `localStorage` value is `'true'`, Account profile + Rewards hide founder-only test toggles and mock tier/affiliate chrome.
 * Toggled from Account → Profile ("VIEW AS CLIENT" / "VIEW AS ADMIN"). Checkout founder dummy card is unchanged.
 */
export const FOUNDER_ACCOUNT_VIEW_AS_CLIENT_KEY = 'baw_founder_account_view_as_client';

/** True when founder has enabled VIEW AS CLIENT (read from localStorage). */
export function readFounderAccountViewAsClientFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(FOUNDER_ACCOUNT_VIEW_AS_CLIENT_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Seeded mock profile chrome: test orders, mock tier bar, mock affiliate rows, etc.
 * Off when the founder account uses VIEW AS CLIENT (same idea as Account `profileUsesMockChrome`).
 */
export function isMockProfileChromeActive(user: { email?: string; role?: string } | null): boolean {
  return isMockDataAccount(user) && !readFounderAccountViewAsClientFromStorage();
}

/** Order ids used only for founder seed data on the orders page — exclude from tier/loyalty when VIEW AS CLIENT. */
export const BAW_FOUNDER_SEED_MOCK_ORDER_IDS = new Set([
  'test-order-1',
  'test-order-2',
  'test-order-3',
  'test-order-4',
  'test-order-5',
  'kateena-1',
  'kateena-2',
  'kateena-3',
  'detail-lines-test',
  'multi-product-test',
]);

export function excludeFounderSeedMockOrders<T extends { id?: string; bawSeedMock?: boolean }>(orders: T[]): T[] {
  return orders.filter((o) => {
    if (o.bawSeedMock) return false;
    const id = o.id != null ? String(o.id) : '';
    if (id && BAW_FOUNDER_SEED_MOCK_ORDER_IDS.has(id)) return false;
    return true;
  });
}

/** localStorage key for founder-privileged admin subscription override (Standard / 3 / 6 / 12 month) for testing UI across pages. */
export const ADMIN_SUBSCRIPTION_OVERRIDE_KEY = 'adminSubscriptionOverride';

/** Same-tab listeners: `storage` does not fire in the tab that wrote `adminSubscriptionOverride`. */
export const MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT = 'membershipSubscriptionPreviewChanged';

/** localStorage key for founder-privileged admin spend-tier override (SILVER / RED / BLACK) for testing UI and checkout logic across pages. */
export const ADMIN_TIER_OVERRIDE_KEY = 'adminTierOverride';

/**
 * Effective spend tier (SILVER / RED / BLACK) for the given user. For founder-privileged admin only, reads adminTierOverride from localStorage
 * so the membership page toggle persists and applies on checkout, confirm, etc.
 */
export function getEffectiveTierName(user: { email?: string; currentTierName?: string; tier?: string } | null): string | null {
  if (!user?.email) return null;
  if (!isAyoteenzAdminAccount(user)) {
    const tier = (user.currentTierName || user.tier || (typeof window !== 'undefined' && user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase();
    return tier && ['SILVER', 'RED', 'BLACK'].includes(tier) ? tier : null;
  }
  if (typeof window === 'undefined') {
    const tier = (user.currentTierName || user.tier || '').toString().toUpperCase();
    return tier && ['SILVER', 'RED', 'BLACK'].includes(tier) ? tier : null;
  }
  const override = (localStorage.getItem(ADMIN_TIER_OVERRIDE_KEY) || '').trim().toUpperCase();
  if (override === 'SILVER' || override === 'RED' || override === 'BLACK') return override;
  const tier = (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase();
  return tier && ['SILVER', 'RED', 'BLACK'].includes(tier) ? tier : null;
}

/**
 * Effective subscription tier for the given user. For founder-privileged admin only, reads adminSubscriptionOverride from localStorage
 * so toggles on membership page persist and apply on checkout, orders, etc. Values: '3months' | '6months' | '12months' | null (Standard).
 */
export function getEffectiveSubscriptionTier(user: { email?: string; subscriptionTier?: string; membershipType?: string } | null): string | null {
  if (!user?.email) return null;
  if (!isAyoteenzAdminAccount(user)) {
    if (user.subscriptionTier) return user.subscriptionTier;
    if (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium') return '12months';
    return null;
  }
  if (typeof window === 'undefined') return user.subscriptionTier || (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium' ? '12months' : null);
  const override = (localStorage.getItem(ADMIN_SUBSCRIPTION_OVERRIDE_KEY) || '').trim().toLowerCase();
  if (override === 'standard' || override === '') return null;
  if (override === '3months' || override === '6months' || override === '12months') return override;
  return user.subscriptionTier || (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium' ? '12months' : null);
}

/** True if this account should receive test/mock data (points, history, seed orders, etc.). Only the founder-privileged email when it has the admin tag (in admin list); other accounts with similar names get no mock data. */
export function isMockDataAccount(user: { email?: string; role?: string } | null): boolean {
  if (!user?.email) return false;
  if (!isAyoteenzAdminAccount(user)) return false;
  return user.role === 'admin' || isAdminEmail(user.email || '');
}

/** Preview-only admin emails (env REACT_APP_PREVIEW_ADMIN_EMAILS). Only get admin on preview/local, never on Vercel production. */
const PREVIEW_ADMIN_RAW = typeof process !== 'undefined' && process.env?.REACT_APP_PREVIEW_ADMIN_EMAILS
  ? process.env.REACT_APP_PREVIEW_ADMIN_EMAILS
  : '';
const previewOnlyEmails: string[] = PREVIEW_ADMIN_RAW
  ? PREVIEW_ADMIN_RAW.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
  : [];

/** IP that is allowed for preview admin (signed-out access on dev). Vite: VITE_PREVIEW_ADMIN_ALLOWED_IP in .env.local. */
export function getPreviewAdminAllowedIp(): string | undefined {
  const v =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PREVIEW_ADMIN_ALLOWED_IP) ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_PREVIEW_ADMIN_ALLOWED_IP);
  return v ? String(v).trim() : undefined;
}

/** True when running on preview (localhost, LAN IP or Vercel preview), false on Vercel production deploy. */
export function isPreviewEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (/^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) || /^192\.168\./.test(host)) {
      return true;
    }
    if (host.endsWith('.vercel.app')) return true;
    if (host === 'preview.fsbw-dev.com' || host.endsWith('.fsbw-dev.com') || host.endsWith('.trycloudflare.com')) {
      return true;
    }
  }
  const env =
    (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_VERCEL_ENV) ||
    (typeof process !== 'undefined' && process.env?.VERCEL_ENV);
  return env === 'preview' || env === 'development';
}

export function isAdminEmail(email: string): boolean {
  return allowedEmails.includes((email || '').trim().toLowerCase());
}

/** True if email is in the preview-only admin list (Kristin Watson, etc.). */
export function isPreviewOnlyAdminEmail(email: string): boolean {
  return previewOnlyEmails.length > 0 && previewOnlyEmails.includes((email || '').trim().toLowerCase());
}

export function getCurrentUser(): { email?: string; role?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    let raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) {
      restoreAuthFromBackupIfNeeded();
      raw = localStorage.getItem(STORAGE_CURRENT_USER);
    }
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function isSignedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true') return true;
    restoreAuthFromBackupIfNeeded();
    return localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true';
  } catch {
    return false;
  }
}

/** True if signed in and current user has full admin or (on preview only) preview-only admin. */
export function isAdminUser(): boolean {
  if (!isSignedIn()) return false;
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin' || isAdminEmail(user.email || '')) return true;
  if (isPreviewEnvironment() && isPreviewOnlyAdminEmail(user.email || '')) return true;
  return false;
}

/**
 * True only when signed in AND current user email is in ALLOWED_ADMIN_PAGE_EMAILS.
 * Use this to gate access to /admin/* routes. All other accounts must be redirected.
 */
export function canAccessAdminPages(): boolean {
  if (!isSignedIn()) return false;
  const user = getCurrentUser();
  if (!user?.email) return false;
  const email = (user.email || '').trim().toLowerCase();
  return ALLOWED_ADMIN_PAGE_EMAILS.some((allowed) => allowed.trim().toLowerCase() === email);
}

/** True if current user is a preview-only admin (must also pass IP check in guard). */
export function isPreviewOnlyAdminUser(): boolean {
  if (!isSignedIn()) return false;
  const user = getCurrentUser();
  return !!(user && isPreviewOnlyAdminEmail(user.email || ''));
}
