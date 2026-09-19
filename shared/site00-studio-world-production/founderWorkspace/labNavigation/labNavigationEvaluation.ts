/**
 * P0.NAV.1 — Lab navigation failure taxonomy + evaluation.
 */

export type LabNavigationFailureCode =
  | 'FAIL_LAB_NAV_ORPHANS_CHARACTER_LAB'
  | 'FAIL_LAB_ROOT_POINTS_DIRECTLY_TO_EXPERIMENT'
  | 'FAIL_CHARACTER_LAB_UNREACHABLE_FROM_PRIMARY_NAV'
  | 'FAIL_LAB_ROUTE_GROUP_ACTIVE_STATE'
  | 'FAIL_EXPERIMENT_BACK_PATH_MISSING'
  | 'FAIL_CHARACTER_BACK_PATH_MISSING'
  | 'FAIL_DUPLICATE_CHARACTER_LAB_ROUTE'
  | 'FAIL_LAB_HUB_GENERIC_ADMIN_DESIGN';

export type LabNavigationEvaluationInput = {
  bottomNavLabHref: string;
  labHubRoute: string;
  experimentsHubRoute: string;
  characterLabRoute: string;
  characterLabRouteCount: number;
  labHubHasExperimentsEntry: boolean;
  labHubHasCharacterEntry: boolean;
  experimentsBackPathToLab: boolean;
  characterBackPathToLab: boolean;
  labActiveOnLabHub: boolean;
  labActiveOnExperimentRoute: boolean;
  labActiveOnCharacterRoute: boolean;
  labActiveOnCastingRoute: boolean;
  labActiveOnContinuityRoute: boolean;
  usesNdxWorkspaceShell: boolean;
};

export type LabNavigationEvaluationResult = {
  pass: boolean;
  failures: LabNavigationFailureCode[];
};

export function evaluateLabNavigation(input: LabNavigationEvaluationInput): LabNavigationEvaluationResult {
  const failures: LabNavigationFailureCode[] = [];

  if (input.bottomNavLabHref !== input.labHubRoute) {
    if (input.bottomNavLabHref.includes('experiment-01') || input.bottomNavLabHref.includes('/experiments')) {
      failures.push('FAIL_LAB_ROOT_POINTS_DIRECTLY_TO_EXPERIMENT');
    }
  }

  if (!input.labHubHasCharacterEntry) {
    failures.push('FAIL_LAB_NAV_ORPHANS_CHARACTER_LAB');
  }

  if (!input.labHubHasExperimentsEntry) {
    failures.push('FAIL_LAB_ROOT_POINTS_DIRECTLY_TO_EXPERIMENT');
  }

  if (input.bottomNavLabHref === input.labHubRoute && !input.labHubHasCharacterEntry) {
    failures.push('FAIL_CHARACTER_LAB_UNREACHABLE_FROM_PRIMARY_NAV');
  }

  if (input.bottomNavLabHref !== input.labHubRoute && input.bottomNavLabHref === input.characterLabRoute) {
    failures.push('FAIL_LAB_NAV_ORPHANS_CHARACTER_LAB');
  }

  if (
    !input.labActiveOnLabHub ||
    !input.labActiveOnExperimentRoute ||
    !input.labActiveOnCharacterRoute ||
    !input.labActiveOnCastingRoute ||
    !input.labActiveOnContinuityRoute
  ) {
    failures.push('FAIL_LAB_ROUTE_GROUP_ACTIVE_STATE');
  }

  if (!input.experimentsBackPathToLab) {
    failures.push('FAIL_EXPERIMENT_BACK_PATH_MISSING');
  }

  if (!input.characterBackPathToLab) {
    failures.push('FAIL_CHARACTER_BACK_PATH_MISSING');
  }

  if (input.characterLabRouteCount > 1) {
    failures.push('FAIL_DUPLICATE_CHARACTER_LAB_ROUTE');
  }

  if (!input.usesNdxWorkspaceShell) {
    failures.push('FAIL_LAB_HUB_GENERIC_ADMIN_DESIGN');
  }

  return { pass: failures.length === 0, failures };
}
