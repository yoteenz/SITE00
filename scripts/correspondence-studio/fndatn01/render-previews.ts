/** Writes FNDATN-01 review previews into public/. Usage: npx tsx scripts/correspondence-studio/fndatn01/render-previews.ts */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderFndatn01Previews } from '../../../shared/site00-correspondence-studio/fndatn01/previews.js';

const publicDir = join(process.cwd(), 'public');
for (const preview of renderFndatn01Previews()) {
  writeFileSync(join(publicDir, preview.publicPath), preview.html);
  console.log(`${preview.id} ${preview.variant.padEnd(18)} ${preview.publicPath} ${(preview.html.length / 1024).toFixed(1)} KB`);
}
