import { Link } from 'react-router-dom';
import { HubActionCard } from '../../components/pages/Site00PagePrimitives';
import { Site00ComplexPageShell } from '../../components/experience/Site00ComplexPageShell';
import { SITE00_ROUTES } from '../../config/routes';

export default function BlueprintsPage() {
  return (
    <Site00ComplexPageShell
      pageClassName="site00-page--blueprints"
      pageLabel="BLUEPRINTS"
      title="BLUEPRINTS"
      subtitle="BUILD TEMPLATES AND STRUCTURAL STARTING POINTS — CREATIVE DIRECTION REQUIRED."
      reviewFlag="CREATIVE_DIRECTION_REQUIRED"
      primarySlot={
        <div className="site00-hub-grid">
          <HubActionCard
            title="BLDR TEMPLATES"
            description="EXISTING TEMPLATE LIBRARY — LINK TO CANONICAL BUILDER FLOW."
            cta="BROWSE →"
            href={SITE00_ROUTES.bldrTemplates}
          />
          <HubActionCard
            title="STUDIO BLUEPRINT"
            description="CLIENT STUDIO BLUEPRINT SELECTION — WORKFLOW PLACEHOLDER."
            cta="VIEW →"
            href={SITE00_ROUTES.studioBlueprint.replace(':projectSlug', 'site00')}
          />
        </div>
      }
      secondarySlot={
        <p className="site00-body">
          FULL BLUEPRINT EXPERIENCE REQUIRES FOUNDER CREATIVE DIRECTION.{' '}
          <Link to={SITE00_ROUTES.bldr} className="site00-link-red">
            EXPLORE BUILDER →
          </Link>
        </p>
      }
    />
  );
}
