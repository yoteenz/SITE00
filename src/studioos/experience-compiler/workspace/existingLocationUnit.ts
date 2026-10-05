import type { CustomExperienceDefinition, ExperienceRouteNode } from '../map2/map2Types';

export const EXISTING_LOCATION_UNIT_KIND = 'EXTERNAL_LOCATION' as const;

export const EXISTING_LOCATION_EXPERIENCE_TYPES = [
  'DIAGNOSTIC_CASE',
  'REPAIR_WORKFLOW',
  'CAPABILITY_INSTALL',
  'CUSTOM_EXPERIENCE',
  'INTEGRATION',
] as const;

export function existingLocationRouteNodes(): ExperienceRouteNode[] {
  return [
    {
      route_id: 'existing_location_entry',
      route: '/existing-location',
      parent: null,
      children: ['existing_location_case'],
      experience_unit: EXISTING_LOCATION_UNIT_KIND,
      family: 'EXISTING_LOCATION_SERVICE',
      purpose: 'Intake for external property work',
      primary_user: 'Client',
      business_role: 'Service revenue + trust',
      conversion_role: 'Lead to paid repair',
      priority: 'P1',
      launch_phase: 'LAUNCH',
    },
    {
      route_id: 'existing_location_case',
      route: '/existing-location/case/:caseId',
      parent: '/existing-location',
      children: [],
      experience_unit: 'REPAIR_WORKFLOW',
      family: 'EXISTING_LOCATION_SERVICE',
      purpose: 'Case diagnosis and plan',
      primary_user: 'Client',
      business_role: 'Delivery',
      conversion_role: 'Courtesy or paid checkout',
      priority: 'P1',
      launch_phase: 'LAUNCH',
    },
  ];
}

export function existingLocationCustomExperience(): CustomExperienceDefinition {
  return {
    custom_experience_id: 'cx_existing_location',
    name: 'Existing Location',
    description: 'Diagnose, repair, enhance, or install on client existing digital property',
    business_purpose: 'Non-greenfield enhancement without full rebuild',
    states: ['INTAKE', 'DIAGNOSE', 'PLAN', 'EXECUTE'],
    inherits_from: ['REPAIR_WORKFLOW', 'DIAGNOSTIC'],
    new_family_id: 'EXISTING_LOCATION_SERVICE',
    capability_candidate: true,
  };
}

export function missingExistingLocationAuthorities(): string[] {
  return [
    'EXISTING_LOCATION_INTAKE_MOBILE',
    'EXISTING_LOCATION_CASE_WORKSPACE_MOBILE',
    'EXISTING_LOCATION_TRUST_PANEL_MOBILE',
  ];
}
