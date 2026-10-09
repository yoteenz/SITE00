/**
 * Cloud preview: persist Digital Foundation memory store to a shared file so
 * Vite restarts and multiple :5174 backends (tunnel load balance) see the same tokens.
 */
import fs from 'node:fs';
import path from 'node:path';
import { isCloudMobilePreviewDev } from '../cloudMobilePreview.js';
import type { DfMemoryState } from './memoryStore.js';

export function previewSnapshotPath(): string {
  return (
    process.env.SITE00_DF_PREVIEW_SNAPSHOT_PATH?.trim() ||
    '/tmp/site00-digital-foundation-preview-memory.json'
  );
}

export function previewSnapshotEnabled(): boolean {
  return isCloudMobilePreviewDev();
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

function replacer(_key: string, value: unknown): JsonValue {
  if (value instanceof Map) {
    return { __t: 'Map', e: [...value.entries()] as JsonValue };
  }
  if (value instanceof Set) {
    return { __t: 'Set', e: [...value] as JsonValue };
  }
  return value as JsonValue;
}

function reviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const o = value as { __t?: string; e?: unknown };
    if (o.__t === 'Map' && Array.isArray(o.e)) return new Map(o.e as [unknown, unknown][]);
    if (o.__t === 'Set' && Array.isArray(o.e)) return new Set(o.e);
  }
  return value;
}

/** Merge snapshot file into live state (does not wipe rows missing from file). */
export function mergePreviewSnapshotFromDisk(target: DfMemoryState): boolean {
  if (!previewSnapshotEnabled()) return false;
  const file = previewSnapshotPath();
  if (!fs.existsSync(file)) return false;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw, reviver) as Partial<DfMemoryState>;
    mergeDfState(target, parsed);
    return true;
  } catch (e) {
    console.warn('[df-preview-snapshot] load failed', e);
    return false;
  }
}

function mergeDfState(target: DfMemoryState, incoming: Partial<DfMemoryState>): void {
  if (incoming.config) target.config = incoming.config;
  if (incoming.referralSources?.length) target.referralSources = incoming.referralSources;

  const mapKeys = [
    'leads',
    'artifacts',
    'artifactsByToken',
    'quotes',
    'acceptances',
    'stages',
    'clientActions',
    'approvals',
    'ownership',
    'buildReadiness',
    'credits',
    'checkoutSessions',
    'runbooks',
    'runbookHistory',
    'tasks',
    'verificationRules',
    'verificationResults',
    'verificationOverrides',
    'forecasts',
    'projectConfig',
    'readinessClock',
  ] as const;

  for (const key of mapKeys) {
    const src = incoming[key];
    if (src instanceof Map) {
      for (const [k, v] of src.entries()) {
        (target[key] as Map<unknown, unknown>).set(k, v);
      }
    }
  }

  if (incoming.events?.length) {
    const seen = new Set(target.events.map((e) => e.event_id));
    for (const ev of incoming.events) {
      if (!seen.has(ev.event_id)) target.events.push(ev);
    }
  }

  if (incoming.stripeProcessedEventIds instanceof Set) {
    for (const id of incoming.stripeProcessedEventIds) target.stripeProcessedEventIds.add(id);
  }
}

export function writePreviewSnapshotFromState(source: DfMemoryState): void {
  if (!previewSnapshotEnabled()) return;
  const file = previewSnapshotPath();
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(source, replacer), 'utf8');
    fs.renameSync(tmp, file);
  } catch (e) {
    console.warn('[df-preview-snapshot] write failed', e);
  }
}

export function touchPreviewSnapshotAfterMutation(state: DfMemoryState): void {
  writePreviewSnapshotFromState(state);
}
