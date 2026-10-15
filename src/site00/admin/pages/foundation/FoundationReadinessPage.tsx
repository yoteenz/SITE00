import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import {
  foundationReadinessApi,
  type EnvVarGroup,
  type FounderReadinessReport,
  type TestInvitationPreview,
  type TestJourney,
} from '../../services/foundationReadinessApi';

const STATUS_LABEL: Record<string, string> = {
  READY: 'Ready',
  ACTION_REQUIRED: 'Action required',
  BLOCKED: 'Blocked',
  UNVERIFIED: 'Unverified',
};

function statusClass(status: string): string {
  switch (status) {
    case 'READY':
      return 'site00-readiness-pill site00-readiness-pill--ready';
    case 'BLOCKED':
      return 'site00-readiness-pill site00-readiness-pill--blocked';
    case 'ACTION_REQUIRED':
      return 'site00-readiness-pill site00-readiness-pill--action';
    default:
      return 'site00-readiness-pill site00-readiness-pill--unverified';
  }
}

function EnvGroupRow({ group }: { group: EnvVarGroup }) {
  return (
    <tr>
      <td>
        <span className={statusClass(group.status)}>{STATUS_LABEL[group.status] ?? group.status}</span>
      </td>
      <td>
        <strong>{group.primary}</strong>
        {group.aliases.length ? <div className="site00-readiness-alias">Also: {group.aliases.join(', ')}</div> : null}
      </td>
      <td>{group.purpose}</td>
      <td>{group.satisfied ? 'Configured' : 'Not set'}</td>
      <td>{group.note ?? '—'}</td>
    </tr>
  );
}

/** Founder-only Digital Foundation E2E test desk (synthetic clients, email timeline, real /foundation/:token). */
export default function FoundationReadinessPage() {
  const [report, setReport] = useState<FounderReadinessReport | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Founder E2E Client');
  const [journey, setJourney] = useState<TestJourney | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [invitePreview, setInvitePreview] = useState<TestInvitationPreview | null>(null);
  const [sendApproved, setSendApproved] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setReport(await foundationReadinessApi.readinessReport());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load readiness report');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (fn: () => Promise<TestJourney | { artifact: { artifact_id: string } }>) => {
    setBusy(true);
    setError(null);
    try {
      const result = await fn();
      if ('artifact' in result && result.artifact?.artifact_id) {
        setJourney(await foundationReadinessApi.testJourney(result.artifact.artifact_id));
      } else {
        setJourney(result as TestJourney);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const ids = report?.staging_identities;

  return (
    <div className="site00-admin-page site00-foundation-readiness">
      <header>
        <h1 className="site00-admin-page-title">[ DIGITAL FOUNDATION · STAGING READINESS ]</h1>
        <p className="site00-admin-page-subtitle">
          Synthetic clients only · allowlisted email · staging Supabase · no production deploy
        </p>
        <p>
          <Link to={SITE00_ROUTES.digitalFoundationAdmin}>All foundation artifacts</Link> ·{' '}
          <Link to={SITE00_ADMIN_ROUTES.correspondenceStudio}>Correspondence Studio</Link>
        </p>
      </header>

      {error ? (
        <p role="alert" className="site00-readiness-error">
          {error}
        </p>
      ) : null}

      <section className="site00-readiness-summary">
        <h2>Staging stack</h2>
        {ids ? (
          <ul className="site00-readiness-kv">
            <li>
              Frontend: <code>{ids.expected_frontend_origin}</code>
            </li>
            <li>
              API: <code>{ids.expected_api_origin}</code>
            </li>
            <li>
              Supabase ref: <code>{ids.supabase_project_ref ?? 'unknown'}</code>{' '}
              {ids.supabase_staging_isolation_verified ? (
                <span className={statusClass('READY')}>Staging isolated</span>
              ) : (
                <span className={statusClass('BLOCKED')}>Not staging-safe</span>
              )}
            </li>
            <li>
              Persistence:{' '}
              <span className={statusClass(ids.persistence_store === 'supabase' ? 'UNVERIFIED' : 'ACTION_REQUIRED')}>
                {ids.persistence_store === 'supabase' ? 'Supabase (flag on)' : 'In-memory (lost on API restart)'}
              </span>
            </li>
            <li>
              Email sending:{' '}
              <span className={statusClass(ids.email_sending_enabled ? 'UNVERIFIED' : 'READY')}>
                {ids.email_sending_enabled ? 'Flag ON — not E2E verified' : 'Disabled'}
              </span>
            </li>
            <li>
              Stripe key mode:{' '}
              <span
                className={statusClass(
                  ids.stripe_key_mode === 'test'
                    ? 'UNVERIFIED'
                    : ids.stripe_key_mode === 'live'
                      ? 'BLOCKED'
                      : 'ACTION_REQUIRED',
                )}
              >
                {ids.stripe_key_mode}
              </span>
            </li>
            <li>
              Public link origin: <code>{ids.effective_public_origin}</code>
              {!ids.configured_public_origin ? (
                <span className={statusClass('ACTION_REQUIRED')}> Using site00.com fallback</span>
              ) : null}
            </li>
            <li>
              External E2E: <span className={statusClass('UNVERIFIED')}>Not passed</span>
            </li>
          </ul>
        ) : (
          <p>Loading…</p>
        )}
      </section>

      <section>
        <h2>Readiness report</h2>
        {report ? (
          <>
            <div className="site00-readiness-columns">
              <div>
                <h3>Ready</h3>
                <ul>
                  {report.ready.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Action required</h3>
                <ul>
                  {report.needs_founder.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Blocked</h3>
                <ul>
                  {report.blocked.length ? report.blocked.map((line) => <li key={line}>{line}</li>) : <li>None</li>}
                </ul>
              </div>
              <div>
                <h3>Unverified</h3>
                <ul>
                  {report.unverified.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h3>Configuration (grouped — aliases are not duplicates)</h3>
            <table className="site00-admin-table site00-readiness-env-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Setting</th>
                  <th>Purpose</th>
                  <th>State</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {report.env_var_groups.map((g) => (
                  <EnvGroupRow key={g.id} group={g} />
                ))}
              </tbody>
            </table>

            <p className="site00-readiness-meta">
              API build {report.deployment.commit_short ?? 'unknown'} · {report.deployment.package_marker}
            </p>
          </>
        ) : (
          <p>Loading…</p>
        )}
      </section>

      <section>
        <h2>Create test client</h2>
        <label>
          Test recipient (must be on API allowlist)
          <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="founder@example.com" />
        </label>
        <br />
        <label>
          Display name
          <br />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <br />
        <button
          type="button"
          disabled={busy || !email.trim()}
          onClick={() => void run(() => foundationReadinessApi.createTestClient({ contact_email: email.trim(), display_name: name.trim() }))}
        >
          Create test client
        </button>
      </section>

      {journey ? (
        <section>
          <h2>Client journey</h2>
          <p>
            State: {journey.state} · Intake: {journey.intake_state} · Payment: {journey.payment_state} · Surface:{' '}
            {journey.surface}
          </p>
          <p>
            <Link to={journey.personalized_url} target="_blank" rel="noreferrer">
              Open client link
            </Link>{' '}
            (token {journey.token_masked})
          </p>
          <button type="button" disabled={busy} onClick={() => void run(() => foundationReadinessApi.advanceTestIntake(journey.artifact_id))}>
            Submit intake (test)
          </button>{' '}
          <button type="button" disabled={busy} onClick={() => void run(() => foundationReadinessApi.advanceTestQuote(journey.artifact_id))}>
            Quote ready + queue email
          </button>{' '}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void (async () => {
                setBusy(true);
                try {
                  await foundationReadinessApi.resetTestData();
                  setJourney(null);
                  await refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Reset failed');
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            Reset test data (memory store)
          </button>
          <table className="site00-admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Template</th>
                <th>Trigger</th>
                <th>Provider ID</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {journey.email_events.map((ev) => (
                <tr key={ev.intent_id}>
                  <td>{ev.status}</td>
                  <td>{ev.template_id}</td>
                  <td>{ev.event_type}</td>
                  <td>{ev.provider_message_id ?? '—'}</td>
                  <td>
                    {ev.template_id === 'personal-foundation-invitation' &&
                    (ev.status === 'QUEUED' || ev.status === 'DRY_RUN' || ev.status === 'SIMULATED') ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void (async () => {
                              setBusy(true);
                              setError(null);
                              try {
                                setInvitePreview(await foundationReadinessApi.prepareTestInvitation(ev.intent_id));
                                setSendApproved(false);
                              } catch (e) {
                                setError(e instanceof Error ? e.message : 'Prepare failed');
                              } finally {
                                setBusy(false);
                              }
                            })()
                          }
                        >
                          Prepare test invitation
                        </button>{' '}
                        <label>
                          <input type="checkbox" checked={sendApproved} onChange={(e) => setSendApproved(e.target.checked)} />{' '}
                          Founder approves Resend send
                        </label>{' '}
                        <button
                          type="button"
                          disabled={busy || !sendApproved}
                          onClick={() =>
                            void run(async () => {
                              await foundationReadinessApi.dispatchTestEmail(ev.intent_id, true);
                              setInvitePreview(null);
                              setSendApproved(false);
                              return foundationReadinessApi.testJourney(journey.artifact_id);
                            })
                          }
                        >
                          Send test invitation
                        </button>
                      </>
                    ) : ev.status === 'QUEUED' || ev.status === 'DRY_RUN' ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            await foundationReadinessApi.dispatchTestEmail(ev.intent_id, true);
                            return foundationReadinessApi.testJourney(journey.artifact_id);
                          })
                        }
                      >
                        Send lifecycle email (approved)
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invitePreview ? (
            <div className="site00-readiness-preview">
              <h3>Invitation preview (no send)</h3>
              <p>
                Subject: {invitePreview.subject} · To: {invitePreview.recipient_masked} · From: {invitePreview.from_identity}
              </p>
              <p>
                Link valid: {invitePreview.invitation_link_valid ? 'yes' : 'no'} · Uses configured origin:{' '}
                {invitePreview.invitation_uses_configured_origin ? 'yes' : 'no'} · Origin:{' '}
                <code>{invitePreview.configured_public_origin}</code>
              </p>
              <p>Ready to send: {invitePreview.ready_to_send ? 'yes' : 'no'}</p>
              {invitePreview.blockers.length ? (
                <ul>
                  {invitePreview.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
