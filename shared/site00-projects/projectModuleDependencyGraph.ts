/**
 * B5.9R1 — Module dependency relationships across the project operating system.
 */

import type { ProjectModuleId } from './projectModules.js';

export type ModuleDependencyRelation =
  | 'PROVIDES_AUTHORITY_TO'
  | 'DEPENDS_ON'
  | 'OPTIONALLY_INFORMS'
  | 'BLOCKS';

export type ModuleDependencyEdge = {
  from: ProjectModuleId;
  to: ProjectModuleId;
  relation: ModuleDependencyRelation;
  description: string;
};

export const PROJECT_MODULE_DEPENDENCY_GRAPH: ModuleDependencyEdge[] = [
  {
    from: 'IDENTITY',
    to: 'BUILDER',
    relation: 'PROVIDES_AUTHORITY_TO',
    description: 'Brand truth and visual DNA inform site construction decisions.',
  },
  {
    from: 'IDENTITY',
    to: 'EVOLVE',
    relation: 'PROVIDES_AUTHORITY_TO',
    description: 'Brand voice and territories inform campaign and content work.',
  },
  {
    from: 'BUILDER',
    to: 'PRODUCTION',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Build progress and QA status inform launch readiness.',
  },
  {
    from: 'EVOLVE',
    to: 'REVIEWS',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Campaign packages and copy may require founder/client review.',
  },
  {
    from: 'IDENTITY',
    to: 'REVIEWS',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Brand territories and bible drafts may require approval.',
  },
  {
    from: 'BUILDER',
    to: 'REVIEWS',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Page and route QA may require review gates.',
  },
  {
    from: 'PRODUCTION',
    to: 'REVIEWS',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Launch checklist items may block release until approved.',
  },
  {
    from: 'IDENTITY',
    to: 'LIBRARY',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Identity assets aggregate into project library.',
  },
  {
    from: 'BUILDER',
    to: 'LIBRARY',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Website assets aggregate into project library.',
  },
  {
    from: 'EVOLVE',
    to: 'LIBRARY',
    relation: 'OPTIONALLY_INFORMS',
    description: 'Campaign assets aggregate into project library.',
  },
];

export function getModuleDependencies(moduleId: ProjectModuleId): ModuleDependencyEdge[] {
  return PROJECT_MODULE_DEPENDENCY_GRAPH.filter((e) => e.from === moduleId || e.to === moduleId);
}

export function modulesThatProvideAuthorityTo(target: ProjectModuleId): ProjectModuleId[] {
  return PROJECT_MODULE_DEPENDENCY_GRAPH.filter(
    (e) => e.to === target && e.relation === 'PROVIDES_AUTHORITY_TO',
  ).map((e) => e.from);
}

export function modulesBlockedBy(source: ProjectModuleId): ProjectModuleId[] {
  return PROJECT_MODULE_DEPENDENCY_GRAPH.filter(
    (e) => e.from === source && e.relation === 'BLOCKS',
  ).map((e) => e.to);
}
