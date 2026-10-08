/**
 * Global product sheets (W1.3 / W1.4). One implementation for all families.
 */

import { useId, useMemo, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import { buildAskJurnlContext, explainFromContext } from '../../data/foundation/askJurnl';
import { quickAddTypesForFamily, type QuickAddTypeId } from '../../data/foundation/quickAddRegistry';
import { getTodayKey } from '../../data/foundation/dates';
import { createIncomeSource } from '../../data/f06/incomeStore';
import { createGoal } from '../../data/f14/goalsStore';
import { createPurchase } from '../../data/f10/purchasesStore';
import { createTrip } from '../../data/f11/tripsStore';
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
import { JurnlButton, JurnlDrawer, OverlayLayer, useOverlayFocus } from '../components/primitives';
import { OverlayArrow, OverlayCloseGlyph, useKeyboardViewport, useOverlayFit } from '../components/OverlayAuthority';
import quickAddShell from './overlays/QUICK_ADD_SHELL.webp';
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

const SAVE_LABEL: Record<QuickAddTypeId, string> = { TRANSACTION: 'SAVE TRANSACTION', INCOME: 'SAVE INCOME', GOAL: 'SAVE GOAL', PURCHASE: 'SAVE PURCHASE', TRIP: 'SAVE TRIP' };
const SUBTITLE: Record<QuickAddTypeId, string> = {
  TRANSACTION: 'ADD A TRANSACTION IN SECONDS.',
  INCOME: 'ADD INCOME IN SECONDS.',
  GOAL: 'ADD A GOAL IN SECONDS.',
  PURCHASE: 'ADD A PURCHASE IN SECONDS.',
  TRIP: 'ADD A TRIP IN SECONDS.',
};

/** The amount is the slip's total: as large as fits the field. */
function amountSize(text: string): number {
  const chars = Math.max(4, text.length);
  return Math.max(30, Math.min(66, Math.floor(205 / (0.6 * chars))));
}

/**
 * QUICK ADD: the tactile transaction slip (approved authority JURNL/OVERLAYS_EDITORIAL_REDESIGN1/QUICK_ADD).
 * A torn slip on a brass clip rises over the live screen; labels sit in a margin column like a printed form, the amount
 * is the slip's total, and SAVE is the only solid on the paper.
 */
export function QuickAddV2Sheet({ familyId, onClose }: { familyId: string | null; onClose: () => void }) {
  const types = quickAddTypesForFamily(familyId);
  const [typeId, setTypeId] = useState<QuickAddTypeId>(types[0]?.type_id ?? 'TRANSACTION');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const accountOptions = useMemo(() => accountDisplayOptions(), []);
  const [account, setAccount] = useState(() => accountOptions[0]?.id ?? 'CHECKING');
  const [keyboard, setKeyboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currency = useCurrency();
  const { fit, ref: rootRef } = useOverlayFit('sheet');
  const vv = useKeyboardViewport(keyboard);
  const { ref } = useOverlayFocus(onClose);
  const titleId = useId();
  const nameId = useId();
  const amountId = useId();
  const numeric = Number(amount);
  const quote = /^\d+(\.\d{1,2})?$/.test(amount.trim()) && numeric > 0 ? quoteQuickAdd(numeric, currency.code) : null;
  const valid =
    typeId === 'TRANSACTION' ? name.trim().length > 0 && quote != null && account.length > 0
    : typeId === 'INCOME' ? name.trim().length > 0 && /^\d+(\.\d{1,2})?$/.test(amount.trim())
    : typeId === 'GOAL' ? name.trim().length > 0 && /^\d+(\.\d{1,2})?$/.test(amount.trim())
    : typeId === 'PURCHASE' ? name.trim().length > 0 && /^\d+(\.\d{1,2})?$/.test(amount.trim())
    : typeId === 'TRIP' ? name.trim().length > 0 && /^\d+(\.\d{1,2})?$/.test(amount.trim())
    : false;
  const shown = formatAmountInput(amount);

  const save = () => {
    setError(null);
    try {
      if (typeId === 'INCOME') {
        createIncomeSource({ source_name: name, amount: Number(amount), cadence: 'MONTHLY', next_due_date: getTodayKey() });
        onClose();
        return;
      }
      if (typeId === 'GOAL') {
        createGoal({ title: name, target_amount: Number(amount) || 0 });
        onClose();
        return;
      }
      if (typeId === 'PURCHASE') {
        createPurchase({ title: name, target_amount: Number(amount) || 0 });
        onClose();
        return;
      }
      if (typeId === 'TRIP') {
        createTrip({ title: name, destination: name, target_budget: Number(amount) || 0 });
        onClose();
        return;
      }
      if (!quote) return;
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
  };

  const rootStyle = { '--s': fit.s, ...(vv ? { top: vv.top, height: vv.height, bottom: 'auto' } : null) } as CSSProperties;
  return (
    <OverlayLayer>
      <div ref={rootRef} className="jrn-ovl jrn-ovl--sheet" data-jrn-overlay="quick-add" data-keyboard={keyboard ? 'open' : 'closed'} style={rootStyle}>
        <div className="jrn-ovl__scrim" onClick={onClose} aria-hidden />
        <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className="jrn-qa" data-jrn-expression="form" data-jrn-overlay-authority="QUICK_ADD">
          <div className="jrn-ovl__paper" aria-hidden data-asset-id="OVERLAY.QUICK_ADD.SHELL.001" style={{ '--shell': `url("${quickAddShell}")` } as CSSProperties}>
            <span className="jrn-ovl__paper-top" />
            <span className="jrn-ovl__paper-foot" />
          </div>
          <div className="jrn-qa__hit" aria-hidden />
          <span className="jrn-qa__handle" aria-hidden />
          <button type="button" className="jrn-ovl__close jrn-qa__close" aria-label="CLOSE" data-jrn-trigger="quick-add-close" onClick={onClose}>
            <OverlayCloseGlyph />
          </button>
          <div className="jrn-qa__body">
            <h2 className="jrn-qa__title" id={titleId}>QUICK ADD</h2>
            <p className="jrn-qa__sub">{SUBTITLE[typeId]}</p>
            <span className="jrn-qa__mark" aria-hidden />
            {types.length > 1 ? (
              <div className="jrn-qa__row jrn-qa__row--record">
                <span className="jrn-qa__lbl">RECORD</span>
                <div className="jrn-qa__checks" role="radiogroup" aria-label="TYPE">
                  {types.map((t) => (
                    <button key={t.type_id} type="button" className="jrn-qa__check" aria-pressed={typeId === t.type_id} data-active={typeId === t.type_id ? 'true' : 'false'} data-jrn-trigger={`quick-add-type-${t.type_id.toLowerCase()}`} onClick={() => setTypeId(t.type_id)}>
                      <i aria-hidden />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="jrn-qa__row jrn-qa__row--name">
              <label className="jrn-qa__lbl" htmlFor={nameId}>NAME</label>
              <span className="jrn-qa__line">
                <input
                  id={nameId}
                  className="jrn-qa__name"
                  value={name}
                  placeholder="WHAT WAS THIS FOR?"
                  autoComplete="off"
                  data-jrn-trigger="quick-add-name"
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setKeyboard(true)}
                  onBlur={() => setKeyboard(false)}
                />
              </span>
            </div>
            <div className="jrn-qa__row jrn-qa__row--amount">
              <label className="jrn-qa__lbl" htmlFor={amountId}>AMOUNT</label>
              <span className="jrn-qa__amt" data-filled={shown ? 'true' : 'false'}>
                {currency.symbolPosition === 'prefix' ? <span className="jrn-qa__cur">{currency.symbol}</span> : null}
                <input
                  id={amountId}
                  className="jrn-qa__amount"
                  value={shown}
                  placeholder="0.00"
                  inputMode="decimal"
                  autoComplete="off"
                  data-jrn-trigger="quick-add-amount"
                  style={{ fontSize: amountSize(shown || '0.00') }}
                  onChange={(e) => setAmount(parseAmountInput(e.target.value))}
                  onFocus={() => setKeyboard(true)}
                  onBlur={() => setKeyboard(false)}
                />
                {currency.symbolPosition === 'suffix' ? <span className="jrn-qa__cur jrn-qa__cur--after">{currency.symbol}</span> : null}
              </span>
            </div>
            {typeId === 'TRANSACTION' ? (
              <>
                <div className="jrn-qa__row jrn-qa__row--type">
                  <span className="jrn-qa__lbl">TYPE</span>
                  <div className="jrn-qa__seg" role="radiogroup" aria-label="DIRECTION">
                    {(['EXPENSE', 'INCOME'] as const).map((item) => (
                      <button key={item} type="button" aria-pressed={direction === item} data-active={direction === item ? 'true' : 'false'} data-jrn-trigger={`quick-add-${item.toLowerCase()}`} onClick={() => setDirection(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="jrn-qa__row jrn-qa__row--account">
                  <span className="jrn-qa__lbl">ACCOUNT</span>
                  <div className="jrn-qa__checks" role="radiogroup" aria-label="ACCOUNT">
                    {accountOptions.map((item) => (
                      <button key={item.id} type="button" className="jrn-qa__check jrn-qa__check--account" aria-pressed={account === item.id} data-active={account === item.id ? 'true' : 'false'} data-jrn-trigger={`quick-add-${item.id.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setAccount(item.id)}>
                        <i aria-hidden />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
            <button type="button" className="jrn-qa__save" data-jrn-trigger="quick-add-save" disabled={!valid} onClick={save}>
              <span>{SAVE_LABEL[typeId]}</span>
              <i aria-hidden />
              <OverlayArrow />
            </button>
            {error ? <p className="jrn-qa__error" role="alert">{error}</p> : null}
          </div>
        </div>
      </div>
    </OverlayLayer>
  );
}
