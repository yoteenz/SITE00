/**
 * P0.VR.8R3R5R1 — Pages tab wizard (one screen at a time).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PageMirrorFilter } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { PageVisualVerificationStatus } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import type { PageVisualIndexRow } from './DesignPagesVisualIndex';
import { DesignPageCompletionPanel } from './DesignPageCompletionPanel.js';
import type { PageExperienceImplementationJob } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import type { ProjectCaptureRefreshState } from './usePageMirror';
import { FounderPageProgressStrip } from './founderCapture/FounderPageProgressStrip';
import { PageFamilyWorkspace } from './pageFamily/PageFamilyWorkspace';
import { DesignTaskWizardShell } from './wizard/DesignTaskWizardShell';
import '../../styles/site00-design-page-family.css';
import {
  buildCaptureFounderGuidance,
  founderPageFilterLabels,
  founderPageStatusLabel,
  mapFounderFilterToMirror,
  TEST_WORKER_PROGRESS_STEPS,
  testWorkerStepLabel,
  type TestWorkerProgressStep,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureFounderGuidance.js';
import {
  normalizePagesWizardStep,
  pagesWizardStepTitle,
  resolvePagesWizardResumeStep,
  type PagesWizardStep,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';
import {
  captureSubflowReturnStep,
  DEFAULT_PAGES_WIZARD_STEP,
  shouldAutoAdvanceCaptureRunning,
} from '../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pagesWorkspaceController.js';
import type { DesignViewportClass } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type { CaptureServiceInput } from '../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';

type ProjectPageRegistrySyncState = 'NEVER_SYNCED' | 'SYNC_REQUIRED' | 'SYNCED' | 'RECOVERING';

export type DesignPagesWizardProps = {
  projectId: string;
  rows: PageVisualIndexRow[];
  selectedScreenId: string;
  onSelectScreen: (screenId: string) => void;
  onOpenPage?: (screenId: string) => void;
  onRefreshPage?: (screenId: string) => void;
  onCaptureNow?: (screenId: string, viewport: DesignViewportClass) => void;
  viewport?: DesignViewportClass;
  capturingPageId?: string | null;
  captureNowProgress?: string | null;
  captureNowError?: string | null;
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
  pagesStep?: string;
  pageId?: string;
  onPagesStepChange?: (step: PagesWizardStep, pageId?: string) => void;
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

function TestWorkerVisual({
  currentStep,
  failed,
}: {
  currentStep: TestWorkerProgressStep | null;
  failed: boolean;
}) {
  const steps = TEST_WORKER_PROGRESS_STEPS;
  const activeIdx = currentStep ? steps.indexOf(currentStep as (typeof steps)[number]) : failed ? -1 : 0;
  const activeStep = currentStep && steps.includes(currentStep as (typeof steps)[number]) ? currentStep : steps[Math.max(activeIdx, 0)];

  return (
    <div className="site00-dw-wizard__test-flow" aria-label="Test worker progress">
      <p className="site00-dw-wizard__test-active">{testWorkerStepLabel(activeStep as TestWorkerProgressStep)}</p>
      <ol className="site00-dw-wizard__test-steps">
        {steps.map((step, idx) => {
          const done = currentStep === 'COMPLETE' || idx < activeIdx;
          const active = step === activeStep && currentStep !== 'COMPLETE';
          return (
            <li key={step} className={`${done ? 'is-done' : ''}${active ? ' is-active' : ''}${failed && idx === activeIdx ? ' is-failed' : ''}`}>
              <span aria-hidden>{done ? '✓' : active ? '◉' : '○'}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TransportDetails({
  transport,
  run,
}: {
  transport: ProjectCaptureRefreshState['transportHealth'];
  run: ProjectCaptureRefreshState['run'];
}) {
  if (!transport) return <p>No transport details available.</p>;
  return (
    <dl className="site00-dw-wizard__details-grid">
      <div><dt>API</dt><dd>{transport.apiReachable ? 'CONNECTED' : 'OFFLINE'}</dd></div>
      <div><dt>WORKER</dt><dd>{transport.workerStatus}</dd></div>
      <div><dt>BROWSER</dt><dd>{transport.browserReady ? 'READY' : 'NOT READY'}</dd></div>
      <div><dt>CONTRACT</dt><dd>{transport.contractVersion ?? '—'}</dd></div>
      {transport.lastError ? <div><dt>ERROR</dt><dd className="mono">{transport.lastError}</dd></div> : null}
      {run?.lastEvent ? <div><dt>LAST EVENT</dt><dd>{run.lastEvent.message}</dd></div> : null}
    </dl>
  );
}

export function DesignPagesWizard(props: DesignPagesWizardProps) {
  const {
    projectId,
    rows,
    selectedScreenId,
    onSelectScreen,
    onOpenPage,
    onRefreshPage,
    onCaptureNow,
    viewport = 'mobile',
    capturingPageId,
    captureNowProgress,
    captureNowError,
    onRefreshProject,
    mirrorLoading = false,
    pageCompletionJob = null,
    projectSyncState = 'SYNCED',
    projectName = 'PROJECT',
    contextLoading = false,
    onSyncProject,
    captureRefresh,
    onRetryTransport,
    onTestWorker,
    pagesStep: pagesStepProp,
    pageId: pageIdProp,
    onPagesStepChange,
  } = props;

  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [compareMode, setCompareMode] = useState<'live' | 'reference' | 'compare'>('live');
  const [localStep, setLocalStep] = useState<PagesWizardStep>(DEFAULT_PAGES_WIZARD_STEP);
  const prevTestPassedRef = useRef(false);

  const summary = captureRefresh?.captureSummary;
  const currentCount = summary?.current ?? statusCount(rows, 'CURRENT');
  const neverCapturedCount = summary?.neverCaptured ?? statusCount(rows, 'NEVER CAPTURED');
  const failedCount = summary?.failed ?? statusCount(rows, 'FAILED');
  const totalPages = summary?.totalPages ?? rows.length;
  const run = captureRefresh?.run ?? null;
  const isRefreshing = captureRefresh?.refreshing ?? false;
  const transport = captureRefresh?.transportHealth ?? null;
  const runActive = Boolean(
    isRefreshing || (run?.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status)),
  );

  const guidanceInput = useMemo(
    () => ({
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
        queued: summary?.queued ?? statusCount(rows, 'QUEUED'),
        capturing: summary?.capturing ?? statusCount(rows, 'CAPTURING'),
        failed: failedCount,
        stale: summary?.stale ?? statusCount(rows, 'STALE'),
      },
      projectName,
    }),
    [transport, captureRefresh, isRefreshing, run, totalPages, currentCount, neverCapturedCount, failedCount, rows, summary, projectName],
  );

  const guidance = useMemo(() => buildCaptureFounderGuidance(guidanceInput), [guidanceInput]);

  const resumeStep = useMemo(
    () =>
      resolvePagesWizardResumeStep(pagesStepProp, {
        ...guidanceInput,
        testWorkerJustPassed: guidanceInput.testJobPassed && !prevTestPassedRef.current,
      }),
    [pagesStepProp, guidanceInput],
  );

  const activeStep = pagesStepProp ? normalizePagesWizardStep(pagesStepProp) : localStep;

  useEffect(() => {
    if (pagesStepProp) setLocalStep(normalizePagesWizardStep(pagesStepProp));
    else setLocalStep(resumeStep);
  }, [pagesStepProp, resumeStep]);

  const goTo = useCallback(
    (step: PagesWizardStep, pageId?: string) => {
      setLocalStep(step);
      onPagesStepChange?.(step, pageId);
    },
    [onPagesStepChange],
  );

  useEffect(() => {
    if (guidanceInput.testJobPassed && !prevTestPassedRef.current && activeStep === 'test-worker') {
      goTo('test-worker-ready');
    }
    prevTestPassedRef.current = guidanceInput.testJobPassed;
  }, [guidanceInput.testJobPassed, activeStep, goTo]);

  const captureServiceInput = useMemo<CaptureServiceInput>(
    () => ({
      apiConnected: transport?.apiReachable ?? false,
      workerHealthy: transport?.workerStatus === 'HEALTHY' && Boolean(transport?.playwrightReady && transport?.browserReady),
      browserReady: transport?.browserReady ?? false,
      contractValid: transport?.contractCompatible ?? false,
    }),
    [transport],
  );

  useEffect(() => {
    if (shouldAutoAdvanceCaptureRunning(activeStep, runActive)) {
      goTo('capture-running');
    }
    if (
      !runActive &&
      run?.contractValid &&
      ['COMPLETE', 'PARTIAL', 'FAILED'].includes(run.status) &&
      activeStep === 'capture-running'
    ) {
      goTo('capture-results');
    }
  }, [runActive, run, activeStep, goTo]);

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

  const detailPageId = pageIdProp ?? selectedScreenId;
  const detailRow = rows.find((r) => r.screenId === detailPageId) ?? rows[0] ?? null;
  const filterLabels = founderPageFilterLabels(Boolean(runActive));
  const progressDone = run ? run.completedCount + run.failedCount : 0;
  const progressTotal = run?.totalTargets ?? totalPages;
  const progressPct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;
  const pageCompletionPct = useMemo(() => {
    if (!pageCompletionJob?.completionPlan.interactionContracts.length) return null;
    const resolved = pageCompletionJob.completionPlan.interactionContracts.filter(
      (c) => c.status === 'IMPLEMENTED' || c.status === 'RESOLVED',
    ).length;
    return Math.round((resolved / pageCompletionJob.completionPlan.interactionContracts.length) * 100);
  }, [pageCompletionJob]);

  const pageCompletionAttention = pageCompletionJob?.completionPlan.interactionContracts.filter(
    (c) => c.status === 'AMBIGUOUS' || c.status === 'BLOCKED',
  ).length;

  if (contextLoading) {
    return (
      <section className="site00-dw-v3-pages site00-dw-wizard-host" data-design-tab="pages">
        <p className="site00-dw-v3-pages__context-loading">LOADING {projectName}…</p>
      </section>
    );
  }

  if ((projectSyncState === 'NEVER_SYNCED' || projectSyncState === 'SYNC_REQUIRED') && rows.length === 0) {
    return (
      <DesignTaskWizardShell
        stepTitle="SYNC PAGES"
        headline="SYNC YOUR PAGES"
        support={`Discover routes and captures for ${projectName}.`}
        visualState="attention"
        primaryAction={{
          label: 'SYNC PROJECT PAGES',
          onClick: () => (onSyncProject ?? onRefreshProject)?.(),
          disabled: mirrorLoading,
        }}
        transitionKey="sync"
      />
    );
  }

  if (projectSyncState === 'RECOVERING' && rows.length === 0) {
    return (
      <DesignTaskWizardShell
        stepTitle="RECOVERING"
        headline="RECOVERING PAGE INVENTORY"
        support="Reconciling routes with the repository."
        visualState="progress"
        transitionKey="recovering"
      />
    );
  }

  const stepTotal = 4;

  switch (activeStep) {
    case 'family':
      return (
        <PageFamilyWorkspace
          projectId={projectId}
          projectName={projectName}
          rows={rows}
          viewport={viewport}
          onSelectScreen={onSelectScreen}
          onOpenPage={onOpenPage}
          onOpenLibrary={() => goTo('library')}
          onOpenCaptureService={() => goTo('service-check')}
          onCaptureNow={onCaptureNow}
          capturingPageId={capturingPageId}
          captureNowProgress={captureNowProgress}
          captureNowError={captureNowError}
          captureService={captureServiceInput}
          pageCompletionPct={pageCompletionPct}
          pageCompletionAttention={pageCompletionAttention ?? 0}
        />
      );

    case 'landing':
      return (
        <PageFamilyWorkspace
          projectId={projectId}
          projectName={projectName}
          rows={rows}
          viewport={viewport}
          onSelectScreen={onSelectScreen}
          onOpenPage={onOpenPage}
          onOpenLibrary={() => goTo('library')}
          onOpenCaptureService={() => goTo('service-check')}
          onCaptureNow={onCaptureNow}
          capturingPageId={capturingPageId}
          captureNowProgress={captureNowProgress}
          captureNowError={captureNowError}
          captureService={captureServiceInput}
          pageCompletionPct={pageCompletionPct}
          pageCompletionAttention={pageCompletionAttention ?? 0}
        />
      );

    case 'service-check':
      return (
        <DesignTaskWizardShell
          stepCurrent={1}
          stepTotal={stepTotal}
          stepTitle={pagesWizardStepTitle('service-check')}
          headline="CAPTURE SYSTEM"
          support={guidance.supportingText}
          statusLabel={guidance.serviceReady ? 'READY' : 'NEEDS ATTENTION'}
          visualState={guidance.visualState}
          primaryAction={{
            label: guidance.serviceReady ? 'CONTINUE' : 'CHECK CONNECTION',
            onClick: () => (guidance.serviceReady ? goTo('test-worker') : onRetryTransport?.()),
            disabled: captureRefresh?.transportChecking,
          }}
          detailsContent={<TransportDetails transport={transport} run={run} />}
          onBack={() => goTo(captureSubflowReturnStep())}
          transitionKey="service-check"
          className="site00-dw-wizard-host"
        />
      );

    case 'test-worker':
      return (
        <DesignTaskWizardShell
          stepCurrent={2}
          stepTotal={stepTotal}
          stepTitle={pagesWizardStepTitle('test-worker')}
          headline={guidance.headline}
          support={guidance.supportingText}
          visualState={guidance.visualState}
          visual={
            <TestWorkerVisual
              currentStep={captureRefresh?.testWorkerProgress ?? null}
              failed={guidanceInput.testWorkerFailed}
            />
          }
          primaryAction={
            guidance.primaryAction
              ? {
                  label: captureRefresh?.testingWorker ? 'TESTING…' : guidance.primaryLabel,
                  onClick: () => {
                    if (guidance.primaryAction === 'TEST_WORKER' || guidance.primaryAction === 'RETRY_TEST') {
                      onTestWorker?.();
                    } else if (guidance.primaryAction === 'CHECK_AGAIN') {
                      onRetryTransport?.();
                    }
                  },
                  disabled: captureRefresh?.testingWorker || captureRefresh?.transportChecking,
                }
              : null
          }
          secondaryAction={{
            label: guidanceInput.testWorkerFailed ? 'BACK TO PAGE FAMILY' : (guidance.secondaryLabel ?? 'BACK TO PAGE FAMILY'),
            onClick: () => goTo(captureSubflowReturnStep()),
          }}
          detailsContent={<TransportDetails transport={transport} run={run} />}
          onBack={() => goTo(captureSubflowReturnStep())}
          transitionKey="test-worker"
          className="site00-dw-wizard-host"
        />
      );

    case 'test-worker-ready':
      return (
        <DesignTaskWizardShell
          stepCurrent={2}
          stepTotal={stepTotal}
          stepTitle={pagesWizardStepTitle('test-worker-ready')}
          headline="WORKER READY ✓"
          support="Test capture completed successfully."
          statusLabel="TEST CAPTURE COMPLETE"
          visualState="success"
          primaryAction={{
            label: 'CONTINUE TO PROJECT CAPTURE',
            onClick: () => goTo('capture-setup'),
          }}
          secondaryAction={{
            label: 'VIEW TEST IMAGE',
            onClick: () => undefined,
          }}
          onBack={() => goTo('test-worker')}
          transitionKey="test-worker-ready"
          className="site00-dw-wizard-host"
        />
      );

    case 'capture-setup':
      return (
        <DesignTaskWizardShell
          stepCurrent={3}
          stepTotal={stepTotal}
          stepTitle={pagesWizardStepTitle('capture-setup')}
          headline={`ADVANCED · CAPTURE MULTIPLE PAGES`}
          support={`Optional batch audit · ${totalPages} pages · Normal workflow uses CAPTURE NOW per page`}
          visualState="ready"
          primaryAction={{
            label: 'CAPTURE MULTIPLE PAGES',
            onClick: () => {
              onRefreshProject?.();
              goTo('capture-running');
            },
            disabled: mirrorLoading,
          }}
          secondaryAction={{
            label: 'BACK TO PAGE FAMILY',
            onClick: () => goTo('family'),
          }}
          onBack={() => goTo('test-worker-ready')}
          transitionKey="capture-setup"
          className="site00-dw-wizard-host"
        />
      );

    case 'capture-running':
      return (
        <DesignTaskWizardShell
          stepCurrent={3}
          stepTotal={stepTotal}
          stepTitle={pagesWizardStepTitle('capture-running')}
          headline={`REFRESHING ${projectName.toUpperCase()}`}
          support={`${progressDone} / ${progressTotal}`}
          statusLabel="CAPTURING"
          visualState="progress"
          visual={
            <div className="site00-dw-wizard__capture-progress">
              <div className="site00-dw-wizard__capture-bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${progressPct}%` }} />
              </div>
              <strong>{progressPct}%</strong>
            </div>
          }
          primaryAction={{
            label: 'VIEW CURRENT PAGE',
            onClick: () => {
              const capturing = rows.find((r) => rowMirrorStatus(r) === 'CAPTURING') ?? detailRow;
              if (capturing) goTo('detail', capturing.screenId);
            },
          }}
          secondaryAction={{
            label: 'RUN IN BACKGROUND',
            onClick: () => goTo('family'),
          }}
          onBack={() => goTo('capture-setup')}
          transitionKey="capture-running"
          className="site00-dw-wizard-host"
        >
          <FounderPageProgressStrip
            rows={rows}
            selectedScreenId={selectedScreenId}
            onSelect={onSelectScreen}
            resolveStatus={(row) => rowMirrorStatus(row)}
          />
        </DesignTaskWizardShell>
      );

    case 'capture-results':
      return (
        <DesignTaskWizardShell
          stepCurrent={4}
          stepTotal={stepTotal}
          stepTitle={pagesWizardStepTitle('capture-results')}
          headline="CAPTURE COMPLETE"
          support={`${currentCount} current · ${failedCount} need review`}
          visualState={failedCount > 0 ? 'partial' : 'success'}
          primaryAction={{
            label: failedCount > 0 ? `REVIEW ${failedCount} ISSUE${failedCount === 1 ? '' : 'S'}` : 'VIEW ALL PAGES',
            onClick: () => goTo(failedCount > 0 ? 'library' : 'library'),
          }}
          secondaryAction={{
            label: 'VIEW ALL PAGES',
            onClick: () => goTo('library'),
          }}
          onBack={() => goTo('family')}
          transitionKey="capture-results"
          className="site00-dw-wizard-host"
        />
      );

    case 'library':
      return (
        <section className="site00-dw-wizard-host site00-dw-wizard-library" data-design-tab="pages">
          <header className="site00-dw-wizard-library__head">
            <button type="button" className="site00-dw-wizard__back" onClick={() => goTo('family')}>
              ← BACK TO FAMILY
            </button>
            <h2>PAGE LIBRARY</h2>
          </header>
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
          <div className="site00-dw-v3-pages__grid site00-founder-page-grid">
            {filtered.map((row) => {
              const raw = rowMirrorStatus(row);
              const label = founderPageStatusLabel(raw);
              return (
                <article key={row.screenId} className="site00-dw-v3-pages__card site00-founder-page-grid__card">
                  <button
                    type="button"
                    className="site00-founder-page-grid__hit"
                    onClick={() => {
                      onSelectScreen(row.screenId);
                      goTo('detail', row.screenId);
                    }}
                  >
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
                </article>
              );
            })}
          </div>
        </section>
      );

    case 'detail':
    case 'compare': {
      const featured = detailRow;
      if (!featured) {
        goTo('library');
        return null;
      }
      const featuredRawStatus = rowMirrorStatus(featured);
      const hasLiveCapture = Boolean(featured.mobile?.publicUrl);
      const hasReference = Boolean(featured.referenceUrl);
      const mode = activeStep === 'compare' ? 'compare' : compareMode;

      return (
        <DesignTaskWizardShell
          stepTitle={pagesWizardStepTitle(activeStep)}
          headline={formatRouteLabel(featured)}
          statusLabel={founderPageStatusLabel(featuredRawStatus)}
          visualState={featuredRawStatus === 'FAILED' ? 'attention' : 'ready'}
          visual={
            <div className="site00-founder-page-card__compare site00-dw-wizard__page-preview">
              <div className="site00-founder-page-card__compare-toggle" role="tablist">
                {(['live', 'reference', 'compare'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    className={mode === m ? 'is-active' : ''}
                    disabled={m !== 'live' && !hasLiveCapture}
                    onClick={() => {
                      setCompareMode(m);
                      if (m === 'compare') goTo('compare', featured.screenId);
                      else if (activeStep === 'compare') goTo('detail', featured.screenId);
                    }}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className={`site00-founder-page-card__frames mode-${mode}`}>
                {(mode === 'live' || mode === 'compare') && (
                  <div>
                    {featured.mobile?.publicUrl ? <img src={featured.mobile.publicUrl} alt="" /> : <div className="site00-founder-page-card__empty" />}
                  </div>
                )}
                {(mode === 'reference' || mode === 'compare') && (
                  <div>
                    {featured.referenceUrl ? <img src={featured.referenceUrl} alt="" /> : <div className="site00-founder-page-card__empty" />}
                  </div>
                )}
              </div>
            </div>
          }
          primaryAction={{
            label: mode === 'compare' || (hasLiveCapture && hasReference) ? 'COMPARE SCREEN' : 'CAPTURE PAGE',
            onClick: () => {
              if (hasLiveCapture && hasReference) goTo('compare', featured.screenId);
              else onRefreshPage?.(featured.screenId);
            },
            disabled: mirrorLoading,
          }}
          secondaryAction={{
            label: 'OPEN PAGE',
            onClick: () => onOpenPage?.(featured.screenId),
          }}
          detailsContent={
            pageCompletionJob ? <DesignPageCompletionPanel job={pageCompletionJob} compact /> : undefined
          }
          onBack={() => goTo('library')}
          transitionKey={`${activeStep}-${featured.screenId}`}
          className="site00-dw-wizard-host"
        />
      );
    }

    default:
      return null;
  }
}
