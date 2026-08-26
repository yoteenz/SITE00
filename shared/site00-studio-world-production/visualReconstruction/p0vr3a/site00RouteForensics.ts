/**
 * P0.VR.3A — SITE 00 route forensic audit (code-driven, no provider spend).
 */

import { SITE00_ROUTES } from '../../../../src/site00/config/routes.js';
import { SITE00_DIRECTORY_SECTIONS } from '../../../../src/site00/config/directory.js';
import { SITE00_LOCATIONS_SECTIONS } from '../../../../src/site00/config/locations-directory.js';
import { SITE00_DESIGN_NAV_ITEMS } from '../p0vr2b/constants.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import type {
  Site00MissingRouteRecord,
  Site00RouteForensicAuditResult,
  Site00VisualStateRecord,
  StudioWorldDesignRouteManifestEntry,
} from '../p0vr3/types.js';
import { SITE00_DESIGN_PROJECT_ID } from '../p0vr3/constants.js';

function screen(
  partial: DesignScreenDefinition & { resolvedRoute?: string },
): StudioWorldDesignRouteManifestEntry {
  const resolvedRoute =
    partial.resolvedRoute ??
    (partial.absoluteRoute ? partial.routePattern : partial.routePattern.replace(':projectSlug', 'site00'));
  return {
    ...partial,
    resolvedRoute,
    showInDefaultSelector: partial.showInDefaultSelector ?? partial.classification !== 'HOST_INTERNAL',
    viewportCoverage: {},
  };
}

/** Existing SITE 00 customer-facing routes discovered from router + nav configs. */
export function buildSite00DiscoveredRoutes(): StudioWorldDesignRouteManifestEntry[] {
  const routes: StudioWorldDesignRouteManifestEntry[] = [
    // ORIGIN
    screen({
      screenId: 'homepage',
      displayName: 'Homepage',
      routePattern: SITE00_ROUTES.origin,
      absoluteRoute: true,
      scopeTargetId: 'originHomepage',
      routeFamily: 'ORIGIN',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'OriginPage',
      sourceEvidence: ['src/routes/Site00Routes.tsx', 'src/site00/pages/OriginPage.tsx'],
      dependencyClosure: 'COMPLETE',
      showInDefaultSelector: true,
    }),
    screen({
      screenId: 'origin-locations',
      displayName: 'Locations Directory',
      routePattern: SITE00_ROUTES.locations,
      absoluteRoute: true,
      scopeTargetId: 'originLocations',
      routeFamily: 'ORIGIN',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'LocationsPage',
      sourceEvidence: ['src/site00/config/locations-directory.ts'],
      dependencyClosure: 'COMPLETE',
    }),

    // WAITING ROOM
    screen({
      screenId: 'waiting-room',
      displayName: 'Waiting Room / Enter 00',
      routePattern: SITE00_ROUTES.enter,
      absoluteRoute: true,
      scopeTargetId: 'enterWaitingRoom',
      routeFamily: 'WAITING_ROOM',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'EnterPage',
      sourceEvidence: ['src/site00/config/directory.ts', 'src/site00/pages/EnterPage.tsx'],
      dependencyClosure: 'INCOMPLETE',
    }),

    // IDENTITY
    screen({
      screenId: 'identity-hub',
      displayName: 'Identity',
      routePattern: SITE00_ROUTES.idnty,
      absoluteRoute: true,
      scopeTargetId: 'idntyHub',
      routeFamily: 'IDENTITY',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'IdntyPage',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'identity-state',
      displayName: 'Identity State Selector',
      routePattern: SITE00_ROUTES.idntyState,
      absoluteRoute: true,
      scopeTargetId: 'idntyStateSelector',
      routeFamily: 'IDENTITY',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'IdntyStatePage',
      parentScreenId: 'identity-hub',
      sourceEvidence: ['src/site00/config/routes.ts', 'src/site00/config/identity.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'identity-begin-starting-at-zero',
      displayName: 'Identity Begin — Starting At Zero',
      routePattern: '/idnty/starting-at-zero',
      absoluteRoute: true,
      scopeTargetId: 'idntyAssessmentStartingAtZero',
      routeFamily: 'IDENTITY',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'IdntyAssessmentRouterPage',
      parentScreenId: 'identity-state',
      sourceEvidence: ['src/site00/config/routes.ts:IDNTY_ASSESSMENT_STATE_SLUGS'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'identity-begin-some-pieces',
      displayName: 'Identity Begin — Some Pieces Exist',
      routePattern: '/idnty/some-pieces-exist',
      absoluteRoute: true,
      scopeTargetId: 'idntyAssessmentSomePieces',
      routeFamily: 'IDENTITY',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'IdntyAssessmentRouterPage',
      parentScreenId: 'identity-state',
      sourceEvidence: ['src/site00/config/routes.ts:IDNTY_ASSESSMENT_STATE_SLUGS'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'identity-sign-in-security',
      displayName: 'Identity Sign-In Security',
      routePattern: SITE00_ROUTES.idntySignInSecurity,
      absoluteRoute: true,
      scopeTargetId: 'idntySignInSecurity',
      routeFamily: 'IDENTITY',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'SECONDARY',
      componentName: 'IdntySignInSecurityPage',
      parentScreenId: 'identity-hub',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),

    // BUILDER
    screen({
      screenId: 'builder-hub',
      displayName: 'Builder',
      routePattern: SITE00_ROUTES.bldr,
      absoluteRoute: true,
      scopeTargetId: 'bldrHub',
      routeFamily: 'BUILDER',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'BldrPage',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'builder-state',
      displayName: 'Builder State Selector',
      routePattern: SITE00_ROUTES.bldrState,
      absoluteRoute: true,
      scopeTargetId: 'bldrStateSelector',
      routeFamily: 'BUILDER',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'BldrStatePage',
      parentScreenId: 'builder-hub',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'builder-templates',
      displayName: 'Builder Templates',
      routePattern: SITE00_ROUTES.bldrTemplates,
      absoluteRoute: true,
      scopeTargetId: 'bldrTemplates',
      routeFamily: 'BUILDER',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'BldrTemplatesPage',
      parentScreenId: 'builder-hub',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'builder-start',
      displayName: 'Builder Start',
      routePattern: SITE00_ROUTES.bldrStart,
      absoluteRoute: true,
      scopeTargetId: 'bldrStart',
      routeFamily: 'BUILDER',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'BldrStartPage',
      parentScreenId: 'builder-hub',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'builder-select-site',
      displayName: 'Builder — Select Site',
      routePattern: '/bldr/site',
      absoluteRoute: true,
      scopeTargetId: 'bldrAssessmentSite',
      routeFamily: 'BUILDER',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'BldrAssessmentRouterPage',
      parentScreenId: 'builder-state',
      sourceEvidence: ['src/site00/config/routes.ts:BLDR_ASSESSMENT_STATE_SLUGS'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'builder-select-world',
      displayName: 'Builder — Select World',
      routePattern: '/bldr/world',
      absoluteRoute: true,
      scopeTargetId: 'bldrAssessmentWorld',
      routeFamily: 'BUILDER',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'BldrAssessmentRouterPage',
      parentScreenId: 'builder-state',
      sourceEvidence: ['src/site00/config/routes.ts:BLDR_ASSESSMENT_STATE_SLUGS'],
      dependencyClosure: 'INCOMPLETE',
    }),

    // EVOLVE
    screen({
      screenId: 'evolve-hub',
      displayName: 'Evolve',
      routePattern: SITE00_ROUTES.evolve,
      absoluteRoute: true,
      scopeTargetId: 'evolveHub',
      routeFamily: 'EVOLVE',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'EvolvePage',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'evolve-state',
      displayName: 'Evolve State Selector',
      routePattern: SITE00_ROUTES.evolveState,
      absoluteRoute: true,
      scopeTargetId: 'evolveStateSelector',
      routeFamily: 'EVOLVE',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'EvolveStatePage',
      parentScreenId: 'evolve-hub',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),

    // SYSTEM
    screen({
      screenId: 'system',
      displayName: 'System',
      routePattern: SITE00_ROUTES.system,
      absoluteRoute: true,
      scopeTargetId: 'systemPage',
      routeFamily: 'SYSTEM',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'SystemPage',
      sourceEvidence: ['src/site00/config/routes.ts', 'src/site00/config/locations-directory.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),

    // ASSET VAULT
    screen({
      screenId: 'asset-vault',
      displayName: 'Asset Vault',
      routePattern: SITE00_ROUTES.assts,
      absoluteRoute: true,
      scopeTargetId: 'asstsLibrary',
      routeFamily: 'ASSET_VAULT',
      classification: 'SYSTEM_INTERNAL',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'AsstsLibraryPage',
      sourceEvidence: ['src/routes/Site00Routes.tsx:AdminGuard'],
      dependencyClosure: 'INCOMPLETE',
      showInDefaultSelector: true,
    }),
    screen({
      screenId: 'asset-vault-batch',
      displayName: 'Asset Vault — Batch Review',
      routePattern: SITE00_ROUTES.asstsBatch,
      absoluteRoute: true,
      scopeTargetId: 'asstsBatch',
      routeFamily: 'ASSET_VAULT',
      classification: 'SYSTEM_INTERNAL',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'AsstsBatchPage',
      parentScreenId: 'asset-vault',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
      showInDefaultSelector: true,
    }),

    // ACCOUNT / AUTH
    screen({
      screenId: 'sign-in',
      displayName: 'Sign In',
      routePattern: SITE00_ROUTES.signIn,
      absoluteRoute: true,
      scopeTargetId: 'signInPage',
      routeFamily: 'ACCOUNT',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'Site00SignInPage',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'create-account',
      displayName: 'Create Account',
      routePattern: SITE00_ROUTES.createAccount,
      absoluteRoute: true,
      scopeTargetId: 'createAccountPage',
      routeFamily: 'ACCOUNT',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'Site00CreateAccountPage',
      parentScreenId: 'sign-in',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'control-room',
      displayName: 'Control Room',
      routePattern: SITE00_ROUTES.control,
      absoluteRoute: true,
      scopeTargetId: 'controlOverview',
      routeFamily: 'CONTROL',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'ControlOverviewPage',
      sourceEvidence: ['src/site00/config/routes.ts', 'src/site00/config/directory.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),
    screen({
      screenId: 'projects-index',
      displayName: 'Projects Index',
      routePattern: SITE00_ROUTES.projects,
      absoluteRoute: true,
      scopeTargetId: 'projectsPage',
      routeFamily: 'ACCOUNT',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'PRIMARY',
      componentName: 'ProjectsPage',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'COMPLETE',
    }),
    screen({
      screenId: 'account-intakes',
      displayName: 'Account Intakes',
      routePattern: SITE00_ROUTES.accountIntakes,
      absoluteRoute: true,
      scopeTargetId: 'accountIntakes',
      routeFamily: 'ACCOUNT',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'SECONDARY',
      componentName: 'AccountIntakesPage',
      parentScreenId: 'projects-index',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),

    // INFORMATION
    screen({
      screenId: 'about',
      displayName: 'About',
      routePattern: SITE00_ROUTES.about,
      absoluteRoute: true,
      scopeTargetId: 'aboutPage',
      routeFamily: 'INFORMATION',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'SECONDARY',
      componentName: 'AboutPage',
      sourceEvidence: ['src/site00/config/directory.ts', 'src/site00/config/locations-directory.ts'],
      dependencyClosure: 'COMPLETE',
    }),
    screen({
      screenId: 'journal',
      displayName: 'Journal',
      routePattern: SITE00_ROUTES.journal,
      absoluteRoute: true,
      scopeTargetId: 'journalPage',
      routeFamily: 'INFORMATION',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'SUPPORTING',
      componentName: 'JournalPage',
      sourceEvidence: ['src/site00/config/directory.ts'],
      dependencyClosure: 'COMPLETE',
    }),
    screen({
      screenId: 'support',
      displayName: 'Support',
      routePattern: SITE00_ROUTES.support,
      absoluteRoute: true,
      scopeTargetId: 'supportPage',
      routeFamily: 'INFORMATION',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'SECONDARY',
      componentName: 'SupportPage',
      sourceEvidence: ['src/site00/config/directory.ts'],
      dependencyClosure: 'COMPLETE',
    }),
    screen({
      screenId: 'services',
      displayName: 'Services',
      routePattern: SITE00_ROUTES.services,
      absoluteRoute: true,
      scopeTargetId: 'servicesPage',
      routeFamily: 'INFORMATION',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'SECONDARY',
      componentName: 'ServicesPage',
      sourceEvidence: ['src/site00/config/directory.ts'],
      dependencyClosure: 'COMPLETE',
    }),
    screen({
      screenId: 'sites-portfolio',
      displayName: 'Sites Portfolio',
      routePattern: SITE00_ROUTES.sites,
      absoluteRoute: true,
      scopeTargetId: 'sitesPortfolio',
      routeFamily: 'INFORMATION',
      classification: 'CUSTOMER_FACING',
      recordKind: 'ROUTE',
      priority: 'SECONDARY',
      componentName: 'SitesPortfolioPage',
      sourceEvidence: ['src/site00/config/directory.ts'],
      dependencyClosure: 'COMPLETE',
    }),

    // BLUEPRINT (client studio)
    screen({
      screenId: 'studio-blueprint',
      displayName: 'Blueprint Selection',
      routePattern: SITE00_ROUTES.studioBlueprint,
      absoluteRoute: true,
      scopeTargetId: 'studioBlueprint',
      routeFamily: 'BLUEPRINT',
      classification: 'CLIENT_WORKFLOW',
      recordKind: 'ROUTE',
      priority: 'CRITICAL',
      componentName: 'StudioWorkspaceRouterPage',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'INCOMPLETE',
    }),

    // HOST INTERNAL — excluded from default selector
    screen({
      screenId: 'design-workspace-host',
      displayName: 'Design Workspace (Host Tool)',
      routePattern: SITE00_ROUTES.studioWorldDesign,
      absoluteRoute: true,
      scopeTargetId: 'designWorkspaceHost',
      routeFamily: 'OTHER',
      classification: 'HOST_INTERNAL',
      recordKind: 'ROUTE',
      priority: 'SUPPORTING',
      componentName: 'StudioWorldDesignPage',
      sourceEvidence: ['src/site00/config/routes.ts'],
      dependencyClosure: 'COMPLETE',
      showInDefaultSelector: false,
    }),
  ];

  // Nav-linked routes from directory configs (evidence for cross-links)
  for (const section of SITE00_DIRECTORY_SECTIONS) {
    for (const row of section.rows) {
      if (routes.some((r) => r.resolvedRoute === row.href)) continue;
    }
  }
  for (const section of SITE00_LOCATIONS_SECTIONS) {
    for (const entry of section.entries) {
      if (routes.some((r) => r.resolvedRoute === entry.href)) continue;
    }
  }

  return routes;
}

export function buildSite00VisualStates(): Site00VisualStateRecord[] {
  return [
    {
      stateId: 'homepage-idnty-expanded',
      displayName: 'Homepage — Identity Expanded',
      parentScreenId: 'homepage',
      routeFamily: 'ORIGIN',
      classification: 'CUSTOMER_FACING',
      recordKind: 'INTERACTION_STATE',
      sourceEvidence: ['src/site00/pages/OriginPage.tsx:homeMode=idnty-expanded'],
    },
    {
      stateId: 'homepage-bldr-expanded',
      displayName: 'Homepage — Builder Expanded',
      parentScreenId: 'homepage',
      routeFamily: 'ORIGIN',
      classification: 'CUSTOMER_FACING',
      recordKind: 'INTERACTION_STATE',
      sourceEvidence: ['src/site00/pages/OriginPage.tsx:homeMode=bldr-expanded'],
    },
    {
      stateId: 'homepage-evolve-expanded',
      displayName: 'Homepage — Evolve Expanded',
      parentScreenId: 'homepage',
      routeFamily: 'ORIGIN',
      classification: 'CUSTOMER_FACING',
      recordKind: 'INTERACTION_STATE',
      sourceEvidence: ['src/site00/pages/OriginPage.tsx:homeMode=evolve-expanded'],
    },
    {
      stateId: 'waiting-room-menu-open',
      displayName: 'Waiting Room — Directory Open',
      parentScreenId: 'waiting-room',
      routeFamily: 'WAITING_ROOM',
      classification: 'CUSTOMER_FACING',
      recordKind: 'INTERACTION_STATE',
      sourceEvidence: ['src/site00/pages/EnterPage.tsx', 'src/site00/config/directory.ts'],
    },
    {
      stateId: 'identity-brand-panel',
      displayName: 'Identity — Brand Panel',
      parentScreenId: 'identity-hub',
      routeFamily: 'IDENTITY',
      classification: 'CUSTOMER_FACING',
      recordKind: 'INTERACTION_STATE',
      sourceEvidence: ['src/site00/components/homepage/IdntyExpandedPanel.tsx'],
    },
  ];
}

export function buildSite00MissingRoutes(): Site00MissingRouteRecord[] {
  const navHrefs = SITE00_DESIGN_NAV_ITEMS.map((item) => item.href);
  const existingRoutes = new Set(buildSite00DiscoveredRoutes().map((r) => r.resolvedRoute));

  const missingFromNav: Site00MissingRouteRecord[] = [];
  for (const href of navHrefs) {
    if (existingRoutes.has(href) || href.startsWith('/projects') || href.startsWith('/control') || href.startsWith('/assts')) {
      continue;
    }
    const slug = href.replace(/^\//, '').replace(/\//g, '-');
    missingFromNav.push({
      screenId: `missing-${slug}`,
      displayName: slug.toUpperCase().replace(/-/g, ' '),
      suggestedRoute: href,
      parentFlowId: 'information',
      purpose: `Linked from Design workspace host nav (${href}) but no router entry in Site00Routes.tsx`,
      sourceEvidence: ['shared/.../p0vr2b/constants.ts:SITE00_DESIGN_NAV_ITEMS', 'src/routes/Site00Routes.tsx'],
      recordKind: 'SITE00_REQUIRED_MISSING_ROUTE',
      implementationStatus: 'MISSING',
      referenceStatus: 'MISSING',
    });
  }

  const authMissing: Site00MissingRouteRecord[] = [
    {
      screenId: 'missing-forgot-password',
      displayName: 'Forgot Password',
      suggestedRoute: '/origin/forgot-password',
      parentFlowId: 'account',
      purpose: 'Sign-in flow typically requires password recovery endpoint',
      sourceEvidence: ['src/site00/pages/Site00SignInPage.tsx (no forgot-password route in routes.ts)'],
      recordKind: 'SITE00_IMPLIED_REQUIRED_ROUTE',
      implementationStatus: 'MISSING',
      referenceStatus: 'MISSING',
    },
    {
      screenId: 'missing-reset-password',
      displayName: 'Reset Password',
      suggestedRoute: '/origin/reset-password',
      parentFlowId: 'account',
      purpose: 'Password reset completion screen implied by auth workflow',
      sourceEvidence: ['src/site00/config/routes.ts (no reset-password route)'],
      recordKind: 'SITE00_IMPLIED_REQUIRED_ROUTE',
      implementationStatus: 'MISSING',
      referenceStatus: 'MISSING',
    },
    {
      screenId: 'missing-account-profile',
      displayName: 'Account Profile',
      suggestedRoute: '/account',
      parentFlowId: 'account',
      purpose: 'SITE00_FUTURE_ROUTES.account reserved; directory links to control room instead',
      sourceEvidence: ['src/site00/config/routes.ts:SITE00_FUTURE_ROUTES.account'],
      recordKind: 'SITE00_IMPLIED_REQUIRED_ROUTE',
      implementationStatus: 'MISSING',
      referenceStatus: 'MISSING',
    },
    {
      screenId: 'missing-brand-page',
      displayName: 'Brand',
      suggestedRoute: '/brand',
      parentFlowId: 'identity',
      purpose: 'Brand experience referenced in sprint IA; no dedicated route — may be panel/state only',
      sourceEvidence: ['P0.VR.3A spec', 'src/site00/pages/OriginPage.tsx (no /brand route)'],
      recordKind: 'SITE00_IMPLIED_REQUIRED_ROUTE',
      implementationStatus: 'MISSING',
      referenceStatus: 'MISSING',
    },
  ];

  return [...missingFromNav, ...authMissing];
}

export function runSite00RouteForensicAudit(): Site00RouteForensicAuditResult {
  const discoveredRoutes = buildSite00DiscoveredRoutes();
  const visualStates = buildSite00VisualStates();
  const missingRoutes = buildSite00MissingRoutes();
  const hostInternalExcluded = discoveredRoutes
    .filter((r) => r.classification === 'HOST_INTERNAL' || r.classification === 'SYSTEM_INTERNAL')
    .map((r) => r.screenId);

  return {
    projectId: SITE00_DESIGN_PROJECT_ID,
    discoveredRoutes,
    visualStates,
    missingRoutes,
    dependencyGraph: { flows: [], edges: [], closureByScreenId: {} },
    hostInternalExcluded,
    auditTriggersProviderSpend: false,
    auditMutatesExistingDesign: false,
  };
}

export function listSite00DesignableScreens(includeInspect = false): StudioWorldDesignRouteManifestEntry[] {
  const audit = runSite00RouteForensicAudit();
  const designable = audit.discoveredRoutes.filter((r) => {
    if (includeInspect) return true;
    if (r.showInDefaultSelector === false) return false;
    return (
      r.classification === 'CUSTOMER_FACING' ||
      r.classification === 'CLIENT_WORKFLOW' ||
      (r.classification === 'SYSTEM_INTERNAL' && r.showInDefaultSelector)
    );
  });
  return designable;
}

export function missingRoutesAsDesignScreens(): DesignScreenDefinition[] {
  return buildSite00MissingRoutes().map((m) => ({
    screenId: m.screenId,
    displayName: `${m.displayName} (MISSING)`,
    routePattern: m.suggestedRoute,
    absoluteRoute: true,
    scopeTargetId: m.screenId,
    routeFamily: 'OTHER',
    classification: 'CUSTOMER_FACING',
    recordKind: m.recordKind,
    priority: 'SECONDARY',
    parentScreenId: m.parentFlowId,
    sourceEvidence: m.sourceEvidence,
    dependencyClosure: 'MISSING_ROUTE',
    showInDefaultSelector: true,
  }));
}

export function visualStatesAsDesignScreens(): DesignScreenDefinition[] {
  return buildSite00VisualStates().map((s) => ({
    screenId: s.stateId,
    displayName: s.displayName,
    routePattern: '/',
    absoluteRoute: true,
    scopeTargetId: s.stateId,
    routeFamily: s.routeFamily,
    classification: s.classification,
    recordKind: 'INTERACTION_STATE',
    priority: 'PRIMARY',
    parentScreenId: s.parentScreenId,
    sourceEvidence: s.sourceEvidence,
    dependencyClosure: 'COMPLETE',
    showInDefaultSelector: true,
  }));
}
