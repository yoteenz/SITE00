import { Link } from 'react-router-dom';
import { HubActionCard } from '../../components/pages/Site00PagePrimitives';
import { Site00ComplexPageShell } from '../../components/experience/Site00ComplexPageShell';
import { SITE00_ROUTES } from '../../config/routes';

export default function AccountPage() {
  return (
    <Site00ComplexPageShell
      pageClassName="site00-page--account"
      pageLabel="ACCOUNT"
      title="ACCOUNT"
      subtitle="PROFILE AND ACCOUNT MANAGEMENT — FUNCTIONAL REVIEW REQUIRED."
      reviewFlag="FUNCTIONAL_REVIEW_REQUIRED"
      primarySlot={
        <div className="site00-hub-grid">
          <HubActionCard title="CONTROL ROOM" description="ACCOUNT SETTINGS AND TEAM MANAGEMENT." cta="OPEN →" href={SITE00_ROUTES.control} />
          <HubActionCard
            title="INTAKES"
            description="VIEW IDENTITY AND BUILDER INTAKE SUBMISSIONS."
            cta="VIEW →"
            href={SITE00_ROUTES.accountIntakes}
          />
          <HubActionCard
            title="SIGN IN & SECURITY"
            description="SECURITY SETTINGS AND SESSION MANAGEMENT."
            cta="MANAGE →"
            href={SITE00_ROUTES.idntySignInSecurity}
          />
        </div>
      }
      secondarySlot={
        <p className="site00-body">
          DEDICATED ACCOUNT PROFILE ROUTE — DATA CONTRACT PLACEHOLDER.{' '}
          <Link to={SITE00_ROUTES.signIn} className="site00-link-red">
            SIGN IN →
          </Link>
        </p>
      }
    />
  );
}
