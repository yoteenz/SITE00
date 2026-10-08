/** F05 MONEY — structural completion (Wave 2). */

import { useMemo, useState, type ReactNode } from 'react';
import { getRepository } from '../../data/repository/deviceRepository';
import { useParams } from 'react-router-dom';
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
  { id: 'EVERYDAY', label: 'EVERYDAY', caption: 'CHECKING + CASH', types: ['CHECKING', 'CASH'] },
  { id: 'SAVED', label: 'SAVED', caption: 'SAVINGS + INVESTMENTS', types: ['SAVINGS', 'INVESTMENT'] },
  { id: 'OWED', label: 'OWED', caption: 'CARDS + LOANS', types: ['CREDIT_CARD', 'LOAN'] },
  { id: 'OTHER', label: 'OTHER', caption: 'BUSINESS + OTHER', types: ['BUSINESS', 'OTHER'] },
];

const KIND_LABEL: Record<AccountType, string> = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
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
  const shelves = SHELVES.map((shelf) => ({ ...shelf, places: accounts.filter((a) => shelf.types.includes(a.account_type)) })).filter((s) => s.places.length);
  const sum = (types: AccountType[]) => accounts.filter((a) => types.includes(a.account_type)).reduce((t, a) => t + a.available_balance, 0);
  const held = sum(['CHECKING', 'CASH', 'SAVINGS', 'INVESTMENT', 'BUSINESS', 'OTHER']);
  const owed = sum(['CREDIT_CARD', 'LOAN']);
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
                        <RefText t={spreadT(d.amt, d.insert)} origin={insertBox} as="b">{formatMoney(lead.available_balance)}</RefText>
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
  const [addOpen, setAddOpen] = useState(false);
  return (
    <MoneyShell screenId="F05.ACCOUNTS" nav="MONEY">
      <FamilyChrome familyId="F05" nodeId="F05.ACCOUNTS" backLabel="BACK TO MONEY" onBack={() => go('money')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">PLACES</h1>
        <p className="jrn-home__sub">WHERE MONEY LIVES.</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        {accounts.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel" data-jrn-trigger="money-empty">
            <b>NOTHING PLACED</b>
            <p>NAME A PLACE. NO LIVE BANK REQUIRED.</p>
          </JurnlPanel>
        : accounts.map((a) => (
            <button key={a.account_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`money-place-${a.account_id}`} onClick={() => go(`money/places/${a.account_id}`)}>
              <span className="jrn-tx__copy">
                <span className="jrn-tx__name">{a.display_name}</span>
                <small>{a.is_manual ? 'MANUAL' : a.is_connected ? 'PREVIEW LINK' : 'REGISTRY'}</small>
              </span>
              <span className="jrn-tx__amt">{formatMoney(a.available_balance)}</span>
            </button>
          ))}
        <JurnlButton trigger="money-add-place" onClick={() => setAddOpen(true)}>
          ADD A PLACE
        </JurnlButton>
      </div>
      {addOpen ?
        <AddPlaceSheet onClose={() => setAddOpen(false)} onSaved={(id) => { setAddOpen(false); go(`money/places/${id}`); }} />
      : null}
    </MoneyShell>
  );
}

export function MoneyPlaceDetailScreen() {
  const { placeId } = useParams<{ placeId: string }>();
  const { go, openOverlay } = useJurnl();
  useCurrency();
  const account = placeId ? accountById(placeId) : null;
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const recent = useMemo(
    () => (account ? ledgerEntries().filter((t) => t.account === account.display_name).slice(0, 5) : []),
    [account],
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
  return (
    <MoneyShell screenId="F05.ACCOUNT" nav="MONEY">
      <FamilyChrome familyId="F05" nodeId="F05.ACCOUNT" backLabel="BACK TO PLACES" onBack={() => go('money/places')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{account.display_name}</h1>
        <p className="jrn-home__sub">{account.account_type} · {account.is_manual ? 'MANUAL' : 'REGISTRY'}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>AVAILABLE</b>
          <p>{formatMoney(account.available_balance)}</p>
          <b>BALANCE</b>
          <p>{formatMoney(account.balance)}</p>
          {account.credit_limit != null ? (
            <>
              <b>CREDIT LIMIT</b>
              <p>{formatMoney(account.credit_limit)}</p>
            </>
          ) : null}
        </JurnlPanel>
        {recent.length ?
          <JurnlPanel role="ledger" className="jrn-home__panel">
            <b>RECENT MOVEMENTS</b>
            {recent.map((t) => (
              <p key={t.id}>{t.merchant} · {formatMoney(t.amount)}</p>
            ))}
          </JurnlPanel>
        : null}
        <JurnlButton variant="secondary" trigger="money-edit-place" onClick={() => setEditOpen(true)}>
          EDIT
        </JurnlButton>
        <JurnlButton variant="secondary" trigger="money-remove-place" onClick={() => setRemoveOpen(true)}>
          ARCHIVE
        </JurnlButton>
      </div>
      {editOpen ?
        <EditPlaceSheet account={account} onClose={() => setEditOpen(false)} />
      : null}
      {removeOpen ?
        <JurnlDrawer size="long" testId="money-remove" title="ARCHIVE PLACE" lead="MOVEMENTS STAY IN ACTIVITY." onClose={() => setRemoveOpen(false)} footer={
          <JurnlButton trigger="money-remove-confirm" onClick={() => { archiveAccount(account.account_id); setRemoveOpen(false); go('money/places'); }}>ARCHIVE</JurnlButton>
        }>
          <p>{account.display_name}</p>
        </JurnlDrawer>
      : null}
    </MoneyShell>
  );
}

function AddPlaceSheet({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [kind, setKind] = useState<AccountType>('CHECKING');
  const valid = name.trim().length >= 2 && /^\d+(\.\d{1,2})?$/.test(balance.trim());
  return (
    <JurnlDrawer size="long" testId="money-add-place" title="ADD A PLACE" lead="MANUAL PLACE · REPOSITORY BACKED" onClose={onClose} footer={
      <JurnlButton trigger="money-add-save" disabled={!valid} onClick={() => { const a = createManualAccount(name, kind, Number(balance)); onSaved(a.account_id); }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="money-add-name" />
      <JurnlInput label="BALANCE USD" value={balance} onValue={setBalance} trigger="money-add-balance" inputMode="decimal" />
      <div className="jrn-home__choices" role="radiogroup" aria-label="KIND">
        {(['CHECKING', 'SAVINGS', 'CREDIT_CARD'] as const).map((k) => (
          <button key={k} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
        ))}
      </div>
    </JurnlDrawer>
  );
}

function EditPlaceSheet({ account, onClose }: { account: NonNullable<ReturnType<typeof accountById>>; onClose: () => void }) {
  const [name, setName] = useState(account.display_name);
  const [balance, setBalance] = useState(String(account.available_balance));
  return (
    <JurnlDrawer size="long" testId="money-edit-place" title="EDIT PLACE" onClose={onClose} footer={
      <JurnlButton trigger="money-edit-save" onClick={() => {
        getRepository().upsertAccount({ ...account, display_name: name.trim().toUpperCase(), available_balance: Number(balance), balance: Number(balance) });
        onClose();
      }}>SAVE</JurnlButton>
    }>
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="money-edit-name" />
      <JurnlInput label="AVAILABLE USD" value={balance} onValue={setBalance} trigger="money-edit-balance" inputMode="decimal" />
    </JurnlDrawer>
  );
}
