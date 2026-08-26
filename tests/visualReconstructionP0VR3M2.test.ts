/**
 * P0.VR.3M.2-SITE00 — Live Design footer visibility diagnostic + scroll-container repair tests.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  DESIGN_FOOTER_CONTENT_MARKERS,
  DESIGN_FOOTER_PANEL_SELECTOR,
  DESIGN_FOOTER_ROUTE,
  evaluateDesignFooterReceipt,
  designFooterReceiptPasses,
  designFooterScrollContainerIsContentArea,
  intersectsViewport,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m2/client.js';

const ROOT = join(import.meta.dirname, '..');
const DEV_BASE = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.3M.2 design footer visibility', () => {
  it('CSS uses bounded viewport shell with flow-positioned bottom panel (not sticky sibling trap)', () => {
    const css = read('src/site00/styles/site00-design-workspace-p0vr2b.css');
    expect(css).toContain('.site00-page--design-workspace');
    expect(css).toContain('height: 100dvh');
    expect(css).toContain('.site00-dw-shell__main');
    expect(css).toContain('min-height: 0');
    expect(css).toContain('overflow: hidden');
    expect(css).toContain('.site00-dw-shell__content');
    expect(css).toContain('overflow: auto');
    expect(css).toContain('.site00-dw-shell__bottom-panel');
    expect(css).toContain('flex-shrink: 0');
    expect(css).toContain('min-height: var(--site00-dw-bottom-panel-height');
    expect(css).not.toMatch(/\.site00-dw-shell__bottom-panel[\s\S]*position:\s*sticky/);
  });

  it('shell mounts single canonical footer via bottomPanel prop', () => {
    const shell = read('src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx');
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    const footer = read('src/site00/components/designWorkspace/DesignWorkspaceFooter.tsx');
    expect(shell).toContain('site00-dw-shell__bottom-panel');
    expect(workspace).toContain('bottomPanel={<DesignWorkspaceFooter');
    expect(footer).toContain('RECENT ACTIVITY');
    expect(footer).toContain('QUICK ACTIONS');
    expect(workspace.includes('<DesignWorkspaceFooter')).toBe(true);
    expect(workspace).not.toMatch(/tab === 'COMPARE' \? <DesignWorkspaceFooter/);
  });

  it('design page exposes build metadata for served-environment verification', () => {
    expect(read('src/site00/pages/StudioWorldDesignPage.tsx')).toContain('data-app-build-id');
    expect(read('index.html')).toContain('app-build-id');
  });

  it('diagnostic receipt flags collapsed/off-viewport footer as failing', () => {
    const bad = evaluateDesignFooterReceipt({
      geometry: { x: 8, y: 1041, width: 374, height: 0.09, top: 1041, bottom: 1041.09, left: 8, right: 382 },
      computed: {
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        position: 'sticky',
        zIndex: '30',
        flexShrink: '0',
        overflow: 'visible',
      },
      viewportHeight: 667,
      textContent: 'RECENT ACTIVITY QUICK ACTIONS',
    });
    expect(designFooterReceiptPasses(bad)).toBe(false);
    expect(bad.intersectsViewport).toBe(false);
    expect(bad.height).toBeLessThan(1);
  });

  it('diagnostic receipt passes visible in-viewport flow footer', () => {
    const good = evaluateDesignFooterReceipt({
      geometry: { x: 0, y: 520, width: 390, height: 160, top: 520, bottom: 680, left: 0, right: 390 },
      computed: {
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        position: 'relative',
        zIndex: '30',
        flexShrink: '0',
        overflow: 'visible',
      },
      scrollAncestorOverflow: ['DIV.site00-dw-shell__content:auto'],
      viewportHeight: 844,
      textContent: 'RECENT ACTIVITY QUICK ACTIONS',
      servedBuildId: 'dev-local',
    });
    expect(designFooterReceiptPasses(good)).toBe(true);
    expect(intersectsViewport(good.geometry!, 844)).toBe(true);
    expect(designFooterScrollContainerIsContentArea(good.scrollAncestorOverflow)).toBe(true);
  });

  it('preserves P0.VR.3M.1 notifications, overflow menus, and icons', () => {
    const workspace = read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx');
    expect(workspace).toContain('useDesignWorkspaceHostMenus');
    expect(workspace).toContain('ActiveProjectNotificationCenter');
    expect(workspace).toContain('DesignWorkspaceOverflowMenu');
    expect(read('src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx')).toContain('DesignWorkspaceBellIcon');
  });

  it('preserves canonical route and SITE00 host accent', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr3m/constants.ts')).toContain(
      "CANONICAL_SITE00_DESIGN_ROUTE = '/projects/site00/design'",
    );
    expect(read('src/site00/styles/site00-design-workspace-p0vr2b.css')).toContain('--site00-dw-host-accent');
    expect(read('src/site00/components/designWorkspace/DesignWorkspaceFooter.tsx')).not.toContain('NDX_LIME');
  });
});

describe('P0.VR.3M.2 live browser footer verification', () => {
  let serverUp = false;

  beforeAll(async () => {
    try {
      const res = await fetch(`${DEV_BASE}/`, { signal: AbortSignal.timeout(3000) });
      serverUp = res.ok;
    } catch {
      serverUp = false;
    }
  });

  it('live DOM footer is visible on /projects/site00/design across tabs and projects', async () => {
    if (!serverUp) {
      console.warn('[P0.VR.3M.2] Dev server not reachable — skipping live browser test');
      return;
    }

    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const artifactsDir = '/opt/cursor/artifacts';
    mkdirSync(artifactsDir, { recursive: true });

    try {
      const contexts = [
        { project: 'site00', label: 'SITE00' },
        { project: 'ndxbook', label: 'NDXBOOK' },
        { project: 'studio-world', label: 'STUDIO_WORLD' },
        { project: 'frontal-slayer', label: 'FRONTAL_SLAYER' },
        { project: 'all-in-one-enterprises', label: 'AIO' },
      ] as const;
      const tabs = ['PAGES', 'REFERENCE', 'COMPARE', 'REVIEW'] as const;

      for (const viewport of [
        { name: 'desktop', width: 1280, height: 800 },
        { name: 'tablet', width: 834, height: 1112 },
        { name: 'mobile', width: 390, height: 844 },
      ]) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        await page.addInitScript(() => {
          window.localStorage.setItem('isSignedIn', 'true');
        });

        const url = `${DEV_BASE}${DESIGN_FOOTER_ROUTE}?project=ndxbook`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForSelector(DESIGN_FOOTER_PANEL_SELECTOR, { timeout: 30000 });

        const receipt = await page.evaluate(
          ({ panelSelector, contentMarkers, route }) => {
            const panel = document.querySelector(panelSelector) as HTMLElement | null;
            const buildMeta =
              document.querySelector('[data-app-build-id]')?.getAttribute('data-app-build-id') ??
              document.querySelector('meta[name="app-build-id"]')?.getAttribute('content') ??
              null;
            if (!panel) {
              return { present: false, buildMeta, text: '', geometry: null, computed: null, scrollAncestors: [] };
            }
            const rect = panel.getBoundingClientRect();
            const style = window.getComputedStyle(panel);
            const scrollAncestors: string[] = [];
            let node: HTMLElement | null = panel.parentElement;
            while (node) {
              const cs = window.getComputedStyle(node);
              if (['auto', 'hidden', 'scroll', 'clip'].includes(cs.overflowY) || cs.overflowY !== 'visible') {
                scrollAncestors.push(`${node.tagName}.${node.className.split(' ').join('.')}:${cs.overflowY}`);
              }
              node = node.parentElement;
            }
            return {
              present: true,
              buildMeta,
              text: panel.textContent ?? '',
              geometry: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
              },
              computed: {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                position: style.position,
                zIndex: style.zIndex,
                flexShrink: style.flexShrink,
                overflow: style.overflow,
              },
              scrollAncestors,
              route,
              contentMarkers,
            };
          },
          {
            panelSelector: DESIGN_FOOTER_PANEL_SELECTOR,
            contentMarkers: DESIGN_FOOTER_CONTENT_MARKERS,
            route: DESIGN_FOOTER_ROUTE,
          },
        );

        const evaluated = evaluateDesignFooterReceipt({
          route: DESIGN_FOOTER_ROUTE,
          geometry: receipt.geometry,
          computed: receipt.computed,
          scrollAncestorOverflow: receipt.scrollAncestors,
          viewportHeight: viewport.height,
          textContent: receipt.text,
          servedBuildId: receipt.buildMeta,
        });

        writeFileSync(
          join(artifactsDir, `p0vr3m2-footer-receipt-${viewport.name}.json`),
          JSON.stringify(evaluated, null, 2),
        );

        await page.screenshot({
          path: join(artifactsDir, `p0vr3m2-design-footer-${viewport.name}.png`),
          fullPage: false,
        });

        expect(receipt.present, `${viewport.name}: footer DOM`).toBe(true);
        expect(evaluated.width, `${viewport.name}: width`).toBeGreaterThan(0);
        expect(evaluated.height, `${viewport.name}: height`).toBeGreaterThan(40);
        expect(evaluated.intersectsViewport, `${viewport.name}: intersects viewport`).toBe(true);
        expect(evaluated.expectedContentVisible, `${viewport.name}: content`).toBe(true);
        expect(designFooterReceiptPasses(evaluated), `${viewport.name}: receipt`).toBe(true);

        for (const tab of tabs) {
          const tabButton = page.locator('.site00-dw-tabs__tab', { hasText: tab });
          if ((await tabButton.count()) > 0) {
            await tabButton.first().click();
            const tabRect = await page.locator(DESIGN_FOOTER_PANEL_SELECTOR).boundingBox();
            expect(tabRect?.height ?? 0, `${viewport.name} tab ${tab}`).toBeGreaterThan(40);
          }
        }

        if (viewport.name === 'desktop') {
          for (const ctx of contexts) {
            await page.selectOption('.site00-dw-field select', { label: new RegExp(ctx.label, 'i') }).catch(async () => {
              await page.selectOption('.site00-dw-field select >> nth=0', ctx.project);
            });
            await page.waitForTimeout(300);
            const box = await page.locator(DESIGN_FOOTER_PANEL_SELECTOR).boundingBox();
            expect(box?.height ?? 0, `project ${ctx.project}`).toBeGreaterThan(40);
          }
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }, 120000);
});
