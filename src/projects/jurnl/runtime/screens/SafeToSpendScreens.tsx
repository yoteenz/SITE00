/**
 * F09 SAFE TO SPEND — the parent and WHY THIS NUMBER around the canonical formula. WHY THIS NUMBER and /safe/reference
 * are founder reference replicas (P0.JURNL.F09.REFERENCE-REPLICA1); /safe keeps the founder-tuned authority.
 */

import { useState } from 'react';
import { computeSafeToSpend, type SafeToSpendBreakdown } from '../../data/f09/safeToSpend';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
import { formatMoney, useCurrency } from '../../data/home/money';
import f09Plate from '../../families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_AUTHORITY_PLATE.png';
import f09TabletPlate from '../../families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_TABLET_PLATE.png';
import f09DesktopPlate from '../../families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_DESKTOP_PLATE.png';
import { getRepository } from '../../data/repository/deviceRepository';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { initialsOf, useJurnl } from '../state/store';
import parentPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_PARENT_PLATE.jpg';
import { REF_PARENT, REF_WHY } from '../layout/referenceLayout';
import whyPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_WHY_PLATE.jpg';
import whySprig from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/WHY_SPRIG_OLIVE.png';
import lockupWord from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png';
import { ReferenceStage, RefIcon, RefText, at } from '../components/ReferenceStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { AccountDrawer } from './AccountScreens';

/** Founder-approved availability line on the F09 parent authority. The formula has no horizon field. */
const AUTHORITY_THROUGH = 'AVAILABLE THROUGH OCT 18';

/**
 * One plate per breakpoint. Scenery and the blank physical folio are in the photograph.
 * UI text stays live. Mobile plate is unchanged (history PQTsHqqy3Pf0ZpQJougi).
 * Tablet: OpenArt history OVMaDl8ByEBZKw70HFG1, 2400×3440.
 * Desktop: OpenArt history RQxfgcBWYfJtT7nvntJQ, 3072×2048.
 */
const F09_AUTHORITY_PLATE = {
  family: 'F09',
  scene: 'ENV.AUTHORITY_PLATE',
  src: f09Plate,
  tabletSrc: f09TabletPlate,
  desktopSrc: f09DesktopPlate,
  assetId: 'SAFE.ENVIRONMENT.AUTHORITY_PLATE.001',
  width: 1760,
  height: 3840,
};

/** Plain state line for each completeness level. The number never stands alone without saying how sure it is. */
const STATE_LINE: Record<SafeToSpendBreakdown['completeness'], string> = {
  COMPLETE: 'WHAT YOU CAN SPEND NOW WITHOUT TOUCHING BILLS, PLANS OR WHAT YOU’RE HOLDING.',
  PARTIAL: 'AN ESTIMATE. SOME BILLS OR AMOUNTS ARE STILL MISSING.',
  NEEDS_SETUP: 'AN ESTIMATE. FINISH SETUP FOR A FULL READING.',
  NEEDS_ACCOUNT: 'ADD A CASH PLACE IN MONEY TO SEE WHAT’S SAFE TO SPEND.',
  UNSTATED: 'NOT ENOUGH IS KNOWN YET TO SAY.',
};

/** F09 parent (/safe): the founder-tuned authority reconstruction on main. */
export function SafeToSpendHubScreen() {
  return <SafeToSpendAuthority />;
}

const PARENT_PLATE = { src: parentPlate, assetId: 'SAFE.REFERENCE_REPLICA.PARENT_PLATE.INTERIM' };

/** Live figures for the parent: the formula's value and the four folio amounts. */
function useParentFigures() {
  const draft = useSetup();
  useCurrency();
  const signal = computeSafeToSpend(draft);
  const below = signal.value < 0;
  const bills = signal.completeness === 'UNSTATED' ? 0 : signal.upcoming;
  return {
    below,
    amount: formatMoney(below ? -signal.value : signal.value),
    folio: [
      { id: 'Bills', label: 'BILLS', amount: formatMoney(bills) },
      { id: 'Plans', label: 'PLANS', amount: formatMoney(signal.assigned) },
      { id: 'Goals', label: 'GOALS', amount: formatMoney(signal.goalReserved) },
      { id: 'Buffer', label: 'BUFFER', amount: formatMoney(signal.safetyBuffer) },
    ] as const,
  };
}

/**
 * F09.00 as founder reference 01 draws it (/safe/reference). Kept beside /safe because main records the founder rule
 * that the lockup stays off F09.00, while reference 01 shows it. The founder chooses which one becomes the parent.
 */
export function SafeToSpendReferenceScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  const { below, amount, folio } = useParentFigures();
  const [drawer, setDrawer] = useState(false);
  const L = REF_PARENT;
  return (
    <ReferenceStage
      screenId="F09.00.REFERENCE"
      plate={PARENT_PLATE}
      label="SAFE TO SPEND"
      outside={
        <>
          <JurnlProductNav marks="authority" current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId="F09.00" onClose={closeOverlay} /> : null}
        </>
      }
    >
      <div className="jrn-ref__root" data-jrn-authority="F09-REFERENCE-IMAGE-1" data-jrn-zone="intro">
        <ReferenceLockup L={L} />
        <button type="button" aria-label="MENU" data-jrn-trigger="f09-menu" onClick={() => setDrawer(true)} style={at([L.box.menu[0] - 14, L.box.menu[1] - 14, L.box.menu[2] + 14, L.box.menu[3] + 14])}>
          <RefIcon name="menu" box={[14, 14, 14 + L.box.menu[2] - L.box.menu[0], 14 + L.box.menu[3] - L.box.menu[1]]} stroke={2.2} />
        </button>
        <section data-jrn-panel="signal" data-below={below ? 'true' : 'false'}>
          <RefText t={L.text.signal} as="h1">{below ? 'OVER BY' : 'SAFE TO SPEND'}</RefText>
          <RefText t={L.text.amount} className="jrn-ref__amount-hero">{amount}</RefText>
          <RefText t={L.text.through} className="jrn-ref__soft">{AUTHORITY_THROUGH}</RefText>
          <button type="button" className="jrn-ref__ghost jrn-ref__why" data-jrn-trigger="safe-see-why" onClick={() => go('safe/why')} style={at(L.box.why)}>
            <RefText t={L.text.why} origin={L.box.why} as="span">SEE WHY THIS AMOUNT</RefText>
            <RefIcon name="arrow" box={L.box.whyArrow} origin={L.box.why} stroke={2} />
          </button>
        </section>
        <ol className="jrn-ref__tabs" aria-hidden>
          {folio.map((row) => (
            <RefText key={row.id} t={L.text[`tab${row.id}`]} as="li" data-tab={row.id.toLowerCase()}>{row.label}</RefText>
          ))}
        </ol>
        <article aria-label="YOUR MONEY" data-jrn-panel="folio">
          <RefText t={L.text.kicker}>YOUR MONEY</RefText>
          <RefText t={L.text.head1} className="jrn-ref__headline">ORGANIZED.</RefText>
          <RefText t={L.text.head2} className="jrn-ref__headline">THEN YOURS.</RefText>
          <span className="jrn-ref__rule" style={at(L.box.rule)} />
          {[L.box.div1, L.box.div2, L.box.div3].map((b, i) => <span key={i} className="jrn-ref__divider" style={at(b)} />)}
          <ul>
            {folio.map((row) => (
              <li key={row.id}>
                <RefText t={L.text[`lbl${row.id}`]} as="span">{row.label}</RefText>
                <RefText t={L.text[`amt${row.id}`]} as="b">{row.amount}</RefText>
              </li>
            ))}
          </ul>
        </article>
        <section className="jrn-ref__panel jrn-ref__bridge" aria-label="CHECK A PURCHASE" style={at(L.box.bridge)}>
          <RefIcon name="spark" box={L.box.spark} origin={L.box.bridge} stroke={2} className="jrn-ref__spark" />
          <RefText t={L.text.want} origin={L.box.bridge}>WANT TO SPEND ON SOMETHING?</RefText>
          <RefText t={L.text.g1} origin={L.box.bridge} className="jrn-ref__muted">CHECK HOW IT FITS YOUR PLAN</RefText>
          <RefText t={L.text.g2} origin={L.box.bridge} className="jrn-ref__muted">BEFORE YOU BUY.</RefText>
          <button type="button" className="jrn-ref__pill" data-jrn-trigger="safe-check-purchase" onClick={() => go('safe/check')} style={at(L.box.pill, L.box.bridge)}>
            <RefText t={L.text.pill} origin={L.box.pill} as="span">CHECK A PURCHASE</RefText>
            <RefIcon name="arrow" box={L.box.pillArrow} origin={L.box.pill} stroke={2} />
          </button>
        </section>
      </div>
      {drawer ? <AccountDrawer onClose={() => setDrawer(false)} /> : null}
    </ReferenceStage>
  );
}

/** F09 parent — founder-approved authority reconstruction. Live formula, live nav, live routes. */
function SafeToSpendAuthority() {
  const { go, openOverlay, closeOverlay, overlay, session } = useJurnl();
  const monogram = session.account ? initialsOf(session.account) : 'JL';
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
        <div className="jrn-f09a__art">
        <header className="jrn-f09a__brand">
          <button type="button" className="jrn-f09a__account" aria-label="ACCOUNT" data-jrn-trigger="f09-account" onClick={() => go('account')}>
            {monogram}
          </button>
          <button type="button" className="jrn-f09a__menu" aria-label="MENU" data-jrn-trigger="f09-menu" onClick={() => go('account')}>
            <svg viewBox="0 0 40 26" aria-hidden>
              <path d="M0 1.5h40M0 13h40M0 24.5h40" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <section className="jrn-f09a__signal" data-jrn-panel="signal" data-below={below ? 'true' : 'false'}>
          <h1>{below ? 'OVER BY' : 'SAFE TO SPEND'}</h1>
          <p className="jrn-f09a__amount">{amount}</p>
          <p className="jrn-f09a__through">{AUTHORITY_THROUGH}</p>
          <button type="button" className="jrn-f09a__why" data-jrn-trigger="safe-see-why" onClick={() => go('safe/why')}>
            SEE WHY THIS AMOUNT <span aria-hidden>→</span>
          </button>
        </section>
        <ol className="jrn-f09a__tabs" aria-hidden>
          {folio.map((row) => (
            <li key={row.id} data-tab={row.id}>{row.label}</li>
          ))}
        </ol>
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
        </div>
        <section className="jrn-f09a__bridge" aria-label="CHECK A PURCHASE">
          <span className="jrn-f09a__spark" aria-hidden>
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 1.4 13.8 9.2 21.6 12 13.8 14.8 12 22.6 10.2 14.8 2.4 12 10.2 9.2Z" fill="none" stroke="#6a5c42" strokeWidth="1.35" strokeLinejoin="round" /></svg>
          </span>
          <p><b>WANT TO SPEND ON SOMETHING?</b> CHECK HOW IT FITS YOUR PLAN BEFORE YOU BUY.</p>
          <button type="button" data-jrn-trigger="safe-check-purchase" onClick={() => go('safe/check')}>
            CHECK A PURCHASE <span aria-hidden>→</span>
          </button>
        </section>
      </div>
      <JurnlProductNav marks="authority" current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId="F09.00" onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

const WHY_PLATE = { src: whyPlate, assetId: 'SAFE.REFERENCE_REPLICA.WHY_PLATE.INTERIM' };
const WHY_DOT: Record<string, string> = { Cash: '#767158', Upcoming: '#dec5b1', Held: '#a16346', Assigned: '#b1a990', Goal: '#8a9395', Buffer: '#545948' };

/** F09.WHY — WHY THIS NUMBER, founder reference IMAGE 2. Live breakdown rows; the hold sheet stays functional. */
export function SafeToSpendWhyScreen() {
  const { go, back, openOverlay, closeOverlay, overlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const signal = computeSafeToSpend(draft);
  const [holdOpen, setHoldOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const W = REF_WHY;
  const rows = [
    { id: 'Cash', label: 'CASH', amount: formatMoney(signal.cash), source: signal.cashSource },
    { id: 'Upcoming', label: 'UPCOMING', amount: formatMoney(signal.upcoming), source: signal.upcomingSource },
    { id: 'Held', label: 'HELD', amount: formatMoney(signal.protected), source: signal.protected > 0 ? signal.protectedSource : 'NONE' },
    { id: 'Assigned', label: 'ASSIGNED', amount: formatMoney(signal.assigned), source: signal.assignedSource },
    { id: 'Goal', label: 'GOAL SET ASIDE', amount: formatMoney(signal.goalReserved), source: signal.goalReservedSource },
    { id: 'Buffer', label: 'SAFETY BUFFER', amount: signal.safetyBuffer > 0 ? formatMoney(signal.safetyBuffer) : null, source: null },
  ] as const;
  return (
    <ReferenceStage
      screenId="F09.WHY"
      plate={WHY_PLATE}
      label="WHY THIS NUMBER"
      outside={
        <>
          <JurnlProductNav marks="authority" current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F09" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F09" nodeId="F09.WHY" onClose={closeOverlay} /> : null}
          {holdOpen ? <HoldSheet onClose={() => setHoldOpen(false)} /> : null}
        </>
      }
    >
      <button type="button" className="jrn-ref__square" aria-label="BACK" data-jrn-trigger="family-back" onClick={() => { if (!back()) go('safe'); }} style={at(W.box.back)}>
        <RefIcon name="chevron-left" box={W.box.backIcon} origin={W.box.back} stroke={2.6} />
      </button>
      <button type="button" className="jrn-ref__square" aria-label="MENU" data-jrn-trigger="why-menu" onClick={() => setDrawer(true)} style={at(W.box.menu)}>
        <RefIcon name="menu" box={W.box.menuIcon} origin={W.box.menu} stroke={2.4} />
      </button>
      <div className="jrn-ref__lockup" role="img" aria-label="JURNL">
        <img src={whySprig} alt="" draggable={false} style={at(W.box.sprigOlive)} />
        <img src={lockupWord} alt="" draggable={false} style={{ left: W.box.word[0], top: W.box.word[1], width: ((W.box.word[2] - W.box.word[0]) * 196) / 192, height: ((W.box.word[3] - W.box.word[1]) * 42) / 40 }} />
        <span className="jrn-ref__gold-rule" style={at(W.box.ruleL)} />
        <span className="jrn-ref__gold-rule" style={at(W.box.ruleR)} />
      </div>
      <div data-jrn-zone="intro">
        <RefText t={W.text.title1} as="h1">WHY THIS</RefText>
        <RefText t={W.text.title2} aria-hidden>NUMBER</RefText>
        <RefText t={W.text.amount} className="jrn-ref__amount-hero">{formatMoney(signal.value)}</RefText>
        {splitLine(STATE_LINE[signal.completeness]).map((line, i) => (
          <RefText key={i} t={i === 0 ? W.text.state1 : W.text.state2} className="jrn-ref__soft">{line}</RefText>
        ))}
      </div>
      <ol className="jrn-ref__tabs" aria-hidden>
        {(['Accounts', 'Upcoming', 'Held', 'Goals', 'Buffer'] as const).map((id) => (
          <RefText key={id} t={W.text[`tab${id}`]} as="li" data-tab={id.toLowerCase()}>{id.toUpperCase()}</RefText>
        ))}
      </ol>
      <article aria-label="HERE’S HOW YOUR NUMBER COMES TOGETHER." data-jrn-panel="sts-breakdown">
        <RefText t={W.text.copy1}>HERE’S HOW</RefText>
        <RefText t={W.text.copy2}>YOUR NUMBER</RefText>
        <RefText t={W.text.copy3}>COMES TOGETHER.</RefText>
        {(['sep0', 'sep1', 'sep2', 'sep3', 'sep4', 'sep5', 'sep6'] as const).map((k) => <span key={k} className="jrn-ref__divider" style={at(W.box[k])} />)}
        <dl>
          {rows.map((r) => (
            <div key={r.id} data-row={r.id.toLowerCase()}>
              <span className="jrn-ref__dot-mark" style={{ ...at(W.box[`dot${r.id}`]), background: WHY_DOT[r.id] }} />
              <RefText t={W.text[`lbl${r.id}`]} as="dt">{r.label}</RefText>
              {r.amount ? <RefText t={r.id === 'Buffer' ? { ...W.text.amtCash, top: W.text.lblBuffer.top - 6 } : W.text[`amt${r.id as 'Cash'}`]} as="dd">{r.amount}</RefText> : null}
              {r.source ? <RefText t={W.text[`src${r.id as 'Cash'}`]} as="dd" className="jrn-ref__muted">{r.source}</RefText> : null}
              <RefIcon name="chevron" box={W.box[`chev${r.id}`]} stroke={2} />
            </div>
          ))}
          <div data-row="completeness">
            <RefText t={W.text.lblComplete} as="dt">COMPLETENESS</RefText>
            <RefText t={W.text.valComplete} as="dd" className="jrn-ref__muted">{signal.completeness}</RefText>
            <RefIcon name="chevron" box={W.box.chevComplete} stroke={2} />
          </div>
        </dl>
      </article>
      <button type="button" className="jrn-ref__ghost jrn-ref__why" data-jrn-trigger="safe-change-hold" onClick={() => setHoldOpen(true)} style={at(W.box.hold)}>
        <RefText t={W.text.hold} origin={W.box.hold} as="span">CHANGE WHAT’S HELD</RefText>
        <RefIcon name="arrow" box={W.box.holdArrow} origin={W.box.hold} stroke={2.2} />
      </button>
      <section className="jrn-ref__panel jrn-ref__bridge" aria-label="THIS UPDATES YOUR SAFE TO SPEND." style={at(W.box.bar)}>
        <RefIcon name="spark" box={W.box.spark} origin={W.box.bar} stroke={2} className="jrn-ref__spark" />
        <RefText t={W.text.bar1} origin={W.box.bar}>THIS UPDATES YOUR SAFE TO SPEND.</RefText>
        <RefText t={W.text.bar2} origin={W.box.bar} className="jrn-ref__muted">CHANGES HERE WILL ADJUST</RefText>
        <RefText t={W.text.bar3} origin={W.box.bar} className="jrn-ref__muted">YOUR NUMBER.</RefText>
        <button type="button" className="jrn-ref__pill" data-jrn-trigger="why-learn-more" onClick={() => openOverlay('ask')} style={at(W.box.learn, W.box.bar)}>
          <RefText t={W.text.learn} origin={W.box.learn} as="span">LEARN MORE</RefText>
          <RefIcon name="arrow" box={W.box.learnArrow} origin={W.box.learn} stroke={2} />
        </button>
      </section>
      {drawer ? <AccountDrawer onClose={() => setDrawer(false)} /> : null}
    </ReferenceStage>
  );
}

/** Splits a state line at the space nearest its middle (the reference breaks NEEDS_SETUP after SETUP). */
function splitLine(line: string): [string, string] {
  const mid = line.length / 2;
  let at = -1;
  for (let i = 0; i < line.length; i += 1) if (line[i] === ' ' && (at < 0 || Math.abs(i - mid) < Math.abs(at - mid))) at = i;
  return at < 0 ? [line, ''] : [line.slice(0, at), line.slice(at + 1)];
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
