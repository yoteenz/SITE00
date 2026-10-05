const completedKeys = new Map<string, { requestId: string; at: string }>();

export function resetJurnlIdempotencyForTests(): void {
  completedKeys.clear();
}

export function checkJurnlIdempotency(key: string | null | undefined): { ok: true } | { ok: false; priorRequestId: string } {
  if (!key?.trim()) return { ok: true };
  const prior = completedKeys.get(key.trim());
  if (prior) return { ok: false, priorRequestId: prior.requestId };
  return { ok: true };
}

export function recordJurnlIdempotency(key: string | null | undefined, requestId: string): void {
  if (!key?.trim()) return;
  completedKeys.set(key.trim(), { requestId, at: new Date().toISOString() });
}
