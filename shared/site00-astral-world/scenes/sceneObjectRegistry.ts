/**
 * P0.E.FT3.1 — Generic Astral scene-object model.
 */

import type { AstralSceneObjectDef, AstralSceneId } from './types.js';

export const ASTRAL_SCENE_OBJECTS: AstralSceneObjectDef[] = [
  {
    objectId: 'obj-tarot-suite-dest',
    sceneId: 'ASTREA_DISTRICT',
    kind: 'DESTINATION',
    label: 'Tarot Suite',
    position: { xPercent: 4, yPercent: 38, widthPercent: 28, heightPercent: 32 },
    visualAssetKey: 'TAROT_SUITE_HERO_MOBILE',
    actionState: 'ENTER',
    overlayBehavior: 'transition',
    target: 'astrea/tarot-suite',
  },
  {
    objectId: 'obj-astral-mall-dest',
    sceneId: 'ASTREA_DISTRICT',
    kind: 'DESTINATION',
    label: 'Astral Mall',
    position: { xPercent: 36, yPercent: 28, widthPercent: 28, heightPercent: 38 },
    visualAssetKey: 'ASTRAL_MALL_HERO_MOBILE',
    actionState: 'ENTER',
    overlayBehavior: 'transition',
    target: 'astrea/astral-mall',
  },
  {
    objectId: 'obj-coffee-shop-dest',
    sceneId: 'ASTREA_DISTRICT',
    kind: 'DESTINATION',
    label: 'Coffee Shop',
    position: { xPercent: 68, yPercent: 42, widthPercent: 28, heightPercent: 34 },
    visualAssetKey: 'COFFEE_SHOP_HERO_MOBILE',
    actionState: 'ENTER',
    overlayBehavior: 'transition',
    target: 'astrea/coffee-shop',
  },
  {
    objectId: 'obj-table-1',
    sceneId: 'COFFEE_SHOP',
    kind: 'TABLE',
    label: 'Table 1',
    position: { xPercent: 8, yPercent: 52, widthPercent: 26, heightPercent: 28 },
    presenceState: 'JOINABLE',
    overlayBehavior: 'drawer',
    target: 'table-1',
  },
  {
    objectId: 'obj-table-2',
    sceneId: 'COFFEE_SHOP',
    kind: 'TABLE',
    label: 'Table 2',
    position: { xPercent: 38, yPercent: 48, widthPercent: 26, heightPercent: 30 },
    presenceState: 'ACTIVE',
    overlayBehavior: 'drawer',
    target: 'table-2',
  },
  {
    objectId: 'obj-table-3',
    sceneId: 'COFFEE_SHOP',
    kind: 'TABLE',
    label: 'Table 3',
    position: { xPercent: 68, yPercent: 54, widthPercent: 26, heightPercent: 28 },
    presenceState: 'PRIVATE',
    overlayBehavior: 'drawer',
    target: 'table-3',
  },
  {
    objectId: 'obj-journal',
    sceneId: 'JOURNAL_ARTIFACT',
    kind: 'JOURNAL',
    label: 'Open Journal',
    position: { xPercent: 8, yPercent: 20, widthPercent: 84, heightPercent: 62 },
    visualAssetKey: 'JOURNAL_ARTIFACT',
    overlayBehavior: 'drawer',
    target: 'journal-pages',
  },
  {
    objectId: 'obj-avatar-self',
    sceneId: 'PROFILE_AVATAR',
    kind: 'AVATAR',
    label: 'My Astral Self',
    position: { xPercent: 32, yPercent: 18, widthPercent: 36, heightPercent: 38 },
    visualAssetKey: 'CUSTOM_AVATAR_HERO',
    overlayBehavior: 'drawer',
    target: 'profile-actions',
  },
  {
    objectId: 'obj-portal-daily-card',
    sceneId: 'PROFILE_AVATAR',
    kind: 'PORTAL',
    label: 'Daily Card',
    position: { xPercent: 8, yPercent: 62, widthPercent: 40, heightPercent: 28 },
    visualAssetKey: 'DAILY_CARD_ARTIFACT',
    target: 'daily-card',
  },
  {
    objectId: 'obj-portal-custom-avatar',
    sceneId: 'PROFILE_AVATAR',
    kind: 'PORTAL',
    label: 'Custom Avatar',
    position: { xPercent: 52, yPercent: 62, widthPercent: 40, heightPercent: 28 },
    visualAssetKey: 'CUSTOM_AVATAR_HERO',
    target: 'custom-avatar',
  },
];

export function getSceneObjects(sceneId: AstralSceneId): AstralSceneObjectDef[] {
  return ASTRAL_SCENE_OBJECTS.filter((o) => o.sceneId === sceneId);
}

export function getSceneObjectsByKind(
  sceneId: AstralSceneId,
  kind: AstralSceneObjectDef['kind'],
): AstralSceneObjectDef[] {
  return ASTRAL_SCENE_OBJECTS.filter((o) => o.sceneId === sceneId && o.kind === kind);
}
