/**
 * POST /api/jurnl/account-delete — deletes the signed-in user's JURNL account, server side.
 *
 * Order (partial failures are safe):
 *   1. every connected institution: provider access revoked (item/remove). If any revocation fails, NOTHING is deleted
 *      and the response says which step failed — a stored token is what allows the next attempt to revoke for real.
 *   2. the Supabase auth user is deleted with the service role. Every JURNL table references auth.users with
 *      ON DELETE CASCADE (snapshots, bank items, encrypted tokens, accounts, transactions, sync events).
 *   Founder grant audit rows are retained by design (FK RESTRICT on the audit table, see the grants migration).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../_lib/auth.js';
import { disconnectItem } from '../_lib/jurnlBanking/bankingService.js';
import { getBankingDeps } from '../_lib/jurnlBanking/runtime.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return res.status(503).json({ error: 'NOT_CONFIGURED', code: 'NOT_CONFIGURED' });

  const deps = await getBankingDeps();
  if (deps) {
    const items = await deps.store.forUser(user.id, user.accessToken).listItems();
    for (const item of items.filter((i) => i.status !== 'DISCONNECTED')) {
      const r = await disconnectItem(deps, user.id, item.item_id, true);
      if (!r.ok) return res.status(502).json({ ok: false, code: 'BANK_REVOCATION_FAILED', step: 'REVOKE_BANK_ACCESS', item_id: item.item_id, deleted: false });
    }
  }
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return res.status(500).json({ ok: false, code: 'ACCOUNT_DELETE_FAILED', step: 'DELETE_AUTH_USER', deleted: false, bank_access_revoked: Boolean(deps) });
  return res.status(200).json({ ok: true, deleted: true, bank_access_revoked: Boolean(deps) });
}
