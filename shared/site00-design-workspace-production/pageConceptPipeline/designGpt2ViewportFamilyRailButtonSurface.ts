/**
 * P0.VR.HERO-RIGHT-RAIL-BUTTON-SURFACE-CLEANUP1 — presentation-only surface tiers for hero rail actions.
 */

import type { Gpt2ViewportFamilyAuthorityRailAction } from './designGpt2ViewportFamilyAuthorityRail.js';

export type HeroRailButtonSurface = 'primary' | 'secondary' | 'tertiary' | 'disabled';

export function heroRailButtonSurfaceForAction(action: Pick<Gpt2ViewportFamilyAuthorityRailAction, 'tone' | 'disabled'>): HeroRailButtonSurface {
  if (action.disabled) return 'disabled';
  if (action.tone === 'lime') return 'primary';
  if (action.tone === 'ink') return 'secondary';
  return 'tertiary';
}

/** Enabled actions must map to a filled surface — never uncontained lime text. */
export function heroRailActionRequiresFilledSurface(action: Gpt2ViewportFamilyAuthorityRailAction): boolean {
  if (action.disabled) return true;
  return action.tone === 'lime' || action.tone === 'ink' || action.tone === 'ghost';
}

const REVIEW_LABEL_PREFIX = /^REVIEW |^VIEW /;
const PRIMARY_LABELS = new Set([
  'SELECT MOBILE CONCEPT',
  'OPEN EXPERIENCE',
  'APPROVE EXPERIENCE',
  'GENERATE TABLET',
  'GENERATE DESKTOP',
  'APPROVE FAMILY',
]);

const SYSTEM_LABELS = new Set(['CONFIRM MOBILE AUTHORITY', 'REVIEW EXPERIENCE', 'REVIEW TABLET', 'REVIEW DESKTOP', 'REVIEW FAMILY']);

export function heroRailActionToneMatchesLabelContract(action: Gpt2ViewportFamilyAuthorityRailAction): boolean {
  if (action.disabled) {
    return true;
  }
  if (PRIMARY_LABELS.has(action.label)) return action.tone === 'lime';
  if (
    SYSTEM_LABELS.has(action.label) ||
    REVIEW_LABEL_PREFIX.test(action.label) ||
    action.label === 'VIEW PROGRESS' ||
    action.label === 'VIEW APPROVED EXPERIENCE'
  ) {
    return action.tone === 'ink';
  }
  if (action.label === 'CHANGE AUTHORITY' || action.label === 'CHANGE SELECTION') return action.tone === 'ghost';
  if (action.label.startsWith('REGENERATE ')) return action.tone === 'ghost' || action.tone === 'ink';
  if (action.label === 'LOCK VIEWPORT FAMILY') return action.tone === 'ghost' || action.tone === 'ink';
  if (action.label.startsWith('USE THIS ')) return action.tone === 'ghost';
  return true;
}
