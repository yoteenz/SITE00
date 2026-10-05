/**
 * P0.E.FT3.1 — Project-scoped responsive hotspot definitions.
 */

import type { AstralHotspotDef, AstralSceneId } from './types.js';

export const ASTRAL_HOTSPOTS: AstralHotspotDef[] = [
  // HOME_ARRIVAL
  {
    hotspotId: 'ENTER_ASTREA',
    sceneId: 'HOME_ARRIVAL',
    label: 'Enter Astréa',
    action: 'NAVIGATE',
    target: 'astrea',
    rect: { xPercent: 18, yPercent: 62, widthPercent: 64, heightPercent: 12 },
    mobileAdjustment: { yPercent: 58, heightPercent: 14 },
  },
  // ASTREA_DISTRICT — aligned to reference composition (18% / 50% / 82% desktop; vertical mobile stack)
  {
    hotspotId: 'DEST_TAROT_SUITE',
    sceneId: 'ASTREA_DISTRICT',
    assetAnchor: 'TAROT_SUITE_ENTRANCE',
    label: 'Tarot Suite',
    action: 'NAVIGATE',
    target: 'astrea/tarot-suite',
    rect: { xPercent: 6, yPercent: 48, widthPercent: 22, heightPercent: 28 },
    mobileAdjustment: { xPercent: 10, yPercent: 58, widthPercent: 80, heightPercent: 14 },
    desktopAdjustment: { xPercent: 4, yPercent: 44, widthPercent: 20, heightPercent: 32 },
  },
  {
    hotspotId: 'DEST_ASTRAL_MALL',
    sceneId: 'ASTREA_DISTRICT',
    assetAnchor: 'ASTRAL_MALL_CENTER',
    label: 'Astral Mall',
    action: 'NAVIGATE',
    target: 'astrea/astral-mall',
    rect: { xPercent: 38, yPercent: 36, widthPercent: 24, heightPercent: 32 },
    mobileAdjustment: { xPercent: 10, yPercent: 40, widthPercent: 80, heightPercent: 14 },
    desktopAdjustment: { xPercent: 36, yPercent: 32, widthPercent: 28, heightPercent: 36 },
  },
  {
    hotspotId: 'DEST_COFFEE_SHOP',
    sceneId: 'ASTREA_DISTRICT',
    assetAnchor: 'COFFEE_SHOP_CORNER',
    label: 'Coffee Shop',
    action: 'NAVIGATE',
    target: 'astrea/coffee-shop',
    rect: { xPercent: 72, yPercent: 48, widthPercent: 22, heightPercent: 28 },
    mobileAdjustment: { xPercent: 10, yPercent: 22, widthPercent: 80, heightPercent: 14 },
    desktopAdjustment: { xPercent: 74, yPercent: 44, widthPercent: 20, heightPercent: 32 },
  },
  // TAROT_SUITE
  {
    hotspotId: 'SUITE_READING_TABLE',
    sceneId: 'TAROT_SUITE',
    assetAnchor: 'READING_TABLE',
    label: 'Reading Table',
    action: 'OPEN_DRAWER',
    target: 'reading-choice',
    rect: { xPercent: 28, yPercent: 48, widthPercent: 44, heightPercent: 28 },
  },
  {
    hotspotId: 'SUITE_READER_WALL',
    sceneId: 'TAROT_SUITE',
    assetAnchor: 'READER_PANEL',
    label: 'Readers',
    action: 'OPEN_DRAWER',
    target: 'reader-panel',
    rect: { xPercent: 72, yPercent: 22, widthPercent: 24, heightPercent: 52 },
    mobileAdjustment: { xPercent: 68, widthPercent: 28 },
  },
  {
    hotspotId: 'SUITE_JOURNAL',
    sceneId: 'TAROT_SUITE',
    assetAnchor: 'JOURNAL_OBJECT',
    label: 'Journal',
    action: 'NAVIGATE',
    target: 'journal',
    rect: { xPercent: 8, yPercent: 58, widthPercent: 16, heightPercent: 22 },
  },
  // ASTRAL_MALL — scene-anchored kiosks (no pricing grid)
  {
    hotspotId: 'MALL_QUICK_PULL',
    sceneId: 'ASTRAL_MALL',
    assetAnchor: 'QUICK_PULL_KIOSK',
    label: 'Quick Pull',
    action: 'OPEN_DRAWER',
    target: 'kiosk-quick-pull',
    rect: { xPercent: 42, yPercent: 40, widthPercent: 16, heightPercent: 22 },
    mobileAdjustment: { xPercent: 40, yPercent: 38, widthPercent: 18, heightPercent: 24 },
  },
  {
    hotspotId: 'MALL_LOVE_KIOSK',
    sceneId: 'ASTRAL_MALL',
    assetAnchor: 'LOVE_KIOSK',
    label: 'Love',
    action: 'OPEN_DRAWER',
    target: 'kiosk-love',
    rect: { xPercent: 12, yPercent: 46, widthPercent: 16, heightPercent: 20 },
    mobileAdjustment: { xPercent: 8, yPercent: 44, widthPercent: 18, heightPercent: 22 },
  },
  {
    hotspotId: 'MALL_CAREER_KIOSK',
    sceneId: 'ASTRAL_MALL',
    assetAnchor: 'CAREER_KIOSK',
    label: 'Career',
    action: 'OPEN_DRAWER',
    target: 'kiosk-career',
    rect: { xPercent: 72, yPercent: 42, widthPercent: 16, heightPercent: 20 },
    mobileAdjustment: { xPercent: 74, yPercent: 40, widthPercent: 18, heightPercent: 22 },
  },
  {
    hotspotId: 'MALL_YES_NO',
    sceneId: 'ASTRAL_MALL',
    assetAnchor: 'YES_NO_KIOSK',
    label: 'Yes / No',
    action: 'OPEN_DRAWER',
    target: 'kiosk-yes-no',
    rect: { xPercent: 58, yPercent: 52, widthPercent: 14, heightPercent: 18 },
    mobileAdjustment: { xPercent: 56, yPercent: 50, widthPercent: 16, heightPercent: 20 },
  },
  {
    hotspotId: 'MALL_GENERAL_INSIGHT',
    sceneId: 'ASTRAL_MALL',
    assetAnchor: 'GENERAL_KIOSK',
    label: 'Insight',
    action: 'OPEN_DRAWER',
    target: 'kiosk-general',
    rect: { xPercent: 28, yPercent: 52, widthPercent: 14, heightPercent: 18 },
    mobileAdjustment: { xPercent: 26, yPercent: 50, widthPercent: 16, heightPercent: 20 },
  },
  // COFFEE_SHOP
  {
    hotspotId: 'TABLE_01',
    sceneId: 'COFFEE_SHOP',
    assetAnchor: 'TABLE_01',
    label: 'Table 1',
    action: 'OPEN_DRAWER',
    target: 'table-1',
    rect: { xPercent: 8, yPercent: 52, widthPercent: 26, heightPercent: 28 },
  },
  {
    hotspotId: 'TABLE_02',
    sceneId: 'COFFEE_SHOP',
    assetAnchor: 'TABLE_02',
    label: 'Table 2',
    action: 'OPEN_DRAWER',
    target: 'table-2',
    rect: { xPercent: 38, yPercent: 48, widthPercent: 26, heightPercent: 30 },
  },
  {
    hotspotId: 'TABLE_03',
    sceneId: 'COFFEE_SHOP',
    assetAnchor: 'TABLE_03',
    label: 'Table 3',
    action: 'OPEN_DRAWER',
    target: 'table-3',
    rect: { xPercent: 68, yPercent: 54, widthPercent: 26, heightPercent: 28 },
  },
  {
    hotspotId: 'COFFEE_BAR',
    sceneId: 'COFFEE_SHOP',
    assetAnchor: 'BAR',
    label: 'Bar',
    action: 'OPEN_OVERLAY',
    target: 'readers-here',
    rect: { xPercent: 42, yPercent: 18, widthPercent: 18, heightPercent: 22 },
  },
];

export function getHotspotsForScene(sceneId: AstralSceneId, mobile = false): AstralHotspotDef[] {
  return ASTRAL_HOTSPOTS.filter((h) => h.sceneId === sceneId).map((h) => {
    const adj = mobile ? h.mobileAdjustment : h.desktopAdjustment;
    if (!adj) return h;
    return {
      ...h,
      rect: {
        xPercent: adj.xPercent ?? h.rect.xPercent,
        yPercent: adj.yPercent ?? h.rect.yPercent,
        widthPercent: adj.widthPercent ?? h.rect.widthPercent,
        heightPercent: adj.heightPercent ?? h.rect.heightPercent,
      },
    };
  });
}

export function getHotspotById(hotspotId: string): AstralHotspotDef | undefined {
  return ASTRAL_HOTSPOTS.find((h) => h.hotspotId === hotspotId);
}
