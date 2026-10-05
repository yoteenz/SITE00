/**
 * SITE 00 typed state architecture — domain boundaries.
 */

import type { Site00PreviewDeviceMode } from './preview-mode';

export type HomeMode = 'origin' | 'idnty-expanded' | 'bldr-expanded' | 'evolve-expanded';

export type AuthMode = 'anonymous' | 'authenticated' | 'admin';

export type Site00State = {
  homeMode: HomeMode;
  selectedIdentityStateId: string | null;
  selectedBuildClassId: string | null;
  selectedEvolvePathId: string | null;
  authMode: AuthMode;
  /** Future: linked project */
  activeProjectId: string | null;
  /** Composer preview — mobile vs desktop presentation (persists across public routes). */
  previewDeviceMode: Site00PreviewDeviceMode;
};

export const INITIAL_SITE00_STATE: Site00State = {
  homeMode: 'origin',
  selectedIdentityStateId: null,
  selectedBuildClassId: null,
  selectedEvolvePathId: null,
  authMode: 'anonymous',
  activeProjectId: null,
  previewDeviceMode: 'desktop',
};

export type Site00Action =
  | { type: 'SET_HOME_MODE'; mode: HomeMode }
  | { type: 'SELECT_IDENTITY_STATE'; stateId: string }
  | { type: 'SELECT_BUILD_CLASS'; classId: string }
  | { type: 'SELECT_EVOLVE_PATH'; pathId: string }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SET_AUTH_MODE'; mode: AuthMode }
  | { type: 'SET_PREVIEW_DEVICE_MODE'; mode: Site00PreviewDeviceMode };

export function site00Reducer(state: Site00State, action: Site00Action): Site00State {
  switch (action.type) {
    case 'SET_HOME_MODE':
      return { ...state, homeMode: action.mode };
    case 'SELECT_IDENTITY_STATE':
      return { ...state, selectedIdentityStateId: action.stateId };
    case 'SELECT_BUILD_CLASS':
      return { ...state, selectedBuildClassId: action.classId };
    case 'SELECT_EVOLVE_PATH':
      return { ...state, selectedEvolvePathId: action.pathId };
    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        selectedIdentityStateId: null,
        selectedBuildClassId: null,
        selectedEvolvePathId: null,
      };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.mode };
    case 'SET_PREVIEW_DEVICE_MODE':
      return { ...state, previewDeviceMode: action.mode };
    default:
      return state;
  }
}
