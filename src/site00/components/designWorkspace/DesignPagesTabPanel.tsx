/**
 * P0.VR.6 — Pages tab with coverage filters and visual cards.
 */

import { useMemo, useState } from 'react';
import {
  PAGE_STATUS_FILTERS,
  type PageStatusFilter,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/index.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';

type Props = {
  rows: PageVisualIndexRow[];
  selectedScreenId: string;
  onSelectScreen: (screenId: string) => void;
  onOpenPage?: (screenId: string) => void;
};

function rowStatus(row: PageVisualIndexRow): PageStatusFilter | 'ALL PAGES' {
  const hasRef = [row.mobile, row.tablet, row.desktop].some((s) => s?.publicUrl);
  if (row.missingImplementation) return 'MISSING REF';
  if (hasRef) return 'MATCHED';
  return 'IN PROGRESS';
}

export function DesignPagesTabPanel({ rows, selectedScreenId, onSelectScreen, onOpenPage }: Props) {
  const [filter, setFilter] = useState<PageStatusFilter>('ALL PAGES');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return rows.filter((row) => {
      const status = rowStatus(row);
      if (filter !== 'ALL PAGES' && status !== filter) return false;
      if (!q) return true;
      return `${row.displayName} ${row.screenId} ${row.routeFamily ?? ''}`.toUpperCase().includes(q);
    });
  }, [rows, filter, search]);

  const matchedCount = rows.filter((r) => rowStatus(r) === 'MATCHED').length;
  const coveragePct = rows.length ? Math.round((matchedCount / rows.length) * 100) : 0;

  const featured = filtered.find((r) => r.screenId === selectedScreenId) ?? filtered[0] ?? null;

  return (
    <section className="site00-dw-v3-pages" data-design-tab="pages">
      <div className="site00-dw-v3-chip-row" role="group" aria-label="Page status filters">
        {PAGE_STATUS_FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`site00-dw-v3-chip${filter === chip ? ' is-active' : ''}`}
            onClick={() => setFilter(chip)}
          >
            {chip}
            {chip === 'ALL PAGES' ? ` (${rows.length})` : ''}
          </button>
        ))}
      </div>

      <div className="site00-dw-v3-pages__search-row">
        <label className="site00-dw-v3-search">
          <span className="site00-dw-v3-search__icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="SEARCH PAGES..."
            aria-label="Search pages"
          />
        </label>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline">
          SORT
        </button>
      </div>

      {featured ? (
        <article className="site00-dw-v3-pages__featured">
          <header>
            <strong>/{featured.screenId.replace(/_/g, '-').toUpperCase()}</strong>
            <span className={`site00-dw-v3-pages__status is-${rowStatus(featured).replace(/\s+/g, '-').toLowerCase()}`}>
              {rowStatus(featured)}
            </span>
          </header>
          <p>{featured.displayName.toUpperCase()} · LAST UPDATED —</p>
          <div className="site00-dw-v3-pages__compare">
            <div>
              <span>LIVE</span>
              {featured.mobile?.publicUrl ? (
                <img src={featured.mobile.publicUrl} alt="" />
              ) : (
                <div className="site00-dw-v3-pages__empty-thumb" />
              )}
            </div>
            <div>
              <span>REFERENCE</span>
              <div className="site00-dw-v3-pages__empty-thumb" />
            </div>
          </div>
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary"
            onClick={() => {
              onSelectScreen(featured.screenId);
              onOpenPage?.(featured.screenId);
            }}
          >
            OPEN PAGE →
          </button>
        </article>
      ) : null}

      <div className="site00-dw-v3-pages__grid">
        {filtered.map((row) => (
          <button
            key={row.screenId}
            type="button"
            className={`site00-dw-v3-pages__card${row.screenId === selectedScreenId ? ' is-selected' : ''}`}
            onClick={() => onSelectScreen(row.screenId)}
          >
            {row.mobile?.publicUrl ? (
              <img src={row.mobile.publicUrl} alt="" />
            ) : (
              <div className="site00-dw-v3-pages__empty-thumb" />
            )}
            <strong>/{row.screenId.replace(/_/g, '-').toUpperCase()}</strong>
            <span>{rowStatus(row)}</span>
          </button>
        ))}
      </div>

      <div className="site00-dw-v3-pages__coverage">
        <span>
          {matchedCount} OF {rows.length} PAGES MATCHED
        </span>
        <div className="site00-dw-v3-pages__coverage-bar">
          <div style={{ width: `${coveragePct}%` }} />
        </div>
        <em>{coveragePct}%</em>
      </div>
    </section>
  );
}
