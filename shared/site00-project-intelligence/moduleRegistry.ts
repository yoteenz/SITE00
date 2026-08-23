/**
 * Project Intelligence Module Registry — maps modules to existing SITE 00 systems.
 */

import type { ProjectIntelligenceModuleDefinition, ProjectIntelligenceModuleId } from './types.js';

export const PROJECT_INTELLIGENCE_MODULE_REGISTRY: ProjectIntelligenceModuleDefinition[] = [
  { moduleId: 'BUSINESS_TRUTH', label: 'Business Truth', requiredDependencies: [], recommendedDependencies: [], readinessContribution: 10 },
  { moduleId: 'BRAND_LORE', label: 'Brand Lore', requiredDependencies: [], recommendedDependencies: ['BUSINESS_TRUTH'], readinessContribution: 15, existingSystemRoute: '/projects/:slug/calibrate' },
  { moduleId: 'BRAND_PERSONALITY', label: 'Brand Personality', requiredDependencies: ['BRAND_LORE'], recommendedDependencies: [], readinessContribution: 15, existingSystemRoute: '/projects/:slug/calibrate' },
  { moduleId: 'PRIMARY_EXPRESSION_CONTEXT', label: 'Primary Expression Context', requiredDependencies: ['BRAND_PERSONALITY'], recommendedDependencies: [], readinessContribution: 10 },
  { moduleId: 'FOUNDER_CREATIVE_APPETITE', label: 'Founder Creative Appetite', requiredDependencies: ['BRAND_PERSONALITY'], recommendedDependencies: [], readinessContribution: 10, existingSystemRoute: '/projects/:slug/creative-appetite' },
  { moduleId: 'FUNCTIONAL_REQUIREMENTS', label: 'Functional Requirements', requiredDependencies: [], recommendedDependencies: ['BUSINESS_TRUTH'], readinessContribution: 10 },
  { moduleId: 'ASSET_INVENTORY', label: 'Asset Inventory', requiredDependencies: [], recommendedDependencies: [], readinessContribution: 5 },
  { moduleId: 'VISUAL_REFERENCES', label: 'Visual References', requiredDependencies: [], recommendedDependencies: ['BRAND_LORE'], readinessContribution: 5 },
  { moduleId: 'IDENTITY_DIRECTION', label: 'Identity Direction', requiredDependencies: ['BRAND_LORE'], recommendedDependencies: [], readinessContribution: 8, existingSystemRoute: '/projects/:slug/calibrate' },
  { moduleId: 'CONTENT_INTELLIGENCE', label: 'Content Intelligence', requiredDependencies: [], recommendedDependencies: ['BRAND_LORE'], readinessContribution: 5 },
  { moduleId: 'ANTI_DIRECTION', label: 'Anti-Direction', requiredDependencies: ['BRAND_LORE'], recommendedDependencies: [], readinessContribution: 5 },
  { moduleId: 'EXPERIENCE_INTENT', label: 'Experience Intent', requiredDependencies: ['BRAND_LORE', 'BRAND_PERSONALITY'], recommendedDependencies: ['FUNCTIONAL_REQUIREMENTS'], readinessContribution: 10 },
  { moduleId: 'INTERACTION_REQUIREMENTS', label: 'Interaction Requirements', requiredDependencies: ['EXPERIENCE_INTENT'], recommendedDependencies: [], readinessContribution: 8 },
  { moduleId: 'MOTION_INTENT', label: 'Motion Intent', requiredDependencies: ['EXPERIENCE_INTENT'], recommendedDependencies: [], readinessContribution: 5 },
  { moduleId: 'APPLICATION_BEHAVIOR', label: 'Application Behavior', requiredDependencies: ['FUNCTIONAL_REQUIREMENTS'], recommendedDependencies: [], readinessContribution: 10 },
  { moduleId: 'USER_ROLES', label: 'User Roles', requiredDependencies: ['FUNCTIONAL_REQUIREMENTS'], recommendedDependencies: [], readinessContribution: 8 },
  { moduleId: 'WORKFLOW_INTELLIGENCE', label: 'Workflow Intelligence', requiredDependencies: ['USER_ROLES'], recommendedDependencies: [], readinessContribution: 8 },
  { moduleId: 'PERSISTENT_STATE', label: 'Persistent State', requiredDependencies: ['APPLICATION_BEHAVIOR'], recommendedDependencies: [], readinessContribution: 5 },
  { moduleId: 'NOTIFICATION_BEHAVIOR', label: 'Notification Behavior', requiredDependencies: ['APPLICATION_BEHAVIOR'], recommendedDependencies: [], readinessContribution: 5 },
  { moduleId: 'WORLD_READINESS', label: 'World Readiness', requiredDependencies: ['BRAND_LORE', 'BRAND_PERSONALITY', 'EXPERIENCE_INTENT'], recommendedDependencies: [], readinessContribution: 15, existingSystemRoute: '/intake/:token' },
  { moduleId: 'WORLD_ENTRY_INTENT', label: 'World Entry Intent', requiredDependencies: ['WORLD_READINESS'], recommendedDependencies: [], readinessContribution: 5 },
  { moduleId: 'WORLD_SPATIAL_INTENT', label: 'World Spatial Intent', requiredDependencies: ['WORLD_READINESS'], recommendedDependencies: [], readinessContribution: 5 },
  { moduleId: 'WORLD_HARD_BOUNDARIES', label: 'World Hard Boundaries', requiredDependencies: ['WORLD_READINESS'], recommendedDependencies: [], readinessContribution: 5 },
];

export function getModuleDefinition(moduleId: ProjectIntelligenceModuleId): ProjectIntelligenceModuleDefinition | undefined {
  return PROJECT_INTELLIGENCE_MODULE_REGISTRY.find((m) => m.moduleId === moduleId);
}

export function moduleRegistryHasDependencies(): boolean {
  return PROJECT_INTELLIGENCE_MODULE_REGISTRY.some((m) => m.requiredDependencies.length > 0);
}
