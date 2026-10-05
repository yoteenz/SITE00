import { useParams } from 'react-router-dom';
import { useClientProjectRoom } from '../../hooks/useClientProjectRoom';
import { useClientReviewQueue, useClientReviewDetail } from '../../hooks/useClientReviews';
import { ClientProjectRoomShell } from '../../components/clientProjectRoom/ClientProjectRoomShell';
import { ClientReviewQueueList } from '../../components/clientReviews/ClientReviewQueueList';
import { ClientReviewDetailView } from '../../components/clientReviews/ClientReviewDetailView';

export default function ClientProjectRoomReviewsPage() {
  const { projectSlug = 'preview-client-room' } = useParams();
  const room = useClientProjectRoom(projectSlug);
  const queue = useClientReviewQueue(projectSlug);

  if (room.state === 'loading' || queue.state === 'loading') {
    return <div className="site00-cpr site00-cpr-loading">LOADING REVIEWS…</div>;
  }

  if (room.state === 'error' || !room.data || queue.state === 'error' || !queue.data) {
    return (
      <div className="site00-cpr site00-cpr-error">
        {queue.error ?? room.error ?? 'Could not load reviews.'}
      </div>
    );
  }

  const actionable = queue.data.actionableCount;

  return (
    <ClientProjectRoomShell manifest={room.data.manifest} activeSection="reviews">
      <header className="site00-cpr-header">
        <div className="site00-cpr-header__eyebrow">REVIEWS</div>
        <h1 className="site00-cpr-header__title">{room.data.manifest.displayName}</h1>
        <div className="site00-cpr-header__meta">
          {actionable > 0 ? `${actionable} ITEM${actionable === 1 ? '' : 'S'} READY FOR REVIEW` : 'YOUR REVIEW QUEUE'}
        </div>
      </header>
      <ClientReviewQueueList
        projectSlug={projectSlug}
        reviews={queue.data.reviews}
        emptyMessage={queue.data.emptyMessage}
      />
    </ClientProjectRoomShell>
  );
}

export function ClientReviewDetailPage() {
  const { projectSlug = 'preview-client-room', reviewId = '' } = useParams();
  const room = useClientProjectRoom(projectSlug);
  const detail = useClientReviewDetail(projectSlug, reviewId);

  if (room.state === 'loading' || detail.state === 'loading') {
    return <div className="site00-cpr site00-cpr-loading">LOADING REVIEW…</div>;
  }

  if (room.state === 'error' || !room.data || detail.state === 'error' || !detail.data) {
    return (
      <div className="site00-cpr site00-cpr-error">
        {detail.error ?? room.error ?? 'Could not load review.'}
        <div>
          <button type="button" onClick={() => void detail.reload()}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientProjectRoomShell manifest={room.data.manifest} activeSection="reviews">
      <ClientReviewDetailView
        projectSlug={projectSlug}
        detail={detail.data}
        onReload={() => void detail.reload()}
        onPostAction={detail.postAction}
      />
    </ClientProjectRoomShell>
  );
}
