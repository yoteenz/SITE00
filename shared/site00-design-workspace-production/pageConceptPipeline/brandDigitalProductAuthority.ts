/**
 * Standalone brand digital product authority (website/app) — separate from SITE 00 Projects expression.
 */

import type { Site00AuthorityScope } from './site00AuthorityScope.js';

export type BrandDigitalProductKind = 'WEBSITE' | 'APP';

export type BrandDigitalProductAuthorityRecord = {
  authorityId: string;
  brandProjectId: string;
  productKind: BrandDigitalProductKind;
  version: number;
  status: 'PROMOTED' | 'SUPERSEDED';
  sourcePageId: string | null;
  sourceConceptId: string | null;
  authorityScope: Extract<Site00AuthorityScope, 'BRAND_STANDALONE_PRODUCT'>;
  promotedAt: string;
};

export type BrandDigitalProductAuthorityContract = {
  authorityId: string;
  brandProjectId: string;
  productKind: BrandDigitalProductKind;
  version: number;
  typographySystem: string;
  colorSystem: string;
  graphicLanguage: string;
  navigationModel: string;
  shellExpression: string;
  grammarOnlyNotice: string;
};

export function compileBrandDigitalProductAuthorityStub(brandProjectId: string): string {
  return [
    `BRAND STANDALONE DIGITAL AUTHORITY (${brandProjectId.toUpperCase()}):`,
    'Built from brand familiarity, identity, founder creative preference, product function, and territories.',
    'Does NOT auto-inherit SITE 00 Projects Overview expression — optional cross-context reference only.',
  ].join('\n');
}
