/** F14 GOALS — Wave 3 canonical goal owner. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { archiveGoal, createGoal, goalById, setGoalAside, updateGoal, useGoals } from '../../data/f14/goalsStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function GoalsShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F14} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F14" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F14" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function GoalsHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const goals = useGoals();
  const spec = parentById('F14')!;
  const [addOpen, setAddOpen] = useState(false);
  return (
    <GoalsShell screenId="F14.00">
      <FamilyChrome familyId="F14" nodeId="F14.00" backLabel="BACK TO PLAN" onBack={() => go('plan')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{spec.name}</h1>
        <p className="jrn-home__sub">{spec.question}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {goals.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>NOTHING IS NAMED</b><p>NAME ONE GOAL.</p></JurnlPanel>
        : goals.map((g) => (
            <button key={g.goal_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`goal-${g.goal_id}`} onClick={() => go(`goals/${g.goal_id}`)}>
              <span className="jrn-tx__copy">
                <span className="jrn-tx__name">{g.title}</span>
                <small>{g.status}</small>
              </span>
              <span className="jrn-tx__amt">{formatMoney(g.set_aside_amount)}</span>
            </button>
          ))}
        <JurnlButton trigger="goal-add" onClick={() => setAddOpen(true)}>NAME ONE</JurnlButton>
        <JurnlButton variant="secondary" trigger="goal-plan" onClick={() => go('plan')}>PLAN</JurnlButton>
      </div>
      {addOpen ? <NameGoalSheet onClose={() => setAddOpen(false)} /> : null}
    </GoalsShell>
  );
}

export function GoalDetailScreen() {
  const { goalId } = useParams<{ goalId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const goal = goalId ? goalById(goalId) : null;
  const [editOpen, setEditOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  if (!goal) {
    return (
      <GoalsShell screenId="F14.GOAL">
        <FamilyChrome familyId="F14" nodeId="F14.GOAL" backLabel="BACK" onBack={() => go('goals')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>GOAL NOT FOUND</b></JurnlPanel>
      </GoalsShell>
    );
  }
  const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.set_aside_amount / goal.target_amount) * 100)) : null;
  return (
    <GoalsShell screenId="F14.GOAL">
      <FamilyChrome familyId="F14" nodeId="F14.GOAL" backLabel="BACK TO GOALS" onBack={() => go('goals')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{goal.title}</h1>
        <p className="jrn-home__sub">{pct != null ? `${pct}% TOWARD TARGET` : 'TARGET NOT SET'}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>TARGET</b>
          <p>{goal.target_amount > 0 ? formatMoney(goal.target_amount) : 'NOT SET'}</p>
          <b>SET ASIDE</b>
          <p>{formatMoney(goal.set_aside_amount)}</p>
          {goal.meaning ? <><b>MEANING</b><p>{goal.meaning}</p></> : null}
        </JurnlPanel>
        <JurnlButton trigger="goal-set-aside" onClick={() => setAsideOpen(true)}>SET ASIDE</JurnlButton>
        <JurnlButton variant="secondary" trigger="goal-edit" onClick={() => setEditOpen(true)}>EDIT</JurnlButton>
        <JurnlButton variant="secondary" trigger="goal-remove" onClick={() => setRemoveOpen(true)}>LET IT GO</JurnlButton>
      </div>
      {asideOpen ? <SetAsideSheet goal={goal} onClose={() => setAsideOpen(false)} /> : null}
      {editOpen ? <EditGoalSheet goal={goal} onClose={() => setEditOpen(false)} /> : null}
      {removeOpen ?
        <JurnlDrawer expression="confirmation" size="long" testId="goal-remove" title="LET IT GO" onClose={() => setRemoveOpen(false)}
          footer={<JurnlButton trigger="goal-remove-confirm" onClick={() => { archiveGoal(goal.goal_id); setRemoveOpen(false); go('goals'); }}>REMOVE</JurnlButton>}>
          <p>SET ASIDE RETURNS TO AVAILABLE PLAN MONEY.</p>
        </JurnlDrawer>
      : null}
    </GoalsShell>
  );
}

function NameGoalSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const { go } = useJurnl();
  return (
    <JurnlDrawer expression="form" size="long" testId="goal-name" title="NAME ONE" onClose={onClose}
      footer={<JurnlButton trigger="goal-name-save" disabled={!title.trim()} onClick={() => { const g = createGoal({ title, target_amount: Number(target) || 0 }); onClose(); go(`goals/${g.goal_id}`); }}>SAVE</JurnlButton>}>
      <JurnlInput label="NAME" value={title} onValue={setTitle} trigger="goal-name-input" />
      <JurnlInput label="TARGET" value={target} onValue={setTarget} trigger="goal-target" inputMode="decimal" />
    </JurnlDrawer>
  );
}

function EditGoalSheet({ goal, onClose }: { goal: NonNullable<ReturnType<typeof goalById>>; onClose: () => void }) {
  const [title, setTitle] = useState(goal.title);
  const [target, setTarget] = useState(String(goal.target_amount));
  const [meaning, setMeaning] = useState(goal.meaning);
  return (
    <JurnlDrawer expression="form" size="long" testId="goal-edit" title="EDIT A GOAL" onClose={onClose}
      footer={<JurnlButton trigger="goal-edit-save" onClick={() => { updateGoal({ ...goal, title: title.trim().toUpperCase(), target_amount: Number(target) || 0, meaning }); onClose(); }}>SAVE</JurnlButton>}>
      <JurnlInput label="NAME" value={title} onValue={setTitle} trigger="goal-edit-name" />
      <JurnlInput label="TARGET" value={target} onValue={setTarget} trigger="goal-edit-target" inputMode="decimal" />
      <JurnlInput label="MEANING" value={meaning} onValue={setMeaning} trigger="goal-meaning" />
    </JurnlDrawer>
  );
}

function SetAsideSheet({ goal, onClose }: { goal: NonNullable<ReturnType<typeof goalById>>; onClose: () => void }) {
  const [amount, setAmount] = useState(String(goal.set_aside_amount));
  return (
    <JurnlDrawer expression="form" size="long" testId="goal-aside" title="SET ASIDE" lead="RESERVED AMOUNT REDUCES SAFE TO SPEND." onClose={onClose}
      footer={<JurnlButton trigger="goal-aside-save" onClick={() => { setGoalAside(goal.goal_id, Number(amount) || 0); onClose(); }}>SAVE</JurnlButton>}>
      <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="goal-aside-amount" inputMode="decimal" />
    </JurnlDrawer>
  );
}
