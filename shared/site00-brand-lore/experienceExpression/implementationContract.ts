/**
 * Experience Implementation Contract compiler — founder-selected concept only.
 */

import type {
  ExperienceBible,
  ExperienceConcept,
  ExperienceFunctionalCanon,
  ExperienceImplementationContract,
  ExperienceImplementationContractAssetBinding,
  ExperienceVisualDevelopmentAsset,
  HostExperienceCanon,
} from './types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import type { ClientExperienceCanon } from './types.js';
import type { ExperienceAssetManifest, ExperienceAssetRequirement } from './assetManifest.js';
import type { ExperienceProductionAsset } from './assetLifecycle.js';

export function buildAssetBindings(params: {
  requirements: ExperienceAssetRequirement[];
  visualAssets: ExperienceVisualDevelopmentAsset[];
  productionAssets: ExperienceProductionAsset[];
  conceptId: string;
}): ExperienceImplementationContractAssetBinding[] {
  return params.requirements
    .filter((r) => r.experienceConceptId === params.conceptId)
    .map((req) => {
      const visual = params.visualAssets.find(
        (a) => a.experienceConceptId === params.conceptId && a.idempotencyKey === req.idempotencyKey,
      );
      const production = params.productionAssets.find((a) => a.requirementId === req.id);
      const approved =
        req.status === 'PROMOTED_TO_PRODUCTION' ||
        production?.productionState === 'PROMOTED_TO_PRODUCTION';

      return {
        requirementId: req.id,
        assetId: production?.assetId ?? visual?.assetId ?? null,
        assetRole: req.assetRole,
        assetFamily: req.assetFamily,
        surfaceId: req.surfaceId,
        pageRoute: req.pageRoute,
        responsiveVariants: [
          {
            deviceClass: 'MOBILE' as const,
            storagePath: req.mobileRequirement ? (visual?.deviceClass === 'MOBILE' ? visual.storagePath : null) : null,
          },
          {
            deviceClass: 'DESKTOP' as const,
            storagePath: req.desktopRequirement ? (visual?.deviceClass === 'DESKTOP' ? visual.storagePath : null) : null,
          },
        ],
        interactionRelationship: req.interactionRelationship,
        fallbackBehavior: approved
          ? 'Use approved production asset'
          : 'IMPLEMENTATION_BLOCKED — do not substitute stock or generic imagery',
        productionState: production?.productionState ?? visual?.productionState ?? 'MISSING',
        approved,
      };
    });
}

export function findMissingRequiredProductionAssets(
  bindings: ExperienceImplementationContractAssetBinding[],
  requirements: ExperienceAssetRequirement[],
): string[] {
  const required = requirements.filter((r) => r.required && r.productionEligibility === 'PRODUCTION_ELIGIBLE');
  const missing: string[] = [];
  for (const req of required) {
    const binding = bindings.find((b) => b.requirementId === req.id);
    if (!binding?.approved || !binding.assetId) {
      missing.push(`${req.assetFamily} on ${req.surfaceId}: ${req.assetRole}`);
    }
  }
  return missing;
}

export function compileExperienceImplementationContract(params: {
  concept: ExperienceConcept;
  bible: ExperienceBible;
  territory?: CreativeConceptTerritory | null;
  world?: WorldExpressionSystem | null;
  functionalCanon: ExperienceFunctionalCanon;
  host: HostExperienceCanon;
  client: ClientExperienceCanon;
  visualAssets: ExperienceVisualDevelopmentAsset[];
  assetManifest?: ExperienceAssetManifest | null;
  productionAssets?: ExperienceProductionAsset[];
}): ExperienceImplementationContract {
  const { concept, bible, territory, world, functionalCanon, host, client, visualAssets } = params;
  const requirements = params.assetManifest?.requirements ?? [];
  const productionAssets = params.productionAssets ?? [];

  const assetBindings = buildAssetBindings({
    requirements,
    visualAssets,
    productionAssets,
    conceptId: concept.experienceConceptId,
  });

  const missingRequiredAssets = findMissingRequiredProductionAssets(assetBindings, requirements);
  const hasMissingProduction = missingRequiredAssets.length > 0;

  const approvedVisualReferences = [
    ...visualAssets
      .filter((a) => a.experienceConceptId === concept.experienceConceptId && a.storagePath)
      .map((a) => a.storagePath!),
    ...productionAssets
      .filter((a) => a.productionState === 'PROMOTED_TO_PRODUCTION' && a.storagePath)
      .map((a) => a.storagePath!),
  ];

  return {
    contractId: `contract-${concept.experienceConceptId}`,
    selectedExperienceConceptId: concept.experienceConceptId,
    selectedExperienceBibleId: bible.experienceBibleId,
    selectedConceptTerritoryId: territory?.territoryId ?? 'snapshot-derived',
    worldExpressionSystemId: world?.expressionSystemId ?? 'none',
    functionalPreservation: [
      ...functionalCanon.routes.map((r) => `Route preserved: ${r}`),
      ...functionalCanon.actions.map((a) => `Action preserved: ${a}`),
      ...functionalCanon.items
        .filter((i) => i.classification === 'REQUIRED_FUNCTION' || i.classification === 'REQUIRED_NAVIGATION')
        .map((i) => i.label),
    ],
    hostInvariants: [
      ...host.hostPersistentControls,
      host.hostUiTypography,
      ...host.hostAccessibilityRules,
      'SITE 00 bottom navigation on mobile',
      'Global host wayfinding accent',
    ],
    clientExpression: [
      ...(territory ? [territory.centralConcept] : []),
      ...(world ? [world.paletteSystem, world.typographySystem] : []),
      ...client.traits.filter((t) => t.provenance !== 'EXPERIMENTAL_ASSET').map((t) => t.trait),
    ],
    interactionGrammar: bible.interactionGrammar.split(';').map((s) => s.trim()).filter(Boolean),
    informationHierarchy: bible.progressiveDisclosure.primaryExperienceRepresentation,
    surfaceBehavior: concept.keyExperienceMoments,
    responsiveBehavior: [concept.responsivePhilosophy],
    motionBehavior: [concept.motionPhilosophy],
    approvedVisualReferences,
    assetBindings,
    missingRequiredAssets,
    implementationStatus: hasMissingProduction ? 'IMPLEMENTATION_BLOCKED_MISSING_ASSET' : 'READY',
    antiTemplateConstraints: concept.genericTemplateAvoidanceStrategy,
    doNotConstraints: [
      'Do not remove functional routes',
      'Do not mutate Experiment D territories',
      'Do not auto-implement without founder contract approval',
      'Do not reskin entire SITE 00 as NDXBOOK',
      'Do not substitute stock imagery or generic UI for missing required production assets',
      'Composer must not independently reinterpret missing assets',
    ],
    acceptanceCriteria: [
      'CONCEPT_FIDELITY to selected experience metaphor',
      'HOST_FIDELITY — navigation and shell intact',
      'FUNCTIONAL_FIDELITY — all required actions reachable',
      'ASSET_FIDELITY — approved production assets bound to surfaces',
      'GENERIC_TEMPLATE_RESEMBLANCE below HIGH',
    ],
    compiledAt: new Date().toISOString(),
  };
}

export function functionalCanonInContract(contract: ExperienceImplementationContract): boolean {
  return contract.functionalPreservation.some((f) => f.includes('/projects/ndxbook'));
}

export function hostInvariantInContract(contract: ExperienceImplementationContract): boolean {
  return contract.hostInvariants.some((h) => h.toLowerCase().includes('bottom navigation') || h.includes('HOST_UI'));
}

export function composerSubstitutionBlocked(contract: ExperienceImplementationContract): boolean {
  return contract.doNotConstraints.some((d) => d.toLowerCase().includes('substitute stock'));
}

export function missingAssetSurfacedHonestly(contract: ExperienceImplementationContract): boolean {
  if (contract.implementationStatus === 'IMPLEMENTATION_BLOCKED_MISSING_ASSET') {
    return contract.missingRequiredAssets.length > 0;
  }
  return true;
}
