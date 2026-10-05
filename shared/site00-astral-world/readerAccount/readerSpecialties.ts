/**
 * P0.R.1 — Canonical Reader specialty taxonomy (aligned with Find My Reader filters).
 */

import type { ReaderSpecialtyId } from './types.js';

export type ReaderSpecialtyDef = {
  id: ReaderSpecialtyId;
  label: string;
  description: string;
  /** Maps to legacy AstralReader.categories filter strings */
  legacyCategory: string;
};

export const READER_SPECIALTY_REGISTRY: Record<ReaderSpecialtyId, ReaderSpecialtyDef> = {
  TAROT: { id: 'TAROT', label: 'Tarot', description: 'Tarot readings and card-based guidance', legacyCategory: 'TAROT' },
  LOVE: { id: 'LOVE', label: 'Love', description: 'Relationships, connection, heart matters', legacyCategory: 'LOVE' },
  CAREER: { id: 'CAREER', label: 'Career', description: 'Work, purpose, professional clarity', legacyCategory: 'CAREER' },
  INTUITIVE: { id: 'INTUITIVE', label: 'Intuitive', description: 'Intuitive guidance and inner knowing', legacyCategory: 'INTUITIVE' },
  ENERGY: { id: 'ENERGY', label: 'Energy', description: 'Energy reading and alignment', legacyCategory: 'ENERGY' },
  SPIRIT_GUIDE: { id: 'SPIRIT_GUIDE', label: 'Spirit Guide', description: 'Spiritual guidance and messages', legacyCategory: 'INTUITIVE' },
  LIFE_PATH: { id: 'LIFE_PATH', label: 'Life Path', description: 'Direction, destiny, and life transitions', legacyCategory: 'CAREER' },
  CLARITY: { id: 'CLARITY', label: 'Clarity', description: 'Cutting through confusion with direct insight', legacyCategory: 'INTUITIVE' },
};

export const READER_SPECIALTY_LIST = Object.values(READER_SPECIALTY_REGISTRY);

export function specialtyLabels(ids: ReaderSpecialtyId[]): string {
  return ids.map((id) => READER_SPECIALTY_REGISTRY[id]?.label ?? id).join(' · ');
}

export function legacyCategoriesFromSpecialties(ids: ReaderSpecialtyId[]): string[] {
  const set = new Set<string>();
  for (const id of ids) {
    const cat = READER_SPECIALTY_REGISTRY[id]?.legacyCategory;
    if (cat) set.add(cat);
  }
  return [...set];
}
