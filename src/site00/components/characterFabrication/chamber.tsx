/**
 * FABRICATION CHAMBER HERO — live SVG stand-in for the chamber plate in the authority screens.
 *
 * Layout is authored on the 432px authority canvas (the workspace is zoomed to device width), so every coordinate
 * below is a direct transcription of the reference geometry. The subject is a frozen ASSET SLOT
 * (`actor.sw017.chamber.figure`). Until that plate is present, an honest proportion proxy (live SVG) stands in.
 * No reference pixels, no invented human imagery.
 */
import type { ReactNode } from 'react';
import { GARMENT_BY_ID, type BehaviorRole } from '../../../../shared/site00-character-fabrication/index.js';
import { useFabrication } from './FabricationContext';
import { CfImage } from './CfImage';
import { ActorAuthorityCard, CharacterAuthorityCard, FabricationStageRail } from './primitives';

export const ROLE_COLOR: Record<BehaviorRole, string> = { PRIMARY: '#e5231b', SECONDARY: '#3c8fd0', ACCENT: '#d9a21f', FOUNDATIONAL: '#8a8c94' };

export const SUBJECT_SLOT = 'actor.sw017.chamber.figure';
export const CHAMBER_SLOT = 'fabrication.machine.chamber';

/* proportion proxy, authored in a 390x420 box: head top y66, feet y336, centre x195 */
const P = {
  head: 'M195 66c9 0 15 7 15 18s-6 20-15 20-15-9-15-20 6-18 15-18z',
  neck: 'M189 100h12v14h-12z',
  torso: 'M171 112q24-8 48 0l7 58q-4 26-12 38h-38q-8-12-12-38z',
  hips: 'M176 206h38l5 24h-48z',
  legL: 'M172 228h21l-3 62-4 44h-12l2-44z',
  legR: 'M197 228h21l-4 62 2 44h-12l-4-44z',
  armL: 'M170 114l-10 6-11 60-2 34h8l6-32 11-46z',
  armR: 'M220 114l10 6 11 60 2 34h-8l-6-32-11-46z',
  feetL: 'M172 330h14v6h-16z',
  feetR: 'M204 330h14l2 6h-16z',
  hair: 'M180 84c-1-14 6-22 15-22s17 8 15 22c-2-8-8-11-15-11s-13 3-15 11z',
};
const PARTS = ['head', 'neck', 'torso', 'hips', 'legL', 'legR', 'armL', 'armR', 'feetL', 'feetR'] as const;

function Proxy() {
  const { state } = useFabrication();
  const hidden = new Set(state.fittingHidden);
  const sw = (k: 'L1' | 'L2' | 'L3' | 'L4') => (state.fitting[k] && !hidden.has(k) ? GARMENT_BY_ID[state.fitting[k]!]?.swatch ?? null : null);
  const top = sw('L1');
  const bottom = sw('L2');
  const outer = sw('L3');
  const shoes = sw('L4');
  const hair = state.appearanceLayers.find((l) => l.layerId === 'hairStyle');
  return (
    <g data-subject-proxy>
      {PARTS.map((k) => <path key={k} d={P[k]} className="cf-px" />)}
      {top ? <path d={P.torso} fill={top} className="cf-px-g" /> : null}
      {bottom ? (['hips', 'legL', 'legR'] as const).map((k) => <path key={k} d={P[k]} fill={bottom} className="cf-px-g" />) : null}
      {outer ? (['armL', 'armR'] as const).map((k) => <path key={k} d={P[k]} fill={outer} className="cf-px-g" />) : null}
      {shoes ? (['feetL', 'feetR'] as const).map((k) => <path key={k} d={P[k]} fill={shoes} className="cf-px-g" />) : null}
      {hair?.visible && state.touched.appearance ? <path d={P.hair} className="cf-px-hair" style={{ opacity: hair.opacity / 110 }} /> : null}
    </g>
  );
}

/** Figure + figure asset slot. Box is given in hero coordinates. */
export function SubjectFigure({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const { url } = useFabrication();
  const src = url(SUBJECT_SLOT);
  return (
    <div className="cf-fig" style={{ left: x, top: y, width: w, height: h }} data-asset-slot={SUBJECT_SLOT} data-asset-state={src ? 'filled' : 'missing'}>
      {src ? (
        <CfImage slotId={SUBJECT_SLOT} url={src} label="" className="cf-fig__img" />
      ) : (
        <svg viewBox="147 60 96 280" preserveAspectRatio="xMidYMax meet" className="cf-fig__svg" aria-hidden>
          <Proxy />
        </svg>
      )}
    </div>
  );
}

/** The lab plate: walls, ceiling strips, arms, glass cylinder, platform. Coordinates = hero px. */
export function ChamberPlate({ h, cyl, cx = 216, scale = 1 }: { h: number; cyl: { top: number; plat: number }; cx?: number; scale?: number }) {
  const { top, plat } = cyl;
  const arm = (side: 1 | -1) => {
    const x = cx + side * 82 * scale;
    return (
      <g key={side} className="cf-arm">
        <rect x={x - 6} y={top + 28} width="12" height={plat - top - 30} rx="2" className="cf-arm__col" />
        <rect x={x - 9} y={top + 40} width="18" height="22" rx="2" className="cf-arm__box" />
        <rect x={x - 9} y={plat - 70} width="18" height="26" rx="2" className="cf-arm__box" />
        <path d={`M${x} ${top + 60} L${x - side * 20} ${top + 86} L${x - side * 30} ${top + 118}`} className="cf-arm__link" />
        <path d={`M${x} ${plat - 58} L${x - side * 18} ${plat - 80} L${x - side * 30} ${plat - 70}`} className="cf-arm__link" />
        <circle cx={x - side * 20} cy={top + 86} r="4.5" className="cf-arm__joint" />
        <circle cx={x - side * 18} cy={plat - 80} r="4" className="cf-arm__joint" />
        {[top + 50, top + 96, plat - 58, plat - 40].map((yy) => <circle key={yy} cx={x + side * 6} cy={yy} r="1.6" className="cf-arm__led" />)}
        <line x1={x - side * 2} x2={x - side * 2} y1={top + 64} y2={plat - 76} className="cf-arm__glow" />
      </g>
    );
  };
  return (
    <svg className="cf-plate" viewBox={`0 0 432 ${h}`} preserveAspectRatio="none" aria-hidden data-asset-slot={CHAMBER_SLOT} data-asset-state="missing">
      <defs>
        <linearGradient id="cfWall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e9ebee" />
          <stop offset=".55" stopColor="#f5f6f8" />
          <stop offset="1" stopColor="#dcdfe3" />
        </linearGradient>
        <linearGradient id="cfSteel" x1="0" x2="1">
          <stop offset="0" stopColor="#5e636c" />
          <stop offset=".4" stopColor="#dfe2e6" />
          <stop offset=".6" stopColor="#9ca1aa" />
          <stop offset="1" stopColor="#4f535b" />
        </linearGradient>
        <linearGradient id="cfGlassCol" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".15" />
          <stop offset=".08" stopColor="#fff" stopOpacity=".85" />
          <stop offset=".2" stopColor="#e3e8ee" stopOpacity=".35" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".8" stopColor="#e3e8ee" stopOpacity=".35" />
          <stop offset=".92" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" stopOpacity=".15" />
        </linearGradient>
        <radialGradient id="cfFloor2" cx=".5" cy=".4" r=".7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c9cdd3" />
        </radialGradient>
        <linearGradient id="cfPx" x1="0" x2="1">
          <stop offset="0" stopColor="#c4c8cf" />
          <stop offset=".45" stopColor="#f4f5f7" />
          <stop offset="1" stopColor="#b4b8c0" />
        </linearGradient>
      </defs>
      <rect width="432" height={h} fill="url(#cfWall)" />
      {/* wall seams + ceiling light strips in perspective */}
      {[40, 80, 352, 392].map((x) => <line key={x} x1={x} x2={x} y1="0" y2={plat - 30} className="cf-seam" />)}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={-10 + i * 22} y1={8 + i * 10} x2={70 + i * 16} y2={2 + i * 16} className="cf-strip" />
          <line x1={442 - i * 22} y1={8 + i * 10} x2={362 - i * 16} y2={2 + i * 16} className="cf-strip" />
        </g>
      ))}
      <line x1="0" x2="432" y1={plat + 10} y2={plat + 10} className="cf-seam" />
      <rect x="0" y={plat + 10} width="432" height={h - plat} fill="url(#cfFloor2)" opacity=".75" />
      {/* red registration marks */}
      <path d={`M16 ${top + 26} h96 M320 ${top + 26} h96`} className="cf-reg" />
      <g className="cf-plate__arms">
        {arm(-1)}
        {arm(1)}
      </g>
      <g className="cf-plate__cyl">
      {/* cylinder top assembly */}
      <ellipse cx={cx} cy={top + 12} rx={90 * scale} ry={18 * scale} fill="none" stroke="url(#cfSteel)" strokeWidth="10" />
      <ellipse cx={cx} cy={top + 14} rx={74 * scale} ry={13 * scale} fill="none" stroke="#3f434a" strokeWidth="3" />
      <ellipse cx={cx} cy={top + 16} rx={62 * scale} ry={10 * scale} className="cf-ring" />
      {/* glass column */}
      <rect x={cx - 57 * scale} y={top + 18} width={114 * scale} height={plat - top - 18} fill="url(#cfGlassCol)" />
      <line x1={cx - 57 * scale} x2={cx - 57 * scale} y1={top + 18} y2={plat} className="cf-edge" />
      <line x1={cx + 57 * scale} x2={cx + 57 * scale} y1={top + 18} y2={plat} className="cf-edge" />
      </g>
      {/* platform */}
      <ellipse cx={cx} cy={plat + 4} rx={112 * scale} ry={20 * scale} fill="url(#cfFloor2)" stroke="#9ea3ab" strokeWidth=".8" />
      <ellipse cx={cx} cy={plat} rx={92 * scale} ry={15 * scale} fill="none" stroke="#b9bdc4" strokeWidth="1.5" />
      <ellipse cx={cx} cy={plat - 1} rx={64 * scale} ry={10 * scale} className="cf-ring cf-ring--floor" />
      <line x1={cx} x2={cx} y1={top + 22} y2={plat - 6} className="cf-beam" />
    </svg>
  );
}

/**
 * Hero: chamber plate + subject + mounted cards (+ anything else the view mounts, e.g. the station rail).
 * `h` is the hero height in authority px; `cyl` places the cylinder; `fig` places the subject figure box.
 */
export function ChamberHero({
  h,
  cyl,
  fig,
  children,
  className = '',
  testId = 'cf-machine',
}: {
  h: number;
  cyl: { top: number; plat: number };
  fig: { x: number; y: number; w: number; h: number };
  children?: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <section className={`cf-hero ${className}`} style={{ height: h }} data-testid={testId} aria-label="Fabrication chamber">
      <ChamberPlate h={h} cyl={cyl} />
      <SubjectFigure {...fig} />
      {children}
    </section>
  );
}

/**
 * The chamber-hero composition shared by 5414 / 5418 / 5428 / 5429: plate + subject + actor card (left) +
 * character card (right) + the 01–08 rail mounted over the chamber floor. All numbers are authority px.
 */
export function StandardHero({
  h,
  railTop,
  cardTop,
  cyl,
  fig,
  actorRows,
  actorActions = true,
  cardH,
}: {
  h: number;
  railTop: number;
  cardTop: number;
  cyl: { top: number; plat: number };
  fig: { x: number; y: number; w: number; h: number };
  actorRows?: readonly ('AGE' | 'HEIGHT' | 'ETHNICITY' | 'STATUS' | 'ENTRY' | 'PROJECT' | 'VERSION')[];
  actorActions?: boolean;
  cardH?: number;
}) {
  return (
    <ChamberHero h={h} cyl={cyl} fig={fig}>
      <ActorAuthorityCard rows={actorRows} actions={actorActions} style={{ left: 16, top: cardTop, height: cardH }} />
      <CharacterAuthorityCard style={{ left: 312, top: cardTop + 2, height: cardH }} />
      <div className="cf-hero__rail" style={{ top: railTop }}>
        <FabricationStageRail />
      </div>
    </ChamberHero>
  );
}
