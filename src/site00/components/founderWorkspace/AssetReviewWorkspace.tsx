import type { ReactNode } from 'react';
import type { CreativeAssetPresentation } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';

type AssetReviewWorkspaceProps = {
  open: boolean;
  asset: CreativeAssetPresentation | null;
  onClose: () => void;
  understand?: ReactNode;
  inspect?: ReactNode;
  actions?: ReactNode;
  sequenceIndex?: number;
  sequenceTotal?: number;
};

export function AssetReviewWorkspace({
  open,
  asset,
  onClose,
  understand,
  inspect,
  actions,
  sequenceIndex,
  sequenceTotal,
}: AssetReviewWorkspaceProps) {
  if (!open || !asset) return null;

  return (
    <div className="site00-fws-review" role="dialog" aria-modal="true" aria-label="Asset review">
      <button type="button" className="site00-fws-review__backdrop" aria-label="Close review" onClick={onClose} />
      <div className="site00-fws-review__sheet">
        <header className="site00-fws-review__header">
          {sequenceTotal != null && sequenceIndex != null ? (
            <p className="site00-fws-review__sequence">
              SLIDE {sequenceIndex + 1} / {sequenceTotal}
            </p>
          ) : null}
          <button type="button" className="site00-fws-review__close" onClick={onClose}>
            CLOSE
          </button>
        </header>

        <div className="site00-fws-review__creative">
          {asset.previewUrl ? (
            <img src={asset.previewUrl} alt="" className="site00-fws-review__img" />
          ) : (
            <div className="site00-fws-review__placeholder">{asset.title}</div>
          )}
        </div>

        <div className="site00-fws-review__info">
          <h2 className="site00-fws-review__title">{asset.title}</h2>
          <p className="site00-fws-review__format">
            {asset.channelLabel} · {asset.formatLabel} · {asset.statusLabel}
          </p>
        </div>

        {understand ? (
          <section className="site00-fws-review__understand">
            <h3 className="site00-fws-review__section-title">UNDERSTAND</h3>
            {understand}
          </section>
        ) : null}

        {actions ? <div className="site00-fws-review__actions">{actions}</div> : null}

        {inspect ? (
          <details className="site00-fws-review__inspect">
            <summary>INSPECT — technical metadata</summary>
            {inspect}
          </details>
        ) : null}
      </div>
    </div>
  );
}

export function AssetReviewFromPresentation({
  asset,
  ...rest
}: Omit<AssetReviewWorkspaceProps, 'asset'> & { asset: CreativeAssetPresentation | null }) {
  return <AssetReviewWorkspace asset={asset} {...rest} />;
}
