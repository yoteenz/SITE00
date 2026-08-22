/**
 * SITE 00 mobile bottom-nav icon assets (live-preview/site00/NAV).
 */

import type { MobileSiteNavIconId } from './mobile-site-nav';
import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';

export const SITE00_MOBILE_NAV_ICON_PATHS: Record<MobileSiteNavIconId, string> = {
  origin: 'NAV/D4DD3399-AAC2-43B2-A470-153891AD3DE7.png',
  idnty: 'NAV/2A5D3931-0B86-4639-BAF3-986DD0B739FE.png',
  locations: 'NAV/FAED20D5-7DA2-470E-BABD-1D99819F03B6.png',
  projects: 'NAV/E6D80FF2-22E3-4633-B0ED-F1CB3704F230.png',
  'ctrl-room': 'NAV/202B763B-8A82-4E4C-8FD6-301008594D15.png',
};

export function site00MobileNavIconUrl(icon: MobileSiteNavIconId): string {
  return resolveSite00PublicAsset(SITE00_MOBILE_NAV_ICON_PATHS[icon]);
}
