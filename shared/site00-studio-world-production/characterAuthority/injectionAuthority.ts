/**
 * P0.5E.4F — Character injection authority — single bundle for downstream generators.
 */

import { randomUUID } from 'node:crypto';
import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import { CHARACTER_AUTHORITY_VERSION } from './constants.js';
import { buildCanonicalCharacterVisualAuthority } from './canonicalAuthority.js';
import { evaluateNDXVisualIdentityReadiness } from './readiness.js';
import { NDX_DEFAULT_VARIATION_RULES } from './variationRules.js';
import type { CharacterInjectionBundle, CharacterInjectionRequest } from './types.js';

export function requestCharacterInjectionBundle(params: {
  request: CharacterInjectionRequest;
  casting: CharacterVisualCastingState | null | undefined;
}): CharacterInjectionBundle | null {
  const authority = buildCanonicalCharacterVisualAuthority(params.casting);
  if (!authority) return null;

  const visual = evaluateNDXVisualIdentityReadiness(params.casting);
  const snapshot = params.casting?.visualAuthoritySnapshot;
  const anchor = params.casting?.canonicalAnchor;

  return {
    bundleId: randomUUID(),
    characterAuthorityVersion: CHARACTER_AUTHORITY_VERSION,
    characterVisualVersion: authority.visualVersion.versionLabel,
    identityReferences: [
      authority.approvedFounderReferenceUrl ?? '',
      anchor?.previewUrl ?? '',
      snapshot?.identityLock.identitySignature ?? '',
    ].filter(Boolean),
    bodyReferences: [snapshot?.identityLock.bodyBuildSilhouette ?? ''].filter(Boolean),
    hairReferences: [
      snapshot?.identityLock.hairTexturePattern ?? '',
      snapshot?.identityLock.hairDensityLength ?? '',
    ].filter(Boolean),
    wardrobeContinuityId: snapshot?.wardrobeLock.lockId ?? null,
    wardrobeReferences: [
      snapshot?.wardrobeLock.garmentCategories ?? '',
      snapshot?.wardrobeLock.primarySecondaryColors ?? '',
    ].filter(Boolean),
    environmentAuthorityId: snapshot?.environmentLock.lockId ?? null,
    expressionReferences: params.casting?.candidates
      .filter((c) => c.assetSlot === 'SEATED_EDITORIAL_VIEW')
      .map((c) => c.previewUrl)
      .filter(Boolean) as string[],
    cameraPresenceReferences: params.casting?.candidates
      .filter((c) => c.assetSlot === 'FRONT_VIEW')
      .map((c) => c.previewUrl)
      .filter(Boolean) as string[],
    negativeIdentityConstraints: authority.negativeIdentityConstraints,
    continuityConstraints: snapshot?.identityLock.sameWomanContinuityConstraints ?? [],
    providerReferencePack: buildProviderReferencePack(params.casting),
    readinessState: visual.status,
    variationRules: NDX_DEFAULT_VARIATION_RULES,
    compiledAt: new Date().toISOString(),
  };
}

function buildProviderReferencePack(casting: CharacterVisualCastingState | null | undefined): string[] {
  if (!casting) return [];
  const urls = [
    casting.canonicalAnchor?.previewUrl,
    ...casting.founderReferences.filter((r) => r.role === 'FULL_LOOK').map((r) => r.previewUrl),
    ...casting.candidates
      .filter((c) => c.previewUrl && !c.previewUrl.includes('/api/placeholder/'))
      .map((c) => c.previewUrl),
  ];
  return [...new Set(urls.filter(Boolean))] as string[];
}

export function compileInjectionPromptSections(bundle: CharacterInjectionBundle): string[] {
  return [
    'CANONICAL CHARACTER INJECTION AUTHORITY — do not re-cast or reinterpret',
    `Visual version: ${bundle.characterVisualVersion}`,
    `Identity references: ${bundle.identityReferences.join(' | ')}`,
    `Wardrobe continuity: ${bundle.wardrobeContinuityId ?? 'locked'} — ${bundle.wardrobeReferences.join('; ')}`,
    `Environment authority: ${bundle.environmentAuthorityId ?? 'locked'}`,
    `Hair: ${bundle.hairReferences.join('; ')}`,
    `Continuity: ${bundle.continuityConstraints.join('; ')}`,
    `Negative constraints: ${bundle.negativeIdentityConstraints.slice(0, 12).join('; ')}`,
    `Provider reference pack (${bundle.providerReferencePack.length} refs)`,
  ];
}

export function injectCharacterAuthorityIntoPrompt(basePrompt: string, bundle: CharacterInjectionBundle): string {
  const sections = compileInjectionPromptSections(bundle);
  return [...sections, '', basePrompt].join('\n');
}
