/**
 * SITE 00 — secure guest intake access/resume (Identity + Builder intake persistence infra).
 * /intake/access/:token — no sign-in required. Server validates the raw token against the
 * stored hash (api/site00/intake-access.ts → tokens.resolveGuestAccessToken) and returns only
 * the client-safe IntakeDetail shape; this page never sees or logs the token hash, other
 * intakes, or admin metadata.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EmptyState, PageIntro, BracketHeading, StatusBadge } from '../../components/pages/Site00PagePrimitives';
import { SITE00_ROUTES } from '../../config/routes';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { resolveGuestAccessToken } from '../../api/intakesApi';
import type { IntakeDetail } from '../../../../shared/site00-intakes/types';
import '../../styles/site00-account-intakes.css';

function formatDateTime(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function IntakeGuestAccessPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [intake, setIntake] = useState<IntakeDetail | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('error');
      setError('MISSING ACCESS TOKEN.');
      return;
    }
    let cancelled = false;
    setState('loading');
    resolveGuestAccessToken(token)
      .then((result) => {
        if (cancelled) return;
        setIntake(result);
        setState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'THIS ACCESS LINK IS INVALID, EXPIRED, OR REVOKED.');
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const canResume = intake?.status === 'DRAFT' || intake?.status === 'AWAITING_EMAIL_VERIFICATION' || intake?.status === 'ACTIVE';
  const isSubmitted = intake?.status === 'SUBMITTED' || intake?.status === 'IN_REVIEW' || intake?.status === 'CONVERTED';
  const resumeHref = intake?.sourceRoute || (intake?.intakeType === 'IDENTITY' ? SITE00_ROUTES.idnty : SITE00_ROUTES.bldr);

  return (
    <Site00PublicShell>
      <div className="site00-page site00-intake-guest-access">
        <PageIntro title={<BracketHeading>SECURE INTAKE ACCESS</BracketHeading>} subtitle="RESUME OR VIEW YOUR SUBMITTED INTAKE." />

        {state === 'loading' ? (
          <p className="site00-body">VERIFYING SECURE ACCESS LINK…</p>
        ) : state === 'error' || !intake ? (
          <EmptyState
            title="ACCESS LINK UNAVAILABLE"
            body={error ?? 'THIS ACCESS LINK IS INVALID, EXPIRED, OR HAS BEEN REVOKED. REQUEST A NEW SECURE LINK FROM YOUR INTAKE.'}
          />
        ) : (
          <div className="site00-intake-guest-access__card">
            <p className="site00-label-red">
              {intake.intakeType} INTAKE · {intake.publicReference}
            </p>
            <StatusBadge
              status={intake.status.replace(/_/g, ' ')}
              tone={isSubmitted ? 'published' : 'progress'}
            />
            <p className="site00-body" style={{ marginTop: '0.75rem' }}>
              {isSubmitted
                ? 'YOUR INTAKE HAS BEEN SUBMITTED. A COPY IS AVAILABLE HERE VIA THIS SECURE LINK.'
                : 'YOUR DRAFT ANSWERS ARE SAVED. CONTINUE WHERE YOU LEFT OFF.'}
            </p>
            <p className="site00-body">LAST SAVED: {formatDateTime(intake.lastSavedAt)}</p>
            {intake.submittedAt ? <p className="site00-body">SUBMITTED: {formatDateTime(intake.submittedAt)}</p> : null}

            {isSubmitted && intake.submittedPayload ? (
              <pre className="site00-account-intakes-detail__payload" style={{ marginTop: '1rem' }}>
                {JSON.stringify(intake.submittedPayload, null, 2)}
              </pre>
            ) : null}

            <div className="site00-intake-guest-access__actions">
              {canResume ? (
                <Link to={resumeHref} className="site00-btn site00-btn--primary">
                  RESUME INTAKE →
                </Link>
              ) : null}
              <Link to={site00SignInHrefWithReturnTo({ pathname: SITE00_ROUTES.accountIntakes })} className="site00-btn-outline">
                SIGN IN / CREATE ACCOUNT →
              </Link>
            </div>
            <p className="site00-body site00-intake-guest-access__claim-note">
              SIGNING IN WITH THIS SAME EMAIL LETS YOU CLAIM THIS INTAKE INTO YOUR ACCOUNT.
            </p>
          </div>
        )}
      </div>
    </Site00PublicShell>
  );
}
