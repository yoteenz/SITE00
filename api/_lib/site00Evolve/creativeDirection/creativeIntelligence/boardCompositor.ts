/**
 * Deterministic SVG board compositor — code-native type + accepted assets.
 */

import type {
  BoardAssetRecord,
  BoardCompositionMap,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_LOCKED } from './markedUpCopyPilotConstants.js';

function escapeXml(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);
}

function assetByRole(assets: BoardAssetRecord[], role: BoardAssetRecord['role']): BoardAssetRecord | undefined {
  return assets.find((a) => a.role === role && a.productionState === 'READY' && a.qaState === 'ACCEPT');
}

function codeNativeTypographyLayer(map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'typographicInterruption');
  if (!zone) return '';
  const { x, y, width } = zone;
  const headline = 'THE RANKING IS THE ARGUMENT';
  const struck = 'CLEAN TAKE PUBLISHING IS DEAD';
  const replacement = 'WORKING DRAFT WITH MARGIN WARS';
  const margin = '← disagree? show your receipts';
  return `
  <g id="typographic-interruption">
    <rect x="${x}" y="${y}" width="${width}" height="${zone.height}" fill="none"/>
    <text x="${x + 8}" y="${y + 36}" font-family="Georgia, serif" font-size="11" fill="#c41e3a" letter-spacing="3">NDX BOOK · ISSUE 01 / PAGE 07</text>
    <text x="${x + 8}" y="${y + 72}" font-family="Georgia, serif" font-size="28" fill="#111">${escapeXml(headline)}</text>
    <text x="${x + 8}" y="${y + 108}" font-family="Helvetica, Arial, sans-serif" font-size="18" fill="#888" text-decoration="line-through">${escapeXml(struck)}</text>
    <rect x="${x + 8}" y="${y + 118}" width="${Math.min(width - 16, 320)}" height="32" fill="#fff8e7" stroke="#e8dcc8"/>
    <text x="${x + 16}" y="${y + 140}" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#111">${escapeXml(replacement)}</text>
    <text x="${x + width - 8}" y="${y + 168}" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#c41e3a" text-anchor="end">${escapeXml(margin)}</text>
    <text x="${x + 8}" y="${y + 200}" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#333">${escapeXml(MARKED_UP_COPY_LOCKED.thesis)}</text>
  </g>`;
}

function codeNativeSocialLayer(map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'socialExpression');
  if (!zone) return '';
  const { x, y, width, height } = zone;
  return `
  <g id="social-expression">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#faf9f7" stroke="#ddd"/>
    <text x="${x + 12}" y="${y + 24}" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#888">SOCIAL · LIVE EDIT</text>
    <text x="${x + 12}" y="${y + 48}" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#111">We ranked this before the room agreed.</text>
    <text x="${x + 12}" y="${y + 68}" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#888" text-decoration="line-through">Final list locked.</text>
    <text x="${x + 12}" y="${y + 88}" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="700" fill="#c41e3a">List still moving — watch the margin.</text>
  </g>`;
}

function codeNativeMotionLayer(map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'motionSeedStrip');
  if (!zone) return '';
  const { x, y, width, height } = zone;
  const frames = ['CLEAN', 'STRIKE', 'REPLACE', 'MARGIN', 'FINAL'];
  const fw = width / frames.length - 4;
  return `
  <g id="motion-seed">
    ${frames
      .map(
        (label, i) => `
    <rect x="${x + i * (fw + 4)}" y="${y}" width="${fw}" height="${height}" fill="#111" stroke="#333"/>
    <text x="${x + i * (fw + 4) + fw / 2}" y="${y + height / 2 + 4}" font-family="Helvetica, Arial, sans-serif" font-size="9" fill="#eee" text-anchor="middle">${label}</text>`,
      )
      .join('')}
  </g>`;
}

function imageLayer(
  map: BoardCompositionMap,
  assets: BoardAssetRecord[],
  role: BoardAssetRecord['role'],
  id: string,
): string {
  const asset = assetByRole(assets, role);
  const zone = map.placements.find((p) => {
    if (role === 'HERO_EDITORIAL_SPREAD') return p.zoneId === 'heroEditorialSpread';
    if (role === 'REPLACEMENT_PAPER_STRIP') return p.zoneId === 'primaryRevisionArtifact';
    if (role === 'SECONDARY_PHOTOGRAPHIC_EVIDENCE') return p.zoneId === 'supportingPhotography';
    if (role === 'PHYSICAL_EDITOR_OBJECT') return p.zoneId === 'physicalEditorObject';
    return false;
  });
  if (!asset?.url || !zone) return '';
  const { x, y, width, height, rotation, zIndex } = zone;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return `
  <g id="${id}" transform="rotate(${rotation} ${cx} ${cy})" style="z-index:${zIndex}">
    <image href="${escapeXml(asset.url)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  </g>`;
}

export function composeBoardSvg(params: {
  plan: CreativeDirectionBoardPlan;
  map: BoardCompositionMap;
  assets: BoardAssetRecord[];
}): string {
  const { map, assets, plan } = params;
  const w = map.canvasWidth;
  const h = map.canvasHeight;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#f4f1eb"/>
  <text x="24" y="32" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#999" letter-spacing="2">CREATIVE DIRECTION BOARD · ${escapeXml(plan.directionName)} · ${map.breakpoint}</text>
  ${imageLayer(map, assets, 'HERO_EDITORIAL_SPREAD', 'hero')}
  ${imageLayer(map, assets, 'SECONDARY_PHOTOGRAPHIC_EVIDENCE', 'secondary-photo')}
  ${imageLayer(map, assets, 'REPLACEMENT_PAPER_STRIP', 'artifact')}
  ${imageLayer(map, assets, 'PHYSICAL_EDITOR_OBJECT', 'editor-object')}
  ${codeNativeTypographyLayer(map)}
  ${codeNativeSocialLayer(map)}
  ${codeNativeMotionLayer(map)}
</svg>`;
}

export function extractSocialProofSvg(plan: CreativeDirectionBoardPlan, map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'socialExpression')!;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${zone.width}" height="${zone.height}" viewBox="0 0 ${zone.width} ${zone.height}">
  <rect width="${zone.width}" height="${zone.height}" fill="#faf9f7"/>
  ${codeNativeSocialLayer({ ...map, placements: [{ ...zone, x: 0, y: 0 }] }).replace(/social-expression/, 'social-proof')}
</svg>`;
}

export function extractMotionProofSvg(plan: CreativeDirectionBoardPlan, map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'motionSeedStrip')!;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${zone.width}" height="${zone.height}" viewBox="0 0 ${zone.width} ${zone.height}">
  <rect width="${zone.width}" height="${zone.height}" fill="#111"/>
  ${codeNativeMotionLayer({ ...map, placements: [{ ...zone, x: 0, y: 0 }] })}
</svg>`;
}
