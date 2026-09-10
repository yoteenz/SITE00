/**
 * P0.VR.8R3R2 — Page route identity (display route ≠ capture URL).
 */

export type PageRouteIdentity = {
  projectId: string;
  pageId: string;
  displayRoute: string;
  routePattern: string | null;
  resolvedRuntimePath: string | null;
  captureUrl: string | null;
  sourceComponent: string | null;
  routeParams: string[];
  routeValid: boolean;
  resolutionSource: string | null;
  resolutionConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  resolutionEvidence: string | null;
};

export type RouteResolutionReceipt = {
  pageId: string;
  displayRoute: string;
  resolvedRuntimePath: string | null;
  captureUrl: string | null;
  resolutionSource: string | null;
  valid: boolean;
  error: 'RUNTIME_URL_UNRESOLVED' | null;
};
