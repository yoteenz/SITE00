import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  VIEWPORT_LAB_DEFAULT_PRESET_ID,
  viewportLabPresetById,
  type ViewportLabPresetId,
} from '../../../../shared/site00-viewport-lab/presets.js';
import {
  buildViewportLabPreviewSrc,
  VIEWPORT_LAB_COMMON_ROUTE_SUFFIXES,
} from '../../../../shared/site00-viewport-lab/previewTargets.js';
import {
  iframeRefreshKey,
  presetDefaultOrientation,
  type ViewportLabOrientation,
  type ViewportLabZoomMode,
} from '../../../../shared/site00-viewport-lab/viewportLabLogic.js';
import { site00ProductionViewportLabPath } from '../../config/routes';
import { HubReturnBar } from '../production/HubReturnBar';
import { ViewportLabPreviewFrame } from './ViewportLabPreviewFrame';
import { ViewportLabToolbar } from './ViewportLabToolbar';
import '../../styles/site00-viewport-lab.css';

export function ViewportLabShell() {
  const { projectSlug: routeSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const projectSlug = routeSlug.toLowerCase();

  const [presetId, setPresetIdState] = useState<ViewportLabPresetId>(VIEWPORT_LAB_DEFAULT_PRESET_ID);
  const setPresetId = useCallback((id: ViewportLabPresetId) => {
    setPresetIdState(id);
    setOrientation(presetDefaultOrientation(viewportLabPresetById(id)));
  }, []);
  const [comparePresetId, setComparePresetId] = useState<ViewportLabPresetId>('mobile-wide');
  const [orientation, setOrientation] = useState<ViewportLabOrientation>('portrait');
  const [zoom, setZoom] = useState<ViewportLabZoomMode>('fit');
  const [routeOptionId, setRouteOptionId] = useState('home');
  const [manualPath, setManualPath] = useState('/app/preview/fixture-app-ndxbook');
  const [useManualPath, setUseManualPath] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceSize, setWorkspaceSize] = useState({ width: 800, height: 600 });

  useLayoutEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setWorkspaceSize({ width: cr.width, height: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const routeSuffix = useMemo(() => {
    const opt = VIEWPORT_LAB_COMMON_ROUTE_SUFFIXES.find((r) => r.id === routeOptionId);
    return opt?.suffix ?? '';
  }, [routeOptionId]);

  const preview = useMemo(
    () =>
      buildViewportLabPreviewSrc({
        projectSlug,
        routeSuffix: useManualPath ? undefined : routeSuffix,
        manualInternalPath: useManualPath ? manualPath : null,
      }),
    [projectSlug, routeSuffix, useManualPath, manualPath],
  );

  const preset = viewportLabPresetById(presetId);
  const comparePreset = viewportLabPresetById(comparePresetId);
  const refreshKey = iframeRefreshKey(preview.src ?? 'empty', refreshNonce);

  const onProjectChange = useCallback(
    (slug: string) => {
      navigate(site00ProductionViewportLabPath(slug));
    },
    [navigate],
  );

  const onRefresh = useCallback(() => setRefreshNonce((n) => n + 1), []);

  const frameWorkspaceWidth = compareMode ? workspaceSize.width / 2 - 8 : workspaceSize.width;
  const frameWorkspaceHeight = workspaceSize.height;

  return (
    <div className="vl-shell" data-testid="viewport-lab-shell">
      <HubReturnBar />
      <ViewportLabToolbar
        projectSlug={projectSlug}
        onProjectChange={onProjectChange}
        presetId={presetId}
        onPresetChange={setPresetId}
        orientation={orientation}
        onOrientationChange={setOrientation}
        zoom={zoom}
        onZoomChange={setZoom}
        routeOptionId={routeOptionId}
        onRouteOptionChange={setRouteOptionId}
        manualPath={manualPath}
        onManualPathChange={setManualPath}
        useManualPath={useManualPath}
        onUseManualPathChange={setUseManualPath}
        showSafeArea={showSafeArea}
        onShowSafeAreaChange={setShowSafeArea}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePresetId={comparePresetId}
        onComparePresetChange={setComparePresetId}
        onRefresh={onRefresh}
        previewSrc={preview.src}
        preset={preset}
        collapsed={toolbarCollapsed}
        onToggleCollapsed={() => setToolbarCollapsed((c) => !c)}
      />
      <div className="vl-workspace" ref={workspaceRef} data-testid="viewport-lab-workspace">
        {preview.reason === 'no-target' ?
          <div className="vl-empty" data-testid="viewport-lab-empty">
            <p>NO CLIENT PREVIEW TARGET REGISTERED</p>
            <p className="vl-empty__hint">Enable MANUAL INTERNAL PATH to load a safe `/app/…` route.</p>
          </div>
        : preview.reason === 'invalid-manual' ?
          <div className="vl-empty" data-testid="viewport-lab-invalid-manual">
            <p>MANUAL PATH MUST START WITH `/app/`</p>
          </div>
        : preview.src ?
          <div className={`vl-frames${compareMode ? ' vl-frames--compare' : ''}`}>
            <ViewportLabPreviewFrame
              src={preview.src}
              preset={preset}
              orientation={orientation}
              zoom={zoom}
              workspaceWidth={frameWorkspaceWidth}
              workspaceHeight={frameWorkspaceHeight}
              refreshKey={refreshKey}
              showSafeArea={showSafeArea}
            />
            {compareMode ?
              <ViewportLabPreviewFrame
                src={preview.src}
                preset={comparePreset}
                orientation={orientation}
                zoom={zoom}
                workspaceWidth={frameWorkspaceWidth}
                workspaceHeight={frameWorkspaceHeight}
                refreshKey={`${refreshKey}::compare`}
                showSafeArea={showSafeArea}
                title="Compare client app preview"
              />
            : null}
          </div>
        : null}
      </div>
    </div>
  );
}
