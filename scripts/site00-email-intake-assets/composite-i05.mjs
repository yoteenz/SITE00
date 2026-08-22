// SITE 00 — Identity Intake Access — I05 Evidence Composition.
// Deterministic composite (DETERMINISTIC_COMPOSITE) from approved I01, I04 masters + I02/I03
// isolation masters (see remove-background.mjs / production manifest lineage).
// Per doctrine (manifest): do NOT ask FAL to regenerate the whole collage — assemble it in
// code from the individually-approved assets to avoid logo/text hallucination, portrait drift,
// or fingerprint mutation across a full-scene regeneration.
//
// Treatment (revised — production compositing pass): I02/I03 previously composited FAL's raw
// "flat lay on white" photograph directly, which carries its own soft photographic vignette. On
// a pure-white canvas that vignette produced a visible soft rectangular halo around each print —
// a background-residue defect caught by Isolation QA. I02/I03 are now sourced from their true
// alpha-transparent BiRefNet v2 isolation masters (EDGE_POLICY: PAPER_TORN) so only the physical
// torn-paper silhouette composites, with a code-synthesized drop shadow underneath for physical
// layering (SHADOW_POLICY: REBUILD_IN_CODE).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const M = '/tmp/site00-intake-assets/master';
const ISO = '/tmp/site00-intake-assets/isolation';
const D = '/tmp/site00-intake-assets/derived';
await mkdir(D, { recursive: true });

const PORTRAIT = `${M}/site00-email-intake-identity-portrait-master-v2.png`;
const PAPER = `${ISO}/site00-email-intake-identity-archival-note-isolated.png`;
const FINGERPRINT = `${ISO}/site00-email-intake-identity-fingerprint-isolated.png`;
// Forensic finding: the "seal-base" master's transparent background is a literal opaque
// checkerboard pattern painted by the text-to-image model (hasAlpha:false verified by direct
// pixel inspection) — a known text-to-image failure mode of drawing the *symbol* of transparency
// rather than real alpha. The prior manifest inspection note ("isolated on a transparent
// background") was incorrect; corrected via BiRefNet v2 isolation (see remove-background.mjs).
const SEAL = `${ISO}/site00-email-intake-identity-seal-isolated.png`;

const SEAL_MARK_SVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="46%" text-anchor="middle" dominant-baseline="middle"
        font-family="Menlo, Consolas, monospace" font-weight="800"
        font-size="${Math.round(size * 0.3)}" fill="#F4D9D9">00</text>
  <text x="50%" y="68%" text-anchor="middle" dominant-baseline="middle"
        font-family="Menlo, Consolas, monospace" font-weight="700" letter-spacing="1.5"
        font-size="${Math.round(size * 0.08)}" fill="#F4D9D9">SITE</text>
</svg>`;

async function buildSeal(size) {
  const base = await sharp(SEAL).resize(size, size, { fit: 'cover' }).toBuffer();
  return sharp(base)
    .composite([{ input: Buffer.from(SEAL_MARK_SVG(size)), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

/** Isolated alpha-transparent artifact — resize (preserving aspect, no crop), rotate on
 * transparent, add a soft offset drop shadow derived from its own alpha silhouette (not a
 * rectangle) so the shadow follows the torn-paper edge rather than implying a hidden bounding box. */
async function print({ input, width, rotate = 0 }) {
  const meta = await sharp(input).metadata();
  const height = Math.round((meta.height / meta.width) * width);
  const artifact = await sharp(input)
    .resize(width, height, { fit: 'inside' })
    .rotate(rotate, { background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  const rMeta = await sharp(artifact).metadata();
  const shadow = await sharp(artifact).ensureAlpha().tint({ r: 30, g: 28, b: 26 }).blur(14).toBuffer();
  return { artifact, shadow, width: rMeta.width, height: rMeta.height };
}

function layerAt(item, top, left, shadowOffset = 10) {
  return [
    { input: item.shadow, top: Math.max(0, top + shadowOffset), left: Math.max(0, left + shadowOffset) },
    { input: item.artifact, top, left },
  ];
}

async function buildDesktop() {
  const canvasW = 1000;
  const canvasH = 1100;

  const portrait = await print({ input: PORTRAIT, width: 700, rotate: 0 });
  const portraitResized = await sharp(portrait.artifact).resize(700, 860, { fit: 'cover' }).toBuffer();
  const paper = await print({ input: PAPER, width: 460, rotate: -6 });
  const fingerprint = await print({ input: FINGERPRINT, width: 210, rotate: 7 });
  const seal = await buildSeal(112);

  // Paper is layered directly over the portrait's upper-left (forehead/eye) region so the
  // collage reads as one connected dossier rather than two disconnected floating fragments —
  // matches the founder reference's "archival paper layered over upper portrait" geometry.
  const composite = await sharp({ create: { width: canvasW, height: canvasH, channels: 4, background: '#ffffff' } })
    .composite([
      { input: portraitResized, top: 240, left: 280 },
      ...layerAt(paper, 40, 40),
      { input: seal, top: 330, left: 430 },
      ...layerAt(fingerprint, 900, 760),
    ])
    .png()
    .toBuffer();

  await sharp(composite).toFile(`${D}/site00-email-intake-identity-evidence-desktop-full.png`);
  // Email derivative — retina-safe display width ~300css → 600px @2x.
  await sharp(composite).resize(600, 660, { fit: 'cover' }).png({ quality: 88 }).toFile(`${D}/site00-email-intake-identity-evidence-desktop.png`);
}

async function buildMobile() {
  const canvasW = 1100;
  const canvasH = 620;

  const portrait = await print({ input: PORTRAIT, width: 460, rotate: 0 });
  const portraitResized = await sharp(portrait.artifact).resize(460, 585, { fit: 'cover' }).toBuffer();
  const paper = await print({ input: PAPER, width: 340, rotate: -5 });
  const fingerprint = await print({ input: FINGERPRINT, width: 160, rotate: -6 });
  const seal = await buildSeal(88);

  // Tighter left-to-right strip (fingerprint → paper → seal seam → portrait). The clean alpha
  // isolation masters removed the soft photographic vignette that previously (visually, if
  // accidentally) bridged the gap between the paper cluster and the portrait — with true
  // transparency the prior x-offsets read as disconnected fragments (REJECTION: "evidence pieces
  // do not physically/visually interact"), so the paper/seal now overlap the portrait's left edge
  // directly, matching the reference's connected evidence-strip geometry.
  const composite = await sharp({ create: { width: canvasW, height: canvasH, channels: 4, background: '#ffffff' } })
    .composite([
      { input: portraitResized, top: 18, left: 580 },
      ...layerAt(fingerprint, 60, 110),
      ...layerAt(paper, 190, 280),
      { input: seal, top: 170, left: 470 },
    ])
    .png()
    .toBuffer();

  await sharp(composite).toFile(`${D}/site00-email-intake-identity-evidence-mobile-full.png`);
  // Mobile display width ~320css → 640px @2x.
  await sharp(composite).resize(640, 360, { fit: 'cover' }).png({ quality: 88 }).toFile(`${D}/site00-email-intake-identity-evidence-mobile.png`);
}

await buildDesktop();
await buildMobile();
console.log('I05 composites written to', D);
