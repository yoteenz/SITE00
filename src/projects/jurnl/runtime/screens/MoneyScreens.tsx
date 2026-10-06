/** F05 MONEY — structural completion (Wave 2). */

import { useMemo, useState, type ReactNode } from 'react';
import { getRepository } from '../../data/repository/deviceRepository';
import { useParams } from 'react-router-dom';
import { listActiveAccounts, accountById } from '../../data/foundation/accounts';
import { archiveAccount, createManualAccount } from '../../data/foundation/accountMutations';
import { formatMoney, ledgerEntries, useCurrency } from '../../data/home/money';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInlineAction, JurnlInput, JurnlPanel } from '../components/primitives';
import { FramePanel, JurnlFamilyFrame, JurnlFamilyShell } from '../components/FamilyFrame';
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
  const source = draft.accounts === 'CONNECTED' ? honestAccountsConnectionLabel(draft.accounts) : 'NO BANK CONNECTED · BALANCES ARE WHAT YOU ENTERED';
  const count = accounts.length;
  return (
    <JurnlFamilyFrame
      screenId="F05.00"
      familyId="F05"
      familyPlate={PARENT_PLATES.F05}
      label="MONEY"
      archetype="CONTAINER_CABINET"
      chrome={<FamilyChrome familyId="F05" nodeId="F05.00" backLabel="BACK TO TODAY" onBack={() => go('F03')} onAsk={() => openOverlay('ask')} />}
      nav={<JurnlProductNav current="MONEY" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F05" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F05" nodeId="F05.00" onClose={closeOverlay} /> : null}
          {addOpen ? <AddPlaceSheet onClose={() => setAddOpen(false)} onSaved={(id) => { setAddOpen(false); go(`money/places/${id}`); }} /> : null}
        </>
      }
    >
      <FramePanel id="plaque">
        <header className="jrn-cab__plaque" data-jrn-zone="intro">
          <div className="jrn-cab__label">
            <h1 className="jrn-cab__h">MONEY</h1>
            <p className="jrn-lang__state">{count ? `YOUR MONEY IS IN ${count} ${count === 1 ? 'PLACE' : 'PLACES'}.` : 'NO PLACES YET.'}</p>
          </div>
          {count ?
            <dl className="jrn-cab__figures">
              <div>
                <dt>HELD</dt>
                <dd>{formatMoney(held)}</dd>
              </div>
              <div>
                <dt>OWED</dt>
                <dd>{formatMoney(owed)}</dd>
              </div>
            </dl>
          : null}
          <p className="jrn-lang__task">{count ? 'OPEN A DRAWER TO SEE A PLACE’S BALANCE AND MOVEMENTS.' : 'ADD WHERE YOUR MONEY LIVES: CHECKING, SAVINGS, CASH OR A CARD. NO BANK CONNECTION NEEDED.'}</p>
          <p className="jrn-lang__editorial">{spec.question}</p>
        </header>
      </FramePanel>
      {shelves.map((shelf) => (
        <FramePanel key={shelf.id} id={`shelf-${shelf.id}`}>
          <section className="jrn-cab__shelf" aria-label={`${shelf.label} — ${shelf.places.length} ${shelf.places.length === 1 ? 'PLACE' : 'PLACES'}`} data-jrn-shelf={shelf.id}>
            <span className="jrn-cab__edge" aria-hidden>
              {shelf.label}
            </span>
            <div className="jrn-cab__body">
              <p className="jrn-cab__shelfhead">
                <span>{shelf.caption}</span>
                <b>{formatMoney(shelf.places.reduce((t, a) => t + a.available_balance, 0))}</b>
              </p>
              {shelf.places.map((a) => (
                <button key={a.account_id} type="button" className="jrn-cab__drawer" data-jrn-trigger={`money-open-${a.account_id}`} onClick={() => go(`money/places/${a.account_id}`)}>
                  <i className="jrn-cab__pull" aria-hidden />
                  <span className="jrn-cab__name">{a.display_name}</span>
                  <span className="jrn-cab__kind">
                    {KIND_LABEL[a.account_type]} · {a.is_manual ? 'BY HAND' : a.is_connected ? 'PREVIEW LINK' : 'REGISTRY'}
                  </span>
                  <span className="jrn-cab__amt">{formatMoney(a.available_balance)}</span>
                </button>
              ))}
            </div>
          </section>
        </FramePanel>
      ))}
      <FramePanel id="base">
        <div className="jrn-cab__base" data-jrn-zone="cabinet-base">
          <button type="button" className="jrn-cab__slot" data-jrn-trigger="money-add-place-slot" data-primary={count ? 'false' : 'true'} onClick={() => setAddOpen(true)}>
            <span>ADD A PLACE</span>
          </button>
          {count ?
            <JurnlButton variant="secondary" trigger="money-open-places" onClick={() => go('money/places')}>
              SEE ALL PLACES
            </JurnlButton>
          : null}
          <p className="jrn-cab__source">{source}</p>
        </div>
      </FramePanel>
      <FramePanel id="also">
        <nav className="jrn-cab__also" aria-label="ALSO IN MONEY">
          <span>ALSO IN MONEY</span>
          <JurnlInlineAction trigger="money-open-income" onClick={() => go('income')}>INCOME</JurnlInlineAction>
          <JurnlInlineAction trigger="money-open-activity" onClick={() => go('activity')}>ACTIVITY</JurnlInlineAction>
          <JurnlInlineAction trigger="discovery-F05-F16" onClick={() => go('F16')}>RECORDS</JurnlInlineAction>
        </nav>
      </FramePanel>
    </JurnlFamilyFrame>
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
