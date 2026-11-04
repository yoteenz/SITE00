/**
 * F05 DOT 01 — TRANSACTION DETAIL (11), ACCOUNT DETAILS AND SETTINGS (12), BALANCE REVIEW (13) and ACCOUNT NEEDS
 * REVIEW (35). Read from canonical owners; every change goes through an overlay with an explicit confirmation.
 */
import { useEffect, useState, type CSSProperties, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { accountView, KIND_TITLE } from '../../../../data/f05/dot01/accountView';
import { correctionCheck } from '../../../../data/f05/dot01/corrections';
import { entryById, historyRow } from '../../../../data/f05/dot01/history';
import { differenceOf, markIssueResolved, markReconciled, reconciliationOf, reviewIssues } from '../../../../data/f05/dot01/reconciliation';
import { nameLines } from '../../../../data/f05/moneyParentReading';
import { getTodayKey } from '../../../../data/foundation/dates';
import { formatMoney, useCurrency, useRepoTick } from '../../../../data/home/money';
import { parseMoneyInput } from '../../../../data/ledger/ledgerOps';
import { PURPOSE_LABEL } from '../../../../data/ledger/purposes';
import { getRepository } from '../../../../data/repository/deviceRepository';
import { useJurnl } from '../../../state/store';
import { DOT01 } from './dot01Assets';
import { Dot01Frame } from './Dot01Frame';
import { shortDate } from './HistoryPage';
import { Alert, Button, Paper, Row, Strip, TextInput } from './kit';
import { NotFoundPage } from './NotFoundPage';
import { getReceiptImage } from './receiptStore';
import { Dot01Sheets, type Dot01SheetState } from './sheets/Dot01Sheets';

const CONTENT = { x: 30, y: 600, w: 881, h: 1066 };

export function TransactionDetailPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const { go, back } = useJurnl();
  useCurrency();
  useRepoTick();
  const [sheet, setSheet] = useState<Dot01SheetState>(null);
  const [img, setImg] = useState<string | null>(null);
  const today = getTodayKey();
  const found = entryId ? entryById(entryId) : null;
  // while a correction overlay is open the page keeps the entry it opened with (a reversal removes it from the
  // ledger, and the overlay still shows its DONE step above this page)
  const last = useRef(found);
  if (found) last.current = found;
  const entry = found ?? (sheet ? last.current : null);
  useEffect(() => {
    let url: string | null = null;
    if (entry?.receipt) {
      void getReceiptImage(getRepository().userId, entry.receipt.receipt_id).then((b) => {
        if (b) {
          url = URL.createObjectURL(b);
          setImg(url);
        }
      });
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [entry?.receipt?.receipt_id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!entry) return <NotFoundPage what="ENTRY" />;
  const r = historyRow(entry, getRepository().listAccounts(), today);
  const check = correctionCheck(entry.id);
  const content = (
    <>
      <div className="d01-split" style={{ gridTemplateColumns: entry.receipt ? '1.25fr 1fr' : '1fr' }}>
        <Paper kind="sheet" testId="d01-tx-detail">
          <div className="d01-rows">
            <Row icon="merchant" label="MERCHANT" value={entry.merchant} />
            <Row icon="calendar" label="DATE" value={shortDate(r.date)} />
            <Row icon="coins" label="AMOUNT" value={formatMoney(Math.abs(entry.amount))} testId="d01-tx-amount" />
            <Row icon="tag" label="CATEGORY" value={entry.category || '—'} />
            <Row icon="bank" label="ACCOUNT USED" value={r.account?.display_name ?? 'NO ACCOUNT'} />
            <Row icon="info" label="TYPE" value={r.kind} />
            {entry.memo ? <Row icon="note" label="NOTES" value={entry.memo} /> : null}
            <Row icon="check" label="STATUS" value={r.state} />
          </div>
        </Paper>
        {entry.receipt ? (
          <Paper kind="panel" testId="d01-tx-receipt">
            <p className="d01-h">RECEIPT</p>
            <div style={{ position: 'relative' }}>
              <img src={DOT01['22_RECEIPT_PAPER_STACK']} alt="" style={{ width: '100%', display: 'block' }} />
              {img ? <img src={img} alt="YOUR RECEIPT PHOTO" className="d01-preview-img" style={{ position: 'absolute', left: '14%', top: '12%', width: '72%', height: '76%' }} /> : <p className="d01-note" style={{ position: 'absolute', inset: '30% 15%', textAlign: 'center' }}>{'THE PHOTO IS KEPT ON THE DEVICE THAT SCANNED IT.'}</p>}
            </div>
          </Paper>
        ) : null}
      </div>
      {entry.correction_history?.length ? (
        <Paper kind="blank" testId="d01-tx-trail">
          <p className="d01-h">CORRECTION HISTORY</p>
          {entry.correction_history.map((c, i) => (
            <p key={i} className="d01-note">{`${c.at.slice(0, 10)} · ${c.reason} · WAS ${formatMoney(c.before.amount)} · ${c.before.merchant} · ${c.before.category}`}</p>
          ))}
        </Paper>
      ) : null}
      {check.ok ? (
        <>
          <Strip i={0} icon="edit" label="EDIT" trigger="d01-tx-edit" onClick={() => setSheet({ kind: 'correct', entryId: entry.id, mode: 'edit' })} />
          <Strip i={1} icon="tag" label="REASSIGN CATEGORY" trigger="d01-tx-category" onClick={() => setSheet({ kind: 'correct', entryId: entry.id, mode: 'category' })} />
          {entry.receipt ? <Strip i={2} icon="receipt" label="VIEW RECEIPT" trigger="d01-tx-receipt-open" disabled={!img} onClick={() => img && window.open(img, '_blank', 'noopener')} /> : null}
          <Strip i={3} icon="reverse" label="CORRECT TRANSACTION" trigger="d01-tx-correct" onClick={() => setSheet({ kind: 'correct', entryId: entry.id, mode: 'options' })} />
        </>
      ) : (
        <Alert testId="d01-tx-owner">
          {check.reason}
          {check.owner ? (
            <>
              {' '}
              <button type="button" className="d01-chipbtn" data-jrn-trigger="d01-tx-owner" onClick={() => go(check.owner!.route)}>{check.owner.label}</button>
            </>
          ) : null}
        </Alert>
      )}
    </>
  );
  return (
    <Dot01Frame
      screenId="F05.ENTRY"
      env="SK02_FIELD"
      title={['TRANSACTION', 'DETAIL']}
      testId="d01-entry"
      label="TRANSACTION DETAIL"
      chips={[{ id: 'd01-back', label: 'BACK', icon: 'back', onClick: () => back() || go(r.account ? `money/places/${r.account.account_id}/history` : 'money') }]}
      contentRect={CONTENT}
      contentScroll
      content={content}
      overlays={<Dot01Sheets state={sheet} onClose={() => setSheet(null)} />}
    />
  );
}

export function SettingsPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const { go, back } = useJurnl();
  useCurrency();
  useRepoTick();
  const [sheet, setSheet] = useState<Dot01SheetState>(null);
  const today = getTodayKey();
  const v = placeId ? accountView(placeId, today) : null;
  if (!v) return <NotFoundPage />;
  const id = v.account.account_id;
  const rec = reconciliationOf(id, today);
  const content = (
    <>
      <Paper kind="sheet" testId="d01-settings">
        <div className="d01-rows">
          <Row icon="edit" label="ACCOUNT NAME" value={v.account.display_name} />
          <Row icon="column" label="ACCOUNT TYPE" value={KIND_TITLE[v.kind]} sub={v.account.account_type.replace('_', ' ')} />
          <Row icon="bank" label="INSTITUTION OR SOURCE" value={v.account.is_connected ? 'CONNECTED' : 'ENTERED BY YOU'} sub="NO BANK CONNECTION" />
          <Row icon="reverse" label="TRACKING STATUS" value={v.archived ? 'ARCHIVED' : 'ACTIVE'} />
          <Row icon="coins" label={v.liability ? 'STARTING AMOUNT OWED' : 'STARTING BALANCE'} value={formatMoney(v.entered)} />
          <Row icon="scale" label="RECONCILIATION" value={rec?.status ?? '—'} sub={rec?.on ? `LAST CONFIRMED ${rec.on}` : undefined} />
          <Row icon="tag" label="ACCOUNT PURPOSES" value={v.purposes.length ? v.purposes.map((p) => PURPOSE_LABEL[p]).join(' · ') : 'NONE'} />
        </div>
      </Paper>
      {!v.archived ? (
        <>
          <Strip i={0} icon="edit" label="RENAME ACCOUNT" trigger="d01-rename" onClick={() => setSheet({ kind: 'edit', accountId: id })} />
          <Strip i={1} icon="tag" label="EDIT PURPOSES" trigger="d01-purposes" onClick={() => setSheet({ kind: 'purposes', accountId: id })} />
          <Strip i={2} icon="scale" label="BALANCE REVIEW" trigger="d01-balance-review" onClick={() => go(`money/places/${id}/review`)} />
          <Strip i={3} icon="archive" label="ARCHIVE ACCOUNT" trigger="d01-archive" warn onClick={() => setSheet({ kind: 'archive', accountId: id })} />
        </>
      ) : null}
    </>
  );
  return (
    <Dot01Frame
      screenId="F05.SETTINGS"
      env="SK02_FIELD"
      title={['ACCOUNT', 'DETAILS']}
      subtitle="account settings"
      testId="d01-settings-page"
      label="ACCOUNT DETAILS AND SETTINGS"
      chips={[{ id: 'd01-back', label: 'BACK', icon: 'back', onClick: () => back() || go(`money/places/${id}`) }]}
      contentRect={CONTENT}
      contentScroll
      content={content}
      overlays={<Dot01Sheets state={sheet} onClose={() => setSheet(null)} />}
    />
  );
}

export function BalanceReviewPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const { go, back } = useJurnl();
  useCurrency();
  useRepoTick();
  const [actual, setActual] = useState('');
  const [sheet, setSheet] = useState<Dot01SheetState>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const today = getTodayKey();
  const v = placeId ? accountView(placeId, today) : null;
  const rec = placeId ? reconciliationOf(placeId, today) : null;
  if (!v || !rec) return <NotFoundPage />;
  const id = v.account.account_id;
  const actualValue = actual.trim() ? parseMoneyInput(actual, true) : null;
  const diff = actualValue != null ? differenceOf(rec.tracked, actualValue) : null;
  const content = (
    <>
      <Paper kind="panel" testId="d01-review">
        <p className="d01-h">{v.account.display_name}</p>
        <div className="d01-split">
          <div style={{ textAlign: 'center' }}>
            <p className="d01-note">{v.liability ? 'TRACKED AMOUNT OWED' : 'TRACKED BALANCE'}</p>
            <b className="d01-big" data-testid="d01-tracked" data-jrn-amount-cents={Math.round(rec.tracked * 100)}>{formatMoney(rec.tracked)}</b>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="d01-note">{v.liability ? 'ACTUAL AMOUNT OWED' : 'ACTUAL BALANCE'}</p>
            <b className="d01-big" data-testid="d01-actual">{actualValue != null ? formatMoney(actualValue) : '—'}</b>
          </div>
        </div>
      </Paper>
      <Paper kind="blank">
        <TextInput label={v.liability ? 'WHAT THE CARD SAYS YOU OWE NOW' : 'WHAT THE ACCOUNT HOLDS NOW'} value={actual} onValue={(x) => { setActual(x); setDone(null); setError(null); }} trigger="d01-actual-input" inputMode="decimal" stack />
        <div className="d01-rows">
          <Row label="DIFFERENCE" value={diff == null ? '—' : formatMoney(diff, true)} testId="d01-difference" sub={diff == null ? 'ENTER THE ACTUAL BALANCE TO COMPARE' : diff === 0 ? 'NO DIFFERENCE' : 'NOT INCOME, NOT SPENDING: A DIFFERENCE TO REVIEW'} />
          <Row label="RECONCILIATION STATUS" value={rec.status} sub={rec.on ? `LAST CONFIRMED ${rec.on}` : undefined} testId="d01-rec-status" />
        </div>
      </Paper>
      {error ? <Alert role="alert">{error}</Alert> : null}
      {done ? <Alert tone="ok" testId="d01-review-done">{done}</Alert> : null}
      <Strip i={0} icon="book" label="REVIEW RECENT TRANSACTIONS" trigger="d01-review-recent" onClick={() => go(`money/places/${id}/history`)} />
      <Strip i={1} icon="plus" label="ADD ADJUSTMENT" trigger="d01-add-adjustment" disabled={diff == null || diff === 0} onClick={() => actualValue != null && setSheet({ kind: 'adjust', accountId: id, actual: actualValue })} />
      <Button
        trigger="d01-mark-reconciled"
        icon="check"
        disabled={diff == null}
        onClick={() => {
          if (actualValue == null) return;
          const r = markReconciled(id, actualValue, today);
          if (!r.ok) return setError(r.error);
          setError(null);
          setDone('RECONCILED. THE TRACKED BALANCE MATCHES WHAT YOU SEE.');
        }}
      >
        MARK RECONCILED
      </Button>
    </>
  );
  return (
    <Dot01Frame
      screenId="F05.REVIEW"
      env="SK02_FIELD"
      title={['BALANCE', 'REVIEW']}
      testId="d01-review-page"
      label="BALANCE REVIEW"
      chips={[{ id: 'd01-back', label: 'BACK', icon: 'back', onClick: () => back() || go(`money/places/${id}/settings`) }]}
      contentRect={CONTENT}
      contentScroll
      content={content}
      overlays={<Dot01Sheets state={sheet} onClose={() => setSheet(null)} onDone={(msg) => { setSheet(null); setActual(''); setDone(msg); }} />}
    />
  );
}

export function NeedsReviewPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const { go, back } = useJurnl();
  useCurrency();
  useRepoTick();
  const today = getTodayKey();
  const v = placeId ? accountView(placeId, today) : null;
  if (!v) return <NotFoundPage />;
  const id = v.account.account_id;
  const issues = reviewIssues(id, today);
  const content = (
    <>
      <Paper kind="panel" testId="d01-attention">
        <p className="d01-h">{nameLines(v.account.display_name).join(' ')}</p>
        <p className="d01-note" style={{ textAlign: 'center' }}>{issues.length ? `${issues.length} ${issues.length === 1 ? 'THING NEEDS' : 'THINGS NEED'} YOUR ATTENTION` : 'NOTHING NEEDS REVIEW'}</p>
      </Paper>
      <Paper kind="sheet">
        <p className="d01-h">REVIEW ISSUES</p>
        {issues.length === 0 ? <p className="d01-note" data-testid="d01-no-issues">ALL CLEAR.</p> : null}
        {issues.map((x, i) => (
          <div key={x.id} className="d01-slip" style={{ ['--i' as string]: i } as CSSProperties}>
            <Row icon="warn" label={x.label} sub={x.detail} testId={`d01-issue-${x.id}`} />
            {x.id !== 'UNCONFIRMED_TRANSFER' ? (
              <button type="button" className="d01-chipbtn" data-jrn-trigger={`d01-resolve-${x.id}`} onClick={() => markIssueResolved(id, x.id, today)}>
                MARK RESOLVED
              </button>
            ) : null}
          </div>
        ))}
      </Paper>
      <div className="d01-actions">
        <Button trigger="d01-review-account" icon="search" onClick={() => go(issues.some((x) => x.action === 'TRANSFERS') ? 'money/places' : `money/places/${id}/review`)}>
          REVIEW ACCOUNT
        </Button>
        <Button trigger="d01-open-account" quiet onClick={() => go(`money/places/${id}`)}>
          OPEN ACCOUNT
        </Button>
        <Button trigger="d01-back-accounts" quiet onClick={() => go('money/places')}>
          BACK TO ACCOUNTS
        </Button>
      </div>
    </>
  );
  return (
    <Dot01Frame
      screenId="F05.ATTENTION"
      env="SK02_FIELD"
      title={['ACCOUNT', 'REVIEW']}
      subtitle="needs attention"
      testId="d01-attention-page"
      label="ACCOUNT NEEDS REVIEW"
      chips={[{ id: 'd01-back', label: 'BACK', icon: 'back', onClick: () => back() || go('money/places') }]}
      contentRect={CONTENT}
      contentScroll
      content={content}
    />
  );
}
