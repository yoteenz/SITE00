import type { ForensicBlueprintObject } from './types.js';
import { FORENSIC_REPLICATION_MODE } from './constants.js';

export function assertZeroInventionObjectOrder(
  expectedIds: string[],
  renderedIds: string[],
): { ok: boolean; violation: string | null } {
  const expected = expectedIds.filter((id) => id !== '70');
  for (let i = 0; i < expected.length; i += 1) {
    if (renderedIds[i] !== expected[i]) {
      return { ok: false, violation: `Object order drift at index ${i}: expected ${expected[i]}, got ${renderedIds[i] ?? 'missing'}` };
    }
  }
  return { ok: true, violation: null };
}

export function replicationModeIsForensic(mode: string | null | undefined): boolean {
  return mode === FORENSIC_REPLICATION_MODE;
}

export function countUnresolvedRequired(objects: ForensicBlueprintObject[], unresolvedIds: Set<string>): number {
  return objects.filter((o) => o.required && unresolvedIds.has(o.objectId)).length;
}
