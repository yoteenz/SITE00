/**
 * Build Object flicker forensics — URL-driven isolation modes for QA recordings.
 *
 * Query: `?bsFlickerForensic=<mode>` (alias `bsForensic`)
 *
 * - `static` — all animated lighting off; render only when the scene changes
 * - `opaqueGlass` — static + replace glass with opaque materials (transparency test)
 * - `animateLighting` — re-enable traveling accent / envMap / emissive pulse (regression compare)
 * - `cssFadeOff` — disable canvas opacity crossfade (CSS overlay test)
 */
export type BuildObjectForensicMode = 'production' | 'static' | 'opaqueGlass' | 'animateLighting' | 'cssFadeOff';

export type BuildObjectForensics = {
  mode: BuildObjectForensicMode;
  /** Freeze lighting uniforms; no accent travel; no idle render loop. */
  staticLighting: boolean;
  /** Replace glass family with opaque neutrals. */
  opaqueGlass: boolean;
  /** Allow applyArchitecturalLighting animation block (Phase 6 reintroduction). */
  animateLighting: boolean;
  /** Skip CSS opacity fade on WebGL canvas when env map loads. */
  disableCssCanvasFade: boolean;
};

const PARAM_KEYS = ['bsFlickerForensic', 'bsForensic'] as const;

export function readBuildObjectForensics(search = typeof window !== 'undefined' ? window.location.search : ''): BuildObjectForensics {
  const params = new URLSearchParams(search);
  let raw = '';
  for (const key of PARAM_KEYS) {
    const v = params.get(key);
    if (v) {
      raw = v.trim().toLowerCase();
      break;
    }
  }
  const mode: BuildObjectForensicMode =
    raw === 'static'
      ? 'static'
      : raw === 'opaqueglass' || raw === 'opaque_glass'
        ? 'opaqueGlass'
        : raw === 'animatelighting' || raw === 'animate' || raw === 'lighting'
          ? 'animateLighting'
          : raw === 'cssfadeoff' || raw === 'no_css_fade'
            ? 'cssFadeOff'
            : 'production';

  const animateLighting = mode === 'animateLighting';
  const staticLighting = !animateLighting;
  const opaqueGlass = mode === 'opaqueGlass';
  const disableCssCanvasFade = mode === 'cssFadeOff' || mode === 'static' || mode === 'opaqueGlass' || mode === 'production';

  return { mode, staticLighting, opaqueGlass, animateLighting, disableCssCanvasFade };
}
