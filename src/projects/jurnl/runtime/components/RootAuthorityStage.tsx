/**
 * Root authority stage (P0.JURNL.ROOT-PARENTS.REFERENCE-PLUS-SHELL-OPUS-RECONSTRUCTION1).
 *
 * TODAY, MONEY, PLAN and CREDIT each have a founder reference (the finished screen, 941 × 1672) and a clean OpenArt
 * shell (the same room with no interface, 2016 × 3584). The shell is the page: one plate, full bleed, object-fit cover.
 * The live interface is drawn on the shell's own objects:
 *
 * - Object layers (the clipboard sheet, drawers, planner pages, dossier) map a straightened copy of the reference object
 *   onto the matching object in the shell: origin, rotation and glyph scale fitted to the shell object's edges. Rows may
 *   be spread (`stretch`) when the shell object is taller than the reference's, so the type still fills that object.
 * - Wall layers (lockup, headline, figures) keep the reference's margins and scale with the viewport width, so they take
 *   the same share of the screen as in the reference and a phone crop never cuts them.
 *
 * The plate crop (`framing`) and every layer transform come from one fit, so the type stays on its object at any size.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { RefBox, RefType } from '../layout/referenceLayout';
import { JurnlScreen, type FamilyPlate } from '../screens/JurnlScreen';

export const SHELL_W = 2016;
export const SHELL_H = 3584;
export const RA_REF_W = 941;
export const RA_REF_H = 1672;

/** Plate crop: object-position (px, py) of the cover fit, then an optional zoom about a stage point. */
export type RootFraming = { readonly px: number; readonly py: number; readonly zoom?: number; readonly origin?: readonly [number, number] };
/** s: screen px per shell px; (x0, y0): shell origin on screen; u: screen px per reference px for wall type; dock: nav height. */
export type RootFit = { W: number; H: number; s: number; x0: number; y0: number; u: number; dock: number };

/** Parent dock height when it has not been measured yet (jurnl-root-authority.css). */
export const ROOT_DOCK = 80;

export function rootFit(W: number, H: number, f: RootFraming, dock = ROOT_DOCK): RootFit {
  const z = f.zoom ?? 1;
  const base = Math.max(W / SHELL_W, H / SHELL_H);
  const bx = (W - SHELL_W * base) * f.px;
  const by = (H - SHELL_H * base) * f.py;
  const [ox, oy] = f.origin ?? [0.5, 0.5];
  const OX = ox * W;
  const OY = oy * H;
  return { W, H, s: base * z, x0: OX + (bx - OX) * z, y0: OY + (by - OY) * z, u: W / RA_REF_W, dock };
}

export function framingStyle(f: RootFraming): CSSProperties {
  const [ox, oy] = f.origin ?? [0.5, 0.5];
  return { objectFit: 'cover', objectPosition: `${f.px * 100}% ${f.py * 100}%`, transform: `scale(${f.zoom ?? 1})`, transformOrigin: `${ox * 100}% ${oy * 100}%` };
}

/** A reference object mapped onto the shell: local point `from` lands on shell point `at`, turned `deg`, glyphs × k. */
export type RootObject = { readonly from: readonly [number, number]; readonly at: readonly [number, number]; readonly deg: number; readonly k: number; readonly stretch?: number };

export function objectTransform(fit: RootFit, o: RootObject): string {
  const tx = fit.x0 + fit.s * o.at[0];
  const ty = fit.y0 + fit.s * o.at[1];
  return `translate(${tx}px, ${ty}px) rotate(${o.deg}deg) scale(${fit.s * o.k}) translate(${-o.from[0]}px, ${-o.from[1]}px)`;
}

/** Wall layer: reference px at screen offset (x, y), scaled to the viewport width. */
export function wallTransform(fit: RootFit, x: number, y: number): string {
  return `translate(${x}px, ${y}px) scale(${fit.u})`;
}

/** Screen y of shell y. */
export const shellY = (fit: RootFit, y: number) => fit.y0 + fit.s * y;

/** Screen offset of the wall type that hangs from an object: reference y `ref` lands on shell y `shell`. */
export function hangY(fit: RootFit, hang: { readonly ref: number; readonly shell: number; readonly maxDrop?: number }): number {
  // Never above the reference's own place (it would meet the lockup), and at most maxDrop below it.
  const y = Math.max(0, shellY(fit, hang.shell) - fit.u * hang.ref);
  return hang.maxDrop == null ? y : Math.min(y, hang.maxDrop * fit.H);
}

/** Rows spread down a taller shell object: tops move, glyph sizes do not. */
export function spreadT(t: RefType, o: RootObject): RefType {
  return o.stretch ? { ...t, top: o.from[1] + (t.top - o.from[1]) * o.stretch } : t;
}
export function spreadB(b: RefBox, o: RootObject): RefBox {
  if (!o.stretch) return b;
  const y = (v: number) => o.from[1] + (v - o.from[1]) * o.stretch!;
  return [b[0], y(b[1]), b[2], y(b[1]) + (b[3] - b[1])];
}

export function RaLayer({ transform, className, children, ...rest }: { transform: string; className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <div className={`jrn-ra__layer${className ? ` ${className}` : ''}`} style={{ transform }} {...rest}>
      {children}
    </div>
  );
}

const INITIAL = { w: 402, h: 874 };

export function RootAuthorityStage({
  screenId,
  plate,
  framing,
  nav,
  overlays,
  children,
}: {
  screenId: string;
  plate: FamilyPlate;
  framing: RootFraming;
  nav: ReactNode;
  overlays?: ReactNode;
  children: (fit: RootFit) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(() => rootFit(INITIAL.w, INITIAL.h, framing));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (!el.clientWidth || !el.clientHeight) return;
      const nav = document.querySelector<HTMLElement>(".jrn-nav[data-jrn-nav='parent']");
      const dock = nav ? Math.ceil(nav.getBoundingClientRect().height) : ROOT_DOCK;
      setFit(rootFit(el.clientWidth, el.clientHeight, framing, dock));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [framing]);
  return (
    <JurnlScreen screenId={screenId} familyPlate={plate} family productNav singlePlate plateStyle={framingStyle(framing)}>
      <div ref={ref} className="jrn-ra" data-jrn-parent={plate.family} data-runtime-stage="SAFE ZONE">
        {children(fit)}
      </div>
      {nav}
      {overlays}
    </JurnlScreen>
  );
}

/** A ruled line drawn between two points of a layer (layer px). */
export function RaRule({ from, to, soft = false, weight = 2 }: { from: readonly [number, number]; to: readonly [number, number]; soft?: boolean; weight?: number }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const deg = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  return <span className={`jrn-ra__rule${soft ? ' jrn-ra__rule--soft' : ''}`} aria-hidden style={{ left: from[0], top: from[1] - weight / 2, width: len, height: weight, transform: `rotate(${deg}deg)` }} />;
}

/** Wrapped copy in a measured face (state messages that the reference does not draw). */
export function RaPara({ t, width, lead = 1.45, className, children, ...rest }: { t: RefType; width: number; lead?: number; className?: string; children: ReactNode } & Record<string, unknown>) {
  const style: CSSProperties = { left: t.left, top: t.top, width, fontSize: t.size, letterSpacing: t.ls, fontWeight: t.weight, lineHeight: lead, whiteSpace: 'normal' };
  return (
    <p className={`jrn-ref__t jrn-ref__t--${t.family}${className ? ` ${className}` : ''}`} style={style} {...rest}>
      {children}
    </p>
  );
}
