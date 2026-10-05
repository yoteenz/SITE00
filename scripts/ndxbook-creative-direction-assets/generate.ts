/**
 * NDXBOOK Creative Direction — reference-locked production pass, FAL asset generation.
 *
 * One-off production script. Reads the curated priority briefs from
 * api/_lib/site00Evolve/creativeDirection/visualAssetStrategy.ts, generates each via
 * openai/gpt-image-2 via FAL, downloads the raw PNG to /tmp for inspection, then for any
 * brief declared REMOVE_BACKGROUND runs fal-ai/birefnet/v2 and writes the isolated
 * PNG alongside it. Nothing is copied into public/ automatically — that happens only
 * after a human/agent visual inspection pass (see integrate.ts).
 *
 * Run with: npx tsx scripts/ndxbook-creative-direction-assets/generate.ts
 */
import { fal } from '@fal-ai/client';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  NDXBOOK_PRIORITY_ASSET_BRIEFS,
  buildGenerationPrompt,
} from '../../api/_lib/site00Evolve/creativeDirection/visualAssetStrategy.js';

const falKey = process.env.FAL_KEY?.trim();
if (!falKey) {
  console.error('FAL_KEY missing');
  process.exit(1);
}
fal.config({ credentials: falKey });

const OUT_DIR = '/tmp/ndx-cd-assets';
await mkdir(OUT_DIR, { recursive: true });

async function generateOne(briefId: string, prompt: string, aspectRatio: string) {
  console.log(`→ generating ${briefId} (${aspectRatio})`);
  const started = Date.now();
  const imageSize =
    aspectRatio === '1:1' ? 'square_hd' : aspectRatio === '4:3' ? 'landscape_4_3' : 'landscape_16_9';
  const result = await fal.subscribe('openai/gpt-image-2', {
    input: {
      prompt,
      image_size: imageSize,
      quality: 'high',
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  const url = (result.data as { images?: Array<{ url?: string }> })?.images?.[0]?.url;
  if (!url) throw new Error(`No image URL returned for ${briefId}: ${JSON.stringify(result.data).slice(0, 400)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed for ${briefId} (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${briefId}.raw.png`);
  await writeFile(outPath, buf);
  console.log(`  ✓ raw ${briefId} — ${buf.length} bytes — ${Date.now() - started}ms — ${outPath}`);
  return { briefId, rawPath: outPath, sourceUrl: url };
}

async function removeBackground(briefId: string, imageUrl: string) {
  console.log(`→ background removal ${briefId} (fal-ai/birefnet/v2)`);
  const result = await fal.subscribe('fal-ai/birefnet/v2', {
    input: { image_url: imageUrl },
    logs: false,
  });
  const img = (result.data as { image?: { url?: string } })?.image;
  if (!img?.url) throw new Error(`No isolated image returned for ${briefId}`);
  const res = await fetch(img.url);
  if (!res.ok) throw new Error(`Isolated download failed for ${briefId} (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${briefId}.isolated.png`);
  await writeFile(outPath, buf);
  console.log(`  ✓ isolated ${briefId} — ${buf.length} bytes — ${outPath}`);
  return outPath;
}

const results: Array<Record<string, unknown>> = [];
for (const brief of NDXBOOK_PRIORITY_ASSET_BRIEFS) {
  try {
    const { prompt } = buildGenerationPrompt(brief);
    const gen = await generateOne(brief.briefId, prompt, brief.aspectRatio);
    let isolatedPath: string | null = null;
    if (brief.backgroundTreatment === 'REMOVE_BACKGROUND' || brief.backgroundTreatment === 'MASK_AND_COMPOSITE') {
      isolatedPath = await removeBackground(brief.briefId, gen.sourceUrl);
    }
    results.push({ briefId: brief.briefId, rawPath: gen.rawPath, isolatedPath, backgroundTreatment: brief.backgroundTreatment });
  } catch (e) {
    console.error(`  ✗ FAILED ${brief.briefId}:`, e instanceof Error ? e.message : e);
    process.exitCode = 1;
  }
}

console.log('\nDone.', JSON.stringify(results, null, 2));
