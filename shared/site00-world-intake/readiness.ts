/**
 * World Formation readiness evaluation — no world generation.
 */

import type { GuestIntakeSession, WorldFormationReadiness } from './types.js';
import type { WorldFormationReadinessState } from './constants.js';
import { WORLD_READINESS_PROFILE_VERSION } from './constants.js';

export function evaluateWorldFormationReadiness(session: GuestIntakeSession): WorldFormationReadiness {
  const syn = session.synthesized;
  const raw = session.rawAnswers;

  const domains: Record<string, boolean> = {
    BUSINESS_MODEL_READY: Boolean(syn.businessIntelligence?.businessModel || raw['business-model']?.value),
    OFFERINGS_READY: Boolean(syn.offeringMap?.offerings?.length),
    BRAND_LORE_READY: Boolean(syn.brandLore && Object.keys(syn.brandLore).length > 0),
    PERSONALITY_READY: Boolean(syn.personality && Object.keys(syn.personality).length > 0),
    EXPRESSION_CONTEXT_KNOWN: Boolean(syn.expressionContext || raw['expression-context']?.value),
    CREATIVE_APPETITE_READY_OR_DECLINED: Boolean(
      (syn.creativeAppetite && Object.keys(syn.creativeAppetite).length > 0) || raw['creative-risk'],
    ),
    WORLD_ENTRY_INTENT_KNOWN: Boolean(syn.worldReadiness?.entryExperience || raw['entry-experience']?.value),
    NAVIGATION_INTENT_KNOWN: Boolean(syn.worldReadiness?.navigationPhilosophy || raw['navigation-philosophy']?.value),
    COMMERCE_MODEL_KNOWN: Boolean(syn.worldReadiness?.commerceFeel || raw['commerce-feel']?.value),
    CUSTOMER_IDENTITY_INTENT_KNOWN: Boolean(syn.worldReadiness?.customerIdentityIntent || raw['customer-identity']?.value),
    FOUNDER_PRESENCE_INTENT_KNOWN: Boolean(syn.worldReadiness?.founderPresenceIntent || raw['founder-presence']?.value),
    PERSISTENCE_INTENT_KNOWN: Boolean(
      (syn.worldReadiness?.persistenceIntent?.length ?? 0) > 0 || raw['persistence-intent']?.value,
    ),
    HARD_BOUNDARIES_KNOWN: Boolean(syn.worldReadiness?.hardBoundariesVerbatim || raw['hard-boundaries']?.value),
  };

  const readyCount = Object.values(domains).filter(Boolean).length;
  const total = Object.keys(domains).length;

  let state: WorldFormationReadinessState = 'WORLD_INTAKE_INCOMPLETE';
  if (readyCount >= total) state = 'WORLD_FORMATION_READY';
  else if (readyCount >= Math.ceil(total * 0.6)) state = 'WORLD_INTAKE_PARTIAL';

  const blockers = Object.entries(domains)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  return {
    state,
    domains,
    blockers,
    evaluatedAt: new Date().toISOString(),
  };
}

export function worldReadinessFromAnswers(raw: Record<string, { value?: unknown; verbatim?: string | null }>): import('./types.js').WorldReadinessProfile {
  const str = (id: string) => {
    const v = raw[id]?.value ?? raw[id]?.verbatim;
    return typeof v === 'string' ? v : v != null ? String(v) : null;
  };

  const gamingMap: Record<string, 'NONE' | 'LIGHT' | 'MODERATE' | 'DEEP' | 'UNRESOLVED'> = {
    none: 'NONE',
    light: 'LIGHT',
    moderate: 'MODERATE',
    deep: 'DEEP',
    undecided: 'UNRESOLVED',
  };

  const gamingId = typeof raw['gaming-depth']?.value === 'string' ? raw['gaming-depth'].value : 'undecided';

  return {
    version: WORLD_READINESS_PROFILE_VERSION,
    entryExperience: str('entry-experience'),
    spatialExpectation: typeof raw['spatial-expectation']?.value === 'string' ? raw['spatial-expectation'].value : null,
    spatialExamples: str('spatial-examples'),
    customerIdentityIntent: typeof raw['customer-identity']?.value === 'string' ? raw['customer-identity'].value : null,
    avatarCustomizationDomains: str('avatar-customization')?.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) ?? [],
    founderPresenceIntent: typeof raw['founder-presence']?.value === 'string' ? raw['founder-presence'].value : null,
    aiRepresentation: str('ai-representation')
      ? {
          role: str('ai-representation'),
          behavior: null,
          allowedInteractions: null,
          liveVsPrerecorded: null,
          tone: null,
          boundaries: null,
          mustNeverDo: null,
        }
      : null,
    liveInteraction: str('live-interaction'),
    commerceFeel: str('commerce-feel'),
    commerceRequirements: null,
    navigationPhilosophy: str('navigation-philosophy'),
    persistenceIntent: str('persistence-intent')?.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) ?? [],
    socialPresence: str('social-presence'),
    contentCreationIntent: str('content-creation')?.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) ?? [],
    realismFantasyBand: str('realism-fantasy'),
    styleExplorationBands: [],
    gamingDepth: gamingMap[gamingId] ?? 'UNRESOLVED',
    gameMechanicsInterest: [],
    hardBoundariesVerbatim: str('hard-boundaries'),
    founderWorldHypothesis: str('founder-world-hypothesis'),
    founderWorldHypothesisClassification: 'FOUNDER_PROPOSED_CONCEPT',
    extractedAt: new Date().toISOString(),
  };
}

export function businessIntelligenceFromAnswers(raw: Record<string, { value?: unknown }>): import('./types.js').BusinessIntelligence {
  const str = (id: string) => {
    const v = raw[id]?.value;
    return typeof v === 'string' ? v : v != null ? String(v) : null;
  };
  return {
    businessModel: str('business-model'),
    revenueSources: str('revenue-sources')?.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) ?? [],
    productsSummary: null,
    servicesSummary: str('offerings-primary'),
    appointmentsBookings: str('offerings-live'),
    liveServices: str('offerings-live'),
    digitalProducts: null,
    physicalProducts: null,
    memberships: null,
    events: null,
    content: null,
    customerSupport: null,
    fulfillment: null,
    payments: null,
    locationDependence: null,
    operationalConstraints: str('operational-constraints'),
  };
}

export function expressionContextFromAnswer(raw: Record<string, { value?: unknown }>): string | null {
  const v = raw['expression-context']?.value;
  if (typeof v !== 'string') return null;
  const map: Record<string, string> = {
    ecommerce: 'ECOMMERCE_FIRST',
    service: 'SERVICE_FIRST',
    social: 'SOCIAL_FIRST',
    content: 'CONTENT_FIRST',
    experience: 'EXPERIENCE_FIRST',
    world: 'WORLD_FIRST',
    hybrid: 'HYBRID',
  };
  return map[v] ?? v.toUpperCase();
}
