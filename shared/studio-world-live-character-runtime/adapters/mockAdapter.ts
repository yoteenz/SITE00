import type { CharacterRuntimeAdapter, CharacterViewportState, RuntimeEvent, RuntimeSyncSnapshot } from '../adapter.js';
import type { CharacterAssemblyManifest } from '../manifest.js';
import { manifestFingerprint } from '../manifest.js';
import type { CharacterCaptureRecord, CharacterCaptureRequest } from '../capture.js';
import type { CaptureCameraPreset } from '../captureRig.js';
import type { RuntimeCommand, RuntimeResponse } from '../protocol.js';
import type { RuntimeHostRegistration } from '../runtimeHost.js';

/** Clearly labeled mock — never report as Unreal-proven. */
export class MockCharacterRuntimeAdapter implements CharacterRuntimeAdapter {
  readonly kind = 'mock' as const;
  readonly label = 'MOCK Character Runtime (not Unreal)';

  private viewportState: CharacterViewportState = 'OFFLINE';
  private manifest: CharacterAssemblyManifest | null = null;
  private listeners = new Set<(ev: RuntimeEvent) => void>();
  private appliedHash: string | null = null;
  private hairVariant = 'A';

  subscribe(listener: (ev: RuntimeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(ev: RuntimeEvent) {
    for (const l of this.listeners) l(ev);
  }

  private response(requestId: string, status: RuntimeResponse['status'], extra?: Partial<RuntimeResponse>): RuntimeResponse {
    return {
      protocolVersion: 1,
      requestId,
      status,
      runtimeCharacterId: this.manifest?.runtime.runtimeCharacterId ?? null,
      appliedAssemblyVersion: this.manifest?.assemblyVersion ?? null,
      runtimeStateHash: this.appliedHash,
      message: extra?.message ?? null,
      payload: extra?.payload ?? null,
      mock: true,
      timestamp: new Date().toISOString(),
    };
  }

  async connect(_host: RuntimeHostRegistration): Promise<void> {
    this.viewportState = 'LIVE';
    this.emit({ type: 'CONNECTION', state: this.viewportState });
  }

  async disconnect(): Promise<void> {
    this.viewportState = 'OFFLINE';
    this.emit({ type: 'CONNECTION', state: this.viewportState });
  }

  getViewportState(): CharacterViewportState {
    return this.viewportState;
  }

  async loadCharacter(manifest: CharacterAssemblyManifest): Promise<RuntimeResponse> {
    this.manifest = manifest;
    this.appliedHash = manifestFingerprint(manifest);
    const res = this.response(`mock-load-${Date.now()}`, 'APPLIED');
    this.emitSync(manifest);
    return res;
  }

  async applyAssembly(manifest: CharacterAssemblyManifest): Promise<RuntimeResponse> {
    this.manifest = manifest;
    this.appliedHash = manifestFingerprint(manifest);
    const res = this.response(`mock-apply-${Date.now()}`, 'APPLIED');
    this.emitSync(manifest);
    return res;
  }

  async setCamera(_preset: CaptureCameraPreset): Promise<RuntimeResponse> {
    return this.response(`mock-cam-${Date.now()}`, 'ACK');
  }

  async captureFrame(req: CharacterCaptureRequest): Promise<CharacterCaptureRecord> {
    const record: CharacterCaptureRecord = {
      ...req,
      imageUrl: null,
      imageBytesBase64: null,
      runtimeVersion: 'mock-0',
      capturedAt: new Date().toISOString(),
      source: 'MOCK',
      lineage: { projectId: '', entryId: '', approvedAuthorityId: null },
    };
    this.emit({ type: 'CAPTURE', record });
    return record;
  }

  async sendCommand(cmd: RuntimeCommand): Promise<RuntimeResponse> {
    if (cmd.command === 'SET_HAIR' && typeof cmd.payload.variant === 'string') {
      this.hairVariant = cmd.payload.variant;
    }
    const res = this.response(cmd.requestId, 'APPLIED', { payload: { hairVariant: this.hairVariant } });
    this.emit({ type: 'RESPONSE', response: res });
    if (this.manifest) this.emitSync(this.manifest);
    return res;
  }

  getSyncSnapshot(expected: { assemblyVersion: string; manifestHash: string }): RuntimeSyncSnapshot {
    const inSync = !!this.manifest && this.manifest.assemblyVersion === expected.assemblyVersion && this.appliedHash === expected.manifestHash;
    return {
      characterId: this.manifest?.characterId ?? '',
      assemblyVersion: this.manifest?.assemblyVersion ?? '',
      manifestHash: this.appliedHash ?? '',
      runtimeCharacterId: this.manifest?.runtime.runtimeCharacterId ?? null,
      runtimeStateHash: this.appliedHash,
      inSync,
    };
  }

  private emitSync(manifest: CharacterAssemblyManifest) {
    this.emit({
      type: 'SYNC',
      snapshot: this.getSyncSnapshot({ assemblyVersion: manifest.assemblyVersion, manifestHash: manifestFingerprint(manifest) }),
    });
  }
}
