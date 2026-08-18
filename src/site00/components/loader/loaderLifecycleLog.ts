/** Development lifecycle logging for SITE 00 immersive loader diagnosis. */
export function loaderLifecycleLog(event: string, detail?: unknown): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const enabled = import.meta.env.DEV || params.get('loaderDebug') === '1';
  if (!enabled) return;
  if (detail !== undefined) {
    console.info(`[SITE00_LOADER] ${event}`, detail);
  } else {
    console.info(`[SITE00_LOADER] ${event}`);
  }
}
