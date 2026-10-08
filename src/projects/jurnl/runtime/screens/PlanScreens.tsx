/** F08 PLAN — Wave 3 structural completion. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { createPlanIntention, planById, updatePlanIntention, archivePlanIntention, usePlanIntentions, totalPlanAssigned } from '../../data/f08/planStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { SIDEKICK_PLATES } from '../../data/parents/sidekickPlates';
import { RA_REF_W, RaLayer, RaRule, RootAuthorityStage, hangY, objectTransform, wallTransform } from '../components/RootAuthorityStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { RefText, at } from '../components/ReferenceStage';
import { RA_PLAN } from '../layout/rootAuthorityLayout';
import { PLAN_LEAF, PLAN_SCENE, PLAN_TABS } from '../layout/rootAuthorityScene';
import type { RefBox } from '../layout/referenceLayout';
import sprig from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';

function PlanShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F08"
      familyPlate={PARENT_PLATES.F08}
      nav={<JurnlProductNav current="PLAN" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F08" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F08" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

/** F08 PLAN — ROOM / ZONE. Money arranged into zones before it moves; each zone's width is its share of what's assigned. */
const PL = RA_PLAN;

export function PlanHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const plans = usePlanIntentions();
  const spec = parentById('F08')!;
  const [addOpen, setAddOpen] = useState(false);
  const assigned = totalPlanAssigned();
  const W = PL.wall.text;
  const R = PL.right.text;
  const right = PLAN_SCENE.objects.right!;
  const left = PLAN_SCENE.objects.left!;
  const add = PL.right.box.add;
  // The reference page holds two lead lines, a rule and a question; with intentions the lead lines carry the total
  // and the rows sit where the question was (up to three; every intention opens from its row or from GOALS).
  const rows = plans.slice(0, 3);
  const qTop = R.q1.top;
  return (
    <RootAuthorityStage
      screenId="F08.00"
      plate={SIDEKICK_PLATES.F08}
      framing={PLAN_SCENE.framing}
      nav={<JurnlProductNav marks="parent" current="PLAN" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F08" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F08" nodeId="F08.00" onClose={closeOverlay} /> : null}
          {addOpen ? <AddIntentionSheet onClose={() => setAddOpen(false)} /> : null}
        </>
      }
    >
      {(fit) => (
        <>
          <RaLayer transform={wallTransform(fit, 0, 0)} className="jrn-ra__layer--top">
            <ReferenceLockup L={{ box: { sprig: PL.wall.box.sprig, word: PL.wall.box.word }, text: { desc1: W.desc1, desc2: W.desc2 } }} />
          </RaLayer>
          <RaLayer transform={wallTransform(fit, fit.W - RA_REF_W * fit.u, 0)} className="jrn-ra__layer--top">
            <RefText t={W.tag1} as="span">PLAN TODAY.</RefText>
            <RefText t={W.tag2} as="span">GROW FREELY.</RefText>
          </RaLayer>
          <RaLayer transform={wallTransform(fit, 0, hangY(fit, PLAN_SCENE.hang))} data-jrn-zone="intro">
            <RefText t={W.title} as="h1">PLAN.</RefText>
            <RefText t={W.sub} as="p">YOUR MONEY HAS A PLAN.</RefText>
            <RefText t={W.line} as="p">HERE IS WHAT YOU ARE ARRANGING.</RefText>
          </RaLayer>

          <section data-jrn-zone="content-rail" data-jrn-panel="signal" aria-label="INTENTIONS">
            {/* Left page: the botanical print and the quiet line under it. */}
            <RaLayer transform={objectTransform(fit, left)}>
              <img className="jrn-ra__img jrn-ra__leaf" src={sprig} alt="" draggable={false} style={at(PLAN_LEAF)} />
              <p className="jrn-ra__aside" aria-label="A CLEARER TOMORROW BEGINS HERE.">
                <RefText t={PL.left.text.a1} as="span">A CLEARER</RefText>
                <RefText t={PL.left.text.a2} as="span">TOMORROW</RefText>
                <RefText t={PL.left.text.a3} as="span">BEGINS</RefText>
                <RefText t={PL.left.text.a4} as="span">HERE.</RefText>
              </p>
              <RaRule from={[PL.left.box.rule[0], PL.left.box.rule[1] + 1.5]} to={[PL.left.box.rule[2], PL.left.box.rule[1] + 1.5]} />
            </RaLayer>

            {/* Right page: what is arranged, the action, and the index tabs on its edge. */}
            <RaLayer transform={objectTransform(fit, right)}>
              {PLAN_TABS.map((tab) => (
                <button key={tab.id} type="button" className="jrn-ra__tab" data-jrn-trigger={tab.trigger} onClick={() => go(tab.target)} style={{ ...at(tab.box), background: tab.fill, color: tab.ink }}>
                  <RefText t={R[tab.id]} origin={tab.box} as="span">{tab.label}</RefText>
                </button>
              ))}
              {plans.length ?
                <>
                  <RefText t={R.l1} as="p">{`${formatMoney(assigned)} ASSIGNED`}</RefText>
                  <RefText t={R.l2} as="p">{`ACROSS ${plans.length} ${plans.length === 1 ? 'INTENTION' : 'INTENTIONS'}.`}</RefText>
                </>
              : <>
                  <RefText t={R.l1} as="p">NOTHING IS</RefText>
                  <RefText t={R.l2} as="p">ARRANGED YET.</RefText>
                </>}
              <RaRule from={[PL.right.box.rule[0], PL.right.box.rule[1] + 1]} to={[PL.right.box.rule[2], PL.right.box.rule[1] + 1]} />
              {rows.length ?
                rows.map((p, i) => {
                  const top = qTop - 8 + i * 30;
                  const box: RefBox = [500, top - 6, 790, top + 24];
                  return (
                    <button key={p.plan_id} type="button" className="jrn-ra__hit" data-jrn-trigger={`plan-${p.plan_id}`} onClick={() => go(`plan/${p.plan_id}`)} style={at(box)}>
                      <RefText t={{ ...R.q1, size: 15.5, ls: 3.2, top: 6, left: 4, cx: undefined }} as="span">{p.title}</RefText>
                      <RefText t={{ ...R.q1, family: 'serif', size: 19, ls: 0.5, top: 3, left: undefined, cx: undefined, right: 4 }} origin={box} as="b" style={{ left: 'auto', right: 4, top: 3, fontSize: 19, letterSpacing: 0.5 }}>{formatMoney(p.assigned_amount)}</RefText>
                    </button>
                  );
                })
              : <>
                  <RefText t={R.q1} as="p">{spec.question.split(' ').slice(0, 4).join(' ')}</RefText>
                  <RefText t={R.q2} as="p">{spec.question.split(' ').slice(4).join(' ')}</RefText>
                </>}
              <button type="button" className="jrn-ra__cta" data-jrn-trigger="plan-add-intention" onClick={() => setAddOpen(true)} style={at(add)}>
                <RefText t={R.add} origin={add} as="span">ADD AN INTENTION</RefText>
              </button>
            </RaLayer>
          </section>
        </>
      )}
    </RootAuthorityStage>
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
