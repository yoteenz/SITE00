/**
 * Reusable Production Hub machine primitives — live DOM / CSS / SVG only.
 * ProductionChamber, ChamberGeometry, ModeSwitcher, ProductionNode, NodeQuickActions,
 * ArtifactStage, Filmstrip, FlowStage, DependencyRails, StatusBeacon.
 */

import { useRef, type ReactNode } from 'react';
import { HUB_STATUS_LABEL } from '../../../../shared/site00-production-hub/graph.js';
import type {
  HubMode,
  HubNode,
  HubNodeAction,
  HubNodeId,
  HubNodeStatus,
  HubScene,
  HubStoryboardFrame,
} from '../../../../shared/site00-production-hub/types.js';
import { HubImage } from './HubImage';
import {
  IcArrowD,
  IcArrowL,
  IcArrowR,
  IcCam,
  IcChevR,
  IcCheck,
  IcFrames,
  IcInfinity,
  IcLock,
  IcMove,
  IcPulse,
  IcSet,
  IcShirt,
  IcUser,
  IcWarn,
} from './icons';

const pad = (n: number) => String(n).padStart(2, '0');

/* ── StatusBeacon ─────────────────────────────────────────────────────── */

export function StatusBeacon({ status, size = 18 }: { status: HubNodeStatus; size?: number }) {
  const cls = `ph-beacon ph-beacon--${status.toLowerCase()}`;
  const icon =
    status === 'COMPLETE' ? <IcCheck width={size * 0.66} height={size * 0.66} strokeWidth={2.4} />
    : status === 'REVIEW_REQUIRED' || status === 'BLOCKED' ? <IcWarn width={size * 0.7} height={size * 0.7} strokeWidth={2} />
    : status === 'LOCKED' ? <IcLock width={size * 0.66} height={size * 0.66} />
    : null;
  return (
    <span className={cls} style={{ width: size, height: size }} role="img" aria-label={HUB_STATUS_LABEL[status]}>
      {icon}
    </span>
  );
}

/* ── ModeSwitcher ─────────────────────────────────────────────────────── */

export function ModeSwitcher({ mode, onChange }: { mode: HubMode; onChange: (m: HubMode) => void }) {
  const modes: HubMode[] = ['LIVE', 'FLOW', 'DEPENDENCIES'];
  return (
    <div className="ph-mode" role="tablist" aria-label="Chamber mode" data-testid="hub-mode-switcher">
      {modes.map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          className={`ph-mode__tab${mode === m ? ' is-active' : ''}`}
          onClick={() => onChange(m)}
          data-testid={`hub-mode-${m.toLowerCase()}`}
        >
          {m}
          {m === 'LIVE' ? <i className="ph-mode__dot" aria-hidden /> : null}
        </button>
      ))}
    </div>
  );
}

/* ── ChamberGeometry: rings, glass column, beam — SVG, no raster ─────── */

export const CHAMBER_HEIGHT: Record<HubMode, number> = { LIVE: 468, FLOW: 700, DEPENDENCIES: 736 };

export function ChamberGeometry({ mode }: { mode: HubMode }) {
  const flow = mode === 'FLOW';
  const H = CHAMBER_HEIGHT[mode];
  const baseY = H - 84;
  const colTop = 74;
  const colBottom = baseY - 12;
  const cx0 = flow ? 30 : mode === 'DEPENDENCIES' ? 126 : 112;
  const cx1 = flow ? 360 : mode === 'DEPENDENCIES' ? 264 : 278;
  return (
    <svg className={`ph-geo ph-geo--${mode.toLowerCase()}`} viewBox={`0 0 390 ${H}`} preserveAspectRatio="none" aria-hidden data-testid="hub-chamber-geometry">
      <defs>
        <linearGradient id="phChrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#d5d8de" />
          <stop offset="1" stopColor="#f6f7f9" />
        </linearGradient>
        <linearGradient id="phGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".6" />
          <stop offset=".2" stopColor="#ffffff" stopOpacity=".14" />
          <stop offset=".8" stopColor="#ffffff" stopOpacity=".14" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id="phBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e5231b" stopOpacity="0" />
          <stop offset=".18" stopColor="#e5231b" stopOpacity=".9" />
          <stop offset=".82" stopColor="#e5231b" stopOpacity=".9" />
          <stop offset="1" stopColor="#e5231b" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="phGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#e5231b" stopOpacity=".6" />
          <stop offset="1" stopColor="#e5231b" stopOpacity="0" />
        </radialGradient>
        <filter id="phBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
      </defs>

      {/* upper collar: chrome ring stack with red illumination */}
      <ellipse cx="195" cy="62" rx="176" ry="32" fill="url(#phChrome)" stroke="#c0c4cb" strokeWidth="1.2" />
      <ellipse cx="195" cy="66" rx="150" ry="26" fill="none" stroke="#e5231b" strokeWidth="2.6" opacity=".8" filter="url(#phBlur)" />
      <ellipse cx="195" cy="66" rx="150" ry="26" fill="none" stroke="#e5231b" strokeWidth="1" />
      <ellipse cx="195" cy="70" rx="120" ry="20" fill="#f3f4f6" stroke="#cfd2d8" strokeWidth="1" />
      <ellipse cx="195" cy="72" rx="92" ry="14" fill="none" stroke="#e5231b" strokeWidth="1" opacity=".85" />
      <ellipse cx="195" cy="74" rx="60" ry="9" fill="url(#phGlow)" />

      {/* glass column */}
      <rect x={cx0} y={colTop} width={cx1 - cx0} height={colBottom - colTop} fill="url(#phGlass)" opacity={flow ? '.55' : '.95'} />
      <path d={`M${cx0} ${colTop} V${colBottom} M${cx1} ${colTop} V${colBottom}`} stroke="#c6cad2" strokeWidth="1.3" fill="none" />
      {flow ? (
        <>
          <path d={`M20 ${colTop + 6} V${colBottom - 4} M370 ${colTop + 6} V${colBottom - 4}`} stroke="#e5231b" strokeWidth="1.2" opacity=".8" />
          {Array.from({ length: 6 }, (_, i) => colTop + 60 + i * 96).map((y) => (
            <g key={y}>
              <rect x="13" y={y} width="10" height="13" fill="#1b1b1e" opacity=".85" />
              <rect x="367" y={y} width="10" height="13" fill="#1b1b1e" opacity=".85" />
            </g>
          ))}
        </>
      ) : null}

      {/* beam */}
      <rect x="190" y="68" width="10" height={baseY - 60} fill="url(#phBeam)" filter="url(#phBlur)" />
      <rect x="194" y="68" width="2" height={baseY - 60} fill="url(#phBeam)" />

      {/* base platform */}
      <ellipse cx="195" cy={baseY} rx="178" ry="34" fill="url(#phChrome)" stroke="#bcc0c8" strokeWidth="1.2" />
      <ellipse cx="195" cy={baseY - 3} rx="150" ry="26" fill="#eef0f3" stroke="#d1d4da" strokeWidth="1" />
      <ellipse cx="195" cy={baseY - 5} rx="122" ry="19" fill="none" stroke="#e5231b" strokeWidth="2.4" opacity=".85" filter="url(#phBlur)" />
      <ellipse cx="195" cy={baseY - 5} rx="122" ry="19" fill="none" stroke="#e5231b" strokeWidth="1" />
      <ellipse cx="195" cy={baseY - 3} rx="84" ry="12" fill="#15151a" stroke="#dcdfe4" strokeWidth="1.1" />
      <ellipse cx="195" cy={baseY - 3} rx="40" ry="6" fill="url(#phGlow)" />
    </svg>
  );
}

/* ── ProductionChamber ────────────────────────────────────────────────── */

export function ProductionChamber({
  mode,
  expanded,
  atmosphereUrl,
  children,
}: {
  mode: HubMode;
  expanded: boolean;
  atmosphereUrl: string | null;
  children: ReactNode;
}) {
  return (
    <section
      className={`ph-chamber ph-chamber--${mode.toLowerCase()}${expanded ? ' is-artifact-expanded' : ''}`}
      aria-label="Production chamber"
      data-testid="hub-chamber"
      data-mode={mode}
    >
      <div className="ph-chamber__atmo" data-asset-slot="production.hub.chamber.atmosphere" data-asset-state={atmosphereUrl ? 'filled' : 'missing'}>
        {atmosphereUrl ? <img src={atmosphereUrl} alt="" draggable={false} /> : null}
      </div>
      <ChamberGeometry mode={mode} />
      {children}
    </section>
  );
}

/* ── NodeQuickActions / ProductionNode ────────────────────────────────── */

const ACTION_ICON: Record<string, JSX.Element> = {
  profile: <IcUser />, looks: <IcShirt />, continuity: <IcInfinity />, performance: <IcPulse />,
  behavior: <IcPulse />, movement: <IcMove />, voice: <IcPulse />,
  zones: <IcSet />, props: <IcSet />, cameras: <IcCam />, graphics: <IcSet />,
  frames: <IcFrames />, sequence: <IcFrames />, authorities: <IcCheck />, compare: <IcFrames />, review: <IcArrowR />,
  story: <IcFrames />, beats: <IcFrames />, proof: <IcCheck />, hair: <IcUser />, makeup: <IcUser />, status: <IcPulse />,
  open: <IcArrowR />,
};

export function NodeQuickActions({ actions, onAction }: { actions: readonly HubNodeAction[]; onAction: (a: HubNodeAction) => void }) {
  return (
    <div className="ph-qa" role="group" aria-label="Node actions">
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          className={`ph-qa__btn${a.kind === 'DEEP_LINK' ? ' is-deep' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onAction(a);
          }}
          data-testid={`node-action-${a.id}`}
        >
          {ACTION_ICON[a.id] ?? <IcArrowR />}
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ProductionNode({
  node,
  selected,
  imageUrl,
  slotLabel,
  compact,
  showDetail,
  onSelect,
  onAction,
}: {
  node: HubNode;
  selected: boolean;
  imageUrl: string | null;
  slotLabel: string;
  compact?: boolean;
  showDetail?: boolean;
  onSelect: () => void;
  onAction: (a: HubNodeAction) => void;
}) {
  const st = node.status.toLowerCase();
  return (
    <div
      className={`ph-node ph-node--${st}${selected ? ' is-selected' : ''}${compact ? ' is-compact' : ''}`}
      data-testid={`hub-node-${node.id}`}
      data-node-status={node.status}
    >
      <button type="button" className="ph-node__face" onClick={onSelect} aria-pressed={selected} aria-label={`${node.label}, ${HUB_STATUS_LABEL[node.status]}`}>
        <span className="ph-node__head">
          <span className="ph-node__no">{pad(node.order)}</span>
          <span className="ph-node__label">{node.label}</span>
        </span>
        {node.status === 'REVIEW_REQUIRED' && !compact ? (
          <span className="ph-node__flag">
            <IcWarn width={10} height={10} /> REVIEW REQUIRED
          </span>
        ) : null}
        <HubImage slotId={node.assetSlotId} url={imageUrl} label={slotLabel} className="ph-node__img" />
        {node.status === 'REVIEW_REQUIRED' ? (
          <span className="ph-node__go" aria-hidden>
            <IcChevR width={14} height={14} />
          </span>
        ) : (
          <span className="ph-node__beacon">
            <StatusBeacon status={node.status} size={compact ? 14 : 18} />
          </span>
        )}
      </button>
      {showDetail ? (
        <div className="ph-node__detail">
          <b>{HUB_STATUS_LABEL[node.status]}</b>
          <span>{node.statusDetail}</span>
        </div>
      ) : null}
      {selected && !compact ? <NodeQuickActions actions={node.quickActions} onAction={onAction} /> : null}
    </div>
  );
}

/* ── ArtifactStage: the central artifact ───────────────────────────────── */

function useSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onLeft : onRight)();
    },
  };
}

export function ArtifactStage({
  scene,
  frame,
  frames,
  frameUrl,
  frameSlotId,
  thumbs,
  expanded,
  onPrev,
  onNext,
  onOpen,
  onOpenScenes,
  onSelectFrame,
}: {
  scene: HubScene | null;
  frame: HubStoryboardFrame | null;
  frames: readonly HubStoryboardFrame[];
  frameUrl: string | null;
  frameSlotId: string;
  thumbs: { frame: HubStoryboardFrame | null; slotId: string; url: string | null }[];
  expanded: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpen: () => void;
  onOpenScenes: () => void;
  onSelectFrame: (id: string) => void;
}) {
  const swipe = useSwipe(onNext, onPrev);
  return (
    <div className={`ph-artifact${expanded ? ' is-expanded' : ''}`} data-testid="hub-artifact">
      <button type="button" className="ph-artifact__head" onClick={onOpenScenes} aria-label="Choose scene">
        <span className="ph-artifact__scene">
          <b>{scene ? `SCENE ${pad(scene.order)}` : 'NO SCENE'}</b>
          <span>{scene?.label ?? 'NO PRODUCTION'}</span>
        </span>
        <span className="ph-artifact__count">
          <small>STORYBOARD</small>
          <b>{frames.length ? `${frame ? frame.number : '–'}/${frames.length}` : '–'}</b>
        </span>
      </button>
      <div className="ph-artifact__view" {...swipe}>
        <button type="button" className="ph-artifact__hit" onClick={onOpen} aria-label="Expand artifact">
          <HubImage slotId={frameSlotId} url={frameUrl} label={frames.length ? 'STORYBOARD FRAME' : 'NO STORYBOARD FRAME'} className="ph-artifact__img" />
        </button>
        <button type="button" className="ph-round ph-round--l" onClick={onPrev} disabled={!frames.length} aria-label="Previous frame" data-testid="artifact-prev">
          <IcChevR style={{ transform: 'scaleX(-1)' }} />
        </button>
        <button type="button" className="ph-round ph-round--r" onClick={onNext} disabled={!frames.length} aria-label="Next frame" data-testid="artifact-next">
          <IcChevR />
        </button>
      </div>
      <div className="ph-artifact__thumbs">
        {thumbs.map((t, i) => (
          <button
            key={t.slotId + i}
            type="button"
            className={`ph-artifact__thumb${t.frame && frame && t.frame.frameId === frame.frameId ? ' is-active' : ''}`}
            disabled={!t.frame}
            onClick={() => t.frame && onSelectFrame(t.frame.frameId)}
            aria-label={t.frame ? `Frame ${t.frame.number}` : 'Empty frame slot'}
          >
            <HubImage slotId={t.slotId} url={t.url} label="" className="ph-artifact__timg" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Filmstrip ─────────────────────────────────────────────────────────── */

export function Filmstrip({
  frames,
  selectedFrameId,
  urlFor,
  slotFor,
  onSelect,
  onStep,
}: {
  frames: readonly HubStoryboardFrame[];
  selectedFrameId: string | null;
  urlFor: (f: HubStoryboardFrame) => string | null;
  slotFor: (n: number) => string;
  onSelect: (id: string) => void;
  onStep: (d: 1 | -1) => void;
}) {
  const empty = frames.length === 0;
  const cells = empty ? Array.from({ length: 8 }, (_, i) => ({ n: i + 1, frame: null as HubStoryboardFrame | null })) : frames.map((f) => ({ n: f.number, frame: f }));
  const swipe = useSwipe(() => onStep(1), () => onStep(-1));
  return (
    <div className="ph-film" data-testid="hub-filmstrip" role="group" aria-label="Storyboard filmstrip">
      <button type="button" className="ph-round ph-round--dark" onClick={() => onStep(-1)} disabled={empty} aria-label="Previous frame">
        <IcArrowL width={16} height={16} />
      </button>
      <div className="ph-film__rail" {...swipe}>
        {cells.map(({ n, frame }) => {
          const active = !!frame && frame.frameId === selectedFrameId;
          return (
            <button
              key={n}
              type="button"
              className={`ph-film__cell${active ? ' is-active' : ''}${empty ? ' is-empty' : ''}`}
              disabled={!frame}
              onClick={() => frame && onSelect(frame.frameId)}
              aria-pressed={active}
              aria-label={frame ? `Frame ${n}` : `Empty frame slot ${n}`}
              ref={(el) => {
                if (el && active) el.scrollIntoView({ inline: 'center', block: 'nearest' });
              }}
            >
              <HubImage slotId={slotFor(n)} url={frame ? urlFor(frame) : null} label="" className="ph-film__img" />
              <i>{pad(n)}</i>
            </button>
          );
        })}
      </div>
      <button type="button" className="ph-round ph-round--dark" onClick={() => onStep(1)} disabled={empty} aria-label="Next frame">
        <IcArrowR width={16} height={16} />
      </button>
    </div>
  );
}

/* ── FlowStage (FLOW mode): sequential production chain ────────────────── */

export function FlowStack({
  nodes,
  selectedNodeId,
  urlFor,
  onSelect,
  onAction,
}: {
  nodes: readonly HubNode[];
  selectedNodeId: HubNodeId | null;
  urlFor: (n: HubNode) => string | null;
  onSelect: (id: HubNodeId) => void;
  onAction: (a: HubNodeAction, n: HubNode) => void;
}) {
  return (
    <ol className="ph-flow" data-testid="hub-flow">
      {nodes.map((n, i) => (
        <li key={n.id} className={`ph-flow__item ph-flow__item--${n.status.toLowerCase()}${selectedNodeId === n.id ? ' is-selected' : ''}`} data-testid={`flow-stage-${n.id}`} data-node-status={n.status}>
          <button type="button" className="ph-flow__card" onClick={() => onSelect(n.id)} aria-pressed={selectedNodeId === n.id}>
            <span className="ph-flow__title">
              <b>{pad(n.order)}</b>
              <span>{n.label}</span>
              {n.status === 'REVIEW_REQUIRED' || n.status === 'BLOCKED' ? (
                <em>
                  <IcWarn width={11} height={11} /> {HUB_STATUS_LABEL[n.status]}
                </em>
              ) : n.status === 'LOCKED' ? (
                <em>
                  <IcLock width={11} height={11} /> LOCKED
                </em>
              ) : null}
            </span>
            <HubImage slotId={n.assetSlotId} url={urlFor(n)} label={n.label} className="ph-flow__img" />
            <span className="ph-flow__state">
              {n.status === 'COMPLETE' ? <small>COMPLETED</small> : n.status === 'ACTIVE' ? <small>IN PROGRESS</small> : n.status === 'NOT_STARTED' ? <small>NOT STARTED</small> : null}
              {n.status === 'REVIEW_REQUIRED' ? (
                <span className="ph-flow__go" aria-hidden>
                  <IcArrowR width={16} height={16} />
                </span>
              ) : (
                <StatusBeacon status={n.status} size={26} />
              )}
            </span>
          </button>
          {selectedNodeId === n.id ? <NodeQuickActions actions={n.quickActions} onAction={(a) => onAction(a, n)} /> : null}
          {i < nodes.length - 1 ? (
            <span className="ph-flow__link" aria-hidden>
              <IcArrowD width={12} height={12} />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/* ── DependencyRails (DEPENDENCIES mode) ───────────────────────────────── */

/** Left/right node columns joined to the central downstream card by live SVG rails. */
export function DependencyRails({ status }: { status: Record<'l' | 'r', HubNodeStatus[]> }) {
  // Three rows per side; percentage-based x so rails track the responsive grid.
  const rowY = [75, 241, 407];
  const cy = 241;
  const side = (dir: 'l' | 'r') =>
    rowY.map((y, i) => {
      const s = status[dir][i]!;
      const x0 = dir === 'l' ? 25 : 75;
      const xm = dir === 'l' ? 30 : 70;
      const x1 = dir === 'l' ? 33 : 67;
      const hot = s === 'REVIEW_REQUIRED' || s === 'BLOCKED';
      return (
        <path
          key={`${dir}${i}`}
          d={`M${x0} ${y} H${xm} V${cy + (i - 1) * 10} H${x1}`}
          className={`ph-rail ph-rail--${s.toLowerCase()}${hot ? ' is-hot' : ''}`}
          vectorEffect="non-scaling-stroke"
        />
      );
    });
  return (
    <svg className="ph-rails" viewBox="0 0 100 482" preserveAspectRatio="none" aria-hidden data-testid="hub-dependency-rails">
      {side('l')}
      {side('r')}
    </svg>
  );
}

export function DependencyCard({
  node,
  url,
  sceneLabel,
  sceneOrder,
  onOpen,
}: {
  node: HubNode;
  url: string | null;
  sceneLabel: string;
  sceneOrder: number | null;
  onOpen: () => void;
}) {
  return (
    <button type="button" className={`ph-depcard ph-depcard--${node.status.toLowerCase()}`} onClick={onOpen} data-testid="hub-dependency-downstream">
      <span className="ph-depcard__scene">
        <b>{sceneOrder ? `SCENE ${pad(sceneOrder)}` : 'SCENE'}</b>
        <span>{sceneLabel}</span>
      </span>
      <HubImage slotId={node.assetSlotId} url={url} label={node.label} className="ph-depcard__img" />
      <span className="ph-depcard__foot">
        <b>{node.label}</b>
        <span>
          {node.status === 'LOCKED' ? <IcLock width={12} height={12} /> : null}
          {HUB_STATUS_LABEL[node.status]}
        </span>
      </span>
      <span className="ph-depcard__detail">{node.statusDetail}</span>
    </button>
  );
}

export function DependencyNode({
  node,
  selected,
  url,
  slotLabel,
  onSelect,
  onAction,
}: {
  node: HubNode;
  selected: boolean;
  url: string | null;
  slotLabel: string;
  onSelect: () => void;
  onAction: (a: HubNodeAction) => void;
}) {
  return (
    <div className={`ph-depnode ph-depnode--${node.status.toLowerCase()}${selected ? ' is-selected' : ''}`} data-testid={`dep-node-${node.id}`} data-node-status={node.status}>
      <button type="button" onClick={onSelect} aria-pressed={selected} className="ph-depnode__face">
        <span className="ph-depnode__head">
          <b>{pad(node.order)}</b>
          <span>{node.label}</span>
          <StatusBeacon status={node.status} size={16} />
        </span>
        <HubImage slotId={node.assetSlotId} url={url} label={slotLabel} className="ph-depnode__img" />
        <span className="ph-depnode__status">{HUB_STATUS_LABEL[node.status]}</span>
        <span className="ph-depnode__detail">{node.statusDetail}</span>
      </button>
      {selected ? <NodeQuickActions actions={node.quickActions} onAction={onAction} /> : null}
    </div>
  );
}

export function DependencyLegend() {
  const items: { s: HubNodeStatus; t: string; d: string }[] = [
    { s: 'COMPLETE', t: 'COMPLETE', d: 'READY AND APPROVED' },
    { s: 'ACTIVE', t: 'IN PROGRESS', d: 'IN WORK OR PENDING' },
    { s: 'REVIEW_REQUIRED', t: 'REVIEW REQUIRED', d: 'ACTION REQUIRED' },
    { s: 'NOT_STARTED', t: 'NOT STARTED', d: 'NO WORK YET' },
  ];
  return (
    <ul className="ph-legend" aria-label="Status legend">
      {items.map((i) => (
        <li key={i.s}>
          <StatusBeacon status={i.s} size={20} />
          <span>
            <b>{i.t}</b>
            <small>{i.d}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}
