/**
 * Portability proof: the same gate evaluates page families of other Studio OS projects with no code change.
 * Schema proofs only — none of these is an authority, territory or implementation instruction.
 */
import { samples } from '../../../studioos-experience-brain/index.js';
import { evaluateAuthorityGate, type AuthorityGateResult } from '../../gate.js';
import { PORTABLE_PROJECTS } from '../../schema.js';

type Sample = { project_id: (typeof PORTABLE_PROJECTS)[number]; family_id: string; feature_id: string; note: string; result: AuthorityGateResult };

export function portabilitySamples(): Sample[] {
  const fromBrain = samples.PORTABILITY_SAMPLES.map((c) => ({
    project_id: c.project_id as Sample['project_id'],
    family_id: c.family_id,
    feature_id: c.feature_id,
    note: `${c.primary_metaphor} — experience sample (drafted); treated as material to show the gate holds at EXPERIENCE_REQUIRED.`,
    result: evaluateAuthorityGate({ project_id: c.project_id, family_id: c.family_id, feature_id: c.feature_id, actor: 'CLIENT', material: true, family_locked: true, experience_contract: c, brand_context: null, legacy_surfaces: [] }),
  }));
  const noContract = (project_id: Sample['project_id'], family_id: string, feature_id: string, note: string, family_locked = true): Sample => ({
    project_id, family_id, feature_id, note,
    result: evaluateAuthorityGate({ project_id, family_id, feature_id, actor: 'CLIENT', material: true, family_locked, experience_contract: null }),
  });
  return [
    ...fromBrain,
    noContract('SITE00', 'SITE00.WORKSPACE', 'SITE00.PRODUCTION_WORKSPACE', 'SITE 00 production workspace — no experience contract yet.'),
    noContract('ASTRAL_WORLD', 'ASTRAL.WORLD', 'ASTRAL.WORLD_HOME', 'Astral World — no family lock yet.', false),
    noContract('FUTURE_CLIENT_PROJECT', 'CLIENT.FAMILY', 'CLIENT.FEATURE', 'Future client project — the gate needs only data.'),
  ];
}
