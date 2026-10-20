import { BsBody } from '../bldrBody';
import type { BuilderSelection } from '../../builder-experience';
import type { SpatialBuilderState } from '../../builder-experience/spatialStudio/types';
import { boldFeelSubOptions } from './feelBoldCatalog';
import { estimateDeltaLabel } from './pricingLabel';
import { shopSubOptions } from './workShopCatalog';
import type { DrilldownUiState } from './types';
import { spatialSelectionToBuilder } from '../../builder-experience/spatialStudio/mapping';

type WorkProps = {
  ui: DrilldownUiState;
  state: SpatialBuilderState;
  selection: BuilderSelection;
  onEnter: () => void;
  onBack: () => void;
  onToggleAccounts: (on: boolean) => void;
};

type FeelProps = {
  ui: DrilldownUiState;
  state: SpatialBuilderState;
  onEnter: () => void;
  onBack: () => void;
  onFeelOption: (id: 'TYPE_CONDENSED' | 'TYPE_EXPRESSIVE' | 'COLOR_SATURATED' | 'COLOR_HIGH_CONTRAST') => void;
};

const STATUS_LABEL: Record<string, string> = {
  INCLUDED: 'INCLUDED',
  OPTIONAL: 'OPTIONAL',
  SELECTED: 'SELECTED',
  ADDITIONAL_COST: 'ADDITIONAL COST',
  REQUIRES_QUOTE: 'REQUIRES QUOTE',
  UNAVAILABLE: 'UNAVAILABLE',
};

export function WorkShopDrilldownPanel({ ui, state, selection, onEnter, onBack, onToggleAccounts }: WorkProps) {
  const options = shopSubOptions(selection);
  const inFocus = ui.phase === 'FOCUSED' || ui.phase === 'EDITING' || ui.phase === 'CONFIRMING';
  const shopOn = state.workModules.includes('SHOP');
  const accountsOn = Boolean(state.shopAccounts);
  const before = selection;
  const after = spatialSelectionToBuilder({ ...state, shopAccounts: !accountsOn });
  const delta = estimateDeltaLabel(before, accountsOn ? spatialSelectionToBuilder({ ...state, shopAccounts: false }) : after);

  if (!shopOn && ui.phase === 'IDLE') return null;

  return (
    <aside className="bs-drill" aria-label="SHOP EXPLORATION">
      <p className="bs-drill__title">SHOP · SELL</p>
      {ui.phase === 'IDLE' || ui.phase === 'TARGET_SELECTED' ? (
        <>
          <p className="bs-drill__plain">
            <BsBody>SELECT THE GALLERY ON THE MODEL, THEN ENTER TO SEE WHAT SELL INCLUDES AND WHAT YOU CAN ADD.</BsBody>
          </p>
          <div className="bs-drill__actions">
            <button type="button" className="bs-drill__btn" onClick={onEnter} disabled={!shopOn}>
              ENTER SHOP SPACE
            </button>
          </div>
        </>
      ) : null}
      {inFocus ? (
        <>
          <ul className="bs-drill__list">
            {options.map((opt) => (
              <li key={opt.id}>
                <span className="bs-drill__status">{STATUS_LABEL[opt.status] ?? opt.status}</span>
                <strong>{opt.label}</strong>
                <p>
                  <BsBody>{opt.plain}</BsBody>
                </p>
                {opt.id === 'CUSTOMER_ACCOUNTS' && opt.status === 'OPTIONAL' ? (
                  <button type="button" className="bs-drill__btn bs-drill__btn--ghost" onClick={() => onToggleAccounts(true)}>
                    ADD ACCOUNTS
                  </button>
                ) : null}
                {opt.id === 'CUSTOMER_ACCOUNTS' && opt.status === 'SELECTED' ? (
                  <button type="button" className="bs-drill__btn bs-drill__btn--ghost" onClick={() => onToggleAccounts(false)}>
                    REMOVE ACCOUNTS
                  </button>
                ) : null}
                {opt.blockedReason ? (
                  <p className="bs-drill__hint">
                    <BsBody>{opt.blockedReason}</BsBody>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="bs-drill__estimate">
            <BsBody>{delta.text}</BsBody>
            {delta.kind === 'RANGE_UPDATES' ? (
              <span>
                {' '}
                {delta.before} → {delta.after}
              </span>
            ) : null}
          </p>
          <button type="button" className="bs-drill__btn" onClick={onBack}>
            RETURN TO STRUCTURE
          </button>
        </>
      ) : null}
    </aside>
  );
}

export function FeelBoldDrilldownPanel({ ui, state, onEnter, onBack, onFeelOption }: FeelProps) {
  const inFocus = ui.phase === 'FOCUSED' || ui.phase === 'EDITING' || ui.phase === 'CONFIRMING';
  const type = state.feelType ?? ui.feelType;
  const color = state.feelColor ?? ui.feelColor;
  const options = boldFeelSubOptions(type, color);

  if (state.feelVibe !== 'BOLD' && ui.phase === 'IDLE') return null;

  return (
    <aside className="bs-drill" aria-label="BOLD EDITORIAL EXPLORATION">
      <p className="bs-drill__title">BOLD · CREATIVE SPACE</p>
      {ui.phase === 'IDLE' || ui.phase === 'TARGET_SELECTED' ? (
        <>
          <p className="bs-drill__plain">
            <BsBody>ENTER TO REFINE TYPE AND COLOUR WITHIN THIS DIRECTION — NOT THE SITE 00 BUILDER SKIN.</BsBody>
          </p>
          <button type="button" className="bs-drill__btn" onClick={onEnter} disabled={state.feelVibe !== 'BOLD'}>
            ENTER DIRECTION
          </button>
        </>
      ) : null}
      {inFocus ? (
        <>
          <ul className="bs-drill__list">
            {options.map((opt) => (
              <li key={opt.id}>
                <span className="bs-drill__status">{STATUS_LABEL[opt.status] ?? opt.status}</span>
                <strong>{opt.label}</strong>
                <p>
                  <BsBody>{opt.plain}</BsBody>
                </p>
                {opt.status === 'OPTIONAL' ? (
                  <button type="button" className="bs-drill__btn bs-drill__btn--ghost" onClick={() => onFeelOption(opt.id)}>
                    SELECT
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <button type="button" className="bs-drill__btn" onClick={onBack}>
            RETURN TO FEEL STRUCTURE
          </button>
        </>
      ) : null}
    </aside>
  );
}
