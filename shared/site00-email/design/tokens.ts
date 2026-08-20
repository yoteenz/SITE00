/** SITE 00 email design tokens — reference-locked. */
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
  /** Debug preview + web font loading */
  fontUrl: 'https://fonts.googleapis.com/css2?family=Trebuchet+MS:wght@400;700&display=swap',
  fontStack: "'Trebuchet MS', 'Futura PT', Futura, Arial, sans-serif",
  monoStack: "'Courier New', Courier, monospace",
  scriptAccent: "Georgia, 'Times New Roman', serif",
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
