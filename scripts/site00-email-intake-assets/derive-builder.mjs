// SITE 00 — Builder Intake Access — B01 derivative production (desktop + mobile).
import sharp from 'sharp';

const MASTER = '/tmp/site00-intake-assets/master/site00-email-intake-builder-blueprint-master.png';
const D = '/tmp/site00-intake-assets/derived';

// Desktop: right hero column, behind/below the Build Brief Record card. Retina-safe ~240css wide.
await sharp(MASTER)
  .resize(560, 420, { fit: 'cover', position: 'right' })
  .png({ quality: 88, compressionLevel: 9 })
  .toFile(`${D}/site00-email-intake-builder-blueprint-desktop.png`);

// Mobile: restrained upper-background wash — wide short strip, lightened so text stays legible
// when the SITE 00 label/headline sits on top of it.
await sharp(MASTER)
  .resize(1200, 460, { fit: 'cover', position: 'right top' })
  .modulate({ brightness: 1.08, saturation: 0.9 })
  .linear(0.82, 30) // lighten/flatten contrast so it reads as a restrained wash, not a loud hero
  .png({ quality: 85, compressionLevel: 9 })
  .toFile(`${D}/site00-email-intake-builder-blueprint-mobile.png`);

console.log('Builder derivatives written.');
