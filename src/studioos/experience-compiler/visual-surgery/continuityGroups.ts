import type { ContinuityGroup, ImageRequirement } from './visualSurgeryTypes';

const PRESETS: Omit<ContinuityGroup, 'member_asset_ids'>[] = [
  {
    continuity_group_id: 'SITE00_VISUAL_UNIVERSE_V1',
    name: 'SITE 00 Public Universe',
    kind: 'SAME_WORLD',
    shared_rules: ['luminous white architecture', 'red structural accent logic', 'premium studio realism'],
    variable_elements: ['local zone', 'functional metaphor', 'path-specific objects'],
  },
  {
    continuity_group_id: 'BLDR_WORLD_SYSTEM_V1',
    name: 'BLDR Builder World',
    kind: 'SAME_EXPERIENCE_FAMILY',
    shared_rules: ['white atrium family', 'glass path panels', 'red insert geometry', 'builder scale'],
    variable_elements: ['central machinery', 'path vignette', 'local architecture extension'],
  },
  {
    continuity_group_id: 'EVOLVE_INTERVENTION_SYSTEM_V1',
    name: 'EVOLVE Intervention World',
    kind: 'SAME_EXPERIENCE_FAMILY',
    shared_rules: ['layered glass property', 'intervention blocks', 'white chamber lighting'],
    variable_elements: ['path metaphor', 'panel header illustration'],
  },
  {
    continuity_group_id: 'IDNTY_ATRIUM_CONTINUITY_V1',
    name: 'IDNTY Atrium',
    kind: 'SAME_LOCATION',
    shared_rules: ['circular dais', 'planters', 'ring light', 'shared plate across states'],
    variable_elements: ['state machine hero optional upgrade'],
  },
  {
    continuity_group_id: 'SITE00_ORIGIN_UNIVERSE_V1',
    name: 'Origin Landmark',
    kind: 'SAME_WORLD',
    shared_rules: ['double-zero landmark', 'courtyard / skyline continuity', 'card vignette language'],
    variable_elements: ['expanded panel sky', 'path micro-illustrations'],
  },
];

export function assignContinuityGroups(requirements: ImageRequirement[]): ContinuityGroup[] {
  const groups = PRESETS.map((p) => ({ ...p, member_asset_ids: [] as string[] }));
  const byId = new Map(groups.map((g) => [g.continuity_group_id, g]));
  for (const r of requirements) {
    const g = byId.get(r.continuity_group);
    if (g) g.member_asset_ids.push(r.asset_id);
    else {
      const custom: ContinuityGroup = {
        continuity_group_id: r.continuity_group,
        name: r.continuity_group,
        kind: 'CUSTOM',
        shared_rules: ['inherit SITE00 universe'],
        variable_elements: [r.asset_id],
        member_asset_ids: [r.asset_id],
      };
      groups.push(custom);
      byId.set(custom.continuity_group_id, custom);
    }
  }
  return groups.filter((g) => g.member_asset_ids.length > 0);
}

export function validateSameWorld(group: ContinuityGroup, _assetSurfaces?: Record<string, string[]>): boolean {
  const ids = group.member_asset_ids;
  if (ids.length < 2) return true;
  const families = new Set(ids.map((id) => id.split('.')[1]));
  return families.size <= 3;
}
