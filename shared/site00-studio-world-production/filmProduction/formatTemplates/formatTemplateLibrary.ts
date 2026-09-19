/**
 * P0.FILM.1 — Video format template library.
 */

import type { VideoFormatTemplate, VideoFormatTemplateId, VideoFormatTemplateLibrary } from '../types.js';

export function buildVideoFormatTemplate(params: Partial<VideoFormatTemplate> & { templateId: VideoFormatTemplateId; name: string }): VideoFormatTemplate {
  return {
    templateId: params.templateId,
    name: params.name,
    runtimeRange: params.runtimeRange ?? { min: 20, max: 45 },
    beatStructure: params.beatStructure ?? [],
    shotRoleSequence: params.shotRoleSequence ?? [],
    pacingCurve: params.pacingCurve ?? 'observational',
    musicBehavior: params.musicBehavior ?? 'minimal ambient',
    ambientSoundBehavior: params.ambientSoundBehavior ?? 'environment-first',
    dialoguePlacement: params.dialoguePlacement ?? 'sparse meaningful lines',
    voiceoverRules: params.voiceoverRules ?? 'none unless template requires',
    textOverlayRules: params.textOverlayRules ?? 'end card only',
    transitionStyle: params.transitionStyle ?? 'cut on observation',
    openingHookBehavior: params.openingHookBehavior ?? 'environment entry',
    midpointBehavior: params.midpointBehavior ?? 'movement or discovery',
    payoffBehavior: params.payoffBehavior ?? 'direct camera or exit',
    endCardBehavior: params.endCardBehavior ?? 'franchise card',
    editGrammar: params.editGrammar ?? {
      openingRhythm: 'slow observational',
      averageShotLength: 3,
      maxShotLength: 8,
      cutAcceleration: 'gradual',
      pauseBehavior: 'hold on reaction',
      dialoguePriority: 'high when present',
      bRollBehavior: 'environment inserts',
      insertBehavior: 'prop and evidence',
      endBehavior: 'payoff then receipt',
    },
  };
}

export function buildVideoFormatTemplateLibrary(brandId: string, templates: VideoFormatTemplate[]): VideoFormatTemplateLibrary {
  return { brandId, templates };
}

export function resolveFormatTemplate(library: VideoFormatTemplateLibrary, templateId: VideoFormatTemplateId): VideoFormatTemplate | null {
  return library.templates.find((t) => t.templateId === templateId) ?? null;
}

export function buildMiniVlogIntroTemplate(): VideoFormatTemplate {
  return buildVideoFormatTemplate({
    templateId: 'MINI_VLOG_INTRO',
    name: 'Mini Vlog Intro',
    runtimeRange: { min: 25, max: 40 },
    beatStructure: [
      'ENVIRONMENT ENTRY',
      'PERSONAL OBJECT',
      'CHARACTER DETAIL',
      'OFF-CAMERA INTERACTION',
      'OBSERVATION',
      'MOVEMENT',
      'IMPERFECT HUMAN MOMENT',
      'SIMPLE CHARACTER LINE',
      'LIFE MONTAGE',
      'DIRECT ACKNOWLEDGMENT',
      'EXIT',
    ],
    shotRoleSequence: [
      'OBSERVATIONAL_WIDE',
      'TABLE_LEVEL_LIVED_IN',
      'LIME_ARTIFACT_INSERT',
      'OFF_CAMERA_INTERACTION',
      'ENVIRONMENT_OBSERVATION',
      'FOLLOW_BEHIND',
      'MIRROR_CAUGHT',
      'IMPERFECT_HUMAN_BEAT',
      'CHARACTER_LINE',
      'LIVED_IN_MICRO_MONTAGE',
      'DIRECT_CAMERA_PAYOFF',
      'END_CARD',
    ],
    pacingCurve: 'slow observational → slightly quicker → quiet payoff',
    editGrammar: {
      openingRhythm: 'slow observational',
      averageShotLength: 3.5,
      maxShotLength: 7,
      cutAcceleration: 'slow then slight increase',
      pauseBehavior: 'hold imperfect moment',
      dialoguePriority: 'single line payoff',
      bRollBehavior: 'life montage mid-reel',
      insertBehavior: 'lime artifact and personal objects',
      endBehavior: 'direct acknowledgment then exit',
    },
  });
}

export function buildRabbitHoleInvestigationTemplate(): VideoFormatTemplate {
  return buildVideoFormatTemplate({
    templateId: 'RABBIT_HOLE_INVESTIGATION',
    name: 'Rabbit Hole Investigation',
    runtimeRange: { min: 27, max: 45 },
    beatStructure: [
      'NORMAL STATE',
      'ANOMALY',
      'DOUBLE TAKE',
      'INITIAL CLAIM',
      'FIRST SEARCH',
      'ESCALATION',
      'RECEIPTS',
      'BOOK',
      'ABSORPTION',
      'CONTRADICTION',
      'VERIFY',
      'PAYOFF',
      'RECEIPT',
      'FRANCHISE CARD',
    ],
    shotRoleSequence: [
      'NORMAL_STATE',
      'DOUBLE_TAKE',
      'PHONE_EVIDENCE',
      'MICRO_REACTION',
      'FIRST_SEARCH',
      'PHONE_TO_LAPTOP_ESCALATION',
      'RABBIT_HOLE_MONTAGE',
      'NOTEBOOK_INSERT',
      'ABSORBED_WIDE',
      'CONTRADICTION_REACTION',
      'REALIZATION',
      'VERIFY',
      'DIRECT_CAMERA_PAYOFF',
      'RECEIPT',
      'FRANCHISE_CARD',
    ],
    pacingCurve: '0-8s slow → 8-20 accelerating → 20-27 discovery pause → 27-end payoff',
    editGrammar: {
      openingRhythm: 'slow observational normal state',
      averageShotLength: 2.5,
      maxShotLength: 6,
      cutAcceleration: 'slow → accelerate → sudden pause → payoff',
      pauseBehavior: 'hold on absorption and contradiction',
      dialoguePriority: 'claim and payoff lines',
      bRollBehavior: 'evidence montage',
      insertBehavior: 'phone, laptop, notebook, receipts',
      endBehavior: 'receipt then franchise card',
    },
  });
}
