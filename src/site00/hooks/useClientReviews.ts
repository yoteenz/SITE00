import { useCallback, useEffect, useState } from 'react';
import type {
  ClientReviewDetail,
  ClientReviewQueuePayload,
} from '../../../shared/site00-client-reviews/types.js';
import { PREVIEW_REVIEW_PROJECT_SLUG } from '../../../shared/site00-client-reviews/previewSeed.js';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

async function reviewFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useClientReviewQueue(projectSlug: string) {
  const [data, setData] = useState<ClientReviewQueuePayload | null>(null);
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectSlug) return;
    setState('loading');
    setError(null);
    try {
      const params = new URLSearchParams({ action: 'queue', projectSlug });
      const json = await reviewFetch<ClientReviewQueuePayload>(`/api/site00/client-reviews?${params}`);
      setData(json);
      setState('ready');
    } catch (e) {
      if (projectSlug === PREVIEW_REVIEW_PROJECT_SLUG) {
        const { PREVIEW_REVIEW_OBJECTS } = await import('../../../shared/site00-client-reviews/previewSeed.js');
        setData({
          projectSlug,
          reviews: PREVIEW_REVIEW_OBJECTS,
          actionableCount: PREVIEW_REVIEW_OBJECTS.filter((r) => r.actionRequired).length,
          emptyMessage: null,
        });
        setState('ready');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load reviews');
      setState('error');
    }
  }, [projectSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, state, error, reload: load };
}

export function useClientReviewDetail(projectSlug: string, reviewId: string) {
  const [data, setData] = useState<ClientReviewDetail | null>(null);
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectSlug || !reviewId) return;
    setState('loading');
    setError(null);
    try {
      const params = new URLSearchParams({ action: 'detail', projectSlug, reviewId });
      const json = await reviewFetch<ClientReviewDetail>(`/api/site00/client-reviews?${params}`);
      setData(json);
      setState('ready');
    } catch (e) {
      if (projectSlug === PREVIEW_REVIEW_PROJECT_SLUG) {
        const { PREVIEW_REVIEW_OBJECTS, getPreviewVersionsForReview, PREVIEW_DECISION_HISTORY } =
          await import('../../../shared/site00-client-reviews/previewSeed.js');
        const review = PREVIEW_REVIEW_OBJECTS.find((r) => r.reviewId === reviewId);
        if (!review) throw e;
        setData({
          review,
          versions: getPreviewVersionsForReview(reviewId),
          comments: [],
          annotations: [],
          decisionHistory: PREVIEW_DECISION_HISTORY,
          permissions: {
            canComment: true,
            canAnnotate: true,
            canApprove: review.approvalAllowed,
            canRequestRevision: review.revisionAllowed,
            canDecline: review.declineAllowed,
            canRequestRevisit: true,
          },
        });
        setState('ready');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load review');
      setState('error');
    }
  }, [projectSlug, reviewId]);

  useEffect(() => {
    void load();
  }, [load]);

  const postAction = useCallback(
    async (action: string, body: Record<string, unknown>) => {
      const result = await reviewFetch<unknown>('/api/site00/client-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, projectSlug, ...body }),
      });
      await load();
      return result;
    },
    [projectSlug, load],
  );

  return { data, state, error, reload: load, postAction };
}
