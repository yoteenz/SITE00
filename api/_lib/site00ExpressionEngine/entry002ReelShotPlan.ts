/**
 * Sprint B4 — Entry 002 REEL shot plan + argument arc.
 */

import type { ReelArgumentBeat, ReelShotPlanItem } from '../../../shared/site00-expression-engine/entry002ReelTypes.js';

export const ENTRY_002_REEL_ID = 'reel-entry-002-chapter-01-b4';

export const ENTRY_002_REEL_RUNTIME_TARGET = { min: 28, max: 45 } as const;

export function buildEntry002ReelArgumentArc(): ReelArgumentBeat[] {
  return ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'INTERJECTION', 'SYNTHESIS'];
}

export function buildEntry002ReelShotPlan(): ReelShotPlanItem[] {
  return [
    {
      shotId: 'r2-s01',
      order: 1,
      title: 'BLACK / PHONE GLOW / CURRENT NOSTALGIA CLAIM',
      beat: 'HOOK',
      description:
        'Pure black. Phone glows lime. One legible present-day nostalgia receipt — 2016 WAS ICONIC or OH, NOW IT WAS FUN? — then immediate cut. Subject arrives first, not edit suite establishing shot.',
      durationHintSec: '1-3',
    },
    {
      shotId: 'r2-s02',
      order: 2,
      title: 'PHONE ARCHIVE OPENS',
      beat: 'CLAIM',
      description: 'Phone becomes portal into 2016 fashion archive. Memory opens — we enter Nostalgia Edit Suite through evidence device.',
      durationHintSec: '3-5',
    },
    {
      shotId: 'r2-s03',
      order: 3,
      title: '2016 BADDIE FASHION RECEIPTS',
      beat: 'RECEIPT',
      description:
        'Curated sequence of strongest 4–5 visual codes: chokers, bodycon, thigh-high boots, bomber jacket, overlined lips. Mid-2010s Instagram glam — not costume parody.',
      durationHintSec: '4-6',
    },
    {
      shotId: 'r2-s04',
      order: 4,
      title: 'OLD LANGUAGE: TACKY / BASIC / OVERDONE',
      beat: 'RECEIPT',
      description:
        'Then-language enters on phone, archived captions, or physical edit labels. Controlled receipts only — not comment UI wall.',
      durationHintSec: '3-5',
    },
    {
      shotId: 'r2-s05',
      order: 5,
      title: 'TIMELINE PULLED INTO EDIT SUITE',
      beat: 'CONTRADICTION',
      description: 'Physical timeline strip pulled into dimensional edit suite. Same fashion image now facing relabel pressure.',
      durationHintSec: '3-4',
    },
    {
      shotId: 'r2-s06',
      order: 6,
      title: 'LABEL CUT / REMOVED',
      beat: 'CONTRADICTION',
      description: 'Razor / edit blade removes old label symbolically — not violent. Splice tape, cut markers, lime edit points.',
      durationHintSec: '2-4',
    },
    {
      shotId: 'r2-s07',
      order: 7,
      title: 'SAME IMAGE REFRAMED AS ICONIC / AN ERA',
      beat: 'CONTRADICTION',
      description: 'Image unchanged. Label changes to ICONIC / AN ERA / TAKE ME BACK. Memory color-graded / reframed.',
      durationHintSec: '3-5',
    },
    {
      shotId: 'r2-s08',
      order: 8,
      title: 'NDX INTERJECTION',
      beat: 'INTERJECTION',
      description: 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND. — NDX response, not decorative quote.',
      durationHintSec: '3-4',
    },
    {
      shotId: 'r2-s09',
      order: 9,
      title: 'SYNTHESIS',
      beat: 'SYNTHESIS',
      description: 'MAYBE CRINGE IS JUST CULTURE BEFORE THE RE-EDIT.',
      durationHintSec: '3-4',
    },
    {
      shotId: 'r2-s10',
      order: 10,
      title: 'ENTRY 002 END CARD',
      beat: 'END_CARD',
      description: 'ENTRY 002 / 2016 IG BADDIE FASHION — filing identity. Title may reference cover marks sparingly, simplify, or omit; cover remains primary annotation authority.',
      durationHintSec: '2-3',
    },
  ];
}
