/**
 * Master skin preview card for onboarding selection.
 */

import type { MasterSkin, MasterSkinRecommendation } from '../../../../shared/site00-brand-lore/projectSkin/browserClient.js';

type Props = {
  skin: MasterSkin;
  recommendation?: MasterSkinRecommendation | null;
  selected?: boolean;
  onSelect: () => void;
};

export function MasterSkinPreviewCard({ skin, recommendation, selected, onSelect }: Props) {
  return (
    <article
      className={`site00-master-skin-card site00-master-skin--${skin.id}${selected ? ' is-selected' : ''}`}
      data-skin-id={skin.id}
    >
      <div className={`site00-master-skin-card__preview site00-master-skin-card__preview--${skin.id}`}>
        <span className="site00-master-skin-card__module-mock">EVOLVE</span>
      </div>
      <header>
        <strong>{skin.name.toUpperCase()}</strong>
        <span>{skin.skinFamily.replace(/_/g, ' ')}</span>
      </header>
      <p>{skin.description}</p>
      <div className="site00-master-skin-card__tags">
        {skin.expressionTags.slice(0, 4).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <p className="site00-master-skin-card__fields">
        SUITED FOR: {skin.supportedFields.slice(0, 4).join(' · ')}
      </p>
      {recommendation ? (
        <p className="site00-master-skin-card__why">WHY: {recommendation.reasoningSummary}</p>
      ) : null}
      <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onSelect}>
        {selected ? 'SELECTED' : 'USE THIS'}
      </button>
    </article>
  );
}
