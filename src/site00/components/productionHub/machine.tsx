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
  HubNodePanelFace,
  HubNodeStatus,
  HubScene,
  HubStoryboardFrame,
} from '../../../../shared/site00-production-hub/types.js';
import { HUB_MEDIA, HubImage } from './HubImage';
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

/* ── ChamberGeometry — authority apparatus in the 864px authority coordinate space ──
 * Drum collar (seen from beneath) → glass production column → queued frame plates →
 * red routing arrows to the six stations → volumetric beam → ringed plinth.
 * Live SVG only; the chamber atmosphere photograph is a separate named asset slot.
 */

/** Chamber heights in authority px (864 wide). */
export const CHAMBER_HEIGHT: Record<HubMode, number> = { LIVE: 690, FLOW: 1010, DEPENDENCIES: 715 };
export const CHAMBER_HEIGHT_EXPANDED = 970;

type Geo = { H: number; colX: [number, number]; colTop: number; baseY: number; collarY: number };
function geoFor(mode: HubMode, expanded: boolean): Geo {
  if (mode === 'FLOW') return { H: 1010, colX: [140, 724], colTop: 120, baseY: 955, collarY: 72 };
  if (mode === 'DEPENDENCIES') return { H: 715, colX: [300, 564], colTop: 120, baseY: 640, collarY: 72 };
  if (expanded) return { H: 970, colX: [196, 668], colTop: 120, baseY: 790, collarY: 72 };
  return { H: 690, colX: [305, 560], colTop: 110, baseY: 560, collarY: 72 };
}

function RingStack({ cy, rx, ry, under }: { cy: number; rx: number; ry: number; under: boolean }) {
  // Concentric machined rings: chrome steps, dark recessed track, lit red rings.
  const k = under ? 1 : -1;
  return (
    <g>
      <ellipse cx="432" cy={cy} rx={rx} ry={ry} fill="url(#phgFace)" stroke="#9ea3ab" strokeWidth="1.5" />
      <ellipse cx="432" cy={cy + k * 6} rx={rx * 0.9} ry={ry * 0.86} fill="none" stroke="#ffffff" strokeWidth="3" opacity=".9" />
      <ellipse cx="432" cy={cy + k * 9} rx={rx * 0.82} ry={ry * 0.78} fill="none" stroke="#e5231b" strokeWidth="7" opacity=".55" filter="url(#phgBlur)" />
      <ellipse cx="432" cy={cy + k * 9} rx={rx * 0.82} ry={ry * 0.78} fill="none" stroke="#ff3b30" strokeWidth="2.4" />
      <ellipse cx="432" cy={cy + k * 13} rx={rx * 0.7} ry={ry * 0.66} fill="#d9dce1" stroke="#1d1e22" strokeWidth="3" strokeOpacity=".75" />
      <ellipse cx="432" cy={cy + k * 16} rx={rx * 0.6} ry={ry * 0.56} fill="none" stroke="#ffffff" strokeWidth="2" />
      <ellipse cx="432" cy={cy + k * 19} rx={rx * 0.5} ry={ry * 0.46} fill="#eceef1" stroke="#b8bcc4" strokeWidth="1.5" />
      <ellipse cx="432" cy={cy + k * 21} rx={rx * 0.32} ry={ry * 0.3} fill="url(#phgWell)" stroke="#ffffff" strokeWidth="2" />
      <ellipse cx="432" cy={cy + k * 20} rx={rx * 0.42} ry={ry * 0.38} fill="none" stroke="#ff3b30" strokeWidth="1.6" opacity=".9" />
      <ellipse cx="432" cy={cy + k * 22} rx={rx * 0.22} ry={ry * 0.2} fill="url(#phgGlow)" />
    </g>
  );
}

function PlateStack({ x, y, h, dir }: { x: number; y: number; h: number; dir: 1 | -1 }) {
  // Queued frame plates behind the artifact: glass slabs with dark frame windows and red registration.
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const px = x + dir * i * 11;
        const w = 44 - i * 3;
        const top = y + i * 10;
        const hh = h - i * 20;
        return (
          <g key={i} opacity={1 - i * 0.18}>
            <rect x={dir === 1 ? px : px - w} y={top} width={w} height={hh} rx="6" fill="url(#phgPlate)" stroke="#ffffff" strokeWidth="2" />
            <rect x={dir === 1 ? px : px - w} y={top} width={w} height={hh} rx="6" fill="none" stroke="#b7bbc3" strokeWidth=".8" />
            <rect x={(dir === 1 ? px : px - w) + 12} y={top + 40} width={w - 24} height={hh - 100} rx="2" fill="#1d1e22" opacity=".55" />
            <path d={`M${(dir === 1 ? px : px - w) + 5} ${top + 12}v-6h6`} stroke="#e5231b" strokeWidth="1.6" fill="none" />
          </g>
        );
      })}
    </g>
  );
}

function RoutingArrow({ d, end, dir }: { d: string; end: [number, number]; dir: 1 | -1 }) {
  const [ex, ey] = end;
  return (
    <g className="ph-geo__route">
      <path d={d} fill="none" stroke="#e5231b" strokeWidth="1.8" />
      <path d={`M${ex} ${ey} l${dir * 9} -5 v10 z`} fill="#e5231b" />
    </g>
  );
}

export function ChamberGeometry({
  mode,
  expanded = false,
  suppressLegacyScenery = false,
}: {
  mode: HubMode;
  expanded?: boolean;
  /** When the Grok atmosphere plate is mounted, hide SVG scenery that duplicates it. */
  suppressLegacyScenery?: boolean;
}) {
  const g = geoFor(mode, expanded && mode === 'LIVE');
  const { H, colX, colTop, baseY, collarY } = g;
  const [cx0, cx1] = colX;
  const live = mode === 'LIVE';
  const flow = mode === 'FLOW';
  if (suppressLegacyScenery) {
    return (
      <svg
        className={`ph-geo ph-geo--${mode.toLowerCase()} ph-geo--env-mounted`}
        viewBox={`0 0 864 ${H}`}
        preserveAspectRatio="none"
        aria-hidden
        data-testid="hub-chamber-geometry"
      />
    );
  }
  return (
    <svg className={`ph-geo ph-geo--${mode.toLowerCase()}`} viewBox={`0 0 864 ${H}`} preserveAspectRatio="none" aria-hidden data-testid="hub-chamber-geometry">
      <defs>
        <linearGradient id="phgDrum" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8e939c" />
          <stop offset=".1" stopColor="#dfe2e6" />
          <stop offset=".24" stopColor="#ffffff" />
          <stop offset=".36" stopColor="#aeb3bb" />
          <stop offset=".5" stopColor="#eef0f2" />
          <stop offset=".66" stopColor="#ffffff" />
          <stop offset=".82" stopColor="#bfc3ca" />
          <stop offset="1" stopColor="#848992" />
        </linearGradient>
        <linearGradient id="phgFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f8f9" />
          <stop offset=".5" stopColor="#d6d9de" />
          <stop offset="1" stopColor="#f4f5f7" />
        </linearGradient>
        <radialGradient id="phgWell" cx=".5" cy=".45" r=".6">
          <stop offset="0" stopColor="#9a9da5" />
          <stop offset=".6" stopColor="#45474e" />
          <stop offset="1" stopColor="#25262b" />
        </radialGradient>
        <linearGradient id="phgCol" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".85" />
          <stop offset=".06" stopColor="#ffffff" stopOpacity=".35" />
          <stop offset=".2" stopColor="#e8ecf2" stopOpacity=".12" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".05" />
          <stop offset=".8" stopColor="#e8ecf2" stopOpacity=".12" />
          <stop offset=".94" stopColor="#ffffff" stopOpacity=".38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".85" />
        </linearGradient>
        <linearGradient id="phgPlate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="1" stopColor="#e3e6ea" stopOpacity=".85" />
        </linearGradient>
        <linearGradient id="phgBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff3b30" stopOpacity=".15" />
          <stop offset=".08" stopColor="#ff3b30" />
          <stop offset=".92" stopColor="#ff3b30" />
          <stop offset="1" stopColor="#ff3b30" stopOpacity=".15" />
        </linearGradient>
        <linearGradient id="phgSpill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e5231b" stopOpacity="0" />
          <stop offset=".5" stopColor="#e5231b" stopOpacity=".22" />
          <stop offset="1" stopColor="#e5231b" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="phgGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".25" stopColor="#ff4a3d" stopOpacity=".9" />
          <stop offset="1" stopColor="#e5231b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="phgFloor" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="phgBlur" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="phgBlurW" x="-300%" y="-5%" width="700%" height="110%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* floor sheen under the plinth */}
      <ellipse cx="432" cy={baseY + 40} rx="430" ry="70" fill="url(#phgFloor)" />

      {/* plinth (seen from above) */}
      <path d={`M${432 - 300} ${baseY} A300 62 0 0 0 ${432 + 300} ${baseY} V${baseY + 26} A300 62 0 0 1 ${432 - 300} ${baseY + 26} Z`} fill="url(#phgDrum)" />
      <RingStack cy={baseY} rx={300} ry={62} under={false} />

      {/* glass production column */}
      <rect x={cx0} y={colTop} width={cx1 - cx0} height={baseY - colTop - 18} fill="url(#phgCol)" />
      <path d={`M${cx0} ${colTop} V${baseY - 18} M${cx1} ${colTop} V${baseY - 18}`} stroke="#c3c7ce" strokeWidth="2" />
      <path d={`M${cx0 + 7} ${colTop} V${baseY - 18} M${cx1 - 7} ${colTop} V${baseY - 18}`} stroke="#ffffff" strokeWidth="3" opacity=".9" />
      <path d={`M${cx0 + 30} ${colTop + 20} V${baseY - 40}`} stroke="#ffffff" strokeWidth="6" opacity=".45" />
      {[0.33, 0.66].map((t) => {
        const y = colTop + (baseY - colTop) * t;
        return <path key={t} d={`M${cx0} ${y} A${(cx1 - cx0) / 2} 22 0 0 1 ${cx1} ${y}`} fill="none" stroke="#c9cdd4" strokeWidth="1.5" opacity=".7" />;
      })}

      {/* beam: spill → glow → hot core */}
      <rect x="372" y={collarY + 30} width="120" height={baseY - collarY - 20} fill="url(#phgSpill)" />
      <rect x="424" y={collarY + 30} width="16" height={baseY - collarY - 20} fill="url(#phgBeam)" filter="url(#phgBlurW)" opacity=".8" className="ph-geo__glow" />
      <rect x="429.5" y={collarY + 30} width="5" height={baseY - collarY - 20} fill="#ff4a3d" />
      <rect x="431.3" y={collarY + 30} width="1.4" height={baseY - collarY - 20} fill="#ffffff" opacity=".85" />
      <ellipse cx="432" cy={baseY + 18} rx="60" ry="12" fill="url(#phgGlow)" />

      {live && !expanded ? (
        <>
          <PlateStack x={255} y={215} h={320} dir={-1} />
          <PlateStack x={606} y={215} h={320} dir={1} />
          <PlateStack x={300} y={205} h={330} dir={-1} />
          <PlateStack x={566} y={205} h={330} dir={1} />
          <RoutingArrow d="M262 218 C262 185 248 168 228 168" end={[228, 168]} dir={1} />
          <RoutingArrow d="M258 360 H228" end={[228, 360]} dir={1} />
          <RoutingArrow d="M262 470 C262 500 250 516 228 516" end={[228, 516]} dir={1} />
          <RoutingArrow d="M602 218 C602 185 616 168 636 168" end={[636, 168]} dir={-1} />
          <RoutingArrow d="M606 360 H636" end={[636, 360]} dir={-1} />
          <RoutingArrow d="M602 470 C602 500 614 516 636 516" end={[636, 516]} dir={-1} />
        </>
      ) : null}

      {flow
        ? [150, 704].map((x) => (
            <g key={x}>
              <rect x={x} y={colTop + 60} width="12" height={baseY - colTop - 120} rx="6" fill="url(#phgCol)" stroke="#bfc3ca" strokeWidth="1.2" />
              <rect x={x + 5} y={colTop + 70} width="2" height={baseY - colTop - 140} fill="#e5231b" opacity=".8" />
            </g>
          ))
        : null}

      {/* collar drum + underside ring stack (seen from beneath) */}
      <path d={`M162 0 H702 V${collarY - 8} A270 50 0 0 1 162 ${collarY - 8} Z`} fill="url(#phgDrum)" />
      <path d={`M162 22 H702 M162 26 H702`} stroke="#ffffff" strokeWidth="1.5" opacity=".8" />
      <path d="M162 0 V64 M702 0 V64" stroke="#8a8f98" strokeWidth="1.5" />
      <RingStack cy={collarY} rx={270} ry={50} under />
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
  const envOn = !!atmosphereUrl;
  return (
    <section
      className={`ph-chamber ph-chamber--${mode.toLowerCase()}${expanded ? ' is-artifact-expanded' : ''}${envOn ? ' has-authority-env' : ''}`}
      aria-label="Production chamber"
      data-testid="hub-chamber"
      data-mode={mode}
      data-environment={envOn ? 'ph.environment.chamber.base' : undefined}
    >
      <div className="ph-chamber__atmo" data-asset-slot="production.hub.chamber.atmosphere" data-asset-state={envOn ? 'filled' : 'missing'}>
        {atmosphereUrl ? <img src={atmosphereUrl} alt="" draggable={false} data-testid="hub-environment-plate" data-media-role="DECORATIVE_ART" data-media-scale="PLATE" data-media-crop="HUB_ATMOSPHERE" /> : null}
      </div>
      <ChamberGeometry mode={mode} expanded={expanded} suppressLegacyScenery={envOn} />
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
  panelFace = 'SUMMARY',
  onSelect,
  onBack,
  onAction,
}: {
  node: HubNode;
  selected: boolean;
  imageUrl: string | null;
  slotLabel: string;
  compact?: boolean;
  panelFace?: HubNodePanelFace;
  onSelect: () => void;
  onBack?: () => void;
  onAction: (a: HubNodeAction) => void;
}) {
  const st = node.status.toLowerCase();
  const detail = selected && !compact && panelFace === 'DETAIL';
  return (
    <div
      className={`ph-node ph-node--${st}${selected ? ' is-selected' : ''}${compact ? ' is-compact' : ''}${detail ? ' is-detail' : ''}`}
      data-testid={`hub-node-${node.id}`}
      data-node-status={node.status}
      data-panel-face={selected ? panelFace : 'SUMMARY'}
    >
      <button type="button" className="ph-node__face" onClick={onSelect} aria-pressed={selected} aria-label={`${node.label}, ${HUB_STATUS_LABEL[node.status]}`}>
        {detail ? (
          <>
            <span className="ph-node__detailbar">
              <span
                className="ph-node__back"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onBack?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onBack?.();
                  }
                }}
                data-testid={`hub-node-back-${node.id}`}
              >
                <IcArrowL width={12} height={12} /> BACK
              </span>
              <span className="ph-node__label">{node.label}</span>
            </span>
            <span className="ph-node__detailcopy">
              <b>{HUB_STATUS_LABEL[node.status]}</b>
              <span>{node.statusDetail}</span>
            </span>
            <NodeQuickActions actions={node.quickActions} onAction={onAction} />
          </>
        ) : (
          <>
            <span className="ph-node__head">
              <span className="ph-node__no">{pad(node.order)}</span>
              <span className="ph-node__label">{node.label}</span>
            </span>
            {node.status === 'REVIEW_REQUIRED' && !compact ? (
              <span className="ph-node__flag">
                <IcWarn width={10} height={10} /> REVIEW REQUIRED
              </span>
            ) : null}
            <HubImage slotId={node.assetSlotId} url={imageUrl} label={slotLabel} className="ph-node__img" {...HUB_MEDIA.nodeChip} />
            {node.status === 'REVIEW_REQUIRED' ? (
              <span className="ph-node__go" aria-hidden>
                <IcChevR width={14} height={14} />
              </span>
            ) : (
              <span className="ph-node__beacon">
                <StatusBeacon status={node.status} size={compact ? 14 : 18} />
              </span>
            )}
          </>
        )}
      </button>
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
          <HubImage slotId={frameSlotId} url={frameUrl} label={frames.length ? 'STORYBOARD FRAME' : 'NO STORYBOARD FRAME'} className="ph-artifact__img" {...HUB_MEDIA.frameCard} />
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
            <HubImage slotId={t.slotId} url={t.url} label="" className="ph-artifact__timg" {...HUB_MEDIA.frameChip} />
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
              style={{ ['--k' as string]: n - (cells.length + 1) / 2 }}
              disabled={!frame}
              onClick={() => frame && onSelect(frame.frameId)}
              aria-pressed={active}
              aria-label={frame ? `Frame ${n}` : `Empty frame slot ${n}`}
              ref={(el) => {
                if (el && active) el.scrollIntoView({ inline: 'center', block: 'nearest' });
              }}
            >
              <HubImage slotId={slotFor(n)} url={frame ? urlFor(frame) : null} label="" className="ph-film__img" {...HUB_MEDIA.frameChip} />
              <i>{pad(n)}</i>
              {active ? <span className="ph-film__live" aria-hidden /> : null}
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
  selectedNodePanelFace = 'SUMMARY',
  urlFor,
  onSelect,
  onBack,
  onAction,
}: {
  nodes: readonly HubNode[];
  selectedNodeId: HubNodeId | null;
  selectedNodePanelFace?: HubNodePanelFace;
  urlFor: (n: HubNode) => string | null;
  onSelect: (id: HubNodeId) => void;
  onBack?: () => void;
  onAction: (a: HubNodeAction, n: HubNode) => void;
}) {
  return (
    <ol className="ph-flow" data-testid="hub-flow">
      {nodes.map((n, i) => (
        <li key={n.id} className={`ph-flow__item ph-flow__item--${n.status.toLowerCase()}${selectedNodeId === n.id ? ' is-selected' : ''}`} data-testid={`flow-stage-${n.id}`} data-node-status={n.status}>
          <span className="ph-flow__clamp ph-flow__clamp--l" aria-hidden />
          <span className="ph-flow__clamp ph-flow__clamp--r" aria-hidden />
          <button type="button" className="ph-flow__card" onClick={() => onSelect(n.id)} aria-pressed={selectedNodeId === n.id}>
            {selectedNodeId === n.id && selectedNodePanelFace === 'DETAIL' ? (
              <>
                <span className="ph-flow__detailbar">
                  <span
                    className="ph-flow__back"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBack?.();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        onBack?.();
                      }
                    }}
                    data-testid={`flow-node-back-${n.id}`}
                  >
                    <IcArrowL width={12} height={12} /> BACK
                  </span>
                  <span>{n.label}</span>
                </span>
                <span className="ph-flow__detailcopy">{n.statusDetail}</span>
                <NodeQuickActions actions={n.quickActions} onAction={(a) => onAction(a, n)} />
              </>
            ) : (
              <>
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
                <HubImage slotId={n.assetSlotId} url={urlFor(n)} label={n.label} className="ph-flow__img" {...HUB_MEDIA.nodeCard} />
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
              </>
            )}
          </button>
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
  // Authority geometry (864 × 715): each station routes a pair of traces into the core's side ports.
  const rowY = [186, 368, 552];
  const portY = [300, 340, 380];
  const side = (dir: 'l' | 'r') =>
    rowY.map((y, i) => {
      const s = status[dir][i]!;
      const hot = s === 'REVIEW_REQUIRED' || s === 'BLOCKED';
      const x0 = dir === 'l' ? 218 : 646;
      const xm = dir === 'l' ? 262 - i * 8 : 602 + i * 8;
      const x1 = dir === 'l' ? 312 : 552;
      const py = portY[i]!;
      const r = 10;
      const sx = dir === 'l' ? 1 : -1;
      const vy = py > y ? 1 : -1;
      const trace = (o: number) =>
        `M${x0} ${y + o} H${xm - sx * r + o * sx * 0} Q${xm + o * sx} ${y + o} ${xm + o * sx} ${y + o + vy * r} V${py + o - vy * r} Q${xm + o * sx} ${py + o} ${xm + o * sx + sx * r} ${py + o} H${x1}`;
      return (
        <g key={`${dir}${i}`} className={`ph-rail ph-rail--${s.toLowerCase()}${hot ? ' is-hot' : ''}`}>
          <path d={trace(-4)} className="ph-rail__core" />
          <path d={trace(4)} className="ph-rail__core" />
          <circle cx={x0 + sx * 3} cy={y} r="5" className="ph-rail__port" />
        </g>
      );
    });
  return (
    <svg className="ph-rails" viewBox="0 0 864 715" preserveAspectRatio="none" aria-hidden data-testid="hub-dependency-rails">
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
      <HubImage slotId={node.assetSlotId} url={url} label={node.label} className="ph-depcard__img" {...HUB_MEDIA.nodeCard} />
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
  panelFace = 'SUMMARY',
  url,
  slotLabel,
  onSelect,
  onBack,
  onAction,
}: {
  node: HubNode;
  selected: boolean;
  panelFace?: HubNodePanelFace;
  url: string | null;
  slotLabel: string;
  onSelect: () => void;
  onBack?: () => void;
  onAction: (a: HubNodeAction) => void;
}) {
  const detail = selected && panelFace === 'DETAIL';
  return (
    <div
      className={`ph-depnode ph-depnode--${node.status.toLowerCase()}${selected ? ' is-selected' : ''}${detail ? ' is-detail' : ''}`}
      data-testid={`dep-node-${node.id}`}
      data-node-status={node.status}
      data-panel-face={selected ? panelFace : 'SUMMARY'}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected} className="ph-depnode__face">
        {detail ? (
          <>
            <span className="ph-depnode__detailbar">
              <span
                className="ph-depnode__back"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onBack?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onBack?.();
                  }
                }}
                data-testid={`dep-node-back-${node.id}`}
              >
                <IcArrowL width={12} height={12} /> BACK
              </span>
              <span>{node.label}</span>
            </span>
            <span className="ph-depnode__status">{HUB_STATUS_LABEL[node.status]}</span>
            <span className="ph-depnode__detail">{node.statusDetail}</span>
            <NodeQuickActions actions={node.quickActions} onAction={onAction} />
          </>
        ) : (
          <>
            <span className="ph-depnode__head">
              <b>{pad(node.order)}</b>
              <span>{node.label}</span>
              <StatusBeacon status={node.status} size={16} />
            </span>
            <HubImage slotId={node.assetSlotId} url={url} label={slotLabel} className="ph-depnode__img" {...HUB_MEDIA.nodeChip} />
            <span className="ph-depnode__status">{HUB_STATUS_LABEL[node.status]}</span>
            <span className="ph-depnode__detail">{node.statusDetail}</span>
          </>
        )}
      </button>
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
