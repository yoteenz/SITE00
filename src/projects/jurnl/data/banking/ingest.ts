/**
 * Applies a pull from the connected-banking API to the user's ledger. Pure and deterministic.
 *
 * - ONE ledger: imported transactions become LedgerEntry rows with source IMPORTED next to the user's own entries.
 * - Pending → posted: the posted transaction names its pending one (pending_transaction_id); it takes over the same
 *   JURNL entry, so a purchase is never counted twice.
 * - Provider removals and revisions are never dropped: a removed transaction stays in history as REMOVED BY YOUR BANK
 *   (and stops counting); every change is recorded in `import.history`.
 * - The user's corrections live in `bank.overrides` (keyed by the entry's first provider id) and are re-applied on
 *   every pull, so a re-sync cannot erase them. Provider values are kept untouched in `import.original`.
 * - Reconnecting or re-linking an institution reuses the same JURNL account (persistent account id, or institution +
 *   mask + type), so imported history is never lost.
 * - Idempotent: applying the same pull twice yields the same ledger.
 */
import type { AccountConnection, JurnlAccountRecord } from '../foundation/accounts';
import type { AccountType } from '../foundation/categories';
import { JURNL_SPEND_CATEGORIES } from '../foundation/categories';
import type { CalendarDate } from '../foundation/dates';
import type { ImportProvenance, LedgerEntry } from '../home/moneyTypes';
import type { RepositorySnapshot } from '../repository/types';
import { classifyImported } from './classify';
import {
  accountKey,
  EMPTY_BANK_STATE,
  importKey,
  type BankAccountView,
  type BankConnectionStatus,
  type BankItemView,
  type BankLedgerState,
  type BankTransactionView,
} from './types';

export type BankPull = { items: BankItemView[]; accounts: BankAccountView[]; transactions: BankTransactionView[]; pulledAt: string };

export type IngestReport = { accountsCreated: number; accountsUpdated: number; added: number; modified: number; posted: number; removed: number; unchanged: number; skippedUnknownAccount: number };

/** Deterministic, compact id (FNV-1a 64-bit, base 36). */
export function stableId(prefix: string, key: string): string {
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < key.length; i += 1) {
    h ^= BigInt(key.charCodeAt(i));
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return `${prefix}-${h.toString(36)}`;
}

export function jurnlAccountType(type: string, subtype: string | null): AccountType {
  const t = type.toLowerCase();
  const s = (subtype ?? '').toLowerCase();
  if (t === 'credit') return 'CREDIT_CARD';
  if (t === 'loan') return 'LOAN';
  if (t === 'investment' || t === 'brokerage') return 'INVESTMENT';
  if (t === 'depository') {
    if (s === 'savings' || s === 'money market' || s === 'cd' || s === 'hsa') return 'SAVINGS';
    if (s === 'prepaid' || s === 'paypal' || s === 'cash management' || s === 'ebt') return 'DEBIT_CARD';
    return 'CHECKING';
  }
  return 'OTHER';
}

const PAYOUT_NAME = /\b(UBER|LYFT|BRANCH|PAYFARE)\b/;

function connectionFor(a: BankAccountView, item: BankItemView | undefined): AccountConnection {
  const isDeposit = a.type.toLowerCase() === 'depository';
  return {
    provider: 'PLAID',
    item_id: a.item_id,
    provider_account_id: a.provider_account_id,
    persistent_account_id: a.persistent_account_id,
    institution_name: item?.institution_name ?? null,
    provider_type: a.type,
    provider_subtype: a.subtype,
    balance_as_of: a.balance_as_of,
    current_balance: a.current_balance,
    available_balance: a.available_balance,
    credit_limit: a.credit_limit,
    pending_reflected: isDeposit ? (a.available_balance != null ? true : null) : null,
    status: a.status === 'DISCONNECTED' ? 'DISCONNECTED' : (item?.status ?? 'ACTIVE'),
    last_successful_sync_at: item?.last_successful_sync_at ?? null,
  };
}

function findReusableAccount(accounts: JurnlAccountRecord[], a: BankAccountView, item: BankItemView | undefined, linkedIds: Set<string>): JurnlAccountRecord | null {
  const connected = accounts.filter((x) => x.connection && !linkedIds.has(x.account_id));
  if (a.persistent_account_id) {
    const hit = connected.find((x) => x.connection?.persistent_account_id === a.persistent_account_id);
    if (hit) return hit;
  }
  if (!a.mask) return null;
  // Same institution, same mask and type, and its old connection is gone (re-linked after a disconnect).
  return (
    connected.find(
      (x) =>
        x.connection?.provider_type === a.type &&
        x.connection?.provider_subtype === a.subtype &&
        x.masked_identifier === a.mask &&
        x.connection?.institution_name != null &&
        x.connection.institution_name === (item?.institution_name ?? null) &&
        (x.connection.status === 'DISCONNECTED' || x.connection.item_id !== a.item_id),
    ) ?? null
  );
}

function accountRecord(a: BankAccountView, item: BankItemView | undefined, existing: JurnlAccountRecord | null, userId: string, id: string, now: string): JurnlAccountRecord {
  const type = jurnlAccountType(a.type, a.subtype);
  const liability = type === 'CREDIT_CARD' || type === 'LOAN';
  const providerName = (a.official_name || a.name || 'CONNECTED ACCOUNT').trim().toUpperCase();
  const disconnected = a.status === 'DISCONNECTED' || item?.status === 'DISCONNECTED';
  // Assets: the provider's available balance (already net of pending debits) when given, else current.
  const assetBalance = a.available_balance ?? a.current_balance;
  const owed = a.current_balance;
  const balance = liability ? owed : assetBalance;
  const payout = PAYOUT_NAME.test(`${providerName} ${(item?.institution_name ?? '').toUpperCase()}`);
  return {
    account_id: id,
    user_id: userId,
    institution_id: item?.institution_id ?? existing?.institution_id ?? null,
    display_name: existing?.display_name_set_by_user ? existing.display_name : existing?.display_name && existing.connection ? existing.display_name : providerName,
    account_type: existing?.account_type && existing.connection ? existing.account_type : type,
    subtype: a.subtype,
    currency: (a.iso_currency_code === 'USD' || !a.iso_currency_code ? 'USD' : (a.iso_currency_code as JurnlAccountRecord['currency'])) ?? 'USD',
    // A null provider balance is unknown, not zero: the previous known value is kept and the as-of date says how old.
    balance: balance ?? existing?.balance ?? 0,
    available_balance: liability ? (a.available_balance ?? existing?.available_balance ?? 0) : (balance ?? existing?.available_balance ?? 0),
    credit_limit: liability ? (a.credit_limit ?? existing?.credit_limit ?? null) : null,
    is_manual: false,
    is_connected: !disconnected,
    connection_id: a.item_id,
    status: existing?.status ?? 'ACTIVE',
    include_in_safe_to_spend: existing ? existing.include_in_safe_to_spend : type === 'CHECKING' || type === 'DEBIT_CARD',
    include_in_net_worth: existing ? existing.include_in_net_worth : true,
    include_in_spending: existing ? existing.include_in_spending : true,
    masked_identifier: a.mask,
    as_of: (a.balance_as_of || now).slice(0, 10) as CalendarDate,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    archived_at: existing?.archived_at ?? null,
    is_payout_card: existing?.is_payout_card ?? (payout && !liability ? true : undefined),
    balance_entered_by_user: false,
    display_name_set_by_user: existing?.display_name_set_by_user,
    connection: connectionFor(a, item),
  };
}

function categoryLabel(id: string): string {
  return JURNL_SPEND_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function originalOf(t: BankTransactionView): ImportProvenance['original'] {
  return {
    name: t.name,
    merchant_name: t.merchant_name,
    counterparty_names: t.counterparty_names,
    date: t.date,
    authorized_date: t.authorized_date,
    amount: t.amount,
    pfc_primary: t.pfc_primary,
    pfc_detailed: t.pfc_detailed,
    pfc_confidence: t.pfc_confidence,
    payment_channel: t.payment_channel,
    pending: t.pending,
    pending_transaction_id: t.pending_transaction_id,
  };
}

/** Recomputes an imported entry's display fields from its provider original + the user's correction + rules. */
export function deriveImportedEntry(base: LedgerEntry, account: JurnlAccountRecord | null, bank: BankLedgerState): LedgerEntry {
  const imp = base.import!;
  const o = imp.original;
  const view: BankTransactionView = {
    item_id: imp.item_id,
    provider_account_id: imp.provider_account_id,
    provider_transaction_id: imp.provider_transaction_id,
    pending: imp.pending,
    pending_transaction_id: o.pending_transaction_id,
    amount: imp.provider_amount,
    iso_currency_code: null,
    unofficial_currency_code: null,
    date: o.date,
    authorized_date: o.authorized_date,
    name: o.name,
    merchant_name: o.merchant_name,
    merchant_entity_id: null,
    counterparty_names: o.counterparty_names,
    pfc_primary: o.pfc_primary,
    pfc_detailed: o.pfc_detailed,
    pfc_confidence: o.pfc_confidence,
    payment_channel: o.payment_channel,
    transaction_code: null,
    provider_state: imp.provider_state,
    revision: imp.revision,
    first_seen_at: base.recorded_at ?? imp.last_changed_at,
    last_changed_at: imp.last_changed_at,
    removed_at: null,
  };
  const override = bank.overrides[importKey(imp.item_id, imp.root_transaction_id)] ?? null;
  const cls = classifyImported(view, { accountType: account?.account_type ?? 'OTHER', jurnlAccountId: account?.account_id ?? null, rules: bank.rules, override });
  const merchant = (override?.merchant ?? o.merchant_name ?? o.name ?? 'BANK TRANSACTION').trim().toUpperCase();
  return {
    ...base,
    merchant,
    amount: Math.abs(imp.provider_amount),
    direction: imp.provider_amount > 0 ? 'EXPENSE' : 'INCOME',
    when: o.date,
    occurred_on: o.date as CalendarDate,
    account: account?.display_name ?? base.account,
    account_id: account?.account_id ?? base.account_id ?? null,
    category: categoryLabel(cls.category),
    category_detail: cls.category_detail,
    txn_class: cls.txn_class,
    status: imp.pending ? 'PENDING' : 'CLEARED',
    confirmation: imp.pending ? 'PENDING_CONFIRMATION' : 'BANK_CONFIRMED',
    settlement: imp.provider_state === 'REMOVED' ? 'CANCELLED' : imp.pending ? 'PENDING' : 'SETTLED',
    classification: { basis: cls.basis, provider_confidence: cls.provider_confidence, rule_id: cls.rule_id },
  };
}

export function applyBankPull(snap: RepositorySnapshot, pull: BankPull): { accounts: JurnlAccountRecord[]; transactions: LedgerEntry[]; bank: BankLedgerState; report: IngestReport } {
  const bank: BankLedgerState = { ...EMPTY_BANK_STATE, ...(snap.bank ?? {}), accountLinks: { ...(snap.bank?.accountLinks ?? {}) }, overrides: { ...(snap.bank?.overrides ?? {}) } };
  const report: IngestReport = { accountsCreated: 0, accountsUpdated: 0, added: 0, modified: 0, posted: 0, removed: 0, unchanged: 0, skippedUnknownAccount: 0 };
  const itemsById = new Map(pull.items.map((i) => [i.item_id, i]));
  const accountsById = new Map(snap.accounts.map((a) => [a.account_id, a]));
  // An account is taken only while a LIVE connection (an active Item in this pull, still returning it) links it.
  // Accounts of a disconnected or vanished Item can be picked up again by a re-link, keeping their history.
  const liveItems = new Set(pull.items.filter((i) => i.status !== 'DISCONNECTED').map((i) => i.item_id));
  const pulledKeys = new Set(pull.accounts.map((a) => accountKey(a.item_id, a.provider_account_id)));
  const linkedIds = new Set(
    Object.entries(bank.accountLinks)
      .filter(([k]) => pulledKeys.has(k) && liveItems.has(k.split(':')[0]))
      .map(([, id]) => id),
  );
  const touchedAccounts = new Map<string, JurnlAccountRecord>();

  for (const a of [...pull.accounts].sort((x, y) => `${x.item_id}${x.provider_account_id}`.localeCompare(`${y.item_id}${y.provider_account_id}`))) {
    const key = accountKey(a.item_id, a.provider_account_id);
    const item = itemsById.get(a.item_id);
    let id = bank.accountLinks[key];
    let existing = id ? (accountsById.get(id) ?? null) : null;
    if (!existing) {
      existing = findReusableAccount([...accountsById.values()], a, item, linkedIds);
      id = existing?.account_id ?? stableId('bank-acct', key);
      if (existing) for (const [k, v] of Object.entries(bank.accountLinks)) if (v === id && k !== key) delete bank.accountLinks[k];
    }
    bank.accountLinks[key] = id;
    linkedIds.add(id);
    const rec = accountRecord(a, item, existing, snap.userId, id, pull.pulledAt);
    if (existing) report.accountsUpdated += 1;
    else report.accountsCreated += 1;
    touchedAccounts.set(id, rec);
    accountsById.set(id, rec);
  }
  // Items no longer active: mark their accounts' connection status (balances stay as last known, dated).
  for (const item of pull.items) {
    for (const acc of accountsById.values()) {
      if (acc.connection?.item_id !== item.item_id || touchedAccounts.has(acc.account_id)) continue;
      const status: BankConnectionStatus = item.status;
      if (acc.connection.status === status && acc.is_connected === (status !== 'DISCONNECTED')) continue;
      const rec = { ...acc, is_connected: status !== 'DISCONNECTED', connection: { ...acc.connection, status, last_successful_sync_at: item.last_successful_sync_at }, updated_at: pull.pulledAt };
      touchedAccounts.set(acc.account_id, rec);
      accountsById.set(acc.account_id, rec);
    }
  }

  // Index imported entries by their current provider id.
  const byProviderId = new Map<string, LedgerEntry>();
  for (const e of snap.transactions) if (e.source === 'IMPORTED' && e.import) byProviderId.set(`${e.import.item_id}:${e.import.provider_transaction_id}`, e);
  const postedByPending = new Set<string>();
  for (const t of pull.transactions) if (t.provider_state === 'ACTIVE' && t.pending_transaction_id) postedByPending.add(`${t.item_id}:${t.pending_transaction_id}`);
  const touched = new Map<string, LedgerEntry>();

  const ordered = [...pull.transactions].sort((x, y) => x.last_changed_at.localeCompare(y.last_changed_at) || x.provider_transaction_id.localeCompare(y.provider_transaction_id));
  for (const t of ordered) {
    const pk = `${t.item_id}:${t.provider_transaction_id}`;
    const accountId = bank.accountLinks[accountKey(t.item_id, t.provider_account_id)];
    const account = accountId ? (accountsById.get(accountId) ?? null) : null;
    if (t.provider_state === 'REMOVED') {
      const existing = byProviderId.get(pk);
      if (!existing?.import) continue;
      // A pending row removed because its posted version arrived: the posted row owns the entry.
      if (postedByPending.has(pk) || existing.import.provider_transaction_id !== t.provider_transaction_id) continue;
      if (existing.import.provider_state === 'REMOVED') {
        report.unchanged += 1;
        continue;
      }
      const next: LedgerEntry = {
        ...existing,
        import: { ...existing.import, provider_state: 'REMOVED', revision: t.revision, last_changed_at: t.last_changed_at, history: [...existing.import.history, { at: t.last_changed_at, change: 'REMOVED' }] },
      };
      const derived = deriveImportedEntry(next, account, bank);
      byProviderId.set(pk, derived);
      touched.set(derived.id, derived);
      report.removed += 1;
      continue;
    }
    if (!account) {
      report.skippedUnknownAccount += 1;
      continue;
    }
    const viaPending = t.pending_transaction_id ? byProviderId.get(`${t.item_id}:${t.pending_transaction_id}`) : undefined;
    const existing = byProviderId.get(pk) ?? viaPending;
    const rootId = existing?.import?.root_transaction_id ?? t.provider_transaction_id;
    const prev = existing?.import;
    if (prev && prev.provider_transaction_id === t.provider_transaction_id && prev.revision === t.revision && prev.provider_state === 'ACTIVE') {
      // Same revision: provider data unchanged. Display is still re-derived (rules / corrections may have changed).
      const derived = deriveImportedEntry(existing!, account, bank);
      byProviderId.set(pk, derived);
      touched.set(derived.id, derived);
      report.unchanged += 1;
      continue;
    }
    const history: ImportProvenance['history'] = [...(prev?.history ?? [])];
    if (!prev) history.push({ at: t.last_changed_at, change: 'ADDED' });
    else if (prev.provider_transaction_id !== t.provider_transaction_id)
      history.push({ at: t.last_changed_at, change: 'POSTED', from_id: prev.provider_transaction_id, before: { amount: prev.provider_amount, date: prev.original.date, name: prev.original.name, pending: prev.pending } });
    else history.push({ at: t.last_changed_at, change: prev.provider_state === 'REMOVED' ? 'RESTORED' : 'MODIFIED', before: { amount: prev.provider_amount, date: prev.original.date, name: prev.original.name, pending: prev.pending } });
    const base: LedgerEntry = existing
      ? { ...existing }
      : {
          id: stableId('imp', importKey(t.item_id, rootId)),
          merchant: '',
          amount: 0,
          direction: 'EXPENSE',
          when: t.date,
          account: account.display_name,
          category: 'OTHER',
          status: 'PENDING',
          recurring: false,
          memo: '',
          source: 'IMPORTED',
          related: null,
          recorded_at: t.first_seen_at,
          origin_family: 'F05',
          bank_match: null,
        };
    base.import = {
      provider: 'PLAID',
      item_id: t.item_id,
      provider_account_id: t.provider_account_id,
      provider_transaction_id: t.provider_transaction_id,
      root_transaction_id: rootId,
      pending: t.pending,
      provider_state: 'ACTIVE',
      revision: t.revision,
      provider_amount: t.amount,
      original: originalOf(t),
      history,
      last_changed_at: t.last_changed_at,
    };
    const derived = deriveImportedEntry(base, account, bank);
    if (viaPending && viaPending !== byProviderId.get(pk)) {
      byProviderId.delete(`${t.item_id}:${t.pending_transaction_id}`);
      report.posted += 1;
    } else if (prev) report.modified += 1;
    else report.added += 1;
    byProviderId.set(pk, derived);
    touched.set(derived.id, derived);
  }

  let watermark = bank.watermark;
  for (const t of pull.transactions) if (!watermark || t.last_changed_at > watermark) watermark = t.last_changed_at;
  bank.watermark = watermark;
  bank.lastPulledAt = pull.pulledAt;
  bank.connections = pull.items.map((i) => ({
    item_id: i.item_id,
    institution_name: i.institution_name,
    status: i.status,
    last_successful_sync_at: i.last_successful_sync_at,
    last_balance_at: i.last_balance_at,
    consent_expires_at: i.consent_expires_at,
    provider_env: i.provider_env,
    disconnected_at: i.disconnected_at,
  }));
  return { accounts: [...touchedAccounts.values()], transactions: [...touched.values()], bank, report };
}

/** Re-derives every imported entry after a correction or rule change (no provider call, nothing duplicated). */
export function rederiveImported(snap: RepositorySnapshot, bank: BankLedgerState): LedgerEntry[] {
  const byId = new Map(snap.accounts.map((a) => [a.account_id, a]));
  return snap.transactions.filter((e) => e.source === 'IMPORTED' && e.import).map((e) => deriveImportedEntry(e, byId.get(e.account_id ?? '') ?? null, bank));
}
