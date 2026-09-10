import type {
  CampaignExpressionBrief,
  CampaignFlavorRecommendation,
} from '../../../../../shared/site00-expression-engine/campaign-strategy-language/types.js';
import { LIVED_IN_ENVIRONMENTAL_ALIASES } from '../../../../../shared/site00-expression-engine/campaign-strategy-language/strategyLibrary.js';
import type { ConceptTerritorySeedHint } from '../../../../../shared/site00-expression-engine/campaign-strategy-language/types.js';

type Props = {
  recommendation: CampaignFlavorRecommendation;
  brief: CampaignExpressionBrief | null;
  territorySeeds: ConceptTerritorySeedHint[];
  onApprove?: () => void;
  onGenerateTerritories?: () => void;
  clientMode?: boolean;
};

export function CampaignStrategyDetailPanel({
  recommendation,
  brief,
  territorySeeds,
  onApprove,
  onGenerateTerritories,
  clientMode,
}: Props) {
  const isLivedIn = recommendation.strategyType === 'LIVED_IN_ENVIRONMENTAL';

  return (
    <div className="site00-campaign-strategy-detail">
      <header className="site00-campaign-strategy-detail__header">
        <p className="site00-campaign-strategy-detail__eyebrow">STRATEGY DETAIL</p>
        <h2>{recommendation.name}</h2>
        <p className="site00-campaign-strategy-detail__lead">{recommendation.oneLineDescription}</p>
      </header>

      <section className="site00-campaign-strategy-detail__section">
        <h3>WHAT IT IS</h3>
        <p>{recommendation.oneLineDescription}</p>
        {isLivedIn && !clientMode ? (
          <p className="site00-campaign-strategy-detail__aliases">
            Also: {LIVED_IN_ENVIRONMENTAL_ALIASES.join(' · ')}
          </p>
        ) : null}
      </section>

      {isLivedIn ? (
        <section className="site00-campaign-strategy-detail__section site00-campaign-strategy-detail__lived-in">
          <h3>LIVED-IN PRINCIPLES</h3>
          <ul>
            <li>Environment as story engine — product discovered through details</li>
            <li>Progressive reveal — not centered in every frame</li>
            <li>Product role: {recommendation.productRole.replace(/_/g, ' ')}</li>
            <li>Hands, nails, hair, jewelry as secondary brand signals</li>
            <li>Wide + detail shots from one location</li>
            <li>Low-copy confidence — visual sequence carries story</li>
            <li>Recurring motifs with variation</li>
          </ul>
        </section>
      ) : null}

      {!clientMode ? (
        <>
          <section className="site00-campaign-strategy-detail__section">
            <h3>ROLES</h3>
            <dl className="site00-campaign-strategy-detail__matrix">
              <div>
                <dt>Product</dt>
                <dd>{recommendation.productRole.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt>Human</dt>
                <dd>{recommendation.humanRole.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt>Environment</dt>
                <dd>{recommendation.environmentRole.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt>Reveal</dt>
                <dd>{recommendation.profile.revealStyle.replace(/_/g, ' ')}</dd>
              </div>
            </dl>
          </section>

          {brief ? (
            <section className="site00-campaign-strategy-detail__section">
              <h3>SEQUENCE GRAMMAR</h3>
              <ol className="site00-campaign-strategy-detail__sequence">
                {brief.sequence.map((step) => (
                  <li key={step.order}>
                    <strong>POST {String(step.order).padStart(2, '0')}</strong> — {step.beat}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      ) : null}

      {territorySeeds.length > 0 ? (
        <section className="site00-campaign-strategy-detail__section">
          <h3>CONCEPT TERRITORY SEEDS</h3>
          <p className="site00-campaign-strategy-detail__note">
            Upstream layer — feeds existing CreativeConceptTerritory system (does not replace it).
          </p>
          {territorySeeds.map((seed) => (
            <article key={seed.territoryName} className="site00-campaign-strategy-detail__territory">
              <h4>{seed.territoryName}</h4>
              <p>{seed.centralConcept}</p>
            </article>
          ))}
        </section>
      ) : null}

      <div className="site00-campaign-strategy-detail__actions">
        {onGenerateTerritories ? (
          <button type="button" className="site00-campaign-flavor-btn site00-campaign-flavor-btn--primary" onClick={onGenerateTerritories}>
            GENERATE CAMPAIGN TERRITORIES
          </button>
        ) : null}
        {onApprove ? (
          <button type="button" className="site00-campaign-flavor-btn site00-campaign-flavor-btn--secondary" onClick={onApprove}>
            APPROVE FLAVOR
          </button>
        ) : null}
      </div>
    </div>
  );
}
