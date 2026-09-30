import type { CaptureCameraPreset } from './captureRig.js';

export type CapturePurpose = 'CHARACTER_SHEET' | 'AUTHORITY' | 'SIMULATION_EVIDENCE' | 'MARKETING' | 'DEBUG';

export type CharacterCaptureRequest = {
  captureId: string;
  characterId: string;
  actorId: string;
  assemblyVersion: string;
  manifestHash: string;
  runtimeCharacterId: string;
  cameraPreset: CaptureCameraPreset;
  posePreset: string;
  expressionPreset: string;
  resolution: { width: number; height: number };
  backgroundMode: 'TRANSPARENT' | 'NEUTRAL_GRAY' | 'TESTING_GROUND';
  capturePurpose: CapturePurpose;
  requestedAt: string;
};

export type CharacterCaptureRecord = CharacterCaptureRequest & {
  imageUrl: string | null;
  imageBytesBase64: string | null;
  runtimeVersion: string;
  capturedAt: string;
  /** MOCK when not from Unreal pixel readback */
  source: 'UNREAL' | 'MOCK' | 'STATIC_FALLBACK';
  lineage: {
    projectId: string;
    entryId: string;
    approvedAuthorityId: string | null;
  };
};
