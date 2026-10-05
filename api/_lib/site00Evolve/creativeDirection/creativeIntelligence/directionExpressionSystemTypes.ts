/**
 * DirectionExpressionSystem — bridge between Core Direction and CreativeDirectionBoardPlan.
 * PRE-VISUAL-DNA · PROPOSED · direction-specific founder-review evidence.
 */

import type { BoardReferenceTranslationDecision } from './creativeDirectionBoardTypes.js';

export const DIRECTION_EXPRESSION_SYSTEM_PROMPT_VERSION = 'marked-up-copy-direction-expression-v4';

export type PhotographySystemSpec = {
  subjectMatter: string;
  cameraDistance: string;
  croppingBehavior: string;
  lighting: string;
  grainTexture: string;
  humanPresence: string;
  objectPresence: string;
  documentaryEditorialBalance: string;
  mustNeverLookLike: string[];
};

export type TypographySystemSpec = {
  cleanVoice: string;
  revisionVoice: string;
  marginVoice: string;
  metadataVoice: string;
  scaleRelationships: string;
  alignmentBehavior: string;
  interruptionBehavior: string;
};

export type GraphicGrammarSpec = {
  selectedDevices: string[];
  semanticRoles: Record<string, string>;
};

export type AnnotationGrammarSpec = {
  whoIsSpeaking: string;
  disagreementBehavior: string;
  correctionBehavior: string;
  secondaryOpinionBehavior: string;
  ambiguityVisibility: string;
};

export type MaterialLanguageSpec = {
  paperTypes: string[];
  physicalBehaviors: string[];
  digitalBehaviors: string[];
  justifiedMaterials: string[];
};

export type ColorSystemSpec = {
  semanticRoles: Record<string, string>;
};

export type ContentFranchiseSpec = {
  franchiseId: string;
  name: string;
  behavior: string;
  socialFormat: 'FEED' | 'CAROUSEL' | 'STORY' | 'REEL' | 'EDITORIAL';
  specimenLabel: string;
};

export type SocialBehaviorSpec = {
  feedBehavior: string;
  carouselBehavior: string;
  storyBehavior: string;
  reelBehavior: string;
  motionBehavior: string;
};

export type ExpressionSystemQualityGates = {
  fiftyPostTest: { score: number; result: 'PASS' | 'FAIL'; evidence: string };
  noExplanationTest: { score: number; result: 'PASS' | 'FAIL'; evidence: string };
};

export type DirectionExpressionSystem = {
  expressionSystemId: string;
  directionId: string;
  directionName: string;
  sourceFormationId: string;
  sourceFormationVersion: number;
  brandLoreVersion: number;
  brandLoreFingerprint: string;

  conceptualWorld: string;
  visualThesis: string;
  emotionalAtmosphere: string;
  governingVisualBehavior: string;

  photographySystem: PhotographySystemSpec;
  typographySystem: TypographySystemSpec;
  graphicGrammar: GraphicGrammarSpec;
  annotationGrammar: AnnotationGrammarSpec;
  materialLanguage: MaterialLanguageSpec;
  colorSystem: ColorSystemSpec;
  imageTreatment: string;
  spatialBehavior: string;

  primaryBrandArtifacts: string[];
  secondaryBrandArtifacts: string[];
  recurringDevices: string[];
  recurringContentFranchises: ContentFranchiseSpec[];

  socialBehavior: SocialBehaviorSpec;

  physicalWorldBehavior: string;
  digitalWorldBehavior: string;

  signatureMoments: string[];
  extensibilityRules: string[];
  antiTemplateRules: string[];
  antiGenericRules: string[];
  antiCousinRules: string[];

  referenceApplications: BoardReferenceTranslationDecision[];
  productionImplications: string[];

  qualityGates: ExpressionSystemQualityGates;

  provider: string;
  model: string;
  promptVersion: string;
  inputFingerprint: string;
  outputHash: string;
  createdAt: string;
};

export type BoardV4CreativeCritique = {
  whatWorked: string[];
  whatWasTooTemplateLike: string[];
  whatWasTooExplanatory: string[];
  whatWasTooSparse: string[];
  whatWasTooEqual: string[];
  whatWasMissingFromIdentitySystem: string[];
  whatWasMissingFromSocialSystem: string[];
  whatWasMissingFromPhotography: string[];
  whatWasMissingFromMaterialLanguage: string[];
  whatWasMissingFromTypography: string[];
  whatWasMissingFromRecurringFranchises: string[];
  whatWasMissingFromMotion: string[];
  whatShouldBecomeDominant: string[];
  whatShouldBecomeSecondary: string[];
  whatShouldDisappear: string[];
  whatShouldOverlap: string[];
  whatShouldBreakTheGrid: string[];
  whatNeedsBreathingRoom: string[];
  lineage: {
    provider: string;
    model: string;
    promptVersion: string;
    inputFingerprint: string;
    outputHash: string;
    createdAt: string;
  };
};
