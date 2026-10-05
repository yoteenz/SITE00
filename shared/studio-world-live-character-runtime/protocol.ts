/**
 * Versioned SITE00 ↔ Unreal command protocol (transport-agnostic).
 */

export const RUNTIME_PROTOCOL_VERSION = 1 as const;

export type RuntimeCommandName =
  | 'LOAD_CHARACTER'
  | 'APPLY_ASSEMBLY'
  | 'SET_BODY'
  | 'SET_HAIR'
  | 'SET_MAKEUP'
  | 'SET_WARDROBE'
  | 'SET_BEHAVIOR'
  | 'SET_MOTION'
  | 'SET_EXPRESSION'
  | 'SET_CAMERA'
  | 'RUN_TEST'
  | 'CAPTURE_FRAME'
  | 'CAPTURE_TURNTABLE';

export type RuntimeCommand = {
  protocolVersion: typeof RUNTIME_PROTOCOL_VERSION;
  requestId: string;
  characterId: string;
  assemblyVersion: string;
  manifestHash: string;
  command: RuntimeCommandName;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type RuntimeAckStatus = 'ACK' | 'APPLIED' | 'REJECTED' | 'ERROR' | 'CAPTURE_READY' | 'TEST_COMPLETE';

export type RuntimeResponse = {
  protocolVersion: typeof RUNTIME_PROTOCOL_VERSION;
  requestId: string;
  status: RuntimeAckStatus;
  runtimeCharacterId: string | null;
  appliedAssemblyVersion: string | null;
  runtimeStateHash: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  /** When true, response originated from MockCharacterRuntimeAdapter — not Unreal. */
  mock: boolean;
  timestamp: string;
};

export function serializeRuntimeCommand(cmd: RuntimeCommand): string {
  return JSON.stringify(cmd);
}

export function parseRuntimeResponse(raw: string): RuntimeResponse | null {
  try {
    const o = JSON.parse(raw) as RuntimeResponse;
    if (o.protocolVersion !== RUNTIME_PROTOCOL_VERSION) return null;
    if (typeof o.requestId !== 'string') return null;
    return o;
  } catch {
    return null;
  }
}
