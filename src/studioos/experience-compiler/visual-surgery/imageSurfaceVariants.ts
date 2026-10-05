import type { ExperienceSurface } from '../map2/map2Types';
import type { ImageRequirement, ImageSurfaceVariant, SurfaceDerivationKind } from './visualSurgeryTypes';

const SURFACES: ExperienceSurface[] = ['MOBILE_WEB', 'TABLET_WEB', 'DESKTOP_WEB', 'APP'];

export function compileImageSurfaceVariants(requirements: ImageRequirement[]): ImageSurfaceVariant[] {
  const variants: ImageSurfaceVariant[] = [];
  for (const req of requirements) {
    if (req.surface_derivation === 'NOT_APPLICABLE') continue;
    const masterId = req.asset_id;
    if (req.surface_derivation === 'SAME_ASSET_DIFFERENT_CROP') {
      for (const surface of SURFACES) {
        variants.push({
          asset_id: `${req.asset_id}__${surface}`,
          surface,
          derivation: 'SAME_ASSET_DIFFERENT_CROP',
          crop_box: cropForSurface(surface),
          extension_rules: null,
          master_asset_id: masterId,
        });
      }
    } else if (req.surface_derivation === 'EXTENDED_CANVAS') {
      variants.push({
        asset_id: `${req.asset_id}__MASTER`,
        surface: 'MOBILE_WEB',
        derivation: 'EXTENDED_CANVAS',
        crop_box: { x: 0, y: 0, w: 1, h: 1 },
        extension_rules: 'Desktop expands architecture laterally; same world, no reconcept',
        master_asset_id: masterId,
      });
      variants.push({
        asset_id: `${req.asset_id}__DESKTOP_WEB`,
        surface: 'DESKTOP_WEB',
        derivation: 'EXTENDED_CANVAS',
        crop_box: { x: -0.15, y: 0, w: 1.3, h: 1 },
        extension_rules: 'Lateral extension from mobile master focal anchor',
        master_asset_id: masterId,
      });
      variants.push({
        asset_id: `${req.asset_id}__TABLET_WEB`,
        surface: 'TABLET_WEB',
        derivation: 'SAME_ASSET_DIFFERENT_CROP',
        crop_box: cropForSurface('TABLET_WEB'),
        extension_rules: null,
        master_asset_id: masterId,
      });
      variants.push({
        asset_id: `${req.asset_id}__APP`,
        surface: 'APP',
        derivation: 'APP_VARIANT_REQUIRED',
        crop_box: cropForSurface('APP'),
        extension_rules: 'Prefer web master with app-safe-zone unless composition fails',
        master_asset_id: masterId,
      });
    }
  }
  return variants;
}

function cropForSurface(surface: ExperienceSurface): { x: number; y: number; w: number; h: number } {
  switch (surface) {
    case 'MOBILE_WEB':
      return { x: 0, y: 0, w: 1, h: 1 };
    case 'TABLET_WEB':
      return { x: -0.05, y: 0, w: 1.1, h: 1 };
    case 'DESKTOP_WEB':
      return { x: -0.12, y: 0, w: 1.24, h: 1 };
    case 'APP':
      return { x: 0, y: 0.02, w: 1, h: 0.96 };
    default:
      return { x: 0, y: 0, w: 1, h: 1 };
  }
}

export function classifySurfaceDerivation(kind: SurfaceDerivationKind): string {
  return kind;
}
