/** Ephemeral interaction states — not persisted; mapped onto existing spatial session separately. */
export type DrilldownPhase =
  | 'IDLE'
  | 'TARGET_SELECTED'
  | 'ENTERING'
  | 'FOCUSED'
  | 'EDITING'
  | 'CONFIRMING'
  | 'RETURNING'
  | 'ERROR_RECOVERY';

export type WorkDrillTarget = 'SHOP';

export type FeelDrillTarget = 'BOLD';

export type DrilldownTarget =
  | { room: 'work'; id: WorkDrillTarget }
  | { room: 'feel'; id: FeelDrillTarget };

export type WorkSubOptionId = 'CATALOG_CHECKOUT' | 'PAYMENTS' | 'CUSTOMER_ACCOUNTS';

export type FeelSubOptionId = 'TYPE_CONDENSED' | 'TYPE_EXPRESSIVE' | 'COLOR_SATURATED' | 'COLOR_HIGH_CONTRAST';

export type InclusionStatus = 'INCLUDED' | 'OPTIONAL' | 'SELECTED' | 'ADDITIONAL_COST' | 'REQUIRES_QUOTE' | 'UNAVAILABLE';

export type DrilldownUiState = {
  phase: DrilldownPhase;
  target: DrilldownTarget | null;
  /** WORK: optional capability toggles explored inside SHOP (ACCOUNTS only for prototype). */
  workAccountsExplored: boolean;
  /** FEEL: explicit dimension picks while inside BOLD (maps to BuilderSelection tunables). */
  feelType: 'SYSTEM_DEFAULT' | 'CONDENSED_DISPLAY' | 'EXPRESSIVE_DISPLAY';
  feelColor: 'SYSTEM_DEFAULT' | 'SATURATED_EDITORIAL' | 'HIGH_CONTRAST_MONO';
};

export function emptyDrilldownUi(): DrilldownUiState {
  return {
    phase: 'IDLE',
    target: null,
    workAccountsExplored: false,
    feelType: 'SYSTEM_DEFAULT',
    feelColor: 'SYSTEM_DEFAULT',
  };
}
