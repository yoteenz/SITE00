import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { DigitalFoundationArtifactPayload } from '../../../../../shared/site00-digital-foundation/types.js';
import { digitalFoundationClientIntakePath, foundationAdminApi } from '../../services/foundationAdminApi';
import { SITE00_ROUTES } from '../../../config/routes';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { normalizeIntakeColumnLabel } from '../data/intakeColumn';

export function ClientRecordPage() {
  const { artifactId = '' } = useParams();
  const [payload, setPayload] = useState<DigitalFoundationArtifactPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artifactId) return;
    void foundationAdminApi
      .detail(artifactId)
      .then((j) => setPayload(j as DigitalFoundationArtifactPayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [artifactId]);

  return (
    <FounderWorkspacePageFrame destination="foundations">
      <div className="ifw-client-record">
        <p>
          <Link to={IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations}>← Registry</Link>
        </p>
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        {!payload ? <p className="ifw-muted">Loading…</p> : null}
        {payload ? (
          <>
            <div className="ifw-client-record__grid">
              <section className="ifw-panel">
                <h2 className="ifw-panel__title">Identity</h2>
                <dl className="ifw-kv">
                  <dt>Business</dt>
                  <dd>{payload.artifact.intake.business_name || '—'}</dd>
                  <dt>Contact</dt>
                  <dd>{payload.artifact.intake.contact_name || '—'}</dd>
                  <dt>Email</dt>
                  <dd className="fw-data">{payload.artifact.intake.current_email || '—'}</dd>
                  <dt>Phone</dt>
                  <dd className="fw-data">{payload.artifact.intake.phone || '—'}</dd>
                </dl>
              </section>
              <section className="ifw-panel">
                <h2 className="ifw-panel__title">Lifecycle</h2>
                <dl className="ifw-kv">
                  <dt>State</dt>
                  <dd>{payload.artifact.state}</dd>
                  <dt>Intake</dt>
                  <dd>
                    {normalizeIntakeColumnLabel({
                      artifact_id: payload.artifact.artifact_id,
                      public_token: payload.artifact.public_token,
                      state: payload.artifact.state,
                      payment_state: payload.artifact.payment_state,
                      intake_state: payload.artifact.intake_state,
                      created_at: payload.artifact.created_at,
                    })}
                  </dd>
                  <dt>Payment</dt>
                  <dd>{payload.artifact.payment_state}</dd>
                  <dt>Referral</dt>
                  <dd>{payload.referral_source?.label ?? '—'}</dd>
                  <dt>Funnel</dt>
                  <dd>{payload.lead.referral_funnel_stage}</dd>
                </dl>
              </section>
            </div>
            <div className="ifw-actions-row">
              <a
                className="ifw-btn ifw-btn--primary"
                href={digitalFoundationClientIntakePath(payload.artifact.public_token)}
                target="_blank"
                rel="noreferrer"
              >
                Client intake
              </a>
              <Link
                className="ifw-btn ifw-btn--ghost"
                to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', payload.artifact.artifact_id)}
              >
                Operations workbench
              </Link>
              <Link
                className="ifw-btn ifw-btn--ghost"
                to={SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', payload.artifact.artifact_id)}
              >
                Project command
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </FounderWorkspacePageFrame>
  );
}
