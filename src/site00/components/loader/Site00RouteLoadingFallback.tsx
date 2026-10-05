import { ReferenceShellSuspenseFallback } from './ReferenceShellSuspenseFallback';

/**
 * SITE 00 route suspense — reference shell for NDX routes only.
 * Never portal the full-screen immersive loader here: it has no exit lifecycle and leaves
 * the marble pedestal stage stuck over the app (Safari mobile).
 */
export function Site00RouteLoadingFallback() {
  return <ReferenceShellSuspenseFallback />;
}
