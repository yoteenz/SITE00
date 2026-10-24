import { AUTHORIZATION_STEPS } from './review.js';
import { TRACKS } from './timeline.js';
import { COVERAGE_CLASSES } from './types.js';

/** Sprint field labels mapped to the property names the engine emits. The `required` arrays below are generated from these maps and drive validation. */
export const TIMELINE_EVENT_FIELDS: Record<string, string> = {
  'EVENT ID': 'eventId', 'SCENE ID': 'sceneId', 'START TIMECODE': 'start', 'END TIMECODE': 'end', DURATION: 'duration', 'NARRATIVE BEAT': 'narrativeBeat',
  'VISIBLE ACTION': 'visibleAction', 'CHARACTER POSITION': 'characterPosition', 'CAMERA POSITION': 'cameraPosition', 'CAMERA MOVEMENT': 'cameraMovement',
  DIALOGUE: 'dialogue', 'AUDIO SOURCE': 'audioSource', 'MUSIC STATE': 'musicState', 'SOUND EFFECTS': 'soundEffects', 'PROP STATE': 'propState',
  'EDIT TRANSITION': 'editTransition', 'KEYFRAME REQUIREMENT': 'keyframeRequirement', 'PRODUCTION ASSET REQUIREMENT': 'productionAssetRequirement', 'CONTINUITY NOTES': 'continuityNotes',
};

export const SHOT_RECORD_FIELDS: Record<string, string> = {
  'SHOT ID': 'shotId', 'SCENE ID': 'sceneId', 'STORY BEAT ID': 'beatId', 'INTENDED SCREEN TIME': 'intendedScreenTime', 'GENERATION DURATION': 'generationDuration',
  'SHOT PRIORITY': 'priority', 'SHOT PURPOSE': 'purpose', SUBJECT: 'subject', FRAMING: 'framing', 'CAMERA HEIGHT': 'cameraHeight', 'CAMERA ANGLE': 'cameraAngle',
  'LENS INTENT': 'lensIntent', 'FOCAL-LENGTH RECOMMENDATION': 'focalLength', 'DEPTH OF FIELD': 'depthOfField', 'CAMERA MOVEMENT': 'cameraMovement',
  'MOVEMENT SPEED': 'movementSpeed', 'CAMERA DIRECTION': 'cameraDirection', COMPOSITION: 'composition', 'SCREEN DIRECTION': 'screenDirection', EYELINE: 'eyeline',
  'CHARACTER BLOCKING': 'blocking', 'ACTOR PERFORMANCE': 'performance', 'ENVIRONMENT LANDMARKS': 'landmarks', LIGHTING: 'lighting', WARDROBE: 'wardrobe',
  'PROP STATE': 'propState', 'DIALOGUE VISIBILITY': 'dialogueVisibility', 'LIP-SYNC REQUIREMENT': 'lipSync', 'START FRAME': 'startFrame', 'END FRAME': 'endFrame',
  'REFERENCE ASSETS': 'referenceAssets', 'EDIT TRANSITION': 'editTransition', 'CONTINUITY RISK': 'continuityRisk', 'GENERATION MODEL': 'generationModel',
  'EXPECTED COST': 'expectedCost', 'FOUNDER APPROVAL STATUS': 'founderApprovalStatus',
};

export const KEYFRAME_SPEC_FIELDS: Record<string, string> = {
  'EXACT CAMERA ANGLE': 'cameraAngle', 'SHOT SCALE': 'shotScale', 'CHARACTER PLACEMENT': 'characterPlacement', EXPRESSION: 'expression', WARDROBE: 'wardrobe',
  LIGHTING: 'lighting', ARCHITECTURE: 'architecture', 'PROP OWNERSHIP': 'propOwnership', 'VISIBLE ELEMENTS': 'visible', 'HIDDEN ELEMENTS': 'hidden',
};

export const PERFORMANCE_FIELDS: Record<string, string> = {
  'IMMEDIATE OBJECTIVE': 'objective', 'EMOTIONAL STATE': 'emotionalState', SUBTEXT: 'subtext', 'RELATIONSHIP DYNAMIC': 'relationshipDynamic', 'SPEAKING TEMPO': 'tempo',
  'INTENDED EMPHASIS': 'emphasis', 'DEGREE OF RESTRAINT': 'restraint', 'PHYSICAL BEHAVIOR': 'physicalBehavior', 'EYE MOVEMENTS': 'eyes',
  'FACIAL MICRO-EXPRESSIONS': 'microExpressions', 'LISTENING BEHAVIOR': 'listening', SILENCE: 'silence', 'REACTION TIMING': 'reactionTiming',
};

const str = { type: 'string', minLength: 1 };
const strList = { type: 'array', items: { type: 'string' } };
const props = (fields: Record<string, string>, override: Record<string, unknown> = {}) => Object.fromEntries(Object.values(fields).map((p) => [p, override[p] ?? str]));
const base = (id: string, title: string) => ({ $schema: 'https://json-schema.org/draft/2020-12/schema', $id: `site00:the-exchange:${id}`, title });

export const TIMELINE_EVENT_SCHEMA = {
  ...base('timeline-event-v2', 'Second-by-second timeline event'),
  type: 'object',
  description: 'One picture event with everything audible and required under it. Times are HH:MM:SS.mmm on the master clock; frames are authoritative.',
  required: Object.values(TIMELINE_EVENT_FIELDS),
  properties: {
    ...props(TIMELINE_EVENT_FIELDS, {
      start: { type: 'string', pattern: '^\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$' }, end: { type: 'string', pattern: '^\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$' }, duration: { type: 'string', pattern: '^\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$' },
      dialogue: strList, audioSource: strList, musicState: strList, soundEffects: strList, keyframeRequirement: strList, productionAssetRequirement: strList, continuityNotes: strList,
      propState: { type: 'object', additionalProperties: { type: 'string' } },
    }),
    startFrame: { type: 'integer', minimum: 0 }, endFrame: { type: 'integer', minimum: 1 }, frames: { type: 'integer', minimum: 1 },
    coverage: { enum: [...COVERAGE_CLASSES] }, lipSync: { enum: ['NONE', 'REQUIRED'] },
  },
  sprintFieldMap: TIMELINE_EVENT_FIELDS,
  rules: [
    'Events are derived from the plan; nobody types a timecode by hand.',
    'Picture events tile the unit from 00:00:00.000 to its end with no gap; an overlay sits inside one VIDEO_A take.',
    'Simultaneous tracks are never summed: the unit runtime is the picture sequence length.',
  ],
};

export const MULTITRACK_SCHEMA = {
  ...base('multitrack-v2', 'Multitrack editorial timeline'),
  type: 'object',
  required: ['format', 'unitId', 'fps', 'durationFrames', 'sceneDuration', 'tracks', 'trackDurations'],
  properties: {
    format: { const: 'EXCHANGE_MULTITRACK_V1' }, unitId: str, fps: { type: 'number', exclusiveMinimum: 0 }, durationFrames: { type: 'integer', minimum: 1 },
    tracks: { type: 'object', required: [...TRACKS], properties: Object.fromEntries(TRACKS.map((t) => [t, { type: 'array', items: { $ref: '#/$defs/event' } }])) },
    trackDurations: { type: 'object', description: 'Per-track active time, computed separately for each track.' },
  },
  $defs: {
    event: {
      type: 'object',
      required: ['eventId', 'track', 'ref', 'label', 'start', 'end', 'duration', 'startFrame', 'endFrame', 'frames', 'continuesUnderCut'],
      properties: { eventId: str, track: { enum: [...TRACKS] }, ref: str, label: { type: 'string' }, start: str, end: str, duration: str, startFrame: { type: 'integer' }, endFrame: { type: 'integer' }, frames: { type: 'integer', minimum: 1 }, continuesUnderCut: { type: 'boolean' } },
    },
  },
  tracks: {
    VIDEO_A: 'Primary character and action coverage.', VIDEO_B: 'Reactions, cutaways, inserts, establishing shots, transitions; may overlay a continuing A take.',
    DIALOGUE: 'Approved performances; one continuous event per line.', AMBIENCE: 'Room tone, exterior atmosphere, crowd beds.', FOLEY: 'Footsteps, fabric, jewellery, doors, prop handling.',
    SFX: 'Designed effects, used sparingly.', MUSIC: 'Score, source, transitions, stingers and declared silence.', SUBTITLES: 'Spoken dialogue and accessibility text.',
  },
  rules: ['J-cut: a line starts before its speaker is seen.', 'L-cut: a line continues after the picture leaves its speaker.', 'A line is never split around a cutaway.', 'Lip-sync only where a speaking mouth is visible.'],
};

export const CAMERA_KEYFRAME_SCHEMA = {
  ...base('camera-keyframe-v2', 'Shot design and keyframe direction'),
  type: 'object',
  properties: {
    shot: { type: 'object', required: Object.values(SHOT_RECORD_FIELDS), properties: props(SHOT_RECORD_FIELDS), sprintFieldMap: SHOT_RECORD_FIELDS },
    why: { type: 'object', required: ['framing', 'distance', 'angle', 'movement', 'moment', 'duration'], description: 'Every shot answers why this framing, distance, angle, movement, moment and duration.' },
    keyframe: {
      type: 'object',
      required: ['keyframeId', 'kind', 'title', 'usedBy', 'source', 'essential', 'derivesFrom', 'spec', 'candidates', 'blockedBy', 'output'],
      properties: {
        kind: { enum: ['START_FRAME', 'END_FRAME', 'CHARACTER_REFERENCE', 'ENVIRONMENT_REFERENCE', 'WARDROBE_REFERENCE', 'PROP_REFERENCE', 'CONTINUITY_FRAME'] },
        source: { enum: ['GENERATE', 'REUSE_APPROVED', 'EXTRACT_FROM_APPROVED_FOOTAGE', 'NOT_NEEDED'] },
        spec: { type: ['object', 'null'], required: Object.values(KEYFRAME_SPEC_FIELDS), sprintFieldMap: KEYFRAME_SPEC_FIELDS },
        output: { type: 'null', description: 'Stays null until a provider job returns a real asset with its id and hash.' },
      },
    },
  },
  rules: ['A generated keyframe names its references or records why it has none.', 'A reused keyframe names an approved asset.', 'An extracted keyframe names its source shot and frame position.', 'No new keyframe for every shot by default.'],
};

export const PERFORMANCE_SCHEMA = {
  ...base('performance-direction-v2', 'Character performance direction'),
  type: 'object',
  required: ['character', 'shots', 'speaking', ...Object.values(PERFORMANCE_FIELDS), 'avoid'],
  properties: { character: str, shots: strList, speaking: { type: 'boolean' }, ...props(PERFORMANCE_FIELDS, { restraint: { enum: ['LOW', 'MEDIUM', 'HIGH'] } }), avoid: strList },
  sprintFieldMap: PERFORMANCE_FIELDS,
};

export const REVIEW_STEPS_SCHEMA = { steps: [...AUTHORIZATION_STEPS] };

export function missingFields(obj: Record<string, unknown>, required: readonly string[]): string[] {
  return required.filter((k) => {
    const v = obj[k];
    return v === undefined || v === null || (typeof v === 'string' && !v.trim());
  });
}
