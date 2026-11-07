/**
 * Plaid adapter: field mapping, error classification and webhook verification (real ES256 signatures made with a
 * locally generated key; Plaid's /webhook_verification_key/get is stubbed to return that public key).
 * These are unit tests. Live sandbox validation is scripts/jurnl/banking/plaid-sandbox-validation.ts.
 */
import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { PlaidApi } from 'plaid';
import { classifyPlaidError, mapPlaidTransaction, PlaidProvider, plaidProductsFromEnv } from '../../../api/_lib/jurnlBanking/plaidProvider';

function signer() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = publicKey.export({ format: 'jwk' }) as { x: string; y: string; crv: string; kty: string };
  const kid = 'kid-test-1';
  const sign = (body: string, iat = Math.floor(Date.now() / 1000), shaOverride?: string) => {
    const head = Buffer.from(JSON.stringify({ alg: 'ES256', kid, typ: 'JWT' })).toString('base64url');
    const claims = Buffer.from(JSON.stringify({ iat, request_body_sha256: shaOverride ?? crypto.createHash('sha256').update(body).digest('hex') })).toString('base64url');
    const sig = crypto.sign('sha256', Buffer.from(`${head}.${claims}`), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url');
    return `${head}.${claims}.${sig}`;
  };
  const client = {
    webhookVerificationKeyGet: async ({ key_id }: { key_id: string }) => {
      if (key_id !== kid) throw Object.assign(new Error('not found'), { response: { status: 400, data: { error_code: 'INVALID_FIELD' } } });
      return { data: { key: { ...jwk, alg: 'ES256', kid, use: 'sig', created_at: 1, expired_at: null } } };
    },
  } as unknown as PlaidApi;
  const provider = new PlaidProvider({ clientId: 'test', secret: 'proxy-injected', environment: 'sandbox', products: [], optionalProducts: [], clientName: 'JURNL', daysRequested: 90 }, client);
  return { provider, sign };
}

describe('webhook verification (Plaid-Verification ES256 JWT over the raw body)', () => {
  const body = JSON.stringify({ webhook_type: 'TRANSACTIONS', webhook_code: 'SYNC_UPDATES_AVAILABLE', item_id: 'item-1' }, null, 2);

  it('accepts a correctly signed, fresh webhook for the exact body', async () => {
    const { provider, sign } = signer();
    const v = await provider.verifyWebhook(body, { 'plaid-verification': sign(body) });
    expect(v.verified).toBe(true);
  });

  it('rejects: missing header, altered body, stale iat, wrong key, wrong algorithm', async () => {
    const { provider, sign } = signer();
    expect(await provider.verifyWebhook(body, {})).toMatchObject({ verified: false, reason: 'MISSING_SIGNATURE' });
    expect(await provider.verifyWebhook(body.replace('item-1', 'item-2'), { 'plaid-verification': sign(body) })).toMatchObject({ verified: false, reason: 'BODY_MISMATCH' });
    expect(await provider.verifyWebhook(body, { 'plaid-verification': sign(body, Math.floor(Date.now() / 1000) - 600) })).toMatchObject({ verified: false, reason: 'STALE_SIGNATURE' });
    const other = signer();
    expect(await provider.verifyWebhook(body, { 'plaid-verification': other.sign(body) })).toMatchObject({ verified: false, reason: 'BAD_SIGNATURE' });
    const hs = `${Buffer.from(JSON.stringify({ alg: 'HS256', kid: 'kid-test-1' })).toString('base64url')}.e30.sig`;
    expect(await provider.verifyWebhook(body, { 'plaid-verification': hs })).toMatchObject({ verified: false, reason: 'UNEXPECTED_ALGORITHM' });
  });

  it('whitespace matters: re-serialized JSON does not verify', async () => {
    const { provider, sign } = signer();
    const compact = JSON.stringify(JSON.parse(body));
    expect(await provider.verifyWebhook(compact, { 'plaid-verification': sign(body) })).toMatchObject({ verified: false, reason: 'BODY_MISMATCH' });
  });
});

describe('error classification → connection health', () => {
  it.each([
    ['ITEM_LOGIN_REQUIRED', 'ITEM_ERROR', 'REAUTH_REQUIRED'],
    ['PENDING_EXPIRATION', 'ITEM_ERROR', 'REAUTH_REQUIRED'],
    ['USER_PERMISSION_REVOKED', 'ITEM_ERROR', 'PERMISSION_REVOKED'],
    ['ACCESS_NOT_GRANTED', 'ITEM_ERROR', 'PERMISSION_REVOKED'],
    ['INSTITUTION_DOWN', 'INSTITUTION_ERROR', 'INSTITUTION_UNAVAILABLE'],
    ['INSTITUTION_NOT_RESPONDING', 'INSTITUTION_ERROR', 'INSTITUTION_UNAVAILABLE'],
    ['TRANSACTIONS_LIMIT', 'RATE_LIMIT_EXCEEDED', 'RATE_LIMITED'],
    ['TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION', 'TRANSACTIONS_ERROR', 'MUTATION_DURING_PAGINATION'],
    ['PRODUCT_NOT_READY', 'ITEM_ERROR', 'PRODUCT_NOT_READY'],
    ['INVALID_ACCESS_TOKEN', 'INVALID_INPUT', 'INVALID_TOKEN'],
    ['INVALID_API_KEYS', 'INVALID_INPUT', 'INVALID_CREDENTIALS_CONFIG'],
    ['SOMETHING_NEW', 'API_ERROR', 'PROVIDER_ERROR'],
  ])('%s → %s', (code, type, kind) => {
    expect(classifyPlaidError(code, type).kind).toBe(kind);
  });
});

describe('mapping and products', () => {
  it('keeps the provider sign convention and every field it delivered; never invents missing ones', () => {
    const t = mapPlaidTransaction({
      account_id: 'a',
      transaction_id: 't',
      amount: -25.5,
      iso_currency_code: 'USD',
      unofficial_currency_code: null,
      date: '2026-11-01',
      authorized_date: null,
      authorized_datetime: null,
      datetime: null,
      name: 'UBER EARNINGS',
      merchant_name: null,
      pending: false,
      pending_transaction_id: null,
      account_owner: null,
      payment_channel: 'other',
      transaction_code: null,
      location: {} as never,
      payment_meta: {} as never,
      personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_OTHER_INCOME', confidence_level: 'HIGH' },
      counterparties: [{ name: 'Uber', type: 'marketplace' as never, website: null, logo_url: null }],
    } as never);
    expect(t).toMatchObject({ amount: -25.5, pfc_detailed: 'INCOME_OTHER_INCOME', pfc_confidence: 'HIGH', merchant_name: null, counterparty_names: ['Uber'] });
  });

  it('requests Transactions only by default; Auth is an explicit founder choice', () => {
    expect(plaidProductsFromEnv({} as NodeJS.ProcessEnv)).toEqual({ products: ['transactions'], optionalProducts: [] });
    expect(plaidProductsFromEnv({ JURNL_PLAID_AUTH: 'optional' } as NodeJS.ProcessEnv).optionalProducts).toEqual(['auth']);
    expect(plaidProductsFromEnv({ JURNL_PLAID_AUTH: 'required' } as NodeJS.ProcessEnv).products).toEqual(['transactions', 'auth']);
  });
});
