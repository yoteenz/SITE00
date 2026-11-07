/**
 * P0.JURNL.F05-MONEY.INTELLIGENT-IMMERSIVE-MOTION-SYSTEM-AND-LIVING-ENVIRONMENT.CONVERGENCE.OPUS4 — the motion director and
 * the material vocabulary, without a browser (a fake clock and fake elements):
 *   · one phase from the page's state; ambience only in a still, visible, unobstructed scene; FULL 2 · SUBTLE 1 · OFF 0
 *   · quiet periods after the entrance, a touch, typing, navigation and a signal; reduced motion and a hidden page win
 *   · one-shot responses: never under reduced motion or while hidden, a newer one interrupts, a lower priority never
 *     displaces a higher one, `fill: 'none'` (nothing persists), every running response can be cancelled
 *   · motion follows committed state: never on mount or a re-render; transfers only show what the record says
 *   · the stylesheet contract: ambient loops only when granted, compositor-only, nothing under reduced motion
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CHANNELS_FOR, createMotionDirector, PRIORITY, QUIET, SIGNAL_MS, motionDirector, type MotionEnv } from '../src/projects/jurnl/runtime/motion/director';
import { EASE, RESPONSES, TIMING, respond, type ResponseName } from '../src/projects/jurnl/runtime/motion/materials';
import { stateResponseStep } from '../src/projects/jurnl/runtime/motion/useMotion';
import { GHOST_MS } from '../src/projects/jurnl/runtime/motion/overlayMotion';
import { EXIT_RANGE, SETTLE_RANGE, exitMsFor, settleMsFor } from '../src/projects/jurnl/runtime/screens/f05/useMoneyCarousel';
import { transferStateResponse } from '../src/projects/jurnl/runtime/finance/FinanceSheets';

const RT = 'src/projects/jurnl/runtime';
const read = (p: string) => readFileSync(p, 'utf8');

/** A fake clock whose timers run when time is advanced. */
function clock() {
  let now = 0;
  let seq = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const env: MotionEnv = {
    now: () => now,
    setTimeout: (fn, ms) => {
      seq += 1;
      timers.set(seq, { at: now + ms, fn });
      return seq;
    },
    clearTimeout: (id) => void timers.delete(id as number),
  };
  const advance = (ms: number) => {
    const end = now + ms;
    for (;;) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].fn();
    }
    now = end;
  };
  return { env, advance, pending: () => timers.size };
}

type FakeAnim = Animation & { fire: (type: 'finish' | 'cancel') => void; cancelled: boolean; options: KeyframeAnimationOptions };
function fakeEl() {
  const made: FakeAnim[] = [];
  const el = {
    animate(_kf: Keyframe[], options: KeyframeAnimationOptions) {
      const ls: Record<string, (() => void)[]> = {};
      const a = {
        options,
        cancelled: false,
        addEventListener: (t: string, f: () => void) => void (ls[t] ??= []).push(f),
        fire: (t: string) => (ls[t] ?? []).forEach((f) => f()),
        cancel() {
          a.cancelled = true;
          a.fire('cancel');
        },
      } as unknown as FakeAnim;
      made.push(a);
      return a;
    },
  } as unknown as Element;
  return { el, made };
}
const fakeRoot = () => ({ dataset: {} as Record<string, string> }) as unknown as HTMLElement;

function ready() {
  const c = clock();
  const d = createMotionDirector(c.env);
  const root = fakeRoot();
  d.attachRoot(root);
  return { ...c, d, root };
}

afterEach(() => motionDirector.reset());

describe('OPUS4 · DIRECTOR · mode and phase', () => {
  it('D1 · FULL by default; data saver / very low memory is SUBTLE; an explicit intensity wins; reduced motion always wins (OFF)', () => {
    const { d } = ready();
    expect(d.mode()).toBe('FULL');
    d.setConstrained(true);
    expect(d.mode()).toBe('SUBTLE');
    d.setOverride('FULL');
    expect(d.mode()).toBe('FULL');
    d.setReduced(true);
    expect(d.mode()).toBe('OFF');
    d.setOverride(null);
    d.setReduced(false);
    expect(d.mode()).toBe('SUBTLE');
  });

  it('D2 · the entrance is quiet: SETTLING, no ambience, until the entrance period has passed; then AMBIENT (or IDLE with nothing declared)', () => {
    const { d, advance, root } = ready();
    expect(d.phase()).toBe('SETTLING');
    d.declareAmbient('parent', ['D', 'C']);
    expect(d.channels()).toEqual([]);
    expect(root.dataset.jrnAmbient).toBe('off');
    advance(QUIET.entrance - 10);
    expect(d.phase()).toBe('SETTLING');
    advance(20);
    expect(d.phase()).toBe('AMBIENT');
    expect(root.dataset.jrnAmbient).toBe('D C');
    expect(root.dataset.jrnMotionPhase).toBe('AMBIENT');
    expect(root.dataset.jrnMotionMode).toBe('FULL');
    const e = ready();
    e.advance(QUIET.entrance + 1);
    expect(e.d.phase()).toBe('IDLE');
  });

  it('D3 · channel grants: at most two (FULL), one (SUBTLE), none (OFF), in the order botanical, light, material, scenery', () => {
    const { d, advance } = ready();
    advance(QUIET.entrance + 1);
    d.declareAmbient('a', ['B', 'C']);
    d.declareAmbient('b', ['D', 'A']);
    expect(CHANNELS_FOR).toEqual({ FULL: 2, SUBTLE: 1, OFF: 0 });
    expect(d.channels()).toEqual(['A', 'D']);
    d.setOverride('SUBTLE');
    expect(d.channels()).toEqual(['A']);
    d.setOverride('OFF');
    expect(d.channels()).toEqual([]);
    expect(d.phase()).toBe('IDLE');
  });

  it('D4 · a declaration ends with its surface; a stale undeclare never removes a newer declaration', () => {
    const { d, advance } = ready();
    advance(QUIET.entrance + 1);
    const off1 = d.declareAmbient('parent', ['D']);
    const off2 = d.declareAmbient('parent', ['D', 'C']);
    off1();
    expect(d.channels()).toEqual(['D', 'C']);
    off2();
    expect(d.channels()).toEqual([]);
  });
});

describe('OPUS4 · DIRECTOR · what pauses ambience', () => {
  const live = () => {
    const r = ready();
    r.advance(QUIET.entrance + 1);
    r.d.declareAmbient('parent', ['D', 'C']);
    expect(r.d.channels()).toEqual(['D', 'C']);
    return r;
  };

  it('P1 · an open overlay pauses it; closing the last one waits a quiet period before it resumes', () => {
    const { d, advance } = live();
    d.setOverlays(1);
    expect(d.channels()).toEqual([]);
    d.setOverlays(2);
    d.setOverlays(1);
    expect(d.channels()).toEqual([]);
    d.setOverlays(0);
    expect(d.phase()).toBe('SETTLING');
    advance(QUIET.interaction + 1);
    expect(d.channels()).toEqual(['D', 'C']);
  });

  it('P2 · an anchored surface (popover, MANAGE POCKET note) holds it too; a double release is harmless', () => {
    const { d, advance } = live();
    const release = d.holdOverlay();
    expect(d.channels()).toEqual([]);
    expect(d.snapshot().overlays).toBe(1);
    release();
    release();
    expect(d.snapshot().overlays).toBe(0);
    advance(QUIET.interaction + 1);
    expect(d.channels()).toEqual(['D', 'C']);
  });

  it('P3 · touch: INTERACTING while any pointer is down, then SETTLING, then AMBIENT; ending twice counts once', () => {
    const { d, advance } = live();
    const a = d.beginInteraction();
    const b = d.beginInteraction();
    expect(d.phase()).toBe('INTERACTING');
    a();
    a();
    expect(d.snapshot().interacting).toBe(1);
    b();
    expect(d.phase()).toBe('SETTLING');
    advance(QUIET.interaction + 1);
    expect(d.phase()).toBe('AMBIENT');
  });

  it('P4 · typing pauses it, and it waits after the field is left', () => {
    const { d, advance } = live();
    d.setTyping(true);
    expect(d.phase()).toBe('INTERACTING');
    expect(d.channels()).toEqual([]);
    d.setTyping(false);
    expect(d.channels()).toEqual([]);
    advance(QUIET.interaction + 1);
    expect(d.channels()).toEqual(['D', 'C']);
  });

  it('P5 · a hidden page is SUSPENDED: no ambience and every running response is cancelled; it returns after a short quiet period', () => {
    const { d, advance } = live();
    const { el, made } = fakeEl();
    d.play(el, [{ opacity: 1 }], { key: 'x', priority: PRIORITY.FINANCIAL, duration: 300 });
    d.setHidden(true);
    expect(d.phase()).toBe('SUSPENDED');
    expect(d.channels()).toEqual([]);
    expect(made[0]!.cancelled).toBe(true);
    expect(d.play(el, [{ opacity: 1 }], { key: 'x', priority: PRIORITY.FINANCIAL, duration: 300 })).toBeNull();
    d.setHidden(false);
    expect(d.channels()).toEqual([]);
    advance(QUIET.signal + 1);
    expect(d.channels()).toEqual(['D', 'C']);
  });

  it('P6 · navigation: NAVIGATING for its own time, then a quiet period, then ambience', () => {
    const { d, advance } = live();
    d.navigate(700);
    expect(d.phase()).toBe('NAVIGATING');
    advance(701);
    expect(d.phase()).toBe('SETTLING');
    advance(QUIET.navigation);
    expect(d.phase()).toBe('AMBIENT');
  });

  it('P7 · signals: CONFIRMED / WARNING / ERROR hold their phase, then quiet; PROCESSING holds until cleared; a clear only clears its own signal', () => {
    const { d, advance } = live();
    d.signal('CONFIRMED');
    expect(d.phase()).toBe('CONFIRMED');
    expect(d.channels()).toEqual([]);
    advance(SIGNAL_MS.CONFIRMED + 1);
    expect(d.phase()).toBe('SETTLING');
    advance(QUIET.signal + 1);
    expect(d.phase()).toBe('AMBIENT');
    const clear = d.signal('PROCESSING');
    advance(60_000);
    expect(d.phase()).toBe('PROCESSING');
    const clearValidating = d.signal('VALIDATING');
    clear(); // stale: PROCESSING is no longer the signal
    expect(d.phase()).toBe('VALIDATING');
    clearValidating();
    expect(d.phase()).toBe('SETTLING');
    // a signal outranks touch in the phase (financial feedback is what the scene is showing)
    d.beginInteraction();
    d.signal('ERROR');
    expect(d.phase()).toBe('ERROR');
  });

  it('P8 · the director wakes itself when a quiet period ends (no polling) and notifies subscribers once per change', () => {
    const { d, advance, pending } = live();
    let calls = 0;
    d.subscribe(() => (calls += 1));
    d.navigate(500);
    const after = calls;
    expect(pending()).toBe(1);
    advance(500 + QUIET.navigation + 5);
    expect(calls).toBeGreaterThan(after);
    expect(pending()).toBe(0);
  });
});

describe('OPUS4 · DIRECTOR · one-shot responses', () => {
  it('R1 · nothing plays under reduced motion, without an element, or where the element cannot animate', () => {
    const { d } = ready();
    const { el } = fakeEl();
    expect(d.play(null, [], { key: 'x', priority: 2, duration: 1 })).toBeNull();
    expect(d.play({} as Element, [], { key: 'x', priority: 2, duration: 1 })).toBeNull();
    d.setReduced(true);
    expect(d.play(el, [], { key: 'x', priority: 2, duration: 1 })).toBeNull();
  });

  it('R2 · fill none (nothing persists), a newer response interrupts the older one, and finishing frees the element', () => {
    const { d } = ready();
    const { el, made } = fakeEl();
    d.play(el, [{ transform: 'none' }], { key: 'a', priority: PRIORITY.FINANCIAL, duration: 300 });
    expect(made[0]!.options.fill).toBe('none');
    d.play(el, [{ transform: 'none' }], { key: 'b', priority: PRIORITY.FINANCIAL, duration: 300 });
    expect(made[0]!.cancelled).toBe(true);
    expect(d.snapshot().active).toBe(1);
    made[1]!.fire('finish');
    expect(d.snapshot().active).toBe(0);
  });

  it('R3 · a lower-priority response never displaces a higher one; a higher one does', () => {
    const { d } = ready();
    const { el, made } = fakeEl();
    d.play(el, [], { key: 'financial', priority: PRIORITY.FINANCIAL, duration: 300 });
    expect(d.play(el, [], { key: 'nav', priority: PRIORITY.NAVIGATION, duration: 300 })).toBeNull();
    expect(made).toHaveLength(1);
    d.play(el, [], { key: 'interaction', priority: PRIORITY.INTERACTION, duration: 100 });
    expect(made[0]!.cancelled).toBe(true);
    expect(made).toHaveLength(2);
  });

  it('R4 · cancelAll (route change, hidden page, reduced motion) cancels every running response and leaves none tracked', () => {
    const { d } = ready();
    const a = fakeEl();
    const b = fakeEl();
    d.play(a.el, [], { key: 'x', priority: 2, duration: 300 });
    d.play(b.el, [], { key: 'y', priority: 2, duration: 300 });
    d.cancelAll();
    expect(a.made[0]!.cancelled && b.made[0]!.cancelled).toBe(true);
    expect(d.snapshot().active).toBe(0);
    d.play(a.el, [], { key: 'x', priority: 2, duration: 300 });
    d.setReduced(true);
    expect(a.made[1]!.cancelled).toBe(true);
  });
});

describe('OPUS4 · MATERIALS', () => {
  const inRange = (v: number, [lo, hi]: readonly [number, number]) => v >= lo && v <= hi;

  it('T1 · one easing per material; every response is a short transform / opacity keyframe list inside the sprint ranges', () => {
    expect(Object.keys(EASE).sort()).toEqual(['bronze', 'error', 'navigation', 'paper', 'textile', 'wax']);
    for (const [name, r] of Object.entries(RESPONSES)) {
      for (const k of r.keyframes) for (const p of Object.keys(k)) expect(['transform', 'opacity', 'offset'], `${name}.${p}`).toContain(p);
      const ok = inRange(r.duration, TIMING.micro) || inRange(r.duration, TIMING.paperFeedback) || inRange(r.duration, TIMING.material);
      expect(ok, `${name} ${r.duration}ms`).toBe(true);
    }
    expect(inRange(RESPONSES.paperSettle.duration, TIMING.paperFeedback)).toBe(true);
    expect(inRange(RESPONSES.bronzeSettle.duration, TIMING.material)).toBe(true);
    expect(inRange(RESPONSES.waxStamp.duration, TIMING.material)).toBe(true);
    // the error nudge is brief and small; the warning settles without a shake
    expect(JSON.stringify(RESPONSES.errorNudge.keyframes)).not.toMatch(/translateX\((-?[4-9]|\d{2})/);
    expect(JSON.stringify(RESPONSES.warningSettle.keyframes)).not.toMatch(/translateX/);
    // the overlay exit copy is shorter than any overlay entrance
    expect(GHOST_MS).toBeLessThan(TIMING.overlay[0]);
  });

  it('T2 · every response names the phase it holds: confirmations CONFIRMED, the nudge ERROR, the calm settle WARNING', () => {
    expect(Object.fromEntries(Object.entries(RESPONSES).map(([k, r]) => [k, r.signal]))).toEqual({
      paperSettle: 'CONFIRMED',
      bronzeSettle: 'CONFIRMED',
      waxStamp: 'CONFIRMED',
      errorNudge: 'ERROR',
      warningSettle: 'WARNING',
      consentAck: 'CONFIRMED',
      balanceAck: 'CONFIRMED',
    });
  });

  it('T3 · respond() holds the signal on the runtime director and plays through it (and plays nothing under reduced motion)', () => {
    const { el, made } = fakeEl();
    respond(el, 'paperSettle');
    expect(motionDirector.snapshot().signal).toBe('CONFIRMED');
    expect(made).toHaveLength(1);
    expect(made[0]!.options).toMatchObject({ duration: RESPONSES.paperSettle.duration, fill: 'none' });
    motionDirector.setReduced(true);
    expect(respond(el, 'errorNudge')).toBeNull();
    motionDirector.setReduced(false);
  });
});

describe('OPUS4 · STATE DRIVES MOTION', () => {
  it('F1 · a state response never fires on mount or on a re-render with the same value; only a real change asks for one', () => {
    const pick = (_p: number, n: number): ResponseName | null => (n > 0 ? 'paperSettle' : null);
    let s = stateResponseStep(null, 5, pick);
    expect(s.name).toBeNull();
    s = stateResponseStep(s.memo, 5, pick);
    expect(s.name).toBeNull();
    s = stateResponseStep(s.memo, 7, pick);
    expect(s.name).toBe('paperSettle');
    s = stateResponseStep(s.memo, 0, pick);
    expect(s.name).toBeNull();
    expect(s.memo.prev).toBe(0);
  });

  it('F2 · transfers: ARRIVED settles; failed / returning / reversed / needs reconciliation settle calmly; recorded, scheduled, pending, in transit and cancelled never animate', () => {
    expect(transferStateResponse('IN_TRANSIT', 'COMPLETED')).toBe('paperSettle');
    expect(transferStateResponse('PENDING', 'COMPLETED')).toBe('paperSettle');
    for (const n of ['FAILED', 'RETURNING', 'REVERSED', 'NEEDS_RECONCILIATION'] as const) expect(transferStateResponse('IN_TRANSIT', n)).toBe('warningSettle');
    for (const n of ['SCHEDULED', 'PENDING', 'IN_TRANSIT', 'CANCELLED'] as const) expect(transferStateResponse('SCHEDULED', n), n).toBeNull();
    expect(transferStateResponse('COMPLETED', 'COMPLETED')).toBeNull();
    // the wax stamp is not used on a transfer: no independent wax art is mounted in the transfer surfaces
    expect(read(`${RT}/finance/FinanceSheets.tsx`)).not.toMatch(/waxStamp/);
  });

  it('F3 · the motion layer never reads or writes financial state: no store, ledger or repository import in runtime/motion', () => {
    for (const f of readdirSync(`${RT}/motion`)) {
      const src = read(join(RT, 'motion', f));
      expect(src, f).not.toMatch(/from '\.\.\/(state|\.\.\/data)/);
      expect(src, f).not.toMatch(/requestAnimationFrame|setInterval/);
    }
  });

  it('F5 · a pocket balance change is a wash on its paper (opacity only), keyed by the stored cents, skipped for a new pocket and on arrival', () => {
    expect(RESPONSES.balanceAck.keyframes.every((k) => Object.keys(k).every((p) => p === 'opacity' || p === 'offset'))).toBe(true);
    const src = read(`${RT}/screens/f05/MoneyMotionParent.tsx`);
    expect(src).toMatch(/if \(!before\) return;/);
    expect(src).toMatch(/if \(!before\.has\(id\) \|\| before\.get\(id\) === cents\) continue;/);
    expect(src).toMatch(/\.jrn-f05m__paper-ack`\), 'balanceAck'\)/);
  });

  it('F4 · the Buffer effect paper answers the STORED amount and a refused save; consents answer the stored value (never the open)', () => {
    const src = read(`${RT}/global/ChildEnvironments.tsx`);
    expect(src).toMatch(/useStateResponse\(b\.storedUsd, effectPaper, \(\) => 'paperSettle'\)/);
    expect(src).toMatch(/useStateResponse\(refused, amountPaper, \(\) => 'errorNudge'\)/);
    expect(src).toMatch(/useStateResponse\(on, ack, \(\) => 'consentAck'\)/);
  });
});

describe('OPUS4 · SWIPE CONTRACT', () => {
  it('W1 · a tap, a key or a dot leaves in the full exit; a swipe keeps the speed of the finger inside 180–300 ms', () => {
    expect(EXIT_RANGE).toEqual([180, 300]);
    expect(exitMsFor(0, 0)).toBe(300);
    expect(exitMsFor(0, 3)).toBe(300);
    expect(exitMsFor(-60, 2.5)).toBe(180); // a fast flick
    expect(exitMsFor(-40, 0.1)).toBe(300); // a slow drag past the threshold
    expect(exitMsFor(-80, 0.4)).toBe(225); // (170 − 80) / 0.4
    expect(exitMsFor(-400, 0.5)).toBe(180); // dragged beyond the travel: the shortest exit
  });

  it('W2 · a cancelled drag settles back in a time that follows its distance (140–280 ms)', () => {
    expect(SETTLE_RANGE).toEqual([140, 280]);
    expect(settleMsFor(0)).toBe(140);
    expect(settleMsFor(30)).toBe(182);
    expect(settleMsFor(-300)).toBe(280);
  });
});

describe('OPUS4 · STYLESHEET CONTRACT', () => {
  const css = read(`${RT}/motion/jurnl-motion.css`);
  const noPref = css.slice(css.indexOf('@media (prefers-reduced-motion: no-preference)'), css.indexOf('@keyframes jm-amb-light'));
  const reduce = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
  const keyframes = (name: string) => css.slice(css.indexOf(`@keyframes ${name}`), css.indexOf('@keyframes', css.indexOf(`@keyframes ${name}`) + 5));

  it('K1 · ambient loops run only when the director grants their channel, only on the ambient layers, only with no reduced-motion preference', () => {
    expect(noPref).toMatch(/\.jrn\[data-jrn-ambient~='D'\] \.jma-light \{\s*animation: jm-amb-light 18s/);
    expect(noPref).toMatch(/\.jrn\[data-jrn-ambient~='C'\] \.jma-sheen > i \{\s*animation: jm-amb-sheen 14s/);
    expect(css.match(/animation: jm-amb-/g)).toHaveLength(2);
    // cycles are 8–20 s and mostly stillness
    for (const s of [18, 14]) expect(s * 1000 >= TIMING.ambientCycle[0] && s * 1000 <= TIMING.ambientCycle[1]).toBe(true);
    expect(keyframes('jm-amb-light')).toMatch(/0%,\s*32% \{\s*opacity: 0;/);
    expect(keyframes('jm-amb-sheen')).toMatch(/0%,\s*76% \{/);
  });

  it('K2 · every keyframe in the motion stylesheet is compositor-only (transform / opacity); no blur, no filter, no layout property', () => {
    // each @keyframes block by brace matching
    const blocks: string[] = [];
    for (let i = css.indexOf('@keyframes'); i >= 0; i = css.indexOf('@keyframes', i + 1)) {
      let depth = 0;
      let j = css.indexOf('{', i);
      const start = j;
      for (; j < css.length; j += 1) {
        if (css[j] === '{') depth += 1;
        if (css[j] === '}' && --depth === 0) break;
      }
      blocks.push(css.slice(start, j + 1));
    }
    expect(blocks.length).toBeGreaterThanOrEqual(6);
    const props = blocks.flatMap((b) => [...b.matchAll(/^\s+([a-z-]+):/gm)].map((m) => m[1]));
    for (const p of props) expect(['opacity', 'transform'], p).toContain(p);
    expect(css).not.toMatch(/filter:|blur\(/);
  });

  it('K3 · reduced motion: no ambient, no note entrance, no closing copy, no press travel — and the light layers stay invisible', () => {
    expect(reduce).toMatch(/\.jma-light,\s*\.jrn \.jma-sheen > i \{\s*animation: none !important;\s*opacity: 0 !important;/);
    expect(reduce).toMatch(/\.jm-ghost \{\s*display: none !important;/);
    expect(reduce).toMatch(/jrn-pop\.jsp-note-pop,\s*\.jrn \.jrn-pop-backdrop \{\s*animation: none !important;/);
    expect(reduce).toMatch(/transition: none !important;/);
  });

  it('K4 · a closing copy never replays the entrance of the overlay it copies', () => {
    expect(css).toMatch(/\.jrn \.jm-ghost,\s*\.jrn \.jm-ghost \* \{\s*animation: none !important;\s*transition: none !important;/);
  });

  it('K5 · the carousel exit and settle read the swipe-aware durations; the account pages never take the family fade', () => {
    const carousel = read(`${RT}/screens/f05/jurnl-f05-carousel.css`);
    expect(carousel.match(/var\(--f05m-exit-ms, 300ms\)/g)).toHaveLength(2);
    expect(carousel).toMatch(/transition: transform var\(--f05m-settle-ms, 160ms\)/);
    expect(read(`${RT}/screens/f05/dot01/jurnl-f05-dot01.css`)).toMatch(/\.jrn\[data-jrn-f05-dot01\] \.jrn-screen\[data-transition\] \{\s*animation: none;/);
  });
});

describe('OPUS4 · ASSET SEPARATION', () => {
  it('A1 · only surfaces with independently mounted art declare ambience: the MONEY parent (light D, seal C) and DOT 01 pages (seal C)', () => {
    const owners: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.tsx$/.test(e.name) && /useAmbientChannels\(/.test(read(p))) owners.push(p.replace(`${RT}/`, ''));
      }
    };
    walk(RT);
    expect(owners.sort()).toEqual(['screens/f05/MoneyMotionParent.tsx', 'screens/f05/dot01/Dot01Frame.tsx']);
    const parent = read(`${RT}/screens/f05/MoneyMotionParent.tsx`);
    expect(parent).toMatch(/const PARENT_AMBIENT = \['D', 'C'\] as const;/);
    expect(parent).toMatch(/className="jma-sheen"[^\n]*url\("\$\{waxSeal\}"\)/);
    const frame = read(`${RT}/screens/f05/dot01/Dot01Frame.tsx`);
    expect(frame).toMatch(/const DOT01_AMBIENT = \['C'\] as const;/);
    // a task surface (an overlay board) never offers ambience
    expect(frame).toMatch(/useAmbientChannels\(`f05-dot01-\$\{ambientOwner\}`, DOT01_AMBIENT, page && hasSeal\)/);
  });

  it('A2 · the ambient layers carry no art of their own: light is a gradient, the sheen is masked to the seal file already mounted', () => {
    const css = read(`${RT}/motion/jurnl-motion.css`);
    expect(css).not.toMatch(/url\(["']?[^v)]/); // only var(--jma-mask)
    expect(css).toMatch(/mask: var\(--jma-mask\) center \/ contain no-repeat;/);
  });
});
