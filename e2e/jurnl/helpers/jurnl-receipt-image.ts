/**
 * Synthetic receipt photos for the DOT 01 receipt tests. The image is drawn on a canvas in a blank browser page
 * (black text on a slightly warm paper, a little rotation and noise, like a phone photo), so its date can follow the
 * test's own TODAY. No real receipt and no real merchant data is used. The browser then reads it with the app's own
 * on-device OCR (tesseract.js, self-hosted) — the test does not stub extraction.
 */
import type { BrowserContext } from '@playwright/test';

export type ReceiptSpec = { lines: string[]; width?: number; tilt?: number; blank?: boolean };

export async function receiptPng(context: BrowserContext, spec: ReceiptSpec): Promise<Buffer> {
  const page = await context.newPage();
  try {
    await page.setContent('<!doctype html><html><body></body></html>');
    const dataUrl = await page.evaluate(({ lines, width, tilt, blank }) => {
      const W = width;
      const lineH = 44;
      const H = blank ? 900 : 120 + lines.length * lineH + 120;
      const c = document.createElement('canvas');
      c.width = W + 120;
      c.height = H + 120;
      const g = c.getContext('2d')!;
      g.fillStyle = '#5b4a36'; // the table under the receipt
      g.fillRect(0, 0, c.width, c.height);
      g.translate(c.width / 2, c.height / 2);
      g.rotate((tilt * Math.PI) / 180);
      g.translate(-W / 2, -H / 2);
      g.fillStyle = '#f6f1e6';
      g.fillRect(0, 0, W, H);
      if (!blank) {
        g.fillStyle = '#1b1712';
        g.textBaseline = 'top';
        let y = 70;
        for (const raw of lines) {
          const bold = raw.startsWith('**');
          const line = bold ? raw.slice(2) : raw;
          g.font = `${bold ? 'bold ' : ''}30px "DejaVu Sans Mono", "Liberation Mono", monospace`;
          const [left, right] = line.split('|');
          g.fillText(left!.trimEnd(), 40, y);
          if (right != null) {
            const t = right.trim();
            g.fillText(t, W - 40 - g.measureText(t).width, y);
          }
          y += lineH;
        }
      }
      // light sensor noise so the image is not a perfect render
      const img = g.getImageData(0, 0, c.width, c.height);
      let seed = 20261104;
      for (let i = 0; i < img.data.length; i += 4) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const n = (seed % 13) - 6;
        img.data[i] = Math.max(0, Math.min(255, img.data[i]! + n));
        img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1]! + n));
        img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2]! + n));
      }
      g.putImageData(img, 0, 0);
      return c.toDataURL('image/png');
    }, { lines: spec.lines, width: spec.width ?? 620, tilt: spec.tilt ?? 1.2, blank: !!spec.blank });
    return Buffer.from(dataUrl.split(',')[1]!, 'base64');
  } finally {
    await page.close();
  }
}

/** MM/DD/YYYY, as US receipts print it. */
export function receiptDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
