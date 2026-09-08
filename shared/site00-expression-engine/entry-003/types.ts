/**
 * C1.2 — Entry 003 autonomous creative candidate types.
 */

import type {
  CreativeDirectorRun,
  CreativeMaturityAssessment,
  FounderInterventionDependency,
  FounderFeedbackType,
  CreativeDirectorFounderJudgment,
} from '../creative-director/types.js';
import type { NarrativeSynthesis } from '../narrative-synthesis/types.js';

export const ENTRY_003_ID = 'entry-003' as const;
export const ENTRY_003_WORKING_TITLE_PLACEHOLDER = 'ENTRY 003 — TBD' as const;

export const ENTRY_003_RECORD_IDS = {
  creativeDirection: 'NDX-ENTRY-003-CREATIVE-DIRECTION-001',
  narrativeSynthesis: 'NDX-ENTRY-003-NARRATIVE-SYNTHESIS-001',
  directorialConception: 'NDX-ENTRY-003-DIRECTORIAL-CONCEPTION-001',
  visualAuthorityPlan: 'NDX-ENTRY-003-VISUAL-AUTHORITY-PLAN-001',
} as const;

export const ENTRY_003_GATE_ID = 'GATE_ENTRY_003_AUTONOMOUS_CREATIVE_DIRECTION_REVIEW' as const;

export const ENTRY_003_STATUSES = [
  'SUBJECT_DISCOVERY',
  'CREATIVE_DIRECTION_AWAITING_FOUNDER_REVIEW',
  'NEEDS_FOUNDER_DIRECTION',
  'FOUNDER_REVISION',
  'APPROVED',
  'ARCHIVED',
] as const;
export type Entry003Status = (typeof ENTRY_003_STATUSES)[number];

export type ResearchRequirementStatus =
  | 'NOT_REQUIRED'
  | 'RESEARCH_REQUIRED'
  | 'VERIFIED'
  | 'INSUFFICIENT'
  | 'CONTRADICTED';

export type Entry003SubjectCandidate = {
  candidateId: string;
  subject: string;
  surfaceTopic: string;
  proposedThesis: string;
  culturalContradiction: string;
  whyNow: string;
  receiptPotential: string;
  storyPotential: string;
  visualPotential: string;
  ndxbookFit: string;
  chapterFit: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  similarityToEntry001: number;
  similarityToEntry002: number;
  researchRequirements: string[];
  obviousVersion: string;
  whyItCouldBecomeNonObvious: string;
  culturalDomain: string;
};

export type Entry003SubjectEvaluation = {
  candidateId: string;
  culturalInsight: number;
  chapterFit: number;
  receiptStrength: number;
  contradictionClarity: number;
  narrativePotential: number;
  visualPotential: number;
  worldPotential: number;
  artifactPotential: number;
  interjectionPotential: number;
  socialFormatPotential: number;
  originality: number;
  ndxbookSpecificity: number;
  distanceFromEntry001: number;
  distanceFromEntry002: number;
  researchFeasibility: number;
  productionFeasibility: number;
  qualitativeReasoning: string;
};

export type Entry003SubjectSelection = {
  selectedCandidateId: string;
  runnerUpCandidateId: string | null;
  subject: string;
  workingTitle: string;
  thesis: string;
  lockedPremiseCandidate: string;
  whyItWins: string;
  whyRunnerUpLost: string | null;
  whyOtherCandidatesLost: string[];
  whatMakesThisNDXBOOK: string;
  whyThisBelongsInChapter01: string;
  whyThisIsNotEntry001Again: string;
  whyThisIsNotEntry002Again: string;
  researchRequired: string[];
  creativeRisk: string;
  candidateStatus: 'ENTRY_003_CREATIVE_CANDIDATE';
};

export type Entry003ExtendedCulturalRead = {
  surfaceRead: string;
  obviousCulturalTake: string;
  deeperTension: string;
  culturalHypocrisy: string;
  whatPeopleSayNow: string;
  whatReceiptsMayShow: string;
  whyPositionsCannotBothSurvive: string;
  whatThisIsReallyAbout: string;
  whyItMatters: string;
};

export type Entry003EvidenceItem = {
  claim: string;
  evidenceNeeded: string;
  researchStatus: ResearchRequirementStatus;
  sourceRequirement: string;
  productionImportance: 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';
};

export type Entry003EvidenceResearchPlan = {
  planId: string;
  entryId: typeof ENTRY_003_ID;
  items: Entry003EvidenceItem[];
  fabricationPolicy: 'NO_FABRICATED_RECEIPTS';
};

export type Entry003FormatImplications = {
  reel: string;
  carousel: string;
  story: string;
  xTwitter: string;
  tiktok: string;
};

export type Entry003WorldRecord = {
  worldName: string;
  worldDescription: string;
  worldFunction: string;
  whyNecessary: string;
  whatWorldPhysicallyDoes: string;
  whatWorldDoesNotDo: string;
};

export type Entry003ArtifactRecord = {
  artifact: string | null;
  artifactFunction: string | null;
  whyThisObject: string | null;
  howItChangesStory: string | null;
  noPrimaryArtifact: boolean;
};

export type Entry003Records = {
  creativeDirectionId: string;
  narrativeSynthesisId: string;
  directorialConceptionId: string;
  visualAuthorityPlanId: string;
  entryStatus: Entry003Status;
  canon: false;
  productionReady: false;
  storyboardReady: false;
};

export type Entry003AutonomousPackage = {
  packageId: string;
  entryId: typeof ENTRY_003_ID;
  sprint: 'C1.2_ENTRY_003_AUTONOMOUS_CREATIVE_DIRECTOR';
  status: Entry003Status;
  subjectCandidates: Entry003SubjectCandidate[];
  subjectEvaluations: Entry003SubjectEvaluation[];
  subjectSelection: Entry003SubjectSelection;
  extendedCulturalRead: Entry003ExtendedCulturalRead;
  creativeDirectorRun: CreativeDirectorRun;
  evidenceResearchPlan: Entry003EvidenceResearchPlan;
  formatImplications: Entry003FormatImplications;
  worldRecord: Entry003WorldRecord;
  artifactRecord: Entry003ArtifactRecord;
  audienceJourney: string[];
  emotionalArcSummary: string;
  shuffleQa: { passed: boolean; orderDependency: string };
  connectiveTissueTest: { passed: boolean; founderWouldInventMiddle: boolean };
  priorEntryDifferentiation: { passed: boolean; violations: string[] };
  records: Entry003Records;
  gateId: typeof ENTRY_003_GATE_ID;
  founderJudgment: CreativeDirectorFounderJudgment;
  founderFeedbackType: FounderFeedbackType | null;
  creativeMaturity: CreativeMaturityAssessment;
  founderInterventionDependency: FounderInterventionDependency;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
  narrativeSynthesis: NarrativeSynthesis | null;
  createdAt: string;
  updatedAt: string;
};

export type Entry003BootstrapResult = {
  sprint: string;
  architectureLayer: string;
  providerDispatchCount: 0;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  falDispatchCount: 0;
  entry003Package: Entry003AutonomousPackage;
  nextAction: string;
};
