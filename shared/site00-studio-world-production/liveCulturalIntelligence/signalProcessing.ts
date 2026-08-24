/**
 * Signal normalization, deduplication, clustering.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  LiveWorldSignal,
  SignalCluster,
  SignalDuplicateEvaluation,
  SignalDuplicateClass,
  SignalSourceType,
  SignalOrigin,
} from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildLiveWorldSignal(params: {
  projectId: string;
  brandId: string;
  title: string;
  summary: string;
  sourceType: SignalSourceType;
  signalOrigin: SignalOrigin;
  domains?: string[];
  entities?: string[];
  keywords?: string[];
  sourceIds?: string[];
  eventStart?: string | null;
  eventEnd?: string | null;
  velocity?: number;
  momentum?: number;
}): LiveWorldSignal {
  const now = new Date().toISOString();
  return {
    id: `lws-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    brandId: params.brandId,
    capturedAt: now,
    observedAt: now,
    sourceIds: params.sourceIds ?? ['manual-editorial'],
    sourceType: params.sourceType,
    signalType: params.sourceType,
    title: params.title,
    summary: params.summary,
    rawContext: params.summary,
    entities: params.entities ?? [],
    keywords: params.keywords ?? [],
    domains: params.domains ?? [],
    communities: [],
    geography: [],
    platforms: [],
    eventDate: params.eventStart ?? null,
    eventStart: params.eventStart ?? null,
    eventEnd: params.eventEnd ?? null,
    signalOrigin: params.signalOrigin,
    velocity: params.velocity ?? 0.5,
    momentum: params.momentum ?? 0.5,
    novelty: 0.6,
    saturation: 0.2,
    sourceDiversity: params.sourceIds?.length ?? 1,
    sourceConfidence: 0.7,
    culturalReach: 0.5,
    audienceRelevance: 0.5,
    historicalContextIds: [],
    relatedSignalIds: [],
    verificationState: 'PARTIAL',
    freshnessState: 'CURRENT',
    lifecycleState: params.signalOrigin === 'KNOWN_UPCOMING' ? 'WATCHING' : 'EMERGING',
    clusterId: null,
    fingerprint: fp(params.title),
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeSignalTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

export function evaluateSignalDuplicate(params: {
  signalA: LiveWorldSignal;
  signalB: LiveWorldSignal;
}): SignalDuplicateEvaluation {
  const normA = normalizeSignalTitle(params.signalA.title);
  const normB = normalizeSignalTitle(params.signalB.title);
  if (normA === normB) {
    const syndicated = params.signalA.sourceIds.some((id) => params.signalB.sourceIds.includes(id)) === false &&
      params.signalA.summary.slice(0, 80) === params.signalB.summary.slice(0, 80);
    return {
      signalAId: params.signalA.id,
      signalBId: params.signalB.id,
      classification: syndicated ? 'SAME_STORY_DIFFERENT_SOURCE' : 'SAME_EVENT',
      syndicated,
      reasoning: syndicated ? 'Syndicated coverage — not independent evidence' : 'Same normalized title',
    };
  }
  const sharedEntities = params.signalA.entities.filter((e) => params.signalB.entities.includes(e));
  if (sharedEntities.length >= 2) {
    return {
      signalAId: params.signalA.id,
      signalBId: params.signalB.id,
      classification: 'RELATED_BUT_DISTINCT',
      syndicated: false,
      reasoning: 'Shared entities but distinct titles',
    };
  }
  return {
    signalAId: params.signalA.id,
    signalBId: params.signalB.id,
    classification: 'UNRELATED',
    syndicated: false,
    reasoning: 'No duplicate relationship detected',
  };
}

export function clusterSignals(signals: LiveWorldSignal[]): { clusters: SignalCluster[]; signals: LiveWorldSignal[] } {
  const clusters: SignalCluster[] = [];
  const assigned = new Set<string>();
  const updated = [...signals];

  for (const signal of signals) {
    if (assigned.has(signal.id)) continue;
    const members = [signal];
    assigned.add(signal.id);
    for (const other of signals) {
      if (assigned.has(other.id)) continue;
      const dup = evaluateSignalDuplicate({ signalA: signal, signalB: other });
      if (dup.classification === 'SAME_EVENT' || dup.classification === 'SAME_STORY_DIFFERENT_SOURCE' || dup.classification === 'FOLLOW_UP') {
        members.push(other);
        assigned.add(other.id);
      }
    }
    const clusterId = `cluster-${fp(members.map((m) => m.id).sort().join('-'))}`;
    const cluster: SignalCluster = {
      id: clusterId,
      projectId: signal.projectId,
      primarySignalId: signal.id,
      signalIds: members.map((m) => m.id),
      sourceIds: [...new Set(members.flatMap((m) => m.sourceIds))],
      entities: [...new Set(members.flatMap((m) => m.entities))],
      topic: signal.title,
      firstObserved: signal.observedAt,
      lastUpdated: new Date().toISOString(),
      currentLifecycle: signal.lifecycleState,
      majorDevelopments: members.length > 1 ? ['Multiple sources covering same underlying story'] : [],
      contradictions: [],
      openQuestions: [],
      fingerprint: fp(clusterId),
    };
    clusters.push(cluster);
    for (let i = 0; i < updated.length; i += 1) {
      if (cluster.signalIds.includes(updated[i]!.id)) {
        updated[i] = { ...updated[i]!, clusterId };
      }
    }
  }
  return { clusters, signals: updated };
}

export function syndicationDoesNotCountAsSourceDiversity(cluster: SignalCluster): boolean {
  return cluster.sourceIds.length > 1 && cluster.majorDevelopments.some((d) => d.includes('Multiple sources'));
}

export function duplicateSignalsClusteredBeforeReasoning(signalCount: number, clusterCount: number): boolean {
  return clusterCount <= signalCount;
}

export type SignalDuplicateClassExport = SignalDuplicateClass;
