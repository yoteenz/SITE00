export type ViewportLabPresetId =
  | 'desktop-wide'
  | 'tablet-portrait'
  | 'mobile-baseline'
  | 'mobile-wide'
  | 'iphone-16-pro'
  | 'iphone-16-pro-max'
  | 'pixel-9-pro';

export type ViewportLabPreset = {
  id: ViewportLabPresetId;
  label: string;
  width: number;
  height: number;
  category: 'desktop' | 'tablet' | 'mobile';
  /** Safe-area inset guides (CSS px) for QA overlay — host-only, not sent to client. */
  safeArea?: { top: number; bottom: number; left: number; right: number };
};

export const VIEWPORT_LAB_PRESETS: readonly ViewportLabPreset[] = [
  { id: 'desktop-wide', label: 'DESKTOP WIDE', width: 1672, height: 941, category: 'desktop' },
  { id: 'tablet-portrait', label: 'TABLET PORTRAIT', width: 1086, height: 1448, category: 'tablet' },
  {
    id: 'mobile-baseline',
    label: 'MOBILE BASELINE',
    width: 390,
    height: 844,
    category: 'mobile',
    safeArea: { top: 47, bottom: 34, left: 0, right: 0 },
  },
  {
    id: 'mobile-wide',
    label: 'MOBILE WIDE',
    width: 430,
    height: 932,
    category: 'mobile',
    safeArea: { top: 59, bottom: 34, left: 0, right: 0 },
  },
  {
    id: 'iphone-16-pro',
    label: 'IPHONE 16 PRO',
    width: 402,
    height: 874,
    category: 'mobile',
    safeArea: { top: 59, bottom: 34, left: 0, right: 0 },
  },
  {
    id: 'iphone-16-pro-max',
    label: 'IPHONE 16 PRO MAX',
    width: 440,
    height: 956,
    category: 'mobile',
    safeArea: { top: 59, bottom: 34, left: 0, right: 0 },
  },
  {
    id: 'pixel-9-pro',
    label: 'PIXEL 9 PRO',
    width: 412,
    height: 915,
    category: 'mobile',
    safeArea: { top: 24, bottom: 24, left: 0, right: 0 },
  },
] as const;

export function viewportLabPresetById(id: ViewportLabPresetId): ViewportLabPreset {
  const found = VIEWPORT_LAB_PRESETS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown viewport preset: ${id}`);
  return found;
}

export const VIEWPORT_LAB_DEFAULT_PRESET_ID: ViewportLabPresetId = 'mobile-baseline';
