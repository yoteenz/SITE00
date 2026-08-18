/**
 * ASSTS Library Home — approved overlay geometry (711×1536).
 * compositionId: assts-library-home-mobile-v1
 *
 * Pixel bounds are the validation baseline; runtime scales by width/711.
 * Vertical positions scale with the same factor as horizontal (scrollable long page).
 */

export const ASSTS_LIBRARY_HOME_COMPOSITION_ID = 'assts-library-home-mobile-v1' as const;

export const ASSTS_LIBRARY_HOME_REFERENCE_CANVAS = {
  width: 711,
  height: 1536,
} as const;

export type LibraryHomeRegionRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

export type LibraryHomeRegionId =
  | 'header.eyebrow'
  | 'header.title'
  | 'header.tagline'
  | 'header.control'
  | 'hero'
  | 'stats.assets'
  | 'stats.batches'
  | 'stats.needReview'
  | 'stats.approved'
  | 'status'
  | 'needsReview.header'
  | 'needsReview.card'
  | 'needsReview.cardEmpty'
  | 'recentBatches.header'
  | 'recentBatches.card01'
  | 'recentBatches.card02'
  | 'recentBatches.card03'
  | 'browseLibrary.header'
  | 'browseLibrary.environments'
  | 'browseLibrary.objects'
  | 'browseLibrary.uiGraphics'
  | 'browseLibrary.brandSystems'
  | 'browseLibrary.projectAssets'
  | 'navigation';

function rect(x: number, y: number, w: number, h: number): LibraryHomeRegionRect {
  const { width, height } = ASSTS_LIBRARY_HOME_REFERENCE_CANVAS;
  return {
    x,
    y,
    w,
    h,
    nx: x / width,
    ny: y / height,
    nw: w / width,
    nh: h / height,
  };
}

/** Authoritative region map — approved default composition v1. */
export const ASSTS_LIBRARY_HOME_REGIONS: Record<LibraryHomeRegionId, LibraryHomeRegionRect> = {
  'header.eyebrow': rect(40, 78, 160, 18),
  'header.title': rect(40, 108, 385, 43),
  'header.tagline': rect(40, 162, 365, 22),
  'header.control': rect(617, 82, 59, 60),
  /** Phase 01 — locked hero zone (full section through stats attachment) */
  hero: rect(0, 0, 711, 531),
  'stats.assets': rect(37, 529, 148, 96),
  'stats.batches': rect(191, 529, 153, 96),
  'stats.needReview': rect(354, 529, 157, 96),
  'stats.approved': rect(518, 529, 156, 96),
  status: rect(37, 625, 637, 35),
  'needsReview.header': rect(39, 679, 636, 22),
  'needsReview.card': rect(36, 708, 639, 184),
  'needsReview.cardEmpty': rect(36, 708, 639, 184),
  'recentBatches.header': rect(39, 913, 636, 23),
  'recentBatches.card01': rect(36, 944, 206, 104),
  'recentBatches.card02': rect(251, 944, 206, 104),
  'recentBatches.card03': rect(467, 944, 208, 104),
  'browseLibrary.header': rect(39, 1083, 201, 22),
  'browseLibrary.environments': rect(36, 1111, 308, 102),
  'browseLibrary.objects': rect(355, 1111, 320, 102),
  'browseLibrary.uiGraphics': rect(36, 1221, 308, 102),
  'browseLibrary.brandSystems': rect(355, 1221, 320, 102),
  'browseLibrary.projectAssets': rect(36, 1331, 639, 95),
  navigation: rect(36, 1425, 639, 88),
};

/** Master content gutters (reference pixels). */
export const ASSTS_LIBRARY_HOME_GUTTERS = {
  left: 40,
  right: 36,
  contentWidth: 639,
  leftNormalized: 40 / 711,
  contentWidthNormalized: 639 / 711,
} as const;

/** Major vertical landmarks (reference px) for debug guides. */
export const ASSTS_LIBRARY_HOME_Y_LANDMARKS: { label: string; y: number }[] = [
  { label: 'HEADER EYEBROW', y: 78 },
  { label: 'MAIN TITLE', y: 108 },
  { label: 'TAGLINE', y: 162 },
  { label: 'HERO TOP / library.hero', y: 0 },
  { label: 'ARCHITECTURE BAND', y: 185 },
  { label: 'HERO BOTTOM / statsAnchor', y: 529 },
  { label: 'STATS', y: 529 },
  { label: 'STATUS STRIP', y: 625 },
  { label: 'NEEDS REVIEW HEADER', y: 679 },
  { label: 'NEEDS REVIEW CARD', y: 708 },
  { label: 'RECENT BATCHES HEADER', y: 913 },
  { label: 'RECENT BATCHES ROW', y: 944 },
  { label: 'BROWSE LIBRARY HEADER', y: 1083 },
  { label: 'LIBRARY GRID', y: 1111 },
  { label: 'BOTTOM NAV', y: 1425 },
];

/** Bottom nav icon center anchors (reference px). */
export const ASSTS_LIBRARY_HOME_NAV_CENTERS = [103, 231, 356, 487, 615] as const;

export function scaleLibraryHomeRect(r: LibraryHomeRegionRect, scale: number) {
  return {
    x: r.x * scale,
    y: r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  };
}

export function libraryHomeRegionStyleVars(id: LibraryHomeRegionId): Record<string, string> {
  const r = ASSTS_LIBRARY_HOME_REGIONS[id];
  return {
    '--lib-x': String(r.x),
    '--lib-y': String(r.y),
    '--lib-w': String(r.w),
    '--lib-h': String(r.h),
  };
}

export function getLibraryHomeRegion(id: LibraryHomeRegionId): LibraryHomeRegionRect {
  return ASSTS_LIBRARY_HOME_REGIONS[id];
}

/** Legacy anchor ids → composition region ids */
export const LIBRARY_HOME_ANCHOR_TO_REGION: Partial<Record<string, LibraryHomeRegionId>> = {
  'library.header': 'header.title',
  'library.hero': 'hero',
  'library.stats': 'stats.assets',
  'library.globalStatus': 'status',
  'library.needsReview.heading': 'needsReview.header',
  'library.needsReview.primaryCard': 'needsReview.card',
  'library.needsReview.seeAll': 'needsReview.header',
  'library.recentBatches.heading': 'recentBatches.header',
  'library.recentBatches.list': 'recentBatches.card01',
  'library.browseLibrary': 'browseLibrary.header',
  'library.browseLibrary.environment': 'browseLibrary.environments',
  'library.browseLibrary.objects': 'browseLibrary.objects',
  'library.browseLibrary.uiGraphics': 'browseLibrary.uiGraphics',
  'library.browseLibrary.brandSystems': 'browseLibrary.brandSystems',
  'library.browseLibrary.projectAssets': 'browseLibrary.projectAssets',
  'library.bottomNav': 'navigation',
};
