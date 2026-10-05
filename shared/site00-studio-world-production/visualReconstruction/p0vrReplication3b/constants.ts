export const P0_VR_REPLICATION_3B_BUILD = 'v318' as const;

export const MAX_HERO_VISION_CORRECTION_PASSES = 3;

export const VISION_LITERAL_REGION_ORDER = [
  'hero-editorial',
  'host-header',
  'project-masthead',
  'metric-status-row',
  'bottom-nav',
  'progress-phase',
  'focus-milestone',
  'recent-activity',
  'module-nav',
] as const;

export type VisionLiteralRegionId = (typeof VISION_LITERAL_REGION_ORDER)[number];

/** Normalized Y/height crops for NDX mobile overview (390×844 reference). */
export const NDX_REGION_CROP_BOUNDS: Record<string, string> = {
  'whole-page': '0,0,390,844',
  'host-header': '0,0,390,52',
  'project-masthead': '0,52,390,168',
  'module-nav': '0,168,390,208',
  'hero-editorial': '0,208,390,420',
  'progress-phase': '0,420,390,468',
  'metric-status-row': '0,468,390,548',
  'focus-milestone': '0,548,390,640',
  'recent-activity': '0,640,390,780',
  'bottom-nav': '0,780,390,844',
};

export const MIN_HERO_SUBREGIONS = 3;

export const GENERIC_VISION_PHRASES = [
  'hero with image and text',
  'dark hero with text and image',
  'header with logo',
  'navigation bar',
  'generic',
  'similar to',
  'inspired by',
];
