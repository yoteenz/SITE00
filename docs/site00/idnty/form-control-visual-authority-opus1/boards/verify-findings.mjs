#!/usr/bin/env node
/**
 * Measures the three findings this sprint adds to the audit, against the live DF stylesheets in Chromium:
 *   NF-01  text inputs compute to 14px (iOS Safari zooms on focus below 16px)
 *   NF-02  .df-chip (portal record filter) has no CSS rule anywhere
 *   C-1    the client sheet's legacy .df-select__chev rule rotates DfSelect's own chevron
 * Writes ../evidence/finding-measurements.json. Read-only: renders a scratch page, changes nothing.
 * Usage (repo root): node docs/site00/idnty/form-control-visual-authority-opus1/boards/verify-findings.mjs
 */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../../../..');
const { createServer } = await import(join(repo, 'node_modules/vite/dist/node/index.js'));
const { chromium } = await import(join(repo, 'node_modules/playwright/index.mjs'));

const server = await createServer({ root: repo, logLevel: 'error', server: { port: 5234, strictPort: false } });
await server.listen();
const exe = ['/opt/pw-browsers/chromium'].find((p) => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
try {
  // The live review route renders P02 with the shipped stylesheets.
  await page.goto(`${server.resolvedUrls.local[0]}foundation/review`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#df-business_name', { timeout: 30000 });
  const result = await page.evaluate(() => {
    const cs = (el) => getComputedStyle(el);
    const input = document.querySelector('#df-business_name');
    // DfSelect markup (components.tsx) mounted inside the same .df-root the intake uses.
    const host = document.querySelector('.df-root');
    const probe = document.createElement('div');
    probe.innerHTML =
      '<div class="df-select df-select--below"><button type="button" role="combobox" class="df-select__trigger"><span class="df-select__value">SELECT A BUSINESS TYPE</span><svg class="df-select__chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button></div>';
    host.appendChild(probe);
    const chev = probe.querySelector('.df-select__chev');
    const chip = document.createElement('button');
    chip.className = 'df-chip';
    chip.textContent = 'DOMAIN';
    host.appendChild(chip);
    const chipRules = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const r of rules) if (r.selectorText && /\.df-chip\b/.test(r.selectorText)) chipRules.push(r.selectorText);
    }
    const out = {
      'NF-01': {
        selector: '#df-business_name (.df-input)',
        font_size: cs(input).fontSize,
        ios_zoom_threshold: '16px',
        below_ios_zoom_threshold: parseFloat(cs(input).fontSize) < 16, // iOS behaviour itself is not observable in Chromium
      },
      'NF-02': { selector: '.df-chip', matching_css_rules: chipRules, border: cs(chip).borderStyle, appearance: cs(chip).appearance },
      'C-1': { selector: '.df-root .df-select__chev (DfSelect markup)', position: cs(chev).position, transform: cs(chev).transform },
    };
    probe.remove();
    chip.remove();
    return out;
  });
  result.measured_with = 'Chromium (Playwright) at 390×844, /foundation/review on the local Vite server';
  result.measured_at = new Date().toISOString();
  const out = resolve(here, '../evidence/finding-measurements.json');
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  await server.close();
}
