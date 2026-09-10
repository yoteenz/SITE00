/**
 * P0.VR.8 / P0.VR.8R3 — Pages tab live page mirror (project-scoped routes + captures).
 */

import { useMemo, useState } from 'react';
import { PAGE_MIRROR_FILTERS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { PageMirrorFilter } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import {
  captureRunProgressLabel,
  type ProjectCaptureRunContract,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';
import type { PageVisualVerificationStatus } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';
import { DesignDwSectionIcon } from './DesignDwSectionIcon';
import { DesignPageCompletionPanel } from './DesignPageCompletionPanel.js';
import type { PageExperienceImplementationJob } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { ProjectCaptureRefreshState } from './usePageMirror';

type ProjectPageRegistrySyncState = 'NEVER_SYNCED' | 'SYNC_REQUIRED' | 'SYNCED' | 'RECOVERING';

type Props = {
  rows: PageVisualIndexRow[];
  selectedScreenId: string;
  onSelectScreen: (screenId: string) => void;
  onOpenPage?: (screenId: string) => void;
  onRefreshPage?: (screenId: string) => void;
  onRefreshProject?: () => void;
  onSyncProject?: () => void;
  onViewCaptureRun?: () => void;
  visualStatusByScreenId?: Record<string, PageVisualVerificationStatus>;
  mirrorLoading?: boolean;
  pageCompletionJob?: PageExperienceImplementationJob | null;
  projectSyncState?: ProjectPageRegistrySyncState;
  projectName?: string;
  contextLoading?: boolean;
  captureRefresh?: ProjectCaptureRefreshState;
};

function formatRouteLabel(row: PageVisualIndexRow): string {
  const route = row.route ?? row.normalizedRoute;
  if (route) return route.toUpperCase();
  return `/${row.screenId.replace(/_/g, '-').toUpperCase()}`;
}

function rowMirrorStatus(row: PageVisualIndexRow): PageMirrorFilter | 'ALL' {
  const status = (row.pageCaptureStatus ?? row.captureStatus ?? '').toUpperCase();
  if (status === 'FAILED' || status === 'CAPTURE_FAILED') return 'FAILED';
  if (status === 'NEVER_CAPTURED' || row.neverCaptured) return 'NEVER CAPTURED';
  if (status === 'QUEUED' || status === 'CAPTURE_PENDING') return 'QUEUED';
  if (status === 'CAPTURING') return 'CAPTURING';
  if (status === 'STALE' || (row.isStale && !row.neverCaptured)) return 'STALE';
  if (status === 'CURRENT') return 'CURRENT';
  if (row.missingImplementation) return 'MISSING REF';
  if (row.referenceUrl) return 'REFERENCE READY';
  if (status === 'UNSUPPORTED' || status === 'BLOCKED') return 'BLOCKED';
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

function liveThumbLabel(row: PageVisualIndexRow): string {
  const status = rowMirrorStatus(row);
  if (status === 'NEVER CAPTURED') return 'NEVER CAPTURED';
  if (status === 'QUEUED') return 'CAPTURE QUEUED';
  if (status === 'CAPTURING') return 'CAPTURING…';
  if (status === 'FAILED') return 'CAPTURE FAILED';
  return 'CAPTURE REQUIRED';
}

function formatLastEvent(run: ProjectCaptureRunContract | null): string {
  if (!run?.lastEvent) return '—';
  const route = run.lastEvent.route ?? '—';
  const viewport = run.lastEvent.viewport ?? '—';
  return `${route} · ${viewport.toUpperCase()} · ${run.lastEvent.message}`;
}

function captureRunSummary(run: ProjectCaptureRunContract | null): string {
  if (!run) return '';
  if (!run.contractValid) return 'CAPTURE RUN COULD NOT INITIALIZE';
  return captureRunProgressLabel(run);
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
  projectSyncState = 'SYNCED',
  projectName = 'PROJECT',
  contextLoading = false,
  onSyncProject,
  onViewCaptureRun,
  captureRefresh,
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

  const currentCount = statusCount(rows, 'CURRENT');
  const neverCapturedCount = statusCount(rows, 'NEVER CAPTURED');
  const queuedCount = statusCount(rows, 'QUEUED');
  const capturingCount = statusCount(rows, 'CAPTURING');
  const staleCount = statusCount(rows, 'STALE');
  const failedCount = statusCount(rows, 'FAILED');

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

  const showRecovering = projectSyncState === 'RECOVERING';
  const showUnsynced = projectSyncState === 'NEVER_SYNCED' || projectSyncState === 'SYNC_REQUIRED';
  const unsyncedLabel =
    projectSyncState === 'NEVER_SYNCED' ? 'PROJECT NOT YET SYNCED' : 'SYNC REQUIRED';

  const run = captureRefresh?.run ?? null;
  const isRefreshing = captureRefresh?.refreshing ?? false;
  const runInvalid = run && !run.contractValid;
  const progressDone = run ? run.completedCount + run.failedCount + run.skippedCount : 0;
  const progressTotal = run?.totalTargets ?? 0;
  const refreshButtonLabel = runInvalid
    ? 'RETRY RUN'
    : captureRefresh?.errorCode === 'CAPTURE_WORKER_OFFLINE'
      ? 'VIEW DIAGNOSTICS'
      : isRefreshing
        ? run && run.contractValid && progressTotal > 0
          ? `CAPTURING ${progressDone} / ${progressTotal}`
          : 'REFRESHING PROJECT…'
        : run && run.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status)
          ? 'VIEW CAPTURE RUN'
          : 'REFRESH PROJECT';

  if (contextLoading) {
    return (
      <section className="site00-dw-v3-pages" data-design-tab="pages" data-page-mirror="p0vr8">
        <p className="site00-dw-v3-pages__context-loading">LOADING {projectName} DESIGN CONTEXT…</p>
      </section>
    );
  }

  if (showRecovering && rows.length === 0) {
    return (
      <section
        className="site00-dw-v3-pages"
        data-design-tab="pages"
        data-page-mirror="p0vr8"
        data-sync-state="RECOVERING"
      >
        <article className="site00-dw-v3-pages__unsynced">
          <strong>RECOVERING PAGE INVENTORY</strong>
          <p>
            {projectName} prior route audit found — reconciling historical routes with current repository state.
            Captures and completion may show STALE / REFRESHING until refresh completes.
          </p>
        </article>
      </section>
    );
  }

  if (showUnsynced && rows.length === 0) {
    return (
      <section className="site00-dw-v3-pages" data-design-tab="pages" data-page-mirror="p0vr8" data-sync-state={projectSyncState}>
        <article className="site00-dw-v3-pages__unsynced">
          <strong>{unsyncedLabel}</strong>
          <p>
            {projectName} page inventory has not been reconciled yet. Unknown ≠ zero — sync to discover routes,
            captures, and completion for this project only.
          </p>
          {onSyncProject || onRefreshProject ? (
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary"
              disabled={mirrorLoading}
              onClick={() => (onSyncProject ?? onRefreshProject)?.()}
            >
              SYNC PROJECT PAGES
            </button>
          ) : null}
        </article>
      </section>
    );
  }

  return (
    <section className="site00-dw-v3-pages" data-design-tab="pages" data-page-mirror="p0vr8r3">
      {pageCompletionJob ? <DesignPageCompletionPanel job={pageCompletionJob} compact /> : null}

      <article className="site00-dw-v3-pages__capture-summary" data-capture-summary="project">
        <strong>{rows.length} PAGES</strong>
        <span>CURRENT {currentCount}</span>
        <span>NEVER CAPTURED {neverCapturedCount}</span>
        <span>QUEUED {queuedCount}</span>
        <span>CAPTURING {capturingCount}</span>
        <span>STALE {staleCount}</span>
        <span>FAILED {failedCount}</span>
      </article>

      {run ? (
        <article className="site00-dw-v3-pages__capture-run" data-capture-run={run.runId}>
          <div>
            <strong>PROJECT CAPTURE RUN</strong>
            <p>{captureRunSummary(run)}</p>
            {run.contractValid ? (
              <p className="site00-dw-v3-pages__capture-run-detail">
                Q{run.queuedCount} · C{run.capturingCount} · ✓{run.completedCount} · ✗{run.failedCount} · WORKER{' '}
                {run.workerStatus}
              </p>
            ) : (
              <p className="site00-dw-v3-pages__capture-run-detail">
                RUN_CONTRACT_INVALID · {run.contractError ?? captureRefresh?.contractError ?? 'UNKNOWN'}
              </p>
            )}
            {run.lastEvent ? <p className="site00-dw-v3-pages__capture-run-detail">LAST EVENT · {formatLastEvent(run)}</p> : null}
          </div>
          {onViewCaptureRun ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onViewCaptureRun}>
              VIEW RUN
            </button>
          ) : null}
        </article>
      ) : null}

      {captureRefresh?.error ? (
        <p className="site00-dw-v3-pages__capture-note">
          {captureRefresh.errorCode ?? captureRefresh.error} · {captureRefresh.error}
        </p>
      ) : null}

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
            disabled={mirrorLoading && !isRefreshing}
            onClick={() => {
              if (runInvalid) {
                onRefreshProject?.();
                return;
              }
              if (run && run.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status) && onViewCaptureRun) {
                onViewCaptureRun();
              } else {
                onRefreshProject?.();
              }
            }}
          >
            {refreshButtonLabel}
          </button>
        ) : null}
      </div>

      {captureRefresh?.duplicateBlocked ? (
        <p className="site00-dw-v3-pages__capture-note">Active capture run in progress — showing current progress.</p>
      ) : null}

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
              {featured.isStale && featured.staleReason ? ` · ${featured.staleReason.toUpperCase()}` : ''}
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
                <div className="site00-dw-v3-pages__empty-thumb" data-live-state={liveThumbLabel(featured)}>
                  {liveThumbLabel(featured)}
                </div>
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
                  <div className="site00-dw-v3-pages__empty-thumb">{liveThumbLabel(row)}</div>
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
          {filtered.length} PAGES · CURRENT {currentCount} · LIVE PAGE MIRROR (P0.VR.8R3)
        </span>
      </footer>
    </section>
  );
}
