/**
 * Resolve master skin tokens + CSS vars for module expression layer.
 */

import { getMasterSkinById } from './catalog.js';
import { getProjectExperienceSkin } from './projectSkinStore.js';
import type { MasterSkinModuleVariant, MasterSkinTokens } from './types.js';

export type ResolvedModuleSkin = {
  projectId: string;
  masterSkinId: string;
  masterSkinVersion: string;
  skinFamily: string;
  moduleId: string;
  tokens: MasterSkinTokens;
  moduleVariant: MasterSkinModuleVariant | null;
  primaryColor: string;
  cssClass: string;
  cssVars: Record<string, string>;
  hostFirewallStatus: 'INTACT';
};

export function resolveModuleSkin(projectId: string, moduleId: string): ResolvedModuleSkin | null {
  const binding = getProjectExperienceSkin(projectId);
  if (!binding?.active) return null;
  const skin = getMasterSkinById(binding.masterSkinId);
  if (!skin) return null;

  const moduleVariant =
    skin.moduleVariants.find((v) => v.moduleId === moduleId) ??
    skin.moduleVariants.find((v) => v.moduleId === 'EVOLVE') ??
    null;

  const tokens = applyOverrides(skin.tokens, binding, moduleId);
  const cssClass = `site00-master-skin site00-master-skin--${skin.id}`;

  return {
    projectId,
    masterSkinId: skin.id,
    masterSkinVersion: binding.activeSkinVersion,
    skinFamily: skin.skinFamily,
    moduleId,
    tokens,
    moduleVariant,
    primaryColor: binding.primaryColor,
    cssClass,
    cssVars: buildSkinCssVars(tokens, binding.primaryColor),
    hostFirewallStatus: 'INTACT',
  };
}

function applyOverrides(
  tokens: MasterSkinTokens,
  binding: NonNullable<ReturnType<typeof getProjectExperienceSkin>>,
  moduleId: string,
): MasterSkinTokens {
  const overrides = binding.brandOverrides.filter((o) => !o.moduleId || o.moduleId === moduleId);
  let next = { ...tokens };
  for (const o of overrides) {
    if (o.panelDensity) next = { ...next, density: o.panelDensity };
    if (o.imageRadius != null) next = { ...next, imageRadius: o.imageRadius };
    if (o.accentCoverage) next = { ...next, accentCoverage: o.accentCoverage };
  }
  return next;
}

export function buildSkinCssVars(tokens: MasterSkinTokens, primaryColor: string): Record<string, string> {
  return {
    '--site00-skin-primary': primaryColor,
    '--site00-skin-density': tokens.density,
    '--site00-skin-radius': `${tokens.surfaceRadius}px`,
    '--site00-skin-border-weight': `${tokens.borderWeight}px`,
    '--site00-skin-section-spacing': `${tokens.sectionSpacing}px`,
    '--site00-skin-card-spacing': `${tokens.cardSpacing}px`,
    '--site00-skin-image-radius': `${tokens.imageRadius}px`,
    '--site00-skin-content-max-width': `${tokens.contentMaxWidth}px`,
    '--site00-skin-motion-ms': `${tokens.motionSpeed === 'SLOW' ? 280 : tokens.motionSpeed === 'FAST' ? 120 : 200}ms`,
  };
}

export function skinInspectorPayload(projectId: string) {
  const binding = getProjectExperienceSkin(projectId);
  const skin = binding ? getMasterSkinById(binding.masterSkinId) : null;
  return {
    projectId,
    fieldTags: binding?.fieldTags ?? [],
    masterSkinId: binding?.masterSkinId ?? null,
    masterSkinVersion: binding?.activeSkinVersion ?? null,
    expressionProfile: binding?.expressionProfile ?? null,
    primaryColor: binding?.primaryColor ?? null,
    moduleVariant: skin?.moduleVariants.find((v) => v.moduleId === 'EVOLVE') ?? null,
    projectOverrides: binding?.brandOverrides ?? [],
    recommendationSource: binding?.recommendationSource ?? null,
    recommendationConfidence: binding?.recommendationConfidence ?? null,
    founderApproved: binding?.founderApproved ?? false,
    hostFirewallStatus: 'INTACT' as const,
  };
}
