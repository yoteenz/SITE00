import { GROK_TWIN_TEST_A_ROUTE_PATH } from './constants.js';

export function grokTwinTestARoute(projectSlug = 'ndxbook'): string {
  return GROK_TWIN_TEST_A_ROUTE_PATH.replace(':projectSlug', projectSlug.toLowerCase());
}

export function isGrokTwinTestAPath(pathname: string): boolean {
  return /\/projects\/[^/]+\/design\/twin-testA\/?$/.test(pathname);
}
