import type { DfReviewEntry } from './digitalFoundationReviewRegistry';

export type DfReviewPreviewStatus =
  | 'RENDERED'
  | 'SIMULATED'
  | 'AUTHENTICATED'
  | 'BLOCKED'
  | 'NOT_IMPLEMENTED'
  | 'BROKEN';

export function previewStatusForEntry(entry: DfReviewEntry): DfReviewPreviewStatus {
  if (entry.implementationStatus === 'not_implemented') return 'NOT_IMPLEMENTED';
  if (entry.implementationStatus === 'legacy_redirect') return 'BLOCKED';
  if (entry.implementationStatus === 'backend_blocked') return 'BLOCKED';
  if (entry.renderMode === 'external_route') {
    if (entry.reviewAdapter === 'live_route' && entry.authRequirement === 'founder_session') return 'AUTHENTICATED';
    return 'AUTHENTICATED';
  }
  if (entry.reviewAdapter === 'inline_fixture' || entry.renderMode === 'inline_founder_shell') {
    return entry.fixtureContract || entry.authRequirement === 'client_token' ? 'SIMULATED' : 'RENDERED';
  }
  if (entry.renderMode === 'inline_df_screen') return entry.fixtureContract ? 'SIMULATED' : 'RENDERED';
  return 'RENDERED';
}

export function previewStatusLabel(status: DfReviewPreviewStatus): string {
  return status;
}
