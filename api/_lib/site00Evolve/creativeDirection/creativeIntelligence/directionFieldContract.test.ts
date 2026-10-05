import { describe, expect, it } from 'vitest';
import {
  assessDirectionProductionCompleteness,
  buildFounderDirectionPresentationFields,
  normalizeFormedDirection,
} from './directionFieldContract.js';

describe('directionFieldContract', () => {
  it('maps aliases onto canonical fields', () => {
    const normalized = normalizeFormedDirection({
      directionId: 'd1',
      name: 'THE INDEX',
      thesis: 'FIND THE SIGNAL.',
      whyThisBelongs: 'From Brand Lore world metaphor',
      centralMetaphor: 'Living index',
      materialLanguage: 'Paper and screen',
      typography: 'Editorial mono',
      primaryArtifact: 'Index card',
      loreLineage: ['Teen magazines'],
      risks: ['Could feel archival'],
      bigIdea: 'Signal hunting',
      governingBehavior: 'Rank and surface',
    });

    expect(normalized.directionName).toBe('THE INDEX');
    expect(normalized.oneLineThesis).toBe('FIND THE SIGNAL.');
    expect(normalized.brandConnection).toBe('From Brand Lore world metaphor');
    expect(normalized.visualMetaphor).toBe('Living index');
    expect(normalized.materialImageryLanguage).toBe('Paper and screen');
    expect(normalized.typographicAttitude).toBe('Editorial mono');
    expect(normalized.primaryBrandArtifact).toBe('Index card');
  });

  it('omits empty founder fields by default', () => {
    const fields = buildFounderDirectionPresentationFields(
      normalizeFormedDirection({
        directionId: 'd1',
        directionName: 'INCOMPLETE',
        bigIdea: 'Only big idea',
        oneLineThesis: 'Thesis',
        governingBehavior: 'Behavior',
        loreLineage: [],
        risks: [],
      }),
    );

    expect(fields.some((f) => f.key === 'brandConnection')).toBe(false);
    expect(fields.some((f) => f.key === 'bigIdea')).toBe(true);
  });

  it('flags incomplete directions for visual production', () => {
    const result = assessDirectionProductionCompleteness(
      normalizeFormedDirection({
        directionId: 'd1',
        directionName: 'PARTIAL',
        bigIdea: 'Idea',
        oneLineThesis: 'Thesis',
        governingBehavior: 'Behavior',
        loreLineage: ['line'],
        primaryBrandArtifact: 'Artifact',
        brandConnection: 'Connection',
        visualMetaphor: 'Metaphor',
        conceptualAncestor: 'Ancestor',
        materialImageryLanguage: 'Material',
        imageryLanguage: 'Imagery',
        typographicAttitude: 'Type',
        colorLogic: 'Color',
        motionSeed: 'Motion',
        socialExpressionHypothesis: 'Social',
        risks: ['Risk'],
      }),
    );

    expect(result.complete).toBe(true);
    expect(result.missingFields).toEqual([]);
  });
});
