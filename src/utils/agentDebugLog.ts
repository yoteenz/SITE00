type AgentDebugPayload = {
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  timestamp: number;
};

export function writeAgentDebugLog(payload: Omit<AgentDebugPayload, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({ ...payload, timestamp: Date.now() });
  try {
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/__agent-debug-log', new Blob([body], { type: 'application/json' }));
      return;
    }
    void fetch('/__agent-debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // Diagnostic transport must never affect application routing.
  }
}
