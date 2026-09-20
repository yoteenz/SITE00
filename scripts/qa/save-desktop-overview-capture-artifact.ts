import { copyFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderControlledReference } from '../../shared/site00-studio-world-production/visualReconstruction/render/ControlledReferenceRenderer.js';

const out = mkdtempSync(join(tmpdir(), 'cap-art-'));
const r = await renderControlledReference({
  route: '/projects/ndxbook/overview',
  baseUrl: process.env.SITE00_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5174',
  viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  outputDir: out,
  reconstructionIteration: 0,
  blueprintVersion: 'proof',
  previewDeviceMode: 'desktop',
  routeSearch: '?designPreview=1',
  screenId: 'overview',
});

const dest = '/opt/cursor/artifacts/desktop-overview-capture-proof.png';
copyFileSync(r.screenshotPath, dest);
console.log(JSON.stringify({ anchorFound: r.anchorFound, finalUrl: r.finalUrl, dest }, null, 2));
