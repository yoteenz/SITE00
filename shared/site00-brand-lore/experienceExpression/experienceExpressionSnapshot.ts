/**
 * Experiment E intelligence snapshot — independent of frozen Experiment D snapshot.
 */

import { createHash } from 'node:crypto';
import type { BrandLoreProfile } from '../types.js';
import { shouldIncludeCreativeAppetiteInFormation } from '../founderCreativeAppetite/experimentExclusion.js';
import { EXPERIMENT_E_RUN_ID, EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION } from './constants.js';
import type { CrossMediumConceptEvidence } from './crossMediumConceptEvidence.js';
import type {
  ClientExperienceCanon,
  ExperienceFunctionalCanon,
  GenericTemplateResemblanceAudit,
  HostExperienceCanon,
} from './types.js';

export const EVIDENCE_INPUT_CLASSIFICATIONS = [
  'BRAND_LEVEL',
  'MEDIUM_SPECIFIC',
  'CONCEPT_SPECIFIC',
  'EXPERIMENTAL',
  'PREFERENCE_ONLY',
  'CANON',
  'EXCLUDED',
] as const;

export type EvidenceInputClassification = (typeof EVIDENCE_INPUT_CLASSIFICATIONS)[number];

export type ExperimentEIntelligenceInput = {
  inputId: string;
  label: string;
  classification: EvidenceInputClassification;
  source: string;
  provenance: string;
  included: boolean;
  exclusionReason: string | null;
};

export type ExperimentEIntelligenceSnapshot = {
  snapshotVersion: number;
  fingerprint: string;
  compiledAt: string;
  experimentId: string;
  inputs: ExperimentEIntelligenceInput[];
  brandLorePresent: boolean;
  brandPersonalityPresent: boolean;
  expressionContextPresent: boolean;
  appetiteIncluded: boolean;
  crossMediumEvidenceCount: number;
  explicitlyPromotedEvidenceCount: number;
  functionalCanonVersion: number | null;
  hostCanonVersion: number | null;
  clientCanonVersion: number | null;
  currentExperienceAuditPresent: boolean;
};

function fingerprintPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function compileExperimentEIntelligenceSnapshot(params: {
  profile: BrandLoreProfile | null;
  functionalCanon: ExperienceFunctionalCanon | null;
  hostCanon: HostExperienceCanon | null;
  clientCanon: ClientExperienceCanon | null;
  currentExperienceAudit: GenericTemplateResemblanceAudit | null;
  crossMediumEvidence: CrossMediumConceptEvidence[];
}): ExperimentEIntelligenceSnapshot {
  const { profile, functionalCanon, hostCanon, clientCanon, currentExperienceAudit, crossMediumEvidence } =
    params;

  const appetiteIncluded = shouldIncludeCreativeAppetiteInFormation({
    experimentId: EXPERIMENT_E_RUN_ID,
    intelligenceSnapshotVersion: EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
  });

  const inputs: ExperimentEIntelligenceInput[] = [];

  if (profile?.brandWorld?.value) {
    inputs.push({
      inputId: 'brand-lore',
      label: 'Brand Lore',
      classification: 'BRAND_LEVEL',
      source: 'brandWorld',
      provenance: 'site00_brand_lore_profiles',
      included: true,
      exclusionReason: null,
    });
  }

  if (profile?.brandPersonality) {
    inputs.push({
      inputId: 'brand-personality',
      label: 'Brand Personality',
      classification: 'BRAND_LEVEL',
      source: 'brandPersonality',
      provenance: 'site00_brand_lore_profiles',
      included: true,
      exclusionReason: null,
    });
  }

  if (profile?.contextClassification) {
    inputs.push({
      inputId: 'expression-context',
      label: 'Primary Expression Context',
      classification: 'BRAND_LEVEL',
      source: 'contextClassification',
      provenance: 'site00_brand_lore_profiles',
      included: true,
      exclusionReason: null,
    });
  }

  if (profile?.founderCreativeAppetite && Object.keys(profile.founderCreativeAppetite.rawAnswers ?? {}).length > 0) {
    inputs.push({
      inputId: 'founder-creative-appetite',
      label: 'Founder Creative Appetite',
      classification: appetiteIncluded ? 'CANON' : 'EXCLUDED',
      source: 'founderCreativeAppetite',
      provenance: 'site00_brand_lore_profiles',
      included: appetiteIncluded,
      exclusionReason: appetiteIncluded ? null : 'Experiment exclusion policy',
    });
  }

  for (const ev of crossMediumEvidence) {
    inputs.push({
      inputId: ev.evidenceId,
      label: ev.directionName,
      classification:
        ev.classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM' ? 'CONCEPT_SPECIFIC' : 'MEDIUM_SPECIFIC',
      source: ev.territoryId,
      provenance: 'experiment_d_concept_territory',
      included: ev.eligibleForExperienceFormation,
      exclusionReason: ev.classification === 'NOT_APPLICABLE' ? 'Not applicable to experience formation' : null,
    });
  }

  inputs.push({
    inputId: 'functional-canon',
    label: 'Functional Canon',
    classification: 'CANON',
    source: 'ndxbook_implementation_forensic',
    provenance: 'functionalCanon.ts',
    included: Boolean(functionalCanon),
    exclusionReason: null,
  });

  inputs.push({
    inputId: 'host-canon',
    label: 'Host Canon',
    classification: 'CANON',
    source: 'site00_host_shell',
    provenance: 'hostExperienceCanon.ts',
    included: Boolean(hostCanon),
    exclusionReason: null,
  });

  const fp = fingerprintPayload({
    version: EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
    inputs: inputs.filter((i) => i.included).map((i) => i.inputId),
    functionalVersion: functionalCanon?.version ?? null,
    hostVersion: hostCanon?.version ?? null,
    clientVersion: clientCanon?.version ?? null,
    auditAt: currentExperienceAudit?.auditedAt ?? null,
  });

  return {
    snapshotVersion: EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION,
    fingerprint: fp,
    compiledAt: new Date().toISOString(),
    experimentId: EXPERIMENT_E_RUN_ID,
    inputs,
    brandLorePresent: Boolean(profile?.brandWorld?.value),
    brandPersonalityPresent: Boolean(profile?.brandPersonality),
    expressionContextPresent: Boolean(profile?.contextClassification),
    appetiteIncluded,
    crossMediumEvidenceCount: crossMediumEvidence.length,
    explicitlyPromotedEvidenceCount: crossMediumEvidence.filter(
      (e) => e.classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM',
    ).length,
    functionalCanonVersion: functionalCanon?.version ?? null,
    hostCanonVersion: hostCanon?.version ?? null,
    clientCanonVersion: clientCanon?.version ?? null,
    currentExperienceAuditPresent: Boolean(currentExperienceAudit),
  };
}
