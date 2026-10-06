/** Quick Add V2 type registry (W1.4). Only types with repository mutations are enabled. */

export type QuickAddTypeId = 'TRANSACTION' | 'INCOME' | 'GOAL' | 'PURCHASE' | 'TRIP';

export type QuickAddTypeDef = {
  type_id: QuickAddTypeId;
  domain: 'TRANSACTION' | 'INCOME' | 'GOAL';
  label: string;
  owner_family_id: 'F04' | 'F06' | 'F14' | 'F10' | 'F11';
  enabled: boolean;
  required_fields: string[];
  repository_action: 'appendTransaction' | 'upsertIncomeSource' | 'upsertGoal' | 'upsertPurchase' | 'upsertTrip';
  suggested_from_families: string[];
};

export const JURNL_QUICK_ADD_TYPES: readonly QuickAddTypeDef[] = [
  {
    type_id: 'TRANSACTION',
    domain: 'TRANSACTION',
    label: 'MOVEMENT',
    owner_family_id: 'F04',
    enabled: true,
    required_fields: ['merchant', 'amount', 'direction', 'account'],
    repository_action: 'appendTransaction',
    suggested_from_families: ['F03', 'F04', 'F05', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'],
  },
  {
    type_id: 'INCOME',
    domain: 'INCOME',
    label: 'INCOME',
    owner_family_id: 'F06',
    enabled: true,
    required_fields: ['source_name', 'amount', 'cadence'],
    repository_action: 'upsertIncomeSource',
    suggested_from_families: ['F06', 'F03', 'F07'],
  },
  {
    type_id: 'GOAL',
    domain: 'GOAL',
    label: 'GOAL',
    owner_family_id: 'F14',
    enabled: true,
    required_fields: ['title', 'target_amount'],
    repository_action: 'upsertGoal',
    suggested_from_families: ['F14', 'F08', 'F03'],
  },
  {
    type_id: 'PURCHASE',
    domain: 'TRANSACTION',
    label: 'PURCHASE',
    owner_family_id: 'F10',
    enabled: true,
    required_fields: ['title', 'target_amount'],
    repository_action: 'upsertPurchase',
    suggested_from_families: ['F10', 'F08', 'F03'],
  },
  {
    type_id: 'TRIP',
    domain: 'TRANSACTION',
    label: 'TRIP',
    owner_family_id: 'F11',
    enabled: true,
    required_fields: ['title', 'target_budget'],
    repository_action: 'upsertTrip',
    suggested_from_families: ['F11', 'F08', 'F03'],
  },
];

export function quickAddTypesForFamily(familyId: string | null): QuickAddTypeDef[] {
  const enabled = JURNL_QUICK_ADD_TYPES.filter((t) => t.enabled);
  if (!familyId) return enabled;
  const preferred = enabled.filter((t) => t.suggested_from_families.includes(familyId));
  return preferred.length ? preferred : enabled;
}
