import { framesToSec } from './timecode.js';
import type { DirectorialFinding, MotionClass, ShotDesign } from './types.js';

/** Founder-approved motion strategy (sprint V2 §09). Adaptive guidelines: a reasoned exception is allowed, a silent one is not. */
export const MOTION_GUIDE: Record<MotionClass, { minSec: number; maxSec: number | null; examples: string[] }> = {
  HIGH: { minSec: 1, maxSec: 3, examples: ['walking details', 'fashion movement', 'gown reveals', 'prop handoffs', 'physical gestures', 'fast choreography'] },
  MODERATE: { minSec: 2, maxSec: 4, examples: ['turning', 'standing up', 'reaching', 'opening doors', 'picking up objects'] },
  LOW: { minSec: 2, maxSec: null, examples: ['seated conversation', 'listening', 'stationary close-ups', 'controlled dialogue'] },
  EMOTIONAL_DIALOGUE: { minSec: 3, maxSec: null, examples: ['confessions', 'revelations', 'intimate exchanges', 'monologues', 'uninterrupted reactions'] },
  ENVIRONMENT: { minSec: 2, maxSec: 6, examples: ['establishing moves', 'crane rises', 'architecture reveals'] },
};

/** Provider limits for one image-to-video generation, from the OpenArt kling-3-omni form (integer seconds 3–15). */
export const GENERATION_LIMITS = { minSec: 3, maxSec: 15, handleSec: 0.5 } as const;

/** Seconds to request from the provider: screen time plus an editing handle, rounded up to a whole second, clamped to provider limits. */
export function generationSeconds(frames: number, fps: number, limits = GENERATION_LIMITS): number {
  const want = Math.ceil(framesToSec(frames, fps) + limits.handleSec);
  return Math.min(limits.maxSec, Math.max(limits.minSec, want));
}

export function motionBand(cls: MotionClass): string {
  const g = MOTION_GUIDE[cls];
  return g.maxSec === null ? `${g.minSec}+ s` : `${g.minSec}–${g.maxSec} s`;
}

export function validateMotion(shots: ShotDesign[], fps: number): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  const generated = shots.filter((s) => s.generated);
  for (const s of shots) {
    const sec = framesToSec(s.frames, fps);
    const g = MOTION_GUIDE[s.motionClass];
    if (!s.why.duration.trim()) add('ERROR', 'DURATION_UNJUSTIFIED', s.shotId, 'why.duration is empty');
    if (sec < g.minSec || (g.maxSec !== null && sec > g.maxSec)) {
      add('ADVISORY', 'MOTION_BAND', s.shotId, `${sec} s sits outside the ${s.motionClass} guide (${motionBand(s.motionClass)}). Reason on record: ${s.why.duration}`);
    }
    if (!s.generated) continue;
    if (!s.primaryAction.trim()) add('ERROR', 'PRIMARY_ACTION_MISSING', s.shotId, 'a generated shot names its one primary action');
    if (s.actionCount > 1 && (s.motionClass === 'HIGH' || s.motionClass === 'MODERATE')) {
      add('WARNING', 'MULTIPLE_ACTIONS', s.shotId, `${s.actionCount} physical actions in one ${s.motionClass} generation; split into coverage or justify`);
    }
    const gen = generationSeconds(s.frames, fps);
    if (gen < sec) add('ERROR', 'GENERATION_TOO_SHORT', s.shotId, `generation ${gen} s is shorter than screen time ${sec} s`);
  }
  if (generated.length >= 6) {
    const secs = generated.map((s) => framesToSec(s.frames, fps));
    const mean = secs.reduce((a, b) => a + b, 0) / secs.length;
    const sd = Math.sqrt(secs.reduce((a, b) => a + (b - mean) ** 2, 0) / secs.length);
    if (sd < 0.25) add('WARNING', 'UNIFORM_RHYTHM', 'plan', `shot lengths barely vary (sd ${sd.toFixed(2)} s); avoid a metronomic cut`);
    const fast = generated.filter((s) => s.motionClass === 'HIGH').length / generated.length;
    if (fast > 0.8) add('WARNING', 'MONTAGE_ONLY', 'plan', `${Math.round(fast * 100)}% of shots are high-motion; the scene reads as a rapid montage`);
  }
  return out;
}

/** Totals for budgeting: screen seconds and requested generation seconds are different quantities and are never mixed. */
export function motionSummary(shots: ShotDesign[], fps: number) {
  const generated = shots.filter((s) => s.generated);
  const byClass: Record<string, number> = {};
  for (const s of generated) byClass[s.motionClass] = (byClass[s.motionClass] ?? 0) + 1;
  return {
    generatedShots: generated.length,
    editOnlyShots: shots.length - generated.length,
    screenSec: framesToSec(generated.reduce((a, s) => a + s.frames, 0), fps),
    generationSec: generated.reduce((a, s) => a + generationSeconds(s.frames, fps), 0),
    byClass,
  };
}
