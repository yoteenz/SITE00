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

export function EvolvePricingDesktopExperience() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = parsePricingModeParam(searchParams.get('mode'));
  const modeCopy = EVOLVE_PRICING_MODE_COPY[mode];
  const plans = plansForMode(mode);

  const setMode = (next: EvolvePricingMode) => {
    setSearchParams({ mode: pricingModeToParam(next) }, { replace: true });
  };

  const primaryPlans = mode === 'SELF_DIRECTED' ? plans.slice(0, 3) : plans;
  const secondaryPlans = mode === 'SELF_DIRECTED' ? plans.slice(3) : [];

  return (
    <div className="site00-evolve-pricing site00-evolve-pricing--desktop">
      <header className="site00-evolve-pricing__hero site00-evolve-pricing__hero--desktop">
        <div className="site00-evolve-pricing__hero-left">
          <span className="site00-evolve-pricing__bracket" aria-hidden="true">
            [
          </span>
          <div>
            <h1>{EVOLVE_PRICING_HERO.title}</h1>
            <p className="site00-evolve-pricing__hero-sub">{EVOLVE_PRICING_HERO.subtitle}</p>
          </div>
        </div>
        <div className="site00-evolve-pricing__hero-center">
          <p className="site00-evolve-pricing__intro">{EVOLVE_PRICING_HERO.intro}</p>
          <EvolvePricingModeToggle mode={mode} onChange={setMode} layout="desktop" />
        </div>
        <div className="site00-evolve-pricing__hero-aside site00-evolve-pricing__hero-aside--desktop">
          <EvolvePricingHeroDiagram size={88} />
          <p>{EVOLVE_PRICING_HERO.diagramLabel}</p>
          <span className="site00-evolve-pricing__rule" aria-hidden="true" />
        </div>
      </header>

      <section className="site00-evolve-pricing__section site00-evolve-pricing__section--desktop">
        <header className="site00-evolve-pricing__section-head">
          <h2>{mode === 'SELF_DIRECTED' ? modeCopy.sectionSubtitle : modeCopy.sectionTitle}</h2>
          <span className="site00-evolve-pricing__section-rule" aria-hidden="true" />
        </header>
        <p className="site00-evolve-pricing__section-sub">{modeCopy.description}</p>

        {mode === 'SELF_DIRECTED' ? (
          <>
            <div className="site00-evolve-pricing__grid site00-evolve-pricing__grid--3">
              {primaryPlans.map((plan) => (
                <EvolvePricingPlanCard key={plan.id} plan={plan} layout="desktop-primary" />
              ))}
            </div>
            <div className="site00-evolve-pricing__grid site00-evolve-pricing__grid--2">
              {secondaryPlans.map((plan) => (
                <EvolvePricingPlanCard key={plan.id} plan={plan} layout="desktop-secondary" />
              ))}
            </div>
            <div className="site00-evolve-pricing__actions site00-evolve-pricing__actions--desktop">
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
              <p className="site00-evolve-pricing__aside-copy">
                {EVOLVE_PRICING_HERO.smartLabel}
                <span className="site00-evolve-pricing__rule" aria-hidden="true" />
                REAL PROGRESS. TOGETHER.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="site00-evolve-pricing__grid site00-evolve-pricing__grid--5">
              {primaryPlans.map((plan) => (
                <EvolvePricingPlanCard key={plan.id} plan={plan} layout="desktop-column" />
              ))}
            </div>
            <div className="site00-evolve-pricing__reinforcement site00-evolve-pricing__reinforcement--desktop">
              <div>
                <p className="site00-evolve-pricing__reinforcement-title">{EVOLVE_DIRECTED_REINFORCEMENT.title}</p>
                <p>{EVOLVE_DIRECTED_REINFORCEMENT.body}</p>
              </div>
              <button
                type="button"
                className="site00-evolve-pricing__btn site00-evolve-pricing__btn--outline"
                onClick={() => navigate('#compare')}
              >
                COMPARE PACKAGES →
              </button>
              <p className="site00-evolve-pricing__aside-copy">
                {EVOLVE_DIRECTED_REINFORCEMENT.aside}
                <span className="site00-evolve-pricing__rule" aria-hidden="true" />
              </p>
            </div>
            <div className="site00-evolve-pricing__actions site00-evolve-pricing__actions--desktop">
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
      </section>

      <footer className="site00-evolve-pricing__footer site00-evolve-pricing__footer--desktop">
        <span>SITE 00 ◆</span>
        <span>{EVOLVE_PRICING_FOOTER.tagline}</span>
        <span>{EVOLVE_PRICING_FOOTER.copyright}</span>
      </footer>
    </div>
  );
}
