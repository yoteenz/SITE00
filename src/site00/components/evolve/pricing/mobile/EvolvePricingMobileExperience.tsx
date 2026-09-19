import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  EVOLVE_DIRECTED_REINFORCEMENT,
  EVOLVE_PRICING_FOOTER,
  EVOLVE_PRICING_HERO,
  EVOLVE_PRICING_MODE_COPY,
  parsePricingModeParam,
  plansForMode,
  pricingModeToParam,
} from '../../../../../../shared/site00-evolve-pricing/catalog.js';
import type { EvolvePricingMode } from '../../../../../../shared/site00-evolve-pricing/types.js';
import { SITE00_ROUTES } from '../../../../config/routes';
import { EvolvePricingHeroDiagram } from '../EvolvePricingIcon';
import { EvolvePricingModeToggle } from '../EvolvePricingModeToggle';
import { EvolvePricingPlanCard } from '../EvolvePricingPlanCard';

export function EvolvePricingMobileExperience() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = parsePricingModeParam(searchParams.get('mode'));
  const modeCopy = EVOLVE_PRICING_MODE_COPY[mode];
  const plans = plansForMode(mode);

  const setMode = (next: EvolvePricingMode) => {
    setSearchParams({ mode: pricingModeToParam(next) }, { replace: true });
  };

  return (
    <div className="site00-evolve-pricing site00-evolve-pricing--mobile">
      <header className="site00-evolve-pricing__hero">
        <div className="site00-evolve-pricing__hero-main">
          <span className="site00-evolve-pricing__bracket" aria-hidden="true">
            [
          </span>
          <div>
            <h1>{EVOLVE_PRICING_HERO.title}</h1>
            <p className="site00-evolve-pricing__hero-sub">{EVOLVE_PRICING_HERO.subtitle}</p>
          </div>
        </div>
        <div className="site00-evolve-pricing__hero-aside">
          <EvolvePricingHeroDiagram size={64} />
          <p>{EVOLVE_PRICING_HERO.diagramLabel}</p>
          <span className="site00-evolve-pricing__rule" aria-hidden="true" />
        </div>
        <p className="site00-evolve-pricing__intro">{EVOLVE_PRICING_HERO.intro}</p>
      </header>

      <EvolvePricingModeToggle mode={mode} onChange={setMode} layout="mobile" />

      <section className="site00-evolve-pricing__section">
        <header className="site00-evolve-pricing__section-head">
          <h2>{modeCopy.sectionTitle}</h2>
          <span className="site00-evolve-pricing__section-rule" aria-hidden="true" />
        </header>
        <p className="site00-evolve-pricing__section-sub">{modeCopy.description}</p>
        <div className="site00-evolve-pricing__stack">
          {plans.map((plan) => (
            <EvolvePricingPlanCard key={plan.id} plan={plan} layout="mobile" />
          ))}
        </div>
      </section>

      {mode === 'SELF_DIRECTED' ? (
        <div className="site00-evolve-pricing__actions site00-evolve-pricing__actions--mobile">
          <button type="button" className="site00-evolve-pricing__btn site00-evolve-pricing__btn--outline" onClick={() => navigate('#compare')}>
            COMPARE PLANS
          </button>
          <button
            type="button"
            className="site00-evolve-pricing__btn site00-evolve-pricing__btn--primary"
            onClick={() => navigate(SITE00_ROUTES.signIn + '?plan=evolve-solo')}
          >
            START SOLO →
          </button>
        </div>
      ) : (
        <>
          <div className="site00-evolve-pricing__reinforcement site00-evolve-pricing__reinforcement--mobile">
            <p className="site00-evolve-pricing__reinforcement-title">{EVOLVE_DIRECTED_REINFORCEMENT.title}</p>
            <p>{EVOLVE_DIRECTED_REINFORCEMENT.body}</p>
          </div>
          <div className="site00-evolve-pricing__actions site00-evolve-pricing__actions--mobile">
            <button type="button" className="site00-evolve-pricing__btn site00-evolve-pricing__btn--outline" onClick={() => navigate('#compare')}>
              COMPARE PACKAGES
            </button>
            <button
              type="button"
              className="site00-evolve-pricing__btn site00-evolve-pricing__btn--primary"
              onClick={() => navigate(SITE00_ROUTES.contact + '?offer=consult')}
            >
              BOOK A CONSULT →
            </button>
          </div>
        </>
      )}

      <footer className="site00-evolve-pricing__footer">
        <span>SITE 00 ◆</span>
        <span>{EVOLVE_PRICING_FOOTER.tagline}</span>
        <span>© 2024</span>
      </footer>
    </div>
  );
}
