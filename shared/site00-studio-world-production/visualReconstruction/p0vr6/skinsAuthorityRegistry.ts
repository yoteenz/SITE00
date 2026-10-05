/**
 * SKINS design authority reference registration — mobile + desktop EXACT.
 */

import { SKINS_REFERENCE_DESKTOP, SKINS_REFERENCE_MOBILE } from './skinsReferenceFidelity.js';

export type SkinsDesignAuthorityRecord = {
  authorityId: string;
  viewport: 'MOBILE' | 'DESKTOP';
  role: 'DESIGN_AUTHORITY';
  fidelityMode: 'EXACT';
  storagePath: string;
  publicUrl: string;
  registeredAt: string;
};

const SKINS_AUTHORITIES: SkinsDesignAuthorityRecord[] = [
  {
    authorityId: 'skins-authority-mobile',
    viewport: 'MOBILE',
    role: 'DESIGN_AUTHORITY',
    fidelityMode: 'EXACT',
    storagePath: 'public/visual-references/founder/site00/skins-authority-mobile.jpg',
    publicUrl: SKINS_REFERENCE_MOBILE,
    registeredAt: '2026-09-09T00:00:00.000Z',
  },
  {
    authorityId: 'skins-authority-desktop',
    viewport: 'DESKTOP',
    role: 'DESIGN_AUTHORITY',
    fidelityMode: 'EXACT',
    storagePath: 'public/visual-references/founder/site00/skins-authority-desktop.jpg',
    publicUrl: SKINS_REFERENCE_DESKTOP,
    registeredAt: '2026-09-09T00:00:00.000Z',
  },
];

export function listSkinsDesignAuthorities(): SkinsDesignAuthorityRecord[] {
  return SKINS_AUTHORITIES;
}

export function getSkinsDesignAuthority(viewport: 'MOBILE' | 'DESKTOP'): SkinsDesignAuthorityRecord | null {
  return SKINS_AUTHORITIES.find((a) => a.viewport === viewport) ?? null;
}

export function isSkinsAuthorityRegistered(viewport: 'MOBILE' | 'DESKTOP'): boolean {
  return Boolean(getSkinsDesignAuthority(viewport));
}
