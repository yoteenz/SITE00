import type { DrilldownPhase, DrilldownTarget, DrilldownUiState } from './types';

export function selectTarget(state: DrilldownUiState, target: DrilldownTarget): DrilldownUiState {
  if (state.phase !== 'IDLE' && state.phase !== 'TARGET_SELECTED') return state;
  return { ...state, phase: 'TARGET_SELECTED', target };
}

export function enterFocus(state: DrilldownUiState): DrilldownUiState {
  if (!state.target || state.phase !== 'TARGET_SELECTED') return state;
  return { ...state, phase: 'ENTERING' };
}

export function markFocused(state: DrilldownUiState): DrilldownUiState {
  if (state.phase !== 'ENTERING') return state;
  return { ...state, phase: 'FOCUSED' };
}

export function beginEditing(state: DrilldownUiState): DrilldownUiState {
  if (state.phase !== 'FOCUSED') return state;
  return { ...state, phase: 'EDITING' };
}

export function confirmEdits(state: DrilldownUiState): DrilldownUiState {
  if (state.phase !== 'EDITING' && state.phase !== 'FOCUSED') return state;
  return { ...state, phase: 'CONFIRMING' };
}

export function returnToRoom(state: DrilldownUiState): DrilldownUiState {
  return { ...state, phase: 'RETURNING' };
}

export function finishReturn(state: DrilldownUiState): DrilldownUiState {
  return { ...emptyAfterReturn(), workAccountsExplored: state.workAccountsExplored, feelType: state.feelType, feelColor: state.feelColor };
}

function emptyAfterReturn(): DrilldownUiState {
  return { phase: 'IDLE', target: null, workAccountsExplored: false, feelType: 'SYSTEM_DEFAULT', feelColor: 'SYSTEM_DEFAULT' };
}

export function resetDrilldown(): DrilldownUiState {
  return emptyAfterReturn();
}

export function drilldownCloseness(phase: DrilldownPhase): number {
  switch (phase) {
    case 'TARGET_SELECTED':
      return 0.35;
    case 'ENTERING':
    case 'FOCUSED':
    case 'EDITING':
    case 'CONFIRMING':
      return 0.82;
    default:
      return 0;
  }
}
