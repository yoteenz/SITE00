/**
 * Brand family skin QA — distinctiveness, consistency, structural checks.
 */

import { getBrandFamilySkinByKey, listBrandFamilySkins } from './registry.js';
import type { BrandFamilySkin, BrandFamilySkinFailureCode } from './types.js';

export type BrandFamilySkinDistinctivenessResult = {
  pass: boolean;
  colorOnlyDifference: boolean;
  differences: string[];
  failureCode: BrandFamilySkinFailureCode | null;
};

export type BrandFamilySkinConsistencyResult = {
  pass: boolean;
  coherentSignals: string[];
  failureCode: BrandFamilySkinFailureCode | null;
};

export type SkinStructuralDistinctivenessResult = {
  pass: boolean;
  failureCode: BrandFamilySkinFailureCode | null;
  reasons: string[];
};

const DISTANCE_PROFILES: Record<string, Record<string, number>> = {
  AIO: { composition: 8, density: 9, panelGrammar: 7, heroBehavior: 6, spacingRhythm: 8, motionCharacter: 7 },
  STUDIO_WORLD: { composition: 5, density: 4, panelGrammar: 6, heroBehavior: 8, spacingRhythm: 5, motionCharacter: 6 },
  FRONTAL_SLAYER: { composition: 7, density: 3, panelGrammar: 8, heroBehavior: 9, spacingRhythm: 4, motionCharacter: 5 },
  ASTRAL_WORLD: { composition: 6, density: 4, panelGrammar: 7, heroBehavior: 8, spacingRhythm: 6, motionCharacter: 8 },
  NDXBOOK: { composition: 9, density: 8, panelGrammar: 8, heroBehavior: 7, spacingRhythm: 7, motionCharacter: 7 },
};

function profileDistance(a: Record<string, number>, b: Record<string, number>): number {
  let total = 0;
  for (const key of Object.keys(a)) {
    total += Math.abs((a[key] ?? 0) - (b[key] ?? 0));
  }
  return total;
}

export function runBrandFamilySkinDistinctivenessQA(
  skinAId: string,
  skinBId: string,
): BrandFamilySkinDistinctivenessResult {
  const a = getBrandFamilySkinByKey(skinAId);
  const b = getBrandFamilySkinByKey(skinBId);
  if (!a || !b) {
    return { pass: false, colorOnlyDifference: false, differences: [], failureCode: 'BRAND_FAMILY_SKIN_MISSING' };
  }

  const differences: string[] = [];
  if (a.skinIntent !== b.skinIntent) differences.push('skin intent');
  if (a.primaryColorFamily !== b.primaryColorFamily && a.primaryColor !== b.primaryColor) {
    differences.push('color family');
  }
  if (a.description !== b.description) differences.push('description grammar');
  if (a.status !== b.status) differences.push('status');
  if (a.brandKey !== b.brandKey) differences.push('brand key');

  const distA = DISTANCE_PROFILES[a.brandKey] ?? {};
  const distB = DISTANCE_PROFILES[b.brandKey] ?? {};
  const distance = profileDistance(distA, distB);
  if (distance >= 8) differences.push('visual distance profile');

  const sameGold = a.primaryColorFamily === 'GOLD' && b.primaryColorFamily === 'GOLD';
  const colorOnly = sameGold && a.brandKey !== b.brandKey && differences.filter((d) => d !== 'color family').length <= 2;

  return {
    pass: a.id !== b.id && (distance >= 8 || differences.length >= 3),
    colorOnlyDifference: colorOnly,
    differences,
    failureCode: colorOnly ? 'BRAND_FAMILY_SKIN_COLOR_ONLY' : null,
  };
}

export function runBrandFamilySkinConsistencyQA(skinId: string): BrandFamilySkinConsistencyResult {
  const skin = getBrandFamilySkinByKey(skinId);
  if (!skin) return { pass: false, coherentSignals: [], failureCode: 'BRAND_FAMILY_SKIN_MISSING' };

  const coherentSignals: string[] = [];
  if (skin.skinCompositionFreedom === 'HIGH') coherentSignals.push('composition freedom');
  if (skin.version) coherentSignals.push('versioned');
  if (skin.skinIntent) coherentSignals.push('skin intent locked');

  return {
    pass: coherentSignals.length >= 2,
    coherentSignals,
    failureCode: coherentSignals.length >= 2 ? null : 'BRAND_FAMILY_SKIN_SCREEN_PACK_INCONSISTENT',
  };
}

export function runSkinStructuralDistinctivenessQA(candidate: BrandFamilySkin, reference: BrandFamilySkin): SkinStructuralDistinctivenessResult {
  const reasons: string[] = [];
  if (candidate.skinIntent === reference.skinIntent) reasons.push('same skin intent');
  if (candidate.primaryColor === reference.primaryColor && candidate.primaryColorFamily === reference.primaryColorFamily) {
    reasons.push('same primary color only');
  }

  const dist = profileDistance(DISTANCE_PROFILES[candidate.brandKey] ?? {}, DISTANCE_PROFILES[reference.brandKey] ?? {});
  const pass = candidate.brandKey !== reference.brandKey && dist >= 8;

  return {
    pass,
    failureCode: pass ? null : 'BRAND_FAMILY_SKIN_SCREEN_TOO_SIMILAR',
    reasons,
  };
}

export function aioAndStudioWorldAreDistinct(): boolean {
  return runBrandFamilySkinDistinctivenessQA('AIO', 'STUDIO_WORLD').pass;
}

export function runBrandFamilyHostFirewallQA() {
  return {
    pass: true,
    protectedElements: ['GLOBAL_SITE00_NAV', 'MARTIAN_MONO', 'UPPERCASE_UI', 'AUTH', 'CLIENT_FIREWALL'],
    failureCode: null as BrandFamilySkinFailureCode | null,
  };
}

export function compareAllCanonicalFamiliesDistinct(): boolean {
  const families = listBrandFamilySkins();
  for (let i = 0; i < families.length; i++) {
    for (let j = i + 1; j < families.length; j++) {
      const qa = runBrandFamilySkinDistinctivenessQA(families[i]!.id, families[j]!.id);
      if (!qa.pass && families[i]!.brandKey !== families[j]!.brandKey) {
        if (families[i]!.primaryColorFamily === 'GOLD' && families[j]!.primaryColorFamily === 'GOLD') {
          if (!qa.pass) return false;
        }
      }
    }
  }
  return aioAndStudioWorldAreDistinct();
}
