/**
 * Design workspace pilot linkage registries — MORE, PAGES, ASSETS, SKINS, future-site.
 */

import {
  ASSETS_WIZARD_STEPS,
  MORE_CATEGORIES,
  PAGES_WIZARD_STEPS,
  SKINS_WIZARD_STEPS,
} from '../../visualReconstruction/p0vr8r3r1/designWizardSteps.js';
import type { DeclaredParentAction, LinkageAuditInput } from './types.js';

export function designWorkspaceBaseRoute(projectSlug: string): string {
  return `/projects/${projectSlug}/design`;
}

export function buildMoreHubLinkageAudit(projectSlug: string): LinkageAuditInput {
  const base = designWorkspaceBaseRoute(projectSlug);
  const parentRoute = `${base}?tab=MORE&moreCategory=landing`;

  const tileActions: DeclaredParentAction[] = (
    ['system', 'providers', 'capture', 'route-audit', 'storage', 'automation', 'presets'] as const
  ).map((category) => ({
    elementId: `more-tile-${category}`,
    label: category.toUpperCase().replace('-', ' '),
    elementType: 'TILE' as const,
    targetCategory: category,
    sourceType: 'setTab' as const,
    handlerRef: 'DesignMoreSystemHub.onSelectCategory',
    relationship: 'TAB_CHILD' as const,
    returnTarget: parentRoute,
    returnLabel: 'BACK TO SYSTEM & SETTINGS',
    preserveState: ['selectedProject', 'viewport', 'moreCategory'],
  }));

  const recommendedCapture: DeclaredParentAction = {
    elementId: 'more-recommended-capture',
    label: 'OPEN CAPTURE',
    elementType: 'CTA',
    targetCategory: 'capture',
    sourceType: 'setTab',
    handlerRef: 'DesignMoreSystemHub.recommendedCapture',
    relationship: 'TAB_CHILD',
    returnTarget: parentRoute,
    returnLabel: 'BACK TO SYSTEM & SETTINGS',
  };

  const existingRoutes = MORE_CATEGORIES.map(
    (c) => `${base}?tab=MORE&moreCategory=${c}`,
  );
  const existingSurfaces = MORE_CATEGORIES.map((c) => `surface-more-${c}-${projectSlug}`);

  return {
    projectId: projectSlug,
    parentRoute,
    parentSurfaceId: `dw-more-hub-${projectSlug}`,
    parentFamily: 'MORE',
    declaredActions: [...tileActions, recommendedCapture],
    existingRoutes,
    existingSurfaces,
    routerManifestRoutes: existingRoutes,
  };
}

export function buildMoreCaptureGrandchildChain(projectSlug: string): DeclaredParentAction[] {
  const base = designWorkspaceBaseRoute(projectSlug);
  const captureRoute = `${base}?tab=MORE&moreCategory=capture`;
  return [
    {
      elementId: 'capture-test-worker',
      label: 'TEST WORKER',
      elementType: 'BUTTON',
      targetRoute: `${base}?tab=PAGES&pagesStep=test-worker`,
      sourceType: 'dispatchAction',
      handlerRef: 'DesignCaptureOrchestrationInspector.testWorker',
      relationship: 'GRANDCHILD',
      navigationMode: 'WORKFLOW_STEP',
      returnTarget: captureRoute,
      returnLabel: 'BACK TO CAPTURE',
    },
    {
      elementId: 'capture-view-details',
      label: 'VIEW DETAILS',
      elementType: 'BUTTON',
      sourceType: 'openDrawer',
      handlerRef: 'DesignCaptureOrchestrationInspector.viewDetails',
      relationship: 'WORKFLOW_CHILD',
      navigationMode: 'DRAWER',
      returnTarget: captureRoute,
      returnLabel: 'BACK TO CAPTURE',
    },
  ];
}

export function buildPagesWizardLinkageAudit(projectSlug: string): LinkageAuditInput {
  const base = designWorkspaceBaseRoute(projectSlug);
  const parentRoute = `${base}?tab=PAGES&pagesStep=landing`;

  const stepFlow: Array<{ step: (typeof PAGES_WIZARD_STEPS)[number]; label: string; prev: string }> = [
    { step: 'service-check', label: 'START SERVICE CHECK', prev: 'landing' },
    { step: 'test-worker', label: 'TEST WORKER', prev: 'service-check' },
    { step: 'capture-setup', label: 'CAPTURE PROJECT', prev: 'test-worker' },
    { step: 'capture-running', label: 'CAPTURE RUNNING', prev: 'capture-setup' },
    { step: 'capture-results', label: 'VIEW RESULTS', prev: 'capture-running' },
    { step: 'library', label: 'PAGE LIBRARY', prev: 'capture-results' },
    { step: 'detail', label: 'PAGE DETAIL', prev: 'library' },
    { step: 'compare', label: 'COMPARE', prev: 'detail' },
  ];

  const actions: DeclaredParentAction[] = stepFlow.map((s) => ({
    elementId: `pages-${s.step}`,
    label: s.label,
    elementType: 'BUTTON',
    targetStep: s.step,
    sourceType: 'setWizardStep',
    handlerRef: 'DesignPagesWizard.advance',
    relationship: s.step === 'detail' || s.step === 'compare' ? 'DETAIL_CHILD' : 'WORKFLOW_CHILD',
    navigationMode: 'WORKFLOW_STEP',
    returnTarget: `${base}?tab=PAGES&pagesStep=${s.prev}`,
    returnLabel: 'BACK',
    preserveState: ['selectedProject', 'viewport', 'pagesStep', 'pageId'],
  }));

  const existingRoutes = PAGES_WIZARD_STEPS.map((step) => `${base}?tab=PAGES&pagesStep=${step}`);

  return {
    projectId: projectSlug,
    parentRoute,
    parentSurfaceId: `dw-pages-${projectSlug}`,
    parentFamily: 'PAGES',
    declaredActions: actions,
    existingRoutes,
    existingSurfaces: PAGES_WIZARD_STEPS.map((s) => `surface-pages-${s}-${projectSlug}`),
    routerManifestRoutes: existingRoutes,
  };
}

export function buildAssetsWizardLinkageAudit(projectSlug: string): LinkageAuditInput {
  const base = designWorkspaceBaseRoute(projectSlug);
  const parentRoute = `${base}?tab=ASSETS&assetStep=UPLOAD`;

  const actions: DeclaredParentAction[] = ASSETS_WIZARD_STEPS.slice(0, -1).map((step, idx) => ({
    elementId: `assets-${step}`,
    label: `NEXT ${ASSETS_WIZARD_STEPS[idx + 1]}`,
    elementType: 'BUTTON',
    targetStep: ASSETS_WIZARD_STEPS[idx + 1],
    sourceType: 'setWizardStep',
    handlerRef: 'DesignAssetsWizard.advance',
    relationship: 'WORKFLOW_CHILD',
    navigationMode: 'WORKFLOW_STEP',
    returnTarget: `${base}?tab=ASSETS&assetStep=${step}`,
    returnLabel: 'BACK',
  }));

  const existingRoutes = ASSETS_WIZARD_STEPS.map((step) => `${base}?tab=ASSETS&assetStep=${step}`);

  return {
    projectId: projectSlug,
    parentRoute,
    parentSurfaceId: `dw-assets-${projectSlug}`,
    parentFamily: 'ASSETS',
    declaredActions: actions,
    existingRoutes,
    existingSurfaces: ASSETS_WIZARD_STEPS.map((s) => `surface-assets-${s}-${projectSlug}`),
    routerManifestRoutes: existingRoutes,
  };
}

export function buildSkinsWizardLinkageAudit(projectSlug: string): LinkageAuditInput {
  const base = designWorkspaceBaseRoute(projectSlug);
  const parentRoute = `${base}?tab=SKINS&skinsStep=family`;

  const actions: DeclaredParentAction[] = SKINS_WIZARD_STEPS.slice(0, -1).map((step, idx) => ({
    elementId: `skins-${step}`,
    label: `NEXT ${SKINS_WIZARD_STEPS[idx + 1]}`,
    elementType: 'BUTTON',
    targetStep: SKINS_WIZARD_STEPS[idx + 1],
    sourceType: 'setWizardStep',
    handlerRef: 'DesignSkinsWizard.advance',
    relationship: 'WORKFLOW_CHILD',
    navigationMode: 'WORKFLOW_STEP',
    returnTarget: `${base}?tab=SKINS&skinsStep=${step}`,
    returnLabel: 'BACK',
  }));

  const existingRoutes = SKINS_WIZARD_STEPS.map((step) => `${base}?tab=SKINS&skinsStep=${step}`);

  return {
    projectId: projectSlug,
    parentRoute,
    parentSurfaceId: `dw-skins-${projectSlug}`,
    parentFamily: 'SKINS',
    declaredActions: actions,
    existingRoutes,
    existingSurfaces: SKINS_WIZARD_STEPS.map((s) => `surface-skins-${s}-${projectSlug}`),
    routerManifestRoutes: existingRoutes,
  };
}

export function buildFutureSitePilotLinkageAudit(): LinkageAuditInput {
  return {
    projectId: 'future-site',
    parentRoute: '/home',
    parentSurfaceId: 'future-home',
    parentFamily: 'FUTURE_SITE',
    declaredActions: [
      {
        elementId: 'home-services-cta',
        label: 'SERVICES',
        elementType: 'CTA',
        targetRoute: '/services',
        sourceType: 'navigate',
        handlerRef: 'HomePage.servicesCta',
        relationship: 'DIRECT_CHILD',
        returnTarget: '/home',
        returnLabel: 'BACK HOME',
      },
      {
        elementId: 'services-detail',
        label: 'VIEW SERVICE',
        elementType: 'ROW',
        targetRoute: '/services/:serviceId',
        sourceType: 'navigate',
        handlerRef: 'ServicesPage.openDetail',
        relationship: 'DIRECT_CHILD',
        returnTarget: '/services',
        returnLabel: 'BACK TO SERVICES',
      },
      {
        elementId: 'service-booking',
        label: 'BOOK NOW',
        elementType: 'BUTTON',
        targetRoute: '/services/:serviceId/booking',
        sourceType: 'navigate',
        handlerRef: 'ServiceDetailPage.booking',
        relationship: 'GRANDCHILD',
        returnTarget: '/services/:serviceId',
        returnLabel: 'BACK TO SERVICE',
      },
    ],
    existingRoutes: ['/home', '/services', '/services/:serviceId', '/services/:serviceId/booking'],
    existingSurfaces: ['future-home', 'future-services', 'future-service-detail', 'future-booking'],
    routerManifestRoutes: ['/home', '/services', '/services/:serviceId', '/services/:serviceId/booking'],
  };
}

export function buildMoreCaptureChildLinkageAudit(projectSlug: string): LinkageAuditInput {
  const base = designWorkspaceBaseRoute(projectSlug);
  const parentRoute = `${base}?tab=MORE&moreCategory=capture`;
  return {
    projectId: projectSlug,
    parentRoute,
    parentSurfaceId: `dw-more-capture-${projectSlug}`,
    parentFamily: 'MORE_CAPTURE',
    declaredActions: buildMoreCaptureGrandchildChain(projectSlug),
    existingRoutes: [
      parentRoute,
      `${base}?tab=PAGES&pagesStep=test-worker`,
    ],
    existingSurfaces: [`dw-more-capture-${projectSlug}`, `surface-capture-test-worker-${projectSlug}`],
    routerManifestRoutes: [parentRoute, `${base}?tab=PAGES&pagesStep=test-worker`],
  };
}

export function buildSiteWideDesignWorkspaceLinkageAudits(projectSlug: string): LinkageAuditInput[] {
  return [
    buildMoreHubLinkageAudit(projectSlug),
    buildMoreCaptureChildLinkageAudit(projectSlug),
    buildPagesWizardLinkageAudit(projectSlug),
    buildAssetsWizardLinkageAudit(projectSlug),
    buildSkinsWizardLinkageAudit(projectSlug),
    buildFutureSitePilotLinkageAudit(),
  ];
}
