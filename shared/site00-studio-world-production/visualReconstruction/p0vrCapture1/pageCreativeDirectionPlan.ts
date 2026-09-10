/**
 * P0.VR.CAPTURE.1 — Creative direction plan from capture + parent authority.
 */

import type { PageCreativeDirectionPlan } from './types.js';

export function buildPageCreativeDirectionPlan(options: {
  pagePurpose: string;
  parentAuthorityLabel: string;
  childArchetype?: string | null;
  route: string;
}): PageCreativeDirectionPlan {
  const archetype = options.childArchetype ?? 'DERIVATIVE';
  return {
    pagePurpose: options.pagePurpose,
    experienceGoal: `Converge ${options.route} with ${options.parentAuthorityLabel} while preserving page function.`,
    parentAuthority: options.parentAuthorityLabel,
    visualDirection: 'Apply parent landing grammar — spacing, typography rhythm, and surface hierarchy.',
    compositionDirection: 'Lead with visual-first hero or task anchor; reduce admin-panel density.',
    hierarchyDirection: 'One primary action above the fold; secondary actions in supporting band.',
    interactionDirection: 'Preserve existing routes, forms, and stateful flows.',
    contentDensityDirection: 'Reduce text blocks; elevate scannable structure and branded motifs.',
    visualFirstOpportunities: ['Hero band', 'Primary CTA', 'Status chips', 'Section dividers'],
    primaryAction: 'Align layout and CTA language with parent authority',
    detailsToHide: ['Redundant meta labels', 'Generic SaaS chrome'],
    legacyComponentsToReplace: ['Generic card stacks', 'Unbranded table chrome'],
    preserveFunction: ['Routing', 'Auth gates', 'Forms', 'Data fetching', 'Business logic'],
    specializedChildRules: [`Child archetype: ${archetype}`, 'Inherit parent spacing tokens where safe'],
  };
}
