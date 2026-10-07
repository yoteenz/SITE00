/** F09 SAFE TO SPEND — Wave 3 surfaces around canonical formula. */

import { useState, type ReactNode } from 'react';
import { computeSafeToSpend, type SafeToSpendBreakdown } from '../../data/f09/safeToSpend';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import f09Plate from '../../families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_AUTHORITY_PLATE.png';
import { getRepository } from '../../data/repository/deviceRepository';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlFamilyShell } from '../components/FamilyFrame';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

/** Founder-approved availability line on the F09 parent authority. The formula has no horizon field. */
const AUTHORITY_THROUGH = 'AVAILABLE THROUGH OCT 18';

/** One plate: OpenArt Sunburst replica of the approved scene, scenery and folders together. UI text is live. */
const F09_AUTHORITY_PLATE = {
  family: 'F09',
  scene: 'ENV.AUTHORITY_PLATE',
  src: f09Plate,
  assetId: 'SAFE.ENVIRONMENT.AUTHORITY_PLATE.001',
  width: 1760,
  height: 3840,
};

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

/** F09 parent — founder-approved authority reconstruction (IMAGE 1). Live formula, live nav, live routes. */
export function SafeToSpendHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const signal = computeSafeToSpend(draft);
  const below = signal.value < 0;
  const amount = formatMoney(below ? -signal.value : signal.value);
  const bills = signal.completeness === 'UNSTATED' ? 0 : signal.upcoming;
  const folio = [
    { id: 'bills', label: 'BILLS', amount: formatMoney(bills) },
    { id: 'plans', label: 'PLANS', amount: formatMoney(signal.assigned) },
    { id: 'goals', label: 'GOALS', amount: formatMoney(signal.goalReserved) },
    { id: 'buffer', label: 'BUFFER', amount: formatMoney(signal.safetyBuffer) },
  ];
  return (
    <JurnlScreen screenId="F09.00" familyPlate={F09_AUTHORITY_PLATE} family productNav>
      <div className="jrn-f09a" data-jrn-authority="F09-APPROVED-IMAGE-1" data-jrn-zone="intro">
        <header className="jrn-f09a__brand">
          <div className="jrn-f09a__lockup">
            <div className="jrn-f09a__mark" role="img" aria-label="JURNL" data-jrn-logo="official-staged">
              <span className="jrn-f09a__sprig" aria-hidden />
              <span className="jrn-f09a__word" aria-hidden>
                <i data-letter="J" /><i data-letter="U" /><i data-letter="R" /><i data-letter="N" /><i data-letter="L" />
              </span>
            </div>
            <p className="jrn-f09a__descriptor">FINANCIAL LIFE.<br />BEAUTIFULLY ORGANIZED.</p>
          </div>
          <button type="button" className="jrn-f09a__menu" aria-label="MENU" data-jrn-trigger="f09-menu" onClick={() => go('account')}>
            <span /><span /><span />
          </button>
          <p className="jrn-f09a__tag">PLAN TODAY.<br />GROW FREELY.</p>
        </header>
        <section className="jrn-f09a__signal" data-jrn-panel="signal" data-below={below ? 'true' : 'false'}>
          <h1>{below ? 'OVER BY' : 'SAFE TO SPEND'}</h1>
          <p className="jrn-f09a__amount">{amount}</p>
          <p className="jrn-f09a__through">{AUTHORITY_THROUGH}</p>
          <button type="button" className="jrn-f09a__why" data-jrn-trigger="safe-see-why" onClick={() => go('safe/why')}>
            SEE WHY THIS AMOUNT <span aria-hidden>→</span>
          </button>
        </section>
        <article className="jrn-f09a__folio" aria-label="YOUR MONEY">
          <div className="jrn-f09a__folio-copy">
            <p className="jrn-f09a__kicker">YOUR MONEY</p>
            <p className="jrn-f09a__headline">ORGANIZED.<br />THEN YOURS.</p>
            <ul>
              {folio.map((row) => (
                <li key={row.id}><span>{row.label}</span><b>{row.amount}</b></li>
              ))}
            </ul>
          </div>
        </article>
        <section className="jrn-f09a__bridge" aria-label="CHECK A PURCHASE">
          <p><b>WANT TO SPEND ON SOMETHING?</b> CHECK HOW IT FITS YOUR PLAN BEFORE YOU BUY.</p>
          <button type="button" data-jrn-trigger="safe-check-purchase" onClick={() => go('purchases')}>
            CHECK A PURCHASE <span aria-hidden>→</span>
          </button>
        </section>
      </div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId="F09.00" onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function SafeToSpendWhyScreen() {
  const { go, openOverlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const signal = computeSafeToSpend(draft);
  const [holdOpen, setHoldOpen] = useState(false);
  return (
    <SafeShell screenId="F09.WHY">
      <FamilyChrome familyId="F09" nodeId="F09.WHY" backLabel="BACK TO SAFE" onBack={() => go('safe')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">WHY THIS NUMBER</h1>
        <p className="jrn-home__sub">{formatMoney(signal.value)}</p>
        <p className="jrn-lang__state">{STATE_LINE[signal.completeness]}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <BreakdownPanel signal={signal} />
        <JurnlButton variant="secondary" trigger="safe-change-hold" onClick={() => setHoldOpen(true)}>CHANGE WHAT’S HELD</JurnlButton>
      </div>
      {holdOpen ? <HoldSheet onClose={() => setHoldOpen(false)} /> : null}
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
