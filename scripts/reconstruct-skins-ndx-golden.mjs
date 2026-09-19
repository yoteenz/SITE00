#!/usr/bin/env node
/**
 * Golden NDXBOOK family thumbnail — FAL gpt-image-2/edit from source crop.
 * Writes canonical asset to public/site00/skins/canonical/mobile/
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOURCE_CROP = join(ROOT, 'public/site00/skins/extracted/mobile/brand_family_ndxbook.webp');
const OUT_DIR = join(ROOT, 'public/site00/skins/canonical/mobile');
const OUT_FILE = join(OUT_DIR, 'brand_family_ndxbook.webp');
const PUBLIC_URL = '/site00/skins/canonical/mobile/brand_family_ndxbook.webp';

const PROMPT = `RECREATE ONLY THE NDXBOOK VISUAL OBJECT / ARTWORK SHOWN IN THE PROVIDED CROP.
USE THE CROP AS STRICT VISUAL AUTHORITY.
REMOVE ALL SURROUNDING UI: CARD BORDER, PHONE / BROWSER FRAME, LABEL TEXT, OTHER PAGE ELEMENTS.
PRESERVE: RED / BLACK PLANETARY ART, EXACT COMPOSITION, LIGHTING, TEXTURE, CROPPING INTENT.
OUTPUT: CLEAN STANDALONE IMAGE ASSET FOR USE INSIDE THE BRAND FAMILY CARD.
DO NOT REDESIGN.`;

async function main() {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    console.error('FAL_KEY missing — cannot dispatch reconstruction');
    process.exit(1);
  }

  const sourceBuffer = await readFile(SOURCE_CROP);
  const sourceChecksum = createHash('sha256').update(sourceBuffer).digest('hex').slice(0, 16);
  console.log('Source crop checksum:', sourceChecksum);

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const pngBuffer = await sharp(sourceBuffer).png().toBuffer();
  const refBlob = new Blob([pngBuffer], { type: 'image/png' });
  const falReferenceUrl = await fal.storage.upload(refBlob);
  console.log('Uploaded source crop to FAL storage');

  const model = 'openai/gpt-image-2/edit';
  const result = await fal.subscribe(model, {
    input: {
      prompt: PROMPT,
      image_urls: [falReferenceUrl],
      image_size: 'auto',
      quality: 'high',
      num_images: 1,
      output_format: 'webp',
    },
    logs: true,
  });

  const outputUrl = result?.data?.images?.[0]?.url;
  if (!outputUrl) {
    console.error('FAL returned no image URL', JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log('FAL output URL:', outputUrl);
  console.log('Request ID:', result.request_id);

  const res = await fetch(outputUrl);
  if (!res.ok) throw new Error(`Failed to download output: ${res.status}`);
  const outBuffer = Buffer.from(await res.arrayBuffer());

  await mkdir(OUT_DIR, { recursive: true });
  const webp = await sharp(outBuffer).webp({ quality: 90 }).toFile(OUT_FILE);
  console.log('Saved canonical asset:', OUT_FILE, webp.width, 'x', webp.height);

  const receipt = {
    sourceCropChecksum: sourceChecksum,
    provider: 'fal',
    model,
    prompt: PROMPT,
    requestId: result.request_id ?? null,
    inputAssetId: 'crop-MOBILE-BRAND_FAMILY_NDXBOOK',
    outputAssetId: 'can-ndxbook-mobile-v1',
    outputUrl: PUBLIC_URL,
    falOutputUrl: outputUrl,
    reconstructedAt: new Date().toISOString(),
  };

  await writeFile(join(OUT_DIR, 'brand_family_ndxbook.receipt.json'), JSON.stringify(receipt, null, 2));
  console.log('Receipt written. Public URL:', PUBLIC_URL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
