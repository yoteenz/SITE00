import { Link } from 'react-router-dom';
import { EVOLVE_MARKETING_CAPABILITY } from '../../../config/marketing-content';
import { SITE00_ROUTES } from '../../../config/routes';
import { ArrowIconSmall } from '../../icons/ArrowAction';

export function MarketingCapabilityCard({ compact = false }: { compact?: boolean }) {
  return (
    <article className={`site00-marketing-capability ${compact ? 'site00-marketing-capability--compact' : ''}`.trim()}>
      <span className="site00-label-red">{EVOLVE_MARKETING_CAPABILITY.code}</span>
      <div className="site00-marketing-capability__mark" aria-hidden />
      <p className="site00-panel-title">{EVOLVE_MARKETING_CAPABILITY.title}</p>
      <p className="site00-label">{EVOLVE_MARKETING_CAPABILITY.subtitle}</p>
      {!compact ? (
        <p className="site00-body" style={{ fontSize: 11, marginTop: 8 }}>
          {EVOLVE_MARKETING_CAPABILITY.description}
        </p>
      ) : null}
      <Link className="site00-action-link site00-action-link--red" to={SITE00_ROUTES.evolveMarketing}>
        {EVOLVE_MARKETING_CAPABILITY.cta.replace(' →', '')}
        <ArrowIconSmall />
      </Link>
    </article>
  );
}
