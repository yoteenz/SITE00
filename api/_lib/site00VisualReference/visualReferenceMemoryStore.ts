/**
 * In-memory visual reference memory store.
 */

import type { ClientVisualMemory, HostVisualMemory, VisualReferenceRecord } from '../../../shared/site00-visual-reference/types.js';

let hostMemory: HostVisualMemory | null = null;
let clientMemories: Map<string, ClientVisualMemory> = new Map();
let allReferences: Map<string, VisualReferenceRecord> = new Map();

export function getHostVisualMemory(): HostVisualMemory | null {
  return hostMemory;
}

export function saveHostVisualMemory(next: HostVisualMemory): HostVisualMemory {
  hostMemory = next;
  for (const ref of next.references) {
    allReferences.set(ref.id, ref);
  }
  return hostMemory;
}

export function getClientVisualMemory(projectId: string): ClientVisualMemory | null {
  return clientMemories.get(projectId) ?? null;
}

export function saveClientVisualMemory(next: ClientVisualMemory): ClientVisualMemory {
  clientMemories.set(next.projectId, next);
  for (const ref of next.references) {
    allReferences.set(ref.id, ref);
  }
  return next;
}

export function getVisualReferenceById(id: string): VisualReferenceRecord | null {
  return allReferences.get(id) ?? null;
}

export function saveVisualReference(ref: VisualReferenceRecord): VisualReferenceRecord {
  allReferences.set(ref.id, ref);
  if (hostMemory?.references.some((r) => r.id === ref.id)) {
    hostMemory = {
      ...hostMemory,
      references: hostMemory.references.map((r) => (r.id === ref.id ? ref : r)),
    };
  }
  return ref;
}

export function resetVisualReferenceMemory(): void {
  hostMemory = null;
  clientMemories = new Map();
  allReferences = new Map();
}
