import type { HeroObjectId } from '../p0vrReplication4R2/types.js';

export type SourceRegionClassification =
  | 'HERO_CENTER_MEDIA'
  | 'HERO_RIGHT_LOWER_MEDIA'
  | 'PAGE_LEVEL'
  | 'NAV'
  | 'MASTHEAD'
  | 'PROGRESS'
  | 'METRICS'
  | 'FOCUS_MILESTONE'
  | 'ACTIVITY'
  | 'UNKNOWN';

export type HeroCropPurityResult = {
  objectId: 'H06' | 'H12';
  classification: SourceRegionClassification;
  cropWithinHeroBand: boolean;
  pageUiContamination: boolean;
  failureCode: 'H06_CROP_OUTSIDE_HERO' | 'H06_PAGE_UI_CONTAMINATION' | 'H12_WRONG_ASSET_BINDING' | null;
  notes: string;
};

/** Norm crop must stay inside hero band (page Y 228–448 on 812 reference). */
export function validateHeroNormCrop(input: {
  objectId: 'H06' | 'H12';
  left: number;
  top: number;
  width: number;
  height: number;
}): HeroCropPurityResult {
  const heroTop = 228 / 812;
  const heroBottom = 448 / 812;
  const bottom = input.top + input.height;
  const within = input.top >= heroTop - 0.002 && bottom <= heroBottom + 0.002;
  const classification: SourceRegionClassification =
    input.objectId === 'H06' ? 'HERO_CENTER_MEDIA' : 'HERO_RIGHT_LOWER_MEDIA';

  if (!within) {
    return {
      objectId: input.objectId,
      classification,
      cropWithinHeroBand: false,
      pageUiContamination: true,
      failureCode: input.objectId === 'H06' ? 'H06_CROP_OUTSIDE_HERO' : 'H12_WRONG_ASSET_BINDING',
      notes: 'Crop extends outside hero vertical band',
    };
  }

  return {
    objectId: input.objectId,
    classification,
    cropWithinHeroBand: true,
    pageUiContamination: false,
    failureCode: null,
    notes: 'Hero-safe norm crop',
  };
}

export function classifyHeroMediaBinding(objectId: HeroObjectId, usesFullPageBackground: boolean): SourceRegionClassification {
  if (objectId === 'H06') return usesFullPageBackground ? 'PAGE_LEVEL' : 'HERO_CENTER_MEDIA';
  if (objectId === 'H12') return usesFullPageBackground ? 'FOCUS_MILESTONE' : 'HERO_RIGHT_LOWER_MEDIA';
  return 'UNKNOWN';
}
