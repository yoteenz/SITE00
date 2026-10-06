/** F15 AHEAD — Wave 4 derived projection only. */

import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { projectAhead } from '../../data/f15/aheadProjection';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F15} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="PLAN" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F15" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F15" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function AheadHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const spec = parentById('F15')!;
  const ahead = projectAhead();
  return (
    <Shell screenId="F15.00">
      <FamilyChrome familyId="F15" nodeId="F15.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{spec.name}</h1><p className="jrn-home__sub">{spec.question}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <div className="jrn-home__signal" data-jrn-panel="signal">
          <p className="jrn-home__num">{formatMoney(ahead.safe_to_spend_now)}</p>
          <p className="jrn-home__hint">SAFE TO SPEND NOW · READ FROM F09</p>
        </div>
        {ahead.completeness === 'THIN' ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>TOO LITTLE IS KNOWN TO PROJECT HONESTLY</b></JurnlPanel>
        : null}
        {ahead.shortfall_risk ?
          <JurnlPanel role="detail" className="jrn-home__panel" data-jrn-trigger="ahead-shortfall"><b>SHORTFALL RISK</b><p>PROJECTED OUTFLOWS EXCEED AVAILABLE · NOT CERTAIN</p></JurnlPanel>
        : null}
        {ahead.projected_net_30 != null ?
          <JurnlPanel role="detail" className="jrn-home__panel"><b>PROJECTED NET (DERIVED)</b><p>{formatMoney(ahead.projected_net_30)}</p></JurnlPanel>
        : null}
        {ahead.items.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>NO FORWARD EVENTS YET</b></JurnlPanel>
        : ahead.items.map((item) => (
            <JurnlPanel key={item.ahead_id} role="detail" className="jrn-home__panel">
              <b>{item.label}</b>
              <p>{item.direction === 'IN' ? '+' : '−'}{formatMoney(item.amount)} · {item.certainty}</p>
            </JurnlPanel>
          ))}
        <JurnlButton trigger="ahead-branch" onClick={() => go('ahead/base')}>TRY ANOTHER PATH</JurnlButton>
        <JurnlButton variant="secondary" trigger="ahead-upcoming" onClick={() => go('upcoming')}>UPCOMING</JurnlButton>
      </div>
    </Shell>
  );
}

export function AheadBranchScreen() {
  const { branchId } = useParams<{ branchId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const base = projectAhead();
  const label = branchId === 'extra-reserve' ? 'ASSUME MORE COMMITTED OUTFLOWS' : 'BASE PATH';
  return (
    <Shell screenId="F15.BRANCH">
      <FamilyChrome familyId="F15" nodeId="F15.BRANCH" backLabel="BACK" onBack={() => go('ahead')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{label}</h1><p className="jrn-home__sub">SIMULATED · NOT SOURCE TRUTH</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel"><b>BASE NET</b><p>{base.projected_net_30 != null ? formatMoney(base.projected_net_30) : 'UNKNOWN'}</p></JurnlPanel>
        <JurnlPanel role="detail" className="jrn-home__panel"><b>BRANCH</b><p>{branchId ?? 'base'} · DERIVED COMPARISON ONLY</p></JurnlPanel>
        <JurnlButton trigger="ahead-discard" variant="secondary" onClick={() => go('ahead')}>LET THIS BRANCH GO</JurnlButton>
      </div>
    </Shell>
  );
}
