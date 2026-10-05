// Renders a local HTML file to PNG (used for the runtime icon sheets in the Grok lite pack).
// usage: node render-html.mjs <in.html> <out.png> <width>
import { chromium } from 'playwright';

const [input, output, width = '1600'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.SITE00_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: Number(width), height: 400 }, deviceScaleFactor: 1 });
await page.goto(`file://${input}`);
await page.screenshot({ path: output, fullPage: true });
await browser.close();
