/**
 * P0.VR.NDXBOOK-WEB-EXPRESSION-TERRITORIES-AND-ROUTE-CONTEXT-FIX1
 * Authoring (Design workspace) vs target product page route contracts.
 */

import { getDesignBoundPage } from '../designProjectBinding/designPageRegistry.js';
import type { PageCreativeContext, PageFunctionContract } from './types.js';

export type PageConceptTargetRouteContract = {
  targetProductArea: 'PROJECTS';
  targetProject: string;
  targetPage: string;
  targetRoute: string;
  /** Human label e.g. PROJECTS > NDXBOOK > OVERVIEW */
  targetRouteLabel: string;
  authoringContext: 'DESIGN_WORKSPACE';
  authoringRoute: string;
  /** GPT2 outputs must never render authoring chrome as the page being designed. */
  authoringContextInTargetOutput: false;
};

export function resolveAuthoringDesignWorkspaceRoute(projectId: string): string {
  return `/projects/${projectId.toLowerCase()}/design/twin-opus-direct`;
}

export function resolvePageConceptTargetRouteContract(input: {
  projectId: string;
  pageId: string;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
}): PageConceptTargetRouteContract {
  const bound = getDesignBoundPage(input.projectId, input.pageId);
  const targetRoute = input.functionContract.route || input.pageContext.route || bound?.route || '';
  const targetProject = input.projectId.toUpperCase();
  const targetPage = (bound?.pageName ?? input.pageContext.pageName).toUpperCase();
  const targetRouteLabel = `PROJECTS > ${targetProject} > ${targetPage}`;

  return {
    targetProductArea: 'PROJECTS',
    targetProject,
    targetPage,
    targetRoute,
    targetRouteLabel,
    authoringContext: 'DESIGN_WORKSPACE',
    authoringRoute: resolveAuthoringDesignWorkspaceRoute(input.projectId),
    authoringContextInTargetOutput: false,
  };
}

export function buildGpt2TargetRouteContextBlock(contract: PageConceptTargetRouteContract): string {
  return [
    'TARGET PAGE CONTEXT (PRODUCT — NOT AUTHORING):',
    `YOU ARE NOT DESIGNING THE SITE 00 DESIGN WORKSPACE.`,
    `THE DESIGN WORKSPACE (${contract.authoringRoute}) IS ONLY WHERE THIS CONCEPT IS CREATED AND REVIEWED.`,
    `YOU ARE DESIGNING THE ACTUAL ${contract.targetProject} ${contract.targetPage} PAGE INSIDE THE PROJECTS PRODUCT EXPERIENCE.`,
    '',
    'TARGET EXPERIENCE:',
    'SITE 00 → PROJECTS → ' + contract.targetProject + ' → ' + contract.targetPage,
    `CANONICAL TARGET ROUTE: ${contract.targetRoute}`,
    `TARGET ROUTE LABEL: ${contract.targetRouteLabel}`,
    '',
    'FORBIDDEN IN GENERATED PAGE UI:',
    '- DESIGN WORKSPACE breadcrumbs (PROJECTS > DESIGN > …)',
    '- Page Concept Generator / GPT2 review chrome',
    '- Twin-opus-direct authoring panels',
    '- Design bench candidate gallery as page content',
    '',
    `AUTHORING CONTEXT IN OUTPUT: ${contract.authoringContextInTargetOutput ? 'YES' : 'NO'}`,
  ].join('\n');
}

export function targetRouteExcludesDesignWorkspace(contract: PageConceptTargetRouteContract): boolean {
  const label = contract.targetRouteLabel.toUpperCase();
  return !label.includes('> DESIGN >') && !label.includes('DESIGN WORKSPACE');
}
