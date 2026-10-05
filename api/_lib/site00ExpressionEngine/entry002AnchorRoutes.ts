/**
 * Sprint B3 — ENTRY 002 creative anchor composition routes (max 3).
 */

import type { Entry002AnchorCompositionRoute } from '../../../shared/site00-expression-engine/anchorTypes.js';

export const ENTRY_002_ANCHOR_FASHION_EVIDENCE = [
  'CHOKER',
  'BODYCON SILHOUETTE',
  'THIGH-HIGH BOOTS',
  'MATCHING SET',
  'OVERLINED LIPS',
] as const;

export const ENTRY_002_ANCHOR_VISIBLE_COPY = [
  'NDXBOOK',
  'ENTRY 002',
  'OH, NOW IT WAS FUN?',
  'WHEN CRINGE BECOMES NOSTALGIA.',
  '2016',
] as const;

export const ENTRY_002_ANCHOR_MARGINAL = 'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.';

export function compileEntry002AnchorCompositionRoutes(): Entry002AnchorCompositionRoute[] {
  const routes: Entry002AnchorCompositionRoute[] = [
    {
      routeId: 'ROUTE_A_TIMELINE_CLIP',
      title: 'THE OUTFIT AS TIMELINE CLIP',
      focalMechanism:
        '2016 baddie fashion look physically mounted into timeline strip — fashion subject dominates frame',
      cameraMechanism: 'Medium hero on fashion clip at cut point; edit suite depth recedes',
      fashionEvidence: ['CHOKER', 'BODYCON SILHOUETTE', 'THIGH-HIGH BOOTS', 'MATCHING SET', 'OVERLINED LIPS'],
      phoneBehavior:
        'Small phone on light table — archived comments show TACKY/BASIC/OVERDONE vs ICONIC/TAKE ME BACK',
      editSuiteBehavior:
        'Physical timeline strip, razor cut point, lime splice marker, cream date tape "2016"',
      artifactBehavior: 'Razor blade at cut point on timeline — memory being physically re-edited',
      visibleCopy: [...ENTRY_002_ANCHOR_VISIBLE_COPY],
      marginalInterjection: ENTRY_002_ANCHOR_MARGINAL,
      selectionScore: 95,
      selected: false,
    },
    {
      routeId: 'ROUTE_B_FITTING_ROOM_EDIT',
      title: 'THE FITTING ROOM EDIT',
      focalMechanism:
        'Full 2016 baddie look standing in surreal edit suite while cultural labels are cut and replaced on wall strips',
      cameraMechanism: 'Three-quarter fashion portrait with label-strips being physically swapped in midground',
      fashionEvidence: ['BOMBER JACKET', 'BODYCON SILHOUETTE', 'NUDE HEELS', 'CHOKER', 'OVERLINED LIPS'],
      phoneBehavior: 'Phone propped showing archived opinion screenshots — evidence only',
      editSuiteBehavior: 'Physical label strips TACKY→ICONIC being swapped on matte monitor surround',
      artifactBehavior: 'Razor trimming label tape; timeline fragments on light table',
      visibleCopy: [...ENTRY_002_ANCHOR_VISIBLE_COPY],
      marginalInterjection: ENTRY_002_ANCHOR_MARGINAL,
      selectionScore: 88,
      selected: false,
    },
    {
      routeId: 'ROUTE_C_PHONE_EXTRACTION',
      title: 'THE PHONE / MEMORY EXTRACTION',
      focalMechanism:
        '2016 fashion image pulled from phone as physical memory strip fed into edit timeline',
      cameraMechanism: 'Over-shoulder on extraction motion — fashion strip leads, phone secondary',
      fashionEvidence: ['CHOKER', 'BODYCON SILHOUETTE', 'CLEAR HEELS', 'MATCHING SET', 'OVERLINED LIPS'],
      phoneBehavior: 'Phone extruding memory strip — archived posts visible on screen, not giant feed',
      editSuiteBehavior: 'Timeline receiving extracted strip; splice marks and waveform sculpture',
      artifactBehavior: 'Razor at feed point where strip enters timeline',
      visibleCopy: [...ENTRY_002_ANCHOR_VISIBLE_COPY],
      marginalInterjection: 'SAME FIT. NEW MEMORY.',
      selectionScore: 82,
      selected: false,
    },
  ];

  return routes;
}

export function selectEntry002AnchorRoute(
  routes: Entry002AnchorCompositionRoute[],
): Entry002AnchorCompositionRoute {
  const sorted = [...routes].sort((a, b) => b.selectionScore - a.selectionScore);
  const selected = { ...sorted[0], selected: true };
  return selected;
}
