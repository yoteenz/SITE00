/** F12 CREDIT — Wave 3; attributes on canonical accounts. */

import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { accountById, creditAccounts } from '../../data/foundation/accounts';
import { creditSummary, useCreditAccounts } from '../../data/f12/creditStore';
import { createManualAccount } from '../../data/foundation/accountMutations';
import { getTodayKey } from '../../data/foundation/dates';
import { useRepoTick } from '../../data/home/money';
import { parseMoneyInput } from '../../data/ledger/ledgerOps';
import { paymentSafety } from '../../data/f12/creditGuidance';
import { CardPaymentSheet, CardPlanSheet, CardTermsSheet, OverallUtilizationRows, cardFactRows } from '../finance/CreditSheets';
import { OpenTransfersPanel, TransferDetailSheet } from '../finance/FinanceSheets';
import { formatMoney, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { SIDEKICK_PLATES } from '../../data/parents/sidekickPlates';
import { RaLayer, RootAuthorityStage, shellY, wallTransform } from '../components/RootAuthorityStage';
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
  useRepoTick();
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
          {addOpen ? <AddCardSheet onClose={() => setAddOpen(false)} onSaved={(id) => { setAddOpen(false); go(`credit/${id}`); }} /> : null}
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
  useRepoTick();
  const account = accountId ? accountById(accountId) : null;
  const [sheet, setSheet] = useState<'terms' | 'plan' | 'pay' | null>(null);
  const [openTransfer, setOpenTransfer] = useState<string | null>(null);
  if (!account || (account.account_type !== 'CREDIT_CARD' && account.account_type !== 'LOAN')) {
    return (
      <CreditShell screenId="F12.ACCOUNT">
        <FamilyChrome familyId="F12" nodeId="F12.ACCOUNT" backLabel="BACK" onBack={() => go('credit')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>NOT A CREDIT CARD OR LOAN</b></JurnlPanel>
      </CreditShell>
    );
  }
  const s = creditSummary(account);
  const f = s.facts;
  const safety = f ? paymentSafety(f, getTodayKey()) : null;
  const rows = cardFactRows(account);
  return (
    <CreditShell screenId="F12.ACCOUNT">
      <FamilyChrome familyId="F12" nodeId="F12.ACCOUNT" backLabel="BACK TO CREDIT" onBack={() => go('credit')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{account.display_name}</h1>
        <p className="jrn-home__sub" data-testid="card-headline">{`${formatMoney(s.used)} OWED · ${s.util != null ? `${s.util}% OF THE LIMIT USED` : 'NO LIMIT ENTERED'}`}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {safety ? <JurnlPanel role="signal" className="jrn-home__panel" data-testid="card-safety-line" data-state={safety.state}><b>PAYMENT</b><p>{safety.line}</p></JurnlPanel> : null}
        <JurnlPanel role="detail" className="jrn-home__panel" data-testid="card-facts">
          {rows.slice(0, 9).map(([k, v]) => (
            <span key={k}><b>{k}</b><p>{v}</p></span>
          ))}
        </JurnlPanel>
        <OpenTransfersPanel accountId={account.account_id} onOpen={setOpenTransfer} />
        <JurnlButton trigger="credit-plan" onClick={() => setSheet('plan')}>PLAN A PAYMENT</JurnlButton>
        <JurnlButton variant="secondary" trigger="credit-record-payment" onClick={() => setSheet('pay')}>RECORD PAYMENT</JurnlButton>
        <JurnlButton variant="secondary" trigger="credit-edit-terms" onClick={() => setSheet('terms')}>CARD TERMS</JurnlButton>
        <JurnlButton variant="secondary" trigger="credit-activity" onClick={() => go('activity')}>ACTIVITY</JurnlButton>
      </div>
      {sheet === 'terms' ? <CardTermsSheet card={account} onClose={() => setSheet(null)} /> : null}
      {sheet === 'plan' ? <CardPlanSheet card={account} onClose={() => setSheet(null)} onRecord={() => setSheet('pay')} /> : null}
      {sheet === 'pay' ? <CardPaymentSheet card={account} onClose={() => setSheet(null)} /> : null}
      {openTransfer ? <TransferDetailSheet linkId={openTransfer} onClose={() => setOpenTransfer(null)} /> : null}
    </CreditShell>
  );
}

function UtilizationSheet({ accounts, onClose }: { accounts: ReturnType<typeof creditAccounts>; onClose: () => void }) {
  useCurrency();
  return (
    <JurnlDrawer expression="analysis" size="long" testId="credit-util" title="HOW MUCH IS USED" lead="BALANCE OWED DIVIDED BY THE CREDIT LIMIT, FROM THE NUMBERS YOU ENTERED. NOT A CREDIT SCORE." onClose={onClose}>
      <OverallUtilizationRows />
      <ul className="jrn-why">
        {accounts.map((a) => {
          const s = creditSummary(a);
          return (
            <li key={a.account_id}>
              <span>{a.display_name}</span>
              <b>{s.util != null ? `${s.util}% · ${formatMoney(s.used)} OF ${formatMoney(s.limit ?? 0)}` : `${formatMoney(s.used)} · NO LIMIT ENTERED`}</b>
            </li>
          );
        })}
      </ul>
      <p className="jrn-currency__note">OPEN A CARD AND CHOOSE PLAN A PAYMENT TO SEE WHAT A TARGET YOU PICK WOULD TAKE.</p>
    </JurnlDrawer>
  );
}

function AddCardSheet({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const [name, setName] = useState('');
  const [owed, setOwed] = useState('');
  const [limit, setLimit] = useState('');
  const owedValue = parseMoneyInput(owed, true);
  const limitValue = limit.trim() ? parseMoneyInput(limit) : null;
  const valid = name.trim().length >= 2 && owed.trim() !== '' && owedValue != null && (!limit.trim() || limitValue != null);
  return (
    <JurnlDrawer expression="form" size="long" testId="credit-add" title="ADD A CARD" lead="ENTER WHAT YOU OWE NOW. ADD THE STATEMENT, DUE DATE AND MINIMUM NEXT IN CARD TERMS." onClose={onClose}
      footer={<JurnlButton trigger="credit-add-save" disabled={!valid} onClick={() => { const ac = createManualAccount(name, 'CREDIT_CARD', owedValue ?? 0, getTodayKey(), { creditLimit: limitValue }); onSaved(ac.account_id); }}>SAVE</JurnlButton>}>
      <JurnlInput label="CARD NAME" value={name} onValue={setName} trigger="credit-add-name" />
      <JurnlInput label="BALANCE OWED NOW" value={owed} onValue={setOwed} trigger="credit-add-owed" inputMode="decimal" />
      <JurnlInput label="CREDIT LIMIT (OPTIONAL)" value={limit} onValue={setLimit} trigger="credit-add-limit" inputMode="decimal" />
    </JurnlDrawer>
  );
}
