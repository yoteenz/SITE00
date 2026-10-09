/**
 * Dev-only: mint a Digital Foundation artifact in the running Vite process (memory store).
 * Gated to cloud mobile preview — not for production Railway/cPanel.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createArtifactForLead, materializeFixtureScenario } from '../_lib/digitalFoundation/service.js';
import { getDfMemoryState, listArtifacts } from '../_lib/digitalFoundation/memoryStore.js';
import { touchPreviewSnapshotAfterMutation } from '../_lib/digitalFoundation/previewMemorySnapshot.js';
import { isDigitalFoundationFlagEnabled, DF_FEATURE_FLAGS } from '../../shared/site00-digital-foundation/featureFlags.js';
import { isCloudMobilePreviewDev } from '../_lib/cloudMobilePreview.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!isCloudMobilePreviewDev()) {
    return res.status(403).json({ error: 'Preview bootstrap disabled' });
  }
  if (!isDigitalFoundationFlagEnabled(DF_FEATURE_FLAGS.SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1)) {
    return res.status(503).json({ error: 'Digital Foundation is not enabled' });
  }

  try {
    if (req.method === 'GET') {
      const existing = listArtifacts()[0];
      if (existing) {
        touchPreviewSnapshotAfterMutation(getDfMemoryState());
        return res.status(200).json({
          artifact_id: existing.artifact_id,
          public_token: existing.public_token,
          personalized_url: `/foundation/${existing.public_token}`,
          reused: true,
        });
      }
      const artifact = createArtifactForLead({
        business_name: 'Cloud preview — Digital Foundation',
        contact_name: 'Founder preview',
        referral_kind: 'DIRECT',
      });
      return res.status(200).json({
        artifact,
        public_token: artifact.public_token,
        personalized_url: `/foundation/${artifact.public_token}`,
        reused: false,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
      const fixtureId = body.fixture_id ? String(body.fixture_id) : '';
      if (fixtureId) {
        const result = await materializeFixtureScenario(fixtureId);
        return res.status(200).json({
          artifact: result.artifact,
          public_token: result.token,
          personalized_url: `/foundation/${result.token}`,
          fixture_id: fixtureId,
        });
      }
      const artifact = createArtifactForLead({
        business_name: body.business_name ? String(body.business_name) : 'Cloud preview — Digital Foundation',
        contact_name: body.contact_name ? String(body.contact_name) : 'Founder preview',
        referral_kind: (body.referral_kind as 'DIRECT' | 'AIO') ?? 'DIRECT',
      });
      return res.status(200).json({
        artifact,
        public_token: artifact.public_token,
        personalized_url: `/foundation/${artifact.public_token}`,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[dev digital-foundation preview bootstrap]', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Bootstrap failed' });
  }
}
