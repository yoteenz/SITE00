/**
 * Actor → campaign → character lineage tracking.
 */

import type { ActorCampaignHistoryEntry, StudioWorldActor } from './types.js';

export function recordActorCampaignUsage(
  actor: StudioWorldActor,
  entry: Omit<ActorCampaignHistoryEntry, 'actorId' | 'recordedAt'>,
): StudioWorldActor {
  const recordedAt = new Date().toISOString();
  return {
    ...actor,
    projectsUsed: actor.projectsUsed.includes(entry.projectId) ?
      actor.projectsUsed
    : [...actor.projectsUsed, entry.projectId],
    campaignsUsed: actor.campaignsUsed.includes(entry.campaignId) ?
      actor.campaignsUsed
    : [...actor.campaignsUsed, entry.campaignId],
    charactersPlayed: actor.charactersPlayed.includes(entry.characterId) ?
      actor.charactersPlayed
    : [...actor.charactersPlayed, entry.characterId],
    updatedAt: recordedAt,
  };
}
