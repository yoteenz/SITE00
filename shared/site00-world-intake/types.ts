/**
 * World-class client guest intake — shared types.
 */

import type {
  IntakeInviteStatus,
  ProjectExperienceClass,
  WorldFormationReadinessState,
  WorldIntakeSection,
} from './constants.js';

export type RawAnswerRecord = {
  questionId: string;
  section: WorldIntakeSection | string;
  value: unknown;
  verbatim?: string | null;
  selectedOptions?: string[];
  capturedAt: string;
};

export type OfferingType =
  | 'PRODUCT'
  | 'SERVICE'
  | 'LIVE_SERVICE'
  | 'BOOKING'
  | 'COMMISSION'
  | 'DIGITAL_PRODUCT'
  | 'MEMBERSHIP'
  | 'CONTENT'
  | 'EVENT'
  | 'OTHER';

export type BusinessOffering = {
  offeringId: string;
  name: string;
  type: OfferingType;
  description: string;
  customerGoal: string;
  purchaseRequired: boolean;
  bookingRequired: boolean;
  livePresenceRequired: boolean;
  deliveryMode: string | null;
  fulfillmentMode: string | null;
  repeatable: boolean;
  priority: 'PRIMARY' | 'SECONDARY' | 'OTHER';
  dependencies: string[];
};

export type BusinessOfferingMap = {
  version: number;
  offerings: BusinessOffering[];
  extractedAt: string;
};

export type BusinessIntelligence = {
  businessModel: string | null;
  revenueSources: string[];
  productsSummary: string | null;
  servicesSummary: string | null;
  appointmentsBookings: string | null;
  liveServices: string | null;
  digitalProducts: string | null;
  physicalProducts: string | null;
  memberships: string | null;
  events: string | null;
  content: string | null;
  customerSupport: string | null;
  fulfillment: string | null;
  payments: string | null;
  locationDependence: string | null;
  operationalConstraints: string | null;
};

export type WorldReadinessProfile = {
  version: number;
  entryExperience: string | null;
  spatialExpectation: string | null;
  spatialExamples: string | null;
  customerIdentityIntent: string | null;
  avatarCustomizationDomains: string[];
  founderPresenceIntent: string | null;
  aiRepresentation: {
    role: string | null;
    behavior: string | null;
    allowedInteractions: string | null;
    liveVsPrerecorded: string | null;
    tone: string | null;
    boundaries: string | null;
    mustNeverDo: string | null;
  } | null;
  liveInteraction: string | null;
  commerceFeel: string | null;
  commerceRequirements: string | null;
  navigationPhilosophy: string | null;
  persistenceIntent: string[];
  socialPresence: string | null;
  contentCreationIntent: string[];
  realismFantasyBand: string | null;
  styleExplorationBands: string[];
  gamingDepth: 'NONE' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'UNRESOLVED';
  gameMechanicsInterest: string[];
  hardBoundariesVerbatim: string | null;
  founderWorldHypothesis: string | null;
  founderWorldHypothesisClassification: 'FOUNDER_PROPOSED_CONCEPT';
  extractedAt: string;
};

export type WorldFormationReadiness = {
  state: WorldFormationReadinessState;
  domains: Record<string, boolean>;
  blockers: string[];
  evaluatedAt: string;
};

export type WorldFormationInput = {
  methodologyVersion: string;
  brandLore: Record<string, unknown> | null;
  brandPersonality: Record<string, unknown> | null;
  founderCreativeAppetite: Record<string, unknown> | null;
  primaryExpressionContext: string | null;
  businessOfferingMap: BusinessOfferingMap | null;
  worldReadinessProfile: WorldReadinessProfile | null;
  businessIntelligence: BusinessIntelligence | null;
  functionalRequirements: string[];
  founderWorldHypothesis: string | null;
  referenceEvidence: string[];
  antiDirection: string[];
  existingDigitalAssets: string | null;
  projectConstraints: string[];
  experienceClass: ProjectExperienceClass;
  assembledAt: string;
};

export type WorldIntelligenceSnapshot = {
  snapshotId: string;
  projectId: string;
  inviteId: string;
  sessionId: string;
  profileVersions: Record<string, unknown>;
  businessIntelligenceVersion: number;
  brandLoreFingerprint: string | null;
  personalityFingerprint: string | null;
  creativeAppetiteVersion: string | null;
  worldReadinessVersion: number;
  offeringMapVersion: number;
  readiness: WorldFormationReadiness;
  worldFormationInput: WorldFormationInput;
  sourceInviteId: string;
  createdAt: string;
};

export type GuestIntakeSession = {
  sessionId: string;
  inviteId: string;
  projectId: string;
  startedAt: string;
  lastActivityAt: string;
  currentSection: WorldIntakeSection | null;
  currentStep: string | null;
  completionPercentage: number;
  completedSections: WorldIntakeSection[];
  rawAnswers: Record<string, RawAnswerRecord>;
  draftState: Record<string, unknown>;
  synthesized: {
    businessIntelligence?: BusinessIntelligence;
    offeringMap?: BusinessOfferingMap;
    worldReadiness?: WorldReadinessProfile;
    brandLore?: Record<string, unknown>;
    personality?: Record<string, unknown>;
    creativeAppetite?: Record<string, unknown>;
    expressionContext?: string | null;
  };
  clientDeviceMetadata: Record<string, unknown>;
  submittedAt: string | null;
  version: number;
};

export type IntakeInviteRecord = {
  inviteId: string;
  tokenHash: string;
  projectId: string;
  orgId: string | null;
  projectSlug: string;
  projectDisplayName: string;
  intakeType: 'WORLD_DISCOVERY';
  projectExperienceClass: ProjectExperienceClass;
  status: IntakeInviteStatus;
  createdBy: string | null;
  createdAt: string;
  expiresAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  revokedAt: string | null;
  lastSavedAt: string | null;
  recipientLabel: string;
  recipientEmail: string | null;
  allowedSections: WorldIntakeSection[];
  intelligenceSnapshotVersion: number;
  metadata: Record<string, unknown>;
  claimableByEmail: string | null;
  claimedByUserId: string | null;
  claimedAt: string | null;
};

export type ClientIntakeInviteSummary = {
  inviteId: string;
  projectDisplayName: string;
  projectSlug: string;
  recipientLabel: string;
  projectExperienceClass: ProjectExperienceClass;
  status: IntakeInviteStatus;
  completionPercentage: number;
  worldFormationReadiness: WorldFormationReadinessState;
  lastSavedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
};

export type CreateIntakeInviteInput = {
  projectDisplayName: string;
  recipientLabel: string;
  experienceAmbition: 'SITE' | 'APPLICATION' | 'IMMERSIVE' | 'WORLD' | 'UNSURE';
  recipientEmail?: string | null;
  expiresAt?: string | null;
  createdBy?: string | null;
};

export type CreateIntakeInviteResult = {
  invite: IntakeInviteRecord;
  privateLink: string;
  rawToken: string;
};
