/** F08 PLAN — Wave 3 structural completion. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { createPlanIntention, planById, updatePlanIntention, archivePlanIntention, usePlanIntentions, totalPlanAssigned } from '../../data/f08/planStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function PlanShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F08} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="PLAN" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F08" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F08" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function PlanHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const plans = usePlanIntentions();
  const spec = parentById('F08')!;
  const [addOpen, setAddOpen] = useState(false);
  const assigned = totalPlanAssigned();
  return (
    <PlanShell screenId="F08.00">
      <FamilyChrome familyId="F08" nodeId="F08.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{spec.name}</h1>
        <p className="jrn-home__sub">{spec.question}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <div className="jrn-home__signal" data-jrn-panel="signal">
          <p className="jrn-home__num">{formatMoney(assigned)}</p>
          <p className="jrn-home__hint">ASSIGNED · {plans.length} INTENTIONS</p>
        </div>
        {plans.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel" data-jrn-trigger="plan-empty">
            <b>NOTHING IS ARRANGED</b>
            <p>NAME AN INTENTION.</p>
          </JurnlPanel>
        : plans.map((p) => (
            <button key={p.plan_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`plan-${p.plan_id}`} onClick={() => go(`plan/${p.plan_id}`)}>
              <span className="jrn-tx__copy">
                <span className="jrn-tx__name">{p.title}</span>
                <small>ASSIGNED</small>
              </span>
              <span className="jrn-tx__amt">{formatMoney(p.assigned_amount)}</span>
            </button>
          ))}
        <JurnlButton trigger="plan-add-intention" onClick={() => setAddOpen(true)}>ADD AN INTENTION</JurnlButton>
        <JurnlButton variant="secondary" trigger="plan-open-safe" onClick={() => go('safe')}>SAFE TO SPEND</JurnlButton>
        <JurnlButton variant="secondary" trigger="plan-open-goals" onClick={() => go('goals')}>GOALS</JurnlButton>
      </div>
      {addOpen ? <AddIntentionSheet onClose={() => setAddOpen(false)} /> : null}
    </PlanShell>
  );
}

export function PlanIntentionScreen() {
  const { intentionId } = useParams<{ intentionId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const plan = intentionId ? planById(intentionId) : null;
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  if (!plan) {
    return (
      <PlanShell screenId="F08.ITEM">
        <FamilyChrome familyId="F08" nodeId="F08.ITEM" backLabel="BACK" onBack={() => go('plan')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>INTENTION NOT FOUND</b></JurnlPanel>
      </PlanShell>
    );
  }
  return (
    <PlanShell screenId="F08.ITEM">
      <FamilyChrome familyId="F08" nodeId="F08.ITEM" backLabel="BACK TO PLAN" onBack={() => go('plan')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{plan.title}</h1>
        <p className="jrn-home__sub">INTENTION</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>ASSIGNED</b>
          <p>{formatMoney(plan.assigned_amount)}</p>
        </JurnlPanel>
        <JurnlButton trigger="plan-assign" onClick={() => setAssignOpen(true)}>ASSIGN AMOUNT</JurnlButton>
        <JurnlButton variant="secondary" trigger="plan-remove" onClick={() => setRemoveOpen(true)}>REMOVE</JurnlButton>
      </div>
      {assignOpen ?
        <AssignSheet plan={plan} onClose={() => setAssignOpen(false)} />
      : null}
      {removeOpen ?
        <JurnlDrawer expression="confirmation" size="long" testId="plan-remove" title="REMOVE AN INTENTION" lead="FREES ITS AMOUNT." onClose={() => setRemoveOpen(false)}
          footer={<JurnlButton trigger="plan-remove-confirm" onClick={() => { archivePlanIntention(plan.plan_id); setRemoveOpen(false); go('plan'); }}>REMOVE</JurnlButton>}>
          <p>REMOVE {plan.title}?</p>
        </JurnlDrawer>
      : null}
    </PlanShell>
  );
}

function AddIntentionSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const { go } = useJurnl();
  return (
    <JurnlDrawer expression="form" size="long" testId="plan-add" title="ADD AN INTENTION" onClose={onClose}
      footer={<JurnlButton trigger="plan-add-save" disabled={!title.trim()} onClick={() => { const p = createPlanIntention({ title }); onClose(); go(`plan/${p.plan_id}`); }}>SAVE</JurnlButton>}>
      <JurnlInput label="NAME" value={title} onValue={setTitle} trigger="plan-add-name" />
    </JurnlDrawer>
  );
}

function AssignSheet({ plan, onClose }: { plan: ReturnType<typeof planById>; onClose: () => void }) {
  const [amount, setAmount] = useState(String(plan?.assigned_amount ?? 0));
  if (!plan) return null;
  return (
    <JurnlDrawer expression="form" size="long" testId="plan-assign" title="ASSIGN" lead="COMMITTED AMOUNT REDUCES SAFE TO SPEND." onClose={onClose}
      footer={<JurnlButton trigger="plan-assign-save" onClick={() => { updatePlanIntention({ ...plan, assigned_amount: Math.max(0, Number(amount) || 0) }); onClose(); }}>SAVE</JurnlButton>}>
      <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="plan-assign-amount" inputMode="decimal" />
    </JurnlDrawer>
  );
}
