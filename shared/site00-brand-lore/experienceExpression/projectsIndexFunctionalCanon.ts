/**
 * SITE 00 Projects Index functional canon — extracted from actual /projects route.
 */

import { SITE00_ROUTES } from '../../../src/site00/config/routes.js';
import type { ExperienceFunctionalCanon, ExperienceFunctionalCanonItem } from './types.js';

function item(partial: ExperienceFunctionalCanonItem): ExperienceFunctionalCanonItem {
  return partial;
}

export function extractSite00ProjectsIndexFunctionalCanon(): ExperienceFunctionalCanon {
  const items: ExperienceFunctionalCanonItem[] = [
    item({
      id: 'route-projects-index',
      label: 'Projects index',
      classification: 'REQUIRED_NAVIGATION',
      businessPurpose: 'Universal SITE 00 project entry and work overview',
      founderTask: 'See what is being worked on and enter projects',
      stateDependency: 'projects index payload',
      dataSource: 'site00ProjectsApi.index',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: SITE00_ROUTES.projects,
    }),
    item({
      id: 'project-list',
      label: 'Project list with phase and focus',
      classification: 'REQUIRED_INFORMATION',
      businessPurpose: 'Show active founder and client projects',
      founderTask: 'Identify current phase and focus per project',
      stateDependency: 'project index entries',
      dataSource: 'projectsIndexContract',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: SITE00_ROUTES.projects,
    }),
    item({
      id: 'project-search',
      label: 'Project search',
      classification: 'REQUIRED_FUNCTION',
      businessPurpose: 'Filter projects by name/slug',
      founderTask: 'Find a project quickly',
      stateDependency: null,
      dataSource: 'ProjectsPage search field',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: SITE00_ROUTES.projects,
    }),
    item({
      id: 'project-entry',
      label: 'Open project',
      classification: 'REQUIRED_NAVIGATION',
      businessPurpose: 'Navigate to project detail/home',
      founderTask: 'Enter project workspace',
      stateDependency: 'project.detailRoute',
      dataSource: 'projectsIndexContract',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: '/projects/:projectSlug',
    }),
    item({
      id: 'client-studio-section',
      label: 'Client studio projects',
      classification: 'REQUIRED_INFORMATION',
      businessPurpose: 'Separate client studio engagements',
      founderTask: 'Access client studio environments',
      stateDependency: 'clientProjects payload',
      dataSource: 'projectsIndexContract',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: SITE00_ROUTES.projects,
    }),
    item({
      id: 'metrics-row',
      label: 'Index metrics (total, founder, client, source)',
      classification: 'OPTIONAL_PRESENTATION',
      businessPurpose: 'Summary counts',
      founderTask: 'Scan portfolio scale',
      stateDependency: 'summary payload',
      dataSource: 'ProjectsPage metrics',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: SITE00_ROUTES.projects,
    }),
    item({
      id: 'legacy-flat-cards',
      label: 'Flat project index cards',
      classification: 'LEGACY_PRESENTATION',
      businessPurpose: 'List projects as bordered records',
      founderTask: 'Read scalar metadata rows',
      stateDependency: null,
      dataSource: 'site00-project-index-card',
      mutationRisk: 'NONE',
      canPresentationChange: true,
      route: SITE00_ROUTES.projects,
    }),
  ];

  return {
    version: 1,
    projectSlug: 'site00',
    routes: [SITE00_ROUTES.projects],
    navigation: ['PROJECTS ecosystem nav', 'Open project', 'Client studio'],
    actions: ['Search projects', 'Open project', 'Retry on error'],
    states: ['loading', 'ready', 'partial', 'error'],
    items,
    extractedAt: new Date().toISOString(),
  };
}
