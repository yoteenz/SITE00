/**
 * P0.VR.6 + Reference-Fidelity — Pages tab with coverage filters and visual cards.
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

function statusCount(rows: PageVisualIndexRow[], status: PageStatusFilter): number {
  if (status === 'ALL PAGES') return rows.length;
  return rows.filter((r) => rowStatus(r) === status).length;
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
  const featuredStatus = featured ? rowStatus(featured) : null;

  return (
    <section className="site00-dw-v3-pages" data-design-tab="pages">
      <div className="site00-dw-v3-chip-row site00-dw-v3-chip-row--scroll" role="group" aria-label="Page status filters">
        {PAGE_STATUS_FILTERS.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`site00-dw-v3-chip${filter === chip ? ' is-filled' : ''}`}
            onClick={() => setFilter(chip)}
          >
            {chip} ({statusCount(rows, chip)})
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
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" aria-label="Filter">
          ☰
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact">
          SORT ▾
        </button>
      </div>

      {featured ? (
        <article className="site00-dw-v3-pages__featured">
          <div className="site00-dw-v3-pages__featured-meta">
            <header>
              <strong>/{featured.screenId.replace(/_/g, '-').toUpperCase()}</strong>
              {featuredStatus ? (
                <span className={`site00-dw-v3-pages__status is-${featuredStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                  {featuredStatus}
                </span>
              ) : null}
            </header>
            <p>
              LAST UPDATED — · {featured.displayName.toUpperCase()}. MAIN LANDING EXPERIENCE. HERO, VALUE PROP, AND KEY
              NAVIGATION.
            </p>
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
          </div>
          <div className="site00-dw-v3-pages__compare">
            <div>
              <span>LIVE</span>
              {featured.mobile?.publicUrl ? (
                <img src={featured.mobile.publicUrl} alt="" />
              ) : (
                <div className="site00-dw-v3-pages__empty-thumb" />
              )}
            </div>
            <button type="button" className="site00-dw-v3-pages__compare-swap" aria-label="Compare live and reference">
              ⇄
            </button>
            <div>
              <span>REFERENCE</span>
              <div className="site00-dw-v3-pages__empty-thumb" />
            </div>
          </div>
        </article>
      ) : null}

      <div className="site00-dw-v3-pages__grid">
        {filtered.map((row) => {
          const status = rowStatus(row);
          return (
            <article
              key={row.screenId}
              className={`site00-dw-v3-pages__card${row.screenId === selectedScreenId ? ' is-selected' : ''}`}
            >
              <button type="button" style={{ all: 'unset', cursor: 'pointer', width: '100%' }} onClick={() => onSelectScreen(row.screenId)}>
                {row.mobile?.publicUrl ? (
                  <img src={row.mobile.publicUrl} alt="" />
                ) : (
                  <div className="site00-dw-v3-pages__empty-thumb" />
                )}
                <strong>/{row.screenId.replace(/_/g, '-').toUpperCase()}</strong>
                <span className={`site00-dw-v3-pages__status is-${status.replace(/\s+/g, '-').toLowerCase()}`}>{status}</span>
              </button>
              <div className="site00-dw-v3-pages__card-actions">
                <button type="button" onClick={() => onOpenPage?.(row.screenId)}>
                  OPEN PAGE
                </button>
                <button type="button">{status === 'MISSING REF' ? 'ADD REFERENCE' : 'VIEW REF'}</button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="site00-dw-v3-pages__coverage">
        <span>📄 PAGE COVERAGE {matchedCount} OF {rows.length} PAGES MATCHED</span>
        <div className="site00-dw-v3-pages__coverage-bar">
          <div style={{ width: `${coveragePct}%` }} />
        </div>
        <em>{coveragePct}%</em>
        <button type="button" style={{ border: 'none', background: 'none', fontSize: 8, cursor: 'pointer' }}>
          VIEW ALL →
        </button>
      </div>
    </section>
  );
}
