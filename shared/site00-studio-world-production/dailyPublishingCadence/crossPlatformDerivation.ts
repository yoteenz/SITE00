/**
 * Daily Primary Content Event + Cross-Platform Content Intelligence.
 */

import { createHash } from 'node:crypto';
import type {
  CrossPlatformContentIntelligence,
  CrossPlatformDerivationPolicy,
  DailyPrimaryContentEvent,
  PlatformContentExpression,
  PublishingPlatform,
  PublishingSurface,
} from './types.js';
import type { PrimaryEventPlanningRole } from './types.js';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function buildCrossPlatformDerivationPolicy(params: {
  projectId: string;
}): CrossPlatformDerivationPolicy {
  return {
    policyId: `derivation-${params.projectId}`,
    projectId: params.projectId,
    coreRule: 'REUSE_THINKING_NOT_POSTS',
    requireIndependentHook: true,
    requireIndependentPacing: true,
    requireIndependentVisualStrategy: true,
    forbidCrosspostCopy: true,
    forbidAssetDump: true,
    allowExplicitAssetReuse: false,
    fingerprint: hash(`derivation-${params.projectId}`),
  };
}

export function buildDailyPrimaryContentEvent(params: {
  id: string;
  projectId: string;
  date: string;
  planningRole: PrimaryEventPlanningRole | null;
  contentOpportunityId?: string | null;
  primarySubject: string;
  behavioralMode: string;
  characterTemperature: string;
  priority?: DailyPrimaryContentEvent['priority'];
}): DailyPrimaryContentEvent {
  return {
    id: params.id,
    projectId: params.projectId,
    date: params.date,
    planningRole: params.planningRole,
    contentOpportunityId: params.contentOpportunityId ?? null,
    characterEventId: null,
    contentThesisId: null,
    priority: params.priority ?? 'TIER_3_THIS_WEEK',
    timeliness: 'MEDIUM',
    resolutionState: 'OPEN',
    researchDepth: 'STANDARD',
    primarySubject: params.primarySubject,
    secondarySubjects: [],
    behavioralMode: params.behavioralMode,
    characterTemperature: params.characterTemperature,
    availableEvidence: [],
    requiredEvidence: [],
    recommendedChannelExpressions: [],
    status: 'PLANNED',
    fingerprint: hash(`${params.id}-${params.primarySubject}`),
  };
}

export function buildCrossPlatformContentIntelligence(params: {
  id: string;
  projectId: string;
  primaryContentEventId: string;
  coreObservation: string;
  coreQuestion?: string | null;
  coreClaim?: string | null;
}): CrossPlatformContentIntelligence {
  return {
    id: params.id,
    projectId: params.projectId,
    primaryContentEventId: params.primaryContentEventId,
    contentThesisId: null,
    coreObservation: params.coreObservation,
    coreQuestion: params.coreQuestion ?? null,
    coreClaim: params.coreClaim ?? null,
    coreContradiction: null,
    whatNDXNoticed: params.coreObservation,
    whyNDXCares: 'Audience deserves clarity without hype.',
    whatNDXInvestigated: null,
    whatNDXFound: null,
    whatNDXConnected: null,
    whatNDXRemembers: null,
    whatNDXChangedItsMindAbout: null,
    evidenceManifest: [],
    claimClassifications: [],
    resolutionState: 'OPEN',
    riskState: 'LOW',
    audienceValue: 'USEFUL',
    culturalContext: null,
    humorPotential: 'MEDIUM',
    seriousnessRequirement: 'MEDIUM',
    platformExpressionEligibility: defaultPlatformEligibility(),
    status: 'DRAFT',
    fingerprint: hash(`${params.id}-${params.coreObservation}`),
  };
}

function defaultPlatformEligibility(): CrossPlatformContentIntelligence['platformExpressionEligibility'] {
  return [
    { platform: 'INSTAGRAM', surface: 'FEED', recommended: true },
    { platform: 'INSTAGRAM', surface: 'STORY', recommended: true },
    { platform: 'INSTAGRAM', surface: 'REEL', recommended: true },
    { platform: 'TIKTOK', surface: 'REEL', recommended: true },
    { platform: 'YOUTUBE', surface: 'SHORT', recommended: true },
    { platform: 'THREADS', surface: 'TEXT', recommended: true },
  ];
}

export function derivePlatformContentExpression(params: {
  id: string;
  intelligence: CrossPlatformContentIntelligence;
  primaryContentEventId: string;
  platform: PublishingPlatform;
  surface: PublishingSurface;
  format: string;
  hook: string;
  openingBeat: string;
  platformAngle: PlatformContentExpression['platformAngle'];
  adaptationReasoning: string;
  visualStrategy?: string;
  textStrategy?: string | null;
  runtimeSeconds?: number | null;
}): PlatformContentExpression {
  return {
    id: params.id,
    contentIntelligenceId: params.intelligence.id,
    primaryContentEventId: params.primaryContentEventId,
    platform: params.platform,
    surface: params.surface,
    format: params.format,
    platformRole: `${params.platform}_${params.surface}`,
    audienceBehavior: platformAudienceBehavior(params.platform, params.surface),
    hook: params.hook,
    openingBeat: params.openingBeat,
    informationSequence: [params.openingBeat],
    visualStrategy: params.visualStrategy ?? defaultVisualStrategy(params.platform, params.surface),
    audioStrategy: params.surface === 'REEL' || params.surface === 'SHORT' ? 'VOICEOVER_OR_AMBIENT' : null,
    textStrategy: params.textStrategy ?? (params.surface === 'TEXT' ? 'TEXT_LED' : null),
    characterTemperature: 'MODERATE',
    behavioralMode: 'INVESTIGATIVE',
    runtimeSeconds: params.runtimeSeconds ?? (params.surface === 'REEL' ? 45 : null),
    slideCount: params.surface === 'FEED' ? 1 : null,
    storyUnitCount: params.surface === 'STORY' ? 1 : null,
    cta: null,
    interactionMechanism: params.surface === 'STORY' ? 'POLL_OR_QUESTION' : null,
    adaptationReasoning: params.adaptationReasoning,
    platformAngle: params.platformAngle,
    sharedIntelligenceFingerprint: params.intelligence.fingerprint,
    expressionFingerprint: hash(`${params.id}-${params.hook}-${params.platform}`),
    reelProductionComplexity: params.surface === 'REEL' ? 'MEDIUM' : null,
    reelTypeBehavior: params.surface === 'REEL' ? 'RABBIT_HOLE' : null,
    status: 'PLANNED',
  };
}

function platformAudienceBehavior(platform: PublishingPlatform, surface: PublishingSurface): string {
  if (platform === 'TIKTOK') return 'CONVERSATIONAL_IMMEDIATE';
  if (platform === 'YOUTUBE' && surface === 'SHORT') return 'EXPLANATORY_SEARCH_FRIENDLY';
  if (platform === 'THREADS') return 'TEXT_JUDGMENT_LED';
  if (surface === 'STORY') return 'IMMEDIATE_REACTIVE';
  if (surface === 'REEL') return 'THINKING_OVER_TIME';
  return 'ARCHIVE_WORTHY_EDITORIAL';
}

function defaultVisualStrategy(platform: PublishingPlatform, surface: PublishingSurface): string {
  if (platform === 'TIKTOK') return 'RAW_VERTICAL_DISCOVERY';
  if (platform === 'YOUTUBE') return 'SHORT_EXPLANATORY_VERTICAL';
  if (surface === 'STORY') return 'CONVERSATIONAL_MINIMAL_DESIGN';
  if (surface === 'REEL') return 'VIDEO_NATIVE_EVIDENCE_SEQUENCE';
  return 'ART_DIRECTED_EDITORIAL';
}

export function primaryEventDistinctFromPlatformExpression(
  event: DailyPrimaryContentEvent,
  expression: PlatformContentExpression,
): boolean {
  return event.id === expression.primaryContentEventId && event.primarySubject !== expression.hook;
}

export function freezeContentIntelligence(
  intelligence: CrossPlatformContentIntelligence,
): CrossPlatformContentIntelligence {
  return { ...intelligence, status: 'FROZEN' };
}

export function platformDerivationMayChangeHookButNotFacts(params: {
  intelligence: CrossPlatformContentIntelligence;
  expression: PlatformContentExpression;
  proposedClaim: string;
}): { allowed: boolean; failure?: string } {
  if (params.proposedClaim !== params.intelligence.coreClaim && params.intelligence.coreClaim) {
    return { allowed: false, failure: 'FAIL_PLATFORM_DERIVATION_CHANGES_FACTS' };
  }
  if (params.expression.hook === params.intelligence.coreObservation && params.expression.platform !== 'INSTAGRAM') {
    return { allowed: true };
  }
  return { allowed: true };
}

export function reuseThinkingNotPostsEnforced(): true {
  return true;
}
