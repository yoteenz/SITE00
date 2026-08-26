import { useOutletContext, useParams, useLocation } from 'react-router-dom';
import { useClientReviewDetail, useClientReviewQueue } from '../../hooks/useClientReviews';
import { ClientReviewQueueList } from '../../components/clientReviews/ClientReviewQueueList';
import { ClientReviewDetailView } from '../../components/clientReviews/ClientReviewDetailView';
import { AppEmptyState, AppLoadingState } from '../../components/clientApp/Site00ClientAppShell';
import type { AppOutletContext } from './AppProjectLayout';
import { PREVIEW_REVIEW_OBJECTS } from '../../../../shared/site00-client-reviews/previewSeed.js';

export default function AppReviewsQueuePage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  const location = useLocation();
  const isPreview = location.pathname.includes('/app/preview/');
  const { data, state, error } = useClientReviewQueue(isPreview ? 'preview-client-room' : manifest.projectSlug);

  if (!isPreview && state === 'loading') return <AppLoadingState />;
  if (!isPreview && (state === 'error' || !data)) {
    return <AppEmptyState title="REVIEWS UNAVAILABLE" body={error ?? undefined} />;
  }

  const reviews = isPreview
    ? PREVIEW_REVIEW_OBJECTS
    : data!.reviews;

  return (
    <ClientReviewQueueList
      projectSlug={manifest.projectSlug}
      reviews={reviews}
      emptyMessage={isPreview ? null : data?.emptyMessage}
      routePrefix={isPreview ? `/app/preview/${manifest.projectSlug}/reviews` : `/app/projects/${manifest.projectSlug}/reviews`}
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
  const { manifest } = useOutletContext<AppOutletContext>();
  const { data, state, error, reload } = useClientReviewDetail(manifest.projectSlug, reviewId);

  if (state === 'loading') return <AppLoadingState />;
  if (state === 'error' || !data) {
    return <AppEmptyState title="REVIEW UNAVAILABLE" body={error ?? undefined} />;
  }

  return (
    <ClientReviewDetailView
      projectSlug={manifest.projectSlug}
      detail={data}
      onReload={() => void reload()}
      onPostAction={(action, body) => postReviewAction(manifest.projectSlug, { action, ...body })}
    />
  );
}
