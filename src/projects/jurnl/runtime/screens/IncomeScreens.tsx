/** F06 INCOME — structural completion (Wave 2). */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { getTodayKey, type RecurrenceType } from '../../data/foundation/dates';
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
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function IncomeShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F06} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F06" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F06" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function IncomeHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const sources = useIncomeSources();
  const spec = parentById('F06')!;
  const [addOpen, setAddOpen] = useState(false);
  return (
    <IncomeShell screenId="F06.00">
      <FamilyChrome familyId="F06" nodeId="F06.00" backLabel="BACK TO MONEY" onBack={() => go('money')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{spec.name}</h1>
        <p className="jrn-home__sub">{spec.question}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {sources.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel" data-jrn-trigger="income-empty">
            <b>NO INCOME SOURCES</b>
            <p>ADD WHAT ARRIVES.</p>
          </JurnlPanel>
        : sources.map((s) => (
            <button key={s.income_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`income-${s.income_id}`} onClick={() => go(`income/${s.income_id}`)}>
              <span className="jrn-tx__copy">
                <span className="jrn-tx__name">{s.source_name}</span>
                <small>{s.cadence} · {s.status}</small>
              </span>
              <span className="jrn-tx__amt jrn-tx__amt--in">{formatMoney(s.amount, true)}</span>
            </button>
          ))}
        <JurnlButton trigger="income-add" onClick={() => setAddOpen(true)}>ADD A SOURCE</JurnlButton>
        <JurnlButton variant="secondary" trigger="income-upcoming" onClick={() => go('upcoming')}>UPCOMING</JurnlButton>
      </div>
      {addOpen ? <AddIncomeSheet onClose={() => setAddOpen(false)} /> : null}
    </IncomeShell>
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
