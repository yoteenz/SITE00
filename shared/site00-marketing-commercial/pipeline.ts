/**
 * Marketing ↔ Studio World commercial pipeline (shared, testable).
 */

import type { MarketingEngagementRecord, MarketingIntakeRecord } from '../site00-marketing/types.js';
import { searchCatalogueBeforeNewActor } from '../site00-studio-world/modular-production-engine/operational/roleFirstCasting.js';
import type { CastingRequirement } from '../site00-studio-world/acting-catalogue/types.js';
import {
  checkEntitlementBeforeGenerativeAction,
  recordUsageLedgerEntry,
  type StudioWorldEntitlementPlan,
  type UsageLedgerEntry,
} from '../site00-studio-world/modular-production-engine/operational/clientCommercial.js';
import type { GenerationEconomics } from '../site00-studio-world/modular-production-engine/monetization.js';
import type { OwnerScope } from '../site00-studio-world/modular-production-engine/operational/wardrobeDepartment.js';
import { entitlementTemplateForService } from './entitlementTemplates.js';
import type {
  ClientAllowanceSummary,
  ClientMarketingEntitlement,
  EndClientBrand,
  InterruptedProductionAction,
  MarketingCommercialEvent,
  MarketingEngagementCommercialState,
  MarketingProjectCommercial,
} from './types.js';

export function billingPeriodFromDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function templateToStudioWorldPlan(template: ClientMarketingEntitlement['template']): StudioWorldEntitlementPlan {
  return {
    planId: template.entitlementTemplateId,
    label: template.serviceCategory,
    includedCharacters: template.characterAllowance,
    includedNewActors: template.newActorAllowance,
    includedActorReskins: template.reskinAllowance,
    includedCharacterLooks: template.characterLookAllowance,
    includedNewSets: template.setAllowance,
    includedSetReskins: template.setReskinAllowance,
    includedWardrobeCreations: template.wardrobeAllowance,
    includedEnvironmentCreations: template.environmentAllowance,
    includedCustomProps: template.propAllowance,
    includedCustomGraphics: template.graphicAllowance,
    includedSceneGenerations: template.generationAllowance,
    rolloverAllowed: false,
    monthlyReset: true,
  };
}

export function resolveEndClientBrandFromIntake(
  intake: MarketingIntakeRecord,
  agencyClientId: string,
  workspaceId: string,
): EndClientBrand | null {
  if (!intake.campaignForEndClient || !intake.endClientBrandName?.trim()) return null;
  return {
    endClientBrandId: `ecb-${slug(intake.endClientBrandName)}`,
    name: intake.endClientBrandName.trim(),
    workspaceId,
    agencyClientId,
  };
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'end-client';
}

export function activateClientMarketingEntitlement(args: {
  engagement: MarketingEngagementRecord;
  subscriptionOrOrderId?: string | null;
  now?: string;
}): ClientMarketingEntitlement {
  const now = args.now ?? new Date().toISOString();
  const template = entitlementTemplateForService(args.engagement.serviceCategory);
  const workspaceId = args.engagement.clientUserId ?? `ws-${args.engagement.clientEmail}`;
  return {
    entitlementId: `ent-${args.engagement.id}`,
    clientId: args.engagement.clientUserId ?? args.engagement.clientEmail,
    marketingEngagementId: args.engagement.id,
    marketingPlanId: template.marketingPlanId,
    subscriptionOrOrderId: args.subscriptionOrOrderId ?? args.engagement.id,
    workspaceId,
    billingPeriod: billingPeriodFromDate(now),
    entitlementTemplateId: template.entitlementTemplateId,
    template,
    usage: {
      charactersCreated: 0,
      newActorsCreated: 0,
      reskinsUsed: 0,
      characterLooksCreated: 0,
      setsCreated: 0,
      setReskinsUsed: 0,
      environmentsCreated: 0,
      wardrobeCreated: 0,
      propsCreated: 0,
      graphicsCreated: 0,
      sceneGenerations: 0,
    },
    credits: {},
    persistentInventoryNote: 'ALLOWANCES_RESET_MONTHLY_INVENTORY_PERSISTS',
    activatedAt: now,
  };
}

export function buildMarketingProjectCommercial(args: {
  engagement: MarketingEngagementRecord;
  entitlement: ClientMarketingEntitlement;
  endClientBrand: EndClientBrand | null;
  studioWorldCampaignId?: string | null;
  internalProduction?: boolean;
}): MarketingProjectCommercial {
  const intake = args.engagement.intake ?? {};
  return {
    marketingProjectId: `mkt-proj-${args.engagement.id}`,
    marketingEngagementId: args.engagement.id,
    clientId: args.entitlement.clientId,
    brandId: intake.existingProjectSlug ?? intake.businessName ?? args.engagement.engagementCode,
    endClientBrandId: args.endClientBrand?.endClientBrandId ?? null,
    marketingPlanId: args.entitlement.marketingPlanId,
    entitlementId: args.entitlement.entitlementId,
    studioWorldProjectSlug: intake.existingProjectSlug ?? null,
    studioWorldCampaignId: args.studioWorldCampaignId ?? args.engagement.studioWorldCampaignId ?? null,
    projectScope: intake.makingWhat ?? args.engagement.serviceCategory,
    campaignGoals: intake.campaignObjective ?? args.engagement.campaignName,
    internalProduction: args.internalProduction ?? false,
  };
}

export function initialCommercialState(args: {
  engagement: MarketingEngagementRecord;
  subscriptionOrOrderId?: string | null;
  studioWorldCampaignId?: string | null;
  internalProduction?: boolean;
}): MarketingEngagementCommercialState {
  const entitlement = activateClientMarketingEntitlement({
    engagement: args.engagement,
    subscriptionOrOrderId: args.subscriptionOrOrderId,
  });
  const endClientBrand = resolveEndClientBrandFromIntake(
    args.engagement.intake ?? {},
    entitlement.clientId,
    entitlement.workspaceId,
  );
  const marketingProject = buildMarketingProjectCommercial({
    engagement: args.engagement,
    entitlement,
    endClientBrand,
    studioWorldCampaignId: args.studioWorldCampaignId,
    internalProduction: args.internalProduction,
  });
  return {
    marketingProject,
    entitlement,
    endClientBrand,
    interruptedAction: null,
    events: [],
  };
}

export function attachStudioWorldHandoff(
  state: MarketingEngagementCommercialState,
  studioWorldCampaignId: string,
  studioWorldProjectSlug?: string | null,
): MarketingEngagementCommercialState {
  return {
    ...state,
    marketingProject: {
      ...state.marketingProject,
      studioWorldCampaignId,
      studioWorldProjectSlug: studioWorldProjectSlug ?? state.marketingProject.studioWorldProjectSlug,
    },
  };
}

function eventId(): string {
  return `mce-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildAllowanceSummary(state: MarketingEngagementCommercialState): ClientAllowanceSummary {
  const t = state.entitlement.template;
  const u = state.entitlement.usage;
  const charRemaining = Math.max(0, t.characterAllowance - u.charactersCreated);
  return {
    headline: 'YOUR CREATIVE INVENTORY',
    characters: { used: u.charactersCreated, included: t.characterAllowance, label: 'Characters' },
    characterReskins: { remaining: Math.max(0, t.reskinAllowance - u.reskinsUsed), label: 'Character Reskins' },
    customSets: { remaining: Math.max(0, t.setAllowance - u.setsCreated), label: 'Custom Sets' },
    newActorGenesis: {
      remaining: Math.max(0, t.newActorAllowance - u.newActorsCreated),
      label: 'New Actor',
    },
    extraCharacterAddOnAvailable: charRemaining === 0,
    pricingStatus: 'FOUNDER_PRICING_REQUIRED',
  };
}

export type ProductionActionKind =
  | 'USE_EXISTING'
  | 'CREATE_CHARACTER'
  | 'CREATE_NEW_ACTOR'
  | 'RESKIN'
  | 'CUSTOMIZE'
  | 'NET_NEW_SET'
  | 'NET_NEW_ENVIRONMENT'
  | 'NET_NEW_WARDROBE'
  | 'GENERATE_SCENE';

export type ProductionActionResult = {
  state: MarketingEngagementCommercialState;
  ledger: readonly UsageLedgerEntry[];
  checkMessage: string;
  blocked: boolean;
  addOnRequired: boolean;
  addOnType?: 'EXTRA_CHARACTER' | 'NEW_ACTOR';
};

export function classifyProductionOperation(kind: ProductionActionKind): GenerationEconomics {
  switch (kind) {
    case 'USE_EXISTING':
      return 'REUSE_EXISTING';
    case 'CREATE_CHARACTER':
      return 'GENERATE_NET_NEW';
    case 'CREATE_NEW_ACTOR':
      return 'GENERATE_NET_NEW';
    case 'RESKIN':
      return 'RESKIN_EXISTING';
    case 'CUSTOMIZE':
      return 'CUSTOMIZE_EXISTING';
    case 'NET_NEW_SET':
    case 'NET_NEW_ENVIRONMENT':
    case 'NET_NEW_WARDROBE':
      return 'GENERATE_NET_NEW';
    case 'GENERATE_SCENE':
      return 'GENERATE_NET_NEW';
    default:
      return 'REUSE_EXISTING';
  }
}

export function assetScopeForEndClient(
  state: MarketingEngagementCommercialState,
  base: OwnerScope = 'CLIENT_PRIVATE',
): OwnerScope {
  if (state.endClientBrand) return 'END_CLIENT_PRIVATE';
  return base;
}

export function runProductionAction(args: {
  state: MarketingEngagementCommercialState;
  kind: ProductionActionKind;
  ledger: readonly UsageLedgerEntry[];
  assetId?: string | null;
  castingRequirement?: CastingRequirement;
}): ProductionActionResult {
  const { state, kind } = args;
  let ledger = args.ledger;
  const plan = templateToStudioWorldPlan(state.entitlement.template);
  const workspace = {
    workspaceId: state.entitlement.workspaceId,
    clientId: state.entitlement.clientId,
    label: state.marketingProject.brandId,
    internalStudioWorld: state.marketingProject.internalProduction,
  };

  if (kind === 'USE_EXISTING') {
    const check = checkEntitlementBeforeGenerativeAction({
      plan,
      usedCharactersThisPeriod: state.entitlement.usage.charactersCreated,
      usedNewActorsThisPeriod: state.entitlement.usage.newActorsCreated,
      operation: 'REUSE_EXISTING',
      isNewActorGenesis: false,
      isNewCharacterOnExistingActor: false,
      workspace,
    });
    return {
      state,
      ledger,
      checkMessage: check.message,
      blocked: false,
      addOnRequired: false,
    };
  }

  const operation = classifyProductionOperation(kind);
  const isNewActor = kind === 'CREATE_NEW_ACTOR';
  const isNewCharacter = kind === 'CREATE_CHARACTER';

  const check = checkEntitlementBeforeGenerativeAction({
    plan,
    usedCharactersThisPeriod: state.entitlement.usage.charactersCreated,
    usedNewActorsThisPeriod: state.entitlement.usage.newActorsCreated,
    operation,
    isNewActorGenesis: isNewActor,
    isNewCharacterOnExistingActor: isNewCharacter,
    workspace,
  });

  if (check.requiresAddOn && !state.marketingProject.internalProduction) {
    const interrupted: InterruptedProductionAction = {
      actionType: isNewActor ? 'CREATE_NEW_ACTOR' : 'CREATE_CHARACTER',
      context: { kind, assetId: args.assetId ?? '' },
    };
    const evt: MarketingCommercialEvent = {
      eventId: eventId(),
      type: 'ADD_ON_REQUIRED',
      engagementId: state.marketingProject.marketingEngagementId,
      marketingProjectId: state.marketingProject.marketingProjectId,
      studioWorldProjectSlug: state.marketingProject.studioWorldProjectSlug,
      campaignId: state.marketingProject.studioWorldCampaignId,
      assetType: isNewActor ? 'ACTOR' : 'CHARACTER',
      operationType: operation,
      assetId: args.assetId ?? null,
      entitlementId: state.entitlement.entitlementId,
      billingPeriod: state.entitlement.billingPeriod,
      triggeredByUserAction: true,
      accidentalHallucination: false,
      createdAt: new Date().toISOString(),
    };
    return {
      state: { ...state, interruptedAction: interrupted, events: [...state.events, evt] },
      ledger,
      checkMessage: check.message,
      blocked: true,
      addOnRequired: true,
      addOnType: isNewActor ? 'NEW_ACTOR' : 'EXTRA_CHARACTER',
    };
  }

  let usage = { ...state.entitlement.usage };
  let eventType: MarketingCommercialEvent['type'] = 'ALLOWANCE_CONSUMED';

  if (kind === 'CREATE_CHARACTER' && check.consumesAllowance) {
    usage.charactersCreated += 1;
    eventType = 'NET_NEW_ASSET_CREATED';
  } else if (kind === 'CREATE_NEW_ACTOR' && check.consumesAllowance) {
    usage.newActorsCreated += 1;
    eventType = 'NET_NEW_ASSET_CREATED';
  } else if (kind === 'RESKIN') {
    usage.reskinsUsed += 1;
    eventType = 'RESKIN_CREATED';
  } else if (kind === 'CUSTOMIZE') {
    eventType = 'CUSTOMIZATION_CREATED';
  } else if (kind === 'NET_NEW_SET') {
    usage.setsCreated += 1;
    eventType = 'NET_NEW_ASSET_CREATED';
  } else if (kind === 'NET_NEW_ENVIRONMENT') {
    usage.environmentsCreated += 1;
    eventType = 'NET_NEW_ASSET_CREATED';
  } else if (kind === 'NET_NEW_WARDROBE') {
    usage.wardrobeCreated += 1;
    eventType = 'NET_NEW_ASSET_CREATED';
  } else if (kind === 'GENERATE_SCENE') {
    usage.sceneGenerations += 1;
    eventType = 'ALLOWANCE_CONSUMED';
  }

  const ledgerEntry: UsageLedgerEntry = {
    ledgerId: eventId(),
    workspaceId: state.entitlement.workspaceId,
    clientId: state.entitlement.clientId,
    brandId: state.marketingProject.brandId,
    endClientId: state.endClientBrand?.endClientBrandId ?? null,
    billingPeriod: state.entitlement.billingPeriod,
    assetType: kind,
    operationType: operation,
    assetId: args.assetId ?? null,
    campaignId: state.marketingProject.studioWorldCampaignId ?? state.marketingProject.marketingProjectId,
    quantity: 1,
    includedAllowanceUsed: check.consumesAllowance ? 1 : 0,
    overage: 0,
    billable: check.consumesAllowance,
    accidentalHallucination: false,
    createdAt: new Date().toISOString(),
  };
  ledger = recordUsageLedgerEntry(ledger, ledgerEntry);

  const evt: MarketingCommercialEvent = {
    eventId: eventId(),
    type: eventType,
    engagementId: state.marketingProject.marketingEngagementId,
    marketingProjectId: state.marketingProject.marketingProjectId,
    studioWorldProjectSlug: state.marketingProject.studioWorldProjectSlug,
    campaignId: state.marketingProject.studioWorldCampaignId,
    assetType: kind,
    operationType: operation,
    assetId: args.assetId ?? null,
    entitlementId: state.entitlement.entitlementId,
    billingPeriod: state.entitlement.billingPeriod,
    triggeredByUserAction: true,
    accidentalHallucination: false,
    createdAt: new Date().toISOString(),
  };

  const nextState: MarketingEngagementCommercialState = {
    ...state,
    entitlement: { ...state.entitlement, usage },
    interruptedAction: null,
    events: [...state.events, evt],
  };

  return {
    state: nextState,
    ledger,
    checkMessage: check.message,
    blocked: false,
    addOnRequired: false,
  };
}

export function applyTestAddOnCredit(
  state: MarketingEngagementCommercialState,
  addOnType: 'EXTRA_CHARACTER' | 'NEW_ACTOR',
): MarketingEngagementCommercialState {
  const credits = { ...state.entitlement.credits };
  credits[addOnType] = (credits[addOnType] ?? 0) + 1;
  const evt: MarketingCommercialEvent = {
    eventId: eventId(),
    type: 'CREDIT_ADDED',
    engagementId: state.marketingProject.marketingEngagementId,
    marketingProjectId: state.marketingProject.marketingProjectId,
    studioWorldProjectSlug: state.marketingProject.studioWorldProjectSlug,
    campaignId: state.marketingProject.studioWorldCampaignId,
    assetType: addOnType,
    operationType: 'GENERATE_NET_NEW',
    assetId: null,
    entitlementId: state.entitlement.entitlementId,
    billingPeriod: state.entitlement.billingPeriod,
    triggeredByUserAction: true,
    accidentalHallucination: false,
    createdAt: new Date().toISOString(),
  };
  return {
    ...state,
    entitlement: { ...state.entitlement, credits },
    events: [...state.events, evt],
  };
}

/** Consume one credit and bump allowance bucket so interrupted casting can proceed. */
export function consumeAddOnCreditAndResume(
  state: MarketingEngagementCommercialState,
  addOnType: 'EXTRA_CHARACTER' | 'NEW_ACTOR',
): MarketingEngagementCommercialState {
  const available = state.entitlement.credits[addOnType] ?? 0;
  if (available < 1) return state;

  const credits = { ...state.entitlement.credits, [addOnType]: available - 1 };
  const template = state.entitlement.template;

  const purchased: MarketingCommercialEvent = {
    eventId: eventId(),
    type: 'ADD_ON_PURCHASED',
    engagementId: state.marketingProject.marketingEngagementId,
    marketingProjectId: state.marketingProject.marketingProjectId,
    studioWorldProjectSlug: state.marketingProject.studioWorldProjectSlug,
    campaignId: state.marketingProject.studioWorldCampaignId,
    assetType: addOnType,
    operationType: 'GENERATE_NET_NEW',
    assetId: null,
    entitlementId: state.entitlement.entitlementId,
    billingPeriod: state.entitlement.billingPeriod,
    triggeredByUserAction: true,
    accidentalHallucination: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    entitlement: {
      ...state.entitlement,
      credits,
      template: {
        ...template,
        characterAllowance:
          addOnType === 'EXTRA_CHARACTER' ? template.characterAllowance + 1 : template.characterAllowance,
        newActorAllowance:
          addOnType === 'NEW_ACTOR' ? template.newActorAllowance + 1 : template.newActorAllowance,
      },
    },
    events: [...state.events, purchased],
  };
}

export function resumeInterruptedProductionAction(args: {
  state: MarketingEngagementCommercialState;
  ledger: readonly UsageLedgerEntry[];
}): ProductionActionResult | null {
  const interrupted = args.state.interruptedAction;
  if (!interrupted) return null;
  const kind: ProductionActionKind =
    interrupted.actionType === 'CREATE_NEW_ACTOR' ? 'CREATE_NEW_ACTOR' : 'CREATE_CHARACTER';
  return runProductionAction({
    state: args.state,
    kind,
    ledger: args.ledger,
    assetId: interrupted.context.assetId ?? null,
  });
}

export function narrativeToCastingCataloguePath(args: {
  requirement: CastingRequirement;
  projectId: string;
  brand: string;
  creativeTerritory: string;
}): { searchOutcome: string; createNewActorAllowed: boolean } {
  const search = searchCatalogueBeforeNewActor({
    requirement: args.requirement,
    projectId: args.projectId,
    brand: args.brand,
    creativeTerritory: args.creativeTerritory,
  });
  return {
    searchOutcome: search.outcome,
    createNewActorAllowed: search.createNewActorAllowed,
  };
}

export function resetMonthlyAllowancesKeepInventory(
  state: MarketingEngagementCommercialState,
  newPeriod: string,
): MarketingEngagementCommercialState {
  return {
    ...state,
    entitlement: {
      ...state.entitlement,
      billingPeriod: newPeriod,
      usage: {
        charactersCreated: 0,
        newActorsCreated: 0,
        reskinsUsed: 0,
        characterLooksCreated: 0,
        setsCreated: 0,
        setReskinsUsed: 0,
        environmentsCreated: 0,
        wardrobeCreated: 0,
        propsCreated: 0,
        graphicsCreated: 0,
        sceneGenerations: 0,
      },
    },
  };
}
