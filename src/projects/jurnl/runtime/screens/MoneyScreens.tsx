/** F05 MONEY — structural completion (Wave 2). */

import { useMemo, useState, type ReactNode } from 'react';
import { getRepository } from '../../data/repository/deviceRepository';
import { useParams, useSearchParams } from 'react-router-dom';
import { useLedgerPositions, usualPurposesFor } from '../../data/ledger/moneyPositions';
import { BALANCE_BASIS_LABEL, LOCATION_KIND_LABEL, resolveEntryAccount, summarizePositions } from '../../data/ledger/accounting';
import { parseMoneyInput, renameAccount, setAccountBalance } from '../../data/ledger/ledgerOps';
import { PURPOSE_LABEL } from '../../data/ledger/purposes';
import { entryWhenLabel } from '../../data/home/money';
import { formatRelativeDate, getTodayKey } from '../../data/foundation/dates';
import { Chips, OpenTransfersPanel, PurposeSheet, TransferDetailSheet, TransferSheet } from '../finance/FinanceSheets';
import { computeMoneyPicture } from '../../data/ledger/moneyPicture';
import { useRepoTick } from '../../data/home/money';
import { listActiveAccounts, accountById } from '../../data/foundation/accounts';
import { archiveAccount, createManualAccount } from '../../data/foundation/accountMutations';
import { formatMoney, ledgerEntries, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { SIDEKICK_PLATES } from '../../data/parents/sidekickPlates';
import { RaLayer, RaPara, RaRule, RootAuthorityStage, hangY, objectTransform, shellY, spreadB, spreadT, wallTransform } from '../components/RootAuthorityStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { RefIcon, RefText, at } from '../components/ReferenceStage';
import { RA_MONEY } from '../layout/rootAuthorityLayout';
import { MONEY_FOOT, MONEY_LEAF, MONEY_SCENE } from '../layout/rootAuthorityScene';
import type { RefBox } from '../layout/referenceLayout';
import sprig from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlFamilyShell } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';
import { honestAccountsConnectionLabel } from '../../data/foundation/connectionProvider';
import { useSetup } from '../../data/f02/setupDraft';
import type { AccountType } from '../../data/foundation/categories';

function MoneyShell({ screenId, children, nav }: { screenId: string; children: ReactNode; nav: 'MONEY' }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlFamilyShell
      screenId={screenId}
      familyId="F05"
      familyPlate={PARENT_PLATES.F05}
      nav={<JurnlProductNav current={nav} onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F05" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F05" nodeId={screenId} onClose={closeOverlay} /> : null}
        </>
      }
    >
      {children}
    </JurnlFamilyShell>
  );
}

type Shelf = { id: string; label: string; caption: string; types: AccountType[] };

/** Cabinet shelves: places grouped by what they are. Grouping is presentation only; every value is the place's own. */
const SHELVES: Shelf[] = [
  { id: 'EVERYDAY', label: 'EVERYDAY', caption: 'BANK, DEBIT + CASH', types: ['CHECKING', 'DEBIT_CARD', 'CASH'] },
  { id: 'SAVED', label: 'SAVED', caption: 'SAVINGS + INVESTMENTS', types: ['SAVINGS', 'INVESTMENT'] },
  { id: 'OWED', label: 'OWED', caption: 'CARDS + LOANS', types: ['CREDIT_CARD', 'LOAN'] },
  { id: 'OTHER', label: 'OTHER', caption: 'BUSINESS + OTHER', types: ['BUSINESS', 'OTHER'] },
];

const KIND_LABEL: Record<AccountType, string> = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  DEBIT_CARD: 'DEBIT CARD',
  CREDIT_CARD: 'CARD',
  CASH: 'CASH',
  INVESTMENT: 'INVESTMENT',
  LOAN: 'LOAN',
  BUSINESS: 'BUSINESS',
  OTHER: 'OTHER',
};

/** F05 MONEY — CONTAINER / CABINET. A financial wardrobe: shelves by kind, places as drawers you open. */
const ML = RA_MONEY.wall;

export function MoneyHubScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const accounts = listActiveAccounts();
  const spec = parentById('F05')!;
  const [addOpen, setAddOpen] = useState(false);
  const { positions } = useLedgerPositions();
  const shelves = SHELVES.map((shelf) => ({ ...shelf, places: accounts.filter((a) => shelf.types.includes(a.account_type)) })).filter((s) => s.places.length);
  // Money held (assets) and owed (cards, loans) from the one ledger. Credit available is never counted as held.
  const totals = summarizePositions(positions);
  const held = totals.ownedAssets;
  const owed = totals.owed;
  const amountOf = (id: string) => {
    const p = positions.find((x) => x.account_id === id);
    return p ? (p.nature === 'LIABILITY' ? p.owed : p.held) : 0;
  };
  // No bank aggregation provider exists (JURNL_BANK_CONNECTION_PROVIDER): say so plainly instead of a status code.
  const source = draft.accounts === 'CONNECTED' ? [honestAccountsConnectionLabel(draft.accounts)] : ['NO BANK CONNECTED.', 'BALANCES ARE WHAT YOU ENTERED.'];
  const count = accounts.length;
  const T = ML.text;
  const B = ML.box;
  // The cabinet has two lined drawers and a third to add a place, as the reference draws it. Every place stays one tap
  // away under SEE ALL PLACES; a drawer names its lead place and how many it holds.
  const drawers = [
    { insert: MONEY_SCENE.objects.insert1!, front: MONEY_SCENE.objects.front1!, cap: T.cap1, name: T.name1, sub: T.sub1, amt: T.amt1, front_t: T.front1, div: B.div1, line: B.line1, leaf: MONEY_LEAF.insert1 },
    { insert: MONEY_SCENE.objects.insert2!, front: MONEY_SCENE.objects.front2!, cap: T.cap2, name: T.name2, sub: T.sub2, amt: T.amt2, front_t: T.front2, div: B.div2, line: B.line2, leaf: MONEY_LEAF.insert2 },
  ];
  const front3 = MONEY_SCENE.objects.front3!;
  const next = B.next;
  return (
    <RootAuthorityStage
      screenId="F05.00"
      plate={SIDEKICK_PLATES.F05}
      framing={MONEY_SCENE.framing}
      nav={<JurnlProductNav marks="parent" current="MONEY" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F05" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F05" nodeId="F05.00" onClose={closeOverlay} /> : null}
          {addOpen ? <AddPlaceSheet onClose={() => setAddOpen(false)} onSaved={(id) => { setAddOpen(false); go(`money/places/${id}`); }} /> : null}
        </>
      }
    >
      {(fit) => (
        <>
          <RaLayer transform={wallTransform(fit, 0, 0)} className="jrn-ra__layer--top">
            <ReferenceLockup L={{ box: { sprig: B.sprig, word: B.word }, text: { desc1: T.desc1, desc2: T.desc2 } }} />
          </RaLayer>

          <RaLayer transform={wallTransform(fit, 0, hangY(fit, MONEY_SCENE.hang))} data-jrn-zone="intro">
            <RefText t={T.title} as="h1">MONEY</RefText>
            <span className="jrn-ra__rule" aria-hidden style={{ ...at(B.titleRule), height: 2 }} />
            <RefText t={T.sub} as="p">{count ? `YOUR MONEY IS IN ${count} ${count === 1 ? 'PLACE' : 'PLACES'}.` : 'NO PLACES YET.'}</RefText>
            {count ?
              <div data-jrn-panel="signal">
                <span className="jrn-ra__rule" aria-hidden style={{ ...at(B.heldRule), width: 2 }} />
                <RefText t={T.heldLbl} as="span">HELD</RefText>
                <RefText t={T.held} as="b">{formatMoney(held)}</RefText>
                <span className="jrn-ra__rule" aria-hidden style={{ ...at(B.owedRule), width: 2 }} />
                <RefText t={T.owedLbl} as="span">OWED</RefText>
                <RefText t={T.owed} as="b">{formatMoney(owed)}</RefText>
              </div>
            : null}
            <RefText t={T.question} as="p">{spec.question}</RefText>
            {count ? null : <RaPara t={{ ...T.question, top: T.question.top + 34, size: 15, ls: 4 }} width={560} className="jrn-ra__soft">ADD WHERE YOUR MONEY LIVES: CHECKING, SAVINGS, CASH OR A CARD. NO BANK CONNECTION NEEDED.</RaPara>}
          </RaLayer>

          {/* The cabinet: each reference drawer mapped onto the same drawer of the shell. */}
          <div data-jrn-zone="content-rail" aria-label="PLACES">
            {drawers.map((d, i) => {
              const shelf = shelves[i];
              const lead = shelf?.places[0];
              const insertBox: RefBox = [d.insert.from[0] - 10, d.insert.from[1] + 6, d.leaf[2] + 6, spreadT(d.sub, d.insert).ink[3] + 14];
              return (
                <div key={i} data-jrn-shelf={shelf?.id ?? `empty-${i + 1}`}>
                  <RaLayer transform={objectTransform(fit, d.insert)}>
                    {shelf && lead ?
                      <button type="button" className="jrn-ra__hit" data-jrn-trigger={`money-open-${lead.account_id}`} onClick={() => go(`money/places/${lead.account_id}`)} style={at(insertBox)}>
                        <RefText t={spreadT(d.cap, d.insert)} origin={insertBox} as="span" className="jrn-ra__soft">{shelf.places.length > 1 ? `${shelf.caption} · ${shelf.places.length}` : shelf.caption}</RefText>
                        <RefText t={spreadT(d.name, d.insert)} origin={insertBox} as="span">{lead.display_name}</RefText>
                        <RefText t={spreadT(d.sub, d.insert)} origin={insertBox} as="span" className="jrn-ra__soft">{`${KIND_LABEL[lead.account_type]} · ${lead.is_manual ? 'BY HAND' : lead.is_connected ? 'PREVIEW LINK' : 'REGISTRY'}`}</RefText>
                        <span className="jrn-ra__rule jrn-ra__rule--soft" aria-hidden style={{ ...at(spreadB(d.div, d.insert), insertBox), width: 2 }} />
                        <RefText t={spreadT(d.amt, d.insert)} origin={insertBox} as="b">{formatMoney(amountOf(lead.account_id))}</RefText>
                        <img className="jrn-ra__img jrn-ra__leaf" src={sprig} alt="" draggable={false} style={at(spreadB(d.leaf, d.insert), insertBox)} />
                      </button>
                    : null}
                  </RaLayer>
                  <RaLayer transform={objectTransform(fit, d.front)}>
                    {shelf ?
                      <>
                        <RefText t={d.front_t} as="p">{shelf.label}</RefText>
                        <RaRule from={[d.line[0], (d.line[1] + d.line[3]) / 2]} to={[d.line[2], (d.line[1] + d.line[3]) / 2]} />
                      </>
                    : null}
                  </RaLayer>
                </div>
              );
            })}
            <RaLayer transform={objectTransform(fit, front3)}>
              <button type="button" className="jrn-ra__hit" data-jrn-trigger="money-add-place-slot" data-primary={count ? 'false' : 'true'} onClick={() => setAddOpen(true)} style={at([front3.from[0] + 20, front3.from[1] + 18, B.plus[2] + 30, front3.from[1] + 100])}>
                <RefText t={T.front3} origin={[front3.from[0] + 20, front3.from[1] + 18, 0, 0]} as="span">ADD A PLACE</RefText>
                <RaRule from={[B.line3[0] - front3.from[0] - 20, (B.line3[1] + B.line3[3]) / 2 - front3.from[1] - 18]} to={[B.line3[2] - front3.from[0] - 20, (B.line3[1] + B.line3[3]) / 2 - front3.from[1] - 18]} />
                {(() => {
                  const ox = front3.from[0] + 20;
                  const oy = front3.from[1] + 18;
                  const cx = (B.plus[0] + B.plus[2]) / 2 - ox;
                  const cy = (B.plus[1] + B.plus[3]) / 2 - oy;
                  const r = (B.plus[2] - B.plus[0]) / 2;
                  return (
                    <>
                      <RaRule from={[cx - r, cy]} to={[cx + r, cy]} />
                      <RaRule from={[cx, cy - r]} to={[cx, cy + r]} />
                    </>
                  );
                })()}
              </button>
            </RaLayer>

            <RaLayer transform={wallTransform(fit, 0, Math.min(shellY(fit, MONEY_FOOT.shell) - fit.u * MONEY_FOOT.ref, fit.H - fit.dock - 8 - fit.u * MONEY_FOOT.last))}>
              <button type="button" className="jrn-ra__hit" data-jrn-trigger="money-open-places" onClick={() => go('money/places')} style={at([T.see.ink[0] - 10, T.see.ink[1] - 14, T.see.ink[2] + 10, B.seeRule[3] + 8])}>
                <RefText t={T.see} origin={[T.see.ink[0] - 10, T.see.ink[1] - 14, 0, 0]} as="span">SEE ALL PLACES.</RefText>
              </button>
              <span className="jrn-ra__rule" aria-hidden style={{ ...at(B.seeRule), height: 2 }} />
              <RefText t={T.note1} as="p" className="jrn-ra__soft">{source[0]}</RefText>
              {source[1] ? <RefText t={T.note2} as="p" className="jrn-ra__soft">{source[1]}</RefText> : null}
              <button type="button" className="jrn-ra__cta" data-jrn-trigger="money-next" onClick={() => go('money/places')} style={at(next)}>
                <RefText t={T.next} origin={next} as="span">NEXT</RefText>
                <RefIcon name="arrow" box={B.nextArrow} origin={next} stroke={2} />
              </button>
              <nav className="jrn-ra__also" aria-label="ALSO IN MONEY" style={{ left: T.see.ink[2] + 26, top: T.see.top - 30, width: next[0] - T.see.ink[2] - 46 }}>
                <button type="button" className="jrn-ra__link" data-jrn-trigger="money-open-income" onClick={() => go('income')}>INCOME</button>
                <button type="button" className="jrn-ra__link" data-jrn-trigger="money-open-activity" onClick={() => go('activity')}>ACTIVITY</button>
                <button type="button" className="jrn-ra__link" data-jrn-trigger="discovery-F05-F16" onClick={() => go('F16')}>RECORDS</button>
              </nav>
            </RaLayer>
          </div>
        </>
      )}
    </RootAuthorityStage>
  );
}

export function MoneyPlacesScreen() {
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const accounts = listActiveAccounts();
  const { positions, unassigned } = useLedgerPositions();
  const totals = summarizePositions(positions);
  const [params] = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(params.has('move'));
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [openTransfer, setOpenTransfer] = useState<string | null>(null);
  useRepoTick();
  const today = getTodayKey();
  const snap = getRepository().getSnapshot();
  const pic = computeMoneyPicture(snap.accounts, snap.creditAttributes, snap.transactions, today);
  return (
    <MoneyShell screenId="F05.ACCOUNTS" nav="MONEY">
      <FamilyChrome familyId="F05" nodeId="F05.ACCOUNTS" backLabel="BACK TO MONEY" onBack={() => go('money')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">PLACES</h1>
        <p className="jrn-home__sub" data-testid="places-summary">
          {accounts.length ?
            `${formatMoney(pic.availableInAccounts)} AVAILABLE IN ACCOUNTS · ${formatMoney(totals.cashOnHand)} IN CASH${pic.inTransit > 0 ? ` · ${formatMoney(pic.inTransit)} IN TRANSIT · ${formatMoney(pic.trackedAssets)} TOTAL TRACKED` : ''}${totals.owed > 0 ? ` · ${formatMoney(totals.owed)} OWED ON CARDS` : ''}`
          : 'YOUR ACCOUNTS, CARDS AND CASH.'}
        </p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {accounts.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel" data-jrn-trigger="money-empty">
            <b>NO ACCOUNTS YET</b>
            <p>ADD A BANK ACCOUNT, CARD OR CASH. NO BANK CONNECTION NEEDED.</p>
          </JurnlPanel>
        : accounts.map((a) => {
            const p = positions.find((x) => x.account_id === a.account_id);
            const t = pic.transferTotals.byAccount.get(a.account_id);
            const moving = [t && t.incoming > 0 ? `${formatMoney(t.incoming)} ON ITS WAY IN` : '', t && t.waitingToLeave > 0 ? `${formatMoney(t.waitingToLeave)} NOT SENT YET` : '', t && t.inTransitOut > 0 ? `${formatMoney(t.inTransitOut)} SENT, NOT ARRIVED` : ''].filter(Boolean).join(' · ');
            return (
              <button key={a.account_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`money-place-${a.account_id}`} onClick={() => go(`money/places/${a.account_id}`)}>
                <span className="jrn-tx__copy">
                  <span className="jrn-tx__name">{a.display_name}</span>
                  <small>{p ? `${LOCATION_KIND_LABEL[p.kind]} · ${p.updatedOn ? `UPDATED ${formatRelativeDate(p.updatedOn, today)}` : BALANCE_BASIS_LABEL[p.basis]}${moving ? ` · ${moving}` : ''}` : a.account_type}</small>
                </span>
                <span className="jrn-tx__amt">{p?.nature === 'LIABILITY' ? `${formatMoney(p.owed)} OWED` : formatMoney(p?.held ?? a.available_balance)}</span>
              </button>
            );
          })}
        <OpenTransfersPanel onOpen={setOpenTransfer} />
        {unassigned.count ? <JurnlPanel role="detail" className="jrn-home__panel"><b>{`${unassigned.count} ${unassigned.count === 1 ? 'ENTRY HAS' : 'ENTRIES HAVE'} NO ACCOUNT`}</b><p>OPEN ACTIVITY AND CHOOSE AN ACCOUNT FOR THEM.</p></JurnlPanel> : null}
        <JurnlButton trigger="money-add-place" onClick={() => setAddOpen(true)}>
          ADD A PLACE
        </JurnlButton>
        {accounts.length > 1 ? <JurnlButton variant="secondary" trigger="money-move" onClick={() => setMoveOpen(true)}>MOVE MONEY</JurnlButton> : null}
        {accounts.length ? <JurnlButton variant="secondary" trigger="money-purposes" onClick={() => setPurposeOpen(true)}>USUAL ACCOUNTS</JurnlButton> : null}
      </div>
      {addOpen ?
        <AddPlaceSheet onClose={() => setAddOpen(false)} onSaved={(id) => { setAddOpen(false); go(`money/places/${id}`); }} />
      : null}
      {moveOpen ? <TransferSheet fromId={params.get('move') || undefined} toId={params.get('to') || undefined} onClose={() => setMoveOpen(false)} /> : null}
      {purposeOpen ? <PurposeSheet onClose={() => setPurposeOpen(false)} /> : null}
      {openTransfer ? <TransferDetailSheet linkId={openTransfer} onClose={() => setOpenTransfer(null)} /> : null}
    </MoneyShell>
  );
}

export function MoneyPlaceDetailScreen() {
  const { placeId } = useParams<{ placeId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const account = placeId ? accountById(placeId) : null;
  const { positions } = useLedgerPositions();
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const accounts = getRepository().listAccounts();
  const recent = useMemo(
    () => (account ? ledgerEntries().filter((t) => resolveEntryAccount(t, accounts)?.account_id === account.account_id).slice(0, 5) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account, positions],
  );
  if (!account) {
    return (
      <MoneyShell screenId="F05.ACCOUNT" nav="MONEY">
        <FamilyChrome familyId="F05" nodeId="F05.ACCOUNT" backLabel="BACK" onBack={() => go('money/places')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel">
          <b>PLACE NOT FOUND</b>
        </JurnlPanel>
      </MoneyShell>
    );
  }
  const p = positions.find((x) => x.account_id === account.account_id);
  const liability = p?.nature === 'LIABILITY';
  const purposes = usualPurposesFor(account);
  const today = getTodayKey();
  return (
    <MoneyShell screenId="F05.ACCOUNT" nav="MONEY">
      <FamilyChrome familyId="F05" nodeId="F05.ACCOUNT" backLabel="BACK TO PLACES" onBack={() => go('money/places')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{account.display_name}</h1>
        <p className="jrn-home__sub">{p ? `${LOCATION_KIND_LABEL[p.kind]} · ${BALANCE_BASIS_LABEL[p.basis]}` : account.account_type}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel" data-testid="place-balance">
          <b>{liability ? 'OWED NOW' : 'HOLDS NOW'}</b>
          <p data-jrn-amount={p ? (liability ? p.owed : p.held) : 0}>{formatMoney(p ? (liability ? p.owed : p.held) : account.available_balance)}</p>
          <b>{liability ? 'BALANCE YOU ENTERED' : 'BALANCE YOU ENTERED'}</b>
          <p>{formatMoney(p?.entered ?? account.balance)}</p>
          <b>CHANGE FROM ENTRIES</b>
          <p>{formatMoney(p?.recordedDelta ?? 0, true)}</p>
          {p?.creditLimit != null ? (
            <>
              <b>CREDIT LIMIT</b>
              <p>{formatMoney(p.creditLimit)}</p>
              <b>CREDIT AVAILABLE</b>
              <p>{formatMoney(p.availableCredit ?? 0)}</p>
            </>
          ) : null}
          <b>UPDATED</b>
          <p>{p?.updatedOn ? formatRelativeDate(p.updatedOn, today) : 'NOT YET'}</p>
          {purposes.length ? (
            <>
              <b>USUALLY USED FOR</b>
              <p>{purposes.map((x) => PURPOSE_LABEL[x]).join(', ')}</p>
            </>
          ) : null}
        </JurnlPanel>
        {recent.length ?
          <JurnlPanel role="ledger" className="jrn-home__panel">
            <b>RECENT TRANSACTIONS</b>
            {recent.map((t) => (
              <p key={t.id}>{t.merchant} · {formatMoney(t.amount, t.direction === 'INCOME')} · {entryWhenLabel(t)}</p>
            ))}
          </JurnlPanel>
        : null}
        <JurnlButton variant="secondary" trigger="money-edit-place" onClick={() => setEditOpen(true)}>
          EDIT
        </JurnlButton>
        {!liability ? <JurnlButton variant="secondary" trigger="money-place-move" onClick={() => setMoveOpen(true)}>MOVE MONEY</JurnlButton> : <JurnlButton variant="secondary" trigger="money-place-credit" onClick={() => go(`credit/${account.account_id}`)}>CARD DETAILS</JurnlButton>}
        <JurnlButton variant="secondary" trigger="money-remove-place" onClick={() => setRemoveOpen(true)}>
          ARCHIVE
        </JurnlButton>
      </div>
      {editOpen ?
        <EditPlaceSheet account={account} current={p ? (liability ? p.owed : p.held) : account.available_balance} liability={liability} onClose={() => setEditOpen(false)} />
      : null}
      {moveOpen ? <TransferSheet fromId={account.account_id} onClose={() => setMoveOpen(false)} /> : null}
      {removeOpen ?
        <JurnlDrawer size="long" testId="money-remove" title="ARCHIVE PLACE" lead="ITS TRANSACTIONS STAY IN ACTIVITY." onClose={() => setRemoveOpen(false)} footer={
          <JurnlButton trigger="money-remove-confirm" onClick={() => { archiveAccount(account.account_id); setRemoveOpen(false); go('money/places'); }}>ARCHIVE</JurnlButton>
        }>
          <p>{account.display_name}</p>
        </JurnlDrawer>
      : null}
    </MoneyShell>
  );
}

const PLACE_KINDS: { id: AccountType; label: string }[] = [
  { id: 'CHECKING', label: 'BANK ACCOUNT' },
  { id: 'SAVINGS', label: 'SAVINGS' },
  { id: 'DEBIT_CARD', label: 'DEBIT / PAYOUT CARD' },
  { id: 'CREDIT_CARD', label: 'CREDIT CARD' },
  { id: 'CASH', label: 'CASH' },
];

function AddPlaceSheet({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [kind, setKind] = useState<AccountType>('CHECKING');
  const [payout, setPayout] = useState(false);
  const card = kind === 'CREDIT_CARD';
  const amount = parseMoneyInput(balance, true);
  const limitValue = limit.trim() ? parseMoneyInput(limit) : null;
  const valid = name.trim().length >= 2 && balance.trim() !== '' && amount != null && (!limit.trim() || limitValue != null);
  return (
    <JurnlDrawer size="long" testId="money-add-place" title="ADD A PLACE" lead="WHERE MONEY IS HELD OR OWED. YOU ENTER THE BALANCE; NO BANK CONNECTION." onClose={onClose} footer={
      <JurnlButton trigger="money-add-save" disabled={!valid} onClick={() => { const a = createManualAccount(name, kind, amount ?? 0, getTodayKey(), { creditLimit: card ? limitValue : undefined, isPayoutCard: payout }); onSaved(a.account_id); }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="money-add-name" />
      <Chips label="KIND" value={kind} options={PLACE_KINDS} onChange={(k) => { setKind(k); if (k === 'CREDIT_CARD' || k === 'CASH') setPayout(false); }} trigger="money-add-kind" />
      <JurnlInput label={card ? 'BALANCE OWED NOW' : 'BALANCE NOW'} value={balance} onValue={setBalance} trigger="money-add-balance" inputMode="decimal" />
      {card ? <JurnlInput label="CREDIT LIMIT (OPTIONAL)" value={limit} onValue={setLimit} trigger="money-add-limit" inputMode="decimal" /> : null}
      {kind === 'DEBIT_CARD' || kind === 'CHECKING' ? (
        <Chips label="RIDESHARE PAY" value={payout ? 'YES' : 'NO'} options={[{ id: 'NO', label: 'NOT A PAYOUT CARD' }, { id: 'YES', label: 'RECEIVES RIDESHARE PAY' }]} onChange={(v) => setPayout(v === 'YES')} trigger="money-add-payout" />
      ) : null}
      {card ? <p className="jrn-currency__note">A CREDIT CARD IS MONEY OWED. ITS AVAILABLE CREDIT IS NEVER COUNTED AS MONEY YOU HAVE.</p> : null}
    </JurnlDrawer>
  );
}

function EditPlaceSheet({ account, current, liability, onClose }: { account: NonNullable<ReturnType<typeof accountById>>; current: number; liability: boolean; onClose: () => void }) {
  const [name, setName] = useState(account.display_name);
  const [balance, setBalance] = useState(String(current));
  const [error, setError] = useState<string | null>(null);
  return (
    <JurnlDrawer size="long" testId="money-edit-place" title="EDIT PLACE" lead="IF THE BALANCE CHANGED, JURNL RECORDS A BALANCE CORRECTION FOR THE DIFFERENCE." onClose={onClose} footer={
      <>
        {error ? <p className="jrn-field__error" role="alert">{error}</p> : null}
        <JurnlButton trigger="money-edit-save" onClick={() => {
          const value = parseMoneyInput(balance, true);
          if (value == null) return setError('BALANCES USE NUMBERS LIKE 250.00.');
          const nextName = name.trim().toUpperCase();
          if (nextName && nextName !== account.display_name) {
            const renamed = renameAccount(account.account_id, nextName);
            if (!renamed.ok) return setError(renamed.error);
          }
          const r = setAccountBalance(account.account_id, value);
          if (!r.ok) return setError(r.error);
          onClose();
        }}>SAVE</JurnlButton>
      </>
    }>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="money-edit-name" />
      <JurnlInput label={liability ? 'OWED NOW' : 'HOLDS NOW'} value={balance} onValue={setBalance} trigger="money-edit-balance" inputMode="decimal" />
    </JurnlDrawer>
  );
}
