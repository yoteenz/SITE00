/**
 * P0.FILM.1 — Accessory & prop bible.
 */

import type { AccessoryPropBible, PropDefinition, ShotRiskLevel } from '../types.js';

export function buildPropDefinition(params: Partial<PropDefinition> & { propId: string; name: string }): PropDefinition {
  return {
    propId: params.propId,
    name: params.name,
    canonicalAppearance: params.canonicalAppearance ?? params.name,
    sceneRole: params.sceneRole ?? 'character artifact',
    continuityImportance: params.continuityImportance ?? 'MEDIUM',
    handInteractionRisk: params.handInteractionRisk ?? 'MEDIUM',
    providerGenerationRisk: params.providerGenerationRisk ?? 'MEDIUM',
    approvedReferenceAsset: params.approvedReferenceAsset ?? null,
    replacementRules: params.replacementRules ?? [],
  };
}

export function buildAccessoryPropBible(params: {
  brandId: string;
  props: PropDefinition[];
  persistentArtifacts?: string[];
}): AccessoryPropBible {
  return {
    brandId: params.brandId,
    props: params.props,
    persistentArtifacts: params.persistentArtifacts ?? params.props.map((p) => p.propId),
  };
}

export function propContinuityTracked(bible: AccessoryPropBible, propId: string): boolean {
  return bible.persistentArtifacts.includes(propId);
}

export function propHandInteractionRisk(prop: PropDefinition): ShotRiskLevel {
  return prop.handInteractionRisk;
}
