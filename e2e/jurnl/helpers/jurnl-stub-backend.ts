/**
 * STUBBED NETWORK for production-mode UI E2E (`/jurnl/app`). Everything here is synthetic and intercepted in the
 * browser by Playwright — no request leaves the machine:
 *   - a minimal Supabase Auth (GoTrue) surface: signup, password grant, user, logout, resend, recover
 *   - the JURNL API: repository (compare-and-swap on revision, like jurnl_put_snapshot), entitlements, bank ops
 *   - the provider's Link script (cdn.plaid.com) replaced by a stub that completes with a synthetic public token
 * It exercises the REAL JURNL browser code (auth adapter, hydrate, import, reconciliation, Safe to Spend, UI states)
 * against deterministic responses. It is NOT a real auth server, NOT a real bank and NOT Plaid.
 */
import type { Page, Route } from '@playwright/test';

export const STUB_AUTH = 'http://jurnl-auth.e2e.test';
export const STUB_API = 'http://jurnl-api.e2e.test';

type User = { id: string; email: string; password: string; confirmed: boolean; first: string; last: string };
type Item = { item_id: string; institution_name: string; status: string; last_successful_sync_at: string | null; last_balance_at: string | null; disconnected_at: string | null };

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');

export class StubBackend {
  users = new Map<string, User>();
  snapshot: { data: Record<string, unknown> | null; revision: number } = { data: null, revision: 0 };
  putLog: { expected: number; result: number | 'CONFLICT' }[] = [];
  items: Item[] = [];
  accounts: Record<string, unknown>[] = [];
  transactions: Record<string, unknown>[] = [];
  linkedOnExchange: (() => void) | null = null;
  now = new Date().toISOString();

  user(email: string, password: string, confirmed = true, first = 'ADA', last = 'FOUNDER'): User {
    const u = { id: `00000000-0000-4000-8000-${String(this.users.size + 1).padStart(12, '0')}`, email: email.toLowerCase(), password, confirmed, first, last };
    this.users.set(u.email, u);
    return u;
  }

  private gotrueUser(u: User) {
    return {
      id: u.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: u.email,
      email_confirmed_at: u.confirmed ? this.now : null,
      confirmed_at: u.confirmed ? this.now : null,
      app_metadata: { provider: 'email' },
      user_metadata: { first_name: u.first, last_name: u.last },
      identities: [{ id: u.id, user_id: u.id, provider: 'email', identity_data: { sub: u.id, email: u.email } }],
      created_at: this.now,
      updated_at: this.now,
    };
  }

  private session(u: User) {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const access_token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', exp })}.stub-signature`;
    return { access_token, token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: `refresh-${u.id}`, user: this.gotrueUser(u) };
  }

  private userFromAuth(route: Route): User | null {
    const h = route.request().headers()['authorization'] ?? '';
    const token = h.replace(/^Bearer /, '');
    try {
      const sub = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')).sub;
      return [...this.users.values()].find((u) => u.id === sub) ?? null;
    } catch {
      return null;
    }
  }

  async install(page: Page) {
    const json = (route: Route, status: number, body: unknown) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });

    await page.route(`${STUB_AUTH}/**`, async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
      const body = (req.postDataJSON?.() ?? {}) as Record<string, unknown>;
      if (url.pathname === '/auth/v1/signup') {
        const email = String(body.email).toLowerCase();
        if (this.users.has(email)) return json(route, 200, { ...this.gotrueUser(this.users.get(email)!), identities: [] });
        const meta = (body.data ?? {}) as { first_name?: string; last_name?: string };
        const u = this.user(email, String(body.password), false, meta.first_name ?? 'ADA', meta.last_name ?? 'FOUNDER');
        return json(route, 200, this.gotrueUser(u));
      }
      if (url.pathname === '/auth/v1/token') {
        if (url.searchParams.get('grant_type') === 'refresh_token') {
          const id = String(body.refresh_token).replace('refresh-', '');
          const u = [...this.users.values()].find((x) => x.id === id);
          return u ? json(route, 200, this.session(u)) : json(route, 400, { code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' });
        }
        const u = this.users.get(String(body.email).toLowerCase());
        if (!u || u.password !== body.password) return json(route, 400, { code: 'invalid_credentials', error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'Invalid login credentials' });
        if (!u.confirmed) return json(route, 400, { code: 'email_not_confirmed', error: 'invalid_grant', error_description: 'Email not confirmed', msg: 'Email not confirmed' });
        return json(route, 200, this.session(u));
      }
      if (url.pathname === '/auth/v1/user') {
        const u = this.userFromAuth(route);
        return u ? json(route, 200, this.gotrueUser(u)) : json(route, 401, { code: 'bad_jwt', msg: 'invalid JWT' });
      }
      if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
      if (url.pathname === '/auth/v1/resend' || url.pathname === '/auth/v1/recover') return json(route, 200, {});
      return json(route, 404, { msg: 'not stubbed' });
    });

    await page.route(`${STUB_API}/api/jurnl/**`, async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
      const user = this.userFromAuth(route);
      if (url.pathname === '/api/jurnl/repository') {
        if (!user) return json(route, 401, { code: 'AUTH_REQUIRED' });
        if (req.method() === 'GET') return json(route, 200, { snapshot: this.snapshot.data, updatedAt: this.snapshot.data ? this.now : null, revision: this.snapshot.revision, dataMode: this.snapshot.data ? 'PROVIDER_SANDBOX' : null, schemaVersion: 5 });
        const b = req.postDataJSON() as { snapshot: Record<string, unknown>; expectedRevision: number; dataMode: string };
        if (b.dataMode !== 'PROVIDER_SANDBOX' && b.dataMode !== 'PRODUCTION') return json(route, 400, { code: 'DATA_MODE_REQUIRED' });
        if (b.expectedRevision !== this.snapshot.revision) {
          this.putLog.push({ expected: b.expectedRevision, result: 'CONFLICT' });
          return json(route, 409, { code: 'SNAPSHOT_CONFLICT' });
        }
        this.snapshot = { data: b.snapshot, revision: this.snapshot.revision + 1 };
        this.putLog.push({ expected: b.expectedRevision, result: this.snapshot.revision });
        return json(route, 200, { ok: true, updatedAt: new Date().toISOString(), revision: this.snapshot.revision });
      }
      if (url.pathname.startsWith('/api/jurnl/entitlements')) {
        if (!user) return json(route, 401, { code: 'AUTH_REQUIRED' });
        return json(route, 200, { projectId: 'jurnl', capabilities: [], effectivePlanId: 'JURNL_FREE', subscriptionState: 'NONE', source: 'SERVER_VERIFIED', authoritative: true, status: 'RESOLVED', internalGrants: { active: ['FOUNDER_FULL'], enforcementSource: 'INTERNAL_GRANT' }, presentation: { simulatedPlanId: null, previewActive: false } });
      }
      if (url.pathname === '/api/jurnl/bank') {
        const op = url.searchParams.get('op');
        if (op === 'config') return json(route, 200, { configured: true, environment: 'sandbox', access: 'FOUNDER_ONLY', missing: [], readOnly: true });
        if (!user) return json(route, 401, { code: 'AUTH_REQUIRED' });
        if (op === 'connections') return json(route, 200, { environment: 'sandbox', items: this.items.map((i) => this.itemView(i)), accounts: this.accounts, server_time: new Date().toISOString() });
        if (op === 'transactions') return json(route, 200, { transactions: this.transactions, watermark: null, server_time: new Date().toISOString() });
        if (op === 'link-token') return json(route, 200, { link_token: 'link-sandbox-stub', expiration: new Date(Date.now() + 3600e3).toISOString(), mode: 'NEW', item_id: null, environment: 'sandbox' });
        if (op === 'exchange') {
          this.linkedOnExchange?.();
          return json(route, 200, { item_id: this.items.at(-1)?.item_id ?? null, status: 'ACTIVE', duplicate_of: null, sync: { ran: true } });
        }
        if (op === 'sync') return json(route, 200, { item_id: (req.postDataJSON() as { item_id: string }).item_id, status: this.items[0]?.status ?? null, sync: { ran: true } });
        if (op === 'disconnect') {
          const id = (req.postDataJSON() as { item_id: string }).item_id;
          const it = this.items.find((x) => x.item_id === id);
          if (it) {
            it.status = 'DISCONNECTED';
            it.disconnected_at = new Date().toISOString();
          }
          for (const a of this.accounts) if (a.item_id === id) a.status = 'DISCONNECTED';
          return json(route, 200, { ok: true, providerRevoked: true, providerNote: 'REVOKED', accountsMarked: 1, transactionsDeleted: 0 });
        }
        if (op === 'catalog') return json(route, 200, { verdict: 'NOT_LISTED', note: 'NOT AVAILABLE TO CONNECT. RECORD THIS CARD BY HAND.' });
      }
      return json(route, 404, { code: 'NOT_STUBBED' });
    });

    // The provider's hosted Link is replaced by a stub that "finishes" with a synthetic public token.
    await page.route('https://cdn.plaid.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: `window.Plaid={create:function(c){return{open:function(){setTimeout(function(){c.onSuccess('public-sandbox-stub',{})},60)},exit:function(){},destroy:function(){}}}};` }),
    );
  }

  private itemView(i: Item) {
    return { ...i, provider: 'PLAID', provider_env: 'sandbox', institution_id: `ins-${i.item_id}`, products: ['transactions'], consent_granted_at: this.now, consent_expires_at: null, last_sync_started_at: i.last_successful_sync_at, last_webhook_at: null, last_error_code: null, last_error_at: null, new_accounts_available: false, provider_revoked_at: i.status === 'DISCONNECTED' ? i.disconnected_at : null, created_at: this.now, updated_at: this.now };
  }

  /** Synthetic connected institutions: checking, payout card, credit card (sandbox-labelled). */
  seedBanks() {
    const at = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    this.items = [
      { item_id: 'item-bank', institution_name: 'SYNTHETIC BANK (TEST)', status: 'ACTIVE', last_successful_sync_at: at, last_balance_at: at, disconnected_at: null },
      { item_id: 'item-payout', institution_name: 'SYNTHETIC PAYOUT CARD (TEST)', status: 'ACTIVE', last_successful_sync_at: at, last_balance_at: at, disconnected_at: null },
      { item_id: 'item-card', institution_name: 'SYNTHETIC CARD CO (TEST)', status: 'ACTIVE', last_successful_sync_at: at, last_balance_at: at, disconnected_at: null },
    ];
    const acc = (item_id: string, id: string, name: string, type: string, subtype: string, cur: number, avail: number | null, limit: number | null = null) => ({
      bank_account_id: `${item_id}-${id}`, item_id, provider_account_id: id, persistent_account_id: null, name, official_name: null, mask: id.slice(-4), type, subtype, iso_currency_code: 'USD', unofficial_currency_code: null,
      current_balance: cur, available_balance: avail, credit_limit: limit, balance_as_of: at, status: 'ACTIVE', updated_at: at,
    });
    this.accounts = [acc('item-bank', 'chk1111', 'EVERYDAY CHECKING', 'depository', 'checking', 2410, 2385.5), acc('item-payout', 'pay2222', 'DRIVER PAYOUT CARD', 'depository', 'prepaid', 310, 310), acc('item-card', 'cc3333', 'REWARDS CARD', 'credit', 'credit card', 465.7, 1534.3, 2000)];
    const day = (n: number) => new Date(Date.now() - n * 86400e3).toISOString().slice(0, 10);
    let k = 0;
    const tx = (item_id: string, acct: string, id: string, amount: number, date: string, p: Record<string, unknown> = {}) => ({
      item_id, provider_account_id: acct, provider_transaction_id: id, pending: false, pending_transaction_id: null, amount, iso_currency_code: 'USD', unofficial_currency_code: null, date, authorized_date: null,
      name: null, merchant_name: null, merchant_entity_id: null, counterparty_names: null, pfc_primary: null, pfc_detailed: null, pfc_confidence: null, payment_channel: 'online', transaction_code: null,
      provider_state: 'ACTIVE', revision: 1, first_seen_at: at, last_changed_at: new Date(Date.parse(at) + ++k * 1000).toISOString(), removed_at: null, ...p,
    });
    this.transactions = [
      tx('item-payout', 'pay2222', 'p-uber', -146.8, day(2), { name: 'UBER INSTANT PAY', counterparty_names: ['Uber'], pfc_primary: 'INCOME' }),
      tx('item-card', 'cc3333', 'g-1', 73.4, day(1), { merchant_name: 'Synthetic Grocer', pfc_primary: 'FOOD_AND_DRINK', pfc_detailed: 'FOOD_AND_DRINK_GROCERIES' }),
      tx('item-bank', 'chk1111', 'x-out', 200, day(1), { name: 'ONLINE TRANSFER TO DRIVER CARD 2222', pfc_primary: 'TRANSFER_OUT', pfc_detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER' }),
      tx('item-payout', 'pay2222', 'x-in', -200, day(1), { name: 'TRANSFER FROM CHECKING 1111', pfc_primary: 'TRANSFER_IN', pfc_detailed: 'TRANSFER_IN_ACCOUNT_TRANSFER' }),
      tx('item-bank', 'chk1111', 'cp-out', 120, day(0), { name: 'SYNTHETIC CARD CO CREDIT CARD PAYMENT', pfc_primary: 'LOAN_PAYMENTS', pfc_detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' }),
      tx('item-card', 'cc3333', 'cp-in', -120, day(0), { name: 'PAYMENT THANK YOU' }),
      tx('item-card', 'cc3333', 'pend-1', 38, day(0), { pending: true, merchant_name: 'Synthetic Pharmacy' }),
    ];
  }
}
