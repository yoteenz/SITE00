/**
 * P0.VR.3G — ExperiencePage family registry.
 */

import { EXPERIENCE_PAGE_TEMPLATES } from './constants.js';
import type { ExperiencePageDefinition, ExperiencePageFamily, FamilyDerivationReceipt } from './types.js';
import { P0_VR_3G_LINEAGE } from './constants.js';

const SITE00_INFORMATION_PAGES: ExperiencePageDefinition[] = [
  { pageId: 'about', route: '/about', displayName: 'About', family: 'INFORMATION', templateId: EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.INFORMATION.inheritedRegions] },
  { pageId: 'guide', route: '/guide', displayName: 'Guide', family: 'INFORMATION', templateId: EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.INFORMATION.inheritedRegions] },
  { pageId: 'sound', route: '/sound', displayName: 'Sound', family: 'INFORMATION', templateId: EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.INFORMATION.inheritedRegions] },
  { pageId: 'faq', route: '/faq', displayName: 'FAQ', family: 'INFORMATION', templateId: EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.INFORMATION.inheritedRegions] },
  { pageId: 'contact', route: '/contact', displayName: 'Contact', family: 'INFORMATION', templateId: EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.INFORMATION.inheritedRegions] },
  { pageId: 'support', route: '/support', displayName: 'Support', family: 'INFORMATION', templateId: EXPERIENCE_PAGE_TEMPLATES.INFORMATION.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.INFORMATION.inheritedRegions] },
];

const SITE00_AUTH_PAGES: ExperiencePageDefinition[] = [
  { pageId: 'sign-in', route: '/origin/sign-in', displayName: 'Sign In', family: 'AUTH', templateId: EXPERIENCE_PAGE_TEMPLATES.AUTH.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.AUTH.inheritedRegions] },
  { pageId: 'forgot-password', route: '/origin/forgot-password', displayName: 'Forgot Password', family: 'AUTH', templateId: EXPERIENCE_PAGE_TEMPLATES.AUTH.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.AUTH.inheritedRegions] },
  { pageId: 'reset-password', route: '/origin/reset-password', displayName: 'Reset Password', family: 'AUTH', templateId: EXPERIENCE_PAGE_TEMPLATES.AUTH.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.AUTH.inheritedRegions] },
];

const SITE00_COMPLEX_PAGES: ExperiencePageDefinition[] = [
  { pageId: 'blueprints', route: '/blueprints', displayName: 'Blueprints', family: 'COMPLEX', templateId: EXPERIENCE_PAGE_TEMPLATES.COMPLEX.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.COMPLEX.inheritedRegions] },
  { pageId: 'account', route: '/account', displayName: 'Account', family: 'COMPLEX', templateId: EXPERIENCE_PAGE_TEMPLATES.COMPLEX.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.COMPLEX.inheritedRegions] },
  { pageId: 'brand', route: '/brand', displayName: 'Brand', family: 'COMPLEX', templateId: EXPERIENCE_PAGE_TEMPLATES.COMPLEX.templateId, regions: [...EXPERIENCE_PAGE_TEMPLATES.COMPLEX.inheritedRegions] },
];

const ALL_PAGES = [...SITE00_INFORMATION_PAGES, ...SITE00_AUTH_PAGES, ...SITE00_COMPLEX_PAGES];

export function listExperiencePagesByFamily(family: ExperiencePageFamily): ExperiencePageDefinition[] {
  return ALL_PAGES.filter((p) => p.family === family);
}

export function getExperiencePageDefinition(pageId: string): ExperiencePageDefinition | null {
  return ALL_PAGES.find((p) => p.pageId === pageId) ?? null;
}

export function getExperienceTemplate(family: ExperiencePageFamily) {
  switch (family) {
    case 'INFORMATION':
      return EXPERIENCE_PAGE_TEMPLATES.INFORMATION;
    case 'AUTH':
      return EXPERIENCE_PAGE_TEMPLATES.AUTH;
    case 'COMPLEX':
      return EXPERIENCE_PAGE_TEMPLATES.COMPLEX;
    case 'NDXBOOK_WORKSPACE':
      return EXPERIENCE_PAGE_TEMPLATES.NDXBOOK_WORKSPACE;
  }
}

export function buildFamilyDerivationReceipt(pageId: string, overrides: ExperiencePageDefinition['regionOverrides'] = {}): FamilyDerivationReceipt | null {
  const page = getExperiencePageDefinition(pageId);
  if (!page) return null;
  const template = getExperienceTemplate(page.family);
  const regionsOverridden = Object.keys(overrides ?? {}) as FamilyDerivationReceipt['regionsOverridden'];
  return {
    receiptId: `family-derivation:${pageId}:${Date.now()}`,
    pageId,
    family: page.family,
    templateId: template.templateId,
    regionsInherited: [...template.inheritedRegions],
    regionsOverridden,
    createdAt: new Date().toISOString(),
    lineage: P0_VR_3G_LINEAGE,
  };
}

export function isInformationFamilyConfirmed(): boolean {
  return SITE00_INFORMATION_PAGES.length >= 4;
}

export function isAuthFamilyConfirmed(): boolean {
  return SITE00_AUTH_PAGES.length >= 2;
}
