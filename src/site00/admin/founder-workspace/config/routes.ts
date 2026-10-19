/** IDNTY Founder Workspace — canonical admin routes (FD-R20). */
export const IDNTY_FOUNDER_WORKSPACE_ROUTES = {
  root: '/admin/site00/founder-workspace',
  overview: '/admin/site00/founder-workspace/overview',
  foundations: '/admin/site00/founder-workspace/foundations',
  reviews: '/admin/site00/founder-workspace/reviews',
  operations: '/admin/site00/founder-workspace/operations',
  correspondence: '/admin/site00/founder-workspace/correspondence',
  referrals: '/admin/site00/founder-workspace/referrals',
  system: '/admin/site00/founder-workspace/system',
  client: (artifactId: string) => `/admin/site00/founder-workspace/foundations/${artifactId}`,
} as const;

export type FounderWorkspaceDestinationId =
  | 'overview'
  | 'foundations'
  | 'reviews'
  | 'operations'
  | 'correspondence'
  | 'referrals'
  | 'system';
