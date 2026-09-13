import type { DesignPageAuthorityClassification } from './types.js';

export function classifyDesignPageAuthority(input: {
  mobileUrl: string;
  desktopUrl: string;
  falKeyConfigured: boolean;
}): DesignPageAuthorityClassification {
  if (!input.mobileUrl || !input.desktopUrl) return 'DESIGN_PAGE_AUTHORITY_FAILED';
  if (process.env.VITEST === 'true' || !input.falKeyConfigured) {
    return 'DESIGN_PAGE_AUTHORITY_PARTIAL';
  }
  return 'DESIGN_PAGE_AUTHORITY_PROVEN';
}
