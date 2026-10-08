/** F12 CREDIT — Wave 3; attributes on canonical accounts. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { accountById, creditAccounts } from '../../data/foundation/accounts';
import { creditAttributesFor, creditSummary, upsertCreditTerms, useCreditAccounts } from '../../data/f12/creditStore';
import { createManualAccount } from '../../data/foundation/accountMutations';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { SIDEKICK_PLATES } from '../../data/parents/sidekickPlates';
import { RA_REF_W, RaLayer, RootAuthorityStage, shellY, wallTransform } from '../components/RootAuthorityStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { RefIcon, RefText, at } from '../components/ReferenceStage';
import { RA_CREDIT } from '../layout/rootAuthorityLayout';
import { CREDIT_DOSSIER, CREDIT_SCENE } from '../layout/rootAuthorityScene';
import type { RefBox } from '../layout/referenceLayout';
import dossier from '../../families/F12_CREDIT/ROOT_AUTHORITY/CREDIT_DOSSIER.png';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';

function CreditShell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F12"
      familyPlate={PARENT_PLATES.F12}
      nav={<JurnlProductNav current="CREDIT" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F12" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F12" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

/** F12 CREDIT — LEDGER / GRID with utilization meters. A quiet reading of what's used against each limit. */
const CL = RA_CREDIT.wall;

export function CreditHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  useCurrency();
  const accounts = useCreditAccounts();
  const spec = parentById('F12')!;
  const [utilOpen, setUtilOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const owed = accounts.reduce((t, a) => t + creditSummary(a).used, 0);
  const lead = accounts[0];
  const leadSummary = lead ? creditSummary(lead) : null;
  const T = CL.text;
  const B = CL.box;
  const D = CREDIT_DOSSIER;
  const [q1, q2] = splitQuestion(spec.question);
  const extra = accounts.slice(1, 3);
  const fill = leadSummary?.util != null ? Math.min(1, leadSummary.util / 100) : 0;
  return (
    <RootAuthorityStage
      screenId="F12.00"
      plate={SIDEKICK_PLATES.F12}
      framing={CREDIT_SCENE.framing}
      nav={<JurnlProductNav marks="parent" current="CREDIT" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F12" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F12" nodeId="F12.00" onClose={closeOverlay} /> : null}
          {utilOpen ? <UtilizationSheet accounts={accounts} onClose={() => setUtilOpen(false)} /> : null}
          {addOpen ?
            <JurnlDrawer expression="form" size="long" testId="credit-add" title="ADD A CARD OR LOAN" onClose={() => setAddOpen(false)}
              footer={<JurnlButton trigger="credit-add-save" onClick={() => { const ac = createManualAccount('NEW CARD', 'CREDIT_CARD', 0); upsertCreditTerms(ac.account_id, { credit_limit: 5000, current_balance: 0, payment_due_day: 15, minimum_payment: 25 }); setAddOpen(false); go(`credit/${ac.account_id}`); }}>SAVE</JurnlButton>}>
              <p>CREATES A MANUAL CREDIT PLACE IN THE REGISTRY.</p>
            </JurnlDrawer>
          : null}
        </>
      }
    >
      {(fit) => {
        const navTop = fit.H - fit.dock;
        // Actions just above the dock; the dossier's foot on the ledge, or higher when a short screen needs the room.
        const actionsBottom = navTop - D.dockGap * fit.u;
        const foot = Math.min(shellY(fit, D.shellFoot), actionsBottom - (B.pay[3] - D.foot - (B.b1[1] - D.foot - D.minGap)) * fit.u);
        const lowerY = foot - D.foot * fit.u;
        const actionsY = actionsBottom - B.pay[3] * fit.u;
        return (
          <>
            <RaLayer transform={wallTransform(fit, 0, 0)} className="jrn-ra__layer--top">
              <ReferenceLockup L={{ box: { sprig: B.sprig, word: B.word }, text: { desc1: T.desc1, desc2: T.desc2 } }} />
            </RaLayer>
            <RaLayer transform={wallTransform(fit, fit.W - RA_REF_W * fit.u, 0)} className="jrn-ra__layer--top">
              <RefText t={T.tag1} as="span">PLAN TODAY.</RefText>
              <RefText t={T.tag2} as="span">GROW FREELY.</RefText>
            </RaLayer>
            <RaLayer transform={wallTransform(fit, 0, 0)} className="jrn-ra__layer--top" data-jrn-zone="intro">
              <RefText t={T.title} as="h1">CREDIT</RefText>
              <span className="jrn-ra__rule" aria-hidden style={{ ...at(B.titleRule), height: 2 }} />
              {accounts.length ?
                <>
                  <RefText t={T.l1} as="p">{`${accounts.length} ${accounts.length === 1 ? 'CARD OR LOAN' : 'CARDS AND LOANS'}.`}</RefText>
                  <RefText t={T.l2} as="p">{`${formatMoney(owed)} USED IN TOTAL.`}</RefText>
                  <RefText t={T.o1} as="p">OPEN ONE TO SET ITS</RefText>
                  <RefText t={T.o2} as="p">LIMIT, RATE AND DUE DAY.</RefText>
                </>
              : <>
                  <RefText t={T.l1} as="p">NO CARDS OR LOANS</RefText>
                  <RefText t={T.l2} as="p">ARE ADDED.</RefText>
                  <RefText t={T.o1} as="p">ADD ONE TO TRACK WHAT’S</RefText>
                  <RefText t={T.o2} as="p">USED AND WHEN IT’S DUE.</RefText>
                </>}
              <span className="jrn-ra__rule" aria-hidden style={{ ...at(B.qRule), height: 2 }} />
              <RefText t={T.q1} as="p">{q1}</RefText>
              <RefText t={T.q2} as="p">{q2}</RefText>
            </RaLayer>

            {/* The dossier on the ledge: the physical folder carries the lead card, its use and its share of the limit. */}
            <RaLayer transform={wallTransform(fit, 0, lowerY)} data-jrn-zone="content-rail" aria-label="CARDS AND LOANS">
              <img className="jrn-ra__img jrn-ra__dossier" src={dossier} alt="" draggable={false} style={at(D.box)} />
              {lead && leadSummary ?
                <button type="button" className="jrn-ra__hit" data-jrn-trigger={`credit-${lead.account_id}`} onClick={() => go(`credit/${lead.account_id}`)} style={at([150, 900, 760, 1090])}>
                  <RefText t={T.card} origin={[150, 900, 0, 0]} as="span">{lead.display_name}</RefText>
                  <span className="jrn-ra__meter" aria-hidden style={{ ...at([B.meter[0], B.meter[1] + 2, B.meter[2], B.meter[1] + 4], [150, 900, 0, 0]) }} />
                  <span className="jrn-ra__meter jrn-ra__meter--fill" aria-hidden style={{ ...at([B.meter[0], B.meter[1], B.meter[0] + (B.meter[2] - B.meter[0]) * fill, B.meter[3] - 1], [150, 900, 0, 0]) }} />
                  <RefText t={{ ...T.util, left: undefined, right: B.meter[2] }} origin={[150, 900, 760, 1090]} as="span">{leadSummary.util != null ? `${leadSummary.util}% OF THE LIMIT USED` : 'NO LIMIT SET'}</RefText>
                  <RefText t={T.amount} origin={[150, 900, 0, 0]} as="b">{formatMoney(leadSummary.used)}</RefText>
                </button>
              : <RefText t={T.card} as="p">NO CARD IN THE FOLDER</RefText>}
              {lead ? <RefText t={T.tab} as="span" className="jrn-ra__soft">{lead.account_type === 'LOAN' ? 'LOAN' : 'CARD'}</RefText> : null}
              {extra.map((a, i) => {
                const s = creditSummary(a);
                const box: RefBox = [500, 1020 + i * 34, 760, 1050 + i * 34];
                return (
                  <button key={a.account_id} type="button" className="jrn-ra__hit" data-jrn-trigger={`credit-${a.account_id}`} onClick={() => go(`credit/${a.account_id}`)} style={at(box)}>
                    <RefText t={{ ...T.util, top: 8, left: 16 }} as="span">{a.display_name}</RefText>
                    <RefText t={{ ...T.util, top: 8, left: 170 }} as="b">{formatMoney(s.used)}</RefText>
                  </button>
                );
              })}
            </RaLayer>

            <RaLayer transform={wallTransform(fit, 0, actionsY)}>
              {accounts.length ?
                <button type="button" className="jrn-ra__line" data-jrn-trigger="credit-utilization" onClick={() => setUtilOpen(true)} style={at(B.b1)}>
                  <RefText t={T.b1} origin={B.b1} as="span">HOW MUCH IS USED</RefText>
                  <RefIcon name="arrow" box={B.b1Arrow} origin={B.b1} stroke={2} />
                </button>
              : null}
              <button type="button" className="jrn-ra__line" data-jrn-trigger="credit-add" onClick={() => setAddOpen(true)} style={at(accounts.length ? B.b2 : [B.b1[0], B.b2[1], B.b2[2], B.b2[3]])}>
                <RefText t={accounts.length ? T.b2 : { ...T.b2, left: (B.b1[0] + B.b2[2]) / 2 - (T.b2.ink[2] - T.b2.ink[0]) / 2 }} origin={accounts.length ? B.b2 : [B.b1[0], B.b2[1], B.b2[2], B.b2[3]]} as="span">ADD A CARD OR LOAN</RefText>
                <RefIcon name="arrow" box={B.b2Arrow} origin={accounts.length ? B.b2 : [B.b1[0], B.b2[1], B.b2[2], B.b2[3]]} stroke={2} />
              </button>
              <button type="button" className="jrn-ra__cta" data-jrn-trigger="credit-paydown" onClick={() => go('paydown')} style={at(B.pay)}>
                <RefText t={T.pay} origin={B.pay} as="span">PAYDOWN</RefText>
                <span className="jrn-ra__cta-div" aria-hidden style={at(B.payDiv, B.pay)} />
                <RefIcon name="arrow" box={B.payArrow} origin={B.pay} stroke={2} />
              </button>
            </RaLayer>
          </>
        );
      }}
    </RootAuthorityStage>
  );
}

/** Two lines at the comma, as the reference sets the family question. */
function splitQuestion(q: string): [string, string] {
  const i = q.indexOf(', ');
  return i === -1 ? [q, ''] : [q.slice(0, i + 1), q.slice(i + 2)];
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
