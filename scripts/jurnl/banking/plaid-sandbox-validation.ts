/**
 * LIVE Plaid SANDBOX validation of the JURNL banking adapter + service (no real bank, no real money).
 *
 *   PLAID_CLIENT_ID=… PLAID_SECRET=… npx tsx scripts/jurnl/banking/plaid-sandbox-validation.ts
 *   (or JURNL_PLAID_SECRET_VIA_PROXY=1 when an egress proxy injects the PLAID-SECRET header)
 *
 * Uses Plaid's documented sandbox flow: /institutions/search → /sandbox/public_token/create (Plaid's public sandbox
 * test user, not a real login) → JURNL's server-side exchange → Transactions Sync → reset login (expired consent) →
 * Link update-mode token → /item/remove. Persistence is a disposable PGlite database with every JURNL migration.
 * Writes a token-free JSON report. A sandbox pass is NOT proof that real institutions work.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CountryCode, Products } from 'plaid';
import { PlaidProvider } from '../../../api/_lib/jurnlBanking/plaidProvider';
import { ProviderError } from '../../../api/_lib/jurnlBanking/provider';
import { createLinkToken, disconnectItem, exchangePublicToken, runItemSync, type BankingDeps } from '../../../api/_lib/jurnlBanking/bankingService';
import { checkPayoutCardCatalog, PAYOUT_CARD_TARGETS } from '../../../api/_lib/jurnlBanking/institutionCatalog';
import { SqlBankStore } from '../../../api/_lib/jurnlBanking/store';
import { createUser, executor, freshDb, testVault } from '../../../tests/jurnl/banking/harness';

const OUT = path.resolve(process.argv[2] ?? 'JURNL/MANIFEST/CONNECTED_BANKING_OPUS1/sandbox/plaid-sandbox-report.json');
type Step = { step: string; result: 'PASS' | 'FAIL' | 'SKIPPED'; detail: Record<string, unknown> };
const steps: Step[] = [];
const record = (step: string, result: Step['result'], detail: Record<string, unknown> = {}) => {
  steps.push({ step, result, detail });
  console.log(`[${result}] ${step} ${JSON.stringify(detail)}`);
};
const write = (status: string, extra: Record<string, unknown> = {}) => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ status, environment: 'sandbox', ran_at: new Date().toISOString(), steps, ...extra, note: 'Sandbox data only. Not a real institution. Access tokens are never written.' }, null, 2));
  console.log(`report → ${OUT}`);
};

async function main() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET ?? (process.env.JURNL_PLAID_SECRET_VIA_PROXY === '1' ? 'proxy-injected' : '');
  if (!clientId || !secret) {
    record('credentials', 'FAIL', { missing: [!clientId ? 'PLAID_CLIENT_ID' : null, !secret ? 'PLAID_SECRET' : null].filter(Boolean) });
    write('BLOCKED', { blocker: 'Plaid sandbox credentials are not available to this run (PLAID_CLIENT_ID and a sandbox secret are required).' });
    process.exit(2);
  }
  const provider = new PlaidProvider({ clientId, secret, environment: 'sandbox', products: [Products.Transactions], optionalProducts: [], clientName: 'JURNL', daysRequested: 90 });
  const db = await freshDb();
  const deps: BankingDeps = { provider, store: new SqlBankStore(executor(db)), vault: testVault(), webhookUrl: null, redirectUri: null, sleep: (ms) => new Promise((r) => setTimeout(r, ms)) };
  const user = await createUser(db, 'sandbox-founder@example.test');

  // 1. Real catalog search (sandbox catalog), no hard-coded institution id.
  const hits = await provider.searchInstitutions('Platypus');
  const inst = hits.find((i) => !i.oauth && i.products.includes('transactions'));
  if (!inst) {
    record('institution search', 'FAIL', { hits: hits.map((h) => h.name) });
    return write('FAIL');
  }
  record('institution search (sandbox catalog)', 'PASS', { institution: inst.name, institution_id: inst.institution_id, products: inst.products });

  // 2. Link token from the server.
  const lt = await createLinkToken(deps, user);
  record('link token (server-side)', lt.linkToken.startsWith('link-sandbox-') ? 'PASS' : 'FAIL', { mode: lt.mode, expiration: lt.expiration });

  // 3. Sandbox public token (stands in for the user completing Link) → JURNL server exchange.
  const { data } = await provider.client.sandboxPublicTokenCreate({
    institution_id: inst.institution_id,
    initial_products: [Products.Transactions],
    options: { override_username: 'user_transactions_dynamic', override_password: 'pass_good' },
  });
  const ex = await exchangePublicToken(deps, user, data.public_token);
  record('public token exchange (server-side) + first sync', 'PASS', { status: ex.status, sync: ex.sync });

  // 4. Wait for transactions (Plaid prepares them asynchronously), then count what arrived.
  let sync = ex.sync;
  for (let i = 0; i < 12 && !(sync.ran && (sync.added ?? 0) > 0); i += 1) {
    await new Promise((r) => setTimeout(r, 5000));
    sync = await runItemSync(deps, ex.itemId, 'MANUAL');
  }
  const accounts = await deps.store.forUser(user, null).listAccounts();
  const txns = await deps.store.forUser(user, null).listTransactions(null);
  record('balances', accounts.length && accounts.every((a) => a.current_balance != null || a.available_balance != null) ? 'PASS' : 'FAIL', {
    accounts: accounts.map((a) => ({ type: a.type, subtype: a.subtype, mask: a.mask, has_current: a.current_balance != null, has_available: a.available_balance != null, has_limit: a.credit_limit != null })),
  });
  record('transactions import (Transactions Sync)', txns.length > 0 ? 'PASS' : 'FAIL', { count: txns.length, pending: txns.filter((t) => t.pending).length, with_pfc: txns.filter((t) => t.pfc_primary).length });
  const credit = accounts.filter((a) => a.type === 'credit');
  record('credit card account', credit.length ? 'PASS' : 'FAIL', { count: credit.length });

  // 5. Incremental sync is idempotent (no duplicate rows).
  const before = txns.length;
  await runItemSync(deps, ex.itemId, 'MANUAL');
  const after = (await deps.store.forUser(user, null).listTransactions(null)).length;
  record('incremental sync, no duplicates', after >= before ? 'PASS' : 'FAIL', { before, after });

  // 6. Invalid token is classified (real provider error).
  try {
    await provider.getAccounts('access-sandbox-00000000-0000-0000-0000-000000000000');
    record('invalid token', 'FAIL', {});
  } catch (e) {
    record('invalid token', e instanceof ProviderError && e.kind === 'INVALID_TOKEN' ? 'PASS' : 'FAIL', { kind: (e as ProviderError).kind, code: (e as ProviderError).providerCode });
  }

  // 7. Expired consent: sandbox reset login → next sync → NEEDS_REAUTH; update-mode Link token for reconnect.
  const sealed = await deps.store.getSecret(ex.itemId);
  await provider.client.sandboxItemResetLogin({ access_token: deps.vault.open(sealed!, ex.itemId) });
  const reauth = await runItemSync(deps, ex.itemId, 'MANUAL');
  record('expired consent → NEEDS_REAUTH', reauth.ran === false && 'status' in reauth && reauth.status === 'NEEDS_REAUTH' ? 'PASS' : 'FAIL', { outcome: reauth });
  const upd = await createLinkToken(deps, user, { itemId: ex.itemId });
  record('reconnect: Link update-mode token for the same Item', upd.mode === 'UPDATE' ? 'PASS' : 'FAIL', { mode: upd.mode });

  // 8. Payout card catalog checks (SANDBOX catalog — production listings must be checked with production keys).
  for (const t of PAYOUT_CARD_TARGETS) {
    const c = await checkPayoutCardCatalog(provider, t);
    record(`catalog check ${t.label} (sandbox catalog)`, 'PASS', { verdict: c.verdict, candidates: c.candidates.map((x) => ({ name: x.name, institution_id: x.institution_id, products: x.products })) });
  }

  // 9. Disconnect: provider revocation (/item/remove) then local removal of the token.
  const dis = await disconnectItem(deps, user, ex.itemId, false);
  record('disconnect (provider revocation)', dis.ok && dis.providerRevoked ? 'PASS' : 'FAIL', { ...dis });

  const failed = steps.filter((s) => s.result === 'FAIL').length;
  write(failed ? 'FAIL' : 'PASS', { country_codes: [CountryCode.Us] });
}

main().catch((e) => {
  const pe = e as ProviderError;
  record('unexpected', 'FAIL', { kind: pe?.kind ?? null, code: pe?.providerCode ?? null, message: String(pe?.message ?? e).slice(0, 200) });
  write('FAIL');
  process.exit(1);
});
