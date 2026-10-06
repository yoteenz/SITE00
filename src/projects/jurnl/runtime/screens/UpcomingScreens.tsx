/** F07 UPCOMING — derived projection (Wave 2). */

import { useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { formatRelativeDate, getTodayKey, type RecurrenceType } from '../../data/foundation/dates';
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
import { JurnlButton, JurnlDrawer, JurnlInlineAction, JurnlInput, JurnlPanel } from '../components/primitives';
import { FramePanel, JurnlFamilyFrame, JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';

function UpcomingShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F07"
      familyPlate={PARENT_PLATES.F07}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F07" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F07" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

/** F07 UPCOMING — TIMELINE. A dated sequence, not a calendar grid: overdue, today, this week, later. */
export function UpcomingHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const income = useIncomeSources();
  const obligations = useObligations();
  const spec = parentById('F07')!;
  const items = useMemo(() => projectUpcoming(income, obligations), [income, obligations]);
  const groups = useMemo(() => groupUpcoming(items), [items]);
  const [addOpen, setAddOpen] = useState(false);
  const today = getTodayKey();
  const first = [...items].sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ?? null;
  const sections = (
    [
      ['OVERDUE', 'OVERDUE', groups.OVERDUE],
      ['TODAY', 'TODAY', groups.TODAY],
      ['THIS_WEEK', 'THIS WEEK', groups.THIS_WEEK],
      ['LATER', 'LATER', groups.LATER],
    ] as const
  ).filter(([, , list]) => list.length);
  return (
    <JurnlFamilyFrame
      screenId="F07.00"
      familyId="F07"
      familyPlate={PARENT_PLATES.F07}
      label="UPCOMING"
      archetype="TIMELINE"
      chrome={<FamilyChrome familyId="F07" nodeId="F07.00" backLabel="BACK TO TODAY" onBack={() => go('F03')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F07" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F07" nodeId="F07.00" onClose={closeOverlay} /> : null}
          {addOpen ? <AddObligationSheet onClose={() => setAddOpen(false)} /> : null}
        </>
      }
    >
      <FramePanel id="intro">
        <header className="jrn-tl__intro" data-jrn-zone="intro">
          <h1 className="jrn-tl__h">UPCOMING</h1>
          <p className="jrn-lang__state">
            {first ?
              `${groups.OVERDUE.length ? `${groups.OVERDUE.length} OVERDUE. ` : ''}NEXT: ${first.label}, ${formatRelativeDate(first.due_date, today)}.`
            : 'NOTHING IS COMING UP YET.'}
          </p>
          <p className="jrn-lang__task">{first ? 'BILLS, SUBSCRIPTIONS AND INCOME IN THE ORDER THEY ARRIVE.' : 'ADD BILLS AND SUBSCRIPTIONS THAT REPEAT, AND INCOME THAT ARRIVES.'}</p>
          <p className="jrn-lang__editorial">{spec.question}</p>
        </header>
      </FramePanel>
      {sections.map(([id, title, list]) => (
        <FramePanel key={id} id={`when-${id}`}>
          <section className="jrn-tl" aria-label={title} data-when={id}>
            <p className="jrn-tl__when">{title}</p>
            <ol className="jrn-tl__list">
              {list.map((item) => (
                <li key={item.upcoming_id}>
                  <button type="button" className="jrn-tl__item jrn-tx" data-direction={item.direction} data-jrn-trigger={`upcoming-${item.upcoming_id}`} onClick={() => go(`upcoming/${item.source_id}`)}>
                    <span className="jrn-tl__date">{formatRelativeDate(item.due_date, today)}</span>
                    <span className="jrn-tl__label">{item.label}</span>
                    <span className="jrn-tl__amt">{formatMoney(item.amount, item.direction === 'MONEY_IN')}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </FramePanel>
      ))}
      <FramePanel id="actions">
        <div className="jrn-tl__actions">
          <JurnlButton trigger="upcoming-add" onClick={() => setAddOpen(true)}>ADD WHAT REPEATS</JurnlButton>
          <JurnlInlineAction trigger="upcoming-income" onClick={() => go('income')}>INCOME</JurnlInlineAction>
        </div>
      </FramePanel>
    </JurnlFamilyFrame>
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
        <JurnlButton variant="secondary" trigger="upcoming-source" onClick={() => {
            if (item.source_domain === 'INCOME') go(`income/${item.source_id}`);
            else if (item.source_domain === 'CREDIT_PAYMENT') go(`credit/${item.source_id}`);
            else go('upcoming');
          }}>
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
