import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { DigitalFoundationArtifactPayload } from '../../../../../shared/site00-digital-foundation/types.js';
import { SITE00_ROUTES } from '../../../config/routes';
import { digitalFoundationClientIntakePath, foundationAdminApi } from '../../services/foundationAdminApi';

export default function FoundationAdminDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [payload, setPayload] = useState<DigitalFoundationArtifactPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const json = await foundationAdminApi.detail(id);
    setPayload(json as DigitalFoundationArtifactPayload);
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
        <dt>Intake</dt>
        <dd>{payload.artifact.intake_state}</dd>
        <dt>Payment</dt>
        <dd>{payload.artifact.payment_state}</dd>
        <dt>Referral</dt>
        <dd>{payload.referral_source?.label ?? '—'}</dd>
        <dt>Funnel</dt>
        <dd>{payload.lead.referral_funnel_stage}</dd>
      </dl>
      <h2>Submitted intake</h2>
      <dl>
        <dt>Business</dt>
        <dd>{payload.artifact.intake.business_name || '—'}</dd>
        <dt>Industry</dt>
        <dd>{payload.artifact.intake.industry || '—'}</dd>
        <dt>Contact</dt>
        <dd>{payload.artifact.intake.contact_name || '—'}</dd>
        <dt>Email</dt>
        <dd>{payload.artifact.intake.current_email || '—'}</dd>
        <dt>Phone</dt>
        <dd>{payload.artifact.intake.phone || '—'}</dd>
        <dt>Existing domain</dt>
        <dd>{payload.artifact.intake.existing_domain ?? '—'}</dd>
        <dt>Needs</dt>
        <dd>{payload.artifact.intake.needs?.length ? payload.artifact.intake.needs.join(', ') : '—'}</dd>
        <dt>Team size</dt>
        <dd>{payload.artifact.intake.team_size ?? '—'}</dd>
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
