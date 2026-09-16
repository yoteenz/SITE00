/**
 * P0.VR.OPUS-NATIVE2 — Phase 12, 13, 14, 15: creating a page on purpose.
 *
 * A coding agent asked to "create a page" will produce a competent generic
 * page. That is the failure this contract exists to prevent. Every SITE 00
 * page belongs to a project with a creative context, inherits from an approved
 * authority, uses a fixed component grammar and occupies a defined place in a
 * route hierarchy. None of that is inferable from a sentence, so none of it is
 * left to inference: the contract is supplied, and a creation run without one
 * is refused.
 *
 * Phase 13 is the part with teeth. A derivative must classify every major
 * region as INHERITED, OVERRIDDEN or NEW, and must justify each override. The
 * cheapest thing for a model to do is rebuild the shell it can see in the
 * parent's source; the classification makes that a visible, reviewable claim
 * rather than a silent duplication the founder discovers later.
 */

import type { OpusNativeViewport } from './types.js';

export const PAGE_ROLES = [
  'CANONICAL_AUTHORITY',
  'CHILD_DETAIL',
  'GRANDCHILD_DETAIL',
  'TEST_SURFACE',
  'DIAGNOSTIC',
] as const;
export type PageRole = (typeof PAGE_ROLES)[number];

/** Phase 13 — the answer Opus must give for every major region. */
export const REGION_INHERITANCE = ['INHERITED', 'OVERRIDDEN', 'NEW'] as const;
export type RegionInheritance = (typeof REGION_INHERITANCE)[number];

export interface RegionClassification {
  region: string;
  classification: RegionInheritance;
  /** Required for OVERRIDDEN and NEW. An override with no reason is a duplication. */
  justification: string | null;
}

/** Phase 15 — the decision that must precede creating a component. */
export const COMPONENT_DISPOSITIONS = ['REUSE', 'EXTEND', 'FORK', 'CREATE'] as const;
export type ComponentDisposition = (typeof COMPONENT_DISPOSITIONS)[number];

export interface ComponentDecision {
  need: string;
  disposition: ComponentDisposition;
  existingCandidate: string | null;
  justification: string;
}

export interface PageCreationContract {
  project: string;
  parentPage: string | null;
  pageId: string;
  pageRole: PageRole;
  /** The route the founder intends, validated against route grammar before use. */
  routeIntent: string;
  /** Which approved surface supplies shell, tokens and grammar. */
  inheritanceSource: string | null;
  designAuthority: string;
  interactionPatterns: string[];
  requiredModules: string[];
  /** Named slots the page must fill, so assets are declared rather than invented. */
  assetSlots: Array<{ slot: string; role: string; source: 'INHERITED' | 'PLACEHOLDER' | 'REQUIRED' }>;
  viewportAuthorities: OpusNativeViewport[];
  /** Regions the page is permitted to diverge from its parent on. */
  allowedOverrides: string[];
}

export interface PageCreationPlan {
  contract: PageCreationContract;
  regions: RegionClassification[];
  components: ComponentDecision[];
  filesToCreate: string[];
  routeToRegister: string | null;
}

// ---- Phase 14: route grammar ----------------------------------------------

/**
 * SITE 00 routes are hierarchical and lowercase-kebab under a project. A model
 * inventing `/design/MyNewPage` or `/opus/whatever` is not making a styling
 * mistake — it is creating a permanent URL, which is the least reversible
 * thing in this whole runtime. The grammar is therefore checked mechanically
 * rather than described in the prompt and hoped for.
 */
export const ROUTE_GRAMMAR = /^\/projects\/[a-z0-9-]+\/design\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface RouteValidation {
  valid: boolean;
  reason: string | null;
}

export function validateRouteIntent(
  route: string,
  existingRoutes: string[],
  parentRoute: string | null,
): RouteValidation {
  if (!ROUTE_GRAMMAR.test(route)) {
    return {
      valid: false,
      reason: `"${route}" does not match SITE 00 route grammar /projects/<project>/design/<lowercase-kebab>`,
    };
  }
  const normalised = route.replace(/\/+$/, '');
  if (existingRoutes.some((existing) => normaliseRoutePattern(existing) === normaliseRoutePattern(normalised))) {
    return { valid: false, reason: `"${route}" collides with an existing route` };
  }
  if (parentRoute) {
    const parentProject = parentRoute.split('/')[2];
    const childProject = normalised.split('/')[2];
    // A child in a different project is not a child; it is a new page that
    // happens to look like one, and its inheritance claim would be false.
    if (parentProject && childProject && parentProject !== childProject && !parentProject.startsWith(':')) {
      return { valid: false, reason: `child route project "${childProject}" does not match parent project "${parentProject}"` };
    }
  }
  return { valid: true, reason: null };
}

function normaliseRoutePattern(route: string): string {
  return route.replace(/:[A-Za-z]+/g, '*').replace(/\/+$/, '');
}

/** Phase 13 — an override with no justification is rejected before it renders. */
export function validateRegionPlan(
  regions: RegionClassification[],
  mustInherit: string[],
): { valid: boolean; problems: string[] } {
  const problems: string[] = [];

  for (const region of regions) {
    if (region.classification !== 'INHERITED' && !region.justification?.trim()) {
      problems.push(`${region.region} is ${region.classification} with no justification`);
    }
  }

  for (const required of mustInherit) {
    const match = regions.find((region) => region.region.toLowerCase() === required.toLowerCase());
    if (!match) {
      problems.push(`region "${required}" must be classified and was not`);
    } else if (match.classification !== 'INHERITED') {
      problems.push(
        `region "${required}" is declared ${match.classification} but the parent requires it to be INHERITED`,
      );
    }
  }

  return { valid: problems.length === 0, problems };
}
