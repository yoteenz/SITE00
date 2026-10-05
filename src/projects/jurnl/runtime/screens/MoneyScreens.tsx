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
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';
import { honestAccountsConnectionLabel } from '../../data/foundation/connectionProvider';
import { useSetup } from '../../data/f02/setupDraft';
import type { AccountType } from '../../data/foundation/categories';

function MoneyShell({ screenId, children, nav }: { screenId: string; children: ReactNode; nav: 'MONEY' }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F05} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current={nav} onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F05" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F05" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function MoneyHubScreen() {
  const { go, openOverlay } = useJurnl();
  const draft = useSetup();
  useCurrency();
  const accounts = listActiveAccounts();
  const spec = parentById('F05')!;
  const total = accounts.filter((a) => a.include_in_net_worth).reduce((s, a) => s + a.available_balance, 0);
  return (
    <MoneyShell screenId="F05.00" nav="MONEY">
      <FamilyChrome familyId="F05" nodeId="F05.00" backLabel="BACK TO TODAY" onBack={() => go('F03')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro">
        <h1 className="jrn-home__h">{spec.name}</h1>
        <p className="jrn-home__sub">{spec.question}</p>
      </div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <div className="jrn-home__signal" data-jrn-panel="signal">
          <p className="jrn-home__num">{formatMoney(total)}</p>
          <p className="jrn-home__hint">{accounts.length} PLACES · {honestAccountsConnectionLabel(draft.accounts)}</p>
        </div>
        <JurnlPanel role="editorial" className="jrn-home__panel">
          <b>PLACES</b>
          {accounts.length === 0 ?
            <p>NO ACCOUNTS YET. ADD A MANUAL PLACE.</p>
          : accounts.slice(0, 4).map((a) => (
              <JurnlButton key={a.account_id} variant="secondary" trigger={`money-open-${a.account_id}`} onClick={() => go(`money/places/${a.account_id}`)}>
                {a.display_name} · {formatMoney(a.available_balance)}
              </JurnlButton>
            ))}
        </JurnlPanel>
        <JurnlButton trigger="money-open-places" onClick={() => go('money/places')}>
          OPEN A PLACE
        </JurnlButton>
        <JurnlButton variant="secondary" trigger="money-open-income" onClick={() => go('income')}>
          INCOME
        </JurnlButton>
        <JurnlButton variant="secondary" trigger="money-open-activity" onClick={() => go('activity')}>
          ACTIVITY
        </JurnlButton>
      </div>
    </MoneyShell>
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
