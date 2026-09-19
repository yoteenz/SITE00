/**
 * Typography firewall — Martian Mono only, uppercase UI.
 */

import { TYPOGRAPHY_FIREWALL } from './constants.js';
import type { BrandFamilySkinFailureCode } from './types.js';

export type TypographyFirewallResult = {
  pass: boolean;
  requiredFontFamily: string;
  uiCaseRule: string;
  failureCode: BrandFamilySkinFailureCode | null;
};

export function validateTypographyFirewall(proposedFont?: string | null): TypographyFirewallResult {
  const breach =
    proposedFont &&
    !proposedFont.toUpperCase().includes('MARTIAN') &&
    TYPOGRAPHY_FIREWALL.prohibitedFonts.some((p) => proposedFont.toUpperCase().includes(p));

  return {
    pass: !breach,
    requiredFontFamily: TYPOGRAPHY_FIREWALL.requiredFontFamily,
    uiCaseRule: TYPOGRAPHY_FIREWALL.uiCaseRule,
    failureCode: breach ? 'BRAND_FAMILY_SKIN_TYPOGRAPHY_BREACH' : null,
  };
}

export function getTypographyFirewallSpec() {
  return { ...TYPOGRAPHY_FIREWALL };
}
