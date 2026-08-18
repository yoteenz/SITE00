/** Geometry compositing strategy — screen (original OpenArt) vs true-alpha derivative. */

export type LoaderGeometryMode = 'screen' | 'alpha';

let cachedProductionAlphaAvailable: boolean | null = null;

const ALPHA_PROBE_TIMEOUT_MS = 4000;

/** Check same-origin locked alpha derivative (synced on production slot lock). */
export async function probeProductionAlphaAvailable(): Promise<boolean> {
  if (cachedProductionAlphaAvailable != null) return cachedProductionAlphaAvailable;
  if (typeof window === 'undefined') return false;

  try {
    const res = await Promise.race([
      fetch('/site00/loader/v1/assts-loader-geometry-v1-alpha.webm', { method: 'HEAD' }),
      new Promise<Response>((_, reject) => {
        window.setTimeout(() => reject(new Error('alpha probe timeout')), ALPHA_PROBE_TIMEOUT_MS);
      }),
    ]);
    cachedProductionAlphaAvailable = res.ok;
    return res.ok;
  } catch {
    cachedProductionAlphaAvailable = false;
    return false;
  }
}

export function resolveLoaderGeometryModeFromQuery(): LoaderGeometryMode | null {
  if (typeof window === 'undefined') return null;
  const forced = new URLSearchParams(window.location.search).get('loaderGeometry');
  if (forced === 'alpha' || forced === 'screen') return forced;
  return null;
}

export function resolveLoaderGeometryMode(_hasProductionAlpha = false): LoaderGeometryMode {
  const forced = resolveLoaderGeometryModeFromQuery();
  if (forced) return forced;
  return 'screen';
}
