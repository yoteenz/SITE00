/**
 * Global product sheets (W1.3 / W1.4). One implementation for all families.
 */

import { useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
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
import { REPLICA_W, fitSize, sheetScale, useKeyboardViewport, useOverlayHost } from '../components/OverlayAuthority';
import { RefIcon, RefText, at, typeAt } from '../components/ReferenceStage';
import { OVR_QUICK_ADD } from '../layout/overlayReferenceLayout';
import type { RefBox, RefType } from '../layout/referenceLayout';
import quickAddShell from './overlays/F09_QUICK_ADD_SHELL.webp';
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

/**
 * Sheet blocks in reference y (OVR_QUICK_ADD): [start, end). They stack from the top of the sheet; with one record type
 * and two accounts the stack is the reference exactly (686 → 1672). A family with several record types adds a RECORD row
 * set like NAME; non-transaction records drop TYPE and ACCOUNT; each further pair of accounts adds a row.
 */
const QA_BLOCK = { head: [686, 916], name: [916, 1056], amount: [1056, 1215], type: [1215, 1358], account: [1358, 1503], save: [1503, 1672] } as const;
const QA_ACCOUNT_ROW = 106;
/** Shell in the sheet: the registered handoff shell, from sheet y 3.5, stretched 0.8% to meet the screen edges. */
const QA_SHELL = { top: 3.5, h: 982.5 } as const;
const QA_FOOT = 400;

type QaBlock = readonly [number, number];
const o = (b: QaBlock): RefBox => [0, b[0], REPLICA_W, b[1]];
const shiftY = (b: RefBox, dy: number): RefBox => [b[0], b[1] + dy, b[2], b[3] + dy];
const sized = (t: RefType, size: number): RefType => ({ ...t, size, ls: (t.ls * size) / t.size });

function Blk({ b, top, children }: { b: QaBlock; top: number; children: ReactNode }) {
  return (
    <div className="jrn-qa__blk" style={{ top, height: b[1] - b[0] }}>
      {children}
    </div>
  );
}

function QaGlyph({ kind, box, origin }: { kind: 'minus' | 'plus' | 'card' | 'chevron'; box: RefBox; origin: RefBox }) {
  const w = box[2] - box[0];
  const h = box[3] - box[1];
  const d =
    kind === 'card' ? `M7 1.4h${w - 14}a5.6 5.6 0 0 1 5.6 5.6v${h - 14}a5.6 5.6 0 0 1-5.6 5.6H7A5.6 5.6 0 0 1 1.4 ${h - 7}V7A5.6 5.6 0 0 1 7 1.4ZM1.4 ${Math.round(h * 0.3)}H${w - 1.4}`
    : kind === 'chevron' ? `M1.5 1.5l${w / 2 - 1.5} ${h - 3} ${w / 2 - 1.5}-${h - 3}`
    : `M10 1.4h${w - 20}a8.6 8.6 0 0 1 8.6 8.6v${h - 20}a8.6 8.6 0 0 1-8.6 8.6H10A8.6 8.6 0 0 1 1.4 ${h - 10}V10A8.6 8.6 0 0 1 10 1.4ZM${w * 0.29} ${h / 2}H${w * 0.71}${kind === 'plus' ? `M${w / 2} ${h * 0.29}V${h * 0.71}` : ''}`;
  return (
    <svg className="jrn-ref__icon" viewBox={`0 0 ${w} ${h}`} style={at(box, origin)} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={kind === 'chevron' ? 2.6 : 2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * QUICK ADD, replicated from the founder reference (JURNL/F09_SAFE/AUTHORITIES/F09_QUICK_ADD_OVERLAY_SOURCE.jpg).
 * The sheet rises over the live screen on the founder's torn-paper shell; every line, field, option and SAVE sits where
 * the reference has it, in its type and colour. The screen behind blurs, the same way the account drawer does.
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
  const { host, ref: rootRef } = useOverlayHost();
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

  const Q = OVR_QUICK_ADD;
  const transaction = typeId === 'TRANSACTION';
  const accountRows = Math.max(1, Math.ceil(accountOptions.length / 2));
  const accountBlock: QaBlock = [QA_BLOCK.account[0], QA_BLOCK.account[1] + (accountRows - 1) * QA_ACCOUNT_ROW];
  const stack: { key: string; b: QaBlock }[] = [
    { key: 'head', b: QA_BLOCK.head },
    ...(types.length > 1 ? [{ key: 'record', b: QA_BLOCK.name }] : []),
    { key: 'name', b: QA_BLOCK.name },
    { key: 'amount', b: QA_BLOCK.amount },
    ...(transaction ? [{ key: 'type', b: QA_BLOCK.type }, { key: 'account', b: accountBlock }] : []),
    { key: 'save', b: QA_BLOCK.save },
  ];
  const top: Record<string, number> = {};
  let sheetH = 0;
  for (const s of stack) {
    top[s.key] = sheetH;
    sheetH += s.b[1] - s.b[0];
  }
  const k = sheetScale(host.W, host.H, sheetH);
  const symbolSize = fitSize(currency.symbol, Q.text.cur.size, 26, 62, 20);
  const chipW = (Q.box.nameField[2] - Q.box.nameField[0] - 12 * (types.length - 1)) / Math.max(1, types.length);
  // One size for every record chip: the longest label decides it.
  const chipSize = Math.min(...types.map((t) => fitSize(t.label, 20.2, 18, chipW - 28, 12)));
  const rootStyle = (vv ? { top: vv.top, height: vv.height, bottom: 'auto' } : undefined) as CSSProperties | undefined;
  return (
    <OverlayLayer>
      <div ref={rootRef} className="jrn-ovl jrn-ovl--sheet" data-jrn-overlay="quick-add" data-keyboard={keyboard ? 'open' : 'closed'} style={rootStyle}>
        <div className="jrn-ovl__scrim" onClick={onClose} aria-hidden />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="jrn-qa"
          data-jrn-expression="form"
          data-jrn-overlay-authority="F09_QUICK_ADD_OVERLAY_SOURCE"
          style={{ height: sheetH, '--k': k } as CSSProperties}
        >
          <div className="jrn-qa__paper" aria-hidden data-asset-id="F09_QUICK_ADD_OVERLAY_SHELL">
            <img className="jrn-qa__shell" src={quickAddShell} alt="" draggable={false} style={{ top: QA_SHELL.top, height: QA_SHELL.h }} />
            <span className="jrn-qa__foot" style={{ height: Math.min(QA_FOOT, sheetH) }}>
              <img className="jrn-qa__shell" src={quickAddShell} alt="" draggable={false} style={{ bottom: 0, height: QA_SHELL.h }} />
            </span>
          </div>

          <Blk b={QA_BLOCK.head} top={top.head!}>
            <span className="jrn-qa__handle" style={at(Q.box.handle, o(QA_BLOCK.head))} />
            <button type="button" className="jrn-qa__close" aria-label="CLOSE" data-jrn-trigger="quick-add-close" onClick={onClose} style={at(Q.box.close, o(QA_BLOCK.head))}>
              <RefIcon name="close" box={Q.box.closeX} origin={Q.box.close} stroke={2.6} />
            </button>
            <h2 className="jrn-qa__title" id={titleId}>
              <RefText t={Q.text.titleQuick} origin={o(QA_BLOCK.head)} as="span">QUICK</RefText>{' '}
              <RefText t={Q.text.titleAdd} origin={o(QA_BLOCK.head)} as="span">ADD</RefText>
            </h2>
            <RefText t={Q.text.sub} origin={o(QA_BLOCK.head)}>{SUBTITLE[typeId]}</RefText>
          </Blk>

          {types.length > 1 ? (
            <Blk b={QA_BLOCK.name} top={top.record!}>
              <RefText t={Q.text.nameLabel} origin={o(QA_BLOCK.name)} as="span">RECORD</RefText>
              <div role="radiogroup" aria-label="TYPE">
                {types.map((t, i) => {
                  const x = Q.box.nameField[0] + i * (chipW + 12);
                  const chip: RefBox = [x, Q.box.nameField[1], x + chipW, Q.box.nameField[3]];
                  return (
                    <button key={t.type_id} type="button" className="jrn-qa__opt jrn-qa__opt--record" aria-pressed={typeId === t.type_id} data-active={typeId === t.type_id ? 'true' : 'false'} data-jrn-trigger={`quick-add-type-${t.type_id.toLowerCase()}`} onClick={() => setTypeId(t.type_id)} style={at(chip, o(QA_BLOCK.name))}>
                      <span style={{ fontSize: chipSize, letterSpacing: (3.6 * chipSize) / 20.2, marginRight: (-3.6 * chipSize) / 20.2 }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </Blk>
          ) : null}

          <Blk b={QA_BLOCK.name} top={top.name!}>
            <RefText t={Q.text.nameLabel} origin={o(QA_BLOCK.name)} as="label" htmlFor={nameId}>NAME</RefText>
            <span className="jrn-qa__field" style={at(Q.box.nameField, o(QA_BLOCK.name))}>
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
          </Blk>

          <Blk b={QA_BLOCK.amount} top={top.amount!}>
            <RefText t={Q.text.amountLabel} origin={o(QA_BLOCK.amount)} as="label" htmlFor={amountId}>AMOUNT</RefText>
            <span className="jrn-qa__field" style={at(Q.box.amountField, o(QA_BLOCK.amount))}>
              <span className="jrn-qa__cur" style={{ ...typeAt({ ...Q.text.cur, left: undefined, cx: 111.5, size: symbolSize, top: Q.text.cur.top + (Q.text.cur.size - symbolSize) * 0.75 }, Q.box.amountField) }}>
                {currency.symbol}
              </span>
              <span className="jrn-qa__vr" style={at(Q.box.amountDivider, Q.box.amountField)} />
              <input
                id={amountId}
                className="jrn-qa__amount"
                value={shown}
                placeholder="0.00"
                inputMode="decimal"
                autoComplete="off"
                data-jrn-trigger="quick-add-amount"
                style={{ left: Q.box.amountDivider[2] - Q.box.amountField[0] }}
                onChange={(e) => setAmount(parseAmountInput(e.target.value))}
                onFocus={() => setKeyboard(true)}
                onBlur={() => setKeyboard(false)}
              />
            </span>
          </Blk>

          {transaction ? (
            <>
              <Blk b={QA_BLOCK.type} top={top.type!}>
                <RefText t={Q.text.typeLabel} origin={o(QA_BLOCK.type)} as="span">TYPE</RefText>
                <div role="radiogroup" aria-label="DIRECTION">
                  {(['EXPENSE', 'INCOME'] as const).map((item) => {
                    const box = item === 'EXPENSE' ? Q.box.expense : Q.box.income;
                    return (
                      <button key={item} type="button" className="jrn-qa__opt jrn-qa__opt--dir" aria-pressed={direction === item} data-active={direction === item ? 'true' : 'false'} data-jrn-trigger={`quick-add-${item.toLowerCase()}`} onClick={() => setDirection(item)} style={at(box, o(QA_BLOCK.type))}>
                        <QaGlyph kind={item === 'EXPENSE' ? 'minus' : 'plus'} box={item === 'EXPENSE' ? Q.box.expenseIcon : Q.box.incomeIcon} origin={box} />
                        <span className="jrn-qa__vr" style={at(item === 'EXPENSE' ? Q.box.expenseDivider : Q.box.incomeDivider, box)} />
                        <RefText t={item === 'EXPENSE' ? Q.text.expense : Q.text.income} origin={box} as="span">{item}</RefText>
                      </button>
                    );
                  })}
                </div>
              </Blk>
              <Blk b={accountBlock} top={top.account!}>
                <RefText t={Q.text.accountLabel} origin={o(accountBlock)} as="span">ACCOUNT</RefText>
                <div role="radiogroup" aria-label="ACCOUNT">
                  {accountOptions.map((item, i) => {
                    const left = i % 2 === 0;
                    const dy = Math.floor(i / 2) * QA_ACCOUNT_ROW;
                    const box = shiftY(left ? Q.box.checking : Q.box.cardOpt, dy);
                    const t = left ? Q.text.checking : Q.text.card;
                    const chevron = shiftY(left ? Q.box.checkingChevron : Q.box.cardChevron, dy);
                    const size = fitSize(item.label, t.size, 16, chevron[0] - (t.left ?? 0) - 12, 10);
                    return (
                      <button key={item.id} type="button" className="jrn-qa__opt jrn-qa__opt--account" aria-pressed={account === item.id} data-active={account === item.id ? 'true' : 'false'} data-jrn-trigger={`quick-add-${item.id.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setAccount(item.id)} style={at(box, o(accountBlock))}>
                        <QaGlyph kind="card" box={shiftY(left ? Q.box.checkingIcon : Q.box.cardIcon, dy)} origin={box} />
                        <span className="jrn-qa__vr" style={at(shiftY(left ? Q.box.checkingDivider : Q.box.cardDivider, dy), box)} />
                        <RefText t={{ ...sized(t, size), top: t.top + dy + (t.size - size) * 0.5 }} origin={box} as="span">
                          {item.label}
                        </RefText>
                        <QaGlyph kind="chevron" box={chevron} origin={box} />
                      </button>
                    );
                  })}
                </div>
              </Blk>
            </>
          ) : null}

          <Blk b={QA_BLOCK.save} top={top.save!}>
            <button type="button" className="jrn-qa__save" data-jrn-trigger="quick-add-save" disabled={!valid} onClick={save} style={at(Q.box.save, o(QA_BLOCK.save))}>
              <RefText t={Q.text.save} origin={Q.box.save} as="span">{SAVE_LABEL[typeId]}</RefText>
              <span className="jrn-qa__vr" style={at(Q.box.saveDivider, Q.box.save)} />
              <RefIcon name="arrow" box={Q.box.saveArrow} origin={Q.box.save} stroke={2.4} />
            </button>
            {error ? (
              <p className="jrn-qa__error" role="alert" style={{ top: Q.box.save[3] + 14 - QA_BLOCK.save[0] }}>
                {error}
              </p>
            ) : null}
          </Blk>
        </div>
      </div>
    </OverlayLayer>
  );
}
