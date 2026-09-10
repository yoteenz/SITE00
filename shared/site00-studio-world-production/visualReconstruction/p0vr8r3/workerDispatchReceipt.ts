/**
 * P0.VR.8R3R1 — Worker dispatch + acknowledgement receipts.
 */

export type WorkerDispatchReceipt = {
  dispatchId: string;
  workerId: string;
  jobId: string;
  runId: string;
  dispatchedAt: string;
  acknowledgedAt: string | null;
};

const receipts = new Map<string, WorkerDispatchReceipt>();

export function recordWorkerDispatch(input: {
  workerId: string;
  jobId: string;
  runId: string;
}): WorkerDispatchReceipt {
  const receipt: WorkerDispatchReceipt = {
    dispatchId: `wdr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    workerId: input.workerId,
    jobId: input.jobId,
    runId: input.runId,
    dispatchedAt: new Date().toISOString(),
    acknowledgedAt: null,
  };
  receipts.set(receipt.dispatchId, receipt);
  return receipt;
}

export function acknowledgeWorkerDispatch(dispatchId: string): WorkerDispatchReceipt | null {
  const receipt = receipts.get(dispatchId);
  if (!receipt) return null;
  const updated = { ...receipt, acknowledgedAt: new Date().toISOString() };
  receipts.set(dispatchId, updated);
  return updated;
}

export function listWorkerDispatchReceipts(runId?: string): WorkerDispatchReceipt[] {
  return [...receipts.values()].filter((r) => !runId || r.runId === runId);
}

export function clearWorkerDispatchReceiptsForTest(): void {
  receipts.clear();
}
