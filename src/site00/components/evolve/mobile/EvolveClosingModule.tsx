import { site00EvolveIconUrl } from '../../../config/evolve-framework-icons';
import { EVOLVE_CLOSING_COPY } from '../../../config/evolve-diagnostic';

type EvolveClosingModuleProps = {
  onBeginAssessment: () => void;
};

function EvolveClosingArrow() {
  return (
    <svg className="site00-evolve-mobile-closing__arrow" viewBox="0 0 80 24" fill="none" aria-hidden="true">
      <line x1="4" y1="12" x2="64" y2="12" stroke="rgba(196, 30, 58, 0.35)" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M64 12L58 8V16L64 12Z" fill="rgba(196, 30, 58, 0.45)" />
    </svg>
  );
}

export function EvolveClosingModule({ onBeginAssessment }: EvolveClosingModuleProps) {
  return (
    <section className="site00-evolve-mobile-closing" aria-label="EVOLVE CLOSING">
      <img
        className="site00-evolve-mobile-closing__art site00-evolve-mobile-closing__art--before"
        src={site00EvolveIconUrl('refine')}
        alt=""
        width={56}
        height={56}
        aria-hidden="true"
      />
      <div className="site00-evolve-mobile-closing__copy">
        <p className="site00-evolve-mobile-closing__headline">{EVOLVE_CLOSING_COPY.headline}</p>
        <p className="site00-evolve-mobile-closing__title">{EVOLVE_CLOSING_COPY.title}</p>
        <span className="site00-evolve-mobile-closing__divider" aria-hidden="true" />
        <p className="site00-evolve-mobile-closing__body">{EVOLVE_CLOSING_COPY.body}</p>
        <EvolveClosingArrow />
      </div>
      <img
        className="site00-evolve-mobile-closing__art site00-evolve-mobile-closing__art--after"
        src={site00EvolveIconUrl('transform')}
        alt=""
        width={56}
        height={56}
        aria-hidden="true"
      />
      <div className="site00-evolve-mobile-closing__cta-wrap">
        <p className="site00-evolve-mobile-closing__cta-label">{EVOLVE_CLOSING_COPY.ctaLabel}</p>
        <button type="button" className="site00-evolve-mobile-closing__cta" onClick={onBeginAssessment}>
          BEGIN PROPERTY
          <br />
          ASSESSMENT →
        </button>
      </div>
    </section>
  );
}
