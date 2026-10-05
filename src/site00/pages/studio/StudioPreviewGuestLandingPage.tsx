import { Link, useParams } from 'react-router-dom';
import { site00ExperienceCompilerPath } from '../../config/routes';
import { StudioShell } from '../../components/studio';
import { useSite00ShellAuth } from '../../auth/Site00ShellAuthContext';

/** Preview-guest-only Studio parent — no protected API data. */
export default function StudioPreviewGuestLandingPage() {
  const { projectSlug = 'site00' } = useParams();
  const { persistenceDegraded } = useSite00ShellAuth();

  return (
    <StudioShell>
      <div className="site00-studio-preview-guest">
        <p className="site00-studio-preview-guest__kicker">STUDIO · PREVIEW GUEST</p>
        <h1 className="site00-studio-preview-guest__title">{projectSlug.toUpperCase()}</h1>
        <p className="site00-studio-preview-guest__copy">
          Minimal Studio landing for cloud preview while Supabase sign-in is unavailable. Protected
          operations, client data, and cross-project Studio routes remain blocked.
        </p>
        {persistenceDegraded ? (
          <p className="site00-studio-preview-guest__degraded" role="status">
            PERSISTENCE DEGRADED / PREVIEW ONLY — no durable account or server project sync.
          </p>
        ) : null}
        <p className="site00-studio-preview-guest__actions">
          <Link className="site00-studio-preview-guest__cta" to={site00ExperienceCompilerPath(projectSlug)}>
            EXPERIENCE COMPILER WORKSPACE →
          </Link>
        </p>
      </div>
    </StudioShell>
  );
}
