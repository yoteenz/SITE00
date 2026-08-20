import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marketingPhaseLabel } from '../../../../../shared/site00-marketing/clientPhases';
import { Site00AccountRouteGuard } from '../../../components/guards/Site00AccountRouteGuard';
import { Site00AppShell } from '../../../components/shell/Site00AppShell';
import { SITE00_ROUTES } from '../../../config/routes';
import type { MarketingEngagementPayload } from '../../../../../shared/site00-marketing/types';
import { marketingEngagementApi } from '../../../services/marketingEngagementApi';

export default function MarketingEngagementPage() {
  const { engagementId = '' } = useParams();
  const [data, setData] = useState<MarketingEngagementPayload | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!engagementId) return;
    void marketingEngagementApi.sync(engagementId).then(setData).catch(() => setData(null));
  }, [engagementId]);

  if (!data) {
    return (
      <Site00AppShell>
        <p className="site00-control-empty">STUDIO INITIALIZING…</p>
      </Site00AppShell>
    );
  }

  async function handleReviewAction(reviewId: string, actionType: 'APPROVE' | 'REQUEST_REVISION') {
    setBusy(true);
    try {
      await marketingEngagementApi.reviewAction({ id: data!.id, reviewId, reviewActionType: actionType });
      const refreshed = await marketingEngagementApi.sync(data!.id);
      setData(refreshed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Site00AccountRouteGuard>
      <Site00AppShell>
        <div className="site00-marketing-workspace">
          <header className="site00-marketing-workspace__header">
            <p className="site00-label-red">EVOLVE / MARKETING & CONTENT</p>
            <h1>{data.campaignName}</h1>
            <p>{data.engagementCode} · {data.status.replace(/_/g, ' ')}</p>
            <p>PHASE {data.clientPhase} / {marketingPhaseLabel(data.clientPhase)}</p>
          </header>

          {data.clientActionRequired ? (
            <section className="site00-marketing-action-required">
              <p className="site00-label-red">YOUR SIGNAL IS REQUIRED</p>
              <p>{data.clientActionLabel ?? 'ACTION REQUIRED'}</p>
            </section>
          ) : null}

          <nav className="site00-marketing-workspace__nav">
            {['OVERVIEW', 'BRIEF', 'PROGRESS', 'REVIEWS', 'DELIVERABLES', 'ACTIVITY'].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </nav>

          <section className="site00-marketing-workspace__progress">
            <p className="site00-label-red">CURRENT PHASE</p>
            <p>{marketingPhaseLabel(data.clientPhase)}</p>
            <p className="site00-body">
              NEXT: {data.clientActionRequired ? data.clientActionLabel : 'SITE 00 IS PRODUCING YOUR CAMPAIGN.'}
            </p>
          </section>

          {data.reviews.length ? (
            <section className="site00-marketing-reviews">
              <h2>REVIEWS</h2>
              {data.reviews.map((r) => (
                <article key={r.id} className="site00-marketing-review-card">
                  <h3>{r.title}</h3>
                  <p>{r.reviewType.toUpperCase()} · {r.status}</p>
                  {r.directions?.length ? (
                    <ul>{r.directions.map((d) => <li key={d.id}>{d.label}</li>)}</ul>
                  ) : null}
                  <div className="site00-marketing-review-card__actions">
                    <button type="button" disabled={busy} onClick={() => void handleReviewAction(r.id, 'APPROVE')}>APPROVE</button>
                    <button type="button" disabled={busy} onClick={() => void handleReviewAction(r.id, 'REQUEST_REVISION')}>REQUEST REVISION</button>
                  </div>
                </article>
              ))}
            </section>
          ) : null}

          {data.deliverables.length ? (
            <section className="site00-marketing-deliverables">
              <h2>DELIVERABLES</h2>
              {data.deliverables.map((d) => (
                <article key={d.id}>
                  <h3>{d.title}</h3>
                  <p>{d.format} · {d.aspectRatio} · {d.version}</p>
                </article>
              ))}
            </section>
          ) : null}

          {data.campaignHistory.length > 1 ? (
            <section>
              <h2>CAMPAIGN HISTORY</h2>
              <ul>{data.campaignHistory.map((c) => <li key={c.code}>{c.code} — {c.name} — {c.status}</li>)}</ul>
            </section>
          ) : null}

          <Link className="site00-btn site00-btn--ghost" to={SITE00_ROUTES.evolveMarketingServices}>
            START ANOTHER EVOLUTION →
          </Link>
        </div>
      </Site00AppShell>
    </Site00AccountRouteGuard>
  );
}
