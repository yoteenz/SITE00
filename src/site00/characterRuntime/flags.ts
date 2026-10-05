/** Live character runtime is opt-in — default remains STATIC_AUTHORITY only. */

export function liveCharacterRuntimeRequested(): boolean {
  if (typeof window === 'undefined') return false;
  const env = (import.meta as { env?: Record<string, string> }).env?.VITE_SITE00_LIVE_CHARACTER_RUNTIME;
  if (env === '1' || env === 'true') return true;
  return new URLSearchParams(window.location.search).get('liveRuntime') === '1';
}

export function mockCharacterRuntimeRequested(): boolean {
  if (typeof window === 'undefined') return false;
  const env = (import.meta as { env?: Record<string, string> }).env?.VITE_SITE00_CHARACTER_RUNTIME_MOCK;
  if (env === '1' || env === 'true') return true;
  return new URLSearchParams(window.location.search).get('runtimeMock') === '1';
}
