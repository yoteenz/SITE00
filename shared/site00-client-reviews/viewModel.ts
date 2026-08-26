/** P0.CLIENT.2A — Shared review view models for web, app, and admin surfaces. */

import type { ClientReviewDetail, ClientReviewQueuePayload } from './types.js';

export type ClientReviewAppViewModel = ClientReviewDetail;

export type ClientReviewAdminFeedbackView = {
  projectSlug: string;
  reviewId: string;
  reviewTitle: string;
  reviewStatus: string;
  comments: ClientReviewDetail['comments'];
  internalComments: ClientReviewDetail['comments'];
  annotations: ClientReviewDetail['annotations'];
  decisionHistory: ClientReviewDetail['decisionHistory'];
  approvalReceipt: Record<string, unknown> | null;
  revisionReceipts: Record<string, unknown>[];
};

/** App consumes the same canonical durable review state as web — no shadow store. */
export function buildClientReviewAppViewModel(detail: ClientReviewDetail): ClientReviewAppViewModel {
  return detail;
}

export function buildClientReviewWebViewModel(detail: ClientReviewDetail): ClientReviewDetail {
  return detail;
}

export function buildClientReviewAdminFeedbackView(input: {
  projectSlug: string;
  detail: ClientReviewDetail;
  allComments: ClientReviewDetail['comments'];
  approvalReceipt: Record<string, unknown> | null;
  revisionReceipts: Record<string, unknown>[];
}): ClientReviewAdminFeedbackView {
  const clientComments = input.allComments.filter((c) => c.visibility === 'CLIENT_AND_SITE00');
  const internalComments = input.allComments.filter((c) => c.visibility === 'SITE00_INTERNAL');
  return {
    projectSlug: input.projectSlug,
    reviewId: input.detail.review.reviewId,
    reviewTitle: input.detail.review.title,
    reviewStatus: input.detail.review.statusLabel,
    comments: clientComments,
    internalComments,
    annotations: input.detail.annotations,
    decisionHistory: input.detail.decisionHistory,
    approvalReceipt: input.approvalReceipt,
    revisionReceipts: input.revisionReceipts,
  };
}

export function buildClientReviewQueueAppViewModel(queue: ClientReviewQueuePayload): ClientReviewQueuePayload {
  return queue;
}
