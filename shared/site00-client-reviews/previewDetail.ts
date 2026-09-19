import type { ClientReviewAnnotation, ClientReviewComment, ClientReviewDetail } from './types.js';
import {
  PREVIEW_DECISION_HISTORY,
  PREVIEW_REVIEW_OBJECTS,
  PREVIEW_REVIEW_PROJECT_ID,
  getPreviewVersionsForReview,
} from './previewSeed.js';

const SAMPLE_COMMENTS: ClientReviewComment[] = [
  {
    commentId: 'c-preview-1',
    projectId: PREVIEW_REVIEW_PROJECT_ID,
    reviewId: 'review-identity-direction-02',
    versionId: 'rv-id-dir-v04',
    viewport: 'DESKTOP',
    authorId: 'client-preview',
    authorRole: 'CLIENT_OWNER',
    body: 'Love the spacing on the hero — could we try a slightly warmer accent?',
    annotationId: null,
    parentCommentId: null,
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-08-25T14:00:00Z',
    resolvedAt: null,
    visibility: 'CLIENT_AND_SITE00',
    clientStatus: 'RECEIVED',
  },
  {
    commentId: 'c-preview-2',
    projectId: PREVIEW_REVIEW_PROJECT_ID,
    reviewId: 'review-identity-direction-02',
    versionId: 'rv-id-dir-v04',
    viewport: 'MOBILE',
    authorId: 'client-preview',
    authorRole: 'CLIENT_OWNER',
    body: 'Mobile nav feels clean. Ready to compare against Direction 01.',
    annotationId: null,
    parentCommentId: null,
    createdAt: '2026-08-25T15:30:00Z',
    updatedAt: '2026-08-25T15:30:00Z',
    resolvedAt: null,
    visibility: 'CLIENT_AND_SITE00',
    clientStatus: 'RECEIVED',
  },
];

const SAMPLE_ANNOTATIONS: ClientReviewAnnotation[] = [
  {
    annotationId: 'a-preview-1',
    projectId: PREVIEW_REVIEW_PROJECT_ID,
    reviewId: 'review-identity-direction-02',
    versionId: 'rv-id-dir-v04',
    viewport: 'DESKTOP',
    markerIndex: 1,
    xPercent: 32,
    yPercent: 28,
    widthPercent: null,
    heightPercent: null,
    commentId: null,
    createdAt: '2026-08-25T16:00:00Z',
  },
  {
    annotationId: 'a-preview-2',
    projectId: PREVIEW_REVIEW_PROJECT_ID,
    reviewId: 'review-identity-direction-02',
    versionId: 'rv-id-dir-v04',
    viewport: 'DESKTOP',
    markerIndex: 2,
    xPercent: 68,
    yPercent: 52,
    widthPercent: null,
    heightPercent: null,
    commentId: null,
    createdAt: '2026-08-25T16:05:00Z',
  },
];

export function buildPreviewReviewDetail(reviewId: string): ClientReviewDetail | null {
  const review = PREVIEW_REVIEW_OBJECTS.find((r) => r.reviewId === reviewId);
  if (!review) return null;

  const versions = getPreviewVersionsForReview(reviewId);
  const comments = SAMPLE_COMMENTS.filter((c) => c.reviewId === reviewId);
  const annotations = SAMPLE_ANNOTATIONS.filter((a) => a.reviewId === reviewId);

  return {
    review,
    versions,
    comments,
    annotations,
    decisionHistory: PREVIEW_DECISION_HISTORY,
    permissions: {
      canComment: review.commentingAllowed,
      canAnnotate: review.annotationAllowed,
      canApprove: review.approvalAllowed,
      canRequestRevision: review.revisionAllowed,
      canDecline: review.declineAllowed,
      canRequestRevisit: review.status === 'APPROVED' || review.status === 'REVISION_IN_PROGRESS',
    },
  };
}
