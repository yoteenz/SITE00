/**
 * Sprint B3.1 — Chapter 01 cover presentation grammar + Entry 001/002 cover specs.
 * Scope: CHAPTER 01 ONLY — not a global NDXBOOK rule.
 */

import type {
  ChapterCoverPresentationGrammar,
  EntryCoverPresentationSpec,
} from '../../../shared/site00-expression-engine/chapterCoverGrammarTypes.js';
import {
  NDXBOOK_PROOF_BRAND_ID,
  NDXBOOK_PROOF_PROJECT_KEY,
} from '../../../shared/site00-expression-engine/constants.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';

export const CHAPTER_01_COVER_GRAMMAR_ID = 'grammar-ndxbook-chapter-01-cover-presentation';

const NOW = '2026-09-07T20:00:00.000Z';

export function buildChapter01CoverPresentationGrammar(): ChapterCoverPresentationGrammar {
  return {
    grammarId: CHAPTER_01_COVER_GRAMMAR_ID,
    chapterId: CHAPTER_01_ID,
    chapterNumber: 1,
    chapterTitle: 'WHICH ONE IS IT?',
    brandId: NDXBOOK_PROOF_BRAND_ID,
    projectId: NDXBOOK_PROOF_PROJECT_KEY,
    scope: 'CHAPTER_01_ONLY',
    status: 'LOCKED',
    constants: {
      background: 'PURE_BLACK',
      aspect: '9:16',
      hierarchy: ['HEADLINE', 'HERO_ARTIFACT', 'ENTRY_NUMBER', 'SUBJECT_LABEL'],
      artifactTreatment: 'CENTERED_ISOLATED_PHYSICAL_TACTILE_CINEMATIC_OBJECT_FIRST',
      accent: 'RESTRAINED_LIME_GREEN_GLOW_MARKS',
      lighting: 'DARK_CINEMATIC_OBJECT_WITH_LIME_REFLECTION_EDGE_LIGHT',
      textPrimary: 'CREAM_OFF_WHITE_DISPLAY',
      textSupport: 'WHITE_LIGHT_MONO',
      space: 'GENEROUS_BLACK_NEGATIVE_SPACE',
    },
    variablePerEntry: [
      'artifact class',
      'artifact shape',
      'headline annotation type',
      'artifact content',
      'subject',
      'internal artifact imagery',
      'symbolic mechanism',
      'interjection device',
    ],
    repetitionRules: [
      'SAME PRESENTATION GRAMMAR ≠ SAME COVER DESIGN',
      'DO NOT copy another entry artifact without explicit reason',
      'DO NOT copy another entry annotation pattern without explicit reason',
      'DO NOT become a graphic flyer — environment must not overwhelm artifact',
      'DO NOT add excessive text',
    ],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export function buildEntry001CoverPresentationSpec(): EntryCoverPresentationSpec {
  return {
    entryId: 'entry-001',
    entryNumber: 1,
    format: 'COVER',
    aspect: '9:16',
    subject: 'BRITNEY SPEARS',
    title: 'WHO TF IS WE?',
    background: 'PURE_BLACK',
    headline: {
      lines: ['WHO TF', 'IS WE?'],
      style: 'CREAM_CONDENSED_DISPLAY_DISTRESSED',
      fullText: 'WHO TF IS WE?',
    },
    annotations: [
      {
        type: 'CIRCLE_UNDERLINE',
        target: 'WE',
        placement: 'CIRCLE around WE + UNDERLINE beneath WE',
        color: 'LIME_GREEN',
        handDrawn: true,
      },
    ],
    heroArtifact: {
      artifactClass: 'VINTAGE_BOX_TELEVISION',
      artifactId: 'artifact-entry-001-vintage-tv',
      tactileQualities: ['TACTILE', 'DARK', 'WORN', 'ARCHIVAL', 'CINEMATIC', 'OBJECT_LIKE'],
      limeGlow: 'EDGE_UNDERGLOW',
      contentDescription: 'Broadcast interruption / media spectatorship implied through TV screen',
      isolated: true,
      noEnvironmentVisible: true,
    },
    entryLabel: 'ENTRY 001',
    entryLabelUnderline: 'HAND_DRAWN_LIME',
    subjectLabel: 'BRITNEY SPEARS',
    bottomLogo: false,
    hierarchyOrder: ['HEADLINE', 'HERO_ARTIFACT', 'ENTRY_NUMBER', 'SUBJECT_LABEL'],
  };
}

export function buildEntry002FounderCoverPresentationSpec(): EntryCoverPresentationSpec {
  return {
    entryId: 'entry-002',
    entryNumber: 2,
    format: 'COVER',
    aspect: '9:16',
    subject: '2016 IG BADDIE FASHION',
    title: 'OH, NOW IT WAS FUN?',
    background: 'PURE_BLACK',
    headline: {
      lines: ['OH, NOW', 'IT WAS FUN?'],
      style: 'CREAM_CONDENSED_DISPLAY_DISTRESSED',
      fullText: 'OH, NOW IT WAS FUN?',
    },
    annotations: [
      {
        type: 'ASTERISK_UPWARD_ARROW',
        target: 'NOW + FUN',
        placement: 'ONE lime asterisk AFTER NOW; ONE lime curved arrow UNDER FUN pointing upward toward FUN',
        color: 'LIME_GREEN',
        handDrawn: true,
      },
    ],
    heroArtifact: {
      artifactClass: 'PHONE',
      artifactId: 'artifact-entry-002-phone-cover',
      tactileQualities: ['TACTILE', 'DARK', 'WORN', 'ARCHIVAL', 'CINEMATIC', 'OBJECT_LIKE'],
      limeGlow: 'EDGE_UNDERGLOW',
      contentDescription:
        '2016 fashion archive imagery, physical edit-strip behavior, edit blade / reframe symbolism, black-and-white fashion evidence',
      isolated: true,
      noEnvironmentVisible: true,
    },
    entryLabel: 'ENTRY 002',
    entryLabelUnderline: 'HAND_DRAWN_LIME',
    subjectLabel: '2016 IG BADDIE FASHION',
    bottomLogo: false,
    hierarchyOrder: ['HEADLINE', 'HERO_ARTIFACT', 'ENTRY_NUMBER', 'SUBJECT_LABEL'],
  };
}

export function getChapter01EntryCoverSpecs(): EntryCoverPresentationSpec[] {
  return [buildEntry001CoverPresentationSpec(), buildEntry002FounderCoverPresentationSpec()];
}
