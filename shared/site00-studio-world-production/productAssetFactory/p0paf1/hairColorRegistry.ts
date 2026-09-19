/**
 * P0.PAF.1 — Frontal Slayer hair color registry (UI swatches + FAL prompt authority).
 */

export type HairColorEntry = {
  colorId: string;
  displayName: string;
  swatch: string;
  promptDescription: string;
  referenceAssets: string[];
  status: 'ACTIVE' | 'INACTIVE';
};

export const FRONTAL_SLAYER_HAIR_COLOR_REGISTRY: HairColorEntry[] = [
  { colorId: 'natural-black', displayName: 'NATURAL BLACK', swatch: '#1a1a1a', promptDescription: 'natural black with subtle brown undertones', referenceAssets: [], status: 'ACTIVE' },
  { colorId: 'jet-black', displayName: 'JET BLACK', swatch: '#0a0a0a', promptDescription: 'deep jet black, cool tone', referenceAssets: [], status: 'ACTIVE' },
  { colorId: 'color-2', displayName: '#2', swatch: '#2b2118', promptDescription: 'dark brown #2', referenceAssets: [], status: 'ACTIVE' },
  { colorId: 'chocolate', displayName: 'CHOCOLATE', swatch: '#4a2c1a', promptDescription: 'rich chocolate brown', referenceAssets: [], status: 'ACTIVE' },
  { colorId: 'honey-blonde', displayName: 'HONEY BLONDE', swatch: '#c9954a', promptDescription: 'warm honey blonde with dimensional highlights', referenceAssets: [], status: 'ACTIVE' },
  { colorId: 'burgundy', displayName: 'BURGUNDY', swatch: '#6b1a2a', promptDescription: 'deep burgundy wine red', referenceAssets: [], status: 'ACTIVE' },
];

export function getActiveHairColors(): HairColorEntry[] {
  return FRONTAL_SLAYER_HAIR_COLOR_REGISTRY.filter((c) => c.status === 'ACTIVE');
}

export function getHairColorById(colorId: string): HairColorEntry | null {
  return FRONTAL_SLAYER_HAIR_COLOR_REGISTRY.find((c) => c.colorId === colorId) ?? null;
}

export function listHairColorOptions(): { id: string; label: string }[] {
  return getActiveHairColors().map((c) => ({ id: c.colorId, label: c.displayName }));
}
