import type { VisualSourceClassification, SourceClassificationReceipt } from './types.js';

function looksLikeFullPageAuthority(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u) return false;
  if (u.startsWith('data:image/')) return true;
  return (
    u.includes('design-authority') ||
    u.includes('authority') ||
    u.includes('screenshot') ||
    u.includes('capture') ||
    /\.(png|jpe?g|webp)(\?|$)/.test(u)
  );
}

export function classifyVisualSource(assetRef: string | null | undefined): SourceClassificationReceipt {
  const asset = (assetRef ?? '').trim();
  if (!asset) {
    return { assetRef: '', classification: 'UNKNOWN', isFullPageScreenshot: false };
  }
  if (asset.startsWith('css:')) {
    return { assetRef: asset, classification: 'PROCEDURAL_CSS', isFullPageScreenshot: false };
  }
  if (asset.includes('/icons/') || asset.endsWith('.svg')) {
    return { assetRef: asset, classification: 'ICON_ASSET', isFullPageScreenshot: false };
  }
  const fullPage = looksLikeFullPageAuthority(asset);
  if (fullPage) {
    return { assetRef: asset, classification: 'PAGE_AUTHORITY', isFullPageScreenshot: true };
  }
  return { assetRef: asset, classification: 'REGION_ASSET', isFullPageScreenshot: false };
}

export function isPageAuthorityClass(c: VisualSourceClassification): boolean {
  return c === 'PAGE_AUTHORITY';
}
