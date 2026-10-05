/**
 * Client workspaces, entitlements, usage ledger, cost preview, client-of-client.
 */

import type { GenerationEconomics } from '../monetization.js';
import type { OwnerScope } from './wardrobeDepartment.js';

export type ClientWorkspace = {
  workspaceId: string;
  clientId: string;
  label: string;
  internalStudioWorld: boolean;
};

export type ClientBrand = {
  brandId: string;
  workspaceId: string;
  name: string;
};

export type EndClientBrand = {
  endClientId: string;
  workspaceId: string;
  agencyClientId: string;
  name: string;
};

export type StudioWorldEntitlementPlan = {
  planId: string;
  label: string;
  includedNewActors: number;
  includedCharacters: number;
  includedActorReskins: number;
  includedCharacterLooks: number;
  includedNewSets: number;
  includedSetReskins: number;
  includedWardrobeCreations: number;
  includedEnvironmentCreations: number;
  includedCustomProps: number;
  includedCustomGraphics: number;
  includedSceneGenerations: number;
  rolloverAllowed: boolean;
  monthlyReset: true;
};

export type CommercialOperationType = GenerationEconomics;

export type UsageLedgerEntry = {
  ledgerId: string;
  workspaceId: string;
  clientId: string;
  brandId: string;
  endClientId: string | null;
  billingPeriod: string;
  assetType: string;
  operationType: CommercialOperationType;
  assetId: string | null;
  campaignId: string;
  quantity: number;
  includedAllowanceUsed: number;
  overage: number;
  billable: boolean;
  accidentalHallucination: false;
  createdAt: string;
};

export type EntitlementCheckResult = {
  allowed: boolean;
  consumesAllowance: boolean;
  requiresAddOn: boolean;
  message: string;
  surchargeKind: 'NEW_ACTOR_GENESIS' | 'NEW_CHARACTER' | 'NONE';
};

export type CostPreview = {
  operation: CommercialOperationType;
  classification: 'INCLUDED' | 'SHARED' | 'PRIVATE' | 'PREMIUM' | 'NEW_CREATION';
  consumes: 'ALLOWANCE' | 'ADD_ON' | 'INTERNAL_CREDIT';
  actorGenesisFeeApplies: boolean;
};

export const ADD_ON_TYPES = [
  'EXTRA_CHARACTER',
  'NEW_ACTOR',
  'ACTOR_RESKIN',
  'NEW_CHARACTER_LOOK',
  'NEW_WARDROBE_ITEM',
  'CUSTOM_WARDROBE_PACK',
  'NEW_SET',
  'SET_RESKIN',
  'NEW_ENVIRONMENT',
  'CUSTOM_PROP',
  'CUSTOM_GRAPHIC',
  'PRIVATE_ACTOR',
  'EXCLUSIVE_ACTOR',
  'PRIVATE_SET',
  'EXCLUSIVE_SET',
  'EXTRA_GENERATION_PACK',
] as const;

export type AddOnType = (typeof ADD_ON_TYPES)[number];

export function checkEntitlementBeforeGenerativeAction(args: {
  plan: StudioWorldEntitlementPlan;
  usedCharactersThisPeriod: number;
  usedNewActorsThisPeriod: number;
  operation: CommercialOperationType;
  isNewActorGenesis: boolean;
  isNewCharacterOnExistingActor: boolean;
  workspace: ClientWorkspace;
}): EntitlementCheckResult {
  if (args.workspace.internalStudioWorld) {
    return {
      allowed: true,
      consumesAllowance: false,
      requiresAddOn: false,
      message: 'Internal production — client allowances not applied',
      surchargeKind: 'NONE',
    };
  }
  if (args.isNewActorGenesis) {
    if (args.usedNewActorsThisPeriod < args.plan.includedNewActors) {
      return {
        allowed: true,
        consumesAllowance: true,
        requiresAddOn: false,
        message: 'Consumes included new Actor allowance',
        surchargeKind: 'NEW_ACTOR_GENESIS',
      };
    }
    return {
      allowed: true,
      consumesAllowance: false,
      requiresAddOn: true,
      message: 'ADDITIONAL CREATION REQUIRED — Actor genesis fee',
      surchargeKind: 'NEW_ACTOR_GENESIS',
    };
  }
  if (args.isNewCharacterOnExistingActor) {
    if (args.usedCharactersThisPeriod < args.plan.includedCharacters) {
      return {
        allowed: true,
        consumesAllowance: true,
        requiresAddOn: false,
        message: 'New Character on existing Actor — character allowance',
        surchargeKind: 'NEW_CHARACTER',
      };
    }
    return {
      allowed: true,
      consumesAllowance: false,
      requiresAddOn: true,
      message: 'ADDITIONAL CREATION REQUIRED — extra character',
      surchargeKind: 'NEW_CHARACTER',
    };
  }
  if (args.operation === 'REUSE_EXISTING') {
    return {
      allowed: true,
      consumesAllowance: false,
      requiresAddOn: false,
      message: 'Reuse — lowest cost tier',
      surchargeKind: 'NONE',
    };
  }
  return {
    allowed: true,
    consumesAllowance: false,
    requiresAddOn: args.operation === 'GENERATE_NET_NEW',
    message: 'Operation classified for billing',
    surchargeKind: 'NONE',
  };
}

export function buildCostPreview(args: {
  operation: CommercialOperationType;
  scope: OwnerScope;
  newActorGenesis: boolean;
  internal: boolean;
}): CostPreview {
  return {
    operation: args.operation,
    classification:
      args.scope === 'STUDIO_WORLD_SHARED' ? 'SHARED'
      : args.scope === 'CLIENT_EXCLUSIVE' ? 'PREMIUM'
      : args.scope === 'CLIENT_PRIVATE' ? 'PRIVATE'
      : args.newActorGenesis ? 'NEW_CREATION'
      : 'INCLUDED',
    consumes: args.internal ? 'INTERNAL_CREDIT' : args.operation === 'REUSE_EXISTING' ? 'ALLOWANCE' : 'ADD_ON',
    actorGenesisFeeApplies: args.newActorGenesis,
  };
}

export function workspaceMayUseAsset(
  workspaceId: string,
  assetOwnerScope: OwnerScope,
  assetWorkspaceId: string | null,
): boolean {
  if (assetOwnerScope === 'STUDIO_WORLD_SHARED' || assetOwnerScope === 'INTERNAL') return true;
  if (assetOwnerScope === 'CLIENT_PRIVATE' || assetOwnerScope === 'CLIENT_EXCLUSIVE') {
    return assetWorkspaceId === workspaceId;
  }
  return false;
}

export function recordUsageLedgerEntry(
  entries: readonly UsageLedgerEntry[],
  next: UsageLedgerEntry,
): UsageLedgerEntry[] {
  if (next.accidentalHallucination) {
    throw new Error('Hallucination must not create billable ledger entries');
  }
  return [...entries, next];
}
