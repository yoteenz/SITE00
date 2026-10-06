/**
 * JURNL MOBILE COMPOSITION MODES (P0.JURNL.MOBILE-COMPOSITION.CENTER-STAGE-NAV-ALIGNED-REFINEMENT3).
 *
 * EDGE_LED     — entry / welcome / onboarding / no-nav editorial screens. Left-anchored copy and asymmetry are
 *                allowed; the photograph may own a side of the screen.
 * CENTER_STAGE — every screen that carries the 5-item product nav. The functional field is centred on the `+` axis
 *                and shares the nav footprint (`--jrn-stage-w`); the background frames that field from the perimeter.
 *
 * Default: a screen that renders the product nav is CENTER_STAGE. Leaving CENTER_STAGE on a nav-bearing screen needs a
 * route-authority override WITH a documented reason — no accidental exceptions.
 */

export type JurnlCompositionMode = 'EDGE_LED' | 'CENTER_STAGE';

export type CompositionOverride = { mode: JurnlCompositionMode; reason: string };

/** Route-authority overrides, keyed by screen id. Empty: no nav-bearing screen is exempt. */
export const COMPOSITION_OVERRIDES: Readonly<Record<string, CompositionOverride>> = Object.freeze({});

export function resolveCompositionMode({ screenId, hasProductNav, override }: { screenId: string; hasProductNav: boolean; override?: JurnlCompositionMode }): JurnlCompositionMode {
  return override ?? COMPOSITION_OVERRIDES[screenId]?.mode ?? (hasProductNav ? 'CENTER_STAGE' : 'EDGE_LED');
}
