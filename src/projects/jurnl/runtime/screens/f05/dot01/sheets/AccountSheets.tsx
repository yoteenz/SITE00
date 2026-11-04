/**
 * F05 DOT 01 — account management overlays: ADD ACCOUNT (14) with ACCOUNT SETUP DETAILS (30), EDIT ACCOUNT (15),
 * ACCOUNT PURPOSE PREFERENCES (21), ACCOUNT ARCHIVE CONFIRMATION (25) and ARCHIVE BLOCKED (36).
 * Account creation and edits use the existing mutations (createManualAccount, renameAccount, setPurposeAccount);
 * a card's limit is only what the user enters (never invented). Archiving re-checks every dependency first.
 */
import { useState } from 'react';
import { archiveAccountSafely, archiveBlockers } from '../../../../../data/f05/dot01/archive';
import { accountView, type Dot01Kind } from '../../../../../data/f05/dot01/accountView';
import { accountById } from '../../../../../data/foundation/accounts';
import { createManualAccount } from '../../../../../data/foundation/accountMutations';
import type { AccountType } from '../../../../../data/foundation/categories';
import { getTodayKey } from '../../../../../data/foundation/dates';
import { formatMoney } from '../../../../../data/home/money';
import { parseMoneyInput, renameAccount } from '../../../../../data/ledger/ledgerOps';
import { purposeAccounts, setPurposeAccount, usualPurposesFor } from '../../../../../data/ledger/moneyPositions';
import { PURPOSE_LABEL, type MoneyPurpose } from '../../../../../data/ledger/purposes';
import { getRepository } from '../../../../../data/repository/deviceRepository';
import { useJurnl } from '../../../../state/store';
import { Dot01Overlay, useSearchAddChips, OVERLAY_CONTENT } from '../Dot01Frame';
import { Icon } from '../icons';
import { Alert, Button, CARD_SRC, ChipChoice, Paper, Row, TextInput } from '../kit';

const KINDS: { id: Dot01Kind; label: string; type: AccountType; payout?: boolean }[] = [
  { id: 'bank', label: 'BANK ACCOUNT', type: 'CHECKING' },
  { id: 'payout', label: 'RIDESHARE CARD', type: 'DEBIT_CARD', payout: true },
  { id: 'cash', label: 'CASH ON HAND', type: 'CASH' },
  { id: 'credit', label: 'CREDIT CARD', type: 'CREDIT_CARD' },
];
const ALL_PURPOSES = Object.keys(PURPOSE_LABEL) as MoneyPurpose[];
const CONTENT = OVERLAY_CONTENT;

export function AddAccountOverlay({ preset, onClose, onSaved }: { preset?: Dot01Kind; onClose: () => void; onSaved: (id: string) => void }) {
  const [kind, setKind] = useState<Dot01Kind | null>(preset ?? null);
  const searchAdd = useSearchAddChips();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [last4, setLast4] = useState('');
  const [purposes, setPurposes] = useState<MoneyPurpose[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const k = KINDS.find((x) => x.id === kind);
  const card = k?.type === 'CREDIT_CARD';
  const save = () => {
    if (saving) return;
    if (!k) return setError('CHOOSE AN ACCOUNT TYPE.');
    if (name.trim().length < 2) return setError('ENTER AN ACCOUNT NAME (2 LETTERS OR MORE).');
    const amount = parseMoneyInput(balance, true);
    if (amount == null) return setError(card ? 'ENTER WHAT THE CARD OWES NOW, LIKE 250.00 (0 IF NOTHING).' : 'ENTER THE STARTING BALANCE, LIKE 250.00 (0 IF EMPTY).');
    const lim = limit.trim() ? parseMoneyInput(limit) : null;
    if (limit.trim() && lim == null) return setError('THE CREDIT LIMIT USES NUMBERS LIKE 2000.');
    if (last4.trim() && !/^\d{4}$/.test(last4.trim())) return setError('THE LAST 4 DIGITS ARE FOUR NUMBERS.');
    setSaving(true);
    const a = createManualAccount(name, k.type, amount, getTodayKey(), { creditLimit: card ? lim : undefined, isPayoutCard: !!k.payout });
    if (last4.trim()) getRepository().upsertAccount({ ...a, masked_identifier: `•••• ${last4.trim()}` });
    for (const p of purposes) setPurposeAccount(p, a.account_id);
    const saved = accountById(a.account_id);
    setSaving(false);
    if (!saved) return setError('THE ACCOUNT COULD NOT BE SAVED. NOTHING WAS CREATED.');
    onSaved(a.account_id);
  };
  return (
    <Dot01Overlay
      testId="d01-add-account"
      env="SK03_FIELD"
      title={kind ? ['ACCOUNT', 'SETUP'] : ['ADD', 'ACCOUNT']}
      chips={kind ? searchAdd : undefined}
      subtitle={kind ? 'create a new account' : undefined}
      onClose={onClose}
      contentRect={CONTENT}
      contentScroll
      label="ADD ACCOUNT"
      content={
        <>
          <Paper kind="sheet">
            <p className="d01-h">ACCOUNT TYPE</p>
            <div className="d01-grid" role="radiogroup" aria-label="ACCOUNT TYPE">
              {KINDS.map((x) => (
                <button key={x.id} type="button" role="radio" aria-checked={kind === x.id} className="d01-card d01-card--compact" data-jrn-trigger={`d01-kind-${x.id}`} onClick={() => setKind(x.id)} style={kind === x.id ? { outline: '3px solid #2f3420', outlineOffset: 2 } : undefined}>
                  <img className="d01-card__art" src={CARD_SRC[x.id]} alt="" draggable={false} />
                  <span className="d01-card__name">
                    {x.label.split(' ').length === 2 ? x.label.split(' ').map((l) => <span key={l}>{l}</span>) : [<span key="a">{x.label.split(' ')[0]}</span>, <span key="b">{x.label.split(' ').slice(1).join(' ')}</span>]}
                  </span>
                  {kind === x.id ? <span className="d01-card__badge" style={{ background: '#2f3420' }}>CHOSEN</span> : null}
                </button>
              ))}
            </div>
          </Paper>
          {kind ? (
            <Paper kind="sheet" testId="d01-setup-details">
              <p className="d01-h">ACCOUNT DETAILS</p>
              <TextInput label="ACCOUNT NAME" value={name} onValue={setName} trigger="d01-add-name" icon="edit" />
              <TextInput label="ACCOUNT NUMBER (LAST 4)" value={last4} onValue={setLast4} trigger="d01-add-last4" icon="lock" inputMode="numeric" maxLength={4} hint="OPTIONAL · ONLY THE LAST 4" />
              <TextInput label={card ? 'OWED NOW' : 'STARTING BALANCE'} value={balance} onValue={setBalance} trigger="d01-add-balance" icon="coins" inputMode="decimal" />
              {card ? <TextInput label="CREDIT LIMIT" value={limit} onValue={setLimit} trigger="d01-add-limit" icon="card" inputMode="decimal" hint="OPTIONAL · ONLY IF YOU KNOW IT" /> : null}
              <p className="d01-note" style={{ marginTop: 6 }}>USUAL PURPOSES</p>
              <ChipChoice label="USUAL PURPOSES" value={purposes} options={ALL_PURPOSES.map((p) => ({ id: p, label: PURPOSE_LABEL[p] }))} onChange={setPurposes} trigger="d01-add-purpose" multi />
              {card ? <p className="d01-note" style={{ marginTop: 6 }}>A CREDIT CARD IS MONEY OWED. AVAILABLE CREDIT IS NEVER COUNTED AS MONEY YOU HAVE.</p> : null}
            </Paper>
          ) : null}
          {error ? <Alert role="alert">{error}</Alert> : null}
          <div className="d01-actions">
            <Button trigger="d01-create-account" icon="check" disabled={!kind || saving} onClick={save}>
              CREATE ACCOUNT
            </Button>
            <Button trigger="d01-cancel" quiet onClick={onClose}>
              CANCEL
            </Button>
          </div>
        </>
      }
    />
  );
}

export function EditAccountOverlay({ accountId, onClose, onArchive }: { accountId: string; onClose: () => void; onArchive: () => void }) {
  const a = accountById(accountId);
  const [name, setName] = useState(a?.display_name ?? '');
  const [purposes, setPurposes] = useState<MoneyPurpose[]>(a ? usualPurposesFor(a) : []);
  const [inTotal, setInTotal] = useState(a?.include_in_net_worth ?? true);
  const [error, setError] = useState<string | null>(null);
  if (!a) return null;
  const save = () => {
    const next = name.trim().toUpperCase();
    if (next.length < 2) return setError('ENTER A NAME (2 LETTERS OR MORE).');
    if (next !== a.display_name) {
      const r = renameAccount(a.account_id, next);
      if (!r.ok) return setError(r.error);
    }
    const cur = accountById(a.account_id)!;
    if (cur.include_in_net_worth !== inTotal) getRepository().upsertAccount({ ...cur, include_in_net_worth: inTotal, updated_at: new Date().toISOString() });
    const mine = purposeAccounts();
    for (const p of ALL_PURPOSES) {
      const isMine = mine[p] === a.account_id;
      if (purposes.includes(p) && !isMine) setPurposeAccount(p, a.account_id);
      if (!purposes.includes(p) && isMine) setPurposeAccount(p, null);
    }
    onClose();
  };
  return (
    <Dot01Overlay
      testId="d01-edit-account"
      env="SK03_FIELD"
      title={['EDIT', 'ACCOUNT']}
      onClose={onClose}
      contentRect={CONTENT}
      contentScroll
      label="EDIT ACCOUNT"
      content={
        <>
          <Paper kind="sheet">
            <TextInput label="ACCOUNT NAME" value={name} onValue={setName} trigger="d01-edit-name" icon="bank" />
            <p className="d01-note" style={{ marginTop: 6 }}>PURPOSE TAGS</p>
            <ChipChoice label="PURPOSE TAGS" value={purposes} options={ALL_PURPOSES.map((p) => ({ id: p, label: PURPOSE_LABEL[p] }))} onChange={setPurposes} trigger="d01-edit-purpose" multi />
            <div className="d01-rows" style={{ marginTop: 8 }}>
              <Row icon="chart" label="TRACK BALANCE" value="ON" sub="BALANCES COME FROM WHAT YOU RECORD" />
              <div className="d01-row">
                <span className="d01-row__ico"><Icon name="coins" /></span>
                <label htmlFor="d01-in-total">INCLUDE IN TOTAL MONEY</label>
                <input id="d01-in-total" type="checkbox" role="switch" checked={inTotal} data-jrn-trigger="d01-edit-in-total" onChange={(e) => setInTotal(e.target.checked)} style={{ width: 28, height: 28 }} />
              </div>
              <Row icon="edit" label="BALANCE UPDATE METHOD" value="MANUAL" sub="CHANGE IT IN BALANCE REVIEW" />
            </div>
          </Paper>
          {error ? <Alert role="alert">{error}</Alert> : null}
          <div className="d01-actions">
            <Button trigger="d01-save-changes" icon="check" onClick={save}>
              SAVE CHANGES
            </Button>
            <Button trigger="d01-edit-archive" quiet icon="archive" onClick={onArchive}>
              ARCHIVE ACCOUNT
            </Button>
          </div>
        </>
      }
    />
  );
}

export function PurposesOverlay({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const a = accountById(accountId);
  const [purposes, setPurposes] = useState<MoneyPurpose[]>(a ? usualPurposesFor(a).filter((p) => purposeAccounts()[p] === accountId) : []);
  if (!a) return null;
  const others = purposeAccounts();
  return (
    <Dot01Overlay
      testId="d01-purposes"
      env="SK03_FIELD"
      title={['ACCOUNT', 'PURPOSES']}
      subtitle="how this account is used"
      onClose={onClose}
      contentRect={CONTENT}
      contentScroll
      label="ACCOUNT PURPOSES"
      content={
        <>
          <Paper kind="sheet">
            <Row icon="bank" label={a.display_name} />
            <p className="d01-note" style={{ margin: '6px 0' }}>CHOOSE WHAT THIS ACCOUNT IS USUALLY USED FOR. A PREFERENCE ONLY: IT SUGGESTS THIS ACCOUNT AND NEVER BLOCKS ANOTHER.</p>
            <ChipChoice label="PURPOSES" value={purposes} options={ALL_PURPOSES.map((p) => ({ id: p, label: PURPOSE_LABEL[p] }))} onChange={setPurposes} trigger="d01-purpose" multi />
            {purposes.some((p) => others[p] && others[p] !== accountId) ? <p className="d01-note" style={{ marginTop: 6 }}>SOME PURPOSES MOVE HERE FROM ANOTHER ACCOUNT.</p> : null}
          </Paper>
          <div className="d01-actions">
            <Button
              trigger="d01-save-purposes"
              icon="check"
              onClick={() => {
                for (const p of ALL_PURPOSES) {
                  const isMine = others[p] === accountId;
                  if (purposes.includes(p) && !isMine) setPurposeAccount(p, accountId);
                  if (!purposes.includes(p) && isMine) setPurposeAccount(p, null);
                }
                onClose();
              }}
            >
              SAVE PURPOSES
            </Button>
            <Button trigger="d01-clear-purposes" quiet onClick={() => setPurposes([])}>
              CLEAR SELECTION
            </Button>
          </div>
        </>
      }
    />
  );
}

export function ArchiveOverlay({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const { go } = useJurnl();
  const searchAdd = useSearchAddChips();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const today = getTodayKey();
  const v = accountView(accountId, today);
  if (!v) return null;
  const blockers = archiveBlockers(accountId, today);
  const blocked = blockers.length > 0;
  return (
    <Dot01Overlay
      testId={blocked ? 'd01-archive-blocked' : 'd01-archive'}
      chips={blocked ? searchAdd : undefined}
      env="SK03_FIELD"
      title={['ARCHIVE', 'ACCOUNT']}
      subtitle={blocked ? 'action blocked' : done ? undefined : 'before you continue'}
      onClose={onClose}
      contentRect={CONTENT}
      contentScroll
      label="ARCHIVE ACCOUNT"
      content={
        <>
          <Paper kind="panel">
            <Row icon="bank" label={v.account.display_name} value={formatMoney(v.liability ? v.owed : v.held)} sub={v.liability ? 'OWED' : 'BALANCE'} />
          </Paper>
          {done ? (
            <Paper kind="sheet" testId="d01-archived">
              <img src={CARD_SRC[v.kind]} alt="" style={{ display: 'none' }} />
              <p className="d01-h d01-stamp">ACCOUNT ARCHIVED</p>
              <p className="d01-note" style={{ textAlign: 'center' }}>ITS HISTORY STAYS SAVED. IT CAN NO LONGER BE CHOSEN FOR NEW TRANSACTIONS.</p>
              <div className="d01-actions">
                <Button trigger="d01-archive-done" onClick={() => go('money/places')}>
                  BACK TO ACCOUNTS
                </Button>
              </div>
            </Paper>
          ) : blocked ? (
            <Paper kind="sheet">
              <Alert testId="d01-blocked-why">THIS ACCOUNT CANNOT BE ARCHIVED YET. THESE MUST BE RESOLVED FIRST.</Alert>
              <p className="d01-h" style={{ marginTop: 8 }}>BLOCKERS</p>
              <div className="d01-rows">
                {blockers.map((b) => (
                  <Row key={b.kind} icon="lock" label={b.label} sub={b.detail} testId={`d01-blocker-${b.kind}`} />
                ))}
              </div>
              <div className="d01-actions d01-actions--2" style={{ marginTop: 8 }}>
                <Button trigger="d01-keep-active" onClick={onClose}>
                  KEEP ACCOUNT ACTIVE
                </Button>
                <Button trigger="d01-blocker-details" quiet onClick={() => go(blockers.find((b) => b.route)?.route ?? `money/places/${accountId}/settings`)}>
                  RESOLVE ISSUES
                </Button>
              </div>
            </Paper>
          ) : (
            <Paper kind="sheet">
              <Alert>ARCHIVING REMOVES THIS ACCOUNT FROM ACTIVE TRACKING BUT KEEPS ITS HISTORY.</Alert>
              <div className="d01-rows" style={{ marginTop: 6 }}>
                <Row icon="check" label="NO NEW TRANSACTIONS" />
                <Row icon="check" label="HISTORY STAYS SAVED" />
                <Row icon="check" label="TOTAL MONEY MAY CHANGE" sub={!v.liability && v.held !== 0 ? `${formatMoney(v.held)} LEAVES YOUR HELD TOTAL` : undefined} />
              </div>
              {error ? <Alert role="alert">{error}</Alert> : null}
              <div className="d01-actions" style={{ marginTop: 8 }}>
                <Button
                  trigger="d01-archive-confirm"
                  danger
                  icon="archive"
                  onClick={() => {
                    const r = archiveAccountSafely(accountId, today);
                    if (!r.ok) return setError(r.error);
                    setDone(true);
                  }}
                >
                  ARCHIVE ACCOUNT
                </Button>
                <Button trigger="d01-keep-active" quiet onClick={onClose}>
                  KEEP ACCOUNT ACTIVE
                </Button>
              </div>
            </Paper>
          )}
        </>
      }
    />
  );
}
