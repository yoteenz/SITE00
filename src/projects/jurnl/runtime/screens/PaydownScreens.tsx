/** F13 PAYDOWN — Wave 4. */

import { useState, type ReactNode } from 'react';
import { creditAccounts } from '../../data/foundation/accounts';
import { creditSummary } from '../../data/f12/creditStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import type { PaydownStrategy } from '../../data/foundation/paydown';
import { simulatePaydownProjection, upsertPaydownPlan, usePaydownPlan } from '../../data/f13/paydownStore';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F13} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="CREDIT" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F13" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F13" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function PaydownHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const spec = parentById('F13')!;
  const plan = usePaydownPlan();
  const accounts = creditAccounts();
  const sim = simulatePaydownProjection();
  const [changeOpen, setChangeOpen] = useState(false);
  return (
    <Shell screenId="F13.00">
      <FamilyChrome familyId="F13" nodeId="F13.00" backLabel="BACK TO CREDIT" onBack={() => go('credit')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{spec.name}</h1><p className="jrn-home__sub">{spec.question}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {accounts.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>NOTHING OWED</b></JurnlPanel>
        : accounts.map((a) => {
            const s = creditSummary(a);
            return (
              <button key={a.account_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`paydown-${a.account_id}`} onClick={() => go(`credit/${a.account_id}`)}>
                <span className="jrn-tx__copy"><span className="jrn-tx__name">{a.display_name}</span><small>BALANCE</small></span>
                <span className="jrn-tx__amt">{formatMoney(s.used)}</span>
              </button>
            );
          })}
        {plan ?
          <JurnlPanel role="detail" className="jrn-home__panel">
            <b>STRATEGY</b>
            <p>{plan.strategy_type}</p>
            <b>EXTRA / PERIOD</b>
            <p>{formatMoney(plan.extra_payment)}</p>
          </JurnlPanel>
        : null}
        {sim.partial ? <p className="jrn-currency__note" role="status">PARTIAL · SOME TERMS MISSING</p> : null}
        {sim.lines.map((line) => (
          <JurnlPanel key={line.account_id} role="detail" className="jrn-home__panel">
            <b>{line.label}</b>
            <p>{formatMoney(line.amount)} · {line.certainty}</p>
          </JurnlPanel>
        ))}
        <JurnlButton trigger="paydown-change" onClick={() => setChangeOpen(true)}>CHANGE THE PATH</JurnlButton>
        <JurnlButton variant="secondary" trigger="paydown-what-if" onClick={() => go('paydown/what-if')}>WHAT IF</JurnlButton>
      </div>
      {changeOpen ? <ChangePathSheet onClose={() => setChangeOpen(false)} /> : null}
    </Shell>
  );
}

export function PaydownWhatIfScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const plan = usePaydownPlan();
  const sim = simulatePaydownProjection();
  const [draftExtra, setDraftExtra] = useState(String(plan?.extra_payment ?? 0));
  const draftSim = simulatePaydownProjection(undefined, Number(draftExtra) || 0);
  return (
    <Shell screenId="F13.WHAT_IF">
      <FamilyChrome familyId="F13" nodeId="F13.WHAT_IF" backLabel="BACK" onBack={() => go('paydown')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">WHAT IF</h1><p className="jrn-home__sub">SIMULATION ONLY · DOES NOT CHANGE BALANCES</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel"><b>CURRENT EXTRA</b><p>{formatMoney(plan?.extra_payment ?? 0)}</p></JurnlPanel>
        <JurnlInput label="TRY EXTRA" value={draftExtra} onValue={setDraftExtra} trigger="paydown-draft-extra" inputMode="decimal" />
        {sim.lines.map((line) => (
          <JurnlPanel key={`cur-${line.account_id}`} role="detail" className="jrn-home__panel"><b>{line.label}</b><p>{formatMoney(line.amount)}</p></JurnlPanel>
        ))}
        {draftSim.lines.map((line) => (
          <JurnlPanel key={`sim-${line.account_id}`} role="detail" className="jrn-home__panel"><b>SIM · {line.label}</b><p>{formatMoney(line.amount)}</p></JurnlPanel>
        ))}
        <JurnlButton trigger="paydown-keep" onClick={() => { upsertPaydownPlan({ extra_payment: Number(draftExtra) || 0 }); go('paydown'); }}>KEEP THIS PATH</JurnlButton>
      </div>
    </Shell>
  );
}

function ChangePathSheet({ onClose }: { onClose: () => void }) {
  const plan = usePaydownPlan();
  const [extra, setExtra] = useState(String(plan?.extra_payment ?? 0));
  const [strategy, setStrategy] = useState<PaydownStrategy>(plan?.strategy_type ?? 'MANUAL_ORDER');
  return (
    <JurnlDrawer expression="form" size="long" testId="paydown-change" title="CHANGE THE PATH" onClose={onClose}
      footer={<JurnlButton trigger="paydown-save" onClick={() => { upsertPaydownPlan({ extra_payment: Number(extra) || 0, strategy_type: strategy }); onClose(); }}>SAVE</JurnlButton>}>
      <JurnlInput label="EXTRA PAYMENT" value={extra} onValue={setExtra} trigger="paydown-extra" inputMode="decimal" />
      <div className="jrn-home__choices" role="radiogroup" aria-label="STRATEGY">
        {(['SNOWBALL', 'AVALANCHE', 'MANUAL_ORDER'] as const).map((s) => (
          <button key={s} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={strategy === s} onClick={() => setStrategy(s)}>{s}</button>
        ))}
      </div>
    </JurnlDrawer>
  );
}
