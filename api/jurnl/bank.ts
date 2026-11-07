/**
 * /api/jurnl/bank?op=… — connected banking (read-only aggregation). Webhooks: /api/jurnl/bank-webhook.
 *
 *   GET  op=config                      what is configured (names only, never values)
 *   POST op=link-token   {item_id?}     short-lived Link token (new connection, or update mode to reconnect)
 *   POST op=exchange     {public_token} server-side public token exchange, first balances + transactions sync
 *   POST op=reconnect    {item_id}      after Link update mode: keep the same Item, resume sync from its cursor
 *   GET  op=connections                 the caller's institutions + accounts (RLS-scoped read)
 *   GET  op=transactions&since=ISO      provider transactions changed since (RLS-scoped read)
 *   POST op=sync         {item_id}      retry / refresh now
 *   POST op=disconnect   {item_id, delete_imported}
 *   GET  op=catalog&target=UBER_PRO_CARD|LYFT_DIRECT   real catalog check (listing ≠ connectivity)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { completeReconnect, createLinkToken, disconnectItem, exchangePublicToken, runItemSync } from '../_lib/jurnlBanking/bankingService.js';
import { body, cors, requireBankUser, sendError } from '../_lib/jurnlBanking/http.js';
import { checkPayoutCardCatalog, PAYOUT_CARD_TARGETS } from '../_lib/jurnlBanking/institutionCatalog.js';
import { bankingConfigStatus } from '../_lib/jurnlBanking/runtime.js';
import type { BankItemRow } from '../_lib/jurnlBanking/store.js';

function publicItem(i: BankItemRow) {
  // The cursor is internal sync state; it is not needed by the browser.
  const { sync_cursor: _cursor, ...rest } = i;
  return rest;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res, 'GET, POST')) return;
  const op = String(req.query.op ?? '');

  if (op === 'config' && req.method === 'GET') {
    const s = bankingConfigStatus();
    return res.status(200).json({ configured: s.enabled, environment: s.environment, access: s.access, missing: s.missing, readOnly: true });
  }

  const ctx = await requireBankUser(req, res);
  if (!ctx) return;
  const { user, deps } = ctx;
  const b = body(req);
  const itemId = typeof b.item_id === 'string' ? b.item_id : null;

  try {
    if (op === 'link-token' && req.method === 'POST') {
      const r = await createLinkToken(deps, user.id, { itemId });
      return res.status(200).json({ link_token: r.linkToken, expiration: r.expiration, mode: r.mode, item_id: r.itemId, environment: deps.provider.environment });
    }
    if (op === 'exchange' && req.method === 'POST') {
      const r = await exchangePublicToken(deps, user.id, typeof b.public_token === 'string' ? b.public_token : '');
      return res.status(200).json({ item_id: r.itemId, status: r.status, duplicate_of: r.duplicateOf, sync: r.sync });
    }
    if (op === 'reconnect' && req.method === 'POST' && itemId) {
      const r = await completeReconnect(deps, user.id, itemId);
      return res.status(200).json({ item_id: itemId, status: r.status, sync: r.sync });
    }
    if (op === 'connections' && req.method === 'GET') {
      const reader = deps.store.forUser(user.id, user.accessToken);
      const [items, accounts] = await Promise.all([reader.listItems(), reader.listAccounts()]);
      return res.status(200).json({ environment: deps.provider.environment, items: items.map(publicItem), accounts, server_time: new Date().toISOString() });
    }
    if (op === 'transactions' && req.method === 'GET') {
      const since = typeof req.query.since === 'string' && !Number.isNaN(Date.parse(req.query.since)) ? new Date(req.query.since).toISOString() : null;
      const rows = await deps.store.forUser(user.id, user.accessToken).listTransactions(since);
      const watermark = rows.length ? rows[rows.length - 1].last_changed_at : since;
      return res.status(200).json({ transactions: rows, watermark, server_time: new Date().toISOString() });
    }
    if (op === 'sync' && req.method === 'POST' && itemId) {
      const item = await deps.store.getItem(itemId);
      if (!item || item.user_id !== user.id) return res.status(404).json({ error: 'ITEM_NOT_FOUND', code: 'ITEM_NOT_FOUND' });
      const r = await runItemSync(deps, itemId, 'MANUAL');
      const after = await deps.store.getItem(itemId);
      return res.status(200).json({ item_id: itemId, status: after?.status ?? null, sync: r });
    }
    if (op === 'disconnect' && req.method === 'POST' && itemId) {
      const r = await disconnectItem(deps, user.id, itemId, b.delete_imported === true);
      return res.status(r.ok ? 200 : 502).json(r);
    }
    if (op === 'catalog' && req.method === 'GET') {
      const target = PAYOUT_CARD_TARGETS.find((t) => t.key === req.query.target);
      if (!target) return res.status(400).json({ error: 'UNKNOWN_TARGET', code: 'UNKNOWN_TARGET' });
      return res.status(200).json(await checkPayoutCardCatalog(deps.provider, target));
    }
    return res.status(400).json({ error: 'UNKNOWN_OPERATION', code: 'UNKNOWN_OPERATION' });
  } catch (e) {
    return sendError(res, e);
  }
}
