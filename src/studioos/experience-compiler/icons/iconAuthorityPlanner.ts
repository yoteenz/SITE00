import type { IconFamily, IconRequirement, IconFamilyAuthority } from './iconTypes';

export function planIconFamilyAuthority(family: IconFamily, _requirements: IconRequirement[]): IconFamilyAuthority {
  return {
    authority_id: `ICON_FAMILY_${family.version}_${family.icon_family_id}`,
    authority_type: 'ICON_FAMILY_AUTHORITY',
    icon_family_id: family.icon_family_id,
    version: family.version,
    representative_semantics: family.representative_semantic_ids,
    surfaces_demonstrated: ['MOBILE_WEB', 'DESKTOP_WEB', 'APP'],
    generation_prompt: `[OpenArt reference sheet] Icon family for ${family.name}. ${family.expression.dimensionality} ${family.expression.structure}. Sections: CORE, NAV, ACTIONS, STATUS, DOMAIN. Include state row (default/active/disabled). Do NOT bake text labels. Representatives: ${family.representative_semantic_ids.join(', ')}`,
    approval_status: 'PLANNED',
  };
}
