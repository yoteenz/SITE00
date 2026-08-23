import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

type PostPurchaseIntelligenceRedirectProps = {
  moduleLabel: string;
};

/** Public routes that previously led to deep production intelligence now redirect here. */
export function PostPurchaseIntelligenceRedirect({ moduleLabel }: PostPurchaseIntelligenceRedirectProps) {
  return (
    <div className="site00-idnty-assessment-card">
      <p className="site00-idnty-assessment__marker">PROJECT SETUP</p>
      <h2 className="site00-idnty-assessment-card__title">{moduleLabel} — POST-PURCHASE</h2>
      <p className="site00-idnty-assessment-card__subtitle">
        Deep production intelligence ({moduleLabel}) is collected after your project is activated — not during public discovery.
      </p>
      <p className="site00-idnty-assessment-card__subtitle">
        Public intake diagnoses scope and purchase fit. Post-purchase intelligence intake enables the work.
      </p>
      <div className="site00-idnty-complete-actions">
        <Link to={SITE00_ROUTES.support} className="site00-btn site00-btn--primary">
          TALK TO SITE 00 →
        </Link>
        <Link to={SITE00_ROUTES.idntyState} className="site00-btn">
          RETURN TO DISCOVERY
        </Link>
      </div>
    </div>
  );
}
