/** F12 CREDIT — Wave 3; attributes on canonical accounts. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { accountById, creditAccounts } from '../../data/foundation/accounts';
import { creditAttributesFor, creditSummary, upsertCreditTerms, useCreditAccounts } from '../../data/f12/creditStore';
import { createManualAccount } from '../../data/foundation/accountMutations';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function CreditShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F12} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="CREDIT" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F12" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F12" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function CreditHubScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const accounts = useCreditAccounts();
  const spec = parentById('F12')!;
  const [utilOpen, setUtilOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  return (
    <CreditShell screenId="F12.00">
      <FamilyChrome familyId="F12" nodeId="F12.00" backLabel="BACK TO MONEY" onBack={() => go('money')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{spec.name}</h1>
        <p className="jrn-home__sub">{spec.question}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {accounts.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>QUIET</b><p>NO CARD OR LOAN PLACES.</p></JurnlPanel>
        : accounts.map((a) => {
            const s = creditSummary(a);
            return (
              <button key={a.account_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`credit-${a.account_id}`} onClick={() => go(`credit/${a.account_id}`)}>
                <span className="jrn-tx__copy">
                  <span className="jrn-tx__name">{a.display_name}</span>
                  <small>{s.util != null ? `${s.util}% USED` : 'MANUAL TERMS'}</small>
                </span>
                <span className="jrn-tx__amt">{formatMoney(s.used)}</span>
              </button>
            );
          })}
        <JurnlButton trigger="credit-utilization" onClick={() => setUtilOpen(true)}>UTILIZATION</JurnlButton>
        <JurnlButton variant="secondary" trigger="credit-add" onClick={() => setAddOpen(true)}>ADD A CARD OR LOAN</JurnlButton>
        <JurnlButton variant="secondary" trigger="credit-paydown" onClick={() => go('paydown')}>PAYDOWN</JurnlButton>
      </div>
      {utilOpen ? <UtilizationSheet accounts={accounts} onClose={() => setUtilOpen(false)} /> : null}
      {addOpen ?
        <JurnlDrawer expression="form" size="long" testId="credit-add" title="ADD A CARD OR LOAN" onClose={() => setAddOpen(false)}
          footer={<JurnlButton trigger="credit-add-save" onClick={() => { const ac = createManualAccount('NEW CARD', 'CREDIT_CARD', 0); upsertCreditTerms(ac.account_id, { credit_limit: 5000, current_balance: 0, payment_due_day: 15, minimum_payment: 25 }); setAddOpen(false); go(`credit/${ac.account_id}`); }}>SAVE</JurnlButton>}>
          <p>CREATES A MANUAL CREDIT PLACE IN THE REGISTRY.</p>
        </JurnlDrawer>
      : null}
    </CreditShell>
  );
}

export function CreditAccountScreen() {
  const { accountId } = useParams<{ accountId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const account = accountId ? accountById(accountId) : null;
  const [termsOpen, setTermsOpen] = useState(false);
  if (!account || (account.account_type !== 'CREDIT_CARD' && account.account_type !== 'LOAN')) {
    return (
      <CreditShell screenId="F12.ACCOUNT">
        <FamilyChrome familyId="F12" nodeId="F12.ACCOUNT" backLabel="BACK" onBack={() => go('credit')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>NOT A CREDIT PLACE</b></JurnlPanel>
      </CreditShell>
    );
  }
  const s = creditSummary(account);
  return (
    <CreditShell screenId="F12.ACCOUNT">
      <FamilyChrome familyId="F12" nodeId="F12.ACCOUNT" backLabel="BACK TO CREDIT" onBack={() => go('credit')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{account.display_name}</h1>
        <p className="jrn-home__sub">{s.util != null ? `${s.util}% UTILIZATION` : 'LIMIT UNKNOWN'}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>USED</b>
          <p>{formatMoney(s.used)}</p>
          <b>LIMIT</b>
          <p>{s.limit != null ? formatMoney(s.limit) : 'NOT SET'}</p>
          <b>MIN PAYMENT</b>
          <p>{s.minPay != null ? formatMoney(s.minPay) : 'NOT SET'}</p>
          <b>DUE DAY</b>
          <p>{s.dueDay ?? 'NOT SET'}</p>
        </JurnlPanel>
        <JurnlButton trigger="credit-edit-terms" onClick={() => setTermsOpen(true)}>CREDIT TERMS</JurnlButton>
        <JurnlButton variant="secondary" trigger="credit-activity" onClick={() => go('activity')}>ACTIVITY</JurnlButton>
      </div>
      {termsOpen ? <TermsSheet accountId={account.account_id} onClose={() => setTermsOpen(false)} /> : null}
    </CreditShell>
  );
}

function UtilizationSheet({ accounts, onClose }: { accounts: ReturnType<typeof creditAccounts>; onClose: () => void }) {
  return (
    <JurnlDrawer expression="analysis" size="long" testId="credit-util" title="UTILIZATION" lead="NOT A CREDIT SCORE." onClose={onClose}>
      {accounts.map((a) => {
        const s = creditSummary(a);
        return <p key={a.account_id}>{a.display_name} · {s.util != null ? `${s.util}%` : 'N/A'}</p>;
      })}
    </JurnlDrawer>
  );
}

function TermsSheet({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const attrs = creditAttributesFor(accountId);
  const [limit, setLimit] = useState(String(attrs?.credit_limit ?? ''));
  const [balance, setBalance] = useState(String(attrs?.current_balance ?? ''));
  const [minPay, setMinPay] = useState(String(attrs?.minimum_payment ?? ''));
  const [dueDay, setDueDay] = useState(String(attrs?.payment_due_day ?? ''));
  const [apr, setApr] = useState(String(attrs?.apr ?? ''));
  return (
    <JurnlDrawer expression="form" size="long" testId="credit-terms" title="CREDIT TERMS" onClose={onClose}
      footer={<JurnlButton trigger="credit-terms-save" onClick={() => { upsertCreditTerms(accountId, { credit_limit: Number(limit) || null, current_balance: Number(balance) || null, minimum_payment: Number(minPay) || null, payment_due_day: Number(dueDay) || null, apr: Number(apr) || null }); onClose(); }}>SAVE</JurnlButton>}>
      <JurnlInput label="LIMIT" value={limit} onValue={setLimit} trigger="credit-limit" inputMode="decimal" />
      <JurnlInput label="BALANCE OWED" value={balance} onValue={setBalance} trigger="credit-balance" inputMode="decimal" />
      <JurnlInput label="MIN PAYMENT" value={minPay} onValue={setMinPay} trigger="credit-min" inputMode="decimal" />
      <JurnlInput label="DUE DAY (1-28)" value={dueDay} onValue={setDueDay} trigger="credit-due" inputMode="numeric" />
      <JurnlInput label="APR" value={apr} onValue={setApr} trigger="credit-apr" inputMode="decimal" />
    </JurnlDrawer>
  );
}
