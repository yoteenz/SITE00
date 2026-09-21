/**
 * P0.VR.PAGE-FAMILY-SKIN-BEHAVIOR-CONTRACT1
 */

import { buildPageSystemReviewModel } from '../designPageSystemReview.js';
import type { PageSystemReviewModel } from '../designPageSystemReview.js';
import type { PageConceptCgptCreativeBrief, PageFunctionContract } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { PageExperienceExpressionContract } from './pageConceptViewportAuthorityFamily.js';
import type { PageFamilyComponentExpressionMap } from './pageConceptPageFamilyComponentExpression.js';
import { compilePageFamilyComponentExpressionMap } from './pageConceptPageFamilyComponentExpression.js';

export type DesignDivergenceLevel = 'LOCKED' | 'LOW' | 'MODERATE' | 'HIGH';

export type PageFamilyShellTokens = {
  familyTypography: readonly string[];
  familySpacing: readonly string[];
  familyRadius: readonly string[];
  familyBorders: readonly string[];
  familyMaterials: readonly string[];
  familySurfaces: readonly string[];
  familyAccentRules: readonly string[];
  familyNavigation: readonly string[];
  familyOverlayRules: readonly string[];
  familyMotion: readonly string[];
  familyDensity: readonly string[];
  familyResponsiveRules: readonly string[];
};

export type PageFamilyInheritanceRules = {
  parent: {
    role: 'STRONGEST_COMPOSITION_GRAMMAR';
    inherits: readonly string[];
    mayAlter: readonly string[];
    designDivergenceLevel: DesignDivergenceLevel;
  };
  child: {
    inherits: readonly string[];
    mayAlter: readonly string[];
    designDivergenceLevel: DesignDivergenceLevel;
  };
  grandchild: {
    inherits: readonly string[];
    mayAlter: readonly string[];
    designDivergenceLevel: DesignDivergenceLevel;
  };
};

export type PageFamilyResponsiveInheritance = {
  mobile: readonly string[];
  tablet: readonly string[];
  desktop: readonly string[];
};

export type PageFamilyForbiddenFallbacks = readonly string[];

export type PageFamilySkinBehaviorContract = {
  contractId: string;
  version: string;
  projectId: string;
  pageId: string;
  sourceViewportFamilyId: string;
  sourceExperienceExpressionId: string;
  sourceSkinVersion: string;
  sourceCgptBriefId: string;
  parentPageRole: string;
  pageSystemReviewSnapshot: {
    activePageId: string;
    activePageName: string;
    directChildCount: number;
    grandchildCount: number;
    childPageIds: readonly string[];
    grandchildPageIds: readonly string[];
  };
  visualDna: readonly string[];
  shellGeometry: readonly string[];
  navigationBehavior: readonly string[];
  internalSurfaces: readonly string[];
  overlayBehavior: readonly string[];
  responsiveInheritance: PageFamilyResponsiveInheritance;
  inheritanceRules: PageFamilyInheritanceRules;
  shellTokens: PageFamilyShellTokens;
  forbiddenGenericFallbacks: PageFamilyForbiddenFallbacks;
  componentExpressionMapId: string;
  designDivergenceRules: PageFamilyInheritanceRules;
  approvedAt: string | null;
  createdAt: string;
};

export type PageFamilyContractExtension = {
  extensionId: string;
  contractId: string;
  patternKey: string;
  label: string;
  description: string;
  approvedAt: string | null;
  createdAt: string;
};

export type OpusRepresentativeShellKind =
  | 'PARENT'
  | 'CHILD_LIST'
  | 'CHILD_DETAIL'
  | 'GRANDCHILD_DETAIL'
  | 'DRAWER_INSPECTOR'
  | 'MODAL_CONFIRMATION'
  | 'MOBILE_NAV'
  | 'TABLET_NAV'
  | 'DESKTOP_NAV';

export type OpusRepresentativeShell = {
  shellId: string;
  kind: OpusRepresentativeShellKind;
  targetSurface: 'TWIN';
  status: 'PENDING' | 'READY';
  viewport: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'ALL';
};

export type OpusRepresentativeShellSet = {
  setId: string;
  contractId: string;
  targetSurface: 'TWIN';
  shells: readonly OpusRepresentativeShell[];
  createdAt: string;
  readyAt: string | null;
};

const FORBIDDEN_FALLBACKS: PageFamilyForbiddenFallbacks = [
  'generic white SaaS cards',
  'default shadcn look',
  'arbitrary border-radius drift',
  'generic dashboard panels',
  'default blue links/buttons',
  'browser-default selects',
  'unrelated typography',
  'unstyled modal shells',
  'generic mobile drawers',
  'inconsistent nested headers',
];

function shellTokensFromSkin(skin: ProjectSkinContract, brief: PageConceptCgptCreativeBrief): PageFamilyShellTokens {
  return {
    familyTypography: [
      `display: ${skin.typography.displayFont}`,
      `body: ${skin.typography.bodyFont}`,
      `mono: ${skin.typography.monoFont}`,
      `hierarchy: ${brief.typographyStrategy}`,
    ],
    familySpacing: [`composition: ${skin.composition.join(' · ')}`, 'section gaps follow approved mobile authority cadence'],
    familyRadius: [`component expression: ${skin.componentExpression.join(' · ')}`, 'nested shells reuse parent radius tokens'],
    familyBorders: [`forbidden drift: ${skin.forbiddenDrift.join(' · ')}`],
    familyMaterials: [...skin.material.slice(0, 4), brief.materialStrategy],
    familySurfaces: [`palette: ${skin.palette.slice(0, 3).join(' · ')}`, 'cards/panels inherit parent material stack'],
    familyAccentRules: [`color strategy: ${brief.colorStrategy}`, `brand signals: ${skin.brandSignals.join(' · ')}`],
    familyNavigation: ['breadcrumbs + local subnav inherit display type', 'back behavior preserves hierarchy context'],
    familyOverlayRules: ['drawer/sheet/modal reuse experience expression overlay grammar'],
    familyMotion: [brief.interactionCharacter, 'no bouncey SaaS defaults'],
    familyDensity: [brief.compositionStrategy, 'child pages may tighten for task modules only'],
    familyResponsiveRules: [
      `MOBILE: ${brief.mobileDirection}`,
      'TABLET: widened rails — not a generic scaled phone UI',
      `DESKTOP: ${brief.desktopDirection}`,
    ],
  };
}

function inheritanceRules(): PageFamilyInheritanceRules {
  return {
    parent: {
      role: 'STRONGEST_COMPOSITION_GRAMMAR',
      inherits: ['full visual DNA', 'shell geometry', 'navigation language'],
      mayAlter: ['content modules within parent role only'],
      designDivergenceLevel: 'LOCKED',
    },
    child: {
      inherits: ['shell', 'typography', 'materials', 'spacing', 'interaction expression', 'navigation language'],
      mayAlter: ['internal composition', 'content hierarchy', 'task-specific modules'],
      designDivergenceLevel: 'LOW',
    },
    grandchild: {
      inherits: ['family shell', 'child context', 'interaction language', 'materials', 'typography', 'navigation behavior'],
      mayAlter: ['detail', 'edit', 'inspect', 'review', 'configure', 'history', 'asset view'],
      designDivergenceLevel: 'LOW',
    },
  };
}

function reviewSnapshot(review: PageSystemReviewModel) {
  return {
    activePageId: review.activePageId,
    activePageName: review.activePageName,
    directChildCount: review.directChildCount,
    grandchildCount: review.grandchildCount,
    childPageIds: review.children.map((c) => c.pageId),
    grandchildPageIds: review.grandchildren.map((c) => c.pageId),
  };
}

export function compilePageFamilySkinBehaviorContract(input: {
  projectId: string;
  pageId: string;
  parentPageRole: string;
  sourceViewportFamilyId: string;
  experienceContract: PageExperienceExpressionContract;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  functionContract: PageFunctionContract;
  componentMap: PageFamilyComponentExpressionMap;
}): PageFamilySkinBehaviorContract {
  const review = buildPageSystemReviewModel(input.projectId, input.pageId, 'MOBILE');
  const rules = inheritanceRules();
  const tokens = shellTokensFromSkin(input.skinContract, input.cgptBrief);

  const responsiveInheritance: PageFamilyResponsiveInheritance = {
    mobile: [
      'Primary hierarchy from approved mobile authority',
      'Overlays: sheet-first per experience expression',
      ...input.experienceContract.overlayPatterns.slice(0, 3),
    ],
    tablet: [
      'Interpretation inherits mobile DNA — not a generic scaled layout',
      'Split columns allowed when experience expression permits',
    ],
    desktop: [
      'Width exploitation with same typography/material tokens',
      'Inspector rails and multi-column summaries allowed',
    ],
  };

  return {
    contractId: `pfsbc-${input.sourceViewportFamilyId}-${Date.now()}`,
    version: `v1-${input.skinContract.version}`,
    projectId: input.projectId,
    pageId: input.pageId,
    sourceViewportFamilyId: input.sourceViewportFamilyId,
    sourceExperienceExpressionId: input.experienceContract.contractId,
    sourceSkinVersion: input.skinContract.version,
    sourceCgptBriefId: input.cgptBrief.briefId,
    parentPageRole: input.parentPageRole,
    pageSystemReviewSnapshot: reviewSnapshot(review),
    visualDna: [
      `typography: ${input.cgptBrief.typographyStrategy}`,
      `composition: ${input.cgptBrief.compositionStrategy}`,
      `hierarchy: ${input.cgptBrief.hierarchyStrategy}`,
      `material: ${input.cgptBrief.materialStrategy}`,
      `color: ${input.cgptBrief.colorStrategy}`,
      `interaction: ${input.cgptBrief.interactionCharacter}`,
    ],
    shellGeometry: [
      'parent shell',
      'child shell',
      'grandchild shell',
      'list shell',
      'detail shell',
      'editor shell',
      'inspector shell',
      'full-screen shell',
    ],
    navigationBehavior: [
      'breadcrumbs + nested page title hierarchy',
      'local subnav + secondary navigation',
      'contextual back behavior',
      'mobile/tablet/desktop navigation transformations share one family language',
      `function regions: ${input.functionContract.regions.join(' · ')}`,
    ],
    internalSurfaces: [
      'cards',
      'panels',
      'tables',
      'grids',
      'lists',
      'timelines',
      'galleries',
      'empty/loading/error/confirmation states inherit family tokens',
    ],
    overlayBehavior: input.experienceContract.overlayPatterns,
    responsiveInheritance,
    inheritanceRules: rules,
    shellTokens: tokens,
    forbiddenGenericFallbacks: FORBIDDEN_FALLBACKS,
    componentExpressionMapId: input.componentMap.mapId,
    designDivergenceRules: rules,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };
}

export function createOpusRepresentativeShellSet(contractId: string): OpusRepresentativeShellSet {
  const kinds: OpusRepresentativeShellKind[] = [
    'PARENT',
    'CHILD_LIST',
    'CHILD_DETAIL',
    'GRANDCHILD_DETAIL',
    'DRAWER_INSPECTOR',
    'MODAL_CONFIRMATION',
    'MOBILE_NAV',
    'TABLET_NAV',
    'DESKTOP_NAV',
  ];
  const now = new Date().toISOString();
  return {
    setId: `oprss-${contractId.slice(-12)}-${Date.now()}`,
    contractId,
    targetSurface: 'TWIN',
    shells: kinds.map((kind) => ({
      shellId: `ops-${kind}-${Date.now()}`,
      kind,
      targetSurface: 'TWIN' as const,
      status: 'PENDING' as const,
      viewport:
        kind === 'MOBILE_NAV' ? 'MOBILE'
        : kind === 'TABLET_NAV' ? 'TABLET'
        : kind === 'DESKTOP_NAV' ? 'DESKTOP'
        : 'ALL',
    })),
    createdAt: now,
    readyAt: null,
  };
}

export function markOpusRepresentativeShellsReady(set: OpusRepresentativeShellSet): OpusRepresentativeShellSet {
  return {
    ...set,
    readyAt: new Date().toISOString(),
    shells: set.shells.map((s) => ({ ...s, status: 'READY' as const })),
  };
}

export function compilePageFamilyContractBundle(input: {
  projectId: string;
  pageId: string;
  parentPageRole: string;
  sourceViewportFamilyId: string;
  experienceContract: PageExperienceExpressionContract;
  skinContract: ProjectSkinContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  functionContract: PageFunctionContract;
}): {
  componentMap: PageFamilyComponentExpressionMap;
  contract: PageFamilySkinBehaviorContract;
  representativeShellSet: OpusRepresentativeShellSet;
} {
  const componentMap = compilePageFamilyComponentExpressionMap({
    projectId: input.projectId,
    pageId: input.pageId,
    skinContract: input.skinContract,
    experienceContract: input.experienceContract,
  });
  const contract = compilePageFamilySkinBehaviorContract({
    ...input,
    componentMap,
  });
  const representativeShellSet = createOpusRepresentativeShellSet(contract.contractId);
  return { componentMap, contract, representativeShellSet };
}
