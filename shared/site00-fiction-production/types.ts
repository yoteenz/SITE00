/** THE EXCHANGE — season master, screenplay and screenplay-to-screen production types. */

export const FICTION_PRODUCTION_SCHEMA_VERSION = '1.0.0' as const;

export const CANON_CLASSIFICATIONS = [
  'APPROVED_CANON',
  'APPROVED_DEVELOPMENT_DIRECTION',
  'PROVISIONAL_IMPLEMENTATION',
  'OPEN_CREATIVE_QUESTION',
  'HISTORICAL_SUPERSEDED',
  'PRODUCTION_TEST_ONLY',
] as const;
export type CanonClassification = (typeof CANON_CLASSIFICATIONS)[number];

/** R = request, L = life, N = Exchange Night, A = season arc. */
export const STORY_LAYERS = ['R', 'L', 'N', 'A'] as const;
export type StoryLayer = (typeof STORY_LAYERS)[number];

export type ReleaseChange = 'UNCHANGED' | 'REVISED' | 'REVISED_S1_DEPENDENT';

export type ApprovedAmendment = {
  amendmentId: string;
  recommendationId: string;
  text: string;
  classification: CanonClassification;
  placementEvidence: string;
  runtimeEffect: string;
};

export type MasterRelease = {
  id: string;
  order: number;
  title: string;
  arc: { number: number; name: string };
  category: string;
  runtimeTarget: string;
  runtimeTargetSec: number;
  fictionalDay: string;
  dayOffsetStart: number;
  layers: StoryLayer[];
  exchangeNight: boolean;
  featuredCharacters: string;
  principalCharacters: string[];
  setting: string;
  openingHook: { text: string; derivation: string };
  narrativeDevelopment: string;
  characterPurpose: string;
  payoff: string;
  endingTransition: string;
  emotionalTurningPoint: { text: string | null; source: string };
  patronScenarios: string[];
  nightDependencies: string[];
  continuityDependencies: string;
  dependsOn: string[];
  paysOffIn: string[];
  unresolvedQuestions: string[];
  productionComplexity: { rating: 'LOW' | 'MED' | 'HIGH' | 'VERY HIGH'; notes: string };
  approvedAmendments: ApprovedAmendment[];
  classification: CanonClassification;
  lineage: {
    hybridSource: string;
    changeBaselineToV1: string;
    changeVsV1: ReleaseChange;
    workstream: string;
    s1Dependent: boolean;
    changeNote: string;
    leanId: string;
    leanMergedWith: string[];
    sourceDocument: string;
    founderApproval: string;
  };
};

export type SeasonMaster = {
  schemaVersion: typeof FICTION_PRODUCTION_SCHEMA_VERSION;
  propertySlug: 'the-exchange';
  masterId: string;
  classification: CanonClassification;
  structure: { releaseCount: number; runtimeTotal: string; runtimeTotalSec: number; arcs: Array<{ number: number; name: string; first: string; last: string }> };
  sourceDocument: { path: string; sha256: string };
  founderApproval: { date: string; sprint: string; decisions: string[] };
  fallback: { path: string; releaseCount: number; status: string };
  history: Array<{ path: string; classification: CanonClassification; role: string }>;
  releases: MasterRelease[];
};

export const APPROVAL_DOMAINS = [
  'STORY_STRUCTURE',
  'SCREENPLAY',
  'CHARACTER_VISUAL_IDENTITY',
  'CHARACTER_VOICE',
  'SET',
  'WARDROBE',
  'SHOT_PLAN',
  'GENERATED_VIDEO',
  'FINAL_EDIT',
] as const;
export type ApprovalDomain = (typeof APPROVAL_DOMAINS)[number];

export const APPROVAL_STATES = [
  'NOT_SUBMITTED',
  'DRAFT',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'REJECTED',
  'SUPERSEDED',
] as const;
export type ApprovalState = (typeof APPROVAL_STATES)[number];

export type ApprovalRecord = {
  subjectId: string;
  domain: ApprovalDomain;
  state: ApprovalState;
  version: number;
  actor: string | null;
  decidedAt: string | null;
  note: string | null;
  history: Array<{ from: ApprovalState; to: ApprovalState; actor: string; at: string; note: string | null }>;
};

export type ScreenplayElement =
  | { kind: 'action'; text: string }
  | {
      kind: 'dialogue';
      lineId: string;
      character: string;
      extension: string | null;
      parenthetical: string | null;
      text: string;
      dual: boolean;
    }
  | { kind: 'transition'; text: string }
  | { kind: 'note'; tag: string; value: string };

export type ScreenplayScene = {
  sceneId: string;
  number: number;
  heading: string;
  intExt: string;
  location: string;
  subLocation: string | null;
  timeOfDay: string;
  elements: ScreenplayElement[];
};

export type ScreenplayMeta = {
  identity: { releaseId: string; title: string; arc: string; version: number; approvalStatus: string; runtimeTarget: string };
  story: {
    narrativePurpose: string;
    previousContinuity: string;
    openingHook: string;
    sceneObjectives: Record<string, string>;
    characterMotivations: Record<string, string>;
    conflict: string;
    revelations: string[];
    emotionalTurningPoint: string;
    endingHook: string;
  };
  performance: { speechNotes: Record<string, string>; subtext: string; pacing: string; silence: string };
  visual: { intention: string; keyImages: string[]; requiredReveals: string[]; continuityRules: string[] };
  production: {
    characters: string[];
    locations: string[];
    wardrobe: Record<string, string>;
    props: string[];
    effects: string[];
    crowd: string;
    shotComplexity: string;
    technical: string[];
  };
  continuity: { factsIntroduced: string[]; factsCarried: string[]; openQuestions: string[]; payoffDependencies: string[]; canonReferences: string[] };
  editorial: { pacingRisk: string; retentionHook: string; endingTransition: string };
};

export type ScreenplayDocument = { meta: ScreenplayMeta; scenes: ScreenplayScene[]; sourcePath: string };

export type ShotType =
  | 'ESTABLISHING'
  | 'ACTION'
  | 'DIALOGUE'
  | 'REACTION'
  | 'INSERT'
  | 'FREEZE_FRAME'
  | 'TRANSITION'
  | 'CUTAWAY';

export type ShotRecord = {
  shotId: string;
  releaseId: string;
  sceneId: string;
  order: number;
  type: ShotType;
  purpose: string;
  onScreen: string[];
  framing: string;
  movement: string;
  blocking: string;
  dialogueRefs: string[];
  durationSec: number;
  startFrameRef: string;
  endFrameRef: string | null;
  wardrobeState: Record<string, string>;
  setRef: string | null;
  propState: Record<string, string>;
  movementConstraints: string[];
  technicalComplexity: 'LOW' | 'MED' | 'HIGH';
  generationProvider: string;
  generationStatus: 'NOT_STARTED';
  approvalStatus: ApprovalState;
  estimatedCost: { usd: number | null; credits: number | null; basis: string };
  actualCost: null;
};
