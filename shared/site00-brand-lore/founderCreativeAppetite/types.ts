/**
 * Founder Creative Appetite — canonical profile model.
 * Measures acceptable RANGE of creative exploration — not visual style choices.
 */

import type { BrandLoreField } from '../types.js';
import type {
  AppetiteDomainId,
  CreativeAppetiteAvailability,
  ToleranceBand,
} from './constants.js';

export type CreativeAppetiteTolerance = {
  domain: AppetiteDomainId;
  band: ToleranceBand;
  rationale: string;
  sourceAnswerIds: string[];
};

export type CreativeAppetiteExperimentExclusion = {
  excludedFromExperimentId: string;
  excludedReason: string;
  availableFromCanonVersion: number;
  capturedAt: string;
  availability: CreativeAppetiteAvailability;
};

export type FounderCreativeAppetiteProfile = {
  id: string;
  organizationId: string | null;
  projectId: string | null;
  profileVersion: string;
  creativeRiskTolerance: BrandLoreField<ToleranceBand | null>;
  abstractionTolerance: BrandLoreField<ToleranceBand | null>;
  visualExperimentationTolerance: BrandLoreField<ToleranceBand | null>;
  culturalSpecificityTolerance: BrandLoreField<ToleranceBand | null>;
  witRiskTolerance: BrandLoreField<ToleranceBand | null>;
  polarizationTolerance: BrandLoreField<ToleranceBand | null>;
  rawnessTolerance: BrandLoreField<ToleranceBand | null>;
  densityTolerance: BrandLoreField<ToleranceBand | null>;
  formatExperimentationTolerance: BrandLoreField<ToleranceBand | null>;
  surprisePreference: BrandLoreField<ToleranceBand | null>;
  creativeDirectorLatitude: BrandLoreField<ToleranceBand | null>;
  hardCreativeBoundaries: BrandLoreField<string | null>;
  domainTolerances: CreativeAppetiteTolerance[];
  rawAnswers: Record<string, string | string[]>;
  founderConfirmationState: 'PENDING' | 'CONFIRMED' | 'NOT_APPLICABLE';
  experimentExclusions: CreativeAppetiteExperimentExclusion[];
  capturedAt: string;
  updatedAt: string;
};

export type CreativeAppetiteAvailabilityRecord = {
  availability: CreativeAppetiteAvailability;
  excludedFromExperimentId: string | null;
  excludedReason: string | null;
  availableFromCanonVersion: number;
  capturedAt: string | null;
};
