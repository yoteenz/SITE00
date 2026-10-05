/**
 * JURNL display currency.
 * Stored amounts stay in canonical USD. formatMoney converts from that base
 * with a fetched USD rate. It does not swap a symbol onto an unconverted number.
 */

import { useEffect, useSyncExternalStore } from 'react';
import catalog from '../../../../../JURNL/MANIFEST/JURNL_CURRENCY_CATALOG.json';

export const CURRENCY_STORAGE_KEY = 'jurnl.currency';
export const RATE_STORAGE_KEY = 'jurnl.exchangeRate';
export const EXCHANGE_RATE_PROVIDER_URL = 'https://open.er-api.com/v6/latest/USD';
export const RATE_UNAVAILABLE_COPY = 'EXCHANGE RATE UNAVAILABLE. TRY AGAIN SHORTLY.';
export const VISIBLE_CURRENCY_ROWS = 3;
export const CURRENCY_ROW_PX = 52;
export const FRESH_RATE_MS = 24 * 60 * 60 * 1000;
export const MAX_STALE_RATE_MS = 7 * 24 * 60 * 60 * 1000;
export const BASE_CURRENCY = 'USD' as const;

export type CurrencyCode = (typeof catalog.currencies)[number]['currency_code'];

export type CurrencyPreference = {
  code: CurrencyCode;
  symbol: string;
  symbolPosition: 'prefix' | 'suffix';
  name: string;
  locale: string;
};

export type RateBook = {
  provider: string;
  retrievedAt: string;
  providerUpdatedAt: string;
  sourceCurrency: typeof BASE_CURRENCY;
  rates: Record<string, number>;
};

export type ExchangeStatus = 'ready' | 'stale' | 'unavailable' | 'idle';

export type ExchangeState = {
  status: ExchangeStatus;
  error: string | null;
  disclosure: string | null;
  provider: string | null;
  retrievedAt: string | null;
  rate: number | null;
  sourceCurrency: typeof BASE_CURRENCY;
  targetCurrency: CurrencyCode;
  stale: boolean;
};

export type QuickAddQuote = {
  enteredAmount: number;
  enteredCurrency: CurrencyCode;
  canonicalAmount: number;
  canonicalCurrency: typeof BASE_CURRENCY;
  conversionRateUsed: number;
  conversionTimestamp: string;
  originalAmount: number;
  originalCurrency: CurrencyCode;
};

type ExchangeRateProvider = () => Promise<RateBook | null>;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

function symbolFor(code: string, locale: string): { symbol: string; symbolPosition: 'prefix' | 'suffix' } {
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency: code }).formatToParts(1);
    const symbol = parts.find((part) => part.type === 'currency')?.value ?? code;
    const currencyAt = parts.findIndex((part) => part.type === 'currency');
    const numberAt = parts.findIndex((part) => part.type === 'integer');
    return { symbol, symbolPosition: currencyAt <= numberAt ? 'prefix' : 'suffix' };
  } catch {
    return { symbol: code, symbolPosition: 'prefix' };
  }
}

export const CURRENCIES: readonly CurrencyPreference[] = catalog.currencies.map((item) => {
  const mark = symbolFor(item.currency_code, item.locale);
  return {
    code: item.currency_code,
    name: item.currency_name,
    locale: item.locale,
    symbol: mark.symbol,
    symbolPosition: mark.symbolPosition,
  };
});

export const DEFAULT_CURRENCY: CurrencyPreference = CURRENCIES[0]!;

const listeners = new Set<() => void>();
let current: CurrencyCode = readStoredCurrency();
let memoryBook: RateBook | null = readStoredBook();
let status: ExchangeStatus = memoryBook ? 'ready' : 'idle';
let lastError: string | null = null;
let providerOverride: ExchangeRateProvider | null = null;
let inflight: Promise<void> | null = null;

let exchangeSnapshot: ExchangeState | null = null;
let currencySnapshot: CurrencyPreference = { ...currencyByCode(current) };

function emit() {
  exchangeSnapshot = buildExchangeState();
  currencySnapshot = { ...getCurrency() };
  listeners.forEach((listener) => listener());
}

function readStoredCurrency(): CurrencyCode {
  if (typeof localStorage === 'undefined') return BASE_CURRENCY;
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (raw && CURRENCIES.some((item) => item.code === raw)) return raw as CurrencyCode;
  } catch {
    /* preview storage can be unavailable */
  }
  return BASE_CURRENCY;
}

function readStoredBook(): RateBook | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RateBook;
    if (!parsed || parsed.sourceCurrency !== BASE_CURRENCY || !parsed.rates || !parsed.retrievedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistCurrency(code: CurrencyCode) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch {
    /* preview storage can be unavailable */
  }
}

function persistBook(book: RateBook) {
  try {
    localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(book));
  } catch {
    /* preview storage can be unavailable */
  }
}

export function currencyByCode(code: CurrencyCode): CurrencyPreference {
  return CURRENCIES.find((item) => item.code === code) ?? DEFAULT_CURRENCY;
}

export function getCurrency(): CurrencyPreference {
  return currencyByCode(current);
}

export function rateAgeStatus(retrievedAt: string, now = Date.now()): 'fresh' | 'stale' | 'expired' {
  const then = Date.parse(retrievedAt);
  if (!Number.isFinite(then)) return 'expired';
  const age = now - then;
  if (age <= FRESH_RATE_MS) return 'fresh';
  if (age <= MAX_STALE_RATE_MS) return 'stale';
  return 'expired';
}

function positiveRate(book: RateBook | null, code: string): number | null {
  if (!book) return null;
  const rate = book.rates[code];
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) return null;
  return rate;
}

function lookupRate(code: CurrencyCode): number | null {
  if (code === BASE_CURRENCY) return 1;
  if (!memoryBook || rateAgeStatus(memoryBook.retrievedAt) === 'expired') return null;
  return positiveRate(memoryBook, code);
}

function liveFetchAllowed(): boolean {
  return import.meta.env.MODE !== 'test';
}

export async function fetchLiveRateBook(fetchImpl: typeof fetch = globalThis.fetch): Promise<RateBook> {
  const response = await fetchImpl(EXCHANGE_RATE_PROVIDER_URL);
  if (!response.ok) throw new Error(RATE_UNAVAILABLE_COPY);
  const body = (await response.json()) as {
    result?: string;
    time_last_update_unix?: number;
    base_code?: string;
    rates?: Record<string, number>;
  };
  if (body.result !== 'success' || body.base_code !== BASE_CURRENCY || !body.rates) {
    throw new Error(RATE_UNAVAILABLE_COPY);
  }
  const rates: Record<string, number> = {};
  for (const item of CURRENCIES) {
    if (item.code === BASE_CURRENCY) continue;
    const rate = body.rates[item.code];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) continue;
    rates[item.code] = rate;
  }
  if (Object.keys(rates).length === 0) throw new Error(RATE_UNAVAILABLE_COPY);
  const updated = body.time_last_update_unix ? new Date(body.time_last_update_unix * 1000).toISOString() : new Date().toISOString();
  return {
    provider: EXCHANGE_RATE_PROVIDER_URL,
    retrievedAt: new Date().toISOString(),
    providerUpdatedAt: updated,
    sourceCurrency: BASE_CURRENCY,
    rates,
  };
}

async function loadProvider(): Promise<RateBook | null> {
  if (providerOverride) return providerOverride();
  if (!liveFetchAllowed()) return null;
  return fetchLiveRateBook();
}

async function resolveRate(code: CurrencyCode): Promise<{ book: RateBook; stale: boolean } | null> {
  const cached = memoryBook;
  const cachedRate = positiveRate(cached, code);
  if (cached && cachedRate != null && rateAgeStatus(cached.retrievedAt) === 'fresh') {
    return { book: cached, stale: false };
  }
  let fetched: RateBook | null = null;
  try {
    fetched = await loadProvider();
  } catch {
    fetched = null;
  }
  if (fetched && positiveRate(fetched, code) != null) return { book: fetched, stale: false };
  if (cached && cachedRate != null && rateAgeStatus(cached.retrievedAt) === 'stale') {
    return { book: cached, stale: true };
  }
  return null;
}

export function installExchangeRateProvider(provider: ExchangeRateProvider | null) {
  providerOverride = provider;
}

export function installRateBook(input: { rates: Record<string, number>; retrievedAt?: string; provider?: string } | null) {
  if (!input) {
    memoryBook = null;
    status = 'idle';
    emit();
    return;
  }
  const stamp = input.retrievedAt ?? new Date().toISOString();
  memoryBook = {
    provider: input.provider ?? EXCHANGE_RATE_PROVIDER_URL,
    retrievedAt: stamp,
    providerUpdatedAt: stamp,
    sourceCurrency: BASE_CURRENCY,
    rates: { ...input.rates },
  };
  status = rateAgeStatus(stamp) === 'stale' ? 'stale' : 'ready';
  emit();
}

export function clearRateBook() {
  memoryBook = null;
  status = 'idle';
  try {
    localStorage.removeItem(RATE_STORAGE_KEY);
  } catch {
    /* preview storage can be unavailable */
  }
  emit();
}

export async function setCurrency(code: CurrencyCode): Promise<boolean> {
  if (!CURRENCIES.some((item) => item.code === code)) return false;
  if (code === BASE_CURRENCY) {
    current = code;
    persistCurrency(code);
    lastError = null;
    status = 'ready';
    emit();
    return true;
  }
  const resolved = await resolveRate(code);
  if (!resolved) {
    lastError = RATE_UNAVAILABLE_COPY;
    status = 'unavailable';
    emit();
    return false;
  }
  memoryBook = resolved.book;
  persistBook(resolved.book);
  current = code;
  persistCurrency(code);
  lastError = null;
  status = resolved.stale ? 'stale' : 'ready';
  emit();
  return true;
}

export async function ensureExchangeRates(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    const needs = current === BASE_CURRENCY ? null : current;
    if (memoryBook && rateAgeStatus(memoryBook.retrievedAt) === 'fresh' && (needs == null || positiveRate(memoryBook, needs) != null)) {
      status = 'ready';
      return;
    }
    let fetched: RateBook | null = null;
    try {
      fetched = await loadProvider();
    } catch {
      fetched = null;
    }
    if (fetched) {
      memoryBook = fetched;
      persistBook(fetched);
      if (needs && positiveRate(fetched, needs) == null) {
        lastError = RATE_UNAVAILABLE_COPY;
        status = 'unavailable';
      } else {
        lastError = null;
        status = 'ready';
      }
      emit();
      return;
    }
    if (needs && memoryBook && positiveRate(memoryBook, needs) != null && rateAgeStatus(memoryBook.retrievedAt) === 'stale') {
      status = 'stale';
      lastError = null;
      emit();
      return;
    }
    if (needs) {
      lastError = RATE_UNAVAILABLE_COPY;
      status = 'unavailable';
      emit();
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function resetCurrency() {
  current = BASE_CURRENCY;
  lastError = null;
  status = memoryBook ? 'ready' : 'idle';
  try {
    localStorage.removeItem(CURRENCY_STORAGE_KEY);
  } catch {
    /* preview storage can be unavailable */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCurrency(): CurrencyPreference {
  useEffect(() => {
    void ensureExchangeRates();
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => currencySnapshot,
    () => currencySnapshot,
  );
}

function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatRateFigure(rate: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: rate >= 100 ? 2 : 2,
    maximumFractionDigits: rate >= 100 ? 2 : 4,
  }).format(rate);
}

export function getExchangeState(): ExchangeState {
  if (!exchangeSnapshot) exchangeSnapshot = buildExchangeState();
  return exchangeSnapshot;
}

function buildExchangeState(): ExchangeState {
  const code = current;
  const rate = lookupRate(code);
  const stale = status === 'stale';
  const stamp = memoryBook?.providerUpdatedAt ?? memoryBook?.retrievedAt ?? null;
  let disclosure: string | null = null;
  if (code !== BASE_CURRENCY && rate != null && stamp) {
    const when = formatStamp(stamp);
    const prefix = stale ? 'CACHED RATE' : 'RATE UPDATED';
    disclosure = `${prefix} ${when} · 1 USD = ${formatRateFigure(rate)} ${code}`;
  }
  return {
    status,
    error: lastError,
    disclosure,
    provider: memoryBook?.provider ?? null,
    retrievedAt: memoryBook?.retrievedAt ?? null,
    rate: code === BASE_CURRENCY ? 1 : rate,
    sourceCurrency: BASE_CURRENCY,
    targetCurrency: code,
    stale,
  };
}

export function useExchangeState(): ExchangeState {
  return useSyncExternalStore(subscribe, getExchangeState, getExchangeState);
}

function fractionDigits(code: string, locale: string): number {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

function isWhole(amount: number, digits: number): boolean {
  const factor = 10 ** digits;
  const rounded = Math.round(Math.abs(amount) * factor) / factor;
  return Math.abs(rounded - Math.round(rounded)) < 1e-8;
}

function paint(displayValue: number, preference: CurrencyPreference, signed: boolean): string {
  const digits = fractionDigits(preference.code, preference.locale);
  const whole = digits === 0 || isWhole(displayValue, digits);
  const body = new Intl.NumberFormat(preference.locale, {
    style: 'currency',
    currency: preference.code,
    minimumFractionDigits: whole ? 0 : digits,
    maximumFractionDigits: digits,
  }).format(displayValue);
  if (signed && displayValue > 0) return `+${body}`;
  return body;
}

/** Canonical USD in. Display conversion uses the USD rate for the requested currency. */
export function displayAmount(canonicalUsd: number, code: CurrencyCode = getCurrency().code): number | null {
  const rate = lookupRate(code);
  if (rate == null) return null;
  return canonicalUsd * rate;
}

/** Canonical money display. Missing rates stay in USD. They never become a fake symbol swap. */
export function formatMoney(amount: number, signed = false, preference: CurrencyPreference = getCurrency()): string {
  const rate = lookupRate(preference.code);
  if (rate == null) return paint(amount, DEFAULT_CURRENCY, signed);
  return paint(amount * rate, preference, signed);
}

export function quoteQuickAdd(enteredAmount: number, enteredCurrency: CurrencyCode, now = new Date().toISOString()): QuickAddQuote | null {
  if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) return null;
  if (!CURRENCIES.some((item) => item.code === enteredCurrency)) return null;
  const rate = lookupRate(enteredCurrency);
  if (rate == null) return null;
  const stamp = enteredCurrency === BASE_CURRENCY ? now : (memoryBook?.providerUpdatedAt ?? memoryBook?.retrievedAt ?? now);
  return {
    enteredAmount,
    enteredCurrency,
    canonicalAmount: enteredAmount / rate,
    canonicalCurrency: BASE_CURRENCY,
    conversionRateUsed: rate,
    conversionTimestamp: stamp,
    originalAmount: enteredAmount,
    originalCurrency: enteredCurrency,
  };
}

/** Puts the selected row inside the three-row window without moving the page. */
export function scrollTopToReveal(index: number, rowHeight = CURRENCY_ROW_PX, visibleRows = VISIBLE_CURRENCY_ROWS, scrollTop = 0): number {
  if (index < 0) return scrollTop;
  const top = index * rowHeight;
  const bottom = top + rowHeight;
  const view = visibleRows * rowHeight;
  if (top < scrollTop) return top;
  if (bottom > scrollTop + view) return bottom - view;
  return scrollTop;
}

/** Grouped display for an amount field. The stored value stays ungrouped. */
export function formatAmountInput(raw: string): string {
  if (!raw) return '';
  const [whole, frac] = raw.split('.');
  const grouped = (whole ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return frac !== undefined ? `${grouped}.${frac}` : grouped;
}

export function parseAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  const whole = cleaned.slice(0, dot);
  const frac = cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return `${whole}.${frac}`;
}
