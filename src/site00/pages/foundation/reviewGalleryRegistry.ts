/**
 * Canonical screen inventory for `/foundation/review` (founder gallery only).
 * Client portal views use `reviewAnchorForView`; completion uses dedicated anchors.
 */
import type { DfView } from '../../foundation-client/model';
import { DF_VIEW_META } from '../../foundation-client/model';
import { reviewAnchorForView } from './reviewLinks';

export type ReviewGalleryFamilyId =
  | 'INTAKE'
  | 'COMMERCE'
  | 'PORTAL'
  | 'RECORDS'
  | 'COMPLETION'
  | 'FOUNDER_OPS'
  | 'BLDR';

export type ReviewGalleryFamily = {
  id: ReviewGalleryFamilyId;
  label: string;
};

export const REVIEW_GALLERY_FAMILIES: ReviewGalleryFamily[] = [
  { id: 'INTAKE', label: 'A · DIGITAL FOUNDATION INTAKE' },
  { id: 'COMMERCE', label: 'B · RECOMMENDATION / COMMERCE' },
  { id: 'PORTAL', label: 'C · CLIENT PROJECT PORTAL' },
  { id: 'RECORDS', label: 'D · RECORDS / OWNERSHIP' },
  { id: 'COMPLETION', label: 'E · COMPLETION / DIGITAL LOCATION' },
  { id: 'FOUNDER_OPS', label: 'F · FOUNDER OPERATIONS (AUTH REQUIRED)' },
  { id: 'BLDR', label: 'G · BLDR STUDIO' },
];

/** Review-only anchors (not `DfView` routes on the live artifact). */
export const REVIEW_ANCHOR_COMPLETE = 'df-r-COMPLETE';
export const REVIEW_ANCHOR_DIGITAL_LOCATION = 'df-r-DIGITAL_LOCATION';

export type IntakeReviewView = Extract<DfView, 'P01' | 'P02' | 'P03'>;
export type CommerceReviewView = Extract<DfView, 'P04' | 'P05' | 'P06'>;
export type PortalReviewView = Extract<
  DfView,
  'OVERVIEW' | 'ROADMAP' | 'STAGE' | 'NEEDS_YOU' | 'RECORDS' | 'RECORD' | 'COMM_PREFS'
>;

export type BldrReviewRoomId = 'PLACE' | 'FEEL' | 'WORK' | 'PACE' | 'BLUEPRINT';

export function reviewAnchorForBldrRoom(room: BldrReviewRoomId): string {
  return `df-r-bldr-${room}`;
}

export const BLDR_REVIEW_ROOMS: { id: BldrReviewRoomId; label: string }[] = [
  { id: 'PLACE', label: 'BLDR · PLACE' },
  { id: 'FEEL', label: 'BLDR · FEEL' },
  { id: 'WORK', label: 'BLDR · WORK' },
  { id: 'PACE', label: 'BLDR · PACE' },
  { id: 'BLUEPRINT', label: 'BLDR · BLUEPRINT' },
];

export const INTAKE_VIEWS: IntakeReviewView[] = ['P01', 'P02', 'P03'];
export const COMMERCE_VIEWS: CommerceReviewView[] = ['P04', 'P05', 'P06'];
export const PORTAL_VIEWS: PortalReviewView[] = [
  'OVERVIEW',
  'ROADMAP',
  'STAGE',
  'NEEDS_YOU',
  'RECORDS',
  'RECORD',
  'COMM_PREFS',
];

/** All gallery anchor ids (unique). */
export function allReviewAnchors(): string[] {
  const df = [...INTAKE_VIEWS, ...COMMERCE_VIEWS, ...PORTAL_VIEWS].map(reviewAnchorForView);
  return [
    ...df,
    REVIEW_ANCHOR_COMPLETE,
    REVIEW_ANCHOR_DIGITAL_LOCATION,
    ...BLDR_REVIEW_ROOMS.map((r) => reviewAnchorForBldrRoom(r.id)),
  ];
}

export function reviewScreenTitle(view: DfView): string {
  const m = DF_VIEW_META[view];
  return `${m.index} · ${m.label}`;
}

/** Preview fixtures used by the review gallery (demonstration only). */
export const REVIEW_FIXTURE_IDS = {
  quote: 'A_BASE',
  portalPaid: 'J_PAYMENT_SUCCESS',
  completeCredit: 'M_COMPLETE_CREDIT',
} as const;
