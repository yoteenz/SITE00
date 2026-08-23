/**
 * Experience Implementation Contract compiler — founder-selected concept only.
 */

import type {
  ExperienceBible,
  ExperienceConcept,
  ExperienceFunctionalCanon,
  ExperienceImplementationContract,
  ExperienceVisualDevelopmentAsset,
  HostExperienceCanon,
} from './types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import type { ClientExperienceCanon } from './types.js';

export function compileExperienceImplementationContract(params: {
  concept: ExperienceConcept;
  bible: ExperienceBible;
  territory?: CreativeConceptTerritory | null;
  world?: WorldExpressionSystem | null;
  functionalCanon: ExperienceFunctionalCanon;
  host: HostExperienceCanon;
  client: ClientExperienceCanon;
  visualAssets: ExperienceVisualDevelopmentAsset[];
}): ExperienceImplementationContract {
  const { concept, bible, territory, world, functionalCanon, host, client, visualAssets } = params;

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
    approvedVisualReferences: visualAssets
      .filter((a) => a.experienceConceptId === concept.experienceConceptId && a.storagePath)
      .map((a) => a.storagePath!),
    antiTemplateConstraints: concept.genericTemplateAvoidanceStrategy,
    doNotConstraints: [
      'Do not remove functional routes',
      'Do not mutate Experiment D territories',
      'Do not auto-implement without founder contract approval',
      'Do not reskin entire SITE 00 as NDXBOOK',
    ],
    acceptanceCriteria: [
      'CONCEPT_FIDELITY to selected experience metaphor',
      'HOST_FIDELITY — navigation and shell intact',
      'FUNCTIONAL_FIDELITY — all required actions reachable',
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
