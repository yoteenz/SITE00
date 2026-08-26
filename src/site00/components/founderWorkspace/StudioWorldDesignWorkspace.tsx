/**
 * P0.VR.2B — Design workspace full-screen reference rebuild.
 * SITE 00 host shell — preserves P0.VR.2 + P0.VR.2A functionality.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CANONICAL_VIEWPORT_DIMENSIONS,
  buildDesignScreenMatrix,
  createDraftReferenceFromUpload,
  findDesignScreen,
  formatMatrixCell,
  getActiveCanonicalReference,
  listDesignScreensForProject,
  listDesignWorkspaceProjects,
  promoteReferenceToCanonical,
  proposeReferenceScope,
  resolveDesignScreenRoute,
  startVisualReconstructionRun,
  type DesignViewportClass,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import { registerNdxbookDesignPilot, registerSite00DesignPilot } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import {
  compileSite00DesignRouteManifest,
  resolveDesignProjectAccent,
  getActiveDesignRouteSyncContract,
  buildSite00FounderDesignScreenSet,
  listManifestScreensForProject,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3/client.js';
import {
  evaluateSite00SelfDesignBoundary,
  matchReferenceCanPatchHostAccidentally,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3a/client.js';
import {
  buildReferenceAssetBrief,
  compileReferenceAssetPrompt,
  dispatchAllReadyToGenerate,
  dispatchAssetGeneration,
  ensureNdxPilotAssetSlots,
  extendComposerBriefWithAssetSlots,
  getCompiledPrompt,
  listSlotsForScreen,
  promoteAssetToCanon,
  shellReconstructionBlockedOnAssetGeneration,
  summarizeMissingAssets,
  type ReferenceVisualAssetSlot,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2a/client.js';
import {
  MOBILE_TAB_LABELS,
  buildDesignWorkspaceActivity,
  buildDesignWorkspaceQuickActions,
  buildDesignWorkspaceUrlState,
  computeDesignWorkspaceVisualMatch,
  parseDesignWorkspaceUrlState,
  type DesignWorkspaceTab,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/client.js';
import { Site00DesignWorkspaceShell } from '../designWorkspace/Site00DesignWorkspaceShell';
import { DesignCompareSection } from '../designWorkspace/DesignCompareSection';
import { DesignImplementationPreview } from '../designWorkspace/DesignImplementationPreview';
import { DesignPagesVisualIndex } from '../designWorkspace/DesignPagesVisualIndex';
import { DesignComposerReviewQueue } from '../designWorkspace/DesignComposerReviewQueue';
import { useImplementationSnapshots } from '../designWorkspace/useImplementationSnapshots';
import { listScreensWithSnapshots } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';
import { DesignMissingAssetsSection } from '../designWorkspace/DesignMissingAssetsSection';
import { DesignVisualMatchPanel } from '../designWorkspace/DesignVisualMatchPanel';
import { DesignWorkspaceFooter } from '../designWorkspace/DesignWorkspaceFooter';
import '../../styles/site00-design-workspace-p0vr2b.css';

export type StudioWorldDesignWorkspaceProps = {
  initialProjectId?: string;
  initialScreenId?: string;
  initialViewport?: DesignViewportClass;
};

const TABS: DesignWorkspaceTab[] = ['REFERENCE', 'IMPLEMENTATION', 'COMPARE', 'PAGES', 'REVIEW', 'HISTORY', 'INSPECT'];

const VIEWPORT_OPTIONS: DesignViewportClass[] = ['mobile', 'tablet', 'desktop'];

type Site00ScreenSetMode = 'PRIMARY' | 'ALL_DESIGNABLE';

function mapStatusLabel(projectId: string, screenId: string, viewport: DesignViewportClass): string {
  const row = buildDesignScreenMatrix(projectId).find((r) => r.screenId === screenId);
  if (!row) return 'NOT STARTED';
  const cell =
    viewport === 'mobile' ? row.mobile : viewport === 'tablet' ? row.tablet : viewport === 'desktop' ? row.desktop : row.desktop;
  if (cell.implementationStatus === 'MATCHED') return 'MATCHED';
  if (cell.referenceStatus === 'MISSING') return 'MISSING REFERENCE';
  if (cell.implementationStatus === 'BLOCKED') return 'BLOCKED';
  return 'NEEDS MATCH';
}

export function StudioWorldDesignWorkspace({
  initialProjectId = 'ndxbook',
  initialScreenId = 'campaign-board',
  initialViewport = 'mobile',
}: StudioWorldDesignWorkspaceProps) {
  registerNdxbookDesignPilot();
  registerSite00DesignPilot();

  const designProjects = useMemo(() => listDesignWorkspaceProjects(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = parseDesignWorkspaceUrlState(searchParams.toString());
  const [projectId, setProjectId] = useState(urlState.project ?? initialProjectId);
  const [screenId, setScreenId] = useState(urlState.screen ?? initialScreenId);
  const [viewportClass, setViewportClass] = useState<DesignViewportClass>(urlState.viewport ?? initialViewport);
  const [tab, setTab] = useState<DesignWorkspaceTab>(urlState.tab ?? 'COMPARE');
  const [customRoute, setCustomRoute] = useState('');
  const [scopeOverride, setScopeOverride] = useState<string>('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [assetSlots, setAssetSlots] = useState<ReferenceVisualAssetSlot[]>([]);
  const [selectedPromptSlotId, setSelectedPromptSlotId] = useState<string | null>(null);
  const [site00ScreenSetMode, setSite00ScreenSetMode] = useState<Site00ScreenSetMode>('PRIMARY');
  const [pagesFilter, setPagesFilter] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    getSnapshot,
    coverage: snapshotCoverage,
    capturing: snapshotCapturing,
    batchProgress,
    captureScreen,
    captureProject,
  } = useImplementationSnapshots(projectId);

  const syncUrl = useCallback(
    (patch: Partial<{ project: string; screen: string; viewport: DesignViewportClass; tab: DesignWorkspaceTab }>) => {
      const next = {
        project: patch.project ?? projectId,
        screen: patch.screen ?? screenId,
        viewport: patch.viewport ?? viewportClass,
        tab: patch.tab ?? tab,
      };
      setSearchParams(buildDesignWorkspaceUrlState(next).slice(1), { replace: true });
    },
    [projectId, screenId, tab, viewportClass, setSearchParams],
  );

  const site00SyncContract = useMemo(
    () => (projectId === 'site00' ? getActiveDesignRouteSyncContract() : null),
    [projectId],
  );
  const site00ScreenSet = useMemo(
    () =>
      site00SyncContract
        ? buildSite00FounderDesignScreenSet(site00ScreenSetMode, site00SyncContract)
        : null,
    [site00SyncContract, site00ScreenSetMode],
  );
  const screens = useMemo(() => {
    if (projectId === 'site00' && site00ScreenSet) {
      return listManifestScreensForProject('site00', false, site00ScreenSetMode);
    }
    return listDesignScreensForProject(projectId);
  }, [projectId, site00ScreenSet, site00ScreenSetMode]);
  const matrix = useMemo(() => buildDesignScreenMatrix(projectId), [projectId]);
  const screen = findDesignScreen(projectId, screenId);
  const projectMeta = designProjects.find((p) => p.slug === projectId);
  const projectAccent = resolveDesignProjectAccent(projectId);
  const site00Manifest = useMemo(
    () => (projectId === 'site00' ? compileSite00DesignRouteManifest() : null),
    [projectId],
  );
  const route = customRoute || (screen ? resolveDesignScreenRoute(screen, projectId) : `/projects/${projectId}`);
  const reference = getActiveCanonicalReference(projectId, screenId, viewportClass);
  const implementationSnapshot = getSnapshot(screenId, viewportClass);
  const statusLabel = mapStatusLabel(projectId, screenId, viewportClass);
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[viewportClass];
  const pageIndexRows = useMemo(() => {
    const rows = listScreensWithSnapshots(projectId);
    return rows.map((row) => ({
      screenId: row.screenId,
      displayName: row.displayName,
      routeFamily: row.routeFamily,
      missingImplementation: row.missingImplementation,
      mobile: row.mobile
        ? { publicUrl: getSnapshot(row.screenId, 'mobile')?.publicUrl ?? row.mobile.publicUrl, status: getSnapshot(row.screenId, 'mobile')?.captureStatus ?? row.mobile.captureStatus }
        : getSnapshot(row.screenId, 'mobile')
          ? { publicUrl: getSnapshot(row.screenId, 'mobile')!.publicUrl, status: getSnapshot(row.screenId, 'mobile')!.captureStatus }
          : null,
      tablet: row.tablet
        ? { publicUrl: getSnapshot(row.screenId, 'tablet')?.publicUrl ?? row.tablet.publicUrl, status: getSnapshot(row.screenId, 'tablet')?.captureStatus ?? row.tablet.captureStatus }
        : getSnapshot(row.screenId, 'tablet')
          ? { publicUrl: getSnapshot(row.screenId, 'tablet')!.publicUrl, status: getSnapshot(row.screenId, 'tablet')!.captureStatus }
          : null,
      desktop: row.desktop
        ? { publicUrl: getSnapshot(row.screenId, 'desktop')?.publicUrl ?? row.desktop.publicUrl, status: getSnapshot(row.screenId, 'desktop')?.captureStatus ?? row.desktop.captureStatus }
        : getSnapshot(row.screenId, 'desktop')
          ? { publicUrl: getSnapshot(row.screenId, 'desktop')!.publicUrl, status: getSnapshot(row.screenId, 'desktop')!.captureStatus }
          : null,
    }));
  }, [getSnapshot, projectId]);
  const breadcrumb = `PROJECTS > ${projectMeta?.displayName ?? projectId.toUpperCase()} > DESIGN`;

  const refreshAssetSlots = useCallback(() => {
    if (!reference) {
      setAssetSlots([]);
      return;
    }
    ensureNdxPilotAssetSlots(reference);
    setAssetSlots(listSlotsForScreen(projectId, screenId, viewportClass));
  }, [projectId, reference, screenId, viewportClass]);

  useEffect(() => {
    refreshAssetSlots();
  }, [refreshAssetSlots]);

  const missingSummary = useMemo(() => summarizeMissingAssets(assetSlots), [assetSlots]);
  const assetReadyRatio = assetSlots.length ? missingSummary.ready / assetSlots.length : 0;
  const visualMatch = useMemo(
    () => computeDesignWorkspaceVisualMatch({ projectId, screenId, viewportClass, assetReadyRatio }),
    [assetReadyRatio, projectId, screenId, viewportClass],
  );

  const livePreviewUrl = `${route}?site00MobileLayout=${viewportClass === 'mobile' ? '1' : '0'}&designPreview=1`;
  const referenceUrl = reference?.storagePath ?? uploadPreview;

  const activity = useMemo(
    () =>
      buildDesignWorkspaceActivity({
        projectId,
        screenId,
        screenName: screen?.displayName ?? screenId,
        statusLabel,
        lastRunId,
        assetEvents: assetSlots.filter((s) => s.assetStatus === 'READY').map((s) => `${s.assetRole.replace(/_/g, ' ')} generated`),
      }),
    [assetSlots, lastRunId, projectId, screen?.displayName, screenId, statusLabel],
  );

  const quickActions = useMemo(
    () => buildDesignWorkspaceQuickActions({ projectId, screenId, route }),
    [projectId, route, screenId],
  );

  const handleUpload = useCallback(
    (file: File) => {
      const objectUrl = URL.createObjectURL(file);
      setUploadPreview(objectUrl);
      const img = new Image();
      img.onload = () => {
        const proposed = proposeReferenceScope({
          screenId,
          projectId,
          route,
          viewportClass,
          cropWidth: img.naturalWidth,
          cropHeight: img.naturalHeight,
          iconSheet: screen?.supportsIconMode,
        });
        setScopeOverride(proposed.scope);
        createDraftReferenceFromUpload({
          projectId,
          screenId,
          route,
          viewportClass,
          storagePath: objectUrl,
          createdBy: 'founder-upload',
          cropWidth: img.naturalWidth,
          cropHeight: img.naturalHeight,
          iconSheet: screen?.supportsIconMode,
        });
      };
      img.src = objectUrl;
    },
    [projectId, route, screen?.supportsIconMode, screenId, viewportClass],
  );

  const handleMatchReference = () => {
    const targetPath = screen?.componentName
      ? `src/site00/pages/${screen.componentName}.tsx`
      : `src/site00/pages/${screenId}.tsx`;
    const boundary = evaluateSite00SelfDesignBoundary({
      projectId,
      targetComponentPath: targetPath,
      screenId,
    });
    if (!boundary.allowed || matchReferenceCanPatchHostAccidentally({ projectId, targetComponentPath: targetPath })) {
      setLastRunId('BLOCKED:HOST_BOUNDARY');
      return;
    }
    const result = startVisualReconstructionRun({ projectId, screenId, route, viewportClass });
    setLastRunId(result.run.runId);
    if (reference && !shellReconstructionBlockedOnAssetGeneration()) {
      ensureNdxPilotAssetSlots(reference);
      if (result.brief) {
        extendComposerBriefWithAssetSlots(result.brief, listSlotsForScreen(projectId, screenId, viewportClass));
      }
    }
    refreshAssetSlots();
  };

  const handleGenerateAsset = (slotId: string) => {
    if (!reference) return;
    dispatchAssetGeneration({ reference, slotId });
    setTimeout(refreshAssetSlots, 50);
  };

  const handleGenerateAll = () => {
    if (!reference) return;
    const readyIds = assetSlots.filter((s) => s.generationStatus === 'READY_TO_GENERATE').map((s) => s.slotId);
    dispatchAllReadyToGenerate({ reference, slotIds: readyIds });
    setTimeout(refreshAssetSlots, 50);
  };

  const handleUseAsset = (slotId: string) => {
    promoteAssetToCanon(slotId);
    refreshAssetSlots();
  };

  const handleInspectPrompt = (slotId: string) => {
    setSelectedPromptSlotId(slotId);
    setTab('INSPECT');
    syncUrl({ tab: 'INSPECT' });
  };

  const selectedPrompt =
    selectedPromptSlotId && reference
      ? getCompiledPrompt(assetSlots.find((s) => s.slotId === selectedPromptSlotId)?.promptId ?? '') ??
        compileReferenceAssetPrompt({
          reference,
          slot: assetSlots.find((s) => s.slotId === selectedPromptSlotId)!,
          brief: buildReferenceAssetBrief(assetSlots.find((s) => s.slotId === selectedPromptSlotId)!),
        })
      : null;

  return (
    <Site00DesignWorkspaceShell projectDisplayName={projectMeta?.displayName ?? projectId.toUpperCase()} breadcrumb={breadcrumb}>
      <div
        className="site00-dw-workspace"
        data-visual-reconstruction="p0vr2b-design-workspace"
        data-design-project={projectId}
        data-design-project-accent={projectAccent}
      >
        <section className="site00-dw-controls">
          <div className="site00-dw-controls__row site00-dw-controls__row--primary">
            <label className="site00-dw-field">
              <span>PROJECT</span>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  syncUrl({ project: e.target.value });
                }}
              >
                {designProjects.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="site00-dw-field">
              <span>SCREEN / ROUTE</span>
              <select
                value={screenId}
                onChange={(e) => {
                  setScreenId(e.target.value);
                  syncUrl({ screen: e.target.value });
                }}
              >
                {screens.map((s) => (
                  <option key={s.screenId} value={s.screenId}>
                    {s.displayName}
                  </option>
                ))}
              </select>
            </label>
            {projectId === 'site00' ? (
              <label className="site00-dw-field">
                <span>SCREEN SET</span>
                <select
                  value={site00ScreenSetMode}
                  onChange={(e) => setSite00ScreenSetMode(e.target.value as Site00ScreenSetMode)}
                >
                  <option value="PRIMARY">PRIMARY (WEBSITE / CLIENT)</option>
                  <option value="ALL_DESIGNABLE">ALL DESIGNABLE</option>
                </select>
              </label>
            ) : null}
            <div className="site00-dw-field site00-dw-field--viewport">
              <span>VIEWPORT</span>
              <div className="site00-dw-viewport-toggle">
                {VIEWPORT_OPTIONS.map((vp) => (
                  <button
                    key={vp}
                    type="button"
                    className={viewportClass === vp ? 'is-active' : ''}
                    onClick={() => {
                      setViewportClass(vp);
                      syncUrl({ viewport: vp });
                    }}
                  >
                    {vp.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <label className="site00-dw-field">
              <span>REFERENCE</span>
              <select value={reference?.referenceId ?? ''} disabled>
                <option value={reference?.referenceId ?? ''}>
                  {reference ? `CANONICAL v${reference.version}` : 'MISSING'}
                </option>
              </select>
            </label>
            <div className="site00-dw-field site00-dw-field--status">
              <span>STATUS</span>
              <strong className="site00-dw-status">
                <span className="site00-dw-status__dot" aria-hidden /> {statusLabel}
              </strong>
            </div>
          </div>

          <div className="site00-dw-controls__row site00-dw-controls__row--secondary">
            <label className="site00-dw-field site00-dw-field--route">
              <span>ROUTE</span>
              <input value={route} onChange={(e) => setCustomRoute(e.target.value)} aria-label="Route" />
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <button type="button" className="site00-dw-btn" onClick={() => fileInputRef.current?.click()}>
              UPLOAD REFERENCE
            </button>
            <button type="button" className="site00-dw-btn" onClick={() => reference?.referenceId && promoteReferenceToCanonical(reference.referenceId)} disabled={!uploadPreview && !reference}>
              USE AS CANONICAL
            </button>
            <button type="button" className="site00-dw-btn site00-dw-btn--primary" onClick={handleMatchReference}>
              MATCH REFERENCE
            </button>
            <button
              type="button"
              className="site00-dw-btn"
              disabled={snapshotCapturing}
              onClick={() => void captureScreen(screenId, viewportClass)}
            >
              {snapshotCapturing ? 'CAPTURING…' : 'CAPTURE IMPLEMENTATION'}
            </button>
            <button
              type="button"
              className="site00-dw-btn"
              disabled={snapshotCapturing}
              onClick={() =>
                void captureProject(projectId === 'site00' ? site00ScreenSetMode : 'ALL_DESIGNABLE')
              }
            >
              CAPTURE ALL EXISTING PAGES
            </button>
            {batchProgress ? <span className="site00-dw-batch-progress">{batchProgress}</span> : null}
            <Link to={livePreviewUrl} className="site00-dw-btn site00-dw-btn--link" target="_blank" rel="noreferrer">
              OPEN LIVE ROUTE ↗
            </Link>
          </div>
        </section>

        <nav className="site00-dw-tabs" aria-label="Design workspace views">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`site00-dw-tabs__tab${tab === t ? ' is-active' : ''}`}
              onClick={() => {
                setTab(t);
                syncUrl({ tab: t });
              }}
            >
              <span className="site00-dw-tabs__full">{t}</span>
              <span className="site00-dw-tabs__short">{MOBILE_TAB_LABELS[t]}</span>
            </button>
          ))}
        </nav>

        {tab === 'COMPARE' ? (
          <>
            <DesignImplementationPreview
              snapshot={implementationSnapshot}
              viewportClass={viewportClass}
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              capturing={snapshotCapturing}
              onCapture={() => void captureScreen(screenId, viewportClass)}
            />
            <DesignCompareSection
              referenceUrl={referenceUrl}
              referenceVersion={reference?.version ?? null}
              implementationUrl={
                implementationSnapshot?.captureStatus === 'CURRENT' ? implementationSnapshot.publicUrl : null
              }
              livePreviewUrl={livePreviewUrl}
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              visualMatch={visualMatch}
              onViewDetails={() => {
                setTab('INSPECT');
                syncUrl({ tab: 'INSPECT' });
              }}
            />
            <div className="site00-dw-compare__mobile-score">
              <DesignVisualMatchPanel match={visualMatch} compact onViewDetails={() => setTab('INSPECT')} />
            </div>
          </>
        ) : null}

        {tab === 'REFERENCE' ? (
          <section className="site00-dw-panel">
            <h2>REFERENCE</h2>
            {referenceUrl ? (
              <figure className="site00-dw-panel__figure">
                <img src={referenceUrl} alt="Canonical reference" />
                <figcaption>
                  {reference?.scope ?? scopeOverride} · v{reference?.version ?? '—'}
                </figcaption>
              </figure>
            ) : (
              <p>No canonical reference for this screen/viewport.</p>
            )}
          </section>
        ) : null}

        {tab === 'IMPLEMENTATION' ? (
          <>
            <DesignImplementationPreview
              snapshot={implementationSnapshot}
              viewportClass={viewportClass}
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              capturing={snapshotCapturing}
              onCapture={() => void captureScreen(screenId, viewportClass)}
            />
            <section className="site00-dw-panel site00-dw-panel--impl-live">
              <h2>LIVE ROUTE</h2>
              <iframe title="Live implementation" src={livePreviewUrl} className="site00-dw-panel__iframe" />
              <p>
                Viewport {viewport.width}×{viewport.height} ·{' '}
                <Link to={livePreviewUrl} target="_blank" rel="noreferrer">
                  Open route
                </Link>
              </p>
            </section>
          </>
        ) : null}

        {tab === 'PAGES' ? (
          <DesignPagesVisualIndex
            rows={pageIndexRows}
            selectedScreenId={screenId}
            filter={pagesFilter}
            onFilterChange={setPagesFilter}
            onSelectScreen={(id) => {
              setScreenId(id);
              syncUrl({ screen: id });
            }}
          />
        ) : null}

        {tab === 'REVIEW' ? <DesignComposerReviewQueue /> : null}

        {tab === 'HISTORY' ? (
          <section className="site00-dw-panel site00-dw-panel--history">
            <h2>HISTORY</h2>
            <p>Reference and implementation lineage preserved non-destructively.</p>
            <table className="site00-dw-matrix">
              <thead>
                <tr>
                  <th>SCREEN</th>
                  <th>MOBILE</th>
                  <th>TABLET</th>
                  <th>DESKTOP</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.screenId} className={row.screenId === screenId ? 'is-selected' : ''}>
                    <td>{row.displayName}</td>
                    <td>
                      {formatMatrixCell(row.mobile.referenceStatus)} · {formatMatrixCell(row.mobile.implementationStatus)}
                    </td>
                    <td>
                      {formatMatrixCell(row.tablet.referenceStatus)} · {formatMatrixCell(row.tablet.implementationStatus)}
                    </td>
                    <td>
                      {formatMatrixCell(row.desktop.referenceStatus)} · {formatMatrixCell(row.desktop.implementationStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lastRunId ? <p>Last run: {lastRunId}</p> : null}
          </section>
        ) : null}

        {tab === 'INSPECT' ? (
          <section className="site00-dw-panel site00-dw-panel--inspect">
            <h2>INSPECT</h2>
            <dl className="site00-dw-inspect">
              <div><dt>Route</dt><dd>{route}</dd></div>
              <div><dt>Reference path</dt><dd>{reference?.storagePath ?? '—'}</dd></div>
              <div><dt>Scope</dt><dd>{reference?.scope ?? scopeOverride ?? 'PENDING'}</dd></div>
              <div><dt>Run</dt><dd>{lastRunId ?? '—'}</dd></div>
              <div><dt>Asset slots</dt><dd>{assetSlots.length}</dd></div>
            </dl>
            {selectedPrompt ? <pre className="site00-dw-inspect__prompt">{selectedPrompt.promptText}</pre> : null}
            {snapshotCoverage ? (
              <>
                <h3>IMPLEMENTATION SNAPSHOT COVERAGE</h3>
                <p>
                  Mobile: {snapshotCoverage.mobile.captured} captured · Tablet: {snapshotCoverage.tablet.captured} · Desktop:{' '}
                  {snapshotCoverage.desktop.captured} · Snapshot coverage:{' '}
                  {Math.round(snapshotCoverage.implementationSnapshotCoverage * 100)}%
                </p>
                <p>
                  Reference coverage: {Math.round(snapshotCoverage.referenceCoverage * 100)}% · Match coverage:{' '}
                  {Math.round(snapshotCoverage.matchCoverage * 100)}%
                </p>
              </>
            ) : null}
            {site00SyncContract ? (
              <>
                <h3>SITE 00 WEBSITE / CLIENT DESIGN COVERAGE</h3>
                <p>
                  Primary screens: {site00SyncContract.routeCounts.primaryFounderDesignableCount} · Self-audit routes:{' '}
                  {site00SyncContract.routeCounts.websiteExperienceRouteCount} · Visual states:{' '}
                  {site00SyncContract.routeCounts.visualStateCount} · Missing dependencies:{' '}
                  {site00SyncContract.routeCounts.missingDependencyCount}
                </p>
                <h3>ROUTE FORENSICS (Inspect)</h3>
                <dl className="site00-dw-inspect">
                  <div><dt>Raw implementation routes</dt><dd>{site00SyncContract.routeCounts.rawImplementationRouteCount}</dd></div>
                  <div><dt>Normalized design screens</dt><dd>{site00SyncContract.routeCounts.normalizedDesignScreenCount}</dd></div>
                  <div><dt>Primary SITE 00 experience</dt><dd>{site00SyncContract.routeCounts.primaryFounderDesignableCount}</dd></div>
                  <div><dt>Self-audit experience routes</dt><dd>{site00SyncContract.reconciliationReport.selfAuditRecords}</dd></div>
                  <div><dt>Mapped to v2</dt><dd>{site00SyncContract.reconciliationReport.mappedToV2}</dd></div>
                  <div><dt>Host internal</dt><dd>{site00SyncContract.routeCounts.hostInternalCount}</dd></div>
                  <div><dt>Active manifest</dt><dd>{site00SyncContract.schema} @ {site00SyncContract.version}</dd></div>
                  <div><dt>P0.VR.3A v1 status</dt><dd>{site00SyncContract.historicalAuditArtifact.status}</dd></div>
                </dl>
                {site00ScreenSet ? (
                  <p>Current screen set ({site00ScreenSetMode}): {site00ScreenSet.screenIds.length} screens</p>
                ) : null}
              </>
            ) : null}
            {site00Manifest ? (
              <>
                <h3>SITE 00 V1 HISTORICAL AUDIT</h3>
                <p>
                  Designable pages: {site00Manifest.coverageSummary.totalDesignablePages} · States:{' '}
                  {site00Manifest.coverageSummary.totalImportantStates} · Missing routes:{' '}
                  {site00Manifest.missingRoutes.length}
                </p>
                <p>
                  Needs reference: {site00Manifest.needsReference.length} · Needs better reference:{' '}
                  {site00Manifest.needsBetterReference.length}
                </p>
              </>
            ) : null}
            <p className="site00-dw-inspect__note">Region map · DOM map · patch list · hashes · provider calls · FAL prompt history</p>
          </section>
        ) : null}

        {(tab === 'COMPARE' || tab === 'IMPLEMENTATION') && assetSlots.length > 0 ? (
          <DesignMissingAssetsSection
            slots={assetSlots}
            summary={missingSummary}
            selectedPromptSlotId={selectedPromptSlotId}
            selectedPrompt={selectedPrompt}
            onInspectPrompt={handleInspectPrompt}
            onGenerate={handleGenerateAsset}
            onUseAsset={handleUseAsset}
            onGenerateAll={handleGenerateAll}
          />
        ) : null}

        {tab === 'COMPARE' ? <DesignWorkspaceFooter activity={activity} quickActions={quickActions} /> : null}
      </div>
    </Site00DesignWorkspaceShell>
  );
}
