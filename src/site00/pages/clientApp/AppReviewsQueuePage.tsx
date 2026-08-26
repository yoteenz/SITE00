import { useOutletContext, useParams, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useClientReviewDetail, useClientReviewQueue } from '../../hooks/useClientReviews';
import { ClientAppReviewQueueList } from '../../components/clientApp/ClientAppReviewQueueList';
import {
  ClientAppReviewDetailView,
  resolveReviewModeFromPath,
} from '../../components/clientApp/ClientAppReviewDetailView';
import { AppEmptyState, AppLoadingState } from '../../components/clientApp/Site00ClientAppShell';
import type { AppOutletContext } from './AppProjectLayout';
import { PREVIEW_REVIEW_OBJECTS } from '../../../../shared/site00-client-reviews/previewSeed.js';
import { buildPreviewReviewDetail } from '../../../../shared/site00-client-reviews/previewDetail.js';
import { useAppPaths, useIsAppPreview } from '../../hooks/useAppBasePath';

export default function AppReviewsQueuePage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  const isPreview = useIsAppPreview();
  const paths = useAppPaths(manifest.projectSlug);
  const reviewSlug = isPreview ? 'preview-client-room' : manifest.projectSlug;
  const { data, state, error } = useClientReviewQueue(reviewSlug);

  if (!isPreview && state === 'loading') return <AppLoadingState />;
  if (!isPreview && (state === 'error' || !data)) {
    return <AppEmptyState title="REVIEWS UNAVAILABLE" body={error ?? undefined} />;
  }

  const reviews = isPreview ? PREVIEW_REVIEW_OBJECTS : data!.reviews;

  return (
    <ClientAppReviewQueueList
      reviews={reviews}
      emptyMessage={isPreview ? null : data?.emptyMessage}
      reviewHref={(reviewId) => paths.review(reviewId)}
    />
  );
}

async function postReviewAction(projectSlug: string, body: Record<string, unknown>) {
  const res = await fetch('/api/site00/client-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectSlug, ...body }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? 'Action failed');
  }
  return res.json();
}

export function AppReviewDetailPage() {
  const { reviewId = '' } = useParams();
  const location = useLocation();
  const { manifest } = useOutletContext<AppOutletContext>();
  const isPreview = useIsAppPreview();
  const paths = useAppPaths(manifest.projectSlug);
  const reviewSlug = isPreview ? 'preview-client-room' : manifest.projectSlug;
  const mode = resolveReviewModeFromPath(location.pathname);

  const previewDetail = useMemo(
    () => (isPreview ? buildPreviewReviewDetail(reviewId) : null),
    [isPreview, reviewId],
  );

  const { data, state, error, reload } = useClientReviewDetail(
    isPreview ? '' : reviewSlug,
    isPreview ? '' : reviewId,
  );

  if (!isPreview && state === 'loading') return <AppLoadingState />;
  if (!isPreview && (state === 'error' || !data)) {
    return <AppEmptyState title="REVIEW UNAVAILABLE" body={error ?? undefined} />;
  }

  const detail = isPreview ? previewDetail : data;
  if (!detail) {
    return <AppEmptyState title="REVIEW UNAVAILABLE" body="Review not found in preview." />;
  }

  return (
    <ClientAppReviewDetailView
      detail={detail}
      mode={mode}
      paths={{ queue: paths.reviews, review: (sub) => paths.review(reviewId, sub) }}
      onReload={() => void reload()}
      onPostAction={(action, body) => postReviewAction(reviewSlug, { action, ...body })}
    />
  );
}
