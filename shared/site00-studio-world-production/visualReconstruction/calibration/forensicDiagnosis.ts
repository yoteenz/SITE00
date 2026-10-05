/**
 * Forensic diagnosis of current implementation vs founder reference intent.
 */

import type { ForensicRouteDiagnosis } from '../types.js';

export type ForensicDiagnosisInput = {
  routeId: string;
  moduleLabel: string;
  cssSnapshot: Record<string, string>;
  designGrammarFailures: string[];
  pixelScore: number;
  designGrammarScore: number;
};

const REFERENCE_INTENT: Record<string, string> = {
  'experiments-hub': 'Light editorial methodology journey — scan stages, enter experiments, cream field, lime active focus',
  'campaign-board': 'Artwork-first production wall — Pages/Margins/Motion dominate, not dashboard cards',
  'content-operations': 'Editorial desk — TODAY AT NDX pulse, artwork strip, radar leads, weekly range',
};

export function diagnoseCurrentImplementation(input: ForensicDiagnosisInput): ForensicRouteDiagnosis {
  const luminance = parseFloat(input.cssSnapshot.luminance ?? '0.5');
  const isDark = luminance < 0.55 || input.designGrammarFailures.includes('FAIL_DARK_PRIMARY_WORKSPACE');

  let currentBehavior = 'Founder workspace shell with operate layer';
  let disconnect = 'Partial alignment with approved light editorial references';
  let rootCause: ForensicRouteDiagnosis['rootCause'] = 'UNKNOWN';
  let correctionType = 'DESIGN_GRAMMAR_CORRECTION';

  if (isDark) {
    currentBehavior = 'Dark-primary workspace shell (#0f0f0f / charcoal surfaces)';
    disconnect = 'Approved references are cream/paper-led; implementation reads generic dark dashboard';
    rootCause = 'PALETTE_DRIFT';
    correctionType = 'BRAND_FIDELITY_CORRECTION';
  } else if (input.designGrammarFailures.includes('FAIL_UNIFORM_CARD_SYSTEM')) {
    currentBehavior = 'Repeated identical card containers across modules';
    disconnect = 'Reference uses varied surfaces and editorial grouping, not uniform SaaS cards';
    rootCause = 'GENERIC_CARD_PRIMITIVE';
    correctionType = 'DESIGN_GRAMMAR_CORRECTION';
  } else if (input.designGrammarFailures.includes('FAIL_ARTWORK_AUTHORITY') || input.designGrammarFailures.includes('FAIL_ARTWORK_SHRUNK_BY_UI')) {
    currentBehavior = 'Artwork present but UI chrome dominates visual weight';
    disconnect = 'Campaign/content artwork should dominate focal hierarchy';
    rootCause = 'SHELL_DOMINANCE';
    correctionType = 'DESIGN_GRAMMAR_CORRECTION';
  } else if (input.designGrammarScore < 0.6) {
    rootCause = 'LAYOUT_ALGORITHM';
  }

  if (input.routeId === 'experiments-hub' && input.designGrammarFailures.includes('FAIL_NDX_LIME_ABSENT')) {
    disconnect = 'Signature lime absent from active journey focus';
    rootCause = 'TOKEN_CONSTRAINT';
    correctionType = 'BRAND_FIDELITY_CORRECTION';
  }

  return {
    routeId: input.routeId,
    referenceIntent: REFERENCE_INTENT[input.routeId] ?? 'NDXBOOK light editorial workspace',
    currentBehavior,
    disconnect,
    rootCause,
    correctionType,
  };
}

export function diagnoseP0VR1ExperimentsHubRegression(): ForensicRouteDiagnosis {
  return {
    routeId: 'experiments-hub',
    referenceIntent: REFERENCE_INTENT['experiments-hub']!,
    currentBehavior: 'P0.VR.1 used dark structural band fixture and dark operate layer CSS',
    disconnect: 'Generic dark dashboard feeling; weak NDXBOOK cream/lime essence',
    rootCause: 'PALETTE_DRIFT',
    correctionType: 'BRAND_FIDELITY_CORRECTION',
  };
}
