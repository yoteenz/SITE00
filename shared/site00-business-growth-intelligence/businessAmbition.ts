import { BUSINESS_GROWTH_INTELLIGENCE_VERSION } from './version.js';
import type { BusinessAmbitionGoalId, BusinessAmbitionIntake } from './types.js';

export const BUSINESS_AMBITION_GOAL_OPTIONS: readonly {
  id: BusinessAmbitionGoalId;
  label: string;
}[] = [
  { id: 'BE_FOUND_ONLINE', label: 'Be found online' },
  { id: 'BUILD_WEBSITE', label: 'Build a website' },
  { id: 'ATTRACT_CUSTOMERS', label: 'Attract more customers' },
  { id: 'FIND_GRANTS_FUNDING', label: 'Find grants or funding' },
  { id: 'PURSUE_BUSINESS_CONTRACTS', label: 'Pursue business contracts' },
  { id: 'PURSUE_GOVERNMENT_CONTRACTS', label: 'Pursue government contracts' },
  { id: 'IMPROVE_CREDIBILITY', label: 'Improve business credibility' },
  { id: 'AUTOMATE_SALES_FOLLOWUP', label: 'Automate sales and follow-up' },
  { id: 'ORGANIZE_CRM', label: 'Organize customer relationships' },
  { id: 'PREPARE_EXPANSION', label: 'Prepare for expansion' },
  { id: 'OTHER', label: 'Other' },
  { id: 'NOT_SURE', label: 'Not sure yet' },
] as const;

export function emptyBusinessAmbition(): BusinessAmbitionIntake {
  return {
    schema_version: BUSINESS_GROWTH_INTELLIGENCE_VERSION,
    goals: [],
    context: {},
  };
}

export function isBusinessAmbitionComplete(ambition: BusinessAmbitionIntake): boolean {
  if (ambition.skipped) return true;
  return Boolean(ambition.completed_at) || ambition.goals.length > 0;
}

/** Questions to ask only when goals/context require them (adaptive). */
export function adaptiveContextFieldsForGoals(goals: BusinessAmbitionGoalId[]): (keyof NonNullable<BusinessAmbitionIntake['context']>)[] {
  const fields = new Set<keyof NonNullable<BusinessAmbitionIntake['context']>>();
  const g = new Set(goals);
  if (g.has('BUILD_WEBSITE') || g.has('BE_FOUND_ONLINE') || g.has('ATTRACT_CUSTOMERS')) {
    fields.add('has_functioning_website');
    fields.add('findable_in_search');
  }
  if (g.has('IMPROVE_CREDIBILITY') || g.has('BE_FOUND_ONLINE')) {
    fields.add('has_professional_email');
    fields.add('receiving_inquiries');
  }
  if (g.has('PURSUE_BUSINESS_CONTRACTS')) fields.add('pursues_private_contracts');
  if (g.has('PURSUE_GOVERNMENT_CONTRACTS')) {
    fields.add('government_procurement_relevant');
    fields.add('has_capabilities_statement');
  }
  if (g.has('FIND_GRANTS_FUNDING')) fields.add('applied_for_grants_before');
  if (g.size > 0 && !g.has('NOT_SURE')) {
    fields.add('industry');
    fields.add('geographic_markets');
    fields.add('business_stage');
    fields.add('immediate_priority');
  }
  return [...fields];
}
