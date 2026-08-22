import { translateStudioWorldError } from './adapter.js';
import { getStudioWorldApiBase, getStudioWorldApiKey } from './contract.js';
import { StudioWorldAdapterError } from './types.js';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  idempotencyKey?: string;
  timeoutMs?: number;
  retries?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function studioWorldFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const base = getStudioWorldApiBase();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const retries = opts.retries ?? 2;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getStudioWorldApiKey()}`,
    Accept: 'application/json',
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.idempotencyKey) headers['X-Idempotency-Key'] = opts.idempotencyKey;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: opts.method ?? 'GET',
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const text = await res.text();
      let json: unknown = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = { message: text };
        }
      }

      if (res.status === 409 && json && typeof json === 'object') {
        return json as T;
      }

      if (!res.ok) {
        const msg =
          json && typeof json === 'object' && 'message' in json
            ? String((json as { message: unknown }).message)
            : `Studio World HTTP ${res.status}`;
        const err = new Error(`${res.status}: ${msg}`);
        if (res.status >= 500 && attempt < retries) {
          lastError = err;
          await sleep(500 * (attempt + 1));
          continue;
        }
        throw err;
      }

      return (json ?? {}) as T;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'));
      if ((isTimeout || (err instanceof Error && err.message.includes('5'))) && attempt < retries) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      const translated = translateStudioWorldError(err);
      throw new StudioWorldAdapterError(translated.code as never, translated.clientMessage, err);
    }
  }

  const translated = translateStudioWorldError(lastError);
  throw new StudioWorldAdapterError(translated.code as never, translated.clientMessage, lastError);
}
