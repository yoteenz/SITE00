/** F06 INCOME — structural completion (Wave 2). */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { formatRelativeDate, getTodayKey, type RecurrenceType } from '../../data/foundation/dates';
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

const CADENCE: Record<string, string> = { NONE: 'ONCE', WEEKLY: 'WEEKLY', BIWEEKLY: 'EVERY 2 WEEKS', MONTHLY: 'MONTHLY', ANNUAL: 'YEARLY', IRREGULAR: 'IRREGULAR' };

/** F06 INCOME — LEDGER / GRID. An arrivals ledger: source, rhythm, next date, amount — ruled like a ledger page. */
export function IncomeHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const sources = useIncomeSources();
  const spec = parentById('F06')!;
  const [addOpen, setAddOpen] = useState(false);
  const today = getTodayKey();
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
        </>
      }
    >
      <FramePanel id="intro">
        <header className="jrn-ledg__intro" data-jrn-zone="intro">
          <h1 className="jrn-ledg__h">INCOME</h1>
          <p className="jrn-lang__state">
            {sources.length ?
              `${sources.length} INCOME ${sources.length === 1 ? 'SOURCE' : 'SOURCES'}. NEXT: ${next!.source_name}, ${formatRelativeDate(next!.next_due_date, today)}.`
            : 'NO INCOME IS ADDED YET.'}
          </p>
          <p className="jrn-lang__task">{sources.length ? 'OPEN A SOURCE TO SEE ITS PATTERN AND WHAT HAS ARRIVED.' : 'ADD EACH PLACE MONEY COMES FROM SO JURNL CAN PLAN AROUND IT.'}</p>
          <p className="jrn-lang__editorial">{spec.question}</p>
        </header>
      </FramePanel>
      {sources.length ?
        <FramePanel id="ledger">
          <section className="jrn-ledg" aria-label="INCOME SOURCES">
            <p className="jrn-ledg__head" aria-hidden>
              <span>SOURCE</span>
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
          <JurnlButton trigger="income-add" onClick={() => setAddOpen(true)}>ADD A SOURCE</JurnlButton>
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
        <p className="jrn-home__sub">{src.status} · {src.cadence}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>EXPECTED</b>
          <p>{formatMoney(src.amount, true)}</p>
          <b>NEXT</b>
          <p>{src.next_due_date}</p>
          {src.linked_transaction_id ? <p>LINKED MOVEMENT · {src.linked_transaction_id}</p> : null}
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
  const [cadence, setCadence] = useState<RecurrenceType>('MONTHLY');
  const valid = name.trim().length > 0 && /^\d+(\.\d{1,2})?$/.test(amount.trim());
  return (
    <JurnlDrawer size="long" testId="income-add-sheet" title="ADD A SOURCE" onClose={onClose} footer={
      <JurnlButton disabled={!valid} trigger="income-add-save" onClick={() => { createIncomeSource({ source_name: name, amount: Number(amount), cadence, next_due_date: getTodayKey() }); onClose(); }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="income-add-name" />
      <JurnlInput label="AMOUNT USD" value={amount} onValue={setAmount} trigger="income-add-amount" inputMode="decimal" />
      <div className="jrn-home__choices" role="radiogroup" aria-label="CADENCE">
        {(['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as RecurrenceType[]).map((c) => (
          <button key={c} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={cadence === c} onClick={() => setCadence(c)}>{c}</button>
        ))}
      </div>
    </JurnlDrawer>
  );
}

function EditIncomeSheet({ source, onClose }: { source: NonNullable<ReturnType<typeof incomeById>>; onClose: () => void }) {
  const [amount, setAmount] = useState(String(source.amount));
  return (
    <JurnlDrawer size="long" testId="income-edit-sheet" title="EDIT SOURCE" onClose={onClose} footer={
      <JurnlButton trigger="income-edit-save" onClick={() => { getRepository().upsertIncomeSource({ ...source, amount: Number(amount) }); onClose(); }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="AMOUNT USD" value={amount} onValue={setAmount} trigger="income-edit-amount" inputMode="decimal" />
    </JurnlDrawer>
  );
}
