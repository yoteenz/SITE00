/**
 * Founder board 05 — the global quick SEARCH drawer (an editorial ledger folio). Real records only: pockets by name,
 * transactions by merchant / category / note, from the canonical repository. It is not the advanced V9 31 search page,
 * which it links to (ADVANCED SEARCH); both read the same records. Opening, typing and dismissing never write anything.
 */
import { useMemo, useState } from 'react';
import { getRepository } from '../../../data/repository/deviceRepository';
import { formatMoney, useRepoTick } from '../../../data/home/money';
import { useJurnl } from '../../state/store';
import { EdGlyph } from './Editorial';
import { ShellField, ShellOverlay, ShellSlot, slot } from './Shell';

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

/** OV05 regions (fractions of the shell, measured on the installed PNG): the well, three chips, four result rows. */
export const OV05_BOX = {
  head: [0.33, 0.155, 0.93, 0.262],
  input: [0.325, 0.287, 0.935, 0.353],
  chips: [[0.308, 0.378, 0.503, 0.429], [0.515, 0.378, 0.726, 0.429], [0.738, 0.378, 0.953, 0.429]],
  count: [0.335, 0.431, 0.94, 0.457],
  results: [0.332, 0.4585, 0.942, 0.738],
  all: [0.34, 0.748, 0.632, 0.794],
  advanced: [0.645, 0.748, 0.94, 0.794],
} as const;
const FILTERS: { id: Filter; label: string; icon?: 'pocket' | 'tag' }[] = [
  { id: 'ALL', label: 'ALL' },
  { id: 'POCKETS', label: 'POCKETS', icon: 'pocket' },
  { id: 'TRANSACTIONS', label: 'ACTIVITY', icon: 'tag' },
];

/**
 * 05 SEARCH on the founder's OV05 shell: the search well, the three filter chips and the result rows are the shell's own
 * blank wells (the rows snap onto them while the list scrolls — only the list scrolls); the arch, sea, velvet and the
 * blank ledgers are the shell's. ALL ACTIVITY / ADVANCED SEARCH sit on the paper below the rows.
 */
export function GlobalSearchDrawer({ onClose }: { onClose: () => void }) {
  useRepoTick();
  const { go } = useJurnl();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const { hits, recent } = useMemo(() => searchRecords(query, filter), [query, filter]);
  const open = (route: string) => {
    onClose();
    go(route);
  };
  return (
    <ShellOverlay testId="global-search" composition="search" shell="OV05" title="SEARCH" script="pockets and activity" head={OV05_BOX.head} onClose={onClose}>
      <ShellField box={OV05_BOX.input} label="SEARCH" placeholder="POCKETS, MERCHANTS, CATEGORIES" value={query} onValue={setQuery} trigger="search-input" />
      <div role="group" aria-label="FILTER BY">
        {FILTERS.map((f, i) => (
          <button key={f.id} type="button" className="jsh-chip" aria-pressed={filter === f.id} data-jrn-trigger={`search-filter-${f.id.toLowerCase()}`} onClick={() => setFilter(f.id)} style={slot(OV05_BOX.chips[i]!)}>
            {f.icon ? <EdGlyph name={f.icon} /> : null}
            <span>{f.label}</span>
          </button>
        ))}
      </div>
      <ShellSlot box={OV05_BOX.count}>
        <p className="jsh-text" aria-live="polite">{recent ? 'RECENT ACTIVITY' : `${hits.length} ${hits.length === 1 ? 'RESULT' : 'RESULTS'}`}</p>
      </ShellSlot>
      <ShellSlot box={OV05_BOX.results} scroll className="jsh-results">
        {hits.length ? (
          <ul aria-label="SEARCH RESULTS">
            {hits.map((h) => (
              <li key={h.key}>
                <button type="button" className="jsh-row" data-jrn-trigger={`search-hit-${h.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => open(h.route)}>
                  <EdGlyph name={h.kind === 'pocket' ? 'pocket' : 'search'} />
                  <span>
                    {h.title}
                    <small>{h.sub}</small>
                  </span>
                  <b>{h.value}</b>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="jsh-text jsh-results__empty" data-testid="search-empty">{query.trim() ? 'NOTHING MATCHES. TRY A POCKET NAME, A MERCHANT OR A CATEGORY.' : 'NO ACTIVITY RECORDED YET.'}</p>
        )}
      </ShellSlot>
      <button type="button" className="jsh-pill" data-tone="cream" data-jrn-trigger="search-all-activity" onClick={() => open('activity')} style={slot(OV05_BOX.all)}>
        ALL ACTIVITY
      </button>
      <button type="button" className="jsh-pill" data-tone="olive" data-jrn-trigger="search-advanced" onClick={() => open('money/transactions')} style={slot(OV05_BOX.advanced)}>
        ADVANCED SEARCH
      </button>
    </ShellOverlay>
  );
}
