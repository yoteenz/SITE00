/**
 * User-scoped device repository adapter (W0.3 / W1). Not production server persistence.
 */

import { EMPTY_SETUP, type SetupDraft } from '../f02/setupDraft';
import { MOCK_ENTRIES } from '../home/mockScenario';
import type { LedgerEntry } from '../home/moneyTypes';
import { seedAccountsFromSetup } from '../foundation/accountSeed';
import type { JurnlAccountRecord } from '../foundation/accounts';
import { defaultConsentRecords, patchConsent as patchConsentList, type ConsentRecord } from '../foundation/consent';
import { DEFAULT_JURNL_SETTINGS, type JurnlSettings } from '../foundation/settings';
import type { JurnlIncomeSource } from '../foundation/income';
import type { JurnlObligation } from '../foundation/obligations';
import { seedIncomeFromSetup, seedObligationsFromSetup } from './wave2Seed';
import { seedGoalsFromSetup, seedPlansFromSetup } from './wave3Seed';
import type { JurnlPlanIntention } from '../foundation/plan';
import type { JurnlGoal } from '../foundation/goals';
import type { JurnlCreditAttributes } from '../foundation/creditAttributes';
import {
  REPOSITORY_SCHEMA_VERSION,
  type JurnlRepository,
  type RepositoryEvent,
  type RepositoryListener,
  type RepositoryReadStatus,
  type RepositorySnapshot,
} from './types';

const memoryByUser = new Map<string, RepositorySnapshot>();
const listeners = new Set<RepositoryListener>();
const eventSubs = new Set<(e: RepositoryEvent) => void>();

let activeUserId = 'preview-guest';

type KV = { get(k: string): string | null; set(k: string, v: string): void };

function storageKey(userId: string) {
  return `jurnl.repository.v${REPOSITORY_SCHEMA_VERSION}.${userId}`;
}

function legacyStorageKey(userId: string) {
  return `jurnl.repository.v1.${userId}`;
}

function legacyStorageKeyV2(userId: string) {
  return `jurnl.repository.v2.${userId}`;
}

function legacyStorageKeyV3(userId: string) {
  return `jurnl.repository.v3.${userId}`;
}

function browserLocal(): KV | null {
  if (typeof localStorage === 'undefined') return null;
  return {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
  };
}

function emptySnapshot(userId: string): RepositorySnapshot {
  const now = new Date().toISOString();
  const setup = { ...EMPTY_SETUP };
  return {
    schemaVersion: REPOSITORY_SCHEMA_VERSION,
    userId,
    setup,
    accounts: seedAccountsFromSetup(setup, userId),
    transactions: [...MOCK_ENTRIES],
    settings: { ...DEFAULT_JURNL_SETTINGS },
    consent: defaultConsentRecords(),
    incomeSources: [],
    obligations: [],
    planIntentions: [],
    goals: [],
    creditAttributes: [],
    updatedAt: now,
  };
}

function finalizeSnapshot(parsed: RepositorySnapshot): RepositorySnapshot {
  const base: RepositorySnapshot = {
    ...parsed,
    schemaVersion: REPOSITORY_SCHEMA_VERSION,
    settings: parsed.settings ?? { ...DEFAULT_JURNL_SETTINGS },
    consent: parsed.consent ?? defaultConsentRecords(),
    incomeSources: parsed.incomeSources ?? [],
    obligations: parsed.obligations ?? [],
    planIntentions: parsed.planIntentions ?? [],
    goals: parsed.goals ?? [],
    creditAttributes: parsed.creditAttributes ?? [],
  };
  return {
    ...base,
    incomeSources: seedIncomeFromSetup(base.setup, base.incomeSources),
    obligations: seedObligationsFromSetup(base.setup, base.obligations),
    planIntentions: seedPlansFromSetup(base.setup, base.planIntentions),
    goals: seedGoalsFromSetup(base.setup, base.goals),
  };
}

function migrateStored(parsed: RepositorySnapshot): RepositorySnapshot {
  return finalizeSnapshot(parsed);
}

function readSnapshot(userId: string): RepositorySnapshot {
  const cached = memoryByUser.get(userId);
  if (cached) return cached;
  const kv = browserLocal();
  if (kv) {
    try {
      const raw = kv.get(storageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as RepositorySnapshot;
        if (parsed.userId === userId) {
          const finalized = parsed.schemaVersion === REPOSITORY_SCHEMA_VERSION ? finalizeSnapshot(parsed) : migrateStored(parsed);
          memoryByUser.set(userId, finalized);
          if (parsed.schemaVersion !== REPOSITORY_SCHEMA_VERSION) persist(finalized);
          return finalized;
        }
      }
      for (const keyFn of [legacyStorageKeyV3, legacyStorageKeyV2, legacyStorageKey]) {
        const legacyRaw = kv.get(keyFn(userId));
        if (!legacyRaw) continue;
        const legacy = JSON.parse(legacyRaw) as RepositorySnapshot;
        if (legacy.userId === userId) {
          const migrated = migrateStored(legacy);
          memoryByUser.set(userId, migrated);
          persist(migrated);
          return migrated;
        }
      }
    } catch {
      /* corruption → fall through to default */
    }
  }
  const snap = finalizeSnapshot(emptySnapshot(userId));
  memoryByUser.set(userId, snap);
  persist(snap);
  return snap;
}

function persist(snap: RepositorySnapshot) {
  memoryByUser.set(snap.userId, snap);
  const kv = browserLocal();
  if (kv) kv.set(storageKey(snap.userId), JSON.stringify(snap));
  listeners.forEach((l) => l());
}

function emit(type: RepositoryEvent['type'], entityId?: string) {
  const ev: RepositoryEvent = { type, at: new Date().toISOString(), entityId };
  eventSubs.forEach((cb) => cb(ev));
}

class DeviceJurnlRepository implements JurnlRepository {
  readonly kind = 'DEVICE' as const;
  readonly userId: string;
  private status: RepositoryReadStatus = 'ready';

  constructor(userId: string) {
    this.userId = userId;
    readSnapshot(userId);
  }

  getStatus(): RepositoryReadStatus {
    return this.status;
  }

  subscribe(listener: RepositoryListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  getSnapshot(): RepositorySnapshot {
    return readSnapshot(this.userId);
  }

  patchSetup(patch: Partial<SetupDraft>) {
    const snap = readSnapshot(this.userId);
    const nextSetup = { ...snap.setup, ...patch, started: patch.started ?? true };
    persist({ ...snap, setup: nextSetup, updatedAt: new Date().toISOString() });
    emit('SETUP_COMPLETED');
  }

  resetSetup() {
    const snap = readSnapshot(this.userId);
    persist({ ...snap, setup: { ...EMPTY_SETUP }, updatedAt: new Date().toISOString() });
  }

  listAccounts(): JurnlAccountRecord[] {
    return readSnapshot(this.userId).accounts;
  }

  upsertAccount(account: JurnlAccountRecord) {
    const snap = readSnapshot(this.userId);
    const idx = snap.accounts.findIndex((a) => a.account_id === account.account_id);
    const accounts = [...snap.accounts];
    if (idx >= 0) accounts[idx] = account;
    else accounts.push(account);
    persist({ ...snap, accounts, updatedAt: new Date().toISOString() });
    emit(idx >= 0 ? 'ACCOUNT_UPDATED' : 'ACCOUNT_CREATED', account.account_id);
  }

  listTransactions(): LedgerEntry[] {
    return readSnapshot(this.userId).transactions;
  }

  appendTransaction(entry: Omit<LedgerEntry, 'id' | 'source' | 'status' | 'related' | 'recurring' | 'memo'> & { memo?: string }): LedgerEntry {
    const snap = readSnapshot(this.userId);
    const added = snap.transactions.filter((t) => t.source === 'ADDED').length;
    const next: LedgerEntry = {
      ...entry,
      id: `tx-add-${added + 1}`,
      status: 'CLEARED',
      recurring: false,
      memo: entry.memo ?? 'ADDED BY HAND',
      source: 'ADDED',
      related: null,
    };
    persist({ ...snap, transactions: [next, ...snap.transactions], updatedAt: new Date().toISOString() });
    emit('TRANSACTION_CREATED', next.id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return next;
  }

  updateTransaction(id: string, patch: Partial<Pick<LedgerEntry, 'merchant' | 'amount' | 'direction' | 'when' | 'account' | 'category' | 'memo'>>): LedgerEntry | null {
    const snap = readSnapshot(this.userId);
    const idx = snap.transactions.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    const current = snap.transactions[idx];
    if (current.source !== 'ADDED') return null;
    const next: LedgerEntry = { ...current, ...patch };
    const transactions = [...snap.transactions];
    transactions[idx] = next;
    persist({ ...snap, transactions, updatedAt: new Date().toISOString() });
    emit('TRANSACTION_UPDATED', id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return next;
  }

  deleteTransaction(id: string): boolean {
    const snap = readSnapshot(this.userId);
    const target = snap.transactions.find((t) => t.id === id);
    if (!target || target.source !== 'ADDED') return false;
    const transactions = snap.transactions.filter((t) => t.id !== id);
    persist({ ...snap, transactions, updatedAt: new Date().toISOString() });
    emit('TRANSACTION_DELETED', id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return true;
  }

  clearAddedTransactions() {
    const snap = readSnapshot(this.userId);
    persist({ ...snap, transactions: snap.transactions.filter((t) => t.source !== 'ADDED'), updatedAt: new Date().toISOString() });
  }

  getSettings(): JurnlSettings {
    return { ...readSnapshot(this.userId).settings };
  }

  patchSettings(patch: Partial<JurnlSettings>): JurnlSettings {
    const snap = readSnapshot(this.userId);
    const settings = { ...snap.settings, ...patch };
    persist({ ...snap, settings, updatedAt: new Date().toISOString() });
    emit('SETTING_CHANGED');
    if (patch.displayCurrency) emit('DISPLAY_CURRENCY_CHANGED');
    return settings;
  }

  getConsent(): ConsentRecord[] {
    return readSnapshot(this.userId).consent.map((c) => ({ ...c }));
  }

  patchConsent(type: ConsentRecord['consent_type'], granted: boolean, source: string): ConsentRecord[] {
    const snap = readSnapshot(this.userId);
    const consent = patchConsentList(snap.consent, type, granted, source);
    persist({ ...snap, consent, updatedAt: new Date().toISOString() });
    emit(granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED', type);
    return consent;
  }

  listIncomeSources(): JurnlIncomeSource[] {
    return readSnapshot(this.userId).incomeSources.filter((s) => s.status !== 'ARCHIVED');
  }

  upsertIncomeSource(source: JurnlIncomeSource): JurnlIncomeSource {
    const snap = readSnapshot(this.userId);
    const idx = snap.incomeSources.findIndex((s) => s.income_id === source.income_id);
    const incomeSources = [...snap.incomeSources];
    const next = { ...source, updated_at: new Date().toISOString() };
    if (idx >= 0) incomeSources[idx] = next;
    else incomeSources.push(next);
    persist({ ...snap, incomeSources, updatedAt: new Date().toISOString() });
    emit(idx >= 0 ? 'INCOME_UPDATED' : 'INCOME_CREATED', source.income_id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return next;
  }

  deleteIncomeSource(id: string): boolean {
    const snap = readSnapshot(this.userId);
    const idx = snap.incomeSources.findIndex((s) => s.income_id === id);
    if (idx < 0) return false;
    const incomeSources = [...snap.incomeSources];
    incomeSources[idx] = { ...incomeSources[idx], status: 'ARCHIVED', archived_at: new Date().toISOString() };
    persist({ ...snap, incomeSources, updatedAt: new Date().toISOString() });
    emit('INCOME_DELETED', id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return true;
  }

  markIncomeReceived(id: string, transactionId: string): JurnlIncomeSource | null {
    const snap = readSnapshot(this.userId);
    const idx = snap.incomeSources.findIndex((s) => s.income_id === id);
    if (idx < 0) return null;
    const incomeSources = [...snap.incomeSources];
    incomeSources[idx] = {
      ...incomeSources[idx],
      status: 'RECEIVED',
      linked_transaction_id: transactionId,
      updated_at: new Date().toISOString(),
    };
    persist({ ...snap, incomeSources, updatedAt: new Date().toISOString() });
    emit('INCOME_UPDATED', id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return incomeSources[idx];
  }

  listObligations(): JurnlObligation[] {
    return readSnapshot(this.userId).obligations.filter((o) => o.status === 'ACTIVE');
  }

  upsertObligation(item: JurnlObligation): JurnlObligation {
    const snap = readSnapshot(this.userId);
    const idx = snap.obligations.findIndex((o) => o.obligation_id === item.obligation_id);
    const obligations = [...snap.obligations];
    const next = { ...item, updated_at: new Date().toISOString() };
    if (idx >= 0) obligations[idx] = next;
    else obligations.push(next);
    persist({ ...snap, obligations, updatedAt: new Date().toISOString() });
    emit(idx >= 0 ? 'OBLIGATION_UPDATED' : 'OBLIGATION_CREATED', item.obligation_id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return next;
  }

  deleteObligation(id: string): boolean {
    const snap = readSnapshot(this.userId);
    const idx = snap.obligations.findIndex((o) => o.obligation_id === id);
    if (idx < 0) return false;
    const obligations = [...snap.obligations];
    obligations[idx] = { ...obligations[idx], status: 'ARCHIVED', archived_at: new Date().toISOString() };
    persist({ ...snap, obligations, updatedAt: new Date().toISOString() });
    emit('OBLIGATION_DELETED', id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return true;
  }

  listPlanIntentions(): JurnlPlanIntention[] {
    return readSnapshot(this.userId).planIntentions;
  }

  upsertPlanIntention(plan: JurnlPlanIntention): JurnlPlanIntention {
    const snap = readSnapshot(this.userId);
    const idx = snap.planIntentions.findIndex((p) => p.plan_id === plan.plan_id);
    const planIntentions = [...snap.planIntentions];
    const next = { ...plan, updated_at: new Date().toISOString() };
    if (idx >= 0) planIntentions[idx] = next;
    else planIntentions.push(next);
    persist({ ...snap, planIntentions, updatedAt: new Date().toISOString() });
    emit(idx >= 0 ? 'PLAN_UPDATED' : 'PLAN_CREATED', plan.plan_id);
    emit('BUDGET_UPDATED');
    emit('SAFE_TO_SPEND_RECALCULATED');
    return next;
  }

  deletePlanIntention(id: string): boolean {
    const snap = readSnapshot(this.userId);
    const idx = snap.planIntentions.findIndex((p) => p.plan_id === id);
    if (idx < 0) return false;
    const planIntentions = [...snap.planIntentions];
    planIntentions[idx] = { ...planIntentions[idx], status: 'ARCHIVED', archived_at: new Date().toISOString() };
    persist({ ...snap, planIntentions, updatedAt: new Date().toISOString() });
    emit('PLAN_DELETED', id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return true;
  }

  listGoals(): JurnlGoal[] {
    return readSnapshot(this.userId).goals;
  }

  upsertGoal(goal: JurnlGoal): JurnlGoal {
    const snap = readSnapshot(this.userId);
    const idx = snap.goals.findIndex((g) => g.goal_id === goal.goal_id);
    const goals = [...snap.goals];
    const next = { ...goal, updated_at: new Date().toISOString() };
    if (idx >= 0) goals[idx] = next;
    else goals.push(next);
    persist({ ...snap, goals, updatedAt: new Date().toISOString() });
    emit('GOAL_UPDATED', goal.goal_id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return next;
  }

  deleteGoal(id: string): boolean {
    const snap = readSnapshot(this.userId);
    const idx = snap.goals.findIndex((g) => g.goal_id === id);
    if (idx < 0) return false;
    const goals = [...snap.goals];
    goals[idx] = { ...goals[idx], status: 'ARCHIVED', archived_at: new Date().toISOString() };
    persist({ ...snap, goals, updatedAt: new Date().toISOString() });
    emit('GOAL_UPDATED', id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return true;
  }

  getCreditAttributes(accountId: string): JurnlCreditAttributes | null {
    return readSnapshot(this.userId).creditAttributes.find((c) => c.account_id === accountId) ?? null;
  }

  upsertCreditAttributes(attrs: JurnlCreditAttributes): JurnlCreditAttributes {
    const snap = readSnapshot(this.userId);
    const idx = snap.creditAttributes.findIndex((c) => c.account_id === attrs.account_id);
    const creditAttributes = [...snap.creditAttributes];
    const next = { ...attrs, updated_at: new Date().toISOString() };
    if (idx >= 0) creditAttributes[idx] = next;
    else creditAttributes.push(next);
    persist({ ...snap, creditAttributes, updatedAt: new Date().toISOString() });
    emit('DEBT_UPDATED', attrs.account_id);
    emit('SAFE_TO_SPEND_RECALCULATED');
    return next;
  }

  onEvent(cb: (event: RepositoryEvent) => void): () => void {
    eventSubs.add(cb);
    return () => eventSubs.delete(cb);
  }
}

let repo: DeviceJurnlRepository | null = null;

export function setRepositoryUserId(userId: string) {
  if (repo?.userId === userId) return;
  activeUserId = userId;
  repo = new DeviceJurnlRepository(userId);
}

export function getRepository(): JurnlRepository {
  if (!repo) repo = new DeviceJurnlRepository(activeUserId);
  return repo;
}

/** Dev-only: drop cached snapshot for the active user. */
export function resetRepositoryForDev() {
  memoryByUser.delete(activeUserId);
  const kv = browserLocal();
  if (kv) {
    kv.set(storageKey(activeUserId), '');
    kv.set(legacyStorageKey(activeUserId), '');
    kv.set(legacyStorageKeyV2(activeUserId), '');
    kv.set(legacyStorageKeyV3(activeUserId), '');
  }
  repo = new DeviceJurnlRepository(activeUserId);
}
