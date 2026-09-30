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

/* ── Machine mounts (decorative, aria-hidden) ─────────────────────────────
 * DependencySocket: the arm + socket that docks a station module into the chamber.
 * ArtifactHolder: optical shells, clamps and side tracks that physically hold the active artifact.
 * Status is expressed through the socket LED and arm channel (rail state), not only text.
 */

export function DependencySocket({ status, selected }: { status: HubNodeStatus; selected?: boolean }) {
  return (
    <span className={`ph-socket ph-socket--${status.toLowerCase()}${selected ? ' is-selected' : ''}`} aria-hidden>
      <i className="ph-socket__arm" />
      <i className="ph-socket__port" />
    </span>
  );
}

export function ArtifactHolder() {
  return (
    <span className="ph-holder" aria-hidden>
      <i className="ph-holder__shell ph-holder__shell--2" />
      <i className="ph-holder__shell ph-holder__shell--1" />
      <i className="ph-holder__track ph-holder__track--l" />
      <i className="ph-holder__track ph-holder__track--r" />
      <i className="ph-holder__clamp ph-holder__clamp--t" />
      <i className="ph-holder__clamp ph-holder__clamp--b" />
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

/* ── ChamberGeometry: the physical apparatus — SVG, no raster ───────────
 * Read back-to-front: floor shadow → rear glass cylinder → volumetric beam →
 * upper collar (seen from beneath) → base plinth (seen from above).
 * Modules, artifact holder and controls mount in front of this in live DOM.
 */

export const CHAMBER_HEIGHT: Record<HubMode, number> = { LIVE: 540, FLOW: 752, DEPENDENCIES: 792 };

/** Cylinder x-extents per mode: LIVE holds the artifact, FLOW widens to carry the chain, DEPENDENCIES narrows to the downstream core. */
const COLUMN_X: Record<HubMode, [number, number]> = { LIVE: [104, 286], FLOW: [34, 356], DEPENDENCIES: [118, 272] };

function Ring({ cy, rx, ry, band, face, stroke = '#b4b8c0' }: { cy: number; rx: number; ry: number; band: number; face: string; stroke?: string }) {
  // A machined ring with real thickness: the visible side band plus its top face.
  const x0 = 195 - rx;
  const x1 = 195 + rx;
  return (
    <g>
      <path d={`M${x0} ${cy} A${rx} ${ry} 0 0 0 ${x1} ${cy} V${cy + band} A${rx} ${ry} 0 0 1 ${x0} ${cy + band} Z`} fill="url(#phRim)" stroke={stroke} strokeWidth=".8" />
      <ellipse cx="195" cy={cy} rx={rx} ry={ry} fill={face} stroke={stroke} strokeWidth=".8" />
      <path d={`M${x0 + 6} ${cy + 1} A${rx - 6} ${ry - 2} 0 0 0 ${x1 - 6} ${cy + 1}`} fill="none" stroke="#fff" strokeWidth="1.1" opacity=".9" />
    </g>
  );
}

export function ChamberGeometry({ mode }: { mode: HubMode }) {
  const H = CHAMBER_HEIGHT[mode];
  const baseY = H - 84;
  const collarY = 74;
  const colTop = collarY + 8;
  const colBottom = baseY - 14;
  const [cx0, cx1] = COLUMN_X[mode];
  const flow = mode === 'FLOW';
  return (
    <svg className={`ph-geo ph-geo--${mode.toLowerCase()}`} viewBox={`0 0 390 ${H}`} preserveAspectRatio="none" aria-hidden data-testid="hub-chamber-geometry">
      <defs>
        <linearGradient id="phFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#eceef1" />
          <stop offset="1" stopColor="#d9dce1" />
        </linearGradient>
        <linearGradient id="phFaceUnder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4d7dd" />
          <stop offset=".6" stopColor="#f3f4f6" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        {/* cylindrical chrome: dark flanks, bright specular band left of centre */}
        <linearGradient id="phRim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9da2ab" />
          <stop offset=".14" stopColor="#e9ebee" />
          <stop offset=".3" stopColor="#ffffff" />
          <stop offset=".42" stopColor="#c3c7ce" />
          <stop offset=".62" stopColor="#f5f6f8" />
          <stop offset=".86" stopColor="#d5d8dd" />
          <stop offset="1" stopColor="#8f949d" />
        </linearGradient>
        <linearGradient id="phCyl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".82" />
          <stop offset=".07" stopColor="#ffffff" stopOpacity=".28" />
          <stop offset=".22" stopColor="#dfe3ea" stopOpacity=".1" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".04" />
          <stop offset=".78" stopColor="#dfe3ea" stopOpacity=".1" />
          <stop offset=".93" stopColor="#ffffff" stopOpacity=".3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".82" />
        </linearGradient>
        <linearGradient id="phBeamV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff3b30" stopOpacity=".2" />
          <stop offset=".06" stopColor="#ff3b30" stopOpacity="1" />
          <stop offset=".94" stopColor="#ff3b30" stopOpacity="1" />
          <stop offset="1" stopColor="#ff3b30" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id="phBeamSpill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e5231b" stopOpacity="0" />
          <stop offset=".5" stopColor="#e5231b" stopOpacity=".26" />
          <stop offset="1" stopColor="#e5231b" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="phBeamCore" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e5231b" />
          <stop offset=".5" stopColor="#fff3f1" />
          <stop offset="1" stopColor="#e5231b" />
        </linearGradient>
        <radialGradient id="phLens" cx=".42" cy=".3" r=".8">
          <stop offset="0" stopColor="#4a4c53" />
          <stop offset=".55" stopColor="#1c1d21" />
          <stop offset="1" stopColor="#0c0c0e" />
        </radialGradient>
        <radialGradient id="phGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ff4a3d" stopOpacity=".85" />
          <stop offset=".45" stopColor="#e5231b" stopOpacity=".32" />
          <stop offset="1" stopColor="#e5231b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="phFloor" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#1a1c22" stopOpacity=".28" />
          <stop offset="1" stopColor="#1a1c22" stopOpacity="0" />
        </radialGradient>
        <filter id="phBlur" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id="phBlurWide" x="-200%" y="-5%" width="500%" height="110%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* floor contact shadow */}
      <ellipse cx="195" cy={baseY + 26} rx="200" ry="34" fill="url(#phFloor)" />

      {/* rear glass cylinder: optical shell with thickness + inner wall */}
      <rect x={cx0} y={colTop} width={cx1 - cx0} height={colBottom - colTop} fill="url(#phCyl)" />
      <path d={`M${cx0} ${colTop} V${colBottom} M${cx1} ${colTop} V${colBottom}`} stroke="#b9bdc5" strokeWidth="1.2" fill="none" />
      <path d={`M${cx0 + 4} ${colTop} V${colBottom} M${cx1 - 4} ${colTop} V${colBottom}`} stroke="#ffffff" strokeWidth="1.4" fill="none" opacity=".95" />
      <path d={`M${cx0 + 16} ${colTop + 10} V${colBottom - 10}`} stroke="#ffffff" strokeWidth="3" fill="none" opacity=".55" />
      {/* inner back-wall rings: the cylinder has a far side */}
      {[0.34, 0.67].map((t) => {
        const y = colTop + (colBottom - colTop) * t;
        return <path key={t} d={`M${cx0} ${y} A${(cx1 - cx0) / 2} 10 0 0 1 ${cx1} ${y}`} fill="none" stroke="#c9cdd4" strokeWidth=".9" opacity=".7" />;
      })}

      {/* volumetric fabrication beam: optical spill → glow → hot core */}
      <rect x="165" y={collarY + 10} width="60" height={baseY - collarY - 20} fill="url(#phBeamSpill)" className="ph-geo__spill" />
      <rect x="189" y={collarY + 10} width="12" height={baseY - collarY - 20} fill="url(#phBeamV)" filter="url(#phBlurWide)" opacity=".75" className="ph-geo__glow" />
      <rect x="193.2" y={collarY + 10} width="3.6" height={baseY - collarY - 20} fill="url(#phBeamCore)" opacity=".95" />

      {/* FLOW: glass carrier tubes with a lit routing core either side of the chain */}
      {flow
        ? [16, 364].map((x) => (
            <g key={x}>
              <rect x={x} y={colTop + 4} width="10" height={colBottom - colTop - 8} rx="5" fill="url(#phCyl)" stroke="#bfc3ca" strokeWidth=".9" />
              <rect x={x + 4.3} y={colTop + 10} width="1.4" height={colBottom - colTop - 20} fill="#e5231b" opacity=".75" />
              <rect x={x + 1.5} y={colTop + 10} width="1.2" height={colBottom - colTop - 20} fill="#fff" opacity=".9" />
            </g>
          ))
        : null}

      {/* upper collar, seen from beneath: stacked housing drums, stepped underside, lit ring, dark aperture well */}
      <path d={`M60 0 H330 V${collarY - 34} A135 14 0 0 1 60 ${collarY - 34} Z`} fill="url(#phRim)" />
      <ellipse cx="195" cy={collarY - 34} rx="135" ry="14" fill="url(#phFaceUnder)" stroke="#aeb2ba" strokeWidth=".8" />
      <ellipse cx="195" cy={collarY - 32} rx="112" ry="10" fill="none" stroke="#e5231b" strokeWidth=".9" opacity=".75" />
      <path d={`M24 ${collarY - 30} H366 V${collarY} A171 30 0 0 1 24 ${collarY} Z`} fill="url(#phRim)" />
      <path d={`M24 ${collarY - 30} V${collarY} M366 ${collarY - 30} V${collarY}`} stroke="#9aa0a9" strokeWidth=".8" />
      <path d={`M24 ${collarY - 22} H366`} stroke="#fff" strokeWidth="1" opacity=".8" />
      <path d={`M24 ${collarY - 21} H366`} stroke="#9aa0a9" strokeWidth=".6" opacity=".6" />
      <ellipse cx="195" cy={collarY} rx="171" ry="30" fill="url(#phFaceUnder)" stroke="#aeb2ba" strokeWidth="1" />
      <ellipse cx="195" cy={collarY + 4} rx="146" ry="24" fill="#eceef1" stroke="#c3c7ce" strokeWidth=".8" />
      <ellipse cx="195" cy={collarY + 6} rx="128" ry="20" fill="none" stroke="#e5231b" strokeWidth="4" opacity=".7" filter="url(#phBlur)" />
      <ellipse cx="195" cy={collarY + 6} rx="128" ry="20" fill="none" stroke="#ff4034" strokeWidth="1.3" />
      <ellipse cx="195" cy={collarY + 8} rx="110" ry="16" fill="#dfe2e6" stroke="#2a2b30" strokeWidth="1.6" strokeOpacity=".55" />
      <ellipse cx="195" cy={collarY + 10} rx="84" ry="12" fill="url(#phLens)" stroke="#f4f5f7" strokeWidth="1.4" />
      <ellipse cx="195" cy={collarY + 10} rx="62" ry="8" fill="none" stroke="#e5231b" strokeWidth=".9" opacity=".8" />
      <ellipse cx="195" cy={collarY + 11} rx="30" ry="6" fill="url(#phGlow)" />

      {/* base plinth, seen from above: two machined tiers, recessed track, lit ring, emitter lens */}
      <Ring cy={baseY} rx={186} ry={34} band={18} face="url(#phFace)" />
      <Ring cy={baseY - 12} rx={150} ry={26} band={12} face="url(#phFace)" stroke="#bfc3ca" />
      <ellipse cx="195" cy={baseY - 12} rx="134" ry="22.5" fill="none" stroke="#24252a" strokeWidth="2" opacity=".5" />
      <ellipse cx="195" cy={baseY - 13} rx="120" ry="20" fill="none" stroke="#e5231b" strokeWidth="4.5" opacity=".7" filter="url(#phBlur)" />
      <ellipse cx="195" cy={baseY - 13} rx="120" ry="20" fill="none" stroke="#ff4034" strokeWidth="1.3" />
      <ellipse cx="195" cy={baseY - 14} rx="100" ry="16.5" fill="#e4e6ea" stroke="#fff" strokeWidth="1.4" />
      <ellipse cx="195" cy={baseY - 14} rx="70" ry="11" fill="url(#phLens)" stroke="#c9ccd2" strokeWidth="1.2" />
      <path d={`M${195 - 58} ${baseY - 17} A58 7 0 0 1 ${195 + 24} ${baseY - 21}`} fill="none" stroke="#fff" strokeWidth="1.1" opacity=".35" />
      <ellipse cx="195" cy={baseY - 14} rx="52" ry="8" fill="url(#phGlow)" opacity=".85" />
      <ellipse cx="195" cy={baseY - 14} rx="8" ry="2.6" fill="#fff5f4" />
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
      <DependencySocket status={node.status} selected={selected} />
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
      <ArtifactHolder />
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
      <span className="ph-film__tray" aria-hidden />
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
          <span className="ph-flow__clamp ph-flow__clamp--l" aria-hidden />
          <span className="ph-flow__clamp ph-flow__clamp--r" aria-hidden />
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
      const d = `M${x0} ${y} H${xm} V${cy + (i - 1) * 10} H${x1}`;
      // Conduit: outer casing, recessed channel, then the status-lit signal core.
      return (
        <g key={`${dir}${i}`} className={`ph-rail ph-rail--${s.toLowerCase()}${hot ? ' is-hot' : ''}`}>
          <path d={d} className="ph-rail__case" vectorEffect="non-scaling-stroke" />
          <path d={d} className="ph-rail__chan" vectorEffect="non-scaling-stroke" />
          <path d={d} className="ph-rail__core" vectorEffect="non-scaling-stroke" />
        </g>
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
      <ArtifactHolder />
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
      <DependencySocket status={node.status} selected={selected} />
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
