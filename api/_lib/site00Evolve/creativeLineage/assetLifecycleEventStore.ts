/**
 * In-memory lifecycle event log (tests + fallback).
 */

import type { AssetLifecycleEvent } from '../../../../shared/site00-brand-lore/creativeLineage/assetLifecycleEvents.js';

const events: AssetLifecycleEvent[] = [];

export function resetAssetLifecycleEvents(): void {
  events.length = 0;
}

export async function appendAssetLifecycleEvent(event: AssetLifecycleEvent): Promise<AssetLifecycleEvent> {
  events.push(event);
  return event;
}

export async function listAssetLifecycleEvents(assetId: string): Promise<AssetLifecycleEvent[]> {
  return events.filter((e) => e.assetId === assetId);
}

export async function listBrandLifecycleEvents(brandSlug: string): Promise<AssetLifecycleEvent[]> {
  return events.filter((e) => e.brandSlug === brandSlug);
}
