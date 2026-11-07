/**
 * Connected banking ↔ the JURNL ledger: pull, import, reconcile, and the user's corrections — each applied as ONE
 * atomic repository commit (so a crash cannot leave half an import or a match without its other leg).
 */
import { useSyncExternalStore } from 'react';
import type { JurnlAccountRecord } from '../foundation/accounts';
import type { CalendarDate } from '../foundation/dates';
import type { LedgerEntry } from '../home/moneyTypes';
import { newEntityId } from '../repository/ids';
import { getRepository } from '../repository/deviceRepository';
import type { RepositorySnapshot } from '../repository/types';
import { bankApi, BankApiError, openPlaidLink, type BankApiConfig } from './bankClient';
import { applyBankPull, rederiveImported, type IngestReport } from './ingest';
import { reconcileLedger } from './reconcile';
import { EMPTY_BANK_STATE, importKey, type BankItemView, type BankLedgerState, type ClassificationRule, type ImportOverride, type MatchDecision } from './types';

/** Pull overlap: rows committed slightly out of timestamp order are re-read (ingestion is idempotent). */
const WATERMARK_OVERLAP_MS = 10 * 60 * 1000;

function upsert<T>(list: T[], items: T[], key: (t: T) => string): T[] {
  if (!items.length) return list;
  const next = [...list];
  const idx = new Map(next.map((x, i) => [key(x), i]));
  for (const it of items) {
    const i = idx.get(key(it));
    if (i == null) {
      idx.set(key(it), next.length);
      next.push(it);
    } else next[i] = it;
  }
  return next;
}

/** Imports a pull into a snapshot and reconciles (pure; shared by the browser and the acceptance tests). */
export function importAndReconcile(snap: RepositorySnapshot, pull: Parameters<typeof applyBankPull>[1]) {
  const ing = applyBankPull(snap, pull);
  const accounts = upsert(snap.accounts, ing.accounts, (a) => a.account_id);
  const entries = upsert(snap.transactions, ing.transactions, (e) => e.id);
  const rec = reconcileLedger({ entries, accounts, obligations: snap.obligations, dailyEarnings: snap.dailyEarnings, reservations: snap.reservations, previous: snap.bank?.matches ?? [], now: pull.pulledAt });
  const touched = new Map<string, LedgerEntry>();
  for (const e of ing.transactions) touched.set(e.id, rec.entries.find((x) => x.id === e.id) ?? e);
  for (const e of rec.changed) touched.set(e.id, e);
  const changedRes = rec.reservations.filter((r) => !snap.reservations.includes(r));
  return {
    report: ing.report,
    commit: {
      reason: 'BANK_IMPORT',
      accounts: { upsert: ing.accounts },
      transactions: { upsert: [...touched.values()] },
      reservations: { upsert: changedRes },
      bank: { ...ing.bank, matches: rec.matches } as BankLedgerState,
    },
  };
}

/** Re-runs reconciliation after a user decision or correction (no provider call). */
export function rereconcile(snap: RepositorySnapshot, bank: BankLedgerState, now = new Date().toISOString()) {
  const rederived = rederiveImported(snap, bank);
  const entries = upsert(snap.transactions, rederived, (e) => e.id);
  const rec = reconcileLedger({ entries, accounts: snap.accounts, obligations: snap.obligations, dailyEarnings: snap.dailyEarnings, reservations: snap.reservations, previous: bank.matches, now });
  const changed = new Map<string, LedgerEntry>();
  for (const e of rederived) changed.set(e.id, rec.entries.find((x) => x.id === e.id) ?? e);
  for (const e of rec.changed) changed.set(e.id, e);
  return {
    reason: 'BANK_RECONCILE',
    transactions: { upsert: [...changed.values()] },
    reservations: { upsert: rec.reservations.filter((r) => !snap.reservations.includes(r)) },
    bank: { ...bank, matches: rec.matches },
  };
}

// ── Live state for screens ───────────────────────────────────────────────────

export type BankUiState = {
  config: BankApiConfig | null;
  items: BankItemView[];
  loading: boolean;
  /** Item id being connected / reconnected (Link open or exchange running), or 'NEW'. */
  connecting: string | null;
  lastError: { code: string; at: string } | null;
  lastReport: IngestReport | null;
  lastPullAt: string | null;
};

let state: BankUiState = { config: null, items: [], loading: false, connecting: null, lastError: null, lastReport: null, lastPullAt: null };
const subs = new Set<() => void>();
const set = (patch: Partial<BankUiState>) => {
  state = { ...state, ...patch };
  subs.forEach((s) => s());
};
export const getBankUiState = () => state;
export function useBankUiState(): BankUiState {
  return useSyncExternalStore(
    (l) => {
      subs.add(l);
      return () => subs.delete(l);
    },
    getBankUiState,
    getBankUiState,
  );
}

export async function loadBankConfig(): Promise<BankApiConfig | null> {
  try {
    const config = await bankApi.config();
    set({ config });
    return config;
  } catch {
    set({ config: null });
    return null;
  }
}

/** Pull connections + changed transactions, import, reconcile, commit once. */
export async function pullBankData(): Promise<{ ok: boolean; report?: IngestReport; code?: string }> {
  set({ loading: true });
  try {
    const conns = await bankApi.connections();
    const snap = getRepository().getSnapshot();
    const wm = snap.bank?.watermark ? new Date(Date.parse(snap.bank.watermark) - WATERMARK_OVERLAP_MS).toISOString() : null;
    const tx = await bankApi.transactions(wm);
    const { report, commit } = importAndReconcile(getRepository().getSnapshot(), { items: conns.items, accounts: conns.accounts, transactions: tx.transactions, pulledAt: conns.server_time });
    getRepository().commit(commit);
    set({ items: conns.items, loading: false, lastReport: report, lastPullAt: conns.server_time, lastError: null });
    return { ok: true, report };
  } catch (e) {
    const code = e instanceof BankApiError ? e.code : 'PULL_FAILED';
    set({ loading: false, lastError: { code, at: new Date().toISOString() } });
    return { ok: false, code };
  }
}

/** New connection (itemId null) or reconnect (Link update mode on the same Item: account identity is kept). */
export async function connectInstitution(itemId: string | null = null): Promise<{ ok: boolean; code?: string; message?: string | null }> {
  set({ connecting: itemId ?? 'NEW', lastError: null });
  try {
    const lt = await bankApi.linkToken(itemId);
    const outcome = await openPlaidLink(lt.link_token);
    if (outcome.kind === 'EXIT') {
      set({ connecting: null });
      return { ok: false, code: outcome.errorCode ?? 'CANCELLED', message: outcome.message };
    }
    if (itemId) await bankApi.reconnect(itemId);
    else await bankApi.exchange(outcome.publicToken);
    set({ connecting: null });
    await pullBankData();
    return { ok: true };
  } catch (e) {
    const code = e instanceof BankApiError ? e.code : e instanceof Error ? e.message : 'CONNECT_FAILED';
    set({ connecting: null, lastError: { code, at: new Date().toISOString() } });
    return { ok: false, code };
  }
}

export async function retrySync(itemId: string) {
  try {
    await bankApi.sync(itemId);
  } catch (e) {
    set({ lastError: { code: e instanceof BankApiError ? e.code : 'SYNC_FAILED', at: new Date().toISOString() } });
  }
  return pullBankData();
}

export async function disconnectInstitution(itemId: string, deleteImported: boolean) {
  const r = await bankApi.disconnect(itemId, deleteImported).catch((e: unknown) => ({ ok: false as const, providerRevoked: false as const, code: e instanceof BankApiError ? e.code : 'DISCONNECT_FAILED', message: 'ACCESS WAS NOT REMOVED. TRY AGAIN.' }));
  if (r.ok && deleteImported) {
    // Remove the imported rows from the ledger too (the user asked for it); the user's own entries stay.
    const snap = getRepository().getSnapshot();
    const ids = snap.transactions.filter((e) => e.source === 'IMPORTED' && e.import?.item_id === itemId).map((e) => e.id);
    if (ids.length) getRepository().commit({ reason: 'BANK_DATA_REMOVED', transactions: { remove: ids } });
  }
  await pullBankData();
  return r;
}

// ── Corrections, rules and match decisions (the user's word is final) ─────────

function bankOf(snap: RepositorySnapshot): BankLedgerState {
  return { ...EMPTY_BANK_STATE, ...(snap.bank ?? {}) };
}

export function correctImportedTransaction(entryId: string, patch: Omit<ImportOverride, 'at'>, opts: { createRule?: boolean } = {}): boolean {
  const snap = getRepository().getSnapshot();
  const e = snap.transactions.find((t) => t.id === entryId);
  if (!e?.import) return false;
  const key = importKey(e.import.item_id, e.import.root_transaction_id);
  const bank = bankOf(snap);
  const overrides = { ...bank.overrides, [key]: { ...(bank.overrides[key] ?? {}), ...patch, at: new Date().toISOString() } };
  let rules = bank.rules;
  if (opts.createRule) {
    const text = (e.import.original.merchant_name ?? e.import.original.name ?? '').trim();
    if (text) {
      const rule: ClassificationRule = {
        rule_id: newEntityId('rule'),
        enabled: true,
        match: { text: text.toUpperCase(), direction: e.direction === 'EXPENSE' ? 'OUT' : 'IN' },
        set: { category: patch.category, category_detail: patch.category_detail, txn_class: patch.txn_class, internal_transfer: patch.internal_transfer, rideshare_earnings: patch.rideshare_earnings },
        created_at: new Date().toISOString(),
        source_entry_id: entryId,
      };
      rules = [...rules, rule];
    }
  }
  getRepository().commit(rereconcile(snap, { ...bank, overrides, rules }));
  return true;
}

export function setRuleEnabled(ruleId: string, enabled: boolean) {
  const snap = getRepository().getSnapshot();
  const bank = bankOf(snap);
  getRepository().commit(rereconcile(snap, { ...bank, rules: bank.rules.map((r) => (r.rule_id === ruleId ? { ...r, enabled } : r)) }));
}

/** Entries a rule currently classifies (the "rule results" review). */
export function ruleResults(ruleId: string): LedgerEntry[] {
  return getRepository()
    .getSnapshot()
    .transactions.filter((e) => e.classification?.rule_id === ruleId);
}

export function decideMatch(matchId: string, decision: 'CONFIRMED' | 'REJECTED') {
  const snap = getRepository().getSnapshot();
  const bank = bankOf(snap);
  const matches: MatchDecision[] = bank.matches.map((m) => (m.match_id === matchId ? { ...m, status: decision, decided_at: new Date().toISOString() } : m));
  getRepository().commit(rereconcile(snap, { ...bank, matches }));
}

/** An ATM withdrawal the user confirms went into Cash on Hand: records the cash side and links both legs. */
export function confirmCashWithdrawal(entryId: string, cashAccount: JurnlAccountRecord) {
  const snap = getRepository().getSnapshot();
  const w = snap.transactions.find((t) => t.id === entryId);
  if (!w || w.source !== 'IMPORTED' || cashAccount.account_type !== 'CASH') return null;
  const now = new Date().toISOString();
  const leg: LedgerEntry = {
    id: newEntityId('txn'),
    merchant: 'CASH WITHDRAWAL',
    amount: w.amount,
    direction: 'INCOME',
    when: w.occurred_on ?? w.when,
    occurred_on: (w.occurred_on ?? null) as CalendarDate | null,
    account: cashAccount.display_name,
    account_id: cashAccount.account_id,
    category: 'TRANSFER',
    txn_class: 'TRANSFER',
    status: 'CLEARED',
    recurring: false,
    memo: '',
    source: 'ADDED',
    related: null,
    recorded_at: now,
    confirmation: 'RECORDED_BY_YOU',
    origin_family: 'F05',
  };
  const bank = bankOf(snap);
  const next = { ...snap, transactions: [leg, ...snap.transactions] };
  const change = rereconcile(next, bank, now);
  // The new cash leg and every entry reconciliation touched land in one commit.
  const reconciledLeg = change.transactions.upsert.find((t) => t.id === leg.id);
  getRepository().commit({ ...change, transactions: { upsert: [reconciledLeg ?? leg, ...change.transactions.upsert.filter((t) => t.id !== leg.id)] } });
  return leg;
}
