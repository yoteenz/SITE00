/**
 * Server-side Anthropic vision for literal UI replication (P0.VR.REPLICATION.3B).
 */

import { downloadUrlToBuffer } from '../site00Assts/storage.js';
import { ANTHROPIC_CREATIVE_MODEL, ANTHROPIC_API_URL, isAnthropicConfigured } from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';

const ESCALATED_MODEL =
  process.env.SITE00_VISION_REPLICATION_MODEL_ESCALATED?.trim() ||
  process.env.SITE00_VISION_REPLICATION_MODEL?.trim() ||
  ANTHROPIC_CREATIVE_MODEL;

const PRIMARY_MODEL =
  process.env.SITE00_VISION_REPLICATION_MODEL?.trim() || ANTHROPIC_CREATIVE_MODEL;

const LITERAL_VISION_SYSTEM = `You compare AUTHORITY (reference design) vs TWIN (current render) UI screenshots.
Intent: COPY THE REFERENCE EXACTLY TO THE EYE. MATCH visible structure — do NOT redesign, simplify, or describe generically.
Return JSON only:
{
  "regionId": "string",
  "authorityDescription": "detailed structural description",
  "twinDescription": "detailed structural description",
  "visibleDifferences": ["string"],
  "missingElements": ["string"],
  "extraElements": ["string"],
  "geometryDifferences": ["string"],
  "surfaceDifferences": ["string"],
  "typographyDifferences": ["string"],
  "assetDifferences": ["string"],
  "layoutRelationships": ["string"],
  "literalCorrections": ["MATCH|COPY|ADD|REMOVE|RESIZE|..."],
  "confidence": "HIGH|MEDIUM|LOW"
}
Use structural language: subregions, columns, slices, overlays, dividers, colors (black/white/lime/grayscale).`;

async function imageBlockFromRef(ref: string): Promise<{ type: 'image'; source: { type: 'base64'; media_type: string; data: string } } | { type: 'text'; text: string }> {
  if (ref.startsWith('data:')) {
    const match = /^data:(image\/[^;]+);base64,(.+)$/.exec(ref);
    if (match) {
      return { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } };
    }
  }
  if (ref.startsWith('http://') || ref.startsWith('https://')) {
    const buffer = await downloadUrlToBuffer(ref);
    const media = ref.toLowerCase().includes('.png') ? 'image/png' : 'image/webp';
    return { type: 'image', source: { type: 'base64', media_type: media, data: buffer.toString('base64') } };
  }
  return { type: 'text', text: `Image ref (non-url): ${ref.slice(0, 200)}` };
}

export function auditVisionReplicationProviderServer(): {
  provider: string;
  model: string;
  visionCapability: boolean;
  escalatedModel: string;
} {
  return {
    provider: isAnthropicConfigured() ? 'anthropic' : 'unavailable',
    model: PRIMARY_MODEL,
    visionCapability: isAnthropicConfigured(),
    escalatedModel: ESCALATED_MODEL,
  };
}

export async function inspectRegionWithAnthropicVision(input: {
  authorityImage: string;
  twinScreenshot: string | null;
  regionId: string;
  regionBounds: string;
  wholePage?: boolean;
  useEscalated?: boolean;
}): Promise<Record<string, unknown>> {
  if (!isAnthropicConfigured()) {
    throw new Error('VISION_PROVIDER_UNAVAILABLE');
  }
  const apiKey = process.env.ANTHROPIC_API_KEY!.trim();
  const model = input.useEscalated ? ESCALATED_MODEL : PRIMARY_MODEL;

  const content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = [
    {
      type: 'text',
      text: `Region: ${input.regionId}. Bounds: ${input.regionBounds}. Whole page: ${input.wholePage ? 'yes' : 'no'}. Compare AUTHORITY (first image) vs TWIN (second if present).`,
    },
    await imageBlockFromRef(input.authorityImage),
  ];
  if (input.twinScreenshot) {
    content.push(await imageBlockFromRef(input.twinScreenshot));
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      system: LITERAL_VISION_SYSTEM,
      messages: [{ role: 'user', content }],
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`VISION_OUTPUT_INVALID:${response.status}:${detail.slice(0, 120)}`);
  }

  const data = (await response.json()) as { content: Array<{ type: string; text?: string }> };
  const text = data.content.find((c) => c.type === 'text')?.text ?? '{}';
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  const parsed = JSON.parse(jsonStart >= 0 ? text.slice(jsonStart, jsonEnd + 1) : text) as Record<string, unknown>;
  return { ...parsed, regionId: input.regionId, status: 'OK' };
}
