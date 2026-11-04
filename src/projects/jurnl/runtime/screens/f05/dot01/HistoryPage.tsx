/**
 * F05 DOT 01 — account histories (authorities 07 BANK · 08 RIDESHARE · 09 CASH · 10 CREDIT) and TRANSACTIONS search
 * and filter (31). Rows come from the ledger (data/f05/dot01/history.ts); each row opens its transaction detail.
 * Only the first rows enter with a short slip stagger; filtering replaces the list without replaying the page.
 */
import { useMemo, useState, type CSSProperties } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { accountView } from '../../../../data/f05/dot01/accountView';
import { accountNature } from '../../../../data/ledger/accounting';
import { categoriesIn, searchHistory, type HistoryFilter, type HistoryKind } from '../../../../data/f05/dot01/history';
import { nameLines } from '../../../../data/f05/moneyParentReading';
import { listActiveAccounts } from '../../../../data/foundation/accounts';
import { getTodayKey } from '../../../../data/foundation/dates';
import { formatMoney, useCurrency, useRepoTick } from '../../../../data/home/money';
import { useJurnl } from '../../../state/store';
import { Dot01Frame } from './Dot01Frame';
import { Icon } from './icons';
import { Button, Paper } from './kit';
import { NotFoundPage } from './NotFoundPage';
import { Dot01Sheets, type Dot01SheetState } from './sheets/Dot01Sheets';

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export function shortDate(d: string | null): string {
  if (!d) return '—';
  const [, m, day] = d.split('-');
  return `${MON[Number(m) - 1] ?? ''} ${Number(day)}`;
}
const KIND_ICON: Record<HistoryKind, string> = { SPENDING: 'merchant', INCOME: 'coins', TRANSFER: 'arrows', 'CARD PAYMENT': 'bank', ADJUSTMENT: 'scale', REFUND: 'reverse' };
const STAGGER_ROWS = 8;

export function HistoryPage({ all = false }: { all?: boolean }) {
  const { placeId } = useParams<{ placeId: string }>();
  const [params, setParams] = useSearchParams();
  const { go, back, openOverlay } = useJurnl();
  useCurrency();
  useRepoTick();
  const [sheet, setSheet] = useState<Dot01SheetState>(null);
  const [showFilters, setShowFilters] = useState(all || params.has('q'));
  const today = getTodayKey();
  const v = !all && placeId ? accountView(placeId, today) : null;
  const filter: HistoryFilter = {
    accountId: all ? params.get('account') || null : (placeId ?? null),
    q: params.get('q') ?? '',
    from: (params.get('from') as HistoryFilter['from']) || null,
    to: (params.get('to') as HistoryFilter['to']) || null,
    kind: (params.get('type') as HistoryKind) || null,
    state: (params.get('status') as HistoryFilter['state']) || null,
    category: params.get('category') || null,
    sort: (params.get('sort') as HistoryFilter['sort']) || 'NEWEST',
  };
  // the list (filters live in the URL: replace navigation, so back still leaves the page)
  const rows = useMemo(() => searchHistory(filter, today), [JSON.stringify(filter), today]); // eslint-disable-line react-hooks/exhaustive-deps
  // category choices come from the whole history of this place, so narrowing never hides the other choices
  const cats = useMemo(() => categoriesIn(searchHistory({ accountId: filter.accountId }, today)), [filter.accountId, today, rows.length]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!all && !v) return <NotFoundPage />;
  const set = (k: string, val: string | null) => {
    const next = new URLSearchParams(params);
    if (val) next.set(k, val);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const title = all ? ['TRANSACTIONS'] : v!.kind === 'cash' ? ['CASH USAGE', 'HISTORY'] : v!.kind === 'payout' ? ['RIDESHARE', 'ACTIVITY'] : v!.kind === 'credit' ? ['CREDIT CARD', 'ACTIVITY'] : [...nameLines(v!.account.display_name).slice(0, 1), 'TRANSACTION', 'HISTORY'].slice(0, 3);
  const balance = v ? (v.liability ? v.owed : v.held) : null;
  const content = (
    <>
      {v ? (
        <Paper kind="blank" testId="d01-history-balance">
          <div className="d01-split" style={{ alignItems: 'center' }}>
            <span className="d01-note" style={{ textAlign: 'center' }}>{v.liability ? 'CURRENT BALANCE' : v.kind === 'cash' ? 'CASH ON HAND' : 'ACCOUNT BALANCE'}</span>
            <b className="d01-big" style={{ textAlign: 'center' }} data-jrn-amount-cents={Math.round((balance ?? 0) * 100)}>
              {formatMoney(balance ?? 0)}
            </b>
          </div>
          {v.liability && v.availableCredit != null ? <p className="d01-note" style={{ textAlign: 'center' }}>{`AVAILABLE CREDIT ${formatMoney(v.availableCredit)} · OWED, NOT MONEY YOU HAVE`}</p> : null}
          {!v.liability && (v.waitingToLeave > 0 || v.incoming > 0) ? <p className="d01-note" style={{ textAlign: 'center' }}>{`${formatMoney(v.waitingToLeave)} NOT LEFT YET · ${formatMoney(v.incoming)} ON ITS WAY IN`}</p> : null}
        </Paper>
      ) : null}
      <Paper kind="sheet" className="d01-grow">
        <div className="d01-field d01-field--stack" style={{ borderBottom: 0 }}>
          <label htmlFor="d01-q" className="d01-sr">SEARCH TRANSACTIONS</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
            <input id="d01-q" type="search" placeholder="SEARCH TRANSACTIONS" value={filter.q} data-jrn-trigger="d01-search" onChange={(e) => set('q', e.target.value || null)} />
            <button type="button" className="d01-chipbtn" aria-expanded={showFilters} data-jrn-trigger="d01-filters" onClick={() => setShowFilters((x) => !x)}>
              FILTER
            </button>
          </div>
        </div>
        {showFilters ? (
          <div className="d01-filters" data-testid="d01-filters" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <label className="d01-field d01-field--stack">FROM<input type="date" value={filter.from ?? ''} data-jrn-trigger="d01-filter-from" onChange={(e) => set('from', e.target.value || null)} /></label>
            <label className="d01-field d01-field--stack">TO<input type="date" value={filter.to ?? ''} data-jrn-trigger="d01-filter-to" onChange={(e) => set('to', e.target.value || null)} /></label>
            {all ? (
              <label className="d01-field d01-field--stack">ACCOUNT
                <select value={filter.accountId ?? ''} data-jrn-trigger="d01-filter-account" onChange={(e) => set('account', e.target.value || null)}>
                  <option value="">ALL ACCOUNTS</option>
                  {listActiveAccounts().map((a) => <option key={a.account_id} value={a.account_id}>{a.display_name}</option>)}
                </select>
              </label>
            ) : null}
            <label className="d01-field d01-field--stack">TYPE
              <select value={filter.kind ?? ''} data-jrn-trigger="d01-filter-type" onChange={(e) => set('type', e.target.value || null)}>
                <option value="">ALL TYPES</option>
                {(['SPENDING', 'INCOME', 'TRANSFER', 'CARD PAYMENT', 'ADJUSTMENT', 'REFUND'] as HistoryKind[]).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <label className="d01-field d01-field--stack">CATEGORY
              <select value={filter.category ?? ''} data-jrn-trigger="d01-filter-category" onChange={(e) => set('category', e.target.value || null)}>
                <option value="">ALL CATEGORIES</option>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="d01-field d01-field--stack">STATUS
              <select value={filter.state ?? ''} data-jrn-trigger="d01-filter-status" onChange={(e) => set('status', e.target.value || null)}>
                <option value="">ANY STATUS</option>
                <option value="POSTED">POSTED</option>
                <option value="NOT POSTED">NOT POSTED YET</option>
              </select>
            </label>
            <label className="d01-field d01-field--stack">SORT
              <select value={filter.sort} data-jrn-trigger="d01-filter-sort" onChange={(e) => set('sort', e.target.value)}>
                <option value="NEWEST">NEWEST FIRST</option>
                <option value="OLDEST">OLDEST FIRST</option>
                <option value="LARGEST">LARGEST FIRST</option>
              </select>
            </label>
            <div className="d01-actions" style={{ gridColumn: '1 / -1' }}>
              <Button trigger="d01-clear-filters" quiet onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                CLEAR FILTERS
              </Button>
            </div>
          </div>
        ) : null}
        <p className="d01-sr" aria-live="polite">{`${rows.length} ${rows.length === 1 ? 'TRANSACTION' : 'TRANSACTIONS'}`}</p>
        {rows.length === 0 ? (
          <p className="d01-note" data-testid="d01-history-empty" style={{ textAlign: 'center', padding: '12px 0' }}>
            {filter.q || filter.kind || filter.from || filter.to || filter.state || filter.category ? 'NO TRANSACTIONS MATCH THESE FILTERS.' : 'NO TRANSACTIONS RECORDED YET.'}
          </p>
        ) : (
          <>
          <div className="d01-tx__head" aria-hidden>
            <span>DATE</span>
            <span>{v?.kind === 'credit' ? 'DESCRIPTION' : 'TRANSACTION'}</span>
            <span>AMOUNT</span>
          </div>
          <ul className="d01-list d01-list--tx" role="list" data-testid="d01-history-list" key={JSON.stringify(filter)}>
            {rows.slice(0, 200).map((r, i) => {
              const signed = r.effect !== 0 ? r.effect : 0;
              // a card's history reads like its statement: a charge raises what is owed (shown plain), a payment or
              // refund lowers it (shown with a minus); a held place shows money in (+) and out (−)
              const owedSide = !!v?.liability || (all && r.account != null && accountNature(r.account.account_type) === 'LIABILITY');
              return (
                <li key={r.id} className={i < STAGGER_ROWS ? 'd01-slip' : undefined} style={{ ['--i' as string]: i } as CSSProperties}>
                  <button type="button" className="d01-tx" data-jrn-trigger={`d01-tx-${r.id}`} aria-label={`${shortDate(r.date)}, ${r.label}, ${formatMoney(Math.abs(r.entry.amount))} ${r.kind}${r.settled ? '' : `, ${r.state}`}${all && r.account ? `, ${r.account.display_name}` : ''}. OPEN.`} onClick={() => go(`money/entries/${r.id}`)}>
                    <span className="d01-tx__date">{shortDate(r.date)}</span>
                    <span>
                      <Icon name={KIND_ICON[r.kind]} className="d01-tx__ico" />
                      {' '}
                      {r.label}
                      {all && r.account ? <small style={{ display: 'block', opacity: 0.7 }}>{r.account.display_name}</small> : null}
                    </span>
                    {!r.settled ? <span className="d01-tx__state">{r.state}</span> : <span />}
                    <span className="d01-tx__amt" data-jrn-amount-cents={Math.round(Math.abs(r.entry.amount) * 100)}>
                      {!r.settled ? formatMoney(Math.abs(r.entry.amount)) : owedSide && signed > 0 ? formatMoney(signed) : formatMoney(signed, true)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          </>
        )}
        {rows.length > 200 ? <p className="d01-note">SHOWING THE FIRST 200. NARROW THE SEARCH TO SEE OLDER ENTRIES.</p> : null}
      </Paper>
      {v && !v.archived ? (
        <div className="d01-actions">
          <Button trigger="d01-record" icon="plus" onClick={() => setSheet(v.kind === 'credit' ? { kind: 'spend', accountId: v.account.account_id } : v.kind === 'cash' ? { kind: 'spend', accountId: v.account.account_id } : { kind: 'record', accountId: v.account.account_id })}>
            {v.kind === 'credit' ? 'RECORD PURCHASE' : v.kind === 'cash' ? 'RECORD CASH SPENDING' : 'RECORD TRANSACTION'}
          </Button>
          <Button trigger="d01-history-scan" quiet icon="camera" onClick={() => setSheet({ kind: 'receipt', accountId: v.account.account_id })}>
            SCAN RECEIPT
          </Button>
        </div>
      ) : null}
    </>
  );
  return (
    <Dot01Frame
      screenId="F05.HISTORY"
      env="SK02_FIELD"
      title={title}
      subtitle={all ? 'search and filter' : undefined}
      testId="d01-history"
      label={all ? 'TRANSACTIONS' : 'TRANSACTION HISTORY'}
      chips={
        all
          ? [
              { id: 'd01-search', label: 'SEARCH', icon: 'search', onClick: () => document.getElementById('d01-q')?.focus() },
              { id: 'd01-add', label: 'ADD', icon: 'plus', onClick: () => openOverlay('quick-add') },
            ]
          : [{ id: 'd01-back', label: 'BACK', icon: 'back', onClick: () => back() || go(v ? `money/places/${v.account.account_id}` : 'money') }]
      }
      nav={all}
      contentRect={{ x: 30, y: 600, w: 881, h: all ? 846 : 940 }}
      contentScroll
      content={content}
      overlays={<Dot01Sheets state={sheet} onClose={() => setSheet(null)} />}
    />
  );
}

export { shortDate as dot01ShortDate };
