/**
 * P0.VR.8R1 — DesignProjectThemeTokens derived from brand family / project bindings.
 */

import {
  BRAND_FAMILY_KEYS,
  BRAND_FAMILY_PRIMARY_COLORS,
  BRAND_FAMILY_PROJECT_MAP,
} from '../../../site00-brand-lore/projectSkin/brandFamily/constants.js';
import { getProjectBrandFamilyBinding } from '../../../site00-brand-lore/projectSkin/brandFamily/projectBinding.js';
import { resolveDesignProjectSelectorAccent } from './designProjectSelectorVisuals.js';
import { resolveManagedProjectContextAccent } from './managedProjectRegistry.js';
import { SITE00_DESIGN_PROJECT_ID, type ManagedProjectContextAccent } from './types.js';

export type DesignProjectThemeTokens = {
  primaryAccent: string;
  secondaryAccent: string;
  surfaceTreatment: string;
  projectVisualGrammar: string;
  statusAccent: string;
  activeControlAccent: string;
  projectLabelTreatment: ManagedProjectContextAccent;
  accentKey: string;
  brandFamilySkinId: string | null;
};

const HOST_THEME: DesignProjectThemeTokens = {
  primaryAccent: '#EB1C24',
  secondaryAccent: '#C4121F',
  surfaceTreatment: 'SITE00_HOST_NEUTRAL',
  projectVisualGrammar: 'HOST_SHELL',
  statusAccent: '#EB1C24',
  activeControlAccent: '#EB1C24',
  projectLabelTreatment: 'SITE00_HOST',
  accentKey: 'SITE00_RED',
  brandFamilySkinId: null,
};

const SECONDARY_BY_FAMILY: Record<string, string> = {
  [BRAND_FAMILY_KEYS.NDXBOOK]: '#9BB028',
  [BRAND_FAMILY_KEYS.FRONTAL_SLAYER]: '#C4121F',
  [BRAND_FAMILY_KEYS.AIO]: '#A8861F',
  [BRAND_FAMILY_KEYS.ASTRAL_WORLD]: '#5E3FA8',
  [BRAND_FAMILY_KEYS.STUDIO_WORLD]: '#B8962E',
};

const GRAMMAR_BY_FAMILY: Record<string, string> = {
  [BRAND_FAMILY_KEYS.NDXBOOK]: 'CULTURAL_EDITORIAL_LIME',
  [BRAND_FAMILY_KEYS.FRONTAL_SLAYER]: 'DISCIPLINE_RED',
  [BRAND_FAMILY_KEYS.AIO]: 'ENTERPRISE_GOLD',
  [BRAND_FAMILY_KEYS.ASTRAL_WORLD]: 'ETHEREAL_PURPLE',
  [BRAND_FAMILY_KEYS.STUDIO_WORLD]: 'STUDIO_GOLD',
};

export function resolveBrandFamilyKeyForProject(projectId: string): string | null {
  if (projectId === SITE00_DESIGN_PROJECT_ID) return null;
  const binding = getProjectBrandFamilyBinding(projectId);
  if (binding?.brandFamilySkinId) return binding.brandFamilySkinId;
  return BRAND_FAMILY_PROJECT_MAP[projectId] ?? null;
}

export function buildDesignProjectThemeTokens(projectId: string): DesignProjectThemeTokens {
  if (projectId === SITE00_DESIGN_PROJECT_ID) {
    return { ...HOST_THEME };
  }

  const brandKey = resolveBrandFamilyKeyForProject(projectId);
  const selectorAccent = resolveDesignProjectSelectorAccent(projectId);
  const managedAccent = resolveManagedProjectContextAccent(projectId);
  const colors = brandKey ? BRAND_FAMILY_PRIMARY_COLORS[brandKey] : null;
  const binding = getProjectBrandFamilyBinding(projectId);

  const primaryAccent = binding?.primaryColor ?? colors?.color ?? selectorAccent.dotColor;
  const secondaryAccent = binding?.secondaryColor ?? (brandKey ? SECONDARY_BY_FAMILY[brandKey] : null) ?? primaryAccent;

  return {
    primaryAccent,
    secondaryAccent,
    surfaceTreatment: brandKey ? `${brandKey}_SURFACE` : 'NEUTRAL',
    projectVisualGrammar: brandKey ? (GRAMMAR_BY_FAMILY[brandKey] ?? 'PROJECT_CANONICAL') : 'PROJECT_CANONICAL',
    statusAccent: primaryAccent,
    activeControlAccent: primaryAccent,
    projectLabelTreatment: managedAccent,
    accentKey: selectorAccent.accentKey,
    brandFamilySkinId: brandKey,
  };
}

export function designProjectAccentCssVar(tokens: DesignProjectThemeTokens): Record<string, string> {
  return {
    '--site00-dw-project-accent': tokens.primaryAccent,
    '--site00-dw-project-accent-soft': `${tokens.primaryAccent}26`,
    '--site00-dw-project-accent-secondary': tokens.secondaryAccent,
  };
}
