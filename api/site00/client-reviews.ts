import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import {
  getClientReviewQueue,
  getClientReviewDetail,
  addClientReviewComment,
  addClientReviewAnnotation,
  submitClientApproval,
  submitClientRevision,
  submitClientDecline,
  submitRevisitRequest,
} from '../_lib/site00ClientReviews/reviewService.js';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function safeError(e: unknown): { status: number; message: string } {
  const msg = e instanceof Error ? e.message : 'Internal error';
  if (msg === 'PROJECT NOT FOUND' || msg === 'REVIEW NOT FOUND') return { status: 404, message: msg };
  if (msg === 'FORBIDDEN') return { status: 403, message: 'Access denied' };
  if (msg === 'STALE_VERSION') return { status: 409, message: 'This review has been updated. Refresh to review the latest version.' };
  return { status: 500, message: 'We could not complete this review action. Try again.' };
}

/** Client Reviews API — queue, detail, comments, annotations, decisions. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const action = String(
    req.query.action ?? (typeof req.body === 'object' && req.body ? (req.body as { action?: string }).action : '') ?? '',
  );
  const projectSlug = String(req.query.projectSlug ?? (req.body as { projectSlug?: string })?.projectSlug ?? '');

  try {
    if (req.method === 'GET') {
      if (action === 'queue') {
        if (!projectSlug) return res.status(400).json({ error: 'projectSlug required' });
        return res.status(200).json(await getClientReviewQueue(projectSlug, user.email, user.id));
      }
      if (action === 'detail') {
        const reviewId = String(req.query.reviewId ?? '');
        if (!projectSlug || !reviewId) return res.status(400).json({ error: 'projectSlug and reviewId required' });
        const roleOverride = req.query.roleOverride ? String(req.query.roleOverride) : undefined;
        return res.status(200).json(
          await getClientReviewDetail({
            projectSlug,
            reviewId,
            email: user.email,
            userId: user.id,
            roleOverride: roleOverride as 'CLIENT_OWNER' | 'CLIENT_COLLABORATOR' | 'CLIENT_VIEWER' | undefined,
          }),
        );
      }
      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const postAction = String(body.action ?? action);

      if (postAction === 'comment') {
        return res.status(200).json(
          await addClientReviewComment({
            projectSlug,
            reviewId: String(body.reviewId ?? ''),
            versionId: String(body.versionId ?? ''),
            viewport: body.viewport ?? null,
            body: String(body.body ?? ''),
            parentCommentId: body.parentCommentId ? String(body.parentCommentId) : null,
            email: user.email,
            userId: user.id,
            role: body.role,
          }),
        );
      }

      if (postAction === 'annotation') {
        return res.status(200).json(
          await addClientReviewAnnotation({
            projectSlug,
            reviewId: String(body.reviewId ?? ''),
            versionId: String(body.versionId ?? ''),
            viewport: body.viewport,
            xPercent: Number(body.xPercent),
            yPercent: Number(body.yPercent),
            body: body.body ? String(body.body) : undefined,
            email: user.email,
            userId: user.id,
            role: body.role,
          }),
        );
      }

      if (postAction === 'approve') {
        return res.status(200).json(
          await submitClientApproval({
            projectSlug,
            reviewId: String(body.reviewId ?? ''),
            versionId: String(body.versionId ?? ''),
            expectedVersionId: String(body.expectedVersionId ?? ''),
            requestId: String(body.requestId ?? ''),
            commentSnapshot: body.commentSnapshot ? String(body.commentSnapshot) : null,
            email: user.email,
            userId: user.id,
            role: body.role,
          }),
        );
      }

      if (postAction === 'revision') {
        return res.status(200).json(
          await submitClientRevision({
            projectSlug,
            reviewId: String(body.reviewId ?? ''),
            versionId: String(body.versionId ?? ''),
            expectedVersionId: String(body.expectedVersionId ?? ''),
            requestId: String(body.requestId ?? ''),
            summary: String(body.summary ?? ''),
            category: body.category ? String(body.category) : null,
            commentIds: Array.isArray(body.commentIds) ? body.commentIds.map(String) : [],
            annotationIds: Array.isArray(body.annotationIds) ? body.annotationIds.map(String) : [],
            email: user.email,
            userId: user.id,
            role: body.role,
          }),
        );
      }

      if (postAction === 'decline') {
        return res.status(200).json(
          await submitClientDecline({
            projectSlug,
            reviewId: String(body.reviewId ?? ''),
            versionId: String(body.versionId ?? ''),
            expectedVersionId: String(body.expectedVersionId ?? ''),
            requestId: String(body.requestId ?? ''),
            email: user.email,
            userId: user.id,
            role: body.role,
          }),
        );
      }

      if (postAction === 'revisit') {
        return res.status(200).json(
          await submitRevisitRequest({
            projectSlug,
            reviewId: String(body.reviewId ?? ''),
            versionId: String(body.versionId ?? ''),
            email: user.email,
            userId: user.id,
          }),
        );
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/site00/client-reviews]', e);
    const { status, message } = safeError(e);
    return res.status(status).json({ error: message });
  }
}
