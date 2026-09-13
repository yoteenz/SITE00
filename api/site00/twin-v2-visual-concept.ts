/**
 * P0.VR.TWINV2.1 — Founder-triggered Twin V2 full-page visual concept (GPT Image 2 via FAL).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleTwinV2VisualConceptCors } from '../_lib/site00TwinV2/twinV2VisualConceptCors.js';
import { buildVisualConceptPrompt } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/buildVisualConceptPrompt.js';
import {
  TWIN_V2_VISUAL_PROVIDER,
  TWIN_V2_VISUAL_PROVIDER_LABEL,
} from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/constants.js';
import type { ConceptDirectedTwinSession } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import { buildFalImageInput } from '../../shared/site00-visual-generation/falImageModels.js';
import { uploadSite00AssetBuffer } from '../_lib/site00Assts/storage.js';

type Body = {
  action: 'generate' | 'regenerate' | 'refine';
  session: ConceptDirectedTwinSession;
  refineInstruction?: string | null;
  refineRegion?: string | null;
  founderConfirmedSpend?: boolean;
};

function isFalKeyConfigured(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

function resolvePublicAssetUrl(relativePath: string, req: VercelRequest): string {
  if (relativePath.startsWith('http')) return relativePath;
  const origin =
    (typeof req.headers.origin === 'string' ? req.headers.origin : null) ??
    process.env.VITE_SITE00_CANONICAL_ORIGIN?.trim() ??
    'https://site00.com';
  return `${origin.replace(/\/$/, '')}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
}

async function dispatchGptImage2(prompt: string): Promise<string> {
  if (process.env.VITEST === 'true') {
    return '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg';
  }
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    throw new Error(
      'FAL_KEY_MISSING: Add your fal.ai API key to Railway (api.site00.com) as FAL_KEY — not connected in browser; server-side only.',
    );
  }
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const input = buildFalImageInput({ prompt, aspectRatio: '9:16', model: TWIN_V2_VISUAL_PROVIDER });
  const result = await fal.subscribe(input.model, { input: input.input });
  const imageUrl =
    (result.data as { images?: { url?: string }[] })?.images?.[0]?.url ??
    (result.data as { image?: { url?: string } })?.image?.url;
  if (!imageUrl) throw new Error('FAL gpt-image-2 returned no image URL');
  return imageUrl;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTwinV2VisualConceptCors(req, res)) return;

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      service: 'twin-v2-visual-concept',
      falKeyConfigured: isFalKeyConfigured(),
      model: TWIN_V2_VISUAL_PROVIDER,
      note: 'FAL is server-side (Railway FAL_KEY). Browser does not connect to your fal account directly.',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const body = req.body as Body;
  if (!body?.session?.creativeDirection || !body.founderConfirmedSpend) {
    res.status(400).json({ error: 'SPEND_GUARD: founderConfirmedSpend required' });
    return;
  }

  const refine =
    body.action === 'refine'
      ? [body.refineInstruction, body.refineRegion ? `Region: ${body.refineRegion}` : null].filter(Boolean).join(' — ')
      : null;

  const prompt = buildVisualConceptPrompt({
    pageIntent: body.session.pageIntent,
    functionGraph: body.session.functionGraph,
    brandContext: body.session.brandContext,
    blueprintGrammar: body.session.blueprintGrammar,
    creativeDirection: body.session.creativeDirection,
    viewport: 'mobile',
    refineInstruction: refine,
  });

  try {
    const remoteUrl = await dispatchGptImage2(prompt);
    let imageUrl = remoteUrl.startsWith('http') ? remoteUrl : resolvePublicAssetUrl(remoteUrl, req);
    let imageStorageRef: string | null = null;

    if (remoteUrl.startsWith('http') && isFalKeyConfigured()) {
      const { downloadUrlToBuffer } = await import('../_lib/site00Assts/storage.js');
      const buf = await downloadUrlToBuffer(remoteUrl);
      const path = `site00/twin-v2/${body.session.sessionId}/${Date.now()}.webp`;
      await uploadSite00AssetBuffer(path, buf, 'image/webp');
      imageStorageRef = path;
    }

    res.status(200).json({
      ok: true,
      provider: TWIN_V2_VISUAL_PROVIDER_LABEL,
      model: TWIN_V2_VISUAL_PROVIDER,
      falKeyConfigured: isFalKeyConfigured(),
      promptDigest: prompt.slice(0, 200),
      imageUrl,
      imageStorageRef,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'VISUAL_CONCEPT_GENERATION_FAILED';
    const status = message.includes('FAL_KEY_MISSING') ? 503 : 500;
    res.status(status).json({
      error: message,
      falKeyConfigured: isFalKeyConfigured(),
    });
  }
}
