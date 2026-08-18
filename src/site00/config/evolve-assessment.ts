/**
 * EVOLVE onboarding assessment — six-step existing-property intake.
 */

import { SITE00_ROUTES } from './routes';
import type { EvolvePathId } from './evolve';

export type EvolveAssessmentOption = {
  id: string;
  label: string;
  description?: string;
};

export type EvolveAssessmentStep = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'textarea' | 'text' | 'url' | 'capabilities' | 'providers' | 'scope';
  options?: EvolveAssessmentOption[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  gridColumns?: 2 | 3 | 4;
};

export const EVOLVE_ASSESSMENT_STORAGE_KEY = 'site00_evolve_assessment_v1';

export const EVOLVE_ASSESSMENT_PATH_SLUGS = ['refine', 'install', 'transform'] as const;

export type EvolveAssessmentRouteSlug = (typeof EVOLVE_ASSESSMENT_PATH_SLUGS)[number];

export const EVOLVE_PROPERTY_TYPE_OPTIONS: EvolveAssessmentOption[] = [
  { id: 'marketing-website', label: 'MARKETING WEBSITE' },
  { id: 'ecommerce', label: 'ECOMMERCE' },
  { id: 'portfolio', label: 'PORTFOLIO' },
  { id: 'membership', label: 'MEMBERSHIP PLATFORM' },
  { id: 'client-portal', label: 'CLIENT PORTAL' },
  { id: 'booking', label: 'BOOKING PLATFORM' },
  { id: 'saas', label: 'SAAS / WEB APPLICATION' },
  { id: 'internal-tool', label: 'INTERNAL TOOL' },
  { id: 'marketplace', label: 'MARKETPLACE' },
  { id: 'content-platform', label: 'CONTENT PLATFORM' },
  { id: 'custom-system', label: 'CUSTOM SYSTEM' },
  { id: 'other', label: 'OTHER' },
];

export const EVOLVE_DIAGNOSE_GOAL_OPTIONS: EvolveAssessmentOption[] = [
  { id: 'design', label: 'DESIGN' },
  { id: 'ux', label: 'UX' },
  { id: 'mobile', label: 'MOBILE EXPERIENCE' },
  { id: 'performance', label: 'PERFORMANCE' },
  { id: 'conversion', label: 'CONVERSION' },
  { id: 'navigation', label: 'NAVIGATION' },
  { id: 'accessibility', label: 'ACCESSIBILITY' },
  { id: 'ecommerce', label: 'ECOMMERCE' },
  { id: 'automation', label: 'AUTOMATION' },
  { id: 'ai', label: 'AI' },
  { id: 'client-experience', label: 'CLIENT EXPERIENCE' },
  { id: 'admin-experience', label: 'ADMIN EXPERIENCE' },
  { id: 'content-management', label: 'CONTENT MANAGEMENT' },
  { id: 'booking', label: 'BOOKING' },
  { id: 'membership', label: 'MEMBERSHIP' },
  { id: 'account-system', label: 'ACCOUNT SYSTEM' },
  { id: 'infrastructure', label: 'INFRASTRUCTURE' },
  { id: 'integrations', label: 'INTEGRATIONS' },
  { id: 'security', label: 'SECURITY' },
  { id: 'other', label: 'OTHER' },
];

export const EVOLVE_ACCESS_PROVIDER_OPTIONS: EvolveAssessmentOption[] = [
  { id: 'github', label: 'GITHUB' },
  { id: 'gitlab', label: 'GITLAB' },
  { id: 'bitbucket', label: 'BITBUCKET' },
  { id: 'vercel', label: 'VERCEL' },
  { id: 'supabase', label: 'SUPABASE' },
  { id: 'godaddy', label: 'GODADDY' },
  { id: 'cloudflare', label: 'CLOUDFLARE' },
  { id: 'shopify', label: 'SHOPIFY' },
  { id: 'stripe', label: 'STRIPE' },
  { id: 'wordpress', label: 'WORDPRESS' },
  { id: 'webflow', label: 'WEBFLOW' },
  { id: 'wix', label: 'WIX' },
  { id: 'squarespace', label: 'SQUARESPACE' },
  { id: 'aws', label: 'AWS' },
  { id: 'google-cloud', label: 'GOOGLE CLOUD' },
  { id: 'other', label: 'OTHER' },
  { id: 'unsure', label: "I'M NOT SURE" },
];

export const EVOLVE_ONBOARDING_STEPS: EvolveAssessmentStep[] = [
  {
    id: 'property',
    title: 'PROPERTY',
    subtitle: 'IDENTIFY YOUR EXISTING DIGITAL PROPERTY.',
    type: 'text',
    required: false,
  },
  {
    id: 'diagnose',
    title: 'DIAGNOSE',
    subtitle: 'WHAT SHOULD CHANGE — AND WHAT MUST STAY?',
    type: 'multi',
    options: EVOLVE_DIAGNOSE_GOAL_OPTIONS,
    gridColumns: 3,
  },
  {
    id: 'systems',
    title: 'SYSTEMS',
    subtitle: 'SELECT SITE 00 CAPABILITIES TO INSTALL OR ENHANCE.',
    type: 'capabilities',
  },
  {
    id: 'access',
    title: 'ACCESS',
    subtitle: 'WHICH PROVIDERS WILL REQUIRE SECURE CONNECTION LATER?',
    type: 'providers',
    options: EVOLVE_ACCESS_PROVIDER_OPTIONS,
    gridColumns: 3,
  },
  {
    id: 'scope',
    title: 'SCOPE',
    subtitle: 'REVIEW YOUR EVOLVE ASSESSMENT BEFORE ENTERING STUDIO.',
    type: 'scope',
  },
  {
    id: 'enter-studio',
    title: 'ENTER STUDIO',
    subtitle: 'COMPLETE AUTHORIZATION TO CREATE YOUR EVOLVE PROJECT.',
    type: 'single',
    options: [{ id: 'acknowledge', label: 'I UNDERSTAND ASSESSMENT IS REQUIRED BEFORE FINAL SCOPE.' }],
  },
];

export type EvolvePathAssessmentConfig = {
  id: EvolvePathId;
  slug: EvolveAssessmentRouteSlug;
  stageMarker: string;
  title: string;
  declaration: string;
  editorialBody: string;
  breadcrumb: string;
  primaryCta: string;
  completionTitle: string;
  completionSubtitle: string;
};

export const EVOLVE_PATH_ASSESSMENT_CONFIG: Record<EvolvePathId, EvolvePathAssessmentConfig> = {
  refine: {
    id: 'refine',
    slug: 'refine',
    stageMarker: 'PATH 01',
    title: 'REFINE',
    declaration: 'IMPROVE WHAT YOU HAVE.',
    editorialBody:
      'ELEVATE DESIGN, UX, PERFORMANCE, ACCESSIBILITY, AND CONVERSION WITHOUT REBUILDING FROM ZERO.',
    breadcrumb: 'SERVICES / EVOLVE / REFINE',
    primaryCta: 'CONTINUE →',
    completionTitle: 'EVOLVE INTAKE COMPLETE',
    completionSubtitle: 'YOUR REFINE ENGAGEMENT IS READY FOR SITE 00 ASSESSMENT.',
  },
  install: {
    id: 'install',
    slug: 'install',
    stageMarker: 'PATH 02',
    title: 'INSTALL',
    declaration: 'ADD SITE 00 CAPABILITIES.',
    editorialBody:
      'INTEGRATE PORTALS, AUTOMATION, AI, COMMERCE SYSTEMS, AND CUSTOM CONNECTIONS INTO YOUR EXISTING PROPERTY.',
    breadcrumb: 'SERVICES / EVOLVE / INSTALL',
    primaryCta: 'CONTINUE →',
    completionTitle: 'EVOLVE INTAKE COMPLETE',
    completionSubtitle: 'YOUR INSTALL ENGAGEMENT IS READY FOR SITE 00 ASSESSMENT.',
  },
  transform: {
    id: 'transform',
    slug: 'transform',
    stageMarker: 'PATH 03',
    title: 'TRANSFORM',
    declaration: 'MODERNIZE AND REARCHITECT.',
    editorialBody:
      'DEEPER MODERNIZATION — UX REDESIGN, STACK CHANGES, MIGRATIONS, AND PLATFORM EVOLUTION.',
    breadcrumb: 'SERVICES / EVOLVE / TRANSFORM',
    primaryCta: 'CONTINUE →',
    completionTitle: 'EVOLVE INTAKE COMPLETE',
    completionSubtitle: 'YOUR TRANSFORM ENGAGEMENT IS READY FOR SITE 00 ASSESSMENT.',
  },
};

export function getEvolvePathConfig(pathSlug: EvolvePathId): EvolvePathAssessmentConfig {
  return EVOLVE_PATH_ASSESSMENT_CONFIG[pathSlug];
}

export function evolveAssessmentPath(pathSlug: EvolvePathId, step?: string): string {
  const base = `${SITE00_ROUTES.evolve}/${pathSlug}`;
  if (!step) return base;
  return `${base}/${step}`;
}

export function evolveAssessmentReviewPath(pathSlug: EvolvePathId): string {
  return evolveAssessmentPath(pathSlug, 'review');
}

export function evolveAssessmentCompletePath(pathSlug: EvolvePathId): string {
  return evolveAssessmentPath(pathSlug, 'complete');
}

export function evolveAssessmentStepIndex(stepId: string): number {
  return EVOLVE_ONBOARDING_STEPS.findIndex((s) => s.id === stepId);
}

export function evolveAssessmentNextStep(stepId: string): string | null {
  const idx = evolveAssessmentStepIndex(stepId);
  if (idx < 0 || idx >= EVOLVE_ONBOARDING_STEPS.length - 1) return null;
  return EVOLVE_ONBOARDING_STEPS[idx + 1]!.id;
}

export function evolveAssessmentPrevStep(stepId: string): string | null {
  const idx = evolveAssessmentStepIndex(stepId);
  if (idx <= 0) return null;
  return EVOLVE_ONBOARDING_STEPS[idx - 1]!.id;
}

export function isValidEvolvePathSlug(slug: string | undefined): slug is EvolvePathId {
  return Boolean(slug && EVOLVE_ASSESSMENT_PATH_SLUGS.includes(slug as EvolveAssessmentRouteSlug));
}
