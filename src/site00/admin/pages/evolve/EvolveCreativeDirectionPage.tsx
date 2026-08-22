import { Link, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { CreativeDirectionExperience } from '../../../components/evolve/creative-direction/CreativeDirectionExperience';
import '../../../styles/site00-creative-direction.css';

const adminCreativeDirectionApi = {
  load: async (orgSlug: string) => (await site00EvolveApi.creativeDirection(orgSlug)) as import('../../../components/evolve/creative-direction/CreativeDirectionExperience').CreativeDirectionPayload,
  submitDecision: (orgSlug: string, input: Parameters<typeof site00EvolveApi.creativeDirectionDecision>[1]) =>
    site00EvolveApi.creativeDirectionDecision(orgSlug, input).then(() => undefined),
};

export default function EvolveCreativeDirectionPage() {
  const { orgSlug = 'ndxbook' } = useParams<{ orgSlug: string }>();

  return (
    <Site00AdminShell>
      <CreativeDirectionExperience
        orgSlug={orgSlug}
        api={adminCreativeDirectionApi}
        adminFooter={
          <>
            <Link to={SITE00_ADMIN_ROUTES.evolveCreativeDirectionDebug}>PRODUCTION CONTROLS →</Link>
            <Link to={SITE00_ADMIN_ROUTES.evolvePilot(orgSlug)}>PILOT CONTROL →</Link>
          </>
        }
      />
    </Site00AdminShell>
  );
}
