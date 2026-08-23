/**
 * P1 site methodology snapshot — freeze inputs for contract compilation.
 */

import { createHash } from 'node:crypto';
import { SITE00_ROUTES } from '../../../src/site00/config/routes.js';
import { buildProjectWorkspaceCanon } from '../../site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';
import { extractSite00ProjectsIndexFunctionalCanon } from '../../site00-brand-lore/experienceExpression/projectsIndexFunctionalCanon.js';
import { P0_5A_METHODOLOGY_VERSION } from '../constants.js';
import {
  compileSiteMethodologyFingerprints,
  createMigratedSiteStrategy,
  derivePageInventoryFromArchitectureAndCanon,
  groupSurfacesIntoPageFamilies,
} from '../siteProductionLogic.js';
import type {
  SiteArchitecture,
  SiteInformationArchitecture,
  SitePageFamily,
  SitePageInventory,
  SiteStrategy,
} from '../siteProductionTypes.js';
import { P1_CONTROLLED_ROUTE, P1_PAGE_FAMILY_ID } from './constants.js';

function fingerprint(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildP1SiteArchitecture(projectId: string): SiteArchitecture {
  const now = new Date().toISOString();
  return {
    id: `architecture-${projectId}`,
    projectId,
    routeGroups: [
      {
        groupId: 'projects-workspace',
        label: 'Projects Workspace',
        routes: [SITE00_ROUTES.projects, '/projects/:projectSlug'],
      },
      {
        groupId: 'host',
        label: 'SITE 00 Host',
        routes: [SITE00_ROUTES.origin],
      },
    ],
    primaryJourneys: ['Enter projects', 'Open project workspace', 'Search projects'],
    navigationHierarchy: [{ nodeId: 'projects', label: 'Projects', children: ['project-detail'] }],
    entryPoints: [SITE00_ROUTES.projects],
    conversionPaths: [],
    serviceDestinations: [],
    productDestinations: [],
    accountAreas: ['/account'],
    supportAreas: [],
    legalSystemPages: [],
    lifecycleState: 'READY',
    functionalCanonFingerprint: fingerprint(extractSite00ProjectsIndexFunctionalCanon()),
    provenance: 'COMPILED',
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildP1SiteInformationArchitecture(projectId: string): SiteInformationArchitecture {
  const now = new Date().toISOString();
  return {
    id: `ia-${projectId}`,
    projectId,
    informationDomains: ['projects-index', 'project-detail', 'client-studio'],
    hierarchy: [
      { domainId: 'projects-index', parentId: null, priority: 1 },
      { domainId: 'project-detail', parentId: 'projects-index', priority: 2 },
      { domainId: 'client-studio', parentId: 'projects-index', priority: 3 },
    ],
    crossLinks: [],
    progressiveDisclosureRules: ['Project detail reveals workspace controls'],
    contentDependencies: [],
    navigationRelationships: [{ fromNodeId: 'projects-index', toNodeId: 'project-detail', relationship: 'entry' }],
    lifecycleState: 'READY',
    provenance: 'COMPILED',
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildP1PageInventory(
  projectId: string,
  architecture: SiteArchitecture,
): SitePageInventory {
  const functionalCanon = extractSite00ProjectsIndexFunctionalCanon();
  const canonItems = functionalCanon.items.map((item) => ({
    route: item.route ?? P1_CONTROLLED_ROUTE,
    purpose: item.label,
    requirements: [item.classification],
  }));
  const surfaces = derivePageInventoryFromArchitectureAndCanon(architecture, canonItems);
  const now = new Date().toISOString();
  return {
    id: `inventory-${projectId}`,
    projectId,
    surfaces: surfaces.map((s) =>
      s.route === P1_CONTROLLED_ROUTE
        ? { ...s, pageFamilyCandidate: P1_PAGE_FAMILY_ID, implementationCriticality: 'CRITICAL' as const }
        : s,
    ),
    lifecycleState: 'READY',
    derivedFromArchitectureId: architecture.id,
    derivedFromFunctionalCanonFingerprint: architecture.functionalCanonFingerprint,
    provenance: 'COMPILED',
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildP1ProjectWorkspacePageFamily(): SitePageFamily {
  const workspaceCanon = buildProjectWorkspaceCanon();
  return {
    familyId: P1_PAGE_FAMILY_ID,
    familyName: 'Project Workspace',
    familyThesis: 'SITE 00 evolved into asymmetric project workspace — dominant Active Piece, Review elevation, secondary work cluster, Work History',
    surfaceMembers: ['projects', 'project-detail'],
    layoutGrammar: {
      dominantRegion: 'ACTIVE_PIECE',
      supportingRegions: ['REVIEW_JUDGMENT', 'SECONDARY_WORK_CLUSTER', 'WORK_HISTORY'],
      asymmetryBehavior: 'Dominant focal object with elevated review/judgment band',
      alignmentBehavior: 'Host-aligned spatial restraint with red wayfinding',
      density: 'BALANCED',
      artifactScale: 'Large authored artwork participation',
      contentZones: ['PRIMARY', 'SECONDARY', 'HISTORY'],
      fixedVsFluidRegions: ['Host nav fixed', 'Workspace content fluid'],
      navigationIntegration: 'SITE 00 host shell + bottom navigation on mobile',
      responsiveTransformation: 'Mobile: dominant object hierarchy preserved — not stacked-desktop collapse',
    },
    hierarchyGrammar: [
      'Active Piece dominates',
      'Review/Judgment elevated',
      'Secondary work cluster subordinate',
      'Work History tertiary',
    ],
    interactionGrammar: ['Search', 'Open project', 'Navigate host shell'],
    contentBehavior: ['Project phase and focus visible', 'Client studio section distinct'],
    responsivePhilosophy: 'MOBILE_NOT_STACKED_DESKTOP — mobile proof required',
    artworkBehavior: ['Artwork participates materially in hierarchy', 'Not decorative-only'],
    assetFamilyRequirements: ['Approved proof assets bound — no CSS substitution'],
    hostBehavior: [
      'Bright white architectural environment',
      'Host typography (Martian Mono interface)',
      'Red wayfinding behavior',
      'Translucency/material behavior where canonical',
    ],
    clientExpressionBehavior: ['SITE 00 index — no client brand expression on /projects'],
    visualProofPolicy: 'REPRESENTATIVE_SURFACES',
    mobileEvidenceRequirement: 'MOBILE_NOT_STACKED_DESKTOP',
    accessibilityRequirements: [
      'semantic landmarks',
      'keyboard reachability',
      'focus visibility',
      'button/link semantics',
      'alt for meaningful images',
      'touch target minimums',
      'reduced-motion hooks where motion exists',
    ],
    implementationRequirements: workspaceCanon.workbenchBehaviors,
    sharedGrammarNotIdenticalLayout: true,
  };
}

export function buildP1SiteMethodologyContext(projectId: string): {
  strategy: SiteStrategy;
  architecture: SiteArchitecture;
  ia: SiteInformationArchitecture;
  inventory: SitePageInventory;
  families: SitePageFamily[];
  fingerprints: ReturnType<typeof compileSiteMethodologyFingerprints>;
  functionalCanonFingerprint: string;
  hostCanonFingerprint: string;
  workspaceCanonId: string;
} {
  const strategy = createMigratedSiteStrategy(projectId);
  strategy.lifecycleState = 'READY';
  const architecture = buildP1SiteArchitecture(projectId);
  const ia = buildP1SiteInformationArchitecture(projectId);
  const inventory = buildP1PageInventory(projectId, architecture);
  const families = groupSurfacesIntoPageFamilies(inventory.surfaces, [
    {
      familyId: P1_PAGE_FAMILY_ID,
      familyName: 'Project Workspace',
      familyThesis: buildP1ProjectWorkspacePageFamily().familyThesis,
      surfaceMembers: ['projects'],
    },
  ]);
  // Apply full family definition
  const fullFamily = buildP1ProjectWorkspacePageFamily();
  families[0] = fullFamily;

  const functionalCanon = extractSite00ProjectsIndexFunctionalCanon();
  const functionalCanonFingerprint = fingerprint(functionalCanon.items.map((i) => i.id));
  const workspaceCanon = buildProjectWorkspaceCanon();

  const fingerprints = compileSiteMethodologyFingerprints({
    strategy,
    architecture,
    ia,
    inventory,
    families,
    functionalCanonFingerprint,
    hostCanonFingerprint: 'site00-host-canon-v1',
    clientExpressionFingerprint: null,
  });

  return {
    strategy,
    architecture,
    ia,
    inventory,
    families,
    fingerprints,
    functionalCanonFingerprint,
    hostCanonFingerprint: 'site00-host-canon-v1',
    workspaceCanonId: workspaceCanon.canonId,
  };
}
