import { Link } from 'react-router-dom';
import type { EvolvePricingPlan } from '../../../../../shared/site00-evolve-pricing/types.js';
import { EvolvePricingIcon } from './EvolvePricingIcon';

type EvolvePricingPlanCardProps = {
  plan: EvolvePricingPlan;
  layout: 'mobile' | 'desktop-primary' | 'desktop-secondary' | 'desktop-column';
};

export function EvolvePricingPlanCard({ plan, layout }: EvolvePricingPlanCardProps) {
  if (layout === 'desktop-secondary') {
    return (
      <article className={`site00-evolve-pricing-card site00-evolve-pricing-card--desktop-secondary${plan.featured ? ' site00-evolve-pricing-card--featured' : ''}`}>
        <EvolvePricingIcon id={plan.iconId} size={36} />
        <div className="site00-evolve-pricing-card__body">
          <span className="site00-evolve-pricing-card__index">{plan.index}</span>
          <h3>{plan.name}</h3>
          <p className="site00-evolve-pricing-card__subtitle">{plan.subtitle}</p>
        </div>
        <div className="site00-evolve-pricing-card__price-block">
          <strong>{plan.price}</strong>
          <span>{plan.priceDetail}</span>
        </div>
        <Link to={plan.ctaRoute} className="site00-evolve-pricing-card__link-cta">
          {plan.ctaLabel}
        </Link>
      </article>
    );
  }

  return (
    <article
      className={`site00-evolve-pricing-card site00-evolve-pricing-card--${layout}${plan.featured ? ' site00-evolve-pricing-card--featured' : ''}`}
    >
      <div className="site00-evolve-pricing-card__top">
        <span className="site00-evolve-pricing-card__index">{plan.index}</span>
        {plan.badge ? <span className="site00-evolve-pricing-card__badge">{plan.badge}</span> : null}
        <span className="site00-evolve-pricing-card__arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <EvolvePricingIcon id={plan.iconId} size={layout === 'desktop-column' ? 40 : 44} />
      <div className="site00-evolve-pricing-card__body">
        <h3>{plan.name}</h3>
        <p className="site00-evolve-pricing-card__subtitle">{plan.subtitle}</p>
        <ul className="site00-evolve-pricing-card__bullets">
          {plan.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
      <div className="site00-evolve-pricing-card__price-block">
        <strong>{plan.price}</strong>
        <span>{plan.priceDetail}</span>
      </div>
      {plan.footer ? <p className="site00-evolve-pricing-card__footer">{plan.footer}</p> : null}
      <Link to={plan.ctaRoute} className="site00-evolve-pricing-card__cta">
        {plan.ctaLabel}
      </Link>
    </article>
  );
}
