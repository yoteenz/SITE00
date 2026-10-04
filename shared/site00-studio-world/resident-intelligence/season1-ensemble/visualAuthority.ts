/**
 * Production visual authority projection — ingested from
 * STUDIO_WORLD_SEASON1_VISUAL_AUTHORITY_CURSOR_LIGHT_v1 (FSBW Season 1 ensemble).
 * Uniform + alternate modes are non-default by design.
 */

export const STUDIO_WORLD_SEASON1_VISUAL_BASE = '/site00/studio-world-residents/season1-v1' as const;

export type VisualAuthorityStatus =
  | 'FOUNDER_APPROVED'
  | 'FOUNDER_APPROVED_REFERENCE'
  | 'REFERENCE_ONLY'
  | 'ALTERNATE_MODE_REFERENCE'
  | 'CONCEPT_REFERENCE_ONLY';

export type ResidentVisualProjection = {
  sourceResidentId: string;
  primaryNaturalImage: string;
  /** Casting row / card thumb — closeup when available for crop; else natural. */
  cardImage: string;
  closeupRefs: readonly string[];
  uniformRefs: readonly string[];
  alternateModeRefs: readonly string[];
  supersededRefs: readonly string[];
  primaryNaturalStatus: VisualAuthorityStatus;
};

function url(relativeOrganizedPath: string): string {
  return `${STUDIO_WORLD_SEASON1_VISUAL_BASE}/${relativeOrganizedPath.replace(/^\/+/, '')}`;
}

/** Organized paths relative to season1-v1 package root (matches ingested ZIP layout). */
const PROJECTIONS: Record<string, ResidentVisualProjection> = {
  'SW-RESIDENT-001': {
    sourceResidentId: 'SW-RESIDENT-001',
    primaryNaturalImage: url('SW-RESIDENT-001__etta-vale/01-natural-authority/etta-vale__natural-full-body__sophisticated-fashionista.jpg'),
    cardImage: url('SW-RESIDENT-001__etta-vale/02-closeups/etta-vale__closeup__sophisticated-fashionista.jpg'),
    closeupRefs: [url('SW-RESIDENT-001__etta-vale/02-closeups/etta-vale__closeup__sophisticated-fashionista.jpg')],
    uniformRefs: [url('SW-RESIDENT-001__etta-vale/03-work-uniform-candidates/etta-vale__shared-uniform-candidate__v1.jpg')],
    alternateModeRefs: [],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
  'SW-RESIDENT-002': {
    sourceResidentId: 'SW-RESIDENT-002',
    primaryNaturalImage: url('SW-RESIDENT-002__zuri-xu/01-natural-authority/zuri-xu__natural-full-body__architectural-fashion-strategist.jpg'),
    cardImage: url('SW-RESIDENT-002__zuri-xu/02-closeups/zuri-xu__closeup__architectural-fashion-strategist.jpg'),
    closeupRefs: [url('SW-RESIDENT-002__zuri-xu/02-closeups/zuri-xu__closeup__architectural-fashion-strategist.jpg')],
    uniformRefs: [url('SW-RESIDENT-002__zuri-xu/03-work-uniform-candidates/zuri-xu__shared-uniform-candidate__v1.jpg')],
    alternateModeRefs: [],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
  'SW-RESIDENT-003': {
    sourceResidentId: 'SW-RESIDENT-003',
    primaryNaturalImage: url('SW-RESIDENT-003__jules-mercer/01-natural-authority/jules-mercer__natural-full-body__relaxed-romantic.jpg'),
    cardImage: url('SW-RESIDENT-003__jules-mercer/02-closeups/jules-mercer__closeup__relaxed-romantic.jpg'),
    closeupRefs: [url('SW-RESIDENT-003__jules-mercer/02-closeups/jules-mercer__closeup__relaxed-romantic.jpg')],
    uniformRefs: [url('SW-RESIDENT-003__jules-mercer/03-work-uniform-candidates/jules-mercer__shared-uniform-candidate__v1.jpg')],
    alternateModeRefs: [],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
  'SW-RESIDENT-004': {
    sourceResidentId: 'SW-RESIDENT-004',
    primaryNaturalImage: url('SW-RESIDENT-004__noa-kline/01-natural-authority/noa-kline__natural-full-body__understated-systems-dad.jpg'),
    cardImage: url('SW-RESIDENT-004__noa-kline/02-closeups/noa-kline__closeup-reference__02.jpg'),
    closeupRefs: [
      url('SW-RESIDENT-004__noa-kline/02-closeups/noa-kline__closeup-reference__01.jpg'),
      url('SW-RESIDENT-004__noa-kline/02-closeups/noa-kline__closeup-reference__02.jpg'),
      url('SW-RESIDENT-004__noa-kline/02-closeups/noa-kline__closeup-reference__03.jpg'),
    ],
    uniformRefs: [url('SW-RESIDENT-004__noa-kline/03-work-uniform-candidates/noa-kline__shared-uniform-candidate__v1.jpg')],
    alternateModeRefs: [],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
  'SW-RESIDENT-005': {
    sourceResidentId: 'SW-RESIDENT-005',
    primaryNaturalImage: url('SW-RESIDENT-005__caspian-reed/01-natural-authority/caspian-reed__natural-full-body__decadent-bohemian-aristocrat.jpg'),
    cardImage: url('SW-RESIDENT-005__caspian-reed/02-closeups/caspian-reed__closeup__decadent-bohemian-aristocrat.jpg'),
    closeupRefs: [url('SW-RESIDENT-005__caspian-reed/02-closeups/caspian-reed__closeup__decadent-bohemian-aristocrat.jpg')],
    uniformRefs: [url('SW-RESIDENT-005__caspian-reed/03-work-uniform-candidates/caspian-reed__shared-uniform-candidate__v1.jpg')],
    alternateModeRefs: [],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
  'SW-RESIDENT-006': {
    sourceResidentId: 'SW-RESIDENT-006',
    primaryNaturalImage: url('SW-RESIDENT-006__iona-wells/01-natural-authority/iona-wells__natural-full-body__precision-utilitarian.jpg'),
    cardImage: url('SW-RESIDENT-006__iona-wells/02-closeups/iona-wells__closeup__precision-utilitarian.jpg'),
    closeupRefs: [url('SW-RESIDENT-006__iona-wells/02-closeups/iona-wells__closeup__precision-utilitarian.jpg')],
    uniformRefs: [url('SW-RESIDENT-006__iona-wells/03-work-uniform-candidates/iona-wells__shared-uniform-candidate__v1.jpg')],
    alternateModeRefs: [url('SW-RESIDENT-006__iona-wells/04-alternate-modes/iona-wells__full-glam__alternate-mode.jpg')],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
  'SW-RESIDENT-007': {
    sourceResidentId: 'SW-RESIDENT-007',
    primaryNaturalImage: url('SW-RESIDENT-007__marlowe-saint/01-natural-authority/marlowe-saint__natural-full-body__off-duty-cultural-icon.jpg'),
    cardImage: url('SW-RESIDENT-007__marlowe-saint/01-natural-authority/marlowe-saint__natural-full-body__off-duty-cultural-icon.jpg'),
    closeupRefs: [],
    uniformRefs: [url('SW-RESIDENT-007__marlowe-saint/03-work-uniform-candidates/marlowe-saint__shared-uniform-candidate__corrected-larger-body-v1.jpg')],
    alternateModeRefs: [url('SW-RESIDENT-007__marlowe-saint/04-alternate-modes/marlowe-saint__grand-cultural-icon__alternate-reference.jpg')],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
  'SW-RESIDENT-008': {
    sourceResidentId: 'SW-RESIDENT-008',
    primaryNaturalImage: url('SW-RESIDENT-008__elio-vahn/01-natural-authority/elio-vahn__natural-full-body__private-club-strategist.jpg'),
    cardImage: url('SW-RESIDENT-008__elio-vahn/02-closeups/elio-vahn__closeup__private-club-strategist.jpg'),
    closeupRefs: [url('SW-RESIDENT-008__elio-vahn/02-closeups/elio-vahn__closeup__private-club-strategist.jpg')],
    uniformRefs: [url('SW-RESIDENT-008__elio-vahn/03-work-uniform-candidates/elio-vahn__shared-uniform-candidate__v1.jpg')],
    alternateModeRefs: [],
    supersededRefs: [],
    primaryNaturalStatus: 'FOUNDER_APPROVED',
  },
};

export function getResidentVisualProjection(sourceResidentId: string): ResidentVisualProjection | null {
  return PROJECTIONS[sourceResidentId] ?? null;
}

export function listResidentVisualProjections(): readonly ResidentVisualProjection[] {
  return Object.values(PROJECTIONS);
}

/** Default Casting card image — never uniform or alternate mode. */
export function resolveCastingCardImage(sourceResidentId: string): string | null {
  const v = getResidentVisualProjection(sourceResidentId);
  if (!v) return null;
  return v.cardImage;
}

export function assertCastingCardNotNonPrimary(sourceResidentId: string, candidateUrl: string): boolean {
  const v = getResidentVisualProjection(sourceResidentId);
  if (!v) return true;
  if (v.uniformRefs.includes(candidateUrl)) return false;
  if (v.alternateModeRefs.includes(candidateUrl)) return false;
  return true;
}
