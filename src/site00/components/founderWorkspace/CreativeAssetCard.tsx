import type { CreativeAssetPresentation } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';

type CreativeAssetCardProps = {
  asset: CreativeAssetPresentation;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onSelect?: () => void;
  onReview?: () => void;
};

export function CreativeAssetCard({
  asset,
  size = 'md',
  selected,
  onSelect,
  onReview,
}: CreativeAssetCardProps) {
  const attentionClass =
    asset.attention === 'NEEDS_YOUR_DECISION'
      ? 'site00-fws-asset--needs-decision'
      : asset.attention === 'READY_TO_REVIEW'
        ? 'site00-fws-asset--ready'
        : '';

  return (
    <article
      className={`site00-fws-asset site00-fws-asset--${size} ${attentionClass} ${selected ? 'site00-fws-asset--selected' : ''}`}
    >
      <button
        type="button"
        className="site00-fws-asset__preview-btn"
        onClick={onSelect ?? onReview}
        aria-label={`Review ${asset.title}`}
      >
        <div className="site00-fws-asset__preview">
          {asset.previewUrl ? (
            <img src={asset.previewUrl} alt="" className="site00-fws-asset__img" />
          ) : (
            <div className="site00-fws-asset__placeholder">
              <span>{asset.title.slice(0, 40)}</span>
            </div>
          )}
          <span className={`site00-fws-asset__status site00-fws-asset__status--${asset.internalStatus.toLowerCase()}`}>
            {asset.statusLabel}
          </span>
        </div>
      </button>
      <div className="site00-fws-asset__meta">
        <h3 className="site00-fws-asset__title">{asset.title}</h3>
        <p className="site00-fws-asset__format">
          {asset.channelLabel} · {asset.formatLabel}
        </p>
        {onReview ? (
          <button type="button" className="site00-fws-asset__action" onClick={onReview}>
            REVIEW →
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function CreativeAssetStrip({
  assets,
  onSelect,
}: {
  assets: CreativeAssetPresentation[];
  onSelect?: (asset: CreativeAssetPresentation) => void;
}) {
  return (
    <div className="site00-fws-asset-strip">
      {assets.map((asset) => (
        <CreativeAssetCard
          key={asset.id}
          asset={asset}
          size="sm"
          onReview={onSelect ? () => onSelect(asset) : undefined}
        />
      ))}
    </div>
  );
}
