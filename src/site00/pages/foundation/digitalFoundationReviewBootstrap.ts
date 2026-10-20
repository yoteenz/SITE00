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

const LIVE_FIXTURE_KEYS = ['A_BASE', 'J_PAYMENT_SUCCESS', 'K_PAYMENT_FAILURE', 'M_COMPLETE_CREDIT'] as const;

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

function fixturesComplete(fixtures: ReviewBootstrapBundle['fixtures']): boolean {
  return LIVE_FIXTURE_KEYS.every((key) => Boolean(fixtures[key]?.payload));
}

export async function previewBootstrapReachable(): Promise<boolean> {
  try {
    const res = await fetch('/api/dev/site00-digital-foundation-preview-bootstrap', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/** Seed in-memory admin artifacts for founder workspace panels (no-op when API unavailable). */
export async function seedReviewPreviewMemoryStore(): Promise<void> {
  try {
    await fetch('/api/dev/site00-digital-foundation-preview-bootstrap', { method: 'GET' });
  } catch {
    /* offline snapshots still render client portal */
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
  await seedReviewPreviewMemoryStore();

  if (!(await previewBootstrapReachable())) {
    return fixturesComplete(base.fixtures)
      ? base
      : { ...base, bootstrapError: 'Preview bootstrap API unavailable — using offline fixture snapshots.' };
  }

  try {
    const catalogRes = await fetch('/api/site00/digital-foundation-artifact?action=catalog');
    const catalogJson = (await catalogRes.json()) as {
      catalog?: ClientCatalogEntry[];
      config?: DigitalFoundationCommercialConfig;
    };
    const fixtures = { ...base.fixtures };
    let liveCount = 0;
    for (const key of LIVE_FIXTURE_KEYS) {
      try {
        fixtures[key] = await mintLive(key);
        liveCount += 1;
      } catch {
        /* keep offline snapshot for this fixture */
      }
    }
    return {
      source: liveCount > 0 ? 'hybrid' : 'offline_snapshots',
      catalog: catalogJson.catalog ?? base.catalog,
      config: catalogJson.config ?? base.config,
      fixtures,
      bootstrapError:
        liveCount === 0 && fixturesComplete(fixtures)
          ? undefined
          : liveCount === 0
            ? 'Live preview mint failed — offline fixture snapshots in use.'
            : undefined,
    };
  } catch (e) {
    return fixturesComplete(base.fixtures)
      ? { ...base, bootstrapError: e instanceof Error ? e.message : 'BOOTSTRAP_FAILED' }
      : {
          ...base,
          bootstrapError: e instanceof Error ? e.message : 'BOOTSTRAP_FAILED',
        };
  }
}
