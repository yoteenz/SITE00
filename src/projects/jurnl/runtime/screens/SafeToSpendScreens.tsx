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
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function SafeShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F09} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
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

export function SafeToSpendHubScreen() {
  const { go, openOverlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const signal = computeSafeToSpend(draft);
  const spec = parentById('F09')!;
  const [holdOpen, setHoldOpen] = useState(false);
  return (
    <SafeShell screenId="F09.00">
      <FamilyChrome familyId="F09" nodeId="F09.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{spec.name}</h1>
        <p className="jrn-home__sub">{spec.question}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <div className="jrn-home__signal" data-jrn-panel="signal">
          <p className="jrn-home__num">{formatMoney(signal.value)}</p>
          <p className="jrn-home__hint">{signal.completeness} · ONE FORMULA</p>
        </div>
        <BreakdownPanel signal={signal} />
        <JurnlButton trigger="safe-see-why" onClick={() => go('safe/why')}>SEE THE HOLD</JurnlButton>
        <JurnlButton variant="secondary" trigger="safe-change-hold" onClick={() => setHoldOpen(true)}>CHANGE THE HOLD</JurnlButton>
        <JurnlButton variant="secondary" trigger="safe-open-plan" onClick={() => go('plan')}>PLAN</JurnlButton>
      </div>
      {holdOpen ? <HoldSheet onClose={() => setHoldOpen(false)} /> : null}
    </SafeShell>
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
