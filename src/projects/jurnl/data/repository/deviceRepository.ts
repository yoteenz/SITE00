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
    updatedAt: now,
  };
}

function migrateV1ToV2(parsed: RepositorySnapshot): RepositorySnapshot {
  return {
    ...parsed,
    schemaVersion: REPOSITORY_SCHEMA_VERSION,
    settings: parsed.settings ?? { ...DEFAULT_JURNL_SETTINGS },
    consent: parsed.consent ?? defaultConsentRecords(),
  };
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
        if (parsed.schemaVersion === REPOSITORY_SCHEMA_VERSION && parsed.userId === userId) {
          memoryByUser.set(userId, parsed);
          return parsed;
        }
      }
      const legacyRaw = kv.get(legacyStorageKey(userId));
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as RepositorySnapshot;
        if (legacy.userId === userId) {
          const migrated = migrateV1ToV2(legacy);
          memoryByUser.set(userId, migrated);
          persist(migrated);
          return migrated;
        }
      }
    } catch {
      /* corruption → fall through to default */
    }
  }
  const snap = emptySnapshot(userId);
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
  }
  repo = new DeviceJurnlRepository(activeUserId);
}
