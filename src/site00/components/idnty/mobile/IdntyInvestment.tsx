import { IDNTY_INVESTMENT_TIERS, IDNTY_STATE_COPY } from '../../../config/identity';
import type { IdntyBrandStateIconId } from '../../../config/idnty-brand-state-icons';
import {
  IDNTY_INVESTMENT_ACTIONS,
  IDNTY_INVESTMENT_RAIL_LABELS,
} from '../../../config/idnty-diagnostic';

type IdntyInvestmentProps = {
  activeStateId: IdntyBrandStateIconId;
  onProceed: (stateId: IdntyBrandStateIconId) => void;
};

export function IdntyInvestment({ activeStateId, onProceed }: IdntyInvestmentProps) {
  return (
    <section className="site00-idnty-diagnostic-investment" aria-labelledby="idnty-investment-heading">
      <header className="site00-idnty-diagnostic-investment__header">
        <h2 id="idnty-investment-heading" className="site00-idnty-diagnostic-investment__title">
          {IDNTY_STATE_COPY.investmentHeading}
        </h2>
        <p className="site00-idnty-diagnostic-investment__subtitle">{IDNTY_STATE_COPY.investmentSubhead}</p>
      </header>

      <div className="site00-idnty-diagnostic-investment__rail" aria-hidden="true">
        {IDNTY_INVESTMENT_RAIL_LABELS.map((label) => (
          <span key={label} className="site00-idnty-diagnostic-investment__rail-label">
            {label}
          </span>
        ))}
      </div>

      <div className="site00-idnty-diagnostic-investment__cards">
        {IDNTY_INVESTMENT_TIERS.map((tier) => {
          const action = IDNTY_INVESTMENT_ACTIONS[tier.brandStateId];
          const active = tier.brandStateId === activeStateId;
          return (
            <article
              key={tier.id}
              className={`site00-idnty-diagnostic-investment-card ${active ? 'site00-idnty-diagnostic-investment-card--active' : ''}`.trim()}
            >
              <p className="site00-idnty-diagnostic-investment-card__code">
                {action.code} / {action.tierLabel}
              </p>
              <p className="site00-idnty-diagnostic-investment-card__status">
                {action.verified ? (
                  <>
                    {action.statusLabel}
                    <span className="site00-idnty-diagnostic-investment-card__check" aria-hidden="true">
                      ✓
                    </span>
                  </>
                ) : (
                  action.statusLabel
                )}
              </p>
              <p className="site00-idnty-diagnostic-investment-card__price">{tier.priceLabel}</p>
              <span className="site00-idnty-diagnostic-investment-card__dash" aria-hidden="true">
                —
              </span>
              <ul className="site00-idnty-diagnostic-investment-card__list">
                {tier.services.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button
                type="button"
                className="site00-idnty-diagnostic-investment-card__cta"
                onClick={() => onProceed(tier.brandStateId)}
              >
                {action.cta}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
