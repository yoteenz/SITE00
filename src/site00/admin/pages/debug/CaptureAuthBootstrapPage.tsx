import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { apiFetch } from '../../../../utils/api';
import { getSupabase } from '../../../../utils/supabase';
import { registerServerSessionCookie } from '../../../../utils/sessionRestore';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type BootstrapResponse = {
  ok: boolean;
  principal: string;
  expiresAt: string;
  cookieTtlDays: number;
  storageStateJson: string;
  railwayVariables: {
    SITE00_CAPTURE_STORAGE_STATE_JSON: string;
    SITE00_CAPTURE_PRINCIPAL: string;
    SITE00_CAPTURE_BASE_URL: string;
  };
  instructions: string[];
  error?: string;
  code?: string;
};

async function readRefreshToken(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const refresh = session?.refresh_token?.trim();
  if (refresh) return refresh;
  try {
    await supabase.auth.refreshSession();
    const {
      data: { session: s2 },
    } = await supabase.auth.getSession();
    return s2?.refresh_token?.trim() ?? null;
  } catch {
    return null;
  }
}

export default function CaptureAuthBootstrapPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<BootstrapResponse | null>(null);
  const [copied, setCopied] = useState<'json' | 'var' | null>(null);

  const exportForRailway = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCopied(null);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not configured in this build');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token || !session.refresh_token) {
        throw new Error('Sign in required — open site00.com, sign in as founder, then return here');
      }

      await registerServerSessionCookie(session.access_token, session.refresh_token);

      const refreshToken = (await readRefreshToken()) ?? session.refresh_token;
      const res = await apiFetch('/api/capture-auth-bootstrap', {
        method: 'POST',
        body: { refresh_token: refreshToken },
      });
      const data = (await res.json()) as BootstrapResponse;
      if (!res.ok) {
        throw new Error(data.error ?? `Export failed (${res.status})`);
      }
      setPayload(data);
    } catch (err) {
      setPayload(null);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const copyText = useCallback(async (text: string, kind: 'json' | 'var') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      setError('Copy failed — select the text manually');
    }
  }, []);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="DEBUG · VISUAL CAPTURE"
        title="Export capture auth for Railway"
        subtitle="Phone-friendly — copy Playwright storage state into Railway, redeploy API, refresh Projects references."
      />
      <div className="site00-admin-panel site00-capture-auth-bootstrap">
        <p className="site00-admin-panel-lead">
          Export Playwright storage state from your current founder session — works from your phone. Paste the JSON
          into Railway so authenticated <code>/projects</code> capture succeeds.
        </p>

        <div className="site00-capture-auth-bootstrap__actions">
          <button
            type="button"
            className="site00-admin-button site00-admin-button--primary site00-capture-auth-bootstrap__export"
            onClick={() => void exportForRailway()}
            disabled={loading}
          >
            {loading ? 'EXPORTING…' : 'EXPORT FOR RAILWAY'}
          </button>
        </div>

        {error ? (
          <p className="site00-admin-error site00-capture-auth-bootstrap__error" role="alert">
            {error}
          </p>
        ) : null}

        {payload ? (
          <div className="site00-capture-auth-bootstrap__result">
            <section className="site00-capture-auth-bootstrap__section">
              <h2 className="site00-admin-panel-title">Session</h2>
              <ul className="site00-capture-auth-bootstrap__meta">
                <li>
                  <strong>Principal:</strong> {payload.principal}
                </li>
                <li>
                  <strong>Expires:</strong> {new Date(payload.expiresAt).toLocaleString()} ({payload.cookieTtlDays}{' '}
                  days)
                </li>
                <li>
                  <strong>Base URL:</strong> {payload.railwayVariables.SITE00_CAPTURE_BASE_URL}
                </li>
              </ul>
            </section>

            <section className="site00-capture-auth-bootstrap__section">
              <h2 className="site00-admin-panel-title">Railway variables</h2>
              <ol className="site00-capture-auth-bootstrap__steps">
                {payload.instructions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="site00-capture-auth-bootstrap__warning">
                Treat this JSON like a password. Do not share it or commit it to git.
              </p>
              <div className="site00-capture-auth-bootstrap__copy-row">
                <button
                  type="button"
                  className="site00-admin-button"
                  onClick={() => void copyText(payload.storageStateJson, 'json')}
                >
                  {copied === 'json' ? 'COPIED JSON' : 'COPY JSON'}
                </button>
                <button
                  type="button"
                  className="site00-admin-button"
                  onClick={() =>
                    void copyText(payload.railwayVariables.SITE00_CAPTURE_STORAGE_STATE_JSON, 'var')
                  }
                >
                  {copied === 'var' ? 'COPIED FOR RAILWAY' : 'COPY FOR SITE00_CAPTURE_STORAGE_STATE_JSON'}
                </button>
              </div>
              <textarea
                className="site00-capture-auth-bootstrap__textarea"
                readOnly
                value={payload.storageStateJson}
                aria-label="Playwright storage state JSON"
                rows={12}
                onFocus={(e) => e.currentTarget.select()}
              />
            </section>

            <section className="site00-capture-auth-bootstrap__section">
              <h2 className="site00-admin-panel-title">After redeploy</h2>
              <p>
                Open visual development → <strong>CAPTURE / REFRESH REFERENCES</strong> → confirm{' '}
                <strong>PROJECTS DESKTOP: VALID</strong>.
              </p>
              <Link
                to={SITE00_ADMIN_ROUTES.evolveCreativeDirection('ndxbook')}
                className="site00-admin-link"
              >
                NDXBOOK visual development →
              </Link>
            </section>
          </div>
        ) : null}
      </div>
    </Site00AdminShell>
  );
}
