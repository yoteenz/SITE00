/**
 * Data-readiness / view states (W0.5). Distinct from domain business states (e.g. bill paid).
 */

export type ViewReadiness =
  | 'IDLE'
  | 'LOADING'
  | 'READY'
  | 'EMPTY'
  | 'ERROR'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'UNAUTHORIZED'
  | 'OFFLINE'
  | 'SYNCING'
  | 'SUCCESS'
  | 'NEEDS_SETUP'
  | 'NEEDS_CONNECTION'
  | 'NEEDS_ATTENTION'
  | 'READ_ONLY';

export type RepositoryReadStatus = 'idle' | 'loading' | 'ready' | 'error' | 'offline';

export function viewReadinessFromRepository(status: RepositoryReadStatus, empty: boolean): ViewReadiness {
  if (status === 'loading') return 'LOADING';
  if (status === 'offline') return 'OFFLINE';
  if (status === 'error') return 'ERROR';
  if (empty) return 'EMPTY';
  return 'READY';
}
