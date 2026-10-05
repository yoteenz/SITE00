/**
 * P0.E.FT5.2 — FT5.1 asset reconciliation against canonical screen masters.
 * Preserves all receipts/lineage; never deletes generated outputs.
 */

import { P0_SLOT_KEYS, P1_SLOT_KEYS, P2_SLOT_KEYS } from '../generation/assetSlotRegistry.js';
import type { Ft51AssetReconciliation, Ft51AssetReconciliationClass } from './types.js';

const SLOT_TO_SCREENS: Record<string, string[]> = {
  ASTRAL_WORLD_HERO_MOBILE: ['AW_M_01_WORLD_ENTRY'],
  ASTRAL_WORLD_HERO_DESKTOP: ['AW_D_01_WORLD_ENTRY'],
  ASTREA_DISTRICT_PANORAMA_MOBILE: ['AW_M_02_ASTREA_DISTRICT'],
  ASTREA_DISTRICT_PANORAMA_DESKTOP: ['AW_D_02_ASTREA_DISTRICT'],
  TAROT_SUITE_HERO_MOBILE: ['AW_M_03_TAROT_SUITE'],
  TAROT_SUITE_HERO_DESKTOP: ['AW_D_03_TAROT_SUITE'],
  ASTRAL_MALL_HERO_MOBILE: ['AW_M_04_ASTRAL_MALL'],
  ASTRAL_MALL_HERO_DESKTOP: ['AW_D_04_ASTRAL_MALL'],
  COFFEE_SHOP_HERO_MOBILE: ['AW_M_05_COFFEE_SHOP'],
  COFFEE_SHOP_HERO_DESKTOP: ['AW_D_05_COFFEE_SHOP'],
  COFFEE_SHOP_TABLE_SCENE: ['AW_M_05_COFFEE_SHOP', 'AW_M_13_COFFEE_TABLE_SELECTED'],
  CIRCLE_COMMUNITY_HERO: ['AW_M_06_FIND_MY_READER', 'AW_M_08_FRIENDS'],
  JOURNAL_ARTIFACT: ['AW_M_09_JOURNAL'],
  CUSTOM_AVATAR_HERO: ['AW_M_10_PROFILE'],
  DAILY_CARD_ARTIFACT: ['AW_M_10_PROFILE'],
  CREATE_A_DECK_HERO: ['AW_M_10_PROFILE'],
};

function classifySlot(slotKey: string): Ft51AssetReconciliationClass {
  const screens = SLOT_TO_SCREENS[slotKey];
  if (!screens?.length) {
    if (slotKey.startsWith('READER_PORTRAIT_') || slotKey.startsWith('FRIEND_AVATAR_')) {
      return 'POTENTIALLY_REUSABLE';
    }
    return 'UNBOUND_EXPLORATION';
  }
  if (P0_SLOT_KEYS.includes(slotKey as (typeof P0_SLOT_KEYS)[number])) {
    return 'SCREEN_ALIGNED_REUSABLE';
  }
  if (P1_SLOT_KEYS.includes(slotKey as (typeof P1_SLOT_KEYS)[number])) {
    return 'POTENTIALLY_REUSABLE';
  }
  if (P2_SLOT_KEYS.includes(slotKey as (typeof P2_SLOT_KEYS)[number])) {
    return 'POTENTIALLY_REUSABLE';
  }
  return 'SCREEN_ALIGNED_REUSABLE';
}

function reasonFor(classification: Ft51AssetReconciliationClass, slotKey: string, screens: string[]): string {
  switch (classification) {
    case 'SCREEN_ALIGNED_REUSABLE':
      return `P0 environment slot maps to screen master(s): ${screens.join(', ')}. Bind after founder QA against canonical master.`;
    case 'POTENTIALLY_REUSABLE':
      return `Portrait/artifact slot ${slotKey} may serve ${screens.join(', ') || 'multiple screens'} — verify against screen master before activation.`;
    case 'REQUIRES_REGENERATION':
      return `Generated composition does not match canonical screen master geometry for ${screens.join(', ')}.`;
    case 'UNBOUND_EXPLORATION':
      return `No canonical screen master binding yet for ${slotKey}.`;
    default:
      return '';
  }
}

export function reconcileFt51Assets(
  overrides?: Record<string, Ft51AssetReconciliationClass>,
): Ft51AssetReconciliation[] {
  const allSlots = [...P0_SLOT_KEYS, ...P1_SLOT_KEYS, ...P2_SLOT_KEYS];
  return allSlots.map((slotKey) => {
    const classification = overrides?.[slotKey] ?? classifySlot(slotKey);
    const servesScreens = SLOT_TO_SCREENS[slotKey] ?? [];
    return {
      slotKey,
      classification,
      servesScreens,
      reason: reasonFor(classification, slotKey, servesScreens),
    };
  });
}

export function markRegenerationRequired(
  reconciliations: Ft51AssetReconciliation[],
  slotKey: string,
  screenId: string,
): Ft51AssetReconciliation[] {
  return reconciliations.map((r) =>
    r.slotKey === slotKey
      ? {
          ...r,
          classification: 'REQUIRES_REGENERATION',
          reason: `Composition mismatch with canonical screen ${screenId}. Regenerate against screen master; do not redesign screen.`,
        }
      : r,
  );
}

export function countReconciliation(reconciliations: Ft51AssetReconciliation[]): Record<Ft51AssetReconciliationClass, number> {
  const out: Record<Ft51AssetReconciliationClass, number> = {
    SCREEN_ALIGNED_REUSABLE: 0,
    POTENTIALLY_REUSABLE: 0,
    REQUIRES_REGENERATION: 0,
    UNBOUND_EXPLORATION: 0,
  };
  for (const r of reconciliations) out[r.classification] += 1;
  return out;
}
