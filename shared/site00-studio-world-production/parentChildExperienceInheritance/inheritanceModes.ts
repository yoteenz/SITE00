/**
 * InheritanceMode rules — how children inherit parent experience authority.
 */

import type { ChildSurfaceArchetype, InheritanceMode } from './types.js';

export type InheritanceModeResolutionInput = {
  archetype: ChildSurfaceArchetype;
  isHostShell: boolean;
  exemptReason?: string;
  parentExperienceMode?: string;
};

export function resolveInheritanceMode(input: InheritanceModeResolutionInput): InheritanceMode {
  if (input.isHostShell) return 'HOST_LOCKED';
  if (input.exemptReason) return 'EXEMPT_WITH_REASON';

  switch (input.archetype) {
    case 'LANDING':
      return 'INHERIT_FULL';
    case 'LIST':
    case 'LIBRARY':
    case 'GALLERY':
    case 'STATUS':
      return 'INHERIT_GRAMMAR';
    case 'EDITOR':
    case 'WIZARD':
    case 'FULLSCREEN_TOOL':
    case 'WORKSPACE':
      return 'SPECIALIZED_CHILD';
    case 'FORM':
    case 'INTAKE':
    case 'DETAIL':
    case 'REVIEW':
    case 'COMPARISON':
    case 'SETTINGS':
    case 'OPERATIONS':
      return 'INHERIT_GRAMMAR';
    default:
      return 'INHERIT_GRAMMAR';
  }
}

export function inheritanceModeAllowsLayoutClone(mode: InheritanceMode): boolean {
  return mode === 'INHERIT_FULL';
}

export function inheritanceModeRequiresGrammarOnly(mode: InheritanceMode): boolean {
  return mode === 'INHERIT_GRAMMAR' || mode === 'SPECIALIZED_CHILD';
}

export function inheritanceModeSkipsTransform(mode: InheritanceMode): boolean {
  return mode === 'HOST_LOCKED' || mode === 'EXEMPT_WITH_REASON';
}

export function describeInheritanceMode(mode: InheritanceMode): string {
  switch (mode) {
    case 'INHERIT_FULL':
      return 'Child may closely follow parent composition while preserving function.';
    case 'INHERIT_GRAMMAR':
      return 'Child keeps functional composition; inherits experience grammar from parent.';
    case 'SPECIALIZED_CHILD':
      return 'Specialized application surface — identity + interaction language only.';
    case 'HOST_LOCKED':
      return 'Global SITE 00 host shell — not transformed by parent inheritance.';
    case 'EXEMPT_WITH_REASON':
      return 'Intentional exception — stored rationale required.';
  }
}
