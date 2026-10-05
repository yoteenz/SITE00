/**
 * Sprint B2 — ENTRY 001 / ENTRY 002 chapter argument retrofits.
 */

import type { EntryChapterArgumentMapping } from '../../../shared/site00-expression-engine/chapterGrammarTypes.js';
import {
  ENTRY_001_SUBJECT,
  ENTRY_002_SUBJECT,
} from '../../../shared/site00-expression-engine/constants.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import {
  ENTRY_001_WORLD_ID,
} from './entry001Forensic.js';
import {
  ENTRY_002_ARTIFACT_ID,
  ENTRY_002_WORLD_ID,
} from './entry002Blueprint.js';

export function buildEntry001ChapterMapping(): EntryChapterArgumentMapping {
  return {
    entryId: 'entry-001',
    entryNumber: 1,
    chapterId: CHAPTER_01_ID,
    subject: ENTRY_001_SUBJECT,
    claim: '"WE CAUSED THIS MADNESS."',
    receipt:
      'THE MEDIA / PUBLIC NARRATIVE / SPECTATORSHIP RECORD SURROUNDING BRITNEY.',
    contradiction:
      'WHO EXACTLY IS INCLUDED IN "WE," AND WHO HAD ACTUAL POWER IN THE SYSTEM THAT CAUSED THE DAMAGE?',
    lens: 'MEDIA COMPLICITY / PUBLIC SPECTATORSHIP',
    interjection: 'WHO TF IS WE?',
    synthesis:
      'COLLECTIVE LANGUAGE CAN BLUR ACCOUNTABILITY WHEN POWER WAS NEVER EQUALLY DISTRIBUTED.',
    world: 'BROADCAST INTERRUPTION',
    worldId: ENTRY_001_WORLD_ID,
    artifact: 'VINTAGE BOX TELEVISION',
    artifactId: 'artifact-entry-001-vintage-tv',
    interjectionDevice: 'TELEVISION / BROADCAST',
    argumentBeats: [
      { beatId: 'e1-b1', label: 'CLAIM', copy: 'WE CAUSED THIS MADNESS / WE OWE BRITNEY', order: 1 },
      { beatId: 'e1-b2', label: 'RECEIPT', copy: 'Media spectatorship record', order: 2 },
      { beatId: 'e1-b3', label: 'CONTRADICTION', copy: 'Who is WE?', order: 3 },
      { beatId: 'e1-b4', label: 'LENS', copy: 'Media complicity', order: 4 },
      { beatId: 'e1-b5', label: 'INTERJECTION', copy: 'WHO TF IS WE?', order: 5 },
      { beatId: 'e1-b6', label: 'SYNTHESIS', copy: 'Collective language blurs accountability', order: 6 },
    ],
    expressionMechanisms: {
      contradictionMechanism: 'COLLECTIVE_PRONOUN_VS_POWER_ASYMMETRY',
      worldMechanism: 'BROADCAST_INTERRUPTION',
      artifactClass: 'VINTAGE_BOX_TELEVISION',
      interjectionDevice: 'TELEVISION_BROADCAST',
      compositionGrammar: 'CHANNEL_SURF_NEWS_SEGMENT',
      motionGrammar: 'TV_SHUTOFF_PHONE_TRANSITION',
    },
  };
}

export function buildEntry002ChapterMapping(): EntryChapterArgumentMapping {
  return {
    entryId: 'entry-002',
    entryNumber: 2,
    chapterId: CHAPTER_01_ID,
    subject: '2016 INSTAGRAM BADDIE FASHION',
    premise:
      'WHAT WE ONCE CALLED TACKY, BASIC, AND OVERDONE NOW GETS REMEMBERED AS AN ENTIRE ERA.',
    claim: '"2016 WAS ICONIC." / "TAKE ME BACK." / "WE DIDN\'T KNOW HOW GOOD WE HAD IT."',
    receipt:
      'THE SAME ERA WAS DESCRIBED IN REAL TIME AS: TACKY, BASIC, OVERDONE, DOING TOO MUCH, PLAYED OUT, EVERYBODY LOOKED THE SAME',
    contradiction: 'THE VISUAL CODES DID NOT CHANGE. THE CULTURAL LABEL DID.',
    lens: 'NOSTALGIA / CULTURAL REVISION',
    interjection: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
    secondaryInterjection: 'SAME FIT. NEW MEMORY.',
    synthesis:
      'TIME CAN TURN EMBARRASSMENT INTO NOSTALGIA BY EDITING THE MEMORY RATHER THAN CHANGING THE OBJECT.',
    world: 'THE NOSTALGIA EDIT SUITE',
    worldId: ENTRY_002_WORLD_ID,
    artifact: 'RAZOR BLADE / PHYSICAL 2016 TIMELINE',
    artifactId: ENTRY_002_ARTIFACT_ID,
    interjectionDevice: 'PHONE',
    evidenceMotifs: [
      'CHOKERS',
      'BODYCON SILHOUETTES',
      'THIGH-HIGH BOOTS',
      'NUDE HEELS / CLEAR HEELS',
      'BOMBER JACKETS',
      'MATCHING SETS',
      'OVERLINED LIPS',
    ],
    argumentBeats: [
      { beatId: 'e2-b1', label: 'OPENING CLAIM', copy: 'PRESENT-DAY NOSTALGIA FOR 2016', order: 1 },
      {
        beatId: 'e2-b2',
        label: 'CONTRADICTION',
        copy: 'TACKY/BASIC/OVERDONE NOW REMEMBERED AS ICONIC ERA',
        order: 2,
      },
      { beatId: 'e2-b3', label: 'EVIDENCE', copy: '2016 Instagram baddie fashion codes', order: 3 },
      { beatId: 'e2-b4', label: 'THEN VS NOW', copy: 'Same visual evidence, two cultural labels', order: 4 },
      { beatId: 'e2-b5', label: 'THE CULTURAL EDIT', copy: 'THE CLOTHES DIDN\'T CHANGE. THE EDIT DID.', order: 5 },
      {
        beatId: 'e2-b6',
        label: 'WHY IT HAPPENS',
        copy: 'Missing who/where/how culture moved — not just the clothes',
        order: 6,
      },
      {
        beatId: 'e2-b7',
        label: 'NDX INTERJECTION',
        copy: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
        order: 7,
      },
      {
        beatId: 'e2-b8',
        label: 'BIGGER QUESTION',
        copy: 'HOW LONG BEFORE EMBARRASSMENT BECOMES NOSTALGIA?',
        order: 8,
      },
      { beatId: 'e2-b9', label: 'SYNTHESIS', copy: 'CRINGE IS CULTURE BEFORE THE RE-EDIT', order: 9 },
    ],
    expressionMechanisms: {
      contradictionMechanism: 'LABEL_REVISION_WITHOUT_OBJECT_CHANGE',
      worldMechanism: 'NOSTALGIA_EDIT_SUITE',
      artifactClass: 'RAZOR_BLADE_TIMELINE',
      interjectionDevice: 'PHONE_EVIDENCE_SURFACE',
      compositionGrammar: 'TIMELINE_LANE_DEEP_PERSPECTIVE',
      motionGrammar: 'SCRUB_TRIM_MUTE_RESTORE',
    },
  };
}

export function getChapterEntryMappings(chapterId: string): EntryChapterArgumentMapping[] {
  if (chapterId !== CHAPTER_01_ID) return [];
  return [buildEntry001ChapterMapping(), buildEntry002ChapterMapping()];
}

export function getEntryChapterMapping(entryNumber: number): EntryChapterArgumentMapping | null {
  if (entryNumber === 1) return buildEntry001ChapterMapping();
  if (entryNumber === 2) return buildEntry002ChapterMapping();
  return null;
}

/** Test fixture only — NOT canon, NOT persisted. */
export function buildAlternateGrammarFixtureSequence(): string[] {
  return ['OBSERVATION', 'PATTERN', 'ESCALATION', 'CONSEQUENCE', 'QUESTION'];
}
