/**
 * Shared money sheets for the financial operating workflows (F04 / F05 / F06 / F07 / F12 / F03).
 * Built only from the existing drawer, field, chip and button primitives — no new visual language.
 * Every write goes through the canonical ledger operations; every figure is derived from repository records.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { JurnlAccountRecord } from '../../data/foundation/accounts';
import { addDays, formatCalendarDate, formatRelativeDate, getTodayKey, isCalendarDate, type CalendarDate, type RecurrenceType } from '../../data/foundation/dates';
import type { EarningsSourceKind, JurnlDailyEarnings, TipsMode } from '../../data/foundation/dailyEarnings';
import type { JurnlObligation, ObligationKind } from '../../data/foundation/obligations';
import { formatMoney, useCurrency, useRepoTick } from '../../data/home/money';
import { accountNature, BALANCE_BASIS_LABEL, LOCATION_KIND_LABEL, computeLedgerPositions, type AccountPosition } from '../../data/ledger/accounting';
import { parseMoneyInput, recordExpense, recordTransfer, recordTransferStep, type OpResult } from '../../data/ledger/ledgerOps';
import { allowedActions, transferViews, CARD_PAYMENT_STATE_LABEL, TRANSFER_ACTION_LABEL, TRANSFER_STATE_LABEL, type TransferAction, type TransferStart, type TransferState } from '../../data/ledger/transferSettlement';
import { ledgerPositions, setPurposeAccount, suggestAccount, purposeAccounts } from '../../data/ledger/moneyPositions';
import { PURPOSE_LABEL, PURPOSE_ORDER, SPENDING_CATEGORY_CHOICES, accountFitsPurpose, type MoneyPurpose } from '../../data/ledger/purposes';
import { EARNINGS_SOURCE_PRESETS, deleteDailyEarnings, earningsBreakdown, saveDailyEarnings } from '../../data/f06/dailyEarnings';
import {
  CADENCE_LABEL,
  createBillOrSubscription,
  editBillOrSubscription,
  markObligationPaid,
  obligationFunding,
  paymentsFor,
  rescheduleObligationOccurrence,
  setObligationStatus,
  skipObligationOccurrence,
  undoObligationPayment,
} from '../../data/f07/obligationLifecycle';
import { buildReduceReservation, buildReleaseReservations, buildSetAside, reservationsFor, type ReservationTarget } from '../../data/f07/reservations';
import { applyOp } from '../../data/ledger/ledgerOps';
import { getRepository } from '../../data/repository/deviceRepository';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { useJurnl } from '../state/store';
import { EdAction, EdChoices, EditorialOverlay, type EdPlate } from '../surfaces/editorial/Editorial';
import { PocketPick } from '../surfaces/editorial/MoneyOverlays';
import { respond, type ResponseName } from '../motion/materials';
import { useStateResponse } from '../motion/useMotion';

// ─── Small shared pieces ─────────────────────────────────────────────────────

export function money(n: number): string {
  return formatMoney(n);
}

function positionsNow(): AccountPosition[] {
  return ledgerPositions().positions;
}

export function positionLine(p: AccountPosition): string {
  const amount = p.nature === 'LIABILITY' ? `${money(p.owed)} OWED` : `${money(p.held)}`;
  return `${LOCATION_KIND_LABEL[p.kind]} · ${amount}`;
}

export function basisLine(p: AccountPosition, today: CalendarDate = getTodayKey()): string {
  const when = p.updatedOn ? `UPDATED ${formatRelativeDate(p.updatedOn, today)}` : 'NOT UPDATED YET';
  return `${BALANCE_BASIS_LABEL[p.basis]} · ${when}`;
}

/** Choice chips. Toggle buttons in a labelled group (aria-pressed), the existing JURNL chip pattern. */
export function Chips<T extends string>({ label, value, options, onChange, trigger }: { label: string; value: T | null; options: { id: T; label: string }[]; onChange: (v: T) => void; trigger: string }) {
  return (
    <div className="jrn-home__choices" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={value === o.id} data-active={value === o.id ? 'true' : 'false'} data-jrn-trigger={`${trigger}-${o.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AccountChips({ label, value, onChange, trigger, filter }: { label: string; value: string | null; onChange: (id: string) => void; trigger: string; filter?: (a: JurnlAccountRecord) => boolean }) {
  const options = getRepository()
    .listAccounts()
    .filter((a) => a.status === 'ACTIVE' && (filter ? filter(a) : true))
    .map((a) => ({ id: a.account_id, label: a.display_name }));
  if (!options.length) return <p className="jrn-currency__note" role="note">NO MATCHING ACCOUNT YET. ADD ONE IN MONEY → POCKETS.</p>;
  return (
    <>
      <p className="jrn-eyebrow">{label}</p>
      <Chips label={label} value={value} options={options} onChange={onChange} trigger={trigger} />
    </>
  );
}

function Facts({ rows, testId }: { rows: [string, ReactNode][]; testId?: string }) {
  return (
    <ul className="jrn-why" data-testid={testId}>
      {rows.map(([k, v]) => (
        <li key={k}>
          <span>{k}</span>
          <b>{v}</b>
        </li>
      ))}
    </ul>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  // a refusal appears: one brief, local nudge of the line itself (never a figure)
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (error) respond(ref.current, 'errorNudge');
  }, [error]);
  return error ? <p ref={ref} className="jrn-field__error" role="alert">{error}</p> : null;
}

/**
 * The transfer's recorded state, answered once when it changes (never on open): ARRIVED settles the status line; a
 * failure, a return, a reversal or a record that needs reconciling settles it calmly once. Recorded, scheduled, pending
 * and in transit get no motion: nothing has finished, and JURNL invents no progress.
 */
export function transferStateResponse(prev: TransferState, next: TransferState): ResponseName | null {
  if (prev === next) return null;
  if (next === 'COMPLETED') return 'paperSettle';
  if (next === 'FAILED' || next === 'RETURNING' || next === 'REVERSED' || next === 'NEEDS_RECONCILIATION') return 'warningSettle';
  return null;
}

function useResult() {
  const [error, setError] = useState<string | null>(null);
  const run = <T,>(r: OpResult<T>, onOk: (v: T) => void) => {
    if (r.ok) {
      setError(null);
      onOk(r.value);
    } else setError(r.error);
  };
  return { error, setError, run };
}

const assetOnly = (a: JurnlAccountRecord) => accountNature(a.account_type) === 'ASSET';

// ─── F06 Daily earnings ──────────────────────────────────────────────────────

export function DailyEarningsSheet({ existing, onClose, onSaved }: { existing?: JurnlDailyEarnings | null; onClose: () => void; onSaved?: (r: JurnlDailyEarnings) => void }) {
  useCurrency();
  useRepoTick();
  const today = getTodayKey();
  const [workDate, setWorkDate] = useState<string>(existing?.work_date ?? today);
  const [source, setSource] = useState(existing?.income_source ?? 'UBER');
  const [kind, setKind] = useState<EarningsSourceKind>(existing?.source_kind ?? 'RIDESHARE');
  const [mode, setMode] = useState<TipsMode>(existing?.tips_mode ?? 'INCLUDED');
  const [digital, setDigital] = useState(existing ? String(existing.digital_earnings) : '');
  const [dTips, setDTips] = useState(existing ? String(existing.digital_tips) : '');
  const [cTips, setCTips] = useState(existing ? String(existing.cash_tips) : '');
  const [digitalAcct, setDigitalAcct] = useState<string | null>(existing?.digital_account_id ?? suggestAccount('RIDESHARE_EARNINGS').account?.account_id ?? null);
  const [cashAcct, setCashAcct] = useState<string | null>(existing?.cash_account_id ?? suggestAccount('CASH_TIPS').account?.account_id ?? null);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const { error, run } = useResult();
  const d = parseMoneyInput(digital, true);
  const dt = parseMoneyInput(dTips, true);
  const ct = parseMoneyInput(cTips, true);
  const amountsValid = d != null && dt != null && ct != null;
  const b = earningsBreakdown({ tips_mode: mode, digital_earnings: d ?? 0, digital_tips: dt ?? 0, cash_tips: ct ?? 0 });
  const save = () => {
    if (!amountsValid) return;
    run(
      saveDailyEarnings(
        { work_date: workDate.trim() as CalendarDate, income_source: source, source_kind: kind, tips_mode: mode, digital_earnings: d!, digital_tips: dt!, cash_tips: ct!, digital_account_id: digitalAcct, cash_account_id: cashAcct, notes },
        existing?.earnings_id,
      ),
      (r) => onSaved?.(r),
    );
  };
  return (
    <JurnlDrawer
      expression="form"
      size="long"
      testId="earnings-sheet"
      title={existing ? 'EDIT DAILY EARNINGS' : 'ADD DAILY EARNINGS'}
      lead="ONE ENTRY AT THE END OF THE DAY. MONEY RECEIVED INSTANTLY IS ADDED NOW."
      onClose={onClose}
      footer={
        <>
          <ErrorLine error={amountsValid ? error : 'AMOUNTS USE NUMBERS LIKE 125.50.'} />
          <JurnlButton trigger="earnings-save" disabled={!amountsValid || b.totalEarned <= 0} onClick={save}>
            {existing ? 'SAVE CHANGES' : 'SAVE EARNINGS'}
          </JurnlButton>
        </>
      }
    >
      <JurnlInput label="WORK DATE (YYYY-MM-DD)" value={workDate} onValue={setWorkDate} trigger="earnings-date" inputMode="numeric" />
      <Chips label="WORK DATE" value={workDate === today ? 'TODAY' : workDate === addDays(today, -1) ? 'YESTERDAY' : null} options={[{ id: 'TODAY', label: 'TODAY' }, { id: 'YESTERDAY', label: 'YESTERDAY' }]} onChange={(v) => setWorkDate(v === 'TODAY' ? today : addDays(today, -1))} trigger="earnings-day" />
      <p className="jrn-eyebrow">INCOME SOURCE</p>
      <Chips
        label="INCOME SOURCE"
        value={EARNINGS_SOURCE_PRESETS.some((p) => p.label === source) ? source : null}
        options={EARNINGS_SOURCE_PRESETS.map((p) => ({ id: p.label, label: p.label }))}
        onChange={(v) => {
          setSource(v);
          setKind(EARNINGS_SOURCE_PRESETS.find((p) => p.label === v)?.kind ?? 'OTHER');
        }}
        trigger="earnings-source"
      />
      <JurnlInput label="OR TYPE A SOURCE" value={source} onValue={setSource} trigger="earnings-source-name" />
      <p className="jrn-eyebrow">DO YOUR DIGITAL EARNINGS ALREADY INCLUDE TIPS?</p>
      <Chips
        label="TIPS"
        value={mode}
        options={[
          { id: 'INCLUDED', label: 'YES, TIPS INCLUDED' },
          { id: 'SEPARATE', label: 'NO, TIPS ARE SEPARATE' },
        ]}
        onChange={setMode}
        trigger="earnings-mode"
      />
      <JurnlInput label={mode === 'INCLUDED' ? 'DIGITAL EARNINGS (WITH TIPS)' : 'DIGITAL EARNINGS (WITHOUT TIPS)'} value={digital} onValue={setDigital} trigger="earnings-digital" inputMode="decimal" />
      <JurnlInput label={mode === 'INCLUDED' ? 'DIGITAL TIPS (ALREADY INSIDE THE NUMBER ABOVE)' : 'DIGITAL TIPS'} value={dTips} onValue={setDTips} trigger="earnings-digital-tips" inputMode="decimal" />
      <JurnlInput label="CASH TIPS" value={cTips} onValue={setCTips} trigger="earnings-cash-tips" inputMode="decimal" />
      <AccountChips label="DIGITAL MONEY WENT TO" value={digitalAcct} onChange={setDigitalAcct} trigger="earnings-digital-account" filter={assetOnly} />
      <AccountChips label="CASH IS KEPT IN" value={cashAcct} onChange={setCashAcct} trigger="earnings-cash-account" filter={assetOnly} />
      <JurnlInput label="NOTES (OPTIONAL)" value={notes} onValue={setNotes} trigger="earnings-notes" />
      <Facts
        testId="earnings-totals"
        rows={[
          ['TOTAL EARNED', money(b.totalEarned)],
          ['DIGITAL MONEY RECEIVED', money(b.digitalReceived)],
          ['CASH MONEY RECEIVED', money(b.cashReceived)],
        ]}
      />
      <p className="jrn-currency__note">TIPS ARE COUNTED ONCE. NO PAYOUT IS LEFT PENDING. YOU CAN EDIT OR REMOVE THIS DAY LATER.</p>
    </JurnlDrawer>
  );
}

export function EarningsDetailSheet({ record, onClose, onEdit }: { record: JurnlDailyEarnings; onClose: () => void; onEdit: () => void }) {
  useCurrency();
  const [confirm, setConfirm] = useState(false);
  const { showToast } = useJurnl();
  const b = earningsBreakdown(record);
  const name = (id: string | null) => getRepository().listAccounts().find((a) => a.account_id === id)?.display_name ?? '—';
  if (confirm) {
    return (
      <JurnlDrawer
        expression="confirmation"
        size="short"
        testId="earnings-delete"
        title="REMOVE THIS DAY?"
        lead={`${money(b.totalEarned)} COMES OFF ${[record.digital_account_id && name(record.digital_account_id), record.cash_account_id && name(record.cash_account_id)].filter(Boolean).join(' AND ')}. THE RECORD STAYS IN HISTORY AS REMOVED.`}
        onClose={() => setConfirm(false)}
        footer={
          <>
            <JurnlButton trigger="earnings-delete-confirm" onClick={() => { const r = deleteDailyEarnings(record.earnings_id); if (r.ok) { showToast({ tone: 'success', title: 'DAY REMOVED', body: `${record.income_source} · ${formatCalendarDate(record.work_date)}` }); onClose(); } }}>
              REMOVE
            </JurnlButton>
            <JurnlButton variant="secondary" trigger="earnings-delete-cancel" onClick={() => setConfirm(false)}>KEEP</JurnlButton>
          </>
        }
      />
    );
  }
  return (
    <JurnlDrawer
      expression="detail"
      size="long"
      testId="earnings-detail"
      title={`${record.income_source} · ${formatCalendarDate(record.work_date)}`}
      lead="ONE DAY'S EARNINGS. THE MOVEMENTS BELOW ARE ITS ONLY ENTRIES IN ACTIVITY."
      onClose={onClose}
      footer={
        <>
          <JurnlButton variant="secondary" trigger="earnings-edit" onClick={onEdit}>EDIT</JurnlButton>
          <JurnlButton variant="secondary" trigger="earnings-remove" onClick={() => setConfirm(true)}>REMOVE</JurnlButton>
        </>
      }
    >
      <Facts
        rows={[
          ['TOTAL EARNED', money(b.totalEarned)],
          ['DIGITAL MONEY RECEIVED', `${money(b.digitalReceived)} → ${name(record.digital_account_id)}`],
          ['CASH MONEY RECEIVED', `${money(b.cashReceived)} → ${name(record.cash_account_id)}`],
          ['TIPS', `${money(record.digital_tips)} DIGITAL · ${money(record.cash_tips)} CASH`],
          ['TIPS IN DIGITAL EARNINGS', record.tips_mode === 'INCLUDED' ? 'ALREADY INCLUDED' : 'ADDED SEPARATELY'],
          ...(record.notes ? ([['NOTES', record.notes]] as [string, string][]) : []),
          ['HISTORY', record.revisions.map((r) => r.action).join(' → ')],
        ]}
      />
    </JurnlDrawer>
  );
}

/** Optional next steps after a day is saved. Nothing here moves money on its own. */
export function AfterEarningsSheet({ record, onClose }: { record: JurnlDailyEarnings; onClose: () => void }) {
  useCurrency();
  const { go } = useJurnl();
  const b = earningsBreakdown(record);
  const digitalName = getRepository().listAccounts().find((a) => a.account_id === record.digital_account_id)?.display_name;
  return (
    <JurnlDrawer
      expression="confirmation"
      size="long"
      testId="earnings-next"
      title="EARNINGS SAVED"
      lead={`${money(b.totalEarned)} EARNED. ${b.digitalReceived > 0 && digitalName ? `${money(b.digitalReceived)} ADDED TO ${digitalName}. ` : ''}${b.cashReceived > 0 ? `${money(b.cashReceived)} ADDED TO CASH.` : ''}`}
      onClose={onClose}
      footer={<JurnlButton variant="secondary" trigger="earnings-next-done" onClick={onClose}>DONE FOR TODAY</JurnlButton>}
    >
      <p className="jrn-currency__note">OPTIONAL. NOTHING MOVES UNTIL YOU CHOOSE IT.</p>
      <JurnlButton variant="secondary" trigger="earnings-next-bill" onClick={() => { onClose(); go('upcoming'); }}>SET MONEY ASIDE FOR A BILL</JurnlButton>
      <JurnlButton variant="secondary" trigger="earnings-next-card" onClick={() => { onClose(); go('credit'); }}>PLAN A CREDIT CARD PAYMENT</JurnlButton>
      <JurnlButton variant="secondary" trigger="earnings-next-transfer" onClick={() => { onClose(); go('money/places', { move: record.digital_account_id ?? '' }); }}>MOVE MONEY TO THE BANK</JurnlButton>
      <JurnlButton variant="secondary" trigger="earnings-next-savings" onClick={() => { onClose(); go('goals'); }}>PUT MONEY TOWARD SAVINGS</JurnlButton>
      <JurnlButton variant="secondary" trigger="earnings-next-safe" onClick={() => { onClose(); go('safe'); }}>SEE WHAT IS AVAILABLE</JurnlButton>
    </JurnlDrawer>
  );
}

// ─── F05 Transfers ───────────────────────────────────────────────────────────

export function startOptions(fromName: string, toCard: boolean): { id: TransferStart; label: string }[] {
  return toCard ?
      [
        { id: 'COMPLETED', label: 'CARD CONFIRMED IT' },
        { id: 'IN_TRANSIT', label: `PAID FROM ${fromName} · CARD NOT CONFIRMED` },
        { id: 'PENDING', label: `SUBMITTED · NOT TAKEN FROM ${fromName} YET` },
        { id: 'SCHEDULED', label: 'SCHEDULED FOR LATER' },
      ]
    : [
        { id: 'COMPLETED', label: 'ARRIVED' },
        { id: 'IN_TRANSIT', label: `LEFT ${fromName} · NOT ARRIVED YET` },
        { id: 'PENDING', label: 'STARTED · PENDING' },
        { id: 'SCHEDULED', label: 'PLANNED FOR LATER' },
      ];
}

/** OV03 regions on the regenerated shell (941 × 1672): headline above the seal, FROM / TO / ledger below it, actions left of the coins. */
export const OV03_PLATE = {
  art: 'OV03_MOVE_MONEY_SHELL',
  head: [0.06, 0.232, 0.94, 0.366],
  body: [0.1, 0.56, 0.9, 0.795],
  /** the full width of the paper, above the coins (x > 0.65 from y 0.87) */
  foot: [0.08, 0.8, 0.92, 0.866],
} as const satisfies EdPlate;

export function TransferSheet({ fromId, toId, onClose }: { fromId?: string | null; toId?: string | null; onClose: () => void }) {
  useCurrency();
  useRepoTick();
  const { showToast } = useJurnl();
  const today = getTodayKey();
  const [from, setFrom] = useState<string | null>(fromId ?? suggestAccount('CARD_PAYMENTS').account?.account_id ?? null);
  const [to, setTo] = useState<string | null>(toId ?? suggestAccount('BILLS').account?.account_id ?? null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<string>(today);
  const [start, setStart] = useState<TransferStart>('COMPLETED');
  const [memo, setMemo] = useState('');
  const [allowDup, setAllowDup] = useState(false);
  const { error, run } = useResult();
  const value = parseMoneyInput(amount);
  const fromPos = positionsNow().find((p) => p.account_id === from);
  const toAccount = getRepository().listAccounts().find((a) => a.account_id === to);
  const toCard = toAccount ? accountNature(toAccount.account_type) === 'LIABILITY' : false;
  const fromName = fromPos?.account.display_name ?? 'THE ACCOUNT';
  const effect: Record<TransferStart, string> = {
    COMPLETED: `${fromName} GOES DOWN AND ${toAccount?.display_name ?? 'THE OTHER ACCOUNT'} ${toCard ? 'OWES LESS' : 'GOES UP'} NOW.`,
    IN_TRANSIT: `${fromName} GOES DOWN NOW. ${toAccount?.display_name ?? 'THE OTHER ACCOUNT'} ${toCard ? 'STILL OWES THE SAME' : 'DOES NOT GO UP'} UNTIL YOU MARK IT ARRIVED. THE MONEY SHOWS AS IN TRANSIT.`,
    PENDING: 'NO BALANCE CHANGES YET. MARK WHEN THE MONEY LEAVES AND WHEN IT ARRIVES.',
    SCHEDULED: 'NO BALANCE CHANGES. MARK IT WHEN IT HAPPENS.',
  };
  const accounts = getRepository().listAccounts().filter((a) => a.status === 'ACTIVE');
  const position = (a: JurnlAccountRecord) => {
    const p = positionsNow().find((x) => x.account_id === a.account_id);
    return p ? (p.nature === 'LIABILITY' ? `${money(p.owed)} OWED` : money(p.held)) : '';
  };
  const save = () =>
    run(recordTransfer({ from_account_id: from, to_account_id: to, amount: value ?? 0, occurred_on: date.trim() as CalendarDate, start, memo, allowDuplicate: allowDup }), (v) => {
      showToast({ tone: 'success', title: v.kind === 'CARD_PAYMENT' ? 'CARD PAYMENT RECORDED' : 'TRANSFER RECORDED', body: `${money(value ?? 0)} · ${(v.kind === 'CARD_PAYMENT' ? CARD_PAYMENT_STATE_LABEL : TRANSFER_STATE_LABEL)[start]} · RECORDED BY YOU, NOT CONFIRMED BY A BANK.`, testId: 'transfer-result' });
      onClose();
    });
  // founder OV03 shell (regenerated, named correct 2026-11-06): the paper with its twine and direction seal is the shell's;
  // the headline and the honesty note sit above the seal, FROM / TO and the ledger below it. JURNL records it; it moves nothing.
  return (
    <EditorialOverlay
      testId="transfer-sheet"
      composition="transfer"
      title={toCard ? ['PAY A CARD'] : ['MOVE MONEY']}
      script={toCard ? 'record a card payment' : 'transfer between your pockets'}
      onClose={onClose}
      plate={OV03_PLATE}
      headNote={
        <>
          BETWEEN YOUR OWN ACCOUNTS. NOT INCOME OR SPENDING.
          <br />
          JURNL RECORDS IT; IT DOES NOT MOVE REAL MONEY.
        </>
      }
      footer={
        <>
          <ErrorLine error={error} />
          {error && /ALREADY RECORDED/.test(error) ? (
            <EdAction trigger="transfer-allow-duplicate" material="cream" title={allowDup ? 'IT HAPPENED TWICE ✓' : 'IT HAPPENED TWICE'} onClick={() => setAllowDup(true)} className="jed-action--wide" />
          ) : null}
          <EdAction trigger="transfer-cancel" material="cream" paper="B05-MOVE-CANCEL" title="CANCEL" onClick={onClose} />
          <EdAction trigger="transfer-save" material="olive" paper="B05-RECORD-TRANSFER" title={toCard ? 'RECORD CARD PAYMENT' : 'RECORD TRANSFER'} disabled={value == null || !isCalendarDate(date.trim())} onClick={save} />
        </>
      }
    >
 {/* the direction seal is the shell's own (between the headline and FROM): no second seal is drawn */}
      <PocketPick dir="FROM" accountId={from} options={accounts.filter(assetOnly)} figure={position} onChange={setFrom} trigger="transfer-from" />
      <PocketPick dir="TO" accountId={to} options={accounts.filter((a) => a.account_id !== from)} figure={position} onChange={setTo} trigger="transfer-to" />
      <div className="jed-sheet" style={{ marginTop: 10 }}>
        <div className="jed-ledger">
          <div className="jed-field"><JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="transfer-amount" inputMode="decimal" /></div>
          <div className="jed-field"><JurnlInput label="DATE (YYYY-MM-DD)" value={date} onValue={setDate} trigger="transfer-date" inputMode="numeric" /></div>
        </div>
        <span className="jed-label">WHERE IS THE MONEY NOW?</span>
        <EdChoices label="WHERE IS THE MONEY NOW" value={start} options={startOptions(fromName, toCard)} onChange={setStart} trigger="transfer-status" />
        <p className="jed-note" data-testid="transfer-effect">{effect[start]}</p>
        <div className="jed-field" style={{ marginTop: 8 }}><JurnlInput label="NOTE (OPTIONAL)" value={memo} onValue={setMemo} trigger="transfer-memo" /></div>
        {toCard ? <p className="jed-note">PAYING A CARD LOWERS WHAT IT OWES. IT IS NOT A SECOND PURCHASE.</p> : null}
      </div>
    </EditorialOverlay>
  );
}

/** One transfer or card payment: where the money is, its history, and the steps that are valid from here. */
export function TransferDetailSheet({ linkId, onClose }: { linkId: string; onClose: () => void }) {
  useCurrency();
  useRepoTick();
  const { showToast } = useJurnl();
  const today = getTodayKey();
  const [askReturned, setAskReturned] = useState(false);
  const { error, run } = useResult();
  const v = transferViews(getRepository().listTransactions(), today).find((x) => x.linkId === linkId);
  const statusRow = useRef<HTMLLIElement>(null);
  useStateResponse<TransferState | null>(v?.state ?? null, statusRow, (p, n) => (p && n ? transferStateResponse(p, n) : null));
  if (!v) return null;
  const name = (id: string | null) => getRepository().listAccounts().find((a) => a.account_id === id)?.display_name ?? '—';
  const labels = v.kind === 'CARD_PAYMENT' ? CARD_PAYMENT_STATE_LABEL : TRANSFER_STATE_LABEL;
  const step = (action: TransferAction, opts: { returned?: boolean } = {}) => {
    const r = recordTransferStep(linkId, action, opts);
    if (!r.ok) return run(r as OpResult<TransferState>, () => undefined);
    setAskReturned(false);
    showToast({ tone: 'success', title: r.changed ? labels[r.value] : 'ALREADY RECORDED', body: r.changed ? `${money(v.amount)} · ${name(v.fromId)} → ${name(v.toId)}` : 'NOTHING CHANGED.', testId: 'transfer-step-result' });
  };
  const actions = allowedActions(v.state);
  const where: Record<TransferState, string> = {
    SCHEDULED: `PLANNED. ${name(v.fromId)} AND ${name(v.toId)} ARE UNCHANGED.`,
    PENDING: `STARTED. PENDING AT ${name(v.fromId)}.`,
    IN_TRANSIT: `${money(v.amount)} LEFT ${name(v.fromId)} AND HAS NOT REACHED ${name(v.toId)}. IT IS NOT AVAILABLE IN EITHER ACCOUNT.`,
    COMPLETED: `${money(v.amount)} LEFT ${name(v.fromId)} AND ARRIVED IN ${name(v.toId)}.`,
    CANCELLED: 'CANCELLED. NO MONEY MOVED.',
    FAILED: `FAILED. ${name(v.fromId)} HAS THE MONEY.`,
    RETURNING: `FAILED AFTER LEAVING ${name(v.fromId)}. ${money(v.amount)} IS ON ITS WAY BACK.`,
    REVERSED: `REVERSED. THE MONEY IS BACK IN ${name(v.fromId)}.`,
    NEEDS_RECONCILIATION: 'RECORDED BEFORE JURNL TRACKED WHERE MONEY IS. SAY WHAT HAPPENED; UNTIL THEN NEITHER ACCOUNT CHANGES.',
  };
  return (
    <JurnlDrawer
      expression="detail"
      size="long"
      testId="transfer-detail"
      title={v.kind === 'CARD_PAYMENT' ? `PAYMENT TO ${name(v.toId)}` : `${name(v.fromId)} → ${name(v.toId)}`}
      lead={where[v.state]}
      onClose={onClose}
      footer={
        <>
          <ErrorLine error={error} />
          {askReturned ? (
            <>
              <p className="jrn-currency__note">DID THE MONEY COME BACK TO {name(v.fromId)}?</p>
              <JurnlButton variant="secondary" trigger="transfer-fail-returned" onClick={() => step('FAIL', { returned: true })}>YES, IT IS BACK</JurnlButton>
              <JurnlButton variant="secondary" trigger="transfer-fail-not-returned" onClick={() => step('FAIL')}>NOT YET</JurnlButton>
            </>
          ) : (
            actions.map((a) => (
              <JurnlButton key={a} variant={a === 'RECEIVED' ? 'primary' : 'secondary'} trigger={`transfer-step-${a.toLowerCase().replace(/_/g, '-')}`} onClick={() => (a === 'FAIL' && v.state === 'IN_TRANSIT' ? setAskReturned(true) : step(a))}>
                {v.kind === 'CARD_PAYMENT' && a === 'RECEIVED' ? 'CARD CONFIRMED IT' : TRANSFER_ACTION_LABEL[a]}
              </JurnlButton>
            ))
          )}
        </>
      }
    >
      <ul className="jrn-why" data-testid="transfer-detail-facts" data-state={v.state}>
        <li ref={statusRow} data-testid="transfer-detail-status"><span>STATUS</span><b>{labels[v.state]}</b></li>
        <li><span>AMOUNT</span><b>{money(v.amount)}</b></li>
        <li><span>FROM</span><b>{name(v.fromId)}</b></li>
        <li><span>TO</span><b>{name(v.toId)}</b></li>
        <li><span>DATE</span><b>{v.date ? formatCalendarDate(v.date) : '—'}</b></li>
        <li><span>RECORDED</span><b>BY YOU · NOT CONFIRMED BY A BANK</b></li>
      </ul>
      {v.history.length ? (
        <>
          <p className="jrn-eyebrow">HISTORY</p>
          <ul className="jrn-why">
            {v.history.map((h, i) => (
              <li key={`${h.at}-${i}`}><span>{formatCalendarDate(h.at.slice(0, 10) as CalendarDate)}</span><b>{h.action === 'RECORDED' ? 'RECORDED' : TRANSFER_ACTION_LABEL[h.action as TransferAction] ?? h.action}</b></li>
            ))}
          </ul>
        </>
      ) : null}
    </JurnlDrawer>
  );
}

/** Transfers and card payments that are not finished: in transit, not sent yet, or needing confirmation. */
export function OpenTransfersPanel({ onOpen, accountId }: { onOpen: (linkId: string) => void; accountId?: string }) {
  useCurrency();
  useRepoTick();
  const today = getTodayKey();
  const name = (id: string | null) => getRepository().listAccounts().find((a) => a.account_id === id)?.display_name ?? '—';
  const open = transferViews(getRepository().listTransactions(), today).filter(
    (v) => (v.state === 'IN_TRANSIT' || v.state === 'RETURNING' || v.state === 'PENDING' || v.state === 'SCHEDULED' || v.state === 'NEEDS_RECONCILIATION') && (!accountId || v.fromId === accountId || v.toId === accountId),
  );
  if (!open.length) return null;
  return (
    <JurnlPanel role="detail" className="jrn-home__panel" data-testid="open-transfers">
      <b>NOT FINISHED</b>
      {open.map((v) => (
        <button key={v.linkId} type="button" className="jrn-btn jrn-btn--inline" data-jrn-trigger={`open-transfer-${v.linkId}`} onClick={() => onOpen(v.linkId)}>
          {`${(v.kind === 'CARD_PAYMENT' ? CARD_PAYMENT_STATE_LABEL : TRANSFER_STATE_LABEL)[v.state]} · ${money(v.amount)} · ${name(v.fromId)} → ${name(v.toId)}`}
        </button>
      ))}
    </JurnlPanel>
  );
}

// ─── F05 Usual accounts (purpose preferences) ────────────────────────────────

export function PurposeSheet({ onClose }: { onClose: () => void }) {
  useRepoTick();
  const [editing, setEditing] = useState<MoneyPurpose | null>(null);
  const accounts = getRepository().listAccounts().filter((a) => a.status === 'ACTIVE');
  const chosen = purposeAccounts();
  if (editing) {
    return (
      <JurnlDrawer expression="form" size="long" testId="purpose-edit" title={`USUAL ACCOUNT · ${PURPOSE_LABEL[editing]}`} lead="A PREFERENCE. YOU CAN STILL PICK ANY ACCOUNT EACH TIME." onClose={() => setEditing(null)}
        footer={<JurnlButton variant="secondary" trigger="purpose-reset" onClick={() => { setPurposeAccount(editing, null); setEditing(null); }}>USE THE DEFAULT</JurnlButton>}>
        <AccountChips label="USUALLY FROM" value={chosen[editing] ?? null} onChange={(id) => { setPurposeAccount(editing, id); setEditing(null); }} trigger="purpose-account" filter={(a) => accountFitsPurpose(a, editing)} />
      </JurnlDrawer>
    );
  }
  return (
    <JurnlDrawer expression="detail" size="long" testId="purpose-sheet" title="USUAL ACCOUNTS" lead="WHICH ACCOUNT JURNL SUGGESTS FOR EACH KIND OF MONEY. NEVER A RULE." onClose={onClose}>
      {accounts.length === 0 ? <p className="jrn-currency__note">ADD AN ACCOUNT FIRST.</p> : null}
      <ul className="jrn-why">
        {PURPOSE_ORDER.map((p) => {
          const s = suggestAccount(p);
          return (
            <li key={p}>
              <button type="button" className="jrn-btn jrn-btn--inline" data-jrn-trigger={`purpose-${p.toLowerCase()}`} onClick={() => setEditing(p)}>{PURPOSE_LABEL[p]}</button>
              <b>{s.account ? `${s.account.display_name}${s.status === 'CHOSEN' ? ' · YOUR CHOICE' : ''}` : 'NOT SET'}</b>
              {s.status === 'MISSING' ? <small>{s.reason}</small> : null}
            </li>
          );
        })}
      </ul>
    </JurnlDrawer>
  );
}

// ─── F04 Record spending ─────────────────────────────────────────────────────

export function SpendingSheet({ onClose }: { onClose: () => void }) {
  useCurrency();
  useRepoTick();
  const { showToast } = useJurnl();
  const today = getTodayKey();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('GROCERIES');
  const [touched, setTouched] = useState(false);
  const purpose = SPENDING_CATEGORY_CHOICES.find((c) => c.id === category)?.purpose ?? 'MISC';
  const suggestion = suggestAccount(purpose);
  const [account, setAccount] = useState<string | null>(suggestion.account?.account_id ?? null);
  const shownAccount = touched ? account : suggestion.account?.account_id ?? account;
  const [date, setDate] = useState<string>(today);
  const { error, run } = useResult();
  const value = parseMoneyInput(amount);
  const acct = getRepository().listAccounts().find((a) => a.account_id === shownAccount);
  const isCard = acct ? accountNature(acct.account_type) === 'LIABILITY' : false;
  return (
    <JurnlDrawer
      expression="form"
      size="long"
      testId="spend-sheet"
      title="RECORD SPENDING"
      lead="WHAT YOU BOUGHT AND WHICH ACCOUNT PAID."
      onClose={onClose}
      footer={
        <>
          <ErrorLine error={error} />
          <JurnlButton trigger="spend-save" disabled={value == null || !merchant.trim()} onClick={() => run(recordExpense({ merchant, amount: value ?? 0, account_id: shownAccount, category, occurred_on: (isCalendarDate(date.trim()) ? date.trim() : today) as CalendarDate }), () => {
            showToast({ tone: 'success', title: isCard ? 'CARD PURCHASE RECORDED' : 'SPENDING RECORDED', body: isCard ? `${acct?.display_name} NOW OWES ${money(value ?? 0)} MORE.` : `${money(value ?? 0)} FROM ${acct?.display_name}.` });
            onClose();
          })}>
            SAVE SPENDING
          </JurnlButton>
        </>
      }
    >
      <JurnlInput label="WHAT WAS IT FOR?" value={merchant} onValue={setMerchant} trigger="spend-merchant" />
      <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="spend-amount" inputMode="decimal" />
      <p className="jrn-eyebrow">CATEGORY</p>
      <Chips label="CATEGORY" value={category} options={SPENDING_CATEGORY_CHOICES.map((c) => ({ id: c.id, label: c.label }))} onChange={(v) => setCategory(v)} trigger="spend-category" />
      <p className="jrn-currency__note" data-testid="spend-suggestion">{suggestion.reason}</p>
      <AccountChips label="PAID WITH" value={shownAccount} onChange={(id) => { setTouched(true); setAccount(id); }} trigger="spend-account" />
      <JurnlInput label="DATE (YYYY-MM-DD)" value={date} onValue={setDate} trigger="spend-date" inputMode="numeric" />
      {isCard ? <p className="jrn-currency__note">A CARD PURCHASE ADDS TO WHAT THE CARD OWES. NO CASH OR BANK MONEY LEAVES TODAY.</p> : null}
    </JurnlDrawer>
  );
}

// ─── F07 Bills and subscriptions ─────────────────────────────────────────────

const CADENCE_CHOICES: RecurrenceType[] = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'NONE'];

export function ObligationFormSheet({ existing, defaultKind = 'BILL', onClose, onSaved }: { existing?: JurnlObligation | null; defaultKind?: ObligationKind; onClose: () => void; onSaved?: (o: JurnlObligation) => void }) {
  useCurrency();
  const { showToast } = useJurnl();
  const today = getTodayKey();
  const [kind, setKind] = useState<ObligationKind>(existing?.kind ?? defaultKind);
  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [cadence, setCadence] = useState<RecurrenceType>(existing?.cadence ?? 'MONTHLY');
  const [due, setDue] = useState<string>(existing?.next_due_date ?? today);
  const [category, setCategory] = useState(existing?.category ?? '');
  const [trial, setTrial] = useState(existing?.trial_end_date ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const suggested = suggestAccount(kind === 'SUBSCRIPTION' ? 'SUBSCRIPTIONS' : 'BILLS');
  const [account, setAccount] = useState<string | null>(existing ? existing.account_id : suggested.account?.account_id ?? null);
  const [card, setCard] = useState<string | null>(existing?.linked_card_account_id ?? null);
  const cards = getRepository().listAccounts().filter((a) => a.status === 'ACTIVE' && accountNature(a.account_type) === 'LIABILITY');
  const { error, run } = useResult();
  const value = parseMoneyInput(amount, true);
  const save = () => {
    if (value == null) return;
    const input = { name, amount: value, cadence, next_due_date: due.trim() as CalendarDate, kind, account_id: account, category, trial_end_date: trial.trim() ? (trial.trim() as CalendarDate) : null, notes, linked_card_account_id: kind === 'BILL' ? card : null };
    run(existing ? editBillOrSubscription(existing, input) : createBillOrSubscription(input), (o) => {
      // The new row already shows the name; the toast states amount and date only (no duplicate label on screen).
      showToast({ tone: 'success', title: existing ? 'SAVED' : kind === 'SUBSCRIPTION' ? 'SUBSCRIPTION ADDED' : 'BILL ADDED', body: `${money(o.amount)} · DUE ${formatCalendarDate(o.next_due_date)}` });
      onSaved?.(o);
      onClose();
    });
  };
  return (
    <JurnlDrawer
      expression="form"
      size="long"
      testId={existing ? 'upcoming-edit-sheet' : 'upcoming-add-sheet'}
      title={existing ? `EDIT ${existing.kind === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'BILL'}` : 'ADD A BILL OR SUBSCRIPTION'}
      onClose={onClose}
      footer={
        <>
          <ErrorLine error={value == null && amount ? 'AMOUNTS USE NUMBERS LIKE 17.99.' : error} />
          <JurnlButton trigger={existing ? 'upcoming-edit-save' : 'upcoming-add-save'} disabled={!name.trim() || value == null || !amount.trim()} onClick={save}>SAVE</JurnlButton>
        </>
      }
    >
      <Chips label="KIND" value={kind} options={[{ id: 'BILL', label: 'BILL' }, { id: 'SUBSCRIPTION', label: 'SUBSCRIPTION' }]} onChange={setKind} trigger="upcoming-kind" />
      <JurnlInput label="NAME" value={name} onValue={setName} trigger={existing ? 'upcoming-edit-name' : 'upcoming-add-name'} />
      <JurnlInput label={kind === 'SUBSCRIPTION' ? 'PRICE' : 'AMOUNT'} value={amount} onValue={setAmount} trigger={existing ? 'upcoming-edit-amount' : 'upcoming-add-amount'} inputMode="decimal" />
      <p className="jrn-eyebrow">HOW OFTEN</p>
      <Chips label="HOW OFTEN" value={cadence} options={CADENCE_CHOICES.map((c) => ({ id: c, label: CADENCE_LABEL[c] }))} onChange={setCadence} trigger="upcoming-cadence" />
      <JurnlInput label={kind === 'SUBSCRIPTION' ? 'NEXT RENEWAL (YYYY-MM-DD)' : 'NEXT DUE DATE (YYYY-MM-DD)'} value={due} onValue={setDue} trigger="upcoming-due" inputMode="numeric" />
      <AccountChips label="PAID FROM" value={account} onChange={setAccount} trigger="upcoming-account" />
      {!existing && suggested.status !== 'MISSING' ? <p className="jrn-currency__note">{suggested.reason}</p> : null}
      <JurnlInput label="CATEGORY (OPTIONAL)" value={category ?? ''} onValue={setCategory} trigger="upcoming-category" />
      {kind === 'SUBSCRIPTION' ? <JurnlInput label="FREE TRIAL ENDS (OPTIONAL, YYYY-MM-DD)" value={trial ?? ''} onValue={setTrial} trigger="upcoming-trial" inputMode="numeric" /> : null}
      {kind === 'BILL' && cards.length ? (
        <>
          <p className="jrn-eyebrow">IS THIS A CREDIT CARD PAYMENT?</p>
          <Chips label="CREDIT CARD PAYMENT" value={card ?? 'NONE'} options={[{ id: 'NONE', label: 'NO' }, ...cards.map((c) => ({ id: c.account_id, label: `YES · ${c.display_name}` }))]} onChange={(v) => setCard(v === 'NONE' ? null : v)} trigger="upcoming-card-link" />
          {card ? <p className="jrn-currency__note">COUNTED ONCE, THROUGH THE CARD'S MINIMUM. PAYING IT LOWERS WHAT THE CARD OWES.</p> : null}
        </>
      ) : null}
      <JurnlInput label="NOTES (OPTIONAL)" value={notes} onValue={setNotes} trigger="upcoming-notes" />
    </JurnlDrawer>
  );
}

export function obligationTarget(ob: JurnlObligation): ReservationTarget {
  const s = getRepository().getSnapshot();
  const f = obligationFunding(ob, s.transactions, s.reservations);
  return { kind: 'OBLIGATION', id: ob.obligation_id, occurrence_date: ob.next_due_date, name: ob.name, cap: f.remaining };
}

/** Set money aside toward one payment (bill, subscription or card). Shows what is already set aside and lets it change. */
export function SetAsideSheet({ target, defaultAccountId, onClose }: { target: ReservationTarget; defaultAccountId?: string | null; onClose: () => void }) {
  useCurrency();
  useRepoTick();
  const { showToast } = useJurnl();
  const s = getRepository().getSnapshot();
  const existing = reservationsFor(s.reservations, target.kind, target.id, target.kind === 'OBLIGATION' ? target.occurrence_date : undefined);
  const already = existing.reduce((t, r) => t + r.amount, 0);
  const [account, setAccount] = useState<string | null>(defaultAccountId ?? null);
  const [amount, setAmount] = useState(String(Math.max(0, Math.round((target.cap - already) * 100) / 100) || ''));
  const { error, run } = useResult();
  const positions = useMemo(() => computeLedgerPositions(s.accounts, s.creditAttributes, s.transactions, getTodayKey()).positions, [s]);
  const value = parseMoneyInput(amount);
  const name = (id: string) => s.accounts.find((a) => a.account_id === id)?.display_name ?? id;
  return (
    <JurnlDrawer
      expression="form"
      size="long"
      testId="set-aside-sheet"
      title={`SET MONEY ASIDE · ${target.name}`}
      lead="EARMARKS MONEY YOU ALREADY HAVE. IT DOES NOT PAY THE BILL OR MOVE MONEY BETWEEN ACCOUNTS."
      onClose={onClose}
      footer={
        <>
          <ErrorLine error={error} />
          <JurnlButton trigger="set-aside-save" disabled={value == null} onClick={() => run(applyOp(buildSetAside(s.accounts, positions, s.reservations, { target, account_id: account, amount: value ?? 0 })), () => {
            showToast({ tone: 'success', title: 'MONEY SET ASIDE', body: `${money(value ?? 0)} FOR ${target.name}` });
            onClose();
          })}>
            SET ASIDE
          </JurnlButton>
        </>
      }
    >
      <Facts rows={[
        ['STILL DUE', money(target.cap)],
        ['ALREADY SET ASIDE', money(already)],
        ['STILL NEEDED', money(Math.max(0, target.cap - already))],
      ]} />
      {existing.length ? (
        <ul className="jrn-why" aria-label="SET ASIDE NOW">
          {existing.map((r) => (
            <li key={r.reservation_id}>
              <span>{`${money(r.amount)} IN ${name(r.account_id)}`}</span>
              <b>
                <button type="button" className="jrn-btn jrn-btn--inline" data-jrn-trigger={`set-aside-reduce-${r.account_id}`} onClick={() => run(applyOp(buildReduceReservation(s.reservations, r.reservation_id, Math.min(r.amount, value ?? r.amount))), () => undefined)}>REDUCE BY THE AMOUNT BELOW</button>
                {' '}
                <button type="button" className="jrn-btn jrn-btn--inline" data-jrn-trigger={`set-aside-release-${r.account_id}`} onClick={() => run(applyOp(buildReleaseReservations(s.reservations, [r.reservation_id])), () => undefined)}>RELEASE</button>
              </b>
            </li>
          ))}
        </ul>
      ) : null}
      <AccountChips label="FROM MONEY IN" value={account} onChange={setAccount} trigger="set-aside-account" filter={assetOnly} />
      {account ? (() => {
        const p = positions.find((x) => x.account_id === account);
        const reservedHere = s.reservations.filter((r) => r.status === 'ACTIVE' && r.account_id === account).reduce((t, r) => t + r.amount, 0);
        return p ? <p className="jrn-currency__note">{`${p.account.display_name} HAS ${money(p.held)}. ${money(reservedHere)} OF IT IS ALREADY SET ASIDE.`}</p> : null;
      })() : null}
      <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="set-aside-amount" inputMode="decimal" />
    </JurnlDrawer>
  );
}

export function PayObligationSheet({ obligation, onClose }: { obligation: JurnlObligation; onClose: () => void }) {
  useCurrency();
  const { showToast } = useJurnl();
  const s = getRepository().getSnapshot();
  const f = obligationFunding(obligation, s.transactions, s.reservations);
  const [amount, setAmount] = useState(f.remaining > 0 ? String(f.remaining) : '');
  const [account, setAccount] = useState<string | null>(obligation.account_id ?? suggestAccount(obligation.kind === 'SUBSCRIPTION' ? 'SUBSCRIPTIONS' : 'BILLS').account?.account_id ?? null);
  const [date, setDate] = useState<string>(getTodayKey());
  const [keep, setKeep] = useState(false);
  const { error, run } = useResult();
  const value = parseMoneyInput(amount);
  const partial = value != null && f.remaining > 0 && value < f.remaining;
  return (
    <JurnlDrawer
      expression="form"
      size="long"
      testId="pay-sheet"
      title={`MARK PAID · ${obligation.name}`}
      lead={`DUE ${formatCalendarDate(obligation.next_due_date)}. ${f.label}. RECORDS ONE PAYMENT YOU ALREADY MADE.`}
      onClose={onClose}
      footer={
        <>
          <ErrorLine error={error} />
          <JurnlButton trigger="pay-save" disabled={value == null} onClick={() => run(markObligationPaid(obligation, { amount: value ?? 0, account_id: account, paid_on: (isCalendarDate(date.trim()) ? date.trim() : getTodayKey()) as CalendarDate, keepExtraSetAside: keep }), (v) => {
            const parts = [v.settled ? (v.nextDue ? `NEXT DUE ${formatCalendarDate(v.nextDue)}.` : 'PAID IN FULL.') : `${money(f.remaining - (value ?? 0))} STILL DUE.`];
            if (v.applied > 0) parts.push(`${money(v.applied)} SET ASIDE WAS USED.`);
            if (v.released > 0) parts.push(`${money(v.released)} SET ASIDE IS AVAILABLE AGAIN.`);
            if (v.carried > 0) parts.push(`${money(v.carried)} STAYS SET ASIDE FOR NEXT TIME.`);
            showToast({ tone: 'success', title: partial ? 'PART PAYMENT RECORDED' : 'PAYMENT RECORDED', body: parts.join(' '), testId: 'pay-result' });
            onClose();
          })}>
            {partial ? 'RECORD PART PAYMENT' : 'RECORD PAYMENT'}
          </JurnlButton>
        </>
      }
    >
      <JurnlInput label="AMOUNT PAID" value={amount} onValue={setAmount} trigger="pay-amount" inputMode="decimal" />
      <AccountChips label="PAID FROM" value={account} onChange={setAccount} trigger="pay-account" />
      <JurnlInput label="DATE PAID (YYYY-MM-DD)" value={date} onValue={setDate} trigger="pay-date" inputMode="numeric" />
      {f.reserved > 0 ? (
        <Chips label="EXTRA SET ASIDE" value={keep ? 'KEEP' : 'RELEASE'} options={[{ id: 'RELEASE', label: 'RELEASE ANY EXTRA SET ASIDE' }, { id: 'KEEP', label: 'KEEP EXTRA FOR NEXT TIME' }]} onChange={(v) => setKeep(v === 'KEEP')} trigger="pay-extra" />
      ) : null}
      <p className="jrn-currency__note">JURNL DOES NOT PAY BILLS. THIS RECORDS A PAYMENT YOU MADE SO BALANCES STAY RIGHT.</p>
    </JurnlDrawer>
  );
}

export function ObligationMoreSheet({ obligation, onClose, onEdit, onEnded }: { obligation: JurnlObligation; onClose: () => void; onEdit: () => void; onEnded: () => void }) {
  useCurrency();
  useRepoTick();
  const { showToast } = useJurnl();
  const [mode, setMode] = useState<'menu' | 'date' | 'stop' | 'history'>('menu');
  const [newDate, setNewDate] = useState<string>(addDays(obligation.next_due_date, 3));
  const { error, run } = useResult();
  const s = getRepository().getSnapshot();
  const payments = paymentsFor(s.transactions, obligation.obligation_id);
  const name = (id: string | null | undefined) => s.accounts.find((a) => a.account_id === id)?.display_name ?? '—';
  if (mode === 'date') {
    return (
      <JurnlDrawer expression="form" size="short" testId="reschedule-sheet" title="CHANGE THIS DATE" lead={`MOVES ONLY THE ${formatCalendarDate(obligation.next_due_date)} PAYMENT. LATER DATES STAY THE SAME.`} onClose={() => setMode('menu')}
        footer={<><ErrorLine error={error} /><JurnlButton trigger="reschedule-save" onClick={() => run(rescheduleObligationOccurrence(obligation, newDate.trim() as CalendarDate), () => { showToast({ tone: 'success', title: 'DATE CHANGED', body: `${obligation.name} · ${formatCalendarDate(newDate.trim() as CalendarDate)}` }); onClose(); })}>SAVE DATE</JurnlButton></>}>
        <JurnlInput label="NEW DATE (YYYY-MM-DD)" value={newDate} onValue={setNewDate} trigger="reschedule-date" inputMode="numeric" />
      </JurnlDrawer>
    );
  }
  if (mode === 'stop') {
    return (
      <JurnlDrawer expression="confirmation" size="short" testId="stop-sheet" title="STOP TRACKING?" lead="JURNL STOPS COUNTING THIS. IT DOES NOT CANCEL ANYTHING WITH THE COMPANY — DO THAT WITH THEM DIRECTLY. HISTORY IS KEPT." onClose={() => setMode('menu')}
        footer={<><JurnlButton trigger="upcoming-end" onClick={() => { setObligationStatus(obligation, 'CANCELLED'); onEnded(); }}>STOP TRACKING</JurnlButton><JurnlButton variant="secondary" trigger="stop-cancel" onClick={() => setMode('menu')}>KEEP TRACKING</JurnlButton></>} />
    );
  }
  if (mode === 'history') {
    return (
      <JurnlDrawer expression="detail" size="long" testId="history-sheet" title={`PAYMENT HISTORY · ${obligation.name}`} onClose={() => setMode('menu')}>
        {payments.length === 0 ? <p className="jrn-currency__note">NO PAYMENTS RECORDED YET.</p> : null}
        <ul className="jrn-why">
          {payments.map((p, i) => (
            <li key={p.id}>
              <span>{`${p.occurred_on ? formatCalendarDate(p.occurred_on) : p.when} · ${name(p.account_id)}`}</span>
              <b>{money(p.amount)}</b>
              <small>{`FOR ${p.occurrence_date ? formatCalendarDate(p.occurrence_date) : '—'}`}{i === 0 ? ' · ' : ''}{i === 0 ? (
                <button type="button" className="jrn-btn jrn-btn--inline" data-jrn-trigger="payment-undo" onClick={() => run(undoObligationPayment(obligation, p.id), () => { showToast({ tone: 'success', title: 'PAYMENT UNDONE', body: 'THE BALANCE IS BACK. SET MONEY ASIDE AGAIN IF YOU NEED TO.' }); onClose(); })}>UNDO THIS PAYMENT</button>
              ) : null}</small>
            </li>
          ))}
        </ul>
        {(obligation.price_history ?? []).length ? (
          <>
            <p className="jrn-eyebrow">PRICE CHANGES</p>
            <ul className="jrn-why">
              {(obligation.price_history ?? []).map((c) => (
                <li key={c.at}><span>{formatCalendarDate(c.at.slice(0, 10) as CalendarDate)}</span><b>{`${money(c.from)} → ${money(c.to)}`}</b></li>
              ))}
            </ul>
          </>
        ) : null}
        {(obligation.occurrence_log ?? []).length ? (
          <>
            <p className="jrn-eyebrow">DATES</p>
            <ul className="jrn-why">
              {(obligation.occurrence_log ?? []).map((l) => (
                <li key={`${l.at}-${l.outcome}`}><span>{formatCalendarDate(l.due_date)}</span><b>{l.outcome === 'PAID' ? 'PAID' : l.outcome === 'SKIPPED' ? 'SKIPPED' : l.outcome === 'RESCHEDULED' ? `MOVED TO ${l.moved_to ? formatCalendarDate(l.moved_to) : ''}` : 'PAYMENT UNDONE'}</b></li>
              ))}
            </ul>
          </>
        ) : null}
        <ErrorLine error={error} />
      </JurnlDrawer>
    );
  }
  return (
    <JurnlDrawer expression="detail" size="long" testId="obligation-more" title={obligation.name} onClose={onClose} footer={<ErrorLine error={error} />}>
      <JurnlButton variant="secondary" trigger="upcoming-more-edit" onClick={onEdit}>EDIT AMOUNT, DATE OR ACCOUNT</JurnlButton>
      <JurnlButton variant="secondary" trigger="upcoming-history" onClick={() => setMode('history')}>PAYMENT HISTORY</JurnlButton>
      {obligation.status === 'ACTIVE' ? (
        <>
          <JurnlButton variant="secondary" trigger="upcoming-skip" onClick={() => run(skipObligationOccurrence(obligation), (o) => { showToast({ tone: 'success', title: 'SKIPPED', body: `NOTHING RECORDED FOR ${formatCalendarDate(obligation.next_due_date)}. NEXT DUE ${formatCalendarDate(o.next_due_date)}.` }); onClose(); })}>SKIP THIS ONE</JurnlButton>
          <JurnlButton variant="secondary" trigger="upcoming-reschedule" onClick={() => setMode('date')}>CHANGE THIS DATE</JurnlButton>
          <JurnlButton variant="secondary" trigger="upcoming-pause" onClick={() => { setObligationStatus(obligation, 'PAUSED'); onClose(); }}>PAUSE</JurnlButton>
        </>
      ) : obligation.status === 'PAUSED' || obligation.status === 'CANCELLED' ? (
        <JurnlButton variant="secondary" trigger="upcoming-resume" onClick={() => { setObligationStatus(obligation, 'ACTIVE'); onClose(); }}>TRACK AGAIN</JurnlButton>
      ) : null}
      {obligation.status !== 'CANCELLED' ? <JurnlButton variant="secondary" trigger="upcoming-stop" onClick={() => setMode('stop')}>STOP TRACKING</JurnlButton> : null}
    </JurnlDrawer>
  );
}
