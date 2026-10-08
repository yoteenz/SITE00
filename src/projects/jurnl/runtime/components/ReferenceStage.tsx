/**
 * Founder reference stage (P0.JURNL.F09.REFERENCE-REPLICA1).
 *
 * Each founder reference is one photograph with the interface drawn on top. The photograph is lifted out (type and
 * controls cleared) and used as the only plate. The plate keeps the reference's own size, 853 × 1844, and the live
 * interface is drawn over it in the same reference pixels (layout/referenceLayout.ts). The stage scales to the
 * viewport as one piece, so every element stays where the reference has it.
 *
 * The stage covers the viewport. There is one photograph: the plate image inside the stage. It is not copied
 * behind itself to fill gaps. A short or wide viewport crops that same photograph. The bottom of the reference
 * (just above its old dock) sits on the parent Safe to Spend dock. No device chrome: the status bar and the home
 * indicator in the references belong to the phone, not JURNL.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { REF_DOCK, type RefBox, type RefType } from '../layout/referenceLayout';
import { AUTHORITY_MARK } from './authorityNavMarks';
import { resolveCompositionMode } from '../layout/compositionMode';

export const REF_W = 853;
export const REF_H = 1844;

export type ReferencePlate = { src: string; assetId: string };

/** Reference y where the painted dock began. Live UI stays above this; the parent dock covers the rest. */
export const REF_DOCK_TOP = 1668;
/** Status-bar band, in reference pixels, that a full-bleed crop may remove before the title leaves the screen. */
const TITLE_SAFE = 140;

/**
 * One plate covers the viewport. The live UI shares that crop while the title stays on screen.
 * When a wider viewport would crop the title off, the UI scales down and the same photograph
 * stays full-bleed behind it. A second copy of the photograph is never painted into the gaps.
 */
export function referenceFit(w: number, h: number, dock = 0): { k: number; top: number; bleed: boolean } {
  const avail = Math.max(1, h - Math.max(0, dock));
  const coverW = w / REF_W;
  const fitH = avail / REF_DOCK_TOP;
  let k = Math.max(coverW, fitH);
  let top = avail - REF_DOCK_TOP * k;
  const cropped = top < 0 ? -top / k : 0;
  const bleed = cropped > TITLE_SAFE;
  if (bleed) {
    k = Math.min(coverW, fitH);
    const scaled = REF_DOCK_TOP * k;
    top = Math.max(0, (avail - scaled) / 2);
  }
  return { k, top, bleed };
}

export function ReferenceStage({
  screenId,
  family = 'F09',
  plate,
  label,
  children,
  outside,
}: {
  screenId: string;
  family?: string;
  plate: ReferencePlate;
  label: string;
  /** Inside the stage: everything the reference draws, sheets and drawers included. */
  children: ReactNode;
  /** Outside the stage: viewport-level overlays (quick add, ask). */
  outside?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [fit, setFit] = useState(() => referenceFit(typeof window === 'undefined' ? 393 : window.innerWidth, typeof window === 'undefined' ? 852 : window.innerHeight, 48));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (!el.clientWidth || !el.clientHeight) return;
      const nav = document.querySelector<HTMLElement>(".jrn-nav[data-jrn-nav='authority']");
      let dock = el.clientWidth >= 1100 ? 112 : 48;
      if (nav) {
        const box = nav.getBoundingClientRect();
        const bottom = Number.parseFloat(getComputedStyle(nav).bottom) || 0;
        dock = Math.ceil(box.height + bottom);
      }
      const next = referenceFit(el.clientWidth, el.clientHeight, dock);
      setFit((prev) => (prev.k === next.k && prev.top === next.top && prev.bleed === next.bleed ? prev : next));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <section ref={ref} className="jrn-screen jrn-ref" data-transition="family" data-jrn-screen={screenId} data-jrn-family={family} data-jrn-composition={resolveCompositionMode({ screenId, hasProductNav: true })} aria-label={label}>
      {fit.bleed ? <img className="jrn-ref__plate jrn-ref__plate--bleed" src={plate.src} alt="" draggable={false} data-asset-id={plate.assetId} /> : null}
      <div className="jrn-ref__stage" style={{ '--k': fit.k, '--ref-top': `${fit.top}px` } as CSSProperties} data-runtime-stage="SAFE ZONE">
        {fit.bleed ? null : <img className="jrn-ref__plate" src={plate.src} alt="" width={REF_W} height={REF_H} draggable={false} data-asset-id={plate.assetId} />}
        {children}
      </div>
      {outside}
    </section>
  );
}

/** Box in reference pixels, relative to `origin` when the element sits inside another positioned box. */
export function at(b: RefBox, origin?: RefBox): CSSProperties {
  const ox = origin ? origin[0] : 0;
  const oy = origin ? origin[1] : 0;
  return { left: b[0] - ox, top: b[1] - oy, width: b[2] - b[0], height: b[3] - b[1] };
}

/** Fitted type: size, tracking, line top and anchor, relative to `origin` when nested. */
export function typeAt(t: RefType, origin?: RefBox): CSSProperties {
  const ox = origin ? origin[0] : 0;
  const oy = origin ? origin[1] : 0;
  const s: CSSProperties = { fontSize: t.size, letterSpacing: t.ls, top: t.top - oy, fontWeight: t.weight };
  if (t.rot) {
    s.left = (t.left ?? 0) - ox;
    s.transform = `rotate(${t.rot}deg)`;
  } else if (t.left != null) s.left = t.left - ox;
  else if (t.cx != null) {
    s.left = t.cx - ox;
    s.transform = 'translateX(-50%)';
  } else if (t.right != null) s.right = (origin ? origin[2] : REF_W) - t.right;
  if (t.sx && t.left != null && !t.rot) {
    s.transform = `scaleX(${t.sx})`;
    s.transformOrigin = '0 0';
  }
  return s;
}

export function RefText({ t, origin, as: Tag = 'p', className, children, ...rest }: { t: RefType; origin?: RefBox; as?: ElementType; className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <Tag className={`jrn-ref__t jrn-ref__t--${t.family}${className ? ` ${className}` : ''}`} style={typeAt(t, origin)} {...rest}>
      {children}
    </Tag>
  );
}

/* ─────────────── icons (line work measured from the references) ─────────────── */

export type RefIconName =
  | 'arrow'
  | 'arrow-left'
  | 'chevron'
  | 'chevron-left'
  | 'close'
  | 'menu'
  | 'spark'
  | 'bag'
  | 'card'
  | 'person'
  | 'dollar'
  | 'bank'
  | 'sparkles'
  | 'shield'
  | 'bell'
  | 'lock'
  | 'calendar'
  | 'file'
  | 'help'
  | 'document'
  | 'sign-out';

const ICON_PATHS: Record<RefIconName, { vb: string; d: string; fill?: boolean }> = {
  arrow: { vb: '0 0 30 28', d: 'M1 14H28M17 3l11 11-11 11' },
  'arrow-left': { vb: '0 0 30 28', d: 'M29 14H2M13 3 2 14l11 11' },
  chevron: { vb: '0 0 12 20', d: 'M2 2l8 8-8 8' },
  'chevron-left': { vb: '0 0 16 28', d: 'M14 2 2 14l12 12' },
  close: { vb: '0 0 28 28', d: 'M2 2l24 24M26 2 2 26' },
  menu: { vb: '0 0 40 26', d: 'M0 1.5h40M0 13h40M0 24.5h40' },
  spark: { vb: '0 0 40 40', d: 'M20 1.5 23.6 16.4 38.5 20 23.6 23.6 20 38.5 16.4 23.6 1.5 20 16.4 16.4Z' },
  bag: { vb: '0 0 42 48', d: 'M6 16h30l3 27.5c.2 1.6-1 3-2.6 3H5.6c-1.6 0-2.8-1.4-2.6-3L6 16ZM13.5 16v-5.5a7.5 7.5 0 0 1 15 0V16' },
  card: { vb: '0 0 48 38', d: 'M5 2h38a3.5 3.5 0 0 1 3.5 3.5v27A3.5 3.5 0 0 1 43 36H5a3.5 3.5 0 0 1-3.5-3.5v-27A3.5 3.5 0 0 1 5 2ZM1.5 12.5h45M7 23h12' },
  person: { vb: '0 0 36 42', d: 'M18 3a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17ZM3 40v-3.5C3 30 8 25.5 14.5 25.5h7C28 25.5 33 30 33 36.5V40H3Z' },
  dollar: { vb: '0 0 26 48', d: 'M13 1.5v45M22.5 12c-1-4.5-5-7-9.5-7-5.5 0-9.5 3-9.5 7.5 0 11 19.5 6.5 19.5 18.5 0 5-4.5 8-10 8-5.5 0-9.5-3-10.5-7.5' },
  bank: { vb: '0 0 44 42', d: 'M22 2 2.5 12v3.5h39V12L22 2ZM7 18v15M15.5 18v15M28.5 18v15M37 18v15M2.5 36h39M1 40.5h42' },
  sparkles: { vb: '0 0 44 44', d: 'M17 4l3.2 10.3L30.5 17.5 20.2 20.7 17 31l-3.2-10.3L3.5 17.5 13.8 14.3Z M34 26l1.8 5.7 5.7 1.8-5.7 1.8L34 41l-1.8-5.7-5.7-1.8 5.7-1.8Z' },
  shield: { vb: '0 0 36 44', d: 'M18 2 33 7.5v12c0 10.5-6.5 18.5-15 22.5C9.5 38 3 30 3 19.5v-12L18 2ZM11 22l5 5 9-10' },
  bell: { vb: '0 0 38 44', d: 'M19 3.5c-7 0-12 5.5-12 12.5v8.5L3 32.5h32L31 24.5V16c0-7-5-12.5-12-12.5ZM14 36.5a5 5 0 0 0 10 0M19 1v2.5' },
  lock: { vb: '0 0 34 44', d: 'M5 19h24a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V22a3 3 0 0 1 3-3ZM8.5 19v-6.5a8.5 8.5 0 0 1 17 0V19' },
  calendar: { vb: '0 0 40 42', d: 'M5.5 6h29A3.5 3.5 0 0 1 38 9.5v27a3.5 3.5 0 0 1-3.5 3.5h-29A3.5 3.5 0 0 1 2 36.5v-27A3.5 3.5 0 0 1 5.5 6ZM2 15.5h36M11.5 1.5v8M28.5 1.5v8' },
  file: { vb: '0 0 34 44', d: 'M4.5 2h16l11 11v26.5a2.5 2.5 0 0 1-2.5 2.5h-24A2.5 2.5 0 0 1 2.5 39.5v-35A2.5 2.5 0 0 1 4.5 2ZM20.5 2v11h11' },
  help: { vb: '0 0 44 44', d: 'M22 2a20 20 0 1 1 0 40 20 20 0 0 1 0-40ZM15.5 16.5c0-4 3-6.5 6.8-6.5 4 0 6.7 2.5 6.7 6 0 5.5-6.8 5.5-6.8 11M22.2 31.5v2.5' },
  document: { vb: '0 0 34 44', d: 'M5 2h24a3 3 0 0 1 3 3v34a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3ZM9.5 13h15M9.5 21h15M9.5 29h15' },
  'sign-out': { vb: '0 0 44 42', d: 'M24 13V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v32a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-8M15 21h27M33 12l9 9-9 9' },
};

/** `stroke` is in reference pixels; it is converted to viewBox units so the stage scale carries it. */
export function RefIcon({ name, box, origin, stroke = 2.4, className }: { name: RefIconName; box: RefBox; origin?: RefBox; stroke?: number; className?: string }) {
  const p = ICON_PATHS[name];
  const vbW = Number(p.vb.split(' ')[2]);
  return (
    <svg className={`jrn-ref__icon${className ? ` ${className}` : ''}`} viewBox={p.vb} preserveAspectRatio="none" style={at(box, origin)} aria-hidden data-icon={name}>
      <path d={p.d} fill={p.fill ? 'currentColor' : 'none'} stroke={p.fill ? 'none' : 'currentColor'} strokeWidth={(stroke * vbW) / (box[2] - box[0])} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────── dock ─────────────── */

/** Ink extents of the traced authority marks (viewBox units). The references draw them at one third of that size. */
const MARK_INK = { house: [8, 2, 123, 123], card: [8, 2, 126, 105], leaf: [8, 2, 108, 123], bars: [8, 2, 111, 138] } as const;
const DOCK_ITEMS = [
  { id: 'HOME', target: 'F03', mark: 'house', icon: 'home' },
  { id: 'MONEY', target: 'F05', mark: 'card', icon: 'money' },
  { id: 'PLAN', target: 'F08', mark: 'leaf', icon: 'plan' },
  { id: 'CREDIT', target: 'F12', mark: 'bars', icon: 'credit' },
] as const;

export type DockLayout = {
  box: { add: RefBox; plusH: RefBox; plusV: RefBox; home: RefBox; money: RefBox; plan: RefBox; credit: RefBox };
  text: { HOME: RefType; MONEY: RefType; PLAN: RefType; CREDIT: RefType; ADD: RefType };
};

const down = (b: RefBox, dy: number): RefBox => [b[0], b[1] + dy, b[2], b[3] + dy];
const downType = (t: RefType, dy: number): RefType => ({ ...t, top: t.top + dy });

/**
 * The dock as a reference draws it. `L` is the dock measured on that screen (CHECK A PURCHASE's by default; ACCOUNT
 * and WHY draw it larger); `top` is the dock panel's top edge; `dy` moves a borrowed dock to this screen's place.
 */
export function ReferenceDock({ L = REF_DOCK, top, dy = 0, radius = 0, active = 'HOME', onGo, onAdd }: { L?: DockLayout; top: number; dy?: number; radius?: number; active?: 'HOME' | 'MONEY' | 'PLAN' | 'CREDIT' | null; onGo: (target: string) => void; onAdd: () => void }) {
  const nav: RefBox = [0, top, REF_W, REF_H];
  const addBox = down(L.box.add, dy);
  return (
    <nav className="jrn-ref__dock" aria-label="PRIMARY" data-jrn-zone="bottom-nav" data-runtime-stage="NAV FOOTPRINT" style={{ ...at(nav), borderTopLeftRadius: radius, borderTopRightRadius: radius }}>
      {DOCK_ITEMS.map((item) => {
        const icon = down(L.box[item.icon], dy);
        const hit: RefBox = [icon[0] - 44, top, icon[2] + 44, REF_H];
        const [x0, y0, x1, y1] = MARK_INK[item.mark];
        return (
          <button key={item.id} type="button" className="jrn-ref__dock-btn" style={at(hit, nav)} data-active={active === item.id ? 'true' : 'false'} aria-label={item.id} aria-current={active === item.id ? 'page' : undefined} data-jrn-trigger={`nav-${item.id.toLowerCase()}`} onClick={() => onGo(item.target)}>
            <svg viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} preserveAspectRatio="none" aria-hidden className="jrn-ref__dock-mark" style={at(icon, hit)}>
              <path fill="currentColor" fillRule="evenodd" d={AUTHORITY_MARK[item.mark].d} />
            </svg>
            <RefText t={downType(L.text[item.id], dy)} origin={hit} as="span">{item.id}</RefText>
          </button>
        );
      })}
      <button type="button" className="jrn-ref__dock-btn jrn-ref__dock-btn--add" style={at([addBox[0] - 12, top, addBox[2] + 12, REF_H], nav)} aria-label="QUICK ADD" data-jrn-trigger="nav-add" onClick={onAdd}>
        <span className="jrn-ref__dock-square" style={at(addBox, [addBox[0] - 12, top, addBox[2] + 12, REF_H])}>
          <span className="jrn-ref__dock-plus" style={at(down(L.box.plusH, dy), addBox)} />
          <span className="jrn-ref__dock-plus" style={at(down(L.box.plusV, dy), addBox)} />
        </span>
        <RefText t={downType(L.text.ADD, dy)} origin={[addBox[0] - 12, top, addBox[2] + 12, REF_H]} as="span">ADD</RefText>
      </button>
    </nav>
  );
}
