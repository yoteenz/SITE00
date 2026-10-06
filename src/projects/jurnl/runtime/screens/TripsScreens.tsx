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
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F11} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F11" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F11" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function TripsHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const items = useTrips();
  const spec = parentById('F11')!;
  const [addOpen, setAddOpen] = useState(false);
  return (
    <Shell screenId="F11.00">
      <FamilyChrome familyId="F11" nodeId="F11.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{spec.name}</h1><p className="jrn-home__sub">{spec.question}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {items.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>NO TRIP IS NAMED</b></JurnlPanel>
        : items.map((t) => (
            <button key={t.trip_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`trip-${t.trip_id}`} onClick={() => go(`trips/${t.trip_id}`)}>
              <span className="jrn-tx__copy"><span className="jrn-tx__name">{t.title}</span><small>{t.destination}</small></span>
              <span className="jrn-tx__amt">{formatMoney(t.target_budget)}</span>
            </button>
          ))}
        <JurnlButton trigger="trip-add" onClick={() => setAddOpen(true)}>NAME A TRIP</JurnlButton>
        <JurnlButton variant="secondary" trigger="trip-safe" onClick={() => go('safe')}>SAFE TO SPEND</JurnlButton>
      </div>
      {addOpen ? <TripEditSheet onClose={() => setAddOpen(false)} /> : null}
    </Shell>
  );
}

export function TripDetailScreen() {
  const { tripId } = useParams<{ tripId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
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
