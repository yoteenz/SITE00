/**
 * P0.CJ.2 — Creative Judgment Presentation System tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapConceptReviewGallery,
  resetConceptPanelStoreForTest,
  submitConceptPanelFounderJudgment,
} from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/creativeJudgmentPresentationBootstrap.js';
import {
  applyFounderJudgmentToPanel,
  mapJudgmentToConceptPanel,
} from '../shared/site00-expression-engine/creative-judgment-presentation/conceptPanelMapper.js';
import {
  buildSavorCelesteConceptPanel,
  buildSavorCelestePrivateRoomInput,
  SAVOR_CELESTE_PROFILE,
  THE_PRIVATE_ROOM_TERRITORY,
} from '../shared/site00-expression-engine/creative-judgment-presentation/savorCelesteCase.js';
import { runCreativeJudgmentIntelligence } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/creativeJudgmentIntelligenceEngine.js';
import { buildEntry003JudgmentInput, buildEntry003Territory } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/entry003GoldenFixture.js';
import { resetFounderJudgmentMemoryForTest } from '../api/_lib/site00ExpressionEngine/creativeJudgmentIntelligence/founderJudgmentMemory.js';

describe('P0.CJ.2 — Creative Judgment Presentation', () => {
  beforeEach(() => {
    resetConceptPanelStoreForTest();
    resetFounderJudgmentMemoryForTest();
  });

  it('1. concept panel schema fields present', () => {
    const judgment = runCreativeJudgmentIntelligence(buildSavorCelestePrivateRoomInput());
    const panel = buildSavorCelesteConceptPanel(judgment);
    expect(panel.id).toBeTruthy();
    expect(panel.conceptTitle).toBe('THE PRIVATE ROOM');
    expect(panel.centralTension).toBeTruthy();
    expect(panel.diagnostics.fullReasoning).toBeTruthy();
  });

  it('2. maps engine output to summary structure', () => {
    const judgment = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
    const panel = mapJudgmentToConceptPanel({
      judgment,
      territory: buildEntry003Territory(),
      brandName: 'NDXBOOK',
      caseType: 'invented',
      groundingMode: 'profile_grounded',
    });
    expect(panel.oneLinePremise.length).toBeGreaterThan(10);
    expect(panel.score).toBe(judgment.overallScore);
  });

  it('3. diagnostics separated from summary', () => {
    const payload = bootstrapConceptReviewGallery();
    const panel = payload.concepts[0]!;
    expect(panel.diagnostics.engineJudgment).not.toBeNull();
    expect(panel.diagnostics.fullReasoning.length).toBeGreaterThan(20);
  });

  it('4. gallery bootstrap includes Savor Celeste', () => {
    const payload = bootstrapConceptReviewGallery();
    expect(payload.concepts.some((c) => c.brandName === 'Savor Celeste')).toBe(true);
    expect(payload.brandCases[0]?.brandId).toBe('savor-celeste');
  });

  it('5. Savor Celeste marked profile-grounded', () => {
    expect(SAVOR_CELESTE_PROFILE.groundingMode).toBe('profile_grounded');
    expect(SAVOR_CELESTE_PROFILE.groundingLabel).toBe('PROFILE-GROUNDED');
    expect(SAVOR_CELESTE_PROFILE.liveFetchAvailable).toBe(false);
  });

  it('6. The Private Room concept preserved', () => {
    expect(THE_PRIVATE_ROOM_TERRITORY.conceptName).toBe('THE PRIVATE ROOM');
    expect(THE_PRIVATE_ROOM_TERRITORY.oneSentenceIdea).toMatch(/room you close|remember in scent/i);
  });

  it('7. real brand demo flag', () => {
    const payload = bootstrapConceptReviewGallery();
    const savor = payload.concepts.find((c) => c.brandName === 'Savor Celeste');
    expect(savor?.isRealBrandDemo).toBe(true);
    expect(savor?.caseType).toBe('real_brand');
  });

  it('8. founder judgment persists on panel', () => {
    bootstrapConceptReviewGallery();
    const updated = submitConceptPanelFounderJudgment({
      conceptId: 'savor-celeste-private-room',
      judgment: 'LOVE_IT',
      whyIFeelThis: 'Strong intimacy mechanism',
    });
    expect(updated?.founderJudgment).toBe('LOVE_IT');
    expect(updated?.founderNotes.whyIFeelThis).toBe('Strong intimacy mechanism');
  });

  it('9. approved for next stage updates status', () => {
    const judgment = runCreativeJudgmentIntelligence(buildSavorCelestePrivateRoomInput());
    const panel = buildSavorCelesteConceptPanel(judgment);
    const next = applyFounderJudgmentToPanel(panel, 'APPROVED_FOR_NEXT_STAGE', {});
    expect(next.status).toBe('APPROVED_FOR_NEXT_STAGE');
  });

  it('10. presentation version tag', () => {
    const payload = bootstrapConceptReviewGallery();
    expect(payload.presentationVersion).toBe('P0.CJ.2V');
    expect(payload.level).toBe('CONCEPT_GALLERY');
    expect(payload.trailerModeAvailable).toBe(true);
  });

  it('11. invented and real brand cases coexist', () => {
    const payload = bootstrapConceptReviewGallery();
    expect(payload.concepts.some((c) => c.caseType === 'invented')).toBe(true);
    expect(payload.concepts.some((c) => c.caseType === 'real_brand')).toBe(true);
    expect(payload.concepts.length).toBeGreaterThanOrEqual(4);
  });

  it('13. sleep debt archive concept present', () => {
    const payload = bootstrapConceptReviewGallery();
    expect(payload.concepts.some((c) => c.conceptTitle === 'THE SLEEP DEBT ARCHIVE')).toBe(true);
  });

  it('12. ndx leak status on non-ndx concept', () => {
    const payload = bootstrapConceptReviewGallery();
    const verdant = payload.concepts.find((c) => c.brandName.toUpperCase().includes('VERDANT'));
    expect(verdant?.ndxLeakStatus).toBeDefined();
  });
});
