import type { EmailArchetype, EmailFamily } from '../types.js';
import type { EmailFamilyCanon } from '../families/registry.js';
import { getFamilySpec } from '../families/registry.js';
import { getPrimaryFamily, listTemplatesByFamily } from '../registry/family-map.js';
import { getTemplateManifest } from './template-manifest.js';

export type FidelityStatus = 'calibrated' | 'in-progress' | 'needs-calibration';

export type CompositionContract = {
  templateId: string;
  family: EmailFamily;
  visualFamily: EmailFamilyCanon;
  familyNum: string;
  visualThesis: string;
  signatureArtifact: string;
  primaryFocal: string;
  dominantField: 'light' | 'dark' | 'warm';
  density: 'low' | 'low-medium' | 'medium' | 'high';
  symmetry: 'symmetric' | 'intentional-asymmetry' | 'split';
  prohibited: string[];
  fidelityStatus: FidelityStatus;
};

const ALL_FAMILIES_CALIBRATED = true;

export function resolveCompositionContract(
  templateId: string,
  family: EmailFamily,
  _archetype: EmailArchetype,
): CompositionContract {
  const visualFamily = getPrimaryFamily(templateId);
  const spec = getFamilySpec(visualFamily);
  const manifest = getTemplateManifest(templateId);

  return {
    templateId,
    family,
    visualFamily,
    familyNum: spec.num,
    visualThesis: manifest?.purpose ?? spec.metaphor,
    signatureArtifact: manifest?.signatureArtifact ?? spec.signatureArtifact,
    primaryFocal: manifest?.signatureArtifact ?? spec.signatureArtifact,
    dominantField: manifest?.visualMode === 'dark' ? 'dark' : manifest?.visualMode === 'warm' ? 'warm' : spec.dominantField,
    density: visualFamily === 'MILESTONE_CELEBRATION' ? 'low' : 'medium',
    symmetry: visualFamily === 'ACCESS_SECURITY' || visualFamily === 'ACTION_REVIEW' ? 'intentional-asymmetry' : 'split',
    prohibited: spec.prohibited,
    fidelityStatus: manifest ? 'calibrated' : ALL_FAMILIES_CALIBRATED ? 'calibrated' : 'needs-calibration',
  };
}

/** Family-level implementation status for debug QA */
export function familyImplementationStatus(canon: EmailFamilyCanon): {
  reference: 'approved';
  implementation: FidelityStatus;
  templateCount: number;
} {
  return {
    reference: 'approved',
    implementation: ALL_FAMILIES_CALIBRATED ? 'calibrated' : 'in-progress',
    templateCount: listTemplatesByFamily(canon).length,
  };
}
