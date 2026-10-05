/**
 * Bootstrap EVOLVE seed data to Supabase using real organization UUIDs.
 * Idempotent — skips if profiles already exist.
 */

import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from './orgRegistry.js';
import {
  buildSeedCalendarItems,
  buildSeedCampaigns,
  buildSeedChannels,
  buildSeedEmailItems,
  buildSeedMarketingPlans,
  buildSeedObjectives,
  buildSeedProfiles,
  buildSeedSocialItems,
} from './seedFixtures.js';
import * as db from './supabaseStore.js';

const FIXTURE_TO_SLUG: Record<string, string> = {
  'org-00000000-0000-4000-8000-000000000001': 'site-00',
  'org-00000000-0000-4000-8000-000000000002': 'frontal-slayer',
  'org-00000000-0000-4000-8000-000000000003': 'all-in-one-enterprises',
  'org-00000000-0000-4000-8000-000000000004': 'studio-world',
};

function toRealOrgId(fixtureOrgId: string): string | null {
  const slug = FIXTURE_TO_SLUG[fixtureOrgId];
  return slug ? orgIdFromSlug(slug) ?? null : null;
}

function remapAllOrgIds<T extends { organization_id: string; id?: string }>(
  rows: T[],
  regenIds = false,
): T[] {
  return rows
    .map((r) => {
      const realId = toRealOrgId(r.organization_id);
      if (!realId) return null;
      return {
        ...r,
        ...(regenIds && r.id ? { id: randomUUID() } : {}),
        organization_id: realId,
      };
    })
    .filter((r): r is T => r !== null);
}

const idMap = new Map<string, string>();

let bootstrapPromise: Promise<void> | null = null;

export async function bootstrapEvolveIfEmpty(): Promise<{ seeded: boolean; reason: string }> {
  if (bootstrapPromise) {
    await bootstrapPromise;
    return { seeded: false, reason: 'bootstrap already ran' };
  }

  bootstrapPromise = (async () => {
    const count = await db.countProfiles();
    if (count > 0) return;

    idMap.clear();
    for (const c of buildSeedCampaigns()) idMap.set(c.id, randomUUID());
    for (const c of buildSeedCalendarItems()) idMap.set(c.id, randomUUID());

    const studioId = orgIdFromSlug('studio-world');
    const profiles = remapAllOrgIds(buildSeedProfiles(), true).filter((p) => p.organization_id !== studioId);
    for (const profile of profiles) await db.upsertProfile(profile);

    const channels = remapAllOrgIds(buildSeedChannels(), true).filter((c) => c.organization_id !== studioId);
    await db.upsertChannels(channels);

    for (const obj of remapAllOrgIds(buildSeedObjectives(), true).filter((o) => o.organization_id !== studioId)) {
      await db.insertObjectiveDb(obj);
    }

    for (const camp of remapAllOrgIds(buildSeedCampaigns()).map((c) => ({
      ...c,
      id: idMap.get(c.id) ?? randomUUID(),
    }))) {
      await db.insertCampaignDb(camp);
    }

    for (const item of remapAllOrgIds(buildSeedCalendarItems()).map((i) => ({
      ...i,
      id: idMap.get(i.id) ?? randomUUID(),
      campaign_id: i.campaign_id ? idMap.get(i.campaign_id as string) ?? null : null,
    }))) {
      await db.insertCalendarItemDb(item);
    }

    const emails = remapAllOrgIds(
      buildSeedEmailItems() as Array<{ organization_id: string; id: string; campaign_id?: string; calendar_item_id?: string }>,
      true,
    ).map((e) => ({
      ...e,
      campaign_id: e.campaign_id ? idMap.get(e.campaign_id) ?? null : null,
      calendar_item_id: e.calendar_item_id ? idMap.get(e.calendar_item_id) ?? null : null,
    }));
    if (emails.length) {
      const { error } = await (await import('../supabase.js')).getSupabaseAdmin()
        .from('site00_marketing_email_items')
        .insert(emails);
      if (error) throw error;
    }

    const social = remapAllOrgIds(
      buildSeedSocialItems() as Array<{ organization_id: string; id: string; campaign_id?: string; calendar_item_id?: string }>,
      true,
    ).map((s) => ({
      ...s,
      campaign_id: s.campaign_id ? idMap.get(s.campaign_id) ?? null : null,
      calendar_item_id: s.calendar_item_id ? idMap.get(s.calendar_item_id) ?? null : null,
    }));
    if (social.length) {
      const { error } = await (await import('../supabase.js')).getSupabaseAdmin()
        .from('site00_social_content_items')
        .insert(social);
      if (error) throw error;
    }

    const plans = remapAllOrgIds(buildSeedMarketingPlans() as Array<{ organization_id: string; id: string }>, true);
    if (plans.length) {
      const { error } = await (await import('../supabase.js')).getSupabaseAdmin()
        .from('site00_marketing_plans')
        .insert(plans);
      if (error) throw error;
    }
  })();

  await bootstrapPromise;
  const countAfter = await db.countProfiles();
  return { seeded: countAfter > 0, reason: countAfter > 0 ? 'bootstrap complete' : 'no profiles after bootstrap' };
}
