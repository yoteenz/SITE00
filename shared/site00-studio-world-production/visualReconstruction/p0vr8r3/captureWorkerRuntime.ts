/**
 * P0.VR.8R3R4 — In-process worker runtime flags (not canonical health).
 */

let bootStarted = false;
let activeWorkerId: string | null = null;

export function isCaptureWorkerBootStarted(): boolean {
  return bootStarted;
}

export function markCaptureWorkerBootStarted(workerId: string): void {
  bootStarted = true;
  activeWorkerId = workerId;
}

export function getActiveCaptureWorkerId(): string | null {
  return activeWorkerId;
}

export function resetCaptureWorkerRuntimeForTest(): void {
  bootStarted = false;
  activeWorkerId = null;
}
