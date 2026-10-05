import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import { buildNdxbookProjectCreativeContextPackage } from './ndxbookProjectCreativeContext.js';
import type { ProjectCreativeContextPackage } from './types.js';

export function loadProjectCreativeContextPackage(projectId: string): ProjectCreativeContextPackage {
  const id = projectId.toLowerCase();
  if (id === DESIGN_PAGE_V3_PILOT_PROJECT_ID) {
    return buildNdxbookProjectCreativeContextPackage();
  }
  throw new Error(`PROJECT_CREATIVE_CONTEXT_INCOMPLETE: no creative context package for project ${projectId}`);
}
