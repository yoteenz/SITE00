/**
 * Simulation preview engine — LEVEL 2 (cached/deterministic preview). There is NO real-time simulation backend.
 * Checks compare EXPECTED (derived from the founder-approved authority state) vs ACTUAL (cached preview fixture).
 * Seeded defects (WARDROBE_TOP, MOTION_TIMING) disappear only once the responsible station is revised & re-approved.
 */
import { GARMENT_BY_ID } from './lookups.js';
import { MOTION_LIBRARY, SIM_TEST_DEFS } from './library.js';
import type { CheckResult, FabricationState, MotionAsset, SimCheck, SimResultRecord } from './types.js';

export const SEEDED_DEFECTS = ['WARDROBE_TOP', 'MOTION_TIMING'] as const;

const tc = (frames: number, fps: number): string => {
  const total = Math.round(frames);
  const s = Math.floor(total / fps);
  const f = total % fps;
  const p = (n: number) => String(n).padStart(2, '0');
  return `00:${p(Math.floor(s / 60))}:${p(s % 60)}${f ? `+${f}F` : ''}`;
};

export function motionById(state: Pick<FabricationState, 'publishedMotions'>, id: string): MotionAsset | null {
  return [...MOTION_LIBRARY, ...state.publishedMotions].find((m) => m.motionId === id) ?? null;
}

export function requiredMotionFor(state: FabricationState): { motionId: string; available: boolean } | null {
  const id = SIM_TEST_DEFS[state.selectedTestId].motionId;
  if (!id) return null;
  return { motionId: id, available: !!motionById(state, id) };
}

export function deriveChecks(state: FabricationState): SimCheck[] {
  const resolved = new Set(state.resolvedDefects);
  const wardTop = resolved.has('WARDROBE_TOP') ? false : true;
  const timing = resolved.has('MOTION_TIMING') ? false : true;
  const topId = state.fitting.L1;
  const topExpected = topId ? GARMENT_BY_ID[topId]?.code ?? 'UNSET' : 'WT-17A';
  const bottomId = state.fitting.L2;
  const bottomExpected = bottomId ? GARMENT_BY_ID[bottomId]?.code ?? 'UNSET' : 'WB-09A';
  const motion = motionById(state, state.motionUsedIds[0] ?? state.selectedMotionId) ?? MOTION_LIBRARY[0]!;
  const beat = motion.keyBeatFrame;
  const mk = (c: Omit<SimCheck, 'evidenceSlotId' | 'result'> & { fail: boolean }): SimCheck => ({
    checkId: c.checkId,
    label: c.label,
    sub: c.sub,
    owner: c.owner,
    expected: c.expected,
    actual: c.actual,
    delta: c.delta,
    result: (c.fail ? 'FAIL' : 'PASS') as CheckResult,
    evidenceSlotId: `simulation.sw017.evidence.${c.checkId.toLowerCase().replace(/_/g, '-')}`,
  });
  return [
    mk({ checkId: 'WARDROBE_TOP', label: 'WARDROBE TOP', sub: 'MATERIAL ID', owner: 'look', expected: topExpected, actual: wardTop ? `${topExpected}*` : topExpected, delta: wardTop ? 'VARIANCE' : '—', fail: wardTop }),
    mk({ checkId: 'WARDROBE_BOTTOM', label: 'WARDROBE BOTTOM', sub: 'MATERIAL ID', owner: 'look', expected: bottomExpected, actual: bottomExpected, delta: '—', fail: false }),
    mk({ checkId: 'SCAR_VISIBILITY', label: 'SCAR VISIBILITY', sub: 'LEFT CHEEK', owner: 'appearance', expected: 'MEDIUM', actual: 'MEDIUM', delta: '± 2%', fail: false }),
    mk({ checkId: 'MOTION_TIMING', label: 'MOTION TIMING', sub: `${motion.motionId} KEY BEAT`, owner: 'performance', expected: tc(beat, motion.fps), actual: tc(beat + (timing ? 12 : 0), motion.fps), delta: timing ? '+12 FRAMES' : '0 FRAMES', fail: timing }),
    mk({ checkId: 'LIGHTING_RESPONSE', label: 'LIGHTING RESPONSE', sub: 'KEY ANGLE 35°', owner: 'simulation', expected: '0.72 EV', actual: '0.71 EV', delta: '-0.01 EV', fail: false }),
    mk({ checkId: 'PHYSIQUE_MEASUREMENT', label: 'PHYSIQUE MEASUREMENT', sub: 'SHOULDER WIDTH', owner: 'body', expected: '39.8 CM', actual: '39.7 CM', delta: '-0.1 CM', fail: false }),
    mk({ checkId: 'SKIN_TONE', label: 'SKIN TONE', sub: 'REFERENCE', owner: 'appearance', expected: 'ΔE ≤ 2.0', actual: 'ΔE 1.3', delta: 'WITHIN', fail: false }),
    mk({ checkId: 'BREATH_PATTERN', label: 'BREATH PATTERN', sub: 'RESTING RATE', owner: 'performance', expected: '12 RPM', actual: '12 RPM', delta: '0 RPM', fail: false }),
  ];
}

export function buildResult(state: FabricationState, simulationId: string, at: string): SimResultRecord {
  const checks = deriveChecks(state);
  return {
    simulationId,
    testId: state.run!.testId,
    completedAt: at,
    durationSec: state.run!.config.durationSec,
    checks,
    failed: checks.filter((c) => c.result === 'FAIL').length,
    accepted: false,
    routedTo: [],
  };
}

/** Preview telemetry for the RUNNING state — cached-preview values modulated by progress. Not measured. */
export function previewTelemetry(progress: number) {
  const w = (base: number, amp: number, k: number) => Math.round((base + Math.sin(progress * 18 + k) * amp) * 10) / 10;
  return {
    hr: Math.round(w(72, 3, 0)),
    resp: Math.round(w(16, 1, 1)),
    temp: w(36.7, 0.1, 2),
    focus: Math.round(w(98, 1, 3)),
    metrics: [
      { k: 'MICRO-EXPRESSIONS', v: Math.round(w(92, 2, 4)) },
      { k: 'EMOTIONAL VARIANCE', v: Math.round(w(88, 2, 5)) },
      { k: 'EYE TRACKING', v: Math.round(w(96, 1, 6)) },
      { k: 'VOICE STABILITY', v: Math.round(w(78, 3, 7)) },
      { k: 'PHYSIO STABILITY', v: Math.round(w(90, 2, 8)) },
      { k: 'MOVEMENT FLUIDITY', v: Math.round(w(85, 2, 9)) },
    ],
  };
}
