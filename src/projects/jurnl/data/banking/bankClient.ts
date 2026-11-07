/**
 * Browser side of connected banking. Talks only to the JURNL API (never to the provider with a secret, never with an
 * access token): link tokens, the public-token exchange, connection states and imported rows. Plaid Link itself is
 * the provider's hosted flow (bank credentials are entered there, never in JURNL).
 */
import { getAccessTokenForSync } from '../repository/serverSnapshotSync';
import type { BankAccountView, BankItemView, BankTransactionView } from './types';

export type BankApiConfig = { configured: boolean; environment: 'sandbox' | 'production' | null; access: 'FOUNDER_ONLY' | 'ALL_USERS'; missing: string[]; readOnly: true };

export class BankApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

function apiBase(): string {
  return ((import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '').replace(/\/$/, '');
}

async function call<T>(op: string, init: { method: 'GET' | 'POST'; body?: unknown; query?: Record<string, string> } = { method: 'GET' }): Promise<T> {
  const token = await getAccessTokenForSync();
  const qs = new URLSearchParams({ op, ...(init.query ?? {}) });
  let res: Response;
  try {
    res = await fetch(`${apiBase()}/api/jurnl/bank?${qs.toString()}`, {
      method: init.method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new BankApiError(0, 'OFFLINE');
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new BankApiError(res.status, String(body.code ?? body.error ?? `HTTP_${res.status}`), body);
  return body as T;
}

export const bankApi = {
  config: () => call<BankApiConfig>('config'),
  linkToken: (itemId?: string | null) => call<{ link_token: string; expiration: string; mode: 'NEW' | 'UPDATE'; item_id: string | null; environment: string }>('link-token', { method: 'POST', body: { item_id: itemId ?? null } }),
  exchange: (publicToken: string) => call<{ item_id: string; status: string; duplicate_of: string | null; sync: Record<string, unknown> }>('exchange', { method: 'POST', body: { public_token: publicToken } }),
  reconnect: (itemId: string) => call<{ item_id: string; status: string; sync: Record<string, unknown> }>('reconnect', { method: 'POST', body: { item_id: itemId } }),
  connections: () => call<{ environment: string; items: BankItemView[]; accounts: BankAccountView[]; server_time: string }>('connections'),
  transactions: (since: string | null) => call<{ transactions: BankTransactionView[]; watermark: string | null; server_time: string }>('transactions', { method: 'GET', query: since ? { since } : {} }),
  sync: (itemId: string) => call<{ item_id: string; status: string | null; sync: Record<string, unknown> }>('sync', { method: 'POST', body: { item_id: itemId } }),
  disconnect: (itemId: string, deleteImported: boolean) =>
    call<{ ok: boolean; providerRevoked: boolean; providerNote?: string; accountsMarked?: number; transactionsDeleted?: number; code?: string; message?: string }>('disconnect', {
      method: 'POST',
      body: { item_id: itemId, delete_imported: deleteImported },
    }),
  catalog: (target: 'UBER_PRO_CARD' | 'LYFT_DIRECT') => call<Record<string, unknown>>('catalog', { method: 'GET', query: { target } }),
};

// ── Plaid Link (hosted by the provider; loaded from its CDN on demand) ──────────

type PlaidHandler = { open: () => void; exit: (opts?: unknown) => void; destroy: () => void };
type PlaidGlobal = {
  create: (cfg: {
    token: string;
    onSuccess: (publicToken: string, metadata: unknown) => void;
    onExit: (err: { error_code?: string; display_message?: string | null } | null, metadata: unknown) => void;
    onEvent?: (name: string) => void;
    receivedRedirectUri?: string;
  }) => PlaidHandler;
};

const PLAID_LINK_SRC = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
let loading: Promise<PlaidGlobal> | null = null;

export function loadPlaidLink(): Promise<PlaidGlobal> {
  const w = window as unknown as { Plaid?: PlaidGlobal };
  if (w.Plaid) return Promise.resolve(w.Plaid);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PLAID_LINK_SRC;
    s.async = true;
    s.onload = () => (w.Plaid ? resolve(w.Plaid) : reject(new Error('PLAID_LINK_UNAVAILABLE')));
    s.onerror = () => {
      loading = null;
      reject(new Error('PLAID_LINK_UNAVAILABLE'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export type LinkOutcome = { kind: 'SUCCESS'; publicToken: string } | { kind: 'EXIT'; errorCode: string | null; message: string | null };

/** Opens the provider's Link for a short-lived link token. Resolves when the user finishes or leaves. */
export async function openPlaidLink(linkToken: string, receivedRedirectUri?: string): Promise<LinkOutcome> {
  const Plaid = await loadPlaidLink();
  return new Promise((resolve) => {
    const handler = Plaid.create({
      token: linkToken,
      ...(receivedRedirectUri ? { receivedRedirectUri } : {}),
      onSuccess: (publicToken) => {
        resolve({ kind: 'SUCCESS', publicToken });
        handler.destroy();
      },
      onExit: (err) => {
        resolve({ kind: 'EXIT', errorCode: err?.error_code ?? null, message: err?.display_message ?? null });
        handler.destroy();
      },
    });
    handler.open();
  });
}
