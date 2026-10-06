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
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F10} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F10" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F10" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function PurchasesHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const items = usePurchases();
  const spec = parentById('F10')!;
  const [addOpen, setAddOpen] = useState(false);
  return (
    <Shell screenId="F10.00">
      <FamilyChrome familyId="F10" nodeId="F10.00" backLabel="BACK TO TODAY" onBack={() => go('today')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{spec.name}</h1><p className="jrn-home__sub">{spec.question}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {items.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>NOTHING UNDER CONSIDERATION</b></JurnlPanel>
        : items.map((p) => (
            <button key={p.purchase_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`purchase-${p.purchase_id}`} onClick={() => go(`purchases/${p.purchase_id}`)}>
              <span className="jrn-tx__copy"><span className="jrn-tx__name">{p.title}</span><small>{p.status}</small></span>
              <span className="jrn-tx__amt">{formatMoney(p.target_amount)}</span>
            </button>
          ))}
        <JurnlButton trigger="purchase-consider" onClick={() => setAddOpen(true)}>CONSIDER SOMETHING</JurnlButton>
        <JurnlButton variant="secondary" trigger="purchase-safe" onClick={() => go('safe')}>SAFE TO SPEND</JurnlButton>
      </div>
      {addOpen ? <ConsiderSheet onClose={() => setAddOpen(false)} /> : null}
    </Shell>
  );
}

export function PurchaseDetailScreen() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
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
