/**
 * Public redesign contracts: uppercase UI, STUDIO OS firewall, no raster/screenshot shortcuts.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BUILDER_CENTER_COPY,
  BUILDER_PANELS,
  BUILDER_PATH_CARDS,
  EVOLVE_CENTER_COPY,
  EVOLVE_PANELS,
  ORIGIN_EXPANDED_TITLES,
  ORIGIN_PANEL_SIDE_NOTES,
} from '../src/site00/config/public-redesign-content';
import { IDENTITY_PUBLIC_STATES } from '../src/site00/config/idnty-public-redesign';
import { IDNTY_ASSESSMENT_STATE_LIST } from '../src/site00/config/idnty-assessment';
import {
  IDENTITY_AUTHORITY_DOMAINS,
  IDENTITY_AUTHORITY_STATUS_LABEL,
} from '../src/site00/lib/identityAuthorityVerification';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

const PUBLIC_DIR = 'src/site00/components/public-redesign';
const sources = readdirSync(join(root, PUBLIC_DIR))
  .filter((f) => /\.tsx?$/.test(f))
  .map((f) => ({ file: f, text: read(`${PUBLIC_DIR}/${f}`) }));

describe('GLOBAL UPPERCASE RULE', () => {
  it('declares the uppercase contract on the public root and keeps typed content the only exception', () => {
    const css = read('src/site00/styles/site00-public-redesign.css');
    expect(css).toMatch(/\.s00pr\s*\{[^}]*text-transform:\s*uppercase/s);
    expect(css).toMatch(/\.s00pr \*:not\(input\):not\(textarea\)\s*\{\s*text-transform:\s*uppercase/);
    expect(css).toMatch(/\.s00pr textarea,\s*\.s00pr input\s*\{[^}]*text-transform:\s*none/s);
    expect(css).toMatch(/::placeholder[^}]*text-transform:\s*uppercase/s);
  });

  it('every authored visible string in redesign copy configs is already uppercase', () => {
    const copy = [
      BUILDER_CENTER_COPY,
      BUILDER_PANELS,
      BUILDER_PATH_CARDS,
      EVOLVE_CENTER_COPY,
      EVOLVE_PANELS,
      ORIGIN_EXPANDED_TITLES,
      ORIGIN_PANEL_SIDE_NOTES,
      IDENTITY_PUBLIC_STATES,
      IDENTITY_AUTHORITY_STATUS_LABEL,
      IDENTITY_AUTHORITY_DOMAINS.map((d) => [d.label, d.sources.map((s) => s.label)]),
    ];
    for (const s of strings(copy)) {
      // hrefs / ids / slot ids / paths are not visible copy
      if (/^\/|^[A-Z0-9_.]+$|^(site|world|systems|extensions|refine|install|transform|strategy|visual|voice|values|experience|overview|foundation|partial|evolution|authority|starting-at-zero|some-pieces-exist|ready-for-evolution|build-ready|some-pieces|ready-evolution)$|^[a-z-]+$/.test(s)) continue;
      expect(s, s).toBe(s.toUpperCase());
    }
  });

  it('every IDNTY assessment option / step / state label is uppercase', () => {
    for (const state of IDNTY_ASSESSMENT_STATE_LIST) {
      for (const step of state.steps) {
        expect(step.title).toBe(step.title.toUpperCase());
        if (step.subtitle) expect(step.subtitle).toBe(step.subtitle.toUpperCase());
        for (const option of step.options ?? []) {
          expect(option.label).toBe(option.label.toUpperCase());
          if (option.description) expect(option.description).toBe(option.description.toUpperCase());
        }
      }
    }
  });
});

describe('PUBLIC SITE 00 ≠ STUDIO OS', () => {
  const FORBIDDEN = [/STUDIO\s*OS/i, /STUDIO\s*WORLD/i, /PRODUCTION\s+QUEUE/i, /PRODUCTION\s+GRAPH/i, /\bdebug\b(?!-)/i];

  it('exposes no internal vocabulary in redesign copy', () => {
    const copy = strings([BUILDER_CENTER_COPY, BUILDER_PANELS, EVOLVE_CENTER_COPY, EVOLVE_PANELS, IDENTITY_PUBLIC_STATES]).join('\n');
    for (const bad of FORBIDDEN) expect(copy).not.toMatch(bad);
  });

  it('exposes no internal vocabulary in redesign component literals', () => {
    for (const { file, text } of sources) {
      const literals = [...text.matchAll(/>\s*([A-Z][A-Z0-9 ,.'’—\-/&?!:+]{3,})\s*</g)].map((m) => m[1]).join('\n');
      for (const bad of FORBIDDEN) expect(literals, file).not.toMatch(bad);
    }
  });
});

describe('live UI vs generated assets', () => {
  it('never imports authority images or pack paths into runtime code', () => {
    for (const { file, text } of sources) {
      expect(text, file).not.toMatch(/SITE00_PUBLIC_REDESIGN_AUTHORITY_PACK|\.jpg['"]|AUTHORITY_PACK/);
      expect(text, file).not.toMatch(/from\s+['"][^'"]+\.(png|jpe?g|webp)['"]/);
    }
  });

  it('keeps asset placeholders text-free and decorative', () => {
    const slot = read(`${PUBLIC_DIR}/AssetSlot.tsx`);
    expect(slot).toContain('aria-hidden="true"');
    expect(slot).toContain('data-asset-slot');
    const css = read('src/site00/styles/site00-public-redesign.css');
    expect(css).not.toMatch(/\.s00pr-asset-slot[^{]*\{[^}]*content:\s*['"][A-Za-z]/s);
  });

  it('keeps the dev-only authority badge out of production', () => {
    const shell = read(`${PUBLIC_DIR}/PublicRedesignShell.tsx`);
    expect(shell).toContain('import.meta.env.DEV');
    expect(shell).toContain('data-dev-only');
  });
});
