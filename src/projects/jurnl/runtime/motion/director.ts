/**
 * JurnlMotionDirector (P0.JURNL.F05-MONEY.INTELLIGENT-IMMERSIVE-MOTION-SYSTEM-AND-LIVING-ENVIRONMENT.CONVERGENCE.OPUS4).
 *
 * One small, framework-free coordinator for JURNL motion. It owns NO financial state: it observes the page (pointer, focus,
 * route, overlays, visibility, reduced-motion preference) and explicit signals sent by components AFTER the store has
 * committed a state change (CONFIRMED, WARNING, ERROR, PROCESSING, VALIDATING). From those it derives one motion phase and
 * decides two things:
 *
 *   1. which AMBIENT channels may run (A botanical, D soft light, C material presence, B scenic depth): none while anything
 *      of higher priority is happening, none while the page is hidden, an overlay is open, the person is typing or
 *      touching, or the scene is still settling; at most two (FULL), one (SUBTLE) or none (OFF);
 *   2. whether a one-shot material response may play (`play`): never under reduced motion or while hidden; a newer response
 *      on the same element interrupts the older one; a lower-priority response never displaces a higher one.
 *
 * Ambient loops are CSS (compositor-only transform / opacity) switched by attributes this director writes on the `.jrn`
 * root; one-shot responses use the Web Animations API with `fill: 'none'`, so nothing persists after they end.
 *
 * Priority: 0 accessibility & safety · 1 active interaction · 2 financial state feedback · 3 navigation · 4 ambient.
 */

export type MotionMode = 'FULL' | 'SUBTLE' | 'OFF';
export type MotionPhase = 'IDLE' | 'AMBIENT' | 'INTERACTING' | 'NAVIGATING' | 'VALIDATING' | 'PROCESSING' | 'CONFIRMED' | 'WARNING' | 'ERROR' | 'SETTLING' | 'SUSPENDED';
export type AmbientChannel = 'A' | 'B' | 'C' | 'D';
export type SignalPhase = 'CONFIRMED' | 'WARNING' | 'ERROR' | 'PROCESSING' | 'VALIDATING';
export const PRIORITY = { SAFETY: 0, INTERACTION: 1, FINANCIAL: 2, NAVIGATION: 3, AMBIENT: 4 } as const;
export type MotionPriority = (typeof PRIORITY)[keyof typeof PRIORITY];

/** Channel preference when fewer may run than are declared: botanical, then light, then material, then scenery. */
export const CHANNEL_ORDER: readonly AmbientChannel[] = ['A', 'D', 'C', 'B'];
export const CHANNELS_FOR: Record<MotionMode, number> = { FULL: 2, SUBTLE: 1, OFF: 0 };

/** Quiet periods (ms) before ambience may resume: after the entrance, after touch / typing, after navigation, after a signal. */
export const QUIET = { entrance: 1400, interaction: 900, navigation: 1000, signal: 700 } as const;
/** How long each signal holds its phase unless cleared earlier (PROCESSING / VALIDATING hold until cleared). */
export const SIGNAL_MS: Record<SignalPhase, number> = { CONFIRMED: 800, WARNING: 700, ERROR: 650, PROCESSING: 0, VALIDATING: 0 };

export type MotionEnv = {
  now: () => number;
  setTimeout: (fn: () => void, ms: number) => unknown;
  clearTimeout: (id: unknown) => void;
};

export type PlayOptions = {
  /** a stable name for the response; a newer response with the same element interrupts the older one */
  key: string;
  priority: MotionPriority;
  duration: number;
  easing?: string;
  delay?: number;
};

type Active = { anim: Animation; priority: MotionPriority; key: string };

export type MotionSnapshot = {
  mode: MotionMode;
  phase: MotionPhase;
  channels: AmbientChannel[];
  reduced: boolean;
  hidden: boolean;
  overlays: number;
  interacting: number;
  typing: boolean;
  navigating: boolean;
  signal: SignalPhase | null;
  active: number;
};

export function createMotionDirector(envIn?: Partial<MotionEnv>) {
  const env: MotionEnv = {
    now: envIn?.now ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now())),
    setTimeout: envIn?.setTimeout ?? ((fn, ms) => globalThis.setTimeout(fn, ms)),
    clearTimeout: envIn?.clearTimeout ?? ((id) => globalThis.clearTimeout(id as ReturnType<typeof setTimeout>)),
  };
  const s = {
    reduced: false,
    constrained: false,
    override: null as MotionMode | null,
    hidden: false,
    overlays: 0,
    /** anchored surfaces outside the overlay host (popovers, the MANAGE POCKET note) that are open */
    held: 0,
    interacting: 0,
    typing: false,
    navUntil: 0,
    quietUntil: 0,
    signal: null as SignalPhase | null,
    signalUntil: 0,
    declared: new Map<string, readonly AmbientChannel[]>(),
  };
  const active = new Map<Element, Active>();
  const listeners = new Set<() => void>();
  let root: HTMLElement | null = null;
  let wake: unknown = null;
  let last = '';

  const mode = (): MotionMode => (s.reduced ? 'OFF' : (s.override ?? (s.constrained ? 'SUBTLE' : 'FULL')));
  const navigating = () => env.now() < s.navUntil;
  const signal = () => (s.signal && (s.signalUntil === 0 || env.now() < s.signalUntil) ? s.signal : null);

  function phase(): MotionPhase {
    if (s.hidden) return 'SUSPENDED';
    const sig = signal();
    if (sig) return sig;
    if (s.interacting > 0 || s.typing) return 'INTERACTING';
    if (navigating()) return 'NAVIGATING';
    if (env.now() < s.quietUntil) return 'SETTLING';
    return channels().length ? 'AMBIENT' : 'IDLE';
  }

  /** Ambience runs only in a still, visible, unobstructed scene the person is not working in. */
  function ambientAllowed(): boolean {
    return mode() !== 'OFF' && !s.hidden && s.overlays + s.held === 0 && s.interacting === 0 && !s.typing && !navigating() && !signal() && env.now() >= s.quietUntil;
  }

  function channels(): AmbientChannel[] {
    if (!ambientAllowed()) return [];
    const declared = new Set<AmbientChannel>();
    for (const list of s.declared.values()) for (const c of list) declared.add(c);
    return CHANNEL_ORDER.filter((c) => declared.has(c)).slice(0, CHANNELS_FOR[mode()]);
  }

  function snapshot(): MotionSnapshot {
    return { mode: mode(), phase: phase(), channels: channels(), reduced: s.reduced, hidden: s.hidden, overlays: s.overlays + s.held, interacting: s.interacting, typing: s.typing, navigating: navigating(), signal: signal(), active: active.size };
  }

  /** Re-derive, write the root attributes, notify, and wake again when the next time-bound condition expires. */
  function sync() {
    if (wake != null) env.clearTimeout(wake);
    wake = null;
    const now = env.now();
    const next = [s.navUntil, s.quietUntil, s.signalUntil].filter((t) => t > now);
    if (next.length) wake = env.setTimeout(sync, Math.min(...next) - now + 1);
    const snap = snapshot();
    if (root) {
      root.dataset.jrnMotionMode = snap.mode;
      root.dataset.jrnMotionPhase = snap.phase;
      root.dataset.jrnAmbient = snap.channels.length ? snap.channels.join(' ') : 'off';
    }
    const sig = `${snap.mode}|${snap.phase}|${snap.channels.join('')}|${snap.overlays}|${snap.hidden}`;
    if (sig !== last) {
      last = sig;
      for (const l of listeners) l();
    }
  }

  const quiet = (ms: number) => {
    s.quietUntil = Math.max(s.quietUntil, env.now() + ms);
  };

  function cancelAll() {
    for (const { anim } of [...active.values()]) anim.cancel();
    active.clear();
  }

  return {
    snapshot,
    phase,
    channels,
    ambientAllowed,
    mode,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    /** The `.jrn` root the attributes are written on (one per runtime). Starts the entrance quiet period. */
    attachRoot(el: HTMLElement | null) {
      root = el;
      quiet(QUIET.entrance);
      sync();
    },
    setReduced(v: boolean) {
      s.reduced = v;
      if (v) cancelAll();
      sync();
    },
    setHidden(v: boolean) {
      s.hidden = v;
      if (v) cancelAll();
      else quiet(QUIET.signal);
      sync();
    },
    /** Constrained devices (data saver / very low memory) default to SUBTLE. */
    setConstrained(v: boolean) {
      s.constrained = v;
      sync();
    },
    /** An explicit intensity (design preview, tests); null returns to the defaults. Reduced motion always wins. */
    setOverride(m: MotionMode | null) {
      s.override = m;
      sync();
    },
    setOverlays(n: number) {
      if (n !== s.overlays) {
        if (n < s.overlays) quiet(QUIET.interaction);
        s.overlays = n;
        sync();
      }
    },
    /** An anchored surface outside the overlay host is open (a popover): ambience pauses until its release. */
    holdOverlay() {
      s.held += 1;
      sync();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        s.held = Math.max(0, s.held - 1);
        quiet(QUIET.interaction);
        sync();
      };
    },
    /** Pointer / gesture: returns its end. Ambience pauses while any is active and for a short quiet period after. */
    beginInteraction() {
      s.interacting += 1;
      sync();
      let ended = false;
      return () => {
        if (ended) return;
        ended = true;
        s.interacting = Math.max(0, s.interacting - 1);
        quiet(QUIET.interaction);
        sync();
      };
    },
    setTyping(v: boolean) {
      if (v === s.typing) return;
      s.typing = v;
      if (!v) quiet(QUIET.interaction);
      sync();
    },
    navigate(ms = 700) {
      s.navUntil = Math.max(s.navUntil, env.now() + ms);
      quiet(ms + QUIET.navigation);
      sync();
    },
    /** A state the store has already committed. Returns a clear (PROCESSING / VALIDATING hold until cleared). */
    signal(p: SignalPhase, ms = SIGNAL_MS[p]) {
      s.signal = p;
      s.signalUntil = ms > 0 ? env.now() + ms : 0;
      quiet(Math.max(ms, 0) + QUIET.signal);
      sync();
      return () => {
        if (s.signal === p) {
          s.signal = null;
          s.signalUntil = 0;
          quiet(QUIET.signal);
          sync();
        }
      };
    },
    /** A surface declares the ambient channels it can offer (only on independently mounted art). Returns the undeclare. */
    declareAmbient(owner: string, list: readonly AmbientChannel[]) {
      s.declared.set(owner, list);
      sync();
      return () => {
        if (s.declared.get(owner) === list) s.declared.delete(owner);
        sync();
      };
    },
    /**
     * A one-shot material response (Web Animations, `fill: 'none'`). Skipped under reduced motion, while hidden, or when a
     * higher-priority response is still running on the element; otherwise it interrupts the element's current response.
     */
    play(el: Element | null | undefined, keyframes: Keyframe[], o: PlayOptions): Animation | null {
      if (!el || typeof (el as HTMLElement).animate !== 'function' || s.reduced || s.hidden) return null;
      const cur = active.get(el);
      if (cur) {
        if (cur.priority < o.priority) return null;
        cur.anim.cancel();
        active.delete(el);
      }
      const anim = (el as HTMLElement).animate(keyframes, { duration: o.duration, easing: o.easing ?? 'ease-out', delay: o.delay ?? 0, fill: 'none' });
      const entry = { anim, priority: o.priority, key: o.key };
      active.set(el, entry);
      const done = () => {
        if (active.get(el) === entry) active.delete(el);
      };
      anim.addEventListener('finish', done);
      anim.addEventListener('cancel', done);
      return anim;
    },
    /** Cancel every running one-shot response (route change, hidden page, reduced motion). */
    cancelAll,
    /** tests: drop every declaration, signal and timer */
    reset() {
      cancelAll();
      s.declared.clear();
      s.signal = null;
      s.signalUntil = 0;
      s.navUntil = 0;
      s.quietUntil = 0;
      s.interacting = 0;
      s.typing = false;
      s.overlays = 0;
      s.held = 0;
      s.hidden = false;
      s.override = null;
      sync();
    },
  };
}

export type MotionDirector = ReturnType<typeof createMotionDirector>;

/** The runtime's one director. */
export const motionDirector: MotionDirector = createMotionDirector();
