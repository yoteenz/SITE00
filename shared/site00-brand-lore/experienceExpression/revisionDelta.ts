/**
 * Experience Revision Delta — surgical correction input for future Composer implementation.
 */

import type { ExperienceConcept, ExperienceRevisionDelta } from './types.js';

export function buildExperienceRevisionDelta(params: {
  concept: ExperienceConcept;
  preserve?: string[];
  change?: string[];
  doNot?: string[];
}): ExperienceRevisionDelta {
  return {
    revisionId: `revision-${params.concept.experienceConceptId}-${Date.now()}`,
    experienceConceptId: params.concept.experienceConceptId,
    preserve: params.preserve ?? [
      'SITE 00 bottom navigation',
      'All project routes',
      'Current review actions',
      'Project phase state',
      `Selected Experience Concept: ${params.concept.name}`,
    ],
    change: params.change ?? [
      'Founder attention surface feels like conventional cards — reinterpret via experience metaphor',
    ],
    doNot: params.doNot ?? [
      'Remove information',
      'Change NDXBOOK concept territory',
      'Alter host navigation',
      'Restyle everything without contract',
    ],
    compiledAt: new Date().toISOString(),
  };
}
