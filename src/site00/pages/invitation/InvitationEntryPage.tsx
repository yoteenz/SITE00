import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { InvitationEntryPresentation } from '../../../../shared/site00-invitation-system/contracts/entryPresentation.js';
import { SITE00_ROUTES } from '../../config/routes.js';
import '../../styles/site00-invitation.css';

type ResolveResponse = {
  presentation: InvitationEntryPresentation;
  visit_id: string | null;
  resolution: string;
  valid: boolean;
};

async function invitationGet(code: string): Promise<ResolveResponse> {
  const res = await fetch(`/api/site00/invitation?action=resolve&code=${encodeURIComponent(code)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Invitation unavailable');
  return json as ResolveResponse;
}

async function invitationPost(code: string, action: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/site00/invitation?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, code, action }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

export default function InvitationEntryPage() {
  const { code = '' } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState<InvitationEntryPresentation | null>(null);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [verificationSecret, setVerificationSecret] = useState('');
  const [activationId, setActivationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!code) return;
    setError(null);
    const data = await invitationGet(code);
    setPresentation(data.presentation);
    setVisitId(data.visit_id);
    if (data.presentation.activation.activation_id) {
      setActivationId(data.presentation.activation.activation_id);
    }
  }, [code]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  const foundationRoute = presentation?.foundation.route;

  const phaseLabel = useMemo(() => {
    if (!presentation) return 'LOADING';
    if (foundationRoute) return '04 — FOUNDATION';
    if (activationId) return '03 — ACTIVATE';
    return '02 — WELCOME';
  }, [presentation, foundationRoute, activationId]);

  async function beginActivation() {
    if (!visitId || !email.includes('@')) return;
    setBusy(true);
    setError(null);
    try {
      const json = await invitationPost(code, 'begin-activation', { visit_id: visitId, contact_email: email });
      setActivationId(json.activation_id as string);
      setPresentation(json.presentation as InvitationEntryPresentation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation failed');
    } finally {
      setBusy(false);
    }
  }

  async function completeActivation() {
    if (!activationId || !verificationSecret) return;
    setBusy(true);
    setError(null);
    try {
      const json = await invitationPost(code, 'complete-activation', {
        activation_id: activationId,
        verification_secret: verificationSecret,
      });
      const route = json.foundation_route as string;
      navigate(route);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }

  if (!code) {
    return <main className="site00-invite"><p>Invitation code missing.</p></main>;
  }

  return (
    <main className="site00-invite" aria-labelledby="site00-invite-title">
      <header className="site00-invite__mast">
        <p className="site00-invite__brand">SITE 00</p>
        <p className="site00-invite__phase">{phaseLabel}</p>
      </header>

      {error ? <p className="site00-invite__error" role="alert">{error}</p> : null}

      {presentation ? (
        <>
          <p className="site00-invite__collection">{presentation.collection_label}</p>
          <h1 id="site00-invite-title" className="site00-invite__title">
            {presentation.headline_candidates[0]}
          </h1>
          <p className="site00-invite__lede">{presentation.primary_service}</p>
          <p className="site00-invite__partner">{presentation.partner_presented_through}</p>

          {presentation.resolution === 'UNKNOWN' || presentation.resolution === 'REVOKED' || presentation.resolution === 'EXPIRED' ? (
            <p className="site00-invite__status">This invitation is not available.</p>
          ) : null}

          {foundationRoute ? (
            <section className="site00-invite__panel">
              <p>Your Digital Foundation workspace is ready.</p>
              <Link className="site00-invite__cta" to={foundationRoute}>Continue to Foundation</Link>
              <p className="site00-invite__note">Next: {presentation.secondary_expansion}</p>
            </section>
          ) : (
            <section className="site00-invite__panel">
              <label className="site00-invite__label" htmlFor="invite-email">Work email</label>
              <input
                id="invite-email"
                className="site00-invite__input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={Boolean(activationId) || busy}
              />
              {!activationId ? (
                <button type="button" className="site00-invite__cta" disabled={busy || !visitId} onClick={() => void beginActivation()}>
                  Activate your Foundation
                </button>
              ) : (
                <>
                  <p className="site00-invite__note">Verify your identity to open your personal workspace. In production this step uses the existing SITE 00 identity flow.</p>
                  <label className="site00-invite__label" htmlFor="invite-secret">Verification code</label>
                  <input
                    id="invite-secret"
                    className="site00-invite__input"
                    type="password"
                    autoComplete="one-time-code"
                    value={verificationSecret}
                    onChange={(e) => setVerificationSecret(e.target.value)}
                    disabled={busy}
                  />
                  <button type="button" className="site00-invite__cta" disabled={busy} onClick={() => void completeActivation()}>
                    Verify and continue
                  </button>
                </>
              )}
            </section>
          )}
        </>
      ) : (
        <p className="site00-invite__status">Loading invitation…</p>
      )}

      <footer className="site00-invite__footer">
        <Link to={SITE00_ROUTES.origin}>SITE 00</Link>
        <span>Policy {presentation?.policy_version ?? '—'}</span>
      </footer>
    </main>
  );
}
