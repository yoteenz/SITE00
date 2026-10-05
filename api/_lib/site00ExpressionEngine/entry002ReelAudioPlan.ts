/**
 * Sprint B4 — Entry 002 REEL audio plan (required before video dispatch).
 */

import type { AudioPlan } from '../../../shared/site00-expression-engine/types.js';
import { ENTRY_002_TITLE } from '../../../shared/site00-expression-engine/constants.js';

export const ENTRY_002_REEL_VO_SCRIPT = `2016 was iconic?

Interesting.

Because I could've sworn
we called this tacky,
basic,
and doing too much.

The clothes didn't change.

The edit did.`;

export function buildEntry002ReelAudioPlan(): AudioPlan {
  return {
    planId: 'audio-entry-002-reel-b4',
    entryId: 'entry-002',
    requiredForFormats: ['REEL'],
    status: 'COMPLETE',
    layers: [
      {
        layerId: 'b4-amb',
        type: 'AMBIENCE',
        purpose: 'Low edit-suite room tone — subtle electrical / monitor hum',
        timingRelationship: 'bed under phone glow opening through archive portal',
        generatorClass: 'SOUND_EFFECT',
        sourceState: 'GENERATED',
        continuityRequirement: 'env-edit-suite',
        mixPriority: 1,
      },
      {
        layerId: 'b4-foley-phone',
        type: 'FOLEY',
        purpose: 'Phone tap, scroll, archive open — controlled evidence not comment wall',
        timingRelationship: 'sync to phone evidence beats in shots 01–04',
        generatorClass: 'SOUND_EFFECT',
        sourceState: 'GENERATED',
        continuityRequirement: 'obj-phone-evidence',
        mixPriority: 4,
      },
      {
        layerId: 'b4-foley-edit',
        type: 'FOLEY',
        purpose: 'Scrub wheel, timeline slide, blade lift, splice tape, label peel, hard edit cut',
        timingRelationship: 'sync to edit suite cultural re-edit in shots 05–07',
        generatorClass: 'SOUND_EFFECT',
        sourceState: 'GENERATED',
        continuityRequirement: 'obj-razor-timeline',
        mixPriority: 5,
      },
      {
        layerId: 'b4-vo',
        type: 'DIALOGUE_VO',
        purpose: 'NDX observational VO — dry, slightly incredulous, not preachy',
        timingRelationship: 'after fashion evidence + old language receipt, before synthesis',
        generatorClass: 'TTS_DIALOGUE',
        sourceState: 'GENERATED',
        continuityRequirement: 'nar-nostalgia-revision',
        mixPriority: 6,
      },
      {
        layerId: 'b4-glitch',
        type: 'GLITCH_TRANSITION',
        purpose: 'Short clean edit glitches on label cut / reframe — not VHS static',
        timingRelationship: 'on contradiction beat and timeline splice',
        generatorClass: 'SOUND_EFFECT',
        sourceState: 'GENERATED',
        continuityRequirement: 'gram-timeline-edit',
        mixPriority: 5,
      },
      {
        layerId: 'b4-music',
        type: 'MUSIC',
        purpose: 'Nostalgia-coded but ironic / modern — avoid sentimental throwback montage',
        timingRelationship: 'enters sparingly after reframe, under synthesis',
        generatorClass: 'MUSIC',
        sourceState: 'GENERATED',
        continuityRequirement: 'seq-reel-revision-arc',
        mixPriority: 3,
      },
      {
        layerId: 'b4-title',
        type: 'TITLE_CARD_SOUND',
        purpose: `Short sharp NDX sting — ${ENTRY_002_TITLE} end card`,
        timingRelationship: 'ENTRY 002 end card after synthesis',
        generatorClass: 'SOUND_EFFECT',
        sourceState: 'GENERATED',
        continuityRequirement: 'nar-nostalgia-revision',
        mixPriority: 7,
      },
    ],
  };
}

export function getEntry002ReelVoOption(): string {
  return ENTRY_002_REEL_VO_SCRIPT;
}
