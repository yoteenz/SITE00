/** F12 credit card sheets: payment plan (three guidance tracks), record payment, card terms. Manual figures only. */

import { useState } from 'react';
import type { JurnlAccountRecord } from '../../data/foundation/accounts';
import { formatCalendarDate, formatRelativeDate, getTodayKey, isCalendarDate, type CalendarDate } from '../../data/foundation/dates';
import { useCurrency, useRepoTick } from '../../data/home/money';
import { accountNature } from '../../data/ledger/accounting';
import { parseMoneyInput, recordTransfer, setAccountBalance } from '../../data/ledger/ledgerOps';
import { ledgerPositions } from '../../data/ledger/moneyPositions';
import { creditAttributesFor, cardFactsFor, upsertCreditTerms } from '../../data/f12/creditStore';
import { interestGuidance, overallUtilization, paymentSafety, paymentSourcePlan, REPORTING_CAUTION, utilizationPlan, UTILIZATION_CAUTION, type UtilizationBasis } from '../../data/f12/creditGuidance';
import { getRepository } from '../../data/repository/deviceRepository';
import { JurnlButton, JurnlDrawer, JurnlInput } from '../components/primitives';
import { useJurnl } from '../state/store';
import { AccountChips, Chips, SetAsideSheet, money } from './FinanceSheets';

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <ul className="jrn-why">
      {rows.map(([k, v]) => (
        <li key={k}>
          <span>{k}</span>
          <b>{v}</b>
        </li>
      ))}
    </ul>
  );
}

const or = (n: number | null | undefined, f: (n: number) => string = money) => (n == null ? 'NOT ENTERED' : f(n));

export function cardFactRows(card: JurnlAccountRecord): [string, string][] {
  const f = cardFactsFor(card);
  if (!f) return [];
  const today = getTodayKey();
  return [
    ['BALANCE OWED NOW', money(f.owed)],
    ['CREDIT LIMIT', or(f.limit)],
    ['CREDIT AVAILABLE', or(f.availableCredit)],
    ['STATEMENT BALANCE', or(f.statementBalance)],
    ['STATEMENT CLOSED', f.statementClosingDate ? formatCalendarDate(f.statementClosingDate) : 'NOT ENTERED'],
    ['PAYMENT DUE', f.dueDate ? `${formatCalendarDate(f.dueDate)} (${formatRelativeDate(f.dueDate, today)})` : 'NOT ENTERED'],
    ['MINIMUM PAYMENT', or(f.minimum)],
    ['PAID SINCE STATEMENT', money(f.paidSinceStatement)],
    ['MINIMUM STILL DUE', or(f.remainingMinimum)],
    ['APR', f.apr != null ? `${f.apr}%` : 'NOT ENTERED'],
    ...(f.promoApr != null ? ([['PROMO APR', `${f.promoApr}%${f.promoAprEnd ? ` UNTIL ${formatCalendarDate(f.promoAprEnd)}` : ''}`]] as [string, string][]) : []),
    ['PAID FROM', f.paymentAccount?.display_name ?? 'NOT SET'],
    ['NUMBERS FROM', f.termsEnteredOn ? `ENTERED BY YOU · ${formatRelativeDate(f.termsEnteredOn, today)}` : 'ENTERED BY YOU'],
  ];
}

/** Three tracks: payment safety, interest, utilization — plus where the payment would come from. */
export function CardPlanSheet({ card, onClose, onRecord }: { card: JurnlAccountRecord; onClose: () => void; onRecord: () => void }) {
  useCurrency();
  useRepoTick();
  const { go } = useJurnl();
  const today = getTodayKey();
  const settings = getRepository().getSettings();
  const [target, setTarget] = useState(settings.utilizationTargetPct != null ? String(settings.utilizationTargetPct) : '');
  const [basis, setBasis] = useState<UtilizationBasis>('CURRENT');
  const [aside, setAside] = useState(false);
  const [change, setChange] = useState(false);
  const f = cardFactsFor(card);
  if (!f) return null;
  const s = getRepository().getSnapshot();
  const safety = paymentSafety(f, today);
  const interest = interestGuidance(f, today);
  const pct = target.trim() ? Number(target) : null;
  const util = utilizationPlan(basis === 'STATEMENT' && f.statementBalance != null ? f.statementBalance : f.owed, f.limit, pct != null && Number.isFinite(pct) ? pct : null, basis);
  const source = paymentSourcePlan(f, ledgerPositions().positions, s.obligations, s.transactions, s.reservations, today);
  const need = f.remainingMinimum ?? 0;
  if (aside) {
    // Up to the larger of the minimum and the statement balance still due (or the whole balance when neither is known).
    const planned = Math.max(need, f.remainingStatement ?? 0) || f.owed;
    const cap = Math.max(0, Math.min(f.owed, planned));
    return <SetAsideSheet target={{ kind: 'CARD_PAYMENT', id: card.account_id, occurrence_date: f.dueDate, name: `${card.display_name} PAYMENT`, cap }} defaultAccountId={f.paymentAccount?.account_id ?? null} onClose={() => setAside(false)} />;
  }
  if (change) {
    return (
      <JurnlDrawer expression="form" size="short" testId="card-pay-account" title="PAY THIS CARD FROM" onClose={() => setChange(false)}>
        <AccountChips label="PAY FROM" value={f.paymentAccount?.account_id ?? null} onChange={(id) => { upsertCreditTerms(card.account_id, { payment_account_id: id }); setChange(false); }} trigger="card-pay-from" filter={(a) => accountNature(a.account_type) === 'ASSET'} />
      </JurnlDrawer>
    );
  }
  return (
    <JurnlDrawer
      expression="analysis"
      size="long"
      testId="card-plan"
      title={`PLAN A PAYMENT · ${card.display_name}`}
      lead="FACTS FROM THE NUMBERS YOU ENTERED. JURNL NEVER PAYS A CARD FOR YOU."
      onClose={onClose}
      footer={
        <>
          <JurnlButton trigger="card-plan-set-aside" disabled={!f.paymentAccount} onClick={() => setAside(true)}>SET MONEY ASIDE</JurnlButton>
          <JurnlButton variant="secondary" trigger="card-plan-record" onClick={onRecord}>RECORD PAYMENT</JurnlButton>
          <JurnlButton variant="secondary" trigger="card-plan-account" onClick={() => setChange(true)}>CHANGE PAYMENT ACCOUNT</JurnlButton>
          <JurnlButton variant="secondary" trigger="card-plan-details" onClick={() => { onClose(); go(`credit/${card.account_id}`); }}>VIEW CARD DETAILS</JurnlButton>
        </>
      }
    >
      <p className="jrn-eyebrow">1 · AVOID A LATE PAYMENT</p>
      <p className="jrn-body" data-testid="card-safety" data-state={safety.state}>{safety.line}</p>
      {safety.detail.length ? <Rows rows={safety.detail.map((d, i) => [String(i + 1), d] as [string, string])} /> : null}
      <p className="jrn-currency__note" data-testid="card-source">{source.line}</p>
      {f.reservedForCard > 0 ? <p className="jrn-currency__note">{`${money(f.reservedForCard)} IS ALREADY SET ASIDE FOR THIS CARD.`}</p> : null}
      <p className="jrn-eyebrow">2 · INTEREST</p>
      <p className="jrn-body" data-testid="card-interest" data-state={interest.state}>{interest.line}</p>
      <p className="jrn-eyebrow">3 · HOW MUCH OF THE LIMIT IS USED</p>
      {util ? (
        <>
          <Chips label="BALANCE TO USE" value={basis} options={[{ id: 'CURRENT', label: 'CURRENT BALANCE' }, { id: 'STATEMENT', label: 'STATEMENT BALANCE' }]} onChange={setBasis} trigger="card-util-basis" />
          <Rows rows={[
            ['BALANCE', money(util.balance)],
            ['LIMIT', money(util.limit)],
            ['USED NOW', `${util.percent}%`],
          ]} />
          <JurnlInput label="YOUR TARGET USE (%)" value={target} onValue={(v) => { setTarget(v); const n = Number(v); if (v.trim() && Number.isFinite(n) && n >= 0 && n <= 100) getRepository().patchSettings({ utilizationTargetPct: n }); }} trigger="card-util-target" inputMode="decimal" />
          {util.targetBalance != null ? (
            <p className="jrn-body" data-testid="card-util-result">{`TO BE AT ${util.targetPct}% OF THE LIMIT, THE BALANCE WOULD BE ${money(util.targetBalance)} OR LESS. THAT TAKES A PAYMENT OF ${money(util.paymentToTarget ?? 0)}.`}</p>
          ) : <p className="jrn-currency__note">ENTER A TARGET YOU CHOOSE TO SEE THE PAYMENT IT WOULD TAKE.</p>}
          {basis === 'STATEMENT' && f.statementBalance == null ? <p className="jrn-currency__note">NO STATEMENT BALANCE ENTERED — USING THE CURRENT BALANCE.</p> : null}
        </>
      ) : <p className="jrn-body">ADD THE CREDIT LIMIT IN CARD TERMS TO SEE HOW MUCH OF IT IS USED.</p>}
      <p className="jrn-currency__note">{UTILIZATION_CAUTION}</p>
      <p className="jrn-currency__note">{REPORTING_CAUTION}</p>
      {f.missing.length ? <p className="jrn-currency__note" data-testid="card-missing">{`NOT ENTERED YET: ${f.missing.join(', ')}.`}</p> : null}
    </JurnlDrawer>
  );
}

export function CardPaymentSheet({ card, onClose }: { card: JurnlAccountRecord; onClose: () => void }) {
  useCurrency();
  const { showToast } = useJurnl();
  const f = cardFactsFor(card);
  const [from, setFrom] = useState<string | null>(f?.paymentAccount?.account_id ?? null);
  const [amount, setAmount] = useState(f?.remainingMinimum ? String(f.remainingMinimum) : '');
  const [date, setDate] = useState<string>(getTodayKey());
  const [allowDup, setAllowDup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = parseMoneyInput(amount);
  return (
    <JurnlDrawer
      expression="form"
      size="long"
      testId="card-pay"
      title={`RECORD PAYMENT · ${card.display_name}`}
      lead="A PAYMENT YOU MADE. IT LOWERS THE CARD BALANCE AND THE ACCOUNT IT CAME FROM. IT IS NOT NEW SPENDING."
      onClose={onClose}
      footer={
        <>
          {error ? <p className="jrn-field__error" role="alert">{error}</p> : null}
          {error && /ALREADY RECORDED/.test(error) ? <JurnlButton variant="secondary" trigger="card-pay-duplicate" onClick={() => setAllowDup(true)}>{allowDup ? 'IT HAPPENED TWICE ✓' : 'IT HAPPENED TWICE'}</JurnlButton> : null}
          <JurnlButton trigger="card-pay-save" disabled={value == null} onClick={() => {
            const r = recordTransfer({ from_account_id: from, to_account_id: card.account_id, amount: value ?? 0, occurred_on: (isCalendarDate(date.trim()) ? date.trim() : getTodayKey()) as CalendarDate, allowDuplicate: allowDup, origin_family: 'F12' });
            if (!r.ok) return setError(r.error);
            const next = cardFactsFor(card);
            showToast({ tone: 'success', title: 'CARD PAYMENT RECORDED', body: `${card.display_name} NOW OWES ${money(next?.owed ?? 0)}.${next?.remainingMinimum != null ? ` MINIMUM STILL DUE ${money(next.remainingMinimum)}.` : ''}`, testId: 'card-pay-result' });
            onClose();
          }}>RECORD PAYMENT</JurnlButton>
        </>
      }
    >
      <AccountChips label="PAID FROM" value={from} onChange={setFrom} trigger="card-pay-from" filter={(a) => accountNature(a.account_type) === 'ASSET'} />
      <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="card-pay-amount" inputMode="decimal" />
      <JurnlInput label="DATE PAID (YYYY-MM-DD)" value={date} onValue={setDate} trigger="card-pay-date" inputMode="numeric" />
    </JurnlDrawer>
  );
}

export function CardTermsSheet({ card, onClose }: { card: JurnlAccountRecord; onClose: () => void }) {
  const attrs = creditAttributesFor(card.account_id);
  const f = cardFactsFor(card);
  const [limit, setLimit] = useState(String(attrs?.credit_limit ?? card.credit_limit ?? ''));
  const [owed, setOwed] = useState(String(f?.owed ?? ''));
  const [stmt, setStmt] = useState(String(attrs?.statement_balance ?? ''));
  const [closing, setClosing] = useState(attrs?.statement_closing_date ?? '');
  const [stmtDay, setStmtDay] = useState(String(attrs?.statement_day ?? ''));
  const [due, setDue] = useState(attrs?.payment_due_date ?? '');
  const [dueDay, setDueDay] = useState(String(attrs?.payment_due_day ?? ''));
  const [minPay, setMinPay] = useState(String(attrs?.minimum_payment ?? ''));
  const [apr, setApr] = useState(String(attrs?.apr ?? ''));
  const [promo, setPromo] = useState(String(attrs?.promo_apr ?? ''));
  const [promoEnd, setPromoEnd] = useState(attrs?.promo_apr_end_date ?? '');
  const [carry, setCarry] = useState<boolean | null>(attrs?.carries_interest_balance ?? null);
  const [error, setError] = useState<string | null>(null);
  const num = (v: string) => (v.trim() === '' ? null : Number(v));
  const date = (v: string) => (v.trim() === '' ? null : v.trim());
  const day = (v: string) => (v.trim() === '' ? null : Math.trunc(Number(v)));
  const save = () => {
    for (const [label, v] of [['LIMIT', limit], ['STATEMENT BALANCE', stmt], ['MINIMUM', minPay], ['APR', apr], ['PROMO APR', promo], ['BALANCE OWED', owed]] as const) {
      if (v.trim() && !(Number.isFinite(Number(v)) && Number(v) >= 0)) return setError(`${label} MUST BE A NUMBER OF 0 OR MORE.`);
    }
    for (const [label, v] of [['STATEMENT CLOSED', closing], ['PAYMENT DUE', due], ['PROMO ENDS', promoEnd]] as const) {
      if (v.trim() && !isCalendarDate(v.trim())) return setError(`${label} MUST BE YYYY-MM-DD.`);
    }
    for (const [label, v] of [['STATEMENT DAY', stmtDay], ['DUE DAY', dueDay]] as const) {
      if (v.trim() && !(Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 31)) return setError(`${label} MUST BE 1–31.`);
    }
    upsertCreditTerms(card.account_id, {
      credit_limit: num(limit),
      statement_balance: num(stmt),
      statement_closing_date: date(closing) as CalendarDate | null,
      statement_day: day(stmtDay),
      payment_due_date: date(due) as CalendarDate | null,
      payment_due_day: day(dueDay),
      minimum_payment: num(minPay),
      apr: num(apr),
      promo_apr: num(promo),
      promo_apr_end_date: date(promoEnd) as CalendarDate | null,
      carries_interest_balance: carry,
    });
    // Balance owed goes through the ledger: entered once, then corrected by the difference (never re-counted).
    const o = num(owed);
    if (o != null && f && Math.round(o * 100) !== Math.round(f.owed * 100)) {
      const r = setAccountBalance(card.account_id, o);
      if (!r.ok) return setError(r.error);
    }
    onClose();
  };
  return (
    <JurnlDrawer expression="form" size="long" testId="credit-terms" title="CARD TERMS" lead="COPY THESE FROM YOUR STATEMENT. JURNL DOES NOT CONNECT TO YOUR CARD." onClose={onClose}
      footer={<>{error ? <p className="jrn-field__error" role="alert">{error}</p> : null}<JurnlButton trigger="credit-terms-save" onClick={save}>SAVE</JurnlButton></>}>
      <JurnlInput label="BALANCE OWED NOW" value={owed} onValue={setOwed} trigger="credit-balance" inputMode="decimal" />
      <JurnlInput label="CREDIT LIMIT" value={limit} onValue={setLimit} trigger="credit-limit" inputMode="decimal" />
      <JurnlInput label="STATEMENT BALANCE" value={stmt} onValue={setStmt} trigger="credit-statement" inputMode="decimal" />
      <JurnlInput label="STATEMENT CLOSED ON (YYYY-MM-DD)" value={closing} onValue={setClosing} trigger="credit-closing" inputMode="numeric" />
      <JurnlInput label="OR STATEMENT DAY EACH MONTH (1-31)" value={stmtDay} onValue={setStmtDay} trigger="credit-statement-day" inputMode="numeric" />
      <JurnlInput label="PAYMENT DUE ON (YYYY-MM-DD)" value={due} onValue={setDue} trigger="credit-due-date" inputMode="numeric" />
      <JurnlInput label="OR DUE DAY EACH MONTH (1-31)" value={dueDay} onValue={setDueDay} trigger="credit-due" inputMode="numeric" />
      <JurnlInput label="MINIMUM PAYMENT" value={minPay} onValue={setMinPay} trigger="credit-min" inputMode="decimal" />
      <JurnlInput label="APR (%)" value={apr} onValue={setApr} trigger="credit-apr" inputMode="decimal" />
      <JurnlInput label="PROMO APR (%) (OPTIONAL)" value={promo} onValue={setPromo} trigger="credit-promo" inputMode="decimal" />
      <JurnlInput label="PROMO ENDS (YYYY-MM-DD)" value={promoEnd} onValue={setPromoEnd} trigger="credit-promo-end" inputMode="numeric" />
      <p className="jrn-eyebrow">DID A BALANCE CARRY OVER FROM THE LAST STATEMENT?</p>
      <Chips label="CARRIED BALANCE" value={carry == null ? null : carry ? 'YES' : 'NO'} options={[{ id: 'NO', label: 'NO, PAID IN FULL' }, { id: 'YES', label: 'YES, A BALANCE CARRIED' }]} onChange={(v) => setCarry(v === 'YES')} trigger="credit-carry" />
    </JurnlDrawer>
  );
}

/** Combined use across cards with a known limit (others are listed, not guessed). */
export function OverallUtilizationRows() {
  const cards = ledgerPositions().positions.filter((p) => p.kind === 'CREDIT_CARD');
  const all = overallUtilization(cards.map((c) => ({ name: c.account.display_name, balance: c.owed, limit: c.creditLimit })));
  if (!all) return <p className="jrn-currency__note">ADD A CREDIT LIMIT TO A CARD TO SEE HOW MUCH OF YOUR CREDIT IS USED.</p>;
  return (
    <>
      <Rows rows={[['ALL CARDS WITH A LIMIT', `${all.percent}% USED · ${money(all.balance)} OF ${money(all.limit)}`]]} />
      {all.excluded.length ? <p className="jrn-currency__note">{`NOT INCLUDED (NO LIMIT ENTERED): ${all.excluded.join(', ')}.`}</p> : null}
    </>
  );
}
