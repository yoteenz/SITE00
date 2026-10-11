import { Link, useParams } from 'react-router-dom';
import { getCampaign, getCorrespondenceWorkspace } from '../../../../../shared/site00-correspondence-studio/workspace.js';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

export default function CorrespondenceCampaignPage() {
  const { projectId = '', campaignId = '' } = useParams();
  const campaign = getCampaign(campaignId);
  const manifest = getCorrespondenceWorkspace();

  if (!campaign) {
    return (
      <Site00AdminShell>
        <ControlPageHeader kicker="CORRESPONDENCE STUDIO" title="CAMPAIGN NOT FOUND" />
        <Link to={SITE00_ADMIN_ROUTES.correspondenceProject(projectId)}>← PROJECT</Link>
      </Site00AdminShell>
    );
  }

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker={`${campaign.name} · CAMPAIGN`}
        title="EMAIL FAMILIES"
        subtitle={campaign.target_audience}
        actions={
          <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.correspondenceProject(projectId)}>
            ← PROJECT
          </Link>
        }
      />

      {campaign.email_families.map((family) => (
        <section key={family.family_id} className="cs-family-block">
          <h2>{family.label}</h2>
          {family.description ? <p className="cs-muted">{family.description}</p> : null}
          <ul className="cs-email-index">
            {family.template_ids.map((tid) => {
              const t = manifest.templates[tid];
              const version = t?.versions.find((v) => v.version_id === t.current_version_id);
              return (
                <li key={tid}>
                  <Link to={SITE00_ADMIN_ROUTES.correspondenceEmail(projectId, campaignId, tid)}>
                    {t?.display_name ?? tid}
                  </Link>
                  <span className="cs-tag">{version?.review_state.replace(/_/g, ' ').toUpperCase()}</span>
                  {version?.editorial_register ? <span className="cs-tag cs-tag--muted">{version.editorial_register}</span> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Site00AdminShell>
  );
}
