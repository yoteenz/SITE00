/**
 * Living-world audit (Season 1). Proposal records only: nothing here changes canon, screenplays,
 * Fountain scripts, directorial packets or the 86-release master.
 */

export const AUDIT_ID = 'THE-EXCHANGE.S1.LIVING-WORLD-AUDIT.V1';
export const AUDIT_SPRINT_ID = 'P0.THE-EXCHANGE.OPUS.SEASON1-NARRATIVE-TECHNOLOGY-SENSORY-MEMORY-AND-LIVING-WORLD-AUDIT.V1';
/** Head of PR #1692 (directorial engine V2): the canon state this audit read. */
export const AUDIT_BASELINE_COMMIT = 'b0a63b952';
export const AUDIT_BASELINE_RUNTIME_SEC = 7660;
export const AUDIT_BASELINE_RELEASES = 86;

export const OPPORTUNITY_TYPES = ['TECHNOLOGY', 'SENSORY_FLASHBACK', 'AMBIENT_RETURN', 'VISUAL_EASTER_EGG', 'SOCIAL_WORLDBUILDING'] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const CATEGORIES = {
  A: 'SEAMLESS ENHANCEMENT',
  B: 'OPTIONAL EXPANSION',
  C: 'SEASON ARC REVISION',
  D: 'FUTURE-SEASON RESERVE',
  E: 'REJECT',
} as const;
export type Category = keyof typeof CATEGORIES;

export type Strength = 'HIGH' | 'MEDIUM' | 'LOW' | 'HOLD' | 'NOT_RECOMMENDED';
export type BoardAction = 'APPROVE' | 'REVISE' | 'HOLD' | 'REJECT';

/** Audit buckets the sprint asks to keep apart. Every source also keeps its exact label. */
export const SOURCE_BUCKETS = ['APPROVED_CANON', 'FOUNDER_SUPPORTED_DIRECTION', 'WORKING_CONCEPT', 'PROVISIONAL', 'DRAFT', 'OPEN_QUESTION', 'NEW_PROPOSAL', 'HISTORICAL'] as const;
export type SourceBucket = (typeof SOURCE_BUCKETS)[number];

export type AuditSource = {
  id: string;
  path: string;
  exactClassification: string;
  bucket: SourceBucket;
  role: string;
};

/** A pointer into the source. `quote` must appear verbatim in the release text (or in `file` when given). */
export type Citation = { releaseId: string; sceneId: string; beat?: number; quote?: string; file?: string };

export const FORBIDDEN_CAPABILITIES = [
  'RECONSTRUCT_UNRECORDED_MEMORY',
  'TIME_TRAVEL',
  'SPEAK_WITH_THE_DEAD',
  'GUARANTEE_HONEST_INTENT',
  'PROVE_TRUTH',
  'RETROACTIVE_FIX',
  'LOCATE_A_PERSON',
  'READ_MINDS',
] as const;
export type ForbiddenCapability = (typeof FORBIDDEN_CAPABILITIES)[number];

export const VIOLATIONS = [
  'CONTRADICTS_SOURCE',
  'PREMATURE_REVEAL',
  'REVEALS_WRITERS_ROOM_FACT',
  'POV_DID_NOT_WITNESS',
  'RECONSTRUCTS_UNRECORDED',
  'SPEAKS_FOR_THE_DEAD',
  'REEXPOSES_HARMED_PARTY',
  'UNDERMINES_PAYOFF',
  'REDUCES_MYSTERY',
  'EXPOSITION',
  'DUPLICATES_INVENTION',
  'FORCED_CONNECTION',
  'SMALLER_WORLD',
  'SURVEILLANCE_GADGET',
  'COST_WITHOUT_VALUE',
] as const;
export type Violation = (typeof VIOLATIONS)[number];

export const MEMORY_TYPES = [
  'HUMAN_MEMORY',
  'DOCUMENTED_HISTORICAL_FOOTAGE',
  'AUTHENTICATED_ARCHIVE',
  'SPECULATIVE_ARCHIVAL_TECHNOLOGY',
  'POTENTIALLY_UNRELIABLE_RECOLLECTION',
] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

/** SCORE_MOTIF and OBJECT_MATCH are the film's voice and claim no character memory. ACOUSTIC_MATCH may be the film's alone or heard by a character, in which case memoryType and pov say whose. */
export type MemoryMode = 'SOUND_MEMORY' | 'VISUAL_MEMORY' | 'SCORE_MOTIF' | 'ACOUSTIC_MATCH' | 'OBJECT_MATCH' | 'ARCHIVAL_DISPLAY';

export type MemorySpec = {
  mode: MemoryMode;
  memoryType: MemoryType | null;
  pov: string | null;
  povWitnessed: 'YES' | 'NOT_CLAIMED';
  /** Required for footage and archive types: what recording the image or sound comes from. */
  recordedSource?: string;
  trigger: string;
  period: string;
  soundSource: string;
  transitionSound: string;
  visualTransition: string;
  audienceGains: string;
  emotionalChange: string;
  returnCue: string;
  continuityImplication: string;
  audienceBeliefNow: string;
  reinterprets: string;
  prematureReveal: string;
  underminesMystery: string;
  unfairConcealment: string;
  payoffJustifies: string;
  /** Knowledge facts (KF-nn) or writers'-room facts (WR-*) the moment puts in front of the audience. */
  revealsFacts: string[];
};

export type CallbackClass = 'AMBIENT_RETURN' | 'VISUAL_PAYOFF' | 'NARRATIVE_CONNECTION';
export type Recognition = 'SUBLIMINAL' | 'REWATCH' | 'DELIBERATE';
export type Venue = 'PUBLIC' | 'INVITED' | 'STAFF' | 'PRIVATE_HOME' | 'WORKPLACE';

/** Section 15 registry extension. References existing people only; never a new identity, voice or biography. */
export type CallbackSpec = {
  class: CallbackClass;
  /** `scene:S1-01:<name>` (a packet person), `background:<release>:<group>` (named in that release), `prop:<name>` or `place:<name>`. */
  characterRef: string;
  firstAppearance: string;
  lastAppearance: string;
  proposedReturn: string;
  visualId: string;
  wardrobeId: string;
  gestureId: string;
  location: string;
  socialContext: string;
  importance: 'AMBIENT' | 'MINOR' | 'MEANINGFUL';
  recognition: Recognition;
  venue: Venue;
  accessRoute: string;
  speaks: 'NO' | 'EXISTING_MASTER_LINE';
  assetReuse: string;
  productionDependency: string;
};

/** Section 21. Prices are never estimated here: cost direction only, or UNKNOWN. */
export type ProductionImpact = {
  fitsRuntime: boolean;
  replaces: string | null;
  extraSec: number;
  newScene: boolean;
  newCharacterAsset: boolean;
  newProp: boolean;
  newMusicOrSfx: boolean;
  reusesLocation: string | null;
  reusesCharacter: string | null;
  generationCost: 'NO_CHANGE' | 'LOWER' | 'HIGHER' | 'UNKNOWN';
  note: string;
};

/** Section 20. Required for B and C. Original and proposed state are the proposal's `current` and `proposed`. */
export type Expansion = { why: string; continuity: string; runtime: string; downstream: string };

/** Section 25. Required for any proposal placed in S1-01 itself. */
export type S101Modification = {
  sourceVsDraft: string;
  shots: string[];
  runtimeEffectSec: number;
  assets: string;
  founderApproval: 'REQUIRED_BEFORE_PACKET_REVISION';
};

export type Proposal = {
  id: string;
  title: string;
  type: OpportunityType;
  category: Category;
  strength: Strength;
  /** First entry is the placement. Later entries are origins or other releases the proposal touches. */
  releases: string[];
  placement: string;
  cites: Citation[];
  current: string;
  proposed: string;
  benefit?: { narrative: string; emotional: string; visual: string };
  risk: { level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'; note: string };
  canonImpact: string;
  runtimeSec: number;
  impact?: ProductionImpact;
  founderDecision: string;
  claims?: ForbiddenCapability[];
  violates?: Violation[];
  rejectReason?: string;
  expansion?: Expansion;
  memory?: MemorySpec;
  callback?: CallbackSpec;
  s101?: S101Modification;
  inventionId?: string;
  techIds?: string[];
  dependsOn?: string[];
  conflictsWith?: string[];
  /** Open founder decisions or questions this proposal waits on (FD-*, U-*). */
  blockedBy?: string[];
  releaseCountDelta?: number;
  futureImpact?: string;
  board?: BoardAction;
};

export type TechTier = 'CIVIC' | 'PROFESSIONAL' | 'LEGACY_EXPERIMENTAL';

export type ExistingTech = {
  id: string;
  name: string;
  origin: 'BIBLE_06' | 'SEASON_NATIVE';
  exactClassification: string;
  bucket: SourceBucket;
  bibleDefinition: string | null;
  bibleLimit: string | null;
  /** Releases where it is on screen; each must match `keyword` in the master text. */
  appearsIn: string[];
  keyword: string;
  onScreenAs: string;
  tier: TechTier | 'NOT_PRESENT';
  unresolvedSpecs: string[];
  continuityDeps: string[];
  contradictions: string[];
  limits: string[];
  visual: string;
  social: string;
  enhancements: string[];
  verdict: string;
};

export type Invention = {
  id: string;
  name: string;
  purpose: string;
  appearance: string;
  use: string;
  observableEffect: string;
  mechanism: string;
  cannot: string[];
  failure: string[];
  privacy: string;
  social: string;
  accessTier: TechTier;
  priceTier: string;
  civicStatus: string;
  signature: { visual: string; audio: string };
  opportunity: string;
  continuityRisk: string;
  approvalStatus: 'NEW_PROPOSAL';
  category: Category;
  duplicateOf: string | null;
  claims: ForbiddenCapability[];
  proposalIds: string[];
};

export type MemoryMoment = {
  releaseId: string;
  kind: 'VISUAL_FLASHBACK' | 'VERBAL_ACCOUNT' | 'DOCUMENT' | 'ARCHIVAL_DISPLAY' | 'INFERENCE';
  memoryType: MemoryType;
  who: string;
  quote: string;
  note: string;
};

export type BackgroundGroup = { id: string; name: string; appearances: Array<{ releaseId: string; quote: string }>; note: string };

export type ReleaseJudgment = {
  id: string;
  /** What the release does well and why most of it should be left alone. */
  verdict: string;
  /** The thing an enhancement must not disturb. */
  keep: string;
  notes?: Partial<Record<OpportunityType, string>>;
};

export const SCORE_DIMENSIONS = [
  'NARRATIVE VALUE',
  'WORLD IMMERSION',
  'ORIGINALITY',
  'CHARACTER RELEVANCE',
  'EMOTIONAL IMPACT',
  'REWATCH VALUE',
  'CONTINUITY SAFETY',
  'VISUAL CLARITY',
  'PRODUCTION FEASIBILITY',
  'COST EFFICIENCY',
] as const;
export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export type Priority = { id: string; title: string; proposals: string[]; why: string; scores: Record<ScoreDimension, string> };
