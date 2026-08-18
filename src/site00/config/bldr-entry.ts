/**
 * SITE 00 Screen 02 — BLDR ENTRY / Choose a direction.
 * Mobile-only composition; approved card imagery locked.
 */

import { SITE00_ROUTES } from './routes';

export const SITE00_BLDR_ENTRY_SITE_IMAGE = '5E6EAEFD-2085-4FA5-91FA-71BA0610E99D.png';
export const SITE00_BLDR_ENTRY_WORLD_IMAGE = '5E89B3D4-2C5A-4E41-9F49-2B065F44C819.png';

export type BldrBuildDirectionId = 'site' | 'world';

export type BldrBuildDirection = {
  id: BldrBuildDirectionId;
  title: string;
  descriptionLines: string[];
  price: string;
  imagePath: string;
  imageObjectPosition: string;
  buildClassId: BldrBuildDirectionId;
  href: string;
};

export const SITE00_BLDR_ENTRY_COPY = {
  headlineLine1: 'WHAT ARE WE',
  headlineLine2: 'BUILDING?',
  subtitle: 'CHOOSE A DIRECTION',
} as const;

export const SITE00_BLDR_BUILD_DIRECTIONS: BldrBuildDirection[] = [
  {
    id: 'site',
    title: 'SITE',
    descriptionLines: ['WEBSITES + COMMERCE'],
    price: 'FROM $4K+',
    imagePath: SITE00_BLDR_ENTRY_SITE_IMAGE,
    imageObjectPosition: 'center 42%',
    buildClassId: 'site',
    href: SITE00_ROUTES.bldrState,
  },
  {
    id: 'world',
    title: 'WORLD',
    descriptionLines: ['CUSTOM DIGITAL', 'EXPERIENCES'],
    price: 'FROM $10K+',
    imagePath: SITE00_BLDR_ENTRY_WORLD_IMAGE,
    imageObjectPosition: 'center 38%',
    buildClassId: 'world',
    href: SITE00_ROUTES.bldrState,
  },
];
