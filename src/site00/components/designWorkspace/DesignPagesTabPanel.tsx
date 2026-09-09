/**
 * P0.VR.8 — Pages tab live page mirror (project-scoped routes + snapshots).
 */

import { useMemo, useState } from 'react';
import { PAGE_MIRROR_FILTERS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { PageMirrorFilter } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { PageVisualVerificationStatus } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';
import { DesignDwSectionIcon } from './DesignDwSectionIcon';
import { DesignPageCompletionPanel } from './DesignPageCompletionPanel.js';
import type { PageExperienceImplementationJob } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';

type Props = {
  rows: PageVisualIndexRow[];
  selectedScreenId: string;
  onSelectScreen: (screenId: string) => void;
  onOpenPage?: (screenId: string) => void;
  onRefreshPage?: (screenId: string) => void;
  onRefreshProject?: () => void;
  visualStatusByScreenId?: Record<string, PageVisualVerificationStatus>;
  mirrorLoading?: boolean;
  pageCompletionJob?: PageExperienceImplementationJob | null;
};

function formatRouteLabel(row: PageVisualIndexRow): string {
  const route = row.route ?? row.normalizedRoute;
  if (route) return route.toUpperCase();
  return `/${row.screenId.replace(/_/g, '-').toUpperCase()}`;
}

function rowMirrorStatus(row: PageVisualIndexRow): PageMirrorFilter | 'ALL' {
  if (row.captureStatus === 'CAPTURE_FAILED' || row.mobile?.status === 'FAILED') return 'CAPTURE FAILED';
  if (row.captureStatus === 'CAPTURING') return 'STALE';
  if (row.isStale) return 'STALE';
  if (row.visualMatchStatus === 'DRIFT') return 'DRIFT';
  if (row.visualMatchStatus === 'VERIFIED' || row.visualMatchStatus === 'HIGH_MATCH') return 'VERIFIED';
  if (row.referenceUrl) return 'REFERENCE READY';
  if (row.missingImplementation || !row.referenceUrl) return 'MISSING REF';
  if (row.mobile?.status === 'CURRENT' && !row.isStale) return 'CURRENT';
  return 'ALL';
}

function statusCount(rows: PageVisualIndexRow[], status: PageMirrorFilter): number {
  if (status === 'ALL') return rows.length;
  return rows.filter((r) => rowMirrorStatus(r) === status).length;
}

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function DesignPagesTabPanel({
  rows,
  selectedScreenId,
  onSelectScreen,
  onOpenPage,
  onRefreshPage,
  onRefreshProject,
  visualStatusByScreenId: _visualStatusByScreenId,
  mirrorLoading = false,
  pageCompletionJob = null,
}: Props) {
  const [filter, setFilter] = useState<PageMirrorFilter>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return rows.filter((row) => {
      const status = rowMirrorStatus(row);
      if (filter !== 'ALL' && status !== filter) return false;
      if (!q) return true;
      return `${row.displayName} ${row.screenId} ${row.route ?? ''} ${row.routeFamily ?? ''}`.toUpperCase().includes(q);
    });
  }, [rows, filter, search]);

  const verifiedCount = rows.filter((r) => {
    const s = rowMirrorStatus(r);
    return s === 'VERIFIED';
  }).length;
  const coveragePct = rows.length ? Math.round((verifiedCount / rows.length) * 100) : 0;

  const featured = filtered.find((r) => r.screenId === selectedScreenId) ?? filtered[0] ?? null;
  const featuredStatus = featured ? rowMirrorStatus(featured) : null;

  const pciInteractions = pageCompletionJob?.completionPlan.interactionContracts.length ?? 0;
  const pciResolved =
    pageCompletionJob?.completionPlan.interactionContracts.filter(
      (c) => c.status === 'IMPLEMENTED' || c.status === 'RESOLVED',
    ).length ?? 0;
  const pciChildren = pageCompletionJob?.childSurfacePlans.length ?? 0;
  const pciChildDone =
    pageCompletionJob?.childSurfacePlans.filter((c) => c.implementationStatus === 'IMPLEMENTED').length ?? 0;

  return (
    <section className="site00-dw-v3-pages" data-design-tab="pages" data-page-mirror="p0vr8">
      {pageCompletionJob ? <DesignPageCompletionPanel job={pageCompletionJob} compact /> : null}
      <div className="site00-dw-v3-chip-row site00-dw-v3-chip-row--scroll" role="group" aria-label="Page mirror filters">
        {PAGE_MIRROR_FILTERS.map((chip) => (
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
        {onRefreshProject ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
            disabled={mirrorLoading}
            onClick={() => onRefreshProject()}
          >
            REFRESH PROJECT
          </button>
        ) : null}
      </div>

      {featured ? (
        <article className="site00-dw-v3-pages__featured">
          <div className="site00-dw-v3-pages__featured-meta">
            <header>
              <strong>{formatRouteLabel(featured)}</strong>
              {featuredStatus ? (
                <span className={`site00-dw-v3-pages__status is-${featuredStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                  {featuredStatus}
                </span>
              ) : null}
            </header>
            <p>
              LAST UPDATED {formatTimestamp(featured.lastUpdatedAt)} · LAST CAPTURED {formatTimestamp(featured.lastCapturedAt)}
              {featured.isStale && featured.staleReason ? ` · STALE: ${featured.staleReason.toUpperCase()}` : ''}
              · {featured.pagePurpose?.toUpperCase() ?? featured.displayName.toUpperCase()}
            </p>
            {pageCompletionJob ? (
              <p className="site00-dw-v3-pages__pci-summary">
                INTERACTIONS {pciResolved}/{pciInteractions} · CHILD SURFACES {pciChildDone}/{pciChildren} ·{' '}
                {pageCompletionJob.implementationStatus.replace(/_/g, ' ')}
              </p>
            ) : null}
            <div className="site00-dw-v3-pages__featured-actions">
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
              {onRefreshPage ? (
                <button
                  type="button"
                  className="site00-dw-v3-btn site00-dw-v3-btn--outline"
                  disabled={mirrorLoading}
                  onClick={() => onRefreshPage(featured.screenId)}
                >
                  REFRESH CAPTURE
                </button>
              ) : null}
            </div>
          </div>
          <div className="site00-dw-v3-pages__compare">
            <div>
              <span>LIVE{featured.isStale ? ' (STALE)' : ''}</span>
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
              {featured.referenceUrl ? (
                <img src={featured.referenceUrl} alt="" />
              ) : (
                <div className="site00-dw-v3-pages__empty-thumb" />
              )}
            </div>
          </div>
        </article>
      ) : null}

      <div className="site00-dw-v3-pages__grid">
        {filtered.map((row) => {
          const status = rowMirrorStatus(row);
          return (
            <article
              key={row.screenId}
              className={`site00-dw-v3-pages__card${row.screenId === selectedScreenId ? ' is-selected' : ''}${row.isStale ? ' is-stale' : ''}`}
            >
              <button type="button" style={{ all: 'unset', cursor: 'pointer', width: '100%' }} onClick={() => onSelectScreen(row.screenId)}>
                {row.mobile?.publicUrl ? (
                  <img src={row.mobile.publicUrl} alt="" />
                ) : (
                  <div className="site00-dw-v3-pages__empty-thumb" />
                )}
                <strong>{formatRouteLabel(row)}</strong>
                <span className={`site00-dw-v3-pages__status is-${status.replace(/\s+/g, '-').toLowerCase()}`}>{status}</span>
              </button>
              <div className="site00-dw-v3-pages__card-actions">
                {onRefreshPage ? (
                  <button type="button" disabled={mirrorLoading} onClick={() => onRefreshPage(row.screenId)}>
                    REFRESH
                  </button>
                ) : null}
                <button type="button" onClick={() => onOpenPage?.(row.screenId)}>
                  OPEN
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="site00-dw-v3-pages__footer">
        <DesignDwSectionIcon iconId="coverage" />
        <span>
          {filtered.length} PAGES · {coveragePct}% VERIFIED · LIVE PAGE MIRROR (P0.VR.8)
        </span>
      </footer>
    </section>
  );
}
