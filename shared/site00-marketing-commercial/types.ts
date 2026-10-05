/**
 * Marketing commercial pipeline — entitlements linked to real engagements & Studio World.
 */

import type { MarketingServiceCategory } from '../site00-marketing/types.js';
import type { GenerationEconomics } from '../site00-studio-world/modular-production-engine/monetization.js';
import type { OwnerScope } from '../site00-studio-world/modular-production-engine/operational/wardrobeDepartment.js';
import type { AddOnType } from '../site00-studio-world/modular-production-engine/operational/clientCommercial.js';

export type MarketingEntitlementTemplate = {
  entitlementTemplateId: string;
  marketingPlanId: string | null;
  serviceCategory: MarketingServiceCategory;
  characterAllowance: number;
  newActorAllowance: number;
  reskinAllowance: number;
  characterLookAllowance: number;
  setAllowance: number;
  setReskinAllowance: number;
  environmentAllowance: number;
  wardrobeAllowance: number;
  propAllowance: number;
  graphicAllowance: number;
  generationAllowance: number;
  resetCadence: 'MONTHLY';
  allowedAssetScopes: readonly OwnerScope[];
  overagePolicy: 'ADD_ON_REQUIRED';
};

export type ClientMarketingEntitlement = {
  entitlementId: string;
  clientId: string;
  marketingEngagementId: string;
  marketingPlanId: string | null;
  subscriptionOrOrderId: string | null;
  workspaceId: string;
  billingPeriod: string;
  entitlementTemplateId: string;
  template: MarketingEntitlementTemplate;
  usage: {
    charactersCreated: number;
    newActorsCreated: number;
    reskinsUsed: number;
    characterLooksCreated: number;
    setsCreated: number;
    setReskinsUsed: number;
    environmentsCreated: number;
    wardrobeCreated: number;
    propsCreated: number;
    graphicsCreated: number;
    sceneGenerations: number;
  };
  credits: Partial<Record<AddOnType, number>>;
  persistentInventoryNote: 'ALLOWANCES_RESET_MONTHLY_INVENTORY_PERSISTS';
  activatedAt: string;
};

export type EndClientBrand = {
  endClientBrandId: string;
  name: string;
  workspaceId: string;
  agencyClientId: string;
};

export type MarketingProjectCommercial = {
  marketingProjectId: string;
  marketingEngagementId: string;
  clientId: string;
  brandId: string;
  endClientBrandId: string | null;
  marketingPlanId: string | null;
  entitlementId: string;
  studioWorldProjectSlug: string | null;
  studioWorldCampaignId: string | null;
  projectScope: string;
  campaignGoals: string;
  internalProduction: boolean;
};

export type MarketingCommercialEventType =
  | 'ALLOWANCE_CONSUMED'
  | 'ADD_ON_REQUIRED'
  | 'ADD_ON_PURCHASED'
  | 'CREDIT_ADDED'
  | 'CREDIT_USED'
  | 'RESKIN_CREATED'
  | 'CUSTOMIZATION_CREATED'
  | 'NET_NEW_ASSET_CREATED'
  | 'EXCLUSIVITY_GRANTED';

export type MarketingCommercialEvent = {
  eventId: string;
  type: MarketingCommercialEventType;
  engagementId: string;
  marketingProjectId: string;
  studioWorldProjectSlug: string | null;
  campaignId: string | null;
  assetType: string;
  operationType: GenerationEconomics;
  assetId: string | null;
  entitlementId: string;
  billingPeriod: string;
  triggeredByUserAction: true;
  accidentalHallucination: false;
  createdAt: string;
};

export type InterruptedProductionAction = {
  actionType:
    | 'CREATE_CHARACTER'
    | 'CREATE_NEW_ACTOR'
    | 'RESKIN'
    | 'CUSTOMIZE'
    | 'NET_NEW_SET'
    | 'NET_NEW_ENVIRONMENT'
    | 'NET_NEW_WARDROBE'
    | 'GENERATE_SCENE';
  context: Record<string, string>;
};

export type ClientAllowanceSummary = {
  headline: 'YOUR CREATIVE INVENTORY';
  characters: { used: number; included: number; label: 'Characters' };
  characterReskins: { remaining: number; label: 'Character Reskins' };
  customSets: { remaining: number; label: 'Custom Sets' };
  newActorGenesis: { remaining: number; label: 'New Actor' };
  extraCharacterAddOnAvailable: boolean;
  pricingStatus: 'FOUNDER_PRICING_REQUIRED' | 'CONFIGURED';
};

export type MarketingEngagementCommercialState = {
  marketingProject: MarketingProjectCommercial;
  entitlement: ClientMarketingEntitlement;
  endClientBrand: EndClientBrand | null;
  interruptedAction: InterruptedProductionAction | null;
  events: readonly MarketingCommercialEvent[];
};
