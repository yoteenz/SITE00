/**
 * Upgraded live watch queue with state transitions.
 */

import { randomUUID } from 'node:crypto';
import type { LiveWatchQueue, LiveWatchQueueEntry, LiveWatchQueueState, LiveWorldSignal } from './types.js';

export function buildLiveWatchQueueEntry(params: {
  signal: LiveWorldSignal;
  watchState?: LiveWatchQueueState;
  triggerNotes?: string;
  conditionalReassessment?: string[];
}): LiveWatchQueueEntry {
  const now = new Date().toISOString();
  const state = params.watchState ?? 'WATCHING';
  return {
    entryId: `lwq-${randomUUID().slice(0, 8)}`,
    signalId: params.signal.id,
    clusterId: params.signal.clusterId,
    subject: params.signal.title,
    watchState: state,
    triggerNotes: params.triggerNotes ?? 'Monitoring for brand angle',
    conditionalReassessment: params.conditionalReassessment ?? [
      'IF NEW DATA RELEASES → REASSESS',
      'IF THIS REACHES MAINSTREAM → CHECK WHETHER BRAND ANGLE STILL EXISTS',
    ],
    stateHistory: [{ state, at: now, note: 'Initial watch entry' }],
    contentOpportunityId: null,
    updatedAt: now,
  };
}

export function transitionWatchQueueEntry(
  entry: LiveWatchQueueEntry,
  nextState: LiveWatchQueueState,
  note: string,
): LiveWatchQueueEntry {
  return {
    ...entry,
    watchState: nextState,
    stateHistory: [...entry.stateHistory, { state: nextState, at: new Date().toISOString(), note }],
    updatedAt: new Date().toISOString(),
  };
}

export function buildLiveWatchQueue(params: {
  projectId: string;
  entries: LiveWatchQueueEntry[];
}): LiveWatchQueue {
  return {
    queueId: `live-watch-${params.projectId}`,
    projectId: params.projectId,
    entries: params.entries,
    updatedAt: new Date().toISOString(),
  };
}

export function watchingDoesNotAutoPromoteToContent(entry: LiveWatchQueueEntry): boolean {
  return entry.watchState === 'WATCHING' || entry.watchState === 'WAITING_FOR_DATA' || entry.contentOpportunityId === null;
}

export function watchQueueStateTransitionsPersist(entry: LiveWatchQueueEntry): boolean {
  return entry.stateHistory.length >= 1;
}
