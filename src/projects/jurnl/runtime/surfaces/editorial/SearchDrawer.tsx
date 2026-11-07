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
import { JurnlMicroArt } from '../../components/JurnlMicroArt';
import type { OverlayArtStem } from '../../global/overlayArt/registry';
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
 * OV05 SEARCH on the regenerated founder shell (581 × 887, named correct 2026-11-06; fractions of the art): the headline
 * and one open column on its paper, right of the arch and the ledgers. The shell has no painted wells or rows: the field,
 * the filters, the result rows (any height, any count) and the actions are live and flow in the column; only the result
 * list scrolls.
 */
export const OV05_OPEN = {
  head: [0.4, 0.14, 0.95, 0.245],
  column: [0.36, 0.25, 0.95, 0.83],
} as const;
/* OPUS5: the OV05 authority's account bank (GROK2) marks POCKETS. ACTIVITY keeps its line tag: the GROK2 category tag
   (B04-TAG) carries a stray fragment of the neighbouring chip at its right edge, so it is held (03_FOUNDER_APPROVAL_AND_BLOCKERS.md) */
const FILTERS: { id: Filter; label: string; art?: OverlayArtStem; glyph?: 'tag' }[] = [
  { id: 'ALL', label: 'ALL' },
  { id: 'POCKETS', label: 'POCKETS', art: 'B03-BANK-SOURCE' },
  { id: 'TRANSACTIONS', label: 'ACTIVITY', glyph: 'tag' },
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
    <ShellOverlay testId="global-search" composition="search" shell="OV05_SEARCH_SHELL" title="SEARCH" script="pockets and activity" head={OV05_OPEN.head} onClose={onClose}>
      <ShellSlot box={OV05_OPEN.column} className="jsx-column">
        <div className="jsx-field">
          <label className="jsx-field__label" htmlFor={inputId}>
            SEARCH
          </label>
          <span className="jsx-field__box">
            <JurnlMicroArt stem="B04-SEARCH" slot="search-input-mark" />
            <input id={inputId} className="jsx-field__input" value={query} onChange={(e) => setQuery(e.target.value)} data-jrn-trigger="search-input" autoComplete="off" placeholder="POCKETS, MERCHANTS, CATEGORIES" />
          </span>
        </div>
        <div className="jsx-filters" role="group" aria-label="FILTER BY">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="jsx-chip" aria-pressed={filter === f.id} data-jrn-trigger={`search-filter-${f.id.toLowerCase()}`} onClick={() => setFilter(f.id)}>
              {f.art ? <JurnlMicroArt stem={f.art} slot={`search-filter-${f.id.toLowerCase()}-mark`} /> : f.glyph ? <EdGlyph name={f.glyph} /> : null}
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
                    {/* the account bank for a pocket, the authority's magnifier for activity */}
                    <JurnlMicroArt stem={h.kind === 'pocket' ? 'B03-BANK-SOURCE' : 'B04-SEARCH'} slot={`search-hit-${h.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-mark`} />
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
