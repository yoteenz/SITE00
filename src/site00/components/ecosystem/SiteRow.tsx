import { Link } from 'react-router-dom';
import { StatusBadge } from '../pages/Site00PagePrimitives';
import type { EcosystemSite } from '../../config/seed/site00-ecosystem-seed';
import { formatEcosystemDate } from '../../config/seed/site00-ecosystem-seed';

function siteTone(status: EcosystemSite['status']): 'published' | 'draft' {
  return status === 'Published' ? 'published' : 'draft';
}

type SiteRowProps = {
  site: EcosystemSite;
  compact?: boolean;
};

export function SiteRow({ site, compact }: SiteRowProps) {
  return (
    <li className={`site00-site-row ${compact ? 'site00-site-row--compact' : ''}`.trim()}>
      <div className="site00-site-row__thumb" aria-hidden="true" />
      <div className="site00-site-row__body">
        <p className="site00-site-row__domain">{site.domain}</p>
        {!compact ? <p className="site00-site-row__name">{site.name}</p> : null}
        <StatusBadge status={site.status} tone={siteTone(site.status)} />
      </div>
      <span className="site00-site-row__date">{formatEcosystemDate(site.lastUpdated)}</span>
      <Link to={site.href} className="site00-btn-ghost-sm">
        MANAGE
      </Link>
      <button type="button" className="site00-site-row__menu" aria-label={`More actions for ${site.domain}`}>
        ⋯
      </button>
    </li>
  );
}
