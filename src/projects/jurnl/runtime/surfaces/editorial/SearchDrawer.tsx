/**
 * Founder board 05 — the global quick SEARCH drawer (an editorial ledger folio). Real records only: pockets by name,
 * transactions by merchant / category / note, from the canonical repository. It is not the advanced V9 31 search page,
 * which it links to (ADVANCED SEARCH); both read the same records. Opening, typing and dismissing never write anything.
 */
import { useMemo, useState } from 'react';
import { getRepository } from '../../../data/repository/deviceRepository';
import { formatMoney, useRepoTick } from '../../../data/home/money';
import { JurnlInput } from '../../components/primitives';
import { useJurnl } from '../../state/store';
import { ART, EdAction, EdArt, EdChoices, EdGlyph, EditorialOverlay, REGION } from './Editorial';

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
    <EditorialOverlay
      testId="global-search"
      composition="search"
      title={['SEARCH']}
      script="pockets and activity"
      onClose={onClose}
      decor={
        <>
          <EdArt art={ART.sk01} region={REGION.arch} className="jed-art--arch" torn={3} />
          <EdArt art={ART.paperStack} className="jed-art--stack" />
        </>
      }
      footer={
        <>
          <EdAction trigger="search-all-activity" material="cream" title="ALL ACTIVITY" onClick={() => open('activity')} />
          <EdAction trigger="search-advanced" material="olive" title="ADVANCED SEARCH" onClick={() => open('money/transactions')} />
        </>
      }
    >
      <div className="jed-sheet">
        <div className="jed-field">
          <JurnlInput label="SEARCH POCKETS, MERCHANTS, CATEGORIES" value={query} onValue={setQuery} trigger="search-input" icon="search" />
        </div>
        <span className="jed-label">FILTER BY</span>
        <EdChoices label="FILTER BY" value={filter} onChange={setFilter} trigger="search-filter" columns={3} options={[{ id: 'ALL', label: 'ALL' }, { id: 'POCKETS', label: 'POCKETS', icon: <EdGlyph name="pocket" /> }, { id: 'TRANSACTIONS', label: 'ACTIVITY', icon: <EdGlyph name="tag" /> }]} />
        <span className="jed-label" aria-live="polite">{recent ? 'RECENT ACTIVITY' : `${hits.length} ${hits.length === 1 ? 'RESULT' : 'RESULTS'}`}</span>
        {hits.length ? (
          <ul className="jed-results" aria-label="SEARCH RESULTS" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {hits.map((h) => (
              <li key={h.key}>
                <button type="button" className="jed-row" data-jrn-trigger={`search-hit-${h.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => open(h.route)}>
                  <span className="jed-row__icon"><EdGlyph name={h.kind === 'pocket' ? 'pocket' : 'search'} /></span>
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
          <p className="jed-note" data-testid="search-empty">{query.trim() ? 'NOTHING MATCHES. TRY A POCKET NAME, A MERCHANT OR A CATEGORY.' : 'NO ACTIVITY RECORDED YET.'}</p>
        )}
      </div>
    </EditorialOverlay>
  );
}
