/**
 * Operational CastingRequirement — extends acting-catalogue with narrative-first fields.
 */

import type { CastingRequirement as LegacyCastingRequirement } from '../../acting-catalogue/types.js';
import type { ScreenImportance } from '../../acting-catalogue/types.js';

export const CASTING_REQUIREMENT_STATUSES = [
  'DRAFT',
  'READY_FOR_SEARCH',
  'SHORTLIST_REVIEW',
  'CAST_LOCKED',
  'NEW_ACTOR_APPROVED',
  'SUPERSEDED',
] as const;

export type CastingRequirementStatus = (typeof CASTING_REQUIREMENT_STATUSES)[number];

export type OperationalCastingRequirement = {
  requirementId: string;
  projectId: string;
  campaignId: string;
  entryId: string;
  narrativeRole: string;
  storyFunction: string;
  screenImportance: ScreenImportance;
  agePresentation: string;
  presentation: 'WOMAN' | 'MAN' | 'NONBINARY' | 'ANY';
  performanceEnergy: string;
  personalityNeeds: readonly string[];
  emotionalRangeNeeds: readonly string[];
  movementNeeds: readonly string[];
  eraRequirements: readonly string[];
  wardrobeContext: string;
  hairContext: string;
  makeupContext: string;
  culturalContext: string;
  continuityRequirements: string;
  referenceAssets: readonly string[];
  status: CastingRequirementStatus;
};

export function upgradeLegacyCastingRequirement(
  legacy: LegacyCastingRequirement,
  ctx: { projectId: string; campaignId: string; entryId: string },
): OperationalCastingRequirement {
  return {
    requirementId: legacy.requirementId,
    projectId: ctx.projectId,
    campaignId: ctx.campaignId,
    entryId: ctx.entryId,
    narrativeRole: legacy.narrativeRole,
    storyFunction: legacy.storyFunction,
    screenImportance: legacy.screenImportance,
    agePresentation: legacy.approximateAgePresentation,
    presentation: legacy.suggestedPresentation ?? 'ANY',
    performanceEnergy: legacy.performanceEnergy,
    personalityNeeds: [legacy.performanceEnergy],
    emotionalRangeNeeds: [],
    movementNeeds: [],
    eraRequirements: legacy.era ? [legacy.era] : [],
    wardrobeContext: legacy.wardrobeContext,
    hairContext: '',
    makeupContext: '',
    culturalContext: legacy.presentationRequirements,
    continuityRequirements: legacy.requiredContinuity,
    referenceAssets: [],
    status: 'READY_FOR_SEARCH',
  };
}
