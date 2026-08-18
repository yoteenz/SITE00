export const ASSTS_ENVIRONMENT_SLOTS = {
  library: 'assts.library.environment.mobile',
  libraryHero: 'assts.library.hero.mobile',
  batch: 'assts.batch.environment.mobile',
  inspection: 'assts.inspection.environment.mobile',
} as const;

export type AsstsEnvironmentSlot = (typeof ASSTS_ENVIRONMENT_SLOTS)[keyof typeof ASSTS_ENVIRONMENT_SLOTS];

/** Category taxonomy — counts come from API, not these placeholders. */
export const ASSTS_LIBRARY_CATEGORY_DEFS = [
  { id: 'environments', label: '01 ENVIRONMENTS', assetTypes: ['environment'] },
  { id: 'objects', label: '02 OBJECTS', assetTypes: ['object'] },
  { id: 'ui', label: '03 UI / GRAPHICS', assetTypes: ['ui', 'graphic'] },
  { id: 'brand', label: '04 BRAND SYSTEMS', assetTypes: ['brand'] },
  { id: 'project', label: '05 PROJECT ASSETS', assetTypes: ['project'] },
] as const;

export const CORRECTION_CATEGORIES = [
  'GEOMETRY',
  'CAMERA',
  'LIGHTING',
  'MATERIAL',
  'COLOR',
  'DETAIL',
  'OTHER',
] as const;

export type CorrectionCategory = (typeof CORRECTION_CATEGORIES)[number];

export const STATUS_LABELS: Record<string, string> = {
  QUEUED: 'Queued',
  GENERATING: 'Generating',
  NEEDS_REVIEW: 'Needs Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REGENERATING: 'Regenerating',
  VARIANT_REQUESTED: 'Variant Requested',
  LOCKED: 'Locked',
  FAILED: 'Failed',
};
