import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marketingPhaseLabel } from '../../../../../shared/site00-marketing/clientPhases';
import { Site00AccountRouteGuard } from '../../../components/guards/Site00AccountRouteGuard';
import { HubLegacySkin, PublicHubPage } from '../../../components/public-redesign/PublicHubLayouts';
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
      <PublicHubPage section="evolve" page="evolve-marketing-engagement" tone="daylight" crumb="EVOLVE / MARKETING & CONTENT" title="ENGAGEMENT" width="narrow">
        <p className="s00pr-hubstatus" role="status">WORKSPACE INITIALIZING…</p>
      </PublicHubPage>
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
      <PublicHubPage
        section="evolve"
        page="evolve-marketing-engagement"
        tone="daylight"
        crumb="EVOLVE / MARKETING & CONTENT"
        title={data.campaignName}
        subtitle={`${data.engagementCode} · ${data.status.replace(/_/g, ' ')}`}
        body={`PHASE ${data.clientPhase} / ${marketingPhaseLabel(data.clientPhase)}`}
        width="default"
      >
        <HubLegacySkin kind="engagement" className="site00-marketing-workspace">

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

          {data.commercialAllowance ? (
            <section className="site00-marketing-workspace__inventory" aria-label="Creative inventory allowances">
              <p className="site00-label-red">{data.commercialAllowance.headline}</p>
              <ul className="site00-marketing-inventory-list">
                <li>
                  {data.commercialAllowance.characters.label}: {data.commercialAllowance.characters.used} of{' '}
                  {data.commercialAllowance.characters.included} used
                </li>
                <li>
                  {data.commercialAllowance.characterReskins.label}: {data.commercialAllowance.characterReskins.remaining}{' '}
                  remaining
                </li>
                <li>
                  {data.commercialAllowance.customSets.label}: {data.commercialAllowance.customSets.remaining} remaining
                </li>
              </ul>
              {data.commercialAllowance.extraCharacterAddOnAvailable ? (
                <p className="site00-body">Extra Character — add-on available (FOUNDER_PRICING_REQUIRED)</p>
              ) : null}
            </section>
          ) : null}

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
                  {d.downloadUrl ? (
                    <a className="site00-btn site00-btn--ghost" href={d.downloadUrl} target="_blank" rel="noreferrer">
                      ACCESS DELIVERABLE →
                    </a>
                  ) : null}
                </article>
              ))}
            </section>
          ) : null}

          {data.vaultLinks?.length ? (
            <section className="site00-marketing-deliverables">
              <h2>VAULT</h2>
              <p className="site00-label">APPROVED FINALS · VAULT</p>
              {data.vaultLinks.map((v) => (
                <article key={v.id}>
                  <h3>{v.title}</h3>
                  <p>{v.format} · {v.aspectRatio} · {v.version}</p>
                  {v.downloadUrl ? (
                    <a className="site00-btn site00-btn--ghost" href={v.downloadUrl} target="_blank" rel="noreferrer">
                      OPEN IN VAULT →
                    </a>
                  ) : null}
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
        </HubLegacySkin>
      </PublicHubPage>
    </Site00AccountRouteGuard>
  );
}
