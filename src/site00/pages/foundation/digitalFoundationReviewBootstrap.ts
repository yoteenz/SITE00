import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { fetchPayload, type ClientCatalogEntry } from '../../foundation-client/api';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import { parseClientDigitalFoundationPayload } from '../../foundation-client/validateClientPayload';
import reviewSnapshots from './generated/reviewFixtureSnapshots.json';

export type ReviewFixtureKey = keyof typeof reviewSnapshots.fixtures;

export type ReviewBootstrapBundle = {
  source: 'live_preview_api' | 'offline_snapshots' | 'hybrid';
  catalog: ClientCatalogEntry[];
  config: DigitalFoundationCommercialConfig;
  fixtures: Partial<Record<ReviewFixtureKey, { token: string; payload: ClientDigitalFoundationPayload }>>;
  bootstrapError?: string;
};

function offlineBundle(): ReviewBootstrapBundle {
  const fixtures: ReviewBootstrapBundle['fixtures'] = {};
  for (const key of Object.keys(reviewSnapshots.fixtures) as ReviewFixtureKey[]) {
    const row = reviewSnapshots.fixtures[key];
    fixtures[key] = {
      token: row.token,
      payload: parseClientDigitalFoundationPayload(row.payload),
    };
  }
  return {
    source: 'offline_snapshots',
    catalog: reviewSnapshots.catalog.catalog as ClientCatalogEntry[],
    config: reviewSnapshots.catalog.config as DigitalFoundationCommercialConfig,
    fixtures,
  };
}

export async function previewBootstrapReachable(): Promise<boolean> {
  try {
    const res = await fetch('/api/dev/site00-digital-foundation-preview-bootstrap', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

async function mintLive(fixtureId: string): Promise<{ token: string; payload: ClientDigitalFoundationPayload }> {
  const res = await fetch('/api/dev/site00-digital-foundation-preview-bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fixture_id: fixtureId }),
  });
  const json = (await res.json()) as { public_token?: string; error?: string };
  if (!res.ok || !json.public_token) throw new Error(json.error ?? 'BOOTSTRAP_FAILED');
  const payload = await fetchPayload(json.public_token);
  return { token: json.public_token, payload };
}

export async function loadReviewBootstrapBundle(): Promise<ReviewBootstrapBundle> {
  const base = offlineBundle();
  if (!(await previewBootstrapReachable())) {
    return {
      ...base,
      bootstrapError: 'Preview bootstrap API unavailable — offline fixture snapshots (simulated).',
    };
  }
  try {
    const catalogRes = await fetch('/api/site00/digital-foundation-artifact?action=catalog');
    const catalogJson = (await catalogRes.json()) as {
      catalog?: ClientCatalogEntry[];
      config?: DigitalFoundationCommercialConfig;
    };
    const fixtures = { ...base.fixtures };
    for (const key of ['A_BASE', 'J_PAYMENT_SUCCESS', 'K_PAYMENT_FAILURE', 'M_COMPLETE_CREDIT'] as const) {
      fixtures[key] = await mintLive(key);
    }
    return {
      source: 'hybrid',
      catalog: catalogJson.catalog ?? base.catalog,
      config: catalogJson.config ?? base.config,
      fixtures,
    };
  } catch (e) {
    return {
      ...base,
      bootstrapError: e instanceof Error ? e.message : 'BOOTSTRAP_FAILED',
    };
  }
}
