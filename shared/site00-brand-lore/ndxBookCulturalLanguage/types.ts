/**
 * P0.5E.2 — NDXBOOK Book Cultural Language types.
 */

import type {
  NDX_AUDIENCE_BOOK_BEHAVIORS,
  NDX_CANONICAL_BOOK_TERMS,
  NDX_CONTENT_LINEAGE,
  NDX_MOTION_BEHAVIOR_MODES,
  NDX_PLATFORM_MOTION_BEHAVIORS,
} from './constants.js';
import type { BookLanguageContext } from '../../site00-studio-world-production/bookLanguage/types.js';

export type NdxCanonicalBookTerm = (typeof NDX_CANONICAL_BOOK_TERMS)[number];
export type NdxAudienceBookBehavior = (typeof NDX_AUDIENCE_BOOK_BEHAVIORS)[number];
export type NdxMotionBehaviorMode = (typeof NDX_MOTION_BEHAVIOR_MODES)[number];
export type NdxContentLineageStage = (typeof NDX_CONTENT_LINEAGE)[number];
export type NdxPlatformMotionBehavior = (typeof NDX_PLATFORM_MOTION_BEHAVIORS)[keyof typeof NDX_PLATFORM_MOTION_BEHAVIORS];

export type TerminologyClassification =
  | 'INTERNAL_PRODUCTION'
  | 'PUBLIC_NDX'
  | 'HISTORICAL_IMMUTABLE'
  | 'STUDIO_WORLD_GENERIC'
  | 'MIGRATE_TO_BOOK';

export type TerminologyForensicEntry = {
  term: string;
  classification: TerminologyClassification;
  publicAlias: string | null;
  persistedIdentifier: boolean;
  notes: string;
};

export type NdxBookCulturalLanguageSystem = {
  systemId: string;
  projectId: string;
  canonicalTerms: NdxCanonicalBookTerm[];
  corePrinciple: 'THE_CAROUSEL_IS_THE_PAGE_THE_VIDEO_SHOWS_WHY_THE_PAGE_EXISTS';
};

export type NdxContentOntologyNode = {
  nodeId: string;
  kind:
    | 'CONTENT_INTELLIGENCE'
    | 'PRIMARY_EVENT'
    | 'PAGE'
    | 'PAGE_SEQUENCE'
    | 'MARGIN_NOTE'
    | 'MOTION_EXPRESSION'
    | 'SPOKEN_EXPRESSION'
    | 'CHAPTER'
    | 'BOOKMARK'
    | 'DOG_EAR'
    | 'FOOTNOTE'
    | 'ERRATA'
    | 'CALLBACK'
    | 'INDEX_ENTRY'
    | 'COMMUNITY_CONTRIBUTION';
  parentId: string | null;
  surfaceBehavior: string | null;
};

export type NdxContentOntology = {
  ontologyId: string;
  projectId: string;
  surfaces: Record<string, string>;
  lineage: NdxContentLineageStage[];
  nodes: NdxContentOntologyNode[];
};

export type NdxAudienceBookBehaviorSpec = {
  behavior: NdxAudienceBookBehavior;
  publicLabel: string;
  supportsCommunitySubmission: boolean;
  organicBehaviorOnly: true;
};

export type NdxMotionBehaviorSpec = {
  mode: NdxMotionBehaviorMode;
  trigger: string;
  emotionalTemperature: string;
  researchDepth: string;
  motionBehavior: string;
  founderCharacterPresence: string;
  evidenceBehavior: string;
  humorOpportunity: string;
  endingBehavior: string;
  bookTerminology: string[];
  idealDurationRangeSec: [number, number];
  platformSuitability: string[];
  failureModes: string[];
};

export type CrossSurfaceBookProgression = {
  progressionId: string;
  stages: string[];
  flexible: true;
  reuseThinkingNotPosts: true;
};

export type NdxMotionCharacterBookLanguageRun = {
  runId: string;
  projectId: string;
  culturalLanguage: NdxBookCulturalLanguageSystem;
  terminologyForensic: TerminologyForensicEntry[];
  contentOntology: NdxContentOntology;
  audienceBehaviors: NdxAudienceBookBehaviorSpec[];
  crossSurfaceProgression: CrossSurfaceBookProgression;
  motionThesis: { full: string[]; compressed: string[] };
  motionBehaviors: NdxMotionBehaviorSpec[];
  platformBehaviors: Record<string, NdxPlatformMotionBehavior>;
  embodiedCharacterFoundation: Record<string, unknown>;
  embodiedCharacterDiscoveryReadiness: Record<string, unknown>;
  updatedAt: string;
};

export type BookLanguageContextEvaluationInput = {
  term: string;
  context: BookLanguageContext;
};
