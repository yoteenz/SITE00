import { framesToTimecode, span, type Span } from './timecode.js';
import { placeShots } from './timeline.js';
import type { ProductionPlan } from './types.js';

/** One record per picture event with the audio that plays under it (sprint V2 §07 field list). */
export type TimelineEvent = Span & {
  eventId: string;
  sceneId: string;
  shotId: string;
  track: string;
  narrativeBeat: string;
  visibleAction: string;
  characterPosition: string;
  cameraPosition: string;
  cameraMovement: string;
  dialogue: string[];
  audioSource: string[];
  musicState: string[];
  soundEffects: string[];
  propState: Record<string, string>;
  editTransition: string;
  keyframeRequirement: string[];
  productionAssetRequirement: string[];
  continuityNotes: string[];
  coverage: string;
  lipSync: string;
};

const within = (f: number, at: number, frames: number) => f >= at && f < at + frames;
const overlaps = (a: { at: number; frames: number }, b: { at: number; frames: number }) => a.at < b.at + b.frames && b.at < a.at + a.frames;

export function deriveTimelineEvents(plan: ProductionPlan): TimelineEvent[] {
  const fps = plan.fps;
  const tc = (f: number) => framesToTimecode(f, fps);
  return placeShots(plan.shots)
    .sort((a, b) => a.at - b.at || (a.overlay ? 1 : -1))
    .map((s, i) => {
      const w = { at: s.at, frames: s.frames };
      const music = plan.music.filter((m) => overlaps(m, w)).map((m) => {
        const parts = [`${m.cueId} ${m.cueType === 'SILENCE' ? 'SILENCE' : m.title}`];
        if (within(m.at, s.at, s.frames)) parts.push(`enters ${tc(m.at)} (${m.entry})`);
        if (within(m.at + m.frames, s.at + 1, s.frames)) parts.push(`exits ${tc(m.at + m.frames)} (${m.exit})`);
        for (const h of m.hitPoints) if (within(h.frame, s.at, s.frames)) parts.push(`hit ${tc(h.frame)}: ${h.event}`);
        return parts.join(' — ');
      });
      const sounds = plan.sound.filter((c) => overlaps(c, w));
      const lines = plan.dialogue.filter((d) => overlaps(d, w));
      return {
        eventId: `${plan.unitId}-EV${String(i + 1).padStart(2, '0')}`,
        sceneId: s.sceneId,
        shotId: s.shotId,
        track: s.overlay ? `${s.track} (overlay)` : s.track,
        ...span(s.at, s.frames, fps),
        narrativeBeat: `${s.beatId}: ${s.purpose}`,
        visibleAction: s.primaryAction || s.blocking,
        characterPosition: s.blocking,
        cameraPosition: `${s.framing}; ${s.cameraHeight}; ${s.cameraAngle}`,
        cameraMovement: `${s.cameraMovement} (${s.movementSpeed})`,
        dialogue: lines.length ? lines.map((d) => `${d.speaker} ${tc(d.at)}–${tc(d.at + d.frames)}: ${d.text}`) : ['NONE'],
        audioSource: [...lines.map((d) => `DIALOGUE ${d.speaker}`), ...sounds.filter((c) => c.track === 'AMBIENCE').map((c) => `AMBIENCE ${c.cueId}`)],
        musicState: music.length ? music : ['NONE'],
        soundEffects: sounds.filter((c) => c.track !== 'AMBIENCE').map((c) => `${c.cueId} ${tc(c.at)}–${tc(c.at + c.frames)}: ${c.description}`),
        propState: s.propState,
        editTransition: s.editTransition,
        keyframeRequirement: plan.keyframes.filter((k) => k.usedBy.includes(s.shotId)).map((k) => `${k.keyframeId} (${k.kind}, ${k.source})`),
        productionAssetRequirement: [...s.referenceAssets, ...s.wardrobe],
        continuityNotes: s.continuityRisk,
        coverage: s.coverage,
        lipSync: s.lipSync,
      };
    });
}
