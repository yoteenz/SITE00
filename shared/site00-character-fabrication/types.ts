/**
 * CHARACTER FABRICATION — canonical model.
 * One CharacterAuthority object, eight stations. ACTOR (reusable catalogue identity) is NEVER the
 * CHARACTER (project-specific role instantiated from an actor).
 */

export const STATION_ORDER = ['identity', 'body', 'look', 'appearance', 'character', 'performance', 'simulation', 'authority'] as const;
export type StationId = (typeof STATION_ORDER)[number];

export const STATION_LABEL: Record<StationId, string> = {
  identity: 'IDENTITY',
  body: 'BODY',
  look: 'LOOK',
  appearance: 'HAIR + MAKEUP',
  character: 'CHARACTER',
  performance: 'PERFORMANCE',
  simulation: 'SIMULATION',
  authority: 'AUTHORITY',
};

export const stationNumber = (s: StationId): string => String(STATION_ORDER.indexOf(s) + 1).padStart(2, '0');

/** Founder decision recorded on a station (stored). Display status is derived by the resolver. */
export type AuthorityDecision = 'NONE' | 'APPROVED' | 'LOCKED';

export type StationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PENDING_FOUNDER'
  | 'APPROVED'
  | 'LOCKED'
  | 'REVISION_REQUIRED'
  | 'STALE'
  | 'BLOCKED';

export type Provenance = 'CANONICAL' | 'LIBRARY_SEED' | 'FIXTURE' | 'FOUNDER_INPUT';

/** Which surface of a station is open (a station is a view/state of the same object). */
export type FabricationSurface =
  | 'STATION'
  | 'ACTOR_PROFILE'
  | 'BODY_INSPECTOR'
  | 'LOOK_COMPARE'
  | 'APPEARANCE_COMPARE'
  | 'BEHAVIOR_LIBRARY'
  | 'MOTION_REQUEST';

/* ── Actor / Character (separate entities) ─────────────────────────────────── */

export type FabricationSubjectSnapshot = {
  residentId: string | null;
  actorId: string;
  catalogueNumber: string;
  displayName: string;
  portraitUrl: string | null;
  fullBodyUrl: string | null;
  portraitSlotId: string;
  confirmedAt: string | null;
};

export type ActorRecord = {
  actorId: string;
  catalogueNumber: string;
  stageName: string;
  ageRange: string;
  heightRange: string;
  build: string;
  presentation: string;
  skinTone: string;
  hair: string;
  eyes: string;
  availability: string;
  verified: boolean;
  entryLabel: string;
  projectLabel: string;
  projectsUsed: readonly string[];
  campaignsUsed: readonly string[];
  languages: readonly string[];
  accents: readonly string[];
  continuityRisk: string;
  /** display-only: canonical casting tags (shown as ETHNICITY on the authority card) */
  castingTags: readonly string[];
  authorityId: string;
  authorityLevel: string;
  updatedAt: string;
  portraitSlotId: string;
  /** Resolved casting thumbnail / resident portrait authority (not a Grok slot). */
  portraitUrl: string | null;
  /** Internal resident id (SW-RESIDENT-00N) when catalogue entry is a resident projection. */
  sourceResidentId: string | null;
  studioWorldRole: string | null;
  dataSource: string;
};

export type CharacterRecord = {
  characterId: string;
  displayName: string;
  canonicalName: string;
  actorId: string | null;
  projectId: string;
  entryId: string;
  version: string;
  narrativeRole: string;
  personality: string;
  performanceDirection: string;
  screenImportance: string;
  looks: readonly { lookId: string; label: string; era: string; wardrobe: string; hair: string; makeup: string; palette: string; garments: readonly string[] }[];
  portraitSlotId: string;
};

/* ── Body ─────────────────────────────────────────────────────────────────── */

export const BODY_CHECK_IDS = ['skeletal', 'muscle', 'surface', 'symmetry', 'range', 'tissue', 'plausibility'] as const;
export type BodyCheckId = (typeof BODY_CHECK_IDS)[number];
export type BodyView = 'FRONT' | 'SIDE' | 'BACK';

export type BodyVersion = { versionId: string; label: string; status: 'DRAFT' | 'LOCKED' | 'SUPERSEDED'; lockedAt: string | null; note: string };

/* ── Look ─────────────────────────────────────────────────────────────────── */

export type WardrobeCategory = 'TOPS' | 'BOTTOMS' | 'OUTERWEAR' | 'FOOTWEAR' | 'ACCESSORIES';
export type GarmentAsset = {
  garmentId: string;
  name: string;
  code: string;
  category: WardrobeCategory;
  type: string;
  material: string;
  color: string;
  size: string;
  availability: 'IN_STOCK' | 'LIMITED' | 'OUT_OF_STOCK';
  gender: string;
  sourceProject: string;
  compatibleBodyVersions: readonly string[];
  swatch: string;
  slotId: string;
};
export type LookCandidateId = 'A' | 'B' | 'C';
export type LookCandidate = {
  candidateId: LookCandidateId;
  label: string;
  basis: string;
  palette: readonly string[];
  materials: string;
  layers: readonly { layer: string; item: string }[];
  sceneCompatibility: readonly number[];
  notes: string;
  stylingNotes: string;
  materialContinuity: readonly { k: string; v: string }[];
  provenance: Provenance;
  slotId: string;
};
export type LookDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

/* ── Hair + Makeup ────────────────────────────────────────────────────────── */

export type AppearanceLayerId = 'hairStyle' | 'hairColor' | 'rootShadow' | 'skinFinish' | 'eyeDetail' | 'lipTone' | 'grit';
export type AppearanceLayerDef = { layerId: AppearanceLayerId; label: string; value: string; code: string; candidateValue: string; slotId: string };
export type AppearanceLayerState = { layerId: AppearanceLayerId; visible: boolean; opacity: number; order: number };
export type AppearanceRef = { refId: string; kind: 'HAIR' | 'MAKEUP'; label: string; slotId: string };
export type AppearanceSet = { setId: string; label: string; state: 'LOCKED' | 'WORKING' | 'ALTERNATE' | 'ALT_LIGHT'; date: string };
export type AppearanceDecision = 'PENDING' | 'CANDIDATE_SELECTED' | 'KEEP_CURRENT' | 'REVISION_REQUESTED' | 'LOCKED';

/* ── Character (behavioral skins) ─────────────────────────────────────────── */

export type BehaviorRole = 'PRIMARY' | 'SECONDARY' | 'ACCENT' | 'FOUNDATIONAL';
export type BehaviorSkin = {
  skinId: string;
  name: string;
  summary: string;
  tags: readonly string[];
  category: 'FOCUS' | 'INTENSITY' | 'TEMPO' | 'SOCIAL';
  compatibility: number;
  provenance: string;
  effects: { posture: string; decision: string; gaze: string; reaction: string };
};
export type BehaviorLayer = { skinId: string; role: BehaviorRole; weight: number };
export type BehaviorComposition = { compositionId: string; layers: readonly BehaviorLayer[]; savedAt: string };

/* ── Performance ──────────────────────────────────────────────────────────── */

export type MotionAsset = {
  motionId: string;
  label: string;
  durationSec: number;
  fps: number;
  keyBeatFrame: number;
  capture: { date: string; time: string; studio: string; volume: string; rig: string; sensors: string; resolution: string; operator: string; notes: string };
  biomechanics: readonly { k: string; v: number }[];
  status: 'PUBLISHED';
  slotId: string;
};

export const MOTION_LIFECYCLE = ['REQUEST_SUBMISSION', 'MOTION_PRODUCTION', 'INTERNAL_REVIEW', 'SIMULATION_INTEGRATION', 'QA_APPROVAL', 'PUBLISH_ASSET'] as const;
export type MotionLifecycleStage = (typeof MOTION_LIFECYCLE)[number];
export type MotionRequestDraft = {
  name: string;
  description: string;
  referenceNotes: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  deliverableFormat: string;
  targetResolution: string;
  notes: string;
  attachments: readonly string[];
};
export type MotionRequest = MotionRequestDraft & {
  requestId: string;
  stage: MotionLifecycleStage;
  createdAt: string;
  blocksSimulation: boolean;
  dependencies: readonly { k: string; v: string }[];
};

/* ── Simulation ───────────────────────────────────────────────────────────── */

export const SIM_TEST_IDS = ['WALK', 'IDLE', 'SIT', 'TURN', 'ENTER', 'EXIT', 'SPEAK', 'REACT', 'INTERACT'] as const;
export type SimTestId = (typeof SIM_TEST_IDS)[number];
export type SimConfig = {
  durationSec: 15 | 30 | 60 | 120;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  environment: 'NEUTRAL' | 'STUDIO' | 'STREET' | 'INTERIOR';
  distractions: 'NONE' | 'MINIMAL' | 'MODERATE';
  cameraAngles: 1 | 2 | 3 | 4;
  capture: { video: boolean; audio: boolean; telemetry: boolean; biometrics: boolean };
};
export type SimRunStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ABORTED' | 'COMPLETE';
export type SimRun = {
  simulationId: string;
  testId: SimTestId;
  config: SimConfig;
  status: SimRunStatus;
  elapsedMs: number;
  startedAt: string | null;
  /** Fidelity level of what is shown — never claims a real backend. */
  fidelity: 'LIVE_UI_PREVIEW' | 'SIMULATION_PREVIEW_CACHED';
};
export type CheckResult = 'PASS' | 'FAIL';
export type SimCheck = {
  checkId: string;
  label: string;
  sub: string;
  owner: StationId;
  expected: string;
  actual: string;
  delta: string;
  result: CheckResult;
  evidenceSlotId: string;
};
export type SimResultRecord = {
  simulationId: string;
  testId: SimTestId;
  completedAt: string;
  durationSec: number;
  checks: readonly SimCheck[];
  failed: number;
  accepted: boolean;
  routedTo: readonly StationId[];
};

/* ── Revision / attention ─────────────────────────────────────────────────── */

export type RevisionRequest = {
  revisionId: string;
  station: StationId;
  note: string;
  source: 'AUTHORITY' | 'SIMULATION' | 'STATION';
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt: string | null;
  defectIds: readonly string[];
};
export type Blocker = { blockerId: string; station: StationId; message: string };
export type FabricationWarning = { warningId: string; station: StationId; message: string };
export type PendingFounderDecision = { decisionId: string; station: StationId; title: string; detail: string };

/* ── Whole state ──────────────────────────────────────────────────────────── */

export type FabricationState = {
  schema: 1;
  selectedProjectId: string;
  selectedEntryId: string;
  selectedActorId: string;
  selectedCharacterId: string;
  activeStation: StationId;
  surface: FabricationSurface;

  authority: Record<StationId, AuthorityDecision>;
  stale: Record<StationId, boolean>;
  touched: Record<StationId, boolean>;

  // 01 identity
  selectedActorCandidateId: string;
  actorCatalogueOpen: boolean;
  actorQuery: string;
  actorSort: 'RECENT' | 'NUMBER';
  actorLayout: 'GRID' | 'LIST';
  actorFilter: 'ALL' | 'AVAILABLE' | 'IN_PRODUCTION';
  /** Confirmed resident/actor media authority (set on CONFIRM_ACTOR). */
  fabricationSubject: FabricationSubjectSnapshot | null;
  // 02 body
  bodyVersions: readonly BodyVersion[];
  selectedBodyVersionId: string;
  bodyView: BodyView;
  bodyChecks: Record<string, boolean>;
  bodyCalibrated: boolean;
  scaleLock: boolean;
  bodyGateOpen: boolean;
  // 03 look
  wardrobeTab: WardrobeCategory;
  wardrobeQuery: string;
  wardrobeFilters: { availability: 'ALL' | 'IN_STOCK'; material: string; color: string };
  selectedGarmentId: string | null;
  fitting: Record<'L1' | 'L2' | 'L3' | 'L4', string | null>;
  fittingHidden: readonly string[];
  fittingSubmitted: boolean;
  selectedLookCandidateId: LookCandidateId;
  comparedCandidates: readonly LookCandidateId[];
  lookDecision: LookDecision;
  // 04 appearance
  selectedHairRefId: string;
  selectedMakeupRefId: string;
  selectedAppearanceSetId: string;
  appearanceLayers: readonly AppearanceLayerState[];
  selectedAppearanceLayerId: AppearanceLayerId;
  appearanceCandidateId: string;
  appearanceDecision: AppearanceDecision;
  appearanceOverlayPct: number;
  appearanceAppliedToFitting: boolean;
  // 05 character
  behaviorLayers: readonly BehaviorLayer[];
  behaviorQuery: string;
  behaviorCategory: 'ALL' | BehaviorSkin['category'];
  behaviorPendingSkinId: string | null;
  savedCompositions: readonly BehaviorComposition[];
  selectedBehaviorCompositionId: string | null;
  // 06 performance
  selectedMotionId: string;
  motionPlaying: boolean;
  motionRate: 0.5 | 1 | 1.5 | 2;
  motionUsedIds: readonly string[];
  motionRequestDraft: MotionRequestDraft;
  motionRequests: readonly MotionRequest[];
  publishedMotions: readonly MotionAsset[];
  requiredMotion: { motionType: string; action: string; intensity: string; durationSec: number; fps: number; qualityTarget: string; usage: string };
  // 07 simulation
  selectedTestId: SimTestId;
  simConfig: SimConfig;
  motionSentToTestingGround: string | null;
  run: SimRun | null;
  selectedSimulationId: string | null;
  results: readonly SimResultRecord[];
  resolvedDefects: readonly string[];
  // 08 authority
  revisionRequests: readonly RevisionRequest[];
  revisionDraft: { station: StationId; note: string };
  finalSignedOff: boolean;

  history: readonly { at: string; station: StationId | null; message: string }[];
  notice: { kind: 'INFO' | 'ERROR'; text: string } | null;
  /** Side effects for the Production system (activity / attention). Drained by the provider after persisting. */
  outbox: readonly OutboxEvent[];
};

export type OutboxEvent =
  | { kind: 'ACTIVITY'; category: 'APPROVAL' | 'RENDER' | 'ASSET' | 'REQUEST' | 'OTHER'; title: string; detail: string }
  | { kind: 'REQUEST'; requestKind: 'CHARACTER_FABRICATION_DECISION' | 'CHARACTER_FABRICATION_MOTION_ASSET' | 'CHARACTER_FABRICATION_REVISION' | 'CHARACTER_FABRICATION_VARIANCE' | 'CHARACTER_FABRICATION_SIGNOFF'; note: string };
