/**
 * Chapter Cover Presentation Grammar — shared types (Sprint B3.1).
 * Scope: Chapter 01 only — NOT a global NDXBOOK rule.
 */

export const COVER_ANNOTATION_TYPES = [
  'CIRCLE_UNDERLINE',
  'ASTERISK_UPWARD_ARROW',
  'HAND_DRAWN_UNDERLINE',
  'NONE',
] as const;

export type CoverAnnotationType = (typeof COVER_ANNOTATION_TYPES)[number];

export type CoverHeadlineSpec = {
  lines: string[];
  style: 'CREAM_CONDENSED_DISPLAY_DISTRESSED';
  fullText: string;
};

export type CoverAnnotationSpec = {
  type: CoverAnnotationType;
  target: string;
  placement: string;
  color: 'LIME_GREEN';
  handDrawn: true;
};

export type CoverHeroArtifactSpec = {
  artifactClass: string;
  artifactId: string;
  tactileQualities: string[];
  limeGlow: 'EDGE_UNDERGLOW';
  contentDescription?: string;
  isolated: true;
  noEnvironmentVisible: true;
};

export type EntryCoverPresentationSpec = {
  entryId: string;
  entryNumber: number;
  format: 'COVER';
  aspect: '9:16';
  subject: string;
  title: string;
  background: 'PURE_BLACK' | 'NEAR_PURE_BLACK';
  headline: CoverHeadlineSpec;
  annotations: CoverAnnotationSpec[];
  heroArtifact: CoverHeroArtifactSpec;
  entryLabel: string;
  entryLabelUnderline: 'HAND_DRAWN_LIME';
  subjectLabel: string;
  bottomLogo: false;
  hierarchyOrder: ['HEADLINE', 'HERO_ARTIFACT', 'ENTRY_NUMBER', 'SUBJECT_LABEL'];
};

export type ChapterCoverPresentationConstants = {
  background: 'PURE_BLACK' | 'NEAR_PURE_BLACK';
  aspect: '9:16';
  hierarchy: ['HEADLINE', 'HERO_ARTIFACT', 'ENTRY_NUMBER', 'SUBJECT_LABEL'];
  artifactTreatment: 'CENTERED_ISOLATED_PHYSICAL_TACTILE_CINEMATIC_OBJECT_FIRST';
  accent: 'RESTRAINED_LIME_GREEN_GLOW_MARKS';
  lighting: 'DARK_CINEMATIC_OBJECT_WITH_LIME_REFLECTION_EDGE_LIGHT';
  textPrimary: 'CREAM_OFF_WHITE_DISPLAY';
  textSupport: 'WHITE_LIGHT_MONO';
  space: 'GENEROUS_BLACK_NEGATIVE_SPACE';
};

export type ChapterCoverPresentationGrammar = {
  grammarId: string;
  chapterId: string;
  chapterNumber: 1;
  chapterTitle: string;
  brandId: string;
  projectId: string;
  scope: 'CHAPTER_01_ONLY';
  status: 'LOCKED';
  constants: ChapterCoverPresentationConstants;
  variablePerEntry: string[];
  repetitionRules: string[];
  createdAt: string;
  updatedAt: string;
};

export type ChapterCoverCohesionCheck = {
  check: string;
  passed: boolean;
  severity: 'CONSISTENT' | 'VARIABLE' | 'BLOCK' | 'WARN';
  detail?: string;
};

export type ChapterCoverCohesionQAResult = {
  chapterId: string;
  passed: boolean;
  blocking: boolean;
  checks: ChapterCoverCohesionCheck[];
  blockers: string[];
  warnings: string[];
};

export type CreativeRevisionFailureType =
  | 'ARTIFACT_HIERARCHY'
  | 'CHAPTER_COHESION'
  | 'TEXT_DISCIPLINE';

export type FounderCreativeRevisionLearning = {
  revisionId: string;
  chapterId: string;
  scope: 'CHAPTER_01_ONLY';
  supersededAssetId: string;
  authorityAssetId: null;
  failureTypes: CreativeRevisionFailureType[];
  generatedProblem: string;
  founderCorrection: string;
  entrySpecificChange: string;
  lesson: string;
  recordedAt: string;
};

export type FounderCoverAuthorityStatus = 'CREATIVE_ANCHOR_APPROVED';

export type Entry002FounderCoverAuthority = {
  authorityType: 'CREATIVE_ANCHOR_AUTHORITY';
  entryId: 'entry-002';
  entryNumber: 2;
  format: 'COVER';
  aspect: '9:16';
  subject: string;
  title: string;
  presentation: EntryCoverPresentationSpec;
  founderJudgment: 'LOVE_IT';
  canonState: FounderCoverAuthorityStatus;
  supersedesAssetId: string;
  propagateDownstream: false;
  registeredAt: string;
};

export type B3PreservedAnchorRecord = {
  assetId: string;
  founderJudgment: 'NOT_FOR_ME';
  canonState: 'NON_CANON';
  lineagePreserved: true;
  doNotPropagate: true;
  doNotResurfaceSilently: true;
  rejectionReason: string;
  generationReceiptId: string;
  provider: string;
  model: string;
  routeId: string;
};

export type DownstreamProductionState =
  | 'BLOCKED_PENDING_ANCHOR_APPROVAL'
  | 'UNLOCKED_PENDING_PRODUCTION';

export type Entry002B31BootstrapResult = {
  sprint: 'B3.1_FOUNDER_CREATIVE_OVERRIDE';
  b3PreservedAnchor: B3PreservedAnchorRecord;
  founderAuthority: Entry002FounderCoverAuthority;
  coverGrammar: ChapterCoverPresentationGrammar;
  entryCovers: EntryCoverPresentationSpec[];
  creativeLearning: FounderCreativeRevisionLearning;
  coverCohesionQA: ChapterCoverCohesionQAResult;
  downstreamUnlocked: Record<string, DownstreamProductionState>;
  assetsGeneratedThisSprint: 0;
};
