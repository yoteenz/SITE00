/**
 * SAFE TO SPEND BUFFER — one owner for reading and saving the buffer.
 *
 * The buffer is stored in canonical USD (`settings.safeToSpendBuffer`), because Safe to Spend is computed in USD
 * (`safetyBufferFromSettings`, safeToSpend.ts). People type it in their display currency, so:
 *   · shown:  stored USD × the display rate, rounded to the currency's own digits;
 *   · saved:  the typed amount ÷ the display rate, kept to 4 decimals so a re-save of an unchanged figure is stable;
 *   · no rate (non-USD display, rate missing or expired): nothing is converted and nothing is saved — the field says so.
 * A stale rate (cached, older than a day, younger than a week) still converts and the disclosure says it is cached.
 * Legacy values were already applied as USD by the calculation, so they keep their meaning: nothing is migrated.
 */
import { useCallback, useMemo, useState } from 'react';
import { displayAmount, getCurrency, useCurrency, useExchangeState, type CurrencyCode } from '../home/currency';
import { getRepository } from '../repository/deviceRepository';

export type BufferRateState = 'BASE' | 'READY' | 'STALE' | 'UNAVAILABLE';

export type BufferSaveResult =
  | { ok: true; storedUsd: string; canonicalUsd: number }
  | { ok: false; reason: 'RATE_UNAVAILABLE' | 'INVALID_AMOUNT' };

const USD_DIGITS = 4;

function digitsFor(code: CurrencyCode): number {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/** The stored buffer as a positive canonical USD number (0 when empty or not a number). */
export function storedBufferUsd(raw: string | undefined = getRepository().getSettings().safeToSpendBuffer): number {
  const n = Number((raw ?? '').trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** The figure to show in the field, in the display currency; null when there is no rate to show it with. */
export function bufferDisplayValue(canonicalUsd: number, code: CurrencyCode = getCurrency().code): string | null {
  if (!canonicalUsd) return '';
  const shown = displayAmount(canonicalUsd, code);
  if (shown == null) return null;
  const d = digitsFor(code);
  const f = 10 ** d;
  const rounded = Math.round(shown * f) / f;
  return String(rounded);
}

/** Typed display-currency amount → canonical USD (string kept to 4 decimals). */
export function bufferToCanonical(entered: string, code: CurrencyCode = getCurrency().code): BufferSaveResult {
  const cleaned = entered.replace(/,/g, '').trim();
  if (cleaned === '') return { ok: true, storedUsd: '', canonicalUsd: 0 };
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return { ok: false, reason: 'INVALID_AMOUNT' };
  if (n === 0) return { ok: true, storedUsd: '', canonicalUsd: 0 };
  const rate = displayAmount(1, code);
  if (rate == null || !(rate > 0)) return { ok: false, reason: 'RATE_UNAVAILABLE' };
  const usd = Math.round((n / rate) * 10 ** USD_DIGITS) / 10 ** USD_DIGITS;
  return { ok: true, storedUsd: String(usd), canonicalUsd: usd };
}

/** Save the typed buffer (display currency). Nothing is written when it cannot be converted. */
export function saveSafetyBuffer(entered: string, code: CurrencyCode = getCurrency().code): BufferSaveResult {
  const r = bufferToCanonical(entered, code);
  if (r.ok) getRepository().patchSettings({ safeToSpendBuffer: r.storedUsd });
  return r;
}

export const BUFFER_COPY = {
  rateUnavailable: 'NO EXCHANGE RATE RIGHT NOW, SO THE BUFFER CANNOT BE CONVERTED. NOTHING WAS SAVED. TRY AGAIN SHORTLY OR SHOW AMOUNTS IN USD.',
  invalid: 'ENTER AN AMOUNT OF ZERO OR MORE.',
  saved: 'SAFE TO SPEND NOW KEEPS THIS AMOUNT ASIDE.',
  cleared: 'NO BUFFER IS KEPT ASIDE NOW.',
} as const;

/**
 * The shared buffer field state, used by the ACCOUNT page, the approved F09 drawer and the menu's SAFE TO SPEND BUFFER.
 * The field shows the stored USD in the display currency and re-reads when the display currency or its rate changes,
 * until the person starts typing.
 */
export function useSafetyBuffer() {
  const currency = useCurrency();
  const exchange = useExchangeState();
  const [stored, setStored] = useState(() => storedBufferUsd());
  const [draft, setDraft] = useState<string | null>(null);
  const rateState: BufferRateState =
    currency.code === 'USD' ? 'BASE'
    : displayAmount(1, currency.code) == null ? 'UNAVAILABLE'
    : exchange.stale ? 'STALE'
    : 'READY';
  const shown = useMemo(() => bufferDisplayValue(stored, currency.code), [stored, currency.code, exchange.rate, exchange.retrievedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = draft ?? shown ?? '';
  const setValue = useCallback((v: string) => setDraft(v.replace(/[^0-9.]/g, '').slice(0, 9)), []);
  const save = useCallback((): BufferSaveResult => {
    const r = saveSafetyBuffer(draft ?? shown ?? '', currency.code);
    if (r.ok) {
      setStored(r.canonicalUsd);
      setDraft(null);
    }
    return r;
  }, [draft, shown, currency.code]);
  return { currency, exchange, rateState, value, setValue, save, storedUsd: stored, unavailable: rateState === 'UNAVAILABLE' && stored > 0 && draft == null };
}
