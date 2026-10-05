/**
 * P0.5E.5 — Character Bible ingestion pipeline.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  CharacterBibleIngestionReceipt,
  EmbodiedCharacterBible,
} from './types.js';
import type { BibleSourceType } from './types.js';
import { fingerprintBible } from './embodiedCharacterBible.js';

export function ingestCharacterBible(params: {
  bible: EmbodiedCharacterBible;
  rawSource: string;
  sourceType: BibleSourceType;
  sourceVersion?: string;
  normalized: Partial<EmbodiedCharacterBible>;
}): { bible: EmbodiedCharacterBible; receipt: CharacterBibleIngestionReceipt } {
  const sourceFingerprint = createHash('sha256').update(params.rawSource).digest('hex').slice(0, 16);
  const normalizedFields = Object.keys(params.normalized).filter(
    (k) => params.normalized[k as keyof EmbodiedCharacterBible] != null,
  );
  const unmappedFields: string[] = [];
  const conflicts: string[] = [];
  const warnings: string[] = [];
  const missingCriticalFields: string[] = [];

  if (!params.normalized.characterEssence) missingCriticalFields.push('characterEssence');
  if (!params.normalized.faceLogic) missingCriticalFields.push('faceLogic');
  if (!params.normalized.visualIdentity) missingCriticalFields.push('visualIdentity');

  const merged: EmbodiedCharacterBible = {
    ...params.bible,
    ...params.normalized,
    status: missingCriticalFields.length > 0 ? 'BIBLE_PARTIAL' : 'BIBLE_CHARACTER_READY',
    version: bumpMinorVersion(params.bible.version),
    updatedAt: new Date().toISOString(),
  };
  merged.fingerprint = fingerprintBible(merged);

  const receipt: CharacterBibleIngestionReceipt = {
    receiptId: randomUUID(),
    rawSource: params.rawSource,
    sourceType: params.sourceType,
    sourceVersion: params.sourceVersion ?? null,
    sourceFingerprint,
    normalizedFields,
    unmappedFields,
    conflicts,
    warnings,
    missingCriticalFields,
    ingestedAt: new Date().toISOString(),
  };

  return { bible: merged, receipt };
}

function bumpMinorVersion(version: string): string {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return '0.1.0-precast';
  return `${match[1]}.${Number(match[2]) + 1}.0`;
}

export function rawSourcePreserved(receipt: CharacterBibleIngestionReceipt): boolean {
  return receipt.rawSource.length > 0 && receipt.sourceFingerprint.length > 0;
}
