/**
 * F09.CHECK — CHECK A PURCHASE and its two selection sheets, built to the founder references
 * (P0.JURNL.F09.REFERENCE-REPLICA1 + P0.JURNL.CHECK-PURCHASE.PAY-WITH-DRAWER.MATCH-CATEGORY-DRAWER1).
 *
 * SELECT A CATEGORY is the approved sizing template. SELECT AN ACCOUNT is its sibling: same handle, header, tile size,
 * crop, radius, gaps, columns, label size and apply button. Only the pictures and words change. Fewer rows lower the
 * sheet's top edge by one row pitch; tiles never resize.
 */

import { useState } from 'react';
import { useCurrency } from '../../data/home/money';
import checkPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_CHECK_PLATE.jpg';
import catFashion from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_FASHION.jpg';
import catBeauty from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_BEAUTY.jpg';
import catHome from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_HOME.jpg';
import catTravel from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_TRAVEL.jpg';
import catWellness from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_WELLNESS.jpg';
import catDining from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_DINING.jpg';
import catGroceries from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_GROCERIES.jpg';
import catGifts from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_GIFTS.jpg';
import catTech from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_TECH.jpg';
import catTransport from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_TRANSPORT.jpg';
import catEvents from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_EVENTS.jpg';
import catOther from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/CATEGORY_OTHER.jpg';
import accChecking from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/ACCOUNT_CHECKING.jpg';
import accSavings from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/ACCOUNT_SAVINGS.jpg';
import accCredit from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/ACCOUNT_CREDIT_CARD.jpg';
import accDebit from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/ACCOUNT_DEBIT_CARD.jpg';
import accCash from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/ACCOUNT_CASH.jpg';
import accJoint from '../../families/F09_SAFE/REFERENCE_REPLICA/tiles/ACCOUNT_JOINT_ACCOUNT.jpg';
import { REF_CATEGORY, REF_CHECK, type RefBox, type RefType } from '../layout/referenceLayout';
import { JurnlProductNav } from '../components/ProductNav';
import { ReferenceStage, RefIcon, RefText, at } from '../components/ReferenceStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { useJurnl } from '../state/store';

export type SelectionTile = { id: string; label: string; src: string };

export const PURCHASE_CATEGORIES: SelectionTile[] = [
  { id: 'fashion', label: 'FASHION', src: catFashion },
  { id: 'beauty', label: 'BEAUTY', src: catBeauty },
  { id: 'home', label: 'HOME', src: catHome },
  { id: 'travel', label: 'TRAVEL', src: catTravel },
  { id: 'wellness', label: 'WELLNESS', src: catWellness },
  { id: 'dining', label: 'DINING', src: catDining },
  { id: 'groceries', label: 'GROCERIES', src: catGroceries },
  { id: 'gifts', label: 'GIFTS', src: catGifts },
  { id: 'tech', label: 'TECH', src: catTech },
  { id: 'transport', label: 'TRANSPORT', src: catTransport },
  { id: 'events', label: 'EVENTS', src: catEvents },
  { id: 'other', label: 'OTHER', src: catOther },
];

export const PAY_WITH_ACCOUNTS: SelectionTile[] = [
  { id: 'checking', label: 'CHECKING', src: accChecking },
  { id: 'savings', label: 'SAVINGS', src: accSavings },
  { id: 'credit-card', label: 'CREDIT CARD', src: accCredit },
  { id: 'debit-card', label: 'DEBIT CARD', src: accDebit },
  { id: 'cash', label: 'CASH', src: accCash },
  { id: 'joint-account', label: 'JOINT ACCOUNT', src: accJoint },
];

const CHECK_PLATE = { src: checkPlate, assetId: 'SAFE.REFERENCE_REPLICA.CHECK_PLATE.INTERIM' };
const CHIPS = [25, 50, 100, 250] as const;

/** Row pitch of the approved sheet (tile height + row gap). */
const ROW_PITCH = REF_CATEGORY.box.rows_y[1] - REF_CATEGORY.box.rows_y[0];
const COLUMNS = REF_CATEGORY.box.tiles_x.length;

const shiftBox = (b: RefBox, dy: number): RefBox => [b[0], b[1] + dy, b[2], b[3] + dy];
const shiftType = (t: RefType, dy: number): RefType => ({ ...t, top: t.top + dy });

/**
 * The selection sheet. Every size comes from the approved SELECT A CATEGORY drawer. With fewer rows than the
 * approved three, the sheet's top edge moves down by whole rows so the apply button keeps its place.
 */
export function SelectionSheet({
  testId,
  title,
  sub,
  tiles,
  selected,
  applyLabel,
  onSelect,
  onApply,
  onClose,
}: {
  testId: string;
  title: string;
  sub: readonly [string, string];
  tiles: SelectionTile[];
  selected: string | null;
  applyLabel: string;
  onSelect: (id: string) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const L = REF_CATEGORY;
  const rows = Math.ceil(tiles.length / COLUMNS);
  const dy = (L.box.rows_y.length - rows) * ROW_PITCH;
  const sheet = shiftBox(L.box.sheet as RefBox, dy);
  const titleId = `${testId}-title`;
  const label = L.text.label;
  return (
    <>
      <button type="button" className="jrn-ref__scrim" aria-label="CLOSE" data-jrn-trigger={`${testId}-scrim`} onClick={onClose} />
      <section className="jrn-ref__sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} data-jrn-sheet={testId} style={at(sheet)}>
        <span className="jrn-ref__handle jrn-ref__abs" style={at(shiftBox(L.box.handle as RefBox, dy), sheet)} />
        <button type="button" aria-label="CLOSE" data-jrn-trigger={`${testId}-close`} onClick={onClose} style={at([L.box.close[0] - 16, L.box.close[1] + dy - 16, L.box.close[2] + 16, L.box.close[3] + dy + 16], sheet)}>
          <RefIcon name="close" box={[16, 16, 16 + L.box.close[2] - L.box.close[0], 16 + L.box.close[3] - L.box.close[1]]} stroke={2.6} />
        </button>
        <RefText t={shiftType(L.text.title, dy)} origin={sheet} as="h2" id={titleId}>{title}</RefText>
        <RefText t={shiftType(L.text.sub1, dy)} origin={sheet} className="jrn-ref__sheet-sub">{sub[0]}</RefText>
        <RefText t={shiftType(L.text.sub2, dy)} origin={sheet} className="jrn-ref__sheet-sub">{sub[1]}</RefText>
        {tiles.map((tile, i) => {
          const r = Math.floor(i / COLUMNS);
          const c = i % COLUMNS;
          const x = L.box.tiles_x[c]!;
          const y = L.box.rows_y[r]! + dy;
          const box: RefBox = [x, y, x + L.box.tile_w, y + L.box.rows_h[r]!];
          const lt: RefType = { ...label, cx: x + L.box.tile_w / 2, top: label.top - label.ink[1] + L.box.rows_label_dy[r]! + y };
          return (
            <button key={tile.id} type="button" className="jrn-ref__tile" style={at(box, sheet)} aria-pressed={selected === tile.id} data-jrn-trigger={`${testId}-${tile.id}`} onClick={() => onSelect(tile.id)}>
              <img className="jrn-ref__tile-img" src={tile.src} alt="" width={L.box.tile_w} height={L.box.rows_img_h[r]} style={{ width: L.box.tile_w, height: L.box.rows_img_h[r] }} draggable={false} />
              <RefText t={lt} origin={box} as="span">{tile.label}</RefText>
            </button>
          );
        })}
        <button type="button" className="jrn-ref__cta" data-jrn-trigger={`${testId}-apply`} onClick={onApply} style={at(shiftBox(L.box.apply as RefBox, dy), sheet)}>
          <RefText t={shiftType(L.text.apply, dy)} origin={shiftBox(L.box.apply as RefBox, dy)} as="span">{applyLabel}</RefText>
          <RefIcon name="arrow" box={shiftBox(L.box.applyArrow as RefBox, dy)} origin={shiftBox(L.box.apply as RefBox, dy)} stroke={2.2} />
        </button>
      </section>
    </>
  );
}

/** F09.CHECK — CHECK A PURCHASE. Derived from SAFE TO SPEND; opens from its bridge. */
export function CheckPurchaseScreen() {
  const { go, overlay, openOverlay, closeOverlay, showToast } = useJurnl();
  useCurrency();
  const L = REF_CHECK;
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'category' | 'account' | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const value = Number(amount.replace(/[^0-9.]/g, '')) || 0;
  const categoryLabel = PURCHASE_CATEGORIES.find((c) => c.id === category)?.label;
  const accountLabel = PAY_WITH_ACCOUNTS.find((a) => a.id === account)?.label;
  const openSheet = (which: 'category' | 'account') => {
    setPick(which === 'category' ? category : account);
    setSheet(which);
  };
  /** CHECK PURCHASE opens the purchase-result flow (purchases/checked) with what was entered here. */
  const check = () => {
    if (value <= 0) {
      showToast({ tone: 'error', title: 'ENTER AN AMOUNT', body: 'ADD WHAT IT COSTS TO SEE HOW IT FITS.', testId: 'toast-check-amount' });
      return;
    }
    go('purchases/checked', { amount: String(value), category: categoryLabel ?? 'OTHER', pay: accountLabel ?? 'CHECKING' });
  };
  const input = L.box.input as RefBox;
  return (
    <ReferenceStage
      screenId="F09.CHECK"
      plate={CHECK_PLATE}
      label="CHECK A PURCHASE"
      outside={
        <>
          <JurnlProductNav marks="authority" current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId="F09.CHECK" onClose={closeOverlay} /> : null}
        </>
      }
    >
      <ReferenceLockup L={L} />
      <RefText t={L.text.title} as="h1">CHECK A PURCHASE</RefText>
      <RefText t={L.text.sub1}>SEE HOW IT FITS YOUR PLAN</RefText>
      <RefText t={L.text.sub2}>BEFORE YOU BUY.</RefText>

      <section className="jrn-ref__panel" style={at(L.box.panelAmount as RefBox)} aria-label="PURCHASE AMOUNT" data-jrn-panel="check-amount">
        <RefText t={L.text.lblAmount} origin={L.box.panelAmount as RefBox} as="label" htmlFor="jrn-check-amount">PURCHASE AMOUNT</RefText>
        <div className="jrn-ref__field jrn-ref__abs" style={at(input, L.box.panelAmount as RefBox)}>
          <RefText t={L.text.amount} origin={input} as="span" className="jrn-ref__amount" data-caret={focused || !amount ? 'on' : 'off'} data-focused={focused ? 'true' : 'false'} aria-hidden>{`$${amount || '0'}`}</RefText>
          <input
            id="jrn-check-amount"
            className="jrn-ref__amount-input"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            data-jrn-trigger="check-amount"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, '').slice(0, 9))}
            style={{ left: 0, top: 0, width: input[2] - input[0], height: input[3] - input[1] }}
          />
        </div>
        {CHIPS.map((n, i) => {
          const box = L.box[`chip${i + 1}` as 'chip1'] as RefBox;
          return (
            <button key={n} type="button" className="jrn-ref__chip" style={at(box, L.box.panelAmount as RefBox)} aria-pressed={value === n} data-jrn-trigger={`check-chip-${n}`} onClick={() => setAmount(String(n))}>
              <RefText t={L.text[`chip${i + 1}` as 'chip1']} origin={box} as="span">{`$${n}`}</RefText>
            </button>
          );
        })}
      </section>

      <section className="jrn-ref__panel" style={at(L.box.panelCategory as RefBox)} aria-label="PURCHASE CATEGORY" data-jrn-panel="check-category">
        <RefText t={L.text.lblCategory} origin={L.box.panelCategory as RefBox}>PURCHASE CATEGORY</RefText>
        <span className="jrn-ref__well" style={at(L.box.iconCategory as RefBox, L.box.panelCategory as RefBox)} />
        <RefIcon name="bag" box={L.box.bag as RefBox} origin={L.box.panelCategory as RefBox} stroke={3} />
        <button type="button" className="jrn-ref__select" style={at(L.box.selectCategory as RefBox, L.box.panelCategory as RefBox)} data-jrn-trigger="check-category" onClick={() => openSheet('category')}>
          <RefText t={L.text.selCategory} origin={L.box.selectCategory as RefBox} as="span">{categoryLabel ?? 'SELECT A CATEGORY'}</RefText>
          <RefIcon name="arrow" box={L.box.arrowCategory as RefBox} origin={L.box.selectCategory as RefBox} stroke={2.2} />
        </button>
      </section>

      <section className="jrn-ref__panel" style={at(L.box.panelPay as RefBox)} aria-label="PAY WITH" data-jrn-panel="check-pay-with">
        <RefText t={L.text.lblPay} origin={L.box.panelPay as RefBox}>PAY WITH</RefText>
        <span className="jrn-ref__well" style={at(L.box.iconPay as RefBox, L.box.panelPay as RefBox)} />
        <RefIcon name="card" box={L.box.card as RefBox} origin={L.box.panelPay as RefBox} stroke={2.8} />
        <button type="button" className="jrn-ref__select" style={at(L.box.selectPay as RefBox, L.box.panelPay as RefBox)} data-jrn-trigger="check-pay-with" onClick={() => openSheet('account')}>
          <RefText t={L.text.selPay} origin={L.box.selectPay as RefBox} as="span">{accountLabel ?? 'SELECT ACCOUNT'}</RefText>
          <RefIcon name="arrow" box={L.box.arrowPay as RefBox} origin={L.box.selectPay as RefBox} stroke={2.2} />
        </button>
      </section>

      <button type="button" className="jrn-ref__cta" style={at(L.box.cta as RefBox)} data-jrn-trigger="check-purchase" onClick={check}>
        <RefText t={L.text.cta} origin={L.box.cta as RefBox} as="span">CHECK PURCHASE</RefText>
        <RefIcon name="arrow" box={L.box.ctaArrow as RefBox} origin={L.box.cta as RefBox} stroke={2.2} />
      </button>
      <button type="button" className="jrn-ref__ghost" style={at(L.box.back as RefBox)} data-jrn-trigger="check-back" onClick={() => go('safe')}>
        <RefIcon name="arrow-left" box={L.box.backArrow as RefBox} origin={L.box.back as RefBox} stroke={2.2} />
        <RefText t={L.text.back} origin={L.box.back as RefBox} as="span">BACK</RefText>
      </button>

      {sheet === 'category' ? (
        <SelectionSheet
          testId="check-category-sheet"
          title="SELECT A CATEGORY"
          sub={['CHOOSE THE CATEGORY THAT BEST FITS', 'YOUR PURCHASE.']}
          tiles={PURCHASE_CATEGORIES}
          selected={pick}
          applyLabel="APPLY CATEGORY"
          onSelect={setPick}
          onApply={() => {
            if (pick) setCategory(pick);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {sheet === 'account' ? (
        <SelectionSheet
          testId="check-account-sheet"
          title="SELECT AN ACCOUNT"
          sub={['CHOOSE THE ACCOUNT YOU WANT TO USE', 'FOR THIS PURCHASE.']}
          tiles={PAY_WITH_ACCOUNTS}
          selected={pick}
          applyLabel="APPLY ACCOUNT"
          onSelect={setPick}
          onApply={() => {
            if (pick) setAccount(pick);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      ) : null}
    </ReferenceStage>
  );
}
