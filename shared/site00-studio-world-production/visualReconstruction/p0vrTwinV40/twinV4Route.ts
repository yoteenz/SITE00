import { TWIN_V4_ROUTE_SEGMENT } from './constants.js';

export function twinV4ProofRoute(projectId: string): string {
  return `/projects/${projectId.toLowerCase()}/design/${TWIN_V4_ROUTE_SEGMENT}`;
}
