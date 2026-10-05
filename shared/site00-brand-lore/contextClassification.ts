/**
 * Brand expression context classification — derived from real intake/project/business context.
 * Does NOT default every brand to website-first.
 */

import type { BrandExpressionContext } from './types.js';

export type ContextClassificationInput = {
  /** Identity operational answers (project types from core intake). */
  projectTypes?: string[];
  goals?: string[];
  /** Builder build class if available. */
  buildClass?: string | null;
  /** Builder experience answers. */
  digitalMetaphor?: string | null;
  primaryEntryBehavior?: string | null;
  /** Lore signals. */
  audienceRitual?: string[];
  worldMetaphor?: string | null;
  /** Known org slug for canonical overrides (e.g. ndxbook). */
  orgSlug?: string | null;
};

/** NDXBOOK canonical classification — from Content Brain, not invented here. */
const NDXBOOK_CONTEXT: BrandExpressionContext = 'SOCIAL_FIRST_EDITORIAL';

export function classifyBrandExpressionContext(input: ContextClassificationInput): BrandExpressionContext {
  if (input.orgSlug === 'ndxbook') return NDXBOOK_CONTEXT;

  const projects = new Set(input.projectTypes ?? []);
  const goals = new Set(input.goals ?? []);
  const rituals = new Set(input.audienceRitual ?? []);

  if (
    rituals.has('discovery') ||
    rituals.has('perspective') ||
    rituals.has('taste') ||
    input.digitalMetaphor === 'publication'
  ) {
    return 'SOCIAL_FIRST_EDITORIAL';
  }

  if (projects.has('ecommerce') || input.primaryEntryBehavior === 'shop') {
    return 'ECOMMERCE_FIRST';
  }

  if (input.buildClass === 'enterprise' || projects.has('web-app')) {
    return 'PRODUCT_PLATFORM';
  }

  if (input.digitalMetaphor === 'community' || goals.has('build-community')) {
    return 'CREATOR_BRAND';
  }

  if (input.digitalMetaphor === 'store' || input.primaryEntryBehavior === 'shop') {
    return 'PHYSICAL_RETAIL';
  }

  if (
    goals.has('book-appointments') ||
    input.primaryEntryBehavior === 'book' ||
    projects.has('booking')
  ) {
    return 'SERVICE_BUSINESS';
  }

  if (input.digitalMetaphor === 'world' || input.buildClass === 'world') {
    return 'ENTERTAINMENT_MEDIA';
  }

  if (projects.has('membership') || input.digitalMetaphor === 'community') {
    return 'HYBRID';
  }

  if (projects.has('site') || projects.has('portfolio')) {
    return 'SERVICE_BUSINESS';
  }

  return 'OTHER';
}

export function contextClassificationLabel(ctx: BrandExpressionContext): string {
  return ctx.replace(/_/g, ' ');
}
