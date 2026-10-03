/**
 * PRODUCTION HUB — the machine.
 * ACTIVE OBJECT → ACTIVE OPERATION → RESULT. One chamber, many states; never 14 pages.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HUB_ENTRY002,
  HUB_NODE_LABEL,
  hubDeepLink,
  hubFrameAssetSlotId,
  hubReducer,
  initialHubState,
  serializableHubContext,
  type HubAttentionItem,
  type HubDeepTarget,
  type HubNode,
  type HubNodeAction,
  type HubNodeId,
  type HubStoryboardFrame,
} from '../../../../shared/site00-production-hub/index.js';
import { HUB_ATMOSPHERE_SLOT_ID } from '../../../../shared/site00-production-hub/assets.js';
import { HubImage } from './HubImage';
import { Reticle, IcChevD, IcMenu } from './icons';
import {
  ArtifactStage,
  DependencyCard,
  DependencyLegend,
  DependencyNode,
  DependencyRails,
  Filmstrip,
  FlowStack,
  ModeSwitcher,
  ProductionChamber,
  ProductionNode,
} from './machine';
import { ActivityStrip, AttentionTable, AuthorityPanel, ComparisonWorkspace, NodeInspector, OperationPanel, type CompareTarget } from './panels';
import { buildInspectorView } from './inspectorContent';
import { AttentionQuickView, FounderDecisionDialog, FrameLightbox, HubMenu, ProjectProductionSelector, SceneSelector } from './overlays';
import { ProductionBottomNav } from './nav';
import { useProductionHubData } from './useProductionHubData';
import { writeProductionWorkspaceContext } from '../../../../shared/site00-production-workspace/productionContextStorage.js';
import '../../styles/site00-production-hub.css';
import '../../styles/site00-production-hub-authority.css';

const CTX_KEY = 'site00.production.hub.ctx.v1';
const pad = (n: number) => String(n).padStart(2, '0');
const slotLabel = (t: string | undefined) => (t ? t.replace(/_/g, ' ') : 'ASSET');

/** Authority packs are 864px wide; cap the canvas at 520 CSS px on large screens. */
const HUB_AUTHORITY_WIDTH = 864;
function hubScale(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.innerWidth, 520) / HUB_AUTHORITY_WIDTH;
}

function readCtx(): Record<string, unknown> | null {
  try {
    const raw = window.sessionStorage.getItem(CTX_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function ProductionHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, dispatch] = useReducer(hubReducer, undefined, () => initialHubState('ndxbook'));
  const data = useProductionHubData(state.selectedProjectId);
  const { graph, scenes, frames, project } = data;
  const [compareTargetId, setCompareTargetId] = useState('cast');
  const [swapped, setSwapped] = useState(false);
  const [decisionInitial, setDecisionInitial] = useState<'APPROVE' | 'REVISE' | null>(null);
  const restored = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const authorityRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  /* body lock (Production owns its own scrolling surface) */
  useEffect(() => {
    const { body, documentElement } = document;
    const prev = [body.style.overflow, documentElement.style.overflow];
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prev[0]!;
      documentElement.style.overflow = prev[1]!;
    };
  }, []);

  /* authority scale: the hub is authored in the 864px authority coordinate space and zoomed to the device width */
  const [hubZoom, setHubZoom] = useState(() => hubScale());
  useEffect(() => {
    const onResize = () => setHubZoom(hubScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* restore durable context once (deep-link return) */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = readCtx();
    const panel = new URLSearchParams(location.search).get('panel');
    if (saved) dispatch({ type: 'RESTORE', state: saved as never });
    if (panel === 'activity') dispatch({ type: 'SET_EXPANDED', surface: 'ACTIVITY' });
  }, [location.search]);

  /* persist durable context */
  useEffect(() => {
    if (!restored.current) return;
    try {
      window.sessionStorage.setItem(CTX_KEY, JSON.stringify(serializableHubContext(state)));
    } catch {
      /* ignore */
    }
  }, [state]);

  /* keep production workspace context in step with the hub selection */
  useEffect(() => {
    writeProductionWorkspaceContext({ projectSlug: project.projectId });
  }, [project.projectId]);

  /* hydrate scene + frame defaults from canonical lists (idempotent; never overrides a restored selection) */
  useEffect(() => {
    dispatch({ type: 'ENSURE_SCENE', sceneIds: scenes.map((sc) => sc.sceneId) });
  }, [scenes]);

  useEffect(() => {
    dispatch({ type: 'ENSURE_FRAME', frameIds: frames.map((f) => f.frameId) });
  }, [frames]);

  useEffect(() => {
    if (state.selectedProductionId !== (data.production?.productionId ?? null))
      dispatch({ type: 'RESTORE', state: { selectedProductionId: data.production?.productionId ?? null } });
  }, [data.production?.productionId, state.selectedProductionId]);

  /* scroll expanded surfaces into view */
  useEffect(() => {
    const el = state.expandedSurface === 'STORYBOARD' ? authorityRef.current : state.expandedSurface === 'TABLE' ? tableRef.current : state.expandedSurface === 'ACTIVITY' ? activityRef.current : null;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [state.expandedSurface]);

  const scene = scenes.find((s) => s.sceneId === state.selectedSceneId) ?? null;
  const frame = frames.find((f) => f.frameId === state.selectedStoryboardFrameId) ?? null;
  const frameSlot = (n: number) => hubFrameAssetSlotId(HUB_ENTRY002.projectId, HUB_ENTRY002.productionId, n);
  const frameUrl = (f: HubStoryboardFrame | null) => (f ? data.assetUrl(frameSlot(f.number)) : null);
  const stepFrame = useCallback((d: 1 | -1) => dispatch({ type: 'STEP_FRAME', delta: d, frameIds: frames.map((f) => f.frameId) }), [frames]);

  const go = useCallback(
    (target: HubDeepTarget, nodeId?: HubNodeId | null) => {
      navigate(hubDeepLink({ projectId: project.projectId, target, sceneId: state.selectedSceneId, frameId: state.selectedStoryboardFrameId, nodeId: nodeId ?? state.selectedNodeId }));
    },
    [navigate, project.projectId, state.selectedSceneId, state.selectedStoryboardFrameId, state.selectedNodeId],
  );

  const nodeImg = (n: HubNode) => data.assetUrl(n.assetSlotId);
  const nodeLabel = (n: HubNode) => slotLabel(data.slotMeta(n.assetSlotId)?.assetType);

  const onNodeAction = useCallback(
    (a: HubNodeAction, n: HubNode) => {
      if (a.kind === 'DEEP_LINK') return go(a.target as HubDeepTarget, n.id);
      if (n.id === 'storyboard' && a.id === 'compare') return dispatch({ type: 'SET_COMPARE', open: true });
      if (n.id === 'storyboard' && a.id === 'review') return dispatch({ type: 'SET_EXPANDED', surface: 'STORYBOARD' });
      dispatch({ type: 'OPEN_INSPECTOR', nodeId: n.id, tab: a.target });
    },
    [go],
  );

  const deepTargetForNode: Record<HubNodeId, HubDeepTarget> = {
    narrative: 'narrative', cast: 'casting', look: 'wardrobe', performance: 'performance', set: 'sets', storyboard: 'storyboard', keyframes: 'storyboard',
  };

  const canDecide = graph.founderGate.open && graph.founderGate.nodeId === 'storyboard' && graph.founderGate.decidableInHub && data.pipeline.available;
  const openDecision = (initial: 'APPROVE' | 'REVISE' | null) => {
    setDecisionInitial(initial);
    dispatch({ type: 'OPEN_OVERLAY', overlay: 'DECISION' });
  };

  const onGate = () => {
    const g = graph.founderGate;
    if (g.nodeId === 'storyboard') return canDecide ? openDecision(null) : dispatch({ type: 'SET_EXPANDED', surface: 'STORYBOARD' });
    if (g.nodeId) go(deepTargetForNode[g.nodeId], g.nodeId);
  };

  const onAttentionAct = (i: HubAttentionItem) => {
    dispatch({ type: 'CLOSE_OVERLAY' });
    if (i.kind === 'REQUEST') return go('queue');
    if (i.kind === 'FOUNDER_APPROVAL') return canDecide ? openDecision(null) : dispatch({ type: 'SET_EXPANDED', surface: 'STORYBOARD' });
    if (i.nodeId) go(deepTargetForNode[i.nodeId], i.nodeId);
  };

  const inspectedNode = state.inspectionState.open && state.selectedNodeId ? graph.byId[state.selectedNodeId] : null;
  const inspectorView = useMemo(
    () =>
      inspectedNode
        ? buildInspectorView({
            node: inspectedNode,
            tab: state.inspectionState.tab,
            plan: data.plan,
            cast: data.cast,
            storyboard: data.pipeline.available ? { status: data.pipeline.storyboardStatus, version: data.storyboardVersion, panelCount: data.pipeline.panelCount, mode: data.storyboardMode } : null,
            keyframeEligibility: data.pipeline.keyframeEligibility,
          })
        : null,
    [inspectedNode, state.inspectionState.tab, data.plan, data.cast, data.pipeline],
  );

  const compareTargets: CompareTarget[] = (['cast', 'look', 'set'] as const).map((id) => ({
    id,
    label: `${HUB_NODE_LABEL[id]} AUTHORITY`,
    slotId: graph.byId[id].assetSlotId,
    url: nodeImg(graph.byId[id]),
    source: `${HUB_NODE_LABEL[id]} NODE`,
    status: graph.byId[id].status.replace(/_/g, ' '),
  }));

  const thumbs = useMemo(() => {
    const start = frame ? frames.findIndex((f) => f.frameId === frame.frameId) : 0;
    return Array.from({ length: 4 }, (_, i) => {
      const f = frames.length ? (frames[(start + i) % frames.length] ?? null) : null;
      const slotId = f ? frameSlot(f.number) : frameSlot(i + 1);
      return { frame: f, slotId, url: f ? data.assetUrl(slotId) : null };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, frame, data.assetUrl]);

  const expandedArtifact = state.expandedSurface === 'ARTIFACT';
  const mode = state.currentMode;
  const leftNodes = [graph.byId.narrative, graph.byId.cast, graph.byId.look];
  const rightNodes = [graph.byId.performance, graph.byId.set, graph.byId.storyboard];
  const nextLabel = graph.nextStage ? HUB_NODE_LABEL[graph.nextStage] : '—';
  const productionLabel = data.production ? `${data.production.label} / ${data.production.subtitle}` : 'NO PRODUCTION';
  const focusMode = state.compareOpen; // 03 authority keeps On Your Table / Activity beneath the inspector

  const artifactSlot = frame ? frameSlot(frame.number) : frameSlot(1);
  const sceneSlotFor = (id: string) => `production.${HUB_ENTRY002.projectId}.${HUB_ENTRY002.productionId}.scene.${id}.reference`;

  const menuEntries = [
    { id: 'design', label: 'DESIGN', sub: 'Websites, pages, interfaces' },
    { id: 'experience', label: 'EXPERIENCE', sub: 'Worlds, environments, modules' },
    { id: 'expression', label: 'EXPRESSION', sub: 'Campaigns, narrative, content' },
    { id: 'queue', label: 'INBOX / QUEUE', sub: 'Requests from projects and services' },
    { id: 'libraries', label: 'LIBRARY', sub: 'Shared production assets' },
  ];

  const ui = (
    <div className="ph ph--hub" style={{ ['--phz' as string]: hubZoom }} data-testid="production-workspace-hub" data-hub-mode={mode.toLowerCase()} data-selected-scene={state.selectedSceneId ?? ''} data-selected-frame={state.selectedStoryboardFrameId ?? ''}>
      {/* ── header ── */}
      <header className="ph-top" data-testid="hub-header">
        <div className="ph-top__brand">
          <span className="ph-top__copy">
            <b>PRODUCTION</b>
            <small>SITE 00 / STUDIO WORLD</small>
          </span>
        </div>
        <button type="button" className="ph-top__sel" onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'PROJECT_SELECTOR' })} aria-haspopup="dialog" data-testid="hub-project-trigger">
          <HubImage slotId={project.slotId} url={data.assetUrl(project.slotId)} label="" className="ph-top__thumb" />
          <span className="ph-top__copy">
            <small>PROJECT</small>
            <b>{project.name.toUpperCase()}</b>
          </span>
          <IcChevD width={14} height={14} />
        </button>
        <button type="button" className="ph-top__sel ph-top__sel--prod" onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'PROJECT_SELECTOR' })} aria-haspopup="dialog" data-testid="hub-production-trigger">
          <span className="ph-top__copy">
            <small>CURRENT PRODUCTION</small>
            <b>{data.production?.label ?? 'NONE'}</b>
            <em>{data.production?.subtitle ?? 'NO PRODUCTION'}</em>
          </span>
          <IcChevD width={14} height={14} />
        </button>
        <button type="button" className="ph-top__attn" onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'ATTENTION' })} aria-haspopup="dialog" aria-label={`${data.attention.length} items need you`} data-testid="hub-attention-trigger">
          <Reticle size={38} />
          <span className="ph-top__copy">
            <b data-testid="hub-attention-count">{pad(data.attention.length)}</b>
            <small>ITEMS NEED YOU</small>
          </span>
        </button>
        <button type="button" className="ph-top__menu" onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'MENU' })} aria-label="Menu" data-testid="hub-menu-trigger">
          <IcMenu width={22} height={22} />
        </button>
      </header>

      {/* ── scrolling body ── */}
      <div className="ph-scroll" ref={scrollRef} data-testid="hub-scroll">
        <ProductionChamber mode={mode} expanded={expandedArtifact && mode === 'LIVE'} atmosphereUrl={data.assetUrl(HUB_ATMOSPHERE_SLOT_ID)}>
          <ModeSwitcher mode={mode} onChange={(m) => dispatch({ type: 'SET_MODE', mode: m })} />
          {mode !== 'FLOW' ? (
            <>
              <p className="ph-tag ph-tag--l" aria-hidden>IDEAS<br />WORLDS<br />PEOPLE<br />IN MOTION</p>
              <p className="ph-tag ph-tag--r" aria-hidden>A<br />STORY<br />TAKES<br />SHAPE</p>
            </>
          ) : (
            <>
              <p className="ph-tag ph-tag--l" aria-hidden>SEQUENCE<br />NARRATIVE<br />TO<br />KEYFRAMES</p>
              <p className="ph-tag ph-tag--r" aria-hidden>A<br />STORY<br />TAKES<br />SHAPE</p>
            </>
          )}

          {mode === 'LIVE' ? (
            <div className="ph-livegrid" data-testid="hub-live">
              <div className="ph-col ph-col--l">
                {leftNodes.map((n) => (
                  <ProductionNode
                    key={n.id}
                    node={n}
                    selected={state.selectedNodeId === n.id}
                    panelFace={state.selectedNodeId === n.id ? state.selectedNodePanelFace : 'SUMMARY'}
                    compact={expandedArtifact}
                    imageUrl={nodeImg(n)}
                    slotLabel={nodeLabel(n)}
                    onSelect={() => dispatch({ type: 'SELECT_NODE', nodeId: n.id })}
                    onBack={() => dispatch({ type: 'NODE_PANEL_BACK' })}
                    onAction={(a) => onNodeAction(a, n)}
                  />
                ))}
              </div>
              <ArtifactStage
                scene={scene}
                frame={frame}
                frames={frames}
                frameUrl={frameUrl(frame)}
                frameSlotId={artifactSlot}
                thumbs={thumbs}
                expanded={expandedArtifact}
                onPrev={() => stepFrame(-1)}
                onNext={() => stepFrame(1)}
                onOpen={() => dispatch({ type: 'SET_EXPANDED', surface: 'ARTIFACT' })}
                onOpenScenes={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'SCENE_SELECTOR' })}
                onSelectFrame={(id) => dispatch({ type: 'SELECT_FRAME', frameId: id })}
              />
              <div className="ph-col ph-col--r">
                {rightNodes.map((n) => (
                  <ProductionNode
                    key={n.id}
                    node={n}
                    selected={state.selectedNodeId === n.id}
                    panelFace={state.selectedNodeId === n.id ? state.selectedNodePanelFace : 'SUMMARY'}
                    compact={expandedArtifact}
                    imageUrl={nodeImg(n)}
                    slotLabel={nodeLabel(n)}
                    onSelect={() => dispatch({ type: 'SELECT_NODE', nodeId: n.id })}
                    onBack={() => dispatch({ type: 'NODE_PANEL_BACK' })}
                    onAction={(a) => onNodeAction(a, n)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {mode === 'FLOW' ? (
            <FlowStack
              nodes={graph.nodes}
              selectedNodeId={state.selectedNodeId}
              selectedNodePanelFace={state.selectedNodePanelFace}
              urlFor={nodeImg}
              onSelect={(id) => dispatch({ type: 'SELECT_NODE', nodeId: id })}
              onBack={() => dispatch({ type: 'NODE_PANEL_BACK' })}
              onAction={onNodeAction}
            />
          ) : null}

          {mode === 'DEPENDENCIES' ? (
            <div className="ph-dep" data-testid="hub-dependencies">
              <div className="ph-dep__grid">
                <DependencyRails status={{ l: leftNodes.map((n) => n.status), r: rightNodes.map((n) => n.status) }} />
                <div className="ph-dep__col">
                  {leftNodes.map((n) => (
                    <DependencyNode
                      key={n.id}
                      node={n}
                      selected={state.selectedNodeId === n.id}
                      panelFace={state.selectedNodeId === n.id ? state.selectedNodePanelFace : 'SUMMARY'}
                      url={nodeImg(n)}
                      slotLabel={nodeLabel(n)}
                      onSelect={() => dispatch({ type: 'SELECT_NODE', nodeId: n.id })}
                      onBack={() => dispatch({ type: 'NODE_PANEL_BACK' })}
                      onAction={(a) => onNodeAction(a, n)}
                    />
                  ))}
                </div>
                <div className="ph-dep__center">
                  <DependencyCard node={graph.byId.keyframes} url={nodeImg(graph.byId.keyframes)} sceneLabel={scene?.label ?? '—'} sceneOrder={scene?.order ?? null} onOpen={() => dispatch({ type: 'OPEN_INSPECTOR', nodeId: 'keyframes', tab: 'status' })} />
                </div>
                <div className="ph-dep__col">
                  {rightNodes.map((n) => (
                    <DependencyNode
                      key={n.id}
                      node={n}
                      selected={state.selectedNodeId === n.id}
                      panelFace={state.selectedNodeId === n.id ? state.selectedNodePanelFace : 'SUMMARY'}
                      url={nodeImg(n)}
                      slotLabel={nodeLabel(n)}
                      onSelect={() => dispatch({ type: 'SELECT_NODE', nodeId: n.id })}
                      onBack={() => dispatch({ type: 'NODE_PANEL_BACK' })}
                      onAction={(a) => onNodeAction(a, n)}
                    />
                  ))}
                </div>
              </div>
              <DependencyLegend />
            </div>
          ) : null}

          {mode === 'LIVE' ? (
            <Filmstrip
              frames={frames}
              selectedFrameId={state.selectedStoryboardFrameId}
              urlFor={(f) => frameUrl(f)}
              slotFor={frameSlot}
              onSelect={(id) => dispatch({ type: 'SELECT_FRAME', frameId: id })}
              onStep={stepFrame}
            />
          ) : null}
        </ProductionChamber>

        {/* ── below the chamber: one focused surface at a time ── */}
        {inspectedNode && inspectorView ? (
          <NodeInspector
            node={inspectedNode}
            view={inspectorView}
            tab={state.inspectionState.tab}
            imageUrl={nodeImg(inspectedNode)}
            slotLabel={nodeLabel(inspectedNode)}
            deepLabel={inspectedNode.quickActions.find((a) => a.kind === 'DEEP_LINK')?.label ?? null}
            onTab={(t) => dispatch({ type: 'SET_INSPECTOR_TAB', tab: t })}
            onClose={() => dispatch({ type: 'CLOSE_INSPECTOR' })}
            onDeepLink={() => go(deepTargetForNode[inspectedNode.id], inspectedNode.id)}
          />
        ) : state.compareOpen ? (
          <ComparisonWorkspace
            scene={scene}
            left={{ slotId: artifactSlot, url: frameUrl(frame), frameLabel: frame ? `FRAME ${frame.number}/${frames.length}` : 'NO FRAME', status: graph.byId.storyboard.status.replace(/_/g, ' ') }}
            targets={compareTargets}
            targetId={compareTargetId}
            swapped={swapped}
            onTarget={setCompareTargetId}
            onSwap={() => setSwapped((v) => !v)}
            onClose={() => dispatch({ type: 'SET_COMPARE', open: false })}
            onRevise={() => openDecision('REVISE')}
            onOpenExpression={() => go('storyboard')}
            canRevise={canDecide}
          />
        ) : (
          <>
            <OperationPanel
              scene={scene}
              sceneCount={scenes.length}
              graph={graph}
              onOpenScenes={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'SCENE_SELECTOR' })}
              onOpenOperation={() => graph.operation.nodeId && dispatch({ type: 'OPEN_INSPECTOR', nodeId: graph.operation.nodeId, tab: graph.byId[graph.operation.nodeId].quickActions.find((a) => a.kind === 'INSPECT_TAB')?.target ?? '' })}
              onGate={onGate}
              onMore={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'MENU' })}
              nextStageLabel={nextLabel}
              formatLabel={data.isEntry002 ? 'REEL (9:16)' : '–'}
              pipelineOffline={data.isEntry002 && !data.pipeline.available}
            />
            {state.expandedSurface !== 'TABLE' ? (
              <div ref={authorityRef}>
                <AuthorityPanel
                  expanded={state.expandedSurface === 'STORYBOARD'}
                  scene={scene}
                  frame={frame}
                  frames={frames}
                  frameUrl={frameUrl(frame)}
                  frameSlotId={artifactSlot}
                  status={data.pipeline.storyboardStatus}
                  version={data.storyboardVersion}
                  gate={graph.founderGate}
                  storyboardNode={graph.byId.storyboard}
                  canDecide={canDecide}
                  onStep={stepFrame}
                  onFullscreen={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'LIGHTBOX' })}
                  onReview={() => dispatch({ type: 'SET_EXPANDED', surface: 'STORYBOARD' })}
                  onApprove={() => openDecision('APPROVE')}
                  onRevise={() => openDecision('REVISE')}
                  onCompare={() => dispatch({ type: 'SET_COMPARE', open: true })}
                  onOpenExpression={() => go('storyboard')}
                />
              </div>
            ) : null}
          </>
        )}

        {!focusMode && state.expandedSurface !== 'ACTIVITY' ? (
          <div ref={tableRef}>
            <AttentionTable
              items={data.attention}
              expanded={state.expandedSurface === 'TABLE'}
              expandedId={state.expandedAttentionId}
              urlFor={data.assetUrl}
              onToggleExpanded={() => dispatch({ type: 'SET_EXPANDED', surface: 'TABLE' })}
              onExpandItem={(id) => {
                if (state.expandedSurface !== 'TABLE') dispatch({ type: 'SET_EXPANDED', surface: 'TABLE' });
                dispatch({ type: 'EXPAND_ATTENTION', id });
              }}
              onAct={onAttentionAct}
            />
          </div>
        ) : null}

        <div ref={activityRef}>
          <ActivityStrip
            items={data.activity}
            expanded={state.expandedSurface === 'ACTIVITY'}
            filter={state.activityFilter}
            urlFor={data.assetUrl}
            onToggle={() => dispatch({ type: 'SET_EXPANDED', surface: 'ACTIVITY' })}
            onFilter={(f) => dispatch({ type: 'SET_ACTIVITY_FILTER', filter: f })}
          />
        </div>
        <div className="ph-scroll__pad" aria-hidden />
      </div>

      <ProductionBottomNav active="hub" projectId={project.projectId} inboxCount={data.attention.length} onActivity={() => dispatch({ type: 'SET_EXPANDED', surface: 'ACTIVITY' })} />

      {/* ── overlays (Hub stays intact and dimmed beneath) ── */}
      {state.overlay === 'SCENE_SELECTOR' ? (
        <SceneSelector
          productionLabel={productionLabel}
          scenes={scenes}
          selectedId={state.selectedSceneId}
          urlFor={data.assetUrl}
          slotFor={sceneSlotFor}
          onSelect={(id) => dispatch({ type: 'SELECT_SCENE', sceneId: id })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.overlay === 'LIGHTBOX' ? (
        <FrameLightbox
          scene={scene}
          frames={frames}
          frame={frame}
          urlFor={(f) => frameUrl(f)}
          slotFor={frameSlot}
          onSelect={(id) => dispatch({ type: 'SELECT_FRAME', frameId: id })}
          onStep={stepFrame}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          onCompare={() => {
            dispatch({ type: 'CLOSE_OVERLAY' });
            dispatch({ type: 'SET_COMPARE', open: true });
          }}
          onOpenExpression={() => go('storyboard')}
        />
      ) : null}
      {state.overlay === 'DECISION' ? (
        <FounderDecisionDialog
          scene={scene}
          frame={frame}
          frameCount={frames.length}
          frameUrl={frameUrl(frame)}
          frameSlotId={artifactSlot}
          nextStageLabel={nextLabel === '—' ? 'KEYFRAMES' : nextLabel}
          initial={decisionInitial}
          deciding={data.deciding}
          onDecide={data.decideStoryboard}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          onFullscreen={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'LIGHTBOX' })}
          onOpenExpression={() => go('storyboard')}
        />
      ) : null}
      {state.overlay === 'PROJECT_SELECTOR' ? (
        <ProjectProductionSelector
          projects={data.projects}
          activeProjectId={project.projectId}
          urlFor={data.assetUrl}
          onSelect={(pid) => {
            const p = data.projects.find((x) => x.projectId === pid);
            dispatch({ type: 'SELECT_PROJECT', projectId: pid, productionId: p?.productions[0]?.productionId ?? null, sceneId: null });
          }}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.overlay === 'ATTENTION' ? (
        <AttentionQuickView items={data.attention} urlFor={data.assetUrl} onAct={onAttentionAct} onInbox={() => go('queue')} onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })} />
      ) : null}
      {state.overlay === 'MENU' ? (
        <HubMenu
          entries={menuEntries}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          onGo={(id) => {
            dispatch({ type: 'CLOSE_OVERLAY' });
            if (id === 'expression') return navigate(`/production/${project.projectId}/expression?entry=002&from=hub`);
            go(id as HubDeepTarget);
          }}
        />
      ) : null}
    </div>
  );

  return createPortal(ui, document.body);
}
