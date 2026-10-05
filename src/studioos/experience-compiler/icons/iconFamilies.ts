import type { IconExpression, IconFamily, IconRequirement } from './iconTypes';

export function buildIconFamily(project_id: string, expression: IconExpression, requirements: IconRequirement[]): IconFamily {
  const brandIcons = requirements.filter((r) => r.implementation_class === 'BRAND_ICON' || r.implementation_class === 'ILLUSTRATIVE_MICRO_ASSET');
  const representatives = brandIcons.slice(0, 12).map((r) => r.icon_semantic_id);
  return {
    icon_family_id: `ICON_FAMILY_${project_id.replace(/\W/g, '_').toUpperCase()}`,
    name: `${expression.derived_from_brand} Icon Family`,
    expression,
    representative_semantic_ids: representatives.length ? representatives : requirements.slice(0, 6).map((r) => r.icon_semantic_id),
    status: 'DRAFT',
    version: 1,
    lineage_parent_id: null,
  };
}

export function pushIconFamilyVersion(family: IconFamily, feedback: string): IconFamily {
  return {
    ...family,
    icon_family_id: family.icon_family_id,
    version: family.version + 1,
    lineage_parent_id: family.icon_family_id,
    status: 'DRAFT',
    expression: { ...family.expression, derived_from_brand: `${family.expression.derived_from_brand} — ${feedback}` },
  };
}
