/** GS.SETTINGS — shared sheets. The ACCOUNT page and drawer live in AccountScreens.tsx (founder reference replica). */

import { useState } from 'react';
import { getRepository } from '../../data/repository/deviceRepository';
import { CURRENCIES, setCurrency, useCurrency, useExchangeState, type CurrencyCode } from '../../data/home/money';
import { JurnlDrawer } from '../components/primitives';

/** Where the rates come from, said plainly (the provider is open.er-api.com, USD based; see data/home/currency.ts). */
export const RATE_SOURCE_COPY = 'RATES: OPEN EXCHANGE RATES API, USD BASED. AMOUNTS ARE KEPT IN USD AND SHOWN CONVERTED. NOTHING IS EXCHANGED.';

/**
 * The exchange-rate disclosure under the currency list: the rate in use, when it was updated, whether it is cached, and
 * what happens when there is none. USD needs no rate.
 */
export function ExchangeDisclosure({ testId = 'currency-disclosure' }: { testId?: string }) {
  const currency = useCurrency();
  const ex = useExchangeState();
  const line =
    currency.code === 'USD' ? 'USD IS THE BASE CURRENCY. NO EXCHANGE RATE IS USED.'
    : ex.disclosure ? `${ex.disclosure}${ex.stale ? ' · CACHED, NOT UPDATED IN THE LAST DAY' : ''}`
    : ex.status === 'unavailable' ? 'NO EXCHANGE RATE AVAILABLE. AMOUNTS ARE SHOWN IN USD.'
    : 'CHECKING THE EXCHANGE RATE.';
  return (
    <div className="jrn-currency__disclosure" data-testid={testId} data-rate-status={currency.code === 'USD' ? 'base' : ex.status} role="status">
      <p className="jrn-currency__note">{line}</p>
      <p className="jrn-currency__note">{RATE_SOURCE_COPY}</p>
    </div>
  );
}

/**
 * Display currency picker. Used by ACCOUNT (full page and drawer) and the menu's CURRENCY & EXCHANGE.
 * A currency without a rate is not applied: the sheet stays open and says so (it used to close as if it had worked).
 */
export function CurrencySheet({ onClose }: { onClose: () => void }) {
  const currency = useCurrency();
  const [busy, setBusy] = useState<CurrencyCode | null>(null);
  const [failed, setFailed] = useState<CurrencyCode | null>(null);
  return (
    <JurnlDrawer expression="filter" size="long" testId="settings-currency-sheet" title="CURRENCY & EXCHANGE" lead="CHOOSE HOW AMOUNTS ARE SHOWN." onClose={onClose}>
      <div className="jrn-currency__list" role="group" aria-label="CURRENCY">
        {CURRENCIES.map((item) => (
          <button
            key={item.code}
            type="button"
            className="jrn-btn jrn-btn--secondary jrn-currency__row"
            aria-pressed={currency.code === item.code}
            aria-busy={busy === item.code ? true : undefined}
            disabled={busy !== null}
            data-jrn-trigger={`settings-currency-${item.code.toLowerCase()}`}
            onClick={() => {
              setBusy(item.code);
              setFailed(null);
              void setCurrency(item.code).then((ok) => {
                setBusy(null);
                if (!ok) {
                  setFailed(item.code);
                  return;
                }
                getRepository().patchSettings({ displayCurrency: item.code });
                onClose();
              });
            }}
          >
            <span className="jrn-currency__code">{item.code}</span>
            <span className="jrn-currency__name">{item.name}</span>
          </button>
        ))}
      </div>
      {failed ? (
        <p className="jrn-currency__error" role="alert" data-testid="currency-failed">
          {`${failed} IS NOT AVAILABLE RIGHT NOW: NO EXCHANGE RATE COULD BE LOADED. AMOUNTS STAY IN ${currency.code}. TRY AGAIN SHORTLY.`}
        </p>
      ) : null}
      <ExchangeDisclosure />
    </JurnlDrawer>
  );
}
