/**
 * P0.JURNL.F09-SAFE-TO-SPEND.COMPOSITION-BLUEPRINT-RENDER-OWNERSHIP-CORRECTION1 — draw the F09 blueprints.
 * For each territory: a labelled ZONE MAP (documentation, stamped BLUEPRINT — NOT AUTHORITY) and an unlabelled 9:16
 * PLATE GUIDE (the only reference a scene-plate generation may receive: tonal blocks, data-true object geometry, no text,
 * no UI). Reads the exported JSON; run the export first.
 *
 *   node scripts/jurnl/f09-blueprint-render.mjs
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = join(ROOT, 'JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1');
const MAPS = join(DIR, 'ZONE_MAPS');
const GUIDES = join(DIR, 'PLATE_GUIDES');
mkdirSync(MAPS, { recursive: true });
mkdirSync(GUIDES, { recursive: true });
const read = (f) => JSON.parse(readFileSync(join(DIR, f), 'utf8'));
const assembly = read('F09_COMPOSITE_ASSEMBLY_CONTRACT.json');
const NAMES = { T01: 'THE SURVEYED COURTYARD', T02: 'THE ANSWER IN RAKING LIGHT', T03: 'THE SORTING RACK' };
const OWNER = { IMAGE_GENERATOR: '#B5707A', DETERMINISTIC_UI: '#0F3D32', DETERMINISTIC_VECTOR: '#2F5E8C', COMPOSITE: '#B07A2A', NO_RENDER: '#8A8178' };
const COURSE = { BILLS: '#CDAA72', PLAN: '#DCCBA4', GOALS: '#ACA598', TRIPS: '#D2AC9F' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ─────────────── zone map (393×852 frame + legend panel) ─────────────── */

function dataGeometry(t, map) {
  const g = assembly.data_geometry[`JURNL.F09.${t}`];
  const out = [];
  if (t === 'T01') {
    const c = g.courtyard;
    out.push(`<rect x="${c.floor.x}" y="${c.floor.y}" width="${c.floor.w}" height="${c.floor.h}" fill="#F4EEE2" ${map ? 'fill-opacity=".6"' : ''}/>`);
    for (const k of c.courses) out.push(`<polyline points="${k.polyline.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${COURSE[k.course]}" stroke-width="${c.wall_thickness}" stroke-linecap="butt" stroke-linejoin="miter"/>`);
 out.push(`<rect x="${c.room.x}" y="${c.room.y}" width="${c.room.w}" height="${c.room.h}" fill="none" stroke="#B9A88A" stroke-width=".6"/><rect x="${c.floor.x}" y="${c.floor.y}" width="${c.floor.w}" height="${c.floor.h}" fill="none" stroke="#B9A88A" stroke-width=".6"/>`);
    out.push(`<rect x="${c.door_axis_x - c.door_gap / 2}" y="${c.room.y + c.room.h - c.wall_thickness}" width="${c.door_gap}" height="${c.wall_thickness}" fill="#9C7A55"/>`);
    out.push(`<rect x="${c.room.x}" y="${c.room.y}" width="46" height="56" fill="#E4D7BF" stroke="#CDBE9F" stroke-width=".8"/>`);
    for (const k of c.courses) {
      const mid = k.polyline[Math.floor(k.polyline.length / 2)];
      out.push(`<rect x="${mid[0] - 9}" y="${mid[1] - 3}" width="18" height="6" fill="#C6A676"/>`);
    }
    const sb = g.scale_bar;
    if (map) out.push(`<rect x="${sb.clear.x}" y="${sb.clear.y}" width="${sb.clear.w}" height="${sb.clear.h}" fill="#F9F6EF" stroke="#6b5f52" stroke-width=".5"/>`, ...sb.held.map((h) => `<rect x="${h.rect.x}" y="${h.rect.y}" width="${h.rect.w}" height="${h.rect.h}" fill="${COURSE[h.item]}" stroke="#6b5f52" stroke-width=".5"/>`));
  }
  if (t === 'T02') {
    const r = g.rule;
    if (map) out.push(`<rect x="${r.clear.x}" y="${r.clear.y}" width="${r.clear.w}" height="${r.clear.h}" fill="#C6A676"/>`, `<rect x="${r.clear.x + r.clear.w}" y="${r.rule.y}" width="${r.rule.w - r.clear.w}" height="${r.rule.h}" fill="none" stroke="#9D8F7C" stroke-width=".8"/>`);
    out.push(`<line x1="270" y1="364" x2="270" y2="372" stroke="#A88B5A" stroke-width=".8"/><rect x="222" y="372" width="96" height="30" rx="3" fill="#C6A676"/>`);
    out.push(`<rect x="26.5" y="512" width="150" height="44" rx="2" fill="#C9AE80"/>`);
  }
  if (t === 'T03') {
    const k = g.rack;
    out.push(`<rect x="46.5" y="108" width="300" height="184" fill="#FBF8F1" stroke="#E2D9C9" stroke-width=".8"/>`);
    out.push(`<rect x="${k.rack.x}" y="${k.rack.y + 120}" width="${k.rack.w}" height="${k.rack.h - 120}" fill="#B08A5E"/>`);
    for (const s of k.slots) {
      out.push(`<rect x="${s.x}" y="${k.rack.y + 120}" width="${k.slot_width}" height="6" fill="#8C6B45"/>`);
      out.push(`<rect x="${s.x + 6}" y="${k.rack.y + 160}" width="${k.slot_width - 12}" height="12" fill="#C6A676"/>`);
      if (s.envelope_thickness > 0) {
        out.push(`<rect x="${s.x + 3}" y="${k.rack.y + 8}" width="${k.slot_width - 6}" height="${116 - s.envelope_thickness}" fill="#EDE5D6" stroke="#D3C6B0" stroke-width=".6"/>`);
        out.push(`<rect x="${s.x + 3}" y="${k.rack.y + 124 - s.envelope_thickness}" width="${k.slot_width - 6}" height="${s.envelope_thickness}" fill="#CFC2AC"/>`);
        out.push(`<circle cx="${s.x + k.slot_width / 2}" cy="${k.rack.y + 62}" r="9" fill="#6E1F2D"/>`);
      } else {
        out.push(`<circle cx="${s.x + k.slot_width / 2 - 6}" cy="${k.rack.y + 112}" r="5" fill="#6E1F2D"/><path d="M ${s.x + k.slot_width / 2 + 2} ${k.rack.y + 116} l 8 -4 l 2 7 z" fill="#6E1F2D"/>`);
      }
    }
    out.push(`<rect x="46.5" y="520" width="300" height="28" fill="#C6A676"/>`);
  }
  return out.join('');
}

function zoneMap(t, bp, own) {
  const ownerOf = Object.fromEntries(own.layers.map((l) => [l.layer, l.owner]));
  const zones = bp.zones.filter((z) => z.role !== 'ENVIRONMENT');
  const depth = (z) => bp.depth_order.indexOf(z.layer);
  const body = [...zones].sort((a, b) => depth(a) - depth(b)).map((z) => {
    const c = OWNER[ownerOf[z.layer]];
    const hatch = z.role === 'PERIMETER' || z.role === 'NEGATIVE_SPACE';
    const label = z.role === 'SYSTEM_STATUS' && z.rect.h < 40 ? '' : `<text x="${z.rect.x + 3}" y="${z.rect.y + 9}" font-size="6.5" fill="${c}" font-weight="600">${esc(z.zone_id.split('.')[1])} · ${z.role} · ${z.layer} ${ownerOf[z.layer]}</text>`;
    const slots = z.slots.filter((s) => s.rect).map((s) => `<rect x="${s.rect.x}" y="${s.rect.y}" width="${s.rect.w}" height="${s.rect.h}" fill="none" stroke="${c}" stroke-width=".4" stroke-dasharray="1.5 1.5"/><text x="${s.rect.x + 2}" y="${s.rect.y + s.rect.h - 2}" font-size="5" fill="#3b342d">${esc(s.content.slice(0, 64))}${s.decision && s.decision !== 'DECIDED' ? ` [${esc(s.decision)}]` : ''}</text>`).join('');
    return `<rect x="${z.rect.x}" y="${z.rect.y}" width="${z.rect.w}" height="${z.rect.h}" fill="${hatch ? 'url(#hatch)' : c}" fill-opacity="${hatch ? 1 : 0.07}" stroke="${c}" stroke-width=".8"/>${label}${slots}`;
  }).join('');
  const legend = Object.entries(OWNER).map(([k, c], i) => `<rect x="410" y="${150 + i * 18}" width="10" height="10" fill="${c}"/><text x="426" y="${159 + i * 18}" font-size="8.5" fill="#3b342d">${k}</text>`).join('');
  const layers = own.layers.map((l, i) => `<text x="410" y="${270 + i * 34}" font-size="8" fill="${OWNER[l.owner]}" font-weight="600">${l.layer} ${l.owner}</text><foreignObject x="410" y="${273 + i * 34}" width="220" height="30"><div xmlns="http://www.w3.org/1999/xhtml" style="font:6.5px/1.25 sans-serif;color:#3b342d">${esc(l.renders)}</div></foreignObject>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1704" viewBox="0 0 640 852" font-family="Helvetica, Arial, sans-serif">
<defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#B5707A" stroke-opacity=".35" stroke-width="1"/></pattern></defs>
<rect width="640" height="852" fill="#EDE7DC"/><rect width="393" height="852" fill="#F6F1E7"/>
<rect x="26.5" y="108" width="340" height="606" fill="none" stroke="#9D8F7C" stroke-dasharray="4 3" stroke-width=".6"/>
${dataGeometry(t, true)}${body}
<text x="410" y="40" font-size="13" font-weight="700" fill="#6E1F2D" letter-spacing="1">BLUEPRINT — NOT AUTHORITY</text>
<text x="410" y="62" font-size="10" font-weight="700" fill="#2b2620">F09 ${t} ${esc(NAMES[t])}</text>
<text x="410" y="78" font-size="8" fill="#3b342d">${esc(bp.blueprint_id)} · 393×852 pt</text>
<text x="410" y="94" font-size="8" fill="#3b342d">metaphor scope ${bp.metaphor_scope} · ${bp.scroll_behavior}</text>
<text x="410" y="110" font-size="8" fill="#3b342d">focal: ${esc(bp.visual_focal_order.map((z) => z.split('.')[1]).join(' → '))}</text>
<text x="410" y="138" font-size="8.5" font-weight="700" fill="#2b2620">RENDER OWNER</text>${legend}
<text x="410" y="258" font-size="8.5" font-weight="700" fill="#2b2620">LAYER OWNERSHIP</text>${layers}
</svg>`;
}

/* ─────────────── plate guide (9:16, unlabelled tonal blocking) ─────────────── */

const ENV = {
  T01: { base: '#E8DFCF', extra: '<ellipse cx="400" cy="120" rx="60" ry="80" fill="#6F7350" fill-opacity=".55"/><ellipse cx="372" cy="150" rx="26" ry="36" fill="#6F7350" fill-opacity=".35"/>' },
  T02: { base: '#E4D7C2', extra: '<defs><linearGradient id="rk" x1="1" y1="0" x2="0" y2=".6"><stop offset="0" stop-color="#FFF6E2" stop-opacity=".8"/><stop offset="1" stop-color="#FFF6E2" stop-opacity="0"/></linearGradient></defs><rect x="-50" width="560" height="852" fill="url(#rk)"/><rect x="340" y="96" width="60" height="210" fill="#7C6A55"/><rect x="352" y="106" width="48" height="190" fill="#C8D2B4"/><ellipse cx="380" cy="170" rx="18" ry="40" fill="#6F7350" fill-opacity=".6"/>' },
  T03: { base: '#EAE2D5', extra: '<defs><linearGradient id="ul" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF8EA" stop-opacity=".75"/><stop offset=".6" stop-color="#FFF8EA" stop-opacity="0"/></linearGradient></defs><rect x="-50" width="560" height="852" fill="url(#ul)"/>' },
};

function plateGuide(t) {
  // Viewport (393 pt) is the central 82 % of the 9:16 plate: scale + translate so plate x 9–91 % = viewport.
  const W = 393 / 0.82, H = 852;
  const tx = W * 0.09;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
<rect width="${W}" height="${H}" fill="${ENV[t].base}"/>
<g transform="translate(${tx} 0)">${ENV[t].extra}${dataGeometry(t, false)}</g>
</svg>`;
}

/* ─────────────── render ─────────────── */

const exe = [process.env.JURNL_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean).find((p) => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const out = [];
const shot = async (svg, w, h, file) => {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: file });
  await page.close();
  out.push(file.slice(ROOT.length + 1));
};
for (const t of ['T01', 'T02', 'T03']) {
  const bp = read(`F09_${t}_COMPOSITION_BLUEPRINT.json`);
  const own = read(`F09_${t}_RENDER_OWNERSHIP.json`);
  await shot(zoneMap(t, bp, own), 1280, 1704, join(MAPS, `F09_${t}_BLUEPRINT_ZONE_MAP.png`));
  await shot(plateGuide(t), 1080, 1920, join(GUIDES, `F09_${t}_PLATE_GUIDE_9x16.png`));
}
const uri = (f) => `data:image/png;base64,${readFileSync(join(ROOT, f)).toString('base64')}`;
const maps = out.filter((f) => f.includes('ZONE_MAP'));
const board = await (await browser.newContext({ viewport: { width: 1980, height: 900 }, deviceScaleFactor: 1 })).newPage();
await board.setContent(`<body style="margin:0;background:#EDE7DC;display:flex;gap:20px;padding:20px;font:600 13px/1 Helvetica,sans-serif;letter-spacing:.12em;color:#6E1F2D">${maps
  .map((f) => `<figure style="margin:0"><img src="${uri(f)}" style="width:640px;height:852px;display:block"><figcaption style="padding-top:8px">BLUEPRINT — NOT AUTHORITY · ${f.split('/').pop().slice(0, 7).replace('_', ' ')}</figcaption></figure>`)
  .join('')}</body>`);
await board.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
await board.screenshot({ path: join(MAPS, 'F09_BLUEPRINT_BOARD.png'), fullPage: true });
out.push(join(MAPS, 'F09_BLUEPRINT_BOARD.png').slice(ROOT.length + 1));
await browser.close();
console.log(out.join('\n'));
