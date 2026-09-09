import type { EvolvePricingMode } from '../../../../../shared/site00-evolve-pricing/types.js';
import { EVOLVE_PRICING_MODE_COPY } from '../../../../../shared/site00-evolve-pricing/catalog.js';
import { EvolvePricingModePersonIcon } from './EvolvePricingIcon';

type EvolvePricingModeToggleProps = {
  mode: EvolvePricingMode;
  onChange: (mode: EvolvePricingMode) => void;
  layout?: 'mobile' | 'desktop';
};

export function EvolvePricingModeToggle({ mode, onChange, layout = 'mobile' }: EvolvePricingModeToggleProps) {
  const modes: EvolvePricingMode[] = ['SELF_DIRECTED', 'SITE00_DIRECTED'];

  return (
    <div className={`site00-evolve-pricing-toggle site00-evolve-pricing-toggle--${layout}`} role="tablist" aria-label="Pricing mode">
      {modes.map((item) => {
        const copy = EVOLVE_PRICING_MODE_COPY[item];
        const selected = mode === item;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`site00-evolve-pricing-toggle__option${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(item)}
          >
            <span className="site00-evolve-pricing-toggle__radio" aria-hidden="true">
              {selected ? <span className="site00-evolve-pricing-toggle__radio-dot" /> : null}
            </span>
            <EvolvePricingModePersonIcon directed={item === 'SITE00_DIRECTED'} size={layout === 'desktop' ? 28 : 22} />
            <span className="site00-evolve-pricing-toggle__copy">
              <strong>{copy.label}</strong>
              <small>{copy.sublabel}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
