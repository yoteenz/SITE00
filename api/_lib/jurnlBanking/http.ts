/**
 * HTTP layer for /api/jurnl/bank/*. Every route except the webhook requires a Supabase session and (by default)
 * an active FOUNDER_FULL grant resolved server-side. Responses never contain a provider access token.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../auth.js';
import { listActiveInternalGrants } from '../jurnlEntitlements/internalGrantStore.js';
import { hasActiveFounderFull } from '../../../shared/site00-monetization/internalGrants.js';
import { JURNL_MONETIZATION_CONTRACT } from '../jurnlEntitlements/jurnlProject.js';
import { ProviderError } from './provider.js';
import { BankingServiceError, type BankingDeps } from './bankingService.js';
import { bankingConfigStatus, getBankingDeps } from './runtime.js';

export type BankRequestUser = { id: string; email: string; accessToken: string };

let authOverride: ((req: VercelRequest) => Promise<BankRequestUser | null>) | null = null;
let accessOverride: ((userId: string) => Promise<boolean>) | null = null;

/** Test seams (vitest): replace Supabase token validation / grant lookup. */
export function setBankAuthOverrideForTests(fn: typeof authOverride, access: typeof accessOverride = null) {
  authOverride = fn;
  accessOverride = access;
}

export function cors(req: VercelRequest, res: VercelResponse, methods: string): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

async function hasBankingAccess(userId: string): Promise<boolean> {
  if (accessOverride) return accessOverride(userId);
  if (bankingConfigStatus().access === 'ALL_USERS') return true;
  const grants = await listActiveInternalGrants(JURNL_MONETIZATION_CONTRACT.projectId, userId);
  return hasActiveFounderFull(grants, JURNL_MONETIZATION_CONTRACT.projectId);
}

/** Resolves the caller and the deps, or writes the refusal and returns null. */
export async function requireBankUser(req: VercelRequest, res: VercelResponse): Promise<{ user: BankRequestUser; deps: BankingDeps } | null> {
  const user = authOverride ? await authOverride(req) : await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    return null;
  }
  const deps = await getBankingDeps();
  if (!deps) {
    const s = bankingConfigStatus();
    res.status(503).json({ error: 'Connected banking is not configured', code: 'BANKING_NOT_CONFIGURED', missing: s.missing });
    return null;
  }
  if (!(await hasBankingAccess(user.id))) {
    res.status(403).json({ error: 'Connected banking is not enabled for this account', code: 'BANKING_NOT_ENABLED_FOR_ACCOUNT' });
    return null;
  }
  return { user, deps };
}

export function body(req: VercelRequest): Record<string, unknown> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body as Record<string, unknown>;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

/** Maps service / provider failures to plain responses. The provider code is kept for support, never the token. */
export function sendError(res: VercelResponse, e: unknown) {
  if (e instanceof BankingServiceError) return res.status(e.httpStatus).json({ error: e.code, code: e.code });
  if (e instanceof ProviderError) {
    const status = e.kind === 'RATE_LIMITED' ? 429 : e.kind === 'INVALID_CREDENTIALS_CONFIG' ? 503 : e.kind === 'INSTITUTION_UNAVAILABLE' ? 502 : 400;
    return res.status(status).json({ error: e.kind, code: e.kind, providerCode: e.providerCode, retryable: e.retryable });
  }
  console.error('[jurnl-banking] unexpected', (e as Error)?.name);
  return res.status(500).json({ error: 'INTERNAL', code: 'INTERNAL' });
}
