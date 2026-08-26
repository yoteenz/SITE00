/**
 * P0.VR.2 — Studio World Design Reconstruction workspace.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CANONICAL_VIEWPORT_DIMENSIONS,
  P0_VR_2_LINEAGE,
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
import { VisualReconstructionWorkspace } from './VisualReconstructionWorkspace';
import '../../styles/site00-visual-reconstruction.css';

export type StudioWorldDesignWorkspaceProps = {
  initialProjectId?: string;
  initialScreenId?: string;
  initialViewport?: DesignViewportClass;
};

type WorkspacePanel = 'REFERENCE' | 'IMPLEMENTATION' | 'COMPARE' | 'HISTORY';

function mapStatusLabel(
  projectId: string,
  screenId: string,
  viewport: DesignViewportClass,
): string {
  const row = buildDesignScreenMatrix(projectId).find((r) => r.screenId === screenId);
  if (!row) return 'NOT STARTED';
  const cell = viewport === 'mobile' ? row.mobile : row.desktop;
  if (cell.implementationStatus === 'MATCHED') return 'MATCHED';
  if (cell.referenceStatus === 'MISSING') return 'NEEDS REFERENCE';
  return 'NEEDS MATCH';
}

export function StudioWorldDesignWorkspace({
  initialProjectId = 'ndxbook',
  initialScreenId = 'overview',
  initialViewport = 'mobile',
}: StudioWorldDesignWorkspaceProps) {
  registerNdxbookDesignPilot();

  const [projectId, setProjectId] = useState(initialProjectId);
  const [screenId, setScreenId] = useState(initialScreenId);
  const [viewportClass, setViewportClass] = useState<DesignViewportClass>(initialViewport);
  const [customRoute, setCustomRoute] = useState('');
  const [panel, setPanel] = useState<WorkspacePanel>('COMPARE');
  const [scopeOverride, setScopeOverride] = useState<string>('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const screens = useMemo(() => listDesignScreensForProject(projectId), [projectId]);
  const matrix = useMemo(() => buildDesignScreenMatrix(projectId), [projectId]);
  const screen = findDesignScreen(projectId, screenId);
  const route = customRoute || (screen ? resolveDesignScreenRoute(screen, projectId) : `/projects/${projectId}`);
  const reference = getActiveCanonicalReference(projectId, screenId, viewportClass);
  const statusLabel = mapStatusLabel(projectId, screenId, viewportClass);
  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[viewportClass];

  const livePreviewUrl = `${route}?site00MobileLayout=${viewportClass === 'mobile' ? '1' : '0'}&designPreview=1`;
  const referenceUrl = reference?.storagePath ?? uploadPreview;

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
          scopeOverride: scopeOverride as never,
        });
      };
      img.src = objectUrl;
    },
    [projectId, route, screen?.supportsIconMode, screenId, scopeOverride, viewportClass],
  );

  const handleUseAsCanonical = () => {
    if (reference?.referenceId) promoteReferenceToCanonical(reference.referenceId);
  };

  const handleMatchReference = () => {
    const result = startVisualReconstructionRun({ projectId, screenId, route, viewportClass });
    setLastRunId(result.run.runId);
  };

  return (
    <div className="site00-design-workspace" data-visual-reconstruction="p0vr2-design-workspace">
      <header className="site00-design-workspace__hero">
        <p className="site00-design-workspace__kicker">STUDIO WORLD · {P0_VR_2_LINEAGE}</p>
        <h1 className="site00-design-workspace__title">DESIGN</h1>
        <p className="site00-design-workspace__rule">
          REFERENCE = DESIGN AUTHORITY · KEEP THE FUNCTION · REBUILD THE LOOK
        </p>
      </header>

      <div className="site00-design-workspace__control-bar">
        <label className="site00-design-workspace__control">
          <span>PROJECT</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {DESIGN_WORKSPACE_PROJECTS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="site00-design-workspace__control">
          <span>SCREEN</span>
          <select value={screenId} onChange={(e) => setScreenId(e.target.value)}>
            {screens.map((s) => (
              <option key={s.screenId} value={s.screenId}>
                {s.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="site00-design-workspace__control site00-design-workspace__control--route">
          <span>ROUTE</span>
          <input value={route} onChange={(e) => setCustomRoute(e.target.value)} aria-label="Route" />
        </label>
        <div className="site00-design-workspace__control site00-design-workspace__control--viewport">
          <span>VIEWPORT</span>
          <div className="site00-design-workspace__viewport-toggle">
            {(['mobile', 'desktop'] as const).map((vp) => (
              <button
                key={vp}
                type="button"
                className={viewportClass === vp ? 'is-active' : ''}
                onClick={() => setViewportClass(vp)}
              >
                {vp.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <label className="site00-design-workspace__control">
          <span>REFERENCE</span>
          <select value={reference?.referenceId ?? ''} disabled>
            <option value={reference?.referenceId ?? ''}>
              {reference ? `CANONICAL v${reference.version}` : 'MISSING'}
            </option>
          </select>
        </label>
        <div className="site00-design-workspace__control">
          <span>STATUS</span>
          <strong className="site00-design-workspace__status">{statusLabel}</strong>
        </div>
      </div>

      <div className="site00-design-workspace__actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          UPLOAD REFERENCE
        </button>
        <button type="button" onClick={handleUseAsCanonical} disabled={!uploadPreview && !reference}>
          USE AS CANONICAL
        </button>
        <button type="button" className="site00-design-workspace__primary" onClick={handleMatchReference}>
          MATCH REFERENCE
        </button>
        <Link to={livePreviewUrl} className="site00-design-workspace__link" target="_blank" rel="noreferrer">
          OPEN LIVE ROUTE
        </Link>
      </div>

      {scopeOverride ? (
        <p className="site00-design-workspace__scope-hint">Proposed scope: {scopeOverride}</p>
      ) : null}

      <div className="site00-design-workspace__panel-tabs">
        {(['REFERENCE', 'IMPLEMENTATION', 'COMPARE', 'HISTORY'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={panel === tab ? 'is-active' : ''}
            onClick={() => setPanel(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="site00-design-workspace__matrix">
        <h2>SCREEN MATRIX</h2>
        <table>
          <thead>
            <tr>
              <th>SCREEN</th>
              <th>MOBILE</th>
              <th>DESKTOP</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr
                key={row.screenId}
                className={row.screenId === screenId ? 'is-selected' : ''}
                onClick={() => setScreenId(row.screenId)}
              >
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
      </section>

      {panel === 'COMPARE' || panel === 'REFERENCE' || panel === 'IMPLEMENTATION' ? (
        <div className="site00-design-workspace__compare-grid">
          <div className="site00-design-workspace__frames">
            {(panel === 'REFERENCE' || panel === 'COMPARE') && referenceUrl ? (
              <figure className="site00-design-workspace__frame">
                <figcaption>REFERENCE</figcaption>
                <img src={referenceUrl} alt="Canonical reference" />
              </figure>
            ) : null}
            {(panel === 'IMPLEMENTATION' || panel === 'COMPARE') ? (
              <figure className="site00-design-workspace__frame site00-design-workspace__frame--live">
                <figcaption>LIVE · {viewport.width}×{viewport.height}</figcaption>
                <iframe
                  title="Live implementation"
                  src={livePreviewUrl}
                  style={{ width: viewport.width, height: Math.min(viewport.height, 720) }}
                />
              </figure>
            ) : null}
          </div>
          <VisualReconstructionWorkspace
            route={route}
            referencePreviewUrl={referenceUrl}
            implementationPreviewUrl={null}
            referenceScopeLabel={reference?.scope ?? scopeOverride ?? 'PENDING'}
            referenceTargetLabel={screen?.displayName ?? screenId}
            step={lastRunId ? 'COMPARE' : 'UPLOAD'}
          />
          <aside className="site00-design-workspace__meta">
            <p>
              Viewport: {viewport.width}×{viewport.height}
            </p>
            <p>Reference path: {reference?.storagePath ?? '—'}</p>
            <p>Last run: {lastRunId ?? '—'}</p>
            <p className="site00-design-workspace__inspect-note">
              INSPECT: region map, DOM map, patch list, asset lineage, hashes — available in reconstruction runs.
            </p>
          </aside>
        </div>
      ) : (
        <div className="site00-design-workspace__history">
          <p>Reference lineage preserved non-destructively. Upload replacement → DRAFT → compare → promote.</p>
        </div>
      )}
    </div>
  );
}
