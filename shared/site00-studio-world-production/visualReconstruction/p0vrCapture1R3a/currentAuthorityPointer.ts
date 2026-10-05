/**
 * P0.VR.AUTH.1 — Version-aware current authority pointer (page + viewport).
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { DESIGN_AUTHORITY_CURRENT_POINTER_LS_PREFIX } from './constants.js';

function pointerKey(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}:${pageId}:${viewport}`;
}

function readPointerMap(): Record<string, string> {
  if (typeof globalThis.localStorage === 'undefined') return {};
  try {
    const raw = globalThis.localStorage.getItem(DESIGN_AUTHORITY_CURRENT_POINTER_LS_PREFIX);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writePointerMap(map: Record<string, string>): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  try {
    globalThis.localStorage.setItem(DESIGN_AUTHORITY_CURRENT_POINTER_LS_PREFIX, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

export function setCurrentAuthorityPointer(input: {
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  authorityVersionId: string;
}): void {
  const map = readPointerMap();
  map[pointerKey(input.projectId, input.pageId, input.viewport)] = input.authorityVersionId;
  writePointerMap(map);
}

export function getCurrentAuthorityPointer(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): string | null {
  const map = readPointerMap();
  return map[pointerKey(projectId, pageId, viewport)] ?? null;
}

export function clearCurrentAuthorityPointersForTest(): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.removeItem(DESIGN_AUTHORITY_CURRENT_POINTER_LS_PREFIX);
}

export function exportAuthorityPointerMap(): Record<string, string> {
  return readPointerMap();
}

export function importAuthorityPointerMap(partial: Record<string, string>): void {
  writePointerMap({ ...readPointerMap(), ...partial });
}
