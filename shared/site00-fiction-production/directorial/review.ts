import { FOUNDER_ACTOR } from '../approvals.js';
import { placeShots } from './timeline.js';
import type { ProductionPlan } from './types.js';

/** Packet section 10, in order. Each step is a separate founder decision (sprint V2 §24). */
export const AUTHORIZATION_STEPS = ['SCREENPLAY', 'DIRECTION', 'KEYFRAMES', 'GENERATION_BUDGET', 'PRODUCTION'] as const;
export type AuthorizationStep = (typeof AUTHORIZATION_STEPS)[number];

const STEP_PREREQUISITES: Record<AuthorizationStep, AuthorizationStep[]> = {
  SCREENPLAY: [],
  DIRECTION: ['SCREENPLAY'],
  KEYFRAMES: ['DIRECTION'],
  GENERATION_BUDGET: ['KEYFRAMES'],
  PRODUCTION: ['GENERATION_BUDGET'],
};

export type ElementType = 'SCREENPLAY' | 'INTENT' | 'SHOT' | 'KEYFRAME' | 'MUSIC_CUE' | 'SOUND_CUE' | 'DIALOGUE_LINE' | 'ENVIRONMENT' | 'WARDROBE' | 'BUDGET';
export type ElementState = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | 'INVALIDATED';
export type ElementDecision = { elementId: string; type: ElementType; state: ElementState; version: number; history: Array<{ from: ElementState; to: ElementState; actor: string; at: string; note: string | null }> };
export type StepRecord = { state: 'PENDING' | 'AUTHORIZED'; actor: string | null; at: string | null; note: string | null; scope: string[] | null };

export type ChangeKind = 'DIALOGUE_LINE' | 'ACTION' | 'SHOT_DESIGN' | 'TIMING' | 'MUSIC' | 'SOUND' | 'KEYFRAME' | 'ENVIRONMENT' | 'WARDROBE' | 'BUDGET';
export type ChangeRequest = { requestId: string; at: string; actor: string; text: string; kind: ChangeKind; targets: string[]; invalidated: string[]; preserved: string[]; recheck: string[]; status: 'OPEN' | 'APPLIED' | 'WITHDRAWN' };

export type SceneReviewState = {
  unitId: string;
  version: number;
  steps: Record<AuthorizationStep, StepRecord>;
  elements: ElementDecision[];
  changeRequests: ChangeRequest[];
};

export class ReviewError extends Error {}

export function newReviewState(plan: ProductionPlan, extra: Array<{ elementId: string; type: ElementType }> = []): SceneReviewState {
  const el = (elementId: string, type: ElementType): ElementDecision => ({ elementId, type, state: 'PENDING', version: 1, history: [] });
  return {
    unitId: plan.unitId,
    version: 1,
    steps: Object.fromEntries(AUTHORIZATION_STEPS.map((s) => [s, { state: 'PENDING', actor: null, at: null, note: null, scope: null }])) as Record<AuthorizationStep, StepRecord>,
    elements: [
      el(`${plan.releaseId}/SCREENPLAY`, 'SCREENPLAY'),
      el(`${plan.unitId}/INTENT`, 'INTENT'),
      ...plan.shots.map((s) => el(s.shotId, 'SHOT')),
      ...plan.keyframes.filter((k) => k.source !== 'NOT_NEEDED').map((k) => el(k.keyframeId, 'KEYFRAME')),
      ...plan.music.map((m) => el(m.cueId, 'MUSIC_CUE')),
      ...plan.sound.map((c) => el(c.cueId, 'SOUND_CUE')),
      ...plan.dialogue.map((d) => el(d.lineId, 'DIALOGUE_LINE')),
      ...extra.map((e) => el(e.elementId, e.type)),
      el(`${plan.unitId}/BUDGET`, 'BUDGET'),
    ],
    changeRequests: [],
  };
}

/**
 * Carries a saved review state onto a regenerated plan: recorded decisions are kept, new elements start PENDING.
 * An element that disappears from the plan after a founder decision is a conflict; it needs a change request, not a silent drop.
 */
export function reconcileReviewState(saved: SceneReviewState, fresh: SceneReviewState): SceneReviewState {
  if (saved.unitId !== fresh.unitId) throw new ReviewError(`review state belongs to ${saved.unitId}, not ${fresh.unitId}`);
  const freshIds = new Set(fresh.elements.map((e) => e.elementId));
  const dropped = saved.elements.filter((e) => !freshIds.has(e.elementId) && (e.state !== 'PENDING' || e.history.length));
  if (dropped.length) throw new ReviewError(`elements with founder history are missing from the plan: ${dropped.map((e) => e.elementId).join(', ')}`);
  const byId = new Map(saved.elements.map((e) => [e.elementId, e]));
  return { ...saved, elements: fresh.elements.map((e) => byId.get(e.elementId) ?? e) };
}

const founderOnly = (actor: string) => {
  if (actor !== FOUNDER_ACTOR) throw new ReviewError(`only the founder decides; got ${actor}`);
};

export function decideElement(state: SceneReviewState, elementId: string, to: Exclude<ElementState, 'PENDING' | 'INVALIDATED'>, actor: string, at: string, note: string | null = null): SceneReviewState {
  founderOnly(actor);
  const found = state.elements.find((e) => e.elementId === elementId);
  if (!found) throw new ReviewError(`unknown element ${elementId}`);
  return {
    ...state,
    elements: state.elements.map((e) => (e.elementId === elementId ? { ...e, state: to, history: [...e.history, { from: e.state, to, actor, at, note }] } : e)),
  };
}

/** Elements a step covers. PRODUCTION may be scoped to a subset of shots (partial production authorization). */
export function stepElements(state: SceneReviewState, step: AuthorizationStep, scope: string[] | null = null): ElementDecision[] {
  const types: Record<AuthorizationStep, ElementType[]> = {
    SCREENPLAY: ['SCREENPLAY', 'DIALOGUE_LINE'],
    DIRECTION: ['INTENT', 'SHOT', 'MUSIC_CUE', 'SOUND_CUE'],
    KEYFRAMES: ['KEYFRAME', 'ENVIRONMENT', 'WARDROBE'],
    GENERATION_BUDGET: ['BUDGET'],
    PRODUCTION: ['SHOT'],
  };
  return state.elements.filter((e) => types[step].includes(e.type) && (!scope || scope.includes(e.elementId)));
}

export function authorizeStep(state: SceneReviewState, step: AuthorizationStep, actor: string, at: string, note: string | null = null, scope: string[] | null = null): SceneReviewState {
  founderOnly(actor);
  for (const dep of STEP_PREREQUISITES[step]) if (state.steps[dep].state !== 'AUTHORIZED') throw new ReviewError(`${step}: ${dep} must be authorized first`);
  const pending = stepElements(state, step, scope).filter((e) => e.state !== 'APPROVED');
  if (step !== 'SCREENPLAY' && step !== 'DIRECTION' && pending.length) throw new ReviewError(`${step}: not yet approved: ${pending.map((e) => e.elementId).join(', ')}`);
  const open = state.changeRequests.filter((c) => c.status === 'OPEN' && c.targets.some((t) => stepElements(state, step, scope).some((e) => e.elementId === t)));
  if (open.length) throw new ReviewError(`${step}: open change requests ${open.map((c) => c.requestId).join(', ')}`);
  const elements = step === 'SCREENPLAY' || step === 'DIRECTION'
    ? state.elements.map((e) => (stepElements(state, step, scope).some((x) => x.elementId === e.elementId) && e.state === 'PENDING' ? { ...e, state: 'APPROVED' as const, history: [...e.history, { from: e.state, to: 'APPROVED' as const, actor, at, note: `${step} authorized` }] } : e))
    : state.elements;
  return { ...state, elements, steps: { ...state.steps, [step]: { state: 'AUTHORIZED', actor, at, note, scope } } };
}

/** Dependency edges for change impact: shot ← its keyframes ← their references; lip-sync shots ← the lines they show. */
export function dependents(plan: ProductionPlan): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const link = (from: string, to: string) => (out.get(from) ?? out.set(from, new Set()).get(from)!).add(to);
  for (const k of plan.keyframes) {
    for (const d of k.derivesFrom) link(d, k.keyframeId);
    for (const u of k.usedBy) link(k.keyframeId, u);
    if (k.extractFrom) link(k.extractFrom.shotId, k.keyframeId);
  }
  const placed = placeShots(plan.shots);
  for (const d of plan.dialogue) for (const s of placed) if (s.lipSync === 'REQUIRED' && s.mouthVisible.includes(d.speaker) && s.at < d.at + d.frames && d.at < s.at + s.frames) link(d.lineId, s.shotId);
  return out;
}

const KIND_RECHECK: Partial<Record<ChangeKind, (plan: ProductionPlan, targets: string[]) => string[]>> = {
  TIMING: (plan, targets) => plan.music.filter((m) => m.hitPoints.length).map((m) => m.cueId).concat(plan.sound.filter((c) => c.linkedShots.some((s) => targets.includes(s))).map((c) => c.cueId)),
  DIALOGUE_LINE: (plan, targets) => plan.subtitles.filter((t) => plan.dialogue.some((d) => targets.includes(d.lineId) && d.at === t.at)).map((t) => t.eventId),
};

/**
 * A natural-language change request with its computed impact. Only the targets and what derives from them are invalidated;
 * a dialogue change never reaches an environment, wardrobe or unrelated keyframe.
 */
export function requestChange(state: SceneReviewState, plan: ProductionPlan, req: { requestId: string; at: string; actor: string; text: string; kind: ChangeKind; targets: string[] }): SceneReviewState {
  founderOnly(req.actor);
  const known = new Set(state.elements.map((e) => e.elementId));
  for (const t of req.targets) if (!known.has(t)) throw new ReviewError(`unknown target ${t}`);
  const edges = dependents(plan);
  const hit = new Set<string>(req.targets);
  const queue = [...req.targets];
  while (queue.length) for (const n of edges.get(queue.shift()!) ?? []) if (!hit.has(n)) (hit.add(n), queue.push(n));
  if (req.kind === 'DIALOGUE_LINE') hit.add(`${plan.releaseId}/SCREENPLAY`);
  if (req.kind === 'BUDGET') hit.add(`${plan.unitId}/BUDGET`);
  const invalidated = [...hit].filter((id) => known.has(id));
  const preserved = state.elements.filter((e) => e.state === 'APPROVED' && !hit.has(e.elementId)).map((e) => e.elementId);
  const recheck = KIND_RECHECK[req.kind]?.(plan, req.targets) ?? [];
  const elements = state.elements.map((e) =>
    hit.has(e.elementId) && e.state !== 'PENDING' ? { ...e, state: 'INVALIDATED' as const, version: e.version + 1, history: [...e.history, { from: e.state, to: 'INVALIDATED' as const, actor: req.actor, at: req.at, note: `${req.requestId}: ${req.text}` }] } : e,
  );
  const steps = { ...state.steps };
  for (const step of AUTHORIZATION_STEPS.filter((s) => s !== 'PRODUCTION')) {
    if (steps[step].state === 'AUTHORIZED' && stepElements(state, step, steps[step].scope).some((e) => hit.has(e.elementId))) {
      steps[step] = { state: 'PENDING', actor: null, at: null, note: `reopened by ${req.requestId}`, scope: null };
    }
  }
  return { ...state, version: state.version + 1, elements, steps, changeRequests: [...state.changeRequests, { ...req, invalidated, preserved, recheck, status: 'OPEN' }] };
}

export type JobRequest = { jobId: string; kind: 'KEYFRAME_IMAGE' | 'REFERENCE_IMAGE' | 'VIDEO_I2V' | 'LIP_SYNC' | 'DIALOGUE_TTS' | 'SFX' | 'MUSIC'; target: string; estimatedCredits: number | null; routeExecutable: boolean };
export type JobDecision = { jobId: string; allowed: boolean; reasons: string[]; creditsSpent: 0 };

/** Pre-spend gate. Nothing dispatches without the matching founder steps, an approved target, a known price within budget and a route this environment can run. */
export function authorizeGenerationJob(state: SceneReviewState, job: JobRequest, authorizedCredits: number, committedCredits: number): JobDecision {
  const reasons: string[] = [];
  const step: AuthorizationStep = job.kind === 'KEYFRAME_IMAGE' || job.kind === 'REFERENCE_IMAGE' ? 'GENERATION_BUDGET' : 'PRODUCTION';
  if (state.steps[step].state !== 'AUTHORIZED') reasons.push(`${step} not authorized`);
  const scope = state.steps[step].scope;
  if (step === 'PRODUCTION' && scope && !scope.includes(job.target)) reasons.push(`${job.target} is outside the authorized production scope`);
  const el = state.elements.find((e) => e.elementId === job.target);
  if (!el) reasons.push(`unknown target ${job.target}`);
  else if (el.state !== 'APPROVED') reasons.push(`${job.target} is ${el.state}`);
  if (job.estimatedCredits === null) reasons.push('price UNKNOWN: quote before authorizing');
  else if (committedCredits + job.estimatedCredits > authorizedCredits) reasons.push(`exceeds authorized budget (${committedCredits} + ${job.estimatedCredits} > ${authorizedCredits})`);
  if (!job.routeExecutable) reasons.push('provider route not executable from this environment');
  return { jobId: job.jobId, allowed: reasons.length === 0, reasons, creditsSpent: 0 };
}
