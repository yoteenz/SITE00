/**
 * P0.VR.NDXBOOK-WEB-EXPRESSION-ART-DIRECTION-AMPLIFICATION1
 * Controlled NDXBOOK tonal family — multiple values within identity, no rainbow drift.
 */

export type NDXColorExpressionContract = {
  contractId: 'ndx-color-expression-v1';
  blackRange: readonly string[];
  paperRange: readonly string[];
  signalRange: readonly string[];
  functionalGrays: readonly string[];
  rules: readonly string[];
};

export const NDX_COLOR_EXPRESSION_CONTRACT: NDXColorExpressionContract = {
  contractId: 'ndx-color-expression-v1',
  blackRange: ['#000000', 'near-black', 'charcoal', 'graphite'],
  paperRange: ['pure white', 'cool paper', 'warm archival white', 'soft gray-white'],
  signalRange: ['core NDX lime', 'acid lime', 'yellow-lime', 'chartreuse signal', 'muted archival lime'],
  functionalGrays: ['neutral gray rails', 'toner gray', 'concrete gray', 'photocopy gray'],
  rules: [
    'Palette alone cannot define a territory — grayscale concepts must remain distinct.',
    'Multiple tonal values may coexist on one page within black/paper/signal/gray families.',
    'Signal colors stay inside lime/chartreuse family — not unrelated saturated hues.',
    'Paper and black ranges may shift contextually for depth and hierarchy.',
  ],
};

const UNRELATED_HUE_PATTERN =
  /\b(coral|magenta|fuchsia|purple|violet|indigo|navy blue|royal blue|sky blue|teal|cyan|orange|red accent|pink|rainbow|gradient brand)\b/i;

export function validateNdxColorExpressionText(text: string): {
  ok: boolean;
  errorCode: 'NDX_PALETTE_DRIFT' | null;
  detail: string | null;
} {
  const t = text.trim();
  if (!t) return { ok: true, errorCode: null, detail: null };
  if (UNRELATED_HUE_PATTERN.test(t)) {
    return { ok: false, errorCode: 'NDX_PALETTE_DRIFT', detail: 'unrelated saturated hue' };
  }
  return { ok: true, errorCode: null, detail: null };
}

export function validateNdxColorExpressionForTerritories(colorTexts: readonly string[]): {
  ok: boolean;
  errorCode: 'NDX_PALETTE_DRIFT' | null;
} {
  for (const text of colorTexts) {
    const check = validateNdxColorExpressionText(text);
    if (!check.ok) return { ok: false, errorCode: check.errorCode };
  }
  return { ok: true, errorCode: null };
}

export function compileNdxColorExpressionHandoffSentence(territoryColorExpression: string): string {
  const base = territoryColorExpression.trim();
  return `${base} Stay inside NDX black/paper/lime-gray families — tonal variation allowed, unrelated hues forbidden.`;
}
