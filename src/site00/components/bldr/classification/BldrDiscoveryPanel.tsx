import { BLDR_DISCOVERY_PANEL } from '../../../config/bldr-classification';
import { BldrBuildClassIcon } from '../BldrBuildClassIcon';
import { Site00BuildDirectionArrowIcon } from '../../mobile/Site00MobileIcons';

type BldrDiscoveryPanelProps = {
  onSelect: () => void;
};

export function BldrDiscoveryPanel({ onSelect }: BldrDiscoveryPanelProps) {
  return (
    <section className="site00-bldr-discovery-panel" aria-labelledby="bldr-discovery-heading">
      <div className="site00-bldr-discovery-panel__copy">
        <p id="bldr-discovery-heading" className="site00-bldr-discovery-panel__title">
          {BLDR_DISCOVERY_PANEL.title}
        </p>
        <p className="site00-bldr-discovery-panel__headline">
          {BLDR_DISCOVERY_PANEL.headlineLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <span className="site00-bldr-discovery-panel__rule" aria-hidden="true" />
        <p className="site00-bldr-discovery-panel__body">{BLDR_DISCOVERY_PANEL.body}</p>
      </div>
      <div className="site00-bldr-discovery-panel__art" aria-hidden="true">
        <BldrBuildClassIcon id="not-sure" title="Not sure" className="site00-bldr-discovery-panel__icon" />
      </div>
      <button
        type="button"
        className="site00-bldr-discovery-panel__cta"
        onClick={onSelect}
        aria-label={BLDR_DISCOVERY_PANEL.ariaLabel}
      >
        <span>{BLDR_DISCOVERY_PANEL.cta}</span>
        <Site00BuildDirectionArrowIcon size={14} />
      </button>
    </section>
  );
}
