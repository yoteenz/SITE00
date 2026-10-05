import type { ImageExpression, ImageFamily, ImageRequirement } from './visualSurgeryTypes';

function kindForFamilyId(id: string): ImageFamily['kind'] {
  if (id.includes('ENVIRONMENT')) return 'ENVIRONMENT_FAMILY';
  if (id.includes('CARD')) return 'CARD_IMAGE_FAMILY';
  if (id.includes('TRANSPARENT')) return 'TRANSPARENT_OBJECT_FAMILY';
  if (id.includes('MATERIAL')) return 'MATERIAL_FAMILY';
  return 'CUSTOM_EXPERIENCE_IMAGE_FAMILY';
}

export function buildImageFamilies(expression: ImageExpression, requirements: ImageRequirement[]): ImageFamily[] {
  const byFamily = new Map<string, ImageRequirement[]>();
  for (const r of requirements) {
    const list = byFamily.get(r.family) ?? [];
    list.push(r);
    byFamily.set(r.family, list);
  }
  return [...byFamily.entries()].map(([family_id, members]) => ({
    image_family_id: family_id,
    name: family_id.replace(/_/g, ' '),
    kind: kindForFamilyId(family_id),
    expression,
    member_asset_ids: members.map((m) => m.asset_id),
    status: 'DRAFT',
    version: 1,
  }));
}
