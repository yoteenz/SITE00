/**
 * SITE 00 Builder studio — interim environment plates from a recovered SITE 00 asset.
 *
 *   node scripts/site00/builder-studio-qa/build-env-plates.cjs
 *
 * Source: public/site00/production-authority-assets/production-design-atrium-authority-v1.jpg (SITE 00's own
 * "luminous white atrium, no UI" render; see that folder's SOURCE.md). Only its lower storeys are used — glass
 * balconies and the polished floor — never the central red rod or the ring ceiling, which would compete with the
 * Build Object. Each plate is defocused and lifted into the references' background band (≈#e4e0dd–#fbf9f8,
 * faintly warm neutral) so it reads as the soft white architecture behind the reference objects.
 *
 * These are INTERIM plates until Grok delivers GA-05 (per-room plates) and GA-01 (HDRI); see
 * GROK_ASSET_REQUEST_MANIFEST.md. Output: public/site00/builder-studio/env/.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '../../..');
const SRC = path.join(ROOT, 'public/site00/production-authority-assets/production-design-atrium-authority-v1.jpg');
const OUT = path.join(ROOT, 'public/site00/builder-studio/env');
fs.mkdirSync(OUT, { recursive: true });

// [room, crop (left, top, width, height) in the 1920×823 source, mirror]
const PLATES = [
  ['place', [0, 250, 900, 573], false],
  ['feel', [1020, 250, 900, 573], false],
  ['work', [40, 210, 820, 613], true],
  ['pace', [1060, 230, 860, 593], true],
  ['blueprint', [0, 230, 930, 593], false],
];

(async () => {
  for (const [room, [left, top, width, height], mirror] of PLATES) {
    let img = sharp(SRC).extract({ left, top, width, height });
    if (mirror) img = img.flop();
    const file = path.join(OUT, `${room}.webp`);
    await img
      .resize({ width: 640 })
      .modulate({ saturation: 0.18 })
      .blur(4.2)
      .linear(0.6, 104)
      .tint({ r: 248, g: 245, b: 243 })
      .webp({ quality: 72, effort: 6 })
      .toFile(file);
    console.log(room, `${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
  }
  // Reflection map: the whole atrium as a soft equirectangular environment for glass and acrylic.
  const env = path.join(OUT, 'atrium-reflection.webp');
  await sharp(SRC).resize(1024, 512, { fit: 'fill' }).modulate({ saturation: 0.35 }).blur(1.2).webp({ quality: 74, effort: 6 }).toFile(env);
  console.log('reflection', `${(fs.statSync(env).size / 1024).toFixed(1)} KB`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
