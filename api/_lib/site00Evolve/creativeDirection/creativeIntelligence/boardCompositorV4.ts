/**
 * V4 compositor — expression-system franchise specimens + v2 editorial layers.
 */

import type { BoardAssetRecord, CreativeDirectionBoardPlan } from './creativeDirectionBoardTypes.js';
import type { DirectionExpressionSystem } from './directionExpressionSystemTypes.js';
import {
  collectCompositorCopySnippets,
  composeBoardSvg as composeBoardSvgV2,
  extractMotionProofSvg,
  extractSocialProofSvg,
} from './boardCompositorV2.js';

function escapeXml(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);
}

function franchiseSpecimenLayer(
  system: DirectionExpressionSystem,
  map: CreativeDirectionBoardPlan['desktopMap'],
): string {
  const franchises = system.recurringContentFranchises.slice(0, 3);
  if (!franchises.length) return '';
  const startX = 360;
  const startY = 680;
  const cardW = 200;
  const gap = 12;
  return `
  <g id="franchise-specimens">
    ${franchises
      .map(
        (f, i) => `
    <rect x="${startX + i * (cardW + gap)}" y="${startY}" width="${cardW}" height="88" fill="#faf9f7" stroke="#ccc" rx="4"/>
    <text x="${startX + i * (cardW + gap) + 8}" y="${startY + 18}" font-family="Helvetica, Arial, sans-serif" font-size="9" fill="#888">${escapeXml(f.socialFormat)}</text>
    <text x="${startX + i * (cardW + gap) + 8}" y="${startY + 36}" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#111">${escapeXml(f.name)}</text>
    <text x="${startX + i * (cardW + gap) + 8}" y="${startY + 54}" font-family="Helvetica, Arial, sans-serif" font-size="9" fill="#333">${escapeXml(f.specimenLabel.slice(0, 48))}</text>`,
      )
      .join('')}
  </g>`;
}

export function composeBoardSvgV4(params: {
  plan: CreativeDirectionBoardPlan;
  map: CreativeDirectionBoardPlan['desktopMap'];
  assets: BoardAssetRecord[];
  expressionSystem: DirectionExpressionSystem;
  hideBrand?: boolean;
}): string {
  const base = composeBoardSvgV2({
    plan: params.plan,
    map: params.map,
    assets: params.assets,
    hideBrand: params.hideBrand,
  });
  if (params.map.breakpoint !== 'DESKTOP') {
    return base;
  }
  const franchiseLayer = franchiseSpecimenLayer(params.expressionSystem, params.map);
  return base.replace('</svg>', `${franchiseLayer}\n</svg>`);
}

export { collectCompositorCopySnippets, extractMotionProofSvg, extractSocialProofSvg };
