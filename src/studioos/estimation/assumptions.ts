import type { BuildLevel, FamilyClass, ResponsiveMode, VisualComplexity } from './types';
import { ESTIMATOR_VERSION } from './version';

export type DescendantBand = {
  max: number;
  fu: number;
  customScopeRequired?: boolean;
};

export type EstimatorAssumptions = {
  estimatorVersion: string;
  familyUnitWeeks: number;
  standardLanes: number;
  priorityLanes: number;
  serialShare: number;
  parallelShare: number;
  clientReviewSlaDays: number;
  defaultReviewRounds: number;
  reviewMilestones: number;
  priorityPriceMultiplier: number;
  priorityPriceMultiplierMin: number;
  priorityPriceMultiplierMax: number;
  dollarsPerFamilyUnit: number;
  buildFloors: Record<BuildLevel, number>;
  includedFamilyUnits: Record<BuildLevel, number>;
  optionDHybridAddition: number;
  classWeights: Record<FamilyClass, number>;
  descendantBands: DescendantBand[];
  responsiveFraction: Record<ResponsiveMode, number>;
  visualFraction: Record<VisualComplexity, number>;
  confidenceSpread: Record<'EARLY' | 'BLUEPRINT' | 'LOCKED', { low: number; high: number }>;
  riskWidenHigh: number;
  riskWidenLow: number;
  riskWidenCap: number;
  phaseFloors: {
    inception: number;
    blueprint: number;
    finalQa: number;
    launch: number;
    integrationBase: number;
    integrationHeavy: number;
  };
  worldWeights: {
    zone: number;
    scene: number;
    interaction: number;
    state: number;
    inhabitant: Record<'NONE' | 'LIGHT' | 'STANDARD' | 'HEAVY', number>;
    threeD: Record<'NONE' | 'LIGHT' | 'STANDARD' | 'HEAVY', number>;
    navigation: Record<'SIMPLE' | 'STANDARD' | 'ADVANCED', number>;
    calibrationNeeded: true;
  };
};

export const DEFAULT_ASSUMPTIONS: EstimatorAssumptions = {
  estimatorVersion: ESTIMATOR_VERSION,
  familyUnitWeeks: 2,
  standardLanes: 2,
  priorityLanes: 4,
  serialShare: 0.22,
  parallelShare: 0.78,
  clientReviewSlaDays: 2,
  defaultReviewRounds: 2,
  reviewMilestones: 2,
  priorityPriceMultiplier: 1.85,
  priorityPriceMultiplierMin: 1.75,
  priorityPriceMultiplierMax: 2,
  dollarsPerFamilyUnit: 1800,
  buildFloors: { SIMPLE: 3000, ADVANCED: 6000, CUSTOM: 10000 },
  includedFamilyUnits: { SIMPLE: 2, ADVANCED: 5, CUSTOM: 8 },
  optionDHybridAddition: 2500,
  classWeights: {
    LIGHT: 1,
    STANDARD: 1.5,
    ADVANCED: 2,
    SYSTEM: 2.75,
    WORLD: 3.5,
  },
  descendantBands: [
    { max: 5, fu: 0 },
    { max: 10, fu: 0.25 },
    { max: 20, fu: 0.5 },
    { max: 35, fu: 1 },
    { max: Number.POSITIVE_INFINITY, fu: 1.5, customScopeRequired: true },
  ],
  responsiveFraction: {
    MOBILE_ONLY: 0,
    MOBILE_DESKTOP: 0.08,
    MOBILE_TABLET_DESKTOP: 0.15,
    MULTI_VIEWPORT_ADVANCED: 0.25,
    SPATIAL_RESPONSIVE: 0.35,
  },
  visualFraction: {
    TEMPLATE_LED: 0,
    CUSTOMIZED_TEMPLATE: 0.08,
    BESPOKE_EDITORIAL: 0.18,
    CINEMATIC: 0.28,
    GENERATIVE_ASSET_HEAVY: 0.4,
    SPATIAL_WORLD: 0.5,
  },
  confidenceSpread: {
    EARLY: { low: 0.78, high: 1.32 },
    BLUEPRINT: { low: 0.9, high: 1.15 },
    LOCKED: { low: 0.96, high: 1.06 },
  },
  riskWidenHigh: 0.06,
  riskWidenLow: 0.01,
  riskWidenCap: 0.4,
  phaseFloors: {
    inception: 0.4,
    blueprint: 0.8,
    finalQa: 0.5,
    launch: 0.3,
    integrationBase: 0.25,
    integrationHeavy: 0.8,
  },
  worldWeights: {
    zone: 0.35,
    scene: 0.2,
    interaction: 0.15,
    state: 0.1,
    inhabitant: { NONE: 0, LIGHT: 0.2, STANDARD: 0.5, HEAVY: 1 },
    threeD: { NONE: 0, LIGHT: 0.4, STANDARD: 0.8, HEAVY: 1.5 },
    navigation: { SIMPLE: 0.2, STANDARD: 0.5, ADVANCED: 1 },
    calibrationNeeded: true,
  },
};
