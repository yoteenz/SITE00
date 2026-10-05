/** Session-scoped active SITE 00 access credential context. */

const ACTIVE_CREDENTIAL_KEY = 'site00_active_access_credential';
const ACCESS_VISIT_SESSION_KEY = 'site00_access_visit_session_id';

export type Site00ActiveAccessCredential = {
  code: string;
  enteredAt: string;
};

export function getOrCreateAccessVisitSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem(ACCESS_VISIT_SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `visit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(ACCESS_VISIT_SESSION_KEY, id);
  }
  return id;
}

export function readActiveAccessCredential(): Site00ActiveAccessCredential | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_CREDENTIAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Site00ActiveAccessCredential;
    if (!parsed?.code) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeActiveAccessCredential(code: string): void {
  if (typeof window === 'undefined') return;
  const payload: Site00ActiveAccessCredential = {
    code: code.toLowerCase(),
    enteredAt: new Date().toISOString(),
  };
  sessionStorage.setItem(ACTIVE_CREDENTIAL_KEY, JSON.stringify(payload));
}

export function clearActiveAccessCredential(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ACTIVE_CREDENTIAL_KEY);
}

/** Per-credential scan dedupe within the browser session. */
export function markAccessCredentialScanned(code: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = `site00_access_scanned_${code.toLowerCase()}`;
  if (sessionStorage.getItem(key)) return false;
  sessionStorage.setItem(key, '1');
  return true;
}
