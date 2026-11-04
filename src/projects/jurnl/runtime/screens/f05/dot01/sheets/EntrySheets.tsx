/**
 * F05 DOT 01 — financial entry overlays.
 *   RECORD TRANSACTION (16) · RECORD CASH SPENDING (18) · RECORD CARD PURCHASE (19): one purchase flow (scan a receipt
 *     or enter it manually) → REVIEW PURCHASE (28, read values editable, uncertain ones flagged) → RECEIPT EXCEPTION /
 *     DUPLICATE (29) when a likely duplicate exists → TRANSACTION REVIEW (33) with the canonical balance impact → saved
 *     once through ledgerOps. Money in belongs to F06; transfers and card payments to the #1706 transfer engine.
 *   ADD CASH (17): from an account (a completed transfer), cash earnings (F06), or a counted correction.
 *   RECORD CARD PAYMENT (20): a payment already made, submitted or scheduled (JURNL never sends money).
 */
import { useMemo, useState } from 'react';
import { accountView } from '../../../../../data/f05/dot01/accountView';
import { previewPurchase, previewTransfer, savePurchase, saveTransfer, type Impact, type PurchasePreview, type TransferPreview } from '../../../../../data/f05/dot01/entry';
import type { ReceiptRead } from '../../../../../data/f05/dot01/receipt';
import { accountById, listActiveAccounts, type JurnlAccountRecord } from '../../../../../data/foundation/accounts';
import { addDays, getTodayKey, type CalendarDate } from '../../../../../data/foundation/dates';
import type { EntryReceipt } from '../../../../../data/home/moneyTypes';
import { formatMoney } from '../../../../../data/home/money';
import { accountNature, toCents } from '../../../../../data/ledger/accounting';
import { correctAccountBalance, parseMoneyInput } from '../../../../../data/ledger/ledgerOps';
import { newEntityId } from '../../../../../data/repository/ids';
import type { TransferStart } from '../../../../../data/ledger/transferSettlement';
import { getRepository } from '../../../../../data/repository/deviceRepository';
import { useJurnl } from '../../../../state/store';
import { DOT01 } from '../dot01Assets';
import { Dot01Overlay, useSearchAddChips } from '../Dot01Frame';
import { shortDate } from '../HistoryPage';
import { Alert, Button, Paper, Row, SelectInput, TextInput } from '../kit';
import { saveReceiptImage } from '../receiptStore';
import { ReceiptFlow, type ReceiptCapture } from './ReceiptFlow';

const CONTENT = { x: 30, y: 590, w: 881, h: 930 };
const CATEGORIES = ['GROCERIES', 'FOOD', 'DINING', 'FUEL', 'TRANSPORT', 'HOUSING', 'UTILITIES', 'HEALTH', 'CLOTHING', 'SHOPPING', 'MEMBERSHIP', 'TRAVEL', 'OTHER'].map((c) => ({ id: c, label: c }));
const isLiability = (a: JurnlAccountRecord) => accountNature(a.account_type) === 'LIABILITY';

function ImpactRows({ impact, testId }: { impact: Impact[]; testId?: string }) {
  return (
    <div className="d01-rows" data-testid={testId}>
      {impact.map((i) => (
        <Row key={i.account_id} icon={i.liability ? 'card' : 'bank'} label={`${i.name} · ${i.label}`} value={`${formatMoney(i.before)} → ${formatMoney(i.after)}`} sub={toCents(i.after - i.before) === 0 ? 'NO CHANGE NOW' : `${formatMoney(toCents(i.after - i.before), true)}`} />
      ))}
    </div>
  );
}

type Draft = { merchant: string; amount: string; category: string; date: string; notes: string; accountId: string };
type Mode = 'bank' | 'cash' | 'card';

/** One purchase, from a receipt or typed in. Nothing is written until SAVE TRANSACTION succeeds. */
export function PurchaseFlow({ accountId, mode, withType, startWithReceipt, onClose, onSwitch }: { accountId: string; mode: Mode; withType?: boolean; startWithReceipt?: boolean; onClose: () => void; onSwitch?: (to: 'money-in' | 'transfer' | 'card-payment') => void }) {
  const { go } = useJurnl();
  const searchAdd = useSearchAddChips();
  const today = getTodayKey();
  const [step, setStep] = useState<'form' | 'receipt' | 'review' | 'duplicate' | 'saved'>(startWithReceipt ? 'receipt' : 'form');
  const [draft, setDraft] = useState<Draft>({ merchant: '', amount: '', category: '', date: today, notes: '', accountId });
  const [capture, setCapture] = useState<ReceiptCapture | null>(null);
  const [preview, setPreview] = useState<PurchasePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const accounts = listActiveAccounts().filter((a) => (mode === 'card' ? isLiability(a) && a.account_type === 'CREDIT_CARD' : mode === 'cash' ? a.account_type === 'CASH' : !isLiability(a) && a.account_type !== 'CASH') || a.account_id === accountId);
  const set = (k: keyof Draft) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const read: ReceiptRead | null = capture?.read ?? null;
  const uncertain = (field: 'merchant' | 'total' | 'date') => !!read && (field === 'merchant' ? read.merchant == null : field === 'total' ? read.total == null : read.date == null);
  const suggestTotal = read && read.total == null && read.subtotal != null && read.tax != null ? toCents(read.subtotal + read.tax + (read.tip ?? 0)) : null;
  const title = mode === 'card' ? ['RECORD CARD', 'PURCHASE'] : mode === 'cash' ? ['RECORD CASH', 'SPENDING'] : ['RECORD', 'TRANSACTION'];
  const edited = useMemo(() => {
    if (!read) return [];
    const e: string[] = [];
    if ((read.merchant ?? '') !== draft.merchant.trim().toUpperCase()) e.push('MERCHANT');
    if (read.total == null || toCents(read.total) !== toCents(parseMoneyInput(draft.amount) ?? -1)) e.push('AMOUNT');
    if ((read.date ?? '') !== draft.date) e.push('DATE');
    return e;
  }, [read, draft]);

  const toReview = () => {
    const amount = parseMoneyInput(draft.amount);
    if (!draft.merchant.trim()) return setError('ENTER WHAT THIS WAS FOR (MERCHANT OR DESCRIPTION).');
    if (amount == null) return setError('ENTER THE AMOUNT, LIKE 42.50.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return setError('CHOOSE THE DATE.');
    if (!draft.accountId) return setError('CHOOSE THE ACCOUNT YOU PAID WITH.');
    const receipt: EntryReceipt | null = capture
      ? { receipt_id: newEntityId('rcpt'), stored: 'DEVICE', source: capture.source, mime: capture.mime, captured_at: new Date().toISOString(), image_sha256: capture.imageSha, extracted: { merchant: read!.merchant, date: read!.date, total: read!.total, subtotal: read!.subtotal, tax: read!.tax, tip: read!.tip, items: read!.items }, edited, ocr_confidence: read!.confidence }
      : null;
    const p = previewPurchase({ merchant: draft.merchant, amount, account_id: draft.accountId, category: draft.category || 'OTHER', occurred_on: draft.date as CalendarDate, memo: draft.notes }, receipt, today);
    if (!p.ok) return setError(p.error);
    setError(null);
    setPreview(p.value);
    setStep(p.value.duplicates.length ? 'duplicate' : 'review');
  };

  const save = async () => {
    if (!preview || saving) return;
    setSaving(true);
    let p = preview;
    if (p.entry.receipt && capture) {
      const kept = await saveReceiptImage(getRepository().userId, p.entry.receipt.receipt_id, capture.image);
      if (!kept) {
        // the purchase is still recorded with what was read; the photo just is not kept
        p = { ...p, entry: { ...p.entry, receipt: undefined } };
        setNotice('THE PHOTO COULD NOT BE KEPT ON THIS DEVICE. THE PURCHASE IS SAVED WITHOUT IT.');
      }
    }
    const r = savePurchase(p);
    setSaving(false);
    if (!r.ok) return setError(r.error);
    setSavedId(r.value.id);
    setStep('saved');
  };

  if (step === 'receipt')
    return (
      <ReceiptFlow
        onClose={onClose}
        onManual={() => setStep('form')}
        onRead={(c) => {
          setCapture(c);
          setDraft((d) => ({ ...d, merchant: c.read.merchant ?? '', amount: c.read.total != null ? c.read.total.toFixed(2) : '', date: c.read.date ?? d.date }));
          setStep('form');
        }}
      />
    );

  if (step === 'saved' && savedId)
    return (
      <Dot01Overlay testId="d01-purchase-saved" env="SK03_FIELD" title={['PURCHASE', 'RECORDED']} onClose={onClose} contentRect={CONTENT} label="SAVED" content={
        <>
          <Paper kind="sheet">
            <img src={DOT01['02_LAUREL_WAX_SEAL']} alt="" className="d01-stamp" style={{ width: 92, display: 'block', margin: '0 auto 6px' }} />
            <p className="d01-h" role="status">SAVED</p>
            <Row label={preview!.entry.merchant} value={formatMoney(Math.abs(preview!.entry.amount))} sub={`${shortDate(preview!.entry.occurred_on ?? null)} · ${accountById(preview!.entry.account_id ?? '')?.display_name ?? ''}`} />
            <ImpactRows impact={preview!.impact} />
          </Paper>
          {notice ? <Alert>{notice}</Alert> : null}
          <div className="d01-actions">
            <Button trigger="d01-open-saved" onClick={() => go(`money/entries/${savedId}`)}>OPEN TRANSACTION</Button>
            <Button trigger="d01-saved-done" quiet onClick={onClose}>DONE</Button>
          </div>
        </>
      } />
    );

  if (step === 'duplicate' && preview) {
    const m = preview.duplicates[0]!;
    return (
      <Dot01Overlay testId="d01-receipt-duplicate" env="SK03_FIELD" title={['REVIEW', 'RECEIPT']} subtitle="something needs your attention" onClose={onClose} contentRect={CONTENT} contentScroll label="POSSIBLE DUPLICATE" content={
        <>
          <Alert role="alert" testId="d01-duplicate-found">POSSIBLE DUPLICATE FOUND. THIS {capture ? 'RECEIPT' : 'PURCHASE'} APPEARS TO MATCH AN EXISTING TRANSACTION. NOTHING HAS BEEN SAVED.</Alert>
          <div className="d01-split">
            <Paper kind="panel">
              <p className="d01-h">CURRENT {capture ? 'RECEIPT' : 'ENTRY'}</p>
              <Row label={shortDate(preview.entry.occurred_on ?? null)} value={formatMoney(Math.abs(preview.entry.amount))} sub={preview.entry.merchant} />
            </Paper>
            <Paper kind="panel">
              <p className="d01-h">POSSIBLE MATCH</p>
              <Row label={shortDate(m.entry.occurred_on ?? null)} value={formatMoney(Math.abs(m.entry.amount))} sub={`${m.entry.merchant}${m.reason === 'SAME_RECEIPT' ? ' · SAME RECEIPT' : ''}`} />
            </Paper>
          </div>
          <div className="d01-actions">
            <Button trigger="d01-use-existing" icon="duplicate" onClick={() => go(`money/entries/${m.entry.id}`)}>USE EXISTING ENTRY</Button>
            <Button trigger="d01-save-as-new" quiet icon="plus" onClick={() => setStep('review')}>SAVE AS NEW</Button>
            <Button trigger="d01-fix-details" quiet icon="edit" onClick={() => setStep('form')}>FIX DETAILS</Button>
            <Button trigger="d01-enter-manually" quiet onClick={() => { setCapture(null); setStep('form'); }}>ENTER MANUALLY</Button>
          </div>
        </>
      } />
    );
  }

  if (step === 'review' && preview)
    return (
      <Dot01Overlay testId="d01-transaction-review" chips={searchAdd} env="SK03_FIELD" title={['TRANSACTION', 'REVIEW']} subtitle="review before saving" onClose={onClose} contentRect={CONTENT} contentScroll label="TRANSACTION REVIEW" content={
        <>
          <Paper kind="sheet">
            <div className="d01-rows">
              <Row icon="coins" label="AMOUNT" value={formatMoney(Math.abs(preview.entry.amount))} testId="d01-review-amount" />
              <Row icon="bank" label="ACCOUNT" value={accountById(preview.entry.account_id ?? '')?.display_name ?? ''} />
              <Row icon="calendar" label="DATE" value={shortDate(preview.entry.occurred_on ?? null)} />
              <Row icon="tag" label="CATEGORY" value={preview.entry.category} />
              <Row icon="info" label="TRANSACTION TYPE" value={preview.kind} sub={preview.kind === 'CREDIT PURCHASE' ? 'RAISES WHAT THE CARD OWES · NO CASH MOVES' : 'LOWERS MONEY HELD'} testId="d01-review-kind" />
              <Row icon="merchant" label="MERCHANT" value={preview.entry.merchant} />
              {preview.entry.memo ? <Row icon="note" label="NOTES" value={preview.entry.memo} /> : null}
              <Row icon="receipt" label="RECEIPT" value={preview.entry.receipt ? 'ATTACHED (THIS DEVICE)' : 'NONE'} />
            </div>
            {preview.entry.receipt?.extracted.items.length ? (
              <>
                <p className="d01-note" style={{ marginTop: 6 }}>ITEMS AS READ · NOT CONFIRMED</p>
                {preview.entry.receipt.extracted.items.slice(0, 6).map((it, i) => (
                  <Row key={i} label={it.name} value={formatMoney(it.amount)} />
                ))}
              </>
            ) : null}
          </Paper>
          <Paper kind="blank">
            <p className="d01-h">BALANCE IMPACT</p>
            <ImpactRows impact={preview.impact} testId="d01-review-impact" />
          </Paper>
          {error ? <Alert role="alert">{error}</Alert> : null}
          <div className="d01-actions">
            <Button trigger="d01-save-transaction" icon="check" disabled={saving} onClick={() => void save()}>{saving ? 'SAVING…' : 'SAVE TRANSACTION'}</Button>
            <Button trigger="d01-edit-details" quiet onClick={() => setStep('form')}>EDIT DETAILS</Button>
          </div>
        </>
      } />
    );

  // form (16 / 18 / 19 / 28)
  const fromReceipt = !!capture;
  return (
    <Dot01Overlay testId={fromReceipt ? 'd01-review-purchase' : 'd01-record'} env="SK03_FIELD" title={fromReceipt ? ['REVIEW', 'PURCHASE'] : title} subtitle={fromReceipt ? 'check before saving' : undefined} onClose={onClose} contentRect={CONTENT} contentScroll label={fromReceipt ? 'REVIEW EXTRACTED PURCHASE' : title.join(' ')} content={
      <>
        {!fromReceipt ? (
          <div className="d01-actions d01-actions--2">
            <Button trigger="d01-scan-receipt" icon="camera" onClick={() => setStep('receipt')}>SCAN RECEIPT</Button>
            <Button trigger="d01-manual-entry" quiet icon="edit" onClick={() => undefined}>MANUAL ENTRY</Button>
          </div>
        ) : (
          <Alert testId="d01-review-read">{read!.warnings.length ? `CHECK THE HIGHLIGHTED FIELDS: ${read!.warnings.map((w) => w.replace(/_/g, ' ')).join(', ')}.` : 'READ FROM YOUR RECEIPT. EDIT ANYTHING THAT LOOKS OFF.'}</Alert>
        )}
        <Paper kind="sheet">
          {withType ? (
            <SelectInput label="TYPE" icon="arrows" trigger="d01-type" value="PURCHASE" options={[{ id: 'PURCHASE', label: 'PURCHASE' }, { id: 'MONEY_IN', label: 'MONEY IN (INCOME)' }, { id: 'TRANSFER', label: 'TRANSFER' }, { id: 'CARD_PAYMENT', label: 'CARD PAYMENT' }]} onValue={(t) => (t === 'MONEY_IN' ? onSwitch?.('money-in') : t === 'TRANSFER' ? onSwitch?.('transfer') : t === 'CARD_PAYMENT' ? onSwitch?.('card-payment') : undefined)} />
          ) : null}
          <TextInput label="MERCHANT" icon="merchant" value={draft.merchant} onValue={set('merchant')} trigger="d01-merchant" uncertain={uncertain('merchant')} />
          <TextInput label="AMOUNT" icon="coins" value={draft.amount} onValue={set('amount')} trigger="d01-amount" inputMode="decimal" placeholder="0.00" uncertain={uncertain('total')} hint={suggestTotal != null ? `SUBTOTAL + TAX = ${formatMoney(suggestTotal)}` : undefined} />
          {suggestTotal != null && !draft.amount ? (
            <button type="button" className="d01-chipbtn" data-jrn-trigger="d01-use-suggested" onClick={() => set('amount')(suggestTotal.toFixed(2))}>USE {formatMoney(suggestTotal)}</button>
          ) : null}
          <SelectInput label="CATEGORY" icon="tag" trigger="d01-category" value={draft.category} options={CATEGORIES} onValue={set('category')} placeholder="SELECT CATEGORY" />
          <TextInput label="DATE" icon="calendar" type="date" value={draft.date} onValue={set('date')} trigger="d01-date" uncertain={uncertain('date')} />
          <TextInput label="NOTES" icon="note" value={draft.notes} onValue={set('notes')} trigger="d01-notes" placeholder="OPTIONAL" />
          <SelectInput label={mode === 'card' ? 'CARD' : mode === 'cash' ? 'SOURCE' : 'ACCOUNT'} icon={mode === 'card' ? 'card' : 'bank'} trigger="d01-account" value={draft.accountId} options={accounts.map((a) => ({ id: a.account_id, label: a.display_name }))} onValue={set('accountId')} />
        </Paper>
        {error ? <Alert role="alert">{error}</Alert> : null}
        <div className="d01-actions">
          <Button trigger="d01-review-save" icon="check" onClick={toReview}>{fromReceipt ? 'SAVE PURCHASE' : mode === 'card' ? 'RECORD PURCHASE' : mode === 'cash' ? 'RECORD SPENDING' : 'RECORD TRANSACTION'}</Button>
          {fromReceipt ? <Button trigger="d01-scan-again" quiet icon="camera" onClick={() => setStep('receipt')}>SCAN AGAIN</Button> : null}
        </div>
      </>
    } />
  );
}

export function AddCashOverlay({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const { go } = useJurnl();
  const today = getTodayKey();
  const [source, setSource] = useState<'' | 'ACCOUNT' | 'EARNINGS' | 'COUNT'>('');
  const [from, setFrom] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<string>(today);
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<TransferPreview | null>(null);
  const [count, setCount] = useState<{ before: number; after: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const v = accountView(accountId, today);
  const sources = listActiveAccounts().filter((a) => !isLiability(a) && a.account_id !== accountId);
  if (!v) return null;
  const review = () => {
    const n = parseMoneyInput(amount);
    if (n == null) return setError('ENTER THE AMOUNT, LIKE 40.00.');
    if (source === 'ACCOUNT') {
      if (!from) return setError('CHOOSE THE ACCOUNT THE CASH CAME FROM.');
      const p = previewTransfer({ from_account_id: from, to_account_id: accountId, amount: n, occurred_on: date as CalendarDate, memo: notes, start: 'COMPLETED' }, today);
      if (!p.ok) return setError(p.error);
      setPreview(p.value);
    } else if (source === 'COUNT') {
      setCount({ before: v.held, after: toCents(v.held + n) });
    }
    setError(null);
  };
  const confirm = () => {
    if (preview) {
      const r = saveTransfer(preview);
      if (!r.ok) return setError(r.error);
    } else if (count) {
      const r = correctAccountBalance(accountId, count.after, today);
      if (!r.ok) return setError(r.error);
    }
    setDone(true);
  };
  return (
    <Dot01Overlay testId="d01-add-cash" env="SK03_FIELD" title={['ADD CASH']} onClose={onClose} contentRect={CONTENT} contentScroll label="ADD CASH" content={
      done ? (
        <>
          <Paper kind="sheet">
            <p className="d01-h d01-stamp" role="status">CASH ADDED</p>
            <Row label="CASH ON HAND" value={formatMoney(accountView(accountId)?.held ?? 0)} />
          </Paper>
          <Button trigger="d01-add-cash-done" onClick={onClose}>DONE</Button>
        </>
      ) : preview || count ? (
        <>
          <Paper kind="sheet">
            <p className="d01-h">REVIEW</p>
            {preview ? <ImpactRows impact={preview.impact} testId="d01-cash-impact" /> : <Row label="CASH ON HAND · COUNTED" value={`${formatMoney(count!.before)} → ${formatMoney(count!.after)}`} sub="RECORDED AS A BALANCE CORRECTION · NOT INCOME" />}
          </Paper>
          {preview?.warnings.map((w) => <Alert key={w} testId="d01-cash-warning">{w}</Alert>)}
          {error ? <Alert role="alert">{error}</Alert> : null}
          <div className="d01-actions">
            <Button trigger="d01-add-to-cash" icon="coins" onClick={confirm}>ADD TO CASH</Button>
            <Button trigger="d01-add-cash-back" quiet onClick={() => { setPreview(null); setCount(null); }}>EDIT</Button>
          </div>
        </>
      ) : (
        <>
          <p className="d01-note" style={{ textAlign: 'center', color: '#efe3cb' }}>RECORD CASH RECEIVED INTO CASH ON HAND</p>
          <Paper kind="sheet">
            <SelectInput label="SOURCE" icon="arrows" trigger="d01-cash-source" value={source} onValue={(s) => (s === 'EARNINGS' ? go('income?add=earnings') : setSource(s))} options={[{ id: 'ACCOUNT', label: 'FROM AN ACCOUNT (WITHDRAWAL)' }, { id: 'EARNINGS', label: 'CASH EARNINGS OR TIPS (INCOME)' }, { id: 'COUNT', label: 'I COUNTED MORE CASH' }]} />
            {source === 'ACCOUNT' ? <SelectInput label="FROM" icon="bank" trigger="d01-cash-from" value={from} onValue={setFrom} options={sources.map((a) => ({ id: a.account_id, label: a.display_name }))} /> : null}
            <TextInput label="AMOUNT" icon="coins" value={amount} onValue={setAmount} trigger="d01-cash-amount" inputMode="decimal" placeholder="0.00" />
            {source === 'ACCOUNT' ? <TextInput label="DATE" icon="calendar" type="date" value={date} onValue={setDate} trigger="d01-cash-date" /> : null}
            <TextInput label="NOTES" icon="note" value={notes} onValue={setNotes} trigger="d01-cash-notes" placeholder="OPTIONAL" />
          </Paper>
          {error ? <Alert role="alert">{error}</Alert> : null}
          <Button trigger="d01-cash-review" icon="check" disabled={!source} onClick={review}>REVIEW</Button>
        </>
      )
    } />
  );
}

const START: { id: TransferStart; label: string }[] = [
  { id: 'COMPLETED', label: 'ALREADY PAID AND CONFIRMED' },
  { id: 'PENDING', label: 'SUBMITTED, NOT CONFIRMED YET' },
  { id: 'SCHEDULED', label: 'SCHEDULED FOR A DATE' },
];

export function CardPaymentOverlay({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const today = getTodayKey();
  const card = accountById(accountId);
  const cardIsLiability = card ? isLiability(card) : false;
  const [cardId, setCardId] = useState(cardIsLiability ? accountId : '');
  const [from, setFrom] = useState(cardIsLiability ? '' : accountId);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<string>(today);
  const [start, setStart] = useState<TransferStart | ''>('');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<TransferPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const cards = listActiveAccounts().filter((a) => a.account_type === 'CREDIT_CARD' || a.account_type === 'LOAN');
  const sources = listActiveAccounts().filter((a) => !isLiability(a));
  const review = () => {
    const n = parseMoneyInput(amount);
    if (!from) return setError('CHOOSE THE ACCOUNT THE PAYMENT CAME FROM.');
    if (!cardId) return setError('CHOOSE THE CARD.');
    if (n == null) return setError('ENTER THE AMOUNT, LIKE 35.00.');
    if (!start) return setError('CHOOSE WHERE THE PAYMENT IS.');
    const when = start === 'SCHEDULED' && date <= today ? addDays(today, 1) : date;
    const p = previewTransfer({ from_account_id: from, to_account_id: cardId, amount: n, occurred_on: when as CalendarDate, memo: notes, start }, today);
    if (!p.ok) return setError(p.error);
    setError(null);
    setPreview(p.value);
  };
  return (
    <Dot01Overlay testId="d01-card-payment" env="SK03_FIELD" title={['RECORD CARD', 'PAYMENT']} onClose={onClose} contentRect={CONTENT} contentScroll label="RECORD CARD PAYMENT" content={
      done ? (
        <>
          <Paper kind="sheet">
            <p className="d01-h d01-stamp" role="status">PAYMENT RECORDED</p>
            <p className="d01-note" style={{ textAlign: 'center' }}>{start === 'COMPLETED' ? 'THE CARD BALANCE AND THE ACCOUNT ARE UPDATED.' : 'NOTHING MOVES UNTIL YOU CONFIRM IT ARRIVED. OPEN TRANSFERS IN ALL ACCOUNTS TO RECORD THE NEXT STEP.'}</p>
          </Paper>
          <Button trigger="d01-payment-done" onClick={onClose}>DONE</Button>
        </>
      ) : preview ? (
        <>
          <Paper kind="sheet">
            <p className="d01-h">REVIEW</p>
            <Row label="STATUS" value={START.find((s) => s.id === start)?.label} />
            <ImpactRows impact={preview.impact} testId="d01-payment-impact" />
            {start !== 'COMPLETED' ? <p className="d01-note">NOT SETTLED: THE CARD STILL OWES THE SAME AND THE ACCOUNT IS NOT DEBITED UNTIL IT IS CONFIRMED.</p> : null}
          </Paper>
          {preview.warnings.map((w) => <Alert key={w} testId="d01-payment-warning">{w}</Alert>)}
          {error ? <Alert role="alert">{error}</Alert> : null}
          <div className="d01-actions">
            <Button trigger="d01-payment-save" icon="check" onClick={() => { const r = saveTransfer(preview); if (!r.ok) return setError(r.error); setDone(true); }}>SAVE</Button>
            <Button trigger="d01-payment-edit" quiet onClick={() => setPreview(null)}>EDIT</Button>
          </div>
        </>
      ) : (
        <>
          <Alert testId="d01-payment-honest">LOG A PAYMENT THAT HAS ALREADY BEEN MADE OR IS SCHEDULED. JURNL DOES NOT SEND MONEY.</Alert>
          <Paper kind="sheet">
            <SelectInput label="PAYMENT ACCOUNT" icon="bank" trigger="d01-pay-from" value={from} onValue={setFrom} options={sources.map((a) => ({ id: a.account_id, label: a.display_name }))} placeholder="SELECT ACCOUNT" />
            <SelectInput label="CARD" icon="card" trigger="d01-pay-card" value={cardId} onValue={setCardId} options={cards.map((a) => ({ id: a.account_id, label: a.display_name }))} placeholder="SELECT CARD" />
            <TextInput label="AMOUNT" icon="coins" value={amount} onValue={setAmount} trigger="d01-pay-amount" inputMode="decimal" placeholder="0.00" />
            <TextInput label="DATE" icon="calendar" type="date" value={date} onValue={setDate} trigger="d01-pay-date" />
            <SelectInput label="STATUS" icon="check" trigger="d01-pay-status" value={start} onValue={setStart} options={START} placeholder="SELECT STATUS" />
            <TextInput label="NOTES" icon="note" value={notes} onValue={setNotes} trigger="d01-pay-notes" placeholder="OPTIONAL" />
          </Paper>
          {error ? <Alert role="alert">{error}</Alert> : null}
          <Button trigger="d01-pay-review" icon="check" onClick={review}>REVIEW & SAVE</Button>
        </>
      )
    } />
  );
}

