/**
 * P0.CJ.2 — Concept Gallery presentation bootstrap.
 */

import type { ConceptGalleryPayload, ConceptPanel, PresentationFounderJudgment } from '../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';
import {
  applyFounderJudgmentToPanel,
  mapJudgmentToConceptPanel,
} from '../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptPanelMapper.js';
import {
  buildSavorCelesteConceptPanel,
  buildSavorCelestePrivateRoomInput,
  SAVOR_CELESTE_PROFILE,
} from '../../../../shared/site00-expression-engine/creative-judgment-presentation/savorCelesteCase.js';
import { buildEntry003JudgmentInput, buildEntry003Territory } from './entry003GoldenFixture.js';
import { buildVerdantRowJudgmentInput, buildVerdantRowTerritory } from './verdantRowGoldenFixture.js';
import { runCreativeJudgmentIntelligence } from './creativeJudgmentIntelligenceEngine.js';
import { recordFounderJudgment } from './founderJudgmentMemory.js';
import type { FounderJudgmentLabel } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/failureClasses.js';

export const CREATIVE_JUDGMENT_PRESENTATION_VERSION = 'P0.CJ.2';

const panelStore = new Map<string, ConceptPanel>();

function mapPresentationJudgmentToEngine(j: PresentationFounderJudgment): FounderJudgmentLabel {
  const map: Record<PresentationFounderJudgment, FounderJudgmentLabel> = {
    LOVE_IT: 'LOVE_IT',
    PROMISING: 'PROMISING',
    TOO_CLOSE: 'TOO_CLOSE',
    NOT_NDXBOOK: 'NOT_NDXBOOK',
    REVISE: 'NEEDS_MORE',
    HOLD: 'PROMISING',
    APPROVED_FOR_NEXT_STAGE: 'LOVE_IT',
  };
  return map[j];
}

function seedConceptGallery(): ConceptPanel[] {
  const entry003 = runCreativeJudgmentIntelligence(buildEntry003JudgmentInput());
  const verdantRow = runCreativeJudgmentIntelligence(buildVerdantRowJudgmentInput());
  const savorCeleste = runCreativeJudgmentIntelligence(buildSavorCelestePrivateRoomInput());

  const panels: ConceptPanel[] = [
    buildSavorCelesteConceptPanel(savorCeleste),
    mapJudgmentToConceptPanel({
      judgment: entry003,
      territory: buildEntry003Territory(),
      brandName: 'NDXBOOK',
      caseType: 'invented',
      groundingMode: 'profile_grounded',
      expressionContext: 'ENTRY 003 · EMPLOYEES ONLY',
      heroSymbol: '▣ EMPLOYEE DOOR',
    }),
    mapJudgmentToConceptPanel({
      judgment: verdantRow,
      territory: buildVerdantRowTerritory(),
      brandName: 'Verdant Row',
      caseType: 'invented',
      groundingMode: 'profile_grounded',
      expressionContext: 'NON-NDX GOLDEN · PLANT CARE',
      heroSymbol: '◈ LEAF WITNESS',
    }),
  ];

  for (const p of panels) panelStore.set(p.id, p);
  return panels;
}

export function bootstrapConceptReviewGallery(): ConceptGalleryPayload {
  const concepts = panelStore.size > 0 ? [...panelStore.values()] : seedConceptGallery();
  return {
    presentationVersion: CREATIVE_JUDGMENT_PRESENTATION_VERSION,
    level: 'CONCEPT_GALLERY',
    concepts,
    brandCases: [SAVOR_CELESTE_PROFILE],
    compareSelection: [],
    trailerModeAvailable: true,
    visualAuthority: 'VISUAL_AUTHORITY_REQUIRED',
  };
}

export function submitConceptPanelFounderJudgment(input: {
  conceptId: string;
  judgment: PresentationFounderJudgment;
  projectId?: string;
  whyIFeelThis?: string | null;
  whatsMissing?: string | null;
  whatToPreserve?: string | null;
  whatToPush?: string | null;
}): ConceptPanel | null {
  if (panelStore.size === 0) seedConceptGallery();
  const existing = panelStore.get(input.conceptId);
  if (!existing) return null;

  const notes = {
    whyIFeelThis: input.whyIFeelThis ?? null,
    whatsMissing: input.whatsMissing ?? null,
    whatToPreserve: input.whatToPreserve ?? null,
    whatToPush: input.whatToPush ?? null,
  };

  const updated = applyFounderJudgmentToPanel(existing, input.judgment, notes);
  panelStore.set(input.conceptId, updated);

  recordFounderJudgment({
    projectId: input.projectId ?? existing.brandName.toLowerCase().replace(/\s+/g, '-'),
    brandId: existing.brandName.toLowerCase().replace(/\s+/g, '-'),
    entryId: null,
    territoryId: input.conceptId,
    artifactId: existing.heroVisualAssetId,
    decision: mapPresentationJudgmentToEngine(input.judgment),
    founderNote: input.whyIFeelThis ?? input.whatsMissing ?? null,
  });

  return updated;
}

export function resetConceptPanelStoreForTest(): void {
  panelStore.clear();
}
