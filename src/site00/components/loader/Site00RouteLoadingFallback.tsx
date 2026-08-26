import { Site00ImmersiveColdStartFallback } from './Site00ImmersiveColdStartFallback';
import { ReferenceShellSuspenseFallback } from './ReferenceShellSuspenseFallback';

/** SITE 00 route suspense — reference shell for NDX reconstructed routes; immersive loader elsewhere. */
export function Site00RouteLoadingFallback() {
  return (
    <>
      <ReferenceShellSuspenseFallback />
      <Site00ImmersiveColdStartFallback />
    </>
  );
}
