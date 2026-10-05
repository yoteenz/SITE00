/**
 * P0.VR.3E — Screenshot stability policy.
 */

export type ScreenshotStabilityInput = {
  finalUrl: string;
  requestedRoute: string;
  hasRuntimeError: boolean;
  fontsReady: boolean;
  layoutStable: boolean;
  loadingResolved: boolean;
  animationSettled: boolean;
};

export type ScreenshotStabilityResult = {
  stable: boolean;
  timedOut: boolean;
  checks: Record<string, boolean>;
};

export const SCREENSHOT_STABILITY_TIMEOUT_MS = 15_000 as const;

export function evaluateScreenshotStability(input: ScreenshotStabilityInput): ScreenshotStabilityResult {
  const checks = {
    routeMatch: input.finalUrl.includes(input.requestedRoute.split('?')[0] ?? input.requestedRoute),
    noRuntimeError: !input.hasRuntimeError,
    fontsReady: input.fontsReady,
    layoutStable: input.layoutStable,
    loadingResolved: input.loadingResolved,
    animationSettled: input.animationSettled,
  };
  const stable = Object.values(checks).every(Boolean);
  return { stable, timedOut: false, checks };
}

export function resolveAuthContextForRoute(route: string): import('./types.js').ScreenshotAuthContext {
  if (route.startsWith('/control') || route.startsWith('/admin')) return 'ADMIN';
  if (route.startsWith('/projects/') || route.startsWith('/studio/')) return 'PROJECT_SPECIFIC_ROLE';
  if (route.startsWith('/origin/sign') || route.startsWith('/account')) return 'CUSTOMER';
  return 'PUBLIC';
}
