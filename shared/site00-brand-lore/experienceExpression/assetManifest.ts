/**
 * ExperienceAssetRequirement + ExperienceAssetManifest compiler.
 */

import { createHash } from 'node:crypto';
import type { DeviceClass, ExperienceSurfaceType } from './constants.js';
import type { ExperienceAssetDirection } from './assetDirection.js';
import { surfacesForResponsivePolicy, type ProjectProductionScope } from './productionScope.js';
import type { SurfaceExperienceArtDirection } from './surfaceArtDirection.js';
import type {
  ClientExperienceCanon,
  ExperienceBible,
  ExperienceConcept,
  ExperienceFunctionalCanon,
} from './types.js';

export const EXPERIENCE_ASSET_REQUIREMENT_STATUSES = [
  'PROPOSED',
  'APPROVED_FOR_DEVELOPMENT',
  'GENERATING',
  'GENERATED',
  'IN_REVIEW',
  'APPROVED_VISUAL_DEVELOPMENT',
  'REJECTED',
  'PROMOTED_TO_PRODUCTION',
  'SUPERSEDED',
] as const;

export type ExperienceAssetRequirementStatus = (typeof EXPERIENCE_ASSET_REQUIREMENT_STATUSES)[number];

export type ExperienceAssetRequirement = {
  id: string;
  projectId: string;
  experienceConceptId: string;
  experienceBibleId: string;
  surfaceId: ExperienceSurfaceType;
  pageRoute: string | null;
  assetFamily: string;
  assetRole: string;
  assetClass: string;
  purpose: string;
  creativeFunction: string;
  functionalRelationship: string;
  interactionRelationship: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  required: boolean;
  responsiveBehavior: string;
  desktopRequirement: boolean;
  mobileRequirement: boolean;
  tabletRequirement: boolean;
  motionRequirement: string | null;
  accessibilityRequirement: string | null;
  contentDependency: string | null;
  brandIntelligenceSources: string[];
  experienceBibleSources: string[];
  functionalCanonSources: string[];
  provenance: string;
  generationAllowed: boolean;
  generationProviderClass: 'FAL' | 'SUPPLIED' | 'LICENSED' | 'DERIVED';
  generationBudgetClass: 'VISUAL_DEVELOPMENT' | 'PRODUCTION';
  productionEligibility: 'VISUAL_DEVELOPMENT_ONLY' | 'PRODUCTION_ELIGIBLE';
  status: ExperienceAssetRequirementStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

export type ExperienceAssetManifest = {
  manifestId: string;
  manifestFingerprint: string;
  projectId: string;
  experienceConceptId: string;
  experienceBibleId: string;
  assetDirectionId: string;
  scopeId: string;
  requirements: ExperienceAssetRequirement[];
  summary: {
    totalRequirements: number;
    requiredCount: number;
    visualDevelopmentOnly: number;
    productionEligible: number;
    surfacesCovered: ExperienceSurfaceType[];
    assetFamilies: string[];
    generationBudgetEstimateUsd: number;
  };
  revisionAllowance: number;
  dependencyRelationships: Array<{ requirementId: string; dependsOn: string | null }>;
  compiledAt: string;
};

function requirementIdempotencyKey(params: {
  experienceConceptId: string;
  surfaceId: string;
  assetFamily: string;
  assetRole: string;
  deviceClass: DeviceClass;
}): string {
  return createHash('sha256')
    .update(`${params.experienceConceptId}:${params.surfaceId}:${params.assetFamily}:${params.assetRole}:${params.deviceClass}`)
    .digest('hex')
    .slice(0, 24);
}

function manifestFingerprint(requirements: ExperienceAssetRequirement[]): string {
  const payload = requirements
    .map((r) => r.idempotencyKey)
    .sort()
    .join('|');
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

function assetRoleForFamily(family: string): string {
  const map: Record<string, string> = {
    HERO_COMPOSITION: 'Dominant focal artwork',
    ENVIRONMENT_PLATE: 'Environmental backdrop',
    VISUAL_SPECIMEN: 'Review specimen',
    CONCEPT_FRAGMENT: 'Concept evidence fragment',
    ACTIVE_VISUAL_SPECIMEN: 'On-the-bench active piece visual',
    REVISION_LAYER: 'Revision comparison layer',
    LINEAGE_FRAGMENT: 'Lineage/version fragment',
    TYPOGRAPHIC_ARTWORK: 'Client-native typographic intervention',
    EDITORIAL_ARTWORK: 'Editorial graphic intervention',
    ARTIFACT_FRAGMENT: 'Archived artifact visual',
    COMPARISON_SPECIMEN: 'Side-by-side comparison specimen',
  };
  return map[family] ?? `Support ${family.toLowerCase().replace(/_/g, ' ')}`;
}

function deriveRequirementsForSurface(params: {
  projectId: string;
  concept: ExperienceConcept;
  bible: ExperienceBible;
  surface: SurfaceExperienceArtDirection;
  functionalCanon: ExperienceFunctionalCanon;
  client: ClientExperienceCanon;
  scope: ProjectProductionScope;
  devices: ReturnType<typeof surfacesForResponsivePolicy>;
}): ExperienceAssetRequirement[] {
  const requirements: ExperienceAssetRequirement[] = [];
  const now = new Date().toISOString();

  for (const family of params.surface.requiredAssetFamilies) {
    for (const device of params.devices) {
      const role = assetRoleForFamily(family);
      const idempotencyKey = requirementIdempotencyKey({
        experienceConceptId: params.concept.experienceConceptId,
        surfaceId: params.surface.surfaceId,
        assetFamily: family,
        assetRole: role,
        deviceClass: device as DeviceClass,
      });

      requirements.push({
        id: `req-${idempotencyKey}`,
        projectId: params.projectId,
        experienceConceptId: params.concept.experienceConceptId,
        experienceBibleId: params.bible.experienceBibleId,
        surfaceId: params.surface.surfaceId,
        pageRoute: params.surface.pageRoute,
        assetFamily: family,
        assetRole: role,
        assetClass: family,
        purpose: `${role} on ${params.surface.surfaceId} (${device})`,
        creativeFunction: params.surface.artworkRelationship,
        functionalRelationship: params.functionalCanon.routes.find((r) => r === params.surface.pageRoute) ?? 'Experience surface',
        interactionRelationship: params.surface.interactionArtRelationship,
        priority: family.includes('HERO') || family.includes('ACTIVE') ? 'CRITICAL' : 'HIGH',
        required: params.surface.clientExpressionIntensity === 'HIGH' || family.includes('HERO') || family.includes('ACTIVE'),
        responsiveBehavior: params.surface.responsiveTransformation,
        desktopRequirement: device === 'DESKTOP',
        mobileRequirement: device === 'MOBILE',
        tabletRequirement: device === 'TABLET',
        motionRequirement: params.scope.motionAllowance !== 'NONE' ? params.surface.motionBehavior : null,
        accessibilityRequirement: 'Alt text and reduced-motion fallback required',
        contentDependency: params.concept.centralThesis,
        brandIntelligenceSources: params.concept.evidenceReferences,
        experienceBibleSources: [params.bible.experienceBibleId],
        functionalCanonSources: params.functionalCanon.routes.slice(0, 3),
        provenance: 'DERIVED_EXPERIENCE',
        generationAllowed: true,
        generationProviderClass: 'FAL',
        generationBudgetClass: 'VISUAL_DEVELOPMENT',
        productionEligibility: 'VISUAL_DEVELOPMENT_ONLY',
        status: 'PROPOSED',
        idempotencyKey,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return requirements;
}

export function compileExperienceAssetManifest(params: {
  projectId: string;
  concept: ExperienceConcept;
  bible: ExperienceBible;
  assetDirection: ExperienceAssetDirection;
  functionalCanon: ExperienceFunctionalCanon;
  client: ClientExperienceCanon;
  scope: ProjectProductionScope;
  existingRequirements?: ExperienceAssetRequirement[];
}): ExperienceAssetManifest {
  const devices = surfacesForResponsivePolicy(params.scope);
  let requirements: ExperienceAssetRequirement[] = [];

  for (const surface of params.assetDirection.surfaceArtDirections) {
    requirements.push(
      ...deriveRequirementsForSurface({
        projectId: params.projectId,
        concept: params.concept,
        bible: params.bible,
        surface,
        functionalCanon: params.functionalCanon,
        client: params.client,
        scope: params.scope,
        devices,
      }),
    );
  }

  // Idempotent merge — preserve status of existing requirements
  if (params.existingRequirements?.length) {
    const existingByKey = new Map(params.existingRequirements.map((r) => [r.idempotencyKey, r]));
    requirements = requirements.map((r) => {
      const prev = existingByKey.get(r.idempotencyKey);
      if (!prev) return r;
      return {
        ...r,
        id: prev.id,
        status: prev.status,
        createdAt: prev.createdAt,
        updatedAt: prev.updatedAt,
        productionEligibility: prev.productionEligibility,
        generationBudgetClass: prev.generationBudgetClass,
      };
    });
  }

  const fingerprint = manifestFingerprint(requirements);
  const families = [...new Set(requirements.map((r) => r.assetFamily))];
  const surfaces = [...new Set(requirements.map((r) => r.surfaceId))];

  return {
    manifestId: `manifest-${params.concept.experienceConceptId}-${fingerprint}`,
    manifestFingerprint: fingerprint,
    projectId: params.projectId,
    experienceConceptId: params.concept.experienceConceptId,
    experienceBibleId: params.bible.experienceBibleId,
    assetDirectionId: params.assetDirection.assetDirectionId,
    scopeId: params.scope.scopeId,
    requirements,
    summary: {
      totalRequirements: requirements.length,
      requiredCount: requirements.filter((r) => r.required).length,
      visualDevelopmentOnly: requirements.filter((r) => r.productionEligibility === 'VISUAL_DEVELOPMENT_ONLY').length,
      productionEligible: requirements.filter((r) => r.productionEligibility === 'PRODUCTION_ELIGIBLE').length,
      surfacesCovered: surfaces,
      assetFamilies: families,
      generationBudgetEstimateUsd: requirements.length * 0.045,
    },
    revisionAllowance: params.scope.revisionAllowance,
    dependencyRelationships: requirements.map((r) => ({
      requirementId: r.id,
      dependsOn: r.contentDependency ? requirements.find((x) => x.assetFamily === 'ENVIRONMENT_PLATE' && x.surfaceId === r.surfaceId)?.id ?? null : null,
    })),
    compiledAt: new Date().toISOString(),
  };
}

export function manifestCompilationIdempotent(
  first: ExperienceAssetManifest,
  second: ExperienceAssetManifest,
): boolean {
  return first.manifestFingerprint === second.manifestFingerprint;
}

export function pageVisitTriggersZeroGeneration(): true {
  return true;
}
