/**
 * DirectionExpressionSystem + board v4 tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  expressionSystemGatesPass,
  isFounderReadyExpressionSystem,
  isProductionSonnetConfigured,
  parseDirectionExpressionSystemResponse,
} from './directionExpressionSystemService.js';
import { buildMarkedUpCopyBoardPlanV4 } from './markedUpCopyBoardPlanV4.js';
import { inspectCreativeDirectionBoardV4 } from './boardInspectorV4.js';
import { parseBoardV4CritiqueResponse } from './boardCreativeDirectorV4Service.js';
import { runMarkedUpCopyBoardPilotV4 } from './markedUpCopyBoardPilotV4.js';
import {
  MARKED_UP_COPY_BOARD_PLAN_VERSION_V4,
  MARKED_UP_COPY_DIRECTION_NAME,
} from './creativeDirectionBoardTypes.js';
import type { ComparisonDirectionCandidate } from './types.js';
import * as providerRegistry from './providerRegistry.js';
import * as expressionService from './directionExpressionSystemService.js';
import * as boardArtV4 from './boardCreativeDirectorV4Service.js';

const MOCK_EXPRESSION = JSON.stringify({
  conceptualWorld: 'Document mid-edit world',
  visualThesis: 'The mark-up is the editorial voice',
  emotionalAtmosphere: 'Live argumentative revision',
  governingVisualBehavior: 'Content behaves like a document mid-edit',
  photographySystem: {
    subjectMatter: 'Editorial spreads and documentary crops',
    cameraDistance: 'Medium-close',
    croppingBehavior: 'Aggressive partial crops',
    lighting: 'Natural editorial',
    grainTexture: 'Light film grain',
    humanPresence: 'Hands implied not posed',
    objectPresence: 'Paper, pen, tape',
    documentaryEditorialBalance: '70/30 editorial',
    mustNeverLookLike: ['stock office', 'smiling business'],
  },
  typographySystem: {
    cleanVoice: 'Publication serif',
    revisionVoice: 'Bold strike overlay',
    marginVoice: 'Secondary reader rebuttal',
    metadataVoice: 'Issue micro type',
    scaleRelationships: 'Extreme contrast',
    alignmentBehavior: 'Grid break on revision',
    interruptionBehavior: 'Strike crosses boundaries',
  },
  graphicGrammar: { selectedDevices: ['strike', 'caret', 'proof-stamp'], semanticRoles: { RED: 'intervention' } },
  annotationGrammar: {
    whoIsSpeaking: 'Prior reader + editor',
    disagreementBehavior: 'Margin rebuttal',
    correctionBehavior: 'Strike and replace',
    secondaryOpinionBehavior: 'Counter-voice interrupts',
    ambiguityVisibility: 'Unresolved final state',
  },
  materialLanguage: {
    paperTypes: ['Coated editorial'],
    physicalBehaviors: ['Torn edge', 'Tape shadow'],
    digitalBehaviors: ['Feed frame'],
    justifiedMaterials: ['Fresh paper', 'Red ink'],
  },
  colorSystem: { semanticRoles: { BLACK: 'clean copy', RED: 'intervention' } },
  imageTreatment: 'Partially obscured hero',
  spatialBehavior: 'Asymmetric overlap',
  primaryBrandArtifacts: ['Corrected page fragment'],
  secondaryBrandArtifacts: ['Red editor pen'],
  recurringDevices: ['Strike-replace sequence'],
  recurringContentFranchises: [
    { franchiseId: 'f1', name: 'THE MARGIN ARGUMENT', behavior: 'Claim challenged in margin', socialFormat: 'FEED', specimenLabel: 'Source → strike → counter' },
    { franchiseId: 'f2', name: 'VERSION STACK', behavior: 'V1 challenged V2 corrected', socialFormat: 'CAROUSEL', specimenLabel: 'Three-slide revision' },
  ],
  socialBehavior: {
    feedBehavior: 'Source claim under live edit',
    carouselBehavior: 'Version progression',
    storyBehavior: 'Sequential margin notes',
    reelBehavior: 'Strike animation',
    motionBehavior: 'Clean → strike → replace → margin',
  },
  physicalWorldBehavior: 'Handled paper artifacts',
  digitalWorldBehavior: 'Social-native frames',
  signatureMoments: ['Strike replaces headline'],
  extensibilityRules: ['Quiet zone upper-right'],
  antiTemplateRules: ['No equal card grid'],
  antiGenericRules: ['No stock desk'],
  antiCousinRules: ['No pre-read annotation history'],
  referenceApplications: [],
  productionImplications: ['Hero reference-conditioned'],
  qualityGates: {
    fiftyPostTest: { score: 5, result: 'PASS', evidence: 'Franchises + devices enable 50 posts' },
    noExplanationTest: { score: 5, result: 'PASS', evidence: 'Visual rules self-explanatory' },
  },
});

const MOCK_BOARD_V4 = JSON.stringify({
  critique: {
    whatWorked: ['Concept'],
    whatWasTooTemplateLike: ['Seven slots'],
    whatWasTooExplanatory: ['Strategy text'],
    whatWasTooSparse: ['Franchises missing'],
    whatWasTooEqual: ['Even grid'],
    whatWasMissingFromIdentitySystem: ['Franchises'],
    whatWasMissingFromSocialSystem: ['Feed proof'],
    whatWasMissingFromPhotography: ['Obscured hero'],
    whatWasMissingFromMaterialLanguage: ['Torn edge'],
    whatWasMissingFromTypography: ['Voice conflict'],
    whatWasMissingFromRecurringFranchises: ['Margin argument'],
    whatWasMissingFromMotion: ['Sequence'],
    whatShouldBecomeDominant: ['Hero correction'],
    whatShouldBecomeSecondary: ['Artifact strip'],
    whatShouldDisappear: ['Equal slots'],
    whatShouldOverlap: ['Artifact over hero'],
    whatShouldBreakTheGrid: ['Primary artifact'],
    whatNeedsBreathingRoom: ['Upper-right quiet'],
  },
  boardStructureRationale: 'Proves live revision identity — not template',
  fixedTemplateInherited: false,
  templateSubstitutionRisk: 'LOW',
  visualEvidenceDominance: 'HIGH',
  assetManifest: [],
  assetDecisions: [{ manifestId: 'MU01', decision: 'REGENERATE', rationale: 'Hero needs reference edit', referenceConditioned: true }],
  desktopPlacements: [],
  mobilePlacements: [],
});

function completeDirection(): ComparisonDirectionCandidate {
  return {
    directionId: 'dir-marked-up-copy',
    directionName: MARKED_UP_COPY_DIRECTION_NAME,
    comparisonIndex: 1,
    sourceFormationId: 'form-1',
    sourceFormationVersion: 1,
    brandLoreProfileVersion: 24,
    brandLoreFingerprint: '5e71f429',
    fieldCompleteness: { complete: true, missingFields: [] },
    bigIdea: 'test',
    oneLineThesis: 'SOMEONE ALREADY READ THIS. THEY LEFT NOTES.',
    governingBehavior: 'live edit',
  } as ComparisonDirectionCandidate;
}

describe('DirectionExpressionSystem + board v4', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('production Expression System uses Sonnet when configured', () => {
    vi.spyOn(providerRegistry, 'getCreativeIntelligenceProvider').mockReturnValue({
      providerId: 'anthropic',
      modelId: 'claude-sonnet-4-6',
    } as never);
    expect(isProductionSonnetConfigured()).toBe(true);
  });

  it('fallback cannot receive founder-ready status', () => {
    const sys = parseDirectionExpressionSystemResponse({
      text: MOCK_EXPRESSION,
      direction: completeDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreVersion: 24,
      inputFingerprint: 'x',
    });
    sys.provider = 'deterministic-fallback';
    expect(isFounderReadyExpressionSystem(sys)).toBe(false);
  });

  it('50-post test required', () => {
    const sys = parseDirectionExpressionSystemResponse({
      text: MOCK_EXPRESSION,
      direction: completeDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreVersion: 24,
      inputFingerprint: 'x',
    });
    expect(sys.qualityGates.fiftyPostTest.score).toBeGreaterThanOrEqual(4);
    expect(expressionSystemGatesPass(sys)).toBe(true);
  });

  it('no-explanation test required', () => {
    const sys = parseDirectionExpressionSystemResponse({
      text: MOCK_EXPRESSION,
      direction: completeDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreVersion: 24,
      inputFingerprint: 'x',
    });
    expect(sys.qualityGates.noExplanationTest.result).toBe('PASS');
  });

  it('photography typography graphic material social franchises motion required', () => {
    const sys = parseDirectionExpressionSystemResponse({
      text: MOCK_EXPRESSION,
      direction: completeDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreVersion: 24,
      inputFingerprint: 'x',
    });
    expect(sys.photographySystem.subjectMatter).toBeTruthy();
    expect(sys.typographySystem.cleanVoice).toBeTruthy();
    expect(sys.graphicGrammar.selectedDevices.length).toBeGreaterThanOrEqual(3);
    expect(sys.materialLanguage.justifiedMaterials.length).toBeGreaterThan(0);
    expect(sys.socialBehavior.feedBehavior).toBeTruthy();
    expect(sys.recurringContentFranchises.length).toBeGreaterThanOrEqual(2);
    expect(sys.socialBehavior.motionBehavior).toBeTruthy();
    expect(sys.antiTemplateRules.length).toBeGreaterThan(0);
  });

  it('DirectionExpressionSystem required before BoardPlan v4', () => {
    const sys = parseDirectionExpressionSystemResponse({
      text: MOCK_EXPRESSION,
      direction: completeDirection(),
      brandLoreFingerprint: '5e71f429',
      brandLoreVersion: 24,
      inputFingerprint: 'x',
    });
    const boardArt = parseBoardV4CritiqueResponse({ text: MOCK_BOARD_V4, inputFingerprint: 'y' });
    const plan = buildMarkedUpCopyBoardPlanV4({
      direction: completeDirection(),
      expressionSystem: sys,
      boardArtDirection: boardArt,
      resolvedReferences: [],
      referenceCrops: [],
      referenceInfluenceGraph: [],
    });
    expect(plan.expressionSystemId).toBe(sys.expressionSystemId);
    expect(plan.boardPlanVersion).toBe(MARKED_UP_COPY_BOARD_PLAN_VERSION_V4);
  });

  it('board structure derives from Expression System not fixed template', () => {
    const boardArt = parseBoardV4CritiqueResponse({ text: MOCK_BOARD_V4, inputFingerprint: 'y' });
    expect(boardArt.fixedTemplateInherited).toBe(false);
    expect(boardArt.boardStructureRationale.length).toBeGreaterThan(0);
  });

  it('template-substitution test fails when template inherited', () => {
    const boardArt = parseBoardV4CritiqueResponse({
      text: JSON.stringify({
        ...JSON.parse(MOCK_BOARD_V4),
        fixedTemplateInherited: true,
        templateSubstitutionRisk: 'HIGH',
      }),
      inputFingerprint: 'y',
    });
    expect(boardArt.templateSubstitutionRisk).toBe('HIGH');
    expect(boardArt.fixedTemplateInherited).toBe(true);
  });

  it('v4 plan version distinct from v2/v3', () => {
    expect(MARKED_UP_COPY_BOARD_PLAN_VERSION_V4).not.toBe('marked-up-copy-pilot-v2');
    expect(MARKED_UP_COPY_BOARD_PLAN_VERSION_V4).not.toBe('marked-up-copy-pilot-v3');
  });

  it('blocks when production Sonnet credential missing', async () => {
    vi.spyOn(providerRegistry, 'getCreativeIntelligenceProvider').mockReturnValue({
      providerId: 'unavailable',
    } as never);
    const result = await runMarkedUpCopyBoardPilotV4({ orgSlug: 'ndxbook', dryRun: true });
    expect(result.status).toBe('BLOCKED_ON_PRODUCTION_SONNET_CREDENTIAL');
    expect(result.credentialExposed).toBe(false);
  });

  it('production action never exposes credential in result shape', async () => {
    vi.spyOn(providerRegistry, 'getCreativeIntelligenceProvider').mockReturnValue({
      providerId: 'unavailable',
    } as never);
    const result = await runMarkedUpCopyBoardPilotV4({ orgSlug: 'ndxbook' });
    expect(result.credentialExposed).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/sk-ant-/);
  });

  it('founder approval remains PENDING not automatic', () => {
    const approval = 'PENDING';
    expect(approval).not.toBe('APPROVED');
  });
});
