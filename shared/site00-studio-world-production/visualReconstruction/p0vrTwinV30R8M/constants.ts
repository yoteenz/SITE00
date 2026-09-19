export const P0_VR_TWIN_V30R8M_LINEAGE = 'P0.VR.TWINV3.0R8M' as const;
export const MOBILE_TWIN_IMPLEMENTATION_APPROVAL_VERSION = 'r8m-v1' as const;
export const MOBILE_TWIN_TWIN_PREVIEW_ROUTE_TEMPLATE = '/projects/:projectSlug/design/twin' as const;
export const CURRENT_DESIGN_ROUTE_MUTATION_FORBIDDEN = 'CURRENT_DESIGN_ROUTE_MUTATION_FORBIDDEN' as const;
export const MOBILE_TWIN_APPROVAL_PERSIST_FAILED = 'MOBILE_TWIN_APPROVAL_PERSIST_FAILED' as const;

export function mobileTwinTwinPreviewRoute(projectId: string): string {
  return `/projects/${projectId.toLowerCase()}/design/twin`;
}
