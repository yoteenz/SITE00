/** SITE 00 email design tokens — reference-locked, Martian Mono aligned with product. */
export const EMAIL = {
  red: '#EB1C24',
  black: '#0A0A0A',
  white: '#FFFFFF',
  light: '#F6F6F6',
  stone: '#808080',
  border: '#E5E5E5',
  green: '#1A8F4C',
  amber: '#D97706',
  maxWidth: 640,
  qrDisplaySize: 72,
  /** Martian Mono — matches SITE 00 product typography (site00-fonts.css) */
  fontUrl: 'https://fonts.googleapis.com/css2?family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap',
  fontStack: "'Martian Mono', ui-monospace, 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
  monoStack: "'Martian Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
  footerTagline: 'WE BUILD. YOU GUIDE. TOGETHER.',
  assetBase: 'https://site00.com',
} as const;

export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
