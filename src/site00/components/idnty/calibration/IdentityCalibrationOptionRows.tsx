import type { IdntyAssessmentOption } from '../../../config/idnty-assessment';
import { IdentityTargetControl } from './IdentityTargetControl';

type IdentityCalibrationOptionRowsProps = {
  options: IdntyAssessmentOption[];
  selected: string[];
  onToggle: (id: string) => void;
  mode: 'multi' | 'single';
};

export function IdentityCalibrationOptionRows({
  options,
  selected,
  onToggle,
  mode,
}: IdentityCalibrationOptionRowsProps) {
  return (
    <ul className="site00-idnty-calibration-options" role={mode === 'single' ? 'radiogroup' : 'group'}>
      {options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const num = String(index + 1).padStart(2, '0');
        return (
          <li key={option.id}>
            <button
              type="button"
              role={mode === 'single' ? 'radio' : 'checkbox'}
              aria-checked={isSelected}
              className={`site00-idnty-calibration-options__row ${isSelected ? 'site00-idnty-calibration-options__row--selected' : ''}`.trim()}
              onClick={() => onToggle(option.id)}
            >
              <span className="site00-idnty-calibration-options__index">{num}</span>
              <span className="site00-idnty-calibration-options__divider" aria-hidden="true" />
              <span className="site00-idnty-calibration-options__label">{option.label}</span>
              {isSelected && mode === 'multi' ? (
                <span className="site00-idnty-calibration-options__selected-mark" aria-hidden="true">
                  SELECTED
                </span>
              ) : null}
              <IdentityTargetControl selected={isSelected} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
