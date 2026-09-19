/**
 * P0.VR.3H — Page creation and review receipts.
 */

import type { MissingPagePlanEntry, PageCreationReceipt, PageReviewReceipt, PageReviewSetReceipt } from './types.js';
import { P0_VR_3H_LINEAGE } from './constants.js';
import { evaluateDraftRouteGuard } from './draftRouteGuard.js';

export function buildPageCreationReceipt(entry: MissingPagePlanEntry, componentPath: string): PageCreationReceipt {
  const guard = evaluateDraftRouteGuard(entry.route);
  return {
    receiptId: `page-creation:${entry.screenId}:${Date.now()}`,
    pageId: entry.screenId.replace(/^missing-/, ''),
    projectId: entry.projectId,
    route: entry.route,
    family: entry.family,
    completionMode: entry.completionMode,
    authorType: entry.authorType,
    createdBySprint: P0_VR_3H_LINEAGE,
    reviewStatus: entry.reviewStatus,
    publishStatus: entry.publishStatus,
    contentProvenance: [...entry.contentProvenance],
    componentPath,
    previewOnly: guard.previewOnly,
    productionNavBlocked: guard.productionNavBlocked,
    createdAt: new Date().toISOString(),
  };
}

export function buildPageReviewReceipt(input: {
  pageId: string;
  projectId: MissingPagePlanEntry['projectId'];
  route: string;
  reviewStatus: PageReviewReceipt['reviewStatus'];
  dimensionsReviewed: PageReviewReceipt['dimensionsReviewed'];
  decidedBy?: PageReviewReceipt['decidedBy'];
  notes?: string;
}): PageReviewReceipt {
  return {
    receiptId: `page-review:${input.pageId}:${Date.now()}`,
    pageId: input.pageId,
    projectId: input.projectId,
    route: input.route,
    reviewStatus: input.reviewStatus,
    dimensionsReviewed: input.dimensionsReviewed,
    decidedAt: new Date().toISOString(),
    decidedBy: input.decidedBy ?? 'FOUNDER',
    notes: input.notes,
  };
}

export function buildPageReviewSetReceipt(input: {
  setId: string;
  setLabel: string;
  projectId: MissingPagePlanEntry['projectId'];
  pageIds: string[];
  batchApprovalAllowed: boolean;
}): PageReviewSetReceipt {
  return {
    receiptId: `page-review-set:${input.setId}:${Date.now()}`,
    setId: input.setId,
    setLabel: input.setLabel,
    projectId: input.projectId,
    pageIds: input.pageIds,
    batchApprovalAllowed: input.batchApprovalAllowed,
    createdAt: new Date().toISOString(),
  };
}

const SITE00_COMPONENT_BY_SCREEN: Record<string, string> = {
  'missing-guide': 'src/site00/pages/information/GuidePage.tsx',
  'missing-sound': 'src/site00/pages/information/SoundPage.tsx',
  'missing-faq': 'src/site00/pages/information/FaqPage.tsx',
  'missing-contact': 'src/site00/pages/information/ContactPage.tsx',
  'missing-forgot-password': 'src/site00/pages/auth/Site00ForgotPasswordPage.tsx',
  'missing-reset-password': 'src/site00/pages/auth/Site00ResetPasswordPage.tsx',
  'missing-blueprints': 'src/site00/pages/complex/BlueprintsPage.tsx',
  'missing-account-profile': 'src/site00/pages/complex/AccountPage.tsx',
  'missing-brand-page': 'src/site00/pages/complex/BrandPage.tsx',
};

export function buildAllSite00CreationReceipts(planEntries: MissingPagePlanEntry[]): PageCreationReceipt[] {
  return planEntries
    .filter((e) => e.projectId === 'SITE00' && e.implementationStatus === 'IMPLEMENTED_DRAFT')
    .map((e) => buildPageCreationReceipt(e, SITE00_COMPONENT_BY_SCREEN[e.screenId] ?? 'unknown'));
}
