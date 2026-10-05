import { EVOLVE_FRAMEWORK_PILLARS, EVOLVE_HOMEPAGE_EXPANDED, EVOLVE_HOMEPAGE_EXPANDED_DESKTOP } from '../../config/evolve';
import { isSite00OriginDesktopPath, SITE00_ROUTES } from '../../config/routes';
import { ArchitecturalPanel } from '../panels/ArchitecturalPanel';
import { SectionRule } from '../panels/SectionRule';
import { OriginPanelIcon } from './OriginPanelIcon';
import { EvolveFrameworkIcon } from './EvolveFrameworkIcon';
import { ArrowAction } from '../icons/ArrowAction';
import { useNavigate, useLocation, Link } from 'react-router-dom';

type EvolveExpandedPanelProps = {
  onCollapse: () => void;
  isDesktopArtboard?: boolean;
};

export function EvolveExpandedPanel({ onCollapse, isDesktopArtboard = false }: EvolveExpandedPanelProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const copy = isDesktopArtboard ? EVOLVE_HOMEPAGE_EXPANDED_DESKTOP : EVOLVE_HOMEPAGE_EXPANDED;

  const startEvolve = () =>
    navigate(isSite00OriginDesktopPath(pathname) ? SITE00_ROUTES.evolveStateDesktop : SITE00_ROUTES.evolveState);

  return (
    <div
      className={`site00-panel-enter ${isDesktopArtboard ? 'site00-origin-evolve-expanded-panel' : ''}`.trim()}
      style={{ padding: '0 24px 100px', maxWidth: 720, margin: '0 auto' }}
    >
      <ArchitecturalPanel>
        <div style={{ padding: '32px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                className="site00-label-red site00-origin-panel__number"
                style={{ color: 'var(--site00-origin-card-number-color, var(--site-red))' }}
              >
                {copy.number}
              </span>
              <h2 className="site00-heading-lg" style={{ margin: '8px 0 4px' }}>
                {copy.title}
              </h2>
              <p className="site00-label">{copy.subtitle}</p>
            </div>
            <OriginPanelIcon panel="evolve" size="lg" />
          </div>

          <div style={{ margin: '24px 0' }}>
            <SectionRule />
          </div>

          <p className="site00-body" style={{ marginBottom: 24 }}>
            {copy.overview}
          </p>

          <p className="site00-label-red site00-origin-framework-heading">CHOOSE YOUR PATH</p>
          <div className="site00-origin-framework-pillars site00-evolve-framework-pillars">
            {EVOLVE_FRAMEWORK_PILLARS.map((pillar) => (
              <div key={pillar.id} className="site00-origin-framework-pillar">
                <EvolveFrameworkIcon id={pillar.icon} title={pillar.title} />
                <p className="site00-micro" style={{ margin: '8px 0 4px' }}>
                  {pillar.title}
                </p>
                <p className="site00-body" style={{ fontSize: 10 }}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            {isDesktopArtboard ? (
              <button type="button" className="site00-action-link site00-action-link--red" onClick={startEvolve}>
                {copy.cta}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <ArrowAction label={copy.cta} variant="red" onClick={startEvolve} />
                <Link to={SITE00_ROUTES.evolve} className="site00-btn-ghost">
                  {EVOLVE_HOMEPAGE_EXPANDED.secondaryCta}
                </Link>
              </div>
            )}
            <button type="button" className="site00-btn-ghost" onClick={onCollapse}>
              BACK
            </button>
          </div>
        </div>
      </ArchitecturalPanel>
    </div>
  );
}
