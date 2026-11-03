/**
 * Safe to Spend planning periods (D1): NEXT 30 DAYS (the canonical number) and BEFORE NEXT INCOME (a second reading
 * of the same formula through F06's next expected income date). Opening either changes nothing.
 */

import { useState } from 'react';
import { formatCalendarDate, formatRelativeDate, getTodayKey } from '../../data/foundation/dates';
import { useCurrency, useRepoTick } from '../../data/home/money';
import { computeNextIncomeView, type HorizonLine, type SafeToSpendBreakdown } from '../../data/f09/safeToSpend';
import { JurnlButton, JurnlDrawer } from '../components/primitives';
import { useJurnl } from '../state/store';
import { Chips, money } from './FinanceSheets';

export type HorizonMode = 'NEXT_30_DAYS' | 'BEFORE_NEXT_INCOME';

/** "NEXT 30 DAYS · TO DEC 3" — the live replacement for the reference's printed date. */
export function horizonLine(windowEnd: string): string {
  return `NEXT 30 DAYS · TO ${formatCalendarDate(windowEnd as never).replace(/, \d{4}$/, '')}`;
}

function Lines({ b, testId }: { b: SafeToSpendBreakdown; testId: string }) {
  const today = getTodayKey();
  const rows = [
    ...b.billLines.map((l) => ({ k: `${l.name} · ${formatRelativeDate(l.due_date, today)}`, v: money(l.remaining), sub: l.reserved > 0 ? `${money(l.reserved)} SET ASIDE · ${money(Math.max(0, l.remaining - l.reserved))} STILL NEEDED` : 'NOTHING SET ASIDE YET' })),
    ...b.cardLines.map((l) => ({ k: `${l.name} · ${formatRelativeDate(l.due_date, today)}`, v: money(l.remaining), sub: 'CARD MINIMUM STILL DUE' })),
    ...b.transferLines.map((l) => ({ k: l.kind === 'CARD_PAYMENT' ? 'CARD PAYMENT NOT SENT YET' : 'TRANSFER NOT SENT YET', v: money(l.amount), sub: l.state === 'NEEDS_RECONCILIATION' ? 'NEEDS CONFIRMATION' : l.date ? formatRelativeDate(l.date, today) : undefined })),
  ];
  return (
    <ul className="jrn-why" data-testid={testId}>
      {rows.length === 0 ? <li><span>UPCOMING PAYMENTS</span><b>NONE</b></li> : null}
      {rows.map((r, i) => (
        <li key={`${r.k}-${i}`}>
          <span>{r.k}</span>
          <b>{r.v}</b>
          {r.sub ? <small>{r.sub}</small> : null}
        </li>
      ))}
    </ul>
  );
}

function Totals({ b, label, testId }: { b: SafeToSpendBreakdown; label: string; testId: string }) {
  const upcoming = b.upcoming + b.cardPayments + b.committedTransfers;
  return (
    <ul className="jrn-why" data-testid={testId}>
      <li><span>{label}</span><b data-jrn-amount-cents={Math.round(b.value * 100)}>{money(b.value)}</b></li>
      <li><span>UPCOMING PAYMENTS</span><b>{money(upcoming)}</b></li>
      <li><span>MONEY SET ASIDE</span><b>{money(b.reservedForPayments)}</b><small>ALREADY INSIDE UPCOMING PAYMENTS. NOT TAKEN OFF TWICE.</small></li>
      <li><span>STILL NEEDED</span><b>{money(b.unfundedCommitments)}</b></li>
      {b.inTransit > 0 ? <li><span>IN TRANSIT</span><b>{money(b.inTransit)}</b><small>LEFT ONE ACCOUNT, NOT ARRIVED. NOT AVAILABLE ANYWHERE YET.</small></li> : null}
    </ul>
  );
}

function Recon({ lines, title }: { lines: HorizonLine[]; title: string }) {
  if (!lines.length) return null;
  return (
    <>
      <p className="jrn-eyebrow">{title}</p>
      <ul className="jrn-why">
        {lines.map((l) => (
          <li key={l.key}><span>{`${l.label}${l.due_date ? ` · ${formatCalendarDate(l.due_date)}` : ''}`}</span><b>{money(l.amount)}</b></li>
        ))}
      </ul>
    </>
  );
}

/** The two readings. Used inside the TODAY drawer and the Safe to Spend drawer. */
export function HorizonBody({ mode, onMode, onAddIncome }: { mode: HorizonMode; onMode: (m: HorizonMode) => void; onAddIncome: () => void }) {
  useCurrency();
  useRepoTick();
  const v = computeNextIncomeView();
  return (
    <>
      <Chips
        label="PLANNING PERIOD"
        value={mode}
        options={[
          { id: 'NEXT_30_DAYS', label: 'NEXT 30 DAYS' },
          { id: 'BEFORE_NEXT_INCOME', label: 'BEFORE NEXT INCOME' },
        ]}
        onChange={onMode}
        trigger="safe-horizon"
      />
      {mode === 'NEXT_30_DAYS' ? (
        <>
          <p className="jrn-currency__note">{`EVERYTHING DUE FROM TODAY TO ${formatCalendarDate(v.primary.windowEnd)}, INCLUDING ANYTHING OVERDUE.`}</p>
          <Totals b={v.primary} label="SAFE TO SPEND" testId="safe-horizon-30" />
          <Lines b={v.primary} testId="safe-horizon-30-lines" />
        </>
      ) : v.income && v.view ? (
        <>
          <p className="jrn-body" data-testid="safe-horizon-income">
            {`NEXT INCOME: ${v.income.name} · ${formatRelativeDate(v.income.date, getTodayKey())} · ${v.income.amount != null ? `${money(v.income.amount)} EXPECTED, NOT RECEIVED` : 'AMOUNT NOT KNOWN'}.`}
          </p>
          <p className="jrn-currency__note">WHAT IS DUE BEFORE THAT MONEY IS EXPECTED. EXPECTED INCOME IS NEVER ADDED TO YOUR BALANCES.</p>
          <Totals b={v.view} label="AVAILABLE BEFORE NEXT INCOME" testId="safe-horizon-next" />
          <Lines b={v.view} testId="safe-horizon-next-lines" />
          <Recon lines={v.onlyIn30Days} title="IN THE 30-DAY NUMBER, DUE AFTER YOUR NEXT INCOME" />
          <Recon lines={v.onlyBeforeIncome} title="DUE BEFORE YOUR NEXT INCOME, AFTER THE 30 DAYS" />
          <p className="jrn-currency__note" data-testid="safe-horizon-unchanged">{`SAFE TO SPEND FOR THE NEXT 30 DAYS STAYS ${money(v.primary.value)}.`}</p>
        </>
      ) : (
        <>
          <p className="jrn-body" data-testid="safe-horizon-no-income">NO NEXT INCOME DATE RECORDED.</p>
          <p className="jrn-currency__note">DAILY EARNINGS ARE NOT FORECAST. ADD A PAYCHECK OR OTHER INCOME WITH A DATE TO SEE WHAT IS DUE BEFORE IT.</p>
          <JurnlButton variant="secondary" trigger="safe-horizon-add-income" onClick={onAddIncome}>ADD EXPECTED INCOME DATE</JurnlButton>
        </>
      )}
    </>
  );
}

export function SafeHorizonSheet({ onClose, initial = 'NEXT_30_DAYS' }: { onClose: () => void; initial?: HorizonMode }) {
  const { go } = useJurnl();
  const [mode, setMode] = useState<HorizonMode>(initial);
  return (
    <JurnlDrawer expression="analysis" size="long" testId="safe-horizon-sheet" title="PLANNING PERIOD" lead="THE SAME CALCULATION OVER TWO PERIODS. CHOOSING ONE CHANGES NOTHING." onClose={onClose}>
      <HorizonBody mode={mode} onMode={setMode} onAddIncome={() => { onClose(); go('income', { add: 'expected' }); }} />
    </JurnlDrawer>
  );
}
