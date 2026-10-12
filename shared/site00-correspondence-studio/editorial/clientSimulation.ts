/**
 * Preview of the email as a webfont-refusing client renders it (Gmail, Outlook.com, Yahoo).
 *
 * Drops every `@font-face` rule and the narrow fallback so the Arial-metric stack renders, and wraps
 * the body the way Gmail does (`<u></u>` followed by a `.body` element) so the email's own
 * fallback-client CSS applies exactly as it would in the inbox. Shared by Correspondence Studio and the
 * browser geometry tests.
 */
export type ClientFontScenario = 'webfont' | 'fallback';

export function simulateFallbackClient(html: string): string {
  return html
    .replace(/@font-face\s*\{[^}]*\}/g, '')
    .replace(/'Arial Narrow',/g, '')
    .replace(/<body([^>]*)>/i, '<body style="margin:0;padding:0"><u></u><div$1>')
    .replace(/<\/body>/i, '</div></body>');
}

export function emailForClient(html: string, scenario: ClientFontScenario): string {
  return scenario === 'fallback' ? simulateFallbackClient(html) : html;
}
