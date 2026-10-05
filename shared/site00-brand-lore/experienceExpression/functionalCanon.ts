/**
 * NDXBOOK project functional canon — extracted from actual routes and project-home implementation.
 */

import { SITE00_ROUTES } from '../../../src/site00/config/routes.js';
import type { ExperienceFunctionalCanon, ExperienceFunctionalCanonItem } from './types.js';

const NDXBOOK_PROJECT_ROUTES = [
  '/projects/ndxbook',
  '/projects/ndxbook/creative-direction',
  '/projects/ndxbook/calibrate',
  '/projects/ndxbook/creative-appetite',
  '/projects/ndxbook/personality-replay',
  '/projects/ndxbook/personality-replay/consistency',
  '/projects/ndxbook/canonical-creative-range',
  '/projects/ndxbook/canonical-carousel-expansion',
  '/projects/ndxbook/experiment-d-concept-territory',
  '/projects/ndxbook/experience-expression',
  '/projects/ndxbook/content-library',
  '/projects/ndxbook/connections',
];

function item(
  partial: Omit<ExperienceFunctionalCanonItem, 'id'> & { id: string },
): ExperienceFunctionalCanonItem {
  return partial;
}

export function extractNdxbookFunctionalCanon(projectSlug = 'ndxbook'): ExperienceFunctionalCanon {
  const items: ExperienceFunctionalCanonItem[] = [
    item({
      id: 'route-project-home',
      label: 'Project home',
      classification: 'REQUIRED_NAVIGATION',
      businessPurpose: 'Founder command center for project status',
      founderTask: 'Understand project state and navigate to work',
      stateDependency: 'project record',
      dataSource: 'site00_projects index',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/ndxbook',
    }),
    item({
      id: 'route-creative-direction',
      label: 'Creative direction review',
      classification: 'REQUIRED_NAVIGATION',
      businessPurpose: 'Core direction and territory review',
      founderTask: 'Review and decide creative direction',
      stateDependency: 'creative direction engagement',
      dataSource: 'engagementService',
      mutationRisk: 'LOW',
      canPresentationChange: true,
      route: '/projects/ndxbook/creative-direction',
    }),
    item({
      id: 'action-review-creative-direction',
      label: 'REVIEW CREATIVE DIRECTION',
      classification: 'REQUIRED_FUNCTION',
      businessPurpose: 'Primary creative workflow entry',
      founderTask: 'Open creative direction experience',
      stateDependency: 'creativeDirection.route',
      dataSource: 'ProjectDetailPage',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/ndxbook/creative-direction',
    }),
    item({
      id: 'section-overview-grid',
      label: 'Overview / Intelligence / Evolve / Creative / Commercial / Production / Channels / Command sections',
      classification: 'REQUIRED_INFORMATION',
      businessPurpose: 'Expose structured project intelligence',
      founderTask: 'Scan project metadata and status',
      stateDependency: 'project detail payload',
      dataSource: 'projectsIndexContract',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/ndxbook',
    }),
    item({
      id: 'presentation-section-cards',
      label: 'Equal-weight bordered section cards',
      classification: 'LEGACY_PRESENTATION',
      businessPurpose: 'Group related fields',
      founderTask: 'Read labeled rows in grid',
      stateDependency: null,
      dataSource: 'site00-project-command__section',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/ndxbook',
    }),
    item({
      id: 'row-label-value',
      label: 'Label + value rows',
      classification: 'LEGACY_PRESENTATION',
      businessPurpose: 'Display scalar project fields',
      founderTask: 'Read individual data points',
      stateDependency: null,
      dataSource: 'site00-project-command__row',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/ndxbook',
    }),
    item({
      id: 'command-queue',
      label: 'Decisions / Command list',
      classification: 'REQUIRED_INFORMATION',
      businessPurpose: 'Surface founder tasks and blockers',
      founderTask: 'Act on focus / needs-you / blocked items',
      stateDependency: 'project.command',
      dataSource: 'projectsIndexContract',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/ndxbook',
    }),
    item({
      id: 'experiment-d-link',
      label: 'Experiment D concept territory',
      classification: 'REQUIRED_NAVIGATION',
      businessPurpose: 'Six-concept hero range validation',
      founderTask: 'Review concept territories and heroes',
      stateDependency: 'experiment D run',
      dataSource: 'experimentDService',
      mutationRisk: 'LOW',
      canPresentationChange: true,
      route: '/projects/ndxbook/experiment-d-concept-territory',
    }),
    item({
      id: 'experiment-e-link',
      label: 'Experiment E experience expression',
      classification: 'REQUIRED_NAVIGATION',
      businessPurpose: 'Interactive experience direction from Concept Territory',
      founderTask: 'Review experience concepts and visual development',
      stateDependency: 'experiment E run',
      dataSource: 'experimentEService',
      mutationRisk: 'LOW',
      canPresentationChange: true,
      route: '/projects/ndxbook/experience-expression',
    }),
    item({
      id: 'content-library',
      label: 'Content library',
      classification: 'REQUIRED_NAVIGATION',
      businessPurpose: 'Creative asset lineage review',
      founderTask: 'Inspect and judge generated assets',
      stateDependency: 'lineage library',
      dataSource: 'creativeLineageService',
      mutationRisk: 'LOW',
      canPresentationChange: true,
      route: '/projects/ndxbook/content-library',
    }),
    item({
      id: 'page001-gate',
      label: 'Page 001 production gate',
      classification: 'REQUIRED_INFORMATION',
      businessPurpose: 'Publishing eligibility signal',
      founderTask: 'Know if production can start',
      stateDependency: 'page001Gate',
      dataSource: 'engagementService',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/ndxbook',
    }),
  ];

  return {
    version: 1,
    projectSlug,
    routes: NDXBOOK_PROJECT_ROUTES,
    navigation: [
      'projects index',
      'project home',
      'creative direction',
      'calibration',
      'creative appetite',
      'personality replay',
      'canonical creative range',
      'carousel expansion',
      'experiment d',
      'experiment e',
      'content library',
      'connections',
    ],
    actions: items.filter((i) => i.classification === 'REQUIRED_FUNCTION').map((i) => i.label),
    states: [
      'lifecycle',
      'founder decision',
      'visual DNA',
      'territories generated',
      'page001 gate',
      'launch state',
      'publishing',
      'command categories',
    ],
    items,
    extractedAt: new Date().toISOString(),
  };
}

export function functionalRoutesPreserved(canon: ExperienceFunctionalCanon): boolean {
  return canon.routes.includes('/projects/ndxbook') && canon.routes.length >= 5;
}

export function functionalActionsPreserved(canon: ExperienceFunctionalCanon): boolean {
  return canon.actions.some((a) => a.toLowerCase().includes('creative direction'));
}

/** Guard: host routes from SITE00_ROUTES remain addressable. */
export function hostRoutesRegistry(): string[] {
  return Object.values(SITE00_ROUTES).filter((v) => typeof v === 'string') as string[];
}
