/** GS.SETTINGS — shared sheets. The ACCOUNT page and drawer live in AccountScreens.tsx (founder reference replica). */

import { getRepository } from '../../data/repository/deviceRepository';
import { CURRENCIES, setCurrency, useCurrency } from '../../data/home/money';
import { JurnlDrawer } from '../components/primitives';

/** Display currency picker. Used by ACCOUNT (full page and drawer). */
export function CurrencySheet({ onClose }: { onClose: () => void }) {
  const currency = useCurrency();
  return (
    <JurnlDrawer expression="filter" size="long" testId="settings-currency-sheet" title="DISPLAY CURRENCY" lead="CANONICAL OWNER IS ACCOUNT SETTINGS." onClose={onClose}>
      <div className="jrn-currency__list" role="group" aria-label="CURRENCY">
        {CURRENCIES.map((item) => (
          <button
            key={item.code}
            type="button"
            className="jrn-btn jrn-btn--secondary jrn-currency__row"
            aria-pressed={currency.code === item.code}
            data-jrn-trigger={`settings-currency-${item.code.toLowerCase()}`}
            onClick={() => {
              void setCurrency(item.code).then((ok) => {
                if (ok) getRepository().patchSettings({ displayCurrency: item.code });
                onClose();
              });
            }}
          >
            <span className="jrn-currency__code">{item.code}</span>
            <span className="jrn-currency__name">{item.name}</span>
          </button>
        ))}
      </div>
    </JurnlDrawer>
  );
}
