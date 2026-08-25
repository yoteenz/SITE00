#!/usr/bin/env npx tsx
/**
 * P0.UI.3B — extract icon reference crops from approved mobile-overview-menu-open.png
 */
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { NDX_ICON_PIXEL_REFERENCE_AUTHORITY } from '../../shared/site00-studio-world-ui/icons/p0ui3b/authority.js';
import { NDX_ICON_V2_PRIORITY } from '../../shared/site00-studio-world-ui/icons/p0ui3b/constants.js';

const ROOT = join(import.meta.dirname, '../..');
const OUT_DIR = join(ROOT, 'visual-references/founder/ndxbook/icon-crops');

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const authority = NDX_ICON_PIXEL_REFERENCE_AUTHORITY;
  const sourcePath = join(ROOT, authority.sourceAssetPath);
  if (!existsSync(sourcePath)) {
    console.error('Missing reference asset:', sourcePath);
    process.exit(1);
  }

  const icons = [...new Set([...NDX_ICON_V2_PRIORITY, 'project_settings', 'experiments_hub', 'campaign_board', 'cultural_intelligence', 'character_lab', 'performance_learning', 'archive'])];
  for (const iconName of icons) {
    const crop = authority.iconCrops[iconName];
    if (!crop) {
      console.warn('skip', iconName, 'no crop');
      continue;
    }
    const outPath = join(OUT_DIR, `${iconName}.png`);
    await sharp(sourcePath)
      .extract({
        left: crop.cropX,
        top: crop.cropY,
        width: crop.cropWidth,
        height: crop.cropHeight,
      })
      .png()
      .toFile(outPath);
    const publicPath = join(ROOT, 'public/visual-references/founder/ndxbook/icon-crops', `${iconName}.png`);
    mkdirSync(dirname(publicPath), { recursive: true });
    await sharp(sourcePath)
      .extract({
        left: crop.cropX,
        top: crop.cropY,
        width: crop.cropWidth,
        height: crop.cropHeight,
      })
      .png()
      .toFile(publicPath);
    console.log('wrote', outPath, `${crop.cropWidth}x${crop.cropHeight}`, 'dark-check pending');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
