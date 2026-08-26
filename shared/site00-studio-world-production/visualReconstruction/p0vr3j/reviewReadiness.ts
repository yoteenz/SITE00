/**
 * P0.VR.3J — Composer draft review readiness + enriched queue/sets.
 */

import { getLatestImplementationSnapshot } from '../p0vr3e/implementationSnapshotRegistry.js';
import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from '../p0vr3h/constants.js';
import { isSimpleCompletionMode } from '../p0vr3h/classifier.js';
import { getActiveMissingPageCompletionPlan } from '../p0vr3h/repoScopedPlan.js';
import {
  buildComposerReviewQueue,
  buildComposerReviewSets,
  blockComplexPageBulkApproval,
} from '../p0vr3h/reviewQueue.js';
import type { ReviewDimension } from '../p0vr3h/types.js';
import { authUtilitySetFunctionalValidationPassed, validateAuthUtilityPage } from './authFunctionalValidation.js';
import { buildComplexShellReviewBriefs } from './complexShellBriefs.js';
import type {
  ComposerDraftReadinessStatus,
  EnrichedComposerReviewQueueEntry,
  EnrichedComposerReviewSet,
} from './types.js';

const CONTENT_COUNTS: Record<string, number> = {
  guide: 4,
  sound: 3,
  faq: 6,
  contact: 2,
  'forgot-password': 1,
  'reset-password': 1,
};

const PLACEHOLDER_FLAGS: Record<string, string[]> = {
  sound: ['PLACEHOLDER UNTIL CANONICAL SOUND DESIGN'],
};

function inferContentCount(pageId: string): number {
  return CONTENT_COUNTS[pageId] ?? 0;
}

function detectContentPlaceholders(pageId: string): string[] {
  const flags = [...(PLACEHOLDER_FLAGS[pageId] ?? [])];
  if (pageId === 'sound') {
    flags.push('Sound page contains explicit placeholder copy');
  }
  return flags;
}

function snapshotUrl(pageId: string, viewport: 'mobile' | 'tablet' | 'desktop'): string | null {
  const snap = getLatestImplementationSnapshot('site00', pageId, viewport);
  if (!snap || snap.captureStatus !== 'CURRENT' || !snap.qaPassed) return null;
  return snap.publicUrl || null;
}

function screenshotsComplete(pageId: string): boolean {
  return (
    Boolean(snapshotUrl(pageId, 'mobile')) &&
    Boolean(snapshotUrl(pageId, 'tablet')) &&
    Boolean(snapshotUrl(pageId, 'desktop'))
  );
}

function captureFailures(pageId: string): string[] {
  const failures: string[] = [];
  for (const viewport of ['mobile', 'tablet', 'desktop'] as const) {
    const snap = getLatestImplementationSnapshot('site00', pageId, viewport);
    if (!snap) failures.push(`${viewport}: NO_SNAPSHOT`);
    else if (snap.captureStatus !== 'CURRENT' || !snap.qaPassed) {
      failures.push(`${viewport}: ${snap.error ?? snap.qaIssues.join(',')}`);
    }
  }
  return failures;
}

export function resolveComposerDraftReadiness(pageId: string): ComposerDraftReadinessStatus {
  const plan = getActiveMissingPageCompletionPlan();
  const entry = plan.entries.find(
    (e) => e.projectId === 'SITE00' && e.screenId.replace(/^missing-/, '') === pageId,
  );
  if (!entry) return 'IMPLEMENTED_DRAFT';

  if (!screenshotsComplete(pageId)) return 'SCREENSHOT_REVIEW_BLOCKED';

  if (entry.creativeDirectionRequired) return 'NEEDS_CREATIVE_DIRECTION';
  if (entry.functionalReviewRequired) return 'NEEDS_FUNCTIONAL_REVIEW';

  const placeholders = detectContentPlaceholders(pageId);
  if (placeholders.length > 0 && pageId === 'sound') return 'NEEDS_CONTENT_REVIEW';

  if (isSimpleCompletionMode(entry.completionMode) && entry.implementationStatus === 'IMPLEMENTED_DRAFT') {
    return 'READY_FOR_REVIEW';
  }

  return 'IMPLEMENTED_DRAFT';
}

function buildDimensionStatus(
  pageId: string,
  dimensions: ReviewDimension[],
  readiness: ComposerDraftReadinessStatus,
): Record<ReviewDimension, 'PENDING' | 'PASS' | 'BLOCKED'> {
  const status: Record<ReviewDimension, 'PENDING' | 'PASS' | 'BLOCKED'> = {
    VISUAL: 'PENDING',
    CONTENT: 'PENDING',
    FUNCTION: 'PENDING',
  };

  if (readiness === 'SCREENSHOT_REVIEW_BLOCKED') {
    for (const d of dimensions) status[d] = 'BLOCKED';
    return status;
  }

  if (readiness === 'NEEDS_CONTENT_REVIEW') {
    if (dimensions.includes('CONTENT')) status.CONTENT = 'BLOCKED';
  }

  if (pageId === 'forgot-password' || pageId === 'reset-password') {
    const validation = validateAuthUtilityPage(pageId);
    status.FUNCTION = validation.passed ? 'PASS' : 'BLOCKED';
  }

  return status;
}

function buildBadges(entry: EnrichedComposerReviewQueueEntry): string[] {
  const badges = ['COMPOSER DRAFT'];
  if (entry.family === 'INFORMATION') badges.push('INFORMATION FAMILY');
  if (entry.family === 'AUTH' || entry.route.includes('password')) badges.push('AUTH FAMILY');
  if (entry.readinessStatus === 'READY_FOR_REVIEW') badges.push('READY FOR REVIEW');
  if (entry.contentPlaceholders.length) badges.push('HAS PLACEHOLDERS');
  if (entry.readinessStatus === 'NEEDS_FUNCTIONAL_REVIEW') badges.push('FUNCTIONAL CHECK REQUIRED');
  if (entry.readinessStatus === 'NEEDS_CREATIVE_DIRECTION') badges.push('NEEDS CREATIVE DIRECTION');
  if (entry.readinessStatus === 'SCREENSHOT_REVIEW_BLOCKED') badges.push('SCREENSHOT REVIEW BLOCKED');
  return badges;
}

export function buildEnrichedComposerReviewQueue(): EnrichedComposerReviewQueueEntry[] {
  const base = buildComposerReviewQueue();

  return base.map((entry) => {
    const readinessStatus = resolveComposerDraftReadiness(entry.pageId);
    const contentPlaceholders = detectContentPlaceholders(entry.pageId);
    const enriched: EnrichedComposerReviewQueueEntry = {
      ...entry,
      screenshots: {
        mobile: snapshotUrl(entry.pageId, 'mobile'),
        tablet: snapshotUrl(entry.pageId, 'tablet'),
        desktop: snapshotUrl(entry.pageId, 'desktop'),
      },
      readinessStatus,
      badges: [],
      inferredContentCount: inferContentCount(entry.pageId),
      functionalDependencies:
        entry.pageId === 'forgot-password' || entry.pageId === 'reset-password'
          ? ['Supabase auth', 'Email delivery', 'Sign-in route']
          : [],
      dimensionStatus: buildDimensionStatus(entry.pageId, entry.reviewDimensions, readinessStatus),
      screenshotComplete: screenshotsComplete(entry.pageId),
      contentPlaceholders,
      captureFailures: captureFailures(entry.pageId),
      readyForApproval: false,
    };
    const planEntry = getActiveMissingPageCompletionPlan().entries.find(
      (e) => e.screenId.replace(/^missing-/, '') === entry.pageId,
    );
    enriched.readyForApproval =
      readinessStatus === 'READY_FOR_REVIEW' &&
      !planEntry?.creativeDirectionRequired &&
      !planEntry?.functionalReviewRequired &&
      contentPlaceholders.length === 0;
    enriched.badges = buildBadges(enriched);
    return enriched;
  });
}

export function buildEnrichedComposerReviewSets(): EnrichedComposerReviewSet[] {
  const queue = buildEnrichedComposerReviewQueue();
  const sets = buildComposerReviewSets();

  return sets.map((set) => {
    const members = queue.filter((q) => set.pageIds.includes(q.pageId));
    const screenshotsComplete = members.every((m) => m.screenshotComplete);
    const placeholders = members.flatMap((m) => m.contentPlaceholders);
    const functionalQa =
      set.setId === 'site00-auth-utilities' ? authUtilitySetFunctionalValidationPassed() : true;
    const readyForReview =
      members.length > 0 &&
      members.every((m) => m.readinessStatus === 'READY_FOR_REVIEW') &&
      !blockComplexPageBulkApproval(set.pageIds);

    return {
      ...set,
      sharedFamily: set.setId.includes('information') ? 'INFORMATION' : set.setId.includes('auth') ? 'AUTH' : 'NDXBOOK_WORKSPACE',
      sharedTemplate: set.setId.includes('information')
        ? 'Site00ExperiencePage + Site00PagePrimitives'
        : set.setId.includes('auth')
          ? 'Site00AuthExperiencePage'
          : 'FounderWorkspaceShell',
      sharedShell: set.setId.includes('ndxbook') ? 'FounderWorkspaceShell' : 'Site00 public shell',
      individualContentDifferences: Object.fromEntries(
        members.map((m) => [m.pageId, [`title:${m.pageId}`, `content blocks:${m.inferredContentCount}`]]),
      ),
      inferredContent: Object.fromEntries(members.map((m) => [m.pageId, m.inferredContentCount])),
      unresolvedPlaceholders: placeholders,
      viewportQa: {
        mobile: members.every((m) => Boolean(m.screenshots.mobile)),
        tablet: members.every((m) => Boolean(m.screenshots.tablet)),
        desktop: members.every((m) => Boolean(m.screenshots.desktop)),
      },
      functionalQa,
      readyForReview,
      screenshotsComplete,
    };
  });
}

export function buildReviewQueueSummary() {
  const queue = buildEnrichedComposerReviewQueue();
  const complex = buildComplexShellReviewBriefs();

  return {
    composerDrafts: queue.length,
    readyForReview: queue.filter((q) => q.readinessStatus === 'READY_FOR_REVIEW').length,
    creativeDirection: queue.filter((q) => q.readinessStatus === 'NEEDS_CREATIVE_DIRECTION').length,
    functionalReview: queue.filter((q) => q.readinessStatus === 'NEEDS_FUNCTIONAL_REVIEW').length,
    screenshotBlocked: queue.filter((q) => q.readinessStatus === 'SCREENSHOT_REVIEW_BLOCKED').length,
    contentBlocked: queue.filter((q) => q.readinessStatus === 'NEEDS_CONTENT_REVIEW').length,
    complexShells: complex.length,
    snapshotLabel: COMPOSER_DRAFT_SNAPSHOT_LABEL,
  };
}

export function canFinalApprovePage(pageId: string): boolean {
  const entry = buildEnrichedComposerReviewQueue().find((q) => q.pageId === pageId);
  if (!entry) return false;
  if (entry.readinessStatus === 'NEEDS_CREATIVE_DIRECTION' || entry.readinessStatus === 'NEEDS_FUNCTIONAL_REVIEW') {
    return false;
  }
  if (entry.readinessStatus === 'NEEDS_CONTENT_REVIEW' && pageId === 'sound') return false;
  return entry.readyForApproval;
}
