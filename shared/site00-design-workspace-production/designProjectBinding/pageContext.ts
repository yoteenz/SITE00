/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — page-scoped context for DESIGN + future Opus contract.
 */

import { buildDesignProjectIntelligence } from './projectIntelligence.js';
import { getDesignBoundPage } from './designPageRegistry.js';
import {
  CREATIVE_LAYER_MODEL,
  listCampaignEntriesForProject,
  listPageConceptCandidates,
} from './designPageConceptModel.js';
import type { CompiledDesignPageContext, DesignPageInheritanceClass, OpusPageContextContract } from './types.js';

function inheritanceForPage(pageRole: string): DesignPageInheritanceClass {
  if (pageRole === 'PROJECT_OVERVIEW' || pageRole === 'PROJECT_HUB') return 'NEW';
  return 'INHERITED';
}

export function compileDesignPageContext(projectId: string, pageId: string): CompiledDesignPageContext | null {
  const page = getDesignBoundPage(projectId, pageId);
  const intel = buildDesignProjectIntelligence(projectId);
  if (!page || !intel) return null;

  return {
    activeModule: 'DESIGN',
    activeProjectId: projectId,
    activePageId: page.pageId,
    pageRole: page.pageRole,
    route: page.route,
    parentPageId: page.parentPageId,
    childPageIds: page.childPageIds,
    brandContext: intel.brandExpression,
    creativeContext: intel.primaryCreativeStream,
    functionalContext: `${page.pageRole} · ${page.route}`,
    currentAuthority: page.authorityStatus,
    interactionContract: page.interactionContractVersion ?? 'unassigned',
    assetAuthority: page.assetManifestVersion ?? 'unassigned',
    inheritance: inheritanceForPage(page.pageRole),
  };
}

export function buildOpusPageContextContract(projectId: string, pageId: string): OpusPageContextContract | null {
  const base = compileDesignPageContext(projectId, pageId);
  const page = getDesignBoundPage(projectId, pageId);
  const intel = buildDesignProjectIntelligence(projectId);
  if (!base || !page || !intel) return null;

  const concepts = listPageConceptCandidates(projectId, pageId);
  const selected = concepts.find((c) => c.status === 'SELECTED' || c.status === 'PROMOTED') ?? null;
  const campaignInputs = listCampaignEntriesForProject(projectId).map((e) => e.entryId);

  return {
    ...base,
    projectCanon: intel.description,
    pageContentSummary: `${page.pageName} (${page.screenId}) — ${page.pageRole}`,
    currentImplementationRoute: page.route,
    pageConceptCreativeLayer: CREATIVE_LAYER_MODEL,
    selectedPageConceptId: selected?.conceptId ?? null,
    selectedPageConceptTitle: selected?.conceptTitle ?? null,
    campaignContentInputs: campaignInputs,
  };
}
