/**
 * Production orchestration policy scaffold — metadata for future P1 orchestration.
 */

import { P0_5A_METHODOLOGY_VERSION } from './constants.js';
import type { ProjectProductionDiscipline } from './siteProductionTypes.js';

export const PRODUCTION_ORCHESTRATION_ACTORS = [
  'DETERMINISTIC_CODE',
  'ANTHROPIC',
  'VISION',
  'IMAGE_GENERATOR',
  'COMPOSER',
  'FOUNDER',
  'CLIENT',
  'HYBRID',
] as const;

export type ProductionOrchestrationActor = (typeof PRODUCTION_ORCHESTRATION_ACTORS)[number];

export const PRODUCTION_TRIGGER_MODES = [
  'AUTOMATIC',
  'FOUNDER_TRIGGERED',
  'CLIENT_TRIGGERED',
  'SYSTEM_CONDITION',
  'MANUAL_INTERNAL',
] as const;

export type ProductionTriggerMode = (typeof PRODUCTION_TRIGGER_MODES)[number];

export const PRODUCTION_COST_CLASSES = ['FREE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export type ProductionCostClass = (typeof PRODUCTION_COST_CLASSES)[number];

export type ProductionOrchestrationPolicy = {
  stage: string;
  discipline: ProjectProductionDiscipline;
  actor: ProductionOrchestrationActor;
  triggerMode: ProductionTriggerMode;
  costClass: ProductionCostClass;
  parallelizationPolicy: 'SEQUENTIAL' | 'PARALLEL_ALLOWED' | 'PARALLEL_BLOCKED';
  requiredGates: string[];
  produces: string[];
  invalidates: string[];
  liveVerificationRequired: boolean;
  founderApprovalRequired: boolean;
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
};

export const SITE_PRODUCTION_ORCHESTRATION_POLICIES: ProductionOrchestrationPolicy[] = [
  {
    stage: 'SITE_STRATEGY',
    discipline: 'SITE',
    actor: 'DETERMINISTIC_CODE',
    triggerMode: 'AUTOMATIC',
    costClass: 'FREE',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['PROJECT_INTELLIGENCE_READY'],
    produces: ['SITE_STRATEGY'],
    invalidates: ['SITE_ARCHITECTURE', 'SITE_PAGE_INVENTORY'],
    liveVerificationRequired: false,
    founderApprovalRequired: false,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'PAGE_FAMILY_FORMATION',
    discipline: 'SITE',
    actor: 'DETERMINISTIC_CODE',
    triggerMode: 'FOUNDER_TRIGGERED',
    costClass: 'LOW',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['SITE_ARCHITECTURE_READY', 'PAGE_INVENTORY_READY'],
    produces: ['SITE_PAGE_FAMILY'],
    invalidates: ['SURFACE_EXPERIENCE_BRIEF', 'PAGE_FAMILY_IMPLEMENTATION_CONTRACT'],
    liveVerificationRequired: false,
    founderApprovalRequired: true,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'BRAND_CHARACTER_INTELLIGENCE_COMPILATION',
    discipline: 'IDENTITY',
    actor: 'DETERMINISTIC_CODE',
    triggerMode: 'FOUNDER_TRIGGERED',
    costClass: 'FREE',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['BRAND_LORE_READY'],
    produces: ['BRAND_CHARACTER_INTELLIGENCE_SNAPSHOT'],
    invalidates: [],
    liveVerificationRequired: false,
    founderApprovalRequired: false,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'BRAND_CHARACTER_TERRITORY_FORMATION',
    discipline: 'IDENTITY',
    actor: 'ANTHROPIC',
    triggerMode: 'FOUNDER_TRIGGERED',
    costClass: 'MEDIUM',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['BRAND_CHARACTER_SNAPSHOT_READY'],
    produces: ['BRAND_CHARACTER_TERRITORY'],
    invalidates: ['BRAND_CHARACTER_SYSTEM'],
    liveVerificationRequired: false,
    founderApprovalRequired: true,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'BRAND_CHARACTER_DISTINCTIVENESS_PREFLIGHT',
    discipline: 'IDENTITY',
    actor: 'DETERMINISTIC_CODE',
    triggerMode: 'SYSTEM_CONDITION',
    costClass: 'FREE',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['BRAND_CHARACTER_TERRITORIES_FORMED'],
    produces: ['BRAND_CHARACTER_DISTINCTIVENESS_PREFLIGHT'],
    invalidates: [],
    liveVerificationRequired: false,
    founderApprovalRequired: false,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'BRAND_CHARACTER_SEMANTIC_SET_AUDIT',
    discipline: 'IDENTITY',
    actor: 'ANTHROPIC',
    triggerMode: 'FOUNDER_TRIGGERED',
    costClass: 'LOW',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['BRAND_CHARACTER_DISTINCTIVENESS_PREFLIGHT'],
    produces: ['BRAND_CHARACTER_SET_DISTINCTIVENESS'],
    invalidates: [],
    liveVerificationRequired: false,
    founderApprovalRequired: false,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'BRAND_CHARACTER_SYSTEM_COMPILATION',
    discipline: 'IDENTITY',
    actor: 'DETERMINISTIC_CODE',
    triggerMode: 'FOUNDER_TRIGGERED',
    costClass: 'FREE',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['BRAND_CHARACTER_FOUNDER_SELECTED'],
    produces: ['BRAND_CHARACTER_SYSTEM'],
    invalidates: ['IDENTITY_CONCEPT', 'CONCEPT_FORMATION', 'DIRECTION', 'DESIGN_PROOF'],
    liveVerificationRequired: false,
    founderApprovalRequired: true,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'EXPERIENCE_CONCEPT_FORMATION',
    discipline: 'EXPERIENCE',
    actor: 'ANTHROPIC',
    triggerMode: 'FOUNDER_TRIGGERED',
    costClass: 'HIGH',
    parallelizationPolicy: 'SEQUENTIAL',
    requiredGates: ['SITE_ARCHITECTURE_READY', 'INFORMATION_ARCHITECTURE_READY'],
    produces: ['EXPERIENCE_CONCEPT'],
    invalidates: ['EXPERIENCE_DIRECTION'],
    liveVerificationRequired: false,
    founderApprovalRequired: true,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
  {
    stage: 'COMPOSER_IMPLEMENTATION',
    discipline: 'SITE',
    actor: 'COMPOSER',
    triggerMode: 'FOUNDER_TRIGGERED',
    costClass: 'CRITICAL',
    parallelizationPolicy: 'PARALLEL_BLOCKED',
    requiredGates: [
      'SITE_PRODUCTION_READINESS_READY',
      'PAGE_FAMILY_IMPLEMENTATION_CONTRACT_READY',
      'COMPOSER_LIVE_VERIFIED',
    ],
    produces: ['SITE_IMPLEMENTATION'],
    invalidates: ['FIDELITY_BASELINE'],
    liveVerificationRequired: true,
    founderApprovalRequired: true,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  },
];

export function productionOrchestrationRuntimeEngineImplemented(): false {
  return false;
}
