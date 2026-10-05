import { describe, expect, it } from 'vitest';
import {
  journeyStageStatus,
  parseTerritories,
  sonnetHandoffBlocked,
} from '../src/site00/components/studio/creativeWorkspace/creativeWorkspaceUtils.js';
import type { CreativeArtifact } from '../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import { validateTaskOutput } from '../shared/studioos-experience-compiler/creativeDirector/outputValidation.js';

const sampleTerritory = {
  territory_id: 'A',
  name: 'Private World',
  core_idea: 'Core',
  spatial_metaphor: 'Metaphor',
  emotional_objective: 'Emotion',
  experience_logic: 'Logic',
  information_architecture: 'IA',
  interaction_language: 'Interaction',
  visual_language: 'Visual',
  mobile_expression: 'Mobile',
  tablet_expression: 'Tablet',
  desktop_expression: 'Desktop',
  app_expression: 'App',
  image_authority_needs: [],
  live_code_needs: [],
  risks: [],
  failure_conditions: [],
  project_alignment: 'Fit',
};

describe('ExperienceCompilerCreativeWorkspace', () => {
  it('parseTerritories returns exactly array from artifact', () => {
    const artifact = {
      payload: { territories: [sampleTerritory, { ...sampleTerritory, territory_id: 'B', name: 'B' }, { ...sampleTerritory, territory_id: 'C', name: 'C' }] },
    } as CreativeArtifact;
    expect(parseTerritories(artifact)).toHaveLength(3);
  });

  it('requires exactly 3 territories in validation (no fake partial sets)', () => {
    const two = validateTaskOutput('CONCEPT_TERRITORIES', { territories: [sampleTerritory, sampleTerritory] });
    expect(two.ok).toBe(false);
  });

  it('journey marks intelligence active before thread exists', () => {
    expect(journeyStageStatus('INTELLIGENCE', null, 'CONCEPT_TERRITORIES')).toBe('ACTIVE');
    expect(journeyStageStatus('CONCEPT', null, 'CONCEPT_TERRITORIES')).toBe('NOT_STARTED');
  });

  it('sonnet handoff blocked without readiness', () => {
    expect(sonnetHandoffBlocked(null)).toBe(true);
    expect(
      sonnetHandoffBlocked({
        downstream_readiness: { sonnet: false, visual_authority_model: false, opus: false, asset_surgery: false, composer: false },
      } as never),
    ).toBe(true);
  });
});
