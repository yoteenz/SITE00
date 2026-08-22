/**
 * V2 deterministic SVG compositor — correct Marked-Up Copy copy, hybrid artifact.
 */

import type {
  BoardAssetRecord,
  BoardCompositionMap,
  CreativeDirectionBoardPlan,
} from './creativeDirectionBoardTypes.js';
import { MARKED_UP_COPY_BOARD_COPY } from './markedUpCopyCopyContract.js';

function escapeXml(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);
}

function assetByRole(assets: BoardAssetRecord[], role: BoardAssetRecord['role']): BoardAssetRecord | undefined {
  return assets.find((a) => a.role === role && a.productionState === 'READY' && a.qaState === 'ACCEPT');
}

function codeNativeTypographyLayer(map: BoardCompositionMap, hideBrand = false): string {
  const zone = map.placements.find((p) => p.zoneId === 'typographicInterruption');
  if (!zone) return '';
  const { x, y, width } = zone;
  const c = MARKED_UP_COPY_BOARD_COPY;
  const issueLabel = hideBrand ? c.issueLabel.replace(/NDX BOOK/gi, '').trim() || c.issueLabel : c.issueLabel;
  return `
  <g id="typographic-interruption">
    <rect x="${x}" y="${y}" width="${width}" height="${zone.height}" fill="none"/>
    <text x="${x + 8}" y="${y + 36}" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#c41e3a" letter-spacing="2">${escapeXml(issueLabel)}</text>
    <text x="${x + 8}" y="${y + 72}" font-family="Georgia, serif" font-size="26" fill="#111">${escapeXml(c.headline)}</text>
    <text x="${x + 8}" y="${y + 108}" font-family="Helvetica, Arial, sans-serif" font-size="18" fill="#888" text-decoration="line-through">${escapeXml(c.struckOriginal)}</text>
    <rect x="${x + 8}" y="${y + 118}" width="${Math.min(width - 16, 340)}" height="32" fill="#fff8e7" stroke="#e8dcc8"/>
    <text x="${x + 16}" y="${y + 140}" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#111">${escapeXml(c.replacement)}</text>
    <text x="${x + width - 8}" y="${y + 168}" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#c41e3a" text-anchor="end">${escapeXml(c.marginRebuttal)}</text>
    <text x="${x + 8}" y="${y + 200}" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#333">${escapeXml(c.thesisLine)}</text>
  </g>`;
}

function hybridPrimaryArtifactLayer(
  map: BoardCompositionMap,
  assets: BoardAssetRecord[],
): string {
  const zone = map.placements.find((p) => p.zoneId === 'primaryRevisionArtifact');
  const paper = assetByRole(assets, 'REPLACEMENT_PAPER_STRIP');
  if (!zone || !paper?.url) return '';

  const { x, y, width, height, rotation } = zone;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const c = MARKED_UP_COPY_BOARD_COPY;
  const innerX = x + 12;
  const innerY = y + 48;

  return `
  <g id="hybrid-primary-artifact" transform="rotate(${rotation} ${cx} ${cy})">
    <image href="${escapeXml(paper.url)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
    <rect x="${innerX}" y="${innerY}" width="${width - 24}" height="${height - 60}" fill="rgba(255,255,255,0.72)"/>
    <text x="${innerX + 4}" y="${innerY + 20}" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#888" text-decoration="line-through">${escapeXml(c.hybridOriginal)}</text>
    <line x1="${innerX + 4}" y1="${innerY + 26}" x2="${innerX + width - 32}" y2="${innerY + 26}" stroke="#c41e3a" stroke-width="2"/>
    <text x="${innerX + 4}" y="${innerY + 48}" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="700" fill="#111">${escapeXml(c.hybridReplacement)}</text>
    <text x="${x + width - 12}" y="${y + height - 16}" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#c41e3a" text-anchor="end">${escapeXml(c.hybridMargin)}</text>
    <path d="M ${x + width - 20} ${y + height - 28} L ${x + width - 8} ${y + height - 20} L ${x + width - 24} ${y + height - 20} Z" fill="#c41e3a"/>
  </g>`;
}

function codeNativeSocialLayer(map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'socialExpression');
  if (!zone) return '';
  const { x, y, width, height } = zone;
  const c = MARKED_UP_COPY_BOARD_COPY;
  return `
  <g id="social-expression">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#faf9f7" stroke="#ddd"/>
    <text x="${x + 12}" y="${y + 24}" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#888">SOCIAL · LIVE REVISION</text>
    <text x="${x + 12}" y="${y + 48}" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#111">${escapeXml(c.socialSource)}</text>
    <text x="${x + 12}" y="${y + 68}" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#888" text-decoration="line-through">${escapeXml(c.socialStrike)}</text>
    <text x="${x + 12}" y="${y + 88}" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="700" fill="#c41e3a">${escapeXml(c.socialCorrection)}</text>
    <text x="${x + 12}" y="${y + 108}" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#333">${escapeXml(c.socialCounter)}</text>
  </g>`;
}

function codeNativeMotionLayer(map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'motionSeedStrip');
  if (!zone) return '';
  const { x, y, width, height } = zone;
  const frames = MARKED_UP_COPY_BOARD_COPY.motionFrames;
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
  skipIfHybrid = false,
): string {
  if (skipIfHybrid && role === 'REPLACEMENT_PAPER_STRIP') return '';
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
  hideBrand?: boolean;
}): string {
  const { map, assets, plan, hideBrand = false } = params;
  const w = map.canvasWidth;
  const h = map.canvasHeight;
  const header = hideBrand
    ? `CREATIVE DIRECTION · ${map.breakpoint}`
    : `CREATIVE DIRECTION BOARD · ${escapeXml(plan.directionName)} · ${map.breakpoint}`;

  const layers = [
    `<rect width="${w}" height="${h}" fill="#f4f1eb"/>`,
    `<text x="24" y="32" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#999" letter-spacing="2">${header}</text>`,
    imageLayer(map, assets, 'HERO_EDITORIAL_SPREAD', 'hero'),
    imageLayer(map, assets, 'SECONDARY_PHOTOGRAPHIC_EVIDENCE', 'secondary-photo'),
    imageLayer(map, assets, 'REPLACEMENT_PAPER_STRIP', 'artifact-paper', true),
    hybridPrimaryArtifactLayer(map, assets),
    imageLayer(map, assets, 'PHYSICAL_EDITOR_OBJECT', 'editor-object'),
    codeNativeTypographyLayer(map, hideBrand),
    codeNativeSocialLayer(map),
    codeNativeMotionLayer(map),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${layers.join('\n')}
</svg>`;
}

export function countCompositorLayers(): number {
  return 9;
}

export function extractSocialProofSvg(plan: CreativeDirectionBoardPlan, map: BoardCompositionMap): string {
  const zone = map.placements.find((p) => p.zoneId === 'socialExpression')!;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${zone.width}" height="${zone.height}" viewBox="0 0 ${zone.width} ${zone.height}">
  <rect width="${zone.width}" height="${zone.height}" fill="#faf9f7"/>
  ${codeNativeSocialLayer({ ...map, placements: [{ ...zone, x: 0, y: 0 }] })}
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

export function collectCompositorCopySnippets(): string[] {
  return Object.values(MARKED_UP_COPY_BOARD_COPY).flatMap((v) =>
    Array.isArray(v) ? [...v] : [String(v)],
  );
}
