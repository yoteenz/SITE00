import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, LABEL_KEY, table } from './md.js';

const D = X.Directorial;
const M = 'shared/site00-fiction-production/directorial';

const MODULES: Array<[string, string]> = [
  [`${M}/timecode.ts`, 'Frames are authoritative; HH:MM:SS.mmm and SMPTE are derived. Frame rate 24 fps, provisional until FD-S101-09.'],
  [`${M}/timeline.ts`, 'Places shots on VIDEO_A/VIDEO_B, builds the eight-track multitrack, checks tiling, gaps, overlays, bounds, A/V sync, coverage, J/L cuts.'],
  [`${M}/events.ts`, 'Derives one second-by-second event per picture shot with everything audible and required under it.'],
  [`${M}/motion.ts`, 'Motion bands, generation length (screen time + 0.5 s handle, whole seconds, 3–15 s) and one primary action per shot.'],
  [`${M}/keyframes.ts`, 'Keyframe provenance (references, reuse of approved assets, extraction), inherited blockers, production order.'],
  [`${M}/spatial.ts`, 'Spatial authority per set, character and prop states per shot, declared transitions.'],
  [`${M}/audio.ts`, 'Music supervision (rights, silence, hit points) and sound-design restraint.'],
  [`${M}/intent.ts`, "Director's intent A–K, performance direction, embellishment labels, filler-word guard."],
  [`${M}/routing.ts`, 'Provider routes with real access status, quotes and the production budget (UNKNOWN where unquoted).'],
  [`${M}/review.ts`, 'Founder steps, element decisions, natural-language change requests with impact, the pre-spend gate.'],
  [`${M}/progression.ts`, 'One unit in founder review; advance only on founder archive or park.'],
  [`${M}/knowledgeBase.ts`, 'Versioned production knowledge cited by recommendations.'],
  [`${M}/schemas.ts`, 'JSON schemas generated from the sprint field lists (deliverables 10–13).'],
  [`${M}/packet.ts`, 'Validates a directed scene and assembles the ten-section packet.'],
  ['shared/site00-fiction-production/scenes/', 'Authored directed scenes (S1-01) and the bundle both build scripts share.'],
];

export function engineDoc(direction: X.Directorial.SceneDirection): string {
  return [
    '# 08 — Directorial intelligence engine',
    '',
    generatedNote([`${M}/`, `${X.EXCHANGE_PATHS.season}/PRODUCTION_KNOWLEDGE_BASE_V1.json`]),
    '',
    '## What is implemented',
    '',
    'The engine is code with tests. A director (the agent, then the founder) authors a scene plan; the engine derives every timecode, track, event, cost and review element from it and refuses a plan that breaks a rule. It does not write a directed scene by itself: plans for future releases are authored when each release becomes active.',
    '',
    table(['Module', 'Responsibility'], MODULES),
    '',
    '## Flow',
    '',
    'Season master → scene index (Level A) → active release selected → directed scene authored → validation → ten-section packet → founder review steps → generation gate (nothing dispatches in this sprint) → edit → founder final approval → archive → next release.',
    '',
    "## Director's intent (A–K), S1-01",
    '',
    table(['', 'Field', 'S1-01'], D.INTENT_FIELDS.map((f) => [f.letter, f.label, f.get(direction.intent)])),
    '',
    `Intent text that leans on filler (${D.FILLER_TERMS.source.replace(/\\b|\(|\)/g, '').split('|').slice(0, 6).join(', ')}…) fails validation: every field must say what is actually seen or heard.`,
    '',
    '## Creative labels',
    '',
    LABEL_KEY,
    '',
    table(['Id', 'Label', 'Embellishment', 'Source'], direction.plan.embellishments.map((e) => [e.id, e.label, e.description, e.source])),
    '',
    `## Production knowledge base (v${D.KNOWLEDGE_BASE_VERSION})`,
    '',
    'Recommendations cite these entries. They are recorded outcomes and founder decisions, not model training.',
    '',
    table(['Entry', 'Category', 'Authority', 'Statement'], D.PRODUCTION_KNOWLEDGE.map((k) => [k.entryId, k.category, k.authority, k.statement])),
  ].join('\n');
}

export function motionDoc(plan: X.Directorial.ProductionPlan): string {
  const fps = plan.fps;
  const placed = D.placeShots(plan.shots);
  const s = D.motionSummary(plan.shots, fps);
  const advisories = D.validateMotion(plan.shots, fps);
  return [
    '# 09 — Motion-weighted shot planner',
    '',
    generatedNote([`${M}/motion.ts`, X.scenePath('S1-01', X.SCENE_FILES.shotList)]),
    '',
    '## Bands',
    '',
    'Founder-approved guidelines (sprint V2 §09). A shot outside its band needs a reason on record; a silent exception is an error.',
    '',
    table(['Class', 'Screen time', 'Typical content'], (Object.keys(D.MOTION_GUIDE) as X.Directorial.MotionClass[]).map((c) => [c, D.motionBand(c), D.MOTION_GUIDE[c].examples.join(', ')])),
    '',
    `**Generation length.** Requested seconds = screen time + ${D.GENERATION_LIMITS.handleSec} s handle, rounded up, clamped to ${D.GENERATION_LIMITS.minSec}–${D.GENERATION_LIMITS.maxSec} s (the kling-3-omni form accepts whole seconds only).`,
    '**One action.** A high-motion generated shot carries one primary physical action. A gesture that needs two is split into coverage (PK-001).',
    '',
    '## S1-01 Dusk',
    '',
    `${s.generatedShots} generated shots and ${s.editOnlyShots} editorial shot; ${s.screenSec} s of generated screen time requested as ${s.generationSec} s. By class: ${Object.entries(s.byClass).map(([k, v]) => `${k} ${v}`).join(', ')}.`,
    '',
    table(
      ['Shot', 'In', 'Frames', 'Screen', 'Class', 'Band', 'Generate', 'Primary action', 'Why this long'],
      placed.map((x) => [x.shotId, D.framesToTimecode(x.at, fps), x.frames, `${D.framesToSec(x.frames, fps)} s`, x.motionClass, D.motionBand(x.motionClass), x.generated ? `${D.generationSeconds(x.frames, fps)} s` : 'edit only', x.primaryAction || 'NONE', x.why.duration]),
    ),
    '',
    '## Exceptions on record',
    '',
    bullets(advisories.map((f) => `${f.severity} ${f.code} ${f.subject}: ${f.detail}`)),
  ].join('\n');
}

export function reviewWorkflowDoc(plan: X.Directorial.ProductionPlan, review: X.Directorial.SceneReviewState, extras: Array<{ elementId: string; type: X.Directorial.ElementType }>, active: X.Directorial.ActiveProduction): string {
  const F = X.FOUNDER_ACTOR;
  const AT = 'illustration';
  let s = D.authorizeStep(D.authorizeStep(D.newReviewState(plan, extras), 'SCREENPLAY', F, AT), 'DIRECTION', F, AT);
  for (const e of D.stepElements(s, 'KEYFRAMES')) s = D.decideElement(s, e.elementId, 'APPROVED', F, AT);
  s = D.authorizeStep(s, 'KEYFRAMES', F, AT);
  const example = (kind: X.Directorial.ChangeKind, text: string, target: string) => {
    const r = D.requestChange(s, plan, { requestId: 'EXAMPLE', at: AT, actor: F, text, kind, targets: [target] });
    const c = r.changeRequests[0];
    return [`"${text}"`, kind, target, c.invalidated.join(' '), String(c.preserved.length), (Object.keys(r.steps) as X.Directorial.AuthorizationStep[]).filter((k) => r.steps[k].state === 'AUTHORIZED').join(', ') || 'none'];
  };
  const byType = review.elements.reduce<Record<string, number>>((a, e) => ({ ...a, [e.type]: (a[e.type] ?? 0) + 1 }), {});
  const byStatus = active.units.reduce<Record<string, number>>((a, u) => ({ ...a, [u.status]: (a[u.status] ?? 0) + 1 }), {});
  return [
    '# 18 — Founder scene review workflow',
    '',
    generatedNote([`${M}/review.ts`, `${M}/progression.ts`, X.scenePath('S1-01', X.SCENE_FILES.review), `${X.EXCHANGE_PATHS.season}/ACTIVE_PRODUCTION_V1.json`]),
    '',
    '## Steps',
    '',
    'Each step is a separate founder decision, in order. Only the founder can authorize a step, decide an element or file a change request; the engine throws for any other actor.',
    '',
    table(['Step', 'Covers', 'Rule'], [
      ['SCREENPLAY', 'screenplay, dialogue lines', 'Authorizing approves the pending screenplay elements.'],
      ['DIRECTION', 'intent, shots, music and sound cues', 'Authorizing approves the pending direction elements.'],
      ['KEYFRAMES', 'keyframes, environments, wardrobe', 'Every element must be approved one by one first.'],
      ['GENERATION_BUDGET', 'the budget element', 'Unlocks reference and keyframe jobs only, within the authorized amount.'],
      ['PRODUCTION', 'shots (optionally a scoped subset)', 'Unlocks video jobs for the scoped shots only.'],
    ]),
    '',
    `## S1-01 review state now`,
    '',
    `${review.elements.length} elements, all \`PENDING\`: ${Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', ')}. Every step is \`PENDING\`. A rebuild keeps recorded decisions; an element with founder history that disappears from the plan stops the build.`,
    '',
    '## Change requests keep partial approvals',
    '',
    'The founder writes a change in plain language; it is recorded with a kind and its targets. Only the targets and what derives from them are invalidated. Computed from the engine, after screenplay, direction and keyframes have been approved:',
    '',
    table(['Request', 'Kind', 'Target', 'Invalidated', 'Approvals kept', 'Steps still authorized'], [
      example('MUSIC', 'Bring the groove back more softly', 'S1-01-MX03'),
      example('SHOT_DESIGN', 'Hold the grandmother a little longer', 'S1-01-SH10'),
      example('ENVIRONMENT', 'Warmer brick on the street', 'KF-ENV-CITY-DUSK-A'),
    ]),
    '',
    '## The pre-spend gate',
    '',
    bullets([
      'Reference and keyframe jobs need GENERATION_BUDGET; video jobs need PRODUCTION, inside its scope.',
      'The target element must be APPROVED.',
      'The price must be quoted (UNKNOWN blocks) and fit inside the authorized amount with what is already committed.',
      'The provider route must be executable from this environment.',
      'The gate never spends: every decision returns `creditsSpent: 0`. Dispatch is a separate, logged action.',
    ]),
    '',
    '## One scene at a time',
    '',
    `${D.ONE_UNIT_RULE} Current queue: ${Object.entries(byStatus).map(([k, v]) => `${k} ${v}`).join(', ')}; active unit ${active.activeUnit}.`,
  ].join('\n');
}
