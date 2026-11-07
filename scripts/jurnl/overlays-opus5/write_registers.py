#!/usr/bin/env python3
"""OPUS5 deliverables 01 (mounted asset registry) and 07 (source image hashes), from the handoff manifest, the runtime
registry report and the per-master decision table below. Usage: python3 -I write_registers.py <repo root> <out dir>"""
import csv, hashlib, json, os, sys

repo, out = sys.argv[1:3]
PKG = os.path.join(repo, 'JURNL/GLOBAL_EIGHT_OVERLAYS/MICRO_ASSETS_GROK2')
H = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()

# stem -> (status, fidelity, screen, mount location / reason)
D = {
    # ── mounted by OPUS5 ──
    'B01-GEAR-REMEMBER-SETUP': ('MOUNTED', 'EXACT_MATCH', 'CH02', 'REMEMBER SETUP row icon (settings-consent-remember-icon)'),
    'B01-BANK-LINKED-ACCOUNTS': ('MOUNTED', 'EXACT_MATCH', 'CH02 · OV08', 'LINKED ACCOUNTS OPTIONAL statement icon; CONNECTED ACCOUNTS & SYNC menu icon'),
    'B01-SHIELD-NOTHING-SOLD': ('MOUNTED', 'EXACT_MATCH', 'CH02', 'NOTHING SOLD statement emblem (no switch: a policy statement)'),
    'B01-SPARKLE-ASK-CONTEXT': ('MOUNTED', 'EXACT_MATCH', 'CH02 · OV08', 'ASK JURNL CONTEXT row icon; ASK JURNL menu icon'),
    'B01-AI-STAR': ('MOUNTED', 'EXACT_MATCH', 'CH02', 'AI ACCESS row icon (was the sparkle glyph)'),
    'B01-DATABASE-YOUR-DATA': ('MOUNTED', 'EXACT_MATCH', 'CH02', 'YOUR DATA row icon'),
    'B01-EXPORT-DOWN': ('MOUNTED', 'EXACT_MATCH', 'CH02', 'DATA EXPORT row icon'),
    'B01-TRASH-REMOVE': ('MOUNTED', 'EXACT_MATCH', 'CH02', 'REMOVE ACCESS icon on its oxblood paper'),
    'B01-CHEVRON': ('MOUNTED', 'MATCH_WITH_GAPS', 'CH02 · OV08', 'cream chevron on the CH02 tool rows, REMOVE ACCESS and the 12 menu rows (reconstructed cream ink)'),
    'B01-TOGGLE-TRACK-OLIVE': ('MOUNTED', 'MATCH_WITH_GAPS', 'CH02', 'consent switch track when ON (flat reconstruction; resampled to 280 px)'),
    'B01-TOGGLE-TRACK-CHARCOAL': ('MOUNTED', 'MATCH_WITH_GAPS', 'CH02', 'consent switch track when OFF (flat reconstruction; resampled to 280 px)'),
    'B01-TOGGLE-THUMB': ('MOUNTED', 'MATCH_WITH_GAPS', 'CH02', 'consent switch thumb, right when ON, left when OFF (soft edge; resampled to 120 px)'),
    'B02-COINS-CREAM': ('MOUNTED', 'MATCH_WITH_GAPS', 'OV08', 'CURRENCY & EXCHANGE menu icon (reconstructed cream ink of the coin stack)'),
    'B02-TAG-CREAM': ('MOUNTED', 'MATCH_WITH_GAPS', 'OV08', 'CLASSIFICATION & LEARNING RULES menu icon (reconstructed cream ink)'),
    'B02-PROFILE': ('MOUNTED', 'EXACT_MATCH', 'OV08', 'ACCOUNT & PROFILE menu icon'),
    'B02-GEAR-PREFERENCES': ('MOUNTED', 'EXACT_MATCH', 'OV08', 'PREFERENCES menu icon'),
    'B02-SHIELD-PRIVACY': ('MOUNTED', 'EXACT_MATCH', 'OV08', 'PRIVACY & CONSENTS menu icon'),
    'B02-CROWN-MEMBERSHIP': ('MOUNTED', 'EXACT_MATCH', 'OV08', 'MY MEMBERSHIP menu icon (gold, not recoloured)'),
    'B02-FOUR-SQUARE': ('MOUNTED', 'EXACT_MATCH', 'OV08', 'EXPLORE ADD-ONS menu icon'),
    'B02-LIFEBUOY': ('MOUNTED', 'EXACT_MATCH', 'OV08', 'HELP & SUPPORT menu icon'),
    'B02-SIGN-OUT': ('MOUNTED', 'EXACT_MATCH', 'OV08', 'SIGN OUT menu icon'),
    'B03-BANK-SOURCE': ('MOUNTED', 'EXACT_MATCH', 'OV02 · OV03 · OV05', 'BANK ACCOUNT type (unselected); MOVE MONEY source mark; SEARCH POCKETS filter and pocket results'),
    'B03-BANK-SELECTED': ('MOUNTED', 'EXACT_MATCH', 'OV02', 'BANK ACCOUNT type when selected (the authority light bank)'),
    'B03-COIN-STACK': ('MOUNTED', 'MATCH_WITH_GAPS', 'OV02', 'SAVINGS type (no light cut: shown light on the olive selected chip by CSS filter)'),
    'B03-CARD-DEBIT': ('MOUNTED', 'MATCH_WITH_GAPS', 'OV02', 'DEBIT / PAYOUT CARD type (same selected-state gap)'),
    'B03-CARD-CREDIT': ('MOUNTED', 'MATCH_WITH_GAPS', 'OV02', 'CREDIT CARD type (same selected-state gap)'),
    'B03-CASH': ('MOUNTED', 'MATCH_WITH_GAPS', 'OV02', 'CASH type (same selected-state gap)'),
    'B03-CHECK-SELECTED': ('MOUNTED', 'EXACT_MATCH', 'OV02', 'the check disc on the selected type (and the RIDESHARE PAY choice)'),
    'B03-POCKET-MARK': ('MOUNTED', 'EXACT_MATCH', 'OV03', 'MOVE MONEY destination mark'),
    'B03-PENCIL': ('MOUNTED', 'EXACT_MATCH', 'OV04', 'RENAME POCKET icon'),
    'B03-TRASH': ('MOUNTED', 'EXACT_MATCH', 'OV04', 'DELETE POCKET icon'),
    'B03-CHEVRON': ('MOUNTED', 'EXACT_MATCH', 'OV04 · OV01', 'dark chevron on RENAME / DELETE and on the two MONEY ACTION choices (reuse on OV01)'),
    'B04-SEARCH': ('MOUNTED', 'EXACT_MATCH', 'OV05', 'magnifier inside the live field; activity results'),
    'B05-ADD-CANCEL': ('MOUNTED', 'EXACT_MATCH', 'OV02', 'CANCEL paper (replaces the generic panel backing)'),
    'B05-CREATE-POCKET': ('MOUNTED', 'EXACT_MATCH', 'OV02', 'SAVE POCKET paper (replaces the generic strip backing)'),
    'B05-MOVE-CANCEL': ('MOUNTED', 'EXACT_MATCH', 'OV03', 'CANCEL paper'),
    'B05-RECORD-TRANSFER': ('MOUNTED', 'EXACT_MATCH', 'OV03', 'RECORD TRANSFER / RECORD CARD PAYMENT paper'),
    'B06-INFO': ('MOUNTED', 'EXACT_MATCH', 'CH01', 'the (i) on the EFFECT ON SAFE TO SPEND paper (buffer-effect-info)'),
    # ── already mounted before OPUS5 (byte-identical source) ──
    'B05-BUFFER-AMOUNT': ('MOUNTED_PRE_EXISTING', 'EXACT_MATCH', 'CH01', 'already mounted as CH01_AMOUNT_PAPER (same bytes as CH01-AMOUNT-PAPER-TEXTFREE.png): not mounted twice'),
    'B05-BUFFER-EFFECT': ('MOUNTED_PRE_EXISTING', 'EXACT_MATCH', 'CH01', 'already mounted as CH01_EFFECT_PAPER (same bytes): not mounted twice'),
    'B05-PRIVACY-BACK': ('MOUNTED_PRE_EXISTING', 'EXACT_MATCH', 'CH02', 'already mounted as CH02_BACK_PAPER (same bytes): not mounted twice'),
    'B05-REMOVE-ACCESS': ('MOUNTED_PRE_EXISTING', 'EXACT_MATCH', 'CH02', 'already mounted as CH02_REMOVE_ACCESS_PAPER (same bytes): not mounted twice'),
    # ── not mounted ──
    'B05-BUFFER-BACK': ('NOT_MOUNTED_ROLE_FILLED', 'MATCH_WITH_GAPS', 'CH01', 'BACK already wears CH01_BACK_PAPER (an earlier founder-handoff cut); a second BACK paper would duplicate the role'),
    'B05-RENAME-CREAM': ('NOT_MOUNTED_ROLE_FILLED', 'MATCH_WITH_GAPS', 'OV04', 'RENAME already wears OV04_RENAME_PAPER; mounting both would duplicate the paper'),
    'B05-DELETE-BLUSH': ('NOT_MOUNTED_ROLE_FILLED', 'MATCH_WITH_GAPS', 'OV04', 'DELETE already wears OV04_DELETE_PAPER; mounting both would duplicate the paper'),
    'B05-SAVE-BUFFER': ('NOT_MOUNTED_UNFIT', 'UNFIT', 'CH01', 'a flat two-colour reconstruction with a visible inner seam; not the textured authority capsule. SAVE BUFFER stays the live V3 olive control'),
    'B05-SEARCH-FIELD': ('NOT_MOUNTED_GEOMETRY', 'MATCH_WITH_GAPS', 'OV05', '4.25:1 paper behind a ~5.6:1 live input: it would stretch or leave the field uncovered (GROK2 QA: "sits high")'),
    'B04-TAG': ('NOT_MOUNTED_UNFIT', 'UNFIT', 'OV05', 'carries a 364 px stray fragment of the neighbouring chip at x 110-123; ACTIVITY keeps its line tag until a clean cut is approved'),
    'B03-CALENDAR': ('NOT_MOUNTED_NO_CLEAN_SLOT', 'MATCH_WITH_GAPS', 'OV03', 'the live DATE field is a half-width floating-label input; a mark inside it clipped the date (2026-11-); OV05 has no date filter'),
    'B06-CLOSE-DISC': ('SUPERSEDED', 'EXACT_MATCH', 'OV08', 'superseded by the founder CLOSE (F05.UTILITY.CLOSE.GOLD, OPUS1); never mounted'),
    'B05-RESOLVE': ('BLOCKED_ARTWORK', 'NO_SOURCE', 'OV07', 'cut from the OV07 caution shell, which bakes its RESOLVE / CLOSE pills and blocker strips; no clean OV07 environment exists, and the runtime ARCHIVE BLOCKED is the DOT 01 V9 sheet'),
    'B05-ARCHIVE-CLOSE': ('BLOCKED_ARTWORK', 'NO_SOURCE', 'OV07', 'as B05-RESOLVE'),
    'B04-COINS-BALANCE': ('BLOCKED_ARTWORK', 'UNFIT', 'OV07', 'oxblood ink for the caution shell parchment strips; the runtime blockers sit on the oxblood DOT 01 panel (it would vanish)'),
    'B04-CLOCK': ('BLOCKED_ARTWORK', 'UNFIT', 'OV07', 'as B04-COINS-BALANCE'),
    'B03-CHEVRON-ROW': ('COMPARISON_EXTRACT', 'NOT_REQUIRED', '—', 'comparison extract (GROK2 mount map: do not mount)'),
    'B04-BANK-FILTER': ('COMPARISON_EXTRACT', 'NOT_REQUIRED', '—', 'comparison extract; the account bank is B03-BANK-SOURCE'),
    'B04-CALENDAR': ('COMPARISON_EXTRACT', 'NOT_REQUIRED', '—', 'comparison extract'),
    'B04-CHEVRON': ('COMPARISON_EXTRACT', 'NOT_REQUIRED', '—', 'comparison extract'),
    'B04-SEARCH-RESULT': ('COMPARISON_EXTRACT', 'NOT_REQUIRED', '—', 'comparison extract; results use B04-SEARCH'),
}
CAND = {
    'MANAGE_POCKET_CLEAN_BASE_NOTE_CANDIDATE': ('GATED_CANDIDATE', 'UNAPPROVED', 'OV04', 'founder review only; the mounted note is the regenerated OV04_MANAGE_NOTE (no baked actions)'),
    'SEARCH_CLEAN_OPEN_FOLIO_CANDIDATE': ('GATED_CANDIDATE', 'UNAPPROVED', 'OV05', 'founder review only; a blank page, not the authority scene (bust, arch, ledgers)'),
    'MENU_BUFFER_PLAIN_SHIELD_NO_CHECK_CANDIDATE': ('GATED_CANDIDATE', 'UNAPPROVED', 'OV08', 'founder review only; the SAFE TO SPEND BUFFER row stays HELD on its glyph'),
}
reg = {r['stem']: r for r in json.load(open(os.path.join(repo, 'JURNL/MANIFEST/GLOBAL_OVERLAYS_MICRO_ASSETS_OPUS5/derive_report.json')))['mounted']}
manifest = list(csv.DictReader(open(os.path.join(PKG, '05_AUDIT_AND_MANIFEST/CONVERGED_FILE_MANIFEST.csv'))))
os.makedirs(out, exist_ok=True)
rows = []
for m in manifest:
    f = m['file']; stem = os.path.splitext(os.path.basename(f))[0]; top = f.split('/')[0]
    if top == '01_INSTALLABLE_SOURCE_MASTERS':
        st, fid, scr, loc = D[stem]
    elif top == '02_FOUNDER_REVIEW_CANDIDATES':
        st, fid, scr, loc = CAND[stem]
    elif top == '03_FOUNDER_UTILITY_BUTTONS':
        kind = stem.split('_')[0]
        st, fid, scr, loc = ('MOUNTED_OPUS1', 'EXACT_MATCH', 'F05 PARENT · OVERLAYS', f'pixel-equivalent to the OPUS1 master of {kind} (alpha identical, RGB within 1/255; SEARCH byte-identical); mounted as F05.UTILITY.{kind}.GOLD')
    else:
        st, fid, scr, loc = ('CONDITIONAL_REFERENCE', 'NOT_A_CLEAN_SIDEKICK', stem.split('-')[0], 'already in the repo (CLEAN_ARTWORK_OPUS3); OV08 environment mounted since OPUS2, the others not mounted')
    r = reg.get(stem)
    rows.append(dict(asset_id=f'GROK2.{stem}' if top == '01_INSTALLABLE_SOURCE_MASTERS' else stem, source_file=f, source_sha256=m['sha256'], source_px=f"{m['width']}x{m['height']}", screen=scr, status=st, fidelity=fid,
                     mount_location_or_reason=loc, runtime_file=f"src/projects/jurnl/runtime/global/overlayArt/{r['runtime_file']}" if r else '', runtime_px='x'.join(map(str, r['runtime_px'])) if r else '', runtime_sha256=r['runtime_sha256'] if r else '', founder_approval='PENDING'))
keys = list(rows[0].keys())
with open(os.path.join(out, '01_MOUNTED_ASSET_REGISTRY.csv'), 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=keys); w.writeheader(); w.writerows(rows)
handoff = sys.argv[3]  # the verified handoff extract (for the utility files and the references, which are not re-installed)
REPO_EQUIV = {
    '03_FOUNDER_UTILITY_BUTTONS/CLOSE_vintage_parchment_close_button.png': 'JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS/01_F05_UTILITY_CLOSE_GOLD.png (pixel-equivalent: alpha identical, RGB within 1/255)',
    '03_FOUNDER_UTILITY_BUTTONS/MENU_vintage_parchment_menu_button.png': 'JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS/02_F05_UTILITY_MENU_GOLD.png (pixel-equivalent: alpha identical, RGB within 1/255)',
    '03_FOUNDER_UTILITY_BUTTONS/SEARCH_vintage_gold_search_button.png': 'JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS/03_F05_UTILITY_SEARCH_GOLD.png (byte-identical)',
    '03_FOUNDER_UTILITY_BUTTONS/ADD_vintage_parchment_plus_button.png': 'JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS/04_F05_UTILITY_ADD_GOLD.png (pixel-equivalent: alpha identical, RGB within 1/255)',
}
with open(os.path.join(out, '07_SOURCE_IMAGE_HASHES.csv'), 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['source_file', 'manifest_sha256', 'verified_sha256', 'match', 'bytes', 'px', 'mode', 'alpha_min', 'alpha_max', 'transparent_fraction', 'in_repo_as'])
    for m in manifest:
        f = m['file']
        p = os.path.join(PKG, f) if os.path.exists(os.path.join(PKG, f)) else os.path.join(handoff, f)
        h = H(p)
        where = f'JURNL/GLOBAL_EIGHT_OVERLAYS/MICRO_ASSETS_GROK2/{f}' if os.path.exists(os.path.join(PKG, f)) else REPO_EQUIV.get(f, f"JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3/... (byte-identical, installed in OPUS3)")
        w.writerow([f, m['sha256'], h, 'YES' if h == m['sha256'] else 'NO', os.path.getsize(p), f"{m['width']}x{m['height']}", m['mode'], m['alpha_min'], m['alpha_max'], m['fully_transparent_fraction'], where])
from collections import Counter
print(Counter(r['status'] for r in rows))
