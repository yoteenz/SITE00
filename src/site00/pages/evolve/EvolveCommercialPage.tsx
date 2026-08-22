import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import {
  EVOLVE_COMMERCIAL_HIERARCHY_LABELS,
  EVOLVE_FOUNDATION,
  EVOLVE_PAID_MEDIA_SERVICE,
  EVOLVE_PROJECT_SERVICES,
  EVOLVE_RECURRING_PLANS,
  formatEvolvePrice,
} from '../../../../shared/site00-evolve-commercial/catalog';
import type { EvolveRecurringPlan } from '../../../../shared/site00-evolve-commercial/types';
import '../../styles/site00-evolve-commercial.css';

function PlanCard({ plan }: { plan: EvolveRecurringPlan }) {
  return (
    <article className={`site00-evolve-plan-card${plan.recommended ? ' site00-evolve-plan-card--recommended' : ''}`}>
      {plan.recommended ? <span className="site00-evolve-plan-card__recommended-tag">RECOMMENDED</span> : null}
      <p className="site00-evolve-plan-card__hierarchy">{EVOLVE_COMMERCIAL_HIERARCHY_LABELS[plan.id]}</p>
      <h3>{plan.name}</h3>
      <p className="site00-evolve-plan-card__price">{formatEvolvePrice(plan.priceCents, plan.priceQualifier, plan.billingInterval)}</p>
      <p className="site00-evolve-plan-card__service-model">{plan.serviceModel}</p>
      <p className="site00-body">{plan.description}</p>
      <div className="site00-evolve-plan-card__capacity">
        <span>CHANNELS: {plan.channelLimit === null ? 'CUSTOM SCOPE' : `UP TO ${plan.channelLimit}`}</span>
        <span>ASSETS/MONTH: {plan.assetCapacity ? `~${plan.assetCapacity.min}\u2013${plan.assetCapacity.max}` : 'CUSTOM SCOPE'}</span>
      </div>
      <ul className="site00-evolve-plan-card__features">
        {plan.features.slice(0, 6).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <button type="button" className="site00-btn site00-btn--ghost" disabled>
        {plan.customScopeRequired ? 'REQUEST PRIVATE SCOPE' : 'SELECT PLAN'}
      </button>
    </article>
  );
}

export default function EvolveCommercialPage() {
  return (
    <Site00PublicShell>
      <div className="site00-evolve-commercial">
        <header>
          <p className="site00-label-red">EVOLVE / COMMERCIAL</p>
          <h1 className="site00-panel-title">A MANAGED MARKETING OPERATING SYSTEM.</h1>
          <p className="site00-body">
            BUSINESS INTELLIGENCE → CONTENT BRAIN → CREATIVE DIRECTION → VISUAL DNA → CAMPAIGN STRATEGY → ASSET PRODUCTION → FOUNDER/CLIENT
            APPROVAL → DISTRIBUTION → PERFORMANCE INTELLIGENCE → LEARNING → NEXT CAMPAIGN.
          </p>
          <p className="site00-body">TIER DIFFERENTIATION IS HOW MUCH OF THE MARKETING OPERATION EVOLVE TAKES OVER — NOT A POST COUNT.</p>
        </header>

        <section className="site00-evolve-commercial__section">
          <p className="site00-evolve-commercial__section-title">ACTIVATE — REQUIRED ONCE, BEFORE A RECURRING PLAN</p>
          <div className="site00-evolve-commercial__foundation">
            <h2>{EVOLVE_FOUNDATION.name}</h2>
            <p className="site00-evolve-commercial__foundation-price">
              {formatEvolvePrice(EVOLVE_FOUNDATION.priceCents, EVOLVE_FOUNDATION.priceQualifier, EVOLVE_FOUNDATION.billingInterval)}
            </p>
            <p className="site00-body">{EVOLVE_FOUNDATION.description}</p>
            <p className="site00-evolve-commercial__governance-note">
              A qualifying SITE 00 Identity engagement may already satisfy Foundation when sufficient canonical intelligence exists — EVOLVE never asks a
              client to purchase intelligence SITE 00 already has.
            </p>
          </div>
        </section>

        <section className="site00-evolve-commercial__section">
          <p className="site00-evolve-commercial__section-title">RECURRING PLANS — ESSENTIAL → GROWTH → STUDIO → PRIVATE</p>
          <div className="site00-evolve-commercial__plans">
            {EVOLVE_RECURRING_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <section className="site00-evolve-commercial__section">
          <p className="site00-evolve-commercial__section-title">PROJECT SERVICES — FINITE ENGAGEMENTS, NO RETAINER REQUIRED</p>
          <div className="site00-evolve-commercial__project-services">
            {EVOLVE_PROJECT_SERVICES.map((service) => (
              <article key={service.id} className="site00-evolve-project-service-card">
                <h3>{service.name}</h3>
                <p className="site00-evolve-project-service-card__price">
                  {formatEvolvePrice(service.priceCents, service.priceQualifier, service.billingInterval)}
                </p>
                <p className="site00-body">{service.description}</p>
                <p className="site00-evolve-commercial__governance-note">{service.governanceNotes}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="site00-evolve-commercial__section">
          <p className="site00-evolve-commercial__section-title">PAID MEDIA — COMMERCIALLY SEPARATE FROM EVOLVE RETAINERS</p>
          <div className="site00-evolve-commercial__paid-media">
            <h3>{EVOLVE_PAID_MEDIA_SERVICE.name}</h3>
            <p className="site00-body">{EVOLVE_PAID_MEDIA_SERVICE.description}</p>
            <p className="site00-evolve-commercial__governance-note">{EVOLVE_PAID_MEDIA_SERVICE.governanceNotes}</p>
          </div>
        </section>

        <p className="site00-marketing-note">
          NO CHECKOUT OCCURS ON THIS PAGE. SELECTING A PLAN OR SERVICE IS A REQUEST — CONTACT SITE 00 TO CONFIRM SCOPE AND ACTIVATION.
        </p>
      </div>
    </Site00PublicShell>
  );
}
