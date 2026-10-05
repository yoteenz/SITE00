/**
 * Deterministic capture rig presets — same preset → same geometric view.
 */

export const CAPTURE_CAMERA_PRESETS = [
  'FRONT_FULL_BODY',
  'FRONT_PORTRAIT',
  'LEFT_PROFILE',
  'RIGHT_PROFILE',
  'BACK_FULL_BODY',
  'LEFT_THREE_QUARTER',
  'RIGHT_THREE_QUARTER',
] as const;

export type CaptureCameraPreset = (typeof CAPTURE_CAMERA_PRESETS)[number];

export type CaptureRigPreset = {
  id: CaptureCameraPreset;
  focalLengthMm: number;
  cameraHeightM: number;
  cameraDistanceM: number;
  lookAtHeightM: number;
  outputWidth: number;
  outputHeight: number;
  backgroundMode: 'TRANSPARENT' | 'NEUTRAL_GRAY' | 'TESTING_GROUND';
};

export const DEFAULT_CAPTURE_RIG: Record<CaptureCameraPreset, CaptureRigPreset> = {
  FRONT_FULL_BODY: { id: 'FRONT_FULL_BODY', focalLengthMm: 35, cameraHeightM: 1.0, cameraDistanceM: 3.2, lookAtHeightM: 0.95, outputWidth: 1080, outputHeight: 1920, backgroundMode: 'NEUTRAL_GRAY' },
  FRONT_PORTRAIT: { id: 'FRONT_PORTRAIT', focalLengthMm: 85, cameraHeightM: 1.55, cameraDistanceM: 1.8, lookAtHeightM: 1.55, outputWidth: 1024, outputHeight: 1280, backgroundMode: 'NEUTRAL_GRAY' },
  LEFT_PROFILE: { id: 'LEFT_PROFILE', focalLengthMm: 50, cameraHeightM: 1.45, cameraDistanceM: 2.4, lookAtHeightM: 1.45, outputWidth: 1024, outputHeight: 1280, backgroundMode: 'NEUTRAL_GRAY' },
  RIGHT_PROFILE: { id: 'RIGHT_PROFILE', focalLengthMm: 50, cameraHeightM: 1.45, cameraDistanceM: 2.4, lookAtHeightM: 1.45, outputWidth: 1024, outputHeight: 1280, backgroundMode: 'NEUTRAL_GRAY' },
  BACK_FULL_BODY: { id: 'BACK_FULL_BODY', focalLengthMm: 35, cameraHeightM: 1.0, cameraDistanceM: 3.2, lookAtHeightM: 0.95, outputWidth: 1080, outputHeight: 1920, backgroundMode: 'NEUTRAL_GRAY' },
  LEFT_THREE_QUARTER: { id: 'LEFT_THREE_QUARTER', focalLengthMm: 50, cameraHeightM: 1.35, cameraDistanceM: 2.6, lookAtHeightM: 1.35, outputWidth: 1024, outputHeight: 1280, backgroundMode: 'NEUTRAL_GRAY' },
  RIGHT_THREE_QUARTER: { id: 'RIGHT_THREE_QUARTER', focalLengthMm: 50, cameraHeightM: 1.35, cameraDistanceM: 2.6, lookAtHeightM: 1.35, outputWidth: 1024, outputHeight: 1280, backgroundMode: 'NEUTRAL_GRAY' },
};
