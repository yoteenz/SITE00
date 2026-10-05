/**
 * Hair + Makeup / Grooming departments — reusable look components.
 */

import type { OwnerScope } from './wardrobeDepartment.js';

export type HairStyleAsset = {
  hairId: string;
  length: string;
  texture: string;
  style: string;
  parting: string;
  color: string;
  era: string;
  finish: string;
  roleCompatibility: readonly string[];
  campaignHistory: readonly string[];
  assetAuthorities: readonly string[];
  ownerScope: OwnerScope;
};

export type MakeupGroomingLook = {
  makeupLookId: string;
  makeup: string;
  facialHair: string | null;
  nails: string | null;
  grooming: string;
  skinFinish: string;
  era: string;
  assetAuthorities: readonly string[];
  ownerScope: OwnerScope;
};

export type StudioWorldHairDepartment = {
  departmentId: 'studio-world-hair';
  assets: readonly HairStyleAsset[];
};

export type StudioWorldMakeupDepartment = {
  departmentId: 'studio-world-makeup-grooming';
  looks: readonly MakeupGroomingLook[];
};
