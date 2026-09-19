/**
 * ClientProjectExpressionProfile — medium-specific client inhabitation layer.
 */

import { createHash } from 'node:crypto';
import type { BrandLoreProfile } from '../types.js';
import { SITE00_LAYER, NDXBOOK_PROHIBITED_AUTO_TRAITS, NDXBOOK_DISPLAY_NAME } from './constants.js';
import { buildClientExperienceCanon } from '../experienceExpression/clientExperienceCanon.js';
import { SITE00_HOST_FONT_FAMILY, HOST_UI_TYPOGRAPHY_INVARIANT } from '../typographyProvenance.js';

export type ClientProjectExpressionProfile = {
  profileId: string;
  projectId: string;
  brandId: string;
  layer: typeof SITE00_LAYER.CLIENT_PROJECT_EXPRESSION;
  brandLoreSources: string[];
  brandPersonalitySources: string[];
  primaryExpressionContext: string | null;
  founderCreativeAppetiteSources: string[];
  approvedBrandCanonSources: string[];
  approvedCrossMediumEvidence: string[];
  projectScope: string;
  backgroundBehavior: string;
  environmentBehavior: string;
  accentColorBehavior: string;
  expressiveTypographyBehavior: string;
  imageryBehavior: string;
  graphicGrammar: string;
  materialBehavior: string;
  artworkBehavior: string;
  motionBehavior: string;
  voiceBehavior: string;
  responsiveExpressionBehavior: string;
  prohibitedTraits: string[];
  provenance: string;
  fingerprint: string;
  version: number;
  workspaceMutationBlocked: true;
  compiledAt: string;
};

export function compileClientProjectExpressionProfile(params: {
  projectId: string;
  brandId: string;
  profile: BrandLoreProfile | null;
  projectScope?: string;
}): ClientProjectExpressionProfile {
  const clientCanon = buildClientExperienceCanon({
    profile: params.profile,
    territory: null,
    world: null,
  });

  const brandLoreSources = clientCanon.traits
    .filter((t) => t.provenance === 'BRAND_CANON')
    .map((t) => t.source);

  const payload = {
    projectId: params.projectId,
    brandId: params.brandId,
    traits: clientCanon.traits.map((t) => t.trait),
    context: params.profile?.contextClassification ?? null,
  };
  const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);

  const isNdxbook = params.projectId === 'ndxbook' || params.brandId === 'ndxbook';

  return {
    profileId: `client-expr-${params.projectId}-v1`,
    projectId: params.projectId,
    brandId: params.brandId,
    layer: SITE00_LAYER.CLIENT_PROJECT_EXPRESSION,
    brandLoreSources,
    brandPersonalitySources: params.profile?.brandPersonality ? ['brandPersonality'] : [],
    primaryExpressionContext: params.profile?.contextClassification ?? null,
    founderCreativeAppetiteSources:
      params.profile?.founderCreativeAppetite &&
      Object.keys(params.profile.founderCreativeAppetite.rawAnswers ?? {}).length > 0
        ? ['founderCreativeAppetite']
        : [],
    approvedBrandCanonSources: brandLoreSources,
    approvedCrossMediumEvidence: clientCanon.traits
      .filter((t) => t.provenance === 'CONCEPT_TERRITORY' || t.provenance === 'EXPERIMENTAL_ASSET')
      .map((t) => t.source),
    projectScope: params.projectScope ?? 'SITE_WORLD_CLASS',
    backgroundBehavior: isNdxbook
      ? 'Client-native environmental plate inhabiting SITE 00 workbench — derived from brand intelligence, not host default'
      : 'Project-specific environment inhabiting universal workspace',
    environmentBehavior: 'ProjectWorkspaceEnvironment — GENERATED | CLIENT_SUPPLIED | APPROVED_EXISTING | DERIVED_VARIANT | HOST_DEFAULT',
    accentColorBehavior: isNdxbook
      ? 'NDXBOOK expressive accent hierarchy — not SITE 00 host red wayfinding'
      : 'Client accent hierarchy within workspace shell',
    expressiveTypographyBehavior: isNdxbook
      ? `UNRESOLVED client typography — ${HOST_UI_TYPOGRAPHY_INVARIANT} ${SITE00_HOST_FONT_FAMILY} excluded.`
      : 'Client expressive typography derived from brand intelligence — host UI typography excluded',
    imageryBehavior: 'Client artwork and visual specimens participate in work — not decorative wallpaper',
    graphicGrammar: 'Client-native graphic interventions supporting active work surfaces',
    materialBehavior: 'Client material expression on artifact surfaces within SITE 00 structural continuity',
    artworkBehavior: 'Dominant active specimen + supporting evidence fragments where required',
    motionBehavior: 'Subtle client motion personality — workspace motion grammar remains SITE 00',
    voiceBehavior: clientCanon.brandLoreSummary ?? 'Client voice from brand lore',
    responsiveExpressionBehavior: 'Client expression adapts per device — workspace responsive philosophy governs layout',
    prohibitedTraits: isNdxbook ? [...NDXBOOK_PROHIBITED_AUTO_TRAITS] : [`${SITE00_HOST_FONT_FAMILY} as client typography`],
    provenance: 'DERIVED_CLIENT_EXPRESSION',
    fingerprint,
    version: 1,
    workspaceMutationBlocked: true,
    compiledAt: new Date().toISOString(),
  };
}

export function compileNdxbookClientExpressionProfile(profile: BrandLoreProfile | null): ClientProjectExpressionProfile {
  return compileClientProjectExpressionProfile({
    projectId: 'ndxbook',
    brandId: 'ndxbook',
    profile,
    projectScope: 'SITE_WORLD_CLASS',
  });
}

export function compileFrontalSlayerHypotheticalProfile(): ClientProjectExpressionProfile {
  return compileClientProjectExpressionProfile({
    projectId: 'frontal-slayer',
    brandId: 'frontal-slayer',
    profile: {
      brandWorld: { value: 'Frontal Slayer brand world — radically distinct visual identity' },
      brandPersonality: { version: 1 },
      contextClassification: 'PRIMARY_EXPRESSION_CONTEXT',
    } as unknown as BrandLoreProfile,
    projectScope: 'SITE',
  });
}

export function clientExpressionCannotMutateWorkspace(profile: ClientProjectExpressionProfile): boolean {
  return profile.workspaceMutationBlocked === true;
}

export function martianMonoNotNdxbookClientTypography(profile: ClientProjectExpressionProfile): boolean {
  if (profile.projectId !== 'ndxbook') return true;
  return (
    profile.prohibitedTraits.some((t) => t.toLowerCase().includes('martian mono')) &&
    !profile.expressiveTypographyBehavior.toLowerCase().includes('martian mono as client')
  );
}

export function distinctProfilesSameWorkspace(
  a: ClientProjectExpressionProfile,
  b: ClientProjectExpressionProfile,
): boolean {
  return a.fingerprint !== b.fingerprint && a.projectId !== b.projectId;
}

export function ndxbookNamingCorrect(name: string): boolean {
  return name === NDXBOOK_DISPLAY_NAME;
}
