/**
 * Content Operations memory store — tests only.
 */

import type { ContentOperationsRun } from '../../../../shared/site00-brand-lore/contentOperations/types.js';

let run: ContentOperationsRun | null = null;

export async function getContentOperationsRun(_projectId: string): Promise<ContentOperationsRun | null> {
  return run;
}

export async function saveContentOperationsRun(next: ContentOperationsRun): Promise<ContentOperationsRun> {
  run = next;
  return next;
}

export function resetContentOperationsMemory(): void {
  run = null;
}
