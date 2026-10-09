import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { DigitalFoundationArtifactPayload } from '../../../../../shared/site00-digital-foundation/types.js';
import { SITE00_ROUTES } from '../../../config/routes';
import { digitalFoundationClientIntakePath, foundationAdminApi, type FounderGrowthReview } from '../../services/foundationAdminApi';

function GrowthReviewSection({ review }: { review: FounderGrowthReview | null }) {
  if (!review?.enabled || !review.context) return null;
  const ctx = review.context;
  const selected = ctx.selection.selected.map((s) => ctx.catalog.find((c) => c.service_id === s.service_id)?.display_name ?? s.service_id);
  const t = ctx.delivery;
  return (
    <section data-testid="founder-growth-review">
      <h2>Business Growth review</h2>
      <p>
        Read-only. Growth checkout is disabled and nothing here approves pricing — approvals stay in the BGI catalog governance
        path.
      </p>
      <dl>
        <dt>Ambition</dt>
        <dd>
          {review.ambition?.skipped
            ? 'Skipped'
            : review.ambition?.goals?.length
              ? review.ambition.goals.join(', ')
              : 'Not answered'}
        </dd>
        <dt>Selected Growth services</dt>
        <dd>{selected.length ? selected.join(', ') : 'None (Foundation only)'}</dd>
        <dt>Foundation ready</dt>
        <dd>
          {t.foundation_ready_min_days}–{t.foundation_ready_max_days} business days
        </dd>
        <dt>Full project delivery</dt>
        <dd>{ctx.unified_quote.full_project_display ?? 'Scoped separately'}</dd>
        <dt>Lifecycle</dt>
        <dd>
          Foundation {ctx.lifecycle.foundation} · Growth {ctx.lifecycle.growth} · Full engagement {ctx.lifecycle.full_engagement}
        </dd>
      </dl>
      <h3>Pricing reviews ({review.pricing_reviews.length})</h3>
      {review.pricing_reviews.length ? (
        <ul>
          {review.pricing_reviews.map((p) => (
            <li key={p.service_id}>
              {p.display_name} — {p.commercial_status} · {p.pricing_basis}
              {p.approval_requirements.length > 0 && <> · requires: {p.approval_requirements.join('; ')}</>}
            </li>
          ))}
        </ul>
      ) : (
        <p>None.</p>
      )}
      <h3>Delivery assumptions</h3>
      {review.delivery_assumptions.length ? (
        <ul>
          {review.delivery_assumptions.map((d) => (
            <li key={d.service_id}>
              {d.service_id} — {d.capacity_assumption} (confidence {d.confidence})
              {d.required_review_steps.length > 0 && <> · review: {d.required_review_steps.join('; ')}</>}
            </li>
          ))}
        </ul>
      ) : (
        <p>None.</p>
      )}
      <h3>Specialist reviews</h3>
      {review.specialist_reviews.length ? (
        <ul>
          {review.specialist_reviews.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : (
        <p>None.</p>
      )}
      <h3>AIO referrals (informational — no data shared, no AIO charges)</h3>
      {review.aio_referrals.length ? (
        <ul>
          {review.aio_referrals.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : (
        <p>None.</p>
      )}
      <p>
        Governance: growth checkout {review.governance.growth_checkout_enabled ? 'enabled' : 'disabled'} · auto-approval{' '}
        {review.governance.auto_approval ? 'on' : 'off'}. {review.governance.note}
      </p>
    </section>
  );
}

export default function FoundationAdminDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [payload, setPayload] = useState<DigitalFoundationArtifactPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [growthReview, setGrowthReview] = useState<FounderGrowthReview | null>(null);

  const load = async () => {
    const json = await foundationAdminApi.detail(id);
    setPayload(json as DigitalFoundationArtifactPayload);
    setGrowthReview(await foundationAdminApi.growthReview(id).catch(() => null));
  };

  useEffect(() => {
    if (!id) return;
    load().catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [id]);

  const markComplete = async () => {
    await foundationAdminApi.markComplete(id, {
      business: payload?.artifact.intake.business_name ?? 'Business',
      domain: payload?.artifact.intake.existing_domain ?? 'example.com',
      registrar: 'TBD',
      email_provider: 'TBD',
      primary_mailbox: payload?.artifact.intake.current_email ?? null,
      aliases: [],
      dns_status: 'CONFIGURED',
      security_status: 'PROTECTED',
      owner: payload?.artifact.intake.contact_name ?? null,
      administrative_access_model: 'Client-owned',
    });
    await load();
  };

  if (error) return <p>{error}</p>;
  if (!payload) return <p>Loading…</p>;

  return (
    <div className="site00-admin-page">
      <p>
        <Link to={SITE00_ROUTES.digitalFoundationAdmin}>← Foundation list</Link>
      </p>
      <h1>Artifact {payload.artifact.artifact_id.slice(0, 8)}</h1>
      <p>
        <a href={digitalFoundationClientIntakePath(payload.artifact.public_token)} target="_blank" rel="noreferrer">
          Open client intake
        </a>
        {' · '}
        <a href={`/foundation/${payload.artifact.public_token}`} target="_blank" rel="noreferrer">
          Client home (prospect / portal)
        </a>
      </p>
      <dl>
        <dt>State</dt>
        <dd>{payload.artifact.state}</dd>
        <dt>Payment</dt>
        <dd>{payload.artifact.payment_state}</dd>
        <dt>Referral</dt>
        <dd>{payload.referral_source?.label ?? '—'}</dd>
        <dt>Funnel</dt>
        <dd>{payload.lead.referral_funnel_stage}</dd>
      </dl>
      {payload.quote && (
        <>
          <h2>Quote v{payload.quote.quote_version}</h2>
          <p>
            Subtotal: {(payload.quote.subtotal_minor / 100).toFixed(2)} {payload.quote.currency}
          </p>
        </>
      )}
      {payload.artifact.payment_state === 'PAID' && payload.artifact.completion_state !== 'COMPLETE' && (
        <button type="button" onClick={markComplete}>
          Mark foundation complete
        </button>
      )}
      <GrowthReviewSection review={growthReview} />
      <h2>Recent events</h2>
      <ul>
        {payload.events.slice(-10).map((e) => (
          <li key={e.event_id}>
            {e.event_type} — {new Date(e.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
