import { audioSummary, licensingDependencies, validateMusicSupervision, validateSoundDesign } from './audio.js';
import { deriveTimelineEvents } from './events.js';
import { validateEmbellishments, validateIntent, validatePerformance } from './intent.js';
import { effectiveBlockers, keyframeCounts, keyframeProductionOrder, validateKeyframes } from './keyframes.js';
import { generationSeconds, motionSummary, validateMotion } from './motion.js';
import type { ProductionBudget } from './routing.js';
import type { SceneReviewState } from './review.js';
import { validatePhysicalContinuity, validateSpatialAuthority } from './spatial.js';
import { framesToSec, framesToTimecode } from './timecode.js';
import { buildMultitrack, editJoins, placeShots, validateTimeline } from './timeline.js';
import type { DirectorialFinding, DirectorsIntent, PerformanceDirection, ProductionPlan } from './types.js';

export type FounderDecision = { decisionId: string; question: string; why: string; options: string[]; recommendation: string; blocks: string[]; refs: string[]; status: 'OPEN' | 'ANSWERED'; answer: string | null };

export type SceneDirection = { plan: ProductionPlan; intent: DirectorsIntent; performance: PerformanceDirection[]; founderDecisions: FounderDecision[]; treatment: { feel: string; perspective: string; language: string; atmosphere: string; rhythm: string } };

export function validateDirection(d: SceneDirection, approvedAssets: ReadonlySet<string>): DirectorialFinding[] {
  const { plan } = d;
  const out: DirectorialFinding[] = [];
  const ids = new Set<string>();
  for (const s of plan.shots) {
    if (ids.has(s.shotId)) out.push({ severity: 'ERROR', code: 'SHOT_DUPLICATE_ID', subject: s.shotId, detail: 'duplicate shot id' });
    ids.add(s.shotId);
    for (const [k, v] of Object.entries(s.why)) if (!v.trim()) out.push({ severity: 'ERROR', code: 'WHY_MISSING', subject: s.shotId, detail: `why.${k} is empty` });
    if (!plan.lighting.some((l) => l.id === s.lightingState && l.shots.includes(s.shotId))) out.push({ severity: 'ERROR', code: 'LIGHTING_STATE', subject: s.shotId, detail: `lighting state ${s.lightingState} does not list this shot` });
  }
  const refs = new Set(d.founderDecisions.flatMap((f) => f.refs));
  return [
    ...out,
    ...validateTimeline(plan),
    ...validateMotion(plan.shots, plan.fps),
    ...validateKeyframes(plan, approvedAssets),
    ...validateSpatialAuthority(plan.spatial),
    ...validatePhysicalContinuity(plan),
    ...validateMusicSupervision(plan),
    ...validateSoundDesign(plan),
    ...validateIntent(d.intent),
    ...validatePerformance(d.performance, plan),
    ...validateEmbellishments(plan.embellishments, refs),
  ];
}

export function shotListRows(plan: ProductionPlan, budget: ProductionBudget, review: SceneReviewState) {
  const placed = placeShots(plan.shots);
  return placed.map((s) => {
    const cost = budget.perShot.find((p) => p.shotId === s.shotId);
    const state = review.elements.find((e) => e.elementId === s.shotId)?.state ?? 'PENDING';
    return {
      shotId: s.shotId, sceneId: s.sceneId, beatId: s.beatId, track: s.track,
      start: framesToTimecode(s.at, plan.fps), end: framesToTimecode(s.at + s.frames, plan.fps),
      intendedScreenTime: `${framesToSec(s.frames, plan.fps)} s (${s.frames} frames)`,
      generationDuration: s.generated ? `${generationSeconds(s.frames, plan.fps)} s` : 'EDIT ONLY',
      priority: s.priority, purpose: s.purpose, subject: s.subject, framing: s.framing, cameraHeight: s.cameraHeight, cameraAngle: s.cameraAngle,
      lensIntent: s.lensIntent, focalLength: s.focalLength, depthOfField: s.depthOfField, cameraMovement: s.cameraMovement, movementSpeed: s.movementSpeed,
      cameraDirection: s.cameraDirection, composition: s.composition, screenDirection: s.screenDirection, eyeline: s.eyeline, blocking: s.blocking,
      performance: s.performance, landmarks: s.landmarks.join('; ') || 'NONE', lighting: s.lightingState, wardrobe: s.wardrobe.join('; ') || 'NONE',
      propState: Object.entries(s.propState).map(([k, v]) => `${k}: ${v}`).join('; ') || 'NONE',
      dialogueVisibility: s.coverage, lipSync: s.lipSync, motionClass: s.motionClass, primaryAction: s.primaryAction || 'NONE',
      startFrame: s.startFrameRef ?? 'NONE', endFrame: s.endFrameRef ?? 'NOT REQUIRED', referenceAssets: s.referenceAssets.join('; ') || 'NONE',
      editTransition: s.editTransition, continuityRisk: s.continuityRisk.join('; ') || 'NONE',
      generationModel: s.generated ? 'OpenArt kling-3-omni image2video, pro, sound off' : 'NONE (editorial)',
      expectedCost: s.generated ? (cost?.credits === null || cost?.credits === undefined ? 'UNKNOWN' : `${cost.credits} credits (estimated)`) : '0',
      founderApprovalStatus: state,
      whyFraming: s.why.framing, whyDistance: s.why.distance, whyAngle: s.why.angle, whyMovement: s.why.movement, whyMoment: s.why.moment, whyDuration: s.why.duration,
    };
  });
}

export function cueSheetRows(plan: ProductionPlan) {
  const tc = (f: number) => framesToTimecode(f, plan.fps);
  return [
    ...plan.music.map((m) => ({
      cueId: m.cueId, track: 'MUSIC', type: m.cueType, start: tc(m.at), end: tc(m.at + m.frames), duration: `${framesToSec(m.frames, plan.fps)} s`,
      description: m.cueType === 'SILENCE' ? `SILENCE: ${m.title}` : m.title, diegesis: m.diegesis, genre: m.cueType === 'SILENCE' ? '' : `${m.genre} / ${m.subgenre}`,
      mood: m.mood, tempo: m.tempoRange, instrumentation: m.instrumentation.join('; '), vocal: m.vocal, energy: m.energy, arc: m.dynamicArc, entry: m.entry, exit: m.exit,
      sync: m.hitPoints.map((h) => `${tc(h.frame)} ${h.event}`).join('; '), perspective: '', relationship: [m.relationToDialogue, m.relationToSfx, m.relationToEditing].join(' | '),
      rights: `${m.rights.requirement}${m.rights.dependency ? `: ${m.rights.dependency}` : ''} (${m.rights.status})`, label: m.label,
    })),
    ...plan.sound.map((c) => ({
      cueId: c.cueId, track: c.track, type: c.layer, start: tc(c.at), end: tc(c.at + c.frames), duration: `${framesToSec(c.frames, plan.fps)} s`, description: c.description,
      diegesis: 'DIEGETIC', genre: '', mood: '', tempo: '', instrumentation: '', vocal: '', energy: '', arc: '', entry: '', exit: c.continuesUnderCut ? 'continues under cut' : '',
      sync: c.syncPoints.map((h) => `${tc(h.frame)} ${h.event}`).join('; '), perspective: `${c.perspective}; reverb: ${c.reverb}`, relationship: `linked: ${c.linkedShots.join(' ')}`,
      rights: 'NONE', label: c.label,
    })),
  ].sort((a, b) => a.start.localeCompare(b.start) || a.track.localeCompare(b.track));
}

export function buildScenePacket(d: SceneDirection, ctx: { review: SceneReviewState; budget: ProductionBudget; approvedAssets: ReadonlySet<string>; cast: unknown; assets: unknown; screenplayText: string; overview: { where: string; what: string; why: string; emotionalObjective: string } }) {
  const { plan } = d;
  const findings = validateDirection(d, ctx.approvedAssets);
  const blockers = effectiveBlockers(plan);
  const sev = (s: DirectorialFinding['severity']) => findings.filter((f) => f.severity === s);
  return {
    packetId: `${plan.unitId}.DIRECTORIAL_PACKET.V${ctx.review.version}`,
    unitId: plan.unitId,
    releaseId: plan.releaseId,
    status: 'FOUNDER_REVIEW_REQUIRED',
    fps: plan.fps,
    aspect: plan.aspect,
    sections: {
      '1_SCENE_OVERVIEW': { ...ctx.overview, estimatedDuration: `${framesToSec(plan.durationFrames, plan.fps)} s`, screenplay: plan.screenplay },
      '2_SCREENPLAY': { text: ctx.screenplayText, performance: d.performance },
      '3_DIRECTORS_TREATMENT': { treatment: d.treatment, intent: d.intent, embellishments: plan.embellishments, lighting: plan.lighting },
      '4_SHOT_STORYBOARD': { shots: shotListRows(plan, ctx.budget, ctx.review), keyframes: plan.keyframes.map((k) => ({ ...k, effectiveBlockers: blockers.get(k.keyframeId) ?? [] })), keyframeOrder: keyframeProductionOrder(plan), counts: keyframeCounts(plan) },
      '5_TIMELINE': { events: deriveTimelineEvents(plan), multitrack: buildMultitrack(plan), editJoins: editJoins(plan) },
      '6_CHARACTERS_AND_ASSETS': { cast: ctx.cast, assets: ctx.assets, spatial: plan.spatial, continuity: plan.continuity, transitions: plan.transitions },
      '7_MUSIC_AND_SOUND': { music: plan.music, sound: plan.sound, cueSheet: cueSheetRows(plan), summary: audioSummary(plan), licensing: licensingDependencies(plan.music) },
      '8_PRODUCTION_COST': ctx.budget,
      '9_FOUNDER_DECISIONS': d.founderDecisions,
      '10_PRODUCTION_AUTHORIZATION': { steps: ctx.review.steps, elementsPending: ctx.review.elements.filter((e) => e.state !== 'APPROVED').length, elementsTotal: ctx.review.elements.length },
    },
    motion: motionSummary(plan.shots, plan.fps),
    validation: { errors: sev('ERROR').length, warnings: sev('WARNING').length, advisories: sev('ADVISORY').length, findings },
  };
}
export type ScenePacket = ReturnType<typeof buildScenePacket>;
