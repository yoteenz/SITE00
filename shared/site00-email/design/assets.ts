/** Email-safe inline SVG assets — static art direction, no dynamic data baked in. */
import { EMAIL } from './tokens.js';

function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Wireframe building for production family */
export function assetLivingBlueprint(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="160" viewBox="0 0 280 160">
<rect width="280" height="160" fill="#f6f6f6"/>
<g stroke="#ccc" stroke-width="1" fill="none">
<line x1="0" y1="120" x2="280" y2="120"/><line x1="40" y1="120" x2="40" y2="40"/>
<line x1="80" y1="120" x2="80" y2="60"/><line x1="120" y1="120" x2="120" y2="30"/>
<line x1="160" y1="120" x2="160" y2="50"/><line x1="200" y1="120" x2="200" y2="70"/>
<line x1="240" y1="120" x2="240" y2="45"/>
</g>
<rect x="115" y="55" width="30" height="40" fill="${EMAIL.red}" opacity="0.85"/>
</svg>`;
  return svgDataUri(svg);
}

/** Isometric package for delivery family */
export function assetDeliveryPackage(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
<rect width="200" height="140" fill="#fff"/>
<polygon points="40,90 100,50 160,90 160,120 40,120" fill="#f6f6f6" stroke="#ddd"/>
<polygon points="40,90 100,50 100,110 40,120" fill="#eee" stroke="#ddd"/>
<polygon points="100,50 160,90 160,120 100,110" fill="#fafafa" stroke="#ddd"/>
<rect x="70" y="75" width="60" height="24" fill="#fff" stroke="${EMAIL.red}" stroke-width="2"/>
<text x="100" y="91" text-anchor="middle" font-family="monospace" font-size="10" fill="${EMAIL.red}">00 DELIVERED</text>
</svg>`;
  return svgDataUri(svg);
}

/** Wireframe milestone cube */
export function assetMilestoneCube(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
<rect width="180" height="180" fill="${EMAIL.black}"/>
<g stroke="${EMAIL.red}" stroke-width="1" fill="none" opacity="0.6">
<polygon points="90,30 140,60 140,120 90,150 40,120 40,60"/>
<polygon points="90,30 90,90 40,120"/><polygon points="90,30 90,90 140,120"/>
<polygon points="90,90 40,120 140,120"/>
</g>
<text x="90" y="98" text-anchor="middle" font-family="monospace" font-size="28" fill="${EMAIL.red}">✓</text>
</svg>`;
  return svgDataUri(svg);
}

/** Blueprint grid background pattern as small tile */
export function assetBlueprintGrid(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#f0f0f0"/>
<g stroke="#e0e0e0" stroke-width="0.5">
${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 8}" y1="0" x2="${i * 8}" y2="64"/>`).join('')}
${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 8}" x2="64" y2="${i * 8}"/>`).join('')}
</g>
</svg>`;
  return svgDataUri(svg);
}

export function imgAsset(src: string, width: number, height: number, alt: string): string {
  return `<img src="${src}" width="${width}" height="${height}" alt="${alt}" style="display:block;margin:0 auto;"/>`;
}
