/**
 * SITE 00 typed state architecture — domain boundaries.
 */

import type { Site00PresentationOverride } from './preview-mode';

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
  /** Composer preview — auto | mobile | desktop presentation override */
  presentationOverride: Site00PresentationOverride;
};

export const INITIAL_SITE00_STATE: Site00State = {
  homeMode: 'origin',
  selectedIdentityStateId: null,
  selectedBuildClassId: null,
  selectedEvolvePathId: null,
  authMode: 'anonymous',
  activeProjectId: null,
  presentationOverride: 'auto',
};

export type Site00Action =
  | { type: 'SET_HOME_MODE'; mode: HomeMode }
  | { type: 'SELECT_IDENTITY_STATE'; stateId: string }
  | { type: 'SELECT_BUILD_CLASS'; classId: string }
  | { type: 'SELECT_EVOLVE_PATH'; pathId: string }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SET_AUTH_MODE'; mode: AuthMode }
  | { type: 'SET_PRESENTATION_OVERRIDE'; mode: Site00PresentationOverride };

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
    case 'SET_PRESENTATION_OVERRIDE':
      return { ...state, presentationOverride: action.mode };
    default:
      return state;
  }
}
