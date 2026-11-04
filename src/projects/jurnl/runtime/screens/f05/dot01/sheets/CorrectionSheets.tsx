/**
 * F05 DOT 01 — CORRECT TRANSACTION (24), CONFIRM CORRECTION (37) and BALANCE ADJUSTMENT (23).
 *   24  choose how to fix the entry: edit it, reassign the account, change the category, mark it as a duplicate or
 *       delete it. Only single spending entries are changed here (corrections.ts says where the others belong).
 *   37  the original beside the revised entry, with the canonical balance change, before anything is written.
 *       A correction keeps the entry id and appends the values it replaced to the entry's correction history;
 *       a duplicate / delete removes the entry from the ledger and keeps a full copy in the audit trail.
 *   23  tracked vs actual: the difference is recorded as one BALANCE CORRECTION (never income, never spending).
 */
import { useRef, useState, type CSSProperties } from 'react';
import { accountView } from '../../../../../data/f05/dot01/accountView';
import { applyCorrection, correctionCheck, previewCorrection, reverseEntry, type CorrectionChange, type CorrectionPreview } from '../../../../../data/f05/dot01/corrections';
import { previewReversal, type Impact } from '../../../../../data/f05/dot01/entry';
import { adjustToActual, differenceOf, reconciliationOf } from '../../../../../data/f05/dot01/reconciliation';
import { accountById, listActiveAccounts } from '../../../../../data/foundation/accounts';
import { getTodayKey, type CalendarDate } from '../../../../../data/foundation/dates';
import { formatMoney } from '../../../../../data/home/money';
import { toCents } from '../../../../../data/ledger/accounting';
import { parseMoneyInput } from '../../../../../data/ledger/ledgerOps';
import { useJurnl } from '../../../../state/store';
import { DOT01 } from '../dot01Assets';
import { Dot01Overlay, useSearchAddChips, OVERLAY_CONTENT } from '../Dot01Frame';
import { shortDate } from '../HistoryPage';
import { Chevron, Icon } from '../icons';
import { Alert, Button, Paper, Row, SelectInput, TextInput } from '../kit';

const CONTENT = OVERLAY_CONTENT;
const CATEGORIES = ['GROCERIES', 'FOOD', 'DINING', 'FOOD & DRINK', 'FUEL', 'TRANSPORT', 'HOUSING', 'UTILITIES', 'HEALTH', 'CLOTHING', 'SHOPPING', 'MEMBERSHIP', 'TRAVEL', 'OTHER'];

export type CorrectionMode = 'options' | 'edit' | 'category' | 'account';
type Option = 'edit' | 'account' | 'category' | 'duplicate' | 'delete';
const OPTIONS: { id: Option; icon: string; label: string }[] = [
  { id: 'edit', icon: 'edit', label: 'EDIT ENTRY' },
  { id: 'account', icon: 'bank', label: 'REASSIGN ACCOUNT' },
  { id: 'category', icon: 'tag', label: 'CHANGE CATEGORY' },
  { id: 'duplicate', icon: 'duplicate', label: 'MARK AS DUPLICATE' },
  { id: 'delete', icon: 'trash', label: 'DELETE TRANSACTION' },
];

function balanceChange(impact: { before: number; after: number; liability: boolean }[]): number {
  // the change in what the user has: more held, or less owed, is positive
  return toCents(impact.reduce((s, i) => s + (i.liability ? i.before - i.after : i.after - i.before), 0));
}

export function CorrectionOverlay({ entryId, mode, onClose, onDone }: { entryId: string; mode: CorrectionMode; onClose: () => void; onDone?: (msg: string) => void }) {
  const { go } = useJurnl();
  const searchAdd = useSearchAddChips();
  const live = correctionCheck(entryId);
  // the entry as it was when the overlay opened: after a reversal it is gone from the ledger, and the confirmation
  // (and DONE) still has to show what was removed
  const opened = useRef(live.ok ? live.entry : null);
  if (live.ok) opened.current = live.entry;
  const [step, setStep] = useState<'options' | 'form' | 'confirm' | 'done'>(mode === 'options' ? 'options' : 'form');
  const [option, setOption] = useState<Option | null>(mode === 'options' ? null : mode);
  const [merchant, setMerchant] = useState(opened.current?.merchant ?? '');
  const [amount, setAmount] = useState(opened.current ? Math.abs(opened.current.amount).toFixed(2) : '');
  const [date, setDate] = useState<string>(opened.current?.occurred_on ?? getTodayKey());
  const [notes, setNotes] = useState(opened.current?.memo ?? '');
  const [category, setCategory] = useState(opened.current?.category ?? '');
  const [account, setAccount] = useState(opened.current?.account_id ?? '');
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState<CorrectionPreview | null>(null);
  const [removal, setRemoval] = useState<Impact[] | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState('');

  const check = live;
  const entry = live.ok ? live.entry : step === 'done' ? opened.current : null;
  if (step !== 'done' && (!check.ok || !entry)) {
    return (
      <Dot01Overlay testId="d01-correct" env="SK03_FIELD" stripIcons="tiles" title={['CORRECT', 'TRANSACTION']} onClose={onClose} contentRect={CONTENT} label="CORRECT TRANSACTION" content={
        <>
          <Alert role="alert" testId="d01-correct-refused">{check.ok ? '' : check.reason}</Alert>
          {!check.ok && check.owner ? <Button trigger="d01-correct-owner" onClick={() => go(check.owner!.route)}>{check.owner.label}</Button> : null}
          <Button trigger="d01-correct-close" quiet onClick={onClose}>GO BACK</Button>
        </>
      } />
    );
  }

  if (!entry) return null;
  const options = listActiveAccounts().map((a) => ({ id: a.account_id, label: a.display_name }));
  const summary = (
    <div className="d01-split" style={{ gridTemplateColumns: entry.receipt ? '1.6fr 1fr' : '1fr' }}>
      <Paper kind="sheet" testId="d01-correct-entry">
        <div className="d01-rows">
          <Row icon="merchant" label="MERCHANT" value={entry.merchant} />
          <Row icon="calendar" label="DATE" value={shortDate(entry.occurred_on ?? null)} />
          <Row icon="coins" label="AMOUNT" value={formatMoney(Math.abs(entry.amount))} />
          <Row icon="tag" label="CATEGORY" value={entry.category || '—'} />
          <Row icon="bank" label="ACCOUNT" value={accountById(entry.account_id ?? '')?.display_name ?? '—'} />
        </div>
      </Paper>
      {entry.receipt ? (
        <Paper kind="panel">
          <img src={DOT01['22_RECEIPT_PAPER_STACK']} alt="RECEIPT ATTACHED" style={{ width: '100%', display: 'block' }} />
        </Paper>
      ) : null}
    </div>
  );

  const continueWith = (o: Option | null) => {
    if (!o) return setError('CHOOSE HOW TO FIX THIS ENTRY.');
    setError(null);
    setOption(o);
    if (o === 'duplicate' || o === 'delete') {
      setRemoval(previewReversal(entry.id));
      setPreview(null);
      setStep('confirm');
    } else setStep('form');
  };

  const review = () => {
    const change: CorrectionChange = {};
    if (option === 'edit') {
      const n = parseMoneyInput(amount);
      if (n == null) return setError('ENTER THE AMOUNT, LIKE 42.50.');
      if (!merchant.trim()) return setError('ENTER WHAT THIS WAS FOR.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('CHOOSE THE DATE.');
      Object.assign(change, { amount: n, merchant, occurred_on: date as CalendarDate, memo: notes });
    } else if (option === 'category') {
      if (!category) return setError('CHOOSE A CATEGORY.');
      change.category = category;
    } else if (option === 'account') {
      if (!account) return setError('CHOOSE AN ACCOUNT.');
      change.account_id = account;
    }
    const p = previewCorrection(entry.id, change);
    if (!p.ok) return setError(p.error);
    if (!p.value.changed.length) return setError('NOTHING HAS CHANGED YET.');
    setError(null);
    setRemoval(null);
    setPreview(p.value);
    setStep('confirm');
  };

  const confirm = () => {
    if (removal) {
      const r = reverseEntry(entry.id, option === 'duplicate' ? 'MARKED_DUPLICATE' : 'REVERSED', reason);
      if (!r.ok) return setError(r.error);
      setDoneMsg(option === 'duplicate' ? 'MARKED AS DUPLICATE. IT NO LONGER COUNTS IN ANY BALANCE.' : 'TRANSACTION DELETED. A COPY IS KEPT IN THE CORRECTION TRAIL.');
    } else if (preview) {
      const change: CorrectionChange = option === 'edit' ? { amount: parseMoneyInput(amount)!, merchant, occurred_on: date as CalendarDate, memo: notes } : option === 'category' ? { category } : { account_id: account };
      const r = applyCorrection(entry.id, change, reason);
      if (!r.ok) return setError(r.error);
      setDoneMsg('TRANSACTION UPDATED. THE ORIGINAL VALUES ARE KEPT IN ITS CORRECTION HISTORY.');
    }
    setError(null);
    setStep('done');
  };

  if (step === 'done')
    return (
      <Dot01Overlay testId="d01-correct-done" env="SK03_FIELD" title={['CORRECTION', 'SAVED']} onClose={onClose} contentRect={CONTENT} label="CORRECTION SAVED" content={
        <>
          <Paper kind="sheet">
            <img src={DOT01['02_LAUREL_WAX_SEAL']} alt="" className="d01-stamp" style={{ width: 92, display: 'block', margin: '0 auto 6px' }} />
            <p className="d01-h" role="status">{doneMsg}</p>
          </Paper>
          <Button trigger="d01-correct-finish" onClick={() => (onDone ? onDone(doneMsg) : removal ? go(entry.account_id ? `money/places/${entry.account_id}/history` : 'money') : onClose())}>DONE</Button>
        </>
      } />
    );

  if (step === 'confirm') {
    const impact = removal ?? preview?.impact ?? [];
    const change = balanceChange(impact);
    const revised = preview?.revised;
    return (
      <Dot01Overlay testId="d01-correct-confirm" chips={searchAdd} env="SK03_FIELD" title={['CONFIRM', 'CORRECTION']} subtitle="review the changes" onClose={onClose} contentRect={CONTENT} contentScroll label="CONFIRM CORRECTION" content={
        <>
          <div className="d01-split">
            <Paper kind="panel" testId="d01-original">
              <p className="d01-note">ORIGINAL TRANSACTION</p>
              <p className="d01-h">{entry.merchant}</p>
              <p className="d01-note">{shortDate(entry.occurred_on ?? null)}</p>
              <b className="d01-big">{formatMoney(-Math.abs(entry.amount), true)}</b>
            </Paper>
            <Paper kind="panel" testId="d01-revised">
              <p className="d01-note">{removal ? (option === 'duplicate' ? 'MARKED AS DUPLICATE' : 'DELETED') : 'REVISED TRANSACTION'}</p>
              {revised ? (
                <>
                  <p className="d01-h">{revised.merchant}</p>
                  <p className="d01-note">{shortDate(revised.occurred_on ?? null)}</p>
                  <b className="d01-big">{formatMoney(-Math.abs(revised.amount), true)}</b>
                </>
              ) : (
                <>
                  <p className="d01-h">NO LONGER COUNTED</p>
                  <p className="d01-note">A COPY STAYS IN THE CORRECTION TRAIL</p>
                </>
              )}
            </Paper>
          </div>
          <Paper kind="sheet">
            <div className="d01-rows" data-testid="d01-correct-rows">
              <Row label="ORIGINAL AMOUNT" value={formatMoney(-Math.abs(entry.amount), true)} />
              <Row label="REVISED AMOUNT" value={revised ? formatMoney(-Math.abs(revised.amount), true) : 'REMOVED'} />
              <Row label="ACCOUNT IMPACT" value={impact.map((i) => i.name).join(' · ') || '—'} />
              {revised && revised.category !== entry.category ? <Row label="CATEGORY CHANGE" value={`${entry.category} → ${revised.category}`} /> : null}
              {revised && revised.account_id !== entry.account_id ? <Row label="ACCOUNT CHANGE" value={`${accountById(entry.account_id ?? '')?.display_name ?? '—'} → ${accountById(revised.account_id ?? '')?.display_name ?? '—'}`} /> : null}
              <Row label="BALANCE CHANGE" value={formatMoney(change, true)} testId="d01-balance-change" sub={change === 0 ? 'NO BALANCE MOVES' : undefined} />
              {impact.map((i) => (
                <Row key={i.account_id} label={`${i.name} · ${i.liability ? 'OWED' : 'HELD'}`} value={`${formatMoney(i.before)} → ${formatMoney(i.after)}`} />
              ))}
            </div>
            <TextInput label="REASON" icon="note" value={reason} onValue={setReason} trigger="d01-correct-reason" placeholder="OPTIONAL" />
          </Paper>
          {showOriginal ? (
            <Paper kind="blank" testId="d01-view-original">
              <p className="d01-h">ORIGINAL ENTRY</p>
              <Row label="MERCHANT" value={entry.merchant} />
              <Row label="AMOUNT" value={formatMoney(Math.abs(entry.amount))} />
              <Row label="CATEGORY" value={entry.category} />
              <Row label="ACCOUNT" value={accountById(entry.account_id ?? '')?.display_name ?? '—'} />
              <Row label="DATE" value={shortDate(entry.occurred_on ?? null)} />
              {entry.memo ? <Row label="NOTES" value={entry.memo} /> : null}
            </Paper>
          ) : null}
          {error ? <Alert role="alert">{error}</Alert> : null}
          <Button trigger="d01-confirm-update" icon="check" onClick={confirm}>{removal ? (option === 'duplicate' ? 'CONFIRM DUPLICATE' : 'CONFIRM DELETE') : 'CONFIRM UPDATE'}</Button>
          <div className="d01-actions d01-actions--2">
            <Button trigger="d01-confirm-cancel" quiet onClick={onClose}>CANCEL</Button>
            <Button trigger="d01-confirm-original" quiet onClick={() => setShowOriginal((x) => !x)}>{showOriginal ? 'HIDE ORIGINAL' : 'VIEW ORIGINAL'}</Button>
          </div>
        </>
      } />
    );
  }

  if (step === 'form')
    return (
      <Dot01Overlay testId="d01-correct-form" env="SK03_FIELD" title={['CORRECT', 'TRANSACTION']} subtitle="fix or reverse this entry" onClose={onClose} contentRect={CONTENT} contentScroll label="CORRECT TRANSACTION" content={
        <>
          {summary}
          <Paper kind="blank">
            {option === 'edit' ? (
              <>
                <TextInput label="MERCHANT" icon="merchant" value={merchant} onValue={setMerchant} trigger="d01-correct-merchant" />
                <TextInput label="AMOUNT" icon="coins" value={amount} onValue={setAmount} trigger="d01-correct-amount" inputMode="decimal" />
                <TextInput label="DATE" icon="calendar" type="date" value={date} onValue={setDate} trigger="d01-correct-date" />
                <TextInput label="NOTES" icon="note" value={notes} onValue={setNotes} trigger="d01-correct-notes" placeholder="OPTIONAL" />
              </>
            ) : option === 'category' ? (
              <SelectInput label="CATEGORY" icon="tag" trigger="d01-correct-category" value={category} onValue={setCategory} options={[...new Set([...(entry.category ? [entry.category] : []), ...CATEGORIES])].map((c) => ({ id: c, label: c }))} />
            ) : (
              <SelectInput label="ACCOUNT" icon="bank" trigger="d01-correct-account" value={account} onValue={setAccount} options={options} />
            )}
          </Paper>
          {error ? <Alert role="alert">{error}</Alert> : null}
          <Button trigger="d01-correct-review" icon="check" onClick={review}>CONTINUE</Button>
          <Button trigger="d01-correct-back" quiet onClick={() => (mode === 'options' ? setStep('options') : onClose())}>GO BACK</Button>
        </>
      } />
    );

  return (
    <Dot01Overlay testId="d01-correct" env="SK03_FIELD" stripIcons="tiles" title={['CORRECT', 'TRANSACTION']} subtitle="fix or reverse this entry" onClose={onClose} contentRect={CONTENT} contentScroll label="CORRECT TRANSACTION" content={
      <>
        {summary}
        <p className="d01-note" style={{ textAlign: 'center', color: '#efe3cb' }}>USE THIS IF THE ENTRY IS WRONG OR DUPLICATED</p>
        <div className="d01-rows" role="radiogroup" aria-label="HOW TO FIX THIS ENTRY">
          {OPTIONS.map((o, i) => (
            <button key={o.id} type="button" role="radio" aria-checked={option === o.id} className={`d01-strip ${o.id === 'delete' ? 'd01-strip--warn' : ''}`} data-jrn-trigger={`d01-correct-${o.id}`} onClick={() => setOption(o.id)} style={{ ['--i' as string]: i, ...(option === o.id ? { outline: '3px solid #2f3420', outlineOffset: 1 } : {}) } as CSSProperties}>
              <span className="d01-strip__ico"><Icon name={o.icon} /></span>
              <span className="d01-strip__rule" aria-hidden />
              <span>{o.label}</span>
              {option === o.id ? <Icon name="check" className="d01-strip__chev" /> : <Chevron className="d01-strip__chev" />}
            </button>
          ))}
        </div>
        {error ? <Alert role="alert">{error}</Alert> : null}
        <Button trigger="d01-correct-continue" onClick={() => continueWith(option)}>CONTINUE</Button>
        <Button trigger="d01-correct-back" quiet onClick={onClose}>GO BACK</Button>
      </>
    } />
  );
}

const ADJUST_REASONS = ['BANK FEE NOT RECORDED', 'INTEREST NOT RECORDED', 'MISSED TRANSACTION', 'CASH COUNT DIFFERENCE', 'STARTING BALANCE WAS WRONG', 'OTHER'].map((r) => ({ id: r, label: r }));

export function AdjustmentOverlay({ accountId, actual, onClose, onDone }: { accountId: string; actual: number; onClose: () => void; onDone?: (msg: string) => void }) {
  const today = getTodayKey();
  const v = accountView(accountId, today);
  const rec = reconciliationOf(accountId, today);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  if (!v || !rec) return null;
  const diff = differenceOf(rec.tracked, actual);
  const save = () => {
    if (saving) return;
    if (!reason) return setError('CHOOSE A REASON FOR THE ADJUSTMENT.');
    setSaving(true);
    const r = adjustToActual(accountId, actual, today, { reason, notes });
    setSaving(false);
    if (!r.ok) return setError(r.error);
    const msg = `ADJUSTMENT SAVED (${formatMoney(r.value.difference, true)}). THE TRACKED BALANCE NOW MATCHES ${formatMoney(actual)}. YOU CAN MARK IT RECONCILED.`;
    if (onDone) onDone(msg);
    else onClose();
  };
  return (
    <Dot01Overlay testId="d01-adjust" env="SK03_FIELD" title={['BALANCE', 'ADJUSTMENT']} subtitle="review before saving" onClose={onClose} contentRect={CONTENT} contentScroll label="BALANCE ADJUSTMENT" content={
      <>
        <Paper kind="blank">
          <Row icon={v.liability ? 'card' : 'bank'} label={v.account.display_name} />
        </Paper>
        <div className="d01-split">
          <Paper kind="panel">
            <p className="d01-note">{v.liability ? 'TRACKED OWED' : 'TRACKED BALANCE'}</p>
            <b className="d01-big" data-testid="d01-adjust-tracked">{formatMoney(rec.tracked)}</b>
          </Paper>
          <Paper kind="panel">
            <p className="d01-note">{v.liability ? 'ACTUAL OWED' : 'ACTUAL BALANCE'}</p>
            <b className="d01-big" data-testid="d01-adjust-actual">{formatMoney(actual)}</b>
          </Paper>
        </div>
        <Paper kind="sheet">
          <Row icon="scale" label="ADJUSTMENT AMOUNT" value={formatMoney(diff, true)} testId="d01-adjust-amount" sub="A BALANCE CORRECTION · NOT INCOME, NOT SPENDING" />
          <SelectInput label="ADJUSTMENT REASON" icon="tag" trigger="d01-adjust-reason" value={reason} onValue={setReason} options={ADJUST_REASONS} placeholder="SELECT REASON" />
          <Row icon="calendar" label="DATE" value={shortDate(today)} sub="RECORDED AS OF TODAY" />
          <TextInput label="NOTES" icon="note" value={notes} onValue={setNotes} trigger="d01-adjust-notes" placeholder="ADD NOTES" />
        </Paper>
        <Alert testId="d01-adjust-only">THIS WILL CHANGE THE TRACKED BALANCE ONLY</Alert>
        {error ? <Alert role="alert">{error}</Alert> : null}
        <Button trigger="d01-save-adjustment" icon="check" disabled={saving || diff === 0} onClick={save}>SAVE ADJUSTMENT</Button>
        <Button trigger="d01-adjust-cancel" quiet onClick={onClose}>CANCEL</Button>
      </>
    } />
  );
}
