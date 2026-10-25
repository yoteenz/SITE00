import type { SceneDirection } from '../../directorial/packet.js';
import type { ElementType } from '../../directorial/review.js';
import { PROVISIONAL_FRAME_RATE } from '../../directorial/timecode.js';
import type { ForwardReference, ProductionPlan } from '../../directorial/types.js';
import { EMBELLISHMENTS, FOUNDER_DECISIONS } from './decisions.js';
import { INTENT, PERFORMANCE, TREATMENT } from './intent.js';
import { KEYFRAMES } from './keyframes.js';
import { MUSIC, SOUND, SUBTITLES } from './music.js';
import { SHOTS_A } from './shotsA.js';
import { SHOTS_B } from './shotsB.js';
import { SHOTS_C } from './shotsC.js';
import { CONTINUITY, LIGHTING, SPATIAL, TRANSITIONS } from './spatial.js';

export const S1_01_SCREENPLAY = { path: 'THE_EXCHANGE/SEASON_1/SCREENPLAYS/S1-01_DUSK.fountain', version: 2, status: 'DRAFT — FOUNDER REVIEW REQUIRED' } as const;

/**
 * Approved later appearances of the S1-01 inhabitants (PATCH-S101-07; register RECURRING_BACKGROUND_REGISTRY_V1.json).
 * All are public places. Nobody is named, nobody meets anybody, and the grandmother's S1-59 line is the master's own.
 */
const RETURNS: ForwardReference[] = [
  { subject: 'GRANDMOTHER', censusPersonId: 'scene:S1-01:grandmother', releaseId: 'S1-59', proposalId: 'R-01', appearance: 'Beats 4 and 5, on a bench on the promenade; she speaks her one existing master line, no other dialogue.', reuses: ['KF-SF-SH10'] },
  { subject: 'GRANDMOTHER', censusPersonId: 'scene:S1-01:grandmother', releaseId: 'S1-77', proposalId: 'R-02', appearance: 'Beat 10, in the far-bank crowd on the public riverbank, wearing the jewel-green dress (design pending, FD-S101-05).', reuses: ['KF-SF-SH10', 'KF-WD-GREEN-DRESS'] },
  { subject: 'TAILOR', censusPersonId: 'scene:S1-01:tailor', releaseId: 'S1-77', proposalId: 'R-03', appearance: 'Beat 10, in the far-bank crowd on the public riverbank, separately from the grandmother; anonymous (FD-S101-07).', reuses: ['KF-SF-SH02'] },
  { subject: 'TEENAGER', censusPersonId: 'scene:S1-01:teenager', releaseId: 'S1-51', proposalId: 'R-04', appearance: 'Beat 6, among the kids following the drumline; the same four counts (E-14).', reuses: ['KF-SF-SH05'] },
];

/** S1-01 Dusk, planned to the frame: 45 s at 24 fps, wordless (sprint V2 §28). */
export const S1_01_PLAN: ProductionPlan = {
  unitId: 'S1-01',
  releaseId: 'S1-01',
  title: 'Dusk',
  aspect: '9:16',
  fps: PROVISIONAL_FRAME_RATE.fps,
  durationFrames: 45 * PROVISIONAL_FRAME_RATE.fps,
  screenplay: { ...S1_01_SCREENPLAY },
  shots: [...SHOTS_A, ...SHOTS_B, ...SHOTS_C],
  dialogue: [],
  subtitles: SUBTITLES,
  music: MUSIC,
  sound: SOUND,
  keyframes: KEYFRAMES,
  lighting: LIGHTING,
  spatial: SPATIAL,
  continuity: CONTINUITY,
  transitions: TRANSITIONS,
  embellishments: EMBELLISHMENTS,
  forwardReferences: {
    note: 'Forward references: the grandmother in S1-59 (R-01, with her existing line) and S1-77 (R-02, in the jewel-green dress); the tailor in S1-77 (R-03); the teenager in S1-51 (R-04). None of them meet, and none is named.',
    references: RETURNS,
  },
};

export const S1_01_DIRECTION: SceneDirection = { plan: S1_01_PLAN, intent: INTENT, performance: PERFORMANCE, founderDecisions: FOUNDER_DECISIONS, treatment: TREATMENT };

export const S1_01_OVERVIEW = {
  where: 'A brownstone street at dusk (SET-CITY-DUSK, provisional geography), ending on the lit windows of Halcyon House across the rooftops.',
  what: 'Five inhabitants get ready for the night; a neighbour tries to film a woman dancing, his lens glows copper, he lowers it, and she raises a glass to him.',
  why: 'Series opener: it shows the world and the Ember before any principal appears, and points the season at Halcyon House.',
  emotionalObjective: 'Warmth and anticipation, with one small turn from intrusion to grace.',
};

/** FD-S101-06 RECURRING (PATCH-S101-03): three inhabitants keep an identity reference; none gets a principal package. */
export const S1_01_CAST_RULE = 'Inhabitants get performance direction. The tailor, the grandmother and the teenager keep an identity reference (face, wardrobe, mannerism) for their approved returns; no voice, biography or principal package. The woman on the balcony and the neighbour are scene-scoped.';

/** Review elements beyond shots, keyframes and cues: environments and wardrobe the founder approves at the keyframe step. */
export const S1_01_REVIEW_EXTRAS: Array<{ elementId: string; type: ElementType }> = [
  { elementId: 'S1-01/ENV/SET-CITY-DUSK', type: 'ENVIRONMENT' },
  { elementId: 'S1-01/ENV/HALCYON-EXTERIOR', type: 'ENVIRONMENT' },
  { elementId: 'S1-01/WD/GRANDMOTHER-GREEN-DRESS', type: 'WARDROBE' },
  { elementId: 'S1-01/WD/INHABITANTS', type: 'WARDROBE' },
];

/** Screenplay scene → shots. Lets tests reconcile planned frames with the screenplay's own runtime estimate per scene. */
export const S1_01_SCENE_SHOTS = S1_01_PLAN.shots.reduce<Record<string, string[]>>((acc, s) => ({ ...acc, [s.sceneId]: [...(acc[s.sceneId] ?? []), s.shotId] }), {});
