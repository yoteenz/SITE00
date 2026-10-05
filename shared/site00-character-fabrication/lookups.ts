import { BEHAVIOR_SKINS, WARDROBE_LIBRARY } from './library.js';
export const GARMENT_BY_ID = Object.fromEntries(WARDROBE_LIBRARY.map((x) => [x.garmentId, x]));
export const SKIN_BY_ID = Object.fromEntries(BEHAVIOR_SKINS.map((x) => [x.skinId, x]));
