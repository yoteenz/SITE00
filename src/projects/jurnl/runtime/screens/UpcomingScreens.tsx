/** F07 UPCOMING — derived projection (Wave 2). */

import { useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { getTodayKey, type RecurrenceType } from '../../data/foundation/dates';
import { groupUpcoming, projectUpcoming } from '../../data/foundation/upcomingProjection';
import { createObligation, obligationById, useObligations } from '../../data/f07/obligationsStore';
import { useIncomeSources } from '../../data/f06/incomeStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { getRepository } from '../../data/repository/deviceRepository';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function UpcomingShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F07} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F07" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F07" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function UpcomingHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const income = useIncomeSources();
  const obligations = useObligations();
  const spec = parentById('F07')!;
  const items = useMemo(() => projectUpcoming(income, obligations), [income, obligations]);
  const groups = useMemo(() => groupUpcoming(items), [items]);
  const [addOpen, setAddOpen] = useState(false);

  const renderGroup = (title: string, list: typeof items) =>
    list.length ?
      <JurnlPanel role="editorial" className="jrn-home__panel" key={title}>
        <b>{title}</b>
        {list.map((item) => (
          <button key={item.upcoming_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`upcoming-${item.upcoming_id}`} onClick={() => go(`upcoming/${item.source_id}`)}>
            <span className="jrn-tx__copy">
              <span className="jrn-tx__name">{item.label}</span>
              <small>{item.due_date} · {item.direction}</small>
            </span>
            <span className={`jrn-tx__amt${item.direction === 'MONEY_IN' ? ' jrn-tx__amt--in' : ''}`}>{formatMoney(item.amount, item.direction === 'MONEY_IN')}</span>
          </button>
        ))}
      </JurnlPanel>
    : null;

  return (
    <UpcomingShell screenId="F07.00">
      <FamilyChrome familyId="F07" nodeId="F07.00" backLabel="BACK TO TODAY" onBack={() => go('F03')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{spec.name}</h1>
        <p className="jrn-home__sub">{spec.question}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {items.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel" data-jrn-trigger="upcoming-empty">
            <b>NOTHING APPROACHING</b>
            <p>ADD INCOME OR OBLIGATIONS.</p>
          </JurnlPanel>
        : null}
        {renderGroup('OVERDUE', groups.OVERDUE)}
        {renderGroup('TODAY', groups.TODAY)}
        {renderGroup('THIS WEEK', groups.THIS_WEEK)}
        {renderGroup('LATER', groups.LATER)}
        <JurnlButton trigger="upcoming-add" onClick={() => setAddOpen(true)}>ADD WHAT REPEATS</JurnlButton>
        <JurnlButton variant="secondary" trigger="upcoming-income" onClick={() => go('income')}>INCOME</JurnlButton>
      </div>
      {addOpen ? <AddObligationSheet onClose={() => setAddOpen(false)} /> : null}
    </UpcomingShell>
  );
}

export function UpcomingItemScreen() {
  const { itemId } = useParams<{ itemId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const income = useIncomeSources();
  const obligations = useObligations();
  const item = useMemo(() => projectUpcoming(income, obligations).find((p) => p.source_id === itemId), [income, obligations, itemId]);
  const [editOpen, setEditOpen] = useState(false);

  if (!item) {
    return (
      <UpcomingShell screenId="F07.ITEM">
        <FamilyChrome familyId="F07" nodeId="F07.ITEM" backLabel="BACK" onBack={() => go('upcoming')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>ITEM NOT FOUND</b></JurnlPanel>
      </UpcomingShell>
    );
  }

  return (
    <UpcomingShell screenId="F07.ITEM">
      <FamilyChrome familyId="F07" nodeId="F07.ITEM" backLabel="BACK TO UPCOMING" onBack={() => go('upcoming')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{item.label}</h1>
        <p className="jrn-home__sub">{item.status} · {item.owner_family_id}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>AMOUNT</b>
          <p>{formatMoney(item.amount, item.direction === 'MONEY_IN')}</p>
          <b>DUE</b>
          <p>{item.due_date}</p>
        </JurnlPanel>
        <JurnlButton variant="secondary" trigger="upcoming-source" onClick={() => go(item.source_domain === 'INCOME' ? `income/${item.source_id}` : `upcoming`)}>
          OPEN SOURCE OWNER
        </JurnlButton>
        {item.source_domain === 'OBLIGATION' ?
          <>
            <JurnlButton variant="secondary" trigger="upcoming-edit" onClick={() => setEditOpen(true)}>EDIT</JurnlButton>
            <JurnlButton variant="secondary" trigger="upcoming-end" onClick={() => { getRepository().deleteObligation(item.source_id); go('upcoming'); }}>END</JurnlButton>
          </>
        : null}
      </div>
      {editOpen && item.source_domain === 'OBLIGATION' && obligationById(item.source_id) ?
        <EditObligationSheet item={obligationById(item.source_id)!} onClose={() => setEditOpen(false)} />
      : null}
    </UpcomingShell>
  );
}

function AddObligationSheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cadence, setCadence] = useState<RecurrenceType>('MONTHLY');
  const valid = name.trim().length > 0 && /^\d+(\.\d{1,2})?$/.test(amount.trim());
  return (
    <JurnlDrawer size="long" testId="upcoming-add-sheet" title="ADD WHAT REPEATS" onClose={onClose} footer={
      <JurnlButton disabled={!valid} trigger="upcoming-add-save" onClick={() => { createObligation({ name, amount: Number(amount), cadence, next_due_date: getTodayKey(), kind: 'BILL' }); onClose(); }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="upcoming-add-name" />
      <JurnlInput label="AMOUNT USD" value={amount} onValue={setAmount} trigger="upcoming-add-amount" inputMode="decimal" />
      <div className="jrn-home__choices" role="radiogroup" aria-label="CADENCE">
        {(['WEEKLY', 'MONTHLY'] as RecurrenceType[]).map((c) => (
          <button key={c} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={cadence === c} onClick={() => setCadence(c)}>{c}</button>
        ))}
      </div>
    </JurnlDrawer>
  );
}

function EditObligationSheet({ item, onClose }: { item: NonNullable<ReturnType<typeof obligationById>>; onClose: () => void }) {
  const [amount, setAmount] = useState(String(item.amount));
  return (
    <JurnlDrawer size="long" testId="upcoming-edit-sheet" title="EDIT OBLIGATION" onClose={onClose} footer={
      <JurnlButton trigger="upcoming-edit-save" onClick={() => { getRepository().upsertObligation({ ...item, amount: Number(amount) }); onClose(); }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="AMOUNT USD" value={amount} onValue={setAmount} trigger="upcoming-edit-amount" inputMode="decimal" />
    </JurnlDrawer>
  );
}
