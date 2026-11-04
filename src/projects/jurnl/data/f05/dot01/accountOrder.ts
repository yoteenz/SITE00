/**
 * F05 DOT 01 — the user's order of their places. A display preference stored in settings.accountOrder: it decides
 * which four places the MONEY parent shows and the order of ALL ACCOUNTS. It never changes a balance, an id or the
 * ledger. Places missing from the saved order (added later) keep their natural order after the ordered ones.
 */
import type { JurnlAccountRecord } from '../../foundation/accounts';
import { getRepository } from '../../repository/deviceRepository';
import type { Done } from './result';

export function orderAccounts<T extends Pick<JurnlAccountRecord, 'account_id'>>(accounts: T[], order: readonly string[] | undefined = getRepository().getSettings().accountOrder): T[] {
  if (!order?.length) return accounts;
  const rank = new Map(order.map((id, i) => [id, i]));
  return accounts
    .map((a, i) => ({ a, i, r: rank.get(a.account_id) }))
    .sort((x, y) => (x.r ?? Number.MAX_SAFE_INTEGER) - (y.r ?? Number.MAX_SAFE_INTEGER) || x.i - y.i)
    .map((x) => x.a);
}

/** Saves a new order. It must name exactly the active places, each once. */
export function setAccountOrder(ids: string[]): Done<string[]> {
  const repo = getRepository();
  const active = repo.listAccounts().filter((a) => a.status === 'ACTIVE').map((a) => a.account_id);
  const set = new Set(ids);
  if (set.size !== ids.length) return { ok: false, error: 'EACH POCKET CAN APPEAR ONLY ONCE.' };
  if (ids.length !== active.length || active.some((id) => !set.has(id))) return { ok: false, error: 'THE ORDER MUST LIST EVERY ACTIVE POCKET. NOTHING WAS SAVED.' };
  const archived = (repo.getSettings().accountOrder ?? []).filter((id) => !set.has(id));
  repo.patchSettings({ accountOrder: [...ids, ...archived] });
  return { ok: true, value: ids };
}

/** Moves one place up (-1) or down (+1) in the current order (keyboard / screen-reader reorder). */
export function moveInOrder(ids: string[], id: string, delta: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const next = [...ids];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}
