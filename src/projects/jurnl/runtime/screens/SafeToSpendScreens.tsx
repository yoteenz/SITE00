/** F09 SAFE TO SPEND — Wave 3 surfaces around canonical formula. */

import { useState, type ReactNode } from 'react';
import { computeSafeToSpend, type SafeToSpendBreakdown } from '../../data/f09/safeToSpend';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
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

function SafeShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F09"
      familyPlate={PARENT_PLATES.F09}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

function BreakdownPanel({ signal }: { signal: SafeToSpendBreakdown }) {
  return (
    <JurnlPanel role="detail" className="jrn-home__panel" data-jrn-panel="sts-breakdown">
      <b>CASH</b>
      <p>{formatMoney(signal.cash)} · {signal.cashSource}</p>
      <b>UPCOMING</b>
      <p>{formatMoney(signal.upcoming)} · {signal.upcomingSource}</p>
      <b>HELD</b>
      <p>{formatMoney(signal.protected)}</p>
      <b>ASSIGNED</b>
      <p>{formatMoney(signal.assigned)} · {signal.assignedSource}</p>
      <b>GOAL SET ASIDE</b>
      <p>{formatMoney(signal.goalReserved)} · {signal.goalReservedSource}</p>
      <b>SAFETY BUFFER</b>
      <p>{formatMoney(signal.safetyBuffer)}</p>
      <b>COMPLETENESS</b>
      <p>{signal.completeness}</p>
    </JurnlPanel>
  );
}

/** Plain state line for each completeness level. The number never stands alone without saying how sure it is. */
const STATE_LINE: Record<SafeToSpendBreakdown['completeness'], string> = {
  COMPLETE: 'WHAT YOU CAN SPEND NOW WITHOUT TOUCHING BILLS, PLANS OR WHAT YOU’RE HOLDING.',
  PARTIAL: 'AN ESTIMATE. SOME BILLS OR AMOUNTS ARE STILL MISSING.',
  NEEDS_SETUP: 'AN ESTIMATE. FINISH SETUP FOR A FULL READING.',
  NEEDS_ACCOUNT: 'ADD A CASH PLACE IN MONEY TO SEE WHAT’S SAFE TO SPEND.',
  UNSTATED: 'NOT ENOUGH IS KNOWN YET TO SAY.',
};

/** F09 SAFE TO SPEND — TENSION / THRESHOLD. Open space above the line, held territory below it. */
export function SafeToSpendHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const signal = computeSafeToSpend(draft);
  const spec = parentById('F09')!;
  const [holdOpen, setHoldOpen] = useState(false);
  const heldTotal = Math.max(0, signal.cash - signal.value);
  const bands = [
    // UNSTATED readings do not deduct upcoming bills (see computeSafeToSpend); show only what was held.
    { id: 'upcoming', label: 'BILLS BEFORE NEXT INCOME', amount: signal.completeness === 'UNSTATED' ? 0 : signal.upcoming },
    { id: 'protected', label: 'PROTECTED', amount: signal.protected },
    { id: 'assigned', label: 'ASSIGNED IN PLAN', amount: signal.assigned },
    { id: 'goals', label: 'SET ASIDE FOR GOALS', amount: signal.goalReserved },
    { id: 'purchases', label: 'RESERVED FOR PURCHASES', amount: signal.purchaseReserved },
    { id: 'trips', label: 'RESERVED FOR TRIPS', amount: signal.tripReserved },
    { id: 'buffer', label: 'SAFETY BUFFER', amount: signal.safetyBuffer },
  ].filter((b) => b.amount > 0);
  const share = (amount: number) => (signal.cash > 0 ? Math.min(1, amount / signal.cash) : 0);
  const below = signal.value < 0;
  return (
    <JurnlFamilyFrame
      screenId="F09.00"
      familyId="F09"
      familyPlate={PARENT_PLATES.F09}
      label="SAFE TO SPEND"
      archetype="TENSION_THRESHOLD"
      chrome={<FamilyChrome familyId="F09" nodeId="F09.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId="F09.00" onClose={closeOverlay} /> : null}
          {holdOpen ? <HoldSheet onClose={() => setHoldOpen(false)} /> : null}
        </>
      }
    >
      <FramePanel id="threshold">
        <section className="jrn-thr" data-jrn-zone="intro" data-below={below ? 'true' : 'false'}>
          <h1 className="jrn-thr__fn">SAFE TO SPEND</h1>
          <p className="jrn-lang__state jrn-thr__state">{STATE_LINE[signal.completeness]}</p>
          <div className="jrn-thr__open" data-jrn-panel="signal">
            <span className="jrn-thr__above">{below ? 'OVER BY' : 'CLEAR TO SPEND'}</span>
            <p className="jrn-thr__num jrn-home__num">{formatMoney(below ? -signal.value : signal.value)}</p>
          </div>
          <span className="jrn-thr__line" aria-hidden />
          <p className="jrn-thr__below">
            HELD BACK <b>{formatMoney(heldTotal)}</b> OF <b>{formatMoney(signal.cash)}</b> CASH
          </p>
        </section>
      </FramePanel>
      <FramePanel id="held">
        <section className="jrn-thr__held" aria-label="WHAT IS HELD BACK" data-jrn-panel="sts-breakdown">
          {bands.length ?
            bands.map((b) => (
              <div key={b.id} className="jrn-thr__band" data-band={b.id}>
                <span className="jrn-thr__bandlabel">{b.label}</span>
                <b className="jrn-thr__bandamt">{formatMoney(b.amount)}</b>
                <i className="jrn-thr__bar" style={{ ['--share' as string]: share(b.amount) }} aria-hidden />
              </div>
            ))
          : <p className="jrn-lang__task">NOTHING IS HELD BACK YET. BILLS, PLANS AND RESERVES WILL APPEAR HERE.</p>}
        </section>
      </FramePanel>
      <FramePanel id="actions">
        <div className="jrn-thr__actions">
          <JurnlButton trigger="safe-see-why" onClick={() => go('safe/why')}>SEE THE FULL BREAKDOWN</JurnlButton>
          <JurnlButton variant="secondary" trigger="safe-change-hold" onClick={() => setHoldOpen(true)}>CHANGE WHAT’S HELD</JurnlButton>
          <p className="jrn-thr__links">
            <JurnlInlineAction trigger="safe-open-plan" onClick={() => go('plan')}>PLAN</JurnlInlineAction>
          </p>
        </div>
      </FramePanel>
      <FramePanel id="editorial">
        <p className="jrn-lang__editorial jrn-thr__editorial">{spec.question}</p>
      </FramePanel>
    </JurnlFamilyFrame>
  );
}

export function SafeToSpendWhyScreen() {
  const { go, openOverlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const signal = computeSafeToSpend(draft);
  return (
    <SafeShell screenId="F09.WHY">
      <FamilyChrome familyId="F09" nodeId="F09.WHY" backLabel="BACK TO SAFE" onBack={() => go('safe')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">WHY THIS NUMBER</h1>
        <p className="jrn-home__sub">{formatMoney(signal.value)}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <BreakdownPanel signal={signal} />
      </div>
    </SafeShell>
  );
}

function HoldSheet({ onClose }: { onClose: () => void }) {
  const draft = useSetup();
  const [held, setHeld] = useState(draft.protectedAmount);
  const [buffer, setBuffer] = useState(getRepository().getSettings().safeToSpendBuffer);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <JurnlDrawer expression="form" size="long" testId="safe-hold" title="CHANGE THE HOLD" onClose={onClose}
        footer={<JurnlButton trigger="safe-hold-next" onClick={() => setConfirm(true)}>CONTINUE</JurnlButton>}>
        <JurnlInput label="PROTECTED AMOUNT" value={held} onValue={setHeld} trigger="safe-hold-amount" inputMode="decimal" />
        <JurnlInput label="SAFETY BUFFER" value={buffer} onValue={setBuffer} trigger="safe-buffer" inputMode="decimal" />
      </JurnlDrawer>
      {confirm ?
        <JurnlDrawer expression="confirmation" size="long" testId="safe-hold-confirm" title="CONFIRM THE HOLD" onClose={() => setConfirm(false)}
          footer={<JurnlButton trigger="safe-hold-save" onClick={() => { patchSetup({ protectedAmount: held, protectedSkipped: false }); getRepository().patchSettings({ safeToSpendBuffer: buffer }); setConfirm(false); onClose(); }}>SAVE</JurnlButton>}>
          <p>UPDATE HOLD AND BUFFER?</p>
        </JurnlDrawer>
      : null}
    </>
  );
}
