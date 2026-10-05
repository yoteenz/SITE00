/**
 * JURNL — ingested PERSONAL / FOUNDER project record (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 * Data only. The host reads this to inspect JURNL; JURNL's runtime renders it.
 */

import type { IngestedProjectRecord } from '../../../../shared/site00-project-ingestion/types.js';

export const JURNL_SLUG = 'jurnl' as const;
export const JURNL_ASSET_ROOT = '/site00/projects/jurnl';
export const JURNL_AUTHORITY_ROOT = `${JURNL_ASSET_ROOT}/f01/authorities`;

export const JURNL_PALETTE = [
  { id: 'bone', label: 'BONE / CREAM', hex: '#F9F6EF', role: 'BASE FIELD' },
  { id: 'ivory', label: 'IVORY', hex: '#F3EDE2', role: 'SURFACES / INPUTS' },
  { id: 'greige', label: 'GREIGE', hex: '#D2C8BA', role: 'BORDERS / DIVIDERS' },
  { id: 'taupe', label: 'TAUPE', hex: '#B6A594', role: 'MUTED TEXT / MATERIAL' },
  { id: 'blush', label: 'BLUSH', hex: '#EBCFC8', role: 'SOFT FIELDS / ERROR WASH' },
  { id: 'rose', label: 'MUTED ROSE', hex: '#C9949A', role: 'BRAND MARK / ACCENT' },
  { id: 'emerald', label: 'DEEP EMERALD', hex: '#0F3D32', role: 'PRIMARY ACTION / FOCUS / SUCCESS' },
  { id: 'wine', label: 'BURGUNDY / WINE', hex: '#6E1F2D', role: 'ERROR / DESTRUCTIVE' },
  { id: 'champagne', label: 'CHAMPAGNE', hex: '#C6A676', role: 'METAL DETAILS' },
] as const;

export const JURNL_PROJECT: IngestedProjectRecord = {
  projectId: 'JURNL',
  slug: JURNL_SLUG,
  displayName: 'JURNL',
  projectType: 'PERSONAL',
  ownership: 'FOUNDER',
  relationship: 'PERSONAL',
  productClass: 'PERSONAL FINANCE + LIFESTYLE APPLICATION',
  status: 'ACTIVE_PRODUCTION',
  currentFamily: 'F01_ENTRY',
  currentProductionStage: 'IMPLEMENTATION_PROOF',
  tagline: 'PLAN TODAY. GROW FREELY.',
  voice: 'QUIETLY ASSURED + SMART / HUMAN',
  primaryPlatform: 'MOBILE_APP',
  viewport: {
    authority: { preset: 'MOBILE', w: 393, h: 852 },
    presets: { MOBILE: { w: 393, h: 852 }, TABLET: { w: 834, h: 1194 }, DESKTOP: { w: 1440, h: 900 } },
    defaultPreset: 'MOBILE',
    safeInsets: {
      phone: { top: 59, right: 0, bottom: 34, left: 0 },
      tablet: { top: 24, right: 0, bottom: 20, left: 0 },
      desktop: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    grid: {
      phone: { columns: 4, margin: 32, gutter: 12 },
      tablet: { columns: 8, margin: 64, gutter: 24 },
      desktop: { columns: 12, margin: 96, gutter: 24 },
    },
  },
  brand: {
    logo: {
      authorityFile: 'REFERENCE/REFERENCE_JURNL_LOGO_OFFICIAL.jpg',
      runtimeFile: `${JURNL_ASSET_ROOT}/brand/jurnl-logo-official.png`,
      rule: 'SMALL, INTEGRATED — NEVER THE HERO. RUNTIME MARK IS THE OFFICIAL LOGO WITH ITS WHITE FIELD REMOVED (scripts/jurnl-logo-from-official.mjs), NOT A SCREEN CROP.',
    },
    coverFile: `${JURNL_ASSET_ROOT}/brand/jurnl-cover.png`,
    masterAuthorityFile: `${JURNL_AUTHORITY_ROOT}/reference/REFERENCE_MASTER_VISUAL_AUTHORITY.jpg`,
    palette: [...JURNL_PALETTE],
    typography: [
      {
        id: 'DISPLAY',
        description: 'FASHION CONDENSED DISPLAY LANGUAGE',
        family: 'INSTRUMENT SERIF',
        files: [`${JURNL_ASSET_ROOT}/fonts/instrument-serif-400.woff2`],
        license: 'SIL OFL 1.1',
      },
      {
        id: 'FUNCTIONAL',
        description: 'CLEAN COMPLEMENTARY CONDENSED SANS',
        family: 'BARLOW SEMI CONDENSED',
        files: [300, 400, 500].map((w) => `${JURNL_ASSET_ROOT}/fonts/barlow-semi-condensed-${w}.woff2`),
        license: 'SIL OFL 1.1',
      },
    ],
    rules: [
      { id: 'UPPERCASE_ONLY', rule: 'ALL USER-FACING JURNL TEXT IS UPPERCASE.', hard: true },
      { id: 'NO_CIRCULAR_CONTROLS', rule: 'NO CIRCULAR TAPPABLE CONTROLS. SQUARE-ROUNDED GEOMETRY ONLY.', hard: true },
      { id: 'LOGO_SMALL', rule: 'LOGO STAYS SMALL AND INTEGRATED.', hard: true },
      { id: 'LIVE_UI', rule: 'NO TEXT, FORMS OR CONTROLS BAKED INTO IMAGERY.', hard: true },
      { id: 'NO_UNSUBSTANTIATED_CLAIMS', rule: 'NO SECURITY / PRIVACY CLAIM WITHOUT A VERIFIED SYSTEM BEHIND IT.', hard: true },
    ],
    visualLanguage: ['LUXURY ARCHITECTURAL LIFESTYLE', 'EDITORIAL COLLAGE', 'TACTILE MATERIALITY', 'SOFT STRUCTURED FINANCIAL INFORMATION'],
    voice: 'QUIETLY ASSURED + SMART / HUMAN',
    tagline: 'PLAN TODAY. GROW FREELY.',
  },
  families: [
    { familyId: 'F01', familyName: 'ENTRY', status: 'IMPLEMENTATION_PROOF', entryRoute: 'entry' },
    { familyId: 'F02', familyName: 'SETUP', status: 'IMPLEMENTATION_PROOF', entryRoute: 'setup' },
  ],
  runtime: {
    kind: 'PROJECT_RUNTIME',
    defaultRoute: 'entry',
    authAdapter: 'DESIGN_PREVIEW',
    authNote:
      'JURNL END-USER AUTH PROVIDER IS UNRESOLVED. SITE 00 SUPABASE IS HOST AUTH (SHARED WITH FSBW) AND IS NOT SILENTLY REUSED FOR JURNL CUSTOMERS. THE WORKSPACE RUNTIME USES THE DESIGN-PREVIEW ADAPTER; THE PRODUCTION PATH USES THE UNCONFIGURED ADAPTER (HONEST "NOT AVAILABLE YET" ERRORS).',
    scenarios: [
      { id: 'network-error', label: 'NETWORK ERROR', query: { scenario: 'network-error' } },
      { id: 'offline', label: 'OFFLINE', query: { scenario: 'offline' } },
      { id: 'os-denied', label: 'OS: FACE ID DENIED', query: { os: 'denied' } },
      { id: 'os-failed', label: 'OS: FACE ID FAILED', query: { os: 'failed' } },
      { id: 'os-unavailable', label: 'OS: FACE ID UNAVAILABLE', query: { os: 'unavailable' } },
      { id: 'email-link-valid', label: 'EMAIL LINK: VERIFY (VALID)', route: 'entry/verify-email', query: { link: 'valid' } },
      { id: 'email-link-expired', label: 'EMAIL LINK: VERIFY (EXPIRED)', route: 'entry/verify-email', query: { link: 'expired' } },
      { id: 'reset-link-valid', label: 'RESET LINK (VALID)', route: 'entry/new-password', query: { token: 'preview' } },
      { id: 'reset-link-expired', label: 'RESET LINK (EXPIRED)', route: 'entry/new-password', query: { token: 'expired' } },
      { id: 'fresh-device', label: 'FRESH DEVICE (CLEAR RUNTIME STATE)', query: { reset: '1' } },
    ],
    previewNote: 'PREVIEW ACCOUNTS: EMMA@EXAMPLE.COM / Jurnl-2026 · LOCKED@EXAMPLE.COM (LOCKED) · ANY OTHER EMAIL = NOT FOUND',
  },
  authorityRoot: 'JURNL/F01_ENTRY',
};
