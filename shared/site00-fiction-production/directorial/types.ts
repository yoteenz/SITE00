/** THE EXCHANGE — directorial production engine types (Level B: one active production unit at a time). */

export const DIRECTORIAL_SCHEMA_VERSION = '2.0.0' as const;

/** Every significant creative embellishment carries one of these labels (sprint V2 §25). */
export type EmbellishmentLabel = 'SOURCE_ESTABLISHED' | 'DIRECTORIAL_INTERPRETATION' | 'FOUNDER_APPROVAL_REQUIRED';

export type Embellishment = { id: string; description: string; label: EmbellishmentLabel; source: string; affects: string[] };

export type DirectorsIntent = {
  unitId: string;
  dramaticPurpose: string;
  emotionalCenter: string;
  characterObjectives: Record<string, string>;
  subtext: string;
  powerDynamics: string;
  informationControl: { before: string; during: string; after: string; withheld: string[] };
  cinematicPointOfView: string;
  visualDramaturgy: { blocking: string; camera: string; light: string; costume: string; architecture: string; editing: string };
  atmosphere: string;
  sonicIdentity: string;
  endingImpression: string;
};

export type PerformanceDirection = {
  character: string;
  shots: string[];
  speaking: boolean;
  objective: string;
  emotionalState: string;
  subtext: string;
  relationshipDynamic: string;
  tempo: string;
  emphasis: string;
  restraint: 'LOW' | 'MEDIUM' | 'HIGH';
  physicalBehavior: string;
  eyes: string;
  microExpressions: string;
  listening: string;
  silence: string;
  reactionTiming: string;
  avoid: string[];
};

export type MotionClass = 'HIGH' | 'MODERATE' | 'LOW' | 'EMOTIONAL_DIALOGUE' | 'ENVIRONMENT';

/** Visual coverage of a moment relative to dialogue (sprint V2 §20). */
export const COVERAGE_CLASSES = ['VISIBLE_SPEAKER', 'OFFSCREEN_SPEAKER', 'LISTENER_REACTION', 'OBJECT_INSERT', 'ENVIRONMENT_INSERT', 'SILENT_ACTION', 'ESTABLISHING', 'TRANSITION'] as const;
export type CoverageClass = (typeof COVERAGE_CLASSES)[number];

export type VideoTrackId = 'VIDEO_A' | 'VIDEO_B';
export type LipSync = 'NONE' | 'REQUIRED';

export type ShotWhy = { framing: string; distance: string; angle: string; movement: string; moment: string; duration: string };

/** Authored shot design. Timing is in frames at the plan's frame rate; `at` is derived from order unless overridden. */
export type ShotDesign = {
  shotId: string;
  sceneId: string;
  beatId: string;
  track: VideoTrackId;
  frames: number;
  at?: number;
  priority: 'ESSENTIAL' | 'HIGH' | 'STANDARD' | 'OPTIONAL';
  purpose: string;
  subject: string;
  onScreen: string[];
  framing: string;
  cameraHeight: string;
  cameraAngle: string;
  lensIntent: string;
  focalLength: string;
  depthOfField: string;
  cameraMovement: string;
  movementSpeed: string;
  cameraDirection: string;
  composition: string;
  screenDirection: string;
  eyeline: string;
  blocking: string;
  performance: string;
  landmarks: string[];
  lightingState: string;
  wardrobe: string[];
  propState: Record<string, string>;
  coverage: CoverageClass;
  lipSync: LipSync;
  mouthVisible: string[];
  startFrameRef: string | null;
  endFrameRef: string | null;
  referenceAssets: string[];
  /** How the picture arrives at this shot: the cut, fade or match at its first frame. */
  editTransition: string;
  continuityRisk: string[];
  motionClass: MotionClass;
  primaryAction: string;
  actionCount: number;
  generated: boolean;
  why: ShotWhy;
};

export type HitPoint = { frame: number; event: string };

export type MusicFunction = 'ATMOSPHERE' | 'CHARACTER_IDENTITY' | 'CULTURAL_CONTEXT' | 'EMOTIONAL_TENSION' | 'CELEBRATION' | 'ROMANCE' | 'SUSPENSE' | 'COMIC_CONTRAST' | 'TRANSITION' | 'NARRATIVE_PAYOFF';
export type MusicRights = { requirement: 'ORIGINAL_COMPOSITION' | 'LICENSED' | 'PUBLIC_DOMAIN' | 'NONE'; dependency: string | null; status: 'NOT_CLEARED' | 'CLEARED' | 'NOT_REQUIRED' };

export type MusicCue = {
  cueId: string;
  title: string;
  at: number;
  frames: number;
  cueType: 'SCORE' | 'SOURCE' | 'SCORE_TO_SOURCE' | 'STINGER' | 'TRANSITION' | 'SILENCE';
  diegesis: 'DIEGETIC' | 'NON_DIEGETIC' | 'NON_DIEGETIC_TO_DIEGETIC' | 'NONE';
  functions: MusicFunction[];
  genre: string;
  subgenre: string;
  mood: string;
  tempoRange: string;
  instrumentation: string[];
  vocal: 'INSTRUMENTAL' | 'VOCAL' | 'NONE';
  energy: string;
  dynamicArc: string;
  entry: string;
  exit: string;
  relationToDialogue: string;
  relationToSfx: string;
  relationToEditing: string;
  culturalReferences: string;
  rights: MusicRights;
  hitPoints: HitPoint[];
  label: EmbellishmentLabel;
};

export type SoundTrackId = 'AMBIENCE' | 'FOLEY' | 'SFX';
export type SoundLayer = 'ROOM_TONE' | 'AMBIENCE' | 'CROWD' | 'FOLEY' | 'SFX' | 'SILENCE';

export type SoundCue = {
  cueId: string;
  track: SoundTrackId;
  layer: SoundLayer;
  at: number;
  frames: number;
  description: string;
  perspective: string;
  reverb: string;
  linkedShots: string[];
  continuesUnderCut: boolean;
  syncPoints: HitPoint[];
  label: EmbellishmentLabel;
};

export type DialogueEvent = { eventId: string; lineId: string; speaker: string; text: string; at: number; frames: number; takeRef: string | null };
export type SubtitleEvent = { eventId: string; at: number; frames: number; text: string; kind: 'DIALOGUE' | 'ACCESSIBILITY' };

export type KeyframeKind = 'START_FRAME' | 'END_FRAME' | 'CHARACTER_REFERENCE' | 'ENVIRONMENT_REFERENCE' | 'WARDROBE_REFERENCE' | 'PROP_REFERENCE' | 'CONTINUITY_FRAME';
export type KeyframeSource = 'GENERATE' | 'REUSE_APPROVED' | 'EXTRACT_FROM_APPROVED_FOOTAGE' | 'NOT_NEEDED';

export type KeyframeSpec = {
  cameraAngle: string;
  shotScale: string;
  characterPlacement: string;
  expression: string;
  wardrobe: string;
  lighting: string;
  architecture: string;
  propOwnership: string;
  visible: string[];
  hidden: string[];
};

export type Keyframe = {
  keyframeId: string;
  kind: KeyframeKind;
  title: string;
  usedBy: string[];
  source: KeyframeSource;
  essential: boolean;
  derivesFrom: string[];
  noReferenceJustification?: string;
  extractFrom?: { shotId: string; position: 'FIRST_FRAME' | 'LAST_FRAME' };
  reuseOf?: string;
  spec: KeyframeSpec | null;
  candidates: number;
  reusableBeyondUnit: string[];
  blockedBy: string[];
  output: null;
};

export type SpatialZone = {
  zoneId: string;
  name: string;
  kind: 'EXTERIOR' | 'INTERIOR' | 'THRESHOLD';
  position: string;
  landmarks: string[];
  entrances: string[];
  windows: string[];
  furniture: string[];
  cameraSafe: string[];
  lightingDirection: string;
};

export type SpatialAuthority = {
  setId: string;
  name: string;
  status: 'PROVISIONAL' | 'APPROVED';
  scale: string;
  orientation: string;
  zones: SpatialZone[];
  travelPaths: Array<{ from: string; to: string; via: string }>;
  sightlines: Array<{ from: string; to: string; note: string }>;
  screenDirectionRules: string[];
  immutable: string[];
};

export type CharacterState = { zone: string; orientation: string; posture: string; wardrobeState: string; hair: string; visible: boolean };
export type PropStateRecord = { holder: string | null; location: string; state: string; visible: boolean };
export type ContinuityState = { shotId: string; characters: Record<string, CharacterState>; props: Record<string, PropStateRecord>; environment: Record<string, string> };
export type DeclaredTransition = { subject: string; fromShot: string; toShot: string; change: string; method: 'ON_SCREEN_ACTION' | 'OFF_SCREEN_DECLARED'; note: string };

export type LightingState = { id: string; name: string; description: string; keyDirection: string; palette: string[]; shots: string[] };

/** ERROR blocks the packet; WARNING needs a reason on record; ADVISORY is a guideline the director may overrule. */
export type DirectorialFinding = { severity: 'ERROR' | 'WARNING' | 'ADVISORY'; code: string; subject: string; detail: string };

/** One production unit (a release or a scene of a release) planned to the frame. */
export type ProductionPlan = {
  unitId: string;
  releaseId: string;
  title: string;
  aspect: '9:16' | '16:9';
  fps: number;
  durationFrames: number;
  screenplay: { path: string; version: number; status: string };
  shots: ShotDesign[];
  dialogue: DialogueEvent[];
  subtitles: SubtitleEvent[];
  music: MusicCue[];
  sound: SoundCue[];
  keyframes: Keyframe[];
  lighting: LightingState[];
  spatial: SpatialAuthority[];
  continuity: ContinuityState[];
  transitions: DeclaredTransition[];
  embellishments: Embellishment[];
};
