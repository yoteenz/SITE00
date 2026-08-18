/** Loader composition helpers — debug / diagnostic query flags. */

function loaderSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function isLoaderDebugEnabled(): boolean {
  return loaderSearchParams().get('loaderDebug') === '1';
}

export function isLoaderRefMapEnabled(): boolean {
  const params = loaderSearchParams();
  return params.get('loaderRefMap') === '1' || params.get('loaderDebug') === '1';
}

/** Dev-only — overlay approved reference artwork at ~50% opacity on the stage. */
export function isLoaderRefOverlayEnabled(): boolean {
  const params = loaderSearchParams();
  return params.get('loaderRefOverlay') === '1' || params.get('loaderDebug') === '1';
}

/** ?loaderAnimation=0 — disable animation layer; background + UI must remain perfect. */
export function isLoaderAnimationEnabled(): boolean {
  return loaderSearchParams().get('loaderAnimation') !== '0';
}

/** ?loaderMediaDebug=1 — outline animation wrapper + media element dimensions. */
export function isLoaderMediaDebugEnabled(): boolean {
  const params = loaderSearchParams();
  return params.get('loaderMediaDebug') === '1' || params.get('loaderDebug') === '1';
}
