/** F07 UPCOMING — derived projection (Wave 2). */

import { useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { formatCalendarDate, formatRelativeDate, getTodayKey } from '../../data/foundation/dates';
import { groupUpcoming, projectUpcoming } from '../../data/foundation/upcomingProjection';
import { obligationById, useObligations } from '../../data/f07/obligationsStore';
import { CADENCE_LABEL, obligationFunding } from '../../data/f07/obligationLifecycle';
import { SUBSCRIPTION_VIEW_LABEL, annualEquivalent, monthlyEquivalent, subscriptionTotals, subscriptionsIn, type SubscriptionView } from '../../data/f07/subscriptions';
import { useRepoTick } from '../../data/home/money';
import { Chips, ObligationFormSheet, ObligationMoreSheet, PayObligationSheet, SetAsideSheet, obligationTarget } from '../finance/FinanceSheets';
import type { JurnlObligation } from '../../data/foundation/obligations';
import { useIncomeSources } from '../../data/f06/incomeStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { getRepository } from '../../data/repository/deviceRepository';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlInlineAction, JurnlPanel } from '../components/primitives';
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
  const tick = useRepoTick();
  const spec = parentById('F07')!;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => projectUpcoming(income, obligations), [income, obligations, tick]);
  const snap = getRepository().getSnapshot();
  const fundingOf = (id: string) => {
    const ob = obligations.find((o) => o.obligation_id === id);
    return ob ? obligationFunding(ob, snap.transactions, snap.reservations) : null;
  };
  const groups = useMemo(() => groupUpcoming(items), [items]);
  const weekBills = items.filter((i) => i.source_domain !== 'INCOME' && i.direction === 'MONEY_OUT' && (groups.OVERDUE.includes(i) || groups.TODAY.includes(i) || groups.THIS_WEEK.includes(i)));
  const stillNeeded = weekBills.reduce((t, i) => t + (i.source_domain === 'OBLIGATION' ? fundingOf(i.source_id)?.stillNeeded ?? 0 : i.amount), 0);
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
          {addOpen ? <ObligationFormSheet onClose={() => setAddOpen(false)} /> : null}
        </>
      }
    >
      <FramePanel id="intro">
        <header className="jrn-tl__intro" data-jrn-zone="intro">
          <h1 className="jrn-tl__h">UPCOMING</h1>
          <p className="jrn-lang__state" data-testid="upcoming-state">
            {first ?
              `${groups.OVERDUE.length ? `${groups.OVERDUE.length} OVERDUE. ` : ''}${weekBills.length ? `${weekBills.length} ${weekBills.length === 1 ? 'PAYMENT' : 'PAYMENTS'} DUE THIS WEEK${stillNeeded > 0 ? `, ${formatMoney(stillNeeded)} STILL NEEDED` : ', ALL SET ASIDE'}. ` : ''}NEXT: ${first.label}, ${formatRelativeDate(first.due_date, today)}.`
            : 'NOTHING IS COMING UP YET.'}
          </p>
          <p className="jrn-lang__task">{first ? 'BILLS, SUBSCRIPTIONS, CARD PAYMENTS AND INCOME BY DUE DATE.' : 'ADD BILLS AND SUBSCRIPTIONS THAT REPEAT, AND INCOME YOU EXPECT.'}</p>
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
                    <span className="jrn-tl__amt">{formatMoney(item.source_domain === 'OBLIGATION' ? fundingOf(item.source_id)?.remaining ?? item.amount : item.amount, item.direction === 'MONEY_IN')}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </FramePanel>
      ))}
      <FramePanel id="actions">
        <div className="jrn-tl__actions">
          <JurnlButton trigger="upcoming-add" onClick={() => setAddOpen(true)}>ADD A BILL OR SUBSCRIPTION</JurnlButton>
          <JurnlInlineAction trigger="upcoming-subscriptions" onClick={() => go('upcoming/subscriptions')}>SUBSCRIPTIONS</JurnlInlineAction>
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
  useRepoTick();
  const income = useIncomeSources();
  const obligations = useObligations();
  const item = useMemo(() => projectUpcoming(income, obligations).find((p) => p.source_id === itemId), [income, obligations, itemId]);
  const [sheet, setSheet] = useState<'edit' | 'pay' | 'aside' | 'more' | null>(null);
  // Paused or stopped bills are not in the projection; their record still opens here.
  const ob = itemId ? obligationById(itemId) : null;

  if (!item && !ob) {
    return (
      <UpcomingShell screenId="F07.ITEM">
        <FamilyChrome familyId="F07" nodeId="F07.ITEM" backLabel="BACK" onBack={() => go('upcoming')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>NOT FOUND</b></JurnlPanel>
      </UpcomingShell>
    );
  }

  if (ob) return <ObligationDetail ob={ob} sheet={sheet} setSheet={setSheet} />;

  return (
    <UpcomingShell screenId="F07.ITEM">
      <FamilyChrome familyId="F07" nodeId="F07.ITEM" backLabel="BACK TO UPCOMING" onBack={() => go('upcoming')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{item!.label}</h1>
        <p className="jrn-home__sub">{item!.source_domain === 'INCOME' ? 'EXPECTED INCOME' : 'CARD PAYMENT'} · {item!.status === 'OVERDUE' ? 'OVERDUE' : item!.status === 'DUE_TODAY' ? 'DUE TODAY' : 'UPCOMING'}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>{item!.source_domain === 'CREDIT_PAYMENT' ? 'MINIMUM STILL DUE' : 'AMOUNT'}</b>
          <p>{formatMoney(item!.amount, item!.direction === 'MONEY_IN')}</p>
          <b>DUE</b>
          <p>{formatCalendarDate(item!.due_date)}</p>
        </JurnlPanel>
        <JurnlButton variant="secondary" trigger="upcoming-source" onClick={() => {
            if (item!.source_domain === 'INCOME') go(`income/${item!.source_id}`);
            else go(`credit/${item!.source_id}`);
          }}>
          {item!.source_domain === 'INCOME' ? 'OPEN INCOME' : 'OPEN CARD'}
        </JurnlButton>
      </div>
    </UpcomingShell>
  );
}

function ObligationDetail({ ob, sheet, setSheet }: { ob: JurnlObligation; sheet: 'edit' | 'pay' | 'aside' | 'more' | null; setSheet: (s: 'edit' | 'pay' | 'aside' | 'more' | null) => void }) {
  const { go, openOverlay } = useJurnl();
  const snap = getRepository().getSnapshot();
  const f = obligationFunding(ob, snap.transactions, snap.reservations);
  const today = getTodayKey();
  const account = snap.accounts.find((a) => a.account_id === ob.account_id);
  const active = ob.status === 'ACTIVE';
  const statusWord = ob.status === 'ACTIVE' ? (ob.next_due_date < today ? 'OVERDUE' : ob.next_due_date === today ? 'DUE TODAY' : 'UPCOMING') : ob.status === 'PAUSED' ? 'PAUSED' : ob.status === 'COMPLETED' ? 'PAID' : 'NOT TRACKED';
  return (
    <UpcomingShell screenId="F07.ITEM">
      <FamilyChrome familyId="F07" nodeId="F07.ITEM" backLabel="BACK TO UPCOMING" onBack={() => go('upcoming')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{ob.name}</h1>
        <p className="jrn-home__sub" data-testid="obligation-status">{ob.kind === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'BILL'} · {CADENCE_LABEL[ob.cadence]} · {statusWord}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel" data-testid="obligation-funding">
          <b>{active ? `DUE ${formatRelativeDate(ob.next_due_date, today)}` : 'AMOUNT'}</b>
          <p>{formatMoney(f.amount)}</p>
          {active ? (
            <>
              <b>SET ASIDE</b>
              <p data-testid="obligation-funding-line">{f.label}</p>
            </>
          ) : null}
          <b>PAID FROM</b>
          <p>{account?.display_name ?? 'NOT SET — CHOOSE IN EDIT'}</p>
          {ob.trial_end_date ? (<><b>FREE TRIAL ENDS</b><p>{formatCalendarDate(ob.trial_end_date)}</p></>) : null}
          {ob.status === 'CANCELLED' ? <p>TRACKING STOPPED IN JURNL. THIS DOES NOT CANCEL IT WITH THE COMPANY.</p> : null}
        </JurnlPanel>
        {active && f.remaining > 0 ? <JurnlButton trigger="upcoming-set-aside" onClick={() => setSheet('aside')}>SET MONEY ASIDE</JurnlButton> : null}
        {active ? <JurnlButton variant="secondary" trigger="upcoming-mark-paid" onClick={() => setSheet('pay')}>MARK PAID</JurnlButton> : null}
        <JurnlButton variant="secondary" trigger="upcoming-more" onClick={() => setSheet('more')}>MORE</JurnlButton>
      </div>
      {sheet === 'edit' ? <ObligationFormSheet existing={ob} onClose={() => setSheet(null)} /> : null}
      {sheet === 'pay' ? <PayObligationSheet obligation={ob} onClose={() => setSheet(null)} /> : null}
      {sheet === 'aside' ? <SetAsideSheet target={obligationTarget(ob)} defaultAccountId={ob.account_id} onClose={() => setSheet(null)} /> : null}
      {sheet === 'more' ? <ObligationMoreSheet obligation={ob} onClose={() => setSheet(null)} onEdit={() => setSheet('edit')} onEnded={() => { setSheet(null); go('upcoming'); }} /> : null}
    </UpcomingShell>
  );
}

/** F07 SUBSCRIPTIONS — canonical obligations of kind SUBSCRIPTION, by state. */
export function SubscriptionsScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  useRepoTick();
  const [view, setView] = useState<SubscriptionView>('ACTIVE');
  const [addOpen, setAddOpen] = useState(false);
  const all = getRepository().getSnapshot().obligations;
  const today = getTodayKey();
  const list = subscriptionsIn(all, view, today);
  const totals = subscriptionTotals(all);
  return (
    <UpcomingShell screenId="F07.SUBSCRIPTIONS">
      <FamilyChrome familyId="F07" nodeId="F07.SUBSCRIPTIONS" backLabel="BACK TO UPCOMING" onBack={() => go('upcoming')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">SUBSCRIPTIONS</h1>
        <p className="jrn-home__sub" data-testid="subscriptions-totals">
          {totals.count ?
            `${totals.count} ACTIVE · ${formatMoney(totals.monthly)} A MONTH${totals.mixedCadence ? ' (ESTIMATED)' : ''} · ${formatMoney(totals.annual)} A YEAR`
          : 'NO ACTIVE SUBSCRIPTIONS.'}
        </p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <Chips label="SHOW" value={view} options={(['ACTIVE', 'UPCOMING', 'PAUSED', 'CANCELLED'] as SubscriptionView[]).map((v) => ({ id: v, label: SUBSCRIPTION_VIEW_LABEL[v] }))} onChange={setView} trigger="subs-view" />
        {totals.nextRenewal ? <JurnlPanel role="detail" className="jrn-home__panel"><b>NEXT RENEWAL</b><p>{`${totals.nextRenewal.obligation.name} · ${formatRelativeDate(totals.nextRenewal.date, today)} · ${formatMoney(totals.nextRenewal.obligation.amount)}`}</p></JurnlPanel> : null}
        {list.length === 0 ? <JurnlPanel role="empty" className="jrn-home__panel"><b>NONE HERE</b><p>{view === 'ACTIVE' ? 'ADD A SUBSCRIPTION TO TRACK ITS PRICE AND RENEWAL DATE.' : 'NOTHING IN THIS LIST.'}</p></JurnlPanel> : null}
        {list.map((o) => {
          const m = monthlyEquivalent(o.amount, o.cadence);
          const y = annualEquivalent(o.amount, o.cadence);
          return (
            <button key={o.obligation_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`subs-${o.obligation_id}`} onClick={() => go(`upcoming/${o.obligation_id}`)}>
              <span className="jrn-tx__copy">
                <span className="jrn-tx__name">{o.name}</span>
                <small>{`${CADENCE_LABEL[o.cadence]} · ${o.status === 'ACTIVE' ? `RENEWS ${formatRelativeDate(o.next_due_date, today)}` : o.status === 'PAUSED' ? 'PAUSED' : 'NOT TRACKED'}${m != null && o.cadence !== 'MONTHLY' ? ` · ${formatMoney(m)} A MONTH` : ''}${y != null ? ` · ${formatMoney(y)} A YEAR` : ''}`}</small>
              </span>
              <span className="jrn-tx__amt">{formatMoney(o.amount)}</span>
            </button>
          );
        })}
        <JurnlButton trigger="subs-add" onClick={() => setAddOpen(true)}>ADD A SUBSCRIPTION</JurnlButton>
      </div>
      {addOpen ? <ObligationFormSheet defaultKind="SUBSCRIPTION" onClose={() => setAddOpen(false)} /> : null}
    </UpcomingShell>
  );
}
