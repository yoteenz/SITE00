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
import { FramePanel, JurnlFamilyFrame, JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F13"
      familyPlate={PARENT_PLATES.F13}
      nav={<JurnlProductNav current="CREDIT" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F13" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F13" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

const STRATEGY: Record<PaydownStrategy, { name: string; rule: string }> = {
  AVALANCHE: { name: 'AVALANCHE', rule: 'HIGHEST INTEREST RATE FIRST' },
  SNOWBALL: { name: 'SNOWBALL', rule: 'SMALLEST BALANCE FIRST' },
  MANUAL_ORDER: { name: 'YOUR ORDER', rule: 'IN THE ORDER YOU CHOSE' },
};

/** F13 PAYDOWN — SEQUENTIAL STEPS. The plan is the landing; each debt is a step down, in the plan's order. */
export function PaydownHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const spec = parentById('F13')!;
  const plan = usePaydownPlan();
  const accounts = creditAccounts();
  const sim = simulatePaydownProjection();
  const [changeOpen, setChangeOpen] = useState(false);
  const order = plan?.account_order?.length ? plan.account_order : accounts.map((a) => a.account_id);
  const steps = [...accounts].sort((a, b) => {
    const ia = order.indexOf(a.account_id);
    const ib = order.indexOf(b.account_id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const payment = (id: string) => sim.lines.find((l) => l.account_id === id) ?? null;
  const strategy = plan ? STRATEGY[plan.strategy_type] : null;
  return (
    <JurnlFamilyFrame
      screenId="F13.00"
      familyId="F13"
      familyPlate={PARENT_PLATES.F13}
      label="PAYDOWN"
      archetype="SEQUENTIAL_STEPS"
      chrome={<FamilyChrome familyId="F13" nodeId="F13.00" backLabel="BACK TO CREDIT" onBack={() => go('credit')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="CREDIT" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F13" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F13" nodeId="F13.00" onClose={closeOverlay} /> : null}
          {changeOpen ? <ChangePathSheet onClose={() => setChangeOpen(false)} /> : null}
        </>
      }
    >
      <FramePanel id="landing">
        <header className="jrn-stair__landing" data-jrn-zone="intro">
          <h1 className="jrn-stair__fn">PAYDOWN</h1>
          <p className="jrn-lang__state">
            {!steps.length ? 'NOTHING IS OWED. NO CARDS OR LOANS ARE ADDED.' : strategy ? `YOUR PLAN: ${strategy.name} — ${strategy.rule}.` : 'YOUR DEBT PLAN ISN’T SET YET.'}
          </p>
          <p className="jrn-lang__task">
            {!steps.length ?
              'ADD A CARD OR LOAN IN MONEY TO PLAN A PAYDOWN.'
            : plan ?
              `${formatMoney(plan.extra_payment)} EXTRA EACH MONTH, SPREAD ACROSS ${steps.length} ${steps.length === 1 ? 'BALANCE' : 'BALANCES'}.`
            : 'CHOOSE HOW YOU WANT TO PAY DOWN YOUR BALANCES.'}
          </p>
          {steps.length ?
            <JurnlButton trigger="paydown-change" onClick={() => setChangeOpen(true)}>{plan ? 'CHANGE THE PLAN' : 'SET A PLAN'}</JurnlButton>
          : <JurnlButton trigger="paydown-add-debt" onClick={() => go('money/places')}>ADD A CARD OR LOAN</JurnlButton>}
        </header>
      </FramePanel>
      {steps.length ?
        <FramePanel id="steps">
          <ol className="jrn-stair" aria-label={`PAYDOWN ORDER — ${steps.length} ${steps.length === 1 ? 'STEP' : 'STEPS'}`} style={{ ['--last' as string]: Math.max(1, steps.length - 1) }}>
            {steps.map((a, i) => {
              const s = creditSummary(a);
              const pay = payment(a.account_id);
              // Presentation only: a tread's width carries its share of the largest balance (the weight still to come down).
              const heaviest = Math.max(...steps.map((x) => creditSummary(x).used), 0);
              const weight = heaviest > 0 ? Math.min(1, s.used / heaviest) : 0;
              return (
                <li key={a.account_id} className="jrn-stair__step" style={{ ['--step' as string]: i, ['--weight' as string]: weight }}>
                  <span className="jrn-stair__index" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                  <button type="button" className="jrn-stair__tread" data-jrn-trigger={`paydown-${a.account_id}`} onClick={() => go(`credit/${a.account_id}`)}>
                    <span className="jrn-stair__name">{a.display_name}</span>
                    <span className="jrn-stair__meta">
                      {s.attrs?.apr != null ? `${s.attrs.apr}% APR` : 'RATE NOT SET'}
                      {pay ? ` · NEXT ${formatMoney(pay.amount)}` : ' · NO MINIMUM SET'}
                    </span>
                    <span className="jrn-stair__amt">{formatMoney(s.used)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {sim.partial ? <p className="jrn-lang__task jrn-stair__note" role="status">SOME MINIMUM PAYMENTS ARE MISSING, SO THIS PLAN IS PARTIAL.</p> : null}
        </FramePanel>
      : null}
      <FramePanel id="foot">
        <div className="jrn-stair__foot">
          {steps.length ? <JurnlButton variant="secondary" trigger="paydown-what-if" onClick={() => go('paydown/what-if')}>TRY AN EXTRA PAYMENT</JurnlButton> : null}
          <p className="jrn-lang__editorial">THE DESCENT · {spec.question}</p>
        </div>
      </FramePanel>
    </JurnlFamilyFrame>
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
