/**
 * P1 controlled proof run memory store.
 */

import type { P1ControlledProofRun } from './types.js';

let activeRun: P1ControlledProofRun | null = null;

export function getP1ControlledProofRun(): P1ControlledProofRun | null {
  return activeRun;
}

export function saveP1ControlledProofRun(run: P1ControlledProofRun): P1ControlledProofRun {
  activeRun = run;
  return run;
}

export function resetP1ControlledProofRun(): void {
  activeRun = null;
}
