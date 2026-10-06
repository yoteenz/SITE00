/**
 * Proof captures for the CENTER_STAGE comparison board: each screen is captured plain and with the composition overlay
 * drawn on top — CENTER SAFE ZONE (dashed), NAV FOOTPRINT (solid), `+` AXIS (red), BACKGROUND PERIMETER ZONES (hatched).
 * EDGE_LED screens get only the mode badge and the axis, since they have no safe zone.
 * Usage: node scripts/jurnl/center-stage-overlay-capture.mjs <runtimeBase> <outDir> <label> [routes]
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { openRoute } from './mobile-composition-qa.mjs';
import { qaChromiumPath } from './qa-env.mjs';

const ROUTES = [
  ['F01.00', 'entry', 'empty'],
  ['F03.00', 'today', 'populated'],
  ['F05.00', 'money', 'populated'],
  ['F09.00', 'safe', 'populated'],
  ['F10.00', 'purchases', 'populated'],
  ['F11.00', 'trips', 'populated'],
  ['F13.00', 'paydown', 'populated'],
  ['F15.00', 'ahead', 'populated'],
  ['F16.00', 'records', 'populated'],
];

async function overlay(page) {
  await page.evaluate(() => {
    const vw = innerWidth;
    const vh = innerHeight;
    const nav = document.querySelector('[data-jrn-zone="bottom-nav"]')?.getBoundingClientRect();
    const plus = document.querySelector('[data-jrn-trigger="nav-add"]')?.getBoundingClientRect();
    const mode = document.querySelector('[data-jrn-composition]')?.dataset.jrnComposition ?? 'UNDECLARED';
    // functional field: the frame minus its nav reserve (falls back to the nav footprint for non-frame screens)
    const frame = document.querySelector('.jrn-frame')?.getBoundingClientRect();
    const reserve = document.querySelector('.jrn-frame__navspace')?.getBoundingClientRect().height ?? 0;
    const zone = mode === 'CENTER_STAGE' ? (frame ? { x: frame.left, y: frame.top, w: frame.width, h: frame.height - reserve } : nav ? { x: nav.left, y: 60, w: nav.width, h: nav.top - 68 } : null) : null;
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;font:700 9px/1 system-ui,sans-serif;letter-spacing:.08em';
    const box = (x, y, w, h, css, label) => {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}`;
      if (label) {
        const l = document.createElement('span');
        l.textContent = label;
        l.style.cssText = 'position:absolute;left:3px;top:3px;padding:2px 4px;background:rgba(255,255,255,.88);color:#0b4d33';
        d.append(l);
      }
      host.append(d);
    };
    const hatch = 'background:repeating-linear-gradient(45deg,rgba(214,120,30,.30) 0 3px,rgba(214,120,30,.06) 3px 9px)';
    if (zone) {
      box(0, 0, vw, zone.y, hatch, 'PERIMETER · BACKGROUND SALIENCE');
      box(0, zone.y, zone.x, zone.h, hatch);
      box(zone.x + zone.w, zone.y, vw - zone.x - zone.w, zone.h, hatch);
      box(0, zone.y + zone.h, vw, vh - zone.y - zone.h, hatch);
      box(zone.x, zone.y, zone.w, zone.h, 'border:2px dashed rgba(16,120,80,.95);background:rgba(16,120,80,.05)', 'CENTER SAFE ZONE');
    }
    if (nav) box(nav.left, nav.top, nav.width, nav.height, 'border:2px solid rgba(16,120,80,.95)', 'NAV FOOTPRINT');
    const ax = plus ? plus.left + plus.width / 2 : vw / 2;
    box(ax - 0.75, 0, 1.5, vh, 'background:rgba(220,30,60,.9)');
    const badge = document.createElement('span');
    badge.textContent = mode.replace('_', ' ');
    badge.style.cssText = 'position:absolute;right:6px;top:6px;padding:3px 6px;color:#fff;background:rgba(16,90,60,.92)';
    host.append(badge);
    document.body.append(host);
  });
}

async function run() {
  const [base, outDir, label, filter = ''] = process.argv.slice(2);
  const dir = join(outDir, label);
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: qaChromiumPath() });
  for (const [id, route, scenario] of ROUTES.filter(([id]) => !filter || filter.split(',').includes(id))) {
    const { context, page } = await openRoute(browser, base, route, [393, 852], scenario);
    await page.screenshot({ path: join(dir, `${id}.jpg`), type: 'jpeg', quality: 80 });
    await overlay(page);
    await page.screenshot({ path: join(dir, `${id}_overlay.jpg`), type: 'jpeg', quality: 80 });
    await context.close();
    console.log(`${label} ${id}`);
  }
  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
