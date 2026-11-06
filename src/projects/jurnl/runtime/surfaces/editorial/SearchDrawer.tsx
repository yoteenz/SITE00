/**
 * The global quick SEARCH drawer, on the curated OV05 open search composition (OPUS3). Real records only: pockets by name,
 * transactions by merchant / category / note, from the canonical repository. It is not the advanced V9 31 search page,
 * which it links to (ADVANCED SEARCH); both read the same records. Opening, typing and dismissing never write anything.
 */
import { useId, useMemo, useState } from 'react';
import { getRepository } from '../../../data/repository/deviceRepository';
import { formatMoney, useRepoTick } from '../../../data/home/money';
import { useJurnl } from '../../state/store';
import { EdGlyph } from './Editorial';
import { ShellOverlay, ShellSlot } from './Shell';

type Filter = 'ALL' | 'POCKETS' | 'TRANSACTIONS';
type Hit = { key: string; kind: 'pocket' | 'entry'; title: string; sub: string; value: string; route: string; when?: string };

export function searchRecords(query: string, filter: Filter): { hits: Hit[]; recent: boolean } {
  const snap = getRepository().getSnapshot();
  const q = query.trim().toUpperCase();
  const pockets: Hit[] = snap.accounts
    .filter((a) => a.status === 'ACTIVE' && (!q || a.display_name.toUpperCase().includes(q)))
    .map((a) => ({ key: `p-${a.account_id}`, kind: 'pocket' as const, title: a.display_name, sub: 'POCKET', value: formatMoney(a.balance), route: `money/places/${a.account_id}` }));
  const names = new Map(snap.accounts.map((a) => [a.account_id, a.display_name]));
  const entries: Hit[] = [...snap.transactions]
    .filter((t) => !q || [t.merchant, t.category, t.memo ?? ''].some((f) => String(f ?? '').toUpperCase().includes(q)))
    .sort((a, b) => String(b.occurred_on ?? b.when ?? '').localeCompare(String(a.occurred_on ?? a.when ?? '')))
    .map((t) => ({ key: `e-${t.id}`, kind: 'entry' as const, title: t.merchant, sub: `${names.get(t.account_id ?? '') ?? t.account ?? ''} · ${t.occurred_on ?? t.when ?? ''}`, value: `${t.direction === 'INCOME' ? '+' : '−'}${formatMoney(t.amount)}`, route: `money/entries/${t.id}`, when: t.occurred_on ?? t.when }));
  if (!q) return { hits: filter === 'POCKETS' ? pockets : entries.slice(0, 6), recent: filter !== 'POCKETS' };
  const hits = filter === 'POCKETS' ? pockets : filter === 'TRANSACTIONS' ? entries : [...pockets, ...entries];
  return { hits: hits.slice(0, 30), recent: false };
}

/**
 * OV05-SEARCH-OPEN-COMPOSITION regions (the curated OPUS3 composition, 2016 × 3584; fractions of the art): the headline
 * and one open column on the parchment. The art has no painted wells or rows: the field, the filters, the result rows
 * (any height, any count) and the actions are live and flow in the column; only the result list scrolls.
 */
export const OV05_OPEN = {
  head: [0.335, 0.145, 0.905, 0.248],
  /** the authority's open paper (Grok2 mount map: x 0.32-0.90, y 0.27-0.76), clear of the notches on its right edge */
  column: [0.335, 0.258, 0.905, 0.772],
} as const;
const FILTERS: { id: Filter; label: string; icon?: 'pocket' | 'tag' }[] = [
  { id: 'ALL', label: 'ALL' },
  { id: 'POCKETS', label: 'POCKETS', icon: 'pocket' },
  { id: 'TRANSACTIONS', label: 'ACTIVITY', icon: 'tag' },
];

/**
 * 05 SEARCH on the curated open search composition: the arch, sea, velvet and blank ledgers are the art's; everything
 * on the parchment is live. Real records only (searchRecords); opening, typing and dismissing never write anything.
 */
export function GlobalSearchDrawer({ onClose }: { onClose: () => void }) {
  useRepoTick();
  const { go } = useJurnl();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const { hits, recent } = useMemo(() => searchRecords(query, filter), [query, filter]);
  const inputId = useId();
  const open = (route: string) => {
    onClose();
    go(route);
  };
  return (
    <ShellOverlay testId="global-search" composition="search" shell="OV05_OPEN_COMPOSITION" title="SEARCH" script="pockets and activity" head={OV05_OPEN.head} onClose={onClose}>
      <ShellSlot box={OV05_OPEN.column} className="jsx-column">
        <div className="jsx-field">
          <label className="jsx-field__label" htmlFor={inputId}>
            SEARCH
          </label>
          <input id={inputId} className="jsx-field__input" value={query} onChange={(e) => setQuery(e.target.value)} data-jrn-trigger="search-input" autoComplete="off" placeholder="POCKETS, MERCHANTS, CATEGORIES" />
        </div>
        <div className="jsx-filters" role="group" aria-label="FILTER BY">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="jsx-chip" aria-pressed={filter === f.id} data-jrn-trigger={`search-filter-${f.id.toLowerCase()}`} onClick={() => setFilter(f.id)}>
              {f.icon ? <EdGlyph name={f.icon} /> : null}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
        <p className="jsx-count" aria-live="polite">{recent ? 'RECENT ACTIVITY' : `${hits.length} ${hits.length === 1 ? 'RESULT' : 'RESULTS'}`}</p>
        <div className="jsx-results" data-testid="search-results" role="region" aria-label="SEARCH RESULTS" tabIndex={hits.length ? undefined : -1}>
          {hits.length ? (
            <ul aria-label="SEARCH RESULTS">
              {hits.map((h) => (
                <li key={h.key}>
                  <button type="button" className="jsx-row" data-jrn-trigger={`search-hit-${h.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => open(h.route)}>
                    <EdGlyph name={h.kind === 'pocket' ? 'pocket' : 'search'} />
                    <span className="jsx-row__text">
                      <span className="jsx-row__title">{h.title}</span>
                      <small>{h.sub}</small>
                    </span>
                    <b>{h.value}</b>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="jsx-empty" data-testid="search-empty">{query.trim() ? 'NOTHING MATCHES. TRY A POCKET NAME, A MERCHANT OR A CATEGORY.' : 'NO ACTIVITY RECORDED YET.'}</p>
          )}
        </div>
        <div className="jsx-actions">
          <button type="button" className="jsh-pill" data-tone="cream" data-jrn-trigger="search-all-activity" onClick={() => open('activity')}>
            ALL ACTIVITY
          </button>
          <button type="button" className="jsh-pill" data-tone="olive" data-jrn-trigger="search-advanced" onClick={() => open('money/transactions')}>
            ADVANCED SEARCH
          </button>
        </div>
      </ShellSlot>
    </ShellOverlay>
  );
}
