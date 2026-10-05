/** Quick Add V2 type registry (W1.4). Only types with repository mutations are enabled. */

export type QuickAddTypeId = 'TRANSACTION';

export type QuickAddTypeDef = {
  type_id: QuickAddTypeId;
  domain: 'TRANSACTION';
  label: string;
  owner_family_id: 'F04';
  enabled: boolean;
  required_fields: string[];
  repository_action: 'appendTransaction';
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
    suggested_from_families: ['F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'],
  },
];

export function quickAddTypesForFamily(familyId: string | null): QuickAddTypeDef[] {
  const enabled = JURNL_QUICK_ADD_TYPES.filter((t) => t.enabled);
  if (!familyId) return enabled;
  const preferred = enabled.filter((t) => t.suggested_from_families.includes(familyId));
  return preferred.length ? preferred : enabled;
}
