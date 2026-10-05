#!/usr/bin/env python3
"""Grok handoff lite pack for the SITE 00 Production workspace (P0.SITE00.PRODUCTION-WORKSPACE-GROK-HANDOFF-AUDIT-LITEPACK1).

usage:
  python3 build_handoff.py --repo <repo> --runtime-model <runtime-model.json> --uploads <founder upload store>
                           --inventory <inv_final.json> --captures <after16 dir> --gh-captures <capture-runtime dir>
                           --routes-main <routes-main.json> --stage <staging dir> --zip <out.zip> --docs <docs dir>

Reads (never modifies) the founder authority uploads, the git history blobs and the live captures; writes
compressed REFERENCE-ONLY copies, the six manifests, NOTES and README_FIRST into <stage>, zips them and validates
the ZIP. Manifests + NOTES + README are also mirrored into <docs> for review in the repo.
"""
import argparse
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import handoff_data as H  # noqa: E402

FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
HUB_MASTER_BLOB = '43611fd8:src/site00/components/productionHub/bottom-nav/masters/01_HUB.png'
NAV_V1_SHEET_BLOB = '7c987d5c:docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1/authority/BOTTOM_NAV_ICON_PACK_SHEET.jpg'


def font(size, bold=False):
    return ImageFont.truetype(FONT_B if bold else FONT_R, size)


# ── image pack ──────────────────────────────────────────────────────────────────────────────────────
class Pack:
    def __init__(self, stage):
        self.stage = stage
        self.files = {}  # rel -> record

    def _save_jpeg(self, im, rel, quality):
        path = os.path.join(self.stage, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        im.convert('RGB').save(path, 'JPEG', quality=quality, optimize=True, progressive=True)
        return path

    def image(self, rel, src_img, source, *, long_edge=1280, quality=58, role, surfaces=(), viewport=None, authority_status='CANONICAL', note=''):
        im = src_img.convert('RGB')
        orig = im.size
        if max(im.size) > long_edge:
            im.thumbnail((long_edge, long_edge), Image.LANCZOS)
        path = self._save_jpeg(im, rel, quality)
        self.files[rel] = {
            'file': rel,
            'role': role,
            'source': source,
            'source_size': list(orig),
            'pack_size': list(im.size),
            'bytes': os.path.getsize(path),
            'surfaces': list(surfaces),
            'viewport': viewport,
            'authority_status': authority_status,
            'reference_only': True,
            'note': note,
        }
        return rel

    def png(self, rel, im, source, *, role, surfaces=(), colors=None, note='', authority_status='CANONICAL'):
        path = os.path.join(self.stage, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        out = im
        if colors:
            out = im.convert('RGBA').quantize(colors=colors, method=Image.Quantize.FASTOCTREE)
        out.save(path, 'PNG', optimize=True)
        self.files[rel] = {'file': rel, 'role': role, 'source': source, 'source_size': list(im.size), 'pack_size': list(im.size), 'bytes': os.path.getsize(path), 'surfaces': list(surfaces), 'viewport': None, 'authority_status': authority_status, 'reference_only': True, 'note': note}
        return rel

    def text(self, rel, content):
        path = os.path.join(self.stage, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return rel


def git_blob_image(repo, spec):
    data = subprocess.run(['git', '-C', repo, 'show', spec], capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(data)), hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()


def wrap(text, f, width, max_lines=2):
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if f.getlength(trial) > width and line:
            lines.append(line)
            line = word
        else:
            line = trial
    lines.append(line)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        while lines[-1] and f.getlength(lines[-1] + '…') > width:
            lines[-1] = lines[-1][:-1]
        lines[-1] += '…'
    return lines


def board(cells, *, cols, cell_w, title, sub=None, bg=(246, 246, 248), label_h=40, pad=12):
    """cells: [(label, PIL image)] → one labelled contact board (reference only)."""
    fitted = []
    for label, im in cells:
        im = im.convert('RGB')
        im.thumbnail((cell_w, 10_000), Image.LANCZOS)
        fitted.append((label, im))
    rows = [fitted[i:i + cols] for i in range(0, len(fitted), cols)]
    row_h = [max(im.height for _, im in r) + label_h for r in rows]
    W = cols * (cell_w + pad) + pad
    sub_lines = []
    if sub:  # wrap the subtitle to the board width
        f11 = font(11)
        line = ''
        for word in sub.split():
            trial = f'{line} {word}'.strip()
            if f11.getlength(trial) > W - 2 * pad and line:
                sub_lines.append(line)
                line = word
            else:
                line = trial
        sub_lines.append(line)
    head = 34 + 14 * len(sub_lines)
    Hh = head + sum(row_h) + pad * (len(rows) + 1)
    out = Image.new('RGB', (W, Hh), bg)
    d = ImageDraw.Draw(out)
    d.text((pad, 8), title, font=font(17, True), fill=(18, 18, 22))
    for i, ln in enumerate(sub_lines):
        d.text((pad, 28 + 14 * i), ln, font=font(11), fill=(110, 110, 118))
    y = head + pad
    for r, rh in zip(rows, row_h):
        x = pad
        for label, im in r:
            for i, ln in enumerate(wrap(label, font(11, True), cell_w)):
                d.text((x, y + 13 * i), ln, font=font(11, True), fill=(196, 18, 30))
            out.paste(im, (x, y + label_h - 12))
            x += cell_w + pad
        y += rh + pad
    return out


# ── surfaces ───────────────────────────────────────────────────────────────────────────────────────
def surface(sid, tab, route, name, level, parent, component, **kw):
    rec = {
        'surface_id': sid,
        'workspace_tab': tab,
        'route': route,
        'direct_route': kw.pop('direct', None),
        'surface_name': name,
        'surface_level': level,
        'parent_id': parent,
        'child_ids': [],
        'grandchild_ids': [],
        'runtime_component': component,
        'visual_authority': kw.pop('authority', None),
        'responsive_authority': kw.pop('responsive', None),
        'interaction_authority': kw.pop('interaction', None),
        'icon_authority': kw.pop('icons', []),
        'project_reactive': kw.pop('project_reactive', True),
        'visual_class': kw.pop('visual_class', 'GLOBAL_WORKSPACE_VISUAL'),
        'visual_regions': kw.pop('regions', {}),
        'canonical_status': kw.pop('status', 'CANONICAL'),
        'runtime_active': kw.pop('runtime_active', True),
        'functional_runtime_canonical': kw.pop('frc', True),
        'visual_runtime_canonical': kw.pop('vrc', False),
        'distinct_visual_authority': kw.pop('distinct', False),
        'inherits_visual_from': kw.pop('inherits', None),
        'environment_group': kw.pop('env', None),
        'asset_actions': kw.pop('actions', ['LIVE_CODE']),
        'isolated_assets': kw.pop('objects', []),
        'asset_pass_required': None,
        'grok_priority': kw.pop('priority', 'P3'),
        'pack_files': [],
        'notes': kw.pop('notes', ''),
    }
    rec['asset_pass_required'] = any(a not in ('LIVE_CODE', 'NO_ACTION') for a in rec['asset_actions'])
    if kw:
        raise ValueError(f'unknown keys for {sid}: {sorted(kw)}')
    return rec


HOST = ['host-top strip (tab wordmark, SITE 00 / STUDIO WORLD, project selector chrome, ITEMS NEED YOU reticle, menu)', 'bottom / host nav']
COMP = {
    'frame': 'src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx',
    'hub': 'src/site00/components/productionAuthority/HubBody.tsx',
    'machine': 'src/site00/components/productionHub/ProductionHub.tsx',
    'inbox': 'src/site00/components/productionAuthority/InboxBody.tsx',
    'design': 'src/site00/components/productionAuthority/DesignChamber.tsx',
    'bench': 'src/site00/pages/DesignProductionWorkspacePage.tsx',
    'sections': 'src/site00/components/designBench/production/DesignProductionSections.tsx',
    'experience': 'src/site00/components/productionAuthority/realm/ExperienceScreen.tsx',
    'library': 'src/site00/components/productionAuthority/realm/LibraryScreen.tsx',
    'floor': 'src/site00/components/productionAuthority/ExpressionBody.tsx',
    'family': 'src/site00/components/productionAuthority/expression/ExpressionFamilyShell.tsx',
    'cf': 'src/site00/components/characterFabrication/CharacterFabrication.tsx',
    'activity': 'src/site00/components/productionAuthority/ActivityBody.tsx',
    'chrome': 'src/site00/components/productionHub/chrome.tsx',
    'nav': 'src/site00/components/productionHub/nav.tsx',
    'mediaInspector': 'src/site00/components/productionAuthority/expression/ExpressionMediaInspector.tsx',
    'charInspector': 'src/site00/components/productionAuthority/realm/LibraryCharacterImageInspector.tsx',
}


def amap_ids(amap, route, key):
    r = amap.get(route)
    return list(r[key]) if r else []


def build_surfaces(rm, amap, rmain):
    S = []
    direct = {x['key']: x['path'] for x in rmain}

    # HUB ------------------------------------------------------------------------------------------
    S.append(surface(
        'hub.root', 'HUB', '/production', 'HUB — production overview (density benchmark)', 'PARENT', None, COMP['hub'],
        direct='/production', distinct=True, env='ENV-ATRIUM', priority='P0', vrc=False,
        authority={'primary': amap_ids(amap, '/production', 'mobile_authority')[:1] + amap_ids(amap, '/production', 'tablet_authority')[:1] + amap_ids(amap, '/production', 'desktop_authority')[:1],
                   'concordant': ['UP:T12:Mobile/IMG_5922.jpg', 'UP:T12:Tablet/IMG_6004.jpg', 'UP:T12:Desktop/IMG_5981.jpg', 'UP:PAR3V:00_HUB.jpg'],
                   'rule': 'HUBREF governs (highest resolution); T12 + PAR3V concordant.'},
        actions=['REGENERATE_ENVIRONMENT', 'GENERATE_ISOLATED_OBJECT', 'LIVE_CODE'], objects=['OBJ-NDX-CORE'],
        icons=['nav.*', 'host.menu', 'host.dropdown', 'host.reticle', 'hub.node.*'],
        regions={'SITE00_HOST': HOST, 'PROJECT_BODY': ['world-panel copy (PROJECT NDXBOOK · ENTRY 002 · tagline)', 'core object (pyramid)', 'entry thumbnails', 'overview / operations / recent-activity media'], 'SHARED_WORKSPACE': ['atrium world panel', 'live status band', 'module panels', 'component tiles + line icons', 'progress ring', 'red rails']},
        notes='Verified current canonical state: white host panel, NDXBOOK selector, "NN ITEMS NEED YOU" (live attention count; authority shows 03), body modules STATUS · PRODUCTION OVERVIEW · ACTIVE ENTRIES · PROJECT COMPONENTS · CURRENT OPERATIONS · RECENT ACTIVITY (regions of this surface, not routes), 7-tab nav. World panel carries the legacy chamber link (hub.machine). Hero = hub.hero.* crops of the authority screenshot (low-res, core baked in) → FUNCTIONAL true / VISUAL false.'))
    S.append(surface(
        'hub.machine', 'HUB', '/production?view=machine', 'HUB MACHINE — legacy production chamber', 'FULL_SCREEN', 'hub.root', COMP['machine'],
        direct='/production?view=machine', status='LEGACY', env='ENV-HUB-MACHINE-LEGACY', priority='P3', vrc=True, actions=['NO_ACTION'],
        authority={'primary': amap_ids(amap, '/production?view=machine', 'mobile_authority'), 'rule': 'D-HUB-LEGACY — LEGACY_LOCKED; mobile authority only (U-06). Not packed.'},
        regions={'SITE00_HOST': HOST, 'SHARED_WORKSPACE': ['machine chamber']}, notes='Reached from the HUB world-panel link "OPEN HUB MACHINE (CHAMBER)". Keep reachable; do not restyle.'))
    for aid in amap_ids(amap, '/production?view=machine', 'interaction_authority'):
        stem = aid.rsplit('/', 1)[-1].rsplit('.', 1)[0]
        slug = re.sub(r'^\d+_', '', stem).lower().replace('_', '-')
        S.append(surface(f'hub.machine.{slug}', 'HUB', '/production?view=machine (in-route state)', f'HUB MACHINE · {stem}', 'OVERLAY', 'hub.machine', COMP['machine'],
                         status='LEGACY', env='ENV-HUB-MACHINE-LEGACY', priority='P3', vrc=True, actions=['NO_ACTION'],
                         authority={'primary': [aid], 'rule': 'LEGACY_LOCKED interaction board (not packed).'}, regions={'SHARED_WORKSPACE': ['machine overlay']}))

    # INBOX ----------------------------------------------------------------------------------------
    paper = {'SITE00_HOST': HOST, 'PROJECT_BODY': ['decision objects / thumbnails', 'record copy'], 'SHARED_WORKSPACE': ['white panels', 'lens tabs', 'rails + rows', 'inspector', 'chips', 'IA line icons']}
    S.append(surface('inbox.root', 'INBOX', '/production/queue', 'INBOX · NEEDS YOU (root)', 'PARENT', None, COMP['inbox'],
                     direct=direct['inbox-needs-you'], distinct=True, env='ENV-WORKSPACE-PAPER', priority='P0', vrc=True, actions=['LIVE_CODE'],
                     authority={'primary': ['UP:T12:Mobile/IMG_5924.jpg', 'UP:T12:Tablet/IMG_6005.jpg', 'UP:T12:Desktop/IMG_5982.jpg'], 'concordant': ['UP:IBX2:01_MOBILE/00_inbox-root.jpg', 'UP:PAR3V:01_INBOX.jpg'], 'rule': 'D-INBOX-ROOT — NEEDS YOU follows PARENT_3VIEW 01_INBOX.'},
                     icons=['ia.*', 'nav.inbox'], regions=paper,
                     notes='No environment plate in any authority. Mobile no-scroll contract: the page never scrolls; lists scroll inside declared panes only.'))
    lens = [('watching', 'WATCHING'), ('resolved', 'RESOLVED'), ('all', 'ALL INBOX'), ('messages', 'MESSAGES'), ('system', 'SYSTEM')]
    keymap = {'all': 'inbox-all-inbox'}
    for v, label in lens:
        rep = v == 'all'
        S.append(surface(f'inbox.{v}', 'INBOX', f'/production/queue?view={v}', f'INBOX · {label}', 'CHILD', 'inbox.root', COMP['inbox'],
                         direct=direct[keymap.get(v, f'inbox-{v}')], distinct=rep, inherits=None if rep else 'inbox.all', env='ENV-WORKSPACE-PAPER',
                         priority='P1' if rep else 'P3', vrc=True, actions=['LIVE_CODE'], status='RUNTIME_ACTIVE',
                         authority={'primary': ['RUNTIME (D-INBOX-FINAL, founder FINAL)'], 'model_copy': amap_ids(amap, f'/production/queue?view={v}', 'mobile_authority'), 'rule': 'Presentation = rail + rows + inspector (D-INBOX-FINAL); IBX2 v2 cards are stale presentation (model + copy only).'},
                         icons=['ia.*'], regions=paper,
                         notes='Representative child for all five lenses.' if rep else 'Same composition as inbox.all (lens filter only).'))
    for sid, route, key, label, parent, rep in [
        ('inbox.decision-detail', '/production/queue?item=:id', 'inbox-decision-detail', 'DECISION DETAIL', 'inbox.root', True),
        ('inbox.message-thread', '/production/queue?thread=:id', 'inbox-message-thread', 'MESSAGE THREAD', 'inbox.messages', False),
        ('inbox.notice-detail', '/production/queue?notice=:id', 'inbox-system-notice-detail', 'SYSTEM NOTICE DETAIL', 'inbox.system', False),
    ]:
        S.append(surface(sid, 'INBOX', route, f'INBOX · {label}', 'GRANDCHILD', parent, COMP['inbox'], direct=direct[key], distinct=rep,
                         inherits=None if rep else 'inbox.decision-detail', env='ENV-WORKSPACE-PAPER', priority='P2' if rep else 'P3', vrc=True, actions=['LIVE_CODE'],
                         authority={'primary': amap_ids(amap, route, 'mobile_authority'), 'desktop_tablet': 'U-01 — IBX2 desktop/tablet pairs exist only as OpenArt CDN URLs (not accessed); runtime governs', 'rule': 'IBX2 06–08 (mobile exact).'},
                         icons=['ia.*'], regions=paper))
    for sid, label, level, parent, rep, note in [
        ('inbox.inspector', 'INSPECTOR (?sel=) — drawer + scrim on phone / tablet, inline pane on desktop', 'DRAWER', 'inbox.all', True, ''),
        ('inbox.revision-sheet', 'REQUEST REVISION sheet', 'MODAL', 'inbox.decision-detail', True, ''),
        ('inbox.approve-confirm', 'APPROVAL CONFIRMATION sheet (gated until the founder gate opens)', 'MODAL', 'inbox.decision-detail', False, 'GATED: the APPROVE action is disabled in the current state, so the sheet cannot be opened; it reuses the revision-sheet pattern.'),
        ('inbox.filter-sheet', 'FILTER / SORT sheet (phone / tablet; inline filters on desktop)', 'DRAWER', 'inbox.all', True, ''),
        ('inbox.attachment-preview', 'ATTACHMENT PREVIEW', 'OVERLAY', 'inbox.decision-detail', True, ''),
    ]:
        S.append(surface(sid, 'INBOX', '/production/queue (in-route)', f'INBOX · {label}', level, parent, COMP['inbox'], distinct=rep, inherits=None if rep else 'inbox.revision-sheet',
                         status='RUNTIME_ACTIVE', env='ENV-WORKSPACE-PAPER', priority='P2' if rep else 'P3', vrc=True, actions=['LIVE_CODE'],
                         authority={'primary': ['RUNTIME (NO_RECOVERED_AUTHORITY — U-11)'], 'rule': 'Live presentation preserved; inherits the Inbox shell.'},
                         interaction={'opens': 'in-route', 'closes': 'Escape / scrim', 'verified': 'interaction QA 51/51 (FULL-AUTHORITY OPUS2) + this sprint at 393×852'},
                         icons=['ia.*'], regions=paper, notes=note))
    S.append(surface('inbox.empty', 'INBOX', '/production/queue (empty lists)', 'INBOX · EMPTY STATES (e.g. NOTHING RESOLVED YET)', 'STATE', 'inbox.root', COMP['inbox'], status='RUNTIME_ACTIVE',
                     inherits='inbox.root', env='ENV-WORKSPACE-PAPER', priority='P3', vrc=True, actions=['LIVE_CODE'], authority={'primary': ['RUNTIME'], 'rule': 'Typographic empty rows; no illustration.'}, regions=paper))

    # DESIGN ---------------------------------------------------------------------------------------
    modes = ['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']
    par3v = {'brand': '02_DESIGN_BRAND', 'experience': '03_DESIGN_EXPERIENCE', 'surfaces': '04_DESIGN_SURFACES', 'compiler': '05_DESIGN_COMPILER', 'assets': '06_DESIGN_ASSETS', 'viewport': '07_DESIGN_VIEWPORT'}
    for m in modes:
        route = f'/production/:slug/design?mode={m}'
        vp = m == 'viewport'
        S.append(surface(
            f'design.{m}', 'DESIGN', route, f'DESIGN · {m.upper()} mode' + (' (default for /design)' if m == 'brand' else ''), 'PARENT', None, COMP['design'],
            direct=direct[f'design-{m}'], distinct=True, env='ENV-VIEWPORT-CORRIDOR' if vp else 'ENV-ATRIUM', priority='P0', vrc=False,
            authority={'primary': amap_ids(amap, route, 'mobile_authority') + amap_ids(amap, route, 'tablet_authority') + amap_ids(amap, route, 'desktop_authority'), 'compilation': [f'UP:PAR3V:{par3v[m]}.jpg'],
                       'interaction_canonical_not_mounted': amap_ids(amap, route, 'interaction_authority'), 'rule': 'T12 + PAR3V govern the six modes (parent-level operating surfaces). DWS 04 interaction expressions are canonical but not mounted (U-10).'},
            actions=(['REGENERATE_ENVIRONMENT', 'GENERATE_ISOLATED_OBJECT', 'LIVE_CODE'] if vp else ['REGENERATE_ENVIRONMENT', 'GENERATE_ISOLATED_OBJECT', 'GENERATE_MATERIAL', 'GENERATE_ICON', 'LIVE_CODE']),
            objects=(['OBJ-PIPELINE-STAGES'] if vp else ['OBJ-DESIGN-CORE', 'OBJ-PIPELINE-STAGES', 'OBJ-DEVICE-FRAMES', 'MAT-SWATCH-SET']),
            icons=['nav.design', 'design.pack.*', 'design.stage.*'],
            regions={'SITE00_HOST': HOST, 'PROJECT_BODY': ['project core object', 'ON YOUR TABLE media', 'brand / surface panel contents'] + (['live client app inside the device (iframe)'] if vp else []),
                     'SHARED_WORKSPACE': ['corridor + pedestal' if vp else 'atrium', 'mode tabs', 'suspended panels', 'DESIGN PIPELINE objects', 'ON YOUR TABLE frame'] + (['viewport controls'] if vp else [])},
            notes=('VIEWPORT presets in the runtime: MOBILE 390×844, MOBILE XL 430×932, TABLET 834×1194, DESKTOP 1440×900 (+ SAFE AREA, ORIENTATION, ZOOM). QA presets for Grok: 393×852 / 834×1194 / 1440×900.' if vp else
                   'Chamber miniatures render at the authority scale (U-14).')))
    S.append(surface('design.viewport.preview', 'DESIGN', '/production/:slug/design?mode=viewport', 'DESIGN · VIEWPORT live runtime mount (device stage + client app iframe)', 'PREVIEW', 'design.viewport', COMP['design'],
                     direct=direct['design-viewport'], inherits='design.viewport', env='ENV-VIEWPORT-CORRIDOR', priority='P1', vrc=True, actions=['LIVE_CODE'],
                     authority={'primary': ['UP:T12:Mobile/IMG_5975.jpg', 'UP:T12:Desktop/IMG_5987.jpg'], 'rule': 'Device = CSS frame + iframe (/app/preview/fixture-app-ndxbook in dev, /app/projects/:slug in production).'},
                     regions={'PROJECT_BODY': ['client app'], 'SHARED_WORKSPACE': ['device frame', 'pedestal']}, notes='Never bake a device screen; the client app is live.'))
    for sid, label in [('design.viewport.controls', 'VIEWPORT PRESET / ORIENTATION / ZOOM controls'), ('design.viewport.safe-area', 'SAFE AREA overlay toggle')]:
        S.append(surface(sid, 'DESIGN', '/production/:slug/design?mode=viewport (in-route)', f'DESIGN · {label}', 'STATE', 'design.viewport', COMP['design'], inherits='design.viewport', env='ENV-VIEWPORT-CORRIDOR', priority='P3', vrc=True, actions=['LIVE_CODE'],
                         authority={'primary': ['UP:T12:Desktop/IMG_5987.jpg'], 'rule': 'Live controls.'}, regions={'SHARED_WORKSPACE': ['controls panel']}))
    for sec in ['workspace', 'references', 'assets', 'pages', 'skins', 'history', 'more']:
        route = f'/production/:slug/design/{sec}'
        S.append(surface(f'design.section.{sec}', 'DESIGN', route, f'DESIGN · WORKSPACE SECTION {sec.upper()} (legacy reconstruction bench)', 'CHILD', 'design.brand', COMP['sections'] if sec != 'workspace' else COMP['bench'],
                         direct=f'/production/ndxbook/design/{sec}', status='LEGACY', env='ENV-DESIGN-RECONSTRUCTION-BENCH', priority='P3', vrc=True, actions=['NO_ACTION'],
                         authority={'primary': amap_ids(amap, route, 'mobile_authority') + amap_ids(amap, route, 'desktop_authority'), 'status': 'REFERENCE_ONLY (founder calibration 2026-09-09; pre-production host)', 'rule': 'U-10 — DWS unified workspace successor not mounted on this line.'},
                         regions={'SHARED_WORKSPACE': ['legacy bench']}, notes='VIEWPORT "VALIDATION SHEET / REVIEW STATUS" links to design/workspace.'))

    # EXPERIENCE -----------------------------------------------------------------------------------
    exp_regions = {'SITE00_HOST': HOST, 'PROJECT_BODY': ['NDXBOOK world plates (hero / map / plaza)', 'inhabitant portraits', 'record media'], 'SHARED_WORKSPACE': ['family tabs', 'stat strip + IA icons', 'panels', 'inspector', 'ENTER WORLD / PREVIEW actions']}
    S.append(surface('experience.root', 'EXPERIENCE', '/production/:slug/experience', 'EXPERIENCE · tab root (WORLD operating overview)', 'PARENT', None, COMP['experience'],
                     direct=direct['experience-tab-root'], distinct=True, env='ENV-EXPERIENCE-WORLD', priority='P0', vrc=False, visual_class='PROJECT_VISUAL',
                     authority={'primary': ['UP:EL:02_EXPERIENCE_MOBILE/01_World/01_WORLD_ROOT.jpg', 'UP:EL:01_EXPERIENCE_DESKTOP_TABLET/01_World/01_WORLD_ROOT.jpg'], 'secondary': ['UP:T12:Desktop/IMG_5988.jpg', 'UP:T12:Mobile/IMG_5925.jpg', 'UP:T12:Tablet/IMG_6006.jpg', 'UP:PAR3V:08_EXPERIENCE.jpg'],
                                'rule': 'U-07 (founder decision pending): EL body governs (priority 1); T12/PAR3V 08 = environment language of the world hero only (priority 2).'},
                     actions=['REGENERATE_ENVIRONMENT', 'LIVE_CODE'], icons=['ia.*', 'nav.experience'], regions=exp_regions,
                     notes='Runtime renders the WORLD family root here. One GROK1 city plate (experience.worldHero) stands in for every family view.'))
    fam_rep = {'world': ['architecture', 'detail'], 'access': ['conditional']}
    for f in rm['experience']['families']:
        fam = f['id']
        for r in [x for x in rm['experience']['routes'] if x['family'] == fam]:
            root = r['kind'] == 'root'
            sid = f'experience.{fam}' if root else f'experience.{fam}.{r["id"]}'
            route = f'/production/:slug/experience/{r["path"]}' + ('/:id' if r.get('param') else '')
            key = f'experience-{fam}-{r["id"]}'
            amr = amap.get(route) or {}
            rep_root = root and fam != 'world'
            rep_child = r['id'] in fam_rep.get(fam, [])
            distinct = rep_root or rep_child
            S.append(surface(
                sid, 'EXPERIENCE', route, f'EXPERIENCE · {f["title"]}' + ('' if root else f' · {r["label"]}'), 'CHILD' if root else 'GRANDCHILD',
                'experience.root' if root else f'experience.{fam}', COMP['experience'], direct=direct.get(key), distinct=distinct,
                inherits=None if distinct else ('experience.root' if root else (f'experience.{fam}' if fam != 'world' else 'experience.root')),
                env='ENV-EXPERIENCE-WORLD', priority='P1' if root else ('P2' if rep_child else 'P3'), vrc=False, visual_class='PROJECT_VISUAL',
                authority={'primary': (amr.get('mobile_authority') or [])[:1] + (amr.get('desktop_authority') or [])[:1], 'el_stem': r['authority'], 'rule': 'EL LITE (masters URL-only, U-02).'},
                actions=['REGENERATE_ENVIRONMENT', 'LIVE_CODE'] + (['GENERATE_ISOLATED_OBJECT'] if fam in ('access', 'interactions') and (root or rep_child) else []),
                objects=(['OBJ-PORTAL-GATE'] if fam == 'access' and (root or rep_child) else ['OBJ-PORTAL-GATE', 'OBJ-INTERACTION-OBJECT-SET'] if fam == 'interactions' and root else []),
                icons=['ia.*'], regions=exp_regions,
                notes=('Same screen as the tab root.' if fam == 'world' and root else 'Plate: ' + {'world': 'PLATE-WORLD-SPHERE / ARCHIPELAGO-MAP / SPIRE / AURORA-CITY', 'zones': 'PLATE-WORLD-ARCHIPELAGO-MAP (+ CENTRAL-PLAZA for detail)', 'paths': 'PLATE-WORLD-ARCHIPELAGO-MAP (route lines live)', 'interactions': 'PLATE-WORLD-CENTRAL-PLAZA + OBJ-INTERACTION-OBJECT-SET', 'inhabitants': 'PLATE-WORLD-CENTRAL-PLAZA (portraits = cast media)', 'states': 'PLATE-WORLD-CENTRAL-PLAZA (time-of-day grades optional)', 'access': 'PLATE-WORLD-CENTRAL-PLAZA + OBJ-PORTAL-GATE'}[fam])))
    S.append(surface('experience.inspector', 'EXPERIENCE', '/production/:slug/experience/* ?sel=', 'EXPERIENCE · record INSPECTOR (drawer + scrim on phone)', 'DRAWER', 'experience.root', COMP['experience'],
                     inherits='experience.root', status='RUNTIME_ACTIVE', env='ENV-EXPERIENCE-WORLD', priority='P3', vrc=True, actions=['LIVE_CODE'], visual_class='PROJECT_VISUAL',
                     authority={'primary': ['EL inspector panels (inline on desktop/tablet boards)'], 'rule': 'Live inspector; phones show it as a drawer with a scrim.'}, regions=exp_regions))

    # EXPRESSION -----------------------------------------------------------------------------------
    expr_regions = {'SITE00_HOST': HOST, 'PROJECT_BODY': ['subject / cast / look / frame media (Entry 002 crops, resident receipts)', 'record copy'], 'SHARED_WORKSPACE': ['production floor hero band', 'family tabs', 'journey rail = PRODUCTION FLOORS row + downstream flow rail (FORMAT STUDIO → CONTENT PACKAGE → CAMPAIGN BOARD)', 'panels', 'media inspector']}
    S.append(surface('expression.floor', 'EXPRESSION', '/production/:slug/expression', 'EXPRESSION · PRODUCTION FLOOR (root)', 'PARENT', None, COMP['floor'],
                     direct=direct['expression-production-floor'], distinct=True, env='ENV-PRODUCTION-FLOOR', priority='P0', vrc=False,
                     authority={'primary': ['UP:T12:Mobile/IMG_5957.jpg', 'UP:T12:Tablet/IMG_6007.jpg', 'UP:T12:Desktop/IMG_5989.jpg'], 'compilation': ['UP:PAR3V:09_EXPRESSION.jpg'], 'rule': 'T12 + PAR3V (D-PARENT-NOSCROLL).'},
                     actions=['REGENERATE_ENVIRONMENT', 'LIVE_CODE'], icons=['nav.expression', 'ia.*'], regions=expr_regions,
                     notes='Production floors row: CHARACTER FABRICATION · CAMPAIGN CONCEPTS · CAST + PERFORMANCE · LOOK + WARDROBE · SETS + SCENES · MOTION + FILM (entryways, project media). MAKE IT TRAVEL + ON YOUR TABLE strips. Current plate expression.stageHero is a dark stage → mismatch.'))
    for f in rm['expression']['families']:
        fam = f['id']
        for r in [x for x in rm['expression']['routes'] if x['family'] == fam]:
            root = r['kind'] == 'root'
            sid = f'expression.{fam}' if root else f'expression.{fam}.{r["id"]}'
            route = f'/production/:slug/expression/{r["path"].replace(":param", ":id")}'
            amr = amap.get(route) or {}
            rep = root or (fam == 'casting' and r['id'] == 'actor-profile')
            S.append(surface(
                sid, 'EXPRESSION', route, f'EXPRESSION · {f["title"]}' + ('' if root else f' · {r["label"]}'), 'CHILD' if root else 'GRANDCHILD',
                'expression.floor' if root else f'expression.{fam}', COMP['family'], direct=direct.get(f'expression-{fam}-{r["id"]}'), distinct=rep,
                inherits=None if rep else f'expression.{fam}', env='ENV-PRODUCTION-FLOOR', priority='P1' if root else ('P2' if rep else 'P3'), vrc=False,
                authority={'primary': (amr.get('mobile_authority') or [])[:1] + (amr.get('desktop_authority') or [])[:1], 'expr2_stem': r['authority'], 'rule': 'EXPR2 (CANONICAL for all 40 Expression routes).'},
                interaction={'media_inspector': 'D-EXPR-MEDIA — every primary image opens the in-route inspector'} if root else None,
                actions=['REGENERATE_ENVIRONMENT', 'LIVE_CODE'], icons=['ia.*'], regions=expr_regions,
                notes=('Firewall example: resident media (SITE 00 Studio World resident) vs project character (Entry 002) — both PROJECT_BODY media, never generated here (U-17).' if r['id'] == 'actor-profile' else
                       'Family hero = band crop of PLATE-PRODUCTION-FLOOR; family content is project media + live panels.' if root else '')))
    S.append(surface('expression.media-inspector', 'EXPRESSION', '/production/:slug/expression/* (in-route)', 'EXPRESSION · MEDIA INSPECTOR (provenance caption, step, Escape)', 'INSPECTION', 'expression.floor', COMP['mediaInspector'],
                     inherits='expression.floor', status='RUNTIME_ACTIVE', env='ENV-PRODUCTION-FLOOR', priority='P2', vrc=True, actions=['LIVE_CODE'],
                     authority={'primary': ['D-EXPR-MEDIA (text)'], 'rule': 'Live overlay over project media.'}, regions=expr_regions))
    cf_route = '/production/:slug/expression/character-fabrication'
    S.append(surface('expression.character-fabrication', 'EXPRESSION', cf_route, 'EXPRESSION · CHARACTER FABRICATION (entryway, full-screen chamber)', 'FULL_SCREEN', 'expression.floor', COMP['cf'],
                     direct=direct['expression-character-fabrication'], distinct=True, env='ENV-CF-CHAMBER', priority='P1', vrc=True,
                     authority={'primary': amap_ids(amap, cf_route, 'mobile_authority'), 'rule': 'CF IMG_5414–5429 (mobile only, U-05). Tablet/desktop: runtime keeps the 432 px authority canvas zoomed (U-15).'},
                     actions=['REUSE_EXISTING', 'LIVE_CODE'], objects=['CF-RESIDUAL-SLOTS'], icons=['cf.line.*'],
                     regions={'SITE00_HOST': ['CF host strip (CHARACTER FABRICATION + subject selectors)', 'bottom nav'], 'PROJECT_BODY': ['subject in the pod (SW-017 receipts)', 'actor catalogue portraits', 'wardrobe / look media'], 'SHARED_WORKSPACE': ['chamber environment (Grok family 2026-09-30)', 'station rail', 'station panels']},
                     notes='Chamber plates already Grok-generated and mounted (grok.site00.character-fabrication.*). Only residual slots + icon cleanup remain.'))
    labels = {'identity': 'IDENTITY · ACTOR CATALOGUE', 'body': 'BODY', 'look': 'LOOK · WARDROBE LIBRARY / COMPARE', 'appearance': 'HAIR + MAKEUP', 'character': 'CHARACTER · BEHAVIORAL SKIN', 'performance': 'PERFORMANCE', 'simulation': 'SIMULATION · TESTING GROUND', 'authority': 'AUTHORITY REVIEW'}
    for st, lab in labels.items():
        S.append(surface(f'expression.character-fabrication.{st}', 'EXPRESSION', f'{cf_route} (station state)', f'CHARACTER FABRICATION · {lab}', 'STATE', 'expression.character-fabrication', COMP['cf'],
                         inherits='expression.character-fabrication', env='ENV-CF-CHAMBER', priority='P3', vrc=True, actions=['REUSE_EXISTING', 'LIVE_CODE'],
                         authority={'primary': ['UP:CF:IMG_5414–5429 (station boards)'], 'rule': 'Station state of the chamber; same environment.'}, icons=['cf.line.*'],
                         regions={'PROJECT_BODY': ['subject media'], 'SHARED_WORKSPACE': ['chamber', 'station panel']}))

    # LIBRARY --------------------------------------------------------------------------------------
    lib_regions = {'SITE00_HOST': HOST, 'PROJECT_BODY': ['record thumbnails (live registry assets)', 'character portraits'], 'SHARED_WORKSPACE': ['full-width white archive', 'lifecycle tabs CANONICAL / IN REVIEW / SUPERSEDED / ARCHIVE', 'family tabs', 'inspection band', 'canon vault hero band', 'IA icons']}
    S.append(surface('library.root', 'LIBRARY', '/production/libraries', 'LIBRARY · tab root (AUTHORITIES)', 'PARENT', None, COMP['library'],
                     direct=direct['library-tab-root'], distinct=True, env='ENV-CANON-VAULT', priority='P0', vrc=True,
                     authority={'primary': ['UP:EL:04_LIBRARY_MOBILE/01_Authorities/01_AUTHORITIES_ROOT.jpg', 'UP:EL:03_LIBRARY_DESKTOP_TABLET/01_Authorities/01_AUTHORITIES_ROOT.jpg'], 'secondary': ['UP:T12:Desktop/IMG_5990.jpg', 'UP:T12:Mobile/IMG_5979.jpg', 'UP:T12:Tablet/IMG_6008.jpg', 'UP:PAR3V:10_LIBRARY.jpg'],
                                'rule': 'U-08 (founder decision pending): EL body governs (priority 1); T12/PAR3V 10 canon-vault band = hero language (priority 2, library.canon already matches).'},
                     actions=['REUSE_EXISTING', 'LIVE_CODE'], icons=['ia.*', 'nav.library'], regions=lib_regions,
                     notes='Full-width archive language. Records are the real production registry (live data): RECENT, MOST USED and LINEAGE strips render registry assets.'))
    lib_rep = {'authorities': ['lineage']}
    for f in rm['library']['families']:
        fam = f['id']
        for r in [x for x in rm['library']['routes'] if x['family'] == fam]:
            root = r['kind'] == 'root'
            sid = f'library.{fam}' if root else f'library.{fam}.{r["id"]}'
            route = f'/production/libraries/{r["path"]}' + ('/:id' if r.get('param') else '')
            amr = amap.get(route) or {}
            rep_root = root and fam != 'authorities'
            rep_child = r['id'] in lib_rep.get(fam, [])
            distinct = rep_root or rep_child
            mats = fam == 'materials' and root
            icons_fam = fam == 'icons'
            S.append(surface(
                sid, 'LIBRARY', route, f'LIBRARY · {f["title"]}' + ('' if root else f' · {r["label"]}'), 'CHILD' if root else 'GRANDCHILD',
                'library.root' if root else f'library.{fam}', COMP['library'], direct=direct.get(f'library-{fam}-{r["id"]}'), distinct=distinct,
                inherits=None if distinct else ('library.root' if root or fam == 'authorities' else f'library.{fam}'), env='ENV-CANON-VAULT',
                priority='P1' if root else ('P2' if rep_child else 'P3'), vrc=not mats,
                authority={'primary': (amr.get('mobile_authority') or [])[:1] + (amr.get('desktop_authority') or [])[:1], 'el_stem': r['authority'], 'lifecycle': r.get('lifecycle'), 'rule': 'EL LITE.'},
                actions=(['GENERATE_MATERIAL', 'LIVE_CODE'] if mats else ['GENERATE_ICON', 'LIVE_CODE'] if icons_fam and root else ['REUSE_EXISTING', 'LIVE_CODE'] if root else ['LIVE_CODE']),
                objects=['MAT-SWATCH-SET'] if mats else [], icons=['ia.*'] + (['nav.*', 'design.pack.*', 'project.icons.*'] if icons_fam else []), regions=lib_regions,
                notes=('Same screen as the tab root.' if fam == 'authorities' and root else 'ICONS family displays the live icon inventory; icons/project is EMPTY ("NO PROJECT-SPECIFIC ICONS ARE REGISTERED").' if icons_fam and root else '')))
    S.append(surface('library.inspector', 'LIBRARY', '/production/libraries/* ?sel=', 'LIBRARY · INSPECTION drawer (?sel=; drawer + scrim on phone / tablet)', 'DRAWER', 'library.root', COMP['library'], inherits='library.root', status='RUNTIME_ACTIVE',
                     env='ENV-CANON-VAULT', priority='P3', vrc=True, actions=['LIVE_CODE'], authority={'primary': ['EL inspection band (inline on desktop boards)'], 'rule': 'Live.'}, regions=lib_regions))
    S.append(surface('library.character-image-inspector', 'LIBRARY', '/production/libraries/characters/detail/:id (in-route)', 'LIBRARY · CHARACTER IMAGE INSPECTOR', 'OVERLAY', 'library.characters.detail', COMP['charInspector'], inherits='library.characters', status='RUNTIME_ACTIVE',
                     env='ENV-CANON-VAULT', priority='P3', vrc=True, actions=['LIVE_CODE'], authority={'primary': ['EL character detail'], 'rule': 'Live overlay over project portraits.'}, regions=lib_regions))
    S.append(surface('library.search-filter', 'LIBRARY', '/production/libraries/* (search / filter state)', 'LIBRARY · SEARCH + FILTER state', 'STATE', 'library.root', COMP['library'], inherits='library.root', status='RUNTIME_ACTIVE',
                     env='ENV-CANON-VAULT', priority='P3', vrc=True, actions=['LIVE_CODE'], authority={'primary': ['EL index boards'], 'rule': 'Live.'}, regions=lib_regions))

    # ACTIVITY -------------------------------------------------------------------------------------
    act_regions = {'SITE00_HOST': HOST, 'PROJECT_BODY': ['event subjects / entries'], 'SHARED_WORKSPACE': ['DOMAIN × TIME filter rail / band', 'timeline nodes', 'verb chips', 'inspector', 'IA icons']}
    act_auth = {'primary': ['D-ACTIVITY-FINAL (founder FINAL, text) + RUNTIME composition'], 'reference_only': ['UP:T12:Mobile/IMG_5936.jpg', 'UP:T12:Tablet/IMG_6009.jpg', 'UP:T12:Desktop/IMG_5991.jpg', 'UP:PAR3V:11_ACTIVITY.jpg'],
                'rule': 'T12/PAR3V 11 = density + chip language only; their hero band is retired. Previous mobile scroll defect fixed: the page never scrolls, only the timeline / inspector panes scroll inside.'}
    S.append(surface('activity.root', 'ACTIVITY', '/production/activity', 'ACTIVITY · project memory (DOMAIN × TIME)', 'PARENT', None, COMP['activity'], direct=direct['activity-root-domain-x-time'], distinct=True, status='CANONICAL',
                     env='ENV-WORKSPACE-PAPER', priority='P0', vrc=True, actions=['LIVE_CODE'], authority=act_auth, icons=['ia.*', 'nav.activity', 'activity.verb.*'], regions=act_regions,
                     notes='Desktop: filter rail | timeline | inspector. Tablet: filter band over timeline | inspector (35–40%). Mobile: filter band over the timeline pane; the inspector is a slide-up drawer.'))
    for sid, route, label, level in [
        ('activity.domain', '/production/activity?domain=<DOMAIN>', 'DOMAIN filter (ALL · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · PEOPLE · SYSTEM)', 'STATE'),
        ('activity.range', '/production/activity?range=<today|week|month|all>', 'TIME filter (TODAY · THIS WEEK · THIS MONTH · FULL HISTORY)', 'STATE'),
        ('activity.verb', '/production/activity?verb=<verb>', 'CHANGE filter — CREATED · UPDATED · APPROVED · REVISED · SUPERSEDED · GENERATED · CAST · PUBLISHED · UNLOCKED · BLOCKED · RESOLVED · DEPLOYED', 'STATE'),
        ('activity.legacy-view', '/production/activity?view=blockers|approvals', 'legacy ?view= (resolves to ?verb=)', 'STATE'),
        ('activity.empty', '/production/activity (no matching events)', 'EMPTY state ("NO … ACTIVITY · <RANGE>")', 'STATE'),
    ]:
        S.append(surface(sid, 'ACTIVITY', route, f'ACTIVITY · {label}', level, 'activity.root', COMP['activity'], inherits='activity.root', status='CANONICAL', env='ENV-WORKSPACE-PAPER', priority='P3', vrc=True, actions=['LIVE_CODE'], authority=act_auth, regions=act_regions,
                         icons=['activity.verb.*'] if sid == 'activity.verb' else []))
    S.append(surface('activity.inspector', 'ACTIVITY', '/production/activity?event=:id | ?milestone=:node', 'ACTIVITY · EVENT INSPECTOR (inline on tablet / desktop, slide-up drawer on mobile)', 'INSPECTION', 'activity.root', COMP['activity'],
                     direct=direct['activity-inspector-drawer'], distinct=True, status='CANONICAL', env='ENV-WORKSPACE-PAPER', priority='P2', vrc=True, actions=['LIVE_CODE'], authority=act_auth, regions=act_regions,
                     interaction={'opens': 'select an event (?event=)', 'closes': 'drawer close / back', 'verified': 'this sprint at 393×852, 834×1194, 1440×900'}))

    # GLOBAL SHELL (not a tab) ---------------------------------------------------------------------
    for sid, name, level, comp, note in [
        ('shell.host-top', 'SITE 00 HOST · top strip (all Production routes)', 'STATE', COMP['chrome'], 'Mobile: approved 864-coordinate strip (HOSTREF). Tablet/desktop: full-width panel, left cluster, hamburger far right (D-SHELL-CANON).'),
        ('shell.bottom-nav', 'SITE 00 HOST · bottom nav (mobile) / host nav (tablet + desktop, icon-left)', 'STATE', COMP['nav'], '7 tabs: HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY. Glyphs = founder master PNGs; notify dots stay outside the image.'),
        ('shell.menu-panel', 'SITE 00 HOST · menu panel (PRODUCTION HUB · INBOX · CONTROL)', 'OVERLAY', COMP['chrome'], 'Escape / outside press closes.'),
    ]:
        S.append(surface(sid, 'GLOBAL_SHELL', '/production/** (host chrome)', name, level, None, comp, distinct=sid != 'shell.menu-panel', inherits='shell.host-top' if sid == 'shell.menu-panel' else None, status='CANONICAL',
                         env='ENV-HOST-SHELL', priority='P0' if sid == 'shell.bottom-nav' else 'P1', vrc=sid != 'shell.bottom-nav', visual_class='HOST_VISUAL', project_reactive=sid == 'shell.host-top',
                         actions=['GENERATE_ICON', 'LIVE_CODE'] if sid == 'shell.bottom-nav' else ['LIVE_CODE'],
                         authority={'primary': ['UP:HOSTREF:0b60b970-image.jpg (mobile strip)', 'D-SHELL-CANON (tablet / desktop text)'] if sid != 'shell.bottom-nav' else ['founder master PNGs (D-NAV-MASTERS)'], 'rule': 'Screen-authority chrome is not literal (U-09).'},
                         icons=['nav.*'] if sid == 'shell.bottom-nav' else ['host.menu', 'host.dropdown', 'host.reticle'],
                         regions={'SITE00_HOST': ['strip' if sid != 'shell.bottom-nav' else 'nav'], 'PROJECT_BODY': ['project selector thumbnail slot project.<slug>.cover (FIREWALL-01)'] if sid == 'shell.host-top' else []},
                         notes=note))
    return S


# How to reach in-route states (no URL of their own): direct route + the action that opens them.
OPEN = {
    'inbox.inspector': ('/production/queue?view=all&sel=attn.narrative', 'select a row (phones / tablets: drawer + scrim; desktop: inline pane)'),
    'inbox.revision-sheet': ('/production/queue?item=attn.cast', 'press REQUEST REVISION'),
    'inbox.approve-confirm': ('/production/queue?item=attn.cast', 'press APPROVE (disabled until the founder gate opens)'),
    'inbox.filter-sheet': ('/production/queue?view=all', 'press the filter button (phone / tablet)'),
    'inbox.attachment-preview': ('/production/queue?item=attn.cast', 'press an item under RELATED MATERIALS'),
    'inbox.empty': ('/production/queue?view=resolved', 'lists with no records show the typographic empty row'),
    'design.viewport.controls': ('/production/ndxbook/design?mode=viewport', 'change VIEWPORT PRESET / ORIENTATION / ZOOM'),
    'design.viewport.safe-area': ('/production/ndxbook/design?mode=viewport', 'toggle SAFE AREA'),
    'experience.inspector': ('/production/ndxbook/experience/zones/index', 'select a record (?sel=)'),
    'expression.media-inspector': ('/production/ndxbook/expression/casting', 'press any primary image'),
    'library.inspector': ('/production/libraries/assets/index', 'select a tile (?sel=)'),
    'library.character-image-inspector': ('/production/libraries/characters/detail/SW-002', 'press the portrait'),
    'library.search-filter': ('/production/libraries/assets/index', 'type in search / pick filters'),
    'activity.domain': ('/production/activity?domain=PEOPLE&range=all', ''),
    'activity.range': ('/production/activity?range=week', ''),
    'activity.verb': ('/production/activity?verb=blocked&range=all', ''),
    'activity.legacy-view': ('/production/activity?view=blockers', 'resolves to ?verb=blocked'),
    'activity.empty': ('/production/activity?verb=deployed&range=today', 'empty when nothing matches'),
    'shell.host-top': ('/production', 'present on every Production route'),
    'shell.bottom-nav': ('/production', 'present on every Production route'),
    'shell.menu-panel': ('/production', 'press the hamburger (host menu)'),
}


def apply_open(S):
    for s in S:
        if s['surface_id'] in OPEN:
            s['direct_route'], s['open_action'] = OPEN[s['surface_id']]
        elif s['surface_id'].startswith('expression.character-fabrication.'):
            s['direct_route'], s['open_action'] = '/production/ndxbook/expression/character-fabrication', 'pick the station on the station rail'
        elif s['surface_id'].startswith('hub.machine.'):
            s['direct_route'], s['open_action'] = '/production?view=machine', 'legacy chamber interaction (LEGACY_LOCKED)'
        else:
            s.setdefault('open_action', '')
    missing = [s['surface_id'] for s in S if not s['direct_route']]
    if missing:
        raise SystemExit(f'surfaces without a direct route: {missing}')


def link_tree(S):
    by = {s['surface_id']: s for s in S}
    for s in S:
        p = s['parent_id']
        if p and p in by:
            by[p]['child_ids'].append(s['surface_id'])
    for s in S:
        gc = []
        for c in s['child_ids']:
            gc += by[c]['child_ids']
        s['grandchild_ids'] = gc
    missing = [s['surface_id'] for s in S if s['parent_id'] and s['parent_id'] not in by]
    if missing:
        raise SystemExit(f'orphan surfaces: {missing}')
    return by


# ── authority images ────────────────────────────────────────────────────────────────────────────────
class Sources:
    def __init__(self, uploads, inventory, captures, gh_captures, repo):
        inv = json.load(open(inventory))
        self.by = {e['authority_id']: e for e in inv['inventory']}
        self.uploads = uploads
        self.captures = captures
        self.gh = gh_captures
        self.repo = repo

    def auth(self, aid):
        e = self.by.get(aid)
        if not e or not e.get('_disk') or not os.path.exists(e['_disk']):
            raise SystemExit(f'authority not on disk: {aid}')
        return Image.open(e['_disk']), {'authority_id': aid, 'upload_pack': e.get('upload_pack'), 'upload_path': e.get('upload_path'), 'blob': e.get('blob'), 'status': e.get('status'), 'date': e.get('upload_date')}

    def upload(self, rel):
        p = os.path.join(self.uploads, rel)
        return Image.open(p), {'upload_path': rel}

    def live(self, rel):
        p = os.path.join(self.captures, rel)
        return Image.open(p), {'live_capture': f'after16/{rel}', 'sha': '7ec5501d (code-final of FULL-AUTHORITY OPUS2)'}

    def runtime(self, rel):
        p = os.path.join(self.gh, rel)
        return Image.open(p), {'runtime_capture': rel, 'sha': '7ec5501d', 'preset': rel.rsplit('__', 1)[-1].replace('.jpg', '')}


def plan_authorities(pack, src, by, rm):
    """The distinct visual authorities that travel in the pack (≈1280 px long edge, reference only)."""
    T = 'acaacd95-Production_3_Viewports_12_Tabs_SONNET_LITE'
    P3V = 'b0a6f2f1-STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1/STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1/01_THREE_VIEW_BOARDS'

    def add(rel, got, *, role, surfaces, viewport, status='CANONICAL', long_edge=1280, quality=58, note=''):
        im, meta = got
        pack.image(rel, im, meta, long_edge=long_edge, quality=quality, role=role, surfaces=surfaces, viewport=viewport, authority_status=status, note=note)
        for s in surfaces:
            by[s]['pack_files'].append(rel)

    A = 'AUTHORITIES'
    # HUB
    add(f'{A}/HUB/HUB__hub.root__MOBILE__HUBREF.jpg', src.auth('UP:HUBREF:d89b8fd6-image.png'), role='SCREEN_AUTHORITY', surfaces=['hub.root'], viewport='mobile', note='Founder HUB reference (chat image, 2026-10-03). Density benchmark + global atrium language.')
    add(f'{A}/HUB/HUB__hub.root__TABLET__HUBREF.jpg', src.auth('UP:HUBREF:c77b4b50-image.png'), role='SCREEN_AUTHORITY', surfaces=['hub.root'], viewport='tablet-landscape-4:3')
    add(f'{A}/HUB/HUB__hub.root__DESKTOP__HUBREF.jpg', src.auth('UP:HUBREF:0af8bf87-image.png'), role='SCREEN_AUTHORITY', surfaces=['hub.root'], viewport='desktop')
    # INBOX
    add(f'{A}/INBOX/INBOX__inbox.root__MOBILE__T12.jpg', src.auth('UP:T12:Mobile/IMG_5924.jpg'), role='SCREEN_AUTHORITY', surfaces=['inbox.root'], viewport='mobile')
    add(f'{A}/INBOX/INBOX__inbox.root__DESKTOP__T12.jpg', src.auth('UP:T12:Desktop/IMG_5982.jpg'), role='SCREEN_AUTHORITY', surfaces=['inbox.root'], viewport='desktop')
    add(f'{A}/INBOX/INBOX__inbox.all__MOBILE__RUNTIME_FINAL.jpg', src.runtime('inbox.children__mobile.jpg'), role='RUNTIME_AUTHORITY (founder FINAL directive)', surfaces=['inbox.all'], viewport='mobile 393×852', status='RUNTIME_ACTIVE', note='D-INBOX-FINAL: children = rail + rows + inspector.')
    add(f'{A}/INBOX/INBOX__inbox.all__DESKTOP__RUNTIME_FINAL.jpg', src.runtime('inbox.inspector__desktop.jpg'), role='RUNTIME_AUTHORITY (founder FINAL directive)', surfaces=['inbox.all', 'inbox.inspector'], viewport='desktop 1440×900', status='RUNTIME_ACTIVE', note='Inspector inline on desktop (?sel=).')
    add(f'{A}/INBOX/INBOX__inbox.decision-detail__MOBILE__IBX2.jpg', src.auth('UP:IBX2:STUDIOOS_INBOX_AUTHORITY_LITE_v2/01_MOBILE/06_decision-detail.jpg'), role='SCREEN_AUTHORITY', surfaces=['inbox.decision-detail'], viewport='mobile')
    cells = [(lab, src.runtime(f)[0]) for lab, f in [('INSPECTOR DRAWER (?sel=)', 'inbox.inspector__mobile.jpg'), ('REQUEST REVISION SHEET', 'inbox.revision-sheet__mobile.jpg'), ('ATTACHMENT PREVIEW', 'inbox.attachment-preview__mobile.jpg'), ('FILTER / SORT SHEET', 'inbox.filter-sheet__mobile.jpg')]]
    b = board(cells, cols=4, cell_w=300, title='INBOX · INTERACTION SURFACES · RUNTIME 393×852', sub='NO_RECOVERED_AUTHORITY (U-11) — live presentation governs; APPROVAL CONFIRMATION is gated (disabled) and reuses this sheet pattern. REFERENCE ONLY.')
    add(f'{A}/INBOX/INBOX__inbox.interaction-sheets__MOBILE__RUNTIME_BOARD.jpg', (b, {'runtime_capture': 'inbox.{inspector,revision-sheet,attachment-preview,filter-sheet}__mobile.jpg', 'sha': '7ec5501d'}), role='RUNTIME_AUTHORITY_BOARD', surfaces=['inbox.inspector', 'inbox.revision-sheet', 'inbox.filter-sheet', 'inbox.attachment-preview'], viewport='mobile 393×852', status='RUNTIME_ACTIVE', long_edge=1400, quality=60)
    # DESIGN
    for m, f in [('brand', '02_DESIGN_BRAND'), ('experience', '03_DESIGN_EXPERIENCE'), ('surfaces', '04_DESIGN_SURFACES'), ('compiler', '05_DESIGN_COMPILER'), ('assets', '06_DESIGN_ASSETS'), ('viewport', '07_DESIGN_VIEWPORT')]:
        add(f'{A}/DESIGN/DESIGN__design.{m}__3VIEW__PAR3V.jpg', src.upload(f'{P3V}/{f}.jpg'), role='THREE_VIEW_AUTHORITY (desktop 16:9 · tablet 4:3 · mobile 9:19.5)', surfaces=[f'design.{m}'], viewport='desktop+tablet+mobile', long_edge=1600, quality=60, note='Founder compilation of T12 (PARENT_3VIEW v1).')
    add(f'{A}/DESIGN/DESIGN__design.brand__MOBILE__T12.jpg', src.auth('UP:T12:Mobile/IMG_5968.jpg'), role='SCREEN_AUTHORITY', surfaces=['design.brand'], viewport='mobile')
    add(f'{A}/DESIGN/DESIGN__design.viewport__MOBILE__T12.jpg', src.auth('UP:T12:Mobile/IMG_5975.jpg'), role='SCREEN_AUTHORITY', surfaces=['design.viewport', 'design.viewport.preview'], viewport='mobile')
    # EXPERIENCE
    EL = 'UP:EL:'
    add(f'{A}/EXPERIENCE/EXPERIENCE__experience.root__MOBILE__EL.jpg', src.auth(EL + '02_EXPERIENCE_MOBILE/01_World/01_WORLD_ROOT.jpg'), role='SCREEN_AUTHORITY', surfaces=['experience.root'], viewport='mobile')
    add(f'{A}/EXPERIENCE/EXPERIENCE__experience.root__DESKTOP-TABLET__EL.jpg', src.auth(EL + '01_EXPERIENCE_DESKTOP_TABLET/01_World/01_WORLD_ROOT.jpg'), role='SCREEN_AUTHORITY (desktop 16:9 + tablet 4:3)', surfaces=['experience.root'], viewport='desktop+tablet')
    exp_boards = {'zones': '02_Zones/01_ZONES_ROOT', 'paths': '03_Paths/01_PATHS_ROOT', 'interactions': '04_Interactions/01_INTERACTIONS_ROOT', 'inhabitants': '05_Inhabitants/01_INHABITANTS_ROOT', 'states': '06_States/01_STATES_ROOT', 'access': '07_Access/01_ACCESS_ROOT'}
    for fam, stem in exp_boards.items():
        aid = _find(src, EL + f'01_EXPERIENCE_DESKTOP_TABLET/{stem}')
        add(f'{A}/EXPERIENCE/EXPERIENCE__experience.{fam}__DESKTOP-TABLET__EL.jpg', src.auth(aid), role='SCREEN_AUTHORITY (desktop 16:9 + tablet 4:3)', surfaces=[f'experience.{fam}'], viewport='desktop+tablet')
    for sid, stem in [('experience.world.architecture', '01_World/03_ARCHITECTURE'), ('experience.world.detail', '01_World/06_WORLD_DETAIL'), ('experience.access.conditional', '07_Access/05_CONDITIONAL_ACCESS')]:
        aid = _find(src, EL + f'01_EXPERIENCE_DESKTOP_TABLET/{stem}')
        add(f'{A}/EXPERIENCE/EXPERIENCE__{sid}__DESKTOP-TABLET__EL.jpg', src.auth(aid), role='SCREEN_AUTHORITY (distinct world view / object)', surfaces=[sid], viewport='desktop+tablet')
    # EXPRESSION
    add(f'{A}/EXPRESSION/EXPRESSION__expression.floor__MOBILE__T12.jpg', src.auth('UP:T12:Mobile/IMG_5957.jpg'), role='SCREEN_AUTHORITY', surfaces=['expression.floor'], viewport='mobile')
    add(f'{A}/EXPRESSION/EXPRESSION__expression.floor__DESKTOP__T12.jpg', src.auth('UP:T12:Desktop/IMG_5989.jpg'), role='SCREEN_AUTHORITY', surfaces=['expression.floor'], viewport='desktop')
    EX = 'UP:EXPR2:STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2/'
    # authority stems come from the live route table (expressionRoutes.ts), not hand-typed folder names
    fam_dir = {r['family']: r['authority'] for r in rm['expression']['routes'] if r['kind'] == 'root'}
    for fam, stem in fam_dir.items():
        aid = _find(src, EX + f'02_DESKTOP_TABLET/{stem}')
        add(f'{A}/EXPRESSION/EXPRESSION__expression.{fam}__DESKTOP-TABLET__EXPR2.jpg', src.auth(aid), role='SCREEN_AUTHORITY (desktop 16:9 + tablet 4:3)', surfaces=[f'expression.{fam}'], viewport='desktop+tablet')
    add(f'{A}/EXPRESSION/EXPRESSION__expression.casting__MOBILE__EXPR2.jpg', src.auth(_find(src, EX + '01_MOBILE/02_Casting/00_casting-root')), role='SCREEN_AUTHORITY (family mobile composition rule)', surfaces=['expression.casting'], viewport='mobile',
        note='All 10 Expression families share this mobile grammar: hero band, family tabs, media-first panels.')
    add(f'{A}/EXPRESSION/EXPRESSION__expression.casting.actor-profile__DESKTOP-TABLET__EXPR2.jpg', src.auth(_find(src, EX + '02_DESKTOP_TABLET/02_Casting/06_actor-profile')), role='SCREEN_AUTHORITY (firewall example)', surfaces=['expression.casting.actor-profile'], viewport='desktop+tablet')
    add(f'{A}/EXPRESSION/EXPRESSION__expression.character-fabrication__MOBILE__CF.jpg', src.auth('UP:CF:IMG_5414.jpeg'), role='SCREEN_AUTHORITY', surfaces=['expression.character-fabrication'], viewport='mobile')
    cells = [(lab, src.auth(f'UP:CF:{f}')[0]) for lab, f in [('BODY · TECHNICAL SCALE', 'IMG_5416.jpeg'), ('LOOK · WARDROBE COMPARE', 'IMG_5419.jpeg'), ('CHARACTER · BEHAVIORAL SKIN', 'IMG_5422.jpeg'), ('AUTHORITY REVIEW', 'IMG_5428.jpeg')]]
    b = board(cells, cols=4, cell_w=330, title='CHARACTER FABRICATION · STATIONS · MOBILE AUTHORITY (CF IMG_5414–5429)', sub='Chamber environment already Grok-generated and mounted (2026-09-30). REFERENCE ONLY.')
    add(f'{A}/EXPRESSION/EXPRESSION__expression.character-fabrication.stations__MOBILE__CF_BOARD.jpg', (b, {'authority_ids': ['UP:CF:IMG_5416.jpeg', 'UP:CF:IMG_5419.jpeg', 'UP:CF:IMG_5422.jpeg', 'UP:CF:IMG_5428.jpeg']}), role='SCREEN_AUTHORITY_BOARD',
        surfaces=['expression.character-fabrication'], viewport='mobile', long_edge=1280, quality=60)
    # LIBRARY
    add(f'{A}/LIBRARY/LIBRARY__library.root__MOBILE__EL.jpg', src.auth(_find(src, EL + '04_LIBRARY_MOBILE/01_Authorities/01_AUTHORITIES_ROOT')), role='SCREEN_AUTHORITY', surfaces=['library.root'], viewport='mobile')
    add(f'{A}/LIBRARY/LIBRARY__library.root__DESKTOP-TABLET__EL.jpg', src.auth(_find(src, EL + '03_LIBRARY_DESKTOP_TABLET/01_Authorities/01_AUTHORITIES_ROOT')), role='SCREEN_AUTHORITY (desktop 16:9 + tablet 4:3)', surfaces=['library.root'], viewport='desktop+tablet')
    lib_boards = {'assets': '02_Assets/01_ASSETS_ROOT', 'characters': '03_Characters/01_CHARACTERS_ROOT', 'environments': '04_Environments/01_ENVIRONMENTS_ROOT', 'expressions': '05_Expressions/01_EXPRESSIONS_ROOT', 'references': '06_References/01_REFERENCES_ROOT',
                  'icons': '07_Icons/01_ICONS_ROOT', 'materials': '08_Materials/01_MATERIALS_ROOT', 'documents': '09_Documents/01_DOCUMENTS_ROOT', 'archive': '10_Archive/01_ARCHIVE_ROOT'}
    for fam, stem in lib_boards.items():
        aid = _find(src, EL + f'03_LIBRARY_DESKTOP_TABLET/{stem}')
        add(f'{A}/LIBRARY/LIBRARY__library.{fam}__DESKTOP-TABLET__EL.jpg', src.auth(aid), role='SCREEN_AUTHORITY (desktop 16:9 + tablet 4:3)', surfaces=[f'library.{fam}'], viewport='desktop+tablet')
    add(f'{A}/LIBRARY/LIBRARY__library.authorities.lineage__DESKTOP-TABLET__EL.jpg', src.auth(_find(src, EL + '03_LIBRARY_DESKTOP_TABLET/01_Authorities/06_')), role='SCREEN_AUTHORITY (lineage composition)', surfaces=['library.authorities.lineage'], viewport='desktop+tablet')
    # ACTIVITY
    add(f'{A}/ACTIVITY/ACTIVITY__activity.root__MOBILE__RUNTIME_FINAL.jpg', src.runtime('activity.root__mobile.jpg'), role='RUNTIME_AUTHORITY (founder FINAL directive)', surfaces=['activity.root'], viewport='mobile 393×852', status='CANONICAL',
        note='D-ACTIVITY-FINAL one-viewport composition — the previous mobile scroll defect is fixed (page never scrolls).')
    add(f'{A}/ACTIVITY/ACTIVITY__activity.root__DESKTOP__RUNTIME_FINAL.jpg', src.runtime('activity.inspector__desktop.jpg'), role='RUNTIME_AUTHORITY (founder FINAL directive)', surfaces=['activity.root', 'activity.inspector'], viewport='desktop 1440×900', status='CANONICAL')
    add(f'{A}/ACTIVITY/ACTIVITY__activity.inspector__MOBILE__RUNTIME_FINAL.jpg', src.runtime('activity.inspector__mobile.jpg'), role='RUNTIME_AUTHORITY (founder FINAL directive)', surfaces=['activity.inspector'], viewport='mobile 393×852', status='CANONICAL', note='Slide-up drawer inside the workspace.')


def _find(src, prefix):
    hits = sorted(a for a in src.by if a.startswith(prefix))
    if not hits:
        raise SystemExit(f'no authority id with prefix {prefix}')
    return hits[0]


# ── reference + icons ──────────────────────────────────────────────────────────────────────────────
def build_reference(pack, src, rm, repo):
    R = 'REFERENCE'
    T = 'acaacd95-Production_3_Viewports_12_Tabs_SONNET_LITE'
    DWS = 'ac456193-DWS_SONNET_LITE/DWS_SONNET_LITE/05_SYSTEM_PACKS'
    # 1 · environment language board — one crop per environment group, labelled.
    def crop(im, box):
        w, h = im.size
        return im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    hub = src.auth('UP:HUBREF:0af8bf87-image.png')[0].convert('RGB')
    brand = src.auth('UP:T12:Desktop/IMG_5983.jpg')[0].convert('RGB')
    vp = src.auth('UP:T12:Desktop/IMG_5987.jpg')[0].convert('RGB')
    floor = src.auth('UP:T12:Desktop/IMG_5989.jpg')[0].convert('RGB')
    cf = src.auth('UP:CF:IMG_5414.jpeg')[0].convert('RGB')
    exp = src.auth('UP:T12:Desktop/IMG_5988.jpg')[0].convert('RGB')
    lib = src.auth('UP:T12:Desktop/IMG_5990.jpg')[0].convert('RGB')
    world = src.auth(_find(src, 'UP:EL:01_EXPERIENCE_DESKTOP_TABLET/02_Zones/01_ZONES_ROOT'))[0].convert('RGB')
    cells = [
        ('ENV-ATRIUM · HUB band (HUBREF)', crop(hub, (0, 0.07, 1, 0.42))),
        ('ENV-ATRIUM · DESIGN chamber (T12 BRAND)', crop(brand, (0, 0.08, 1, 0.70))),
        ('ENV-VIEWPORT-CORRIDOR (T12 VIEWPORT)', crop(vp, (0, 0.08, 1, 0.70))),
        ('ENV-PRODUCTION-FLOOR (T12 EXPRESSION)', crop(floor, (0, 0.07, 1, 0.36))),
        ('ENV-CF-CHAMBER (CF IMG_5414)', crop(cf, (0, 0.03, 1, 0.38))),
        ('ENV-EXPERIENCE-WORLD · plaza (T12 tab root)', crop(exp, (0, 0.07, 1, 0.62))),
        ('ENV-EXPERIENCE-WORLD · archipelago map (EL ZONES)', crop(world, (0, 0.10, 0.5, 0.55))),
        ('ENV-CANON-VAULT band (T12 LIBRARY)', crop(lib, (0, 0.18, 1, 0.42))),
    ]
    b = board(cells, cols=2, cell_w=780, title='SITE 00 PRODUCTION WORKSPACE · ENVIRONMENT LANGUAGE (one crop per environment group)',
              sub='Luminous white atrium · red ring illumination · suspended boards · central red/black core · bright white production floor. Crops of founder authorities. REFERENCE ONLY — not runtime assets.')
    pack.image(f'{R}/GLOBAL__ENVIRONMENT_LANGUAGE_BOARD.jpg', b, {'derived_from': ['UP:HUBREF:0af8bf87-image.png', 'UP:T12:Desktop/IMG_5983.jpg', 'UP:T12:Desktop/IMG_5987.jpg', 'UP:T12:Desktop/IMG_5989.jpg', 'UP:CF:IMG_5414.jpeg', 'UP:T12:Desktop/IMG_5988.jpg', 'UP:EL:01_EXPERIENCE_DESKTOP_TABLET/02_Zones/01_ZONES_ROOT.jpg', 'UP:T12:Desktop/IMG_5990.jpg']},
               long_edge=1600, quality=62, role='GLOBAL_VISUAL_AUTHORITY_BOARD', surfaces=[])
    # 2 · DWS asset pack (component / material / environment vocabulary)
    im, meta = src.upload(f'{DWS}/02_ASSET_PACK_AUTHORITY.jpg')
    pack.image(f'{R}/GLOBAL__DWS_ASSET_PACK_AUTHORITY.jpg', im, meta, long_edge=1600, quality=70, role='SYSTEM_PACK_AUTHORITY (DWS 05 · panels, drawers, buttons, tabs, review cards, pipeline, devices, environment plates, materials, utility widgets)', surfaces=[])
    # 3 · host shell board — HOSTREF strip + runtime host at the three presets + menu panel.
    def top(img, frac):
        return img.crop((0, 0, img.width, int(img.height * frac)))
    def bottom(img, frac):
        return img.crop((0, int(img.height * (1 - frac)), img.width, img.height))
    hostref = src.auth('UP:HOSTREF:0b60b970-image.jpg')[0]
    m = Image.open(os.path.join(src.gh, 'hub.root__mobile.jpg'))
    t = Image.open(os.path.join(src.gh, 'hub.root__tablet.jpg'))
    d = Image.open(os.path.join(src.gh, 'hub.root__desktop.jpg'))
    menu = Image.open(os.path.join(src.gh, 'shell.menu-panel__mobile.jpg'))
    cells = [('MOBILE HOST STRIP · FOUNDER (HOSTREF 2026-10-03)', hostref), ('MOBILE HOST STRIP · RUNTIME 393', top(m, 0.075)), ('MOBILE BOTTOM NAV · RUNTIME 393 (founder master glyphs)', bottom(m, 0.08)),
             ('TABLET HOST · RUNTIME 834 (D-SHELL-CANON)', top(t, 0.045)), ('TABLET HOST NAV · RUNTIME 834 (icon-left)', bottom(t, 0.045)),
             ('DESKTOP HOST · RUNTIME 1440 (D-SHELL-CANON)', top(d, 0.07)), ('DESKTOP HOST NAV · RUNTIME 1440 (icon-left)', bottom(d, 0.07)), ('MENU PANEL · RUNTIME 393', menu.crop((0, 0, menu.width, int(menu.height * 0.42))))]
    b = board(cells, cols=1, cell_w=1200, title='SITE00_HOST · host strip + navigation (same on every project)', sub='Mobile strip = founder HOSTREF. Tablet/desktop = D-SHELL-CANON text (full-width panel, left cluster, hamburger far right, nav icon-left); screen-authority chrome is NOT literal. FIREWALL-01: the selector thumbnail is a project slot.')
    pack.image(f'{R}/HOST__SHELL_AUTHORITY_BOARD.jpg', b, {'derived_from': ['UP:HOSTREF:0b60b970-image.jpg', 'hub.root__mobile.jpg', 'hub.root__tablet.jpg', 'hub.root__desktop.jpg', 'shell.menu-panel__mobile.jpg']},
               long_edge=1400, quality=64, role='HOST_SHELL_AUTHORITY_BOARD', surfaces=['shell.host-top', 'shell.bottom-nav', 'shell.menu-panel'])
    # 4 · portrait tablet 834×1194 (no founder board — T12 tablets are 4:3 landscape)
    order = ['hub.root', 'inbox.root', 'design.brand', 'design.viewport', 'experience.root', 'expression.floor', 'library.root', 'activity.root', 'expression.character-fabrication']
    cells = [(k.upper(), Image.open(os.path.join(src.gh, f'{k}__tablet.jpg'))) for k in order]
    b = board(cells, cols=5, cell_w=300, title='TABLET PORTRAIT 834×1194 · RUNTIME COMPOSITIONS (crop rules for portrait tablets)', sub='No founder board exists for portrait tablets (T12 tablets are 4:3 landscape). These runtime frames show where plates crop. 0 px page scroll on all. REFERENCE ONLY.')
    pack.image(f'{R}/RUNTIME__TABLET_PORTRAIT_834x1194_BOARD.jpg', b, {'runtime_captures': [f'{k}__tablet.jpg' for k in order], 'sha': '7ec5501d'}, long_edge=1600, quality=58, role='RUNTIME_RESPONSIVE_REFERENCE', surfaces=order)
    # 5 · current runtime plates (what exists, what Grok replaces)
    verdict = {
        'hub.hero.mobile': 'REPLACE ← PLATE-ATRIUM-MASTER crop', 'hub.hero.tablet': 'REPLACE ← PLATE-ATRIUM-MASTER crop', 'hub.hero.desktop': 'REPLACE ← PLATE-ATRIUM-MASTER crop',
        'design.atrium': 'REPLACE ← PLATE-ATRIUM-MASTER', 'design.core': 'REPLACE ← OBJ-DESIGN-CORE', 'design.viewportCorridor': 'REPLACE ← PLATE-VIEWPORT-CORRIDOR',
        'expression.stageHero': 'REPLACE ← PLATE-PRODUCTION-FLOOR (mismatch)', 'experience.worldHero': 'SPLIT ← 5 PLATE-WORLD-* (project-keyed)',
        'library.canon': 'KEEP', 'library.geometry.01': 'KEEP', 'library.geometry.02': 'KEEP', 'library.geometry.03': 'KEEP', 'hub.crystal': 'UNUSED (superseded)',
        'design.board.brand': 'KEEP (P3 re-light)', 'design.board.experience': 'KEEP (P3 re-light)', 'design.board.surfaces': 'KEEP (P3 re-light)', 'design.board.compiler': 'KEEP (P3 re-light)', 'design.board.assets': 'KEEP (P3 re-light)', 'design.board.viewport': 'KEEP (P3 re-light)',
    }
    cells = []
    for a in rm['production_assets']:
        if a['assetId'] in verdict:
            p = os.path.join(repo, a['repoPath'])
            im = Image.open(p).convert('RGBA')
            bg = Image.new('RGBA', im.size, (230, 230, 234, 255)); bg.alpha_composite(im)
            cells.append((f"{a['assetId']} {im.size[0]}×{im.size[1]} · {verdict[a['assetId']]}", bg.convert('RGB')))
    pk = os.path.join(repo, 'public/site00/production-authority-assets/design-pack')
    for rel, label in [('plates/main-atrium.jpg', 'design-pack main-atrium 278×168 · REPLACE ← ATRIUM crop'), ('plates/crop-01.jpg', 'design-pack crop-01 90×73 · REPLACE ← ATRIUM crop'), ('stages/01-intelligence.png', 'design-pack stage 76×76 · REPLACE ← OBJ-PIPELINE-STAGES'), ('devices/desktop.png', 'design-pack device 225×170 · REPLACE ← OBJ-DEVICE-FRAMES'), ('swatches/chrome.jpg', 'design-pack swatch 79×41 · REPLACE ← MAT-SWATCH-SET')]:
        im = Image.open(os.path.join(pk, rel)).convert('RGBA'); bg = Image.new('RGBA', im.size, (230, 230, 234, 255)); bg.alpha_composite(im)
        cells.append((label, bg.convert('RGB')))
    b = board(cells, cols=4, cell_w=380, title='CURRENT RUNTIME PLATES · production-authority-assets (what exists → Grok verdict)', sub='Thumbnails only. Full files live in the repo at public/site00/production-authority-assets/ (paths in PRODUCTION_WORKSPACE_ENVIRONMENT_GROUPS.json).')
    pack.image(f'{R}/RUNTIME__CURRENT_PLATES_CONTACT_SHEET.jpg', b, {'repo': 'public/site00/production-authority-assets/**'}, long_edge=1600, quality=60, role='CURRENT_ASSET_INVENTORY_SHEET', surfaces=[])


def node_icons(repo):
    src = open(os.path.join(repo, 'src/site00/components/productionAuthority/HubBody.tsx'), encoding='utf-8').read()
    block = src[src.index('function NodeIcon'):src.index('return (', src.index('function NodeIcon'))]
    out = {}
    for m in re.finditer(r'(\w+): \(\s*<>(.*?)</>\s*\)', block, re.S):
        body = m.group(2).replace('{...p}', 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"')
        out[m.group(1)] = f'<svg viewBox="0 0 32 32" width="48" height="48">{body}</svg>'
    return out


def build_icon_files(pack, src, rm, repo, scratch):
    I = 'ICONS'
    masters = os.path.join(repo, 'src/site00/components/productionHub/bottom-nav/masters')
    order = ['01_HUB', '02_INBOX', '03_DESIGN', '04_EXPERIENCE', '05_EXPRESSION', '06_LIBRARY', '07_ACTIVITY']
    hub_master, hub_blob = git_blob_image(repo, HUB_MASTER_BLOB)
    glyphs = {}
    for o in order:
        im = hub_master if o == '01_HUB' else Image.open(os.path.join(masters, f'{o}.png'))
        glyphs[o] = im.convert('RGBA')
        src_note = f'git {HUB_MASTER_BLOB} (blob {hub_blob[:10]}) — founder pavilion master; runtime file is a 48 px substitute' if o == '01_HUB' else f'src/site00/components/productionHub/bottom-nav/masters/{o}.png'
        pack.png(f'{I}/NAV_MASTERS/{o}__FOUNDER_MASTER.png', glyphs[o], {'source': src_note}, role='INDIVIDUAL_ICON_AUTHORITY (bottom nav, founder master)', surfaces=['shell.bottom-nav'], colors=96)
    # sheet: 7 masters on white with labels and the notify-dot rule
    cell = 210
    sheet = Image.new('RGB', (7 * cell + 20, cell + 92), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    d.text((10, 8), 'BOTTOM NAV · FOUNDER MASTER FAMILY (CANONICAL) — order HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY', font=font(14, True), fill=(18, 18, 22))
    d.text((10, 28), 'Black line + red accent + soft grey planes. Notify dots / counts stay OUTSIDE the glyph (live). HUB = pavilion (git 43611fd8) — the runtime file is a 48 px house substitute.', font=font(11), fill=(110, 110, 118))
    for i, o in enumerate(order):
        g = glyphs[o].copy(); g.thumbnail((cell - 40, cell - 40), Image.LANCZOS)
        bg = Image.new('RGBA', g.size, (255, 255, 255, 255)); bg.alpha_composite(g)
        x = 10 + i * cell + (cell - g.width) // 2
        sheet.paste(bg.convert('RGB'), (x, 50 + (cell - 40 - g.height) // 2))
        d.text((10 + i * cell + 8, cell + 64), o.split('_', 1)[1] + (' (PAVILION)' if o == '01_HUB' else ''), font=font(12, True), fill=(196, 18, 30) if o == '01_HUB' else (40, 40, 44))
    pack.png(f'{I}/NAV__FOUNDER_MASTERS_AUTHORITY_SHEET.png', sheet, {'derived_from': ['bottom-nav/masters/02–07', HUB_MASTER_BLOB]}, role='ICON_AUTHORITY_SHEET (bottom nav / workspace tab icons)', surfaces=['shell.bottom-nav'], colors=128)
    # superseded contrast: V1 line family + the 48 px substitute + the unreferenced 512 keyed set
    v1, v1blob = git_blob_image(repo, NAV_V1_SHEET_BLOB)
    sub = Image.open(os.path.join(masters, '01_HUB.png')).convert('RGB').resize((96, 96), Image.NEAREST)
    cells = [('SUPERSEDED · BOTTOM_NAV_ICON_FAMILY_V1 line glyphs (seen inside screen authorities)', v1.convert('RGB').crop((0, int(v1.height * 0.30), v1.width, int(v1.height * 0.72)))), ('GENERIC SUBSTITUTE · current runtime masters/01_HUB.png (48×48 pack house, shown ×2)', sub)]
    b = board(cells, cols=2, cell_w=640, title='DO NOT USE · superseded nav glyphs (contrast only)', sub='The founder master family (NAV__FOUNDER_MASTERS_AUTHORITY_SHEET.png) supersedes both. Screen-authority nav bars are not literal.')
    pack.image(f'{I}/NAV__SUPERSEDED_CONTRAST__DO_NOT_USE.jpg', b, {'derived_from': [NAV_V1_SHEET_BLOB + f' (blob {v1blob[:10]})', 'src/site00/components/productionHub/bottom-nav/masters/01_HUB.png']}, long_edge=1400, quality=70, role='LINEAGE_CONTRAST (superseded)', authority_status='SUPERSEDED', surfaces=[])
    # DWS icon pack authority (canonical functional icon vocabulary)
    im, meta = src.upload('ac456193-DWS_SONNET_LITE/DWS_SONNET_LITE/05_SYSTEM_PACKS/01_ICON_PACK_AUTHORITY.jpg')
    pack.image(f'{I}/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg', im, meta, long_edge=1600, quality=80, role='ICON_PACK_AUTHORITY (DWS 05 · 01 NAVIGATION, 02 MODE, 03 PIPELINE, 04 OBJECT, 05 ACTION, 06 STATUS, 07 REVIEW, 08 GEOMETRY)', surfaces=[])
    # runtime line icons (current sources), rendered from the live components
    nodes = node_icons(repo)
    used_host = {'IcMenu', 'IcChevD', 'Reticle'}
    groups = [
        ('IA LINE ICONS · iaKit.tsx (INBOX · ACTIVITY · EXPERIENCE · LIBRARY) — current_source', [(f"ia.{i['name']}", i['svg']) for i in rm['ia_icons']]),
        ('HUB PROJECT-COMPONENT ICONS · HubBody.tsx NodeIcon — current_source', [(f'hub.node.{k}', v) for k, v in nodes.items()]),
        ('HOST CHROME ICONS · productionHub/icons.tsx (menu · dropdown · ITEMS NEED YOU reticle)', [(f"host.{h['name']}", h['svg']) for h in rm['host_icons'] if h['name'] in used_host]),
        ('GENERIC LINE SET · productionHub/icons.tsx (Character Fabrication stations + legacy machine)', [(f"cf.line.{h['name']}", h['svg']) for h in rm['host_icons'] if h['name'] not in used_host]),
    ]
    html = ['<html><head><meta charset="utf-8"><style>body{font:12px DejaVu Sans,Arial;margin:16px;background:#fff;color:#141414}h1{font-size:17px;margin:0 0 4px}p{color:#666;margin:0 0 12px}h2{font-size:13px;color:#c4121e;margin:16px 0 8px}',
            '.g{display:grid;grid-template-columns:repeat(12,1fr);gap:10px}.c{border:1px solid #e3e3e8;border-radius:6px;padding:10px 4px 6px;text-align:center}.c svg{width:44px;height:44px;color:#141414}.c b{display:block;font-size:9.5px;margin-top:6px;word-break:break-all}</style></head><body>',
            '<h1>RUNTIME LINE ICONS · CURRENT SOURCES (live SVG)</h1><p>Rendered from the live components at 7ec5501d. Canonical vocabulary = ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg (black line + red accent). Grok cleans these to that vocabulary and returns SVG (DWS rule: prefer live SVG for functional icons).</p>']
    for title, items in groups:
        html.append(f'<h2>{title}</h2><div class="g">')
        for name, s in items:
            html.append(f'<div class="c">{s}<b>{name}</b></div>')
        html.append('</div>')
    html.append('</body></html>')
    hp = os.path.join(scratch, 'runtime-icons.html')
    open(hp, 'w').write(''.join(html))
    png = os.path.join(scratch, 'runtime-icons.png')
    subprocess.run(['node', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'render-html.mjs'), hp, png, '1500'], check=True, cwd=repo)
    pack.png(f'{I}/RUNTIME__LINE_ICONS_CURRENT.png', Image.open(png), {'rendered_from': ['src/site00/components/productionAuthority/iaKit.tsx', 'src/site00/components/productionAuthority/HubBody.tsx (NodeIcon)', 'src/site00/components/productionHub/icons.tsx']},
             role='CURRENT_ICON_SOURCES_SHEET', surfaces=[], colors=64, authority_status='RUNTIME_ACTIVE')
    # design-pack extracted icons/objects as mounted (tiny) — shows what Grok regenerates
    pk = os.path.join(repo, 'public/site00/production-authority-assets/design-pack')
    items = [(f'design.pack.{i}', os.path.join(pk, 'icons', f'{i}.png')) for i in rm['design_pack']['icons']] + [(f"design.stage.{s['id']}", os.path.join(repo, 'public', s['src'].lstrip('/'))) for s in rm['design_pack']['stages']]
    cells = []
    for name, p in items:
        im = Image.open(p).convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
        cells.append((f"{name.replace('design.pack.', '').replace('design.', '')} · {im.size[0]} px", bg.convert('RGB').resize((im.size[0] * 2, im.size[1] * 2), Image.NEAREST)))
    b = board(cells, cols=9, cell_w=150, title='DESIGN PACK · EXTRACTED ICONS + STAGE OBJECTS AS MOUNTED (exact sheet crops at 48–76 px, shown ×2)', sub='Correct shapes, unusable resolution → regenerate clean from ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg (§01 · §03 · §04). Labels: nav-* / object-* = design.pack.<id>; stage.* = design.stage.<id>.')
    pack.image(f'{I}/RUNTIME__DESIGN_PACK_EXTRACTED_CURRENT.jpg', b, {'repo': 'public/site00/production-authority-assets/design-pack/{icons,stages}'}, long_edge=1400, quality=72, role='CURRENT_ICON_SOURCES_SHEET', authority_status='RUNTIME_ACTIVE', surfaces=[])
    return hub_blob


# ── icon inventory ─────────────────────────────────────────────────────────────────────────────────
DWS_MAP = {
    'search': '§01 SEARCH', 'filter': '§05 / §01 (filter: no exact cell — derive from SEARCH weight)', 'check': '§06 SUCCESS / §07 APPROVE', 'alert': '§06 WARNING', 'clock': '§07 HISTORY', 'lock': '§07 LOCK', 'link': '§05 LINK', 'chat': '§07 COMMENT',
    'user': '§01 USER', 'cube': '§04 CUBE / SYSTEM', 'layers': '§04 STACK / LAYERS', 'graph': '§04 NETWORK', 'system': '§01 SETTINGS', 'pulse': '§01 ACTIVITY', 'up': '§05 EXPORT', 'more': '§01 MENU (ellipsis variant)',
    'back': '§01 DROPDOWN (chevron, rotated)', 'next': '§01 DROPDOWN (chevron, rotated)', 'calendar': 'MISSING in DWS pack', 'film': 'MISSING in DWS pack', 'flag': 'MISSING in DWS pack', 'mail': '§01 (no cell) — unused', 'at': '§01 (no cell) — unused',
}
IA_PRIORITY = {'check': 'P1', 'alert': 'P1', 'clock': 'P1', 'lock': 'P1', 'search': 'P1', 'filter': 'P1', 'link': 'P2', 'chat': 'P1', 'user': 'P2', 'system': 'P1', 'pulse': 'P2', 'more': 'P2', 'back': 'P1', 'next': 'P1'}


def build_icons(rm, repo, usage, hub_blob):
    recs = []
    nav_routes = ['/production/**']
    concept = {'hub': 'pavilion', 'inbox': 'envelope-tray', 'design': 'composition-planes', 'experience': 'portal', 'expression': 'prism-stage', 'library': 'open-book', 'activity': 'timeline'}
    for i, (nid, label, route) in enumerate(H.NAV, 1):
        hub = nid == 'hub'
        recs.append({
            'icon_id': f'nav.{nid}', 'semantic': f'{label} tab ({concept[nid]})', 'workspace_tab': 'GLOBAL_SHELL', 'routes': nav_routes, 'family': 'BOTTOM_NAV_FOUNDER_MASTERS',
            'classification': ['WORKSPACE-SPECIFIC', 'GENERIC SUBSTITUTE'] if hub else ['WORKSPACE-SPECIFIC'],
            'current_source': f'src/site00/components/productionHub/bottom-nav/masters/0{i}_{label}.png' + (' (48×48 design-pack house glyph, commit 94831d12)' if hub else ''),
            'authority_source': (f'git {HUB_MASTER_BLOB} (blob {hub_blob[:10]}, 384×284 pavilion) → ICONS/NAV_MASTERS/01_HUB__FOUNDER_MASTER.png' if hub else f'ICONS/NAV_MASTERS/0{i}_{label}__FOUNDER_MASTER.png (same file as runtime)'),
            'canonical_status': 'CANONICAL (runtime regression: generic substitute mounted)' if hub else 'CANONICAL',
            'shared_or_distinct': 'DISTINCT (one family)', 'grok_action': 'REUSE_EXISTING — restore the founder pavilion master; optional GENERATE_ICON clean @2x in the master style' if hub else 'REUSE_EXISTING (optional GENERATE_ICON clean @2x only, same drawing)',
            'priority': 'P0', 'render': 'PNG <img> 28 px; active state + notify dot are live CSS'})
    for name, sem, cls, act, pr in [
        ('host.menu', 'host menu (hamburger)', ['GLOBAL SITE 00'], 'GENERATE_ICON — clean to DWS §01 MENU, keep live SVG', 'P0'),
        ('host.dropdown', 'project selector dropdown chevron', ['GLOBAL SITE 00'], 'GENERATE_ICON — clean to DWS §01 DROPDOWN, keep live SVG', 'P0'),
        ('host.reticle', 'ITEMS NEED YOU reticle (attention target)', ['GLOBAL SITE 00'], 'GENERATE_ICON — match HOSTREF reticle (black disc, red crosshair), keep live SVG', 'P0'),
        ('host.notify-dot', 'nav / attention notify dot + count', ['GLOBAL SITE 00'], 'LIVE_CODE (CSS) — no asset', 'P1'),
    ]:
        recs.append({'icon_id': name, 'semantic': sem, 'workspace_tab': 'GLOBAL_SHELL', 'routes': nav_routes, 'family': 'HOST_CHROME', 'classification': cls,
                     'current_source': 'src/site00/components/productionHub/icons.tsx (IcMenu / IcChevD / Reticle) via chrome.tsx' if name != 'host.notify-dot' else 'src/site00/styles/site00-production-host-chrome.css',
                     'authority_source': 'REFERENCE/HOST__SHELL_AUTHORITY_BOARD.jpg (HOSTREF) + ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg §01', 'canonical_status': 'CANONICAL', 'shared_or_distinct': 'SHARED (every Production route)', 'grok_action': act, 'priority': pr, 'render': 'inline SVG'})
    # IA line icons
    tab_of = {'InboxBody.tsx': 'INBOX', 'ExperienceScreen.tsx': 'EXPERIENCE', 'LibraryScreen.tsx': 'LIBRARY', 'RealmKit.tsx': 'EXPERIENCE+LIBRARY', 'ActivityBody.tsx': 'ACTIVITY'}
    for ic in rm['ia_icons']:
        n = ic['name']
        files = usage.get(f'ia.{n}', [])
        tabs = sorted({tab_of.get(os.path.basename(f), 'OTHER') for f in files})
        unused = not files
        recs.append({'icon_id': f'ia.{n}', 'semantic': n, 'workspace_tab': '+'.join(tabs) if tabs else 'NONE', 'routes': ['/production/queue*' if 'INBOX' in tabs else None, '/production/:slug/experience/**' if any('EXPERIENCE' in t for t in tabs) else None, '/production/libraries/**' if any('LIBRARY' in t for t in tabs) else None],
                     'family': 'IA_LINE_SET', 'classification': ['WORKSPACE-SPECIFIC'] + (['MISSING'] if 'MISSING' in DWS_MAP.get(n, '') and not unused else []),
                     'current_source': 'src/site00/components/productionAuthority/iaKit.tsx (stroke 1.6, 32 grid)', 'authority_source': f'ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg {DWS_MAP.get(n, "")}',
                     'canonical_status': 'UNUSED (keep, no work)' if unused else 'RUNTIME_ACTIVE (functional; style not yet aligned to the DWS pack)', 'shared_or_distinct': 'SHARED',
                     'grok_action': 'NO_ACTION' if unused else ('GENERATE_ICON — draw in DWS line style (no pack cell exists)' if 'MISSING' in DWS_MAP.get(n, '') else 'GENERATE_ICON — clean to the DWS cell, deliver SVG (currentColor)'),
                     'priority': 'P3' if unused else IA_PRIORITY.get(n, 'P2'), 'render': 'inline SVG (currentColor)'})
        recs[-1]['routes'] = [r for r in recs[-1]['routes'] if r]
    # HUB component icons
    for n in node_icons(repo):
        recs.append({'icon_id': f'hub.node.{n}', 'semantic': f'project component · {n.upper()}', 'workspace_tab': 'HUB', 'routes': ['/production'], 'family': 'HUB_COMPONENT_TILES', 'classification': ['TAB-SPECIFIC'],
                     'current_source': 'src/site00/components/productionAuthority/HubBody.tsx (NodeIcon, stroke 1.5)', 'authority_source': 'AUTHORITIES/HUB/HUB__hub.root__MOBILE__HUBREF.jpg (PROJECT COMPONENTS tiles)',
                     'canonical_status': 'RUNTIME_ACTIVE', 'shared_or_distinct': 'DISTINCT', 'grok_action': 'GENERATE_ICON — clean line glyph matching the HUBREF tile icons; keep the runtime node ids (no IA change)', 'priority': 'P1', 'render': 'inline SVG'})
    # design pack icons + stages
    for i in rm['design_pack']['icons']:
        nav = i.startswith('nav-')
        recs.append({'icon_id': f'design.pack.{i}', 'semantic': i.split('-', 1)[1].replace('-', ' '), 'workspace_tab': 'DESIGN+LIBRARY', 'routes': ['/production/:slug/design?mode=*', '/production/libraries/icons/**'], 'family': 'DWS_ICON_PACK',
                     'classification': ['WORKSPACE-SPECIFIC'], 'current_source': f'public/site00/production-authority-assets/design-pack/icons/{i}.png (exact sheet crop, 48–64 px)',
                     'authority_source': f'ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg {"§01 NAVIGATION" if nav else "§04 OBJECT / SYSTEM"}', 'canonical_status': 'CANONICAL (low-res crop)', 'shared_or_distinct': 'SHARED',
                     'grok_action': 'GENERATE_ICON — clean transparent ≥512 px from the pack cell', 'priority': 'P2', 'render': 'PNG <img>'})
    for s in rm['design_pack']['stages']:
        recs.append({'icon_id': f"design.stage.{s['id']}", 'semantic': f"pipeline stage · {s['label']}", 'workspace_tab': 'DESIGN', 'routes': ['/production/:slug/design?mode=*'], 'family': 'DWS_PIPELINE_STAGES', 'classification': ['WORKSPACE-SPECIFIC'],
                     'current_source': f"public{s['src']} (76×76 crop)", 'authority_source': 'ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg §02 / §03', 'canonical_status': 'CANONICAL (low-res crop)', 'shared_or_distinct': 'SHARED (6 modes)',
                     'grok_action': 'GENERATE_ISOLATED_OBJECT — 3D stage object ≥1024 px (OBJ-PIPELINE-STAGES)', 'priority': 'P0', 'render': 'PNG <img>'})
    # Character Fabrication generic line set (+ legacy machine-only icons)
    for h in rm['host_icons']:
        n = h['name']
        if n in ('IcMenu', 'IcChevD', 'Reticle'):
            continue
        files = usage.get(n, [])
        cf = any('characterFabrication' in f for f in files)
        legacy = any(re.search(r'productionHub/(machine|overlays|panels|ProductionHub)\.tsx$', f) for f in files)
        status = 'RUNTIME_ACTIVE (generic)' if cf else 'LEGACY_LOCKED' if legacy else 'UNUSED (keep, no work)'
        cls = ['TAB-SPECIFIC', 'GENERIC SUBSTITUTE'] if cf else ['TAB-SPECIFIC'] if legacy else ['WORKSPACE-SPECIFIC']
        recs.append({'icon_id': f'cf.line.{n}', 'semantic': re.sub(r'^Ic', '', n).lower(), 'workspace_tab': '+'.join(x for x, ok in (('EXPRESSION (CF)', cf), ('HUB (legacy machine)', legacy)) if ok) or 'NONE',
                     'routes': (['/production/:slug/expression/character-fabrication'] if cf else []) + (['/production?view=machine'] if legacy else []),
                     'family': 'GENERIC_LINE_SET', 'classification': cls,
                     'current_source': 'src/site00/components/productionHub/icons.tsx (24 grid, stroke 1.6)', 'used_in': files,
                     'authority_source': 'ICONS/WORKSPACE__DWS_ICON_PACK_AUTHORITY.jpg §05 ACTION / §06 STATUS / §07 REVIEW (closest cell)',
                     'canonical_status': status, 'shared_or_distinct': 'SHARED',
                     'grok_action': 'GENERATE_ICON — clean to the DWS pack (SVG)' if cf else 'NO_ACTION', 'priority': 'P2' if cf else 'P3', 'render': 'inline SVG'})
    # Activity verbs (text chips by authority)
    verb_map = {'CREATED': '§05 CREATE', 'UPDATED': '§05 EDIT', 'APPROVED': '§07 APPROVE', 'REVISED': '§07 REVISION', 'SUPERSEDED': 'none', 'GENERATED': '§06 PROCESSING', 'CAST': 'none', 'PUBLISHED': '§05 SHARE', 'UNLOCKED': 'none (inverse of §07 LOCK)', 'BLOCKED': '§06 ERROR', 'RESOLVED': '§06 SUCCESS', 'DEPLOYED': '§05 EXPORT'}
    for v in rm['activity']['verbs']:
        recs.append({'icon_id': f'activity.verb.{v.lower()}', 'semantic': f'event type {v}', 'workspace_tab': 'ACTIVITY', 'routes': ['/production/activity', f'/production/activity?verb={v.lower()}'], 'family': 'ACTIVITY_VERB_CHIPS', 'classification': ['WORKSPACE-SPECIFIC'],
                     'current_source': f'text chip .amx-verb--{v.lower()} (ActivityBody.tsx + site00-production-activity-memory.css)', 'authority_source': f'T12/PAR3V 11 timeline chips (text) · nearest DWS cell if ever needed: {verb_map[v]}',
                     'canonical_status': 'TEXT_CHIP_BY_AUTHORITY', 'shared_or_distinct': 'DISTINCT (chip tone)', 'grok_action': 'NO_ACTION — chips stay text; do not invent event glyphs (DWS-ICON-RULE)', 'priority': 'P1', 'render': 'live CSS chip'})
    # status / lifecycle chips and dots
    for n, sem, tabs in [('status.live-dot', 'live status dot (IN PRODUCTION)', 'HUB+EXPERIENCE'), ('status.urgency-chip', 'urgency chip HIGH / MED', 'HUB+INBOX'), ('status.lifecycle-chip', 'lifecycle CANONICAL / IN REVIEW / SUPERSEDED / ARCHIVE', 'LIBRARY'),
                         ('status.state-chip', 'NEEDS YOU / WATCHING / RESOLVED / LOCKED / BLOCKED', 'INBOX+HUB+EXPRESSION'), ('status.progress-ring', 'progress ring / donut', 'HUB+EXPRESSION')]:
        recs.append({'icon_id': n, 'semantic': sem, 'workspace_tab': tabs, 'routes': ['/production/**'], 'family': 'STATUS_CHIPS', 'classification': ['WORKSPACE-SPECIFIC'], 'current_source': 'live CSS / SVG primitives (primitives.tsx, iaKit.tsx)',
                     'authority_source': 'REFERENCE/GLOBAL__DWS_ASSET_PACK_AUTHORITY.jpg §03 CHIPS · §10 STATUS BADGES / PROGRESS', 'canonical_status': 'CANONICAL', 'shared_or_distinct': 'SHARED', 'grok_action': 'LIVE_CODE — no asset', 'priority': 'P1', 'render': 'live CSS'})
    # project-specific icons (missing by registry)
    recs.append({'icon_id': 'project.icons.*', 'semantic': 'project-specific icon set (NDXBOOK)', 'workspace_tab': 'LIBRARY', 'routes': ['/production/libraries/icons/project'], 'family': 'PROJECT_ICONS', 'classification': ['PROJECT-SPECIFIC', 'MISSING'],
                 'current_source': 'none — realmData icons.project is EMPTY ("NO PROJECT-SPECIFIC ICONS ARE REGISTERED")', 'authority_source': 'EL 03_LIBRARY_DESKTOP_TABLET/07_Icons/07_PROJECT_ICONS (not packed; see AUTHORITIES/LIBRARY/LIBRARY__library.icons__DESKTOP-TABLET__EL.jpg for the family grammar)',
                 'canonical_status': 'MISSING', 'shared_or_distinct': 'DISTINCT (per project)', 'grok_action': 'NO_ACTION in this pass — project icons are PROJECT_BODY content; register per project only when the founder supplies the set', 'priority': 'P2', 'render': 'n/a'})
    recs.append({'icon_id': 'provider.*', 'semantic': 'provider / system marks (OpenArt, Grok, …)', 'workspace_tab': 'NONE', 'routes': [], 'family': 'PROVIDER', 'classification': ['PROVIDER / SYSTEM'],
                 'current_source': 'none mounted — provenance renders as text (SOURCE: OPENART)', 'authority_source': 'none', 'canonical_status': 'NOT_USED', 'shared_or_distinct': 'n/a', 'grok_action': 'NO_ACTION — do not add provider icons', 'priority': 'P3', 'render': 'text'})
    for r in recs:
        r['semantic_key'] = semantic_key(r['icon_id'])
    return recs


SEM = {
    'mail': 'mail', 'alert': 'warning', 'check': 'success', 'clock': 'history', 'calendar': 'calendar', 'up': 'export', 'pulse': 'activity', 'cube': 'cube', 'layers': 'layers', 'link': 'link', 'chat': 'comment',
    'at': 'mention', 'user': 'user', 'lock': 'lock', 'flag': 'flag', 'graph': 'network', 'film': 'film', 'search': 'search', 'filter': 'filter', 'back': 'back', 'next': 'next', 'more': 'more', 'system': 'settings',
    'IcCheck': 'success', 'IcWarn': 'warning', 'IcLock': 'lock', 'IcArrowR': 'next', 'IcArrowL': 'back', 'IcArrowD': 'down', 'IcChevR': 'next', 'IcChevL': 'back', 'IcChevD': 'dropdown', 'IcClose': 'close', 'IcMenu': 'menu',
    'IcSearch': 'search', 'IcFilter': 'filter', 'IcExpand': 'expand', 'IcCompare': 'compare', 'IcInfo': 'info', 'IcZoomIn': 'zoom', 'IcFit': 'fit', 'IcCube': 'cube', 'IcSwap': 'swap', 'IcHome': 'home', 'IcMail': 'mail',
    'IcLeaf': 'leaf', 'IcTriangle': 'triangle', 'IcHex': 'hexagon', 'IcLibrary': 'library', 'IcClock': 'history', 'IcUser': 'user', 'IcShirt': 'wardrobe', 'IcInfinity': 'loop', 'IcPulse': 'activity', 'IcFrames': 'frames',
    'IcMove': 'move', 'IcCam': 'camera', 'IcSet': 'set', 'IcRefresh': 'sync', 'IcPlus': 'create', 'IcTrash': 'delete', 'IcPlay': 'play', 'IcPause': 'pause', 'IcStop': 'stop', 'IcSliders': 'adjust', 'IcPaperclip': 'attachment',
    'IcSkipL': 'skip-back', 'IcSkipR': 'skip-forward', 'IcEye': 'preview', 'IcSave': 'save',
    'nav-hub': 'home', 'nav-work': 'work', 'nav-library': 'library', 'nav-activity': 'activity', 'nav-exit': 'exit', 'nav-menu': 'menu', 'nav-dropdown': 'dropdown', 'nav-search': 'search', 'nav-settings': 'settings', 'nav-user': 'user',
}


def semantic_key(icon_id):
    """Meaning shared across sources (ia.search, cf.line.IcSearch and design.pack.nav-search are one semantic)."""
    if icon_id.startswith('nav.'):
        return 'tab:' + icon_id[4:]
    host = {'host.menu': 'menu', 'host.dropdown': 'dropdown', 'host.reticle': 'attention', 'host.notify-dot': 'notify'}
    if icon_id in host:
        return host[icon_id]
    for pre, tag in (('ia.', None), ('cf.line.', None), ('design.pack.object-', 'object:'), ('design.pack.', None), ('design.stage.', 'stage:'), ('hub.node.', 'component:'), ('activity.verb.', 'event:')):
        if icon_id.startswith(pre):
            name = icon_id[len(pre):]
            return tag + name if tag else SEM.get(name, name)
    return icon_id


def icon_usage(repo, rm):
    """Which component files use which runtime icon (host line set + IA set)."""
    host = [h['name'] for h in rm['host_icons']]
    ia = [i['name'] for i in rm['ia_icons']]
    out = {}
    root = os.path.join(repo, 'src/site00')
    for dp, _, fs in os.walk(root):
        for f in fs:
            if not f.endswith(('.ts', '.tsx')) or '.test.' in f:
                continue
            p = os.path.join(dp, f)
            s = open(p, encoding='utf-8', errors='ignore').read()
            rel = os.path.relpath(p, repo)
            imports_host = bool(re.search(r"from '(\./icons|[./]+productionHub/icons)'", s))
            if imports_host and not rel.endswith('productionHub/icons.tsx'):
                for n in host:
                    if re.search(r'<%s\b|\b%s\b' % (n, n), s.split('\n', 1)[1] if s.count('\n') else s):
                        out.setdefault(n, []).append(rel)
            if 'IaIcon' in s or 'IaIconName' in s:
                for n in ia:
                    if re.search(r"name=\"%s\"|'%s'" % (n, n), s):
                        out.setdefault(f'ia.{n}', []).append(rel)
    return {k: sorted(set(v)) for k, v in out.items()}


# ── manifests ──────────────────────────────────────────────────────────────────────────────────────
def responsive_record(s, by):
    files = s['pack_files']
    vp = lambda tag: [f for f in files if tag in f]
    mob = vp('__MOBILE') or vp('3VIEW')
    tab = vp('__TABLET') or vp('DESKTOP-TABLET') or vp('3VIEW')
    desk = vp('__DESKTOP') or vp('DESKTOP-TABLET') or vp('3VIEW')
    portrait = {'hub.root', 'inbox.root', 'design.brand', 'design.viewport', 'experience.root', 'expression.floor', 'library.root', 'activity.root', 'expression.character-fabrication'}
    parent = s['surface_level'] == 'PARENT'
    rules = {
        'ENV-ATRIUM': 'Atrium master: HUB band crops 3.55:1 (m) / 5:1 (t) / 6.5:1 (d), pedestal at 50% x; Design chamber full master, 9:16 (m) and 3:4 (portrait t) centre crops.',
        'ENV-VIEWPORT-CORRIDOR': 'Corridor: one-point perspective centred on the pedestal; 9:16 (m), 3:4 (portrait t), 16:9 (d).',
        'ENV-PRODUCTION-FLOOR': 'Floor master 21:9: hero bands ≈3.6:1 (m), ≈5:1 (t), ≈6:1 (d); screens stay blank for live media.',
        'ENV-EXPERIENCE-WORLD': 'World plates: hero band ≈3:1 (m) / ≈4.5:1 (d); map plates used near-square inside panels (keep the core centred, edges empty for overlays).',
        'ENV-CANON-VAULT': 'Canon band 1920×823 reused; crop around the pyramid + beam (centre).',
        'ENV-CF-CHAMBER': 'Chamber plates are 9:16 (1080×1920); tablet/desktop centre the 432 px authority canvas (U-15).',
    }
    return {
        'surface_id': s['surface_id'], 'workspace_tab': s['workspace_tab'],
        'mobile_authority': mob or (f"inherits {s['inherits_visual_from']}" if s['inherits_visual_from'] else 'RUNTIME'),
        'tablet_authority': tab or (f"inherits {s['inherits_visual_from']}" if s['inherits_visual_from'] else 'RUNTIME'),
        'desktop_authority': desk or (f"inherits {s['inherits_visual_from']}" if s['inherits_visual_from'] else 'RUNTIME'),
        'tablet_portrait_834x1194': 'REFERENCE/RUNTIME__TABLET_PORTRAIT_834x1194_BOARD.jpg' if s['surface_id'] in portrait else ('runtime (no founder portrait-tablet board)' if parent else 'inherits parent'),
        'mobile_primary': True,
        'structural_recomposition_required': parent or s['surface_level'] in ('CHILD', 'FULL_SCREEN') and s['distinct_visual_authority'],
        'simple_reflow': not (parent or (s['surface_level'] in ('CHILD', 'FULL_SCREEN') and s['distinct_visual_authority'])),
        'environment_crop_rules_known': s['environment_group'] in rules,
        'environment_crop_rule': rules.get(s['environment_group'], 'No plate (live code).'),
        'notes': ('Mobile = REVIEW / JUDGE / RESPOND; tablet = COMPARE / ANNOTATE / DIRECT; desktop = CREATE / ORGANIZE / COMPARE (DWS responsive rule). No device chrome on mobile; keep the top breathing space under the host strip.' if parent else ''),
    }


def write_json(pack, rel, obj):
    pack.text(rel, json.dumps(obj, indent=1, ensure_ascii=False) + '\n')


def main():
    ap = argparse.ArgumentParser()
    for k in ('repo', 'runtime-model', 'uploads', 'inventory', 'captures', 'gh-captures', 'routes-main', 'route-map', 'stage', 'zip', 'docs', 'scratch'):
        ap.add_argument(f'--{k}', required=k not in ('route-map', 'scratch'))
    a = ap.parse_args()
    repo = os.path.abspath(a.repo)
    route_map = a.route_map or os.path.join(repo, 'artifacts/production-full-authority-forensics/route-authority-map.json')
    scratch = a.scratch or os.path.join(a.stage, '..', 'scratch')
    os.makedirs(scratch, exist_ok=True)
    if os.path.exists(a.stage):
        shutil.rmtree(a.stage)
    os.makedirs(a.stage)
    rm = json.load(open(a.runtime_model))
    amap = {r['route']: r for r in json.load(open(route_map))['routes']}
    rmain = json.load(open(a.routes_main))
    S = build_surfaces(rm, amap, rmain)
    apply_open(S)
    by = link_tree(S)
    pack = Pack(a.stage)
    src = Sources(a.uploads, a.inventory, a.captures, a.gh_captures, repo)
    plan_authorities(pack, src, by, rm)
    build_reference(pack, src, rm, repo)
    hub_blob = build_icon_files(pack, src, rm, repo, scratch)
    for rec in pack.files.values():  # reference / icon sheets that serve specific surfaces
        for sid in rec['surfaces']:
            if rec['file'] not in by[sid]['pack_files']:
                by[sid]['pack_files'].append(rec['file'])
    usage = icon_usage(repo, rm)
    icons = build_icons(rm, repo, usage, hub_blob)

    # env membership
    envs = json.loads(json.dumps(H.ENV_GROUPS))
    for e in envs:
        e['member_surfaces'] = [s['surface_id'] for s in S if s['environment_group'] == e['environment_group_id']]
        e['member_count'] = len(e['member_surfaces'])
    tree = {
        'sprint': H.SPRINT, 'workspace_version': H.WORKSPACE_VERSION, 'levels': H.LEVELS, 'regions': H.REGIONS,
        'distinct_rule': 'A descendant carries its own pack authority only when its environment, plate, object, material, depth, icon family or crop changes, or Grok would otherwise guess. Differences that are LIVE layout only (lists, tables, rails, inspectors) inherit the parent authority — Grok never edits layout.',
        'surfaces': S,
    }
    routes = []
    for s in S:
        ctx = 'none (cross-project route; host defaults to ndxbook)' if s['route'].startswith('/production/queue') or s['route'].startswith('/production/libraries') or s['route'].startswith('/production/activity') or s['route'] == '/production' else \
              'project slug (:slug, default ndxbook)' + ('; ?entry=002 for Entry 002 records' if '?entry=002' in (s['direct_route'] or '') else '') + ('; record id' if ':id' in s['route'] else '')
        if s['workspace_tab'] == 'GLOBAL_SHELL':
            ctx = 'every Production route (label follows the slug; thumbnail = project.<slug>.cover — FIREWALL-01)'
        routes.append({
            'workspace_tab': s['workspace_tab'], 'surface_id': s['surface_id'], 'route': s['route'], 'direct_route': s['direct_route'], 'open_action': s['open_action'],
            'design_workspace_route': s['direct_route'] if s['workspace_tab'] == 'DESIGN' and s['surface_level'] in ('PARENT', 'PREVIEW') else None,
            'project_context_requirement': ctx,
            'viewport_support': {'mobile': True, 'tablet': True, 'desktop': True,
                                 'note': 'filter sheet is phone/tablet only (inline filters on desktop)' if s['surface_id'] == 'inbox.filter-sheet' else
                                         'mobile-first canvas; tablet/desktop centre it (no founder board)' if s['surface_id'].startswith('expression.character-fabrication') else ''},
            'runtime_active': s['runtime_active'], 'must_remain_functional': True,
        })
    responsive = [responsive_record(s, by) for s in S if s['distinct_visual_authority']]
    authorities = sorted(pack.files.values(), key=lambda f: f['file'])

    # handoff manifest
    def count(level=None, distinct=None, tab=None):
        return len([s for s in S if (level is None or s['surface_level'] in level) and (distinct is None or s['distinct_visual_authority'] == distinct) and (tab is None or s['workspace_tab'] == tab)])
    totals = {
        'tabs': len(H.TABS),
        'surfaces': len(S),
        'by_tab': {t: count(tab=t) for t in H.TABS + ['GLOBAL_SHELL']},
        'by_level': {lv: count(level=(lv,)) for lv in H.LEVELS},
        'parent': count(level=('PARENT',)),
        'child': count(level=('CHILD',)),
        'grandchild': count(level=('GRANDCHILD',)),
        'interaction_overlay': count(level=('STATE', 'DRAWER', 'MODAL', 'FULL_SCREEN', 'OVERLAY', 'INSPECTION', 'PREVIEW')),
        'distinct_child': len([s for s in S if s['surface_level'] == 'CHILD' and s['distinct_visual_authority']]),
        'distinct_grandchild': len([s for s in S if s['surface_level'] == 'GRANDCHILD' and s['distinct_visual_authority']]),
        'distinct_interaction_overlay': len([s for s in S if s['surface_level'] not in ('PARENT', 'CHILD', 'GRANDCHILD') and s['distinct_visual_authority']]),
        'distinct_visual_authorities': len([s for s in S if s['distinct_visual_authority']]),
        'legacy_surfaces': len([s for s in S if s['canonical_status'] == 'LEGACY']),
        'environment_groups': len(envs),
        'new_plates': sum(len(e['new_plates']) for e in envs),
        'surfaces_new_plate': len([s for s in S if any(e['environment_group_id'] == s['environment_group'] and e['new_plate_required'] for e in envs) and 'REGENERATE_ENVIRONMENT' in s['asset_actions']]),
        'surfaces_reuse_environment': len([s for s in S if any(e['environment_group_id'] == s['environment_group'] and not e['new_plate_required'] and e['environment_group_id'] in ('ENV-CF-CHAMBER', 'ENV-CANON-VAULT') for e in envs)]),
        'isolated_asset_candidates': sum(x['count'] for x in H.ISOLATED_ASSETS),
        'isolated_asset_sets': len(H.ISOLATED_ASSETS),
        'icon_records': len(icons),
        'icon_semantics': len({i['semantic_key'] for i in icons}),
        'icon_authority_packs': len([f for f in pack.files if f.startswith('ICONS/') and 'SUPERSEDED' not in f and 'RUNTIME__' not in f and '/NAV_MASTERS/' not in f]),
        'generic_icon_substitutions': len([i for i in icons if 'GENERIC SUBSTITUTE' in i['classification']]),
        'missing_icons': len([i for i in icons if 'MISSING' in i['classification']]),
        'responsive_authorities': len(responsive),
        'pack_authority_images': len([f for f in pack.files if f.startswith('AUTHORITIES/')]),
    }
    handoff = {
        'sprint': H.SPRINT, 'workspace_version': H.WORKSPACE_VERSION, 'generated_from': {'runtime_model': rm['extracted_from'], 'forensic_record': 'artifacts/production-full-authority-forensics/'},
        'tabs': [{'tab': t, 'nav_label': lab, 'nav_route': route, 'parents': [s['surface_id'] for s in S if s['workspace_tab'] == t and s['surface_level'] == 'PARENT']} for (t, (_, lab, route)) in zip(H.TABS, H.NAV)],
        'surface_count': totals,
        'canonical_authorities': [f for f in authorities if f['file'].startswith('AUTHORITIES/') or f['file'].startswith('REFERENCE/') or f['file'].startswith('ICONS/')],
        'screen_lineage': {'directives': H.DIRECTIVES, 'conflicts_with_priority': H.CONFLICTS, 'superseded_excluded': [{'item': x, 'status': y, 'superseded_by': z} for x, y, z in H.SUPERSEDED], 'not_canonical': H.NOT_CANONICAL},
        'environment_groups': [{k: e[k] for k in ('environment_group_id', 'name', 'region', 'new_plate_required', 'member_count')} | {'new_plates': [p['plate_id'] for p in e['new_plates']]} for e in envs],
        'asset_actions': {'classes': H.ASSET_ACTIONS, 'isolated_assets': H.ISOLATED_ASSETS,
                          'execution_order': ['P0 · PLATE-ATRIUM-MASTER + OBJ-NDX-CORE + OBJ-DESIGN-CORE + OBJ-PIPELINE-STAGES + nav.hub restore + host icons', 'P0/P1 · PLATE-PRODUCTION-FLOOR', 'P1 · PLATE-VIEWPORT-CORRIDOR', 'P1 · 5 × PLATE-WORLD-* (project-keyed)', 'P1 · IA line icons + HUB component icons (SVG)', 'P2 · MAT-SWATCH-SET + OBJ-DEVICE-FRAMES + OBJ-PORTAL-GATE + design pack icons + CF line icons', 'P3 · OBJ-INTERACTION-OBJECT-SET, CF residual slots, STATES time-of-day grades, mode-board re-light']},
        'icon_actions': [{'icon_id': i['icon_id'], 'grok_action': i['grok_action'], 'priority': i['priority']} for i in icons],
        'responsive_authorities': {'presets': H.PRESETS, 'runtime_design_viewport_presets': rm['viewport']['presets'], 'count': len(responsive), 'file': 'MANIFEST/PRODUCTION_WORKSPACE_RESPONSIVE_MAP.json'},
        'runtime_routes': {'count': len(routes), 'file': 'MANIFEST/PRODUCTION_WORKSPACE_RUNTIME_ROUTES.json', 'dev_base': 'npm run dev → http://localhost:5174 (VITE); QA presets 393×852 / 834×1194 / 1440×900'},
        'firewall': {'regions': H.REGIONS, 'findings': H.FIREWALL_FINDINGS},
        'implementation_constraints': [
            'Keep every route, query state and tab working (RUNTIME_ROUTES must_remain_functional).',
            'No route, tab, IA, project-context or viewport rewrite. No copy rewrite.',
            'Never use a full-screen PNG / screenshot as UI. Panels, rails, chips, inspectors, nav and host chrome stay live React/CSS/SVG.',
            'Plates are clean: no baked text, UI, pins, labels, people in focal areas, or project media.',
            'Mount through the existing resolvers: src/site00/productionAssets/productionAssetRegistry.ts (+ routeAssetManifests.ts) for workspace plates; project-keyed slots for PROJECT_BODY art; shared/site00-character-fabrication/assets.ts for CF slots.',
            'Keep 0 px page scroll on every parent at 393×852 / 834×1194 / 1440×900 (D-PARENT-NOSCROLL).',
            'Pack images are REFERENCE ONLY — never ship them as runtime assets.',
        ],
        'surfaces': [{
            'surface_id': s['surface_id'], 'tab': s['workspace_tab'], 'route': s['route'], 'level': s['surface_level'], 'parent': s['parent_id'],
            'authority_file': s['pack_files'] or ([f"inherits {s['inherits_visual_from']}"] if s['inherits_visual_from'] else ['RUNTIME / manifest only']),
            'runtime_component': s['runtime_component'], 'environment_group': s['environment_group'], 'asset_action': s['asset_actions'], 'icon_pack': s['icon_authority'],
            'responsive_note': next((r['environment_crop_rule'] for r in responsive if r['surface_id'] == s['surface_id']), f"inherits {s['inherits_visual_from'] or s['parent_id']}"),
            'interaction_note': s['interaction_authority'], 'grok_priority': s['grok_priority'],
            'functional_runtime_canonical': s['functional_runtime_canonical'], 'visual_runtime_canonical': s['visual_runtime_canonical'], 'visual_class': s['visual_class'],
        } for s in S],
    }
    M = 'MANIFEST'
    write_json(pack, f'{M}/PRODUCTION_WORKSPACE_GROK_HANDOFF.json', handoff)
    write_json(pack, f'{M}/PRODUCTION_WORKSPACE_SCREEN_TREE.json', tree)
    write_json(pack, f'{M}/PRODUCTION_WORKSPACE_ENVIRONMENT_GROUPS.json', {'sprint': H.SPRINT, 'rule': 'GROK MUST NOT GENERATE ONE PLATE PER PAGE IF MULTIPLE PAGES SHARE THE SAME WORLD.', 'environment_groups': envs, 'isolated_assets': H.ISOLATED_ASSETS})
    write_json(pack, f'{M}/PRODUCTION_WORKSPACE_ICON_INVENTORY.json', {'sprint': H.SPRINT, 'priority_rule': 'P0 bottom nav / tab / core mode · P1 status, event, inspection, review · P2 low-frequency detail · P3 unused / legacy', 'canonical_icon_packs': [f for f in pack.files if f.startswith('ICONS/')], 'icons': icons})
    write_json(pack, f'{M}/PRODUCTION_WORKSPACE_RUNTIME_ROUTES.json', {'sprint': H.SPRINT, 'note': 'Production workspace surfaces are not mounted inside DESIGN · VIEWPORT (it previews the CLIENT APP at /app/projects/:slug); design_workspace_route is set for Design surfaces only.', 'presets': H.PRESETS, 'routes': routes})
    write_json(pack, f'{M}/PRODUCTION_WORKSPACE_RESPONSIVE_MAP.json', {'sprint': H.SPRINT, 'presets': H.PRESETS, 'runtime_design_viewport_presets': rm['viewport']['presets'],
                                                                      'rule': 'One authority + crop rule per distinct surface; inheriting surfaces follow their parent. Tablet authorities from T12 are 4:3 LANDSCAPE; portrait 834×1194 follows the runtime board.', 'surfaces': responsive})
    import notes as N  # noqa: E402
    pack.text('README_FIRST.txt', N.readme(totals, envs))
    pack.text('NOTES/GROK_EXECUTION_RULES.txt', N.execution_rules())
    pack.text('NOTES/SUPERSESSION_NOTES.txt', N.supersession())
    pack.text('NOTES/ASSET_PASS_SCOPE.txt', N.asset_scope(envs, totals))

    # zip
    if os.path.exists(a.zip):
        os.remove(a.zip)
    os.makedirs(os.path.dirname(os.path.abspath(a.zip)), exist_ok=True)
    with zipfile.ZipFile(a.zip, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for root, _, files in os.walk(a.stage):
            for f in sorted(files):
                p = os.path.join(root, f)
                rel = os.path.relpath(p, a.stage)
                z.write(p, rel, compress_type=zipfile.ZIP_STORED if rel.endswith(('.jpg', '.png')) else zipfile.ZIP_DEFLATED)
    stats = validate(a.zip, S, envs, icons)
    totals['zip_files'] = stats['files']
    totals['zip_mb'] = stats['mb']
    # mirror text manifests into docs
    os.makedirs(a.docs, exist_ok=True)
    for rel in ['README_FIRST.txt', 'NOTES/GROK_EXECUTION_RULES.txt', 'NOTES/SUPERSESSION_NOTES.txt', 'NOTES/ASSET_PASS_SCOPE.txt'] + [f'{M}/{f}' for f in sorted(os.listdir(os.path.join(a.stage, M)))]:
        dst = os.path.join(a.docs, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(os.path.join(a.stage, rel), dst)
    json.dump({'totals': totals, 'zip': stats, 'pack_files': authorities}, open(os.path.join(a.docs, 'PACK_INDEX.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps(totals, indent=1))
    print(json.dumps({k: v for k, v in stats.items() if k != 'listing'}, indent=1))


def validate(zpath, S, envs, icons):
    with zipfile.ZipFile(zpath) as z:
        bad = z.testzip()
        if bad:
            raise SystemExit(f'corrupt zip member {bad}')
        names = z.namelist()
        info = {i.filename: i.file_size for i in z.infolist()}
        for n in names:
            if n.endswith(('.jpg', '.png')):
                Image.open(io.BytesIO(z.read(n))).verify()
        man = json.loads(z.read('MANIFEST/PRODUCTION_WORKSPACE_GROK_HANDOFF.json'))
        tree = json.loads(z.read('MANIFEST/PRODUCTION_WORKSPACE_SCREEN_TREE.json'))
    need = ['README_FIRST.txt', 'NOTES/GROK_EXECUTION_RULES.txt', 'NOTES/SUPERSESSION_NOTES.txt', 'NOTES/ASSET_PASS_SCOPE.txt'] + [f'MANIFEST/{x}' for x in ('PRODUCTION_WORKSPACE_GROK_HANDOFF.json', 'PRODUCTION_WORKSPACE_SCREEN_TREE.json', 'PRODUCTION_WORKSPACE_ENVIRONMENT_GROUPS.json', 'PRODUCTION_WORKSPACE_ICON_INVENTORY.json', 'PRODUCTION_WORKSPACE_RUNTIME_ROUTES.json', 'PRODUCTION_WORKSPACE_RESPONSIVE_MAP.json')]
    missing = [n for n in need if n not in names]
    if missing:
        raise SystemExit(f'missing required files: {missing}')
    referenced = set()
    for s in tree['surfaces']:
        referenced.update(s['pack_files'])
    dangling = sorted(f for f in referenced if f not in names)
    if dangling:
        raise SystemExit(f'manifest paths not in zip: {dangling}')
    tabs = {s['workspace_tab'] for s in tree['surfaces']}
    if not set(H.TABS) <= tabs:
        raise SystemExit(f'tabs missing: {set(H.TABS) - tabs}')
    p01 = [s['surface_id'] for s in tree['surfaces'] if s['grok_priority'] in ('P0', 'P1') and s['distinct_visual_authority'] and not s['pack_files']]
    if p01:
        raise SystemExit(f'P0/P1 distinct surfaces without a pack authority: {p01}')
    images = [n for n in names if n.endswith(('.jpg', '.png'))]
    big = [n for n in images if info[n] > 600_000]
    if big:
        raise SystemExit(f'oversized image(s): {big}')
    digests = {}
    with zipfile.ZipFile(zpath) as z:
        for n in images:
            digests.setdefault(hashlib.sha1(z.read(n)).hexdigest(), []).append(n)
    dups = [v for v in digests.values() if len(v) > 1]
    if dups:
        raise SystemExit(f'duplicate images: {dups}')
    if not any(n.startswith('ICONS/') for n in names):
        raise SystemExit('no icon authorities')
    mb = os.path.getsize(zpath) / 1_000_000
    return {'files': len(names), 'images': len(images), 'mb': round(mb, 2), 'mib': round(os.path.getsize(zpath) / 1048576, 2), 'tabs': sorted(tabs), 'checks': ['opens (testzip ok)', 'all images decode', 'required files present', 'manifest pack paths resolve', 'all 7 tabs', 'every P0/P1 distinct surface has a pack authority', 'no image > 600 KB', 'no duplicate images', 'icon authorities present'],
            'listing': sorted(names)}


if __name__ == '__main__':
    main()
