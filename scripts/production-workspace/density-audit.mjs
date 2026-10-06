#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — live density / media audit.
 *
 * Opens the RUNNING app and, per route and viewport, records the computed typography of every text-bearing
 * element in the workspace body, every media element (img / video / background-image) with its slot, fit,
 * natural size, ancestor clipping and distortion, plus horizontal overflow and text clipping. Screenshots of
 * the first screens are saved next to audit.json.
 *
 *   BASE=http://127.0.0.1:5174 OUT=<dir> VIEWPORTS=mobile,tablet,desktop node scripts/production-workspace/density-audit.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { CHILD_PAGES, ROOT_TABS, VIEWPORTS } from './density-routes.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.OUT ?? 'density-audit';
const FAMILIES = (process.env.VIEWPORTS ?? 'mobile').split(',');
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const SCREENS = Number(process.env.SCREENS ?? 2);
const CHROME = process.env.CHROME ?? '/opt/pw-browsers/chromium';

const ROUTES = [...ROOT_TABS.map((r) => ({ ...r, kind: 'root' })), ...CHILD_PAGES.map((r) => ({ ...r, kind: 'child' }))];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const rows = [];

for (const family of FAMILIES) {
  const vp = VIEWPORTS[family];
  mkdirSync(`${OUT}/${family}`, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {
      /* ignore */
    }
  });
  const page = await ctx.newPage();
  let errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(BASE + '/production', { waitUntil: 'load' });
  await page.waitForSelector('[data-testid="production-authority-frame"]', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  for (const r of ROUTES) {
    if (ONLY && !ONLY.has(r.id)) continue;
    errors = [];
    // client-side navigation (React Router listens to popstate): a neutral hop first so same-path routes remount
    const nav = (path) =>
      page.evaluate((path) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, path);
    await nav('/production/activity?__hop=1');
    await page.waitForTimeout(250);
    await nav(r.route);
    await page.waitForSelector('[data-testid="production-authority-frame"], [data-testid="production-workspace-shell"]', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(1600);
    if (r.click) {
      await page.locator(r.click).first().click({ timeout: 8000 }).catch((e) => errors.push(`click ${String(e).slice(0, 80)}`));
      await page.waitForTimeout(1200);
    }
    const data = await page.evaluate(async () => {
      const W = window.innerWidth;
      const scroll =
        document.querySelector('[data-testid="production-authority-scroll"]') ??
        document.querySelector('.pw-frame__scroll, .pw-scroll, main') ??
        document.scrollingElement;
      const root = scroll.querySelector('.pxa-body') ?? scroll;
      const rect = (el) => {
        const b = el.getBoundingClientRect();
        return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
      };
      const visible = (el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.height > 0;
      };
      const scrollTop = scroll.getBoundingClientRect().top;
      const all = [...root.querySelectorAll('*')];

      // ---- typography
      const text = [];
      for (const el of all) {
        if (!visible(el)) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
        if (!own) continue;
        const cs = getComputedStyle(el);
        const b = el.getBoundingClientRect();
        text.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') ?? '').split(/\s+/).slice(0, 3).join('.'),
          role: el.getAttribute('role'),
          fs: parseFloat(cs.fontSize),
          fw: cs.fontWeight,
          lh: cs.lineHeight,
          ls: cs.letterSpacing,
          y: Math.round(b.top - scrollTop + scroll.scrollTop),
          w: Math.round(b.width),
          text: own.slice(0, 48),
          clipped: (el.scrollWidth > el.clientWidth + 1 && /hidden|clip/.test(cs.overflowX) && cs.textOverflow !== 'ellipsis') || false,
          outOfParent: (() => {
            // text escaping the nearest boxed ancestor (background / border) it is visually inside
            for (let a = el.parentElement, d = 0; a && a !== scroll && d < 4; a = a.parentElement, d++) {
              const acs = getComputedStyle(a);
              // any scrolling pane on the way up: the text is scrolled inside it, not escaping
              if (/auto|scroll/.test(acs.overflowY) && a.scrollHeight > a.clientHeight + 1) return false;
              if (/auto|scroll/.test(acs.overflowX) && a.scrollWidth > a.clientWidth + 1) return false;
              const boxed = acs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(acs.borderTopWidth) > 0 || acs.backgroundImage !== 'none';
              if (!boxed || acs.display === 'contents') continue;
              const ab = a.getBoundingClientRect();
              const tol = 1.5;
              const out = b.left < ab.left - tol || b.right > ab.right + tol || b.top < ab.top - tol || b.bottom > ab.bottom + tol;
              if (!out) return false;
              // the boxed ancestor scrolls (internal pane): text below the fold is scrolled, not escaping
              if (/auto|scroll/.test(acs.overflowY) && a.scrollHeight > a.clientHeight) return false;
              return (a.getAttribute('class') ?? a.tagName).split(/\s+/)[0] || 'box';
            }
            return false;
          })(),
        });
      }

      // ---- media
      const bgUrl = (v) => {
        const m = /url\(["']?([^"')]+)["']?\)/.exec(v);
        return m ? m[1] : null;
      };
      const natural = (src) =>
        new Promise((res) => {
          const im = new Image();
          const t = setTimeout(() => res(null), 4000);
          im.onload = () => {
            clearTimeout(t);
            res({ w: im.naturalWidth, h: im.naturalHeight });
          };
          im.onerror = () => {
            clearTimeout(t);
            res({ w: 0, h: 0 });
          };
          im.src = src;
        });
      const mediaEls = all.filter((el) => {
        if (!visible(el)) return false;
        if (el.tagName === 'IMG' || el.tagName === 'VIDEO') return true;
        const bg = getComputedStyle(el).backgroundImage;
        return bg && bg !== 'none' && bg.includes('url(');
      });
      const media = [];
      const targets = mediaEls.slice(0, 160);
      const srcOf = (el) => {
        const cs = getComputedStyle(el);
        return el.tagName === 'IMG' ? el.currentSrc || el.src : el.tagName === 'VIDEO' ? el.poster : bgUrl(cs.backgroundImage);
      };
      const uniq = [...new Set(targets.map(srcOf).filter(Boolean))];
      const natMap = new Map(await Promise.all(uniq.map(async (u) => [u, await natural(u)])));
      for (const el of targets) {
        const cs = getComputedStyle(el);
        const b = el.getBoundingClientRect();
        const isImg = el.tagName === 'IMG';
        const src = srcOf(el);
        const nat = isImg && el.complete && el.naturalWidth ? { w: el.naturalWidth, h: el.naturalHeight } : src ? natMap.get(src) ?? null : null;
        // ancestor clipping (the scroll container itself is scrolling, not clipping)
        let clipFrac = 1;
        let clipBy = null;
        for (let a = el.parentElement; a && a !== scroll; a = a.parentElement) {
          const acs = getComputedStyle(a);
          if (/visible/.test(acs.overflowX) && /visible/.test(acs.overflowY) && acs.clipPath === 'none') continue;
          const ab = a.getBoundingClientRect();
          const ix = Math.max(0, Math.min(b.right, ab.right) - Math.max(b.left, ab.left));
          const iy = Math.max(0, Math.min(b.bottom, ab.bottom) - Math.max(b.top, ab.top));
          const f = (ix * iy) / Math.max(1, b.width * b.height);
          if (f < clipFrac - 0.001) {
            clipFrac = f;
            clipBy = (a.getAttribute('class') ?? a.tagName).split(/\s+/)[0];
          }
          if (/auto|scroll/.test(acs.overflowX) && a.scrollWidth > a.clientWidth) break; // horizontal rail: scrolled, not clipped
        }
        const ratio = b.width / Math.max(1, b.height);
        const natRatio = nat && nat.h ? nat.w / nat.h : null;
        const fit = isImg ? cs.objectFit : cs.backgroundSize;
        const distorted =
          natRatio != null &&
          ((isImg && cs.objectFit === 'fill' && Math.abs(ratio - natRatio) / natRatio > 0.04) ||
            (!isImg && /%\s+\d+%|\dpx\s+\d+px/.test(cs.backgroundSize) && !/auto/.test(cs.backgroundSize)));
        const parent = el.parentElement;
        media.push({
          kind: isImg ? 'img' : el.tagName === 'VIDEO' ? 'video' : 'bg',
          cls: (el.getAttribute('class') ?? '').split(/\s+/).slice(0, 2).join('.'),
          parentCls: (parent?.getAttribute('class') ?? '').split(/\s+/)[0],
          slot: el.closest('[data-media-slot]')?.getAttribute('data-media-slot') ?? null,
          fitMode: el.closest('[data-media-fit]')?.getAttribute('data-media-fit') ?? null,
          src: src ? src.split('/').pop().slice(0, 60) : null,
          rect: rect(el),
          natural: nat,
          fit,
          position: isImg ? cs.objectPosition : cs.backgroundPosition,
          aspect: cs.aspectRatio,
          clipFrac: Math.round(clipFrac * 1000) / 1000,
          clipBy,
          distorted: Boolean(distorted),
          broken: isImg ? el.complete && el.naturalWidth === 0 : nat ? nat.w === 0 : false,
          overflowsViewport: b.right > W + 1 || b.left < -1,
          sourceDriven: isImg && nat && nat.w > 0 && Math.abs(b.width - nat.w) < 1 && b.width > (parent?.clientWidth ?? W) + 1,
        });
      }

      // ---- horizontal overflow (outside intentional horizontal rails)
      const overflowEls = all.filter((el) => {
        if (!visible(el)) return false;
        const b = el.getBoundingClientRect();
        if (b.right <= W + 1 && b.left >= -1) return false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const o = getComputedStyle(a).overflowX;
          if (/auto|scroll|hidden|clip/.test(o)) {
            const ab = a.getBoundingClientRect();
            if (ab.right <= W + 1) return false;
          }
        }
        return true;
      });

      return {
        viewport: { w: W, h: window.innerHeight },
        scroll: { client: scroll.clientHeight, height: scroll.scrollHeight, width: scroll.scrollWidth, clientWidth: scroll.clientWidth },
        docOverflowX: document.documentElement.scrollWidth > W + 1,
        overflowCount: overflowEls.length,
        overflowSamples: overflowEls.slice(0, 5).map((el) => (el.getAttribute('class') ?? el.tagName).slice(0, 60)),
        text,
        media,
        bodyText: (root.innerText ?? '').replace(/\s+/g, ' ').slice(0, 160),
      };
    });
    const shots = [];
    for (let s = 0; s < SCREENS; s++) {
      const file = `${family}/${r.id}-${s + 1}.png`;
      if (s > 0) {
        const more = await page.evaluate((s) => {
          const sc = document.querySelector('[data-testid="production-authority-scroll"]') ?? document.querySelector('.pw-scroll') ?? document.scrollingElement;
          const before = sc.scrollTop;
          sc.scrollTop = Math.round(sc.clientHeight * 0.85 * s);
          return sc.scrollTop !== before;
        }, s);
        if (!more) break;
        await page.waitForTimeout(300);
      }
      await page.screenshot({ path: `${OUT}/${file}` });
      shots.push(file);
    }
    rows.push({ family, ...r, errors, shots, ...data });
    console.log(`${family.padEnd(7)} ${r.id.padEnd(30)} text=${data.text.length} media=${data.media.length} maxFs=${Math.max(0, ...data.text.map((t) => t.fs))} overflow=${data.overflowCount} textClip=${data.text.filter((t) => t.clipped || t.outOfParent).length} err=${errors.length}`);
    await page.evaluate(() => {
      const sc = document.querySelector('[data-testid="production-authority-scroll"]') ?? document.querySelector('.pw-scroll');
      if (sc) sc.scrollTop = 0;
    });
  }
  await page.close();
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}/audit.json`, JSON.stringify(rows, null, 1));
