import { Link, useParams } from 'react-router-dom';
import { getCampaign, getProject } from '../../../../../shared/site00-correspondence-studio/workspace.js';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

export default function CorrespondenceProjectPage() {
  const { projectId = '' } = useParams();
  const project = getProject(projectId);

  if (!project) {
    return (
      <Site00AdminShell>
        <ControlPageHeader kicker="CORRESPONDENCE STUDIO" title="PROJECT NOT FOUND" />
        <Link to={SITE00_ADMIN_ROUTES.correspondenceStudio}>← BACK</Link>
      </Site00AdminShell>
    );
  }

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="CORRESPONDENCE STUDIO"
        title={project.name}
        subtitle={`Brand authority · ${project.brand_authority_id}`}
        actions={
          <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.correspondenceStudio}>
            ← STUDIO HOME
          </Link>
        }
      />

      <section className="cs-campaign-list">
        {project.campaigns.map((c) => {
          const full = getCampaign(c.campaign_id);
          const templateTotal = full?.email_families.reduce((n, f) => n + f.template_ids.length, 0) ?? 0;
          return (
            <article key={c.campaign_id} className="cs-panel">
              <h2>{c.name}</h2>
              <p className="cs-muted">{c.primary_objective}</p>
              <p>
                {full?.email_families.length ?? 0} families · {templateTotal} templates
              </p>
              <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.correspondenceCampaign(projectId, c.campaign_id)}>
                OPEN CAMPAIGN
              </Link>
            </article>
          );
        })}
      </section>
    </Site00AdminShell>
  );
}
