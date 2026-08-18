/** SITE 00 post-sign-in redirect resolution (standalone). */

const MAX_RETURN_LEN = 1024;

export const SITE00_CTRL_ROOM_DEFAULT_PATH = '/control';

function isSafeInternalPath(p: string): boolean {
  if (!p || p.length > MAX_RETURN_LEN) return false;
  if (!p.startsWith('/')) return false;
  if (p.startsWith('//')) return false;
  return true;
}

function normalizeReturnToParam(returnToParam: string | null | undefined): string | null {
  if (returnToParam == null || returnToParam === '') return null;
  let raw = returnToParam.trim().slice(0, MAX_RETURN_LEN * 4);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* use raw */
  }
  raw = raw.slice(0, MAX_RETURN_LEN);
  if (isSafeInternalPath(raw)) return raw;
  return null;
}

export function resolveSite00ReturnToAfterSignIn(
  returnToParam: string | null | undefined,
  state: { from?: string } | null | undefined,
): string {
  const fromQuery = normalizeReturnToParam(returnToParam);
  if (fromQuery) return fromQuery;

  const from = state?.from;
  if (typeof from === 'string') {
    const t = from.trim().slice(0, MAX_RETURN_LEN);
    if (isSafeInternalPath(t)) return t;
  }

  return SITE00_CTRL_ROOM_DEFAULT_PATH;
}
