import type { CapabilityLifecycleStage, CapabilityRecord, CustomExperienceDefinition } from './map2Types';

export function promoteCapabilityFromCustomExperience(
  cx: CustomExperienceDefinition,
  originProject: string,
  stage: CapabilityLifecycleStage = 'REUSABLE_CANDIDATE',
): CapabilityRecord | null {
  if (!cx.capability_candidate || !cx.new_family_id) return null;
  return {
    capability_id: `cap_${cx.new_family_id}`,
    family_id: cx.new_family_id,
    name: cx.name,
    description: cx.description,
    origin_project: originProject,
    origin_experience: cx.custom_experience_id,
    interaction_grammar: cx.inherits_from.join(' + ') + ' + new preview grammar',
    maturity: stage,
    reusability: 'FUNCTIONAL_ONLY',
  };
}

export function assertFunctionalReuseWithoutVisualLeakage(cap: CapabilityRecord, targetProject: string): boolean {
  return cap.origin_project !== targetProject && cap.reusability === 'FUNCTIONAL_ONLY';
}

export function advanceCapabilityLifecycle(cap: CapabilityRecord): CapabilityLifecycleStage {
  const order: CapabilityLifecycleStage[] = ['PROJECT_LOCAL', 'REUSABLE_CANDIDATE', 'CATALOG_CAPABILITY', 'INTEGRATION_READY'];
  const i = order.indexOf(cap.maturity);
  return order[Math.min(i + 1, order.length - 1)];
}
