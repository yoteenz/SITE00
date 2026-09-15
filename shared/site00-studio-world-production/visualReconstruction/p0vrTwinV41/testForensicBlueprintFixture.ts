import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { forensicBlueprintContentHash } from '../p0vrTwinV30R8M2R5/forensicBlueprintHash.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { ForensicUiBlueprintAuthority } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import { FORENSIC_BLUEPRINT_FAL_ENDPOINT } from '../p0vrTwinV30R8M2R5/constants.js';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../../tests/fixtures');
export const TWIN_V41_FIXTURE_PNG = join(FIXTURE_DIR, 'twin-v41-founder-forensic-blueprint.png');

function setPixel(data: Buffer, width: number, x: number, y: number, r: number, g: number, b: number): void {
  const i = (y * width + x) * 4;
  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = 255;
}

function fillRect(
  data: Buffer,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  g: number,
  b: number,
): void {
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (x >= 0 && x < width && y >= 0 && y < height) setPixel(data, width, x, y, r, g, b);
    }
  }
}

function strokeRect(
  data: Buffer,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  g: number,
  b: number,
): void {
  void height;
  for (let x = x0; x <= x1; x += 1) {
    setPixel(data, width, x, y0, r, g, b);
    setPixel(data, width, x, y1, r, g, b);
  }
  for (let y = y0; y <= y1; y += 1) {
    setPixel(data, width, x0, y, r, g, b);
    setPixel(data, width, x1, y, r, g, b);
  }
}

/** Light technical forensic document raster for deterministic pixel extraction tests. */
export function ensureTwinV41ForensicBlueprintFixturePng(): string {
  if (!existsSync(FIXTURE_DIR)) mkdirSync(FIXTURE_DIR, { recursive: true });
  const width = 800;
  const height = 1600;
  const png = new PNG({ width, height });
  fillRect(png.data, width, height, 0, 0, width - 1, height - 1, 245, 245, 240);

  const blue = [30, 90, 200] as const;
  strokeRect(png.data, width, height, 4, 4, width - 5, height - 5, ...blue);
  strokeRect(png.data, width, height, 8, 8, width - 9, 120, ...blue);
  strokeRect(png.data, width, height, 8, 124, width - 9, 1180, ...blue);
  strokeRect(png.data, width, height, 500, 124, 500, 1180, ...blue);
  strokeRect(png.data, width, height, 8, 1184, width - 9, height - 9, ...blue);
  for (let y = 1220; y < height - 40; y += 90) {
    for (let x = 12; x < width - 12; x += 1) setPixel(png.data, width, x, y, ...blue);
  }

  fillRect(png.data, width, height, 24, 140, 470, 1160, 250, 250, 255);
  strokeRect(png.data, width, height, 24, 140, 470, 1160, ...blue);

  for (let row = 0; row < 12; row += 1) {
    const y = 160 + row * 80;
    fillRect(png.data, width, height, 520, y, 770, y + 12, 20, 40, 90);
  }

  const calloutPositions = [
    [80, 220],
    [180, 340],
    [120, 520],
    [260, 680],
    [90, 860],
  ];
  for (const [cx, cy] of calloutPositions) {
    fillRect(png.data, width, height, cx - 12, cy - 12, cx + 12, cy + 12, 180, 230, 60);
    fillRect(png.data, width, height, cx - 4, cy - 4, cx + 4, cy + 4, 20, 20, 20);
  }

  const buf = PNG.sync.write(png);
  writeFileSync(TWIN_V41_FIXTURE_PNG, buf);
  return TWIN_V41_FIXTURE_PNG;
}

export function buildFounderApprovedForensicAuthorityForFixture(actualHash: string): ForensicUiBlueprintAuthority {
  const path = ensureTwinV41ForensicBlueprintFixturePng();
  const uri = `file://${path}`;
  const blueprintHash = forensicBlueprintContentHash(`${uri}:${actualHash}`);
  return {
    id: `fuba-v41-${fnv1aHex(blueprintHash).slice(0, 10)}`,
    projectId: 'ndxbook',
    viewport: 'MOBILE',
    sourceActualAuthorityId: 'v41-test-actual',
    sourceActualHash: actualHash,
    falEndpoint: FORENSIC_BLUEPRINT_FAL_ENDPOINT,
    falRequestId: 'fixture-request',
    falResultUrl: uri,
    blueprintImageUri: uri,
    blueprintHash,
    generatedAt: new Date().toISOString(),
    status: 'MACHINE_VALIDATED',
    founderReviewStatus: 'APPROVED',
  };
}
