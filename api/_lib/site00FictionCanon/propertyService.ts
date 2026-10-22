import crypto from 'node:crypto';
import type { FictionPropertyRecord } from '../../../shared/site00-fiction-canon/types.js';
import { THE_EXCHANGE_PROPERTY } from '../../../shared/site00-fiction-canon/constants.js';
import { buildTheExchangeOrientationSeedImports } from '../../../shared/site00-fiction-canon/seedOrientation.js';
import { ensureFounderProjectDbId } from '../site00Projects/founderProjectDbId.js';
import { ingestFictionCanonBatch } from './ingestService.js';
import { getFictionPropertyBySlug, saveFictionProperty } from './fictionCanonStore.js';

export async function registerTheExchangeProperty(options?: {
  importOrientationSeed?: boolean;
}): Promise<FictionPropertyRecord> {
  const slug = THE_EXCHANGE_PROPERTY.slug;
  const existing = await getFictionPropertyBySlug(slug);
  if (existing) {
    if (options?.importOrientationSeed) {
      await importOrientationSeedIfEmpty(existing.id);
    }
    return existing;
  }

  const dbId = await ensureFounderProjectDbId(slug);
  const now = new Date().toISOString();
  const record: FictionPropertyRecord = {
    id: dbId,
    slug,
    displayName: THE_EXCHANGE_PROPERTY.displayName,
    propertyType: THE_EXCHANGE_PROPERTY.propertyType,
    ownership: THE_EXCHANGE_PROPERTY.ownership,
    productionIntegration: THE_EXCHANGE_PROPERTY.productionIntegration,
    registeredAt: now,
    metadata: {
      namespace: 'the-exchange-fiction',
      isolatedFrom: ['ndxbook', 'expression-entry-002', 'studio-world-fiction'],
    },
  };
  await saveFictionProperty(record);

  if (options?.importOrientationSeed !== false) {
    await importOrientationSeedIfEmpty(record.id);
  }

  return record;
}

async function importOrientationSeedIfEmpty(propertyId: string): Promise<void> {
  const { listFictionDocuments } = await import('./fictionCanonStore.js');
  const docs = await listFictionDocuments(propertyId);
  if (docs.length > 0) return;
  await ingestFictionCanonBatch({
    propertySlug: THE_EXCHANGE_PROPERTY.slug,
    imports: buildTheExchangeOrientationSeedImports(),
    idempotencyKey: `seed-orientation-${crypto.createHash('sha256').update('v1').digest('hex').slice(0, 12)}`,
  });
}
