/**
 * P0.VR.2B — Design workspace full-screen reference rebuild.
 * SITE 00 host shell — preserves P0.VR.2 + P0.VR.2A functionality.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CANONICAL_VIEWPORT_DIMENSIONS,
  DESIGN_WORKSPACE_PROJECTS,
  buildDesignScreenMatrix,
  createDraftReferenceFromUpload,
  findDesignScreen,
  formatMatrixCell,
  getActiveCanonicalReference,
  listDesignScreensForProject,
  promoteReferenceToCanonical,
  proposeReferenceScope,
  resolveDesignScreenRoute,
  startVisualReconstructionRun,
  type DesignViewportClass,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import { registerNdxbookDesignPilot } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
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
import { DesignMissingAssetsSection } from '../designWorkspace/DesignMissingAssetsSection';
import { DesignVisualMatchPanel } from '../designWorkspace/DesignVisualMatchPanel';
import { DesignWorkspaceFooter } from '../designWorkspace/DesignWorkspaceFooter';
import '../../styles/site00-design-workspace-p0vr2b.css';

export type StudioWorldDesignWorkspaceProps = {
  initialProjectId?: string;
  initialScreenId?: string;
  initialViewport?: DesignViewportClass;
};

const TABS: DesignWorkspaceTab[] = ['REFERENCE', 'IMPLEMENTATION', 'COMPARE', 'HISTORY', 'INSPECT'];

function mapStatusLabel(projectId: string, screenId: string, viewport: DesignViewportClass): string {
  const row = buildDesignScreenMatrix(projectId).find((r) => r.screenId === screenId);
  if (!row) return 'NOT STARTED';
  const cell = viewport === 'mobile' ? row.mobile : row.desktop;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const screens = useMemo(() => listDesignScreensForProject(projectId), [projectId]);
  const matrix = useMemo(() => buildDesignScreenMatrix(projectId), [projectId]);
  const screen = findDesignScreen(projectId, screenId);
  const projectMeta = DESIGN_WORKSPACE_PROJECTS.find((p) => p.slug === projectId);
  const route = customRoute || (screen ? resolveDesignScreenRoute(screen, projectId) : `/projects/${projectId}`);
  const reference = getActiveCanonicalReference(projectId, screenId, viewportClass);
  const statusLabel = mapStatusLabel(projectId, screenId, viewportClass);
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[viewportClass];
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
      <div className="site00-dw-workspace" data-visual-reconstruction="p0vr2b-design-workspace">
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
                {DESIGN_WORKSPACE_PROJECTS.map((p) => (
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
            <div className="site00-dw-field site00-dw-field--viewport">
              <span>VIEWPORT</span>
              <div className="site00-dw-viewport-toggle">
                {(['mobile', 'desktop'] as const).map((vp) => (
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
            <DesignCompareSection
              referenceUrl={referenceUrl}
              referenceVersion={reference?.version ?? null}
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
          <section className="site00-dw-panel">
            <h2>IMPLEMENTATION</h2>
            <iframe title="Live implementation" src={livePreviewUrl} className="site00-dw-panel__iframe" />
            <p>
              Viewport {viewport.width}×{viewport.height} ·{' '}
              <Link to={livePreviewUrl} target="_blank" rel="noreferrer">
                Open route
              </Link>
            </p>
          </section>
        ) : null}

        {tab === 'HISTORY' ? (
          <section className="site00-dw-panel site00-dw-panel--history">
            <h2>HISTORY</h2>
            <p>Reference and implementation lineage preserved non-destructively.</p>
            <table className="site00-dw-matrix">
              <thead>
                <tr>
                  <th>SCREEN</th>
                  <th>MOBILE</th>
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
