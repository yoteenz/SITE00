/** F11 TRIPS — Wave 4. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { archiveTrip, completeTrip, createTrip, tripById, updateTrip, useTrips } from '../../data/f11/tripsStore';
import { computeSafeToSpend } from '../../data/f09/safeToSpend';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInlineAction, JurnlInput, JurnlPanel } from '../components/primitives';
import { FramePanel, JurnlFamilyFrame, JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F11"
      familyPlate={PARENT_PLATES.F11}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F11" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F11" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

/** F11 TRIPS — MAP / ROUTE. From here, through funding, to the destination. The route line fills as funding lands. */
export function TripsHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const items = useTrips();
  const spec = parentById('F11')!;
  const [addOpen, setAddOpen] = useState(false);
  const active = items.filter((t) => t.status === 'ACTIVE');
  const focus = active[0] ?? null;
  const others = items.filter((t) => t !== focus);
  const funded = focus && focus.target_budget > 0 ? Math.min(1, focus.reserved_amount / focus.target_budget) : 0;
  const sts = computeSafeToSpend();
  const fundingLine = focus ?
      focus.target_budget > 0 ? `${formatMoney(focus.reserved_amount)} OF ${formatMoney(focus.target_budget)} RESERVED` : 'NO BUDGET SET'
    : 'NOT SET';
  return (
    <JurnlFamilyFrame
      screenId="F11.00"
      familyId="F11"
      familyPlate={PARENT_PLATES.F11}
      label="TRIPS"
      archetype="MAP_ROUTE"
      chrome={<FamilyChrome familyId="F11" nodeId="F11.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F11" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F11" nodeId="F11.00" onClose={closeOverlay} /> : null}
          {addOpen ? <TripEditSheet onClose={() => setAddOpen(false)} /> : null}
        </>
      }
    >
      <FramePanel id="intro">
        <header className="jrn-route__intro" data-jrn-zone="intro">
          <h1 className="jrn-route__fn">TRIPS</h1>
          <p className="jrn-lang__state">
            {focus ?
              `${active.length} ${active.length === 1 ? 'TRIP' : 'TRIPS'} PLANNED. ${focus.destination} IS ${Math.round(funded * 100)}% FUNDED.`
            : 'NO TRIP IS SET UP YET.'}
          </p>
          <p className="jrn-lang__task">{focus ? 'RESERVE MONEY FOR IT SO IT STAYS OUT OF SAFE TO SPEND.' : 'ADD A DESTINATION AND A BUDGET TO START.'}</p>
        </header>
      </FramePanel>
      <FramePanel id="route">
        <section className="jrn-route" aria-label={focus ? `ROUTE TO ${focus.destination}` : 'ROUTE NOT SET'} style={{ ['--funded' as string]: funded }}>
          <ol className="jrn-route__stops">
            <li className="jrn-route__stop" data-stop="origin">
              <span className="jrn-route__mark" aria-hidden />
              <span className="jrn-route__kicker">FROM HERE</span>
              <span className="jrn-route__value">TODAY · {formatMoney(sts.value)} SAFE TO SPEND</span>
            </li>
            <li className="jrn-route__stop" data-stop="funding">
              <span className="jrn-route__mark" aria-hidden />
              <span className="jrn-route__kicker">FUNDING</span>
              <span className="jrn-route__value">{fundingLine}</span>
              {focus ?
                <JurnlButton trigger="trip-fund-focus" onClick={() => go(`trips/${focus.trip_id}`)}>FUND THIS TRIP</JurnlButton>
              : null}
            </li>
            <li className="jrn-route__stop" data-stop="destination">
              <span className="jrn-route__mark" aria-hidden />
              <span className="jrn-route__kicker">DESTINATION</span>
              <h2 className="jrn-route__dest">{focus ? focus.destination : 'NOT SET'}</h2>
              {focus ?
                <JurnlInlineAction trigger={`trip-${focus.trip_id}`} onClick={() => go(`trips/${focus.trip_id}`)}>OPEN {focus.title}</JurnlInlineAction>
              : <JurnlButton trigger="trip-add" onClick={() => setAddOpen(true)}>ADD A DESTINATION</JurnlButton>}
            </li>
          </ol>
        </section>
      </FramePanel>
      {others.length ?
        <FramePanel id="others">
          <section className="jrn-route__others" aria-label="OTHER TRIPS">
            <p className="jrn-lang__fn">OTHER TRIPS</p>
            {others.map((t) => {
              const share = t.target_budget > 0 ? Math.min(1, t.reserved_amount / t.target_budget) : 0;
              return (
                <button key={t.trip_id} type="button" className="jrn-route__row" data-jrn-trigger={`trip-${t.trip_id}`} onClick={() => go(`trips/${t.trip_id}`)} style={{ ['--funded' as string]: share }}>
                  <span className="jrn-route__rowname">{t.destination}</span>
                  <span className="jrn-route__rowmeta">{t.status === 'COMPLETE' ? 'DONE' : `${Math.round(share * 100)}% FUNDED`}</span>
                  <span className="jrn-route__rowamt">{formatMoney(t.target_budget)}</span>
                  <i className="jrn-route__rowline" aria-hidden />
                </button>
              );
            })}
          </section>
        </FramePanel>
      : null}
      <FramePanel id="actions">
        <div className="jrn-route__actions">
          {focus ? <JurnlButton variant="secondary" trigger="trip-add" onClick={() => setAddOpen(true)}>PLAN ANOTHER TRIP</JurnlButton> : null}
          <p className="jrn-route__links">
            <JurnlInlineAction trigger="trip-safe" onClick={() => go('safe')}>SAFE TO SPEND</JurnlInlineAction>
          </p>
          <p className="jrn-lang__editorial">{spec.question}</p>
        </div>
      </FramePanel>
    </JurnlFamilyFrame>
  );
}

export function TripDetailScreen() {
  const { tripId } = useParams<{ tripId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  useTrips();
  const trip = tripId ? tripById(tripId) : null;
  const [fundOpen, setFundOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  if (!trip) {
    return (
      <Shell screenId="F11.TRIP">
        <FamilyChrome familyId="F11" nodeId="F11.TRIP" backLabel="BACK" onBack={() => go('trips')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>NOT FOUND</b></JurnlPanel>
      </Shell>
    );
  }
  return (
    <Shell screenId="F11.TRIP">
      <FamilyChrome familyId="F11" nodeId="F11.TRIP" backLabel="BACK" onBack={() => go('trips')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{trip.title}</h1><p className="jrn-home__sub">{trip.destination}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>BUDGET</b>
          <p>{formatMoney(trip.target_budget)}</p>
          <b>RESERVED</b>
          <p>{formatMoney(trip.reserved_amount)}</p>
          <b>PAID</b>
          <p>{formatMoney(trip.paid_amount)}</p>
        </JurnlPanel>
        <JurnlButton trigger="trip-fund" onClick={() => setFundOpen(true)}>FUND THE TRIP</JurnlButton>
        {trip.status === 'ACTIVE' ?
          <JurnlButton variant="secondary" trigger="trip-complete" onClick={() => completeTrip(trip.trip_id)}>MARK COMPLETE</JurnlButton>
        : null}
        <JurnlButton variant="secondary" trigger="trip-remove" onClick={() => setRemoveOpen(true)}>CANCEL</JurnlButton>
      </div>
      {fundOpen ?
        <FundingSheet trip={trip} onClose={() => setFundOpen(false)} />
      : null}
      {removeOpen ?
        <JurnlDrawer expression="confirmation" size="long" testId="trip-remove" title="CANCEL THE TRIP" onClose={() => setRemoveOpen(false)}
          footer={<JurnlButton trigger="trip-remove-ok" onClick={() => { archiveTrip(trip.trip_id); setRemoveOpen(false); go('trips'); }}>REMOVE</JurnlButton>}>
          <p>REMOVE {trip.title}?</p>
        </JurnlDrawer>
      : null}
    </Shell>
  );
}

function TripEditSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [dest, setDest] = useState('');
  const [budget, setBudget] = useState('');
  const { go } = useJurnl();
  return (
    <JurnlDrawer expression="form" size="long" testId="trip-edit" title="NAME A TRIP" onClose={onClose}
      footer={<JurnlButton trigger="trip-save" disabled={!title.trim()} onClick={() => { const t = createTrip({ title, destination: dest || title, target_budget: Number(budget) || 0 }); onClose(); go(`trips/${t.trip_id}`); }}>SAVE</JurnlButton>}>
      <JurnlInput label="NAME" value={title} onValue={setTitle} trigger="trip-name" />
      <JurnlInput label="DESTINATION" value={dest} onValue={setDest} trigger="trip-dest" />
      <JurnlInput label="BUDGET" value={budget} onValue={setBudget} trigger="trip-budget" inputMode="decimal" />
    </JurnlDrawer>
  );
}

function FundingSheet({ trip, onClose }: { trip: ReturnType<typeof tripById>; onClose: () => void }) {
  const [reserve, setReserve] = useState(String(trip?.reserved_amount ?? 0));
  if (!trip) return null;
  const sts = computeSafeToSpend();
  return (
    <JurnlDrawer expression="form" size="long" testId="trip-funding" title="FUND THE TRIP" onClose={onClose}
      footer={<JurnlButton trigger="trip-fund-save" onClick={() => { updateTrip({ ...trip, reserved_amount: Math.max(0, Number(reserve) || 0) }); onClose(); }}>COMMIT RESERVE</JurnlButton>}>
      <p>NOW STS · {formatMoney(sts.value)}</p>
      <JurnlInput label="RESERVED AMOUNT" value={reserve} onValue={setReserve} trigger="trip-reserve" inputMode="decimal" />
      <p className="jrn-currency__note">TARGET ALONE DOES NOT REDUCE SAFE TO SPEND. ONLY COMMITTED RESERVE COUNTS.</p>
    </JurnlDrawer>
  );
}
