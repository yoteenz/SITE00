/**
 * Martian Mono typography roles for NDX BOOK creative expression (server-side).
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MartianMonoTypographyRoles } from './creativeExpressionTypes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_CSS = join(__dirname, '../../../../../src/site00/styles/site00-fonts.css');

export function inspectMartianMonoAvailability(): MartianMonoTypographyRoles {
  let available = false;
  let source = 'not found in project';

  if (existsSync(FONTS_CSS)) {
    const css = readFileSync(FONTS_CSS, 'utf8');
    if (css.includes('Martian+Mono') || css.includes('Martian Mono')) {
      available = true;
      source = 'src/site00/styles/site00-fonts.css — Google Fonts @import Martian Mono (wdth,wght 75..112.5,100..800)';
    }
  }

  return {
    martianMonoAvailable: available,
    actualSource: source,
    displayVoice:
      'DISPLAY / EDITORIAL AUTHORITY — high-contrast serif or established display language at architectural scale; dominant claim voice; not polite',
    systemVoice: available
      ? 'NDX SYSTEM VOICE — Martian Mono (project font): metadata, labels, issue IDs, captions, evidence, FILE/SOURCE/PAGE/DATE/STATUS/RECEIPT'
      : 'NDX SYSTEM VOICE — monospaced system metadata character (Martian Mono unavailable server-side; approximate geometric mono in generation only — do NOT label another font Martian Mono)',
    revisionVoice:
      'REVISION VOICE — contrasting condensed grotesque or disruptive sans; behaves like an intervention inserted by a different hand',
    marginVoice:
      'MARGIN VOICE — handwriting-adjacent informal editorial reaction; human, imperfect; counter-argument register — not generic doodle decoration',
    microVoice: available
      ? 'MICRO VOICE — Martian Mono at extreme small scale; rewards close inspection; indexing and evidence receipts'
      : 'MICRO VOICE — tiny monospaced metadata character at extreme small scale',
    rolesSummary: [
      'DISPLAY makes the argument',
      'REVISION challenges it',
      'MARGIN reacts to it',
      available ? 'MARTIAN MONO documents it (system/evidence/micro)' : 'SYSTEM MONO documents it (approximate until code-native render)',
    ],
  };
}

export function typographyRolesPromptBlock(roles: MartianMonoTypographyRoles): string[] {
  return [
    `TYPOGRAPHIC ROLES (multi-voice system — NOT one font everywhere):`,
    `- DISPLAY: ${roles.displayVoice}`,
    `- SYSTEM (Martian Mono ${roles.martianMonoAvailable ? 'AVAILABLE' : 'approximate character only'}): ${roles.systemVoice}`,
    `- REVISION: ${roles.revisionVoice}`,
    `- MARGIN: ${roles.marginVoice}`,
    `- MICRO: ${roles.microVoice}`,
    ...roles.rolesSummary.map((r) => `- ${r}`),
  ];
}
