/**
 * P0.VR.AUTH.1 — Design authority approval + supersession receipts.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export type DesignAuthoritySupersessionReason =
  | 'OUTDATED_DESIGN'
  | 'WRONG_REFERENCE'
  | 'NEW_FOUNDER_DIRECTION'
  | 'OTHER'
  | 'FOUNDER_REPLACE';

export type DesignAuthorityApprovalReceipt = {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  oldAuthorityVersionId: string | null;
  newAuthorityVersionId: string;
  approvedAt: string;
  status: 'APPROVED';
  reason: DesignAuthoritySupersessionReason;
};

export type DesignAuthoritySupersessionReceipt = {
  oldAuthorityVersionId: string;
  newAuthorityVersionId: string;
  supersededAt: string;
  reason: DesignAuthoritySupersessionReason;
};

const approvalReceipts: DesignAuthorityApprovalReceipt[] = [];
const supersessionReceipts: DesignAuthoritySupersessionReceipt[] = [];

export function recordDesignAuthorityApprovalReceipt(
  receipt: DesignAuthorityApprovalReceipt,
): DesignAuthorityApprovalReceipt {
  approvalReceipts.push(receipt);
  return receipt;
}

export function recordDesignAuthoritySupersessionReceipt(
  receipt: DesignAuthoritySupersessionReceipt,
): DesignAuthoritySupersessionReceipt {
  supersessionReceipts.push(receipt);
  return receipt;
}

export function listDesignAuthorityApprovalReceipts(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): DesignAuthorityApprovalReceipt[] {
  return approvalReceipts.filter(
    (r) => r.projectId === projectId && r.pageId === pageId && r.viewport === viewport,
  );
}

export function listDesignAuthoritySupersessionReceipts(
  oldAuthorityVersionId?: string,
): DesignAuthoritySupersessionReceipt[] {
  if (!oldAuthorityVersionId) return [...supersessionReceipts];
  return supersessionReceipts.filter((r) => r.oldAuthorityVersionId === oldAuthorityVersionId);
}

export function resetDesignAuthorityReceiptsForTest(): void {
  approvalReceipts.length = 0;
  supersessionReceipts.length = 0;
}
