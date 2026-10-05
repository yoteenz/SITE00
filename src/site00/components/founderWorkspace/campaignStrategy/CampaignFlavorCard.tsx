import type { CampaignFlavorRecommendation, CampaignRecommendationTier } from '../../../../../shared/site00-expression-engine/campaign-strategy-language/types.js';

type Props = {
  recommendation: CampaignFlavorRecommendation;
  selected?: boolean;
  onSelect: () => void;
  clientMode?: boolean;
};

const TIER_LABEL: Record<CampaignRecommendationTier, string> = {
  SAFE: 'SAFE',
  FRESH: 'FRESH',
  WILD_CARD: 'WILD CARD',
};

export function CampaignFlavorCard({ recommendation, selected, onSelect, clientMode }: Props) {
  const { name, oneLineDescription, whyItFits, flavorTags, novelty, risk, tier } = recommendation;

  return (
    <button
      type="button"
      className={`site00-campaign-flavor-card${selected ? ' site00-campaign-flavor-card--selected' : ''}`}
      onClick={onSelect}
      data-tier={tier}
    >
      <div className="site00-campaign-flavor-card__head">
        <span className="site00-campaign-flavor-card__tier">{TIER_LABEL[tier]}</span>
        {!clientMode ? (
          <span className="site00-campaign-flavor-card__novelty" title="Novelty score">
            {Math.round(novelty.overall * 100)}% new
          </span>
        ) : null}
      </div>
      <div className="site00-campaign-flavor-card__icon" aria-hidden>
        ◈
      </div>
      <h3 className="site00-campaign-flavor-card__name">{name}</h3>
      <p className="site00-campaign-flavor-card__desc">{oneLineDescription}</p>
      <div className="site00-campaign-flavor-card__tags">
        {flavorTags.slice(0, clientMode ? 3 : 5).map((tag) => (
          <span key={tag} className="site00-campaign-flavor-card__tag">
            {clientMode ? simplifyTag(tag) : tag.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
      <p className="site00-campaign-flavor-card__why">{whyItFits}</p>
      {!clientMode ? (
        <p className="site00-campaign-flavor-card__meta">
          RISK {risk} · FIT {Math.round(recommendation.brandFitScore * 100)}%
        </p>
      ) : null}
    </button>
  );
}

function simplifyTag(tag: string): string {
  const map: Record<string, string> = {
    ORGANIC: 'Organic',
    CINEMATIC: 'Cinematic',
    PLAYFUL: 'Playful',
    EDITORIAL: 'Editorial',
    INTIMATE: 'Intimate',
    WITTY: 'Witty',
    LUXURIOUS: 'Luxurious',
    ENVIRONMENTAL: 'Environmental',
  };
  return map[tag] ?? tag.charAt(0) + tag.slice(1).toLowerCase();
}
