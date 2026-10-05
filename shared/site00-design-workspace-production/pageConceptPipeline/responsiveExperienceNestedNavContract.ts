/**
 * P0.VR.NDXBOOK-OVERVIEW-FULL-EXPRESSION-COVERAGE-AND-EXPANDED-NAV-STATE1
 * Reusable hierarchical project navigation language for ResponsiveExperienceContract handoff.
 */

import type { ResponsiveExperienceRule } from './experienceExpressionAuthority.js';

export const NESTED_NAV_CONTRACT_VERSION = 'nested-nav-v1' as const;

export type NestedNavDisclosureState = 'COLLAPSED_PARENT' | 'EXPANDED_PARENT' | 'NESTED_DESTINATION';

export function buildNestedNavResponsiveExperienceRules(): readonly ResponsiveExperienceRule[] {
  return [
    {
      patternType: 'MENU',
      mobile:
        'COLLAPSED_PARENT: disclosure affordance (+ / chevron) on parent rows; EXPANDED_PARENT reveals NESTED_DESTINATION beneath Content Ops.',
      tablet: 'Side nav: expanded parent row + indented Campaign Board nested destination.',
      desktop: 'Nested destination selectable sub-row; never top-level sibling index.',
    },
  ];
}

export function nestedNavContractHandoffLines(): readonly string[] {
  return [
    'RESPONSIVE NESTED NAV CONTRACT:',
    '- COLLAPSED_PARENT: parent row shows disclosure affordance; child destinations hidden.',
    '- EXPANDED_PARENT: disclosure state changed; nested rows visible under parent.',
    '- NESTED_DESTINATION: grandchild (e.g. CAMPAIGN BOARD under CONTENT OPS) indented / hierarchy marker; selectable; not top-level numbered sibling.',
    '- MENU visual authority governs PRIMARY_NAV_EXPANSION and NESTED_NAV_EXPANSION together.',
  ];
}
