/**
 * JURNL MOBILE COMPOSITION MODES (P0.JURNL.MOBILE-COMPOSITION.CENTER-STAGE-NAV-ALIGNED-REFINEMENT3).
 *
 * EDGE_LED     — entry / welcome / onboarding / no-nav editorial screens. Left-anchored copy and asymmetry are
 *                allowed; the photograph may own a side of the screen.
 * CENTER_STAGE — every screen that carries the 5-item product nav. The functional field is centred on the `+` axis
 *                and shares the nav footprint (`--jrn-stage-w`); the background frames that field from the perimeter.
 *
 * REFERENCE_STAGE — a founder reference replica (P0.JURNL.F09.REFERENCE-REPLICA1): one lifted photograph and the
 *                interface drawn in the reference's own pixels (components/ReferenceStage.tsx). The reference image is
 *                the route authority, so its composition replaces the CENTER_STAGE field.
 *
 * Default: a screen that renders the product nav is CENTER_STAGE. Leaving CENTER_STAGE on a nav-bearing screen needs a
 * route-authority override WITH a documented reason — no accidental exceptions.
 */

export type JurnlCompositionMode = 'EDGE_LED' | 'CENTER_STAGE' | 'REFERENCE_STAGE';

export type CompositionOverride = { mode: JurnlCompositionMode; reason: string };

const REFERENCE_REASON = 'Founder reference image is the route authority: one lifted photograph with the interface drawn in the reference pixels (P0.JURNL.F09.REFERENCE-REPLICA1).';

/** Route-authority overrides, keyed by screen id. Each one carries its documented reason. */
export const COMPOSITION_OVERRIDES: Readonly<Record<string, CompositionOverride>> = Object.freeze({
  'F09.00.REFERENCE': { mode: 'REFERENCE_STAGE', reason: `${REFERENCE_REASON} Reference 01 beside the founder-tuned /safe parent.` },
  'F09.WHY': { mode: 'REFERENCE_STAGE', reason: REFERENCE_REASON },
  'F09.CHECK': { mode: 'REFERENCE_STAGE', reason: REFERENCE_REASON },
  'GS.SETTINGS': { mode: 'REFERENCE_STAGE', reason: `${REFERENCE_REASON} ACCOUNT full page and drawer.` },
});

export function resolveCompositionMode({ screenId, hasProductNav, override }: { screenId: string; hasProductNav: boolean; override?: JurnlCompositionMode }): JurnlCompositionMode {
  return override ?? COMPOSITION_OVERRIDES[screenId]?.mode ?? (hasProductNav ? 'CENTER_STAGE' : 'EDGE_LED');
}
