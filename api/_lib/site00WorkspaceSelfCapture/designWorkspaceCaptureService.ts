import { createHash } from 'node:crypto';

import {
  resolveWorkspaceSelfCaptureUrl,
  type WorkspaceSelfSourceContext,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/sourceContext.js';
import { workspaceSelfViewportSpec } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/viewports.js';

export type DesignWorkspaceCaptureResult = {
  route: string;
  mobile: { captureId: string; buffer: Buffer };
  desktop: { captureId: string; buffer: Buffer };
};

const DESIGN_SCREEN_SELECTOR = '[data-testid="twin-opus-direct-screen"]';

function mockPngBuffer(route: string, viewport: string): Buffer {
  const raw = `vitest-workspace-self:${route}:${viewport}`;
  return Buffer.from(createHash('sha256').update(raw).digest());
}

export async function captureLiveDesignWorkspacePair(input: {
  baseUrl: string;
  source: WorkspaceSelfSourceContext;
  build: string;
  engineeringBypass?: boolean;
}): Promise<DesignWorkspaceCaptureResult | { error: string }> {
  const route = `/projects/design/${input.source.projectSlug.toLowerCase()}`;
  const captureUrl = resolveWorkspaceSelfCaptureUrl(
    input.source,
    input.baseUrl,
    input.engineeringBypass ?? true,
  );

  if (process.env.VITEST === 'true') {
    const ts = Date.now();
    return {
      route,
      mobile: { captureId: `wsc-m-${ts}`, buffer: mockPngBuffer(route, 'MOBILE') },
      desktop: { captureId: `wsc-d-${ts}`, buffer: mockPngBuffer(route, 'DESKTOP') },
    };
  }

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });

    async function shot(viewport: 'MOBILE' | 'DESKTOP'): Promise<Buffer> {
      const spec = workspaceSelfViewportSpec(viewport);
      const context = await browser.newContext({
        viewport: { width: spec.width, height: spec.height },
        deviceScaleFactor: spec.deviceScaleFactor,
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        sessionStorage.setItem('site00-immersive-complete', '1');
        sessionStorage.setItem('site00-assts-immersive-complete', '1');
      });
      await page.goto(captureUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForSelector(DESIGN_SCREEN_SELECTOR, { timeout: 45000 });
      await page.waitForTimeout(2500);
      await page.evaluate(() => document.fonts?.ready);
      const png = await page.screenshot({ type: 'png', fullPage: false });
      await context.close();
      const buffer = Buffer.from(png);
      if (buffer.length < 1000) throw new Error(`Screenshot too small (${buffer.length}b)`);
      return buffer;
    }

    try {
      const [mobileBuffer, desktopBuffer] = await Promise.all([shot('MOBILE'), shot('DESKTOP')]);
      const ts = Date.now();
      return {
        route,
        mobile: { captureId: `wsc-m-${ts}`, buffer: mobileBuffer },
        desktop: { captureId: `wsc-d-${ts}`, buffer: desktopBuffer },
      };
    } finally {
      await browser.close();
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Capture failed';
    return { error: detail };
  }
}
