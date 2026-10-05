/**
 * Display conversion always starts from canonical USD.
 * Fixture rates are test doubles. They are not the live book.
 */
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BASE_CURRENCY,
  CURRENCIES,
  CURRENCY_ROW_PX,
  CURRENCY_STORAGE_KEY,
  EXCHANGE_RATE_PROVIDER_URL,
  RATE_UNAVAILABLE_COPY,
  VISIBLE_CURRENCY_ROWS,
  clearRateBook,
  currencyByCode,
  displayAmount,
  fetchLiveRateBook,
  formatMoney,
  getCurrency,
  getExchangeState,
  installExchangeRateProvider,
  installRateBook,
  quoteQuickAdd,
  rateAgeStatus,
  resetCurrency,
  scrollTopToReveal,
  setCurrency,
} from '../src/projects/jurnl/data/home/currency';
import { addLedgerEntry, cashPosition, clearAddedEntries, MOCK_CASH } from '../src/projects/jurnl/data/home/money';

const EUR = 0.88889;
const GBP = 0.755727;
const JPY = 157.730309;

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
  resetCurrency();
  clearRateBook();
  clearAddedEntries();
  installExchangeRateProvider(null);
  installRateBook({
    rates: { EUR, GBP, JPY, CAD: 1.4 },
    retrievedAt: new Date().toISOString(),
    provider: 'TEST_FIXTURE',
  });
});

afterEach(() => {
  installExchangeRateProvider(null);
  clearRateBook();
  resetCurrency();
  clearAddedEntries();
  vi.unstubAllGlobals();
});

describe('JURNL currency conversion', () => {
  it('changes the number from USD to EUR, GBP, and JPY', async () => {
    expect(formatMoney(6500)).toBe('$6,500');
    expect(await setCurrency('EUR')).toBe(true);
    const eur = formatMoney(6500);
    expect(eur).toContain('€');
    expect(eur).not.toContain('6,500');
    expect(displayAmount(6500, 'EUR')).toBeCloseTo(6500 * EUR, 6);

    expect(await setCurrency('GBP')).toBe(true);
    const gbp = formatMoney(6500);
    expect(gbp).toContain('£');
    expect(gbp).not.toContain('6,500');
    expect(displayAmount(6500, 'GBP')).toBeCloseTo(6500 * GBP, 6);

    expect(await setCurrency('JPY')).toBe(true);
    const jpy = formatMoney(6500);
    expect(jpy).toMatch(/¥|￥/);
    expect(jpy).not.toContain('6,500');
    expect(displayAmount(6500, 'JPY')).toBeCloseTo(6500 * JPY, 4);
  });

  it('returns the original USD value and does not chain from the EUR display', async () => {
    const original = formatMoney(6500);
    expect(await setCurrency('EUR')).toBe(true);
    const eurDisplay = displayAmount(6500, 'EUR')!;
    expect(await setCurrency('GBP')).toBe(true);
    const gbp = displayAmount(6500, 'GBP')!;
    expect(gbp).toBeCloseTo(6500 * GBP, 6);
    expect(Math.abs(gbp - eurDisplay * GBP)).toBeGreaterThan(100);
    const roundedEur = Math.round(eurDisplay * 100) / 100;
    const drifted = (roundedEur / EUR) * GBP;
    expect(gbp).not.toBe(drifted);
    expect(await setCurrency('USD')).toBe(true);
    expect(formatMoney(6500)).toBe(original);
    expect(formatMoney(6500)).toBe('$6,500');
    expect(getCurrency().code).toBe(BASE_CURRENCY);
  });

  it('persists the display currency on the shared preference key', async () => {
    expect(await setCurrency('CAD')).toBe(true);
    expect(store.get(CURRENCY_STORAGE_KEY)).toBe('CAD');
    expect(getCurrency().code).toBe('CAD');
  });

  it('keeps more than three currencies and scrolls the selected row into a three-row window', () => {
    const catalog = JSON.parse(readFileSync('JURNL/MANIFEST/JURNL_CURRENCY_CATALOG.json', 'utf8')) as {
      currencies: { currency_code: string }[];
    };
    expect(catalog.currencies.length).toBeGreaterThan(3);
    expect(CURRENCIES.length).toBe(catalog.currencies.length);
    expect(VISIBLE_CURRENCY_ROWS).toBe(3);
    const jpy = CURRENCIES.findIndex((item) => item.code === 'JPY');
    expect(jpy).toBeGreaterThan(2);
    const top = scrollTopToReveal(jpy);
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThanOrEqual(jpy * CURRENCY_ROW_PX);
    const rowTop = jpy * CURRENCY_ROW_PX;
    const view = VISIBLE_CURRENCY_ROWS * CURRENCY_ROW_PX;
    expect(rowTop).toBeGreaterThanOrEqual(top);
    expect(rowTop + CURRENCY_ROW_PX).toBeLessThanOrEqual(top + view);
    expect(scrollTopToReveal(0)).toBe(0);
    expect(scrollTopToReveal(1, CURRENCY_ROW_PX, 3, 0)).toBe(0);
  });

  it('does not invent a rate when the fetch fails', async () => {
    clearRateBook();
    installExchangeRateProvider(async () => null);
    expect(await setCurrency('EUR')).toBe(false);
    expect(getCurrency().code).toBe('USD');
    expect(formatMoney(6500)).toBe('$6,500');
    expect(formatMoney(6500, false, currencyByCode('EUR'))).toBe('$6,500');
    expect(getExchangeState().error).toBe(RATE_UNAVAILABLE_COPY);
    expect(getExchangeState().rate).toBe(1);
  });

  it('uses a stale cached rate and refuses an expired one', async () => {
    const stale = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    installRateBook({ rates: { EUR: 0.5 }, retrievedAt: stale, provider: 'TEST_FIXTURE' });
    installExchangeRateProvider(async () => null);
    expect(rateAgeStatus(stale)).toBe('stale');
    expect(await setCurrency('EUR')).toBe(true);
    expect(getExchangeState().stale).toBe(true);
    expect(displayAmount(100, 'EUR')).toBe(50);
    expect(formatMoney(100)).not.toBe('€100');

    const expired = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    resetCurrency();
    installRateBook({ rates: { EUR: 0.5 }, retrievedAt: expired, provider: 'TEST_FIXTURE' });
    expect(rateAgeStatus(expired)).toBe('expired');
    expect(await setCurrency('EUR')).toBe(false);
    expect(getCurrency().code).toBe('USD');
    expect(formatMoney(100, false, currencyByCode('EUR'))).toBe('$100');
  });

  it('formats zero, negative, income, and thousands from the canonical amount', async () => {
    expect(formatMoney(0)).toBe('$0');
    expect(formatMoney(-86)).toBe('-$86');
    expect(formatMoney(3200, true)).toBe('+$3,200');
    expect(formatMoney(1000000)).toBe('$1,000,000');
    expect(await setCurrency('EUR')).toBe(true);
    expect(formatMoney(0)).toBe('€0');
    const negative = formatMoney(-86);
    expect(negative.startsWith('-') || negative.includes('€')).toBe(true);
    expect(negative).not.toBe('-€86');
    expect(formatMoney(3200, true).startsWith('+')).toBe(true);
    expect(formatMoney(6500)).not.toContain('6,500');
  });

  it('stores quick-add provenance in canonical USD', async () => {
    expect(await setCurrency('EUR')).toBe(true);
    const quote = quoteQuickAdd(50, 'EUR');
    expect(quote).not.toBeNull();
    expect(quote!.enteredAmount).toBe(50);
    expect(quote!.enteredCurrency).toBe('EUR');
    expect(quote!.originalAmount).toBe(50);
    expect(quote!.originalCurrency).toBe('EUR');
    expect(quote!.canonicalCurrency).toBe('USD');
    expect(quote!.canonicalAmount).toBeCloseTo(50 / EUR, 6);
    expect(quote!.conversionRateUsed).toBe(EUR);
    expect(quote!.conversionTimestamp.length).toBeGreaterThan(0);
    const entry = addLedgerEntry({
      merchant: 'MARKET',
      amount: quote!.canonicalAmount,
      direction: 'EXPENSE',
      when: 'TODAY',
      account: 'CHECKING',
      category: 'FOOD',
      provenance: quote!,
    });
    expect(entry.amount).toBeCloseTo(50 / EUR, 6);
    expect(entry.amount).not.toBe(50);
    expect(cashPosition()).toBeCloseTo(MOCK_CASH - 50 / EUR, 4);
    expect(formatMoney(entry.amount)).not.toBe(formatMoney(50));
  });

  it('parses a live provider payload without filling missing rates', async () => {
    const book = await fetchLiveRateBook(async () => ({
      ok: true,
      json: async () => ({
        result: 'success',
        base_code: 'USD',
        time_last_update_unix: 1_759_000_000,
        rates: { EUR: 0.9, GBP: 0.8 },
      }),
    }) as Response);
    expect(book.provider).toBe(EXCHANGE_RATE_PROVIDER_URL);
    expect(book.sourceCurrency).toBe('USD');
    expect(book.rates.EUR).toBe(0.9);
    expect(book.rates.JPY).toBeUndefined();
    expect(book.retrievedAt.length).toBeGreaterThan(0);
    await expect(fetchLiveRateBook(async () => ({ ok: false, json: async () => ({}) }) as Response)).rejects.toThrow(/UNAVAILABLE/);
  });
});
