/**
 * SITE 00 Fast Travel — approved UP NEXT destination artwork (Supabase live-preview/site00/PACK/).
 * One canonical image per destination id; resolved at runtime via resolveSite00PublicAsset.
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';

/** Bump when replacing any Fast Travel destination artwork. */
export const SITE00_FAST_TRAVEL_ART_VERSION = '1';

/** Destination ids with PACK artwork (excludes sign-in + create — those use existing marks). */
export type FastTravelArtDestinationId =
  | 'ctrl-room'
  | 'my-sites'
  | 'projects'
  | 'start-build'
  | 'build-type'
  | 'continue'
  | 'bldr-state'
  | 'services'
  | 'sites';

/** Canonical Supabase storage paths under live-preview/site00/ */
export const FAST_TRAVEL_DESTINATION_ART: Record<FastTravelArtDestinationId, string> = {
  'ctrl-room': 'PACK/D727DC9A-7E9D-4FA2-98C8-002966DE06BB.png',
  'my-sites': 'PACK/5C06781D-2667-4054-A028-3E25885D779B.png',
  projects: 'PACK/92D94081-AB9E-4BF3-97E1-7132975CC034.png',
  'start-build': 'PACK/60DAD43B-28E9-4600-B4B2-A18C5D6395A2.png',
  'build-type': 'PACK/156B93FA-0495-4ED7-871E-D2A418AD5CA9.png',
  continue: 'PACK/2CA8A3A4-4FC8-4099-9130-B4A0B91C333B.png',
  'bldr-state': 'PACK/895A4714-5E05-48CD-93FF-8AFF836280FD.png',
  services: 'PACK/18010437-3313-4797-9FB6-4E1B6DBC04B7.png',
  sites: 'PACK/DC04BE58-043D-481A-90B2-94836A824932.png',
};

export function hasFastTravelDestinationArt(id: string): id is FastTravelArtDestinationId {
  return Object.prototype.hasOwnProperty.call(FAST_TRAVEL_DESTINATION_ART, id);
}

export function resolveFastTravelDestinationArtUrl(id: string): string | null {
  if (!hasFastTravelDestinationArt(id)) return null;
  const path = FAST_TRAVEL_DESTINATION_ART[id];
  return `${resolveSite00PublicAsset(path)}?v=${SITE00_FAST_TRAVEL_ART_VERSION}`;
}
