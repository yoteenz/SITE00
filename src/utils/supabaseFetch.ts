/** Bounded fetch for Supabase Auth/API so sign-in cannot hang when the project is unreachable. */

export const SUPABASE_CLIENT_FETCH_TIMEOUT_MS = 15_000;

export function fetchWithSupabaseTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeoutMs = SUPABASE_CLIENT_FETCH_TIMEOUT_MS;
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const userSignal = init?.signal;
    let signal: AbortSignal = timeoutSignal;
    if (userSignal) {
      if ('any' in AbortSignal && typeof AbortSignal.any === 'function') {
        signal = AbortSignal.any([userSignal, timeoutSignal]);
      } else if (userSignal.aborted) {
        signal = userSignal;
      }
    }
    return fetch(input, { ...init, signal });
  }

  return new Promise<Response>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      reject(new DOMException('Supabase request timed out', 'TimeoutError'));
    }, timeoutMs);
    fetch(input, init)
      .then((res) => {
        globalThis.clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        globalThis.clearTimeout(timer);
        reject(err);
      });
  });
}

export function isSupabaseTransportFailure(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /timed out|timeout|network|failed to fetch|load failed/i.test(msg);
}

export const SUPABASE_UNAVAILABLE_MESSAGE =
  'SIGN-IN SERVICE IS TEMPORARILY UNAVAILABLE. SUPABASE DID NOT RESPOND — TRY AGAIN IN A FEW MINUTES.';
