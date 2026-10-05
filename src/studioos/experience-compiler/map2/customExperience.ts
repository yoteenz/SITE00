import type { CustomExperienceDefinition, ExperienceFamily } from './map2Types';

export function createCustomExperience(input: {
  name: string;
  description: string;
  business_purpose: string;
  inherits_from: string[];
  new_family_id?: string | null;
}): CustomExperienceDefinition {
  return {
    custom_experience_id: `cx_${input.name.replace(/\W+/g, '_').toLowerCase()}`,
    name: input.name,
    description: input.description,
    business_purpose: input.business_purpose,
    states: ['INTRO', 'WORK', 'PREVIEW', 'COMMIT'],
    inherits_from: input.inherits_from,
    new_family_id: input.new_family_id ?? null,
    capability_candidate: Boolean(input.new_family_id),
  };
}

export function composeCustomExperienceFromFamilies(
  name: string,
  families: ExperienceFamily[],
  newGrammar: string,
): CustomExperienceDefinition {
  return createCustomExperience({
    name,
    description: `Composed from families: ${families.map((f) => f.family_id).join(', ')} + ${newGrammar}`,
    business_purpose: 'Multi-family custom experience',
    inherits_from: families.map((f) => f.family_id),
    new_family_id: `${name.replace(/\W+/g, '_').toUpperCase()}_FAMILY`,
  });
}
