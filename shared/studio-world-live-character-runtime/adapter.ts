import type { CharacterAssemblyManifest } from './manifest.js';
import type { CharacterCaptureRecord, CharacterCaptureRequest } from './capture.js';
import type { CaptureCameraPreset } from './captureRig.js';
import type { RuntimeCommand, RuntimeResponse } from './protocol.js';
import type { RuntimeHostRegistration } from './runtimeHost.js';

export type CharacterViewportProviderKind = 'STATIC_AUTHORITY' | 'LIVE_UNREAL' | 'CACHED_SIMULATION' | 'FINAL_RENDER';

export type CharacterViewportState =
  | 'OFFLINE'
  | 'CONNECTING'
  | 'LIVE'
  | 'SYNCING'
  | 'CAPTURING'
  | 'ERROR'
  | 'FALLBACK';

export type RuntimeSyncSnapshot = {
  characterId: string;
  assemblyVersion: string;
  manifestHash: string;
  runtimeCharacterId: string | null;
  runtimeStateHash: string | null;
  inSync: boolean;
};

export type RuntimeEvent =
  | { type: 'CONNECTION'; state: CharacterViewportState }
  | { type: 'SYNC'; snapshot: RuntimeSyncSnapshot }
  | { type: 'RESPONSE'; response: RuntimeResponse }
  | { type: 'CAPTURE'; record: CharacterCaptureRecord };

export interface CharacterRuntimeAdapter {
  readonly kind: 'mock' | 'unreal';
  readonly label: string;
  connect(host: RuntimeHostRegistration): Promise<void>;
  disconnect(): Promise<void>;
  getViewportState(): CharacterViewportState;
  loadCharacter(manifest: CharacterAssemblyManifest): Promise<RuntimeResponse>;
  applyAssembly(manifest: CharacterAssemblyManifest): Promise<RuntimeResponse>;
  setCamera(preset: CaptureCameraPreset): Promise<RuntimeResponse>;
  captureFrame(req: CharacterCaptureRequest): Promise<CharacterCaptureRecord>;
  sendCommand(cmd: RuntimeCommand): Promise<RuntimeResponse>;
  getSyncSnapshot(expected: { assemblyVersion: string; manifestHash: string }): RuntimeSyncSnapshot;
  subscribe(listener: (ev: RuntimeEvent) => void): () => void;
}
