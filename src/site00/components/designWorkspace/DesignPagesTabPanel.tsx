/**
 * P0.VR.8R3R5 — Pages tab with founder-guided capture workflow.
 */

import { useMemo, useState } from 'react';
import type { PageMirrorFilter } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { PageVisualVerificationStatus } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';
import { DesignDwSectionIcon } from './DesignDwSectionIcon';
import { DesignPageCompletionPanel } from './DesignPageCompletionPanel.js';
import type { PageExperienceImplementationJob } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { ProjectCaptureRefreshState } from './usePageMirror';
import { FounderCaptureExperience } from './founderCapture/FounderCaptureExperience';
import { FounderPageProgressStrip } from './founderCapture/FounderPageProgressStrip';
import {
  founderPageFilterLabels,
  founderPageStatusLabel,
  mapFounderFilterToMirror,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureFounderGuidance.js';

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
  onRetryTransport?: () => void;
  onTestWorker?: () => void;
};

function formatRouteLabel(row: PageVisualIndexRow): string {
  const route = row.route ?? row.normalizedRoute;
  if (route) return route.replace(/^\//, '').split('/').pop()?.toUpperCase() ?? route.toUpperCase();
  return row.displayName?.toUpperCase() ?? row.screenId.replace(/_/g, ' ').toUpperCase();
}

function rowMirrorStatus(row: PageVisualIndexRow): PageMirrorFilter | 'ALL' {
  const resolved = (row.resolvedCaptureState ?? row.pageCaptureStatus ?? '').toUpperCase();
  if (resolved === 'NEVER_CAPTURED' || row.neverCaptured) return 'NEVER CAPTURED';
  if (resolved === 'FAILED' || resolved === 'CAPTURE_FAILED') return 'FAILED';
  if (resolved === 'QUEUED' || resolved === 'CAPTURE_PENDING') return 'QUEUED';
  if (resolved === 'CAPTURING') return 'CAPTURING';
  if (resolved === 'STALE' || (row.isStale && !row.neverCaptured && resolved !== 'NEVER_CAPTURED')) return 'STALE';
  if (resolved === 'CURRENT') return 'CURRENT';
  if (resolved === 'UNSUPPORTED' || resolved === 'BLOCKED') return 'BLOCKED';
  const status = (row.pageCaptureStatus ?? row.captureStatus ?? '').toUpperCase();
  if (status === 'DISCOVERED' && !row.lastCapturedAt) return 'NEVER CAPTURED';
  if (row.missingImplementation) return 'MISSING REF';
  if (row.referenceUrl) return 'REFERENCE READY';
  if (!row.lastCapturedAt && !row.mobile?.publicUrl) return 'NEVER CAPTURED';
  return 'ALL';
}

function statusCount(rows: PageVisualIndexRow[], status: PageMirrorFilter): number {
  if (status === 'ALL') return rows.length;
  return rows.filter((r) => rowMirrorStatus(r) === status).length;
}

function founderFilterCount(rows: PageVisualIndexRow[], filter: string): number {
  if (filter === 'ALL') return rows.length;
  if (filter === 'NOT CAPTURED') return statusCount(rows, 'NEVER CAPTURED');
  if (filter === 'NEEDS REFRESH') return statusCount(rows, 'STALE');
  if (filter === 'NEED REVIEW') return statusCount(rows, 'FAILED');
  if (filter === 'WAITING') return statusCount(rows, 'QUEUED');
  if (filter === 'CAPTURING') return statusCount(rows, 'CAPTURING');
  return statusCount(rows, filter as PageMirrorFilter);
}

export function DesignPagesTabPanel({
  rows,
  selectedScreenId,
  onSelectScreen,
  onOpenPage,
  onRefreshPage,
  onRefreshProject,
  mirrorLoading = false,
  pageCompletionJob = null,
  projectSyncState = 'SYNCED',
  projectName = 'PROJECT',
  contextLoading = false,
  onSyncProject,
  onViewCaptureRun,
  captureRefresh,
  onRetryTransport,
  onTestWorker,
}: Props) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [compareMode, setCompareMode] = useState<'live' | 'reference' | 'compare'>('live');
  const [completionOpen, setCompletionOpen] = useState(false);

  const summary = captureRefresh?.captureSummary;
  const currentCount = summary?.current ?? statusCount(rows, 'CURRENT');
  const neverCapturedCount = summary?.neverCaptured ?? statusCount(rows, 'NEVER CAPTURED');
  const queuedCount = summary?.queued ?? statusCount(rows, 'QUEUED');
  const capturingCount = summary?.capturing ?? statusCount(rows, 'CAPTURING');
  const staleCount = summary?.stale ?? statusCount(rows, 'STALE');
  const failedCount = summary?.failed ?? statusCount(rows, 'FAILED');
  const totalPages = summary?.totalPages ?? rows.length;

  const run = captureRefresh?.run ?? null;
  const isRefreshing = captureRefresh?.refreshing ?? false;
  const transport = captureRefresh?.transportHealth ?? null;
  const runActive =
    isRefreshing || (run?.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status));

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    const mirrorFilter = mapFounderFilterToMirror(filter);
    return rows.filter((row) => {
      const status = rowMirrorStatus(row);
      if (filter !== 'ALL' && status !== mirrorFilter) return false;
      if (!q) return true;
      return `${row.displayName} ${row.screenId} ${row.route ?? ''}`.toUpperCase().includes(q);
    });
  }, [rows, filter, search]);

  const featured = filtered.find((r) => r.screenId === selectedScreenId) ?? filtered[0] ?? rows[0] ?? null;
  const featuredStatus = featured ? founderPageStatusLabel(rowMirrorStatus(featured)) : null;
  const featuredRawStatus = featured ? rowMirrorStatus(featured) : null;
  const hasLiveCapture = Boolean(featured?.mobile?.publicUrl);
  const hasReference = Boolean(featured?.referenceUrl);

  const showRecovering = projectSyncState === 'RECOVERING';
  const showUnsynced = projectSyncState === 'NEVER_SYNCED' || projectSyncState === 'SYNC_REQUIRED';

  const guidanceInput = {
    apiConnected: transport?.apiReachable ?? false,
    workerHealthy: transport?.workerStatus === 'HEALTHY' && Boolean(transport?.playwrightReady && transport?.browserReady),
    browserReady: transport?.browserReady ?? false,
    contractValid: transport?.contractCompatible ?? false,
    testJobPassed: captureRefresh?.testJobPassed ?? transport?.testJobPassed ?? false,
    testingWorker: captureRefresh?.testingWorker ?? false,
    testWorkerFailed: captureRefresh?.testWorkerFailed ?? false,
    isRefreshing,
    run,
    summary: {
      totalPages,
      current: currentCount,
      neverCaptured: neverCapturedCount,
      queued: queuedCount,
      capturing: capturingCount,
      failed: failedCount,
      stale: staleCount,
    },
    projectName,
  };

  const filterLabels = founderPageFilterLabels(Boolean(runActive));
  const isNdxbook = projectName.toLowerCase().includes('ndxbook');

  const handlePrimaryAction = (action: string) => {
    switch (action) {
      case 'CHECK_AGAIN':
        onRetryTransport?.();
        break;
      case 'TEST_WORKER':
      case 'RETRY_TEST':
        onTestWorker?.();
        break;
      case 'REFRESH_PROJECT':
        onRefreshProject?.();
        break;
      case 'VIEW_PROGRESS':
      case 'REVIEW_CAPTURES':
      case 'REVIEW_ISSUES':
        onViewCaptureRun?.();
        break;
      default:
        break;
    }
  };

  if (contextLoading) {
    return (
      <section className="site00-dw-v3-pages" data-design-tab="pages">
        <p className="site00-dw-v3-pages__context-loading">LOADING {projectName}…</p>
      </section>
    );
  }

  if (showRecovering && rows.length === 0) {
    return (
      <section className="site00-dw-v3-pages" data-sync-state="RECOVERING">
        <article className="site00-dw-v3-pages__unsynced">
          <strong>RECOVERING PAGE INVENTORY</strong>
          <p>Reconciling routes with the repository. Captures will update when ready.</p>
        </article>
      </section>
    );
  }

  if (showUnsynced && rows.length === 0) {
    return (
      <section className="site00-dw-v3-pages" data-sync-state={projectSyncState}>
        <article className="site00-dw-v3-pages__unsynced">
          <strong>{projectSyncState === 'NEVER_SYNCED' ? 'SYNC YOUR PAGES' : 'SYNC REQUIRED'}</strong>
          <p>Discover routes and captures for {projectName}.</p>
          {onSyncProject || onRefreshProject ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={mirrorLoading} onClick={() => (onSyncProject ?? onRefreshProject)?.()}>
              SYNC PROJECT PAGES
            </button>
          ) : null}
        </article>
      </section>
    );
  }

  return (
    <section className="site00-dw-v3-pages site00-dw-v3-pages--founder" data-design-tab="pages" data-page-mirror="p0vr8r5">
      {runActive ? (
        <div className="site00-founder-capture__sticky" role="status">
          <span>{projectName.toUpperCase()} CAPTURE</span>
          <strong>
            {run ? run.completedCount + run.failedCount : 0} / {run?.totalTargets ?? totalPages}
          </strong>
          {onViewCaptureRun ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--compact" onClick={onViewCaptureRun}>
              VIEW
            </button>
          ) : null}
        </div>
      ) : null}

      <FounderCaptureExperience
        projectName={projectName}
        guidanceInput={guidanceInput}
        transport={transport}
        run={run}
        testWorkerProgress={captureRefresh?.testWorkerProgress ?? null}
        testingWorker={captureRefresh?.testingWorker ?? false}
        transportChecking={captureRefresh?.transportChecking ?? false}
        onPrimaryAction={handlePrimaryAction}
        onViewDetails={onViewCaptureRun}
        isNdxbook={isNdxbook}
      />

      {runActive ? (
        <FounderPageProgressStrip
          rows={rows}
          selectedScreenId={selectedScreenId}
          onSelect={onSelectScreen}
          resolveStatus={(row) => rowMirrorStatus(row)}
        />
      ) : null}

      {pageCompletionJob ? (
        <details className="site00-founder-capture__completion-collapsed">
          <summary>
            PAGE COMPLETION · {pageCompletionJob.completionGate.passed ? 'ON TRACK' : 'NEEDS ATTENTION'}
          </summary>
          {completionOpen ? <DesignPageCompletionPanel job={pageCompletionJob} compact /> : null}
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={() => setCompletionOpen((v) => !v)}>
            {completionOpen ? 'HIDE COMPLETION' : 'VIEW COMPLETION'}
          </button>
        </details>
      ) : null}

      <div className="site00-dw-v3-chip-row site00-dw-v3-chip-row--scroll" role="group" aria-label="Page filters">
        {filterLabels.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`site00-dw-v3-chip${filter === chip ? ' is-filled' : ''}`}
            onClick={() => setFilter(chip)}
          >
            {chip} ({founderFilterCount(rows, chip)})
          </button>
        ))}
      </div>

      <div className="site00-dw-v3-pages__search-row">
        <label className="site00-dw-v3-search">
          <span className="site00-dw-v3-search__icon" aria-hidden>⌕</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages…" aria-label="Search pages" />
        </label>
      </div>

      {featured ? (
        <article className={`site00-dw-v3-pages__featured site00-founder-page-card${featuredRawStatus === 'CAPTURING' ? ' is-capturing-now' : ''}`}>
          <header className="site00-founder-page-card__head">
            <div>
              <strong>{formatRouteLabel(featured)}</strong>
              {featuredRawStatus === 'CAPTURING' ? <span className="site00-founder-page-card__capturing-badge">CAPTURING NOW</span> : null}
            </div>
            {featuredStatus ? (
              <span className={`site00-dw-v3-pages__status is-${featuredRawStatus?.replace(/\s+/g, '-').toLowerCase()}`}>{featuredStatus}</span>
            ) : null}
          </header>

          <div className="site00-founder-page-card__compare">
            {hasLiveCapture || hasReference ? (
              <>
                <div className="site00-founder-page-card__compare-toggle" role="tablist">
                  {(['live', 'reference', 'compare'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      role="tab"
                      aria-selected={compareMode === mode}
                      className={compareMode === mode ? 'is-active' : ''}
                      disabled={mode !== 'live' && !hasLiveCapture}
                      onClick={() => setCompareMode(mode)}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className={`site00-founder-page-card__frames mode-${compareMode}`}>
                  {(compareMode === 'live' || compareMode === 'compare') && (
                    <div>
                      <span>LIVE</span>
                      {featured.mobile?.publicUrl ? (
                        <img src={featured.mobile.publicUrl} alt="" />
                      ) : (
                        <div className="site00-founder-page-card__empty">
                          <span aria-hidden>▢</span>
                          <small>NO LIVE CAPTURE YET</small>
                        </div>
                      )}
                    </div>
                  )}
                  {(compareMode === 'reference' || compareMode === 'compare') && (
                    <div>
                      <span>REFERENCE</span>
                      {featured.referenceUrl ? <img src={featured.referenceUrl} alt="" /> : <div className="site00-founder-page-card__empty" />}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="site00-founder-page-card__empty site00-founder-page-card__empty--hero">
                <span aria-hidden>▢</span>
                <p>NO LIVE CAPTURE YET</p>
                <small>Capture this page to compare it with the reference.</small>
              </div>
            )}
          </div>

          <div className="site00-founder-page-card__actions">
            {featuredRawStatus === 'FAILED' ? (
              <>
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={mirrorLoading} onClick={() => onRefreshPage?.(featured.screenId)}>
                  RETRY
                </button>
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewCaptureRun}>
                  VIEW DETAILS
                </button>
              </>
            ) : hasLiveCapture && hasReference ? (
              <>
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={() => setCompareMode('compare')}>
                  COMPARE
                </button>
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => onOpenPage?.(featured.screenId)}>
                  OPEN PAGE
                </button>
              </>
            ) : (
              <>
                {onRefreshPage ? (
                  <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" disabled={mirrorLoading} onClick={() => onRefreshPage(featured.screenId)}>
                    CAPTURE PAGE
                  </button>
                ) : null}
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => onOpenPage?.(featured.screenId)}>
                  OPEN PAGE
                </button>
              </>
            )}
          </div>
        </article>
      ) : null}

      <div className="site00-dw-v3-pages__grid site00-founder-page-grid">
        {filtered.map((row) => {
          const raw = rowMirrorStatus(row);
          const label = founderPageStatusLabel(raw);
          return (
            <article
              key={row.screenId}
              className={`site00-dw-v3-pages__card site00-founder-page-grid__card${row.screenId === selectedScreenId ? ' is-selected' : ''}${raw === 'CAPTURING' ? ' is-capturing' : ''}`}
            >
              <button type="button" className="site00-founder-page-grid__hit" onClick={() => onSelectScreen(row.screenId)}>
                {row.mobile?.publicUrl ? (
                  <img src={row.mobile.publicUrl} alt="" />
                ) : (
                  <div className="site00-founder-page-card__empty site00-founder-page-card__empty--thumb">
                    <span aria-hidden>▢</span>
                    <small>NOT CAPTURED YET</small>
                  </div>
                )}
                <strong>{formatRouteLabel(row)}</strong>
                <span className={`site00-dw-v3-pages__status is-${raw.replace(/\s+/g, '-').toLowerCase()}`}>{label}</span>
              </button>
              <div className="site00-dw-v3-pages__card-actions">
                {onRefreshPage && raw !== 'CURRENT' ? (
                  <button type="button" disabled={mirrorLoading} onClick={() => onRefreshPage(row.screenId)}>
                    CAPTURE
                  </button>
                ) : null}
                <button type="button" onClick={() => onOpenPage?.(row.screenId)}>OPEN</button>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="site00-dw-v3-pages__footer">
        <DesignDwSectionIcon iconId="coverage" />
        <span>{filtered.length} pages shown</span>
      </footer>
    </section>
  );
}
