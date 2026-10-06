/** F10 PURCHASES — Wave 4. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { archivePurchase, createPurchase, markPurchaseBought, purchaseAffordability, purchaseById, usePurchases } from '../../data/f10/purchasesStore';
import { accountDisplayOptions } from '../../data/foundation/accounts';
import { computeSafeToSpend } from '../../data/f09/safeToSpend';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInlineAction, JurnlInput, JurnlPanel } from '../components/primitives';
import { FramePanel, JurnlFamilyFrame, JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F10"
      familyPlate={PARENT_PLATES.F10}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F10" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F10" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

const VERDICT: Record<'NOW' | 'WAIT' | 'NOT_YET', { short: string; line: string }> = {
  NOW: { short: 'FITS NOW', line: 'BUYING IT NOW KEEPS SAFE TO SPEND ABOVE ZERO.' },
  WAIT: { short: 'CLOSE', line: 'CLOSE. BUYING NOW TAKES SAFE TO SPEND SLIGHTLY BELOW ZERO.' },
  NOT_YET: { short: 'NOT YET', line: 'NOT YET. BUYING NOW TAKES SAFE TO SPEND WELL BELOW ZERO.' },
};

const STATUS_LABEL: Record<string, string> = { IDEA: 'AN IDEA', PLANNING: 'PLANNING', READY: 'READY', PURCHASED: 'BOUGHT', ARCHIVED: 'LET GO' };

/** F10 PURCHASES — OBJECT FOCUS. The thing under consideration stands on a plinth; fit, after and status orbit it. */
export function PurchasesHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const items = usePurchases();
  const spec = parentById('F10')!;
  const [addOpen, setAddOpen] = useState(false);
  const open = items.filter((p) => p.status !== 'PURCHASED');
  const focus = open[0] ?? null;
  const others = items.filter((p) => p !== focus);
  const fit = focus ? purchaseAffordability(focus) : null;
  return (
    <JurnlFamilyFrame
      screenId="F10.00"
      familyId="F10"
      familyPlate={PARENT_PLATES.F10}
      label="PURCHASES"
      archetype="OBJECT_FOCUS"
      chrome={<FamilyChrome familyId="F10" nodeId="F10.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F10" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F10" nodeId="F10.00" onClose={closeOverlay} /> : null}
          {addOpen ? <ConsiderSheet onClose={() => setAddOpen(false)} /> : null}
        </>
      }
    >
      <FramePanel id="intro">
        <header className="jrn-obj__intro" data-jrn-zone="intro">
          <h1 className="jrn-obj__fn">PURCHASES</h1>
          <p className="jrn-lang__state">{open.length ? `YOU’RE CONSIDERING ${open.length} ${open.length === 1 ? 'PURCHASE' : 'PURCHASES'}.` : 'NOTHING IS UNDER CONSIDERATION.'}</p>
          <p className="jrn-lang__task">{open.length ? 'SEE WHETHER IT FITS YOUR PLAN BEFORE YOU BUY.' : 'ADD SOMETHING YOU WANT TO BUY. JURNL SHOWS WHETHER IT FITS.'}</p>
        </header>
      </FramePanel>
      <FramePanel id="plinth">
        <section className="jrn-obj__stage" aria-label="UNDER CONSIDERATION" data-empty={focus ? 'false' : 'true'}>
          <span className="jrn-obj__tag">UNDER CONSIDERATION</span>
          <div className="jrn-obj__niche">
            {focus ?
              <>
                <h2 className="jrn-obj__name">{focus.title}</h2>
                <p className="jrn-obj__price">{formatMoney(focus.target_amount)}</p>
                <p className="jrn-obj__meta">{STATUS_LABEL[focus.status] ?? focus.status}</p>
              </>
            : <>
                <h2 className="jrn-obj__name jrn-obj__name--empty">NOTHING YET</h2>
                <p className="jrn-obj__meta">NAME IT, GIVE IT A PRICE.</p>
              </>
            }
          </div>
          {focus ?
            <JurnlButton trigger="purchase-decide-focus" onClick={() => go(`purchases/${focus.purchase_id}`)}>DECIDE ON THIS</JurnlButton>
          : <JurnlButton trigger="purchase-consider" onClick={() => setAddOpen(true)}>ADD SOMETHING TO CONSIDER</JurnlButton>}
          {focus && fit ?
            <dl className="jrn-obj__orbit">
              <div>
                <dt>FITS?</dt>
                <dd data-verdict={fit.verdict}>{VERDICT[fit.verdict].short}</dd>
              </div>
              <div>
                <dt>SAFE TO SPEND AFTER</dt>
                <dd>{formatMoney(fit.after)}</dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd>{STATUS_LABEL[focus.status] ?? focus.status}</dd>
              </div>
            </dl>
          : null}
          {focus && fit ? <p className="jrn-lang__task jrn-obj__line">{VERDICT[fit.verdict].line}</p> : null}
        </section>
      </FramePanel>
      {others.length ?
        <FramePanel id="others">
          <section className="jrn-obj__shelf" aria-label="ALSO CONSIDERING">
            <p className="jrn-lang__fn">ALSO CONSIDERING</p>
            {others.map((p) => (
              <button key={p.purchase_id} type="button" className="jrn-obj__item" data-jrn-trigger={`purchase-${p.purchase_id}`} onClick={() => go(`purchases/${p.purchase_id}`)}>
                <span className="jrn-obj__itemname">{p.title}</span>
                <span className="jrn-obj__itemmeta">{STATUS_LABEL[p.status] ?? p.status}</span>
                <span className="jrn-obj__itemamt">{formatMoney(p.target_amount)}</span>
              </button>
            ))}
          </section>
        </FramePanel>
      : null}
      <FramePanel id="actions">
        <div className="jrn-obj__actions">
          {focus ? <JurnlButton variant="secondary" trigger="purchase-consider" onClick={() => setAddOpen(true)}>CONSIDER SOMETHING ELSE</JurnlButton> : null}
          <p className="jrn-obj__links">
            <JurnlInlineAction trigger="purchase-safe" onClick={() => go('safe')}>SAFE TO SPEND</JurnlInlineAction>
          </p>
          <p className="jrn-lang__editorial">{spec.question}</p>
        </div>
      </FramePanel>
    </JurnlFamilyFrame>
  );
}

export function PurchaseDetailScreen() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  usePurchases();
  const purchase = purchaseId ? purchaseById(purchaseId) : null;
  const [decideOpen, setDecideOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  if (!purchase) {
    return (
      <Shell screenId="F10.OBJECT">
        <FamilyChrome familyId="F10" nodeId="F10.OBJECT" backLabel="BACK" onBack={() => go('purchases')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>NOT FOUND</b></JurnlPanel>
      </Shell>
    );
  }
  const afford = purchaseAffordability(purchase);
  return (
    <Shell screenId="F10.OBJECT">
      <FamilyChrome familyId="F10" nodeId="F10.OBJECT" backLabel="BACK" onBack={() => go('purchases')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{purchase.title}</h1><p className="jrn-home__sub">{formatMoney(purchase.target_amount)}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlButton trigger="purchase-decide" onClick={() => setDecideOpen(true)}>DECIDE</JurnlButton>
        {purchase.status !== 'PURCHASED' ?
          <JurnlButton variant="secondary" trigger="purchase-bought" onClick={() => markPurchaseBought(purchase.purchase_id, accountDisplayOptions()[0]?.id ?? 'CHECKING')}>I BOUGHT IT</JurnlButton>
        : <p>LINKED · {purchase.linked_transaction_id}</p>}
        <JurnlButton variant="secondary" trigger="purchase-remove" onClick={() => setRemoveOpen(true)}>LET IT GO</JurnlButton>
      </div>
      {decideOpen ?
        <JurnlDrawer expression="analysis" size="long" testId="purchase-decision" title="DECISION" onClose={() => setDecideOpen(false)}>
          <p>NOW STS · {formatMoney(computeSafeToSpend().value)}</p>
          <p>AFTER · {formatMoney(afford.after)}</p>
          <p>VERDICT · {afford.verdict}</p>
        </JurnlDrawer>
      : null}
      {removeOpen ?
        <JurnlDrawer expression="confirmation" size="long" testId="purchase-remove" title="LET IT GO" onClose={() => setRemoveOpen(false)}
          footer={<JurnlButton trigger="purchase-remove-ok" onClick={() => { archivePurchase(purchase.purchase_id); setRemoveOpen(false); go('purchases'); }}>REMOVE</JurnlButton>}>
          <p>REMOVE {purchase.title}?</p>
        </JurnlDrawer>
      : null}
    </Shell>
  );
}

function ConsiderSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const { go } = useJurnl();
  return (
    <JurnlDrawer expression="form" size="long" testId="purchase-consider" title="CONSIDER SOMETHING" onClose={onClose}
      footer={<JurnlButton trigger="purchase-save" disabled={!title.trim()} onClick={() => { const p = createPurchase({ title, target_amount: Number(amount) || 0 }); onClose(); go(`purchases/${p.purchase_id}`); }}>SAVE</JurnlButton>}>
      <JurnlInput label="NAME" value={title} onValue={setTitle} trigger="purchase-name" />
      <JurnlInput label="PRICE" value={amount} onValue={setAmount} trigger="purchase-price" inputMode="decimal" />
    </JurnlDrawer>
  );
}
