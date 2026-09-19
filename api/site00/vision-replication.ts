/**
 * P0.VR.REPLICATION.3B — Vision replication API (authority + twin image inspect).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCaptureCorsHeaders, handleCaptureCorsPreflight } from '../_lib/site00Capture/captureCors.js';
import {
  auditVisionReplicationProviderServer,
  inspectRegionWithAnthropicVision,
} from '../_lib/site00VisualReconstruction/visionReplicationAnthropic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCaptureCorsPreflight(req, res)) return;
  applyCaptureCorsHeaders(req, res);

  if (req.method === 'GET') {
    const audit = auditVisionReplicationProviderServer();
    return res.status(200).json({ ok: true, audit, visionCapability: audit.visionCapability });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) ?? {};
  const action = String(body.action ?? 'inspect_region');

  if (action === 'audit_provider') {
    return res.status(200).json({ ok: true, audit: auditVisionReplicationProviderServer() });
  }

  if (action !== 'inspect_region') {
    return res.status(400).json({ error: 'Unknown action' });
  }

  const authorityImage = String(body.authorityImage ?? '');
  if (!authorityImage) {
    return res.status(400).json({ error: 'authorityImage required', code: 'VISION_PROVIDER_UNAVAILABLE' });
  }

  try {
    let observation = await inspectRegionWithAnthropicVision({
      authorityImage,
      twinScreenshot: body.twinScreenshot ? String(body.twinScreenshot) : null,
      regionId: String(body.regionId ?? 'whole-page'),
      regionBounds: String(body.regionBounds ?? ''),
      wholePage: Boolean(body.wholePage),
      useEscalated: false,
    });

    const desc = String(observation.authorityDescription ?? '').toLowerCase();
    const tooGeneric =
      desc.length < 40 ||
      (desc.includes('hero with') && desc.includes('text') && !desc.includes('slice') && !desc.includes('lime'));

    if (tooGeneric && auditVisionReplicationProviderServer().escalatedModel !== auditVisionReplicationProviderServer().model) {
      observation = await inspectRegionWithAnthropicVision({
        authorityImage,
        twinScreenshot: body.twinScreenshot ? String(body.twinScreenshot) : null,
        regionId: String(body.regionId ?? 'whole-page'),
        regionBounds: String(body.regionBounds ?? ''),
        wholePage: Boolean(body.wholePage),
        useEscalated: true,
      });
    }

    return res.status(200).json({
      ok: true,
      observation: {
        ...observation,
        confidence: observation.confidence ?? 'MEDIUM',
        status: tooGeneric ? 'VISION_OUTPUT_TOO_GENERIC' : 'OK',
      },
      imagesReceived: { authority: true, twin: Boolean(body.twinScreenshot) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'VISION_PROVIDER_UNAVAILABLE';
    const code = message.includes('VISION_') ? message.split(':')[0] : 'VISION_PROVIDER_UNAVAILABLE';
    return res.status(503).json({ ok: false, code, message });
  }
}
