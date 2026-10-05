/**
 * JURNL display currency. Changing the preference changes the symbol.
 * It does not convert historical amounts. There is no foreign-exchange rate.
 */

import { useSyncExternalStore } from 'react';

export const CURRENCY_STORAGE_KEY = 'jurnl.currency';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export type CurrencyPreference = {
  code: CurrencyCode;
  symbol: string;
  locale: string;
};

export const CURRENCIES: readonly CurrencyPreference[] = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
];

export const DEFAULT_CURRENCY: CurrencyPreference = CURRENCIES[0]!;

const listeners = new Set<() => void>();

function readStored(): CurrencyCode {
  if (typeof localStorage === 'undefined') return 'USD';
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (raw === 'USD' || raw === 'EUR' || raw === 'GBP') return raw;
  } catch {
    /* preview storage can be unavailable */
  }
  return 'USD';
}

let current: CurrencyCode = readStored();

function emit() {
  listeners.forEach((listener) => listener());
}

export function currencyByCode(code: CurrencyCode): CurrencyPreference {
  return CURRENCIES.find((item) => item.code === code) ?? DEFAULT_CURRENCY;
}

export function getCurrency(): CurrencyPreference {
  return currencyByCode(current);
}

export function setCurrency(code: CurrencyCode) {
  current = code;
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch {
    /* preview storage can be unavailable */
  }
  emit();
}

export function resetCurrency() {
  current = 'USD';
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
  return useSyncExternalStore(subscribe, getCurrency, () => DEFAULT_CURRENCY);
}

/** Canonical money display. Stores stay numeric. The symbol is display-only. */
export function formatMoney(amount: number, signed = false, preference: CurrencyPreference = getCurrency()): string {
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const cents = Math.round(abs * 100);
  const hasCents = cents % 100 !== 0;
  const body = new Intl.NumberFormat(preference.locale, {
    useGrouping: true,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
  const core = `${preference.symbol}${body}`;
  if (negative) return `-${core}`;
  if (signed && amount > 0) return `+${core}`;
  return core;
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
