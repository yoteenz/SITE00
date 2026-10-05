// SITE 00 — Intake Access Email Family — FAL asset generation (production pipeline stage 08).
// One-off production script for the FAL-native visual pilot. Reads prompts from the manifest,
// generates each asset via openai/gpt-image-2 (text-to-image; no reference image file is
// available on this VM, so this is FAL_TEXT_TO_IMAGE not FAL_REFERENCE_CONDITIONED), and writes
// raw PNGs to /tmp/site00-intake-assets/master for inspection before anything is committed or
// uploaded. Safe to re-run — writes are idempotent by filename.
import { fal } from '@fal-ai/client';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const falKey = process.env.FAL_KEY?.trim();
if (!falKey) {
  console.error('FAL_KEY missing');
  process.exit(1);
}
fal.config({ credentials: falKey });

const OUT_DIR = '/tmp/site00-intake-assets/master';
await mkdir(OUT_DIR, { recursive: true });

const JOBS = [
  {
    filename: 'site00-email-intake-identity-archival-note-v3.png',
    aspectRatio: '4:3',
    prompt:
      'A single small archival handwritten paper fragment, photographed straight-down (top-down flat lay), fully isolated on a plain flat white background with no visible table, wood or surface texture at all — only the paper and a soft, subtle drop shadow beneath it. Warm ivory aged paper with subtle natural fibers, gentle edge wear, imperfect torn/deckled edges. Several lines of elegant but largely illegible cursive handwriting in dark graphite/ink, not real readable language. Very restrained aging, no dramatic stains, no burned edges, no typed text, no logo, no watermark, no readable words.',
  },
  {
    filename: 'site00-email-intake-identity-fingerprint-v3.png',
    aspectRatio: '1:1',
    prompt:
      'A single small torn fragment of warm-white archival paper with one detailed human fingerprint impression stamped in graphite-black ink, photographed straight-down (top-down flat lay), fully isolated on a plain flat white background with no visible table, linen or surface texture at all — only the paper fragment and a soft, subtle drop shadow beneath it. Deckled/torn paper edge, authentic ridge texture, slight analog imperfection. No mat board, no frame, no border lines, no card mount, no printed words, labels, captions or numbers anywhere in the image.',
  },
];

async function generate(job) {
  console.log(`→ generating ${job.filename} (${job.aspectRatio})`);
  const started = Date.now();
  const imageSize =
    job.aspectRatio === '1:1' ? 'square_hd' : job.aspectRatio === '4:3' ? 'landscape_4_3' : 'landscape_16_9';
  const result = await fal.subscribe('openai/gpt-image-2', {
    input: {
      prompt: job.prompt,
      image_size: imageSize,
      quality: 'high',
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  const url = result.data?.images?.[0]?.url;
  if (!url) throw new Error(`No image URL returned for ${job.filename}: ${JSON.stringify(result.data).slice(0, 400)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed for ${job.filename} (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT_DIR, job.filename);
  await writeFile(outPath, buf);
  console.log(`  ✓ ${job.filename} — ${buf.length} bytes — ${Date.now() - started}ms — ${outPath}`);
  return { filename: job.filename, path: outPath, bytes: buf.length, sourceUrl: url };
}

const results = [];
for (const job of JOBS) {
  try {
    results.push(await generate(job));
  } catch (e) {
    console.error(`  ✗ FAILED ${job.filename}:`, e?.message || e);
    process.exitCode = 1;
  }
}
console.log('\nDone.', JSON.stringify(results, null, 2));
