import type { ContinuityGroup, ImageFamily, VisualFamilyPack } from './visualSurgeryTypes';

export function compileVisualFamilyPacks(families: ImageFamily[], continuity: ContinuityGroup[]): VisualFamilyPack[] {
  const experienceKeys = ['BLDR', 'EVOLVE', 'ORIGIN', 'IDNTY', 'LOCATIONS'];
  return experienceKeys
    .map((key) => {
      const imageFamilies = families.filter((f) => f.image_family_id.includes(key));
      const continuityIds = continuity.filter((c) => c.continuity_group_id.includes(key) || c.name.includes(key)).map((c) => c.continuity_group_id);
      if (!imageFamilies.length && !continuityIds.length) return null;
      const masters = imageFamilies
        .flatMap((f) => f.member_asset_ids)
        .filter((id) => id.includes('ENV.'));
      return {
        pack_id: `${key}_VISUAL_FAMILY_PACK_V1`,
        experience_family: key,
        image_family_ids: imageFamilies.map((f) => f.image_family_id),
        continuity_group_ids: continuityIds.length ? continuityIds : [`SITE00_VISUAL_UNIVERSE_V1`],
        master_asset_ids: masters,
        surface_derivation_guide: 'Prefer master environment + extended canvas for desktop; same-world contact sheet review',
        icon_family_reference: 'icons/ICON_FAMILY_AUTHORITY.*',
      };
    })
    .filter(Boolean) as VisualFamilyPack[];
}
