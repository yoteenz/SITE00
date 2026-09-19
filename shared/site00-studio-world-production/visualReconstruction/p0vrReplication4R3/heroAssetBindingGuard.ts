import type { HeroObjectId } from '../p0vrReplication4R2/types.js';

export type HeroAssetRole =
  | 'HERO_CENTER_MEDIA'
  | 'HERO_RIGHT_LOWER_MEDIA'
  | 'AUTHORITY_REGION_CROP';

export type RejectedAssetClass =
  | 'PAGE_LEVEL_RENDER'
  | 'LOWER_PAGE_REGION'
  | 'MILESTONE_REGION'
  | 'SCREENSHOT_OF_PAGE'
  | 'BLUEPRINT_RASTER';

export type HeroAssetBindingGuardResult = {
  objectId: HeroObjectId;
  allowed: boolean;
  assetRole: HeroAssetRole;
  rejectedClass: RejectedAssetClass | null;
  failureCode: 'H12_WRONG_ASSET_BINDING' | null;
  notes: string;
};

const REJECT_PATTERNS: { pattern: RegExp; class: RejectedAssetClass }[] = [
  { pattern: /forensic-blueprint/i, class: 'BLUEPRINT_RASTER' },
  { pattern: /twin.*screenshot|screenshot.*twin/i, class: 'SCREENSHOT_OF_PAGE' },
  { pattern: /milestone|activity|progress/i, class: 'LOWER_PAGE_REGION' },
];

export function guardHeroAssetBinding(input: {
  objectId: HeroObjectId;
  assetUrl: string | null;
  assetRole: HeroAssetRole;
}): HeroAssetBindingGuardResult {
  const url = input.assetUrl ?? '';
  if (input.objectId !== 'H12') {
    return {
      objectId: input.objectId,
      allowed: true,
      assetRole: input.assetRole,
      rejectedClass: null,
      failureCode: null,
      notes: 'Guard applies to H12 only',
    };
  }

  if (!url) {
    return {
      objectId: 'H12',
      allowed: false,
      assetRole: 'HERO_RIGHT_LOWER_MEDIA',
      rejectedClass: 'PAGE_LEVEL_RENDER',
      failureCode: 'H12_WRONG_ASSET_BINDING',
      notes: 'H12 requires hero lower-right crop asset',
    };
  }

  for (const { pattern, class: rejectedClass } of REJECT_PATTERNS) {
    if (pattern.test(url)) {
      return {
        objectId: 'H12',
        allowed: false,
        assetRole: 'HERO_RIGHT_LOWER_MEDIA',
        rejectedClass,
        failureCode: 'H12_WRONG_ASSET_BINDING',
        notes: `Rejected asset class ${rejectedClass}`,
      };
    }
  }

  if (input.assetRole !== 'HERO_RIGHT_LOWER_MEDIA') {
    return {
      objectId: 'H12',
      allowed: false,
      assetRole: input.assetRole,
      rejectedClass: 'PAGE_LEVEL_RENDER',
      failureCode: 'H12_WRONG_ASSET_BINDING',
      notes: 'H12 must use HERO_RIGHT_LOWER_MEDIA role',
    };
  }

  return {
    objectId: 'H12',
    allowed: true,
    assetRole: 'HERO_RIGHT_LOWER_MEDIA',
    rejectedClass: null,
    failureCode: null,
    notes: 'H12 binding passes hero slot guard',
  };
}
