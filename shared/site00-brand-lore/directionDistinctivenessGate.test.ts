import { describe, expect, it } from 'vitest';
import { runDirectionDistinctivenessGate } from '../../api/_lib/site00Evolve/creativeDirection/personalityReplay/directionDistinctivenessGate.js';
import type { FormedCoreDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';

function direction(partial: Partial<FormedCoreDirection> & { directionName: string }): FormedCoreDirection {
  return {
    directionId: partial.directionId ?? partial.directionName.toLowerCase().replace(/\s+/g, '-'),
    directionName: partial.directionName,
    bigIdea: partial.bigIdea ?? 'Big idea',
    oneLineThesis: partial.oneLineThesis ?? 'Thesis',
    brandConnection: partial.brandConnection ?? 'Connection',
    culturalReference: partial.culturalReference ?? 'Reference',
    emotionalPromise: partial.emotionalPromise ?? 'Promise',
    visualMetaphor: partial.visualMetaphor ?? 'Metaphor',
    governingBehavior: partial.governingBehavior ?? 'Behavior',
    materialImageryLanguage: partial.materialImageryLanguage ?? 'Materials',
    typographicAttitude: partial.typographicAttitude ?? 'Type attitude',
    coreColorLogic: partial.coreColorLogic ?? 'Color logic',
    signatureDevices: partial.signatureDevices ?? ['device'],
    primaryBrandArtifact: partial.primaryBrandArtifact ?? 'Artifact',
    proprietaryQuality: partial.proprietaryQuality ?? 'Proprietary',
    antiDirection: partial.antiDirection ?? ['generic'],
    loreLineage: partial.loreLineage ?? ['lore'],
    conceptualAncestor: partial.conceptualAncestor ?? 'ancestor',
    audienceRole: partial.audienceRole ?? 'audience',
    brandRole: partial.brandRole ?? 'brand',
    imageryLanguage: partial.imageryLanguage ?? 'imagery',
    colorLogic: partial.colorLogic ?? 'color',
    motionSeed: partial.motionSeed ?? 'motion',
    socialExpressionHypothesis: partial.socialExpressionHypothesis ?? 'social',
    risks: partial.risks ?? [],
  };
}

describe('runDirectionDistinctivenessGate', () => {
  it('passes six clearly different directions', () => {
    const dirs = [
      direction({
        directionName: 'THE RECEIPT ROOM',
        oneLineThesis: 'Evidence wall for credit myths',
        visualMetaphor: 'Archive tiles and stamp grids',
        governingBehavior: 'Forensic listing',
        materialImageryLanguage: 'Thermal paper and binders',
        typographicAttitude: 'Monospace inventory labels',
        coreColorLogic: 'Cool gray with red stamp',
        primaryBrandArtifact: 'Receipt carousel cover',
        socialExpressionHypothesis: 'Swipe to compare claims',
      }),
      direction({
        directionName: 'THE COUNTDOWN',
        oneLineThesis: 'Timer tension before statement drop',
        visualMetaphor: 'Clock faces and progress rings',
        governingBehavior: 'Urgency without panic',
        materialImageryLanguage: 'LED segments and chrome',
        typographicAttitude: 'Condensed countdown numerals',
        coreColorLogic: 'Black field amber digits',
        primaryBrandArtifact: 'Story frame countdown',
        socialExpressionHypothesis: 'Hold to reveal utilization',
      }),
      direction({
        directionName: 'THE INDEX',
        oneLineThesis: 'Ranked lists of financial habits',
        visualMetaphor: 'Card catalog drawers',
        governingBehavior: 'Curatorial ordering',
        materialImageryLanguage: 'Bristol tabs and dividers',
        typographicAttitude: 'Small caps index entries',
        coreColorLogic: 'Manila tabs navy type',
        primaryBrandArtifact: 'Saveable reference post',
        socialExpressionHypothesis: 'Pin the index card',
      }),
      direction({
        directionName: 'THE SIGNAL',
        oneLineThesis: 'Pattern scan of market noise',
        visualMetaphor: 'Waveforms and scan lines',
        governingBehavior: 'Signal vs noise framing',
        materialImageryLanguage: 'Oscilloscope phosphor',
        typographicAttitude: 'Technical readout face',
        coreColorLogic: 'Green trace black field',
        primaryBrandArtifact: 'Reel hook waveform',
        socialExpressionHypothesis: 'Loop the glitch reveal',
      }),
      direction({
        directionName: 'THE FORUM',
        oneLineThesis: 'Debate stage for money rules',
        visualMetaphor: 'Podium lights and mic flags',
        governingBehavior: 'Cross-examination tone',
        materialImageryLanguage: 'Stage felt and brass',
        typographicAttitude: 'Bold debate headlines',
        coreColorLogic: 'Spotlight white deep blue',
        primaryBrandArtifact: 'Feed tile debate card',
        socialExpressionHypothesis: 'Comment-ready provocation',
      }),
      direction({
        directionName: 'THE LEDGER',
        oneLineThesis: 'Line items expose hidden fees',
        visualMetaphor: 'Spreadsheet grid and totals',
        governingBehavior: 'Ledger precision',
        materialImageryLanguage: 'Graph paper and pencil',
        typographicAttitude: 'Ledger numerals aligned',
        coreColorLogic: 'Blue lines graphite text',
        primaryBrandArtifact: 'Carousel sequence ledger',
        socialExpressionHypothesis: 'Sequential line reveal',
      }),
    ];
    const result = runDirectionDistinctivenessGate(dirs);
    expect(result.passed).toBe(true);
  });

  it('flags collapse when two directions share most fields', () => {
    const shared = {
      oneLineThesis: 'Marked document editorial proof sheet annotation',
      visualMetaphor: 'Paper strike-through handwritten margin cream',
      governingBehavior: 'Document annotation behavior',
      materialImageryLanguage: 'Distressed paper editorial margin',
      typographicAttitude: 'Serif annotation type',
      coreColorLogic: 'Cream red lime',
      primaryBrandArtifact: 'Proof sheet post',
      socialExpressionHypothesis: 'Carousel cover annotation',
    };
    const result = runDirectionDistinctivenessGate([
      direction({ directionName: 'DIR A', ...shared }),
      direction({ directionName: 'DIR B', ...shared }),
    ]);
    expect(result.passed).toBe(false);
    expect(result.notes.some((n) => n.includes('COLLAPSE'))).toBe(true);
  });
});
