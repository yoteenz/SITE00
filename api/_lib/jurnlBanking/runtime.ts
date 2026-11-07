/**
 * Builds the banking dependencies from the server environment and reports exactly what is missing.
 *
 * Environment (server only, never VITE_*):
 *   JURNL_BANKING_ENABLED=1                 master switch (default off)
 *   JURNL_BANKING_ACCESS=FOUNDER_ONLY       who may connect: FOUNDER_ONLY (active FOUNDER_FULL grant) | ALL_USERS
 *   PLAID_ENV=sandbox|production            separate credentials per environment
 *   PLAID_CLIENT_ID, PLAID_SECRET           or JURNL_PLAID_SECRET_VIA_PROXY=1 when an egress proxy injects PLAID-SECRET
 *   JURNL_PLAID_AUTH=off|optional|required  Auth product (off by default: JURNL never moves money)
 *   JURNL_PLAID_DAYS_REQUESTED=90           history requested at first link (Plaid default 90, max 730)
 *   JURNL_BANK_TOKEN_KEY (+ _VERSION)       AES-256-GCM key for provider access tokens
 *   JURNL_BANK_WEBHOOK_URL                  public HTTPS URL of /api/jurnl/bank/webhook (optional in sandbox)
 *   JURNL_PLAID_REDIRECT_URI                OAuth redirect (registered in the Plaid dashboard; optional in sandbox)
 *   JURNL_BANK_STORE=supabase|pglite        persistence (supabase uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 */
import { createClient } from '@supabase/supabase-js';
import { PlaidProvider, plaidProductsFromEnv } from './plaidProvider.js';
import type { BankingProvider, ProviderEnvironment } from './provider.js';
import { SupabaseBankStore, type BankStore } from './store.js';
import { TokenVault } from './tokenVault.js';
import type { BankingDeps } from './bankingService.js';

export type BankingConfigStatus = {
  enabled: boolean;
  environment: ProviderEnvironment | null;
  access: 'FOUNDER_ONLY' | 'ALL_USERS';
  missing: string[];
};

export function bankingConfigStatus(env: NodeJS.ProcessEnv = process.env): BankingConfigStatus {
  const missing: string[] = [];
  if (env.JURNL_BANKING_ENABLED !== '1') missing.push('JURNL_BANKING_ENABLED');
  const environment = env.PLAID_ENV === 'production' ? 'production' : env.PLAID_ENV === 'sandbox' ? 'sandbox' : null;
  if (!environment) missing.push('PLAID_ENV');
  if (!env.PLAID_CLIENT_ID) missing.push('PLAID_CLIENT_ID');
  if (!env.PLAID_SECRET && env.JURNL_PLAID_SECRET_VIA_PROXY !== '1') missing.push('PLAID_SECRET');
  if (!env.JURNL_BANK_TOKEN_KEY) missing.push('JURNL_BANK_TOKEN_KEY');
  const store = env.JURNL_BANK_STORE ?? 'supabase';
  if (store === 'supabase' && (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (environment === 'production' && !env.JURNL_BANK_WEBHOOK_URL) missing.push('JURNL_BANK_WEBHOOK_URL');
  return { enabled: missing.length === 0, environment, access: env.JURNL_BANKING_ACCESS === 'ALL_USERS' ? 'ALL_USERS' : 'FOUNDER_ONLY', missing };
}

let override: BankingDeps | null = null;
let cached: BankingDeps | null = null;
let pgliteStore: Promise<BankStore> | null = null;

/** Test / local seam: inject provider + store (e.g. PGlite) without touching env-driven construction. */
export function setBankingDepsOverride(deps: BankingDeps | null): void {
  override = deps;
  cached = null;
}

export function setPgliteBankStore(store: Promise<BankStore> | null): void {
  pgliteStore = store;
  cached = null;
}

function buildProvider(env: NodeJS.ProcessEnv): BankingProvider {
  const { products, optionalProducts } = plaidProductsFromEnv(env);
  const days = Math.min(730, Math.max(30, Number(env.JURNL_PLAID_DAYS_REQUESTED ?? 90) || 90));
  return new PlaidProvider({
    clientId: env.PLAID_CLIENT_ID ?? '',
    secret: env.PLAID_SECRET ?? 'proxy-injected',
    environment: env.PLAID_ENV === 'production' ? 'production' : 'sandbox',
    products,
    optionalProducts,
    clientName: 'JURNL',
    daysRequested: days,
  });
}

export async function getBankingDeps(env: NodeJS.ProcessEnv = process.env): Promise<BankingDeps | null> {
  if (override) return override;
  if (cached) return cached;
  const status = bankingConfigStatus(env);
  if (!status.enabled) return null;
  const vault = TokenVault.fromEnv(env);
  if (!vault) return null;
  let store: BankStore;
  if ((env.JURNL_BANK_STORE ?? 'supabase') === 'pglite') {
    if (!pgliteStore) return null;
    store = await pgliteStore;
  } else {
    const url = env.SUPABASE_URL as string;
    const service = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false, autoRefreshToken: false } });
    const anon = env.SUPABASE_ANON_KEY ?? '';
    store = new SupabaseBankStore(service, (accessToken) =>
      createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${accessToken}` } } }),
    );
  }
  cached = {
    provider: buildProvider(env),
    store,
    vault,
    webhookUrl: env.JURNL_BANK_WEBHOOK_URL || null,
    redirectUri: env.JURNL_PLAID_REDIRECT_URI || null,
    log: (event, data) => console.info(`[jurnl-banking] ${event}`, JSON.stringify(data)),
  };
  return cached;
}
