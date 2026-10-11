import { Link } from 'react-router-dom';
import { getCorrespondenceWorkspace, listProjects, registeredTemplateCount } from '../../../../../shared/site00-correspondence-studio/workspace.js';
import { OPUS_V2_BENCHMARK_IMPORT_CONTRACT } from '../../../../../shared/site00-correspondence-studio/import/opusV2BenchmarkImport.js';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

export default function CorrespondenceStudioHomePage() {
  const manifest = getCorrespondenceWorkspace();
  const projects = listProjects(manifest);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="SITE 00 · CORRESPONDENCE STUDIO"
        title="CREATIVE PRODUCTION & REVIEW"
        subtitle="Email composition, responsive preview, versioned approval, and client delivery packaging."
      />

      <section className="cs-home-grid">
        <article className="cs-panel">
          <h2>ORGANIZATION</h2>
          <p className="cs-panel__lead">{manifest.organization.name}</p>
          <p className="cs-muted">Founder-only workspace · multi-brand contracts · no live sending in V1.</p>
        </article>

        <article className="cs-panel">
          <h2>PROJECTS</h2>
          <ul className="cs-list">
            {projects.map((p) => (
              <li key={p.project_id}>
                <Link to={SITE00_ADMIN_ROUTES.correspondenceProject(p.project_id)}>{p.name}</Link>
                <span className="cs-muted">{p.campaigns.length} campaign(s)</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="cs-panel">
          <h2>REGISTRY</h2>
          <p>
            <strong>{registeredTemplateCount(manifest)}</strong> email templates registered for Digital Foundation.
          </p>
          <p className="cs-muted">
            Opus V2 benchmarks: {OPUS_V2_BENCHMARK_IMPORT_CONTRACT.emails.length} imported at{' '}
            <em>{OPUS_V2_BENCHMARK_IMPORT_CONTRACT.emails[0]?.initial_review_state.replace(/_/g, ' ').toUpperCase()}</em>
          </p>
        </article>

        <article className="cs-panel">
          <h2>LEGACY DEBUG GALLERY</h2>
          <p className="cs-muted">The archetype email pack gallery remains available for engineering comparison.</p>
          <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.emailPack}>
            OPEN EMAIL PACK DEBUG
          </Link>
        </article>
      </section>
    </Site00AdminShell>
  );
}
