/**
 * Global product sheets (W1.3 / W1.4). One implementation for all families.
 */

import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { buildAskJurnlContext, explainFromContext } from '../../data/foundation/askJurnl';
import { quickAddTypesForFamily } from '../../data/foundation/quickAddRegistry';
import {
  addLedgerEntry,
  formatAmountInput,
  formatMoney,
  parseAmountInput,
  quoteQuickAdd,
  safeToSpend,
  useCurrency,
} from '../../data/home/money';
import { accountDisplayOptions } from '../../data/foundation/accounts';
import { JurnlButton, JurnlDrawer, JurnlInput } from '../components/primitives';
import { useJurnl } from '../state/store';

export function AskJurnlSheet({ familyId, nodeId, onClose }: { familyId: string; nodeId: string; onClose: () => void }) {
  const { pathname } = useLocation();
  const { go } = useJurnl();
  const signal = safeToSpend();
  const ctx = useMemo(() => buildAskJurnlContext(familyId, pathname, nodeId), [familyId, nodeId, pathname]);
  const explanation = useMemo(() => explainFromContext(ctx), [ctx]);
  return (
    <JurnlDrawer expression="confirmation" size="long" testId="ask" title="ASK JURNL" lead="EXPLANATION ONLY. NO LIVE AI PROVIDER IN THIS BUILD." onClose={onClose}>
      <p className="jrn-home__ask" role="status">
        {explanation.state === 'READY' ? `${formatMoney(signal.value)} · ${explanation.body}` : explanation.body}
      </p>
      <p className="jrn-currency__note">{explanation.headline}</p>
      <JurnlButton variant="secondary" trigger="ask-open-settings" onClick={() => { onClose(); go('account'); }}>
        OPEN ACCOUNT SETTINGS
      </JurnlButton>
    </JurnlDrawer>
  );
}

export function QuickAddV2Sheet({ familyId, onClose }: { familyId: string | null; onClose: () => void }) {
  const types = quickAddTypesForFamily(familyId);
  const [typeId] = useState(types[0]?.type_id ?? 'TRANSACTION');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const accountOptions = useMemo(() => accountDisplayOptions(), []);
  const [account, setAccount] = useState(() => accountOptions[0]?.id ?? 'CHECKING');
  const [keyboard, setKeyboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currency = useCurrency();
  const numeric = Number(amount);
  const quote = /^\d+(\.\d{1,2})?$/.test(amount.trim()) && numeric > 0 ? quoteQuickAdd(numeric, currency.code) : null;
  const valid = typeId === 'TRANSACTION' && name.trim().length > 0 && quote != null && account.length > 0;

  return (
    <JurnlDrawer
      expression="form"
      size="long"
      testId="quick-add"
      title="QUICK ADD"
      lead="GLOBAL CREATION ROUTER · MOVEMENT WRITES THROUGH THE REPOSITORY."
      onClose={onClose}
      keyboard={keyboard}
      footer={
        <JurnlButton
          trigger="quick-add-save"
          disabled={!valid}
          onClick={() => {
            if (!quote) return;
            setError(null);
            try {
              addLedgerEntry({
                merchant: name.trim().toUpperCase(),
                amount: quote.canonicalAmount,
                direction,
                when: 'TODAY',
                account,
                category: direction === 'INCOME' ? 'INCOME' : 'OTHER',
                provenance: quote,
              });
              onClose();
            } catch {
              setError('COULD NOT SAVE. TRY AGAIN.');
            }
          }}
        >
          SAVE
        </JurnlButton>
      }
    >
      {error ? <p className="jrn-currency__note" role="alert">{error}</p> : null}
      <p className="jrn-currency__label">TYPE · {types.find((t) => t.type_id === typeId)?.label ?? 'MOVEMENT'}</p>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="quick-add-name" />
      <JurnlInput
        label="AMOUNT"
        value={formatAmountInput(amount)}
        prefix={currency.symbolPosition === 'prefix' ? currency.symbol : undefined}
        suffix={currency.symbolPosition === 'suffix' ? currency.symbol : undefined}
        onValue={(next) => setAmount(parseAmountInput(next))}
        trigger="quick-add-amount"
        inputMode="decimal"
        autoComplete="off"
        onFocusChange={(focused) => setKeyboard(focused)}
      />
      <div className="jrn-home__choices" role="radiogroup" aria-label="DIRECTION">
        {(['EXPENSE', 'INCOME'] as const).map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={direction === item} data-active={direction === item ? 'true' : 'false'} data-jrn-trigger={`quick-add-${item.toLowerCase()}`} onClick={() => setDirection(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="jrn-home__choices" role="radiogroup" aria-label="ACCOUNT">
        {accountOptions.map((item) => (
          <button key={item.id} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={account === item.id} data-active={account === item.id ? 'true' : 'false'} data-jrn-trigger={`quick-add-${item.id.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setAccount(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
    </JurnlDrawer>
  );
}
