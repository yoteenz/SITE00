/**
 * Material motion tokens (OPUS4). One small vocabulary, one easing per material, short one-shot responses only. Every
 * response is a transform / opacity keyframe list (compositor-friendly) played through the director with `fill: 'none'`.
 */
import { motionDirector, PRIORITY, type MotionPriority, type SignalPhase } from './director';

export const EASE = {
  /** light, tactile, natural deceleration */
  paper: 'cubic-bezier(0.22, 0.75, 0.28, 1)',
  /** weighted: slow to start, settles firmly */
  bronze: 'cubic-bezier(0.3, 0, 0.12, 1)',
  /** short compression and a small rebound */
  wax: 'cubic-bezier(0.34, 0.06, 0.2, 1)',
  /** soft and slow */
  textile: 'cubic-bezier(0.45, 0.05, 0.25, 1)',
  /** controlled, even */
  navigation: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  /** brief and localized */
  error: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
} as const;

/** Duration ranges the sprint sets (ms). */
export const TIMING = {
  micro: [100, 180],
  paperFeedback: [180, 350],
  paperReveal: [350, 550],
  overlay: [350, 650],
  material: [450, 800],
  navigation: [550, 900],
  ambientCycle: [8000, 20000],
} as const;

/** `signal`: the phase the director holds while the response plays (ambience waits for financial feedback). */
type Response = { keyframes: Keyframe[]; duration: number; easing: string; signal: SignalPhase };

export const RESPONSES = {
  /** a paper that has just been confirmed (a saved figure on it): lifts a little and settles */
  paperSettle: { keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)', offset: 0.35 }, { transform: 'translateY(0)' }], duration: 340, easing: EASE.paper, signal: 'CONFIRMED' },
  /** a bronze / coin object meeting a surface: a small weighted rotation that settles */
  bronzeSettle: { keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-2deg)', offset: 0.3 }, { transform: 'rotate(0.7deg)', offset: 0.66 }, { transform: 'rotate(0deg)' }], duration: 620, easing: EASE.bronze, signal: 'CONFIRMED' },
  /** a wax impression: compression, a minor rebound, release */
  waxStamp: { keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0.94)', offset: 0.28 }, { transform: 'scale(1.02)', offset: 0.62 }, { transform: 'scale(1)' }], duration: 560, easing: EASE.wax, signal: 'CONFIRMED' },
  /** an error on one control: brief, localized, never on a figure */
  errorNudge: { keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)', offset: 0.2 }, { transform: 'translateX(3px)', offset: 0.45 }, { transform: 'translateX(-2px)', offset: 0.7 }, { transform: 'translateX(0)' }], duration: 320, easing: EASE.error, signal: 'ERROR' },
  /** a calm warning (failed, returned, needs reconciliation): settles once, no shake */
  warningSettle: { keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(2px)', offset: 0.4 }, { transform: 'translateY(0)' }], duration: 520, easing: EASE.textile, signal: 'WARNING' },
  /** a consent change, acknowledged: a warm wash on the row (its own `.jce-ack` layer) rises and fades once — opacity only */
  consentAck: { keyframes: [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], duration: 600, easing: EASE.textile, signal: 'CONFIRMED' },
} as const satisfies Record<string, Response>;

export type ResponseName = keyof typeof RESPONSES;

/**
 * Play one material response on an element (skipped under reduced motion / while hidden; interrupts its own previous) and
 * hold its signal phase. Call it only after the store has committed the state the response describes.
 */
export function respond(el: Element | null | undefined, name: ResponseName, o: { priority?: MotionPriority; delay?: number } = {}): Animation | null {
  const r = RESPONSES[name];
  motionDirector.signal(r.signal, r.duration + (o.delay ?? 0));
  return motionDirector.play(el, r.keyframes, { key: name, priority: o.priority ?? PRIORITY.FINANCIAL, duration: r.duration, easing: r.easing, delay: o.delay });
}
