/** F06 INCOME — structural completion (Wave 2). */

import { useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { earningsBreakdown, earningsPeriods, useDailyEarnings } from '../../data/f06/dailyEarnings';
import type { JurnlDailyEarnings } from '../../data/foundation/dailyEarnings';
import { AfterEarningsSheet, DailyEarningsSheet, EarningsDetailSheet } from '../finance/FinanceSheets';
import { formatRelativeDate, getTodayKey, isCalendarDate, type CalendarDate, type RecurrenceType } from '../../data/foundation/dates';
import { createIncomeSource, incomeById, receiveIncome, useIncomeSources } from '../../data/f06/incomeStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { getRepository } from '../../data/repository/deviceRepository';
import { accountDisplayOptions } from '../../data/foundation/accounts';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { FramePanel, JurnlFamilyFrame, JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';

function IncomeShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F06"
      familyPlate={PARENT_PLATES.F06}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F06" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F06" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

const CADENCE: Record<string, string> = { NONE: 'ONCE', WEEKLY: 'WEEKLY', BIWEEKLY: 'EVERY 2 WEEKS', MONTHLY: 'MONTHLY', QUARTERLY: 'EVERY 3 MONTHS', ANNUAL: 'YEARLY', IRREGULAR: 'IRREGULAR' };

/** F06 INCOME — LEDGER / GRID. An arrivals ledger: source, rhythm, next date, amount — ruled like a ledger page. */
export function IncomeHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const sources = useIncomeSources();
  const spec = parentById('F06')!;
  const [params] = useSearchParams();
  const [addOpen, setAddOpen] = useState(params.get('add') === 'expected');
  const days = useDailyEarnings();
  const [earningsOpen, setEarningsOpen] = useState<{ edit: JurnlDailyEarnings | null } | null>(params.get('add') === 'earnings' ? { edit: null } : null);
  const [detail, setDetail] = useState<JurnlDailyEarnings | null>(null);
  const [saved, setSaved] = useState<JurnlDailyEarnings | null>(null);
  const today = getTodayKey();
  const periods = earningsPeriods(days, today);
  const next = [...sources].sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))[0] ?? null;
  return (
    <JurnlFamilyFrame
      screenId="F06.00"
      familyId="F06"
      familyPlate={PARENT_PLATES.F06}
      label="INCOME"
      archetype="LEDGER_GRID"
      chrome={<FamilyChrome familyId="F06" nodeId="F06.00" backLabel="BACK TO MONEY" onBack={() => go('money')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="MONEY" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F06" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F06" nodeId="F06.00" onClose={closeOverlay} /> : null}
          {addOpen ? <AddIncomeSheet onClose={() => setAddOpen(false)} /> : null}
          {earningsOpen ? (
            <DailyEarningsSheet
              existing={earningsOpen.edit}
              onClose={() => setEarningsOpen(null)}
              onSaved={(r) => { const wasEdit = Boolean(earningsOpen.edit); setEarningsOpen(null); if (!wasEdit) setSaved(r); }}
            />
          ) : null}
          {detail ? <EarningsDetailSheet record={detail} onClose={() => setDetail(null)} onEdit={() => { setEarningsOpen({ edit: detail }); setDetail(null); }} /> : null}
          {saved ? <AfterEarningsSheet record={saved} onClose={() => setSaved(null)} /> : null}
        </>
      }
    >
      <FramePanel id="intro">
        <header className="jrn-ledg__intro" data-jrn-zone="intro">
          <h1 className="jrn-ledg__h">INCOME</h1>
          <p className="jrn-lang__state" data-testid="income-state">
            {periods.today.total > 0 ?
              `${formatMoney(periods.today.total)} EARNED TODAY. ${formatMoney(periods.week.total)} THIS WEEK.`
            : sources.length ?
              `${sources.length} EXPECTED INCOME ${sources.length === 1 ? 'SOURCE' : 'SOURCES'}. NEXT: ${next!.source_name}, ${formatRelativeDate(next!.next_due_date, today)}.`
            : days.length ? `${formatMoney(periods.week.total)} EARNED THIS WEEK.` : 'NO INCOME IS RECORDED YET.'}
          </p>
          <p className="jrn-lang__task">{periods.today.total > 0 ? 'OPEN A DAY TO EDIT OR REMOVE IT.' : 'AT THE END OF YOUR WORKDAY, ADD WHAT YOU EARNED IN ONE ENTRY.'}</p>
          <p className="jrn-lang__editorial">{spec.question}</p>
        </header>
      </FramePanel>
      <FramePanel id="earnings">
        <section className="jrn-ledg" aria-label="DAILY EARNINGS" data-testid="earnings-panel">
          <p className="jrn-ledg__head" aria-hidden>
            <span>EARNED</span>
            <span>DAYS</span>
            <span>TOTAL</span>
          </p>
          {([['TODAY', periods.today], ['THIS WEEK', periods.week], ['THIS MONTH', periods.month]] as const).map(([label, t]) => (
            <div key={label} className="jrn-ledg__row" data-testid={`earnings-${label.toLowerCase().replace(' ', '-')}`}>
              <span className="jrn-ledg__name">{label}</span>
              <span className="jrn-ledg__sub">{`${formatMoney(t.digital)} DIGITAL · ${formatMoney(t.cash)} CASH`}</span>
              <span className="jrn-ledg__date">{t.days}</span>
              <span className="jrn-ledg__amt">{formatMoney(t.total)}</span>
            </div>
          ))}
          {days.slice(0, 4).map((d) => (
            <button key={d.earnings_id} type="button" className="jrn-ledg__row" data-jrn-trigger={`earnings-day-${d.earnings_id}`} onClick={() => setDetail(d)}>
              <span className="jrn-ledg__name">{d.income_source}</span>
              <span className="jrn-ledg__sub">{`${formatMoney(earningsBreakdown(d).digitalReceived)} DIGITAL · ${formatMoney(d.cash_tips)} CASH`}</span>
              <span className="jrn-ledg__date">{formatRelativeDate(d.work_date, today)}</span>
              <span className="jrn-ledg__amt">{formatMoney(earningsBreakdown(d).totalEarned, true)}</span>
            </button>
          ))}
        </section>
      </FramePanel>
      {sources.length ?
        <FramePanel id="ledger">
          <section className="jrn-ledg" aria-label="EXPECTED INCOME">
            <p className="jrn-ledg__head" aria-hidden>
              <span>EXPECTED</span>
              <span>NEXT</span>
              <span>AMOUNT</span>
            </p>
            {sources.map((s) => (
              <button key={s.income_id} type="button" className="jrn-ledg__row" data-jrn-trigger={`income-${s.income_id}`} onClick={() => go(`income/${s.income_id}`)}>
                <span className="jrn-ledg__name">{s.source_name}</span>
                <span className="jrn-ledg__sub">{CADENCE[s.cadence] ?? s.cadence} · {s.status}</span>
                <span className="jrn-ledg__date">{formatRelativeDate(s.next_due_date, today)}</span>
                <span className="jrn-ledg__amt">{formatMoney(s.amount, true)}</span>
              </button>
            ))}
          </section>
        </FramePanel>
      : null}
      <FramePanel id="actions">
        <div className="jrn-ledg__actions">
          <JurnlButton trigger="income-add-earnings" onClick={() => setEarningsOpen({ edit: null })}>ADD DAILY EARNINGS</JurnlButton>
          <JurnlButton variant="secondary" trigger="income-add" onClick={() => setAddOpen(true)}>ADD EXPECTED INCOME</JurnlButton>
          <JurnlButton variant="secondary" trigger="income-upcoming" onClick={() => go('upcoming')}>UPCOMING</JurnlButton>
        </div>
      </FramePanel>
    </JurnlFamilyFrame>
  );
}

export function IncomeSourceScreen() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const src = sourceId ? incomeById(sourceId) : null;
  const [editOpen, setEditOpen] = useState(false);
  if (!src) {
    return (
      <IncomeShell screenId="F06.SOURCE">
        <FamilyChrome familyId="F06" nodeId="F06.SOURCE" backLabel="BACK" onBack={() => go('income')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>SOURCE NOT FOUND</b></JurnlPanel>
      </IncomeShell>
    );
  }
  const accounts = accountDisplayOptions();
  return (
    <IncomeShell screenId="F06.SOURCE">
      <FamilyChrome familyId="F06" nodeId="F06.SOURCE" backLabel="BACK TO INCOME" onBack={() => go('income')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{src.source_name}</h1>
        <p className="jrn-home__sub">{src.status} · {CADENCE[src.cadence] ?? src.cadence}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>EXPECTED</b>
          <p>{formatMoney(src.amount, true)}</p>
          <b>NEXT</b>
          <p>{formatRelativeDate(src.next_due_date, getTodayKey())}</p>
          {src.linked_transaction_id ? <p>RECORDED IN ACTIVITY</p> : null}
        </JurnlPanel>
        {src.status === 'EXPECTED' ?
          <JurnlButton trigger="income-receive" onClick={() => receiveIncome(src.income_id, accounts[0]?.id ?? 'CHECKING')}>
            MARK RECEIVED
          </JurnlButton>
        : null}
        <JurnlButton variant="secondary" trigger="income-edit" onClick={() => setEditOpen(true)}>EDIT</JurnlButton>
        <JurnlButton variant="secondary" trigger="income-remove" onClick={() => { getRepository().deleteIncomeSource(src.income_id); go('income'); }}>ARCHIVE</JurnlButton>
      </div>
      {editOpen ? <EditIncomeSheet source={src} onClose={() => setEditOpen(false)} /> : null}
    </IncomeShell>
  );
}

function AddIncomeSheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cadence, setCadence] = useState<RecurrenceType>('BIWEEKLY');
  const [date, setDate] = useState<string>(getTodayKey());
  const amountOk = amount.trim() === '' || /^\d+(\.\d{1,2})?$/.test(amount.trim());
  const dateOk = isCalendarDate(date.trim()) && date.trim() >= getTodayKey();
  const valid = name.trim().length > 0 && amountOk && dateOk;
  return (
    <JurnlDrawer size="long" testId="income-add-sheet" title="ADD EXPECTED INCOME" lead="A PAYCHECK OR PAYMENT YOU EXPECT ON A DATE. IT IS PLANNED, NOT RECEIVED, AND NEVER ADDED TO YOUR BALANCES. FOR MONEY YOU ALREADY EARNED TODAY, USE ADD DAILY EARNINGS." onClose={onClose} footer={
      <>
        {!dateOk && date.trim() ? <p className="jrn-field__error" role="alert">ENTER TODAY OR A LATER DATE AS YYYY-MM-DD.</p> : null}
        <JurnlButton disabled={!valid} trigger="income-add-save" onClick={() => { createIncomeSource({ source_name: name, amount: amount.trim() ? Number(amount) : 0, cadence, next_due_date: date.trim() as CalendarDate }); onClose(); }}>SAVE</JurnlButton>
      </>
    }>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="income-add-name" />
      <JurnlInput label="NEXT DATE (YYYY-MM-DD)" value={date} onValue={setDate} trigger="income-add-date" inputMode="numeric" />
      <JurnlInput label="AMOUNT (LEAVE EMPTY IF NOT KNOWN)" value={amount} onValue={setAmount} trigger="income-add-amount" inputMode="decimal" />
      <div className="jrn-home__choices" role="group" aria-label="HOW OFTEN">
        {(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'NONE'] as RecurrenceType[]).map((c) => (
          <button key={c} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={cadence === c} data-jrn-trigger={`income-add-cadence-${c.toLowerCase()}`} onClick={() => setCadence(c)}>{CADENCE[c]}</button>
        ))}
      </div>
    </JurnlDrawer>
  );
}

function EditIncomeSheet({ source, onClose }: { source: NonNullable<ReturnType<typeof incomeById>>; onClose: () => void }) {
  const [amount, setAmount] = useState(String(source.amount));
  const [date, setDate] = useState<string>(source.next_due_date);
  return (
    <JurnlDrawer size="long" testId="income-edit-sheet" title="EDIT EXPECTED INCOME" onClose={onClose} footer={
      <JurnlButton trigger="income-edit-save" disabled={!isCalendarDate(date.trim())} onClick={() => { getRepository().upsertIncomeSource({ ...source, amount: Number(amount) || 0, next_due_date: date.trim() as CalendarDate }); onClose(); }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="income-edit-amount" inputMode="decimal" />
      <JurnlInput label="NEXT DATE (YYYY-MM-DD)" value={date} onValue={setDate} trigger="income-edit-date" inputMode="numeric" />
    </JurnlDrawer>
  );
}
