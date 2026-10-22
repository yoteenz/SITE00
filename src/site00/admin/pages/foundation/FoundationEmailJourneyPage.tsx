import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import {
  foundationEmailJourneyApi,
  type AutomatedEmailRun,
  type EmailGalleryRow,
  type RunStats,
} from '../../services/foundationEmailJourneyApi';
import { FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL } from '../../../../../shared/site00-digital-foundation/founderE2eEmailJourney';

const AUTHORIZED = FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL;

export function FoundationEmailJourneyDesk({ embedded = false }: { embedded?: boolean }) {
  const [run, setRun] = useState<AutomatedEmailRun | null>(null);
  const [stats, setStats] = useState<RunStats | null>(null);
  const [gallery, setGallery] = useState<EmailGalleryRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const refreshGallery = useCallback(async (artifactId: string) => {
    const g = await foundationEmailJourneyApi.gallery(artifactId);
    setGallery(g.gallery);
  }, []);

  const startRun = async () => {
    if (!authorized) {
      setError('Check the run authorization box to start once.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await foundationEmailJourneyApi.startAutomatedRun({ founder_e2e_authorized: true });
      setRun(result.run);
      setStats(result.stats);
      setGallery(result.gallery);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setBusy(false);
    }
  };

  const deliveryPass = (row: EmailGalleryRow) => row.delivery_status === 'DELIVERED';

  return (
    <div className={`site00-admin-page site00-foundation-readiness site00-email-journey ${embedded ? 'site00-foundation-readiness--embedded' : ''}`.trim()}>
      {!embedded ? (
        <header>
          <h1 className="site00-admin-page-title">[ DIGITAL FOUNDATION · EMAIL JOURNEY E2E ]</h1>
          <p className="site00-admin-page-subtitle">
            One authorized run · {AUTHORIZED} only · real Resend on staging · no per-milestone prompts
          </p>
          <p>
            <Link to="/admin/site00/foundation-readiness-desk">Staging readiness desk</Link> ·{' '}
            <Link to={SITE00_ROUTES.digitalFoundationPipeline}>Pipeline</Link>
          </p>
        </header>
      ) : null}

      {error ? (
        <p role="alert" className="site00-readiness-error">
          {error}
        </p>
      ) : null}

      <section className="site00-admin-panel">
        <h2 className="site00-admin-panel__title">Start automated journey</h2>
        <p>
          Recipient is fixed: <code>{AUTHORIZED}</code>. Railway allowlist must include this address only. Requires{' '}
          <code>SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1</code> on staging API.
        </p>
        <label>
          <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} /> I authorize
          one complete staging test run to send applicable lifecycle emails to {AUTHORIZED}.
        </label>
        <br />
        <button type="button" disabled={busy || !authorized} onClick={() => void startRun()}>
          {busy ? 'Running…' : 'Run complete email journey'}
        </button>
      </section>

      {run ? (
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">Run {run.run_id}</h2>
          <ul className="site00-readiness-kv">
            <li>Status: {run.status}</li>
            <li>Project: {run.artifact_id ?? '—'}</li>
            <li>Client link: {run.personalized_url ? <code>{run.personalized_url}</code> : '—'}</li>
            <li>Token: {run.public_token_masked ?? '—'}</li>
            {run.error ? <li>Error: {run.error}</li> : null}
          </ul>
          {stats ? (
            <p>
              Emails triggered {stats.triggered} · sent {stats.sent} · delivered {stats.delivered} · failed{' '}
              {stats.failed}
            </p>
          ) : null}
          <ul>
            {run.stages.map((s) => (
              <li key={s.stage_id}>
                {s.ok ? '✓' : '✗'} {s.stage_id}
                {s.error ? ` — ${s.error}` : ''}
                {s.provider_message_ids.length ? ` · Resend: ${s.provider_message_ids.join(', ')}` : ''}
              </li>
            ))}
          </ul>
          {run.artifact_id ? (
            <button type="button" disabled={busy} onClick={() => void refreshGallery(run.artifact_id!)}>
              Refresh delivery status
            </button>
          ) : null}
        </section>
      ) : null}

      <section className="site00-admin-panel">
        <h2 className="site00-admin-panel__title">Email review gallery (FNDATN-01)</h2>
        <p>All approved templates in canonical order. Delivery pass requires provider DELIVERED, not acceptance alone.</p>
        {gallery.length === 0 ? <p>No gallery data yet — run the journey or open a completed test project.</p> : null}
        <div className="site00-email-journey-gallery">
          {gallery.map((row) => (
            <article key={row.template_id} className="site00-email-journey-card">
              <header>
                <h3>{row.milestone}</h3>
                <p>
                  {row.approval_status} · {row.trigger} · {deliveryPass(row) ? 'DELIVERED' : row.delivery_status}
                </p>
              </header>
              <dl className="site00-email-journey-meta">
                <div>
                  <dt>Subject</dt>
                  <dd>{row.subject}</dd>
                </div>
                <div>
                  <dt>CTA</dt>
                  <dd>
                    {row.cta_label} → <code>{row.cta_destination}</code>
                  </dd>
                </div>
                <div>
                  <dt>Provider ID</dt>
                  <dd>{row.provider_message_id ?? '—'}</dd>
                </div>
                <div>
                  <dt>Timestamp</dt>
                  <dd>{row.timestamp ?? '—'}</dd>
                </div>
              </dl>
              {row.cta_links_resolved.length ? (
                <ul>
                  {row.cta_links_resolved.map((l) => (
                    <li key={l}>
                      <a href={l} target="_blank" rel="noreferrer">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {row.html ? (
                <div className="site00-email-journey-preview" dangerouslySetInnerHTML={{ __html: row.html }} />
              ) : (
                <p>Preview not rendered ({row.approval_status}).</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function FoundationEmailJourneyPage() {
  return (
    <Site00AdminShell>
      <FoundationEmailJourneyDesk />
    </Site00AdminShell>
  );
}
