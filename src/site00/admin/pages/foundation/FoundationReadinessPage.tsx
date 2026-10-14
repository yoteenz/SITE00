import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import {
  foundationReadinessApi,
  type FounderReadinessReport,
  type TestInvitationPreview,
  type TestJourney,
} from '../../services/foundationReadinessApi';

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

  return (
    <div className="site00-admin-page">
      <header>
        <h1>Digital Foundation — founder readiness</h1>
        <p>
          Create synthetic clients, queue FNDATN-01 lifecycle emails, and open the real client link. No production deploy; no Anthony
          contact.
        </p>
        <p>
          <Link to={SITE00_ROUTES.digitalFoundationAdmin}>All foundation artifacts</Link> ·{' '}
          <Link to={SITE00_ADMIN_ROUTES.correspondenceStudio}>Correspondence Studio</Link>
        </p>
      </header>

      {error ? (
        <p role="alert" style={{ color: '#ce1017' }}>
          {error}
        </p>
      ) : null}

      <section>
        <h2>Readiness report</h2>
        {report ? (
          <>
            <h3>Ready</h3>
            <ul>
              {report.ready.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3>Needs founder</h3>
            <ul>
              {report.needs_founder.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3>Blocked</h3>
            <ul>
              {report.blocked.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h3>Env vars (presence only)</h3>
            <ul>
              {report.env_vars.map((row) => (
                <li key={row.name}>
                  {row.name}: {row.present ? 'present' : 'missing'}
                </li>
              ))}
            </ul>
            <p>
              API build {report.deployment.commit_short ?? 'unknown'} · {report.deployment.package_marker} ·{' '}
              {report.deployment.pr1642_reference}
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
        <button type="button" disabled={busy || !email.trim()} onClick={() => void run(() => foundationReadinessApi.createTestClient({ contact_email: email.trim(), display_name: name.trim() }))}>
          Create test client
        </button>
      </section>

      {journey ? (
        <section>
          <h2>Client journey</h2>
          <p>
            State: {journey.state} · Intake: {journey.intake_state} · Payment: {journey.payment_state} · Surface: {journey.surface}
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
          <table>
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
                          <input
                            type="checkbox"
                            checked={sendApproved}
                            onChange={(e) => setSendApproved(e.target.checked)}
                          />{' '}
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
            <div>
              <h3>Invitation preview (no send)</h3>
              <p>
                Subject: {invitePreview.subject} · To: {invitePreview.recipient_masked} · From: {invitePreview.from_identity}
              </p>
              <p>
                Link valid: {invitePreview.invitation_link_valid ? 'yes' : 'no'} · Ready:{' '}
                {invitePreview.ready_to_send ? 'yes' : 'no'}
              </p>
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
