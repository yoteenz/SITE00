/**
 * Minimal API client for SITE 00 standalone — profile sync and admin/production routes.
 */
const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

function getSupabaseAuthStorageKey(): string | null {
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  if (!url) return null;
  try {
    const projectRef = new URL(url).hostname.split('.')[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

type SupabaseSessionBlob = {
  access_token?: string;
  refresh_token?: string;
};

function readSupabaseSessionBlobFromStorage(): SupabaseSessionBlob | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const key = getSupabaseAuthStorageKey();
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SupabaseSessionBlob;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function readAccessTokenFromSupabaseStorage(): string | null {
  const blob = readSupabaseSessionBlobFromStorage();
  const t = typeof blob?.access_token === 'string' ? blob.access_token.trim() : '';
  return t || null;
}

function isAccessTokenLikelyExpired(token: string, skewSeconds = 90): boolean {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(payload)) as { exp?: number };
    if (typeof json.exp !== 'number') return false;
    return Date.now() / 1000 >= json.exp - skewSeconds;
  } catch {
    return false;
  }
}

async function hydrateSupabaseSessionFromStorageIfNeeded(
  supabase: NonNullable<Awaited<ReturnType<(typeof import('./supabase'))['getSupabase']>>>,
): Promise<void> {
  try {
    const blob = readSupabaseSessionBlobFromStorage();
    const access = typeof blob?.access_token === 'string' ? blob.access_token.trim() : '';
    const refresh = typeof blob?.refresh_token === 'string' ? blob.refresh_token.trim() : '';
    if (!access || !refresh) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const mem = session?.access_token?.trim();
    if (mem && !isAccessTokenLikelyExpired(mem)) return;
    await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
  } catch {
    /* ignore */
  }
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = (await import('./supabase')).getSupabase();
  if (!supabase) return readAccessTokenFromSupabaseStorage();

  await hydrateSupabaseSessionFromStorageIfNeeded(supabase);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token && !isAccessTokenLikelyExpired(session.access_token)) {
    return session.access_token;
  }

  const blob = readSupabaseSessionBlobFromStorage();
  if (blob?.refresh_token) {
    try {
      await supabase.auth.refreshSession({ refresh_token: blob.refresh_token });
      const {
        data: { session: s2 },
      } = await supabase.auth.getSession();
      if (s2?.access_token) return s2.access_token;
    } catch {
      /* fall through */
    }
  }

  const stored = readAccessTokenFromSupabaseStorage();
  if (stored && !isAccessTokenLikelyExpired(stored)) return stored;
  return null;
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const token = await getAccessToken();
  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const body: BodyInit | null | undefined =
    options.body !== undefined ? JSON.stringify(options.body) : undefined;
  const { body: _omit, ...rest } = options;
  return fetch(url, { ...rest, headers, body });
}

export async function getProfile(): Promise<Record<string, unknown> | null> {
  const res = await apiFetch('/api/profile');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Record<string, unknown>;
}

export async function patchProfile(body: Record<string, unknown>): Promise<void> {
  const res = await apiFetch('/api/profile', { method: 'PATCH', body });
  if (!res.ok) throw new Error(await res.text());
}

export async function recordActivity(event: string, meta?: Record<string, unknown>): Promise<void> {
  await apiFetch('/api/activity', {
    method: 'POST',
    body: { event, meta: meta ?? {} },
  }).catch(() => {});
}
