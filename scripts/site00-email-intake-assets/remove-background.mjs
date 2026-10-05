// SITE 00 — Intake Access Email Family — Stage: BACKGROUND / MASK / EDGE TREATMENT (pipeline
// stage 09-10 per docs/site00/REFERENCE_TO_PRODUCTION_ASSET_PIPELINE.md).
//
// Forensic finding (production compositing pass): I02 (archival note) and I03 (fingerprint) were
// generated as "isolated flat-lay on white" photographs (BACKGROUND_REQUIREMENT: NOT_APPLICABLE /
// no alpha) rather than true alpha-transparent isolation masters. Each photo carries its own soft
// photographic vignette (background not perfectly flat white in the corners). When composited
// onto a pure-white canvas in composite-i05.mjs, that vignette produces a visible soft rectangular
// halo/box around the paper — exactly the "generated rectangles remain visibly pasted onto the
// composition" / "background residue" defect this pipeline's Isolation QA stage exists to catch.
//
// Fix: run both masters through fal-ai/birefnet/v2 (General Use (Light), matting-safe for the
// torn/deckled paper edge) to produce true alpha-transparent isolation masters, then re-run
// Isolation QA (white/black/gray) before I05 is recomposited from the transparent layers.
import { fal } from '@fal-ai/client';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const falKey = process.env.FAL_KEY?.trim();
if (!falKey) {
  console.error('FAL_KEY missing');
  process.exit(1);
}
fal.config({ credentials: falKey });

const M = '/tmp/site00-intake-assets/master';
const ISO = '/tmp/site00-intake-assets/isolation';
const QA = '/tmp/site00-intake-assets/isolation-qa';
await mkdir(ISO, { recursive: true });
await mkdir(QA, { recursive: true });

const JOBS = [
  {
    id: 'S00-EMAIL-INTAKE-ID-I02',
    input: `${M}/site00-email-intake-identity-archival-note-v3.png`,
    output: `${ISO}/site00-email-intake-identity-archival-note-isolated.png`,
    model: 'General Use (Light)',
  },
  {
    id: 'S00-EMAIL-INTAKE-ID-I03',
    input: `${M}/site00-email-intake-identity-fingerprint-v3.png`,
    output: `${ISO}/site00-email-intake-identity-fingerprint-isolated.png`,
    model: 'General Use (Light)',
  },
  // Forensic finding: the seal master's "transparent background" is a literal opaque checkerboard
  // pattern rendered by the text-to-image model (hasAlpha:false, channels:3) — a well-known
  // text-to-image failure mode of drawing the *symbol* of transparency instead of real alpha.
  // Confirmed by direct pixel inspection, not assumed from the manifest's prior (incorrect)
  // approval note. Requires the same background-removal treatment as the paper/fingerprint.
  {
    id: 'S00-EMAIL-INTAKE-ID-I04',
    input: `${M}/site00-email-intake-identity-seal-base.png`,
    output: `${ISO}/site00-email-intake-identity-seal-isolated.png`,
    model: 'General Use (Heavy)',
  },
];

async function isolate(job) {
  console.log(`→ birefnet/v2 background removal: ${job.id}`);
  const buf = await readFile(job.input);
  const file = new File([buf], job.input.split('/').pop(), { type: 'image/png' });
  const url = await fal.storage.upload(file);
  const result = await fal.subscribe('fal-ai/birefnet/v2', {
    input: {
      image_url: url,
      model: job.model,
      operating_resolution: '2048x2048',
      output_format: 'png',
      refine_foreground: true,
    },
    logs: false,
  });
  const outUrl = result.data?.image?.url;
  if (!outUrl) throw new Error(`No isolated image returned for ${job.id}: ${JSON.stringify(result.data).slice(0, 400)}`);
  const res = await fetch(outUrl);
  if (!res.ok) throw new Error(`Download failed for ${job.id} (${res.status})`);
  const outBuf = Buffer.from(await res.arrayBuffer());
  await writeFile(job.output, outBuf);
  console.log(`  ✓ ${job.id} — ${outBuf.length} bytes — ${job.output}`);
  return job;
}

/** Isolation QA — composite the isolated asset over white/black/50% gray for residue inspection. */
async function isolationQa(job) {
  const meta = await sharp(job.output).metadata();
  const w = meta.width ?? 512;
  const h = meta.height ?? 512;
  for (const [name, bg] of [
    ['white', { r: 255, g: 255, b: 255 }],
    ['black', { r: 0, g: 0, b: 0 }],
    ['gray50', { r: 128, g: 128, b: 128 }],
  ]) {
    await sharp({ create: { width: w, height: h, channels: 4, background: { ...bg, alpha: 1 } } })
      .composite([{ input: job.output, top: 0, left: 0 }])
      .png()
      .toFile(`${QA}/${job.id}-${name}.png`);
  }
  console.log(`  ✓ isolation QA frames written for ${job.id}`);
}

const results = [];
for (const job of JOBS) {
  try {
    const done = await isolate(job);
    await isolationQa(done);
    results.push(done);
  } catch (e) {
    console.error(`  ✗ FAILED ${job.id}:`, e?.message || e);
    process.exitCode = 1;
  }
}
console.log('\nDone.', JSON.stringify(results.map((r) => r.id), null, 2));
