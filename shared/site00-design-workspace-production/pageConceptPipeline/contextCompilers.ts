import { buildDesignProjectIntelligence } from '../designProjectBinding/projectIntelligence.js';
import { getDesignBoundPage } from '../designProjectBinding/designPageRegistry.js';
import { listCampaignEntriesForProject } from '../designProjectBinding/designPageConceptModel.js';
import { loadPageCaptureHistory } from '../designPageCapture.js';
import type { PageCreativeContext, ProjectCreativeContext } from './types.js';

export function compileProjectCreativeContext(projectId: string): ProjectCreativeContext | null {
  const intel = buildDesignProjectIntelligence(projectId);
  if (!intel) return null;

  const campaigns = listCampaignEntriesForProject(projectId).map((e) => e.title);

  return {
    projectId,
    brandTruth: intel.brandExpression,
    projectPurpose: intel.description,
    audience: intel.projectType,
    brandPersonality: intel.primaryCreativeStream,
    tone: intel.brandExpression,
    creativeAppetite: 'Editorial-forward within SITE 00 host firewall',
    designLanguage: intel.brandExpression,
    typography: 'Project design system tokens',
    palette: intel.brandExpression,
    materials: 'Host chrome + project accent surfaces',
    imagery: 'Authority references + campaign provenance',
    iconography: 'SITE 00 icon registry',
    compositionRules: 'Hierarchy-first · evidence-forward panels',
    projectLore: campaigns.join(' · ') || 'Project lore stream',
    projectConstraints: 'No route or persistence mutation from creative layer',
    forbiddenPatterns: 'Raster cheat · provider bypass · cross-project bleed',
    currentVisualSystem: intel.primaryCreativeStream,
    approvedReferences: [],
    projectAssets: [],
    contextVersion: `proj-${intel.pageRegistryId}`,
  };
}

export function compilePageCreativeContext(projectId: string, pageId: string): PageCreativeContext | null {
  const page = getDesignBoundPage(projectId, pageId);
  const project = compileProjectCreativeContext(projectId);
  if (!page || !project) return null;

  const mobileCap = loadPageCaptureHistory(projectId, pageId, 'MOBILE').latest;
  const desktopCap = loadPageCaptureHistory(projectId, pageId, 'DESKTOP').latest;
  const captureSummary =
    mobileCap && desktopCap ?
      `Mobile ${mobileCap.captureId} · Desktop ${desktopCap.captureId}`
    : mobileCap ? `Mobile only ${mobileCap.captureId}`
    : desktopCap ? `Desktop only ${desktopCap.captureId}`
    : 'No captures';

  return {
    pageId: page.pageId,
    projectId,
    pageName: page.pageName,
    route: page.route,
    pageRole: page.pageRole,
    parentPageId: page.parentPageId,
    childPageIds: page.childPageIds,
    purpose: `${page.pageRole} — ${page.pageName}`,
    requiredContent: [page.pageName, page.screenId, page.route],
    functionalRequirements: [page.pageRole, page.interactionContractVersion ?? 'contract-pending'],
    interactionContract: [page.interactionContractVersion ?? 'unassigned'],
    existingImplementation: page.route,
    currentCaptureSummary: captureSummary,
    existingReferences: [
      page.mobilePreviewUrl ?? '',
      page.desktopPreviewUrl ?? '',
    ].filter(Boolean),
    inheritance: page.parentPageId ? 'INHERITED' : 'NEW',
    overrides: [],
    creativeLatitude: 'Visual shell and hierarchy within immutable function contract',
    responsiveRequirements: ['MOBILE', 'DESKTOP'],
    stage: page.designStatus,
    readiness: page.authorityStatus,
    contextVersion: `page-${page.pageId}-${page.designStatus}`,
  };
}
