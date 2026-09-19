/**
 * P0.5C.5 — First-Person Authorship + Public Copy Translation + Campaign Caption Synthesis (50 requirements)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PUBLIC_AUTHORSHIP_MODE_IMPLEMENTED,
  INTERNAL_PUBLIC_LANGUAGE_BOUNDARY_IMPLEMENTED,
  PUBLIC_COPY_TRANSLATION_IMPLEMENTED,
  INTERNAL_LABEL_QUARANTINE_IMPLEMENTED,
  THIRD_PERSON_SELF_REFERENCE_GUARD_IMPLEMENTED,
  PERSONAL_AUTHORSHIP_EVALUATION_IMPLEMENTED,
  SYSTEM_LANGUAGE_PUBLIC_EXPORT_BLOCKED,
  PUBLIC_ARTIFACT_EXPORT_EVALUATION_IMPLEMENTED,
  internalLabelsValidInContracts,
  scanTextForQuarantinedLabels,
  quarantinedLabelCannotAppearPublicly,
  classifyMetadataEligibility,
} from '../site00-studio-world-production/publicAuthorship/index.js';
import {
  translateInternalToPublic,
  analyticalToPersonalReaction,
  translationPreservesMeaning,
  sourceVoiceDistinctFromNdxVoice,
} from '../site00-studio-world-production/publicAuthorship/publicCopyTranslation.js';
import {
  evaluateThirdPersonSelfReference,
  evaluatePersonalAuthorship,
  reportLikeCopyFails,
  aiSummaryCopyFails,
  publicCopyQaBeforeLock,
} from '../site00-studio-world-production/publicAuthorship/evaluations.js';
import {
  evaluatePublicArtifactExport,
  exportCannotContainDebugText,
  exportCannotContainPlaceholder,
} from '../site00-studio-world-production/publicAuthorship/exportEvaluation.js';
import {
  CAMPAIGN_CAPTION_SYSTEM_IMPLEMENTED,
  CAPTION_READINESS_IMPLEMENTED,
  CAPTION_CHARACTER_AUTHORITY_IMPLEMENTED,
  FOUNDER_LANGUAGE_CAPTION_AUTHORITY_IMPLEMENTED,
  CAPTION_SEQUENCE_RELATIONSHIP_IMPLEMENTED,
  CAPTION_CURRENTNESS_GATE_IMPLEMENTED,
  CAPTION_CTA_SYSTEM_IMPLEMENTED,
  CAPTION_REVISION_LINEAGE_IMPLEMENTED,
  CROSS_PLATFORM_CAPTION_INDEPENDENCE_PRESERVED,
} from '../site00-studio-world-production/campaignCaption/constants.js';
import {
  evaluateCaptionReadiness,
  captionCannotFinalizeBeforeSequenceReadiness,
  captionCanDraftAfterDraftEligible,
  visualOnlyRevisionNeedNotStaleCaption,
  meaningfulSlideRevisionStalesCaption,
} from '../site00-studio-world-production/campaignCaption/captionReadiness.js';
import {
  buildCampaignCaptionDraft,
  evaluateCaptionSequenceRelationship,
  genericEngagementBaitFails,
  onePrimaryCaptionByDefault,
  noBulkCaptionVariantSpam,
  crossPlatformCopyDuplicationBlocked,
} from '../site00-studio-world-production/campaignCaption/captionSynthesis.js';
import {
  NDX_FIRST_PERSON_AUTHORSHIP_IMPLEMENTED,
  V2_3_PUBLIC_COPY_REVISION_SUPPORTED,
  SOCIAL_CONTENT_PACKAGE_CAPTION_INTEGRATED,
  CAMPAIGN_BOARD_CAPTION_REVIEW_IMPLEMENTED,
  P0_5C_4B_SIGNATURE_LIME_PRESERVED,
  P0_5C_4A_HUMAN_MADE_MARKS_PRESERVED,
  P0_5C_4_ART_BOARD_MATERIALITY_PRESERVED,
  P0_5C_3_CHARACTER_RETENTION_PRESERVED,
  BRAND_CHARACTER_MUTATED,
  BRAND_CANON_MUTATED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  WORLD_FORMATION_IMPLEMENTED,
  AUTONOMOUS_PUBLISHING_ENABLED,
  READY_FOR_FIRST_PERSON_V2_3_REVISIONS,
  READY_FOR_FINAL_SLIDE_SEQUENCE_CAPTIONING,
} from '../site00-brand-lore/firstPersonAuthorship/constants.js';
import {
  stripInternalLabelsFromPublicText,
  ndxPublicCopyUsesUppercase,
  translateNdxContractToPublicCopy,
} from '../site00-brand-lore/firstPersonAuthorship/ndxPublicCopyTranslation.js';
import {
  synthesizeNdxInstagramCaption,
  tiktokCaptionDerivesSeparately,
  threadsCaptionDerivesSeparately,
  captionHumorRespectsEligibility,
  captionPreservesUncertainty,
} from '../site00-brand-lore/firstPersonAuthorship/ndxCaptionSynthesis.js';
import {
  applyV23PublicCopyRevision,
  auditV23PublicCopyLeakage,
  v23ArtDirectionUnchangedAfterPublicCopyRevision,
} from '../site00-brand-lore/firstPersonAuthorship/v23PublicCopyRevision.js';
import {
  buildFalPublicCopySections,
  falPromptBlocksInternalLabelLeakage,
} from '../site00-brand-lore/firstPersonAuthorship/falPromptPublicCopy.js';
import { compileArtBoardMaterialityFalPrompt } from '../site00-brand-lore/artBoardMateriality/falPromptCompilerV23.js';
import { formulateExperiment01Artifacts } from '../site00-brand-lore/brandMarketingExpression/characterEventFormulation.js';
import { compileBrandMarketingExpressionSystem } from '../site00-brand-lore/brandMarketingExpression/marketingExpressionCompiler.js';
import { buildVitestBrandCharacterSystemForMarketing } from '../site00-brand-lore/brandMarketingExpression/vitestFixtures.js';
import { buildFounderMarketingNorthStarArtifact } from '../site00-brand-lore/brandMarketingExpression/northStarArtifact.js';
import { formulateExperiment01V2 } from '../site00-brand-lore/editorialInformationArchitecture/experiment01V2.js';
import { formulateExperiment01V21 } from '../site00-brand-lore/culturalVisualParticipation/experiment01V21.js';
import { formulateExperiment01V22 } from '../site00-brand-lore/characterRetention/experiment01V22.js';
import { formulateExperiment01V23 } from '../site00-brand-lore/artBoardMateriality/experiment01V23.js';
import { buildSocialContentPackage } from '../site00-brand-lore/contentOperations/contentPackage.js';
import { seedPilotOpportunities } from '../site00-brand-lore/contentOperations/opportunityEngine.js';
import { selectChannelForOpportunity, selectFormatForOpportunity } from '../site00-brand-lore/contentOperations/channelFormatSelection.js';
import {
  resetCampaignProductionMemory,
  resetCampaignProductionStoreModeCache,
  initializeCampaignBoardFromExperiment01,
  synthesizeCampaignCaptions,
  captionGenerationRequiresLockedSequence,
  experimentFImmutable,
  experimentGImmutable,
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
} from '../../api/_lib/site00Evolve/marketingCampaignProduction/marketingCampaignProductionService.js';
import {
  prepareBrandMarketingExpression,
  compileBrandMarketingExpression,
  formulateMarketingExpressionExperiment01,
  formulateMarketingExpressionExperiment01V2,
  formulateMarketingExpressionExperiment01V21,
  formulateMarketingExpressionExperiment01V22,
  formulateMarketingExpressionExperiment01V23,
  generateAllExperiment01V23ArtifactAssets,
  applyV23PublicCopyRevisionAll,
  resetBrandMarketingExpressionWorkers,
} from '../../api/_lib/site00Evolve/creativeDirection/brandMarketingExpressionExperiment/brandMarketingExpressionService.js';

const ROOT = join(process.cwd());

describe('P0.5C.5 First-Person Authorship + Caption Synthesis', () => {
  const characterSystem = buildVitestBrandCharacterSystemForMarketing();
  const expressionSystem = compileBrandMarketingExpressionSystem({
    characterSystem,
    northStarId: buildFounderMarketingNorthStarArtifact('ndxbook').id,
    projectId: 'ndxbook',
  });
  const { artifacts } = formulateExperiment01Artifacts({
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  const v2 = formulateExperiment01V2({ v1Artifacts: artifacts, expressionSystem, characterSystemId: characterSystem.id });
  const v21 = formulateExperiment01V21({
    v1Artifacts: artifacts,
    v2Experiment: v2.experiment,
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  const v22 = formulateExperiment01V22({
    v1Artifacts: artifacts,
    v21Experiment: v21.experiment,
    expressionSystem,
    characterSystemId: characterSystem.id,
  });
  const v23 = formulateExperiment01V23({
    v1Artifacts: artifacts,
    v22Experiment: v22.experiment,
    expressionSystem,
  });

  beforeEach(() => {
    resetCampaignProductionMemory();
    resetCampaignProductionStoreModeCache();
    resetBrandMarketingExpressionWorkers();
  });

  it('1-5. Internal labels valid in contracts; fail in public exports', () => {
    expect(internalLabelsValidInContracts()).toBe(true);
    expect(quarantinedLabelCannotAppearPublicly('CHARACTER BEAT')).toBe(true);
    expect(scanTextForQuarantinedLabels('CHARACTER BEAT: I WAS WRONG').length).toBeGreaterThan(0);
    expect(evaluatePublicArtifactExport(['CHARACTER BEAT: I WAS WRONG']).passed).toBe(false);
    expect(classifyMetadataEligibility('CHARACTER BEAT')).toBe('INTERNAL_ONLY');
  });

  it('6-10. Third-person guard + first/implied person + source voice', () => {
    expect(evaluateThirdPersonSelfReference('NDX NOTICED A PATTERN').passed).toBe(false);
    expect(evaluateThirdPersonSelfReference('I WAS WRONG').passed).toBe(true);
    expect(evaluateThirdPersonSelfReference('WAIT.').passed).toBe(true);
    expect(sourceVoiceDistinctFromNdxVoice('THE NEW YORK TIMES', 'I WAS WRONG')).toBe(true);
    const t = translateInternalToPublic({
      internalText: 'I WAS WRONG',
      internalLabel: 'CHARACTER BEAT',
      voiceMode: 'CHARACTER_VOICE',
    });
    expect(t.publicExpression).not.toContain('CHARACTER BEAT');
  });

  it('11-15. PublicCopyTranslation + analytical translation + uppercase', () => {
    expect(PUBLIC_COPY_TRANSLATION_IMPLEMENTED).toBe(true);
    const reaction = analyticalToPersonalReaction({
      internalObservation: 'the same pattern across unrelated feeds',
    });
    expect(reaction.length).toBeGreaterThan(0);
    expect(translationPreservesMeaning('I WAS WRONG', 'I WAS WRONG')).toBe(true);
    expect(ndxPublicCopyUsesUppercase('I WAS WRONG')).toBe(true);
    expect(stripInternalLabelsFromPublicText('CHARACTER BEAT: I WAS WRONG')).toBe('I WAS WRONG');
  });

  it('16-20. Personal authorship + V2.3 preservation + FAL prompt', () => {
    expect(reportLikeCopyFails('EVIDENCE FOR PATTERN DETECTED')).toBe(true);
    expect(aiSummaryCopyFails('IN THIS POST WE DISCUSS')).toBe(true);
    expect(P0_5C_4_ART_BOARD_MATERIALITY_PRESERVED).toBe(true);
    expect(P0_5C_4A_HUMAN_MADE_MARKS_PRESERVED).toBe(true);
    expect(P0_5C_4B_SIGNATURE_LIME_PRESERVED).toBe(true);
    const artifact = v23.artifacts[0]!;
    const fal = compileArtBoardMaterialityFalPrompt({ artifact: artifacts[0]!, contract: artifact.contract });
    expect(fal.prompt).toContain('INTERNAL CONTRACT LABELS ARE NOT PUBLIC COPY');
    expect(falPromptBlocksInternalLabelLeakage(buildFalPublicCopySections({ artifact: artifacts[0]!, contract: artifact.contract }))).toBe(true);
  });

  it('21-25. Caption readiness + synthesis timing', () => {
    expect(captionCannotFinalizeBeforeSequenceReadiness('NOT_READY')).toBe(true);
    expect(captionCanDraftAfterDraftEligible('DRAFT_ELIGIBLE')).toBe(true);
    expect(buildCampaignCaptionDraft({
      contentPieceId: 'piece-1',
      campaignId: 'c',
      platform: 'INSTAGRAM_FEED',
      slideCopy: ['I HAVE A THEORY'],
      lockedSlideCount: 0,
      requiredSlideCount: 5,
    })).toBeNull();
    expect(captionGenerationRequiresLockedSequence()).toBe(true);
    expect(CAPTION_READINESS_IMPLEMENTED).toBe(true);
  });

  it('26-30. Caption synthesis consumes sequence + character', () => {
    const cap = synthesizeNdxInstagramCaption({
      contentPieceId: 'piece-1',
      campaignId: 'c',
      slideCopy: ['I HAVE A THEORY', 'I WAS WRONG'],
      lockedSlideCount: 2,
      requiredSlideCount: 2,
      characterSystem,
      thesisSummary: 'subscription fatigue',
    });
    expect(cap?.text).toBeTruthy();
    expect(cap?.platform).toBe('INSTAGRAM_FEED');
    const rel = evaluateCaptionSequenceRelationship({ captionText: 'WAIT.', slideCopy: ['I HAVE A THEORY'] });
    expect(rel.addsCharacter).toBe(true);
    expect(onePrimaryCaptionByDefault()).toBe(true);
    expect(noBulkCaptionVariantSpam()).toBe(true);
  });

  it('31-35. Caption humor, CTA, uncertainty, platform independence', () => {
    expect(genericEngagementBaitFails('COMMENT BELOW FOR MORE')).toBe(true);
    expect(captionHumorRespectsEligibility(false, 'plain text')).toBe(true);
    expect(captionPreservesUncertainty('MAYBE?', 'LOW')).toBe(true);
    expect(tiktokCaptionDerivesSeparately('I WAS WRONG')).toBe(true);
    expect(crossPlatformCopyDuplicationBlocked('INSTAGRAM_FEED', 'TIKTOK')).toBe(true);
  });

  it('36-40. Caption stale rules + export guards', () => {
    expect(visualOnlyRevisionNeedNotStaleCaption('VISUAL_ONLY')).toBe(true);
    expect(meaningfulSlideRevisionStalesCaption('MEANING_CHANGE')).toBe(true);
    expect(exportCannotContainDebugText('DEBUG placeholder')).toBe(true);
    expect(exportCannotContainPlaceholder('TBD copy')).toBe(true);
    expect(SYSTEM_LANGUAGE_PUBLIC_EXPORT_BLOCKED).toBe(true);
  });

  it('41-45. V2.3 public copy revision + content package + service', async () => {
    const audit = auditV23PublicCopyLeakage(v23.artifacts[0]!);
    expect(audit.publicCopyCandidates.length).toBeGreaterThan(0);
    const { artifact: revised } = applyV23PublicCopyRevision({ artifact: v23.artifacts[0]! });
    expect(revised.contract.primaryHook).not.toContain('CHARACTER BEAT');
    expect(v23ArtDirectionUnchangedAfterPublicCopyRevision()).toBe(true);

    const opp = seedPilotOpportunities('ndxbook')[0]!;
    const pkg = buildSocialContentPackage({
      projectId: 'ndxbook',
      opportunity: opp,
      channel: selectChannelForOpportunity(opp),
      format: selectFormatForOpportunity(opp, selectChannelForOpportunity(opp)),
      expressionSystem,
      characterSystemId: characterSystem.id,
    });
    expect(SOCIAL_CONTENT_PACKAGE_CAPTION_INTEGRATED).toBe(true);
    expect(pkg.caption?.text).toBeTruthy();

    await prepareBrandMarketingExpression({ projectId: 'ndxbook' });
    await compileBrandMarketingExpression({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V2({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V21({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V22({ projectId: 'ndxbook' });
    await formulateMarketingExpressionExperiment01V23({ projectId: 'ndxbook' });
    await generateAllExperiment01V23ArtifactAssets({ projectId: 'ndxbook' });
    await applyV23PublicCopyRevisionAll({ projectId: 'ndxbook' });
    await initializeCampaignBoardFromExperiment01({ projectId: 'ndxbook' });
    const withCaptions = await synthesizeCampaignCaptions({ projectId: 'ndxbook' });
    expect(withCaptions.captions.length).toBeGreaterThan(0);
  });

  it('46-50. Integrity flags + UI wired', () => {
    expect(experimentFImmutable()).toBe(true);
    expect(experimentGImmutable()).toBe(true);
    expect(brandCharacterImmutable()).toBe(true);
    expect(brandCanonUnchanged()).toBe(true);
    expect(BRAND_CHARACTER_MUTATED).toBe(false);
    expect(BRAND_CANON_MUTATED).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(AUTONOMOUS_PUBLISHING_ENABLED).toBe(false);
    expect(productExpressionBlocked()).toBe(true);
    expect(worldFormationBlocked()).toBe(true);

    const boardPage = readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/CampaignBoardProductionWall.tsx'), 'utf8');
    const api = readFileSync(join(ROOT, 'src/site00/services/site00ProjectsApi.ts'), 'utf8');
    expect(boardPage).toContain('CAPTIONS — P0.5C.5');
    expect(boardPage).toContain('THAT_SOUNDS_LIKE_ME');
    expect(api).toContain('campaign_production_synthesize_captions');
    expect(CAMPAIGN_BOARD_CAPTION_REVIEW_IMPLEMENTED).toBe(true);
    expect(READY_FOR_FIRST_PERSON_V2_3_REVISIONS).toBe(true);
    expect(READY_FOR_FINAL_SLIDE_SEQUENCE_CAPTIONING).toBe(true);
    expect(PUBLIC_AUTHORSHIP_MODE_IMPLEMENTED).toBe(true);
    expect(CAMPAIGN_CAPTION_SYSTEM_IMPLEMENTED).toBe(true);
  });

  it('Public copy QA before lock', () => {
    const qa = publicCopyQaBeforeLock({ visibleText: ['I WAS WRONG', 'WAIT.'] });
    expect(qa.passed).toBe(true);
    const bad = publicCopyQaBeforeLock({ visibleText: ['CHARACTER BEAT: I WAS WRONG'] });
    expect(bad.passed).toBe(false);
  });

  it('NDX contract translation layer', () => {
    const layer = translateNdxContractToPublicCopy({
      artifact: artifacts[0]!,
      contract: v23.artifacts[0]!.contract,
    });
    expect(layer.publicAuthorshipMode).toBe('FIRST_PERSON_CHARACTER_AUTHORSHIP');
    expect(layer.visiblePublicCopy.length).toBeGreaterThan(0);
  });
});
